import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/catalog/hero-search";
import { LibraryResults } from "@/components/catalog/library-results";
import { CardGridSkeleton, EmptyState } from "@/components/catalog/states";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { searchCatalog } from "@/lib/catalog/queries";
import { parseFilters } from "@/lib/catalog/filters";

export const metadata: Metadata = {
  title: "Search",
  description: "Search departments, technologies, learning roadmaps and resources.",
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Search</p>
      <Suspense fallback={<div className="mt-4 h-14 max-w-2xl animate-pulse rounded-xl bg-muted" />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchContent({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  const q = filters.q ?? "";

  if (!q) {
    return (
      <>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What do you want to learn?</h1>
        <HeroSearch className="mt-6 max-w-2xl" />
        <EmptyState className="mt-10" title="Search the whole catalog" description="Find departments, technologies, roadmaps and resources in one place." />
      </>
    );
  }

  const catalog = await searchCatalog(q);
  const groups = [
    { title: "Technologies", items: catalog.technologies.map((t) => ({ href: `/technologies/${t.slug}`, title: t.name, subtitle: t.short_description, icon: t.icon })) },
    { title: "Roadmaps", items: catalog.roadmaps.map((r) => ({ href: `/roadmaps/${r.slug}`, title: r.title, subtitle: r.summary, icon: r.icon })) },
    { title: "Departments", items: catalog.departments.map((d) => ({ href: `/departments/${d.slug}`, title: d.name, subtitle: d.tagline, icon: d.icon })) },
  ].filter((g) => g.items.length);

  return (
    <>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Results for <span className="display text-signal-strong">“{q}”</span>
      </h1>
      <HeroSearch className="mt-6 max-w-2xl" defaultValue={q} size="md" />

      {groups.length > 0 && (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {groups.map((g) => (
            <section key={g.title} aria-labelledby={`g-${g.title}`}>
              <h2 id={`g-${g.title}`} className="eyebrow">{g.title}</h2>
              <ul className="mt-3 space-y-2">
                {g.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="surface-interactive flex items-center gap-3 p-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-background"><CatalogIcon name={item.icon} className="size-4" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <section className="mt-12" aria-labelledby="resources-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="resources-heading" className="text-xl font-semibold tracking-tight">Resources</h2>
          <Button asChild variant="outline"><Link href={`/library?q=${encodeURIComponent(q)}`}>Refine with filters <ArrowRightIcon /></Link></Button>
        </div>
        <Suspense fallback={<CardGridSkeleton />}>
          <LibraryResults filters={filters} basePath="/search" />
        </Suspense>
      </section>
    </>
  );
}
