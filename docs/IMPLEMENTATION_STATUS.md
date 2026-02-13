# SuiPatron — Implementation Status

> **Central developer handover document.** Update this file as tasks are completed.
> Cross-references task IDs from `docs/SCOPE.md` Section 8.

---

## Completed

### Smart Contracts (A1–A8)

All core Move contracts are implemented, built, and tested. **18/18 unit tests pass.**

| File | Lines | Description |
|------|-------|-------------|
| `move/suipatron/Move.toml` | ~5 | Package manifest (edition 2024.beta) |
| `move/suipatron/sources/suipatron.move` | ~420 | Core module |
| `move/suipatron/sources/seal_policy.move` | ~53 | SEAL access control |
| `move/suipatron/tests/suipatron_tests.move` | ~400 | 18 unit tests across 8 categories |

**Types implemented:**
- `Platform` — shared singleton, created at package publish (OTW pattern)
- `AdminCap` — owned by deployer, for platform admin operations
- `CreatorProfile` — shared object with flat access price, balance, content count
- `Content` — stored as dynamic object field on CreatorProfile (keyed by `u64` index)
- `CreatorCap` — owned by creator, proves ownership of a specific CreatorProfile
- `AccessPass` — owned NFT proving supporter paid for access

**Entry functions:**
- `create_profile(platform, name, bio, price, clock, ctx)` — creates CreatorProfile (shared) + CreatorCap (owned)
- `update_profile(profile, cap, name?, bio?, avatar_blob_id?, suins_name?, price?, clock)` — partial updates via Option params
- `publish_content(profile, cap, title, description, blob_id, content_type, clock, ctx)` — creates Content as DOF
- `purchase_access(platform, profile, payment, clock, ctx)` — validates payment >= price, deposits to balance, mints AccessPass
- `withdraw_earnings(profile, cap, clock, ctx)` — transfers full balance to creator
- `migrate(platform, admin_cap)` — version migration for upgrades

**Events:** ProfileCreated, ProfileUpdated, ContentPublished, AccessPurchased, EarningsWithdrawn

**SEAL policy:**
- `seal_approve(id, access_pass, ctx)` — entry function called by SEAL key servers
- `check_seal_access(id, access_pass, caller)` — public validation logic (testable)

**Move patterns demonstrated:** One-Time Witness, Capability, Shared Objects, Dynamic Object Fields, Events, Version Tracking, Balance/Coin handling

**Test categories:** init, profile creation, profile update, content publishing, access purchase, withdrawal, SEAL policy, full end-to-end flow

### Documentation

| File | Description |
|------|-------------|
| `docs/SCOPE.md` | Full project specification (1387 lines) — product vision, architecture, all specs |
| `docs/SMART_CONTRACT_IMPLEMENTATION_PLAN.md` | Contract implementation guide with code-level detail |
| `CLAUDE.md` | Project context for Claude Code |

---

## Remaining — MVP Tasks

### 1. Contract Deployment (A9)

Deploy the Move package to SUI Testnet and record object IDs.

```bash
cd move/suipatron && sui client publish --gas-budget 200000000
```

After publishing, record:
- [ ] Package ID → `VITE_PACKAGE_ID` in `frontend/.env`
- [ ] Platform object ID → `VITE_PLATFORM_ID` in `frontend/.env`
- [ ] AdminCap object ID (keep safe, not in env)
- [ ] Update Enoki Portal with new Package ID in allowed move call targets
- [ ] Smoke test via CLI: `sui client call --package {PKG} --module suipatron --function create_profile ...`

### 2. Frontend Scaffold (Z1, J1–J4)

