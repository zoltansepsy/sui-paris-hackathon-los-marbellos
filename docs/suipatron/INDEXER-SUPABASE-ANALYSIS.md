# Indexer: Supabase Backing Store — Analysis & Implementation

**Purpose:** Assess and implement Supabase (PostgreSQL) as the persistent store for the SuiPatron event indexer.

**Status:** **Implemented.** Use Supabase when `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` are set; otherwise the app uses the in-memory store (e.g. local dev).

---

## Summary

| Outcome | Probability | Notes |
|--------|-------------|--------|
| **Supabase is a good fit** | **~95%** | Same store interface; schema maps 1:1; stack already includes Supabase. |
| **Works in Vercel serverless** | **~95%** | Supabase JS client is stateless; no connection pooling issues at our scale. |
| **Cursor persistence across cold starts** | **100%** | Cursors in a table; indexer resumes correctly. |
| **API latency < 500ms p95** | **~90%** | Single-row / small range queries; possible if we add indexes. |
| **Scales to 10k+ creators** | **~90%** | Postgres + indexes; optional read replica later. |

**Overall recommendation:** **Use Supabase for the indexer store.** High probability of success; aligns with existing tech stack; minimal new moving parts.

---

## Why Supabase Fits

1. **Already in stack** — Tech stack (e.g. `tech-stack.mdc`) defines Supabase as primary DB (85%+). No new vendor.
2. **Store interface unchanged** — Current `indexerStore` methods map directly to SQL:
   - `upsertCreator` → `INSERT ... ON CONFLICT (profile_id) DO UPDATE`
   - `upsertContent` → same on `content_id`
   - `addAccessPurchase` → `INSERT` into purchases + `UPDATE` creator `total_supporters`
   - `getCreator` / `getCreators` / `getContentByProfile` / `getSupporters` → `SELECT` with `LIMIT`/cursor
   - `getLastCursor` / `setLastCursor` → small `indexer_cursors` table
3. **Cursor persistence** — In-memory cursors are lost on cold start. Storing them in Supabase guarantees incremental indexing across cron invocations.
4. **Serverless-friendly** — Supabase client uses HTTP (REST/PostgREST); no long-lived DB connections, so safe from Vercel serverless limits.

---

## Schema (1:1 with indexer types)

```sql
-- Creators (one row per CreatorProfile)
CREATE TABLE indexer_creators (
  profile_id     TEXT PRIMARY KEY,
  owner          TEXT NOT NULL,
  name           TEXT NOT NULL,
  bio            TEXT NOT NULL DEFAULT '',
  avatar_blob_id TEXT,
  suins_name     TEXT,
  price          BIGINT NOT NULL,
  content_count  INT NOT NULL DEFAULT 0,
  total_supporters INT NOT NULL DEFAULT 0,
  created_at     BIGINT NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Content (one row per Content DOF)
CREATE TABLE indexer_content (
  content_id          TEXT PRIMARY KEY,
  creator_profile_id  TEXT NOT NULL REFERENCES indexer_creators(profile_id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  blob_id             TEXT NOT NULL,
  content_type        TEXT NOT NULL,
  created_at          BIGINT NOT NULL
);
CREATE INDEX idx_indexer_content_profile ON indexer_content(creator_profile_id);

-- Access purchases (for supporters list; total_supporters denormalized on creator)
CREATE TABLE indexer_access_purchases (
  id                  BIGSERIAL PRIMARY KEY,
  access_pass_id      TEXT NOT NULL,
  creator_profile_id  TEXT NOT NULL,
  supporter           TEXT NOT NULL,
  amount              BIGINT NOT NULL,
  timestamp           BIGINT NOT NULL
);
CREATE INDEX idx_indexer_purchases_profile ON indexer_access_purchases(creator_profile_id);

-- Cursors for resumable event polling (key = event type, value = JSON EventId)
CREATE TABLE indexer_cursors (
  event_type TEXT PRIMARY KEY,
  cursor     TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Pagination for `getCreators(limit, cursor)` can use `ORDER BY created_at, profile_id` and `WHERE (created_at, profile_id) > (cursor_created_at, cursor_profile_id)` with a composite cursor, or a simple `OFFSET`/`LIMIT` if we accept offset-based pagination for MVP.

---

## Risks and Mitigations

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Supabase project not yet provisioned for SuiPatron | Medium | Create project; add `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` to env. |
| Row-level security (RLS) blocking indexer writes | Low | Use service role key for indexer; RLS can be added later for other tables. |
| High read latency under load | Low | Indexes on `profile_id`, `creator_profile_id`; optional Supabase read replica. |
| Duplicate events replayed | Low | Idempotent upserts by primary key; cursors prevent large re-processing. |

---

## Implementation (Done)

- **Store:** `apps/suipatron/src/app/lib/indexer/store-supabase.ts` — implements `IndexerStore` (async) with `@supabase/supabase-js`.
- **Factory:** `apps/suipatron/src/app/lib/indexer/get-store.ts` — `getIndexerStore()` returns Supabase store when env is set, else in-memory.
- **Env:** `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`; `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` (service role recommended for indexer writes).
- **Schema:** `apps/suipatron/supabase/migrations/20250214000000_indexer_tables.sql` — run in Supabase SQL Editor or via `supabase db push` (if using Supabase CLI).
- **API & indexer:** All consumers use `getIndexerStore()` and `await` store methods; no code path references the store implementation directly.

---

## Conclusion

**Leveraging Supabase for the indexer is highly likely to succeed (~90–95%)** and is recommended. It gives persistent, resumable indexing and aligns with the existing stack; the main work is a second store implementation and env/config to switch between in-memory (dev) and Supabase (production).
