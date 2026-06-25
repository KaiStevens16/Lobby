-- Run this in the Supabase SQL Editor for your project.

create table if not exists public.check_ins (
  date text not null,
  member text not null check (member in ('roman', 'kai', 'grey')),
  timestamp timestamptz not null,
  note text,
  doing_today text,
  gym_session text,
  created_at timestamptz not null default now(),
  primary key (date, member)
);

create index if not exists check_ins_date_idx on public.check_ins (date desc);

alter table public.check_ins enable row level security;
