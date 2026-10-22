-- Alabaster: forms, contact list and crew follow-up.
-- Run once in Supabase → SQL Editor. Safe to re-run.

-- Every form submission lands here (prayer, anonymous, connect, crew, coffee, notify).
create table if not exists public.submissions (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  type            text not null check (type in ('prayer', 'anonymous', 'connect', 'crew', 'coffee', 'notify')),
  first_name      text,
  last_name       text,
  phone           text,          -- E.164, e.g. +18045550123. Never stored for anonymous requests.
  email           text,
  contact         text,          -- free-text "phone or email" from the prayer request page
  parent_phone    text,
  is_minor        boolean not null default false,
  message         text,
  lists           text[] not null default '{}',   -- e.g. {light-night, table, grow-cohort, first-time, grow, serve}
  details         jsonb not null default '{}'::jsonb,  -- roles, nights, prayInPerson, followUp, page
  sms_consent     boolean not null default false,
  status          text not null default 'new' check (status in ('new', 'followed_up', 'prayed', 'closed')),
  followed_up_at  timestamptz,
  followed_up_by  text,
  notes           text
);

create index if not exists submissions_created_idx on public.submissions (created_at desc);
create index if not exists submissions_status_idx on public.submissions (status);

-- People who can sign in to /crew-dashboard. Add each crew member's email here.
create table if not exists public.crew_members (
  email      text primary key,
  name       text,
  can_see_prayer boolean not null default true,
  added_at   timestamptz not null default now()
);

-- Numbers that replied STOP (filled by the Twilio webhook in step 5). Never text these.
create table if not exists public.sms_opt_outs (
  phone      text primary key,
  opted_out_at timestamptz not null default now()
);

-- The texting list: adults who consented, minus opt-outs, one row per number + list.
create or replace view public.sms_audience as
  select distinct on (s.phone, l.list)
         s.phone, l.list, s.first_name, s.created_at
  from public.submissions s
  cross join lateral unnest(s.lists) as l(list)
  where s.sms_consent
    and not s.is_minor
    and s.phone is not null
    and not exists (select 1 from public.sms_opt_outs o where o.phone = s.phone)
  order by s.phone, l.list, s.created_at desc;

-- ---------- Security ----------
-- The website writes with the service key from the server (bypasses RLS).
-- Browsers can never read or write directly, except signed-in crew via the policies below.
alter table public.submissions enable row level security;
alter table public.crew_members enable row level security;
alter table public.sms_opt_outs enable row level security;

create or replace function public.is_crew() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.crew_members c where lower(c.email) = lower(auth.jwt() ->> 'email'));
$$;

create or replace function public.crew_sees_prayer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.crew_members c where lower(c.email) = lower(auth.jwt() ->> 'email') and c.can_see_prayer);
$$;

-- These two are only ever called from the policies below, by a signed-in crew member.
-- Postgres grants EXECUTE to PUBLIC by default, which would expose them at
-- /rest/v1/rpc/... to anyone holding the (public) anon key.
revoke execute on function public.is_crew() from public;
revoke execute on function public.crew_sees_prayer() from public;
grant execute on function public.is_crew() to authenticated;
grant execute on function public.crew_sees_prayer() to authenticated;

drop policy if exists "crew can read" on public.submissions;
create policy "crew can read" on public.submissions for select to authenticated
  using (public.is_crew() and (type not in ('prayer', 'anonymous') or public.crew_sees_prayer()));

drop policy if exists "crew can update status" on public.submissions;
create policy "crew can update status" on public.submissions for update to authenticated
  using (public.is_crew()) with check (public.is_crew());

drop policy if exists "crew can see crew list" on public.crew_members;
create policy "crew can see crew list" on public.crew_members for select to authenticated using (public.is_crew());

-- Crew can only change follow-up fields, never the original submission.
revoke insert, update, delete on public.submissions from anon, authenticated;
grant update (status, followed_up_at, followed_up_by, notes) on public.submissions to authenticated;
revoke insert, update, delete on public.crew_members from anon, authenticated;
revoke all on public.sms_opt_outs from anon, authenticated;

-- Lock the view to server-side use only.
revoke all on public.sms_audience from anon, authenticated;

-- ---------- Privacy: delete prayer requests after 60 days ----------
-- Requires the pg_cron extension (Database → Extensions → enable "pg_cron"), then run:
-- select cron.schedule('purge-prayer-requests', '0 7 * * *',
--   $$ delete from public.submissions where type in ('prayer', 'anonymous') and created_at < now() - interval '60 days' $$);

-- ---------- First crew member (edit, then run) ----------
-- insert into public.crew_members (email, name) values ('you@example.com', 'Michael') on conflict do nothing;
