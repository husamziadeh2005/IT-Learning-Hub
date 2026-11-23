import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { LevelMeter, OfficialBadge, PricingBadge, TypeLabel } from "./badges";
import { BookmarkButton, ProgressMarker } from "@/components/learner/learner-actions";
import type { ResourceCardData } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ResourceCard({ resource, className, showDepartment = false }: { resource: ResourceCardData; className?: string; showDepartment?: boolean }) {
  return (
    <article className={cn("surface-interactive group relative flex h-full flex-col p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TypeLabel type={resource.type} />
          <LevelMeter level={resource.level} />
        </div>
        <BookmarkButton resourceId={resource.id} title={resource.title} />
      </div>

      <h3 className="mt-3 text-[1.02rem] font-semibold leading-snug tracking-tight">
        <Link href={`/resources/${resource.slug}`} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring">
          {resource.title}
        </Link>
      </h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.8rem] text-muted-foreground">
        <span>{resource.publisher}</span>
        {resource.source_kind === "official" && <OfficialBadge />}
        {showDepartment && resource.department?.name && <span>· {resource.department.name}</span>}
      </p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{resource.description}</p>

      <div className="mt-auto pt-4">
        {resource.technologies.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {resource.technologies.slice(0, 3).map((t) => (
              <li key={t.slug} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t.name}</li>
            ))}
            {resource.technologies.length > 3 && <li className="px-1 py-0.5 text-xs text-muted-foreground">+{resource.technologies.length - 3}</li>}
          </ul>
        )}
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <div className="flex items-center gap-2">
            <PricingBadge pricing={resource.pricing} />
            {resource.duration_label && <span className="text-xs text-muted-foreground">{resource.duration_label}</span>}
            <ProgressMarker resourceId={resource.id} />
          </div>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Open<ArrowUpRightIcon className="size-4" aria-hidden="true" />
              <span className="sr-only"> {resource.title} on {resource.publisher} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ResourceGrid({ resources, showDepartment, className }: { resources: ResourceCardData[]; showDepartment?: boolean; className?: string }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {resources.map((r) => (
        <li key={r.id}>
          <ResourceCard resource={r} showDepartment={showDepartment} />
        </li>
      ))}
    </ul>
  );
}
