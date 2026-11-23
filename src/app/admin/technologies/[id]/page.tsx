import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { TechnologyForm } from "@/components/admin/technology-form";
import { requireStaff } from "@/lib/auth/session";
import { getAdminTechnology, getTaxonomy } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Edit technology" };

export default function EditTechnologyPage({ params, searchParams }: PageProps<"/admin/technologies/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: Pick<PageProps<"/admin/technologies/[id]">, "params" | "searchParams">) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const techId = Number(id);
  if (!Number.isInteger(techId) || techId <= 0) notFound();
  const [tech, taxonomy] = await Promise.all([getAdminTechnology(techId), getTaxonomy()]);
  if (!tech) notFound();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin/technologies", label: "Technologies" }, { label: tech.name }]} />
      {sp.created && <p role="status" className="rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm">Technology created.</p>}
      <DashboardHeading
        title={`Edit ${tech.name}`}
        action={tech.is_published ? <Button asChild variant="ghost"><Link href={`/technologies/${tech.slug}`} target="_blank">View live <ArrowUpRightIcon /></Link></Button> : undefined}
      />
      <TechnologyForm
        taxonomy={taxonomy}
        defaults={{
          id: tech.id,
          slug: tech.slug,
          name: tech.name,
          short_description: tech.short_description,
          description: tech.description,
          department_id: tech.department_id,
          official_url: tech.official_url,
          topics: tech.topics,
          icon: tech.icon,
          is_featured: tech.is_featured,
          is_published: tech.is_published,
          sort_order: tech.sort_order,
          subcategory_ids: tech.subcategory_technologies.map((s) => s.subcategory_id),
        }}
      />
    </div>
  );
}
