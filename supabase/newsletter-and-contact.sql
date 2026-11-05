-- =====================================================================
-- SupremeInsight: newsletter + contact messages
-- Run this once in Supabase > SQL Editor if your database already exists.
-- (It is also included at the end of schema.sql for fresh projects.)
-- Safe to run more than once.
-- =====================================================================

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
