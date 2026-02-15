# SuiPatron — Implementation Status

> **Central developer handover document.** Update this file as tasks are completed.
> Cross-references task IDs from `docs/SCOPE.md` Section 8.

---

## Completed

### Smart Contracts — Phase 1 (A1–A8)

All Phase 1 core Move contracts implemented, built, tested, and deployed to testnet. **18/18 unit tests pass.**

**Phase 1 deployment (testnet):**
- Package ID: `0xf3a74f8992ff0304f55aa951f1340885e3aa0018c7118670fa6d6041216c923f`

### Smart Contracts — Phase 2 (Tiers, Registry, Tips/Fees, Subscriptions)

All Phase 2 features implemented on branch `zoltan/smart-contract-phase2`. **45/45 unit tests pass.**

| File | Lines | Description |
|------|-------|-------------|
| `packages/blockchain/contracts/Move.toml` | ~17 | Package manifest (edition 2024.beta) |
| `packages/blockchain/contracts/sources/suipatron.move` | ~765 | Core module — tiers, fees, tips, subscriptions |
| `packages/blockchain/contracts/sources/seal_policy.move` | ~105 | SEAL access control — 40-byte identity, tier + expiry checks |
| `packages/blockchain/contracts/sources/registry.move` | ~105 | Creator Registry — DF String→ID handle mapping |
| `packages/blockchain/contracts/tests/suipatron_tests.move` | ~2050 | 45 unit tests across 13 categories |

**Types implemented:**
- `Platform` — shared singleton (OTW), now with `platform_fee_bps: u64` and `treasury: Balance<SUI>`
- `AdminCap` — owned by deployer, for platform admin operations
- `Tier` — value type (`store, copy, drop`): `name`, `description`, `price`, `tier_level`, `duration_ms: Option<u64>` (None = permanent, Some = subscription)
- `CreatorProfile` — shared object with `tiers: vector<Tier>` (replaces Phase 1 flat `price: u64`), balance, content count
- `Content` — DOF on CreatorProfile, now with `min_tier_level: u64` for tier-gated access
- `CreatorCap` — owned by creator, proves ownership of a specific CreatorProfile
- `AccessPass` — owned NFT with `tier_level: u64` and `expires_at: Option<u64>` (None = permanent, Some = subscription expiry)
- `Registry` — shared singleton (in `registry.move`), DF-based `String → ID` handle mapping

**Entry functions:**
- `create_profile(platform, name, bio, tier_name, tier_description, tier_price, tier_level, tier_duration_ms, clock, ctx)` — creates CreatorProfile with initial tier + CreatorCap
- `update_profile(profile, cap, name?, bio?, avatar_blob_id?, suins_name?, clock)` — partial updates (price param removed; use `add_tier` for tiers)
- `add_tier(profile, cap, name, description, price, tier_level, duration_ms, clock)` — add tier to profile (validates no duplicate tier_level)
- `publish_content(profile, cap, title, description, blob_id, content_type, min_tier_level, clock, ctx)` — creates Content as DOF, gated to min_tier_level
- `purchase_access(platform, profile, tier_index, payment, clock, ctx)` — validates payment >= tier.price, applies platform fee split, mints AccessPass with tier_level + expires_at
- `withdraw_earnings(profile, cap, clock, ctx)` — transfers full balance to creator
- `tip(platform, profile, payment, clock, ctx)` — one-time tip with platform fee split
- `set_platform_fee(platform, admin_cap, fee_bps, clock)` — admin-only, set fee in basis points (max 10000)
- `withdraw_platform_fees(platform, admin_cap, clock, ctx)` — admin-only, withdraw treasury
- `renew_subscription(platform, profile, access_pass, payment, clock, ctx)` — mutates AccessPass in-place, extends expiry from max(current_expiry, now) + duration
- `migrate(platform, admin_cap)` — version migration for upgrades
- `register_handle(registry, profile, cap, handle, clock)` — register unique handle in Registry (in registry.move)
- `lookup_handle(registry, handle): Option<ID>` — look up handle→profile ID (in registry.move)

**Events:**
- `ProfileCreated` — `profile_id`, `owner`, `name`, `initial_tier_count`, `timestamp`
- `ProfileUpdated` — `profile_id`, `name`, `timestamp`
- `TierAdded` — `profile_id`, `tier_name`, `tier_level`, `price`, `is_subscription`, `timestamp`
- `ContentPublished` — `content_id`, `profile_id`, `blob_id`, `content_type`, `min_tier_level`, `timestamp`
- `AccessPurchased` — `access_pass_id`, `profile_id`, `supporter`, `amount`, `tier_level`, `expires_at`, `platform_fee`, `timestamp`
- `EarningsWithdrawn` — `profile_id`, `amount`, `recipient`, `timestamp`
- `TipReceived` — `profile_id`, `tipper`, `total_amount`, `creator_amount`, `platform_fee`, `timestamp`
- `PlatformFeeUpdated` — `old_fee_bps`, `new_fee_bps`, `timestamp`
- `PlatformFeesWithdrawn` — `amount`, `recipient`, `timestamp`
- `SubscriptionRenewed` — `access_pass_id`, `profile_id`, `supporter`, `new_expires_at`, `amount_paid`, `timestamp`
- `HandleRegistered` — `registry_id`, `handle`, `profile_id`, `timestamp` (in registry.move)

