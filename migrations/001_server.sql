-- Only application-owned objects. Supabase auth/storage and old public tables are untouched.
CREATE SCHEMA IF NOT EXISTS weekendcheck;
REVOKE ALL ON SCHEMA weekendcheck FROM PUBLIC;
CREATE TABLE IF NOT EXISTS weekendcheck.migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
-- A single editorial aggregate matches this sole-admin application. A row lock
-- serializes mutations across web/worker instances and preserves revision checks.
CREATE TABLE IF NOT EXISTS weekendcheck.workspace (
  id integer PRIMARY KEY CHECK (id = 1),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((document->>'revision')::integer = revision)
);
CREATE TABLE IF NOT EXISTS weekendcheck.admin_account (id integer PRIMARY KEY CHECK (id = 1), password_hash text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS weekendcheck.admin_sessions (
  token_hash text PRIMARY KEY, admin_id integer NOT NULL REFERENCES weekendcheck.admin_account(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry ON weekendcheck.admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS weekendcheck.login_limits (id text PRIMARY KEY, attempts integer NOT NULL, resets_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS weekendcheck.worker_status (id text PRIMARY KEY, last_seen timestamptz NOT NULL);
ALTER TABLE weekendcheck.workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekendcheck.admin_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekendcheck.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekendcheck.login_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekendcheck.worker_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekendcheck.migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA weekendcheck FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON SCHEMA weekendcheck FROM anon;
    REVOKE ALL ON ALL TABLES IN SCHEMA weekendcheck FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON SCHEMA weekendcheck FROM authenticated;
    REVOKE ALL ON ALL TABLES IN SCHEMA weekendcheck FROM authenticated;
  END IF;
END $$;
INSERT INTO weekendcheck.migrations(version) VALUES (1) ON CONFLICT DO NOTHING;