- [ ] Initialize Vite + React + TypeScript + Tailwind project in `frontend/`
- [ ] Configure `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- [ ] Install SUI SDKs: `@mysten/sui`, `@mysten/dapp-kit`, `@mysten/enoki`, `@mysten/seal`, `@mysten/walrus`
- [ ] Design system components: Button, Card, Modal, Badge, Toast, Avatar, LoadingSpinner, EmptyState
- [ ] Layout shell: Header with nav, responsive main content area
- [ ] Landing page (`/`) — hero, value prop, "Sign in with Google" CTA
- [ ] Explore page (`/explore`) — creator grid (mock data initially)

### 3. Auth / Enoki zkLogin (P1–P2, Z4)

- [ ] Set up Enoki Portal: create app, add Google OAuth client ID, set redirect URLs
- [ ] Configure `VITE_ENOKI_PUBLIC_KEY` and `VITE_GOOGLE_CLIENT_ID`
- [ ] Implement Google sign-in flow using `@mysten/enoki/react` (`useEnokiFlow`)
- [ ] Auth callback handler (`/auth/callback`) — process Enoki redirect, establish session
- [ ] Auth context/provider wrapping the app
- [ ] Protected routes (dashboard requires auth)

### 4. Backend / Serverless Functions (A10–A12)

- [ ] `POST /api/sponsor` — accept transaction bytes, sponsor via Enoki private API
- [ ] `POST /api/sponsor/execute` — execute previously sponsored transaction
- [ ] `POST /api/subname` — create SuiNS subname for authenticated creator
- [ ] `GET /api/creators` — list creator profiles (from indexer)
- [ ] `GET /api/creator/:id` — get creator profile + content list
- [ ] Event indexer — poll SUI events, build queryable state (in-memory or KV store)

### 5. Integration Hooks / Services (P3–P14)

PTB builders (transaction construction):
- [ ] `buildCreateProfileTx(name, bio, price)` — creates CreatorProfile + CreatorCap
- [ ] `buildUpdateProfileTx(profileId, updates)` — updates profile metadata
- [ ] `buildPublishContentTx(profileId, title, desc, blobId, contentType)` — publishes content
- [ ] `buildPurchaseAccessTx(platformId, profileId, price)` — purchases access + mints AccessPass
- [ ] `buildWithdrawTx(profileId)` — withdraws creator earnings

SEAL integration:
- [ ] `encryptContent(data, creatorProfileId, packageId)` — SEAL encrypt with creator's identity
- [ ] `decryptContent(encryptedData, accessPass, sessionKey)` — SEAL decrypt via seal_approve

Walrus integration:
- [ ] `uploadToWalrus(encryptedData)` — store blob, return blobId
- [ ] `downloadFromWalrus(blobId)` — retrieve encrypted blob

Sponsored transaction flow:
- [ ] Wire up Enoki `sponsorAndExecuteTransaction` for all user actions

React hooks:
- [ ] `useMyAccessPasses()` — fetch user's AccessPass NFTs via `getOwnedObjects`
- [ ] `useCreatorProfile(id)` — fetch creator profile data
- [ ] `useContentDecrypt(blobId, accessPass)` — download + decrypt content

### 6. UI Pages (J5–J13)

- [ ] Creator Profile page (`/creator/:id`) — header, price, content grid, "Support" button
- [ ] Support/payment confirmation modal
- [ ] Creator Dashboard (`/dashboard`) — profile editor, price setting, content list
- [ ] Content uploader — file picker, title, description, encrypt + upload flow
- [ ] Content viewer — renderers for image, text/markdown, PDF
- [ ] Supporter Feed (`/feed`) — list of supported creators, content feed
- [ ] Earnings panel — balance display, "Withdraw" button
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
- [ ] Seed demo data: 3 creators, realistic prices, 5+ content items
- [ ] Write and practice 3-minute demo script (see SCOPE.md Section 14)
- [ ] Record backup video of successful demo flow
- [ ] Configure Vercel deployment (auto-deploy from main)

---

## Technical Notes & Gotchas

These were discovered during smart contract implementation. Keep adding to this list.

### Move / SUI CLI

- **Move.toml**: Do NOT add explicit `[dependencies.Sui]` — the SUI CLI auto-includes system packages. Adding it causes `"Dependency 'Sui' is a legacy system name"` error.
- **`#[expected_failure]`**: When testing aborts from a different module (e.g., testing `suipatron::suipatron::EUnauthorized` from the test module), use plain `#[expected_failure]` without `abort_code`. Module-qualified paths in `abort_code` are not supported, and using a local constant with the same value causes a module-origin mismatch.
- **`take_shared_by_id`**: When multiple shared objects of the same type exist in a test scenario, `take_shared<T>` may grab the wrong one. Use `take_shared_by_id<T>(&scenario, object_id)` for deterministic selection.
- **Literal types**: Use typed literals like `3u64` instead of bare `3` to avoid warnings.

### SEAL Encryption

