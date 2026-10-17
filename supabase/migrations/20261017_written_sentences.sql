-- Learner-written examples are separate from graded quiz attempts.
create table if not exists public.written_sentences (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  chinese text not null,
  pinyin text not null default '',
  english text not null default '',
  priority text not null default '',
  sentence text not null check (length(trim(sentence)) > 0),
  created_at timestamptz not null
);
create index if not exists written_sentences_user_history on public.written_sentences(user_id, created_at);
alter table public.written_sentences enable row level security;
drop policy if exists "Read own written sentences" on public.written_sentences;
create policy "Read own written sentences" on public.written_sentences for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own written sentences" on public.written_sentences;
create policy "Insert own written sentences" on public.written_sentences for insert to authenticated with check ((select auth.uid()) = user_id);
notify pgrst, 'reload schema';
