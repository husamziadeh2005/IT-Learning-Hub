-- =============================================================================
-- IT Learning Hub — Row Level Security and explicit Data API grants
--
-- Access model
--   anon           read published catalog content
--   authenticated  read published catalog content; full control of *own*
--                  learning data (bookmarks, progress, roadmaps, milestones,
--                  profile)
--   editor/admin   (authenticated + user_roles row) read everything, write
--                  catalog content
--   admin          additionally manage user roles and read all profiles
--
-- New tables are not exposed to the Data API by default (supabase/config.toml
-- `auto_expose_new_tables = false`, matching current hosted defaults), so
-- every grant below is deliberate. Grants decide *whether* a role may touch a
-- table; RLS decides *which rows*.
-- =============================================================================

-- Policies call private.* helpers as the invoking role.
grant usage on schema private to anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.has_role(public.app_role) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS on every table in the exposed schema
-- -----------------------------------------------------------------------------
alter table public.departments                enable row level security;
alter table public.subcategories              enable row level security;
alter table public.technologies               enable row level security;
alter table public.subcategory_technologies   enable row level security;
alter table public.resources                  enable row level security;
alter table public.resource_technologies      enable row level security;
alter table public.roadmaps                   enable row level security;
alter table public.roadmap_stages             enable row level security;
alter table public.roadmap_stage_technologies enable row level security;
alter table public.roadmap_resources          enable row level security;
alter table public.profiles                   enable row level security;
alter table public.user_roles                 enable row level security;
alter table public.bookmarks                  enable row level security;
alter table public.user_progress              enable row level security;
alter table public.user_roadmaps              enable row level security;
alter table public.learning_milestones        enable row level security;

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- Catalog: everyone may read (RLS limits to published rows); signed-in users
-- may attempt writes, which RLS only allows for staff.
grant select on
  public.departments, public.subcategories, public.technologies,
  public.subcategory_technologies, public.resources, public.resource_technologies,
  public.roadmaps, public.roadmap_stages, public.roadmap_stage_technologies,
  public.roadmap_resources
to anon, authenticated;

grant insert, update, delete on
  public.departments, public.subcategories, public.technologies,
  public.subcategory_technologies, public.resources, public.resource_technologies,
  public.roadmaps, public.roadmap_stages, public.roadmap_stage_technologies,
  public.roadmap_resources
to authenticated;

-- Learner data: signed-in users only.
grant select, insert, update, delete on
  public.bookmarks, public.user_progress, public.user_roadmaps, public.learning_milestones
to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.user_roles to authenticated;

-- Server-side maintenance with the secret key (never shipped to browsers).
grant select, insert, update, delete on all tables in schema public to service_role;

-- RPC functions (RLS still applies inside: both are SECURITY INVOKER).
revoke all on function public.search_resources(
  text, text, text, public.difficulty_level[], public.resource_type[],
  public.pricing_model[], text, integer, integer) from public;
grant execute on function public.search_resources(
  text, text, text, public.difficulty_level[], public.resource_type[],
  public.pricing_model[], text, integer, integer) to anon, authenticated, service_role;

revoke all on function public.search_catalog(text, integer) from public;
grant execute on function public.search_catalog(text, integer) to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Catalog policies
-- Read: published rows for everyone, all rows for staff.
-- Write: staff only. UPDATE policies carry both USING and WITH CHECK.
-- -----------------------------------------------------------------------------

-- departments
create policy "Published departments are readable"
  on public.departments for select to anon, authenticated
  using (is_published or (select private.is_staff()));
create policy "Staff insert departments"
  on public.departments for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update departments"
  on public.departments for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Admins delete departments"
  on public.departments for delete to authenticated
  using ((select private.has_role('admin')));

-- subcategories (visible when their department is)
create policy "Subcategories of published departments are readable"
  on public.subcategories for select to anon, authenticated
  using (
    (select private.is_staff())
    or exists (select 1 from public.departments d
               where d.id = department_id and d.is_published)
  );
create policy "Staff insert subcategories"
  on public.subcategories for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update subcategories"
  on public.subcategories for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Staff delete subcategories"
  on public.subcategories for delete to authenticated
  using ((select private.is_staff()));

-- technologies
create policy "Published technologies are readable"
  on public.technologies for select to anon, authenticated
  using (is_published or (select private.is_staff()));
