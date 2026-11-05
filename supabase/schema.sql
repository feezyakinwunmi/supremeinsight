-- =====================================================================
-- SupremeInsight — complete Supabase schema
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to run once on a fresh project.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
do $$ begin
  create type public.post_status as enum ('draft', 'review', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. PROFILES (one row per staff member, linked to Supabase Auth)
--    role: pending (no access) | writer | editor | admin
--    The FIRST person who signs up automatically becomes admin.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  bio         text,
  role        text not null default 'pending'
              check (role in ('pending', 'writer', 'editor', 'admin')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. DEPARTMENTS (the 10 sections of the publication)
-- ---------------------------------------------------------------------
create table if not exists public.departments (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  color        text not null default '#1f3b4d',
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. POSTS (content is an ordered JSON array of blocks)
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  cover_image      text,
  department_id    uuid references public.departments(id) on delete set null,
  template         text not null default 'editorial'
                   check (template in ('editorial', 'magazine', 'minimal')),
  blocks           jsonb not null default '[]'::jsonb,
  tags             text[] not null default '{}',
  status           public.post_status not null default 'draft',
  featured         boolean not null default false,
  reading_minutes  int not null default 1,
  author_id        uuid references public.profiles(id) on delete set null,
  seo_title        text,
  seo_description  text,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  fts tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
  ) stored
);

create index if not exists posts_status_published_idx on public.posts (status, published_at desc);
create index if not exists posts_department_idx       on public.posts (department_id);
create index if not exists posts_featured_idx         on public.posts (featured) where featured;
create index if not exists posts_fts_idx              on public.posts using gin (fts);
create index if not exists posts_tags_idx             on public.posts using gin (tags);

-- ---------------------------------------------------------------------
-- 5. ANALYTICS EVENTS
--    event: view | scroll (value = % depth) | time (value = active seconds,
--           cumulative per session) | click (meta has href / block id)
-- ---------------------------------------------------------------------
create table if not exists public.post_events (
  id          bigint generated always as identity primary key,
  post_id     uuid not null references public.posts(id) on delete cascade,
  session_id  text not null,
  event       text not null check (event in ('view', 'scroll', 'time', 'click')),
  value       int,
  meta        jsonb not null default '{}'::jsonb,
  referrer    text,
  device      text,
  created_at  timestamptz not null default now()
);

create index if not exists post_events_post_idx    on public.post_events (post_id, created_at desc);
create index if not exists post_events_created_idx on public.post_events (created_at desc);

-- ---------------------------------------------------------------------
-- 6. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- any approved staff member (writer, editor, admin)
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('writer', 'editor', 'admin') from public.profiles where id = auth.uid()), false)
$$;

-- can review / publish / edit anyone's post
create or replace function public.is_editor()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('editor', 'admin') from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
-- 7. TRIGGERS
-- ---------------------------------------------------------------------

-- 7a. create a profile for every new auth user; first user becomes admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.profiles where role = 'admin')
         then 'pending' else 'admin' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7b. only admins can change anyone's role
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end $$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- 7c. posts: keep updated_at fresh, stamp published_at, only editors publish
create or replace function public.posts_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();

  if new.status = 'published' then
    if auth.uid() is not null and not public.is_editor() then
      raise exception 'Only an editor or admin can publish a post';
    end if;
    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;

  return new;
end $$;

drop trigger if exists posts_before_write on public.posts;
create trigger posts_before_write
  before insert or update on public.posts
  for each row execute function public.posts_before_write();

-- ---------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.departments enable row level security;
alter table public.posts       enable row level security;
alter table public.post_events enable row level security;

-- profiles
drop policy if exists "staff read profiles"   on public.profiles;
drop policy if exists "own profile read"      on public.profiles;
drop policy if exists "own profile update"    on public.profiles;
drop policy if exists "admin update profiles" on public.profiles;
create policy "own profile read"      on public.profiles for select using (id = auth.uid());
create policy "staff read profiles"   on public.profiles for select using (public.is_staff());
create policy "own profile update"    on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin update profiles" on public.profiles for update using (public.is_admin());

