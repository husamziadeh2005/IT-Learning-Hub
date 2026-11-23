import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Certification,
  DepartmentSummary,
  ResourceCardData,
  RoadmapDetail,
  RoadmapSummary,
  SearchFilters,
  StageProject,
  TechRef,
  TechnologyCardData,
} from "./types";
import type { Level, Pricing, ResourceType, SourceKind } from "./labels";

/**
 * Public catalog reads.
 *
 * Every function is a `"use cache"` scope tagged `catalog`, so pages built on
 * them prerender into the static shell and are shared by all visitors. Admin
 * mutations call `updateTag(CATALOG_TAG)` to refresh them immediately.
 *
 * When the database is unreachable the functions return empty results with a
 * very short cache life instead of throwing, so pages render an honest
 * "catalog unavailable" state rather than crashing.
 */
export const CATALOG_TAG = "catalog";
export const PAGE_SIZE = 24;

export const RESOURCE_FIELDS =
  "id, slug, title, description, url, level, type, publisher, pricing, source_kind, duration_label, is_featured, published_at, departments(slug, name, accent), resource_technologies(technologies(slug, name))";

export type RawResource = {
  id: number;
  slug: string;
  title: string;
  description: string;
  url: string | null;
  level: Level;
  type: ResourceType;
  publisher: string;
  pricing: Pricing;
  source_kind: SourceKind;
  duration_label: string | null;
  is_featured: boolean;
  published_at: string | null;
  departments: { slug: string; name: string; accent: string } | null;
  resource_technologies: { technologies: TechRef | null }[];
};

export function toResource(r: RawResource): ResourceCardData {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    url: r.url,
    level: r.level,
    type: r.type,
    publisher: r.publisher,
    pricing: r.pricing,
    source_kind: r.source_kind,
    duration_label: r.duration_label,
    is_featured: r.is_featured,
    published_at: r.published_at,
    department: r.departments,
    technologies: r.resource_technologies
      .map((rt) => rt.technologies)
      .filter((t): t is TechRef => Boolean(t))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function db() {
  const client = createPublicClient();
  if (!client) {
    cacheLife("seconds");
    return null;
  }
  return client;
}

function failed(where: string, error: { message: string } | null) {
  console.error(`[catalog] ${where}: ${error?.message ?? "unknown error"}`);
  cacheLife("seconds");
}

// ── Stats ──────────────────────────────────────────────────────────────────
export async function getCatalogStats() {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  const empty = { resources: 0, technologies: 0, roadmaps: 0, departments: 0, free: 0 };
  if (!client) return empty;
  const [resources, technologies, roadmaps, departments, free] = await Promise.all([
    client.from("resources").select("id", { count: "exact", head: true }).eq("status", "published"),
    client.from("technologies").select("id", { count: "exact", head: true }).eq("is_published", true),
    client.from("roadmaps").select("id", { count: "exact", head: true }).eq("status", "published"),
    client.from("departments").select("id", { count: "exact", head: true }).eq("is_published", true),
    client.from("resources").select("id", { count: "exact", head: true }).eq("status", "published").eq("pricing", "free"),
  ]);
  const error = resources.error ?? technologies.error ?? roadmaps.error ?? departments.error ?? free.error;
  if (error) {
    failed("stats", error);
    return empty;
  }
  cacheLife("hours");
  return {
    resources: resources.count ?? 0,
    technologies: technologies.count ?? 0,
    roadmaps: roadmaps.count ?? 0,
    departments: departments.count ?? 0,
    free: free.count ?? 0,
  };
}

// ── Departments ────────────────────────────────────────────────────────────
export async function getDepartments(): Promise<DepartmentSummary[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("departments")
    .select("id, slug, name, tagline, description, icon, accent, resources(count), technologies(count)")
    .eq("is_published", true)
    .eq("resources.status", "published")
    .eq("technologies.is_published", true)
    .order("sort_order");
  if (error) {
    failed("departments", error);
    return [];
  }
  cacheLife("hours");
  return data.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    tagline: d.tagline,
    description: d.description,
    icon: d.icon,
    accent: d.accent,
    resourceCount: d.resources[0]?.count ?? 0,
    technologyCount: d.technologies[0]?.count ?? 0,
  }));
}

export async function getDepartmentSlugs() {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  const { data, error } = await client.from("departments").select("slug").eq("is_published", true);
  if (error) {
    failed("department slugs", error);
    return [];
  }
  cacheLife("hours");
  return data.map((d) => d.slug);
}

