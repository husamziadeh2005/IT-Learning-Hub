"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog/queries";
import { checkUrl } from "@/lib/admin/url-check";
import {
  departmentSchema,
  formToObject,
  resourceSchema,
  roadmapSchema,
  stageSchema,
  subcategorySchema,
  technologySchema,
  zodFieldErrors,
  type FormState,
} from "@/lib/validation/schemas";

/**
 * Admin / editor mutations.
 *
 * Every action re-checks the caller's role on the server (never trusting the
 * UI) and writes through the caller's own session, so the database's RLS
 * policies are the final authority: editors and admins may write catalog
 * content; only admins may delete it or manage user roles.
 */
export type AdminResult = { ok: true; message?: string } | { ok: false; error: string };

async function staff(requireAdmin = false) {
  const user = await getSessionUser();
  if (!user || !user.isStaff || (requireAdmin && !user.isAdmin)) return null;
  return { user, supabase: await createClient() };
}

const denied = { ok: false as const, error: "You don't have permission to do that." };
const deniedForm: FormState = { ok: false, message: "You don't have permission to do that." };

function dbMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") return /url/.test(error.message) ? "Another resource already uses this URL." : "That slug is already taken — choose another.";
  if (error.code === "23503") return "This item is still referenced elsewhere (for example by resources or roadmaps) and cannot be removed.";
  if (error.code === "23514") return error.message.includes("last administrator") ? "You can't remove the last administrator." : "Some values are not allowed. Check the form and try again.";
  if (error.code === "42501") return "You don't have permission to do that.";
  return "The database rejected this change. Please try again.";
}

function refreshCatalog(...paths: string[]) {
  updateTag(CATALOG_TAG);
  for (const p of paths) revalidatePath(p);
}

const id = z.coerce.number().int().positive();

// ── Departments & subcategories ─────────────────────────────────────────────
export async function saveDepartment(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await staff();
  if (!ctx) return deniedForm;
  const parsed = departmentSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: rowId, ...values } = parsed.data;
  const { error } = rowId
    ? await ctx.supabase.from("departments").update(values).eq("id", rowId)
    : await ctx.supabase.from("departments").insert(values);
  if (error) return { ok: false, message: dbMessage(error) };
  refreshCatalog("/admin/departments");
  return { ok: true, message: rowId ? "Department saved." : "Department created." };
}

export async function deleteDepartment(rawId: number): Promise<AdminResult> {
  const ctx = await staff(true);
  if (!ctx) return denied;
  const { error, count } = await ctx.supabase.from("departments").delete({ count: "exact" }).eq("id", id.parse(rawId));
  if (error) return { ok: false, error: dbMessage(error) };
  if (!count) return { ok: false, error: "Nothing was deleted." };
  refreshCatalog("/admin/departments");
  return { ok: true, message: "Department deleted." };
}

export async function saveSubcategory(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await staff();
  if (!ctx) return deniedForm;
  const parsed = subcategorySchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: rowId, ...values } = parsed.data;
  const { error } = rowId
    ? await ctx.supabase.from("subcategories").update(values).eq("id", rowId)
    : await ctx.supabase.from("subcategories").insert(values);
  if (error) return { ok: false, message: dbMessage(error) };
  refreshCatalog("/admin/departments");
  return { ok: true, message: rowId ? "Subcategory saved." : "Subcategory added." };
}

export async function deleteSubcategory(rawId: number): Promise<AdminResult> {
  const ctx = await staff();
  if (!ctx) return denied;
  const { error, count } = await ctx.supabase.from("subcategories").delete({ count: "exact" }).eq("id", id.parse(rawId));
  if (error) return { ok: false, error: dbMessage(error) };
  if (!count) return { ok: false, error: "Nothing was deleted." };
  refreshCatalog("/admin/departments");
  return { ok: true, message: "Subcategory deleted." };
}

