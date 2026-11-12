-- Personal priority history, independent of replace_study_content.
-- Reset events use null; the latest event for each word wins.
create table if not exists public.priority_changes (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  chinese text not null,
  original_priority text not null default '',
  new_priority integer check (new_priority between 1 and 10),
  updated_at timestamptz not null
);
create index if not exists priority_changes_user_history
  on public.priority_changes(user_id, word_id, updated_at, id);
alter table public.priority_changes enable row level security;
revoke all on public.priority_changes from anon, authenticated;
grant select, insert on public.priority_changes to authenticated;
drop policy if exists "Read own priority changes" on public.priority_changes;
create policy "Read own priority changes" on public.priority_changes
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own priority changes" on public.priority_changes;
create policy "Insert own priority changes" on public.priority_changes
  for insert to authenticated with check ((select auth.uid()) = user_id);
notify pgrst, 'reload schema';
