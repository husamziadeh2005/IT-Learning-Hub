import type { Metadata } from "next";
import { Suspense } from "react";
import { CardGridSkeleton, SectionHeading } from "@/components/catalog/states";
import { LibraryFilterSidebar, LibrarySearchBar } from "@/components/catalog/library-filters";
import { LibraryResults } from "@/components/catalog/library-results";
import { getCatalogStats, getFilterOptions } from "@/lib/catalog/queries";
import { parseFilters } from "@/lib/catalog/filters";

export const metadata: Metadata = {
  title: "Resource library",
  description: "Search and filter every curated IT learning resource by department, technology, difficulty, type and price.",
  alternates: { canonical: "/library" },
};

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const stats = await getCatalogStats();
  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Library"
        title="Resource library"
        description={`${stats.resources} curated resources from trusted publishers — ${stats.free} of them completely free.`}
      />
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LibraryContent({ searchParams }: { searchParams: PageProps<"/library">["searchParams"] }) {
  const [params, options] = await Promise.all([searchParams, getFilterOptions()]);
  const filters = parseFilters(params);
  return (
    <div className="mt-8">
      <LibrarySearchBar filters={filters} options={options} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_1fr]">
        <LibraryFilterSidebar filters={filters} options={options} />
        <Suspense key={JSON.stringify(filters)} fallback={<CardGridSkeleton className="lg:grid-cols-2 xl:grid-cols-3" />}>
          <LibraryResults filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="mt-8">
      <div className="h-11 animate-pulse rounded-lg bg-muted" />
      <CardGridSkeleton className="mt-8" />
    </div>
  );
}
