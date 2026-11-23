import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon, BookOpenCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, EmptyState, PageSkeleton, SectionHeading } from "@/components/catalog/states";
import { RoadmapCard } from "@/components/catalog/cards";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { ResourceBrowser } from "@/components/catalog/resource-browser";
import { getTechnology, getTechnologySlugs } from "@/lib/catalog/queries";
import { accent } from "@/lib/catalog/labels";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getTechnologySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/technologies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tech = await getTechnology(slug);
  if (!tech) return { title: "Technology not found" };
  return {
    title: `Learn ${tech.name}`,
    description: `${tech.short_description} Curated ${tech.name} documentation, courses and projects from beginner to advanced.`,
    alternates: { canonical: `/technologies/${slug}` },
  };
}

export default function TechnologyPage({ params }: PageProps<"/technologies/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TechnologyView params={params} />
    </Suspense>
  );
}

async function TechnologyView({ params }: { params: PageProps<"/technologies/[slug]">["params"] }) {
  const { slug } = await params;
  const tech = await getTechnology(slug);
  if (!tech) notFound();
  const a = accent(tech.department?.accent);
  const official = tech.resources.filter((r) => r.source_kind === "official").length;

  return (
    <>
      <section className="relative border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <Breadcrumbs
              items={[
                { href: "/explore", label: "Explore" },
                ...(tech.department ? [{ href: `/departments/${tech.department.slug}`, label: tech.department.name }] : []),
                { label: tech.name },
              ]}
            />
            <div className="flex items-center gap-4">
              <span className={cn("grid size-14 place-items-center rounded-xl border bg-card")}>
                <CatalogIcon name={tech.icon} className="size-7" />
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{tech.name}</h1>
                {tech.department && (
                  <p className={cn("mt-1 inline-flex items-center gap-2 text-sm", a.text)}>
                    <span className={cn("size-1.5 rounded-full", a.dot)} aria-hidden="true" />
                    {tech.department.name}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-lg text-foreground/85 text-pretty">{tech.short_description}</p>
            <p className="prose-body mt-3 max-w-2xl">{tech.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {tech.official_url && (
                <Button asChild size="lg">
                  <a href={tech.official_url} target="_blank" rel="noopener noreferrer">
                    Official documentation <ArrowUpRightIcon />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href={`/library?technology=${tech.slug}`}>Search {tech.name} resources</Link>
              </Button>
            </div>
          </div>

          {tech.topics.length > 0 && (
            <aside className="surface self-start p-5" aria-labelledby="curriculum-heading">
              <h2 id="curriculum-heading" className="flex items-center gap-2 font-semibold">
                <BookOpenCheckIcon className="size-4 text-signal-strong" aria-hidden="true" />
                What you&apos;ll learn
              </h2>
              <ol className="mt-4 space-y-2.5">
                {tech.topics.map((topic, i) => (
                  <li key={topic} className="flex gap-3 text-sm">
                    <span className="w-5 shrink-0 font-mono text-xs leading-5 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="leading-5">{topic}</span>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </section>

      <div className="container-page py-12 sm:py-16">
        <section aria-labelledby="resources-heading">
          <SectionHeading
            eyebrow="Learning material"
            title={<span id="resources-heading">{tech.resources.length} curated {tech.name} resources</span>}
            description={`${official} from official sources. Organised from beginner to advanced — start at the top and work down.`}
          />
          <div className="mt-8">
            {tech.resources.length ? (
              <ResourceBrowser resources={tech.resources} groupByLevel />
            ) : (
              <EmptyState title="No resources yet" description="Our curators are still assembling material for this topic." />
            )}
          </div>
        </section>

        {tech.roadmaps.length > 0 && (
          <section className="mt-16" aria-labelledby="roadmaps-heading">
            <SectionHeading eyebrow="Part of these roadmaps" title={<span id="roadmaps-heading">Learn {tech.name} as part of a path</span>} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tech.roadmaps.map((r) => <li key={r.id}><RoadmapCard roadmap={r} /></li>)}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
