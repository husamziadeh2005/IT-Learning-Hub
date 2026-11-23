import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <Link href="/" aria-label="Home" className="inline-block"><LogoMark className="size-10" /></Link>
        <p className="eyebrow mt-8">Error 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">This page took a wrong turn</h1>
        <p className="mt-3 leading-7 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved. Try searching the catalog instead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link href="/explore"><CompassIcon /> Explore the catalog</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/">Home</Link></Button>
        </div>
      </div>
    </main>
  );
}