export async function getDepartment(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("departments")
    .select(
      "id, slug, name, tagline, description, icon, accent, subcategories(id, slug, name, description, sort_order, subcategory_technologies(sort_order, technologies(id, slug, name, short_description, icon, is_featured, is_published)))",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) {
    failed(`department ${slug}`, error);
    return null;
  }
  if (!data) {
    cacheLife("minutes");
    return null;
  }

  const [resources, roadmaps, levelCounts] = await Promise.all([
    client
      .from("resources")
      .select(RESOURCE_FIELDS)
      .eq("department_id", data.id)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("title"),
    client
      .from("roadmaps")
      .select("id, slug, title, summary, level, estimated_duration, icon, is_featured, departments(slug, name, accent), roadmap_stages(title, position)")
      .eq("department_id", data.id)
      .eq("status", "published")
      .order("sort_order"),
    client.from("resources").select("level").eq("department_id", data.id).eq("status", "published"),
  ]);
  if (resources.error || roadmaps.error || levelCounts.error) {
    failed(`department ${slug} details`, resources.error ?? roadmaps.error ?? levelCounts.error);
  } else {
    cacheLife("hours");
  }

  const counts = { beginner: 0, intermediate: 0, advanced: 0 } as Record<Level, number>;
  for (const r of levelCounts.data ?? []) counts[r.level as Level] += 1;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    icon: data.icon,
    accent: data.accent,
    levelCounts: counts,
    totalResources: (levelCounts.data ?? []).length,
    subcategories: [...data.subcategories]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        technologies: [...s.subcategory_technologies]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((st) => st.technologies)
          .filter((t): t is NonNullable<typeof t> => Boolean(t && t.is_published)),
      })),
    resources: ((resources.data ?? []) as unknown as RawResource[]).map(toResource),
    roadmaps: (roadmaps.data ?? []).map(toRoadmapSummary),
  };
}

// ── Technologies ───────────────────────────────────────────────────────────
export async function getTechnologies(options: { featuredOnly?: boolean } = {}): Promise<TechnologyCardData[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  let query = client
    .from("technologies")
    .select("id, slug, name, short_description, icon, is_featured, departments(slug, name, accent), resource_technologies(count)")
    .eq("is_published", true)
    .order("sort_order");
  if (options.featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) {
    failed("technologies", error);
    return [];
  }
  cacheLife("hours");
  return data.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    short_description: t.short_description,
    icon: t.icon,
    is_featured: t.is_featured,
    department: t.departments,
    resourceCount: t.resource_technologies[0]?.count ?? 0,
  }));
}

export async function getTechnologySlugs() {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  const { data, error } = await client.from("technologies").select("slug").eq("is_published", true);
  if (error) {
    failed("technology slugs", error);
    return [];
  }
  cacheLife("hours");
  return data.map((t) => t.slug);
}

export async function getTechnology(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("technologies")
    .select("id, slug, name, short_description, description, official_url, topics, icon, departments(slug, name, accent)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) {
    failed(`technology ${slug}`, error);
    return null;
  }
  if (!data) {
    cacheLife("minutes");
    return null;
  }
  const [links, stageLinks] = await Promise.all([
    client.from("resource_technologies").select(`resources!inner(${RESOURCE_FIELDS})`).eq("technology_id", data.id).eq("resources.status", "published"),
    client
      .from("roadmap_stage_technologies")
      .select("roadmap_stages!inner(roadmaps!inner(id, slug, title, summary, level, estimated_duration, icon, is_featured, status, departments(slug, name, accent), roadmap_stages(title, position)))")
      .eq("technology_id", data.id),
  ]);
  if (links.error || stageLinks.error) failed(`technology ${slug} details`, links.error ?? stageLinks.error);
  else cacheLife("hours");

  const resources = ((links.data ?? []) as unknown as { resources: RawResource }[])
    .map((l) => toResource(l.resources))
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.title.localeCompare(b.title));

  const roadmapMap = new Map<number, RoadmapSummary>();
  for (const link of (stageLinks.data ?? []) as unknown as { roadmap_stages: { roadmaps: RawRoadmap & { status: string } } }[]) {
    const rm = link.roadmap_stages.roadmaps;
    if (rm.status === "published" && !roadmapMap.has(rm.id)) roadmapMap.set(rm.id, toRoadmapSummary(rm));
  }

  return {
    ...data,
    department: data.departments,
    resources,
    roadmaps: [...roadmapMap.values()],
  };
}

