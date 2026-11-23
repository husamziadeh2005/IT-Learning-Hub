import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { ActionButton } from "@/components/admin/admin-ui";
import { requireStaff } from "@/lib/auth/session";
import { listAdminRoadmaps } from "@/lib/admin/queries";
import { deleteRoadmap } from "@/lib/actions/admin";
import { levelLabel, statusLabel } from "@/lib/catalog/labels";

export const metadata: Metadata = { title: "Roadmaps" };

export default function AdminRoadmapsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeading title="Roadmaps" description="Career paths made of ordered stages." action={<Button asChild><Link href="/admin/roadmaps/new"><PlusIcon /> New roadmap</Link></Button>} />
      <Suspense fallback={<CardGridSkeleton count={3} />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const user = await requireStaff();
  const roadmaps = await listAdminRoadmaps();
  return (
    <ul className="surface divide-y">
      {roadmaps.map((r) => (
        <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Link href={`/admin/roadmaps/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
            <p className="text-xs text-muted-foreground">{r.departments?.name ?? "Cross-department"} · {levelLabel(r.level)} · {r.roadmap_stages[0]?.count ?? 0} stages</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{statusLabel(r.status)}</span>
            {r.is_featured && <span className="rounded-md bg-signal-soft px-2 py-0.5 text-xs font-medium text-signal-strong">Featured</span>}
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${r.title}`}><Link href={`/admin/roadmaps/${r.id}`}><PencilIcon /></Link></Button>
            {user.isAdmin && (
              <ActionButton action={deleteRoadmap.bind(null, r.id)} variant="ghost" size="icon-sm" className="text-destructive" ariaLabel={`Delete ${r.title}`} confirm={{ title: `Delete ${r.title}?`, description: "All its stages and every learner's enrolment and milestones for it will be removed." }}>
                <TrashIcon />
              </ActionButton>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
