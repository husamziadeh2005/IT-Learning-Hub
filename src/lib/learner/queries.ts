import "server-only";

import { createClient } from "@/lib/supabase/server";
import { RESOURCE_FIELDS, toResource, type RawResource } from "@/lib/catalog/queries";
import type { ResourceCardData } from "@/lib/catalog/types";
import type { Level } from "@/lib/catalog/labels";

/**
 * Per-learner reads. These use the cookie-bound client, so RLS returns only
 * the signed-in user's own rows — the userId argument is a filter for clarity
 * and index use, not the security boundary.
 */

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("display_name, headline, bio, avatar_path, created_at").eq("id", userId).maybeSingle();
  const avatarUrl = data?.avatar_path ? supabase.storage.from("avatars").getPublicUrl(data.avatar_path).data.publicUrl : null;
  return { displayName: data?.display_name ?? "", headline: data?.headline ?? "", bio: data?.bio ?? "", avatarPath: data?.avatar_path ?? null, avatarUrl, createdAt: data?.created_at ?? null };
}

export async function getSavedResources(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`created_at, resources(${RESOURCE_FIELDS}, status)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load saved resources: ${error.message}`);
  return (data as unknown as { created_at: string; resources: (RawResource & { status: string }) | null }[])
    .filter((b) => b.resources && b.resources.status === "published")
    .map((b) => ({ savedAt: b.created_at, resource: toResource(b.resources!) }));
}

export async function getProgressResources(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select(`status, started_at, completed_at, updated_at, resources(${RESOURCE_FIELDS}, status)`)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Could not load progress: ${error.message}`);
  return (data as unknown as {
    status: "in_progress" | "completed";
    started_at: string;
    completed_at: string | null;
    updated_at: string;
    resources: (RawResource & { status: string }) | null;
  }[])
    .filter((p) => p.resources && p.resources.status === "published")
    .map((p) => ({ status: p.status, startedAt: p.started_at, completedAt: p.completed_at, updatedAt: p.updated_at, resource: toResource(p.resources!) }));
}

export interface MyRoadmap {
  id: number;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  level: Level;
  estimatedDuration: string | null;
  status: "active" | "paused" | "completed";
  startedAt: string;
  completedAt: string | null;
  stages: { id: number; position: number; title: string; done: boolean }[];
  doneCount: number;
  percent: number;
  nextStage: { position: number; title: string } | null;
}

export async function getMyRoadmaps(userId: string): Promise<MyRoadmap[]> {
  const supabase = await createClient();
  const [enrolled, milestones] = await Promise.all([
    supabase
      .from("user_roadmaps")
      .select("status, started_at, completed_at, roadmaps(id, slug, title, summary, icon, level, estimated_duration, roadmap_stages(id, position, title))")
      .eq("user_id", userId)
      .order("started_at", { ascending: false }),
    supabase.from("learning_milestones").select("stage_id").eq("user_id", userId),
  ]);
  if (enrolled.error) throw new Error(`Could not load roadmaps: ${enrolled.error.message}`);
  const done = new Set((milestones.data ?? []).map((m) => m.stage_id));
  return enrolled.data
    .filter((e) => e.roadmaps)
    .map((e) => {
      const r = e.roadmaps!;
      const stages = [...r.roadmap_stages].sort((a, b) => a.position - b.position).map((s) => ({ ...s, done: done.has(s.id) }));
      const doneCount = stages.filter((s) => s.done).length;
      const next = stages.find((s) => !s.done) ?? null;
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        summary: r.summary,
        icon: r.icon,
        level: r.level,
        estimatedDuration: r.estimated_duration,
        status: e.status,
        startedAt: e.started_at,
        completedAt: e.completed_at,
        stages,
        doneCount,
        percent: stages.length ? Math.round((doneCount / stages.length) * 100) : 0,
        nextStage: next ? { position: next.position, title: next.title } : null,
      };
    });
}

export type HistoryEvent = {
  at: string;
  kind: "completed" | "started" | "saved" | "milestone" | "enrolled" | "roadmap_completed";
  title: string;
  href: string;
  detail?: string;
};

/** Learning history, derived from the learner's own records (no separate log table to drift). */
export async function getHistory(userId: string): Promise<HistoryEvent[]> {
  const supabase = await createClient();
  const [progress, saved, milestones, enrolled] = await Promise.all([
    supabase.from("user_progress").select("status, started_at, completed_at, resources(slug, title)").eq("user_id", userId),
    supabase.from("bookmarks").select("created_at, resources(slug, title)").eq("user_id", userId),
    supabase.from("learning_milestones").select("completed_at, roadmap_stages(position, title, roadmaps(slug, title))").eq("user_id", userId),
    supabase.from("user_roadmaps").select("started_at, completed_at, roadmaps(slug, title)").eq("user_id", userId),
  ]);
  const events: HistoryEvent[] = [];
  for (const p of progress.data ?? []) {
    if (!p.resources) continue;
    const href = `/resources/${p.resources.slug}`;
    events.push({ at: p.started_at, kind: "started", title: p.resources.title, href });
    if (p.completed_at) events.push({ at: p.completed_at, kind: "completed", title: p.resources.title, href });
  }
  for (const b of saved.data ?? []) if (b.resources) events.push({ at: b.created_at, kind: "saved", title: b.resources.title, href: `/resources/${b.resources.slug}` });
  for (const m of milestones.data ?? []) {
    const stage = m.roadmap_stages;
    if (stage?.roadmaps) events.push({ at: m.completed_at, kind: "milestone", title: `Stage ${stage.position}: ${stage.title}`, href: `/roadmaps/${stage.roadmaps.slug}#stage-${stage.position}`, detail: stage.roadmaps.title });
  }
  for (const e of enrolled.data ?? []) {
    if (!e.roadmaps) continue;
    events.push({ at: e.started_at, kind: "enrolled", title: e.roadmaps.title, href: `/roadmaps/${e.roadmaps.slug}` });
    if (e.completed_at) events.push({ at: e.completed_at, kind: "roadmap_completed", title: e.roadmaps.title, href: `/roadmaps/${e.roadmaps.slug}` });
  }
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

export async function getDashboardSummary(userId: string) {
  const [saved, progress, roadmaps, history] = await Promise.all([
    getSavedResources(userId),
    getProgressResources(userId),
    getMyRoadmaps(userId),
    getHistory(userId),
  ]);
  const completed = progress.filter((p) => p.status === "completed");
  const inProgress = progress.filter((p) => p.status === "in_progress");
  const weekAgo = Date.now() - 7 * 864e5;
  return {
    counts: {
      saved: saved.length,
      inProgress: inProgress.length,
      completed: completed.length,
      roadmaps: roadmaps.filter((r) => r.status !== "completed").length,
      milestones: roadmaps.reduce((n, r) => n + r.doneCount, 0),
      completedThisWeek: completed.filter((c) => c.completedAt && Date.parse(c.completedAt) > weekAgo).length,
    },
    continueLearning: inProgress.slice(0, 4).map((p) => p.resource),
    roadmaps: roadmaps.filter((r) => r.status !== "completed").slice(0, 3),
    recentSaved: saved.slice(0, 3).map((s) => s.resource) as ResourceCardData[],
    history: history.slice(0, 8),
  };
}
