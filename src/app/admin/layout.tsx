import type { Metadata } from "next";
import { ShieldIcon } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

/**
 * Admin shell. Access is enforced by every page (requireStaff) and by every
 * Server Action and RLS policy — the layout itself renders no data.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="container-page grid flex-1 grid-cols-[minmax(0,1fr)] gap-6 py-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-3 hidden items-center gap-2 lg:flex"><ShieldIcon className="size-3.5" aria-hidden="true" /> Content admin</p>
          <AdminNav />
        </div>
        <main id="main" className="min-w-0 pb-16">{children}</main>
      </div>
    </div>
  );
}