-- departments: public read, admin write
drop policy if exists "public read departments" on public.departments;
drop policy if exists "admin write departments" on public.departments;
create policy "public read departments" on public.departments for select using (true);
create policy "admin write departments" on public.departments for all
  using (public.is_admin()) with check (public.is_admin());

-- posts
drop policy if exists "public read published posts" on public.posts;
drop policy if exists "staff read all posts"        on public.posts;
drop policy if exists "staff insert posts"          on public.posts;
drop policy if exists "writers update own posts"    on public.posts;
drop policy if exists "editors update any post"     on public.posts;
drop policy if exists "editors delete posts"        on public.posts;
create policy "public read published posts" on public.posts for select
  using (status = 'published' and published_at <= now());
create policy "staff read all posts" on public.posts for select
  using (public.is_staff());
create policy "staff insert posts" on public.posts for insert
  with check (public.is_staff() and author_id = auth.uid());
create policy "writers update own posts" on public.posts for update
  using (public.is_staff() and author_id = auth.uid() and status in ('draft', 'review'))
  with check (public.is_staff() and author_id = auth.uid());
create policy "editors update any post" on public.posts for update
  using (public.is_editor()) with check (public.is_editor());
create policy "editors delete posts" on public.posts for delete
  using (public.is_editor());

-- post_events: nobody reads or writes directly.
-- Visitors write through track_event(); staff read through the analytics functions below.

-- ---------------------------------------------------------------------
-- 9. PUBLIC AUTHOR VIEW (name + photo + bio only, never emails or roles)
-- ---------------------------------------------------------------------
create or replace view public.authors_public as
  select id, full_name, avatar_url, bio
  from public.profiles
  where role in ('writer', 'editor', 'admin');

grant select on public.authors_public to anon, authenticated;

-- ---------------------------------------------------------------------
-- 10. ANALYTICS: write (public) and read (staff only)
-- ---------------------------------------------------------------------

