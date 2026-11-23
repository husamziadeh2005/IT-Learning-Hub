import type { Database } from "@/lib/supabase/database.types";

type Enums = Database["public"]["Enums"];
export type Level = Enums["difficulty_level"];
export type ResourceType = Enums["resource_type"];
export type Pricing = Enums["pricing_model"];
export type SourceKind = Enums["source_kind"];
export type ContentStatus = Enums["content_status"];
export type UrlCheckStatus = Enums["url_check_status"];
export type AppRole = Enums["app_role"];

export const LEVELS: { value: Level; label: string; short: string }[] = [
  { value: "beginner", label: "Beginner", short: "Beg" },
  { value: "intermediate", label: "Intermediate", short: "Int" },
  { value: "advanced", label: "Advanced", short: "Adv" },
];

export const RESOURCE_TYPES: { value: ResourceType; label: string; plural: string }[] = [
  { value: "documentation", label: "Official documentation", plural: "Documentation" },
  { value: "course", label: "Course", plural: "Courses" },
  { value: "video", label: "Video", plural: "Videos" },
  { value: "tutorial", label: "Tutorial", plural: "Tutorials" },
  { value: "book", label: "Book", plural: "Books" },
  { value: "university_lecture", label: "University lecture", plural: "University lectures" },
  { value: "interactive", label: "Interactive exercise", plural: "Interactive exercises" },
  { value: "repository", label: "GitHub repository", plural: "Repositories" },
  { value: "certification", label: "Certification", plural: "Certifications" },
  { value: "lab", label: "Practical lab", plural: "Labs" },
  { value: "article", label: "Article", plural: "Articles" },
];

export const PRICING: { value: Pricing; label: string; hint: string }[] = [
  { value: "free", label: "Free", hint: "Free to access" },
  { value: "freemium", label: "Free + paid", hint: "Free to start; some content, certificates or features are paid" },
  { value: "paid", label: "Paid", hint: "Requires payment" },
  { value: "unknown", label: "Pricing unverified", hint: "We have not verified the pricing yet" },
];

export const SOURCE_KINDS: { value: SourceKind; label: string }[] = [
  { value: "official", label: "Official" },
  { value: "community", label: "Community" },
];

export const CONTENT_STATUSES: { value: ContentStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "archived", label: "Archived" },
];

export const URL_STATUSES: { value: UrlCheckStatus; label: string; tone: "ok" | "warn" | "bad" | "idle" }[] = [
  { value: "ok", label: "Verified", tone: "ok" },
  { value: "redirected", label: "Redirects", tone: "warn" },
  { value: "blocked", label: "Bot-protected", tone: "warn" },
  { value: "broken", label: "Broken", tone: "bad" },
  { value: "unchecked", label: "Unchecked", tone: "idle" },
];

const lookup = <T extends { value: string }>(list: T[]) => (value: string) => list.find((i) => i.value === value);
export const levelLabel = (v: string) => lookup(LEVELS)(v)?.label ?? v;
export const typeLabel = (v: string) => lookup(RESOURCE_TYPES)(v)?.label ?? v;
export const pricingLabel = (v: string) => lookup(PRICING)(v)?.label ?? v;
export const statusLabel = (v: string) => lookup(CONTENT_STATUSES)(v)?.label ?? v;
export const urlStatus = (v: string) => lookup(URL_STATUSES)(v) ?? URL_STATUSES[4];

export const SORTS = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Recently added" },
  { value: "title", label: "Alphabetical" },
  { value: "level", label: "Difficulty" },
] as const;
export type Sort = (typeof SORTS)[number]["value"];

/** Department accent → Tailwind classes. Full class names so Tailwind sees them. */
export const ACCENTS: Record<string, { dot: string; soft: string; text: string; ring: string }> = {
  amber: { dot: "bg-amber-500", soft: "bg-amber-500/10", text: "text-amber-800 dark:text-amber-300", ring: "ring-amber-500/30" },
  blue: { dot: "bg-blue-500", soft: "bg-blue-500/10", text: "text-blue-800 dark:text-blue-300", ring: "ring-blue-500/30" },
  sky: { dot: "bg-sky-500", soft: "bg-sky-500/10", text: "text-sky-800 dark:text-sky-300", ring: "ring-sky-500/30" },
  emerald: { dot: "bg-emerald-500", soft: "bg-emerald-500/10", text: "text-emerald-800 dark:text-emerald-300", ring: "ring-emerald-500/30" },
  violet: { dot: "bg-violet-500", soft: "bg-violet-500/10", text: "text-violet-800 dark:text-violet-300", ring: "ring-violet-500/30" },
  rose: { dot: "bg-rose-500", soft: "bg-rose-500/10", text: "text-rose-800 dark:text-rose-300", ring: "ring-rose-500/30" },
  teal: { dot: "bg-teal-500", soft: "bg-teal-500/10", text: "text-teal-800 dark:text-teal-300", ring: "ring-teal-500/30" },
  indigo: { dot: "bg-indigo-500", soft: "bg-indigo-500/10", text: "text-indigo-800 dark:text-indigo-300", ring: "ring-indigo-500/30" },
  orange: { dot: "bg-orange-500", soft: "bg-orange-500/10", text: "text-orange-800 dark:text-orange-300", ring: "ring-orange-500/30" },
  slate: { dot: "bg-slate-500", soft: "bg-slate-500/10", text: "text-slate-800 dark:text-slate-300", ring: "ring-slate-500/30" },
};
export const accent = (name: string | null | undefined) => ACCENTS[name ?? "slate"] ?? ACCENTS.slate;
export const ACCENT_NAMES = Object.keys(ACCENTS);
