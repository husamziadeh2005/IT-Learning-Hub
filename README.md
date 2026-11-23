# Lets Code — The IT Learning Hub

A curated, structured library of IT learning resources. It covers nine departments: programming, web, cloud, DevOps, databases, computer science, mobile, AI/ML and UI/UX. It adds learning roadmaps, search and filtering, a student dashboard with bookmarks and progress tracking, and an admin CMS.

The platform does **not** host or copy courses. It links to the original publishers, describes each resource accurately and verifies every link.

| | |
|---|---|
| Frontend | Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Lucide |
| Backend | Supabase: Auth, Postgres, Row Level Security, Storage, migrations. No separate server. |
| Catalog | 9 departments · 115 technologies · 395 resources (394 published, 1 pending) · 19 roadmaps / 94 stages |

---

## Quick start (local)

Requirements: Node 24+, Docker (for the local Supabase stack).

```bash
npm install
npm run db:start          # starts Supabase in Docker, applies migrations + seed
cp .env.example .env.local
# Fill in .env.local with the values printed by `npx supabase status`:
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY>
npm run dev               # http://localhost:3000
```

Confirmation and password-reset emails are captured locally by Mailpit at <http://127.0.0.1:54324>.

### Make yourself an administrator

Sign up, confirm your email, then run this once:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com';
```

Locally: `docker exec -it $(docker ps -qf name=supabase_db) psql -U postgres -c "<sql>"`. On a hosted project, use the SQL editor. After that, grant roles to other users from **Admin → Users**.

---

## Deploying to production

1. **Create a Supabase project.** Keep the project ref.
2. **Apply the schema.**
   ```bash
   npx supabase login               # or set SUPABASE_ACCESS_TOKEN to a *scoped* token
   npx supabase link --project-ref <ref>
   npx supabase db push             # applies supabase/migrations/*
   ```
3. **Load the catalog**, which is safe to re-run because it is idempotent: run `supabase/seed.sql` in the SQL editor, or `psql "$DATABASE_URL" -f supabase/seed.sql`.
4. **Configure Auth** in the dashboard:
   - *URL configuration*: Site URL = `https://your-domain`; add `https://your-domain/**` to Redirect URLs.
   - *Email*: keep **Confirm email** enabled. Set up **custom SMTP**, because the default sender is rate-limited and new Free-plan projects can't customise templates without it.
   - *Password policy*: minimum 8 characters, letters and digits (this matches `supabase/config.toml`).
5. **Data API exposure.** New tables aren't auto-exposed on current projects. The migrations grant access explicitly, so nothing else is needed. Check that the `public` schema is in the exposed schemas list.
6. **Deploy the Next.js app** (Vercel, or any Node host) with these environment variables:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the project's **publishable** key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain` |

   The app never needs the secret / service-role key. **Do not** add it to any `NEXT_PUBLIC_` variable.
7. Create your first admin with the SQL above.

---

## Project structure

```
content/                 Source of truth for the seed catalog (typed TS data)
  departments.ts         9 departments + subcategories
  technologies.ts        115 technologies with curriculum outlines
  resources/*.ts         395 curated resources, one file per department
  roadmaps.ts            19 roadmaps, 94 stages
scripts/
  verify-urls.ts         Checks every URL (status + page title; YouTube via oEmbed)
  generate-seed.ts       Validates cross-references → supabase/seed.sql
  test-rls.ts            30 RLS tests against the local stack
supabase/
  migrations/            core schema · RLS + grants · storage
  seed.sql               Generated catalog (do not edit by hand)
  url-verification.json  Latest link-check report (merged into the seed)
src/
  proxy.ts               Session refresh + optimistic redirects (Next 16 "proxy")
  app/(site)/            Public pages: home, explore, departments, technologies,
                         roadmaps, library, search, resources, about, legal
  app/(auth)/            Login, sign-up, forgot / reset password
  app/auth/confirm/      Email-link handler (PKCE code + token_hash)
  app/dashboard/         Student dashboard (overview, roadmaps, saved, progress, history, profile)
  app/admin/             CMS (resources, departments, technologies, roadmaps, users)
  components/ui/         shadcn/ui primitives
  components/{site,catalog,learner,roadmap,dashboard,admin,forms,shared}/
  lib/supabase/          Browser, server (cookies), public (cache-safe) and proxy clients + generated types
  lib/auth/session.ts    Data Access Layer: getClaims() → verified user + roles
  lib/catalog/           Cached public queries, labels, filters, types
  lib/learner/           Per-user queries (RLS-scoped)
  lib/admin/             Staff queries + SSRF-safe URL checker
  lib/actions/           Server Actions: auth, learner, admin (all validated with zod)
  lib/validation/        zod schemas
```

