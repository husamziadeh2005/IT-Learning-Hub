import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { getCatalogStats } from "@/lib/catalog/queries";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const stats = await getCatalogStats();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden border-r bg-[#171b26] text-[#f6f4ef] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden="true" />
        <Link href="/" className="relative inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
          <ArrowLeftIcon className="size-4" aria-hidden="true" /> Back to the library
        </Link>
        <div className="relative max-w-md">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] opacity-70">The IT Learning Hub</p>
          <p className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Your next skill, <span className="display text-signal">mapped out</span>.
          </p>
          <p className="mt-4 leading-7 opacity-75">
            Save resources, follow roadmaps stage by stage and keep a record of everything you&apos;ve completed.
          </p>
        </div>
        <dl className="relative grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {[
            ["Resources", stats.resources],
            ["Technologies", stats.technologies],
            ["Roadmaps", stats.roadmaps],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] opacity-60">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </aside>
      <main id="main" className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
