"use client";

import { useEffect } from "react";
import Link from "next/link";
import { unstable_isUnrecognizedActionError } from "next/navigation";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STALE_RELOAD_KEY = "stale-action-reload";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // A form was submitted from a page loaded before the latest deploy / dev
  // server restart, so its Server Action ID no longer exists. Reloading picks
  // up the current build. Guarded so a persistent failure cannot loop.
  // Boolean() keeps the type guard from narrowing `error` below.
  const staleAction = Boolean(unstable_isUnrecognizedActionError(error));

  useEffect(() => {
    if (staleAction) {
      let alreadyTried = false;
      try {
        // Only one automatic reload per 10 seconds.
        alreadyTried = Date.now() - Number(sessionStorage.getItem(STALE_RELOAD_KEY) ?? 0) < 10_000;
        sessionStorage.setItem(STALE_RELOAD_KEY, String(Date.now()));
      } catch {}
      if (!alreadyTried) {
        window.location.reload();
        return;
      }
    }
    console.error(error);
  }, [error, staleAction]);

  if (staleAction) {
    return (
      <main id="main" className="grid min-h-[70dvh] place-items-center px-4">
        <div className="max-w-md text-center">
          <p className="eyebrow">Page out of date</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page was updated</h1>
          <p className="mt-3 leading-7 text-muted-foreground">A newer version of the site is available. Reload the page and submit the form again.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => window.location.reload()}><RotateCcwIcon /> Reload page</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="grid min-h-[70dvh] place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">We hit an unexpected error</h1>
        <p className="mt-3 leading-7 text-muted-foreground">Nothing you did caused this. Try again, and if it keeps happening come back in a few minutes.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}><RotateCcwIcon /> Try again</Button>
          <Button asChild size="lg" variant="outline"><Link href="/">Home</Link></Button>
        </div>
      </div>
    </main>
  );
}
