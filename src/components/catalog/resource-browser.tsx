"use client";

import { useMemo, useState } from "react";
import { FilterXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "./resource-card";
import { EmptyState } from "./states";
import { LEVELS, PRICING, RESOURCE_TYPES, type Level, type Pricing, type ResourceType } from "@/lib/catalog/labels";
import type { ResourceCardData } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type LevelFilter = Level | "all";

/**
 * In-page filtering for a known set of resources (a department or a
 * technology). The data is prerendered with the page; filters run instantly
 * in the browser and are fully keyboard accessible.
 */
export function ResourceBrowser({ resources, groupByLevel = false, label = "Resources" }: { resources: ResourceCardData[]; groupByLevel?: boolean; label?: string }) {
  const [level, setLevel] = useState<LevelFilter>("all");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [pricing, setPricing] = useState<Pricing | "all">("all");

  const counts = useMemo(() => {
    const byLevel: Record<string, number> = { all: resources.length };
    for (const r of resources) byLevel[r.level] = (byLevel[r.level] ?? 0) + 1;
    return byLevel;
  }, [resources]);
  const availableTypes = useMemo(() => RESOURCE_TYPES.filter((t) => resources.some((r) => r.type === t.value)), [resources]);
  const availablePricing = useMemo(() => PRICING.filter((p) => resources.some((r) => r.pricing === p.value)), [resources]);

  const filtered = resources.filter(
    (r) => (level === "all" || r.level === level) && (type === "all" || r.type === type) && (pricing === "all" || r.pricing === pricing),
  );
  const active = level !== "all" || type !== "all" || pricing !== "all";
  const clear = () => {
    setLevel("all");
    setType("all");
    setPricing("all");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="radiogroup" aria-label="Difficulty" className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1 no-scrollbar">
          {([{ value: "all", label: "All levels" }, ...LEVELS] as { value: LevelFilter; label: string }[]).map((l) => (
            <button
              key={l.value}
              type="button"
              role="radio"
              aria-checked={level === l.value}
              onClick={() => setLevel(l.value)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                level === l.value && "bg-primary text-primary-foreground hover:text-primary-foreground",
              )}
            >
              {l.label}
              <span className="font-mono text-[0.7rem]">{counts[l.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="browser-type">Resource type</label>
          <select
            id="browser-type"
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType | "all")}
            className="h-10 rounded-lg border bg-card px-3 text-sm"
          >
            <option value="all">All types</option>
            {availableTypes.map((t) => <option key={t.value} value={t.value}>{t.plural}</option>)}
          </select>
          <label className="sr-only" htmlFor="browser-pricing">Price</label>
          <select
            id="browser-pricing"
            value={pricing}
            onChange={(e) => setPricing(e.target.value as Pricing | "all")}
            className="h-10 rounded-lg border bg-card px-3 text-sm"
          >
            <option value="all">Any price</option>
            {availablePricing.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {active && (
            <Button variant="ghost" onClick={clear}>
              <FilterXIcon /> Clear
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} of {resources.length} {label.toLowerCase()}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="No resources match these filters"
          description="Try another level or type."
          action={<Button variant="outline" onClick={clear}>Clear filters</Button>}
        />
      ) : groupByLevel && level === "all" ? (
        <div className="mt-6 space-y-10">
          {LEVELS.map((l) => {
            const items = filtered.filter((r) => r.level === l.value);
            if (!items.length) return null;
            return (
              <section key={l.value} aria-labelledby={`level-${l.value}`}>
                <h3 id={`level-${l.value}`} className="flex items-center gap-3 text-base font-semibold">
                  {l.label}
                  <span className="font-mono text-xs font-normal text-muted-foreground">{items.length}</span>
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                </h3>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => <li key={r.id}><ResourceCard resource={r} /></li>)}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => <li key={r.id}><ResourceCard resource={r} /></li>)}
        </ul>
      )}
    </div>
  );
}
