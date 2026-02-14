# SuiPatron Architecture — Smart Contracts & Service Layer

## Overview

SuiPatron is a decentralized creator support platform on SUI. The architecture spans two layers:

1. **Smart Contract Layer** (Move) — On-chain state, access control, payments
2. **Service Layer** (TypeScript) — PTB builders, RPC queries, SEAL encryption, Walrus storage

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                            │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Transaction   │ │   Creator    │ │  Content   │ │  Access  │ │
│  │   Service     │ │   Service    │ │  Service   │ │   Pass   │ │
│  └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ │  Service │ │
│         │                │               │         └────┬─────┘ │
│         │                │          ┌────┴────┐         │       │
│         │                │     ┌────┤         ├───┐     │       │
│         │                │     │    │         │   │     │       │
│  ┌──────┴────────────────┴─────┴┐ ┌─┴───────┐ ┌─┴─────┴─────┐ │
│  │       SUI RPC Client         │ │  SEAL   │ │   Walrus    │ │
│  │    (@mysten/sui)             │ │ Service │ │   Service   │ │
│  └──────────────┬───────────────┘ └────┬────┘ └──────┬──────┘ │
├─────────────────┼──────────────────────┼─────────────┼────────┤
│           SUI Blockchain          SEAL Servers   Walrus Network │
│  ┌──────────────────────────────┐                               │
│  │  suipatron::suipatron        │                               │
│  │  suipatron::seal_policy      │                               │
│  └──────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Layer

**Location:** `packages/blockchain/contracts/sources/`

### Module: `suipatron::suipatron`

Core module handling platform state, creator profiles, content, payments, and access passes.

#### On-Chain Types

| Type | Ownership | Description |
|------|-----------|-------------|
| `Platform` | Shared | Singleton created at publish. Tracks global stats (`total_creators`, `total_access_passes`). Versioned for upgrades. |
| `AdminCap` | Owned | Capability transferred to deployer. Used for `migrate()`. |
| `CreatorProfile` | Shared | One per creator. Holds name, bio, avatar, price, balance, and content count. Content stored as dynamic object fields. |
| `CreatorCap` | Owned | Capability proving ownership of a specific `CreatorProfile`. Required for publishing content, updating profile, and withdrawing. |
| `Content` | DOF on CreatorProfile | Individual content item. Keyed by `u64` index on the parent profile. Contains title, description, blob_id (Walrus), content_type, timestamp. |
| `AccessPass` | Owned (NFT) | Proves a supporter paid for access to a creator. Contains `creator_profile_id`, `amount_paid`, `purchased_at`, `supporter`. |

#### Design Patterns

| Pattern | Usage |
|---------|-------|
| One-Time Witness (OTW) | `SUIPATRON` struct ensures singleton `Platform` creation in `init()` |
| Capability | `AdminCap` for platform admin, `CreatorCap` for per-creator authorization |
| Shared Objects | `Platform` and `CreatorProfile` for concurrent read/write access |
| Dynamic Object Fields | `Content` items stored on `CreatorProfile`, keyed by `u64` index |
| Events | Emitted for all state changes for off-chain indexing |
| Version Tracking | `VERSION` const + `version` field on Platform/CreatorProfile for safe upgrades |

#### Entry Functions

| Function | Auth | Parameters | Effects |
|----------|------|------------|---------|
| `create_profile` | Any user | `platform: &mut Platform`, `name`, `bio`, `price`, `clock` | Creates shared `CreatorProfile` + owned `CreatorCap`. Increments `platform.total_creators`. Emits `ProfileCreated`. |
| `update_profile` | `CreatorCap` | `profile`, `cap`, `name?`, `bio?`, `avatar_blob_id?`, `suins_name?`, `price?`, `clock` | Partial update via `Option` params — only non-`None` fields are changed. Emits `ProfileUpdated`. |
| `publish_content` | `CreatorCap` | `profile`, `cap`, `title`, `description`, `blob_id`, `content_type`, `clock` | Creates `Content` as DOF on profile at key `content_count`. Increments counter. Emits `ContentPublished`. |
| `purchase_access` | Any user | `platform`, `profile`, `payment: Coin<SUI>`, `clock` | Validates `payment >= profile.price`. Deposits payment into profile balance. Mints `AccessPass` NFT to buyer. Emits `AccessPurchased`. |
| `withdraw_earnings` | `CreatorCap` | `profile`, `cap`, `clock` | Transfers full `Balance<SUI>` from profile to `profile.owner`. Asserts balance > 0. Emits `EarningsWithdrawn`. |
| `migrate` | `AdminCap` | `platform`, `cap` | Bumps platform version after package upgrade. Asserts not already migrated. |

#### Getter Functions (Read-Only)

