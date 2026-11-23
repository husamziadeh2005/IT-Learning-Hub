import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageSkeleton, SectionHeading } from "@/components/catalog/states";
import { RoadmapCard } from "@/components/catalog/cards";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { ResourceBrowser } from "@/components/catalog/resource-browser";
import { getDepartment, getDepartmentSlugs } from "@/lib/catalog/queries";
import { accent, LEVELS } from "@/lib/catalog/labels";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getDepartmentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/departments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const department = await getDepartment(slug);
  if (!department) return { title: "Department not found" };
  return { title: department.name, description: department.tagline, alternates: { canonical: `/departments/${slug}` } };
}

export default function DepartmentPage({ params }: PageProps<"/departments/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DepartmentView params={params} />
    </Suspense>
  );
}

async function DepartmentView({ params }: { params: PageProps<"/departments/[slug]">["params"] }) {
  const { slug } = await params;
  const department = await getDepartment(slug);
  if (!department) notFound();
  const a = accent(department.accent);

  return (
    <>
      <section className="relative border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-page py-12 sm:py-16">
          <Breadcrumbs items={[{ href: "/explore", label: "Explore" }, { label: department.name }]} />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className={cn("grid size-12 place-items-center rounded-xl", a.soft, a.text)}>
                <CatalogIcon name={department.icon} className="size-6" />
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{department.name}</h1>
              <p className="mt-3 text-lg text-foreground/80 text-pretty">{department.tagline}</p>
              <p className="prose-body mt-4 max-w-2xl">{department.description}</p>
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:max-w-md lg:w-96" aria-label="Resources by level">
              {LEVELS.map((l) => (
                <li key={l.value}>
                  <Link href={`/library?department=${department.slug}&level=${l.value}`} className="surface-interactive block px-4 py-3">
                    <span className="eyebrow block">{l.label}</span>
                    <span className="mt-1 block text-2xl font-semibold tabular-nums">{department.levelCounts[l.value]}<span className="sr-only"> resources</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container-page py-12 sm:py-16">
        <section aria-labelledby="subcategories-heading">
          <SectionHeading eyebrow="Structure" title={<span id="subcategories-heading">Subcategories &amp; technologies</span>} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {department.subcategories.map((sub) => (
              <article key={sub.id} className="surface p-5 sm:p-6">
                <h3 className="text-lg font-semibold tracking-tight">{sub.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{sub.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {sub.technologies.map((t) => (
                    <li key={t.id}>
                      <Link href={`/technologies/${t.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium hover:border-foreground/25 hover:bg-muted">
                        <CatalogIcon name={t.icon} className="size-4 text-muted-foreground" />
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {department.roadmaps.length > 0 && (
          <section className="mt-16" aria-labelledby="paths-heading">
            <SectionHeading eyebrow="Learning paths" title={<span id="paths-heading">Roadmaps in {department.name}</span>} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {department.roadmaps.map((r) => <li key={r.id}><RoadmapCard roadmap={r} /></li>)}
            </ul>
          </section>
        )}

        <section className="mt-16" aria-labelledby="resources-heading">
          <SectionHeading
            eyebrow="Recommended resources"
            title={<span id="resources-heading">Every {department.name} resource</span>}
            description="Filter by difficulty, type and price. Featured picks come first."
            action={
              <Button asChild variant="outline">
                <Link href={`/library?department=${department.slug}`}>Search in library <ArrowRightIcon /></Link>
              </Button>
            }
          />
          <div className="mt-8">
            <ResourceBrowser resources={department.resources} />
          </div>
        </section>
      </div>
    </>
  );
}
