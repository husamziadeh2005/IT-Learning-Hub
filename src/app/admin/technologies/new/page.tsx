import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { TechnologyForm } from "@/components/admin/technology-form";
import { requireStaff } from "@/lib/auth/session";
import { getTaxonomy } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "New technology" };

export default function NewTechnologyPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin/technologies", label: "Technologies" }, { label: "New" }]} />
      <DashboardHeading title="New technology" />
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
    <TechnologyForm
      taxonomy={taxonomy}
      defaults={{ slug: "", name: "", short_description: "", description: "", department_id: null, official_url: "", topics: [], icon: "code", is_featured: false, is_published: false, sort_order: 0, subcategory_ids: [] }}
    />
  );
}
