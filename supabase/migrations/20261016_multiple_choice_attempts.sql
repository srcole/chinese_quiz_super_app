-- Preserve answer format when syncing attempts. Safe to rerun.
alter table public.attempts
  add column if not exists multiple_choice boolean not null default false;
notify pgrst, 'reload schema';
