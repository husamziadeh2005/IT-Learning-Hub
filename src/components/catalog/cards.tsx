import Link from "next/link";
import { ArrowRightIcon, ClockIcon, LayersIcon } from "lucide-react";
import { CatalogIcon } from "./catalog-icon";
import { LevelMeter } from "./badges";
import { accent } from "@/lib/catalog/labels";
import type { DepartmentSummary, RoadmapSummary, TechnologyCardData } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function DepartmentCard({ department, className }: { department: DepartmentSummary; className?: string }) {
  const a = accent(department.accent);
  return (
    <Link href={`/departments/${department.slug}`} className={cn("surface-interactive group flex h-full flex-col p-5", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("grid size-11 place-items-center rounded-lg", a.soft, a.text)}>
          <CatalogIcon name={department.icon} className="size-5" />
        </span>
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{department.name}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{department.tagline}</p>
      <p className="mt-auto flex gap-4 pt-5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
        <span>{department.technologyCount} topics</span>
        <span>{department.resourceCount} resources</span>
      </p>
    </Link>
  );
}

export function TechnologyCard({ technology, className }: { technology: TechnologyCardData; className?: string }) {
  const a = accent(technology.department?.accent);
  return (
    <Link href={`/technologies/${technology.slug}`} className={cn("surface-interactive group flex h-full items-start gap-3.5 p-4", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background">
        <CatalogIcon name={technology.icon} className="size-[1.1rem]" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">{technology.name}</span>
          <span className={cn("size-1.5 rounded-full", a.dot)} aria-hidden="true" />
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm leading-5 text-muted-foreground">{technology.short_description}</span>
        {typeof technology.resourceCount === "number" && (
          <span className="mt-2 block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">{technology.resourceCount} resources</span>
        )}
      </span>
    </Link>
  );
}

export function TechnologyChip({ slug, name, icon }: { slug: string; name: string; icon?: string }) {
  return (
    <Link href={`/technologies/${slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium transition-colors hover:border-foreground/25 hover:bg-muted">
      {icon && <CatalogIcon name={icon} className="size-4 text-muted-foreground" />}
      {name}
    </Link>
  );
}

export function RoadmapCard({ roadmap, className }: { roadmap: RoadmapSummary; className?: string }) {
  const a = accent(roadmap.department?.accent);
  const preview = roadmap.stageTitles.slice(0, 4);
  return (
    <Link href={`/roadmaps/${roadmap.slug}`} className={cn("surface-interactive group flex h-full flex-col p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-lg", a.soft, a.text)}>
          <CatalogIcon name={roadmap.icon} className="size-5" />
        </span>
        <LevelMeter level={roadmap.level} />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{roadmap.title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{roadmap.summary}</p>
      <ol className="mt-4 space-y-1.5 border-l pl-4" aria-label="First stages">
        {preview.map((title, i) => (
          <li key={title} className="relative text-[0.8rem] text-muted-foreground">
            <span className={cn("absolute -left-[1.3rem] top-1.5 size-2 rounded-full border-2 border-card", i === 0 ? "bg-signal" : "bg-foreground/25")} aria-hidden="true" />
            {title}
          </li>
        ))}
        {roadmap.stageCount > preview.length && <li className="text-[0.8rem] text-muted-foreground">+ {roadmap.stageCount - preview.length} more</li>}
      </ol>
      <p className="mt-auto flex flex-wrap gap-4 pt-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><LayersIcon className="size-3.5" aria-hidden="true" />{roadmap.stageCount} stages</span>
        {roadmap.estimated_duration && (
          <span className="inline-flex items-center gap-1.5"><ClockIcon className="size-3.5" aria-hidden="true" />{roadmap.estimated_duration}</span>
        )}
      </p>
    </Link>
  );
}