**SEAL policy (Phase 2 — 40-byte identity):**
- `seal_approve(id, access_pass, clock, ctx)` — entry function called by SEAL key servers (Clock added in Phase 2)
- `check_seal_access(id, access_pass, caller, clock)` — validates: (1) 40-byte identity, (2) caller == supporter, (3) creator ID matches, (4) tier_level >= min_tier_level, (5) subscription not expired
- Identity format: `[CreatorProfile ID (32 bytes)][min_tier_level (8 bytes LE u64)]`

**Move patterns demonstrated:** One-Time Witness, Capability, Shared Objects, Dynamic Object Fields, Dynamic Fields, Events, Version Tracking, Balance/Coin handling, Coin Splitting (fee BPS), Subscription Expiry (Clock), Value Types (Tier)

**Test categories (45 tests across 13 categories):**
1. Initialization (1)
2. Profile Creation (3)
3. Profile Update (2)
4. Add Tier (4)
5. Content Publishing (3)
6. Access Purchase with Tiers (5)
7. Withdrawal (3)
8. Platform Fees (4)
9. Tips (3)
10. Subscription Renewal (4)
11. SEAL Policy v2 (7)
12. Registry (4)
13. Full Flow E2E (2)

### Service Layer — Phase 2 Tier Support

All frontend service-layer code updated from Phase 1 flat-price model to Phase 2 multi-tier model. On branch `zoltan/phase-2`.

**Type definitions updated:**
- `IndexedTier` added to `src/app/lib/indexer/types.ts` — tier representation for indexer (price in MIST)
- `IndexedCreator.price` replaced with `IndexedCreator.tiers: IndexedTier[]`
- `IndexedContent` gained `minTierLevel: number`
- `IndexedAccessPurchase` gained `tierLevel: number` and `expiresAt: number | null`
- `Tier` interface added to `src/shared/types/creator.types.ts` — tier representation for UI (price in SUI)
- `Creator.price` replaced with `Creator.tiers: Tier[]`
- `Content` gained `minTierLevel: number`
- `CreatorProfile.price` replaced with `CreatorProfile.tiers: Tier[]` in `user.types.ts`

**PTB builders rewritten** (`src/app/lib/ptb/index.ts`):
- All 9 builders match Phase 2 contract API signatures (create_profile with tier params, purchase_access with tier_index, publish_content with min_tier_level, add_tier, tip, renew_subscription, register_handle)
- Added `getRegistryId()` helper reading `NEXT_PUBLIC_REGISTRY_ID` env var

**Enoki server allowlist** (`src/app/lib/enoki-server.ts`):
- Added `add_tier`, `tip`, `renew_subscription`, `registry::register_handle` to allowed move call targets

**Indexer updated** (`src/app/lib/indexer/run.ts`):
- Added `TierAdded`, `TipReceived`, `SubscriptionRenewed` to EVENT_TYPES
- `ProfileCreated`/`ProfileUpdated` handlers read `tiers` vector from on-chain object
- `ContentPublished` handler reads `min_tier_level`
- `AccessPurchased` handler reads `tier_level` and `expires_at`
- `TierAdded` handler re-fetches profile object and updates tiers

**Indexer stores updated:**
- Supabase store (`store-supabase.ts`): `CreatorRow.tiers` as JSONB, `ContentRow.min_tier_level`, `PurchaseRow.tier_level`/`expires_at`
- New migration: `supabase/migrations/20250214100000_add_tiers.sql` — adds `tiers` JSONB column, drops `price`, adds `min_tier_level`, `tier_level`, `expires_at`

**Access pass hook** (`src/app/lib/access-pass.ts`):
- `AccessPassEntry` stores `{ creatorId, tierLevel, expiresAt }` instead of just creator ID strings
- `hasAccessAtTier(creatorId, minTierLevel)` checks tier level AND subscription expiry
- Backward-compatible migration from legacy `string[]` format

**Mock data** (`src/app/lib/mock-data.ts`):
- All mock creators have `tiers` arrays instead of flat `price`
- All mock content has `minTierLevel`

**Components updated for tiers:**
- `CreateProfileForm.tsx` — initial tier fields (name, description, price), calls updated `buildCreateProfileTx`
- `SupportModal.tsx` — tier selection UI (radio group), calls `buildPurchaseAccessTx(profileId, tierIndex, priceMist)`
- `CreatorCard.tsx` — shows "from X SUI" (lowest tier price)
- `CreatorProfile.tsx` — shows tier count and lowest price in support CTA
- `Dashboard.tsx` — displays tiers list instead of flat price input, `handleBecomeCreator` creates default tier

### Service Layer — Subscription Tiers Frontend

Completed the remaining subscription tier gaps. On branch `zoltan/phase-2`.

**Access pass hook** (`src/app/lib/access-pass.ts`):
- `AccessPassEntry` gained `accessPassId: string | null` for on-chain object tracking
- `addAccessPass()` now handles same-tier renewal (updates `expiresAt` instead of silently ignoring)
- Added `getEntry(creatorId)` helper for component use
- Backward-compatible migration from entries without `accessPassId`

**Transaction utilities** (`src/app/lib/get-created-objects.ts`):
- Added `getAccessPassIdFromTx(digest)` — extracts AccessPass object ID from purchase transaction results

**Subscription utilities** (`src/app/lib/subscription-utils.ts` — new file):
- `getSubscriptionStatus(expiresAt)` — returns `"active" | "expiring" | "expired" | "permanent"` (3-day threshold)
- `formatExpiry(expiresAt)` — human-readable remaining time ("Expires in 5d", "Expired")
- `formatExpiryDate(expiresAt)` — formatted date string

