-- Add unique index on access_pass_id for renewal updates.
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_pass_id_unique
  ON indexer_access_purchases (access_pass_id);
