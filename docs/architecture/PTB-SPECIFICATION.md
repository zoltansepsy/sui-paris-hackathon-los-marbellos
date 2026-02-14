# SuiPatron — PTB Specification

**Purpose:** Programmable Transaction Block (PTB) builders for SuiPatron — create_profile, purchase_access, withdraw_earnings, and SEAL seal_approve usage.

**Reference:** [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) Contract API Quick Reference

---

## Overview

All user-facing transactions are built as PTBs in the frontend and sponsored via Enoki. The frontend constructs the transaction bytes; the backend calls Enoki to sponsor and execute.

---

## Common Setup

```typescript
import { Transaction } from '@mysten/sui/transactions';

// Package and object IDs from env
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
const PLATFORM_ID = import.meta.env.VITE_PLATFORM_ID;
const CLOCK_OBJECT_ID = '0x6'; // SUI system Clock
```

---

## 1. create_profile PTB

**Entry:** `suipatron::suipatron::create_profile`

**Parameters:**
- `platform`: Shared object (Platform) — use `PLATFORM_ID`
- `name`: String
- `bio`: String
- `price`: u64 (MIST; 1 SUI = 1_000_000_000)
- `clock`: Shared object (Clock) — use `0x6`

**Pseudo-code:**

```typescript
function buildCreateProfileTx(name: string, bio: string, priceMist: bigint): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::suipatron::create_profile`,
    arguments: [
      tx.object(PLATFORM_ID),
      tx.pure.string(name),
      tx.pure.string(bio),
      tx.pure.u64(priceMist),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}
```

**Returns:** CreatorProfile (shared) + CreatorCap (transferred to sender). Emits `ProfileCreated`.

---

## 2. purchase_access PTB

**Entry:** `suipatron::suipatron::purchase_access`

**Parameters:**
- `platform`: Shared object (Platform)
- `profile`: Shared object (CreatorProfile)
- `payment`: Coin<SUI> — must be >= profile.price
- `clock`: Shared object (Clock)

**Note:** Caller must split/merge coins to provide exact payment amount. Use `tx.splitCoins` or `tx.moveCall` to obtain a coin of the right amount.

**Pseudo-code:**

```typescript
function buildPurchaseAccessTx(
  profileId: string,
  priceMist: bigint,
  // Caller passes their gas coin or a coin to split
  paymentCoin: TransactionArgument
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::suipatron::purchase_access`,
    arguments: [
      tx.object(PLATFORM_ID),
      tx.object(profileId),
      paymentCoin,  // Coin<SUI> from tx.splitCoins or tx.gas
      tx.object(CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

// Example: split coin from gas
const tx = new Transaction();
const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);
tx.moveCall({
  target: `${PACKAGE_ID}::suipatron::purchase_access`,
  arguments: [
    tx.object(PLATFORM_ID),
    tx.object(profileId),
    payment,
    tx.object(CLOCK_OBJECT_ID),
  ],
});
```

**Returns:** AccessPass NFT (transferred to sender). Emits `AccessPurchased`.

---

## 3. withdraw_earnings PTB

**Entry:** `suipatron::suipatron::withdraw_earnings`

**Parameters:**
- `profile`: Shared object (CreatorProfile)
- `cap`: CreatorCap (owned by creator — must be in sender's objects)
- `clock`: Shared object (Clock)

**Pseudo-code:**

```typescript
function buildWithdrawTx(profileId: string, creatorCapId: string): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::suipatron::withdraw_earnings`,
    arguments: [
      tx.object(profileId),
      tx.object(creatorCapId),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}
```

**Returns:** Full balance transferred to creator. Emits `EarningsWithdrawn`.

---

## 4. SEAL seal_approve (Content Decrypt)

**Note:** `seal_approve` is **not** called directly by the frontend. It is called by SEAL key servers during the decrypt flow. The frontend:

1. Requests decryption from SEAL SDK
2. SEAL SDK builds a PTB that includes `seal_approve(id, access_pass, ctx)`
3. User signs the PTB (or Enoki sponsors if gasless)
4. SEAL key servers validate the AccessPass on-chain and return decryption key shares

**SEAL identity format (MVP):** 32 bytes = CreatorProfile object ID.

```typescript
// Identity for SEAL encrypt/decrypt
const identity = Array.from(
  new Uint8Array(
    parseObjectId(creatorProfileId).replace('0x', '')
      .match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )
);
```

**seal_approve call (for reference — called by SEAL, not frontend):**

```
suipatron::seal_policy::seal_approve(
  id: vector<u8>,        // 32 bytes = creatorProfileId
  access_pass: &AccessPass,
  ctx: &TxContext,
)
```

---

## 5. Enoki Sponsored Transaction Flow

```
Frontend                          Backend                         Enoki
   │                                 │                               │
   │  1. Build PTB (Transaction)     │                               │
   │  2. Serialize to bytes          │                               │
   │  3. POST /api/sponsor ─────────>│                               │
   │     { bytes, sender }           │  4. createSponsoredTransaction │
   │                                 │  ─────────────────────────────>│
   │                                 │                               │
   │                                 │  <─────────────────────────────│
   │                                 │     sponsored tx bytes         │
   │  <─────────────────────────────│                               │
   │     { sponsoredTxBytes }        │                               │
   │                                 │                               │
   │  5. User signs (zkLogin JWT)    │                               │
   │  6. POST /api/sponsor/execute   │                               │
   │     { signedTx }                │  7. executeSponsoredTransaction│
   │                                 │  ─────────────────────────────>│
   │                                 │                               │
   │  <─────────────────────────────│  <─────────────────────────────│
   │     { digest, effects }         │     result                     │
```

---

## 6. Additional PTBs

### update_profile

```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::suipatron::update_profile`,
  arguments: [
    tx.object(profileId),
    tx.object(creatorCapId),
    tx.pure.option('string', name ?? null),
    tx.pure.option('string', bio ?? null),
    tx.pure.option('string', avatarBlobId ?? null),
    tx.pure.option('string', suinsName ?? null),
    tx.pure.option('u64', priceMist ?? null),
    tx.object(CLOCK_OBJECT_ID),
  ],
});
```

### publish_content

```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::suipatron::publish_content`,
  arguments: [
    tx.object(profileId),
    tx.object(creatorCapId),
    tx.pure.string(title),
    tx.pure.string(description),
    tx.pure.string(blobId),
    tx.pure.string(contentType),  // "image" | "text" | "pdf"
    tx.object(CLOCK_OBJECT_ID),
  ],
});
```

---

See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) for full Contract API Quick Reference.