**Indexer — SubscriptionRenewed persistence:**
- `IndexerStore.updateAccessPassExpiry(accessPassId, newExpiresAt)` added to interface
- In-memory store: scans `purchasesByProfile` maps to find and update the entry
- Supabase store: SQL UPDATE on `indexer_access_purchases` by `access_pass_id`
- New migration: `supabase/migrations/20250214300000_access_pass_unique.sql` — UNIQUE index on `access_pass_id`
- Indexer `run.ts`: `SubscriptionRenewed` event now persisted (extracts `access_pass_id` + `new_expires_at`)

**CreateProfileForm** (`src/app/components/CreateProfileForm.tsx`):
- Added duration selector dropdown: Permanent, 7d, 30d, 90d, 365d
- `durationMs` computed from selection and passed to `buildCreateProfileTx`

**SupportModal** (`src/app/components/SupportModal.tsx`):
- Added `renewMode` prop for subscription renewal flow
- Purchase flow: extracts `accessPassId` from tx result via `getAccessPassIdFromTx`
- Renewal flow: calls `buildRenewSubscriptionTx`, computes smart expiry extension (stacking)
- UI: "Renew Subscription" title, locked tier selector, current→new expiry display
- Both `SupportModalWithSponsor` and `SupportModalMock` variants updated

**ContentCard** (`src/app/components/ContentCard.tsx`):
- Added optional `expiryStatus` prop
- Shows amber "Expiring Soon" badge (with Clock icon) or red "Expired" badge

**CreatorProfile** (`src/app/pages/CreatorProfile.tsx`):
- Expiry-aware access banner: green (active/permanent), amber (expiring), red (expired)
- "Renew Subscription" button for expired/expiring passes
- Passes `renewMode` and `expiryStatus` to child components

**Feed** (`src/app/pages/Feed.tsx`):
- Uses `entries` instead of `accessPasses` for expiry-aware creator filtering
- Shows expiry badges next to creator names in "Creators You Support" section
- Passes `expiryStatus` to ContentCard for each feed item

**Landing page** (`src/app/pages/Landing.tsx`):
- Updated hero text from "permanent access only" to "flexible access"
- Updated "Permanent Access" value prop to "Flexible Access" with subscription mention

### Service Layer — Creator Registry

Full service layer for the Creator Registry (handle→profile lookups). On branch `zoltan/phase-2`.

**Type definitions:**
- `IndexedHandle` added to `src/app/lib/indexer/types.ts` — `{ handle, profileId, registeredAt }`
- `IndexerStore` interface extended with `upsertHandle`, `getHandle`, `getHandleByProfileId`

**Indexer store implementations:**
- In-memory store (`store.ts`): dual `Map` storage — `handlesByName` (handle→entry) and `handlesByProfile` (profileId→entry)
- Supabase store (`store-supabase.ts`): `HandleRow` type, `rowToHandle` converter, `indexer_handles` table operations
- New migration: `supabase/migrations/20250214200000_add_handles.sql` — `indexer_handles` table with `handle` PK, `profile_id` UNIQUE, `registered_at`

**Indexer event processing** (`src/app/lib/indexer/run.ts`):
- Added `HandleRegistered` to `EVENT_TYPES`
- `EVENT_MODULE` map routes `HandleRegistered` to `registry` module (all others default to `suipatron`)
- Handler: extracts `handle`, `profile_id`, `timestamp` → calls `store.upsertHandle()`

**Service** (`src/app/lib/services/registry.ts`):
- `lookupHandle(handle)` — returns `IndexedHandle`, throws `HandleNotFoundError`
- `getCreatorByHandle(handle)` — resolves handle→profile→creator, throws `HandleNotFoundError` or `CreatorNotFoundError`
- `getHandleForCreator(profileId)` — returns `IndexedHandle | null`

**API route** (`src/app/api/registry/[handle]/route.ts`):
- `GET /api/registry/:handle` — resolves handle to `{ handle, creator, content }`
- Validates handle format via zod schema (3–30 chars, lowercase alphanumeric + hyphens/underscores)
- 400 for invalid format, 404 for unknown handles

**Error handling:**
- `HandleNotFoundError` added to `src/shared/errors/custom-errors.ts`

**Validation:**
- `handleSchema` + `parseHandle()` in `src/shared/validation/registry.schema.ts`

### Service Layer — One-Time Tips & Platform Fees

Full service layer for tips and platform fee management. On branch `zoltan/phase-2`.

**Type definitions:**
- `IndexedTip` added to `src/app/lib/indexer/types.ts` — `{ profileId, tipper, totalAmount, creatorAmount, platformFee, timestamp }`
- `IndexerStore` interface extended with `addTip`, `getTipsByProfile`, `getTipsByTipper`

**Indexer store implementations:**
- In-memory store (`store.ts`): dual `Map` storage — `tipsByProfile` and `tipsByTipper` with `ensureTipListByProfile`/`ensureTipListByTipper` helpers
- Supabase store (`store-supabase.ts`): `TipRow` type, `rowToTip` converter, `indexer_tips` table operations (insert, query by profile desc, query by tipper desc)
- New migration: `supabase/migrations/20250214300000_add_tips.sql` — `indexer_tips` table with `BIGSERIAL` PK, indexes on `(profile_id, timestamp DESC)` and `(tipper, timestamp DESC)`

**Indexer event processing** (`src/app/lib/indexer/run.ts`):
- `TipReceived` handler now stores tips (previously logged but skipped)
- Extracts `profile_id`, `tipper`, `total_amount`, `creator_amount`, `platform_fee`, `timestamp` → calls `store.addTip()`

