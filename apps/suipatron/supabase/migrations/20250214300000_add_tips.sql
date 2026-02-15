-- Phase 2: Tips table for indexing TipReceived events.
-- Run in Supabase SQL Editor or via supabase db push.

CREATE TABLE IF NOT EXISTS indexer_tips (
  id              BIGSERIAL PRIMARY KEY,
  profile_id      TEXT NOT NULL,
  tipper          TEXT NOT NULL,
  total_amount    BIGINT NOT NULL,
  creator_amount  BIGINT NOT NULL,
  platform_fee    BIGINT NOT NULL,
  timestamp       BIGINT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indexer_tips_profile
  ON indexer_tips (profile_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_indexer_tips_tipper
  ON indexer_tips (tipper, timestamp DESC);