// ── Technologies ────────────────────────────────────────────────────────────
export async function saveTechnology(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await staff();
  if (!ctx) return deniedForm;
  const parsed = technologySchema.safeParse(formToObject(form, ["subcategory_ids"]));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: rowId, subcategory_ids, official_url, ...values } = parsed.data;
  const row = { ...values, official_url: official_url || null };

  const { data, error } = rowId
    ? await ctx.supabase.from("technologies").update(row).eq("id", rowId).select("id").single()
    : await ctx.supabase.from("technologies").insert(row).select("id").single();
  if (error || !data) return { ok: false, message: error ? dbMessage(error) : "Save failed." };

  const { error: clearError } = await ctx.supabase.from("subcategory_technologies").delete().eq("technology_id", data.id);
  const { error: linkError } = subcategory_ids.length
    ? await ctx.supabase.from("subcategory_technologies").insert(subcategory_ids.map((sid) => ({ subcategory_id: sid, technology_id: data.id })))
    : { error: null };
  if (clearError || linkError) return { ok: false, message: "Saved the technology, but its subcategory placements could not be updated." };

  refreshCatalog("/admin/technologies");
  if (!rowId) redirect(`/admin/technologies/${data.id}?created=1`);
  return { ok: true, message: "Technology saved." };
}

export async function deleteTechnology(rawId: number): Promise<AdminResult> {
  const ctx = await staff(true);
  if (!ctx) return denied;
  const { error, count } = await ctx.supabase.from("technologies").delete({ count: "exact" }).eq("id", id.parse(rawId));
  if (error) return { ok: false, error: dbMessage(error) };
  if (!count) return { ok: false, error: "Nothing was deleted." };
  refreshCatalog("/admin/technologies");
  return { ok: true, message: "Technology deleted." };
}

// ── Resources ───────────────────────────────────────────────────────────────
export async function saveResource(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await staff();
  if (!ctx) return deniedForm;
  const parsed = resourceSchema.safeParse(formToObject(form, ["technology_ids"]));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: rowId, technology_ids, url, subcategory_id, duration_label, curator_note, ...values } = parsed.data;

  // A resource's subcategory must belong to its department.
  if (subcategory_id !== "") {
    const { data: sub } = await ctx.supabase.from("subcategories").select("department_id").eq("id", subcategory_id).single();
    if (!sub || sub.department_id !== values.department_id) return { ok: false, fieldErrors: { subcategory_id: ["Choose a subcategory from the selected department."] } };
  }

  const row = {
    ...values,
    url: url || null,
    subcategory_id: subcategory_id === "" ? null : subcategory_id,
    duration_label: duration_label || null,
    curator_note: curator_note || null,
  };
  const existing = rowId ? await ctx.supabase.from("resources").select("url").eq("id", rowId).single() : null;
  const urlChanged = !rowId || existing?.data?.url !== row.url;
  const write = urlChanged ? { ...row, url_status: "unchecked" as const, url_http_status: null, url_checked_at: null } : row;

  const { data, error } = rowId
    ? await ctx.supabase.from("resources").update(write).eq("id", rowId).select("id").single()
    : await ctx.supabase.from("resources").insert({ ...write, created_by: ctx.user.id }).select("id").single();
  if (error || !data) return { ok: false, message: error ? dbMessage(error) : "Save failed." };

  const { error: clearError } = await ctx.supabase.from("resource_technologies").delete().eq("resource_id", data.id);
  const { error: linkError } = technology_ids.length
    ? await ctx.supabase.from("resource_technologies").insert(technology_ids.map((tid) => ({ resource_id: data.id, technology_id: tid })))
    : { error: null };
  if (clearError || linkError) return { ok: false, message: "Saved the resource, but its technology links could not be updated." };

  // Verify new or changed links immediately so the status is never a guess.
  if (urlChanged && row.url) await runUrlCheck(ctx.supabase, data.id, row.url);

  refreshCatalog("/admin/resources", "/admin");
  if (!rowId) redirect(`/admin/resources/${data.id}?created=1`);
  return { ok: true, message: urlChanged && row.url ? "Resource saved and its link was re-checked." : "Resource saved." };
}

async function runUrlCheck(supabase: Awaited<ReturnType<typeof createClient>>, resourceId: number, url: string) {
  const result = await checkUrl(url);
  await supabase
    .from("resources")
    .update({ url_status: result.status, url_http_status: result.httpStatus, url_checked_at: new Date().toISOString() })
    .eq("id", resourceId);
  return result;
}

export async function verifyResourceUrl(rawId: number): Promise<AdminResult & { check?: Awaited<ReturnType<typeof checkUrl>> }> {
  const ctx = await staff();
  if (!ctx) return denied;
  const { data } = await ctx.supabase.from("resources").select("id, url").eq("id", id.parse(rawId)).single();
  if (!data?.url) return { ok: false, error: "This resource has no URL to check." };
  const check = await runUrlCheck(ctx.supabase, data.id, data.url);
  refreshCatalog("/admin/resources", "/admin");
  const label = { ok: "Link verified", redirected: "Link works but redirects", blocked: "Site blocks automated checks — verify by hand", broken: "Link appears broken" }[check.status];
  return { ok: true, message: `${label}${check.httpStatus ? ` (HTTP ${check.httpStatus})` : check.error ? ` (${check.error})` : ""}.`, check };
}