// ── Resources ──────────────────────────────────────────────────────────────
export async function getResourceList(kind: "featured" | "recent", limit = 6): Promise<ResourceCardData[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  let query = client.from("resources").select(RESOURCE_FIELDS).eq("status", "published");
  query =
    kind === "featured"
      ? query.eq("is_featured", true).order("published_at", { ascending: false }).order("id")
      : query.order("published_at", { ascending: false }).order("id", { ascending: false });
  const { data, error } = await query.limit(limit);
  if (error) {
    failed(`${kind} resources`, error);
    return [];
  }
  cacheLife("hours");
  return (data as unknown as RawResource[]).map(toResource);
}

export async function getResourceSlugs() {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  const { data, error } = await client.from("resources").select("slug").eq("status", "published");
  if (error) {
    failed("resource slugs", error);
    return [];
  }
  cacheLife("hours");
  return data.map((r) => r.slug);
}

export async function getResource(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("resources")
    .select(`${RESOURCE_FIELDS}, language, url_status, url_checked_at, subcategories(slug, name)`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    failed(`resource ${slug}`, error);
    return null;
  }
  if (!data) {
    cacheLife("minutes");
    return null;
  }
  const raw = data as unknown as RawResource & {
    language: string;
    url_status: string;
    url_checked_at: string | null;
    subcategories: { slug: string; name: string } | null;
  };
  const [roadmaps, related] = await Promise.all([
    client
      .from("roadmap_resources")
      .select("roadmap_stages!inner(position, title, roadmaps!inner(slug, title, status))")
      .eq("resource_id", raw.id),
    raw.resource_technologies[0]?.technologies
      ? client
          .from("resources")
          .select(`${RESOURCE_FIELDS}, rt:resource_technologies!inner(technologies!inner(slug))`)
          .eq("status", "published")
          .eq("rt.technologies.slug", raw.resource_technologies[0].technologies.slug)
          .neq("id", raw.id)
          .limit(4)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (roadmaps.error || related.error) failed(`resource ${slug} details`, roadmaps.error ?? related.error);
  else cacheLife("hours");

  return {
    ...toResource(raw),
    language: raw.language,
    url_status: raw.url_status,
    url_checked_at: raw.url_checked_at,
    subcategory: raw.subcategories,
    inRoadmaps: ((roadmaps.data ?? []) as unknown as { roadmap_stages: { position: number; title: string; roadmaps: { slug: string; title: string; status: string } } }[])
      .filter((r) => r.roadmap_stages.roadmaps.status === "published")
      .map((r) => ({ slug: r.roadmap_stages.roadmaps.slug, title: r.roadmap_stages.roadmaps.title, stage: r.roadmap_stages.position, stageTitle: r.roadmap_stages.title })),
    related: ((related.data ?? []) as unknown as RawResource[]).map(toResource),
  };
}

export async function searchResources(filters: SearchFilters) {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  const page = Math.max(1, filters.page ?? 1);
  if (!client) return { items: [] as ResourceCardData[], total: 0, page, pageCount: 0, unavailable: true };
  const { data, error } = await client.rpc("search_resources", {
    q: filters.q || undefined,
    p_department: filters.department || undefined,
    p_technology: filters.technology || undefined,
    p_levels: filters.levels?.length ? filters.levels : undefined,
    p_types: filters.types?.length ? filters.types : undefined,
    p_pricing: filters.pricing?.length ? filters.pricing : undefined,
    p_sort: filters.sort ?? "relevance",
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error) {
    failed("search", error);
    return { items: [] as ResourceCardData[], total: 0, page, pageCount: 0, unavailable: true };
  }
  cacheLife("minutes");
  const total = Number(data[0]?.total_count ?? 0);
  return {
    items: data.map<ResourceCardData>((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      url: r.url,
      level: r.level,
      type: r.type,
      publisher: r.publisher,
      pricing: r.pricing,
      source_kind: r.source_kind,
      duration_label: r.duration_label,
      is_featured: r.is_featured,
      published_at: r.published_at,
      department: { slug: r.department_slug, name: r.department_name, accent: "" },
      technologies: (r.technologies as unknown as TechRef[]) ?? [],
    })),
    total,
    page,
    pageCount: Math.ceil(total / PAGE_SIZE),
    unavailable: false,
  };
}

export async function searchCatalog(q: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  const empty = { departments: [], technologies: [], roadmaps: [] } as {
    departments: { slug: string; name: string; tagline: string; icon: string }[];
    technologies: { slug: string; name: string; short_description: string; icon: string; department_slug: string }[];
    roadmaps: { slug: string; title: string; summary: string; icon: string; level: Level }[];
  };
  if (!client || !q.trim()) return empty;
  const { data, error } = await client.rpc("search_catalog", { q, per_group: 8 });
  if (error) {
    failed("catalog search", error);
    return empty;
  }
  cacheLife("minutes");
  return (data as unknown as typeof empty) ?? empty;
}

// ── Roadmaps ───────────────────────────────────────────────────────────────
type RawRoadmap = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  level: Level;
  estimated_duration: string | null;
  icon: string;
  is_featured: boolean;
  departments: { slug: string; name: string; accent: string } | null;
  roadmap_stages: { title: string; position: number }[];
};

function toRoadmapSummary(r: RawRoadmap): RoadmapSummary {
  const stages = [...r.roadmap_stages].sort((a, b) => a.position - b.position);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    level: r.level,
    estimated_duration: r.estimated_duration,
    icon: r.icon,
    is_featured: r.is_featured,
    department: r.departments,
    stageCount: stages.length,
    stageTitles: stages.map((s) => s.title),
  };
}

