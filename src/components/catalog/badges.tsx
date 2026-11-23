import { BadgeCheckIcon, BookOpenIcon, BookTextIcon, CodeIcon, FileTextIcon, FlaskConicalIcon, GraduationCapIcon, LibraryIcon, MousePointerClickIcon, PlayCircleIcon, AwardIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { levelLabel, pricingLabel, PRICING, typeLabel, type Level, type Pricing, type ResourceType } from "@/lib/catalog/labels";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  documentation: BookTextIcon,
  video: PlayCircleIcon,
  course: GraduationCapIcon,
  tutorial: FileTextIcon,
  book: BookOpenIcon,
  university_lecture: LibraryIcon,
  interactive: MousePointerClickIcon,
  repository: CodeIcon,
  certification: AwardIcon,
  lab: FlaskConicalIcon,
  article: FileTextIcon,
};

export function TypeLabel({ type, className }: { type: ResourceType; className?: string }) {
  const Icon = TYPE_ICONS[type] ?? FileTextIcon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {typeLabel(type)}
    </span>
  );
}

const LEVEL_BARS: Record<Level, number> = { beginner: 1, intermediate: 2, advanced: 3 };

/** Three-bar difficulty meter plus a text label (never colour alone). */
export function LevelMeter({ level, className, showLabel = true }: { level: Level; className?: string; showLabel?: boolean }) {
  const filled = LEVEL_BARS[level] ?? 1;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className)}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn("w-[3px] rounded-full", n === 1 ? "h-1.5" : n === 2 ? "h-2.5" : "h-3.5", n <= filled ? "bg-foreground/80" : "bg-foreground/15")} />
        ))}
      </span>
      {showLabel ? levelLabel(level) : <span className="sr-only">{levelLabel(level)}</span>}
    </span>
  );
}

export function PricingBadge({ pricing, className }: { pricing: Pricing; className?: string }) {
  const hint = PRICING.find((p) => p.value === pricing)?.hint;
  return (
    <span
      title={hint}
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-[0.7rem] font-semibold",
        pricing === "free" && "bg-success/12 text-success",
        pricing === "freemium" && "bg-signal-soft text-signal-strong",
        pricing === "paid" && "bg-foreground/8 text-foreground",
        pricing === "unknown" && "border border-dashed text-muted-foreground",
        className,
      )}
    >
      {pricingLabel(pricing)}
    </span>
  );
}

export function OfficialBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[0.7rem] font-semibold text-foreground", className)} title="Published by the technology's maintainers or vendor">
      <BadgeCheckIcon className="size-3.5 text-signal-strong" aria-hidden="true" />
      Official
    </span>
  );
}

