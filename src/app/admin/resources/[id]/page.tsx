import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { ResourceForm } from "@/components/admin/resource-form";
import { ActionButton } from "@/components/admin/admin-ui";
import { UrlStatusBadge } from "@/components/admin/url-status-badge";
import { requireStaff } from "@/lib/auth/session";
import { getAdminResource, getTaxonomy } from "@/lib/admin/queries";
import { verifyResourceUrl } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Edit resource" };

export default function EditResourcePage({ params, searchParams }: PageProps<"/admin/resources/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: Pick<PageProps<"/admin/resources/[id]">, "params" | "searchParams">) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const resourceId = Number(id);
  if (!Number.isInteger(resourceId) || resourceId <= 0) notFound();
  const [resource, taxonomy] = await Promise.all([getAdminResource(resourceId), getTaxonomy()]);
  if (!resource) notFound();
  const verify = verifyResourceUrl.bind(null, resource.id);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin/resources", label: "Resources" }, { label: resource.title }]} />
      {sp.created && <p role="status" className="rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm">Resource created.</p>}
      <DashboardHeading
        title="Edit resource"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {resource.url ? <UrlStatusBadge status={resource.url_status} httpStatus={resource.url_http_status} checkedAt={resource.url_checked_at} /> : "No URL yet"}
            {resource.url_checked_at && <span className="text-xs">Last checked {new Date(resource.url_checked_at).toLocaleString("en-GB")}</span>}
          </span>
        }
        action={
          <div className="flex flex-wrap gap-2">
            {resource.url && <ActionButton action={verify} size="default"><RefreshCwIcon /> Re-check link</ActionButton>}
            {resource.status === "published" && (
              <Button asChild variant="ghost"><Link href={`/resources/${resource.slug}`} target="_blank">View live <ArrowUpRightIcon /></Link></Button>
            )}
          </div>
        }
      />
      <ResourceForm
        taxonomy={taxonomy}
        defaults={{
          id: resource.id,
          slug: resource.slug,
          title: resource.title,
          description: resource.description,
          url: resource.url,
          department_id: resource.department_id,
          subcategory_id: resource.subcategory_id,
          level: resource.level,
          type: resource.type,
          publisher: resource.publisher,
          pricing: resource.pricing,
          source_kind: resource.source_kind,
          language: resource.language,
          duration_label: resource.duration_label,
          status: resource.status,
          is_featured: resource.is_featured,
          curator_note: resource.curator_note,
          technology_ids: resource.resource_technologies.map((rt) => rt.technology_id),
        }}
      />
    </div>
  );
}
