-- =============================================================================
-- IT Learning Hub — core schema
--
-- Catalog:   departments → subcategories ⇄ technologies ⇄ resources
--            roadmaps → roadmap_stages → (technologies, resources)
-- Learners:  profiles, user_roles, bookmarks, user_progress,
--            user_roadmaps, learning_milestones
--
-- Conventions
--   * Internal keys are `bigint generated always as identity` (sequential,
--     index-friendly). User-owned rows key on auth.users(id) (uuid).
--   * Every foreign key column is indexed (either by a PK/unique whose leading
--     column it is, or by an explicit index) so joins and ON DELETE cascades
--     never sequential-scan.
--   * Public URLs use human-readable slugs; ids never appear in URLs.
--   * Privileged helper functions live in the unexposed `private` schema.
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

-- -----------------------------------------------------------------------------
-- Enumerations
-- -----------------------------------------------------------------------------
create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');

create type public.resource_type as enum (
  'documentation',      -- official documentation / reference
  'video',              -- single video or playlist
  'course',             -- structured multi-lesson course
  'tutorial',           -- written step-by-step guide
  'book',               -- book or long-form handbook
  'university_lecture', -- university lecture series / OCW
  'interactive',        -- interactive exercises / coding practice
  'repository',         -- GitHub repository
  'certification',      -- certification preparation
  'lab',                -- hands-on practical lab
  'article'             -- engineering blog post / article
);

create type public.pricing_model as enum ('free', 'freemium', 'paid', 'unknown');
create type public.source_kind as enum ('official', 'community');
create type public.content_status as enum ('draft', 'pending', 'published', 'archived');
create type public.url_check_status as enum ('unchecked', 'ok', 'redirected', 'broken', 'blocked');
create type public.app_role as enum ('admin', 'editor');
create type public.progress_status as enum ('in_progress', 'completed');
create type public.roadmap_enrollment_status as enum ('active', 'paused', 'completed');

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Catalog: departments
-- -----------------------------------------------------------------------------
create table public.departments (
  id           bigint generated always as identity primary key,
  slug         text not null unique
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64),
  name         text not null check (char_length(name) between 2 and 80),
  tagline      text not null default '' check (char_length(tagline) <= 160),
  description  text not null default '' check (char_length(description) <= 2000),
  icon         text not null default 'book-open' check (char_length(icon) <= 40),
  accent       text not null default 'slate' check (char_length(accent) <= 20),
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index departments_sort_idx on public.departments (sort_order, name);

-- -----------------------------------------------------------------------------
-- Catalog: subcategories (belong to exactly one department)
-- -----------------------------------------------------------------------------
create table public.subcategories (
  id            bigint generated always as identity primary key,
  department_id bigint not null references public.departments (id) on delete cascade,
  slug          text not null
                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64),
  name          text not null check (char_length(name) between 2 and 80),
  description   text not null default '' check (char_length(description) <= 1000),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (department_id, slug)
);
-- (department_id, slug) unique index also serves department_id lookups / FK.

-- -----------------------------------------------------------------------------
-- Catalog: technologies (a primary home department; placed into any number of
-- subcategories, so e.g. TypeScript can live in Languages *and* Frontend)
-- -----------------------------------------------------------------------------
create table public.technologies (
  id                bigint generated always as identity primary key,
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64),
  name              text not null check (char_length(name) between 1 and 80),
  short_description text not null default '' check (char_length(short_description) <= 200),
  description       text not null default '' check (char_length(description) <= 3000),
  department_id     bigint not null references public.departments (id) on delete restrict,
  official_url      text check (official_url ~ '^https://'),
  -- Ordered curriculum outline shown on the technology page.
  topics            text[] not null default '{}',
  icon              text not null default 'code' check (char_length(icon) <= 40),
  is_featured       boolean not null default false,
  is_published      boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index technologies_department_idx on public.technologies (department_id);
create index technologies_featured_idx on public.technologies (sort_order) where is_featured;
create index technologies_name_trgm_idx on public.technologies using gin (name extensions.gin_trgm_ops);

create table public.subcategory_technologies (
  subcategory_id bigint not null references public.subcategories (id) on delete cascade,
  technology_id  bigint not null references public.technologies (id) on delete cascade,
  sort_order     integer not null default 0,
  primary key (subcategory_id, technology_id)
);

create index subcategory_technologies_technology_idx on public.subcategory_technologies (technology_id);

