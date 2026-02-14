# Connecting the Indexer to the Frontend

**Current state:** Explore and Creator Profile are **wired to the indexer** with on-chain fallback. When the indexer has data (after `GET /api/events` runs, e.g. via cron), Explore uses `useIndexedCreators` and Creator Profile uses `useIndexedCreator`. When the indexer returns empty or 404, both pages fall back to on-chain data (`useCreatorProfiles` / `useCreatorProfile` + `useContentList`).

---

## 1. What the indexer provides

| Endpoint | Returns | Used by FE today |
|----------|---------|-------------------|
| `GET /api/creators?limit=20&cursor=...` | `{ creators: IndexedCreator[], nextCursor, hasNextPage }` | Yes (Explore via `useIndexedCreators`) |
| `GET /api/creator/:id` | `{ creator: IndexedCreator, content: IndexedContent[] }` | Yes (Creator Profile via `useIndexedCreator`, fallback on 404) |
| `GET /api/events` | Runs the indexer (poll SUI → upsert store) | Cron / manual only |

**Indexer store** is populated only when something calls `GET /api/events` (e.g. Vercel Cron every minute). Without that, the store is empty and the API returns empty or 404.

**Indexed types** (from `app/lib/indexer/types.ts`):

- **IndexedCreator:** `profileId`, `owner`, `name`, `bio`, `avatarBlobId?`, `suinsName?`, `price` (number), `contentCount`, `totalSupporters`, `createdAt`
- **IndexedContent:** `contentId`, `creatorProfileId`, `title`, `description`, `blobId`, `contentType`, `createdAt`

---

## 2. What the frontend expects

UI uses **Creator** and **Content** from `shared/types/creator.types.ts`:

- **Creator:** `id`, `name`, `email`, `avatar`, `suinsName?`, `bio?`, `price`, `balance?`, `contentCount`, `supporterCount`
- **Content:** `id`, `creatorId`, `title`, `description?`, `type` (image|text|pdf), `thumbnail?`, `isLocked`, `createdAt`, and when needed **blobId** for Walrus/SEAL

So we need a thin mapping: **IndexedCreator → Creator**, **IndexedContent → Content** (with `blobId` and `isLocked`).

---

## 3. What you need to connect indexer → FE

### 3.1 Adapters (indexer → UI types)

Add in `app/lib/adapters.ts` (or a small `indexer-adapters.ts`):

- **indexedCreatorToCreator(IndexedCreator): Creator**  
  - `profileId` → `id`  
  - `totalSupporters` → `supporterCount`  
  - `avatarBlobId` → `avatar` URL (e.g. `${WALRUS_AGGREGATOR_URL_TESTNET}/blobs/${avatarBlobId}` or dicebear fallback)  
  - No `balance` in indexer → omit or 0  

- **indexedContentToContent(IndexedContent, hasAccess: boolean): Content & { blobId: string }**  
  - `contentId` → `id`  
  - `creatorProfileId` → `creatorId`  
  - `contentType` → `type`  
  - `blobId` kept for Walrus  
  - `isLocked: !hasAccess`  

### 3.2 Hooks that call the API

- **useIndexedCreators(limit?, cursor?)**  
  - `fetch('/api/creators?limit=...&cursor=...')`  
  - Map `result.creators` with `indexedCreatorToCreator`  
  - Return `{ creators: Creator[], nextCursor, hasNextPage, isLoading, refetch }` (e.g. via `useQuery`)

- **useIndexedCreator(profileId)** (optional, for Creator Profile)  
  - `fetch(\`/api/creator/${profileId}\`)`  
  - Map `creator` and `content` with the adapters  
  - Return `{ creator: Creator, content: (Content & { blobId: string })[], isLoading }`  
  - For `isLocked` you still need access (e.g. `useHasAccess(address, profileId)`) so the same as today.

### 3.3 Wire into pages

- **Explore**  
  - **Option A:** Use **useIndexedCreators** instead of **useCreatorProfiles** when you want indexer (e.g. feature flag or env).  
  - **Option B:** Keep **useCreatorProfiles** (on-chain) and add a “Load more” that uses **useIndexedCreators** with cursor.  
  - **Option C:** Use indexer as primary: replace `useCreatorProfiles()` with `useIndexedCreators(20)` and add “Load more” with `nextCursor`.  

- **Creator Profile**  
  - **Option A:** Use **useIndexedCreator(id)** when available; fall back to **useCreatorProfile(id)** + **useContentList(id)** if API 404 (e.g. not indexed yet).  
  - **Option B:** Keep current on-chain only; use indexer only for a future “search” or “browse” that hits `/api/creators`.  

### 3.4 Run the indexer

- **Vercel:** Add a cron job that hits `GET /api/events` (e.g. every 1–5 minutes). Optionally protect with `Authorization: Bearer CRON_SECRET` (already supported in the route).  
- **Elsewhere:** Same idea: periodic HTTP GET to `/api/events` so the indexer store stays updated.  
- Without this, the indexer store is empty and the API will return empty lists or 404 for creator/:id.

---

## 4. Checklist to “connect indexer to FE”

| Step | Action | Status |
|------|--------|--------|
| 1 | Add **indexedCreatorToCreator** and **indexedContentToContent** in adapters. | Done (`app/lib/adapters.ts`) |
| 2 | Add **useIndexedCreators(limit?, cursor?)** that fetches `/api/creators` and maps to `Creator[]`. | Done (`app/hooks/useCreator.ts`) |
| 3 | Add **useIndexedCreator(profileId, hasAccess)** that fetches `/api/creator/:id` and maps to Creator + Content[]. | Done |
| 4 | In **Explore**, use **useIndexedCreators** with on-chain fallback when indexer returns no creators. | Done (`app/pages/Explore.tsx`) |
| 5 | In **Creator Profile**, use **useIndexedCreator** with fallback to on-chain when 404. | Done (`app/pages/CreatorProfile.tsx`) |
| 6 | Ensure **indexer runs** (cron or manual `GET /api/events`) so the store has data. | Operator responsibility |
| 7 | (Optional) Add **search** in the API (e.g. filter by name/bio/suinsName in `getCreators`) and use it from Explore. | Not done |

---

## 5. Why use indexer at all?

- **Pagination:** Cursor-based list without re-querying events every time.  
- **Performance:** One DB query vs. event query + multiGetObjects per page.  
- **Search:** Filter by name/bio/SuiNS in the store (if you add it).  
- **Consistency:** Same shape as on-chain; you can still fall back to on-chain when a profile isn’t indexed yet (e.g. right after create).

Explore and Creator Profile now read from the indexer API when data is available and fall back to on-chain when the indexer returns empty or 404. Keep the indexer up to date by calling `/api/events` (e.g. Vercel Cron).
