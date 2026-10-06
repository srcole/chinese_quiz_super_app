-- Run this entire file in the Supabase SQL Editor, then retry npm run content:sync.
-- Atomic: failures roll back all content changes; attempts are never modified.
create or replace function public.replace_study_content(items jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if items is null or jsonb_typeof(items) <> 'array' then
    raise exception 'Refusing non-array content import';
  end if;
  if jsonb_array_length(items) = 0 then
    raise exception 'Refusing empty content import';
  end if;
  perform pg_advisory_xact_lock(734029);

  -- Parse the large JSON payload once. An indexed staging table avoids repeatedly
  -- scanning/parsing it while checking which of the existing rows were removed.
  create temporary table incoming_study_content (
    id text primary key,
    kind text not null check (kind in ('word', 'character', 'rule')),
    payload jsonb not null
  ) on commit drop;
  insert into pg_temp.incoming_study_content(id,kind,payload)
    select x.id,x.kind,x.payload
    from jsonb_to_recordset(items) as x(id text,kind text,payload jsonb);
  analyze pg_temp.incoming_study_content;

  insert into public.study_content as existing(id,kind,payload,active,updated_at)
    select id,kind,payload,true,now() from pg_temp.incoming_study_content
    on conflict(id) do update
      set kind=excluded.kind,payload=excluded.payload,active=true,updated_at=now()
      where existing.kind is distinct from excluded.kind
         or existing.payload is distinct from excluded.payload
         or not existing.active;

  update public.study_content as existing set active=false,updated_at=now()
    where existing.active and not exists (
      select 1 from pg_temp.incoming_study_content as incoming
      where incoming.id = existing.id
    );
  drop table pg_temp.incoming_study_content;
end;
$$;
revoke all on function public.replace_study_content(jsonb) from public, anon, authenticated;
grant execute on function public.replace_study_content(jsonb) to service_role;