## Architecture decisions

- **Catalog in Postgres, edited in the admin.** The `content/` files bootstrap a fresh database. After that, the database is authoritative. The seed uses `on conflict do nothing`, so re-running it never overwrites admin edits.
- **Static, cached public pages.** Catalog reads use a cookie-free Supabase client inside `"use cache"` functions tagged `catalog`. Every department, technology, roadmap and resource page is prerendered, about 540 paths. Admin Server Actions call `updateTag("catalog")`, so edits show up immediately.
- **Personalisation in the browser.** A `LearnerProvider` loads the signed-in user's bookmarks, progress, roadmaps and milestones after hydration (RLS returns only their own rows). Public pages therefore stay static for everyone. Writes go through Server Actions, with optimistic UI and rollback on failure.
- **Request-time pages behind Suspense.** The dashboard and admin read cookies inside `<Suspense>` boundaries, as Cache Components requires. The page shell still prerenders.
- **Authorisation in three layers.** The proxy only does cheap redirects. Every page and Server Action re-verifies with `getClaims()` and checks roles from `user_roles`. Postgres RLS is the final authority.

## Database & security

Tables: `departments`, `subcategories`, `technologies`, `subcategory_technologies`, `resources`, `resource_technologies`, `roadmaps`, `roadmap_stages`, `roadmap_stage_technologies`, `roadmap_resources`, `profiles`, `user_roles`, `bookmarks`, `user_progress`, `user_roadmaps`, `learning_milestones`.

- RLS is enabled on every table, and grants are explicit (`auto_expose_new_tables = false`).
- Visitors read only published content. Learners read and write only rows where `user_id = auth.uid()`; UPDATE policies use both `USING` and `WITH CHECK`.
- Roles live in `user_roles`, never in user-editable JWT metadata. Editors can create and edit content. Admins can also delete content and manage roles. A trigger refuses to remove the last admin.
- `SECURITY DEFINER` helpers (`private.is_staff()`, `private.has_role()`, `private.handle_new_user()`) live in the unexposed `private` schema and pin `search_path`. Search RPCs are `SECURITY INVOKER`.
- Storage: a public-read `avatars` bucket (2 MB, PNG/JPEG/WebP). Users can only write under `avatars/<their uid>/`.
- The admin link checker accepts only public http(s) hosts: it resolves DNS, rejects private, loopback and link-local addresses, and re-validates every redirect hop (SSRF protection).
- `npx supabase db advisors` reports no security or performance issues.

## Content maintenance

```bash
npm run content:verify   # re-check every URL → supabase/url-verification.json
npm run content:seed     # validate content + regenerate supabase/seed.sql
npm run db:reset         # rebuild the local DB from migrations + seed
npm run test:rls         # run the RLS test suite (local only)
npm run db:types         # regenerate src/lib/supabase/database.types.ts
```

Link-status meanings: **Verified** (200 on the same page), **Redirects** (works, but moved), **Bot-protected** (the site blocks automated checks, e.g. Cloudflare or O'Reilly, so verify by hand), **Broken**.

### Pending: the Nexavena cloud tutorial

The four-hour Cloud Fundamentals tutorial by **Nexavena** is in the catalog as a **pending** resource with no URL (`nexavena-cloud-computing-tutorial`), as requested. It is listed first in the Cloud Engineer, Azure and AWS roadmaps, and stays hidden from the public until it is published. To activate it:

1. Open **Admin → Resources → filter Status: Pending**, then open the Nexavena entry.
2. Paste the exact YouTube URL, confirm the duration and pricing, set Status to **Published** and save. The link is verified automatically on save.
