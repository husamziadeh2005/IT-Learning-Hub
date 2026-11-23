"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SideNavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

/**
 * Dashboard navigation: a vertical sidebar on large screens and a
 * horizontally scrollable tab bar on phones and tablets.
 */
export function SideNav({ items, label }: { items: SideNavItem[]; label: string }) {
  return (
    <Suspense fallback={<SideNavList items={items} label={label} pathname={null} />}>
      <PathAwareSideNav items={items} label={label} />
    </Suspense>
  );
}

function PathAwareSideNav({ items, label }: { items: SideNavItem[]; label: string }) {
  return <SideNavList items={items} label={label} pathname={usePathname()} />;
}

function SideNavList({ items, label, pathname }: { items: SideNavItem[]; label: string; pathname: string | null }) {
  const isActive = (item: SideNavItem) => pathname !== null && (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto border-b px-4 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:border-0 lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:rounded-lg lg:border-b-0",
                  active && "border-signal text-foreground lg:bg-muted",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
