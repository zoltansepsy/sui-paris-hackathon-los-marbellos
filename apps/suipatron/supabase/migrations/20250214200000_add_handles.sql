-- Phase 2: Creator Registry handles table for handle→profile lookups.
-- Run in Supabase SQL Editor or via supabase db push.

CREATE TABLE IF NOT EXISTS indexer_handles (
  handle        TEXT PRIMARY KEY,
  profile_id    TEXT NOT NULL UNIQUE,
  registered_at BIGINT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indexer_handles_profile
  ON indexer_handles (profile_id);
