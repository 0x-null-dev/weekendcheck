-- Run in Supabase SQL Editor AFTER deploying /api/cron/x on Vercel.
-- First create these two secrets in Supabase Vault (Dashboard > Integrations > Vault):
--   weekendcheck_app_url       = canonical production origin, e.g. https://your-site.com
--   weekendcheck_cron_secret   = the same random CRON_SECRET set in Vercel Production
-- Never put X credentials in this script. They stay in Vercel's server environment.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if (select count(*) from vault.decrypted_secrets where name = 'weekendcheck_app_url') <> 1
    or (select count(*) from vault.decrypted_secrets where name = 'weekendcheck_cron_secret') <> 1 then
    raise exception 'Create exactly one Vault secret named weekendcheck_app_url and weekendcheck_cron_secret first.';
  end if;
  if (select decrypted_secret from vault.decrypted_secrets where name = 'weekendcheck_app_url') !~ '^https://[^/[:space:]]+/?$' then
    raise exception 'weekendcheck_app_url must be the canonical HTTPS production origin, without a path.';
  end if;
  if (select length(decrypted_secret) from vault.decrypted_secrets where name = 'weekendcheck_cron_secret') < 32 then
    raise exception 'weekendcheck_cron_secret must contain at least 32 characters.';
  end if;
end;
$$;

-- Re-running updates the job with the same name; it does not add duplicate triggers.
select cron.schedule(
  'weekendcheck-x-posts',
  '* * * * *',
  $job$
    select net.http_post(
      url := rtrim((select decrypted_secret from vault.decrypted_secrets where name = 'weekendcheck_app_url'), '/') || '/api/cron/x',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'weekendcheck_cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 300000
    );
  $job$
);

-- Inspect the HTTP results (cron history only proves the request was queued):
-- select id, status_code, timed_out, error_msg, created
-- from net._http_response order by created desc limit 10;
-- To pause: select cron.alter_job((select jobid from cron.job where jobname = 'weekendcheck-x-posts'), active := false);
