"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { isActive } from "./nav-links";
import { siteConfig } from "@/lib/site";
import { useLearner } from "@/components/learner/learner-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useLearner();
  const links = [
    { href: "/", label: "Home" },
    ...siteConfig.nav,
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(user?.isStaff ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(20rem,86vw)] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle asChild>
            <div><Logo /></div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col p-2">
          {links.map((item) => {
            const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {!user && (
          <div className="mt-auto grid gap-2 border-t p-4">
            <Button asChild size="lg"><Link href="/signup" onClick={() => setOpen(false)}>Create free account</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/login" onClick={() => setOpen(false)}>Sign in</Link></Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function MobileNavFallback() {
  return (
    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" disabled>
      <MenuIcon className="size-5" />
    </Button>
  );
}
