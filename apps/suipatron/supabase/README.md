# Supabase — SuiPatron Indexer Store

When `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` are set, the app uses Supabase as the **persistent store** for the event indexer. Otherwise it uses in-memory storage (fine for local dev; data is lost on restart).

- **Indexer** writes: creators, content, access purchases, and cursors (for resumable event polling).
- **API** reads: `GET /api/creators` and `GET /api/creator/:id` read from this store. `GET /api/events` (cron) runs the indexer and writes to it.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose an organization (or create one), set **Name** (e.g. `suipatron`), **Database password** (save it somewhere safe), and **Region**.
4. Wait for the project to be ready.

---

## 2. Get URL and API keys

1. In the Supabase Dashboard, open your project.
2. Go to **Settings** (gear icon) → **API**.
3. Copy:
   - **Project URL** — e.g. `https://xxxxxxxxxxxx.supabase.co`
   - **service_role** key (under "Project API keys") — long JWT starting with `eyJ...`  
     ⚠️ **Keep this secret.** Use it only on the server (e.g. in `.env.local`); never expose it to the client.

---

## 3. Add env vars in the app

In **`apps/suipatron/`**, create or edit **`.env.local`** (this file is gitignored):

```bash
# Supabase — indexer store
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- You can use `SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL` if you prefer (server-only).
- For indexer writes the app expects **service_role**; `SUPABASE_ANON_KEY` works for read/write if RLS allows it, but service_role is recommended so the indexer can write without RLS setup.

---

## 4. Run the database migration

Create the indexer tables in Supabase once.

### Option A — SQL Editor (easiest)

1. In Supabase Dashboard: **SQL Editor** → **New query**.
2. Open `apps/suipatron/supabase/migrations/20250214000000_indexer_tables.sql` in your repo.
3. Copy the full contents and paste into the SQL Editor.
4. Click **Run**. You should see “Success. No rows returned.”

### Option B — Supabase CLI

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
cd apps/suipatron
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

(`YOUR_PROJECT_REF` is in the project URL: `https://YOUR_PROJECT_REF.supabase.co`.)

---

## 5. Verify

1. In Supabase: **Table Editor**. You should see:
   - `indexer_creators`
   - `indexer_content`
   - `indexer_access_purchases`
   - `indexer_cursors`
2. Start the app from repo root: `pnpm dev` (or `cd apps/suipatron && pnpm dev`).
3. Trigger the indexer (e.g. call `GET /api/events` once, or set up a cron). After some SUI events are processed, `indexer_creators` / `indexer_content` may have rows.
4. Visit Explore or a creator page; they read from the indexer store when Supabase is configured.

---

## Tables (reference)

| Table                      | Purpose                                                  |
| -------------------------- | -------------------------------------------------------- |
| `indexer_creators`         | One row per CreatorProfile (owner, name, price, etc.)    |
| `indexer_content`          | One row per Content (title, blob_id, creator_profile_id) |
| `indexer_access_purchases` | Access purchases (supporter, amount, timestamp)          |
| `indexer_cursors`          | Event polling cursors (resumable)                        |

Schema is in `migrations/20250214000000_indexer_tables.sql`. You can enable RLS later and grant `anon` read-only access to `indexer_creators` / `indexer_content` if you want to query from the client; the indexer uses the service role and bypasses RLS.
