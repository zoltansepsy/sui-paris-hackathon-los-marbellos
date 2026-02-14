# SuiPatron — Project Scope & Development Guide

> **Decentralized Creator Support Platform on SUI**
> One-time payments · Encrypted content · On-chain access control · Gasless UX

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [MVP Scope (Phase 1)](#2-mvp-scope-phase-1)
3. [Architecture Overview](#3-architecture-overview)
4. [Smart Contract Specification](#4-smart-contract-specification)
5. [Frontend Specification](#5-frontend-specification)
6. [Backend Specification](#6-backend-specification)
7. [Integration Specifications](#7-integration-specifications)
8. [Task Breakdown](#8-task-breakdown)
9. [Development Timeline](#9-development-timeline)
10. [Repo Structure & Setup](#10-repo-structure--setup)
11. [Environment & Deployment](#11-environment--deployment)
12. [Event & Indexer Design](#12-event--indexer-design)
13. [Future Phases](#13-future-phases)
14. [Demo Strategy](#14-demo-strategy)
15. [Reference Links](#15-reference-links)

---

## 1. Product Vision

SuiPatron is a decentralized Patreon-like platform where creators publish exclusive content and supporters pay to access it — all enforced on-chain with zero centralized gatekeepers.

**What makes it different:**

- **No middleman for content access.** Subscriptions are on-chain NFTs. Content is encrypted with SEAL and stored on Walrus. Only valid holders can decrypt.
- **Gasless onboarding.** Supporters and creators sign in with Google (Enoki zkLogin). Transactions are sponsored — no wallet setup, no gas tokens.
- **Human-readable identities.** Creators get names like `alice@suipatron.sui` via SuiNS.
- **Fully decentralized content layer.** Content lives on Walrus (decentralized storage), not our servers. We cannot censor or remove it.

**Core Value Proposition:**

| For Creators | For Supporters |
|---|---|
| Keep ~100% of earnings (no 30% platform cut) | One-click access with Google sign-in |
| Content cannot be deplatformed | On-chain proof of support (NFT) |
| Human-readable identity (SuiNS) | Transparent, verifiable payments |
| Full control over pricing | Content access guaranteed by cryptography, not trust |

---

## 2. MVP Scope (Phase 1)

The MVP is what we ship for the hackathon. Everything below this line is in scope. Everything in [Section 13](#13-future-phases) is explicitly out of scope for now.

### 2.1 MVP Feature Set

#### Core Model: Flat One-Time Payment Access

The MVP uses a **flat one-time payment model** — not recurring subscriptions and not tiered. A supporter pays a single price set by the creator and gets permanent access to **all** of that creator's content.

This simplifies the contract (no expiry logic, no renewal flow, no tier comparisons) while still demonstrating the full technical stack. Multiple tiers are planned for a future phase.

#### Feature Checklist

| # | Feature | Priority |
|---|---------|----------|
| F1 | **Google sign-in (zkLogin via Enoki)** — gasless, no wallet needed | P0 |
| F2 | **Creator profile creation** — name, bio, avatar, access price | P0 |
| F3 | **One-time payment + Access NFT minting** — supporter pays creator's price in SUI, receives `AccessPass` NFT | P0 |
| F4 | **Content upload (encrypted)** — creator uploads file → SEAL encrypts → Walrus stores | P0 |
| F5 | **Content access (decrypted)** — supporter with valid AccessPass → SEAL decrypts → content renders | P0 |
| F6 | **SEAL access policy** — on-chain `seal_approve` validates AccessPass belongs to correct creator | P0 |
| F7 | **SuiNS subname registration** — creator gets `name@suipatron.sui` | P1 |
| F8 | **Creator dashboard** — view earnings, manage content, see supporters | P0 |
| F9 | **Supporter feed** — browse creators, view purchased content | P0 |
| F10 | **On-chain events** — emit events for all key actions | P0 |
| F11 | **Event indexer** — listen to on-chain events, build queryable state | P1 |
| F12 | **Earnings withdrawal** — creator withdraws accumulated SUI balance | P0 |
| F13 | **Explore/discovery page** — browse all creators | P0 |

#### What's Explicitly OUT of MVP

- **Multiple tiers** (single flat price in MVP; tiers planned for Phase 2)
- Recurring subscriptions / time-based plans
- Tips / donations
- Platform fees (we take 0% in MVP)
- Crowdfunding / content requests
- Video streaming (MVP supports images, text, PDFs)
- Individual subscriber requests
- Creator analytics beyond basic counts

### 2.2 MVP User Flows

#### Flow 1: Creator Onboarding

```
User clicks "Sign in with Google"
  → Enoki zkLogin creates SUI address from Google JWT
  → User lands on empty dashboard
  → User clicks "Create Creator Profile"
  → Fills: name, bio, avatar (optional), access price (in SUI)
  → Submits → sponsored transaction creates CreatorProfile on-chain
  → (Optional) System registers SuiNS subname: name@suipatron.sui
  → Creator is redirected to their dashboard
```

#### Flow 2: Content Upload (Creator)

```
Creator navigates to Dashboard → "Upload Content"
  → Selects file (image, PDF, text)
  → Sets title, description
  → Frontend encrypts file with SEAL (identity = creatorProfileId)
  → Encrypted blob uploaded to Walrus → returns blobId
  → Sponsored transaction publishes Content metadata on-chain (blobId, title)
  → Content appears in creator's content grid
```

#### Flow 3: Supporter Purchase

```
Supporter browses Explore page → clicks on a creator
  → Sees creator profile: bio, price, content count
  → Clicks "Support" button (shows creator's price, e.g., "5 SUI")
  → Confirmation modal shows price and what they unlock (all content)
  → Sponsored transaction:
      1. Takes payment (SUI coin)
      2. Mints AccessPass NFT to supporter
      3. Deposits SUI into creator's balance
  → Supporter sees "Access Granted" and all content unlocks
```

#### Flow 4: Content Access (Supporter)

```
Supporter navigates to creator's page or their own feed
  → Sees content cards (title, description, type badge)
  → Clicks on a content card
  → Frontend downloads encrypted blob from Walrus
  → Frontend calls SEAL decrypt:
      - Builds PTB calling seal_approve with supporter's AccessPass NFT
      - SEAL key servers validate on-chain → return decryption key shares
      - Content decrypted client-side
  → Decrypted content renders in the UI (image viewer, text reader, PDF viewer)
```

#### Flow 5: Earnings Withdrawal (Creator)

```
Creator views Dashboard → "Earnings" section shows balance
  → Clicks "Withdraw"
  → Sponsored transaction transfers SUI from CreatorProfile balance to creator's address
  → Balance updates to 0
```

### 2.3 MVP Content Types

For the MVP, we support these content types. The system stores content as encrypted blobs — the `content_type` field determines how the frontend renders after decryption.

| Content Type | File Extensions | Render Method |
|---|---|---|
| Image | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | `<img>` tag / lightbox |
| Text / Article | `.txt`, `.md` | Rendered markdown or plain text |
| PDF | `.pdf` | Embedded PDF viewer |

The architecture supports any file type (video, audio, archives) — we just need frontend renderers. MVP focuses on the three above for a clean demo.

---

## 3. Architecture Overview

### 3.1 System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Enoki     │  │  dApp Kit   │  │ SEAL SDK │  │  Walrus SDK  │   │
│  │   zkLogin   │  │  SUI Client │  │ Encrypt  │  │  Upload      │   │
│  │   Auth      │  │  Queries    │  │ Decrypt  │  │  Download    │   │
│  └──────┬──────┘  └──────┬──────┘  └─────┬────┘  └──────┬───────┘   │
│         │                │               │               │           │
└─────────┼────────────────┼───────────────┼───────────────┼───────────┘
          │                │               │               │
          ▼                ▼               ▼               ▼
   ┌────────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │ Enoki API  │   │    SUI    │   │   SEAL    │   │  Walrus   │
   │ (zkLogin,  │   │  Testnet  │   │   Key     │   │  Network  │
   │  Sponsor,  │   │  (Move    │   │  Servers  │   │ (Testnet) │
   │  Subnames) │   │ Contracts)│   │ (Testnet) │   │           │
   └────────────┘   └───────────┘   └───────────┘   └───────────┘
          │
          ▼
   ┌────────────┐
   │  Backend   │
   │  (Vercel   │
   │  Functions)│
   │  - Sponsor │
   │  - Subname │
   │  - Index   │
   └────────────┘
```

### 3.2 Data Flow Summary

| Action | Data Path |
|---|---|
| **Sign in** | Frontend → Google OAuth → Enoki → zkLogin address created |
| **Create profile** | Frontend builds PTB → Enoki sponsors → SUI Testnet executes → event emitted |
| **Upload content** | File → SEAL encrypt (client) → Walrus store → blobId → on-chain Content metadata |
| **Purchase access** | Frontend builds PTB (payment + mint) → Enoki sponsors → AccessPass NFT minted |
| **View content** | Walrus download → SEAL decrypt (client validates via seal_approve) → render |
| **Withdraw** | Frontend builds PTB → Enoki sponsors → SUI transferred to creator |

> **PTB details:** See [docs/architecture/PTB-SPECIFICATION.md](architecture/PTB-SPECIFICATION.md) for create_profile, purchase_access, withdraw PTB builders.

### 3.3 Key Design Decisions

| Decision | Why |
|---|---|
| **One-time flat payment (not subscription, not tiered)** | Simplest possible MVP. No expiry/renewal logic, no tier comparisons. Still demonstrates full SEAL + payment flow. |
| **`AccessPass` instead of `SubscriptionNFT`** | Naming reflects the one-time model. Owned NFT proving payment to a specific creator. |
| **`CreatorProfile` as shared object** | Multiple users need to read it (supporters browsing). Creator needs to mutate it (upload content, withdraw). |
| **Content as dynamic object fields** | Unbounded content per creator. Each content item has its own UID. |
| **SEAL identity = creatorProfileId only** | Flat model — all content for a creator is encrypted with the same identity. Any valid AccessPass unlocks everything. Per-tier encryption deferred to Phase 2. |
| **Enoki sponsors everything** | Zero-friction UX. Supporters don't need SUI for gas. Only the actual payment requires SUI tokens. |
| **Events for all state changes** | Enables off-chain indexing. Frontend can query indexed data instead of on-chain reads for lists/feeds. |

---

## 4. Smart Contract Specification

**Location: `move/suipatron/`**

### 4.1 Package Structure

```
move/suipatron/
├── Move.toml
└── sources/
    ├── suipatron.move       # Core module: Platform, CreatorProfile, AccessPass, payments
    └── seal_policy.move     # SEAL access control: seal_approve
```

### 4.2 Core Types

```
Platform (shared object)
├── id: UID
├── version: u64                    # For upgrade safety
├── admin: address                  # Deployer / admin cap holder
├── total_creators: u64
├── total_access_passes: u64
└── (future: platform_fee_bps)

AdminCap (owned object → deployer)
├── id: UID

CreatorProfile (shared object)
├── id: UID
├── version: u64
├── owner: address
├── name: String
├── bio: String
├── avatar_blob_id: Option<String>  # Walrus blob ID for avatar
├── suins_name: Option<String>      # e.g. "alice@suipatron"
├── price: u64                      # Access price in MIST (1 SUI = 1_000_000_000 MIST)
├── content_count: u64
├── total_supporters: u64
├── balance: Balance<SUI>           # Accumulated earnings
│
├── [dynamic object fields]
│   └── Content (keyed by content ID)
│       ├── id: UID
│       ├── title: String
│       ├── description: String
│       ├── blob_id: String         # Walrus blob ID (encrypted)
│       ├── created_at: u64
│       └── content_type: String    # "image", "text", "pdf"

CreatorCap (owned object → creator)
├── id: UID
└── creator_profile_id: ID

AccessPass (owned object → supporter)
├── id: UID
├── creator_profile_id: ID
├── purchased_at: u64               # Epoch timestamp
├── amount_paid: u64
└── supporter: address
```

### 4.3 Entry Functions

| Function | Caller | Parameters | Effects |
|---|---|---|---|
| `create_profile` | Anyone (via Enoki) | `platform, name, bio, price, ctx` | Creates `CreatorProfile` (shared) + `CreatorCap` (owned). Emits `ProfileCreated`. |
| `update_profile` | Creator (with `CreatorCap`) | `profile, cap, name, bio, avatar_blob_id, price` | Updates profile metadata. Emits `ProfileUpdated`. |
| `publish_content` | Creator (with `CreatorCap`) | `profile, cap, title, desc, blob_id, content_type, clock, ctx` | Creates `Content` as dynamic object field. Emits `ContentPublished`. |
| `purchase_access` | Supporter | `platform, profile, payment: Coin<SUI>, clock, ctx` | Validates payment ≥ profile price. Deposits SUI into `profile.balance`. Mints `AccessPass` to sender. Emits `AccessPurchased`. |
| `withdraw_earnings` | Creator (with `CreatorCap`) | `profile, cap, ctx` | Transfers full `profile.balance` to creator. Emits `EarningsWithdrawn`. |
| `migrate` | Admin (with `AdminCap`) | `platform, cap` | Updates version after package upgrade. |

### 4.4 SEAL Policy — `seal_approve`

```
module suipatron::seal_policy

    seal_approve(id: vector<u8>, access_pass: &AccessPass, ctx: &TxContext)

    Validation steps:
    1. Parse `id` → extract creator_profile_id (32 bytes)
    2. Verify access_pass.supporter == ctx.sender()
    3. Verify access_pass.creator_profile_id matches parsed creator_profile_id
```

No Clock needed in MVP since AccessPass has no expiry. No tier comparison needed — flat access means any valid AccessPass for the creator unlocks all content.

### 4.5 Events

| Event | Fields | When Emitted |
|---|---|---|
| `ProfileCreated` | `profile_id, owner, name, price, timestamp` | `create_profile` |
| `ProfileUpdated` | `profile_id, name, timestamp` | `update_profile` |
| `ContentPublished` | `content_id, profile_id, blob_id, content_type, timestamp` | `publish_content` |
| `AccessPurchased` | `access_pass_id, profile_id, supporter, amount, timestamp` | `purchase_access` |
| `EarningsWithdrawn` | `profile_id, amount, recipient, timestamp` | `withdraw_earnings` |

### 4.6 Move Patterns Demonstrated

For hackathon judging, the contract showcases these patterns:

**MVP (Phase 1):**
1. **One-Time Witness (OTW)** — `SUIPATRON` struct in `init` for guaranteed single initialization
2. **Capability Pattern** — `AdminCap` for platform admin, `CreatorCap` for per-creator authorization
3. **Shared Objects** — `Platform` and `CreatorProfile` for concurrent read/write access
4. **Dynamic Object Fields** — `Content` items stored on `CreatorProfile` for unbounded content
5. **Enums** — `ContentType` enum (if beneficial)
6. **Events** — Full event emission for off-chain indexing
7. **Version Tracking** — `version` field on `Platform` and `CreatorProfile` with migration function

**Roadmap (Post-MVP):**
8. **Hot Potato** — `RequestReceipt` for Individual Requests (must be consumed in same tx) *(Phase 3)*
9. **Dynamic Fields (DF)** — Creator Registry `String → ID` mapping, Contributor Tables *(Phase 2/4)*
10. **Clock + Time-based Logic** — Subscription expiry, campaign deadlines, request timeouts *(Phase 2/3/4)*
11. **Table** — Subscriber tracking `address → timestamp`, contributor tracking `address → amount` *(Phase 2/4)*
12. **PTB Coin Splitting** — Tips + platform fee in a single transaction *(Phase 2)*
13. **Escrow** — Payment held until creator fulfills request or deadline passes *(Phase 3)*
14. **Display<T>** — Community NFT metadata rendering *(Phase 4)*

### 4.7 Error Codes

```
const ENotOTW: u64 = 0;
const EUnauthorized: u64 = 1;
const EInsufficientPayment: u64 = 2;
const EVersionMismatch: u64 = 3;
const EAlreadyMigrated: u64 = 4;
const ENotSubscriber: u64 = 5;
const EWrongCreator: u64 = 6;
const EZeroBalance: u64 = 7;
```

---

## 5. Frontend Specification

**Location: `frontend/`**

### 5.1 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, value prop, "Sign in with Google" CTA |
| `/auth/callback` | Auth Callback | Handles Enoki zkLogin redirect, sets session |
| `/explore` | Explore | Grid of creator cards, search/filter |
| `/creator/:id` | Creator Profile | Public profile: bio, price, content preview, "Support" button |
| `/dashboard` | Creator Dashboard | Manage profile, price, content, view earnings, withdraw |
| `/feed` | Supporter Feed | Content feed from supported creators |
| `/settings` | Settings | Profile edit, SuiNS name, account info |

### 5.2 Component Hierarchy

```
App
├── Layout
│   ├── Header (logo, nav, auth status, wallet info)
│   └── Main Content Area
│
├── Landing Page
│   ├── HeroSection
│   ├── FeatureCards (3x: Gasless, Encrypted, Decentralized)
│   └── CTAButton ("Sign in with Google")
│
├── Explore Page
│   ├── SearchBar
│   ├── CreatorGrid
│   │   └── CreatorCard (avatar, name, SuiNS, price, supporter count)
│   └── Pagination / Infinite Scroll
│
├── Creator Profile Page
│   ├── CreatorHeader (avatar, name, SuiNS badge, bio, price)
│   ├── SupportButton (shows price, triggers purchase)
│   ├── ContentGrid
│   │   └── ContentCard (title, type badge, lock/unlock icon)
│   └── ConfirmModal (confirm payment, price details)
│
├── Creator Dashboard
│   ├── ProfileEditor (name, bio, avatar upload, price setting)
│   ├── ContentUploader (file picker, title, description)
│   ├── ContentList (published content with metadata)
│   ├── EarningsPanel (balance display, "Withdraw" button)
│   └── SupporterList (who purchased)
│
├── Supporter Feed
│   ├── SubscriptionList (active access passes)
│   └── ContentFeed (cards from all supported creators)
│       └── ContentViewer (decrypted content renderer)
│
└── Shared Components
    ├── Button (primary, secondary, ghost, loading state)
    ├── Card (base card with variants)
    ├── Modal (overlay with confirmation)
    ├── Toast (success, error, info notifications)
    ├── Badge (content type, access status)
    ├── Avatar (with fallback)
    ├── LoadingSpinner
    ├── EmptyState (illustration + CTA)
    └── ErrorBoundary
```

### 5.3 State Management

| State | Where | How |
|---|---|---|
| Auth / session (zkLogin) | `AuthContext` | Enoki SDK manages JWT + session key |
| SUI client / network | `SuiClientProvider` from dApp Kit | Provider wraps app |
| Creator profiles | React Query | Fetched from indexer API or on-chain reads |
| User's AccessPasses | React Query | `getOwnedObjects` filtered by type |
| Transaction status | Local state + toasts | Loading → success/error toast |
| Content decryption | Local state per content item | Cached in memory after first decrypt |

### 5.4 Design Guidelines

**Visual Identity:**
- Primary color: A vibrant accent (suggest `#6366F1` indigo or `#8B5CF6` violet)
- Background: Dark theme (`#0F172A` slate-900) for a modern Web3 feel
- Cards: Subtle glass-morphism or elevated cards with borders
- Typography: Inter or system font stack

**UX Principles for Hackathon:**
- Every action provides immediate visual feedback (loading spinners, success toasts)
- Error messages are human-readable, not raw error codes
- Empty states have illustrations and CTAs (not blank screens)
- The demo path (sign in → explore → subscribe → view content) must be ≤ 5 clicks
- Mobile-responsive is nice-to-have; desktop-first is fine for demo

---

## 6. Backend Specification

**Location: `frontend/api/` (Vercel serverless functions) or `backend/`**

### 6.1 API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/sponsor` | Enoki session | Accept transaction bytes, sponsor via Enoki private API |
| `POST` | `/api/sponsor/execute` | Enoki session | Execute a previously sponsored transaction |
| `POST` | `/api/subname` | Enoki session | Create SuiNS subname for authenticated creator |
| `GET` | `/api/creators` | Public | List all creator profiles (from indexer cache) |
| `GET` | `/api/creator/:id` | Public | Get creator profile + content list |
| `GET` | `/api/creator/:id/content` | Public | List content metadata for a creator |
| `GET` | `/api/events` | Internal | Poll and index on-chain events |

### 6.2 Indexer Design

The indexer polls SUI events and builds a local cache (in-memory or simple KV store) for fast frontend queries. See [Section 12](#12-event--indexer-design) for full spec.

### 6.3 Sponsored Transaction Backend

The backend holds the Enoki private API key and sponsors transactions on behalf of users. This keeps the private key server-side while allowing gasless UX.

**Whitelisted functions** (configured in Enoki Portal):
- `{PACKAGE_ID}::suipatron::create_profile`
- `{PACKAGE_ID}::suipatron::update_profile`
- `{PACKAGE_ID}::suipatron::publish_content`
- `{PACKAGE_ID}::suipatron::purchase_access`
- `{PACKAGE_ID}::suipatron::withdraw_earnings`

---

## 7. Integration Specifications

### 7.1 SEAL Integration

**How SEAL works in SuiPatron:**

1. **Encryption (content upload):**
   - Creator selects file
   - Frontend constructs SEAL identity: `[creatorProfileId_bytes (32)]`
   - Frontend calls `sealClient.encrypt({ threshold: 2, packageId, id, data })`
   - Encrypted output is a self-contained blob (includes metadata for decryption)

2. **Decryption (content access):**
   - Supporter requests content, frontend downloads encrypted blob from Walrus
   - Frontend builds a PTB calling `seal_policy::seal_approve` with supporter's `AccessPass`
   - Frontend calls `sealClient.decrypt({ data, sessionKey, txBytes })`
   - SEAL key servers execute the PTB to validate access, return key shares if approved
   - Client reconstructs decryption key and decrypts content locally

**SEAL Identity Format (MVP — flat access):**
```
Bytes: [0..32] = CreatorProfile object ID (as bytes)
Total: 32 bytes
```

In the flat model, all content for a creator shares the same SEAL identity (the creator's profile ID). Any valid AccessPass for that creator can decrypt all content. Per-tier encryption is planned for Phase 2 when multiple tiers are introduced.

**Critical Notes:**
- The `packageId` passed to `sealClient.encrypt()` must be the hex-encoded package ID WITHOUT the `0x` prefix (check SDK docs for exact format)
- Threshold 2 means at least 2 of the configured key servers must agree
- Session keys are cached per-user per-package — first decrypt requires a wallet signature, subsequent ones reuse the session

**Testnet Key Servers:**
Get verified key server object IDs from: https://seal-docs.wal.app/Pricing/#verified-key-servers

### 7.2 Walrus Integration

**Upload flow:**
```
const walrusClient = new WalrusClient({ network: 'testnet' });
const { blobId } = await walrusClient.store({ data: encryptedBytes });
// blobId is stored on-chain as part of Content metadata
```

**Download flow:**
```
const data = await walrusClient.read({ blobId });
// data is the encrypted bytes — pass to SEAL for decryption
```

**Critical Notes:**
- All data on Walrus is PUBLIC — always encrypt with SEAL first
- Blob IDs are content-addressed (deterministic from content)
- For avatar images (public, non-encrypted): upload directly to Walrus without SEAL encryption
- Walrus testnet has storage limits — keep test files small (< 5MB)

### 7.3 Enoki Integration

**Frontend (zkLogin):**
```typescript
import { useEnokiFlow } from '@mysten/enoki/react';

// Redirect to Google OAuth
const { createAuthorizationURL } = useEnokiFlow();

// After callback, Enoki SDK manages the session
// Use sponsorAndExecuteTransaction for gasless transactions
```

**Backend (sponsored transactions):**
```typescript
import { EnokiClient } from '@mysten/enoki';

const enoki = new EnokiClient({ apiKey: ENOKI_SECRET_KEY });
const result = await enoki.createSponsoredTransaction({
  network: 'testnet',
  transactionBlockKindBytes,
  sender,
  allowedMoveCallTargets: [...],
});
```

**Enoki Portal Setup Checklist:**
- [ ] Create app in Enoki Portal
- [ ] Add Google OAuth client ID
- [ ] Set redirect URLs (localhost + Vercel domain)
- [ ] Whitelist all Move entry functions as allowed sponsored targets
- [ ] Note public API key (for frontend) and secret API key (for backend)

### 7.4 SuiNS Integration

**Prerequisite:** Must own `suipatron.sui` domain on testnet. Register at https://testnet.suins.io

**Create subname (backend):**
```
POST https://api.enoki.mystenlabs.com/v1/subnames
Authorization: Bearer {ENOKI_SECRET_KEY}

{
  "domain": "suipatron.sui",
  "network": "testnet",
  "subname": "alice",            // → alice@suipatron.sui
  "targetAddress": "0x..."
}
```

**Resolve subname (frontend):**
```typescript
// Use SUI client to resolve SuiNS name → address
const address = await suiClient.resolveNameServiceAddress({ name: 'alice@suipatron.sui' });
```

---

## 8. Task Breakdown

> **Also see:** [docs/core-planning/01-product-breakdown.md](core-planning/01-product-breakdown.md) for task table; [docs/suipatron/01-product-breakdown-and-roadmap.md](suipatron/01-product-breakdown-and-roadmap.md) for PBS with status ([x]/[ ]).

### Smart Contract + Backend

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| A1 | Write Move package: Platform, AdminCap, init | — | Compiling `suipatron.move` | 1 |
| A2 | Write: CreatorProfile, create_profile (flat price) | A1 | Functions + unit tests | 1 |
| A3 | Write: AccessPass, purchase_access | A2 | Payment + minting logic | 1 |
| A4 | Write: Content, publish_content (dynamic object fields) | A2 | Content storage logic | 1 |
| A5 | Write: withdraw_earnings | A2 | Withdrawal logic | 1 |
| A6 | Write: seal_policy::seal_approve | A3 | SEAL validation function | 2 |
| A7 | Write: All events | A2-A5 | Event emission in all functions | 2 |
| A8 | Write + run Move unit tests | A1-A7 | Passing test suite | 2 |
| A9 | Deploy package to SUI Testnet | A8 | Package ID, Platform ID, AdminCap ID | 2 |
| A10 | Backend: sponsor endpoint | A9 | Working `/api/sponsor` | 2 |
| A11 | Backend: subname endpoint | A9 | Working `/api/subname` | 3 |
| A12 | Backend: event indexer | A9 | Working `/api/creators`, `/api/creator/:id` | 3 |
| A13 | Version tracking + migrate function | A1 | Upgrade-ready contracts | 3 |

### Full-Stack Integration

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| P1 | Enoki zkLogin: Google sign-in flow | Scaffold | Working auth with session persistence | 1 |
| P2 | Auth callback handling + redirect | P1 | `/auth/callback` route | 1 |
| P3 | Transaction builder: create_profile PTB | A9 | `buildCreateProfileTx()` | 2 |
| P4 | Transaction builder: purchase_access PTB | A9 | `buildPurchaseAccessTx()` | 2 |
| P5 | Enoki sponsored transaction execution | P3, A10 | Gasless transaction flow | 2 |
| P6 | SEAL encryption pipeline | A6 | `encryptContent()` helper | 2 |
| P7 | Walrus upload pipeline | P6 | `uploadToWalrus()` helper | 2 |
| P8 | Content upload flow (encrypt → upload → publish tx) | P6, P7, A9 | End-to-end upload | 2 |
| P9 | Walrus download pipeline | — | `downloadFromWalrus()` helper | 3 |
| P10 | SEAL decryption pipeline | A6 | `decryptContent()` helper | 3 |
| P11 | Content access flow (download → decrypt → render) | P9, P10 | End-to-end decrypt | 3 |
| P12 | SuiNS subname creation (frontend trigger → backend) | A11 | Subname flow | 3 |
| P13 | Transaction builder: withdraw_earnings PTB | A9 | `buildWithdrawTx()` | 3 |
| P14 | User's AccessPass fetching + caching | A9 | Hook: `useMyAccessPasses()` | 2 |

### UI/UX + Frontend

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| J1 | Design system: Button, Card, Modal, Badge, Toast | Scaffold | Component library | 1 |
| J2 | Layout: Header, navigation, responsive shell | J1 | App shell | 1 |
| J3 | Landing page: hero, features, CTA | J1, J2 | `/` route | 1 |
| J4 | Explore page: creator grid | J1 | `/explore` route (mock data initially) | 1 |
| J5 | Creator Profile page: header, price, content grid | J1 | `/creator/:id` route | 2 |
| J6 | Support modal: payment confirmation UI | J5 | Modal component | 2 |
| J7 | Creator Dashboard: profile editor, price setting | J1 | `/dashboard` route | 2 |
| J8 | Content uploader: file picker, metadata form | J7 | Upload UI component | 2 |
| J9 | Content viewer: image, text, PDF renderers | J5 | Decrypted content display | 3 |
| J10 | Supporter feed: subscriptions list, content feed | J1 | `/feed` route | 3 |
| J11 | Loading states, skeleton screens | J1 | Polish | 3 |
| J12 | Error toasts, empty states | J1 | Polish | 3 |
| J13 | Demo data seeding + demo polish | All | Demo-ready UI | 4 |

### Architecture + DevOps + Coordination

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| Z1 | Scaffold monorepo: frontend (Vite+React+Tailwind), move package | — | Working repo structure | 1 |
| Z2 | Configure Vercel deployment | Z1 | Auto-deploy from main | 1 |
| Z3 | Environment configuration (.env, .env.local, Vercel env vars) | Z1 | Documented env setup | 1 |
| Z4 | Enoki Portal setup (app, OAuth, allowed targets) | — | Configured portal | 1 |
| Z5 | SuiNS domain registration (testnet) | — | Own `suipatron.sui` | 1 |
| Z6 | Integration testing: sign in → create profile → upload | Phase 2 | Test report | 3 |
| Z7 | Integration testing: browse → subscribe → decrypt | Phase 3 | Test report | 3 |
| Z8 | Seed demo data (3 creators, realistic prices, 5+ content items) | Phase 3 | Demo-ready state | 4 |
| Z9 | Demo script writing | Phase 3 | 3-minute pitch script | 4 |
| Z10 | Bug bash + final fixes | Phase 3 | Release candidate | 4 |

---

## 9. Development Timeline

### Phase 1: Foundation (Hours 0–4)

**Goal:** Repo scaffolded, contracts compiling, zkLogin working, UI shell renders, deployment pipeline live.

```
Hour 0-1:  Scaffold repo + deploy to Vercel
           Start Move package (Platform, AdminCap, init)
           Start design system components
           Set up Enoki portal + Google OAuth

Hour 1-2:  Write CreatorProfile, create_profile (flat price)
           Implement zkLogin sign-in + callback
           Build layout shell (Header, nav)
           Configure environment, SuiNS registration

Hour 2-4:  Write AccessPass, purchase_access, Content, publish_content
           Connect zkLogin to UI, test auth flow
           Build Landing + Explore pages (mock data)
           Verify deployment, test CI
```

**Phase 1 Gate (must pass before continuing):**
- [ ] Move package compiles with all core types and functions
- [ ] Frontend deploys to Vercel and renders
- [ ] Google sign-in works end-to-end (user gets SUI address)
- [ ] Design system has Button, Card, Modal, Badge, Toast

### Phase 2: Core Flows (Hours 4–10)

**Goal:** Profile creation, content upload (encrypted), access purchase all working with sponsored transactions.

```
Hour 4-6:  Write seal_policy, events, unit tests
           Deploy package to Testnet → share Package ID
           Build PTB builders (create_profile, purchase_access)
           Build Creator Profile page + Support modal

Hour 6-8:  Set up backend sponsor endpoint
           Integrate SEAL encryption + Walrus upload
           Implement sponsored transaction flow
           Build Creator Dashboard + Content uploader UI

Hour 8-10: Build content upload flow (encrypt → Walrus → publish_content tx)
           Implement AccessPass fetching/caching
           Connect UI to integration hooks
           First integration check
```

**Phase 2 Gate:**
- [ ] Contract deployed to Testnet with verified Package ID
- [ ] Can create a creator profile via UI (sponsored tx)
- [ ] Can upload encrypted content (SEAL + Walrus)
- [ ] Can purchase access (sponsored tx, receives AccessPass NFT)
- [ ] Events emitting for all actions

### Phase 3: Content Access & Integration (Hours 10–16)

**Goal:** Supporters can decrypt and view content. Creator can withdraw. SuiNS works. Indexer running.

```
Hour 10-12: Build decrypt pipeline (Walrus download → SEAL decrypt)
            Build event indexer + API endpoints
            Build content viewer (image, text, PDF renderers)
            Build Supporter Feed page

Hour 12-14: Integrate decrypt into content viewer
            Implement withdraw flow
            Implement SuiNS subname endpoint
            Build earnings panel + withdrawal UI

Hour 14-16: Add SuiNS creation to profile flow
            Run full integration tests
            Add loading states, error handling, empty states
            Bug fixes from integration testing
```

**Phase 3 Gate:**
- [ ] Full flow works: sign in → browse → subscribe → view decrypted content
- [ ] Creator can withdraw earnings
- [ ] SuiNS subnames created for creators
- [ ] Indexer provides creator list + content list APIs
- [ ] Error states handled gracefully

### Phase 4: Demo Polish (Hours 16–20)

**Goal:** Demo-ready product. Seed data. Presentation prepared.

```
Hour 16-18: Seed demo data (creators, content, prices)
            Final UI polish (responsive, animations, micro-interactions)
            Optimize SEAL session caching, Walrus download speed
            Verify all events, fix edge cases

Hour 18-20: Write demo script, practice presentation
            Final bug bash
            Dry run the demo at least 2x
            Record backup video of demo flow
```

**Phase 4 Gate (SHIP IT):**
- [ ] Demo script tested and timed (≤ 3 minutes)
- [ ] Seeded with 3+ creators, realistic prices, 5+ content items
- [ ] Full flow works without errors on demo path
- [ ] Backup: screen recording of successful flow

---

## 10. Repo Structure & Setup

### 10.1 Directory Structure

```
suipatron/
├── README.md                       # Project overview + setup instructions
├── SCOPE.md                        # This document
├── .gitignore
├── .env.example                    # Template for environment variables
│
├── move/
│   └── suipatron/
│       ├── Move.toml
│       ├── sources/
│       │   ├── suipatron.move
│       │   └── seal_policy.move
│       └── tests/
│           └── suipatron_tests.move
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── index.html
│   ├── vercel.json
│   ├── .env                        # Public env vars (committed)
│   ├── .env.local                  # Secret env vars (gitignored)
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── config/
│       │   └── constants.ts
│       ├── contexts/
│       │   ├── AuthContext.tsx
│       │   └── WalletContext.tsx
│       ├── hooks/
│       │   ├── useCreatorProfile.ts
│       │   ├── useAccessPass.ts
│       │   ├── useContentUpload.ts
│       │   ├── useContentDecrypt.ts
│       │   └── useSuiNS.ts
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   ├── creator/
│       │   └── content/
│       ├── pages/
│       │   ├── Landing.tsx
│       │   ├── AuthCallback.tsx
│       │   ├── Explore.tsx
│       │   ├── CreatorProfile.tsx
│       │   ├── CreatorDashboard.tsx
│       │   ├── SupporterFeed.tsx
│       │   └── Settings.tsx
│       ├── lib/
│       │   ├── seal.ts
│       │   ├── walrus.ts
│       │   ├── enoki.ts
│       │   └── transactions.ts
│       └── types/
│           └── index.ts
│
├── backend/                        # OR frontend/api/ for Vercel serverless
│   ├── package.json
│   └── src/
│       ├── sponsor.ts
│       ├── subname.ts
│       ├── indexer.ts
│       └── creators.ts
│
└── scripts/
    ├── deploy.sh                   # Contract build + publish script
    ├── seed-demo.ts                # Seed demo data for presentation
    └── test-flow.ts                # Quick integration smoke test
```

### 10.2 Setup Instructions

**Prerequisites:**
- Node.js 18+
- SUI CLI installed (`cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui`)
- SUI wallet with Testnet SUI (faucet: `sui client faucet`)

**Quick Start:**
```bash
# 1. Clone the repo
git clone <repo-url> && cd suipatron

# 2. Copy environment template
cp .env.example frontend/.env.local

# 3. Install frontend dependencies
cd frontend && npm install

# 4. Build Move package
cd ../move/suipatron && sui move build

# 5. Run Move tests
sui move test

# 6. Deploy to Testnet (when ready)
sui client publish --gas-budget 200000000

# 7. Update frontend/.env with deployed Package ID and object IDs

# 8. Start frontend dev server
cd ../../frontend && npm run dev
```

---

## 11. Environment & Deployment

### 11.1 Environment Variables

```bash
# ============================================
# frontend/.env (committed — public values)
# ============================================

# Network
VITE_SUI_NETWORK=testnet

# Deployed contract addresses (fill after deploy)
VITE_PACKAGE_ID=0x_FILL_AFTER_DEPLOY
VITE_PLATFORM_ID=0x_FILL_AFTER_DEPLOY

# Enoki (public key only)
VITE_ENOKI_PUBLIC_KEY=enoki_public_FILL

# Google OAuth
VITE_GOOGLE_CLIENT_ID=FILL.apps.googleusercontent.com

# SEAL key servers (testnet)
VITE_SEAL_KEY_SERVER_OBJECT_IDS=0x_SERVER1,0x_SERVER2

# Walrus
VITE_WALRUS_NETWORK=testnet

# ============================================
# frontend/.env.local (gitignored — secrets)
# ============================================

ENOKI_SECRET_KEY=enoki_private_FILL
```

### 11.2 Vercel Deployment

**Frontend (Vite SPA):**
- Framework: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Set in Vercel dashboard (mirror `.env` + `.env.local`)

**API Routes (Serverless Functions):**
- Place in `frontend/api/` directory for Vercel auto-detection
- Or use `vercel.json` rewrites to route `/api/*` to backend functions

### 11.3 Contract Deployment Checklist

```
[ ] sui move build — compiles without errors
[ ] sui move test — all tests pass
[ ] sui client publish --gas-budget 200000000
[ ] Record from publish output:
    - Package ID: 0x...
    - Platform object ID: 0x...
    - AdminCap object ID: 0x...
[ ] Update frontend/.env with Package ID and Platform ID
[ ] Update Enoki Portal:
    - Allowed move call targets → all entry functions with new Package ID
    - Allowed object addresses → Platform ID
[ ] Test via CLI:
    - sui client call --package {PKG} --module suipatron --function create_profile ...
[ ] Commit updated .env to repo
```

---

## 12. Event & Indexer Design

### 12.1 On-Chain Events

Every state-changing action emits a Move event. These events are the source of truth for the indexer.

| Event Type | Emitted By | Key Fields |
|---|---|---|
| `ProfileCreated` | `create_profile` | profile_id, owner, name, price |
| `ProfileUpdated` | `update_profile` | profile_id, name |
| `ContentPublished` | `publish_content` | content_id, profile_id, blob_id, content_type |
| `AccessPurchased` | `purchase_access` | access_pass_id, profile_id, supporter, amount |
| `EarningsWithdrawn` | `withdraw_earnings` | profile_id, amount, recipient |

### 12.2 Indexer Architecture

**Approach:** Lightweight polling indexer that runs as a Vercel cron job or long-lived serverless function.

```
Poll SUI events (every 5-10 seconds)
  → Filter by package ID + event types
  → Update in-memory store (or simple JSON file / KV store)
  → Serve via API endpoints
```

**Data Model (indexed):**

```typescript
interface IndexedCreator {
  profileId: string;
  owner: string;
  name: string;
  bio: string;
  avatarBlobId?: string;
  suinsName?: string;
  price: number;                // Access price in MIST
  contentCount: number;
  totalSupporters: number;
  createdAt: number;
}

interface IndexedContent {
  contentId: string;
  creatorProfileId: string;
  title: string;
  description: string;
  blobId: string;
  contentType: string;
  createdAt: number;
}

interface IndexedAccessPurchase {
  accessPassId: string;
  creatorProfileId: string;
  supporter: string;
  amount: number;
  timestamp: number;
}
```

**API Endpoints (served by indexer):**

| Endpoint | Returns |
|---|---|
| `GET /api/creators` | All indexed creators (for Explore page) |
| `GET /api/creator/:id` | Single creator + their content list |
| `GET /api/creator/:id/supporters` | List of supporters for a creator |
| `GET /api/supporter/:address/passes` | All AccessPasses owned by an address |

**Fallback:** If the indexer isn't ready in time, the frontend can fall back to direct on-chain reads using `getOwnedObjects` and `getDynamicFields`. This is slower but functional for the demo.

### 12.3 SUI Event Query (Reference)

```typescript
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

// Query events by type
const events = await client.queryEvents({
  query: {
    MoveEventType: `${PACKAGE_ID}::suipatron::ProfileCreated`,
  },
  order: 'descending',
  limit: 50,
});
```

---

## 13. Future Phases

These features are **out of scope for MVP** but documented here for post-hackathon development and to show judges we've thought about the roadmap. Each feature includes the Move patterns it demonstrates.

### Quick Feature Reference

| Feature | Move Patterns | Phase |
|---|---|---|
| Multiple Tiers | Tier struct vector, per-tier SEAL identity, tier-gated access | 2 |
| Creator Registry | Dynamic Fields (DF) + String Mapping | 2 |
| One-Time Tips & Platform Fees | PTB coin splitting + Platform Treasury | 2 |
| Subscription Tiers | Sui::Clock + Table (DF) + Internal Logic | 2 |
| Pay-per-Post | Modified Escrow + DF per-blob access | 3 |
| Individual Requests | Hot Potato Pattern + Escrow | 3 |
| Enhanced Content Encryption | Sui Seal + Nonce-based Ephemeral Keys | 3 |
| Community NFTs | One-Time Witness (OTW) + Enoki/Sui Stack | 4 |
| Crowdfunding | Shared Object + CampaignCap + Contributor Table (DF) | 4 |

### Phase 2: Monetization & Creator Tools

#### Multiple Tiers (Tier Vector + Per-Tier SEAL)

The MVP uses a flat single-price model. This phase adds multiple tiers (e.g., "Bronze: 1 SUI", "Silver: 5 SUI", "Gold: 10 SUI"), allowing creators to gate content at different access levels. A higher-tier AccessPass can decrypt lower-tier content.

**Move patterns:** `Tier` struct (`store, copy, drop`), `vector<Tier>` on CreatorProfile, tier-level gating in `seal_approve`, SEAL identity extended to `[creatorProfileId (32 bytes)][minTierLevel (8 bytes, BCS u64)]`.

**Changes to existing types:**
- `CreatorProfile` gains `tiers: vector<Tier>` field (replaces `price: u64`)
- `Content` gains `min_tier_level: u64` field
- `AccessPass` gains `tier_level: u64` field
- `seal_approve` adds tier-level comparison: `access_pass.tier_level >= parsed min_tier_level`
- SEAL identity becomes 40 bytes (32 + 8) instead of 32

**New entry functions:**
- `add_tier(profile, cap, name, price, description, tier_level)` — append tier to `profile.tiers`
- `purchase_access` updated to accept `tier_index` parameter

#### One-Time Tips & Platform Fees (PTBs)

Instead of complex escrow for a simple tip, we use Programmable Transaction Blocks (PTBs). In a single transaction, the PTB splits the fan's `Coin<SUI>`, sending the majority to the creator and a small percentage to the platform treasury. This ensures a seamless user experience with only one signature required.

**Move patterns:** PTB coin splitting, platform treasury `Balance<SUI>`, `AdminCap`-configurable fee BPS.

**Entry functions:**
- `tip(profile, coin, ctx)` — split coin, deposit creator share, platform share
- `set_platform_fee(platform, admin_cap, fee_bps)` — admin sets fee (e.g., 250 = 2.5%)

#### Creator Registry (DF + String Mapping)

To allow fans to find creators by name or handle, a shared `Registry` object uses Dynamic Fields. It stores a lightweight mapping of `String` (the handle) to `ID` (the CreatorProfile). Since these mappings don't need to exist as standalone objects, DFs keep the storage costs low and the lookups fast.

**Move patterns:** Shared object, Dynamic Fields (not Dynamic Object Fields), `String → ID` mapping.

**Entry functions:**
- `register_handle(registry, profile, cap, handle, ctx)` — claim a unique handle
- `lookup_handle(registry, handle)` — resolve handle to CreatorProfile ID

#### Subscription Tiers (Clock + Table DF)

Tiers are managed using the `Sui::Clock` module to track time-based expiry. A `Table` (implemented via Dynamic Fields) inside the Tier object maps `address → timestamp_ms`. Every time a user tries to access content, the contract checks if the current time is less than their stored expiry.

**Move patterns:** `Clock` for on-chain time, `Table<address, u64>` for subscriber tracking, expiry validation in `seal_approve`.

**Changes to existing types:**
- `AccessPass` gains `expires_at: u64` field
- `seal_approve` adds Clock parameter: reject if `clock.timestamp_ms() > access_pass.expires_at`
- New `renew_subscription(profile, access_pass, payment, clock, ctx)` function

### Phase 3: Advanced Content & Requests

#### Pay-per-Post (Modified Escrow)

This leverages the existing escrow model but applies it to a single content object. When a user pays for a single post, a Dynamic Field is added to their profile granting them specific access to that Walrus Blob ID without requiring a full monthly subscription.

**Move patterns:** Dynamic Fields on user's `AccessPass` or a new `PostAccess` object, per-blob-ID gating.

**Entry functions:**
- `purchase_post(profile, content_id, payment, ctx)` — pay for single content item, mint `PostAccess`
- Updated `seal_approve` checks for either tier-level `AccessPass` OR specific `PostAccess` for the content

#### Individual Requests (Hot Potato + Escrow)

For custom requests (like a personal shoutout), we use the Hot Potato pattern to ensure completion. A user's payment creates a `RequestReceipt` with no abilities (`has no drop, store, or key`), meaning the transaction must finish with the creator either fulfilling it or the system refunding it after a timeout. This protects the fan's money from being stuck if a creator is inactive.

**Move patterns:** Hot Potato (`RequestReceipt` — no `drop`, `store`, or `key` ability), escrow with timeout, `Clock` for deadline.

**Types:**
```
RequestReceipt (hot potato — no abilities)
├── creator_profile_id: ID
├── requester: address
├── amount: u64
├── description: String
├── deadline: u64              # Clock timestamp for timeout/refund

Request (shared object — escrow)
├── id: UID
├── receipt: Option<RequestReceipt>  # Consumed on fulfill or refund
├── payment: Balance<SUI>
├── status: u8                 # 0=pending, 1=fulfilled, 2=refunded
```

**Entry functions:**
- `create_request(profile, payment, description, deadline, clock, ctx)` → returns `RequestReceipt`
- `fulfill_request(request, receipt, blob_id, cap, ctx)` — creator delivers, consumes receipt
- `refund_request(request, receipt, clock, ctx)` — auto-refund after deadline, consumes receipt

#### Enhanced Content Encryption (Sui Seal + Nonce-based Ephemeral Keys)

To prevent unauthorized link sharing, we use Sui Seal to store content keys. The contract generates a unique Nonce (seed) for authorized users, which, when combined with the "sealed" master key on the frontend, allows the user to decrypt the Walrus blob locally. This makes shared keys useless for anyone who didn't trigger the on-chain access check.

**Move patterns:** On-chain nonce generation, per-user ephemeral key derivation, enhanced `seal_approve` with nonce tracking.

**Changes to existing types:**
- `seal_approve` generates and stores a user-specific nonce via DF on `AccessPass`
- Frontend combines nonce + sealed master key for decryption
- Prevents key reuse across users even if key shares are intercepted

### Phase 4: Community & Crowdfunding

#### Community NFTs (OTW + Enoki)

To give creators their own "Brand," we use the One-Time Witness (OTW) pattern to initialize a unique NFT collection for their community. Leveraging the existing Enoki setup, creators can upload media that gets minted as membership NFTs for users who reach specific payment tiers.

**Move patterns:** One-Time Witness for collection uniqueness, `Display<T>` for NFT metadata, tier-gated minting.

**Types:**
```
CommunityNFT
├── id: UID
├── creator_profile_id: ID
├── name: String
├── image_url: String          # Walrus blob (public, not encrypted)
├── tier_level: u64            # Tier at which this was earned
├── edition: u64               # Edition number
```

**Entry functions:**
- `create_collection(profile, cap, name, image_blob_id, max_supply, ctx)` — creator defines collection
- `mint_community_nft(profile, collection, access_pass, ctx)` — auto-mint to qualifying supporters

#### Crowdfunding Content (Shared Object + CampaignCap + Contributor Table DF)

A creator can launch a campaign using a Shared Object to collect funds from multiple "Early Investors." A `CampaignCap` ensures only the creator can withdraw once the goal is hit. A DF `Table` tracks contributors so they receive automatic "free" access or discounts once the content is released.

**Move patterns:** Shared object for concurrent contributions, capability pattern (`CampaignCap`), `Table<address, u64>` for contributor tracking, goal-based release logic.

**Types:**
```
Campaign (shared object)
├── id: UID
├── creator_profile_id: ID
├── title: String
├── description: String
├── goal: u64                  # Target amount in MIST
├── raised: Balance<SUI>
├── deadline: u64              # Clock timestamp
├── status: u8                 # 0=active, 1=funded, 2=failed
├── contributors: Table<address, u64>  # address → amount contributed

CampaignCap (owned by creator)
├── id: UID
├── campaign_id: ID
```

**Entry functions:**
- `create_campaign(profile, cap, title, desc, goal, deadline, clock, ctx)` — launch campaign
- `contribute(campaign, payment, clock, ctx)` — fan contributes, tracked in table
- `finalize_campaign(campaign, campaign_cap, clock, ctx)` — creator withdraws if goal met
- `refund_campaign(campaign, clock, ctx)` — contributors reclaim if deadline passed + goal not met
- `grant_contributor_access(campaign, campaign_cap, contributor, ctx)` — mint AccessPass to contributors

### Phase 5: Rich Content & Scale

| Feature | Description |
|---|---|
| **All content formats** | Video (HLS streaming with encrypted segments), audio, ZIP archives, interactive content. |
| **Content previews** | Unencrypted preview images/text alongside encrypted full content. |
| **Recommendation engine** | Off-chain ML model suggesting creators based on supporter behavior. |
| **Creator analytics** | Revenue charts, supporter demographics, content engagement metrics. |
| **Mobile app** | React Native or PWA for mobile-first experience. |
| **Multi-chain** | Bridge to other chains for cross-chain subscriptions. |
| **Creator collaborations** | Multi-creator content with revenue splitting. |

---

## 14. Demo Strategy

### 14.1 Demo Script (3 Minutes)

**[0:00 – 0:15] The Problem**
> "Creators on Patreon and YouTube lose 30% to platform fees. Their content access depends on centralized servers that can be censored or taken down. And supporters have no on-chain proof of their support."

**[0:15 – 0:30] The Solution**
> "SuiPatron is a decentralized creator platform. Creators publish encrypted content. Supporters pay on-chain to unlock it. No middleman, no censorship, and creators keep their earnings."

**[0:30 – 1:00] Demo: Creator Signs In & Sets Up**
- Click "Sign in with Google" — Enoki zkLogin, no wallet
- Create profile: name, bio, access price (show the UI)
- Show SuiNS name created: `demo@suipatron.sui`
- Upload a piece of encrypted content (show SEAL + Walrus in action)

**[1:00 – 1:45] Demo: Supporter Discovers & Purchases**
- Switch to a different Google account (or use incognito)
- Browse Explore page → find the creator
- Click on creator → see price and locked content
- Click "Support" → confirm payment → gasless transaction (Enoki sponsored)
- Show AccessPass NFT minted on-chain (SUI explorer link)

**[1:45 – 2:15] Demo: Content Unlocked**
- Content card now shows "unlocked" state
- Click to view → SEAL decrypts → content renders
- "This content was encrypted on Walrus. Only valid AccessPass holders can decrypt it. No server involved."

**[2:15 – 2:45] Demo: Creator Withdraws**
- Switch back to creator account
- Show earnings in dashboard
- Click "Withdraw" → SUI transferred
- Show transaction on explorer

**[2:45 – 3:00] Technical Highlights**
> "We integrated all four SUI ecosystem components: Walrus for storage, SEAL for encryption, Enoki for gasless auth, and SuiNS for identity. Our Move contracts use 6+ patterns including OTW, capabilities, dynamic fields, and hot potato. Deployed on Vercel, fully functional on Testnet."

### 14.2 Demo Preparation Checklist

```
[ ] 3 pre-seeded creator profiles with diverse content
[ ] Each creator has a realistic access price
[ ] 5+ content items across creators (mix of images, text, PDF)
[ ] 1 "fresh" supporter account ready for live demo
[ ] Test the full flow 3+ times before demo
[ ] Have SUI explorer tabs pre-opened to show on-chain state
[ ] Backup: screen recording of successful flow in case of network issues
[ ] Prepare 1-2 talking points about challenges faced + how solved
```

### 14.3 Judging Criteria Alignment

| Criterion | How We Score | Evidence |
|---|---|---|
| **Technical Depth** | 6+ Move patterns, SEAL integration, event indexer | Contract source, architecture diagram |
| **Ecosystem Integration** | Walrus + SEAL + Enoki + SuiNS — all four | Live demo shows each in action |
| **Innovation** | On-chain access control for content, zero-knowledge auth | No centralized gatekeeper, zkLogin |
| **UX Quality** | Gasless, ≤5 clicks to subscribe, clean UI | Live demo experience |
| **Completeness** | Deployed, working E2E, seeded demo data | Vercel URL, SUI explorer |
| **Code Quality** | Typed Move + TypeScript, events, error handling | Code review, README |

---

## 15. Reference Links

### Official Documentation

| Resource | URL |
|---|---|
| SUI Docs | https://docs.sui.io |
| Move Book | https://move-book.com |
| Walrus Docs | https://docs.wal.app |
| SEAL Docs | https://seal-docs.wal.app |
| Enoki Docs | https://docs.enoki.mystenlabs.com |
| SuiNS Docs | https://docs.suins.io |

### SDKs & Libraries

| Package | URL |
|---|---|
| `@mysten/sui` (TS SDK) | https://www.npmjs.com/package/@mysten/sui |
| `@mysten/dapp-kit` | https://sdk.mystenlabs.com/dapp-kit |
| `@mysten/enoki` | https://www.npmjs.com/package/@mysten/enoki |
| `@mysten/seal` | https://www.npmjs.com/package/@mysten/seal |
| `@mysten/walrus` | https://www.npmjs.com/package/@mysten/walrus |

### Examples & Patterns

| Resource | URL |
|---|---|
| SEAL Move Patterns | https://github.com/MystenLabs/seal/tree/main/move/patterns |
| Enoki Example App | https://github.com/MystenLabs/enoki-example-app |
| SUI dApp Starter | https://sdk.mystenlabs.com/dapp-kit/create-dapp |

### Tools & Portals

| Tool | URL |
|---|---|
| Enoki Portal | https://portal.enoki.mystenlabs.com |
| SuiNS (Testnet) | https://testnet.suins.io |
| Walrus Explorer | https://walruscan.com |
| SUI Explorer (Testnet) | https://suiscan.xyz/testnet |
| SUI Faucet | `sui client faucet` or https://faucet.testnet.sui.io |

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **PTB** | Programmable Transaction Block — SUI's composable transaction format |
| **MIST** | Smallest unit of SUI (1 SUI = 1,000,000,000 MIST) |
| **Blob** | A data object stored on Walrus, identified by its blob ID |
| **SEAL Identity** | A byte array encoding the access policy parameters for encryption/decryption |
| **zkLogin** | Zero-knowledge login — proves Google account ownership without revealing JWT to the chain |
| **AccessPass** | An NFT proving a supporter paid for access to a specific creator's content |
| **Shared Object** | A SUI object that can be accessed by multiple transactions concurrently |
| **Dynamic Object Field** | Key-value storage attached to an object, for unbounded data |
| **OTW** | One-Time Witness — ensures code runs exactly once at package publish |
| **Hot Potato** | A struct that must be consumed in the same transaction (no `drop`, `store`, or `key` ability) |

---

## Appendix B: Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SEAL testnet key servers down | Low | Critical | Have a "mock decrypt" fallback that shows the flow but skips SEAL |
| Walrus upload fails / slow | Medium | High | Pre-upload demo content; have cached blobs ready |
| Enoki sponsored tx quota hit | Low | High | Use direct wallet txns as fallback; keep PTBs lean |
| Move compilation errors block frontend | Medium | High | Alex deploys contract ASAP in Phase 2; frontend uses mock data until then |
| zkLogin callback fails on Vercel | Medium | Medium | Test on deployed URL early (Phase 1); have localhost fallback |
| SuiNS domain not available | Low | Low | SuiNS is P1; skip if blocked, mention in demo as "coming soon" |
| Demo network issues | Medium | Critical | Pre-record backup video; have local screenshots of each step |

---

*Last updated: Hackathon kickoff. This is a living document — update as decisions are made and blockers arise.*
