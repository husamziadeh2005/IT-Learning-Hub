import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryIcon } from "lucide-react";
import { EmptyState } from "@/components/catalog/states";
import { DashboardHeading, HistoryList } from "@/components/dashboard/shared";
import { requireUser } from "@/lib/auth/session";
import { getHistory } from "@/lib/learner/queries";

export const metadata: Metadata = { title: "Learning history" };

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser("/dashboard/history");
  const events = await getHistory(user.id);
  const byMonth = new Map<string, typeof events>();
  const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
  for (const e of events) {
    const key = monthFmt.format(new Date(e.at));
    byMonth.set(key, [...(byMonth.get(key) ?? []), e]);
  }
  return (
    <div className="space-y-8">
      <DashboardHeading title="Learning history" description="Everything you've started, finished and saved." />
      {events.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No history yet" description="Your learning activity will be recorded here automatically." />
      ) : (
        [...byMonth.entries()].map(([month, items]) => (
          <section key={month} aria-labelledby={`m-${month}`}>
            <h2 id={`m-${month}`} className="eyebrow">{month}</h2>
            <div className="surface mt-3 p-3"><HistoryList events={items} /></div>
          </section>
        ))
      )}
    </div>
  );
}