| Function | Returns |
|----------|---------|
| `access_pass_creator_profile_id(pass)` | `ID` — which creator this pass is for |
| `access_pass_supporter(pass)` | `address` — owner of the pass |
| `access_pass_purchased_at(pass)` | `u64` — timestamp |
| `access_pass_amount_paid(pass)` | `u64` — MIST amount |
| `profile_price(profile)` | `u64` — access price in MIST |
| `profile_owner(profile)` | `address` — creator's address |
| `profile_content_count(profile)` | `u64` — number of content items |
| `profile_total_supporters(profile)` | `u64` — total access passes sold |
| `profile_balance(profile)` | `u64` — current balance in MIST |
| `profile_name(profile)` | `String` |
| `platform_total_creators(platform)` | `u64` |
| `platform_total_access_passes(platform)` | `u64` |
| `cap_profile_id(cap)` | `ID` — which profile the cap controls |

#### Error Codes

| Code | Name | Trigger |
|------|------|---------|
| 1 | `EUnauthorized` | CreatorCap doesn't match CreatorProfile |
| 2 | `EInsufficientPayment` | Payment coin < profile price |
| 3 | `EVersionMismatch` | Object version != current `VERSION` |
| 4 | `EAlreadyMigrated` | Platform already at current version |
| 5 | `ENotSubscriber` | (Reserved) |
| 6 | `EWrongCreator` | (Reserved) |
| 7 | `EZeroBalance` | Withdraw called with zero balance |

#### Events

| Event | Fields | Emitted By |
|-------|--------|------------|
| `ProfileCreated` | `profile_id`, `owner`, `name`, `price`, `timestamp` | `create_profile` |
| `ProfileUpdated` | `profile_id`, `name`, `timestamp` | `update_profile` |
| `ContentPublished` | `content_id`, `profile_id`, `blob_id`, `content_type`, `timestamp` | `publish_content` |
| `AccessPurchased` | `access_pass_id`, `profile_id`, `supporter`, `amount`, `timestamp` | `purchase_access` |
| `EarningsWithdrawn` | `profile_id`, `amount`, `recipient`, `timestamp` | `withdraw_earnings` |

---

### Module: `suipatron::seal_policy`

SEAL access control policy — validates decryption requests from SEAL key servers.

#### SEAL Identity Format (MVP)

```
Bytes [0..32] = CreatorProfile object ID
Total: 32 bytes
```

All content for a creator shares the same identity. Any valid `AccessPass` for that creator can decrypt all content.

#### Functions

| Function | Visibility | Description |
|----------|------------|-------------|
| `seal_approve(id, access_pass, ctx)` | `entry` | SEAL protocol entry point. Called by key servers. Asserts `check_seal_access()` passes. |
| `check_seal_access(id, access_pass, caller)` | `public` | Returns `bool`. Checks: (1) `caller == access_pass.supporter`, (2) `access_pass.creator_profile_id == id_from_bytes(id)`. |

#### Error Codes

| Code | Name | Trigger |
|------|------|---------|
| 0 | `ENoAccess` | Caller doesn't own the AccessPass or it's for the wrong creator |

---

## Service Layer

**Location:** `apps/dapp/app/services/`

Six service classes, each with a factory function (`create*Service`):

### TransactionService

**File:** `transactionService.ts`
**Purpose:** Builds `Transaction` (PTB) objects for all smart contract entry functions. Does not sign or execute — that's the caller's responsibility.

| Method | Parameters | Returns | Maps To (Move) |
|--------|-----------|---------|-----------------|
| `buildCreateProfileTx(name, bio, price)` | strings + number | `Transaction` | `suipatron::create_profile` |
| `buildUpdateProfileTx(profileId, creatorCapId, updates)` | IDs + `ProfileUpdateParams` | `Transaction` | `suipatron::update_profile` |
| `buildPublishContentTx(profileId, creatorCapId, title, description, blobId, contentType)` | strings | `Transaction` | `suipatron::publish_content` |
| `buildPurchaseAccessTx(profileId, price)` | string + number | `Transaction` | `suipatron::purchase_access` — splits exact amount from gas coin |
| `buildWithdrawEarningsTx(profileId, creatorCapId)` | strings | `Transaction` | `suipatron::withdraw_earnings` |

**Constructor:** `new TransactionService(packageId, platformId)`

---

### CreatorService

**File:** `creatorService.ts`
**Purpose:** On-chain read operations for creator profiles and content via SUI RPC.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getCreatorProfile(profileId)` | object ID | `CreatorProfile \| null` | Fetch single profile by ID |
| `getCreatorProfiles(limit?)` | number (default 50) | `CreatorProfile[]` | Discover creators via `ProfileCreated` events, batch-fetch objects |
| `getContentList(profileId)` | object ID | `Content[]` | Read dynamic object fields, sorted by `createdAt` desc |
| `getCreatorByOwner(ownerAddress)` | address | `CreatorProfile \| null` | Find profile owned by address (event query + fetch) |
| `getCreatorCapByOwner(ownerAddress)` | address | `CreatorCap \| null` | Find CreatorCap via `getOwnedObjects` filter |

**Constructor:** `new CreatorService(suiClient, packageId)`

---

### AccessPassService

**File:** `accessPassService.ts`
**Purpose:** Query AccessPass NFTs owned by supporters.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getAccessPassesByOwner(ownerAddress)` | address | `AccessPass[]` | All AccessPass NFTs owned by address |
| `getAccessPassForCreator(ownerAddress, creatorProfileId)` | address + ID | `AccessPass \| null` | Find specific pass for a creator |
| `hasAccessToCreator(ownerAddress, creatorProfileId)` | address + ID | `boolean` | Check if user has access |

