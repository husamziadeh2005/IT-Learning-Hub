import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { RoadmapForm, StagesManager } from "@/components/admin/roadmap-forms";
import { requireStaff } from "@/lib/auth/session";
import { getAdminRoadmap, getResourceOptions, getTaxonomy } from "@/lib/admin/queries";
import type { Certification } from "@/lib/catalog/types";

export const metadata: Metadata = { title: "Edit roadmap" };

export default function EditRoadmapPage({ params, searchParams }: PageProps<"/admin/roadmaps/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: Pick<PageProps<"/admin/roadmaps/[id]">, "params" | "searchParams">) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const roadmapId = Number(id);
  if (!Number.isInteger(roadmapId) || roadmapId <= 0) notFound();
  const [roadmap, taxonomy, resources] = await Promise.all([getAdminRoadmap(roadmapId), getTaxonomy(), getResourceOptions()]);
  if (!roadmap) notFound();

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ href: "/admin/roadmaps", label: "Roadmaps" }, { label: roadmap.title }]} />
      {sp.created && <p role="status" className="rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm">Roadmap created. Now add its stages below.</p>}
      <DashboardHeading
        title={`Edit ${roadmap.title}`}
        action={roadmap.status === "published" ? <Button asChild variant="ghost"><Link href={`/roadmaps/${roadmap.slug}`} target="_blank">View live <ArrowUpRightIcon /></Link></Button> : undefined}
      />
      <RoadmapForm
        departments={taxonomy.departments}
        defaults={{
          id: roadmap.id,
          slug: roadmap.slug,
          title: roadmap.title,
          summary: roadmap.summary,
          description: roadmap.description,
          department_id: roadmap.department_id,
          level: roadmap.level,
          estimated_duration: roadmap.estimated_duration,
          prerequisites: roadmap.prerequisites,
          outcomes: roadmap.outcomes,
          certifications: (roadmap.certifications as unknown as Certification[]) ?? [],
          icon: roadmap.icon,
          is_featured: roadmap.is_featured,
          status: roadmap.status,
          sort_order: roadmap.sort_order,
        }}
      />
      <StagesManager
        roadmapId={roadmap.id}
        options={{ technologies: taxonomy.technologies, resources }}
        stages={roadmap.roadmap_stages.map((s) => ({
          id: s.id,
          position: s.position,
          title: s.title,
          summary: s.summary,
          skills: s.skills,
          projects: (s.projects as unknown as { title: string; description: string }[]) ?? [],
          estimated_duration: s.estimated_duration,
          technology_ids: s.roadmap_stage_technologies.map((t) => t.technology_id),
          resources: s.roadmap_resources,
        }))}
      />
    </div>
  );
}
