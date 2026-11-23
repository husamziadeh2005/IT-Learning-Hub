"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/env";
import {
  enrollInRoadmap,
  setBookmark,
  setMilestone,
  setProgress,
  setRoadmapStatus,
  type ActionResult,
} from "@/lib/actions/learner";

/**
 * Personal learning state for the signed-in user, loaded in the browser after
 * hydration. This keeps every public catalog page fully static and cacheable
 * while still showing each learner their own bookmarks and progress.
 *
 * Reads go straight to Supabase (RLS returns only the user's own rows).
 * Writes go through Server Actions; the UI updates optimistically and rolls
 * back with an error message if the database rejects the change.
 */
type ProgressStatus = "in_progress" | "completed";
type EnrollmentStatus = "active" | "paused" | "completed";

export interface LearnerUser {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  isStaff: boolean;
}

interface LearnerState {
  status: "loading" | "anonymous" | "authenticated";
  user: LearnerUser | null;
  bookmarks: Set<number>;
  progress: Map<number, ProgressStatus>;
  enrollments: Map<number, EnrollmentStatus>;
  milestones: Set<number>;
  toggleBookmark: (resourceId: number) => Promise<void>;
  updateProgress: (resourceId: number, status: ProgressStatus | null) => Promise<void>;
  enroll: (roadmapId: number) => Promise<void>;
  updateEnrollment: (roadmapId: number, status: EnrollmentStatus) => Promise<void>;
  toggleMilestone: (stageId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const LearnerContext = createContext<LearnerState | null>(null);

export function useLearner() {
  const ctx = useContext(LearnerContext);
  if (!ctx) throw new Error("useLearner must be used within <LearnerProvider>");
  return ctx;
}

export function LearnerProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const configured = Boolean(getSupabaseConfig());
  const [status, setStatus] = useState<LearnerState["status"]>(configured ? "loading" : "anonymous");
  const [user, setUser] = useState<LearnerUser | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [progress, setProgressMap] = useState<Map<number, ProgressStatus>>(new Map());
  const [enrollments, setEnrollments] = useState<Map<number, EnrollmentStatus>>(new Map());
  const [milestones, setMilestones] = useState<Set<number>>(new Set());
  const loadedFor = useRef<string | null>(null);

  const reset = useCallback(() => {
    loadedFor.current = null;
    setUser(null);
    setBookmarks(new Set());
    setProgressMap(new Map());
    setEnrollments(new Map());
    setMilestones(new Set());
    setStatus("anonymous");
  }, []);

  const load = useCallback(
    async (userId: string, email: string | null) => {
      const supabase = createClient();
      const [profile, roles, saved, prog, enrolled, done] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_path").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("bookmarks").select("resource_id"),
        supabase.from("user_progress").select("resource_id, status"),
        supabase.from("user_roadmaps").select("roadmap_id, status"),
        supabase.from("learning_milestones").select("stage_id"),
      ]);
      const avatarPath = profile.data?.avatar_path;
      setUser({
        id: userId,
        email,
        displayName: profile.data?.display_name || email?.split("@")[0] || "Learner",
        avatarUrl: avatarPath ? supabase.storage.from("avatars").getPublicUrl(avatarPath).data.publicUrl : null,
        isStaff: (roles.data ?? []).some((r) => r.role === "admin" || r.role === "editor"),
      });
      setBookmarks(new Set((saved.data ?? []).map((b) => b.resource_id)));
      setProgressMap(new Map((prog.data ?? []).map((p) => [p.resource_id, p.status])));
      setEnrollments(new Map((enrolled.data ?? []).map((e) => [e.roadmap_id, e.status])));
      setMilestones(new Set((done.data ?? []).map((m) => m.stage_id)));
      loadedFor.current = userId;
      setStatus("authenticated");
    },
    [],
  );

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const u = data.session?.user;
      if (u) void load(u.id, u.email ?? null);
      else reset();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      if (!u) return reset();
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || loadedFor.current !== u.id) void load(u.id, u.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [configured, load, reset]);

  // Sign-in and sign-out run in Server Actions, which set cookies without an
  // auth event in this tab. Re-read the session cookie after each navigation.
  const syncSession = useCallback(() => {
    if (!configured) return;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        const u = data.session?.user;
        if (u && loadedFor.current !== u.id) void load(u.id, u.email ?? null);
        else if (!u && loadedFor.current) reset();
      });
  }, [configured, load, reset]);

  const requireAuth = useCallback(() => {
    if (status === "authenticated") return true;
    toast("Create a free account to save your progress", {
      description: "Bookmarks, progress and roadmaps are stored securely in your account.",
      action: { label: "Sign in", onClick: () => router.push(`/login?next=${encodeURIComponent(location.pathname)}`) },
    });
    return false;
  }, [status, router]);

  const handle = useCallback(
    (result: ActionResult, rollback: () => void, success?: string) => {
      if (result.ok) {
        if (success) toast.success(success);
        // Dashboard pages render learner data on the server; refresh them.
        if (location.pathname.startsWith("/dashboard")) router.refresh();
        return;
      }
      rollback();
      toast.error(result.error);
      if (result.signedOut) reset();
    },
    [router, reset],
  );

  const toggleBookmark = useCallback(
    async (resourceId: number) => {
      if (!requireAuth()) return;
      const saved = !bookmarks.has(resourceId);
      const apply = (on: boolean) =>
        setBookmarks((prev) => {
          const next = new Set(prev);
          if (on) next.add(resourceId);
          else next.delete(resourceId);
          return next;
        });
      apply(saved);
      handle(await setBookmark(resourceId, saved), () => apply(!saved), saved ? "Saved to your library" : "Removed from saved");
    },
    [bookmarks, requireAuth, handle],
  );

  const updateProgress = useCallback(
    async (resourceId: number, next: ProgressStatus | null) => {
      if (!requireAuth()) return;
      const previous = progress.get(resourceId) ?? null;
      const apply = (value: ProgressStatus | null) =>
        setProgressMap((prev) => {
          const map = new Map(prev);
          if (value) map.set(resourceId, value);
          else map.delete(resourceId);
          return map;
        });
      apply(next);
      const message = next === "completed" ? "Marked as completed" : next === "in_progress" ? "Marked as in progress" : "Progress cleared";
      handle(await setProgress(resourceId, next), () => apply(previous), message);
    },
    [progress, requireAuth, handle],
  );

  const enroll = useCallback(
    async (roadmapId: number) => {
      if (!requireAuth()) return;
      const previous = enrollments.get(roadmapId);
      setEnrollments((prev) => new Map(prev).set(roadmapId, "active"));
      handle(
        await enrollInRoadmap(roadmapId),
        () =>
          setEnrollments((prev) => {
            const map = new Map(prev);
            if (previous) map.set(roadmapId, previous);
            else map.delete(roadmapId);
            return map;
          }),
        "Roadmap added to your dashboard",
      );
    },
    [enrollments, requireAuth, handle],
  );

  const updateEnrollment = useCallback(
    async (roadmapId: number, next: EnrollmentStatus) => {
      if (!requireAuth()) return;
      const previous = enrollments.get(roadmapId);
      setEnrollments((prev) => new Map(prev).set(roadmapId, next));
      handle(await setRoadmapStatus(roadmapId, next), () =>
        setEnrollments((prev) => {
          const map = new Map(prev);
          if (previous) map.set(roadmapId, previous);
          else map.delete(roadmapId);
          return map;
        }),
      );
    },
    [enrollments, requireAuth, handle],
  );

  const toggleMilestone = useCallback(
    async (stageId: number) => {
      if (!requireAuth()) return;
      const done = !milestones.has(stageId);
      const apply = (on: boolean) =>
        setMilestones((prev) => {
          const next = new Set(prev);
          if (on) next.add(stageId);
          else next.delete(stageId);
          return next;
        });
      apply(done);
      handle(await setMilestone(stageId, done), () => apply(!done), done ? "Stage completed — nice work" : "Stage marked as not complete");
    },
    [milestones, requireAuth, handle],
  );

  const refresh = useCallback(async () => {
    if (user) await load(user.id, user.email);
  }, [user, load]);

  const value = useMemo<LearnerState>(
    () => ({ status, user, bookmarks, progress, enrollments, milestones, toggleBookmark, updateProgress, enroll, updateEnrollment, toggleMilestone, refresh }),
    [status, user, bookmarks, progress, enrollments, milestones, toggleBookmark, updateProgress, enroll, updateEnrollment, toggleMilestone, refresh],
  );

  return (
    <LearnerContext value={value}>
      {/* usePathname is request data under Cache Components; keep it behind Suspense. */}
      <Suspense fallback={null}>
        <PathnameSync onChange={syncSession} />
      </Suspense>
      {children}
    </LearnerContext>
  );
}

function PathnameSync({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  useEffect(() => {
    onChange();
  }, [pathname, onChange]);
  return null;
}
