/**
 * Compile the curated catalog in /content into supabase/seed.sql.
 *
 *   node scripts/generate-seed.ts
 *
 * - Validates every cross-reference (departments, subcategories,
 *   technologies, roadmap → resource keys) and fails loudly on mistakes.
 * - Merges the latest URL verification report (supabase/url-verification.json,
 *   produced by `npm run content:verify`) so each resource records whether its
 *   link was verified, redirected or blocked by bot protection.
 * - Emits idempotent SQL (`on conflict do nothing`) so re-running the seed
 *   never overwrites edits made later in the admin dashboard.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { departments, resources, roadmaps, technologies } from "../content/index.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, "supabase", "url-verification.json");
const outPath = path.join(root, "supabase", "seed.sql");

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

// ── Validation ──────────────────────────────────────────────────────────────
const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const deptSlugs = new Set(departments.map((d) => d.slug));
const techSlugs = new Set(technologies.map((t) => t.slug));
const subBySlug = new Map<string, Set<string>>();
for (const d of departments) subBySlug.set(d.slug, new Set(d.subcategories.map((s) => s.slug)));

function unique<T>(items: T[], key: (t: T) => string, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) fail(`Duplicate ${label}: ${k}`);
    seen.add(k);
  }
}
unique(departments, (d) => d.slug, "department slug");
unique(technologies, (t) => t.slug, "technology slug");
unique(resources, (r) => r.key, "resource key");
unique(resources.filter((r) => r.url), (r) => r.url!, "resource URL");
unique(roadmaps, (r) => r.slug, "roadmap slug");

for (const d of departments) {
  if (!slugRe.test(d.slug)) fail(`Bad department slug ${d.slug}`);
  for (const s of d.subcategories)
    for (const t of s.technologies) if (!techSlugs.has(t)) fail(`Subcategory ${d.slug}/${s.slug} → unknown technology ${t}`);
}
for (const t of technologies) {
  if (!deptSlugs.has(t.department)) fail(`Technology ${t.slug} → unknown department ${t.department}`);
  if (t.officialUrl && !t.officialUrl.startsWith("https://")) fail(`Technology ${t.slug} official URL must be https`);
}
const resourceKeys = new Set(resources.map((r) => r.key));
for (const r of resources) {
  if (!slugRe.test(r.key)) fail(`Bad resource key ${r.key}`);
  if (!deptSlugs.has(r.department)) fail(`Resource ${r.key} → unknown department ${r.department}`);
  if (r.subcategory && !subBySlug.get(r.department)?.has(r.subcategory))
    fail(`Resource ${r.key} → subcategory ${r.subcategory} is not in ${r.department}`);
  for (const t of r.technologies) if (!techSlugs.has(t)) fail(`Resource ${r.key} → unknown technology ${t}`);
  if (!r.url && r.status !== "pending") fail(`Resource ${r.key} has no URL but is not pending`);
  if (r.description.length < 10) fail(`Resource ${r.key} description too short`);
}
for (const rm of roadmaps) {
  if (rm.department && !deptSlugs.has(rm.department)) fail(`Roadmap ${rm.slug} → unknown department ${rm.department}`);
  rm.stages.forEach((stage, i) => {
    for (const t of stage.technologies) if (!techSlugs.has(t)) fail(`Roadmap ${rm.slug} stage ${i + 1} → unknown technology ${t}`);
    for (const ref of stage.resources) {
      const key = ref.replace(/^\?/, "");
      if (!resourceKeys.has(key)) fail(`Roadmap ${rm.slug} stage ${i + 1} → unknown resource ${key}`);
    }
  });
}
if (errors.length) {
  console.error(`Content validation failed (${errors.length}):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}

// ── Verification report ─────────────────────────────────────────────────────
type Verdict = "ok" | "redirected" | "blocked" | "broken";
const verification = new Map<string, { verdict: Verdict; status: number | null; checkedAt: string }>();
if (existsSync(reportPath)) {
  const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
    checkedAt: string;
    results: { url: string; verdict: Verdict; status: number | null }[];
  };
  for (const r of report.results) verification.set(r.url, { verdict: r.verdict, status: r.status, checkedAt: report.checkedAt });
} else {
  console.warn("No supabase/url-verification.json found — resources will be seeded as 'unchecked'.");
}

// ── SQL helpers ─────────────────────────────────────────────────────────────
const q = (v: string | null | undefined) => (v === null || v === undefined ? "null" : `'${v.replace(/'/g, "''")}'`);
const arr = (items: string[]) => (items.length ? `array[${items.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const bool = (v: boolean | undefined) => (v ? "true" : "false");
const dept = (slug: string) => `(select id from public.departments where slug = ${q(slug)})`;
const tech = (slug: string) => `(select id from public.technologies where slug = ${q(slug)})`;
const res = (key: string) => `(select id from public.resources where slug = ${q(key)})`;
const sub = (deptSlug: string, subSlug: string) =>
  `(select s.id from public.subcategories s join public.departments d on d.id = s.department_id where d.slug = ${q(deptSlug)} and s.slug = ${q(subSlug)})`;

const out: string[] = [];
const emit = (s: string) => out.push(s);

emit(`-- =============================================================================
-- GENERATED FILE — do not edit by hand.
-- Source: /content (run \`npm run content:seed\` to regenerate)
-- Generated: ${new Date().toISOString()}
-- ${departments.length} departments · ${technologies.length} technologies · ${resources.length} resources · ${roadmaps.length} roadmaps
--
-- Idempotent: rows that already exist (by slug) are left untouched, so running
-- this against a live database never overwrites edits made in the admin UI.
-- =============================================================================

begin;
`);

emit("-- Departments");
departments.forEach((d, i) => {
  emit(
    `insert into public.departments (slug, name, tagline, description, icon, accent, sort_order) values (${q(d.slug)}, ${q(d.name)}, ${q(d.tagline)}, ${q(d.description)}, ${q(d.icon)}, ${q(d.accent)}, ${i + 1}) on conflict (slug) do nothing;`,
  );
});

emit("\n-- Subcategories");
for (const d of departments) {
  d.subcategories.forEach((s, i) => {
    emit(
      `insert into public.subcategories (department_id, slug, name, description, sort_order) values (${dept(d.slug)}, ${q(s.slug)}, ${q(s.name)}, ${q(s.description)}, ${i + 1}) on conflict (department_id, slug) do nothing;`,
    );
  });
}

emit("\n-- Technologies");
technologies.forEach((t, i) => {
  emit(
    `insert into public.technologies (slug, name, short_description, description, department_id, official_url, topics, icon, is_featured, sort_order) values (${q(t.slug)}, ${q(t.name)}, ${q(t.short)}, ${q(t.description)}, ${dept(t.department)}, ${q(t.officialUrl)}, ${arr(t.topics)}, ${q(t.icon ?? "code")}, ${bool(t.featured)}, ${i + 1}) on conflict (slug) do nothing;`,
  );
});

emit("\n-- Technology placements in subcategories");
for (const d of departments)
  for (const s of d.subcategories)
    s.technologies.forEach((t, i) =>
      emit(
        `insert into public.subcategory_technologies (subcategory_id, technology_id, sort_order) values (${sub(d.slug, s.slug)}, ${tech(t)}, ${i + 1}) on conflict do nothing;`,
      ),
    );

emit("\n-- Resources");
const statusCounts: Record<string, number> = {};
for (const r of resources) {
  const v = r.url ? verification.get(r.url) : undefined;
  const urlStatus = v ? (v.verdict === "ok" ? "ok" : v.verdict) : "unchecked";
  statusCounts[urlStatus] = (statusCounts[urlStatus] ?? 0) + 1;
  const status = r.status ?? "published";
  emit(
    `insert into public.resources (slug, title, description, url, department_id, subcategory_id, level, type, publisher, pricing, source_kind, language, duration_label, status, is_featured, url_status, url_http_status, url_checked_at, curator_note) values (${q(r.key)}, ${q(r.title)}, ${q(r.description)}, ${q(r.url)}, ${dept(r.department)}, ${r.subcategory ? sub(r.department, r.subcategory) : "null"}, ${q(r.level)}, ${q(r.type)}, ${q(r.publisher)}, ${q(r.pricing)}, ${q(r.source)}, ${q(r.language ?? "English")}, ${q(r.duration)}, ${q(status)}, ${bool(r.featured)}, ${q(urlStatus)}, ${v?.status ?? "null"}, ${v ? q(v.checkedAt) : "null"}, ${q(r.note)}) on conflict (slug) do nothing;`,
  );
}

emit("\n-- Resource ↔ technology links");
for (const r of resources)
  for (const t of r.technologies)
    emit(`insert into public.resource_technologies (resource_id, technology_id) values (${res(r.key)}, ${tech(t)}) on conflict do nothing;`);

emit("\n-- Roadmaps, stages, stage technologies and stage resources");
roadmaps.forEach((rm, i) => {
  emit(
    `insert into public.roadmaps (slug, title, summary, description, department_id, level, estimated_duration, prerequisites, outcomes, certifications, icon, is_featured, status, sort_order) values (${q(rm.slug)}, ${q(rm.title)}, ${q(rm.summary)}, ${q(rm.description)}, ${rm.department ? dept(rm.department) : "null"}, ${q(rm.level)}, ${q(rm.duration)}, ${arr(rm.prerequisites)}, ${arr(rm.outcomes)}, ${json(rm.certifications)}, ${q(rm.icon)}, ${bool(rm.featured)}, 'published', ${i + 1}) on conflict (slug) do nothing;`,
  );
  rm.stages.forEach((stage, s) => {
    const roadmapId = `(select id from public.roadmaps where slug = ${q(rm.slug)})`;
    const stageId = `(select id from public.roadmap_stages where roadmap_id = ${roadmapId} and position = ${s + 1})`;
    emit(
      // (roadmap_id, position) is DEFERRABLE, which ON CONFLICT cannot target.
      `insert into public.roadmap_stages (roadmap_id, position, title, summary, skills, projects, estimated_duration) select ${roadmapId}, ${s + 1}, ${q(stage.title)}, ${q(stage.summary)}, ${arr(stage.skills)}, ${json(stage.projects)}, ${q(stage.duration)} where not exists (select 1 from public.roadmap_stages where roadmap_id = ${roadmapId} and position = ${s + 1});`,
    );
    for (const t of stage.technologies)
      emit(`insert into public.roadmap_stage_technologies (stage_id, technology_id) values (${stageId}, ${tech(t)}) on conflict do nothing;`);
    stage.resources.forEach((ref, p) => {
      const optional = ref.startsWith("?");
      emit(
        `insert into public.roadmap_resources (stage_id, resource_id, position, is_optional) values (${stageId}, ${res(ref.replace(/^\?/, ""))}, ${p + 1}, ${bool(optional)}) on conflict do nothing;`,
      );
    });
  });
});

emit("\ncommit;\n");
writeFileSync(outPath, out.join("\n"));
console.log(
  `Wrote ${path.relative(root, outPath)}: ${departments.length} departments, ${technologies.length} technologies, ${resources.length} resources, ${roadmaps.length} roadmaps (${roadmaps.reduce((n, r) => n + r.stages.length, 0)} stages).`,
);
console.log("Resource URL status:", statusCounts);
