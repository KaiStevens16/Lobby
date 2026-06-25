-- Run in Supabase SQL Editor if check_ins already exists without grey.

alter table public.check_ins drop constraint if exists check_ins_member_check;
alter table public.check_ins
  add constraint check_ins_member_check check (member in ('roman', 'kai', 'grey'));