-- -----------------------------------------------------------------------------
-- Catalog: resources
-- A resource may be `pending` without a URL (e.g. awaiting the exact link from
-- the curator). Anything published must have a verified-format https URL.
-- -----------------------------------------------------------------------------
create table public.resources (
  id              bigint generated always as identity primary key,
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 96),
  title           text not null check (char_length(title) between 2 and 200),
  description     text not null check (char_length(description) between 10 and 2000),
  url             text unique check (url ~ '^https?://' and char_length(url) <= 2048),
  department_id   bigint not null references public.departments (id) on delete restrict,
  subcategory_id  bigint references public.subcategories (id) on delete set null,
  level           public.difficulty_level not null,
  type            public.resource_type not null,
  publisher       text not null check (char_length(publisher) between 1 and 120),
  pricing         public.pricing_model not null default 'unknown',
  source_kind     public.source_kind not null,
  language        text not null default 'English' check (char_length(language) <= 40),
  duration_label  text check (char_length(duration_label) <= 40),
  status          public.content_status not null default 'draft',
  is_featured     boolean not null default false,
  url_status      public.url_check_status not null default 'unchecked',
  url_http_status smallint,
  url_checked_at  timestamptz,
  curator_note    text check (char_length(curator_note) <= 1000),
  created_by      uuid references auth.users (id) on delete set null,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  search          tsvector generated always as (
                    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(publisher, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(description, '')), 'C')
                  ) stored,
  constraint resources_url_required_unless_pending
    check (url is not null or status in ('pending', 'draft'))
);

create index resources_department_idx on public.resources (department_id);
create index resources_subcategory_idx on public.resources (subcategory_id);
create index resources_created_by_idx on public.resources (created_by);
create index resources_published_recent_idx on public.resources (published_at desc)
  where status = 'published';
create index resources_featured_idx on public.resources (published_at desc)
  where status = 'published' and is_featured;
create index resources_search_idx on public.resources using gin (search);
create index resources_title_trgm_idx on public.resources using gin (title extensions.gin_trgm_ops);

create table public.resource_technologies (
  resource_id   bigint not null references public.resources (id) on delete cascade,
  technology_id bigint not null references public.technologies (id) on delete cascade,
  primary key (resource_id, technology_id)
);

create index resource_technologies_technology_idx on public.resource_technologies (technology_id);

-- Stamp published_at the first time a resource is published.
create or replace function private.stamp_published_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Catalog: roadmaps
-- -----------------------------------------------------------------------------
create table public.roadmaps (
  id                 bigint generated always as identity primary key,
  slug               text not null unique
                     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64),
  title              text not null check (char_length(title) between 2 and 120),
  summary            text not null default '' check (char_length(summary) <= 300),
  description        text not null default '' check (char_length(description) <= 4000),
  department_id      bigint references public.departments (id) on delete set null,
  level              public.difficulty_level not null default 'beginner',
  estimated_duration text check (char_length(estimated_duration) <= 60),
  prerequisites      text[] not null default '{}',
  outcomes           text[] not null default '{}',
  -- [{ "name": "...", "provider": "...", "url": "https://..." }]
  certifications     jsonb not null default '[]'::jsonb
                     check (jsonb_typeof(certifications) = 'array'),
  icon               text not null default 'route' check (char_length(icon) <= 40),
  is_featured        boolean not null default false,
  status             public.content_status not null default 'draft',
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index roadmaps_department_idx on public.roadmaps (department_id);
create index roadmaps_published_idx on public.roadmaps (sort_order) where status = 'published';

create table public.roadmap_stages (
  id                 bigint generated always as identity primary key,
  roadmap_id         bigint not null references public.roadmaps (id) on delete cascade,
  position           smallint not null check (position >= 1),
  title              text not null check (char_length(title) between 2 and 120),
  summary            text not null default '' check (char_length(summary) <= 600),
  skills             text[] not null default '{}',
  -- [{ "title": "...", "description": "..." }]
  projects           jsonb not null default '[]'::jsonb
                     check (jsonb_typeof(projects) = 'array'),
  estimated_duration text check (char_length(estimated_duration) <= 60),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- deferrable so two stages can swap positions inside one transaction
  constraint roadmap_stages_position_unique unique (roadmap_id, position)
    deferrable initially immediate
);

create table public.roadmap_stage_technologies (
  stage_id      bigint not null references public.roadmap_stages (id) on delete cascade,
  technology_id bigint not null references public.technologies (id) on delete cascade,
  primary key (stage_id, technology_id)
);

create index roadmap_stage_technologies_technology_idx on public.roadmap_stage_technologies (technology_id);

