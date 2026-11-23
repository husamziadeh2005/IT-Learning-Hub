"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, Loader2Icon, MoreHorizontalIcon, PauseIcon, PlayIcon, TrashIcon, TrophyIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { StatusPill } from "./shared";
import { useLearner } from "@/components/learner/learner-provider";
import { leaveRoadmap } from "@/lib/actions/learner";
import type { MyRoadmap } from "@/lib/learner/queries";
import { cn } from "@/lib/utils";

export function MyRoadmapCard({ roadmap }: { roadmap: MyRoadmap }) {
  const { updateEnrollment, refresh } = useLearner();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };
  const leave = () =>
    run(async () => {
      const result = await leaveRoadmap(roadmap.id);
      if (!result.ok) return void toast.error(result.error);
      toast.success(`Removed ${roadmap.title}`);
      await refresh();
      router.refresh();
    });

  return (
    <article className="surface p-5">
      <div className="flex items-start gap-4">
        <span className="hidden size-11 shrink-0 place-items-center rounded-lg border bg-background sm:grid"><CatalogIcon name={roadmap.icon} className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold tracking-tight"><Link href={`/roadmaps/${roadmap.slug}`} className="hover:underline">{roadmap.title}</Link></h3>
            <StatusPill status={roadmap.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Started {new Date(roadmap.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {roadmap.estimatedDuration && <> · {roadmap.estimatedDuration}</>}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Options for ${roadmap.title}`} disabled={busy}>
              {busy ? <Loader2Icon className="animate-spin" /> : <MoreHorizontalIcon />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {roadmap.status !== "active" && <DropdownMenuItem onSelect={() => run(() => updateEnrollment(roadmap.id, "active"))}><PlayIcon /> {roadmap.status === "completed" ? "Reopen" : "Resume"}</DropdownMenuItem>}
            {roadmap.status === "active" && <DropdownMenuItem onSelect={() => run(() => updateEnrollment(roadmap.id, "paused"))}><PauseIcon /> Pause</DropdownMenuItem>}
            {roadmap.status !== "completed" && <DropdownMenuItem onSelect={() => run(() => updateEnrollment(roadmap.id, "completed"))}><TrophyIcon /> Mark complete</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmLeave(true)}><TrashIcon /> Remove from dashboard</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Progress value={roadmap.percent} className="h-2 flex-1" aria-label={`${roadmap.percent}% of stages complete`} />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{roadmap.percent}%</span>
      </div>
      <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {roadmap.stages.map((s) => (
          <li key={s.id}>
            <Link href={`/roadmaps/${roadmap.slug}#stage-${s.position}`} className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-sm hover:bg-muted">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border text-[0.65rem] font-mono", s.done ? "border-success bg-success text-white" : "text-muted-foreground")} aria-hidden="true">
                {s.done ? <CheckIcon className="size-3" /> : s.position}
              </span>
              <span className={cn("truncate", s.done && "text-muted-foreground line-through decoration-foreground/20")}>{s.title}</span>
              <span className="sr-only">{s.done ? "(complete)" : "(not complete)"}</span>
            </Link>
          </li>
        ))}
      </ol>

      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {roadmap.title}?</AlertDialogTitle>
            <AlertDialogDescription>It will disappear from your dashboard. Stages you completed stay recorded, so you can pick it up again later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={leave}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
