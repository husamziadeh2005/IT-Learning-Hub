import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangleIcon, ArrowRightIcon, BlocksIcon, CheckCircle2Icon, ClockIcon, LibraryBigIcon, PlusIcon, RouteIcon, ShieldOffIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/catalog/states";
import { DashboardHeading, StatCard } from "@/components/dashboard/shared";
import { requireStaff } from "@/lib/auth/session";
import { getAdminOverview } from "@/lib/admin/queries";
import { statusLabel, urlStatus } from "@/lib/catalog/labels";

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<CardGridSkeleton count={4} />}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const user = await requireStaff();
  const [params, o] = await Promise.all([searchParams, getAdminOverview()]);

  return (
    <div className="space-y-10">
      {params.denied === "admin-only" && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">That section is limited to administrators.</p>}
      <DashboardHeading
        title="Content admin"
        description={`Signed in as ${user.isAdmin ? "administrator" : "editor"}. ${user.isAdmin ? "You can manage content and users." : "You can create and edit content; deleting and user management are admin-only."}`}
        action={<Button asChild><Link href="/admin/resources/new"><PlusIcon /> New resource</Link></Button>}
      />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Published" value={o.published} icon={CheckCircle2Icon} hint={`${o.draft} drafts · ${o.archived} archived`} />
        <StatCard label="Pending" value={o.pending} icon={ClockIcon} hint="Awaiting details" />
        <StatCard label="Broken links" value={o.broken} icon={AlertTriangleIcon} hint={`${o.unchecked} unchecked`} />
        <StatCard label="Bot-protected" value={o.blocked} icon={ShieldOffIcon} hint="Verify by hand" />
      </dl>

      <section aria-labelledby="attention-heading">
        <div className="flex items-center justify-between">
          <h2 id="attention-heading" className="text-lg font-semibold tracking-tight">Needs attention</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/admin/resources?status=pending">All pending <ArrowRightIcon /></Link></Button>
        </div>
        {o.attention.length ? (
          <ul className="surface mt-4 divide-y">
            {o.attention.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/admin/resources/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                  {r.curator_note && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.curator_note}</p>}
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
                  <span className="rounded-md bg-muted px-2 py-1 font-medium">{statusLabel(r.status)}</span>
                  {r.url && <span className="rounded-md border px-2 py-1">{urlStatus(r.url_status).label}</span>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nothing pending, no drafts and no broken links. 🎉</p>
        )}
      </section>

      <section aria-labelledby="manage-heading">
        <h2 id="manage-heading" className="text-lg font-semibold tracking-tight">Manage</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/admin/resources", label: "Resources", value: o.published + o.draft + o.pending + o.archived, icon: LibraryBigIcon },
            { href: "/admin/technologies", label: "Technologies", value: o.technologies, icon: BlocksIcon },
            { href: "/admin/roadmaps", label: "Roadmaps", value: o.roadmaps, icon: RouteIcon },
            { href: "/admin/users", label: "Users", value: o.users, icon: UsersIcon },
          ].map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="surface-interactive flex items-center justify-between p-4">
                <span className="flex items-center gap-3"><m.icon className="size-4 text-muted-foreground" aria-hidden="true" /><span className="font-medium">{m.label}</span></span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">{m.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