export async function setResourceStatus(rawId: number, status: "published" | "draft" | "archived" | "pending"): Promise<AdminResult> {
  const ctx = await staff();
  if (!ctx) return denied;
  const parsedStatus = z.enum(["published", "draft", "archived", "pending"]).parse(status);
  const { data: row } = await ctx.supabase.from("resources").select("url").eq("id", id.parse(rawId)).single();
  if (parsedStatus === "published" && !row?.url) return { ok: false, error: "Add a URL before publishing this resource." };
  const { data, error } = await ctx.supabase.from("resources").update({ status: parsedStatus }).eq("id", rawId).select("id");
  if (error) return { ok: false, error: dbMessage(error) };
  if (!data?.length) return { ok: false, error: "Resource not found." };
  refreshCatalog("/admin/resources", "/admin");
  return { ok: true, message: parsedStatus === "published" ? "Published." : `Moved to ${parsedStatus}.` };
}

export async function deleteResource(rawId: number): Promise<AdminResult> {
  const ctx = await staff(true);
  if (!ctx) return denied;
  const { error, count } = await ctx.supabase.from("resources").delete({ count: "exact" }).eq("id", id.parse(rawId));
  if (error) return { ok: false, error: dbMessage(error) };
  if (!count) return { ok: false, error: "Nothing was deleted." };
  refreshCatalog("/admin/resources", "/admin");
  return { ok: true, message: "Resource deleted." };
}

// ── Roadmaps & stages ───────────────────────────────────────────────────────
export async function saveRoadmap(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await staff();
  if (!ctx) return deniedForm;
  const parsed = roadmapSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: rowId, department_id, estimated_duration, ...values } = parsed.data;
  const row = { ...values, department_id: department_id === "" ? null : department_id, estimated_duration: estimated_duration || null };
  const { data, error } = rowId
    ? await ctx.supabase.from("roadmaps").update(row).eq("id", rowId).select("id").single()
    : await ctx.supabase.from("roadmaps").insert(row).select("id").single();
  if (error || !data) return { ok: false, message: error ? dbMessage(error) : "Save failed." };
  refreshCatalog("/admin/roadmaps");
  if (!rowId) redirect(`/admin/roadmaps/${data.id}?created=1`);
  return { ok: true, message: "Roadmap saved." };
}

export async function deleteRoadmap(rawId: number): Promise<AdminResult> {
  const ctx = await staff(true);
  if (!ctx) return denied;
  const { error, count } = await ctx.supabase.from("roadmaps").delete({ count: "exact" }).eq("id", id.parse(rawId));
  if (error) return { ok: false, error: dbMessage(error) };
  if (!count) return { ok: false, error: "Nothing was deleted." };
  refreshCatalog("/admin/roadmaps");
  return { ok: true, message: "Roadmap deleted." };
}

export async function saveStage(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await staff();
  if (!ctx) return deniedForm;
  const parsed = stageSchema.safeParse(formToObject(form, ["technology_ids", "resource_ids", "optional_resource_ids"]));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: stageId, roadmap_id, technology_ids, resource_ids, optional_resource_ids, estimated_duration, ...values } = parsed.data;
  const row = { ...values, estimated_duration: estimated_duration || null };

  let savedId = stageId;
  if (stageId) {
    const { error } = await ctx.supabase.from("roadmap_stages").update(row).eq("id", stageId).eq("roadmap_id", roadmap_id);
    if (error) return { ok: false, message: dbMessage(error) };
  } else {
    const { data: last } = await ctx.supabase.from("roadmap_stages").select("position").eq("roadmap_id", roadmap_id).order("position", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await ctx.supabase.from("roadmap_stages").insert({ ...row, roadmap_id, position: (last?.position ?? 0) + 1 }).select("id").single();
    if (error || !data) return { ok: false, message: error ? dbMessage(error) : "Save failed." };
    savedId = data.id;
  }

  const optional = new Set(optional_resource_ids);
  const results = await Promise.all([
    ctx.supabase.from("roadmap_stage_technologies").delete().eq("stage_id", savedId!),
    ctx.supabase.from("roadmap_resources").delete().eq("stage_id", savedId!),
  ]);
  const inserts = await Promise.all([
    technology_ids.length ? ctx.supabase.from("roadmap_stage_technologies").insert(technology_ids.map((t) => ({ stage_id: savedId!, technology_id: t }))) : { error: null },
    resource_ids.length
      ? ctx.supabase.from("roadmap_resources").insert(resource_ids.map((r, i) => ({ stage_id: savedId!, resource_id: r, position: i + 1, is_optional: optional.has(r) })))
      : { error: null },
  ]);
  if ([...results, ...inserts].some((r) => r.error)) return { ok: false, message: "Saved the stage, but its technologies or resources could not be updated." };

  refreshCatalog(`/admin/roadmaps/${roadmap_id}`);
  return { ok: true, message: stageId ? "Stage saved." : "Stage added." };
}