**Tips service** (`src/app/lib/services/tips.ts` — new):
- `getTipsByProfile(profileId)` — returns all tips for a creator, throws `CreatorNotFoundError` if creator missing
- `getTipsByTipper(tipper)` — returns all tips sent by an address

**Platform service** (`src/app/lib/services/platform.ts` — new):
- `getPlatformConfig()` — reads Platform shared object on-chain via SUI client
- Returns `{ feeBps, treasuryBalance, totalCreators, totalAccessPasses }`
- Parses `Balance<SUI>` treasury field and `platform_fee_bps`

**API routes:**
- `GET /api/creator/:id/tips` (`src/app/api/creator/[id]/tips/route.ts` — new) — returns `{ tips: IndexedTip[] }`, 404 if creator not found
- `GET /api/platform` (`src/app/api/platform/route.ts` — new) — returns current fee config + stats from on-chain Platform object

**PTB builders** (`src/app/lib/ptb/index.ts`):
- `buildSetPlatformFeeTx(adminCapId, feeBps)` — admin-only, sets fee in basis points (0–10000)
- `buildWithdrawPlatformFeesTx(adminCapId)` — admin-only, withdraws platform treasury

### Contract Deployment (A9)

Package deployed to SUI Testnet.

| Item | Value |
|------|-------|
| Package ID | `0x470bfc45bf7dbc92bed9bf723ca7335b189332a909f5d1370622993600876666` |
| Platform ID | `0xb9010ffc6672232da2a699d092bc6cd7ebf2afba02588527d5b608f7690cdb2c` |
| Registry ID | `0x8effd5679d0bbd647b31cb7843b269b4f16c7714fa51712a043bc058a5aac5d8` |

Recorded in `packages/blockchain/sdk/networkConfig.ts` as network variables.

### Service Layer (P3–P14)

Complete service layer bridging Move contracts and React UI. All files type-check with zero errors against `@mysten/sui@2.4.0`, `@mysten/dapp-kit@1.0.3`, `@mysten/seal@1.0.1`, `@mysten/walrus@1.0.3`.

**Dependencies installed:**
- `@mysten/sui@2.4.0` (upgraded from 1.x — breaking v2 API)
- `@mysten/dapp-kit@1.0.3` (upgraded from 0.x)
- `@mysten/seal@1.0.1`
- `@mysten/walrus@1.0.3`
- `@mysten/enoki@1.0.3`

**Network config** (`packages/blockchain/sdk/networkConfig.ts`):
- Updated imports for SDK v2 (`getJsonRpcFullnodeUrl` from `@mysten/sui/jsonRpc`)
- Added `network` property required by dapp-kit v1
- `packageId`, `platformId`, and `registryId` set for testnet

**Constants** (`apps/dapp/app/constants.ts`):
- SEAL canonical key servers (3 testnet servers), threshold = 2
- Walrus aggregator URL, upload relay URL, WASM URL, default epochs
- Clock object ID, MIST conversion, supported content types

**Type definitions** (`apps/dapp/app/types/index.ts`):
- TypeScript interfaces: `CreatorProfile`, `Content`, `AccessPass`, `CreatorCap`
- Event types: `ProfileCreatedEvent`, `ContentPublishedEvent`, `AccessPurchasedEvent`, `EarningsWithdrawnEvent`, `ProfileUpdatedEvent`
- DTOs: `ProfileUpdateParams`, `ContentUploadParams`
- Parser functions: `parseCreatorProfile()`, `parseAccessPass()`, `parseCreatorCap()`, `parseContent()` — handle Move→TS field mapping (Option, u64-as-string, ID)

**Services** (`apps/dapp/app/services/`):

| File | Description |
|------|-------------|
| `transactionService.ts` | PTB builders for all 5 entry functions. Uses `tx.pure.option()` for partial updates, `tx.splitCoins()` for payment. |
| `creatorService.ts` | On-chain reads: `getCreatorProfile()`, `getCreatorProfiles()` (event-based discovery), `getContentList()` (dynamic fields), `getCreatorByOwner()`, `getCreatorCapByOwner()`. |
| `accessPassService.ts` | AccessPass queries: `getAccessPassesByOwner()`, `getAccessPassForCreator()`, `hasAccessToCreator()`. |
| `walrusService.ts` | Upload via flow API (encode→register→upload→certify) with upload relay. Download via aggregator HTTP with SDK fallback. Lazy WalrusClient init to avoid SSR WASM issues. |
| `sealService.ts` | Encrypt with creator profile identity. Decrypt with dynamic server matching (parses `EncryptedObject` BCS to find servers). Session key creation with wallet personal message signing. |
| `contentService.ts` | Orchestrator: `uploadContent()` = read file → SEAL encrypt → Walrus upload → build publish_content tx. `downloadContent()` = Walrus download → SEAL decrypt. Avatar upload/download (no encryption). |
| `index.ts` | Barrel exports for all services and factory functions. |

**React hooks** (`apps/dapp/app/hooks/`):

| File | Hooks |
|------|-------|
| `useCreator.ts` | `useCreatorProfile(id)`, `useCreatorProfiles(limit?)`, `useMyCreatorProfile(address)`, `useMyCreatorCap(address)`, `useContentList(profileId)` |
| `useAccessPass.ts` | `useMyAccessPasses(address)`, `useHasAccess(address, creatorProfileId)` |
| `useTransactions.ts` | `useSuiPatronTransactions()` — returns `{ createProfile, updateProfile, purchaseAccess, withdrawEarnings, isPending }` |
| `useContent.ts` | `useContentUpload()` — full encrypt+upload+publish flow. `useContentDecrypt()` — download+decrypt with session key lifecycle (auto-create, 10min TTL, auto-recreate on expiry). |
| `index.ts` | Barrel exports for all hooks. |

