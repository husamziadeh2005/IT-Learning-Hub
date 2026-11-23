import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: `What data ${siteConfig.name} stores and why.` };

const SECTIONS = [
  { title: "What we store", body: "Your email address and password (stored hashed by our authentication provider, Supabase), your display name, optional headline, bio and profile photo, and your learning data: saved resources, progress, roadmaps you follow and stages you complete." },
  { title: "Why", body: "Only to provide your account and dashboard. We do not sell your data, show ads, or share your learning data with the publishers we link to." },
  { title: "Who can see it", body: "Your learning data is protected by database row-level security: only you can read or change it. Site administrators can see account profiles to manage access, but not your password." },
  { title: "Cookies", body: "We use essential cookies to keep you signed in. We do not use advertising or cross-site tracking cookies." },
  { title: "External sites", body: "When you open a resource you leave this site; the publisher's own privacy policy then applies." },
  { title: "Your choices", body: "You can edit your profile at any time from your dashboard and remove saved resources or progress. To delete your account entirely, contact the site owner and it will be removed along with all associated learning data." },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Privacy</h1>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