create table public.roadmap_resources (
  stage_id    bigint not null references public.roadmap_stages (id) on delete cascade,
  resource_id bigint not null references public.resources (id) on delete cascade,
  position    smallint not null default 1,
  is_optional boolean not null default false,
  primary key (stage_id, resource_id)
);

create index roadmap_resources_resource_idx on public.roadmap_resources (resource_id);

-- -----------------------------------------------------------------------------
-- Learners
-- -----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  headline     text not null default '' check (char_length(headline) <= 120),
  bio          text not null default '' check (char_length(bio) <= 600),
  avatar_path  text check (char_length(avatar_path) <= 300),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Authorization data lives here — never in user-editable auth metadata.
create table public.user_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index user_roles_granted_by_idx on public.user_roles (granted_by);

create table public.bookmarks (
  user_id     uuid not null references auth.users (id) on delete cascade,
  resource_id bigint not null references public.resources (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, resource_id)
);

create index bookmarks_resource_idx on public.bookmarks (resource_id);
create index bookmarks_user_recent_idx on public.bookmarks (user_id, created_at desc);

create table public.user_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  resource_id  bigint not null references public.resources (id) on delete cascade,
  status       public.progress_status not null default 'in_progress',
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, resource_id),
  constraint user_progress_completed_at_matches_status
    check ((status = 'completed') = (completed_at is not null))
);

create index user_progress_resource_idx on public.user_progress (resource_id);
create index user_progress_user_recent_idx on public.user_progress (user_id, updated_at desc);

create table public.user_roadmaps (
  user_id      uuid not null references auth.users (id) on delete cascade,
  roadmap_id   bigint not null references public.roadmaps (id) on delete cascade,
  status       public.roadmap_enrollment_status not null default 'active',
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, roadmap_id)
);

create index user_roadmaps_roadmap_idx on public.user_roadmaps (roadmap_id);

-- A milestone = a roadmap stage the learner has marked complete.
create table public.learning_milestones (
  user_id      uuid not null references auth.users (id) on delete cascade,
  stage_id     bigint not null references public.roadmap_stages (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, stage_id)
);

create index learning_milestones_stage_idx on public.learning_milestones (stage_id);
create index learning_milestones_user_recent_idx on public.learning_milestones (user_id, completed_at desc);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
create trigger set_updated_at before update on public.departments
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.subcategories
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.technologies
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.resources
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.roadmaps
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.roadmap_stages
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.user_progress
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.user_roadmaps
  for each row execute function private.set_updated_at();

create trigger stamp_published_at before insert or update of status on public.resources
  for each row execute function private.stamp_published_at();

-- Create a profile row for every new auth user.
-- SECURITY DEFINER is required: the inserting role (supabase_auth_admin) has no
-- grant on public.profiles. The function lives in the unexposed `private`
-- schema, pins search_path, and only ever writes the new user's own row.
-- display_name comes from user metadata: that is fine for *display*, and it is
-- never used for authorization.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
                  split_part(new.email, '@', 1), ''), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- -----------------------------------------------------------------------------
-- Authorization helpers (used by RLS policies)
-- SECURITY DEFINER so policies can consult user_roles without recursive RLS;
-- they only ever inspect the *calling* user's own roles via auth.uid().
-- -----------------------------------------------------------------------------
create or replace function private.has_role(required public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = required
  );
$$;

-- Staff = may curate content (admins and editors).
create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role in ('admin', 'editor')
  );
$$;

revoke all on function private.has_role(public.app_role) from public;
revoke all on function private.is_staff() from public;

-- Keep at least one administrator: refuse to delete the last admin role.
create or replace function private.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'admin'
     and not exists (
       select 1 from public.user_roles
       where role = 'admin' and user_id <> old.user_id
     ) then
    raise exception 'Cannot remove the last administrator'
      using errcode = 'check_violation';
  end if;
  return old;
end;
$$;

revoke all on function private.protect_last_admin() from public;

create trigger protect_last_admin before delete on public.user_roles
  for each row execute function private.protect_last_admin();

