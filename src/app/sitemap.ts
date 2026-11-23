import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getDepartmentSlugs, getResourceSlugs, getRoadmapSlugs, getTechnologySlugs } from "@/lib/catalog/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [departments, technologies, roadmaps, resources] = await Promise.all([getDepartmentSlugs(), getTechnologySlugs(), getRoadmapSlugs(), getResourceSlugs()]);
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    page("/explore", 0.9),
    page("/roadmaps", 0.9),
    page("/library", 0.8),
    page("/about", 0.4),
    ...departments.map((s) => page(`/departments/${s}`, 0.8)),
    ...technologies.map((s) => page(`/technologies/${s}`, 0.7)),
    ...roadmaps.map((s) => page(`/roadmaps/${s}`, 0.8)),
    ...resources.map((s) => page(`/resources/${s}`, 0.5)),
  ];
}
