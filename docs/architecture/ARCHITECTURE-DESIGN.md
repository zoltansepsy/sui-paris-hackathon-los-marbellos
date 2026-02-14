# SuiPatron — Architecture Design

**Source:** [SCOPE.md](../SCOPE.md) Sections 3–4  
**Purpose:** Data flow, design decisions, contract types summary

---

## System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Enoki     │  │  dApp Kit   │  │ SEAL SDK │  │  Walrus SDK  │   │
│  │   zkLogin   │  │  SUI Client │  │ Encrypt  │  │  Upload      │   │
│  │   Auth      │  │  Queries    │  │ Decrypt  │  │  Download    │   │
│  └──────┬──────┘  └──────┬──────┘  └─────┬────┘  └──────┬───────┘   │
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

---

## Data Flow Summary

| Action | Data Path |
|---|---|
| **Sign in** | Frontend → Google OAuth → Enoki → zkLogin address created |
| **Create profile** | Frontend builds PTB → Enoki sponsors → SUI Testnet executes → event emitted |
| **Upload content** | File → SEAL encrypt (client) → Walrus store → blobId → on-chain Content metadata |
| **Purchase access** | Frontend builds PTB (payment + mint) → Enoki sponsors → AccessPass NFT minted |
| **View content** | Walrus download → SEAL decrypt (client validates via seal_approve) → render |
| **Withdraw** | Frontend builds PTB → Enoki sponsors → SUI transferred to creator |

---

## Key Design Decisions

| Decision | Why |
|---|---|
| **One-time flat payment** | Simplest MVP. No expiry, no tier comparisons. Full SEAL + payment flow demonstrated. |
| **`AccessPass` instead of `SubscriptionNFT`** | Naming reflects one-time model. Owned NFT proving payment. |
| **`CreatorProfile` as shared object** | Multiple users read; creator mutates (upload, withdraw). |
| **Content as dynamic object fields** | Unbounded content per creator. Each item has its own UID. |
| **SEAL identity = creatorProfileId only** | Flat model — all content shares identity. Any valid AccessPass unlocks everything. |
| **Enoki sponsors everything** | Zero-friction UX. No gas tokens needed. Only payment requires SUI. |
| **Events for all state changes** | Enables off-chain indexing. Frontend queries indexed data for lists/feeds. |

---

## Contract Types Summary

| Type | Ownership | Purpose |
|---|---|---|
| `Platform` | Shared (singleton) | Platform admin, total_creators, total_access_passes |
| `AdminCap` | Owned (deployer) | Platform admin operations |
| `CreatorProfile` | Shared | Creator metadata, balance, price, content count |
| `Content` | Dynamic object field on CreatorProfile | Per-content metadata, blob_id |
| `CreatorCap` | Owned (creator) | Proves ownership of CreatorProfile |
| `AccessPass` | Owned (supporter) | NFT proving payment for access |

---

## Package Structure

```
move/suipatron/
├── Move.toml
└── sources/
    ├── suipatron.move       # Core: Platform, CreatorProfile, AccessPass, payments
    └── seal_policy.move     # SEAL access control: seal_approve
```

---

See [SCOPE.md](../SCOPE.md) Sections 3–4 for full specification.
