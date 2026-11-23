"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function isActive(pathname: string, href: string) {
  if (href === "/explore") return pathname === "/explore" || pathname.startsWith("/departments") || pathname.startsWith("/technologies");
  if (href === "/library") return pathname.startsWith("/library") || pathname.startsWith("/resources") || pathname.startsWith("/search");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {siteConfig.nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-signal",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Rendered during prerendering, before the current path is known. */
export function NavLinksFallback() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {siteConfig.nav.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
