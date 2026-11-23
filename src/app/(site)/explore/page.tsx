import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { DepartmentCard, TechnologyCard } from "@/components/catalog/cards";
import { CatalogUnavailable, SectionHeading } from "@/components/catalog/states";
import { getDepartments, getTechnologies } from "@/lib/catalog/queries";
import { accent } from "@/lib/catalog/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Explore departments and technologies",
  description: "Browse all nine IT departments and every technology in the library, from Python and React to Azure, Kubernetes and LLMs.",
};

export default async function ExplorePage() {
  const [departments, technologies] = await Promise.all([getDepartments(), getTechnologies()]);
  if (!departments.length) return <div className="container-page py-16"><CatalogUnavailable /></div>;

  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Explore"
        title="Everything in the library"
        description={`${departments.length} departments and ${technologies.length} technologies and topics. Pick a department for its roadmaps and structure, or jump straight to a technology.`}
      />

      <h2 className="sr-only">Departments</h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => <li key={d.id}><DepartmentCard department={d} /></li>)}
      </ul>

      <nav aria-label="Jump to department" className="sticky top-16 z-20 -mx-4 mt-16 overflow-x-auto border-y bg-background/90 px-4 py-3 backdrop-blur no-scrollbar sm:mx-0 sm:rounded-lg sm:border">
        <ul className="flex gap-1.5">
          {departments.map((d) => (
            <li key={d.slug}>
              <a href={`#tech-${d.slug}`} className="inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <span className={cn("size-1.5 rounded-full", accent(d.accent).dot)} aria-hidden="true" />
                {d.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-14">
        {departments.map((d) => {
          const techs = technologies.filter((t) => t.department?.slug === d.slug);
          return (
            <section key={d.slug} id={`tech-${d.slug}`} aria-labelledby={`heading-${d.slug}`} className="scroll-mt-36">
              <div className="flex items-end justify-between gap-4">
                <h2 id={`heading-${d.slug}`} className="text-xl font-semibold tracking-tight">{d.name}</h2>
                <Link href={`/departments/${d.slug}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Department <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {techs.map((t) => <li key={t.id}><TechnologyCard technology={t} /></li>)}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
