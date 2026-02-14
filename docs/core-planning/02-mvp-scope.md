# SuiPatron — MVP Scope

**Source:** [SCOPE.md](../SCOPE.md) Sections 2–3  
**Purpose:** Feature checklist, user flows, out-of-scope — link to SCOPE for full details

---

## Core Model: Flat One-Time Payment Access

The MVP uses a **flat one-time payment model** — not recurring subscriptions and not tiered. A supporter pays a single price set by the creator and gets permanent access to **all** of that creator's content.

---

## Feature Checklist

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

---

## MVP User Flows

### Flow 1: Creator Onboarding

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

### Flow 2: Content Upload (Creator)

```
Creator navigates to Dashboard → "Upload Content"
  → Selects file (image, PDF, text)
  → Sets title, description
  → Frontend encrypts file with SEAL (identity = creatorProfileId)
  → Encrypted blob uploaded to Walrus → returns blobId
  → Sponsored transaction publishes Content metadata on-chain (blobId, title)
  → Content appears in creator's content grid
```

### Flow 3: Supporter Purchase

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

### Flow 4: Content Access (Supporter)

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

### Flow 5: Earnings Withdrawal (Creator)

```
Creator views Dashboard → "Earnings" section shows balance
  → Clicks "Withdraw"
  → Sponsored transaction transfers SUI from CreatorProfile balance to creator's address
  → Balance updates to 0
```

---

## MVP Content Types

| Content Type | File Extensions | Render Method |
|---|---|---|
| Image | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | `<img>` tag / lightbox |
| Text / Article | `.txt`, `.md` | Rendered markdown or plain text |
| PDF | `.pdf` | Embedded PDF viewer |

---

## What's Explicitly OUT of MVP

- **Multiple tiers** (single flat price in MVP; tiers planned for Phase 2)
- Recurring subscriptions / time-based plans
- Tips / donations
- Platform fees (we take 0% in MVP)
- Crowdfunding / content requests
- Video streaming (MVP supports images, text, PDFs)
- Individual subscriber requests
- Creator analytics beyond basic counts

---

See [SCOPE.md](../SCOPE.md) Sections 2–3 for full details.
