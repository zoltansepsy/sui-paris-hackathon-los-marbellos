# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuiPatron is a decentralized Patreon-like creator support platform on SUI. Creators publish encrypted content, supporters pay a flat one-time price for permanent access to all of a creator's content. Content is encrypted with SEAL and stored on Walrus. All access control is on-chain via AccessPass NFTs. Transactions are sponsored via Enoki zkLogin (Google sign-in, no wallet needed). Multiple tiers are planned for Phase 2 — the MVP uses a single price per creator.

The full specification lives in `docs/SCOPE.md`.

## Tech Stack

- **Smart Contracts:** Move (SUI Move) in `move/suipatron/`
- **Frontend:** React + Vite + TypeScript + Tailwind CSS in `frontend/`
- **Backend:** Vercel serverless functions (Node.js) in `backend/` or `frontend/api/`
- **SUI SDKs:** `@mysten/sui`, `@mysten/dapp-kit`, `@mysten/enoki`, `@mysten/seal`, `@mysten/walrus`

## Build & Run Commands

### Move Contracts
```bash
# Build
cd move/suipatron && sui move build

# Test
cd move/suipatron && sui move test

# Deploy to testnet
cd move/suipatron && sui client publish --gas-budget 200000000
```

### Frontend
```bash
cd frontend && npm install
cd frontend && npm run dev     # dev server
cd frontend && npm run build   # production build
```

## Architecture

### Smart Contract Layer (`move/suipatron/sources/`)

Two modules:
- **suipatron.move** — Core: Platform (singleton shared object), CreatorProfile (shared object with flat price + dynamic Content fields), AccessPass (owned NFT), payments, withdrawal
- **seal_policy.move** — SEAL access control: `seal_approve` validates AccessPass belongs to correct creator

Key Move patterns used:
- One-Time Witness (OTW) in `init` for singleton Platform + AdminCap
- Capability pattern: AdminCap (platform admin), CreatorCap (per-creator auth)
- Shared objects for Platform and CreatorProfile (concurrent read/write)
- Dynamic object fields for Content items on CreatorProfile
- Events emitted for all state changes (ProfileCreated, ContentPublished, AccessPurchased, EarningsWithdrawn, etc.)

### Data Flows

| Action | Path |
|--------|------|
| Sign in | Frontend → Google OAuth → Enoki → zkLogin address |
| Create profile | Frontend PTB → Enoki sponsors → SUI executes → CreatorProfile + CreatorCap created |
| Upload content | File → SEAL encrypt (client-side) → Walrus store → blobId recorded on-chain as Content dynamic field |
| Purchase access | Frontend PTB with flat payment → Enoki sponsors → SUI deposits to profile balance + mints AccessPass NFT |
| View content | Walrus download → SEAL decrypt (seal_approve validates AccessPass) → render |
| Withdraw | Frontend PTB → Enoki sponsors → balance transferred to creator |

### SEAL Encryption Identity Format

Identity bytes: `[creatorProfileId (32 bytes)]`. In the flat MVP model, all content for a creator shares the same SEAL identity. Any valid AccessPass for that creator unlocks all content. Per-tier encryption (40-byte identity with tier level) is planned for Phase 2.

### Frontend Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with Google sign-in CTA |
| `/auth/callback` | Enoki zkLogin redirect handler |
| `/explore` | Creator discovery grid |
| `/creator/:id` | Public creator profile + price + content |
| `/dashboard` | Creator management (content, earnings, withdraw) |
| `/feed` | Supporter's content feed |

### Backend API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/sponsor` | Sponsor transaction via Enoki |
| `POST /api/sponsor/execute` | Execute sponsored transaction |
| `POST /api/subname` | Create SuiNS subname (`name@suipatron.sui`) |
| `GET /api/creators` | List creator profiles (from indexer) |
| `GET /api/creator/:id` | Get creator profile + content |

## Roadmap Features (Post-MVP)

These are documented in detail in `docs/SCOPE.md` Section 13. The MVP scope remains unchanged — these are future phases.

| Feature | Key Move Patterns | Phase |
|---------|-------------------|-------|
| Multiple Tiers | Tier struct vector, per-tier SEAL identity, tier-gated access | 2 |
| Creator Registry | DF + String→ID Mapping | 2 |
| One-Time Tips & Platform Fees | PTB coin splitting, platform treasury | 2 |
| Subscription Tiers | Clock + Table (DF), time-based expiry | 2 |
| Pay-per-Post | Modified Escrow, per-blob DF access | 3 |
| Individual Requests | Hot Potato (`RequestReceipt`), Escrow + timeout | 3 |
| Enhanced Content Encryption | Sui Seal + nonce-based ephemeral keys | 3 |
| Community NFTs | OTW + Display<T>, tier-gated minting | 4 |
| Crowdfunding | Shared Object + CampaignCap + Contributor Table (DF) | 4 |

## Environment Variables

Public vars go in `frontend/.env`, secrets in `frontend/.env.local` (gitignored):

```
VITE_SUI_NETWORK=testnet
VITE_PACKAGE_ID=0x...          # After contract deployment
VITE_PLATFORM_ID=0x...         # After contract deployment
VITE_ENOKI_PUBLIC_KEY=...
VITE_GOOGLE_CLIENT_ID=...
VITE_SEAL_KEY_SERVER_OBJECT_IDS=0x...,0x...
VITE_WALRUS_NETWORK=testnet
ENOKI_SECRET_KEY=...           # .env.local only
```

## Deployment

- **Frontend:** Vercel (auto-deploy from main), framework preset: Vite
- **Backend:** Vercel serverless functions
- **Contracts:** Manual `sui client publish` to SUI Testnet
