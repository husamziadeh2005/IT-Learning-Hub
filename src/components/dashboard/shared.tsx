import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookmarkIcon, CheckCircle2Icon, FlagIcon, PlayIcon, RouteIcon, TrophyIcon } from "lucide-react";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { Progress } from "@/components/ui/progress";
import type { HistoryEvent, MyRoadmap } from "@/lib/learner/queries";
import { cn } from "@/lib/utils";

export function DashboardHeading({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: number | string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="surface p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function RoadmapProgressCard({ roadmap }: { roadmap: MyRoadmap }) {
  return (
    <Link href={`/roadmaps/${roadmap.slug}`} className="surface-interactive block p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background"><CatalogIcon name={roadmap.icon} className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{roadmap.title}</p>
            <StatusPill status={roadmap.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {roadmap.nextStage ? <>Next: Stage {roadmap.nextStage.position} — {roadmap.nextStage.title}</> : "All stages complete"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={roadmap.percent} className="h-2 flex-1" aria-label={`${roadmap.percent}% complete`} />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{roadmap.doneCount}/{roadmap.stages.length}</span>
      </div>
    </Link>
  );
}

export function StatusPill({ status }: { status: "active" | "paused" | "completed" }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide",
        status === "active" && "bg-signal-soft text-signal-strong",
        status === "paused" && "bg-muted text-muted-foreground",
        status === "completed" && "bg-success/12 text-success",
      )}
    >
      {status === "active" ? "Active" : status === "paused" ? "Paused" : "Completed"}
    </span>
  );
}

const EVENT_META: Record<HistoryEvent["kind"], { icon: LucideIcon; verb: string; className: string }> = {
  completed: { icon: CheckCircle2Icon, verb: "Completed", className: "text-success" },
  started: { icon: PlayIcon, verb: "Started", className: "text-signal-strong" },
  saved: { icon: BookmarkIcon, verb: "Saved", className: "text-muted-foreground" },
  milestone: { icon: FlagIcon, verb: "Finished", className: "text-success" },
  enrolled: { icon: RouteIcon, verb: "Started roadmap", className: "text-signal-strong" },
  roadmap_completed: { icon: TrophyIcon, verb: "Completed roadmap", className: "text-success" },
};

export function HistoryList({ events }: { events: HistoryEvent[] }) {
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[1.05rem] before:top-3 before:w-px before:bg-border">
      {events.map((e, i) => {
        const meta = EVENT_META[e.kind];
        return (
          <li key={`${e.kind}-${e.href}-${e.at}-${i}`} className="relative flex gap-3 rounded-lg p-1.5">
            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border bg-card">
              <meta.icon className={cn("size-3.5", meta.className)} aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5 text-sm">
              <p className="leading-5">
                <span className="text-muted-foreground">{meta.verb} </span>
                <Link href={e.href} className="font-medium hover:underline">{e.title}</Link>
                {e.detail && <span className="text-muted-foreground"> · {e.detail}</span>}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground"><time dateTime={e.at}>{fmt.format(new Date(e.at))}</time></p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
