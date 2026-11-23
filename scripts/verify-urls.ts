/**
 * Verify every URL in the curated catalog.
 *
 *   node scripts/verify-urls.ts [--only <resources-file-stem>] [--out report.json]
 *
 * For each URL it records the final HTTP status, the final URL after
 * redirects and the page <title>, so a human can confirm the page really is
 * the resource described. YouTube links are checked through the public oEmbed
 * endpoint, which returns the real video title and channel name.
 *
 * Exit code is 1 when any URL is broken.
 */
import { readdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ResourceSeed } from "../content/types.ts";
import { technologies } from "../content/technologies.ts";
import { roadmaps } from "../content/roadmaps.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const resourcesDir = path.join(here, "..", "content", "resources");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const outFile = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;
const skipExtras = args.includes("--resources-only");

type Check = {
  key: string;
  url: string;
  expect: string;
  status: number | null;
  finalUrl: string | null;
  title: string | null;
  author?: string | null;
  verdict: "ok" | "redirected" | "blocked" | "broken";
  error?: string;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 LinkCheck";

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function youtubeTarget(url: string) {
  const u = new URL(url);
  if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) return null;
  return `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
}

async function check(key: string, url: string, expect: string): Promise<Check> {
  const base: Check = { key, url, expect, status: null, finalUrl: null, title: null, verdict: "broken" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const oembed = youtubeTarget(url);
    if (oembed) {
      const res = await fetch(oembed, { signal: controller.signal, headers: { "user-agent": UA } });
      base.status = res.status;
      base.finalUrl = url;
      if (res.ok) {
        const data = (await res.json()) as { title?: string; author_name?: string };
        base.title = data.title ?? null;
        base.author = data.author_name ?? null;
        base.verdict = "ok";
      }
      return base;
    }
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*;q=0.8", "accept-language": "en-US,en;q=0.9" },
    });
    base.status = res.status;
    base.finalUrl = res.url;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("html")) {
      const html = (await res.text()).slice(0, 400_000);
      const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      base.title = match ? decodeEntities(match[1].replace(/\s+/g, " ").trim()).slice(0, 160) : null;
    } else {
      await res.body?.cancel();
      base.title = `(${type.split(";")[0] || "no content-type"})`;
    }
    if (res.ok) {
      const sameish = new URL(res.url).hostname === new URL(url).hostname &&
        new URL(res.url).pathname.replace(/\/$/, "") === new URL(url).pathname.replace(/\/$/, "");
      base.verdict = sameish ? "ok" : "redirected";
    } else if ([401, 403, 429, 999].includes(res.status)) {
      base.verdict = "blocked"; // site refuses automated clients; check by hand
    }
  } catch (error) {
    base.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  } finally {
    clearTimeout(timer);
  }
  return base;
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  let index = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (index < items.length) {
        const i = index++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

async function main() {
  const files = (await readdir(resourcesDir)).filter((f) => f.endsWith(".ts") && f !== "helpers.ts" && f !== "index.ts");
  const targets: { key: string; url: string; expect: string }[] = [];
  for (const file of files) {
    if (only && path.parse(file).name !== only) continue;
    const mod = (await import(pathToFileURL(path.join(resourcesDir, file)).href)) as { default: ResourceSeed[] };
    for (const r of mod.default) if (r.url) targets.push({ key: r.key, url: r.url, expect: `${r.title} — ${r.publisher}` });
  }
  if (!only && !skipExtras) {
    for (const t of technologies) if (t.officialUrl) targets.push({ key: `tech:${t.slug}`, url: t.officialUrl, expect: `${t.name} official site` });
    for (const rm of roadmaps)
      for (const c of rm.certifications) targets.push({ key: `cert:${rm.slug}`, url: c.url, expect: `${c.name} — ${c.provider}` });
  }
  const unique = [...new Map(targets.map((t) => [t.url, t])).values()];
  console.error(`Checking ${unique.length} URLs…`);
  const results = await pool(unique, 10, async (t) => {
    let result = await check(t.key, t.url, t.expect);
    // Network errors (timeouts, resets) are often transient: retry once.
    if (result.verdict === "broken" && result.status === null) {
      await new Promise((r) => setTimeout(r, 3000));
      result = await check(t.key, t.url, t.expect);
    }
    return result;
  });

  const order = { broken: 0, blocked: 1, redirected: 2, ok: 3 } as const;
  results.sort((a, b) => order[a.verdict] - order[b.verdict] || a.key.localeCompare(b.key));
  for (const r of results) {
    const extra = r.author ? ` [channel: ${r.author}]` : "";
    const moved = r.verdict === "redirected" ? `\n      → ${r.finalUrl}` : "";
    console.log(`${r.verdict.padEnd(10)} ${String(r.status ?? "---").padEnd(4)} ${r.key}\n      expect: ${r.expect}\n      title:  ${r.title ?? r.error ?? ""}${extra}${moved}`);
  }
  const counts = results.reduce<Record<string, number>>((acc, r) => ((acc[r.verdict] = (acc[r.verdict] ?? 0) + 1), acc), {});
  console.error("Summary:", counts);
  if (outFile) await writeFile(outFile, JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
  if (counts.broken) process.exitCode = 1;
}

await main();
