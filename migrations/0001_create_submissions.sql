-- Form submissions from the public site: applications, RSVPs, contact messages.
--
-- One table rather than five. The forms share almost every column, the volume
-- is small, and a single table keeps the admin view and CSV export trivial.
-- Form-specific fields live in `payload` as JSON.

CREATE TABLE IF NOT EXISTS submissions (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL CHECK (kind IN ('membership','accelerator','hackathon','rsvp','contact')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  telegram      TEXT,
  -- Everything not common to all forms, as a JSON object.
  payload       TEXT NOT NULL DEFAULT '{}',
  -- Set for hackathon signups and RSVPs so an event page can count its own.
  event_slug    TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','reviewing','accepted','declined','spam')),
  -- Coarse origin data for spam triage. No full IP is stored.
  country       TEXT,
  user_agent    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at   TEXT,
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_kind_created
  ON submissions (kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_status
  ON submissions (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_event
  ON submissions (event_slug, created_at DESC);

-- Prevent the same person double-submitting the same form. RSVPs and hackathon
-- signups are unique per event; the other forms are unique per email.
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_unique
  ON submissions (kind, email, COALESCE(event_slug, ''));


-- Rate limiting.
--
-- A short-lived counter per (bucket, window). The bucket is a hash of the
-- client IP, never the address itself, so the table holds nothing identifying.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket        TEXT NOT NULL,
  window_start  INTEGER NOT NULL,
  hits          INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON rate_limits (window_start);
