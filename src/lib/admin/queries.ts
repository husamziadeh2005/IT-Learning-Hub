import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ContentStatus, UrlCheckStatus } from "@/lib/catalog/labels";

/** Staff reads. RLS lets staff see drafts, pending and archived rows. */

export async function getAdminOverview() {
  const supabase = await createClient();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const head = { count: "exact" as const, head: true };
  const [published, draft, pending, archived, broken, blocked, unchecked, technologies, roadmaps, users, pendingRows] = await Promise.all([
    count(supabase.from("resources").select("id", head).eq("status", "published")),
    count(supabase.from("resources").select("id", head).eq("status", "draft")),
    count(supabase.from("resources").select("id", head).eq("status", "pending")),
    count(supabase.from("resources").select("id", head).eq("status", "archived")),
    count(supabase.from("resources").select("id", head).eq("url_status", "broken")),
    count(supabase.from("resources").select("id", head).eq("url_status", "blocked")),
    count(supabase.from("resources").select("id", head).eq("url_status", "unchecked").not("url", "is", null)),
    count(supabase.from("technologies").select("id", head)),
    count(supabase.from("roadmaps").select("id", head)),
    count(supabase.from("profiles").select("id", head)),
    supabase.from("resources").select("id, title, status, curator_note, url_status, url").or("status.eq.pending,status.eq.draft,url_status.eq.broken").order("updated_at", { ascending: false }).limit(10),
  ]);
  return { published, draft, pending, archived, broken, blocked, unchecked, technologies, roadmaps, users, attention: pendingRows.data ?? [] };
}

export const ADMIN_PAGE_SIZE = 25;

export async function listAdminResources(filters: { q?: string; status?: string; url?: string; department?: string; page?: number }) {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  let query = supabase
    .from("resources")
    .select("id, slug, title, url, status, url_status, url_http_status, url_checked_at, level, type, pricing, publisher, is_featured, updated_at, departments(name, slug)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (filters.q) {
    const term = filters.q.replace(/[%_,()\\]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,publisher.ilike.%${term}%,slug.ilike.%${term}%`);
  }
  if (filters.status) query = query.eq("status", filters.status as ContentStatus);
  if (filters.url) query = query.eq("url_status", filters.url as UrlCheckStatus);
  if (filters.department) {
    const { data: d } = await supabase.from("departments").select("id").eq("slug", filters.department).maybeSingle();
    if (d) query = query.eq("department_id", d.id);
  }
  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load resources: ${error.message}`);
  return { rows: data, total: count ?? 0, page, pageCount: Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE) };
}

export async function getAdminResource(resourceId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select("*, resource_technologies(technology_id)").eq("id", resourceId).maybeSingle();
  return data;
}

/** Departments with subcategories and all technologies, for form selects. */
export async function getTaxonomy() {
  const supabase = await createClient();
  const [departments, technologies] = await Promise.all([
    supabase.from("departments").select("id, slug, name, tagline, description, icon, accent, sort_order, is_published, subcategories(id, slug, name, description, sort_order)").order("sort_order"),
    supabase.from("technologies").select("id, slug, name, department_id, is_published, is_featured, icon, sort_order").order("name"),
  ]);
  return {
    departments: (departments.data ?? []).map((d) => ({ ...d, subcategories: [...d.subcategories].sort((a, b) => a.sort_order - b.sort_order) })),
    technologies: technologies.data ?? [],
  };
}

export async function listAdminTechnologies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technologies")
    .select("id, slug, name, short_description, icon, is_featured, is_published, sort_order, departments(name), resource_technologies(count)")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminTechnology(techId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from("technologies").select("*, subcategory_technologies(subcategory_id)").eq("id", techId).maybeSingle();
  return data;
}

export async function listAdminRoadmaps() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .select("id, slug, title, status, level, is_featured, sort_order, updated_at, departments(name), roadmap_stages(count)")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminRoadmap(roadmapId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("roadmaps")
    .select("*, roadmap_stages(id, position, title, summary, skills, projects, estimated_duration, roadmap_stage_technologies(technology_id), roadmap_resources(resource_id, position, is_optional))")
    .eq("id", roadmapId)
    .maybeSingle();
  if (!data) return null;
  return { ...data, roadmap_stages: [...data.roadmap_stages].sort((a, b) => a.position - b.position) };
}

/** Compact list of resources for pickers. */
export async function getResourceOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select("id, title, publisher, status, level").order("title");
  return data ?? [];
}

export async function listUsers(q?: string) {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, display_name, headline, created_at").order("created_at", { ascending: false }).limit(200);
  if (q) {
    const term = q.replace(/[%_,()\\]/g, " ").trim();
    if (term) query = query.ilike("display_name", `%${term}%`);
  }
  const [{ data: profiles, error }, { data: roles }] = await Promise.all([query, supabase.from("user_roles").select("user_id, role")]);
  if (error) throw new Error(error.message);
  const byUser = new Map<string, string[]>();
  for (const r of roles ?? []) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role]);
  return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
}
