import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use", description: `The terms for using ${siteConfig.name}.` };

const SECTIONS = [
  { title: "1. Using the site", body: `By using ${siteConfig.name} you agree to these terms. The catalog is provided for general educational purposes and may change without notice.` },
  { title: "2. Your account", body: "You are responsible for keeping your password secure and for activity on your account. Provide accurate information and do not share your account. You can stop using the service at any time." },
  { title: "3. Acceptable use", body: "Do not attempt to access other users' data, disrupt the service, scrape it in bulk, or use it for unlawful purposes. We may suspend accounts that do." },
  { title: "4. External resources", body: "Resources link to third-party websites. We do not control them and are not responsible for their content, availability, pricing or privacy practices. Linking does not imply endorsement by those publishers, and all trademarks belong to their owners." },
  { title: "5. Accuracy", body: "We work hard to keep descriptions, levels and pricing accurate and to verify links, but publishers change their sites. Always confirm pricing and certification details on the publisher's site before paying for anything." },
  { title: "6. Intellectual property", body: `The design, code and original descriptions on ${siteConfig.name} are ours. Learning materials belong to their publishers; we do not reproduce them.` },
  { title: "7. Liability", body: "The service is provided “as is”. To the extent permitted by law we are not liable for losses arising from your use of the site or of linked resources." },
  { title: "8. Changes", body: "We may update these terms. Material changes will be announced on the site; continuing to use the service after that means you accept the updated terms." },
];

export default function TermsPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Terms of use</h1>
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
