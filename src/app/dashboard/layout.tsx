import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Dashboard" }, robots: { index: false } };

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="container-page grid flex-1 grid-cols-[minmax(0,1fr)] gap-6 py-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <DashboardNav />
        </div>
        <main id="main" className="min-w-0 pb-16">{children}</main>
      </div>
    </div>
  );
}
