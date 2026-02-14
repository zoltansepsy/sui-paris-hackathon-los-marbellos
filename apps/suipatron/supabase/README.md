# Supabase — SuiPatron Indexer Store

When `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` are set, the app uses Supabase as the persistent store for the event indexer. Otherwise it uses in-memory storage (e.g. local dev).

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. In **Settings → API**: copy **Project URL** and **service_role** key (keep secret).
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Run the indexer schema once (Supabase Dashboard → SQL Editor, or CLI):
   - Paste and run the contents of `migrations/20250214000000_indexer_tables.sql`.

After that, `GET /api/events` (cron) will write to Supabase, and `GET /api/creators` / `GET /api/creator/:id` will read from it.
