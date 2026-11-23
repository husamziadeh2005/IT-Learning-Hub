import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { ResourceGrid } from "@/components/catalog/resource-card";
import { DashboardHeading } from "@/components/dashboard/shared";
import { requireUser } from "@/lib/auth/session";
import { getSavedResources } from "@/lib/learner/queries";

export const metadata: Metadata = { title: "Saved resources" };

export default function SavedPage() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser("/dashboard/saved");
  const saved = await getSavedResources(user.id);
  return (
    <div className="space-y-8">
      <DashboardHeading title="Saved resources" description={`${saved.length} bookmark${saved.length === 1 ? "" : "s"}, newest first.`} />
      {saved.length ? (
        <ResourceGrid resources={saved.map((s) => s.resource)} showDepartment className="lg:grid-cols-2 xl:grid-cols-3" />
      ) : (
        <EmptyState icon={BookmarkIcon} title="Nothing saved yet" description="Use the bookmark icon on any resource to keep it here for later." action={<Button asChild><Link href="/library">Browse the library</Link></Button>} />
      )}
    </div>
  );
}