### Documentation

| File | Description |
|------|-------------|
| `docs/SCOPE.md` | Full project specification (1387 lines) — product vision, architecture, all specs |
| `docs/00-README.md` | Documentation hub — navigation, quick links |
| `docs/suipatron/01-product-breakdown-and-roadmap.md` | PBS with [x]/[ ] status per task |
| `docs/PRPs/` | PRDs, plans, templates for AI-assisted implementation |
| `docs/architecture/PTB-SPECIFICATION.md` | PTB builders for frontend transaction construction |
| `CLAUDE.md` | Project context for Claude Code |

---

## Remaining — MVP Tasks

### 1. Contract Deployment — Post-deploy Tasks

- [ ] AdminCap object ID (keep safe, not in env)
- [ ] Update Enoki Portal with new Package ID in allowed move call targets
- [ ] Smoke test via CLI: `sui client call --package {PKG} --module suipatron --function create_profile ...`

### 2. Frontend Scaffold (Z1, J1–J4)

- [x] Next.js app in `apps/suipatron/` (not Vite) — design system, layout, landing, explore
- [x] Install SUI SDKs: `@mysten/sui`, `@mysten/dapp-kit`, `@mysten/enoki`, `@mysten/seal`, `@mysten/walrus`
- [ ] Wire Explore to `GET /api/creators` (currently uses mock data)
- [ ] Replace mock auth with Enoki zkLogin; "Sign in with Google" CTA

### 3. Auth / Enoki zkLogin (P1–P2, Z4)

- [ ] Set up Enoki Portal: create app, add Google OAuth client ID, set redirect URLs
- [ ] Configure `NEXT_PUBLIC_ENOKI_PUBLIC_KEY` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [x] Implement Google sign-in flow using `@mysten/enoki/react` (`useEnokiFlow`) — **apps/suipatron**: `src/app/lib/auth-context.tsx`, `enoki-provider.tsx`
- [x] Auth callback handler (`/auth/callback`) — process Enoki redirect, establish session — **apps/suipatron**: `src/app/pages/AuthCallback.tsx`
- [x] Auth context/provider wrapping the app
- [ ] Protected routes (dashboard requires auth)

### 4. Backend / Serverless Functions (A10–A12)

- [x] `POST /api/sponsor` — accept transaction bytes, sponsor via Enoki private API — **apps/suipatron**: `src/app/api/sponsor/route.ts`
- [x] `POST /api/sponsor/execute` — execute previously sponsored transaction — **apps/suipatron**: `src/app/api/sponsor/execute/route.ts`
- [ ] `POST /api/subname` — create SuiNS subname for authenticated creator
- [x] `GET /api/creators` — list creator profiles (from indexer) — **apps/suipatron**: `src/app/api/creators/route.ts`
- [x] `GET /api/creator/:id` — get creator profile + content list — **apps/suipatron**: `src/app/api/creator/[id]/route.ts`
- [x] Event indexer — poll SUI events, build queryable state — **apps/suipatron**: `src/app/lib/indexer/` (store, run, types); trigger via `GET /api/events` (cron)
- [x] **Indexer store: Supabase** — Persistent store when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set; otherwise in-memory (dev). **apps/suipatron**: `src/app/lib/indexer/store-supabase.ts`, `get-store.ts`; schema in `supabase/migrations/20250214000000_indexer_tables.sql`. See `docs/suipatron/INDEXER-SUPABASE-ANALYSIS.md`.
- [x] `GET /api/registry/:handle` — resolve creator handle to profile + content — **apps/suipatron**: `src/app/api/registry/[handle]/route.ts`
- [x] `GET /api/creator/:id/tips` — list tips received by a creator — **apps/suipatron**: `src/app/api/creator/[id]/tips/route.ts`
- [x] `GET /api/platform` — current platform fee config + stats (on-chain read) — **apps/suipatron**: `src/app/api/platform/route.ts`

### 5. Integration — Remaining Items

PTB builders (transaction construction) — **Updated for Phase 2 API:**
- [x] `buildCreateProfileTx(name, bio, tierName, tierDesc, tierPrice, tierLevel, tierDurationMs)` — creates CreatorProfile + CreatorCap
- [x] `buildUpdateProfileTx(profileId, creatorCapId, updates)` — updates profile metadata (no price param)
- [x] `buildAddTierTx(profileId, creatorCapId, name, desc, price, tierLevel, durationMs)` — adds tier to profile
- [x] `buildPublishContentTx(profileId, creatorCapId, title, desc, blobId, contentType, minTierLevel)` — publishes content with tier gating
- [x] `buildPurchaseAccessTx(profileId, tierIndex, priceMist)` — purchases access at specific tier
- [x] `buildWithdrawEarningsTx(profileId, creatorCapId)` — withdraws creator earnings
- [x] `buildTipTx(profileId, amountMist)` — sends one-time tip
- [x] `buildRenewSubscriptionTx(profileId, accessPassId, priceMist)` — renews subscription
- [x] `buildRegisterHandleTx(profileId, creatorCapId, handle)` — registers creator handle
- [x] `buildSetPlatformFeeTx(adminCapId, feeBps)` — admin: sets platform fee in basis points
- [x] `buildWithdrawPlatformFeesTx(adminCapId)` — admin: withdraws platform treasury

