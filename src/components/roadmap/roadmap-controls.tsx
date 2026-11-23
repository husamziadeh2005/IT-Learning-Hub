"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, Loader2Icon, PauseIcon, PlayIcon, PlusIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLearner } from "@/components/learner/learner-provider";
import { cn } from "@/lib/utils";

export function RoadmapProgressPanel({ roadmapId, stageIds }: { roadmapId: number; stageIds: number[] }) {
  const { status, enrollments, milestones, enroll, updateEnrollment } = useLearner();
  const [busy, setBusy] = useState(false);
  const enrollment = enrollments.get(roadmapId);
  const done = stageIds.filter((id) => milestones.has(id)).length;
  const percent = stageIds.length ? Math.round((done / stageIds.length) * 100) : 0;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  if (status === "loading") return <div className="h-[7.5rem] animate-pulse rounded-xl bg-muted" aria-label="Loading your progress" />;

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{enrollment ? "Your progress" : "Track this roadmap"}</p>
        <p className="font-mono text-sm tabular-nums text-muted-foreground">{done}/{stageIds.length} stages</p>
      </div>
      <Progress value={percent} className="mt-3 h-2" aria-label={`${percent}% of stages completed`} />
      <div className="mt-4 flex flex-wrap gap-2">
        {!enrollment ? (
          <Button onClick={() => run(() => enroll(roadmapId))} disabled={busy} className="w-full">
            {busy ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
            {status === "authenticated" ? "Start this roadmap" : "Sign in to track progress"}
          </Button>
        ) : enrollment === "completed" ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-success"><TrophyIcon className="size-4" aria-hidden="true" /> Roadmap completed</p>
        ) : (
          <>
            {percent === 100 && (
              <Button onClick={() => run(() => updateEnrollment(roadmapId, "completed"))} disabled={busy}>
                <TrophyIcon /> Mark roadmap complete
              </Button>
            )}
            {enrollment === "active" ? (
              <Button variant="outline" onClick={() => run(() => updateEnrollment(roadmapId, "paused"))} disabled={busy}><PauseIcon /> Pause</Button>
            ) : (
              <Button variant="outline" onClick={() => run(() => updateEnrollment(roadmapId, "active"))} disabled={busy}><PlayIcon /> Resume</Button>
            )}
            <Button asChild variant="ghost"><Link href="/dashboard/roadmaps">Dashboard</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}

export function StageNode({ stageId, position }: { stageId: number; position: number }) {
  const { milestones } = useLearner();
  const done = milestones.has(stageId);
  return (
    <span
      className={cn(
        "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-semibold transition-colors",
        done ? "border-success bg-success text-white" : "border-border bg-card text-muted-foreground",
      )}
      aria-hidden="true"
    >
      {done ? <CheckIcon className="size-4" /> : position}
    </span>
  );
}

export function StageCompleteToggle({ stageId, title }: { stageId: number; title: string }) {
  const { milestones, toggleMilestone, status } = useLearner();
  const [busy, setBusy] = useState(false);
  const done = milestones.has(stageId);
  return (
    <Button
      variant={done ? "secondary" : "outline"}
      size="sm"
      disabled={busy || status === "loading"}
      aria-pressed={done}
      aria-label={done ? `Mark “${title}” as not complete` : `Mark “${title}” as complete`}
      onClick={async () => {
        setBusy(true);
        await toggleMilestone(stageId);
        setBusy(false);
      }}
      className={cn(done && "text-success")}
    >
      {busy ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
      {done ? "Stage complete" : "Mark stage complete"}
    </Button>
  );
}
