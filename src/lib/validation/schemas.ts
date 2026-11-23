import { z } from "zod";
import { ACCENT_NAMES, CONTENT_STATUSES, LEVELS, PRICING, RESOURCE_TYPES, SOURCE_KINDS } from "@/lib/catalog/labels";

const values = <T extends { value: string }>(list: readonly T[]) => list.map((i) => i.value) as [T["value"], ...T["value"][]];

export const email = z.email({ error: "Enter a valid email address." }).trim().toLowerCase().max(254);
export const password = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(72, { error: "Use at most 72 characters." })
  .regex(/[A-Za-z]/, { error: "Include at least one letter." })
  .regex(/[0-9]/, { error: "Include at least one number." });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }).max(72),
});

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2, { error: "Enter at least 2 characters." }).max(80),
    email,
    password,
    confirmPassword: z.string(),
    terms: z.literal("on", { error: "You need to accept the terms to continue." }),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], error: "Passwords do not match." });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], error: "Passwords do not match." });

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, { error: "Enter at least 2 characters." }).max(80),
  headline: z.string().trim().max(120).default(""),
  bio: z.string().trim().max(600).default(""),
});

// ── Admin ───────────────────────────────────────────────────────────────────
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(96)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Use lowercase letters, numbers and single hyphens." });
const httpsUrl = z
  .url({ protocol: /^https?$/, error: "Enter a full http(s) URL." })
  .trim()
  .max(2048);
const optionalText = (max: number) => z.string().trim().max(max).default("");
const id = z.coerce.number().int().positive();
const lines = z
  .string()
  .default("")
  .transform((s) => s.split("\n").map((l) => l.trim()).filter(Boolean));

export const departmentSchema = z.object({
  id: id.optional(),
  slug,
  name: z.string().trim().min(2).max(80),
  tagline: optionalText(160),
  description: optionalText(2000),
  icon: z.string().trim().min(1).max(40),
  accent: z.enum(ACCENT_NAMES as [string, ...string[]]),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_published: z.coerce.boolean().default(false),
});

export const subcategorySchema = z.object({
  id: id.optional(),
  department_id: id,
  slug,
  name: z.string().trim().min(2).max(80),
  description: optionalText(1000),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const technologySchema = z.object({
  id: id.optional(),
  slug,
  name: z.string().trim().min(1).max(80),
  short_description: optionalText(200),
  description: optionalText(3000),
  department_id: id,
  official_url: z.union([z.literal(""), httpsUrl.refine((u) => u.startsWith("https://"), { error: "Official URLs must use https." })]).default(""),
  topics: lines,
  icon: z.string().trim().min(1).max(40),
  is_featured: z.coerce.boolean().default(false),
  is_published: z.coerce.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  subcategory_ids: z.array(id).default([]),
});

export const resourceSchema = z
  .object({
    id: id.optional(),
    slug,
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().min(10, { error: "Write at least a sentence." }).max(2000),
    url: z.union([z.literal(""), httpsUrl]).default(""),
    department_id: id,
    subcategory_id: z.union([z.literal(""), id]).default(""),
    level: z.enum(values(LEVELS)),
    type: z.enum(values(RESOURCE_TYPES)),
    publisher: z.string().trim().min(1).max(120),
    pricing: z.enum(values(PRICING)),
    source_kind: z.enum(values(SOURCE_KINDS)),
    language: z.string().trim().min(1).max(40).default("English"),
    duration_label: optionalText(40),
    status: z.enum(values(CONTENT_STATUSES)),
    is_featured: z.coerce.boolean().default(false),
    curator_note: optionalText(1000),
    technology_ids: z.array(id).default([]),
  })
  .refine((v) => v.url !== "" || v.status === "pending" || v.status === "draft", {
    path: ["url"],
    error: "A URL is required before publishing. Save as Pending or Draft until you have the link.",
  });

export const roadmapSchema = z.object({
  id: id.optional(),
  slug,
  title: z.string().trim().min(2).max(120),
  summary: optionalText(300),
  description: optionalText(4000),
  department_id: z.union([z.literal(""), id]).default(""),
  level: z.enum(values(LEVELS)),
  estimated_duration: optionalText(60),
  prerequisites: lines,
  outcomes: lines,
  certifications: z
    .string()
    .default("")
    .transform((s, ctx) => {
      // One per line: Name | Provider | https://url
      const out: { name: string; provider: string; url: string }[] = [];
      for (const [i, line] of s.split("\n").map((l) => l.trim()).filter(Boolean).entries()) {
        const [name, provider, url] = line.split("|").map((p) => p?.trim() ?? "");
        if (!name || !provider || !/^https:\/\//.test(url ?? "")) {
          ctx.addIssue({ code: "custom", message: `Certification line ${i + 1} must be "Name | Provider | https://…"` });
          continue;
        }
        out.push({ name, provider, url });
      }
      return out;
    }),
  icon: z.string().trim().min(1).max(40),
  is_featured: z.coerce.boolean().default(false),
  status: z.enum(values(CONTENT_STATUSES)),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const stageSchema = z.object({
  id: id.optional(),
  roadmap_id: id,
  title: z.string().trim().min(2).max(120),
  summary: optionalText(600),
  estimated_duration: optionalText(60),
  skills: lines,
  projects: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [title, ...rest] = line.split("|");
          return { title: title.trim(), description: rest.join("|").trim() };
        }),
    ),
  technology_ids: z.array(id).default([]),
  resource_ids: z.array(id).default([]),
  optional_resource_ids: z.array(id).default([]),
});

/** Turn FormData into a plain object, collecting repeated keys into arrays. */
export function formToObject(form: FormData, arrayKeys: string[] = []) {
  const out: Record<string, unknown> = {};
  for (const key of new Set(form.keys())) {
    if (key.startsWith("$")) continue; // React internal action fields
    const all = form.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = arrayKeys.includes(key) ? all : all[0];
  }
  for (const key of arrayKeys) if (!(key in out)) out[key] = [];
  return out;
}

export type FieldErrors = Record<string, string[] | undefined>;
export type FormState = { ok: boolean; message?: string; fieldErrors?: FieldErrors; values?: Record<string, string> } | null;

/** Auth forms can also offer to resend the confirmation email and, in local dev, link to the captured inbox. */
export type AuthFormState = (NonNullable<FormState> & { resendEmail?: string; devInboxUrl?: string }) | null;

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
