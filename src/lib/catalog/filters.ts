import { LEVELS, PRICING, RESOURCE_TYPES, SORTS, type Level, type Pricing, type ResourceType, type Sort } from "./labels";
import type { SearchFilters } from "./types";

type Params = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(",") : []).map((s) => s.trim()).filter(Boolean);
const slug = (v: string | string[] | undefined) => {
  const s = Array.isArray(v) ? v[0] : v;
  return s && /^[a-z0-9-]{1,96}$/.test(s) ? s : undefined;
};

/** Parse and sanitise library search params; unknown values are dropped. */
export function parseFilters(params: Params): SearchFilters {
  const levelValues = new Set(LEVELS.map((l) => l.value));
  const typeValues = new Set(RESOURCE_TYPES.map((t) => t.value));
  const pricingValues = new Set(PRICING.map((p) => p.value));
  const sortValues = new Set(SORTS.map((s) => s.value));
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 120) || undefined;
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const page = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  return {
    q,
    department: slug(params.department),
    technology: slug(params.technology),
    levels: list(params.level).filter((l): l is Level => levelValues.has(l as Level)),
    types: list(params.type).filter((t): t is ResourceType => typeValues.has(t as ResourceType)),
    pricing: list(params.pricing).filter((p): p is Pricing => pricingValues.has(p as Pricing)),
    sort: sortValues.has(sortRaw as Sort) ? (sortRaw as Sort) : q ? "relevance" : "relevance",
    page: Number.isInteger(page) && page > 0 && page < 1000 ? page : 1,
  };
}

export function filtersToQuery(f: SearchFilters, overrides: Partial<SearchFilters> = {}) {
  const merged = { ...f, ...overrides };
  const qs = new URLSearchParams();
  if (merged.q) qs.set("q", merged.q);
  if (merged.department) qs.set("department", merged.department);
  if (merged.technology) qs.set("technology", merged.technology);
  if (merged.levels?.length) qs.set("level", merged.levels.join(","));
  if (merged.types?.length) qs.set("type", merged.types.join(","));
  if (merged.pricing?.length) qs.set("pricing", merged.pricing.join(","));
  if (merged.sort && merged.sort !== "relevance") qs.set("sort", merged.sort);
  if (merged.page && merged.page > 1) qs.set("page", String(merged.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: SearchFilters) {
  return (f.department ? 1 : 0) + (f.technology ? 1 : 0) + (f.levels?.length ?? 0) + (f.types?.length ?? 0) + (f.pricing?.length ?? 0);
}
