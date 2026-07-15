create extension if not exists pgcrypto;

create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  feedback_type text not null,
  message text not null,
  contact text,
  charger_id text,
  charger_name text,
  latitude double precision,
  longitude double precision,
  platform text,
  app_version text,
  submission_status text,
  created_at timestamptz default now()
);

alter table public.feedback_reports enable row level security;

drop policy if exists "Allow anonymous feedback inserts" on public.feedback_reports;

create policy "Allow anonymous feedback inserts"
on public.feedback_reports
for insert
to anon
with check (true);
