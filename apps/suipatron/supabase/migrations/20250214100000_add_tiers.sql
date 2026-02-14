-- Phase 2: Replace flat price with tiers JSONB, add tier-level fields.
-- Run in Supabase SQL Editor or via supabase db push.

-- Replace price with tiers JSONB on creators
ALTER TABLE indexer_creators ADD COLUMN IF NOT EXISTS tiers JSONB NOT NULL DEFAULT '[]';
ALTER TABLE indexer_creators DROP COLUMN IF EXISTS price;

-- Add min_tier_level to content
ALTER TABLE indexer_content ADD COLUMN IF NOT EXISTS min_tier_level BIGINT NOT NULL DEFAULT 0;

-- Add tier_level and expires_at to purchases
ALTER TABLE indexer_access_purchases ADD COLUMN IF NOT EXISTS tier_level BIGINT NOT NULL DEFAULT 1;
ALTER TABLE indexer_access_purchases ADD COLUMN IF NOT EXISTS expires_at BIGINT;
