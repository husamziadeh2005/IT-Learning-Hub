import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/catalog/states";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { DashboardHeading } from "@/components/dashboard/shared";
import { ActionButton } from "@/components/admin/admin-ui";
import { requireStaff } from "@/lib/auth/session";
import { listAdminTechnologies } from "@/lib/admin/queries";
import { deleteTechnology } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Technologies" };

export default function AdminTechnologiesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeading title="Technologies & topics" description="Each has its own page with a curriculum outline and resources." action={<Button asChild><Link href="/admin/technologies/new"><PlusIcon /> New technology</Link></Button>} />
      <Suspense fallback={<CardGridSkeleton />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const user = await requireStaff();
  const techs = await listAdminTechnologies();
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {techs.map((t) => (
        <li key={t.id} className="surface flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background"><CatalogIcon name={t.icon} className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 truncate font-medium">
              {t.name}
              {!t.is_published && <span className="rounded bg-muted px-1.5 text-[0.65rem] font-semibold uppercase text-muted-foreground">Hidden</span>}
              {t.is_featured && <span className="rounded bg-signal-soft px-1.5 text-[0.65rem] font-semibold uppercase text-signal-strong">Featured</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{t.departments?.name} · {t.resource_technologies[0]?.count ?? 0} resources</p>
          </div>
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${t.name}`}><Link href={`/admin/technologies/${t.id}`}><PencilIcon /></Link></Button>
          {user.isAdmin && (
            <ActionButton action={deleteTechnology.bind(null, t.id)} variant="ghost" size="icon-sm" ariaLabel={`Delete ${t.name}`} className="text-destructive" confirm={{ title: `Delete ${t.name}?`, description: "Its links to resources and roadmap stages are removed. Resources themselves are kept." }}>
              <TrashIcon />
            </ActionButton>
          )}
        </li>
      ))}
    </ul>
  );
}
