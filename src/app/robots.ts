import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/auth", "/login", "/signup", "/forgot-password", "/reset-password", "/search"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
