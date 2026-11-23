import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { LevelMeter, OfficialBadge, PricingBadge, TypeLabel } from "./badges";
import { BookmarkButton, ProgressControl } from "@/components/learner/learner-actions";
import type { ResourceCardData } from "@/lib/catalog/types";

/** Dense list row used inside roadmap stages and dashboards. */
export function ResourceRow({ resource, optional = false }: { resource: ResourceCardData; optional?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TypeLabel type={resource.type} />
          <LevelMeter level={resource.level} />
          <PricingBadge pricing={resource.pricing} />
          {optional && <span className="rounded-md border px-1.5 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">Optional</span>}
        </div>
        <p className="mt-1.5 font-medium leading-snug">
          <Link href={`/resources/${resource.slug}`} className="hover:underline">{resource.title}</Link>
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {resource.publisher}
          {resource.source_kind === "official" && <OfficialBadge />}
          {resource.duration_label && <span>· {resource.duration_label}</span>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <ProgressControl resourceId={resource.id} compact />
        <BookmarkButton resourceId={resource.id} title={resource.title} />
        {resource.url && (
          <ExternalOpenLink href={resource.url} title={resource.title} publisher={resource.publisher} />
        )}
      </div>
    </div>
  );
}

function ExternalOpenLink({ href, title, publisher }: { href: string; title: string; publisher: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-9 items-center justify-center rounded-md border hover:bg-muted"
      title={`Open on ${publisher}`}
    >
      <ArrowUpRightIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">Open {title} on {publisher} (opens in a new tab)</span>
    </a>
  );
}
