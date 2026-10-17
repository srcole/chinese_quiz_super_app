alter table public.written_sentences
  add column if not exists feedback_copied_at timestamptz,
  add column if not exists updated_at timestamptz;
update public.written_sentences set updated_at = created_at where updated_at is null;
alter table public.written_sentences alter column updated_at set default now();
alter table public.written_sentences alter column updated_at set not null;
drop policy if exists "Update own written sentences" on public.written_sentences;
create policy "Update own written sentences" on public.written_sentences for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.keep_newer_written_sentence()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.updated_at <= old.updated_at then return old; end if;
  return new;
end;
$$;
drop trigger if exists keep_newer_written_sentence on public.written_sentences;
create trigger keep_newer_written_sentence before update on public.written_sentences
for each row execute function public.keep_newer_written_sentence();
notify pgrst, 'reload schema';
