import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { MyRoadmapCard } from "@/components/dashboard/my-roadmap-card";
import { requireUser } from "@/lib/auth/session";
import { getMyRoadmaps } from "@/lib/learner/queries";

export const metadata: Metadata = { title: "My roadmaps" };

export default function MyRoadmapsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton count={3} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser("/dashboard/roadmaps");
  const roadmaps = await getMyRoadmaps(user.id);
  const groups = [
    { title: "Active", items: roadmaps.filter((r) => r.status === "active") },
    { title: "Paused", items: roadmaps.filter((r) => r.status === "paused") },
    { title: "Completed", items: roadmaps.filter((r) => r.status === "completed") },
  ].filter((g) => g.items.length);

  return (
    <div className="space-y-8">
      <DashboardHeading title="My roadmaps" description="Track each stage, pause a path, or mark it complete." action={<Button asChild variant="outline"><Link href="/roadmaps">Find another roadmap</Link></Button>} />
      {groups.length === 0 ? (
        <EmptyState icon={RouteIcon} title="You haven't started a roadmap" description="Pick a career path and we'll lay out every stage for you." action={<Button asChild><Link href="/roadmaps">Browse roadmaps</Link></Button>} />
      ) : (
        groups.map((g) => (
          <section key={g.title} aria-labelledby={`g-${g.title}`}>
            <h2 id={`g-${g.title}`} className="eyebrow">{g.title} · {g.items.length}</h2>
            <ul className="mt-3 space-y-3">
              {g.items.map((r) => <li key={r.id}><MyRoadmapCard roadmap={r} /></li>)}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
