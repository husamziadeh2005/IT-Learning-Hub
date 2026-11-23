import { Suspense } from "react";
import { Logo } from "./logo";
import { NavLinks, NavLinksFallback } from "./nav-links";
import { MobileNav, MobileNavFallback } from "./mobile-nav";
import { SearchDialog } from "./search-dialog";
import { UserNav } from "./user-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center gap-3">
        <Suspense fallback={<MobileNavFallback />}>
          <MobileNav />
        </Suspense>
        <Logo className="mr-2" />
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
