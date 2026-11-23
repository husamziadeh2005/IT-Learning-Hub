import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { RoleToggle } from "@/components/admin/role-toggle";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <div className="space-y-6">
      <DashboardHeading title="Users & roles" description="Editors can create and edit content. Administrators can also delete content and manage roles." />
      <Suspense fallback={<CardGridSkeleton count={2} />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: { searchParams: PageProps<"/admin/users">["searchParams"] }) {
  const me = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : undefined;
  const users = await listUsers(q);
  return (
    <>
      <Form action="/admin/users" className="flex gap-2">
        <label htmlFor="user-q" className="sr-only">Search by name</label>
        <input id="user-q" name="q" defaultValue={q} placeholder="Search by display name" className="h-10 flex-1 rounded-lg border bg-card px-3 text-sm sm:max-w-sm" />
        <Button type="submit" variant="outline">Search</Button>
      </Form>
      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <ul className="surface divide-y">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{u.display_name || "Unnamed learner"} {u.id === me.id && <span className="text-xs font-normal text-muted-foreground">(you)</span>}</p>
                <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{u.headline ? ` · ${u.headline}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <RoleToggle userId={u.id} role="editor" active={u.roles.includes("editor")} />
                <RoleToggle userId={u.id} role="admin" active={u.roles.includes("admin")} disabled={u.id === me.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Email addresses are private to Supabase Auth and are intentionally not shown here.</p>
    </>
  );
}
