import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon, RouteIcon, ShieldCheckIcon, ShieldQuestionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageSkeleton, SectionHeading } from "@/components/catalog/states";
import { LevelMeter, OfficialBadge, PricingBadge, TypeLabel } from "@/components/catalog/badges";
import { ResourceGrid } from "@/components/catalog/resource-card";
import { BookmarkButton, ProgressControl } from "@/components/learner/learner-actions";
import { getResource, getResourceSlugs } from "@/lib/catalog/queries";
import { PRICING } from "@/lib/catalog/labels";

export async function generateStaticParams() {
  const slugs = await getResourceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) return { title: "Resource not found" };
  return { title: r.title, description: r.description.slice(0, 160), alternates: { canonical: `/resources/${slug}` } };
}

export default function ResourcePage({ params }: PageProps<"/resources/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResourceView params={params} />
    </Suspense>
  );
}

async function ResourceView({ params }: { params: PageProps<"/resources/[slug]">["params"] }) {
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) notFound();
  const verified = r.url_status === "ok" || r.url_status === "redirected";
  const checked = r.url_checked_at ? new Date(r.url_checked_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div className="container-page py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/library", label: "Library" },
          ...(r.department ? [{ href: `/departments/${r.department.slug}`, label: r.department.name }] : []),
          { label: r.title },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <TypeLabel type={r.type} className="text-sm" />
            <LevelMeter level={r.level} className="text-sm" />
            <PricingBadge pricing={r.pricing} />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{r.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
            by <span className="font-medium text-foreground">{r.publisher}</span>
            {r.source_kind === "official" && <OfficialBadge className="text-sm" />}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/85 text-pretty">{r.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {r.url && (
              <Button asChild size="lg" className="h-auto min-h-11 max-w-full shrink whitespace-normal py-2 text-left">
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  Open on {r.publisher} <ArrowUpRightIcon />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            )}
            <BookmarkButton resourceId={r.id} title={r.title} variant="full" />
            <ProgressControl resourceId={r.id} />
          </div>

          {r.technologies.length > 0 && (
            <div className="mt-10">
              <h2 className="eyebrow">Technologies</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {r.technologies.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/technologies/${t.slug}`} className="inline-flex min-h-10 items-center rounded-lg border bg-card px-3 text-sm font-medium hover:bg-muted">{t.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {r.inRoadmaps.length > 0 && (
            <div className="mt-10">
              <h2 className="eyebrow">Recommended in these roadmaps</h2>
              <ul className="mt-3 space-y-2">
                {r.inRoadmaps.map((rm) => (
                  <li key={`${rm.slug}-${rm.stage}`}>
                    <Link href={`/roadmaps/${rm.slug}#stage-${rm.stage}`} className="surface-interactive flex items-center gap-3 p-3 text-sm">
                      <RouteIcon className="size-4 shrink-0 text-signal-strong" aria-hidden="true" />
                      <span><span className="font-medium">{rm.title}</span> <span className="text-muted-foreground">· Stage {rm.stage}: {rm.stageTitle}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="surface h-fit p-5 text-sm">
          <h2 className="font-semibold">Details</h2>
          <dl className="mt-4 space-y-3">
            <Detail term="Publisher" value={r.publisher} />
            <Detail term="Source" value={r.source_kind === "official" ? "Official (technology maintainers or vendor)" : "Community / independent educator"} />
            <Detail term="Price" value={PRICING.find((p) => p.value === r.pricing)?.hint ?? r.pricing} />
            <Detail term="Language" value={r.language} />
            {r.duration_label && <Detail term="Length" value={r.duration_label} />}
            {r.department && <Detail term="Department" value={r.department.name} />}
            {r.subcategory && <Detail term="Subcategory" value={r.subcategory.name} />}
          </dl>
          <p className="mt-5 flex items-start gap-2 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
            {verified ? <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> : <ShieldQuestionIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            {verified
              ? `Link verified${checked ? ` on ${checked}` : ""}. We link to the original publisher and never copy their content.`
              : r.url_status === "blocked"
                ? "This publisher blocks automated link checks, so our curators verify it by hand."
                : "This link has not been automatically verified yet."}
          </p>
        </aside>
      </div>

      {r.related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <SectionHeading eyebrow="Keep going" title={<span id="related-heading">Related resources</span>} />
          <ResourceGrid resources={r.related.slice(0, 3)} className="mt-6" />
        </section>
      )}
    </div>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