SEAL integration — **Updated for Phase 2 identity format:**
- [ ] `encryptContent(data, creatorProfileId, minTierLevel, packageId)` — SEAL encrypt with 40-byte identity (32-byte ID + 8-byte LE tier level)
- [ ] `decryptContent(encryptedData, accessPass, sessionKey)` — SEAL decrypt via seal_approve (now requires Clock 0x6)

Walrus integration:
- [ ] `uploadToWalrus(encryptedData)` — store blob, return blobId
- [ ] `downloadFromWalrus(blobId)` — retrieve encrypted blob

Sponsored transaction flow:
- [x] Wire up Enoki sponsor flow (build → sponsor → sign → execute) — **apps/suipatron**: `src/app/lib/sponsor-flow.ts`, `use-sponsor-transaction.ts`
- [x] Dashboard: create profile, withdraw — **CreateProfileForm.tsx**, **WithdrawButton.tsx**
- [x] SupportModal: purchase access

### 6. UI Pages (J5–J13)

- [ ] Creator Profile page (`/creator/:id`) — header, tier list, content grid, "Support" button
- [ ] Tier selection + payment confirmation modal
- [ ] Creator Dashboard (`/dashboard`) — profile editor, tier management, content list
- [ ] Content uploader — file picker, title, description, min tier level, encrypt + upload flow
- [ ] Content viewer — renderers for image, text/markdown, PDF
- [ ] Supporter Feed (`/feed`) — list of supported creators, content feed
- [ ] Earnings panel — balance display, "Withdraw" button
- [ ] Tip button on creator profiles
- [ ] Subscription renewal flow for expiring AccessPasses
- [ ] Loading states, skeleton screens
- [ ] Error toasts, empty states with CTAs

### 7. SuiNS Integration (Z5, P12)

- [ ] Register `suipatron.sui` domain on testnet at https://testnet.suins.io
- [ ] Backend endpoint to create subnames (`alice@suipatron.sui`)
- [ ] Frontend: trigger subname creation during profile setup
- [ ] Display SuiNS badges on creator profiles

### 8. Testing & Demo Prep (Z6–Z10)

- [ ] Integration test: sign in → create profile → upload content
- [ ] Integration test: browse → purchase access → decrypt content
- [ ] Seed demo data: 3 creators, realistic prices/tiers, 5+ content items
- [ ] Write and practice 3-minute demo script (see SCOPE.md Section 14)
- [ ] Record backup video of successful demo flow
- [ ] Configure Vercel deployment (auto-deploy from main)

---

## Technical Notes & Gotchas

These were discovered during implementation. Keep adding to this list.

### Move / SUI CLI

- **Move.toml**: Do NOT add explicit `[dependencies.Sui]` — the SUI CLI auto-includes system packages. Adding it causes `"Dependency 'Sui' is a legacy system name"` error.
- **`#[expected_failure]`**: When testing aborts from a different module (e.g., testing `suipatron::suipatron::EUnauthorized` from the test module), use plain `#[expected_failure]` without `abort_code`. Module-qualified paths in `abort_code` are not supported, and using a local constant with the same value causes a module-origin mismatch.
- **`take_shared_by_id`**: When multiple shared objects of the same type exist in a test scenario, `take_shared<T>` may grab the wrong one. Use `take_shared_by_id<T>(&scenario, object_id)` for deterministic selection.
- **Literal types**: Use typed literals like `3u64` instead of bare `3` to avoid warnings.
- **`#[allow(unused_const)]`**: Use on error codes that are defined for documentation but not directly referenced in the module (e.g., `ENoTiers`, `EAccessPassExpired` which are asserted via other patterns).
- **Unused params**: Prefix with `_` (e.g., `_ctx: &mut TxContext`) for parameters required by entry function signatures but not used in the body.

### SUI SDK v2 Migration (`@mysten/sui@2.4.0`)

- **`SuiClient` removed**: Replaced by `CoreClient` (minimal: getObject, getDynamicField, etc.) from `@mysten/sui/client` and `SuiJsonRpcClient` (full JSON-RPC: queryEvents, getOwnedObjects, multiGetObjects, etc.) from `@mysten/sui/jsonRpc`.
- **`getFullnodeUrl` removed**: Use `getJsonRpcFullnodeUrl` from `@mysten/sui/jsonRpc`.
- **`SuiObjectData`**: Now exported from `@mysten/sui/jsonRpc` (not `@mysten/sui/client`).
- **`useSuiClient()`**: Returns `SuiJsonRpcClient` in dapp-kit v1. This satisfies both `SealCompatibleClient` and `ClientWithCoreApi` since `SuiJsonRpcClient` has a `core: JSONRpcCoreClient` property.
- **`createNetworkConfig`**: Now requires a `network` property in each config entry (e.g., `network: "testnet"`).
- **`tx.pure.option()`**: Works in v2 for both `"string"` and `"u64"` types — tested and verified.

### SEAL Encryption

- **Identity format (Phase 2 — tiered)**: 40 bytes = `[CreatorProfile ID (32 bytes)][min_tier_level (8 bytes, little-endian u64)]`. Content at different tier levels uses different SEAL identities.
- **Identity format (Phase 1 — flat)**: 32 bytes = CreatorProfile object ID bytes. All content for a creator shares the same identity.
- **Clock in `seal_approve`**: Phase 2 adds `&Clock` (object `0x6`) to `seal_approve` for subscription expiry validation. SEAL key servers must include Clock in their PTB.
- **`packageId` for SEAL SDK**: Must be hex-encoded WITHOUT the `0x` prefix (check SDK docs).
- **Threshold**: Set to 2 (at least 2 key servers must agree).
- **Session keys**: Cached per-user per-package. First decrypt requires wallet signature; subsequent ones reuse the session (10 min TTL).
- **Dynamic server matching**: When decrypting, parse `EncryptedObject` BCS to extract the server IDs used during encryption, then create a matched `SealClient` for reliability.