**Constructor:** `new AccessPassService(suiClient, packageId)`

---

### ContentService

**File:** `contentService.ts`
**Purpose:** Orchestrates SEAL + Walrus + TransactionService for complete content upload/download lifecycles.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `uploadContent(params, creatorProfileId, creatorCapId, signAndExecute, ownerAddress)` | file + IDs + signer | `{ blobId, publishTx }` | Full upload: read file → SEAL encrypt → Walrus upload → build publish TX |
| `downloadContent(blobId, sessionKey, accessPassId)` | string + SessionKey + ID | `Uint8Array` | Full download: Walrus download → SEAL decrypt |
| `uploadAvatar(file, signer, ownerAddress?)` | File + Signer | `string` (blobId) | Public upload (no encryption) |
| `downloadAvatar(blobId)` | string | `Uint8Array` | Public download (no decryption) |
| `createSessionKey(address, signPersonalMessage)` | address + signer callback | `SessionKey` | Delegates to SealService |

**Constructor:** `new ContentService(config: ContentServiceConfig)` — lazy-inits SealService to avoid WASM during SSR.

---

### SealService

**File:** `sealService.ts`
**Purpose:** SEAL threshold encryption/decryption using `@mysten/seal`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `encrypt(creatorProfileId, data)` | ID + bytes | `{ encryptedObject, key }` | Encrypt under creator's identity (32-byte profile ID) |
| `decrypt(encryptedBytes, sessionKey, accessPassId)` | bytes + SessionKey + ID | `Uint8Array` | Parse EncryptedObject → match servers → build `seal_approve` PTB → decrypt |
| `createSessionKey(address, signPersonalMessage)` | address + signer callback | `SessionKey` | Create 10-min session key, sign personal message |

**Constructor:** `new SealService(config: SealServiceConfig)` — configures `SealClient` with key server object IDs.

---

### WalrusService

**File:** `walrusService.ts`
**Purpose:** Blob upload (via upload relay) and download (via aggregator) using `@mysten/walrus`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `uploadEncryptedContent(encryptedBytes, signAndExecute, ownerAddress)` | bytes + signer + address | `string` (blobId) | Full flow: encode → register TX → sign → wait → upload slivers → certify TX → sign → get blob ID |
| `uploadPublicFile(data, signer, ownerAddress?)` | bytes + Signer | `string` (blobId) | Direct upload via `writeBlob()` (no encryption) |
| `downloadBlob(blobId)` | string | `Uint8Array` | Try aggregator HTTP first, fallback to SDK `readBlob()` |

**Constructor:** `new WalrusService(suiClient, network)` — lazy-inits `WalrusClient` to avoid WASM during SSR.

---

## Key Data Flows

### Creator Publishes Content

```
Creator → ContentService.uploadContent()
  ├── Read file bytes
  ├── SealService.encrypt(creatorProfileId, bytes)
  │     └── SealClient.encrypt({ id: creatorProfileId, data })
  ├── WalrusService.uploadEncryptedContent(encryptedBytes)
  │     ├── encode → register TX → sign → upload → certify TX → sign
  │     └── returns blobId
  └── TransactionService.buildPublishContentTx(profileId, capId, title, desc, blobId, type)
        └── returns Transaction (caller signs & executes)
```

### Supporter Views Content

```
Supporter → ContentService.downloadContent(blobId, sessionKey, accessPassId)
  ├── WalrusService.downloadBlob(blobId)
  │     └── GET aggregator/blobs/{blobId} → encrypted bytes
  └── SealService.decrypt(encryptedBytes, sessionKey, accessPassId)
        ├── Parse EncryptedObject → find server IDs
        ├── Build seal_approve PTB with AccessPass
        └── SealClient.decrypt({ data, sessionKey, txBytes })
              └── Key servers call seal_approve on-chain
                    └── check_seal_access validates AccessPass
```

### Supporter Purchases Access

```
Supporter → TransactionService.buildPurchaseAccessTx(profileId, price)
  ├── splitCoins(gas, [price]) → exact payment coin
  └── moveCall suipatron::purchase_access(platform, profile, coin, clock)
        ├── Validates payment >= profile.price
        ├── Deposits into profile.balance
        ├── Mints AccessPass NFT → transferred to buyer
        └── Emits AccessPurchased event
```