-- Visitors call this via supabase.rpc('track_event', {...}). It only accepts
-- events for posts that are published, and only the four known event types.
create or replace function public.track_event(
  p_post_id    uuid,
  p_session_id text,
  p_event      text,
  p_value      int  default null,
  p_meta       jsonb default '{}'::jsonb,
  p_referrer   text default null,
  p_device     text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_event not in ('view', 'scroll', 'time', 'click') then return; end if;
  if p_session_id is null or length(p_session_id) > 64 then return; end if;
  if not exists (select 1 from public.posts where id = p_post_id and status = 'published') then return; end if;

  insert into public.post_events (post_id, session_id, event, value, meta, referrer, device)
  values (
    p_post_id,
    p_session_id,
    p_event,
    least(greatest(coalesce(p_value, 0), 0), 86400),
    coalesce(p_meta, '{}'::jsonb),
    left(p_referrer, 300),
    left(p_device, 20)
  );
end $$;

grant execute on function public.track_event(uuid, text, text, int, jsonb, text, text) to anon, authenticated;

-- Per-post totals for the last N days (staff only)
create or replace function public.analytics_posts(p_days int default 30)
returns table (
  post_id uuid, title text, slug text, department text,
  views bigint, visitors bigint, avg_seconds numeric, avg_scroll numeric, clicks bigint
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not allowed'; end if;

  return query
  with ev as (
    select * from public.post_events where created_at >= now() - make_interval(days => p_days)
  ),
  per_session as (
    select e.post_id, e.session_id,
           max(e.value) filter (where e.event = 'time')   as secs,
           max(e.value) filter (where e.event = 'scroll') as scroll
    from ev e group by e.post_id, e.session_id
  ),
  agg as (
    select ps.post_id,
           count(*)                       as visitors,
           round(avg(ps.secs), 0)         as avg_seconds,
           round(avg(ps.scroll), 0)       as avg_scroll
    from per_session ps group by ps.post_id
  ),
  v as (select e.post_id, count(*) as views  from ev e where e.event = 'view'  group by e.post_id),
  c as (select e.post_id, count(*) as clicks from ev e where e.event = 'click' group by e.post_id)
  select p.id, p.title, p.slug, d.name,
         coalesce(v.views, 0), coalesce(agg.visitors, 0),
         coalesce(agg.avg_seconds, 0), coalesce(agg.avg_scroll, 0),
         coalesce(c.clicks, 0)
  from public.posts p
  left join public.departments d on d.id = p.department_id
  left join v   on v.post_id   = p.id
  left join c   on c.post_id   = p.id
  left join agg on agg.post_id = p.id
  where p.status = 'published'
  order by coalesce(v.views, 0) desc, p.published_at desc;
end $$;

-- Views per day for the last N days (staff only); optional single post
create or replace function public.analytics_daily(p_days int default 30, p_post_id uuid default null)
returns table (day date, views bigint, visitors bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not allowed'; end if;

  return query
  select g::date,
         coalesce(count(e.*) filter (where e.event = 'view'), 0),
         coalesce(count(distinct e.session_id), 0)
  from generate_series(current_date - (p_days - 1), current_date, interval '1 day') g
  left join public.post_events e
         on e.created_at::date = g::date
        and (p_post_id is null or e.post_id = p_post_id)
  group by g
  order by g;
end $$;

-- Where visitors come from and what devices they use (staff only)
create or replace function public.analytics_sources(p_days int default 30)
returns table (kind text, label text, total bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not allowed'; end if;

  return query
  select 'referrer'::text,
         coalesce(nullif(regexp_replace(coalesce(e.referrer, ''), '^https?://([^/]+).*$', '\1'), ''), 'Direct'),
         count(*)
  from public.post_events e
  where e.event = 'view' and e.created_at >= now() - make_interval(days => p_days)
  group by 2
  union all
  select 'device'::text, coalesce(e.device, 'unknown'), count(*)
  from public.post_events e
  where e.event = 'view' and e.created_at >= now() - make_interval(days => p_days)
  group by 2
  order by 1, 3 desc;
end $$;

-- Top clicked links across the site (staff only)
create or replace function public.analytics_clicks(p_days int default 30)
returns table (href text, clicks bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not allowed'; end if;

  return query
  select e.meta->>'href', count(*)
  from public.post_events e
  where e.event = 'click' and e.created_at >= now() - make_interval(days => p_days)
    and e.meta ? 'href'
  group by 1 order by 2 desc limit 25;
end $$;

grant execute on function public.analytics_posts(int)         to authenticated;
grant execute on function public.analytics_daily(int, uuid)   to authenticated;
grant execute on function public.analytics_sources(int)       to authenticated;
grant execute on function public.analytics_clicks(int)        to authenticated;

-- ---------------------------------------------------------------------
-- 11. STORAGE: public bucket for post images, staff can upload
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "public read post images"   on storage.objects;
drop policy if exists "staff upload post images"  on storage.objects;
drop policy if exists "staff update post images"  on storage.objects;
drop policy if exists "editors delete post images" on storage.objects;
create policy "public read post images"  on storage.objects for select
  using (bucket_id = 'post-images');
create policy "staff upload post images" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images' and public.is_staff());
create policy "staff update post images" on storage.objects for update to authenticated
  using (bucket_id = 'post-images' and public.is_staff());
create policy "editors delete post images" on storage.objects for delete to authenticated
  using (bucket_id = 'post-images' and public.is_editor());

-- ---------------------------------------------------------------------
-- 12. SEED: the 10 departments
-- ---------------------------------------------------------------------
insert into public.departments (slug, name, description, color, sort_order) values
  ('faith-ministry',          'Faith & Ministry',          'Church, theology, ministry and Christian living.',                        '#7a1f2b', 1),
  ('business-enterprise',     'Business & Enterprise',     'Entrepreneurship, startups and business development.',                    '#18332b', 2),
  ('finance-wealth',          'Finance & Wealth',          'Investment, credit unions, wealth creation and stewardship.',             '#7a5a12', 3),
  ('media-communications',    'Media & Communications',    'Publishing, film, broadcasting and digital media.',                       '#3f2a56', 4),
  ('education-knowledge',     'Education & Knowledge',     'Homeschooling, schools, research and literacy.',                          '#4a6a1f', 5),
  ('technology-innovation',   'Technology & Innovation',   'Artificial intelligence, technology and digital transformation.',         '#1d2b5c', 6),
  ('leadership-governance',   'Leadership & Governance',   'Leadership, public policy and institutions.',                             '#1f3b4d', 7),
  ('people-culture',          'People & Culture',          'Family, relationships, arts and society.',                                '#a3341b', 8),
  ('marketplace-careers',     'Marketplace & Careers',     'Employment, professional development and opportunities.',                 '#2f6b4f', 9),
  ('opinion-analysis',        'Opinion & Analysis',        'Editorials, interviews, commentary and industry insights.',               '#3a3a3a', 10)
on conflict (slug) do nothing;

-- =====================================================================
-- DONE. Next steps (in the Supabase dashboard, not SQL):
--  1. Authentication > Providers > Email: turn OFF "Allow new users to sign up"
--     AFTER you have created your own admin account (first account = admin).
--     Add teammates later with Authentication > Users > Add user, then
--     set their role in the profiles table (writer / editor / admin).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 13. NEWSLETTER (same as supabase/newsletter-and-contact.sql)
-- ---------------------------------------------------------------------
-- Subscribers. department_ids = the departments they chose; empty = everything.
create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  department_ids  uuid[] not null default '{}',
  status          text not null default 'active' check (status in ('active', 'unsubscribed')),
  token           uuid not null unique default gen_random_uuid(),  -- used in unsubscribe links
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists newsletter_subscribers_active_idx on public.newsletter_subscribers (status);
create index if not exists newsletter_subscribers_depts_idx  on public.newsletter_subscribers using gin (department_ids);

-- When subscribers were emailed about a post (so nobody gets the same post twice)
alter table public.posts add column if not exists newsletter_sent_at timestamptz;

alter table public.newsletter_subscribers enable row level security;

-- Only staff can see the list; only admins can remove rows. Visitors never read it.
drop policy if exists "staff read subscribers"    on public.newsletter_subscribers;
drop policy if exists "admin delete subscribers"  on public.newsletter_subscribers;
create policy "staff read subscribers"   on public.newsletter_subscribers for select using (public.is_staff());
create policy "admin delete subscribers" on public.newsletter_subscribers for delete using (public.is_admin());

-- Visitors subscribe (or change their topics) through this function.
create or replace function public.subscribe_newsletter(p_email text, p_department_ids uuid[] default '{}')
returns void language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_depts uuid[];
begin
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address';
  end if;

  -- keep only real department ids
  select coalesce(array_agg(d.id), '{}') into v_depts
  from public.departments d
  where d.id = any(coalesce(p_department_ids, '{}'));

  insert into public.newsletter_subscribers (email, department_ids)
  values (v_email, v_depts)
  on conflict (email) do update
    set department_ids = excluded.department_ids,
        status         = 'active',
        updated_at     = now();
end $$;

-- Unsubscribe links call this with the subscriber's private token.
create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.newsletter_subscribers
     set status = 'unsubscribed', updated_at = now()
   where token = p_token;
  return found;
end $$;

grant execute on function public.subscribe_newsletter(text, uuid[]) to anon, authenticated;
grant execute on function public.unsubscribe_newsletter(uuid)       to anon, authenticated;

-- Contact form messages. Visitors can only send; staff read them in the admin.
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  topic       text not null default 'General',
  message     text not null,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "staff read messages"    on public.contact_messages;
drop policy if exists "staff update messages"  on public.contact_messages;
drop policy if exists "admin delete messages"  on public.contact_messages;
create policy "staff read messages"   on public.contact_messages for select using (public.is_staff());
create policy "staff update messages" on public.contact_messages for update using (public.is_staff()) with check (public.is_staff());
create policy "admin delete messages" on public.contact_messages for delete using (public.is_admin());

create or replace function public.send_contact_message(p_name text, p_email text, p_topic text, p_message text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if length(trim(coalesce(p_name, ''))) < 2 or length(p_name) > 120 then
    raise exception 'Please enter your name';
  end if;
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address';
  end if;
  if length(trim(coalesce(p_message, ''))) < 10 or length(p_message) > 5000 then
    raise exception 'Please write a message (10 to 5000 characters)';
  end if;
  insert into public.contact_messages (name, email, topic, message)
  values (trim(p_name), v_email, left(coalesce(nullif(trim(p_topic), ''), 'General'), 60), trim(p_message));
end $$;

grant execute on function public.send_contact_message(text, text, text, text) to anon, authenticated;
