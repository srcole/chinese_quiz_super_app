-- Run once in the Supabase SQL Editor. Safe to rerun.
create table if not exists public.study_content (
  id text primary key,
  kind text not null check (kind in ('word', 'character', 'rule')),
  payload jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.study_content enable row level security;
drop policy if exists "Read active study content" on public.study_content;
create policy "Read active study content" on public.study_content for select to authenticated using (active);
create table if not exists public.attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  mode text not null check (mode in ('vocabulary','idioms','tones','sentences','characters','grammar')),
  direction text not null,
  answer text not null,
  correct boolean not null,
  overridden boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists attempts_user_history on public.attempts(user_id, item_id, mode, direction, created_at);
alter table public.attempts enable row level security;
drop policy if exists "Read own attempts" on public.attempts;
create policy "Read own attempts" on public.attempts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own attempts" on public.attempts;
create policy "Insert own attempts" on public.attempts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own attempts" on public.attempts;
create policy "Update own attempts" on public.attempts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Atomic imports: removed content becomes inactive; learning history is retained.
create or replace function public.replace_study_content(items jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Refusing empty content import';
  end if;
  perform pg_advisory_xact_lock(734029);
  insert into study_content(id,kind,payload,active,updated_at)
    select x.id,x.kind,x.payload,true,now() from jsonb_to_recordset(items) as x(id text,kind text,payload jsonb)
    on conflict(id) do update set kind=excluded.kind,payload=excluded.payload,active=true,updated_at=now();
  update study_content set active=false,updated_at=now()
    where active and id not in (select x.id from jsonb_to_recordset(items) as x(id text));
end;
$$;
revoke all on function public.replace_study_content(jsonb) from public, anon, authenticated;
grant execute on function public.replace_study_content(jsonb) to service_role;
-- A delayed offline upload must not overwrite a newer grading override.
create or replace function public.keep_newer_attempt()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.updated_at < old.updated_at then return old; end if;
  return new;
end;
$$;
drop trigger if exists keep_newer_attempt on public.attempts;
create trigger keep_newer_attempt before update on public.attempts
for each row execute function public.keep_newer_attempt();
