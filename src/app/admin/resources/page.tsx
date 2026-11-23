import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { ResourceRowActions } from "@/components/admin/resource-row-actions";
import { UrlStatusBadge } from "@/components/admin/url-status-badge";
import { requireStaff } from "@/lib/auth/session";
import { getTaxonomy, listAdminResources } from "@/lib/admin/queries";
import { CONTENT_STATUSES, levelLabel, statusLabel, typeLabel, URL_STATUSES } from "@/lib/catalog/labels";

export const metadata: Metadata = { title: "Resources" };

export default function AdminResourcesPage({ searchParams }: PageProps<"/admin/resources">) {
  return (
    <div className="space-y-6">
      <DashboardHeading title="Resources" description="Create, edit, verify and publish learning resources." action={<Button asChild><Link href="/admin/resources/new"><PlusIcon /> New resource</Link></Button>} />
      <Suspense fallback={<CardGridSkeleton count={3} />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

async function Content({ searchParams }: { searchParams: PageProps<"/admin/resources">["searchParams"] }) {
  const user = await requireStaff();
  const params = await searchParams;
  const filters = { q: one(params.q)?.slice(0, 100), status: one(params.status), url: one(params.url), department: one(params.department), page: Number(one(params.page)) || 1 };
  const [{ rows, total, page, pageCount }, taxonomy] = await Promise.all([listAdminResources(filters), getTaxonomy()]);
  const qs = (p: number) => {
    const s = new URLSearchParams(Object.entries({ ...filters, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `?${s}`;
  };

  return (
    <>
      <Form action="/admin/resources" className="surface grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_12rem_auto]">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={filters.q} placeholder="Search title, publisher or slug" className="h-10 rounded-lg border bg-background px-3 text-sm sm:col-span-2 lg:col-span-1" />
        <select name="status" defaultValue={filters.status ?? ""} aria-label="Status" className="h-10 rounded-lg border bg-background px-3 text-sm">
          <option value="">Any status</option>
          {CONTENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select name="url" defaultValue={filters.url ?? ""} aria-label="Link status" className="h-10 rounded-lg border bg-background px-3 text-sm">
          <option value="">Any link status</option>
          {URL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select name="department" defaultValue={filters.department ?? ""} aria-label="Department" className="h-10 rounded-lg border bg-background px-3 text-sm">
          <option value="">All departments</option>
          {taxonomy.departments.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">Filter</Button>
          <Button asChild variant="ghost"><Link href="/admin/resources">Reset</Link></Button>
        </div>
      </Form>

      <p className="text-sm text-muted-foreground" aria-live="polite">{total} resource{total === 1 ? "" : "s"}</p>

      {rows.length === 0 ? (
        <EmptyState title="No resources match" description="Change the filters or create a new resource." />
      ) : (
        <>
          {/* Table on md+ */}
          <div className="surface hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-0 whitespace-normal">
                      <Link href={`/admin/resources/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.publisher} · {r.departments?.name} · {typeLabel(r.type)} · {levelLabel(r.level)}</p>
                    </TableCell>
                    <TableCell><span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{statusLabel(r.status)}</span></TableCell>
                    <TableCell>{r.url ? <UrlStatusBadge status={r.url_status} httpStatus={r.url_http_status} checkedAt={r.url_checked_at} /> : <span className="text-xs text-muted-foreground">No URL</span>}</TableCell>
                    <TableCell><ResourceRowActions id={r.id} title={r.title} status={r.status} hasUrl={Boolean(r.url)} canDelete={user.isAdmin} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Cards on phones */}
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id} className="surface p-4">
                <Link href={`/admin/resources/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.publisher} · {r.departments?.name}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{statusLabel(r.status)}</span>
                    {r.url && <UrlStatusBadge status={r.url_status} httpStatus={r.url_http_status} checkedAt={r.url_checked_at} />}
                  </div>
                  <ResourceRowActions id={r.id} title={r.title} status={r.status} hasUrl={Boolean(r.url)} canDelete={user.isAdmin} />
                </div>
              </li>
            ))}
          </ul>
          {pageCount > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between">
              {page > 1 ? <Button asChild variant="outline"><Link href={qs(page - 1)}><ChevronLeftIcon /> Previous</Link></Button> : <span />}
              <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
              {page < pageCount ? <Button asChild variant="outline"><Link href={qs(page + 1)}>Next <ChevronRightIcon /></Link></Button> : <span />}
            </nav>
          )}
        </>
      )}
    </>
  );
}
