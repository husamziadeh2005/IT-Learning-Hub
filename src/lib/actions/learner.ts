"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, zodFieldErrors, type FormState } from "@/lib/validation/schemas";

/**
 * Learner mutations. Each action re-verifies the caller with getClaims() and
 * writes through the user's own Supabase session, so Row Level Security is the
 * final guard: a user can only ever touch rows where user_id = auth.uid().
 * Results report the real database outcome — never an optimistic guess.
 */
export type ActionResult = { ok: true } | { ok: false; error: string; signedOut?: boolean };

const resourceId = z.coerce.number().int().positive();
const progressStatus = z.enum(["in_progress", "completed"]).nullable();
const enrollmentStatus = z.enum(["active", "paused", "completed"]);

async function authed() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return { supabase, userId: userId ?? null };
}

const signedOut: ActionResult = { ok: false, error: "Sign in to save your progress.", signedOut: true };
const failed = (message: string): ActionResult => ({ ok: false, error: message });

export async function setBookmark(rawId: number, saved: boolean): Promise<ActionResult> {
  const id = resourceId.safeParse(rawId);
  if (!id.success) return failed("Unknown resource.");
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;

  const { error } = saved
    ? await supabase.from("bookmarks").upsert({ user_id: userId, resource_id: id.data }, { onConflict: "user_id,resource_id", ignoreDuplicates: true })
    : await supabase.from("bookmarks").delete().eq("user_id", userId).eq("resource_id", id.data);
  if (error) return failed("We couldn't update your saved resources. Please try again.");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function setProgress(rawId: number, rawStatus: "in_progress" | "completed" | null): Promise<ActionResult> {
  const id = resourceId.safeParse(rawId);
  const status = progressStatus.safeParse(rawStatus);
  if (!id.success || !status.success) return failed("Invalid progress update.");
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;

  let error;
  if (status.data === null) {
    ({ error } = await supabase.from("user_progress").delete().eq("user_id", userId).eq("resource_id", id.data));
  } else {
    ({ error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        resource_id: id.data,
        status: status.data,
        completed_at: status.data === "completed" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,resource_id" },
    ));
  }
  if (error) return failed("We couldn't save your progress. Please try again.");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function enrollInRoadmap(rawRoadmapId: number): Promise<ActionResult> {
  const id = resourceId.safeParse(rawRoadmapId);
  if (!id.success) return failed("Unknown roadmap.");
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;
  const { error } = await supabase
    .from("user_roadmaps")
    .upsert({ user_id: userId, roadmap_id: id.data, status: "active", completed_at: null }, { onConflict: "user_id,roadmap_id" });
  if (error) return failed("We couldn't add this roadmap. Please try again.");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function setRoadmapStatus(rawRoadmapId: number, rawStatus: "active" | "paused" | "completed"): Promise<ActionResult> {
  const id = resourceId.safeParse(rawRoadmapId);
  const status = enrollmentStatus.safeParse(rawStatus);
  if (!id.success || !status.success) return failed("Invalid roadmap update.");
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;
  const { data, error } = await supabase
    .from("user_roadmaps")
    .update({ status: status.data, completed_at: status.data === "completed" ? new Date().toISOString() : null })
    .eq("user_id", userId)
    .eq("roadmap_id", id.data)
    .select("roadmap_id");
  if (error || !data?.length) return failed("We couldn't update this roadmap. Please try again.");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function leaveRoadmap(rawRoadmapId: number): Promise<ActionResult> {
  const id = resourceId.safeParse(rawRoadmapId);
  if (!id.success) return failed("Unknown roadmap.");
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;
  const { error } = await supabase.from("user_roadmaps").delete().eq("user_id", userId).eq("roadmap_id", id.data);
  if (error) return failed("We couldn't remove this roadmap. Please try again.");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function setMilestone(rawStageId: number, done: boolean): Promise<ActionResult> {
  const id = resourceId.safeParse(rawStageId);
  if (!id.success) return failed("Unknown stage.");
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;
  const { error } = done
    ? await supabase.from("learning_milestones").upsert({ user_id: userId, stage_id: id.data }, { onConflict: "user_id,stage_id", ignoreDuplicates: true })
    : await supabase.from("learning_milestones").delete().eq("user_id", userId).eq("stage_id", id.data);
  if (error) return failed("We couldn't update this stage. Please try again.");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse({
    displayName: form.get("displayName"),
    headline: form.get("headline") ?? "",
    bio: form.get("bio") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  const { supabase, userId } = await authed();
  if (!userId) return { ok: false, message: "Your session has ended. Sign in again." };

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, headline: parsed.data.headline, bio: parsed.data.bio })
    .eq("id", userId)
    .select("id");
  if (error || !data?.length) return { ok: false, message: "We couldn't save your profile. Please try again." };
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Profile saved." };
}

/** Record the storage path of an avatar the browser just uploaded to the user's own folder. */
export async function saveAvatarPath(path: string | null): Promise<ActionResult> {
  const { supabase, userId } = await authed();
  if (!userId) return signedOut;
  if (path !== null && !new RegExp(`^${userId}/[\\w.-]+$`).test(path)) return failed("Invalid avatar path.");

  const { data: current } = await supabase.from("profiles").select("avatar_path").eq("id", userId).single();
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId);
  if (error) return failed("We couldn't save your photo. Please try again.");
  if (current?.avatar_path && current.avatar_path !== path) {
    await supabase.storage.from("avatars").remove([current.avatar_path]);
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
