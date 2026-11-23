import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheckIcon, LinkIcon, ScaleIcon, SignpostIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCatalogStats } from "@/lib/catalog/queries";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${siteConfig.name} exists and how we choose, verify and organise learning resources.`,
};

const PRINCIPLES = [
  { icon: BadgeCheckIcon, title: "Official sources first", body: "Where the people who build a technology publish good learning material, we link to it before anything else. Community resources are included when they are genuinely excellent." },
  { icon: LinkIcon, title: "Every link verified", body: "Links are checked automatically for their status and page title, and re-checked from the admin dashboard. Publishers that block automated checks are verified by hand and labelled as such." },
  { icon: ScaleIcon, title: "Honest labels", body: "Each resource is labelled by level, type and price. We only call something free when it is; “Free + paid” means you can learn for free but certificates or extras cost money." },
  { icon: SignpostIcon, title: "Structure over volume", body: "A shorter list in the right order beats an endless one. Roadmaps tell you what to learn next and give you a project to prove it." },
];

export default async function AboutPage() {
  const stats = await getCatalogStats();
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">About</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          The internet already has great IT education. It just isn&apos;t <span className="display text-signal-strong">organised</span>.
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {siteConfig.name} started as a small student project linking to favourite programming tutorials. It is now a curated hub covering
          programming, web development, cloud, DevOps, databases, computer science, mobile, AI and design — {stats.resources} resources across{" "}
          {stats.technologies} technologies and {stats.roadmaps} roadmaps.
        </p>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          We don&apos;t host or reproduce courses. We find the best material from original publishers, describe it accurately, and arrange it so
          beginners and working engineers can see what to learn next — and track their progress along the way.
        </p>
      </div>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <li key={p.title} className="surface p-6">
            <p.icon className="size-5 text-signal-strong" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.body}</p>
          </li>
        ))}
      </ul>

      <section className="mt-14 max-w-3xl" aria-labelledby="content-heading">
        <h2 id="content-heading" className="text-2xl font-semibold tracking-tight">Copyright and publishers</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          All courses, books, videos and documentation remain the property of their publishers. We only write short descriptions and link to the
          original source. If you publish a resource listed here and want its description changed or removed, contact the site owner and we will
          act promptly.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link href="/explore">Start exploring</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/roadmaps">Browse roadmaps</Link></Button>
        </div>
      </section>
    </div>
  );
}