### Walrus Storage

- **Upload relay**: Use `https://upload-relay.testnet.walrus.space` with a tip of 1000 MIST per upload for reliable uploads (bypasses unreliable direct storage node connections).
- **Aggregator-first download**: Fetch from `https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}` first (fast HTTP), fall back to SDK `readBlob()`.
- **Lazy init**: `WalrusClient` loads WASM — must not initialize during SSR. Use lazy `ensureClient()` pattern.
- **Flow API timing**: After the registration transaction, wait ~5 seconds for network sync before uploading slivers.

### Architecture Decisions

- **Phase 2 tiers**: `vector<Tier>` on CreatorProfile (not Table/DF) — small cardinality, simpler, copy+drop compatible.
- **`tier_index` for purchase**: `purchase_access` takes `tier_index: u64` (vector index) rather than `tier_level` to avoid linear scan. `renew_subscription` uses `find_tier_by_level` since it needs to match by level.
- **Subscription renewal**: Mutates AccessPass in-place (preserves object ID for off-chain references). Extends from `max(current_expiry, now)` to handle both pre-expiry and post-expiry renewals.
- **Platform fee**: Basis points (BPS), default 0. Applied to `purchase_access`, `tip`, and `renew_subscription`. Uses shared `calculate_fee_split(amount, fee_bps)` helper.
- **Registry**: Separate module with its own `init`. Uses Dynamic Fields (DF, not DOF) for String→ID mapping. Lightweight — no Balance or complex state.
- **Content keyed by `u64` index**: `profile.content_count` used as auto-incrementing key for DOF. Simple but means content cannot be deleted/reordered without gaps.
- **AccessPass stores `supporter: address`**: Used by `seal_approve` to verify the caller owns the pass. Important for SEAL validation.
- **VERSION bumped to 2**: All structs (Platform, CreatorProfile, Registry) and entry functions check `version == VERSION`.
- **Service layer uses `SuiJsonRpcClient`**: Services accept `SuiJsonRpcClient` (from dapp-kit's `useSuiClient()`) which provides both full JSON-RPC methods and core client compatibility for SEAL/Walrus.

---

## Contract API Quick Reference

For frontend developers building PTBs.

### Entry Functions

```
suipatron::suipatron::create_profile(
    platform: &mut Platform,        // shared object — platformId
    name: String,
    bio: String,
    tier_name: String,              // Initial tier name
    tier_description: String,       // Initial tier description
    tier_price: u64,                // Initial tier price in MIST
    tier_level: u64,                // Must be > 0. Higher = more access
    tier_duration_ms: Option<u64>,  // None = permanent, Some = subscription period
    clock: &Clock,                  // 0x6
    ctx: &mut TxContext,
)
// Creates: CreatorProfile (shared) + CreatorCap (transferred to sender)
// Emits: ProfileCreated

suipatron::suipatron::update_profile(
    profile: &mut CreatorProfile,   // shared object
    cap: &CreatorCap,               // owned by creator
    name: Option<String>,
    bio: Option<String>,
    avatar_blob_id: Option<String>,
    suins_name: Option<String>,
    clock: &Clock,
)
// Emits: ProfileUpdated

suipatron::suipatron::add_tier(
    profile: &mut CreatorProfile,
    cap: &CreatorCap,
    name: String,
    description: String,
    price: u64,                     // in MIST
    tier_level: u64,                // Must be > 0, must not duplicate existing level
    duration_ms: Option<u64>,       // None = permanent, Some = subscription period
    clock: &Clock,
)
// Emits: TierAdded

suipatron::suipatron::publish_content(
    profile: &mut CreatorProfile,
    cap: &CreatorCap,
    title: String,
    description: String,
    blob_id: String,                // Walrus blob ID (encrypted content)
    content_type: String,           // "image", "text", "pdf"
    min_tier_level: u64,            // Minimum tier level to decrypt this content
    clock: &Clock,
    ctx: &mut TxContext,
)
// Emits: ContentPublished

suipatron::suipatron::purchase_access(
    platform: &mut Platform,
    profile: &mut CreatorProfile,
    tier_index: u64,                // Index into profile.tiers vector
    payment: Coin<SUI>,             // must be >= tier.price
    clock: &Clock,
    ctx: &mut TxContext,
)
// Creates: AccessPass (transferred to sender) with tier_level and optional expires_at
// Emits: AccessPurchased

suipatron::suipatron::withdraw_earnings(
    profile: &mut CreatorProfile,
    cap: &CreatorCap,
    clock: &Clock,
    ctx: &mut TxContext,
)
// Transfers: full balance to profile.owner
// Emits: EarningsWithdrawn

suipatron::suipatron::tip(
    platform: &mut Platform,
    profile: &mut CreatorProfile,
    payment: Coin<SUI>,             // must be > 0
    clock: &Clock,
    ctx: &mut TxContext,
)
// Deposits: tip amount (minus platform fee) to profile.balance
// Emits: TipReceived

suipatron::suipatron::set_platform_fee(
    platform: &mut Platform,
    cap: &AdminCap,
    fee_bps: u64,                   // 0-10000 (basis points, 250 = 2.5%)
    clock: &Clock,
)
// Admin only
// Emits: PlatformFeeUpdated

suipatron::suipatron::withdraw_platform_fees(
    platform: &mut Platform,
    cap: &AdminCap,
    clock: &Clock,
    ctx: &mut TxContext,
)
// Admin only — transfers treasury to platform.admin
// Emits: PlatformFeesWithdrawn

suipatron::suipatron::renew_subscription(
    platform: &mut Platform,
    profile: &mut CreatorProfile,
    access_pass: &mut AccessPass,   // Must be a subscription (expires_at is Some)
    payment: Coin<SUI>,             // must be >= tier.price
    clock: &Clock,
    ctx: &mut TxContext,
)
// Mutates: access_pass.expires_at extended by tier.duration_ms
// Emits: SubscriptionRenewed

suipatron::registry::register_handle(
    registry: &mut Registry,
    profile: &CreatorProfile,
    cap: &CreatorCap,
    handle: String,                 // Unique handle
    clock: &Clock,
)
// Emits: HandleRegistered

suipatron::seal_policy::seal_approve(
    id: vector<u8>,                 // SEAL identity (40 bytes = 32-byte CreatorProfile ID + 8-byte LE min_tier_level)
    access_pass: &AccessPass,       // supporter's AccessPass NFT
    clock: &Clock,                  // 0x6 — for subscription expiry check
    ctx: &TxContext,
)
// Used by SEAL key servers — not called directly by frontend
```

### Getter Functions (for on-chain reads)

```
// AccessPass
access_pass_creator_profile_id(pass) → ID
access_pass_supporter(pass) → address
access_pass_purchased_at(pass) → u64
access_pass_amount_paid(pass) → u64
access_pass_tier_level(pass) → u64
access_pass_expires_at(pass) → Option<u64>

// CreatorProfile
profile_owner(profile) → address
profile_content_count(profile) → u64
profile_total_supporters(profile) → u64
profile_balance(profile) → u64
profile_name(profile) → String
profile_tiers(profile) → &vector<Tier>
profile_tier_count(profile) → u64

// Platform
platform_total_creators(platform) → u64
platform_total_access_passes(platform) → u64
platform_fee_bps(platform) → u64
platform_treasury_balance(platform) → u64

// Tier (value type)
tier_name(tier) → String
tier_description(tier) → String
tier_price(tier) → u64
tier_level(tier) → u64
tier_duration_ms(tier) → Option<u64>

// CreatorCap
cap_profile_id(cap) → ID

// Registry
registry_total_handles(registry) → u64
lookup_handle(registry, handle) → Option<ID>
```

### Error Codes

| Code | Name | Module | Meaning |
|------|------|--------|---------|
| 0 | `ENoAccess` | seal_policy | SEAL validation failed |
| 1 | `EUnauthorized` | suipatron | CreatorCap doesn't match profile |
| 2 | `EInsufficientPayment` | suipatron | Payment < tier.price |
| 3 | `EVersionMismatch` | suipatron | Object version != current VERSION |
| 4 | `EAlreadyMigrated` | suipatron | Platform already at current version |
| 5 | `ENotSubscriber` | suipatron | AccessPass is not a subscription (no expires_at) |
| 6 | `EWrongCreator` | suipatron | AccessPass creator_profile_id doesn't match profile |
| 7 | `EZeroBalance` | suipatron | Withdraw attempted with zero balance |
| 8 | `ENoTiers` | suipatron | (reserved) Profile has no tiers |
| 9 | `ETierIndexOutOfBounds` | suipatron | Tier index >= tiers vector length |
| 10 | `EDuplicateTierLevel` | suipatron | Tier level already exists on profile |
| 11 | `EZeroTip` | suipatron | Tip amount is zero |
| 12 | `EInvalidFeeBps` | suipatron | Fee basis points > 10000 |
| 14 | `EAccessPassExpired` | suipatron | (reserved) Subscription has expired |
| 15 | `EInvalidTierLevel` | suipatron | Tier level must be > 0 |
| 100 | `EHandleAlreadyTaken` | registry | Handle string already registered |
| 101 | `EHandleNotFound` | registry | (reserved) Handle not in registry |
| 102 | `EUnauthorized` | registry | CreatorCap doesn't match profile |
| 103 | `EVersionMismatch` | registry | Registry version mismatch |

---

## Environment Setup

See `CLAUDE.md` for full environment variable reference. Quick start:

```bash
# 1. Build and test contracts
cd packages/blockchain/contracts && sui move build && sui move test

# 2. Start the dapp (monorepo)
pnpm install
pnpm dev
# Copy .env.example to apps/suipatron, fill in NEXT_PUBLIC_PACKAGE_ID, NEXT_PUBLIC_PLATFORM_ID, etc.
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `docs/SCOPE.md` | Full project specification, architecture, task breakdown, timeline |
| `docs/00-README.md` | Documentation hub and navigation |
| `docs/suipatron/01-product-breakdown-and-roadmap.md` | PBS with task status ([x]/[ ]) |
| `docs/PRPs/README.md` | PRD → Plan → Implement workflow for features |
| `docs/architecture/PTB-SPECIFICATION.md` | PTB builders for create_profile, purchase_access, withdraw |
| `CLAUDE.md` | Project context, build commands, architecture summary |

---

*Last updated: Merged main branch into zoltan/phase-2. All Phase 2 service layer features complete (tiers, subscriptions, registry, tips/fees). Smart contracts deployed to testnet. UI pages implemented with on-chain query hooks and Walrus integration. SEAL and SuiNS integrations remain.*
