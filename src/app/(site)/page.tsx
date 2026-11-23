import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon, CompassIcon, LineChartIcon, RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/catalog/hero-search";
import { DepartmentCard, RoadmapCard, TechnologyChip } from "@/components/catalog/cards";
import { ResourceGrid } from "@/components/catalog/resource-card";
import { CatalogUnavailable, SectionHeading } from "@/components/catalog/states";
import { CatalogIcon } from "@/components/catalog/catalog-icon";
import { getCatalogStats, getDepartments, getResourceList, getRoadmap, getRoadmaps, getTechnologies } from "@/lib/catalog/queries";

const POPULAR_SEARCHES = ["Python", "Docker", "Azure", "React", "SQL", "Kubernetes", "LLMs", "Figma"];

export default async function HomePage() {
  const [stats, departments, technologies, roadmaps, featured, recent, preview] = await Promise.all([
    getCatalogStats(),
    getDepartments(),
    getTechnologies({ featuredOnly: true }),
    getRoadmaps({ featuredOnly: true }),
    getResourceList("featured", 6),
    getResourceList("recent", 6),
    getRoadmap("cloud-engineer"),
  ]);
  const empty = departments.length === 0;

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
              The IT Learning Hub
            </p>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.1rem]">
              The best of the internet for learning IT, <span className="display text-signal-strong">organised</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground text-pretty">
              We don&apos;t reinvent courses. We find the strongest documentation, courses, books and labs from trusted publishers, verify every link and arrange them into roadmaps you can actually follow.
            </p>
            <HeroSearch className="mt-8 max-w-xl" />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {POPULAR_SEARCHES.map((q) => (
                <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="rounded-md px-2 py-1 text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
                  {q}
                </Link>
              ))}
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t pt-6">
              {[
                { label: "Curated resources", value: stats.resources },
                { label: "Technologies", value: stats.technologies },
                { label: "Roadmaps", value: stats.roadmaps },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="eyebrow">{s.label}</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {preview && (
            <div className="relative hidden lg:block">
              <div className="surface relative p-6">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Roadmap preview</p>
                  <span className="rounded-md bg-signal-soft px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-signal-strong">{preview.estimated_duration}</span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-xl font-semibold tracking-tight">
                  <CatalogIcon name={preview.icon} className="size-5" />
                  {preview.title}
                </p>
                <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-[0.95rem] before:top-2 before:w-px before:bg-border">
                  {preview.stages.map((stage, i) => (
                    <li key={stage.id} className="relative flex gap-4">
                      <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs ${i === 0 ? "border-signal bg-signal text-white" : "bg-card text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 pt-1">
                        <p className="text-sm font-medium">{stage.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{stage.technologies.map((t) => t.name).join(" · ")}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Button asChild variant="outline" className="mt-6 w-full">
                  <Link href={`/roadmaps/${preview.slug}`}>
                    View the full roadmap <ArrowRightIcon />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {empty ? (
        <div className="container-page py-16"><CatalogUnavailable /></div>
      ) : (
        <>
          {/* ── Departments ──────────────────────────────────────────────── */}
          <section className="container-page py-16 sm:py-20" aria-labelledby="departments-heading">
            <SectionHeading
              eyebrow="Departments"
              title={<span id="departments-heading">Nine departments, one well-organised library</span>}
              description="Each department has its own subcategories, technologies, roadmaps and resources sorted from beginner to advanced."
              action={<Button asChild variant="outline"><Link href="/explore">Explore everything <ArrowRightIcon /></Link></Button>}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((d) => (
                <li key={d.id}><DepartmentCard department={d} /></li>
              ))}
            </ul>
          </section>

          {/* ── Popular technologies ────────────────────────────────────── */}
          <section className="border-y bg-card/60 py-16" aria-labelledby="tech-heading">
            <div className="container-page">
              <SectionHeading eyebrow="Popular technologies" title={<span id="tech-heading">Jump straight to a technology</span>} />
              <ul className="mt-8 flex flex-wrap gap-2">
                {technologies.map((t) => (
                  <li key={t.id}><TechnologyChip slug={t.slug} name={t.name} icon={t.icon} /></li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Roadmaps ────────────────────────────────────────────────── */}
          <section className="container-page py-16 sm:py-20" aria-labelledby="roadmaps-heading">
            <SectionHeading
              eyebrow="Learning roadmaps"
              title={<span id="roadmaps-heading">Know exactly what to learn next</span>}
              description="Ordered stages with skills, technologies, hand-picked resources, projects and optional certifications."
              action={<Button asChild variant="outline"><Link href="/roadmaps">All {stats.roadmaps} roadmaps <ArrowRightIcon /></Link></Button>}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roadmaps.slice(0, 6).map((r) => (
                <li key={r.id}><RoadmapCard roadmap={r} /></li>
              ))}
            </ul>
          </section>

          {/* ── Featured resources ──────────────────────────────────────── */}
          <section className="container-page pb-16 sm:pb-20" aria-labelledby="featured-heading">
            <SectionHeading
              eyebrow="Editor's picks"
              title={<span id="featured-heading">Featured resources</span>}
              description="Standout material our curators recommend first — official sources wherever possible."
              action={<Button asChild variant="outline"><Link href="/library">Open the library <ArrowRightIcon /></Link></Button>}
            />
            <ResourceGrid resources={featured} showDepartment className="mt-8" />
          </section>

          {/* ── How it works ────────────────────────────────────────────── */}
          <section className="border-y bg-card/60 py-16 sm:py-20" aria-labelledby="how-heading">
            <div className="container-page">
              <SectionHeading eyebrow="How it works" title={<span id="how-heading">Find it. Follow it. Track it.</span>} />
              <ol className="mt-10 grid gap-8 md:grid-cols-3">
                {[
                  { icon: CompassIcon, title: "Find trusted material", body: `${stats.resources} resources from official docs, universities and respected educators, each labelled by level, type and price.` },
                  { icon: RouteIcon, title: "Follow a roadmap", body: "Structured stages tell you what to learn, in which order, with projects that prove you can apply it." },
                  { icon: LineChartIcon, title: "Track your progress", body: "Save resources, mark them complete and tick off roadmap stages from your personal dashboard." },
                ].map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="font-mono text-sm text-signal-strong">0{i + 1}</span>
                    <div>
                      <step.icon className="size-5" aria-hidden="true" />
                      <h3 className="mt-3 font-semibold">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── Recently added ──────────────────────────────────────────── */}
          <section className="container-page py-16 sm:py-20" aria-labelledby="recent-heading">
            <SectionHeading
              eyebrow="Fresh in the library"
              title={<span id="recent-heading">Recently added</span>}
              action={<Button asChild variant="outline"><Link href="/library?sort=newest">See what&apos;s new <ArrowRightIcon /></Link></Button>}
            />
            <ResourceGrid resources={recent} showDepartment className="mt-8" />
          </section>

          {/* ── CTA ─────────────────────────────────────────────────────── */}
          <section className="container-page" aria-labelledby="cta-heading">
            <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-12 sm:px-12 sm:py-16">
              <div className="bg-grid absolute inset-0" aria-hidden="true" />
              <div className="relative max-w-2xl">
                <p className="eyebrow">Free account</p>
                <h2 id="cta-heading" className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Keep your learning in <span className="display text-signal-strong">one place</span>.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
                  Save resources, follow roadmaps and pick up exactly where you left off — on any device.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg"><Link href="/signup">Create free account</Link></Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/about"><BadgeCheckIcon /> How we curate</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
