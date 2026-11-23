import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/** Wordmark: a bracketed cursor mark + name. Pure SVG/CSS, no image request. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M12 10 7 16l5 6" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary-foreground" />
      <path d="M20 10l5 6-5 6" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary-foreground" />
      <rect x="14.6" y="19.4" width="2.8" height="2.8" rx="0.6" className="fill-signal" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex min-h-11 items-center gap-2.5 rounded-lg", className)} aria-label={`${siteConfig.name} — home`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-tight">{siteConfig.name}</span>
        <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground sm:block">IT Learning Hub</span>
      </span>
    </Link>
  );
}