export async function deleteStage(rawId: number, rawRoadmapId: number): Promise<AdminResult> {
  const ctx = await staff();
  if (!ctx) return denied;
  const roadmapId = id.parse(rawRoadmapId);
  const { error, count } = await ctx.supabase.from("roadmap_stages").delete({ count: "exact" }).eq("id", id.parse(rawId)).eq("roadmap_id", roadmapId);
  if (error) return { ok: false, error: dbMessage(error) };
  if (!count) return { ok: false, error: "Nothing was deleted." };
  // Close the gap so positions stay 1..n.
  const { data: rest } = await ctx.supabase.from("roadmap_stages").select("id, position").eq("roadmap_id", roadmapId).order("position");
  for (const [i, s] of (rest ?? []).entries()) if (s.position !== i + 1) await ctx.supabase.from("roadmap_stages").update({ position: i + 1 }).eq("id", s.id);
  refreshCatalog(`/admin/roadmaps/${roadmapId}`);
  return { ok: true, message: "Stage deleted." };
}

export async function moveStage(rawId: number, direction: "up" | "down"): Promise<AdminResult> {
  const ctx = await staff();
  if (!ctx) return denied;
  const { data: stage } = await ctx.supabase.from("roadmap_stages").select("id, roadmap_id, position").eq("id", id.parse(rawId)).single();
  if (!stage) return { ok: false, error: "Stage not found." };
  const targetPos = stage.position + (direction === "up" ? -1 : 1);
  const { data: other } = await ctx.supabase.from("roadmap_stages").select("id, position").eq("roadmap_id", stage.roadmap_id).eq("position", targetPos).maybeSingle();
  if (!other) return { ok: false, error: "This stage is already at the edge." };
  // Swap via a temporary position so the (roadmap_id, position) unique constraint is never violated.
  const steps = [
    await ctx.supabase.from("roadmap_stages").update({ position: 32000 }).eq("id", stage.id),
    await ctx.supabase.from("roadmap_stages").update({ position: stage.position }).eq("id", other.id),
    await ctx.supabase.from("roadmap_stages").update({ position: targetPos }).eq("id", stage.id),
  ];
  if (steps.some((s) => s.error)) return { ok: false, error: "Couldn't reorder the stages. Reload and try again." };
  refreshCatalog(`/admin/roadmaps/${stage.roadmap_id}`);
  return { ok: true };
}

// ── Users & roles ───────────────────────────────────────────────────────────
export async function setUserRole(userId: string, role: "admin" | "editor", grant: boolean): Promise<AdminResult> {
  const ctx = await staff(true);
  if (!ctx) return denied;
  const uid = z.uuid().parse(userId);
  const parsedRole = z.enum(["admin", "editor"]).parse(role);
  if (!grant && uid === ctx.user.id && parsedRole === "admin") return { ok: false, error: "You can't remove your own admin role. Ask another administrator." };
  const { error } = grant
    ? await ctx.supabase.from("user_roles").upsert({ user_id: uid, role: parsedRole, granted_by: ctx.user.id }, { onConflict: "user_id,role", ignoreDuplicates: true })
    : await ctx.supabase.from("user_roles").delete().eq("user_id", uid).eq("role", parsedRole);
  if (error) return { ok: false, error: dbMessage(error) };
  revalidatePath("/admin/users");
  return { ok: true, message: grant ? `Granted ${parsedRole}.` : `Removed ${parsedRole}.` };
}