create policy "Staff insert technologies"
  on public.technologies for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update technologies"
  on public.technologies for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Admins delete technologies"
  on public.technologies for delete to authenticated
  using ((select private.has_role('admin')));

-- subcategory_technologies (pure id mapping; parents carry their own RLS)
create policy "Subcategory placements are readable"
  on public.subcategory_technologies for select to anon, authenticated
  using (true);
create policy "Staff insert subcategory placements"
  on public.subcategory_technologies for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update subcategory placements"
  on public.subcategory_technologies for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Staff delete subcategory placements"
  on public.subcategory_technologies for delete to authenticated
  using ((select private.is_staff()));

-- resources: drafts / pending / archived are staff-only
create policy "Published resources are readable"
  on public.resources for select to anon, authenticated
  using (status = 'published' or (select private.is_staff()));
create policy "Staff insert resources"
  on public.resources for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update resources"
  on public.resources for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Admins delete resources"
  on public.resources for delete to authenticated
  using ((select private.has_role('admin')));

-- resource_technologies
create policy "Resource technology links are readable"
  on public.resource_technologies for select to anon, authenticated
  using (true);
create policy "Staff insert resource technology links"
  on public.resource_technologies for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff delete resource technology links"
  on public.resource_technologies for delete to authenticated
  using ((select private.is_staff()));

-- roadmaps
create policy "Published roadmaps are readable"
  on public.roadmaps for select to anon, authenticated
  using (status = 'published' or (select private.is_staff()));
create policy "Staff insert roadmaps"
  on public.roadmaps for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update roadmaps"
  on public.roadmaps for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Admins delete roadmaps"
  on public.roadmaps for delete to authenticated
  using ((select private.has_role('admin')));

-- roadmap_stages (visible when their roadmap is)
create policy "Stages of published roadmaps are readable"
  on public.roadmap_stages for select to anon, authenticated
  using (
    (select private.is_staff())
    or exists (select 1 from public.roadmaps r
               where r.id = roadmap_id and r.status = 'published')
  );
create policy "Staff insert stages"
  on public.roadmap_stages for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update stages"
  on public.roadmap_stages for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Staff delete stages"
  on public.roadmap_stages for delete to authenticated
  using ((select private.is_staff()));

-- roadmap_stage_technologies
create policy "Stage technologies are readable"
  on public.roadmap_stage_technologies for select to anon, authenticated
  using (true);
create policy "Staff insert stage technologies"
  on public.roadmap_stage_technologies for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff delete stage technologies"
  on public.roadmap_stage_technologies for delete to authenticated
  using ((select private.is_staff()));

-- roadmap_resources
create policy "Stage resources are readable"
  on public.roadmap_resources for select to anon, authenticated
  using (true);
create policy "Staff insert stage resources"
  on public.roadmap_resources for insert to authenticated
  with check ((select private.is_staff()));
create policy "Staff update stage resources"
  on public.roadmap_resources for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "Staff delete stage resources"
  on public.roadmap_resources for delete to authenticated
  using ((select private.is_staff()));

-- -----------------------------------------------------------------------------
-- Profiles and roles
-- -----------------------------------------------------------------------------
create policy "Users read own profile; admins read all"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select private.has_role('admin')));
create policy "Users create own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users read own roles; admins read all"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id or (select private.has_role('admin')));
create policy "Admins grant roles"
  on public.user_roles for insert to authenticated
  with check ((select private.has_role('admin')));
create policy "Admins revoke roles"
  on public.user_roles for delete to authenticated
  using ((select private.has_role('admin')));

-- -----------------------------------------------------------------------------
-- Learner data: strictly own rows (ownership predicate + TO authenticated)
-- -----------------------------------------------------------------------------
create policy "Users read own bookmarks"
  on public.bookmarks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users add own bookmarks"
  on public.bookmarks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users remove own bookmarks"
  on public.bookmarks for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read own progress"
  on public.user_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users create own progress"
  on public.user_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update own progress"
  on public.user_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete own progress"
  on public.user_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read own roadmaps"
  on public.user_roadmaps for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users enroll themselves"
  on public.user_roadmaps for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update own enrollments"
  on public.user_roadmaps for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users leave roadmaps"
  on public.user_roadmaps for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read own milestones"
  on public.learning_milestones for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users record own milestones"
  on public.learning_milestones for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users remove own milestones"
  on public.learning_milestones for delete to authenticated
  using ((select auth.uid()) = user_id);
