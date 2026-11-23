import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, BookmarkIcon, CheckCircle2Icon, CircleDashedIcon, FlagIcon, RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { ResourceRow } from "@/components/catalog/resource-row";
import { DashboardHeading, HistoryList, RoadmapProgressCard, StatCard } from "@/components/dashboard/shared";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSummary, getProfile } from "@/lib/learner/queries";

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<CardGridSkeleton count={4} />}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  const user = await requireUser("/dashboard");
  const [params, profile, summary] = await Promise.all([searchParams, getProfile(user.id), getDashboardSummary(user.id)]);
  const firstName = profile.displayName.split(" ")[0] || "there";
  const notice =
    params.welcome ? "Your account is ready. Pick a roadmap to get started." :
    params.password === "updated" ? "Your password has been updated." :
    params.denied ? "You don't have access to that area." : null;

  return (
    <div className="space-y-10">
      {notice && <p role="status" className="rounded-lg border bg-card px-4 py-3 text-sm">{notice}</p>}
      <DashboardHeading
        title={`Welcome back, ${firstName}`}
        description={summary.counts.completedThisWeek ? `You completed ${summary.counts.completedThisWeek} resource${summary.counts.completedThisWeek === 1 ? "" : "s"} this week. Keep it up.` : "Here's where you left off."}
      />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="In progress" value={summary.counts.inProgress} icon={CircleDashedIcon} />
        <StatCard label="Completed" value={summary.counts.completed} icon={CheckCircle2Icon} />
        <StatCard label="Roadmaps" value={summary.counts.roadmaps} icon={RouteIcon} hint={`${summary.counts.milestones} stage${summary.counts.milestones === 1 ? "" : "s"} done`} />
        <StatCard label="Saved" value={summary.counts.saved} icon={BookmarkIcon} />
      </dl>

      <section aria-labelledby="roadmaps-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="roadmaps-heading" className="text-lg font-semibold tracking-tight">Your roadmaps</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/roadmaps">View all <ArrowRightIcon /></Link></Button>
        </div>
        {summary.roadmaps.length ? (
          <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summary.roadmaps.map((r) => <li key={r.id}><RoadmapProgressCard roadmap={r} /></li>)}
          </ul>
        ) : (
          <EmptyState className="mt-4" icon={RouteIcon} title="No roadmap yet" description="Roadmaps give you a structured path with stages you can tick off." action={<Button asChild><Link href="/roadmaps">Choose a roadmap</Link></Button>} />
        )}
      </section>

      <div className="grid gap-10 xl:grid-cols-[1fr_20rem]">
        <section aria-labelledby="continue-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="continue-heading" className="text-lg font-semibold tracking-tight">Continue learning</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/progress">All progress <ArrowRightIcon /></Link></Button>
          </div>
          {summary.continueLearning.length ? (
            <ul className="mt-4 space-y-2">
              {summary.continueLearning.map((r) => <li key={r.id}><ResourceRow resource={r} /></li>)}
            </ul>
          ) : (
            <EmptyState className="mt-4" icon={CircleDashedIcon} title="Nothing in progress" description="Mark a resource as “In progress” and it will appear here." action={<Button asChild variant="outline"><Link href="/library">Browse the library</Link></Button>} />
          )}
        </section>

        <section aria-labelledby="activity-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="activity-heading" className="text-lg font-semibold tracking-tight">Recent activity</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/history">History</Link></Button>
          </div>
          <div className="surface mt-4 p-3">
            {summary.history.length ? <HistoryList events={summary.history} /> : <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground"><FlagIcon className="size-4" aria-hidden="true" />Your activity will show up here.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