-- -----------------------------------------------------------------------------
-- Search
-- SECURITY INVOKER: callers see exactly the rows RLS lets them see.
-- -----------------------------------------------------------------------------
create or replace function public.search_resources(
  q            text default null,
  p_department text default null,
  p_technology text default null,
  p_levels     public.difficulty_level[] default null,
  p_types      public.resource_type[] default null,
  p_pricing    public.pricing_model[] default null,
  p_sort       text default 'relevance',
  p_limit      integer default 24,
  p_offset     integer default 0
)
returns table (
  id              bigint,
  slug            text,
  title           text,
  description     text,
  url             text,
  level           public.difficulty_level,
  type            public.resource_type,
  publisher       text,
  pricing         public.pricing_model,
  source_kind     public.source_kind,
  language        text,
  duration_label  text,
  is_featured     boolean,
  published_at    timestamptz,
  department_slug text,
  department_name text,
  technologies    jsonb,
  rank            real,
  total_count     bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      nullif(trim(q), '') as term,
      case when nullif(trim(q), '') is null then null
           else websearch_to_tsquery('english', trim(q)) end as tsq,
      case when nullif(trim(q), '') is null then null
           else '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%'
      end as pattern,
      least(greatest(coalesce(p_limit, 24), 1), 60) as lim,
      greatest(coalesce(p_offset, 0), 0) as off
  ),
  matches as (
    select
      r.*,
      d.slug as d_slug,
      d.name as d_name,
      case when p.term is null then 0::real
           else ts_rank(r.search, p.tsq)
                + case when r.title ilike p.pattern then 0.5 else 0 end
      end::real as score
    from public.resources r
    join public.departments d on d.id = r.department_id
    cross join params p
    where r.status = 'published'
      and (p.term is null
           or r.search @@ p.tsq
           or r.title ilike p.pattern
           or r.publisher ilike p.pattern)
      and (p_department is null or d.slug = p_department)
      and (p_technology is null or exists (
            select 1
            from public.resource_technologies rt
            join public.technologies t on t.id = rt.technology_id
            where rt.resource_id = r.id and t.slug = p_technology))
      and (p_levels is null or cardinality(p_levels) = 0 or r.level = any (p_levels))
      and (p_types is null or cardinality(p_types) = 0 or r.type = any (p_types))
      and (p_pricing is null or cardinality(p_pricing) = 0 or r.pricing = any (p_pricing))
  )
  select
    m.id, m.slug, m.title, m.description, m.url, m.level, m.type, m.publisher,
    m.pricing, m.source_kind, m.language, m.duration_label, m.is_featured,
    m.published_at, m.d_slug, m.d_name,
    coalesce((
      select jsonb_agg(jsonb_build_object('slug', t.slug, 'name', t.name) order by t.name)
      from public.resource_technologies rt
      join public.technologies t on t.id = rt.technology_id
      where rt.resource_id = m.id
    ), '[]'::jsonb) as technologies,
    m.score as rank,
    count(*) over () as total_count
  from matches m
  cross join params p
  order by
    case when p_sort = 'title' then lower(m.title) end asc,
    case when p_sort = 'newest' then m.published_at end desc nulls last,
    case when p_sort = 'level' then m.level end asc,
    case when coalesce(p_sort, 'relevance') = 'relevance' then m.score end desc,
    m.is_featured desc,
    m.published_at desc nulls last,
    m.id
  limit (select lim from params)
  offset (select off from params);
$$;

-- Lightweight cross-entity search for the global search box.
create or replace function public.search_catalog(q text, per_group integer default 6)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with p as (
    select
      '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern,
      least(greatest(coalesce(per_group, 6), 1), 20) as lim
    where nullif(trim(q), '') is not null
  )
  select jsonb_build_object(
    'departments', coalesce((
      select jsonb_agg(x) from (
        select d.slug, d.name, d.tagline, d.icon
        from public.departments d, p
        where d.is_published and (d.name ilike p.pattern or d.tagline ilike p.pattern)
        order by d.sort_order
        limit (select lim from p)
      ) x), '[]'::jsonb),
    'technologies', coalesce((
      select jsonb_agg(x) from (
        select t.slug, t.name, t.short_description, t.icon, d.slug as department_slug
        from public.technologies t
        join public.departments d on d.id = t.department_id, p
        where t.is_published and (t.name ilike p.pattern or t.short_description ilike p.pattern)
        order by (t.name ilike p.pattern) desc, t.is_featured desc, t.name
        limit (select lim from p)
      ) x), '[]'::jsonb),
    'roadmaps', coalesce((
      select jsonb_agg(x) from (
        select r.slug, r.title, r.summary, r.icon, r.level
        from public.roadmaps r, p
        where r.status = 'published' and (r.title ilike p.pattern or r.summary ilike p.pattern)
        order by r.sort_order
        limit (select lim from p)
      ) x), '[]'::jsonb)
  )
  from p;
$$;
