import type { Metadata } from "next";
import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/catalog/states";
import { DashboardHeading } from "@/components/dashboard/shared";
import { DepartmentPanel, NewDepartmentButton } from "@/components/admin/taxonomy-forms";
import { requireStaff } from "@/lib/auth/session";
import { getTaxonomy } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Departments" };

export default function AdminDepartmentsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton count={3} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireStaff();
  const { departments } = await getTaxonomy();
  return (
    <div className="space-y-6">
      <DashboardHeading title="Departments & subcategories" description="The top-level structure of the catalog." action={<NewDepartmentButton />} />
      <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {departments.map((d) => <li key={d.id}><DepartmentPanel department={d} isAdmin={user.isAdmin} /></li>)}
      </ul>
    </div>
  );
}
