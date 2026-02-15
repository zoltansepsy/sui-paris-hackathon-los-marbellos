# Enoki Sponsored Transactions — Implementation Audit

> **Date:** February 14, 2025  
> **Branch:** `feat/enoki-sponsored-transactions`  
> **Sources:** [Enoki docs](https://docs.enoki.mystenlabs.com/ts-sdk), [HTTP API](https://docs.enoki.mystenlabs.com/http-api), [@mysten/enoki](https://sdk.mystenlabs.com/typedoc/modules/_mysten_enoki.html), [SuiPatron implementation](../../apps/suipatron/)

---

## Executive Summary

The SuiPatron Enoki integration aligns with the documented API and workflow but uses deprecated auth components. The sponsor/execute flow matches the official examples; auth should migrate to the wallet-standard path for long-term support.

| Area | Status | Notes |
|------|--------|-------|
| Sponsor API (createSponsoredTransaction) | ✅ Aligned | Correct params, `sender` + `allowedMoveCallTargets` |
| Execute API (executeSponsoredTransaction) | ✅ Aligned | Correct `digest` + `signature` |
| Transaction building | ✅ Aligned | `tx.build({ client, onlyTransactionKind: true })` |
| Signing flow | ⚠️ Different path | Uses EnokiKeypair directly vs dapp-kit `useSignTransaction` |
| Auth (EnokiFlowProvider) | ⚠️ Deprecated | Docs favor `registerEnokiWallets` + dapp-kit |

---

## 1. Sponsor / Execute Flow

### Official Documentation

From [Enoki SDK Examples](https://docs.enoki.mystenlabs.com/ts-sdk/examples):

1. Build `Transaction` with `onlyTransactionKind: true`
2. Call `createSponsoredTransaction` with `transactionKindBytes` (base64), `sender`, `allowedMoveCallTargets`
3. Return bytes to client; user signs
4. Call `executeSponsoredTransaction` with `digest` and `signature`

### Our Implementation

**Backend** (`apps/suipatron/src/app/api/sponsor/route.ts`):

- ✅ Accepts `transactionKindBytes` and `sender`
- ✅ Uses `allowedMoveCallTargets` (five SuiPatron entry points)
- ✅ Returns `bytes` and `digest` (we map `result.bytes` → `sponsoredTxBytes`)

**Execute** (`apps/suipatron/src/app/api/sponsor/execute/route.ts`):

- ✅ Accepts `digest` and `signature`
- ✅ Uses `enoki.executeSponsoredTransaction({ digest, signature })`

**Frontend** (`apps/suipatron/src/app/lib/sponsor-flow.ts`):

- ✅ Builds transaction with `tx.build({ client, onlyTransactionKind: true })`
- ✅ Uses `toBase64()` for `transactionKindBytes`
- ✅ Signs sponsored bytes with `keypair.signTransaction(bytes)` → `signature`
- ✅ Sends `digest` and `signature` to execute

### Gaps / Recommendations

| Item | Status | Recommendation |
|------|--------|----------------|
| `allowedAddresses` | Not used | Optional; add for `withdraw_earnings` recipient if needed (see HTTP API). |
| Base64 encoding | Correct | `@mysten/bcs` `toBase64` / `fromBase64` are the right helpers. |

---

## 2. Auth Flow

### Official Recommendation

Current docs prefer:

- `registerEnokiWallets` for wallet-standard integration
- dapp-kit: `SuiClientProvider`, `WalletProvider`, `ConnectButton` / `useConnectWallet`
- OAuth via popup (not full-page redirect)

### Our Implementation

- Uses **`EnokiFlowProvider`** and **`useEnokiFlow`**
- Full-page redirect flow: `createAuthorizationURL` → Google → `/auth/callback` → `handleAuthCallback`

### Deprecation

From `@mysten/enoki` CHANGELOG:

> `132e67d: Add registerEnokiWallets for better compatibility with the wallet-standard and dApp-kit`  
> `132e67d: Deprecate EnokiFlow and remove sponsorship and execution from the EnokiFlow class`

- `EnokiFlowProvider` and `useEnokiFlow` are deprecated but still usable
- Sponsorship and execution were removed from EnokiFlow; we correctly use `EnokiClient` on the backend and `EnokiKeypair.signTransaction` on the client

### Recommendation

For long-term support, plan a migration to:

1. `registerEnokiWallets` with `SuiClientProvider` and `WalletProvider`
2. `ConnectButton` or custom buttons via `useConnectWallet` and `useWallets`
3. Popup OAuth instead of full-page redirect (if desired)

---

## 3. Signing

### Official Example

From [Enoki SDK Examples](https://docs.enoki.mystenlabs.com/ts-sdk/examples):

```ts
import { useSignTransaction } from '@mysten/dapp-kit';

const { mutateAsync: signTransaction } = useSignTransaction();
const { signature } = await signTransaction({ transaction: bytes });
```

### Our Implementation

```ts
const keypair = await enoki.getKeypair();
const result = await keypair.signTransaction(sponsoredTxBytesU8);
// result.signature is serialized base64 string
```

### Assessment

- `EnokiKeypair.signTransaction(bytes)` returns `SignatureWithBytes` with `signature` and `bytes`
- Our use of `result.signature` matches what `executeSponsoredTransaction` expects
- The Enoki docs use dapp-kit’s `useSignTransaction`, which ultimately calls the same underlying signer
- Our approach is valid and does not require dapp-kit

---

## 4. PTB Builders

### Documentation

- [PTB-SPECIFICATION.md](../architecture/PTB-SPECIFICATION.md)
- [@mysten/sui Transaction](https://sdk.mystenlabs.com/typedoc/classes/_mysten_sui.transactions.Transaction.html)

### Our Implementation

| Builder | Move target | Assessment |
|---------|-------------|------------|
| `buildCreateProfileTx` | `{pkg}::suipatron::create_profile` | ✅ Matches spec |
| `buildPurchaseAccessTx` | `{pkg}::suipatron::purchase_access` | ✅ Uses `splitCoins(tx.gas, [priceMist])` |
| `buildWithdrawEarningsTx` | `{pkg}::suipatron::withdraw_earnings` | ✅ Matches spec |
| `buildUpdateProfileTx` | `{pkg}::suipatron::update_profile` | ✅ Uses `tx.pure.option()` |
| `buildPublishContentTx` | `{pkg}::suipatron::publish_content` | ✅ Matches spec |

- Clock: `0x6` is correct for SUI Clock
- `tx.object()` for shared / owned objects
- `tx.pure.u64()`, `tx.pure.string()`, `tx.pure.option()` used appropriately

---

## 5. HTTP API Mapping

From [Enoki OpenAPI](https://docs.enoki.mystenlabs.com/http-api/openapi):

| Endpoint | Method | Our Usage |
|----------|--------|-----------|
| `POST /v1/transaction-blocks/sponsor` | Body: `transactionBlockKindBytes`, `network`; optionally `sender`, `allowedMoveCallTargets`, `allowedAddresses` | ✅ EnokiClient covers this |
| `POST /v1/transaction-blocks/sponsor/{digest}` | Body: `signature` | ✅ EnokiClient covers this |
| Auth | `Authorization: Bearer {API_KEY}` | ✅ EnokiClient uses `apiKey` in config |

---

## 6. Security

| Concern | Status |
|---------|--------|
| `ENOKI_SECRET_KEY` server-side only | ✅ Used only in API routes |
| `allowedMoveCallTargets` restrict Move calls | ✅ Only SuiPatron entry points |
| No JWT in backend | ✅ Using `sender` + targets; no JWT in API |
| Signature format | ✅ Base64 serialized signature from `signTransaction` |

---

## 7. Open Source Comparison

### [saajand/SUI-ZKLogin-Enoki](https://github.com/saajand/SUI-ZKLogin-Enoki)

- Uses zkLogin with Enoki for salts and proofs
- Implements sponsored transactions via a self-owned wallet workaround due to Enoki limitations at the time
- SuiPatron uses Enoki’s native sponsored transaction APIs, which are the current supported path

### Mysten Labs SDK Examples

- Backend: EnokiClient, `createSponsoredTransaction`, `executeSponsoredTransaction`
- Client: dapp-kit + `useSignTransaction` for signing
- Our backend flow matches; our client uses EnokiKeypair directly, which is equivalent for zkLogin signing

---

## 8. Findings Summary

### ✅ Correct

1. Sponsor/execute flow and API usage
2. Transaction building with `onlyTransactionKind: true`
3. Base64 encoding for transaction bytes and signatures
4. Allowed Move call targets
5. Server-side secret handling
6. PTB builders vs Move contract spec

### ⚠️ Consider

1. **Auth deprecation** – Migrate to `registerEnokiWallets` and dapp-kit when feasible
2. **allowedAddresses** – Add if you need stricter control for transfer recipients (e.g. withdraw)
3. **Error handling** – Add more specific handling for Enoki HTTP errors (rate limits, invalid keys, etc.)
4. **User confirmation** – Official docs suggest explicit UX before signing (e.g. “You are about to…”); current modals cover this but could be made more explicit

### ❌ No Critical Issues

No blocking API misuse or security issues identified.

---

## 9. References

- [Enoki TypeScript SDK](https://docs.enoki.mystenlabs.com/ts-sdk)
- [Sponsored Transactions](https://docs.enoki.mystenlabs.com/ts-sdk/sponsored-transactions)
- [Enoki SDK Examples](https://docs.enoki.mystenlabs.com/ts-sdk/examples)
- [Register Enoki Wallets](https://docs.enoki.mystenlabs.com/ts-sdk/register)
- [Sign in with Enoki](https://docs.enoki.mystenlabs.com/ts-sdk/sign-in)
- [Enoki HTTP API](https://docs.enoki.mystenlabs.com/http-api)
- [Enoki OpenAPI](https://docs.enoki.mystenlabs.com/http-api/openapi)
- [@mysten/enoki API](https://sdk.mystenlabs.com/typedoc/modules/_mysten_enoki.html)