export async function getRoadmaps(options: { featuredOnly?: boolean } = {}): Promise<RoadmapSummary[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  let query = client
    .from("roadmaps")
    .select("id, slug, title, summary, level, estimated_duration, icon, is_featured, departments(slug, name, accent), roadmap_stages(title, position)")
    .eq("status", "published")
    .order("sort_order");
  if (options.featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) {
    failed("roadmaps", error);
    return [];
  }
  cacheLife("hours");
  return (data as unknown as RawRoadmap[]).map(toRoadmapSummary);
}

export async function getRoadmapSlugs() {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return [];
  const { data, error } = await client.from("roadmaps").select("slug").eq("status", "published");
  if (error) {
    failed("roadmap slugs", error);
    return [];
  }
  cacheLife("hours");
  return data.map((r) => r.slug);
}

export async function getRoadmap(slug: string): Promise<RoadmapDetail | null> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("roadmaps")
    .select(
      `id, slug, title, summary, description, level, estimated_duration, prerequisites, outcomes, certifications, icon, is_featured, departments(slug, name, accent),
       roadmap_stages(id, position, title, summary, skills, projects, estimated_duration,
         roadmap_stage_technologies(technologies(slug, name)),
         roadmap_resources(position, is_optional, resources(${RESOURCE_FIELDS}, status)))`,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    failed(`roadmap ${slug}`, error);
    return null;
  }
  if (!data) {
    cacheLife("minutes");
    return null;
  }
  cacheLife("hours");
  type RawStage = {
    id: number;
    position: number;
    title: string;
    summary: string;
    skills: string[];
    projects: StageProject[];
    estimated_duration: string | null;
    roadmap_stage_technologies: { technologies: TechRef | null }[];
    roadmap_resources: { position: number; is_optional: boolean; resources: (RawResource & { status: string }) | null }[];
  };
  const raw = data as unknown as RawRoadmap & {
    description: string;
    prerequisites: string[];
    outcomes: string[];
    certifications: Certification[];
    roadmap_stages: RawStage[];
  };
  const stages = [...raw.roadmap_stages]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      id: s.id,
      position: s.position,
      title: s.title,
      summary: s.summary,
      skills: s.skills,
      projects: s.projects ?? [],
      estimated_duration: s.estimated_duration,
      technologies: s.roadmap_stage_technologies.map((t) => t.technologies).filter((t): t is TechRef => Boolean(t)),
      // Pending/draft resources are hidden by RLS (resources = null), except
      // the curated pending Nexavena video which we surface as "coming soon"
      // in the UI only when it is published.
      resources: [...s.roadmap_resources]
        .filter((rr) => rr.resources && rr.resources.status === "published")
        .sort((a, b) => a.position - b.position)
        .map((rr) => ({ ...toResource(rr.resources!), is_optional: rr.is_optional, position: rr.position })),
    }));
  return {
    ...toRoadmapSummary({ ...raw, roadmap_stages: raw.roadmap_stages.map((s) => ({ title: s.title, position: s.position })) }),
    description: raw.description,
    prerequisites: raw.prerequisites,
    outcomes: raw.outcomes,
    certifications: raw.certifications ?? [],
    stages,
  };
}

/** Lightweight lists for filter dropdowns. */
export async function getFilterOptions() {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = db();
  if (!client) return { departments: [], technologies: [] };
  const [departments, technologies] = await Promise.all([
    client.from("departments").select("slug, name").eq("is_published", true).order("sort_order"),
    client.from("technologies").select("slug, name, departments(slug)").eq("is_published", true).order("name"),
  ]);
  if (departments.error || technologies.error) {
    failed("filter options", departments.error ?? technologies.error);
    return { departments: [], technologies: [] };
  }
  cacheLife("hours");
  return {
    departments: departments.data,
    technologies: technologies.data.map((t) => ({ slug: t.slug, name: t.name, department: t.departments?.slug ?? null })),
  };
}