- **Identity format (MVP)**: 32 bytes = CreatorProfile object ID bytes. All content for a creator shares the same identity.
- **`packageId` for SEAL SDK**: Must be hex-encoded WITHOUT the `0x` prefix (check SDK docs).
- **Threshold**: Set to 2 (at least 2 key servers must agree).
- **Session keys**: Cached per-user per-package. First decrypt requires wallet signature; subsequent ones reuse the session.

### Architecture Decisions

- **Flat one-time payment**: No expiry, no tiers, no renewal logic. Simplest possible MVP. Tiers planned for Phase 2.
- **Content keyed by `u64` index**: `profile.content_count` used as auto-incrementing key for DOF. Simple but means content cannot be deleted/reordered without gaps.
- **AccessPass stores `supporter: address`**: Used by `seal_approve` to verify the caller owns the pass. Important for SEAL validation.

---

## Contract API Quick Reference

For frontend developers building PTBs.

### Entry Functions

```
suipatron::suipatron::create_profile(
    platform: &mut Platform,        // shared object — VITE_PLATFORM_ID
    name: String,
    bio: String,
    price: u64,                     // in MIST (1 SUI = 1_000_000_000)
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
    price: Option<u64>,
    clock: &Clock,
)
// Emits: ProfileUpdated

suipatron::suipatron::publish_content(
    profile: &mut CreatorProfile,
    cap: &CreatorCap,
    title: String,
    description: String,
    blob_id: String,                // Walrus blob ID (encrypted content)
    content_type: String,           // "image", "text", "pdf"
    clock: &Clock,
    ctx: &mut TxContext,
)
// Emits: ContentPublished

suipatron::suipatron::purchase_access(
    platform: &mut Platform,
    profile: &mut CreatorProfile,
    payment: Coin<SUI>,             // must be >= profile.price
    clock: &Clock,
    ctx: &mut TxContext,
)
// Creates: AccessPass (transferred to sender)
// Emits: AccessPurchased

suipatron::suipatron::withdraw_earnings(
    profile: &mut CreatorProfile,
    cap: &CreatorCap,
    clock: &Clock,
    ctx: &mut TxContext,
)
// Transfers: full balance to profile.owner
// Emits: EarningsWithdrawn

suipatron::seal_policy::seal_approve(
    id: vector<u8>,                 // SEAL identity (32 bytes = CreatorProfile ID)
    access_pass: &AccessPass,       // supporter's AccessPass NFT
    ctx: &TxContext,
)
// Used by SEAL key servers — not called directly by frontend
```

### Getter Functions (for on-chain reads)

```
profile_price(profile) → u64
profile_owner(profile) → address
profile_content_count(profile) → u64
profile_total_supporters(profile) → u64
profile_balance(profile) → u64
profile_name(profile) → String
platform_total_creators(platform) → u64
platform_total_access_passes(platform) → u64
access_pass_creator_profile_id(pass) → ID
access_pass_supporter(pass) → address
access_pass_purchased_at(pass) → u64
access_pass_amount_paid(pass) → u64
cap_profile_id(cap) → ID
```

### Error Codes

| Code | Name | Meaning |
|------|------|---------|
| 0 | `ENoAccess` (seal_policy) | SEAL validation failed |
| 1 | `EUnauthorized` | CreatorCap doesn't match profile |
| 2 | `EInsufficientPayment` | Payment < profile.price |
| 3 | `EVersionMismatch` | Object version != current VERSION |
| 4 | `EAlreadyMigrated` | Platform already at current version |
| 7 | `EZeroBalance` | Withdraw attempted with zero balance |

---

## Environment Setup

See `CLAUDE.md` for full environment variable reference. Quick start:

```bash
# 1. Build and test contracts
cd move/suipatron && sui move build && sui move test

# 2. Deploy to testnet (when ready)
sui client publish --gas-budget 200000000

# 3. Record Package ID and Platform ID from publish output

# 4. Set up frontend
cd frontend && npm install
# Copy .env.example, fill in VITE_PACKAGE_ID, VITE_PLATFORM_ID, etc.
npm run dev
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `docs/SCOPE.md` | Full project specification, architecture, task breakdown, timeline |
| `docs/SMART_CONTRACT_IMPLEMENTATION_PLAN.md` | Detailed contract implementation guide with code patterns |
| `CLAUDE.md` | Project context, build commands, architecture summary |

---

*Last updated: Smart contracts completed (18/18 tests pass). Frontend, backend, and integrations are next.*
