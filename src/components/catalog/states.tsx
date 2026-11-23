import Link from "next/link";
import type { ReactNode } from "react";
import { DatabaseZapIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, action, className, as: As = "h2" }: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <As className={cn("font-semibold tracking-tight text-balance", As === "h1" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-[1.7rem]")}>{title}</As>
        {description && <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchXIcon, title, description, action, className }: {
  icon?: typeof SearchXIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CatalogUnavailable() {
  return (
    <EmptyState
      icon={DatabaseZapIcon}
      title="The catalog is temporarily unavailable"
      description="We couldn't reach the learning library just now. Please refresh in a moment."
      action={<Button asChild variant="outline"><Link href="/">Back to home</Link></Button>}
    />
  );
}

export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="surface space-y-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-14 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-page py-12" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-10 w-2/3 max-w-xl" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <CardGridSkeleton className="mt-10" />
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-foreground/25">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
