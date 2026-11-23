/**
 * Source-of-truth types for the curated catalog.
 *
 * These files are compiled into `supabase/seed.sql` by
 * `scripts/generate-seed.ts`. After seeding, the database is authoritative and
 * the admin dashboard is the place to edit content; re-running the generator
 * is only for bootstrapping a fresh database.
 */

export type Level = "beginner" | "intermediate" | "advanced";

export type ResourceType =
  | "documentation"
  | "video"
  | "course"
  | "tutorial"
  | "book"
  | "university_lecture"
  | "interactive"
  | "repository"
  | "certification"
  | "lab"
  | "article";

export type Pricing = "free" | "freemium" | "paid" | "unknown";
export type SourceKind = "official" | "community";

export interface SubcategorySeed {
  slug: string;
  name: string;
  description: string;
  /** Technology slugs placed in this subcategory, in display order. */
  technologies: string[];
}

export interface DepartmentSeed {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  subcategories: SubcategorySeed[];
}

export interface TechnologySeed {
  slug: string;
  name: string;
  department: string;
  short: string;
  description: string;
  officialUrl?: string;
  icon?: string;
  featured?: boolean;
  topics: string[];
}

export interface ResourceSeed {
  /** Stable key, used as the slug and for roadmap references. */
  key: string;
  title: string;
  /** `null` only for resources awaiting their exact link (status: pending). */
  url: string | null;
  description: string;
  department: string;
  subcategory?: string;
  technologies: string[];
  level: Level;
  type: ResourceType;
  publisher: string;
  pricing: Pricing;
  source: SourceKind;
  language?: string;
  duration?: string;
  featured?: boolean;
  status?: "published" | "pending";
  note?: string;
}

export interface RoadmapStageSeed {
  title: string;
  summary: string;
  duration?: string;
  skills: string[];
  technologies: string[];
  /** Resource keys; prefix with "?" to mark a resource as optional. */
  resources: string[];
  projects: { title: string; description: string }[];
}

export interface RoadmapSeed {
  slug: string;
  title: string;
  summary: string;
  description: string;
  department?: string;
  level: Level;
  duration: string;
  icon: string;
  featured?: boolean;
  prerequisites: string[];
  outcomes: string[];
  certifications: { name: string; provider: string; url: string }[];
  stages: RoadmapStageSeed[];
}
