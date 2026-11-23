import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GaugeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { ResourceRow } from "@/components/catalog/resource-row";
import { DashboardHeading } from "@/components/dashboard/shared";
import { requireUser } from "@/lib/auth/session";
import { getProgressResources } from "@/lib/learner/queries";

export const metadata: Metadata = { title: "Learning progress" };

export default function ProgressPage() {
  return (
    <Suspense fallback={<CardGridSkeleton count={3} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser("/dashboard/progress");
  const progress = await getProgressResources(user.id);
  const inProgress = progress.filter((p) => p.status === "in_progress");
  const completed = progress.filter((p) => p.status === "completed").sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-10">
      <DashboardHeading title="Learning progress" description={`${inProgress.length} in progress · ${completed.length} completed`} />
      {progress.length === 0 ? (
        <EmptyState icon={GaugeIcon} title="No progress tracked yet" description="Open any resource and set it to “In progress” or “Completed”." action={<Button asChild><Link href="/library">Find something to learn</Link></Button>} />
      ) : (
        <>
          <section aria-labelledby="in-progress-heading">
            <h2 id="in-progress-heading" className="eyebrow">In progress · {inProgress.length}</h2>
            {inProgress.length ? (
              <ul className="mt-3 space-y-2">{inProgress.map((p) => <li key={p.resource.id}><ResourceRow resource={p.resource} /></li>)}</ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nothing in progress right now.</p>
            )}
          </section>
          <section aria-labelledby="completed-heading">
            <h2 id="completed-heading" className="eyebrow">Completed · {completed.length}</h2>
            {completed.length ? (
              <ul className="mt-3 space-y-2">
                {completed.map((p) => (
                  <li key={p.resource.id}>
                    <ResourceRow resource={p.resource} />
                    {p.completedAt && <p className="mt-1 pl-1 text-xs text-muted-foreground">Completed {fmt.format(new Date(p.completedAt))}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Finish a resource and it will be recorded here.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
