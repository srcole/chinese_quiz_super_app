-- Run after 20261006_optimize_content_import.sql.
-- Applies only to the administrative import RPC, not normal app queries.
alter function public.replace_study_content(jsonb)
  set statement_timeout = '60s';

-- PostgREST caches function settings; reload them before retrying the import.
notify pgrst, 'reload schema';

-- Confirm the function configuration includes statement_timeout=60s.
select proconfig
from pg_proc
where oid = 'public.replace_study_content(jsonb)'::regprocedure;
