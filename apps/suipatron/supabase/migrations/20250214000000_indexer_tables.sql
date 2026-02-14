-- SuiPatron indexer tables for Supabase-backed store.
-- Run in Supabase SQL Editor or via supabase db push.

-- Creators (one row per CreatorProfile)
CREATE TABLE IF NOT EXISTS indexer_creators (
  profile_id       TEXT PRIMARY KEY,
  owner            TEXT NOT NULL,
  name             TEXT NOT NULL,
  bio              TEXT NOT NULL DEFAULT '',
  avatar_blob_id   TEXT,
  suins_name       TEXT,
  price            BIGINT NOT NULL,
  content_count    INT NOT NULL DEFAULT 0,
  total_supporters INT NOT NULL DEFAULT 0,
  created_at       BIGINT NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indexer_creators_created_at
  ON indexer_creators (created_at, profile_id);

-- Content (one row per Content DOF)
CREATE TABLE IF NOT EXISTS indexer_content (
  content_id         TEXT PRIMARY KEY,
  creator_profile_id TEXT NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  blob_id            TEXT NOT NULL,
  content_type       TEXT NOT NULL,
  created_at         BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_indexer_content_profile
  ON indexer_content (creator_profile_id);

-- Access purchases (supporters list; total_supporters denormalized on creator)
CREATE TABLE IF NOT EXISTS indexer_access_purchases (
  id                 BIGSERIAL PRIMARY KEY,
  access_pass_id     TEXT NOT NULL,
  creator_profile_id TEXT NOT NULL,
  supporter          TEXT NOT NULL,
  amount             BIGINT NOT NULL,
  timestamp          BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_indexer_purchases_profile
  ON indexer_access_purchases (creator_profile_id);

-- Cursors for resumable event polling (key = event type, value = JSON EventId)
CREATE TABLE IF NOT EXISTS indexer_cursors (
  event_type TEXT PRIMARY KEY,
  cursor     TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Optional: enable RLS later and allow public read on indexer_creators / indexer_content
-- for anon key; service role bypasses RLS for indexer writes.
