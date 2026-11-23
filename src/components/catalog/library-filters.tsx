"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { activeFilterCount, filtersToQuery } from "@/lib/catalog/filters";
import { LEVELS, PRICING, RESOURCE_TYPES, SORTS } from "@/lib/catalog/labels";
import type { SearchFilters } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type Options = {
  departments: { slug: string; name: string }[];
  technologies: { slug: string; name: string; department: string | null }[];
};

function useFilterNavigation(filters: SearchFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const apply = (overrides: Partial<SearchFilters>) => {
    startTransition(() => router.replace(`${pathname}${filtersToQuery(filters, { page: 1, ...overrides })}`, { scroll: false }));
  };
  return { apply, pending };
}

function toggle<T>(list: T[] | undefined, value: T) {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return [...set];
}

export function LibrarySearchBar({ filters, options }: { filters: SearchFilters; options: Options }) {
  const { apply, pending } = useFilterNavigation(filters);
  const [value, setValue] = useState(filters.q ?? "");
  // Follow external URL changes (back button, "Clear search") without
  // clobbering what the user is typing.
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    if ((value.trim() || undefined) !== filters.q) setValue(filters.q ?? "");
  }
  useEffect(() => {
    if ((value.trim() || undefined) === filters.q) return;
    const t = setTimeout(() => apply({ q: value.trim() || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <form
        role="search"
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: value.trim() || undefined });
        }}
      >
        <label htmlFor="library-q" className="sr-only">Search resources</label>
        {pending ? (
          <Loader2Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        )}
        <input
          id="library-q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search titles, publishers and descriptions"
          className="h-11 w-full rounded-lg border bg-card pl-10 pr-3 text-[0.95rem] outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
        />
      </form>
      <div className="flex gap-2">
        <label htmlFor="library-sort" className="sr-only">Sort by</label>
        <select
          id="library-sort"
          value={filters.sort ?? "relevance"}
          onChange={(e) => apply({ sort: e.target.value as SearchFilters["sort"] })}
          className="h-11 flex-1 rounded-lg border bg-card px-3 text-sm sm:flex-none"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <MobileFiltersTrigger filters={filters} options={options} />
      </div>
    </div>
  );
}

/** Mobile and tablet: filters live in a bottom sheet. */
function MobileFiltersTrigger({ filters, options }: { filters: SearchFilters; options: Options }) {
  const count = activeFilterCount(filters);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-11 lg:hidden" aria-label={`Filters${count ? ` (${count} active)` : ""}`}>
          <SlidersHorizontalIcon /> Filters
          {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] text-primary-foreground">{count}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Filter resources</SheetTitle>
          <SheetDescription>Results update as you choose.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <FilterPanel filters={filters} options={options} />
        </div>
        <SheetFooter className="border-t" />
      </SheetContent>
    </Sheet>
  );
}

export function LibraryFilterSidebar({ filters, options }: { filters: SearchFilters; options: Options }) {
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <FilterPanel filters={filters} options={options} />
    </aside>
  );
}

function FilterPanel({ filters, options }: { filters: SearchFilters; options: Options }) {
  const { apply, pending } = useFilterNavigation(filters);
  const count = activeFilterCount(filters);
  const technologies = filters.department ? options.technologies.filter((t) => t.department === filters.department) : options.technologies;

  return (
    <div className={cn("space-y-7 transition-opacity", pending && "opacity-60")}>
      {count > 0 && (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => apply({ department: undefined, technology: undefined, levels: [], types: [], pricing: [] })}>
          <XIcon /> Clear {count} filter{count === 1 ? "" : "s"}
        </Button>
      )}

      <FilterGroup title="Department">
        <select
          aria-label="Department"
          value={filters.department ?? ""}
          onChange={(e) => apply({ department: e.target.value || undefined, technology: undefined })}
          className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All departments</option>
          {options.departments.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title="Technology">
        <select
          aria-label="Technology"
          value={filters.technology ?? ""}
          onChange={(e) => apply({ technology: e.target.value || undefined })}
          className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All technologies</option>
          {technologies.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title="Difficulty">
        {LEVELS.map((l) => (
          <CheckRow key={l.value} label={l.label} checked={filters.levels?.includes(l.value) ?? false} onChange={() => apply({ levels: toggle(filters.levels, l.value) })} />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICING.map((p) => (
          <CheckRow key={p.value} label={p.label} hint={p.hint} checked={filters.pricing?.includes(p.value) ?? false} onChange={() => apply({ pricing: toggle(filters.pricing, p.value) })} />
        ))}
      </FilterGroup>

      <FilterGroup title="Resource type">
        {RESOURCE_TYPES.map((t) => (
          <CheckRow key={t.value} label={t.label} checked={filters.types?.includes(t.value) ?? false} onChange={() => apply({ types: toggle(filters.types, t.value) })} />
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="eyebrow mb-3">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function CheckRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-muted" title={hint}>
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 rounded border-input accent-[var(--primary)]" />
      {label}
    </label>
  );
}
