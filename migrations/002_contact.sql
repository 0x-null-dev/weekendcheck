-- Messages sent through the public contact form. Read only by the admin through the server role.
CREATE TABLE IF NOT EXISTS weekendcheck.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  topic text NOT NULL CHECK (topic IN ('project', 'feedback', 'other')),
  link text NOT NULL DEFAULT '' CHECK (char_length(link) <= 2048),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'done'))
);
CREATE INDEX IF NOT EXISTS contact_messages_created ON weekendcheck.contact_messages(created_at DESC);
ALTER TABLE weekendcheck.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON weekendcheck.contact_messages FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN REVOKE ALL ON weekendcheck.contact_messages FROM anon; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN REVOKE ALL ON weekendcheck.contact_messages FROM authenticated; END IF;
END $$;
INSERT INTO weekendcheck.migrations(version) VALUES (2) ON CONFLICT DO NOTHING;
