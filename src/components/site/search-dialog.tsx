"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, CornerDownLeftIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/env";
import { cn } from "@/lib/utils";

type Results = {
  departments: { slug: string; name: string; tagline: string; icon: string }[];
  technologies: { slug: string; name: string; short_description: string; icon: string }[];
  roadmaps: { slug: string; title: string; summary: string; icon: string }[];
};
type Item = { href: string; title: string; subtitle: string; icon: string; group: string };

const EMPTY: Results = { departments: [], technologies: [], roadmaps: [] };

function flatten(r: Results): Item[] {
  return [
    ...r.technologies.map((t) => ({ href: `/technologies/${t.slug}`, title: t.name, subtitle: t.short_description, icon: t.icon, group: "Technologies" })),
    ...r.roadmaps.map((t) => ({ href: `/roadmaps/${t.slug}`, title: t.title, subtitle: t.summary, icon: t.icon, group: "Roadmaps" })),
    ...r.departments.map((t) => ({ href: `/departments/${t.slug}`, title: t.name, subtitle: t.tagline, icon: t.icon, group: "Departments" })),
  ];
}

/**
 * Global quick search (⌘K / Ctrl+K or "/"). Live results for technologies,
 * roadmaps and departments; Enter on the input opens the full resource search.
 */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const requestId = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || !getSupabaseConfig()) return;
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error: rpcError } = await createClient().rpc("search_catalog", { q: term, per_group: 5 });
      if (id !== requestId.current) return;
      setLoading(false);
      setError(Boolean(rpcError));
      setResults(((data as unknown as Results) ?? EMPTY) || EMPTY);
      setActive(-1);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const tooShort = query.trim().length < 2;
  const items = tooShort ? [] : flatten(results);
  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );
  const searchAll = () => go(`/search?q=${encodeURIComponent(query.trim())}`);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) go(items[active].href);
      else if (query.trim()) searchAll();
    }
  };

  let lastGroup = "";
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden w-56 justify-start gap-2 text-muted-foreground lg:inline-flex xl:w-64"
        aria-label="Search the catalog"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <SearchIcon />
        <span className="min-w-0 flex-1 truncate text-left font-normal">Search the catalog…</span>
        <kbd className="shrink-0 rounded border bg-muted px-1.5 font-mono text-[0.65rem]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="lg:hidden" aria-label="Search the catalog">
        <SearchIcon className="size-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
          <DialogTitle className="sr-only">Search the catalog</DialogTitle>
          <DialogDescription className="sr-only">Type to search technologies, roadmaps and departments. Press Enter to search all resources.</DialogDescription>
          <div className="flex items-center gap-3 border-b px-4">
            {loading && !tooShort ? <Loader2Icon className="size-4 animate-spin text-muted-foreground" /> : <SearchIcon className="size-4 text-muted-foreground" />}
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search Python, Kubernetes, Azure, RAG…"
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              role="combobox"
              aria-expanded={items.length > 0}
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              type="search"
              enterKeyHint="search"
            />
          </div>
          <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2" id={listId} role="listbox" aria-label="Search results">
            {query.trim().length < 2 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Type at least two characters. Press <kbd className="rounded border px-1 font-mono text-xs">Enter</kbd> to search every resource.</p>
            ) : error ? (
              <p className="px-3 py-6 text-center text-sm text-destructive">Search is unavailable right now. Try again in a moment.</p>
            ) : !loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No technologies or roadmaps match “{query.trim()}”.</p>
            ) : (
              items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <div key={item.href}>
                    {header && <p className="eyebrow px-3 pb-1 pt-3">{header}</p>}
                    <Link
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={active === i}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.href);
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5", active === i && "bg-muted")}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-card">
                        <CatalogIcon name={item.icon} className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
                      </span>
                      {active === i && <CornerDownLeftIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                    </Link>
                  </div>
                );
              })
            )}
          </div>
          {query.trim().length >= 2 && (
            <button type="button" onClick={searchAll} className="flex w-full items-center justify-between border-t px-5 py-3 text-left text-sm hover:bg-muted focus-visible:bg-muted">
              <span>
                Search all resources for <strong className="font-semibold">“{query.trim()}”</strong>
              </span>
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
