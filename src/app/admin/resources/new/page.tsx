import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { ResourceForm } from "@/components/admin/resource-form";
import { requireStaff } from "@/lib/auth/session";
import { getTaxonomy } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "New resource" };

export default function NewResourcePage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin/resources", label: "Resources" }, { label: "New" }]} />
      <DashboardHeading title="New resource" description="Link to the original publisher. Every new link is verified when you save." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  await requireStaff();
  const taxonomy = await getTaxonomy();
  return (
    <ResourceForm
      taxonomy={taxonomy}
      defaults={{ slug: "", title: "", description: "", url: "", department_id: null, subcategory_id: null, level: "beginner", type: "documentation", publisher: "", pricing: "unknown", source_kind: "community", language: "English", duration_label: "", status: "draft", is_featured: false, curator_note: "", technology_ids: [] }}
    />
  );
}
