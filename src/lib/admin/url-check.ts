import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type UrlCheck = {
  status: "ok" | "redirected" | "broken" | "blocked";
  httpStatus: number | null;
  finalUrl: string | null;
  title: string | null;
  error?: string;
};

const UA = "Mozilla/5.0 (compatible; LetsCodeLinkCheck/1.0; +https://github.com/)";

function isPrivateAddress(ip: string) {
  if (ip.includes(":")) {
    const v6 = ip.toLowerCase();
    return v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("::ffff:127.") || v6 === "::";
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

/** Reject anything that is not a public http(s) host (SSRF protection). */
async function assertPublicUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http and https URLs can be checked.");
  if (url.username || url.password) throw new Error("URLs with credentials are not allowed.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("Private hosts are not allowed.");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  if (!addresses.length || addresses.some(isPrivateAddress)) throw new Error("Private network addresses are not allowed.");
  return url;
}

/** Check a resource link the same way the content verifier does. Follows up to 5 redirects manually so every hop is validated. */
export async function checkUrl(raw: string): Promise<UrlCheck> {
  let current = raw;
  try {
    for (let hop = 0; hop < 6; hop++) {
      const url = await assertPublicUrl(current);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      let res: Response;
      try {
        res = await fetch(url, { redirect: "manual", signal: controller.signal, headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8" }, cache: "no-store" });
      } finally {
        clearTimeout(timer);
      }
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        await res.body?.cancel();
        current = new URL(res.headers.get("location")!, url).toString();
        continue;
      }
      let title: string | null = null;
      if ((res.headers.get("content-type") ?? "").includes("html")) {
        const html = (await res.text()).slice(0, 300_000);
        title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim().slice(0, 200) ?? null;
      } else {
        await res.body?.cancel();
      }
      const moved = hop > 0;
      if (res.ok) return { status: moved ? "redirected" : "ok", httpStatus: res.status, finalUrl: current, title };
      if ([401, 403, 429, 999].includes(res.status)) return { status: "blocked", httpStatus: res.status, finalUrl: current, title };
      return { status: "broken", httpStatus: res.status, finalUrl: current, title };
    }
    return { status: "broken", httpStatus: null, finalUrl: current, title: null, error: "Too many redirects" };
  } catch (error) {
    return { status: "broken", httpStatus: null, finalUrl: null, title: null, error: error instanceof Error ? error.message : "Request failed" };
  }
}
