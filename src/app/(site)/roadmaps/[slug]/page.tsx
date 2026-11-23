import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon, AwardIcon, CheckIcon, ClockIcon, FlagIcon, HammerIcon, LayersIcon, ListChecksIcon } from "lucide-react";
import { Breadcrumbs, PageSkeleton } from "@/components/catalog/states";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { LevelMeter } from "@/components/catalog/badges";
import { ResourceRow } from "@/components/catalog/resource-row";
import { RoadmapProgressPanel, StageCompleteToggle, StageNode } from "@/components/roadmap/roadmap-controls";
import { getRoadmap, getRoadmapSlugs } from "@/lib/catalog/queries";
import { accent } from "@/lib/catalog/labels";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getRoadmapSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/roadmaps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) return { title: "Roadmap not found" };
  return { title: `${roadmap.title} roadmap`, description: roadmap.summary, alternates: { canonical: `/roadmaps/${slug}` } };
}

export default function RoadmapPage({ params }: PageProps<"/roadmaps/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RoadmapView params={params} />
    </Suspense>
  );
}

async function RoadmapView({ params }: { params: PageProps<"/roadmaps/[slug]">["params"] }) {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) notFound();
  const a = accent(roadmap.department?.accent);
  const resourceCount = roadmap.stages.reduce((n, s) => n + s.resources.length, 0);

  return (
    <>
      <section className="relative border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-page py-12 sm:py-16">
          <Breadcrumbs items={[{ href: "/roadmaps", label: "Roadmaps" }, { label: roadmap.title }]} />
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div className="max-w-3xl">
              <span className={cn("grid size-12 place-items-center rounded-xl", a.soft, a.text)}>
                <CatalogIcon name={roadmap.icon} className="size-6" />
              </span>
              <p className="eyebrow mt-5">Roadmap</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{roadmap.title}</h1>
              <p className="mt-4 text-lg text-foreground/85 text-pretty">{roadmap.summary}</p>
              <p className="prose-body mt-3">{roadmap.description}</p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <li><LevelMeter level={roadmap.level} className="text-sm" /></li>
                {roadmap.estimated_duration && <li className="inline-flex items-center gap-1.5"><ClockIcon className="size-4" aria-hidden="true" />{roadmap.estimated_duration}</li>}
                <li className="inline-flex items-center gap-1.5"><LayersIcon className="size-4" aria-hidden="true" />{roadmap.stageCount} stages</li>
                <li className="inline-flex items-center gap-1.5"><ListChecksIcon className="size-4" aria-hidden="true" />{resourceCount} resources</li>
              </ul>
            </div>
            <RoadmapProgressPanel roadmapId={roadmap.id} stageIds={roadmap.stages.map((s) => s.id)} />
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-12 sm:py-16 lg:grid-cols-[16rem_1fr] xl:grid-cols-[18rem_1fr]">
        {/* Overview / sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Stages" className="hidden lg:block">
            <p className="eyebrow">Stages</p>
            <ol className="mt-3 space-y-1">
              {roadmap.stages.map((s) => (
                <li key={s.id}>
                  <a href={`#stage-${s.position}`} className="flex gap-3 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                    <span className="font-mono text-xs leading-5">{String(s.position).padStart(2, "0")}</span>
                    <span className="leading-5">{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <InfoList icon={FlagIcon} title="Prerequisites" items={roadmap.prerequisites} />
          <InfoList icon={CheckIcon} title="You will be able to" items={roadmap.outcomes} />
          <div>
            <p className="eyebrow flex items-center gap-2"><AwardIcon className="size-3.5" aria-hidden="true" /> Optional certifications</p>
            {roadmap.certifications.length ? (
              <ul className="mt-3 space-y-2">
                {roadmap.certifications.map((c) => (
                  <li key={c.url}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="group block rounded-lg border bg-card p-3 hover:border-foreground/25">
                      <span className="flex items-start justify-between gap-2 text-sm font-medium leading-snug">
                        {c.name}
                        <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{c.provider}</span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">There is no widely recognised certification for this path — a portfolio of the projects below carries more weight.</p>
            )}
          </div>
        </aside>

        {/* Timeline */}
        <ol className="relative space-y-6 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-border" aria-label="Roadmap stages">
          {roadmap.stages.map((stage) => (
            <li key={stage.id} id={`stage-${stage.position}`} className="relative scroll-mt-24 pl-14 sm:pl-16">
              <div className="absolute left-0 top-5">
                <StageNode stageId={stage.id} position={stage.position} />
              </div>
              <article className="surface p-5 sm:p-6" aria-labelledby={`stage-title-${stage.id}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="eyebrow">Stage {stage.position}{stage.estimated_duration ? ` · ${stage.estimated_duration}` : ""}</p>
                    <h2 id={`stage-title-${stage.id}`} className="mt-1 text-xl font-semibold tracking-tight">{stage.title}</h2>
                  </div>
                  <StageCompleteToggle stageId={stage.id} title={stage.title} />
                </div>
                <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">{stage.summary}</p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {stage.skills.length > 0 && (
                    <div>
                      <h3 className="eyebrow">Skills</h3>
                      <ul className="mt-2 space-y-1.5">
                        {stage.skills.map((skill) => (
                          <li key={skill} className="flex gap-2 text-sm"><CheckIcon className="mt-0.5 size-4 shrink-0 text-signal-strong" aria-hidden="true" />{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {stage.technologies.length > 0 && (
                    <div>
                      <h3 className="eyebrow">Technologies</h3>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {stage.technologies.map((t) => (
                          <li key={t.slug}>
                            <Link href={`/technologies/${t.slug}`} className="inline-flex min-h-8 items-center rounded-md border bg-background px-2.5 text-sm hover:bg-muted">{t.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {stage.resources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="eyebrow">Recommended resources</h3>
                    <ul className="mt-3 space-y-2">
                      {stage.resources.map((r) => <li key={r.id}><ResourceRow resource={r} optional={r.is_optional} /></li>)}
                    </ul>
                  </div>
                )}

                {stage.projects.length > 0 && (
                  <div className="mt-6 rounded-lg border border-dashed bg-muted/40 p-4">
                    <h3 className="eyebrow flex items-center gap-2"><HammerIcon className="size-3.5" aria-hidden="true" /> Practical project</h3>
                    {stage.projects.map((p) => (
                      <div key={p.title} className="mt-2">
                        <p className="font-medium">{p.title}</p>
                        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function InfoList({ icon: Icon, title, items }: { icon: typeof FlagIcon; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="eyebrow flex items-center gap-2"><Icon className="size-3.5" aria-hidden="true" /> {title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => <li key={item} className="text-sm leading-6">{item}</li>)}
      </ul>
    </div>
  );
}
