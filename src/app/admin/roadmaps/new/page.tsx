import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { RoadmapForm } from "@/components/admin/roadmap-forms";
import { requireStaff } from "@/lib/auth/session";
import { getTaxonomy } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "New roadmap" };

export default function NewRoadmapPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin/roadmaps", label: "Roadmaps" }, { label: "New" }]} />
      <DashboardHeading title="New roadmap" description="Create the roadmap first, then add its stages." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  await requireStaff();
  const { departments } = await getTaxonomy();
  return (
    <RoadmapForm
      departments={departments}
      defaults={{ slug: "", title: "", summary: "", description: "", department_id: null, level: "beginner", estimated_duration: "", prerequisites: [], outcomes: [], certifications: [], icon: "route", is_featured: false, status: "draft", sort_order: 0 }}
    />
  );
}
