-- ============================================================
-- 2026 CONVENTION — SCHEMA UPDATE
-- Run this once in Supabase Dashboard → SQL Editor → New query
-- Project: yorlnzlfnyfqbxrctnyf
--
-- This whole script is safe to run again even if you already ran an
-- earlier version of it — every step only creates or replaces things,
-- it never duplicates or drops your data. If you already applied a
-- previous version and only need the new "admin can delete
-- registrations" policy, you can jump straight to STEP 5 below.
-- ============================================================

-- 1) FIX: "new row violates row-level security policy for table
--    convention_registrations" — the public page had no INSERT
--    policy for anonymous visitors. This adds it.
alter table public.convention_registrations enable row level security;

drop policy if exists "Public can insert registrations" on public.convention_registrations;
create policy "Public can insert registrations"
on public.convention_registrations
for insert
to anon
with check (true);

-- (Your existing admin read/update policies for authenticated users
--  are untouched by this script.)

-- 2) NEW REGISTRATION FIELDS
alter table public.convention_registrations
  add column if not exists email text,
  add column if not exists eyf_member boolean,
  add column if not exists attended_before boolean;

-- 3) DAILY CHECK-IN TABLE
-- One row per person per convention day, so the same registration
-- can check in once on each of the 4 convention days.
create table if not exists public.convention_checkins (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.convention_registrations(id) on delete cascade,
  check_day date not null,
  checked_in_at timestamptz not null default now(),
  unique (registration_id, check_day)
);

alter table public.convention_checkins enable row level security;

drop policy if exists "Admin can read checkins" on public.convention_checkins;
create policy "Admin can read checkins"
on public.convention_checkins
for select
to authenticated
using (true);

drop policy if exists "Admin can insert checkins" on public.convention_checkins;
create policy "Admin can insert checkins"
on public.convention_checkins
for insert
to authenticated
with check (true);

-- 4) REALTIME — so the admin dashboard live-refreshes on scans
-- (wrapped so re-running this script doesn't error if it's already added)
do $$
begin
  alter publication supabase_realtime add table public.convention_checkins;
exception when duplicate_object then
  null;
end $$;

-- 5) ADMIN CAN DELETE REGISTRATIONS
-- Lets a logged-in admin remove a duplicate or unwanted registration
-- from the "Manage Registrations" list on the dashboard. Deleting a
-- registration automatically deletes its check-in rows too, because
-- convention_checkins.registration_id references this table with
-- "on delete cascade".
drop policy if exists "Admin can delete registrations" on public.convention_registrations;
create policy "Admin can delete registrations"
on public.convention_registrations
for delete
to authenticated
using (true);

-- Done. After running this, set up the Brevo email function — see
-- README.txt — so registration confirmation emails can be sent.
