import Link from "next/link";
import { LogoMark } from "./logo";
import { siteConfig } from "@/lib/site";
import { getDepartments } from "@/lib/catalog/queries";

export async function SiteFooter() {
  "use cache";
  const departments = await getDepartments();
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-semibold tracking-tight">{siteConfig.name}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            We don&apos;t make courses. We find the best ones, verify every link and organise them into paths you can follow.
          </p>
        </div>
        <FooterColumn title="Departments" links={departments.slice(0, 9).map((d) => ({ href: `/departments/${d.slug}`, label: d.name }))} />
        <FooterColumn
          title="Learn"
          links={[
            { href: "/explore", label: "Explore all" },
            { href: "/roadmaps", label: "Learning roadmaps" },
            { href: "/library", label: "Resource library" },
            { href: "/library?pricing=free", label: "Free resources" },
            { href: "/search", label: "Search" },
          ]}
        />
        <FooterColumn
          title="Platform"
          links={[
            { href: "/about", label: "About & curation" },
            { href: "/dashboard", label: "Your dashboard" },
            { href: "/signup", label: "Create an account" },
            { href: "/terms", label: "Terms of use" },
            { href: "/privacy", label: "Privacy" },
          ]}
        />
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {siteConfig.name}. Links point to their original publishers; all trademarks belong to their owners.</p>
          <p className="font-mono uppercase tracking-[0.14em]">Curated · Verified · Structured</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
