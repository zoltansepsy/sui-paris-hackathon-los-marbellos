# SuiPatron — Full-Stack Real Audit

**Date:** 2026-02-14  
**Scope:** PTBs, APIs, SUI stack, blockchain, frontend — integration and gaps.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js, React)                                                │
│  Pages: Landing, Explore, CreatorProfile, Dashboard, Feed                │
│  Hooks: useCreator, useAccessPass, useContent, useSponsorTransaction    │
│  PTB source: lib/ptb (CreateProfile, Support, Withdraw) +                │
│             transactionService (contentService → publish_content)       │
└─────────────────────────────────────────────────────────────────────────┘
        │                    │                         │
        │ sponsor flow       │ on-chain reads          │ content upload/decrypt
        ▼                    ▼                         ▼
┌───────────────┐   ┌──────────────────┐   ┌─────────────────────────────┐
│ POST /api/    │   │ creatorService   │   │ useContentUploadUnencrypted  │
│ sponsor       │   │ (RPC: events,    │   │ useContentDecrypt           │
│ execute       │   │  multiGetObjects,│   │ → useSuiClient,             │
│ → Enoki       │   │  getDynamicFields)│   │   useCurrentAccount,       │
└───────────────┘   └──────────────────┘   │   useSignAndExecuteTransaction
        │                    │             └─────────────────────────────┘
        │                    │                         │
        ▼                    │                         │
┌───────────────┐            │             ┌───────────▼───────────┐
│ Enoki API     │            │             │ dapp-kit (wallet)     │
│ (sponsor +    │            │             │ SuiClientProvider,    │
│  execute)     │            │             │ WalletProvider       │
└───────────────┘            │             └───────────────────────┘
        │                    │
        ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SUI CHAIN (testnet) — Move: suipatron, seal_policy                       │
│  create_profile, update_profile, publish_content, purchase_access,      │
│  withdraw_earnings, seal_approve                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ API (indexer-based) — UNUSED BY FRONTEND                                │
│  GET /api/creators  → getIndexerStore().getCreators()                    │
│  GET /api/creator/:id → getIndexerStore().getCreator(), getContent...   │
│  GET /api/events   → runIndexer() (cron)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PTB Audit

### 2.1 Move Entry Points (Contract)

| Entry function        | Module        | Status |
|-----------------------|---------------|--------|
| `create_profile`      | suipatron     | ✅     |
| `update_profile`      | suipatron     | ✅     |
| `publish_content`     | suipatron     | ✅     |
| `purchase_access`     | suipatron     | ✅     |
| `withdraw_earnings`   | suipatron     | ✅     |
| `seal_approve`        | seal_policy   | ✅     |

### 2.2 PTB Builders — Two Sources (Gap Risk)

| PTB                  | Source 1: `lib/ptb/index.ts`     | Source 2: `services/transactionService.ts` |
|----------------------|-----------------------------------|-------------------------------------------|
| create_profile       | ✅ Used by CreateProfileForm      | ✅ Used by useTransactions (not used by UI) |
| update_profile       | ✅ Def exists                     | ✅ Used by useTransactions only           |
| purchase_access      | ✅ Used by SupportModal           | ✅ In txService                           |
| withdraw_earnings    | ✅ Used by WithdrawButton         | ✅ In txService                           |
| publish_content      | ✅ Def exists                     | ✅ Used by contentService.uploadContent(Unencrypted) |

**ID source:**

- **lib/ptb:** `process.env.NEXT_PUBLIC_PACKAGE_ID` / `VITE_PACKAGE_ID`, same for platform. Throws if missing.
- **transactionService:** Receives `packageId`, `platformId` from caller (useContent, useTransactions get them from `useNetworkVariable` from `@hack/blockchain/sdk/networkConfig`).
- **Enoki server:** `getAllowedMoveCallTargets()` uses `NEXT_PUBLIC_PACKAGE_ID` or `PACKAGE_ID`.

**Gap:** Package/platform IDs can come from (1) env in ptb + enoki-server, or (2) `networkConfig` (testnet hardcoded in `packages/blockchain/sdk/networkConfig.ts`). If env is set to a different deploy than networkConfig, sponsor and frontend PTBs can disagree. **Recommendation:** Single source of truth (e.g. env) and have networkConfig read from env or document that production must set env to match networkConfig.

### 2.3 Who Uses Which PTB Path

| User action           | UI component / hook           | PTB source     | Execution path              |
|-----------------------|------------------------------|----------------|-----------------------------|
| Create profile        | CreateProfileForm            | lib/ptb        | useSponsorTransaction → API |
| Purchase access       | SupportModal                 | lib/ptb        | useSponsorTransaction → API |
| Withdraw              | WithdrawButton               | lib/ptb        | useSponsorTransaction → API |
| Publish content       | Dashboard (Add Content)      | transactionService (via contentService) | useContentUploadUnencrypted → **useSignAndExecuteTransaction** (wallet) |
| Update profile        | —                            | —              | **Not wired:** Dashboard only calls updateUser() (local state) |

**Critical gap:** Content upload (and encrypted upload) use **wallet sign** (`useSignAndExecuteTransaction`, `useCurrentAccount`). The app’s primary auth is **Enoki zkLogin**; there is no integration that sets dapp-kit’s “current account” to the zkLogin address. So for **zkLogin-only users**, `useCurrentAccount()` is **null** → content upload and content decrypt will throw “Wallet not connected.” Create profile / purchase / withdraw work because they use the **sponsor flow** (Enoki keypair signs, no dapp-kit account needed).

---

## 3. API Layer Audit

| Endpoint                 | Implementation              | Used by frontend? | Notes |
|--------------------------|----------------------------|-------------------|--------|
| POST /api/sponsor        | enoki-server, getAllowedMoveCallTargets | ✅ Yes (sponsor-flow.ts) | Requires ENOKI_SECRET_KEY |
| POST /api/sponsor/execute| Enoki executeSponsoredTransaction | ✅ Yes | |
| GET /api/creators        | getCreators() → indexer store | ❌ **No** | Explore uses useCreatorProfiles() → on-chain events |
| GET /api/creator/:id     | getCreator(), getContentByProfile() → indexer store | ❌ **No** | CreatorProfile uses useCreatorProfile(id), useContentList(id) → on-chain |
| GET /api/events          | runIndexer()               | Cron / manual only | No frontend call; indexer populates store for API only |

**Gap:** **Indexer and GET /api/creators and GET /api/creator/:id are not integrated with the frontend.** All discovery and profile/content data in the app come from **on-chain** (creatorService, RPC). The indexer is only useful if you later switch Explore or CreatorProfile to use the API (e.g. for pagination, search, or performance).

---

## 4. SUI Stack Integration

| Component        | Role | Used by | Integrated? |
|------------------|------|---------|-------------|
| @mysten/sui      | RPC, transactions, BCS | creatorService, sponsor-flow, contentService, indexer | ✅ |
| @mysten/dapp-kit | SuiClientProvider, WalletProvider, useSuiClient, useCurrentAccount, useSignAndExecuteTransaction | useCreator, useAccessPass, useContent, useTransactions | ⚠️ Partial |
| @mysten/enoki    | zkLogin, sponsor (keypair sign) | auth-context, use-sponsor-transaction, API sponsor/execute | ✅ |
| @mysten/seal     | Encrypt/decrypt, session key | sealService, contentService, useContentDecrypt | ✅ (but decrypt path uses wallet account) |
| @mysten/walrus   | Upload/download blobs | walrusService, contentService | ✅ |

**Gap:** dapp-kit is used for **RPC (useSuiClient)** and **wallet sign (useCurrentAccount, useSignAndExecuteTransaction)**. zkLogin users do not have a “connected wallet” in dapp-kit; Enoki is separate. So any flow that relies on `useCurrentAccount()` or `useSignAndExecuteTransaction()` fails for zkLogin-only users (content upload, content decrypt, and useSuiPatronTransactions if it were used).

---

## 5. Blockchain (Move) vs Frontend/API

| Contract type / event | Frontend / API usage |
|-----------------------|----------------------|
| Platform              | lib/ptb, transactionService, enoki-server (allowed targets) |
| CreatorProfile        | creatorService (getObject, events), indexer (after run) |
| Content (DOF)         | creatorService.getContentList (dynamic fields), indexer |
| AccessPass            | accessPassService, useHasAccess |
| CreatorCap            | creatorService.getCreatorCapByOwner |
| ProfileCreated        | creatorService.getCreatorProfiles (Explore), indexer |
| ContentPublished, etc.| indexer only |

**Aligned.** Move API and frontend/API usage match.

---

## 6. Identified Gaps (Summary)

### Critical (breaks zkLogin users)

1. **Content upload and decrypt use wallet path**  
   - `useContentUploadUnencrypted` and `useContentDecrypt` use `useCurrentAccount()` and `useSignAndExecuteTransaction()`.  
   - For zkLogin-only users, `useCurrentAccount()` is null → “Wallet not connected” and no content upload/decrypt.  
   - **Fix:** Use sponsor flow for `publish_content` (and Walrus certify if needed), and/or integrate Enoki keypair as dapp-kit “account” so the same account is used for sign.

### High (inconsistent or unused)

2. **Dual PTB/ID sources**  
   - lib/ptb uses env; transactionService (and hooks) use networkConfig. Risk of mismatch if env and networkConfig differ.  
   - **Fix:** Single source (e.g. env) and document; or have networkConfig read from env.

3. **Dashboard profile edit not on-chain**  
   - `handleSaveProfile` only calls `updateUser()` (local state). `buildUpdateProfileTx` exists (lib/ptb + transactionService) but is not called from Dashboard.  
   - **Fix:** Call sponsor flow (or wallet path if you add wallet integration) with buildUpdateProfileTx and persist name/bio/price on-chain.

4. **Indexer and creator API unused**  
   - GET /api/creators and GET /api/creator/:id are not called by any page. Explore and CreatorProfile use on-chain only.  
   - **Fix:** Either wire Explore/CreatorProfile to the API (e.g. for scale/search) or document that indexer is for future use/cron consumers only.

### Medium (cleanup / clarity)

5. **useSuiPatronTransactions unused**  
   - Wallet-based (useSignAndExecuteTransaction, useCurrentAccount). No component uses it; CreateProfileForm, SupportModal, WithdrawButton use lib/ptb + useSponsorTransaction.  
   - **Fix:** Remove or clearly mark as “wallet-only” and add sponsor-based alternative if needed.

6. **transactionService price type**  
   - buildPurchaseAccessTx(profileId, price: number); Move expects u64 MIST. Callers must pass MIST. lib/ptb uses bigint.  
   - **Fix:** Use bigint in transactionService for price or document that price is in MIST.

### Low

7. **seal_approve**  
   - Not built in the app; SEAL key servers call it. No gap if key servers are external and correct.

8. **POST /api/subname**  
   - Not implemented (SuiNS). Documented as remaining.

---

## 7. Layer Integration Matrix

| Layer        | Blockchain | SUI stack (Enoki, dapp-kit, SEAL, Walrus) | API | Frontend |
|-------------|------------|-------------------------------------------|-----|----------|
| Create profile | ✅ PTB + sponsor | ✅ Enoki | ✅ sponsor/execute | ✅ CreateProfileForm |
| Purchase access | ✅ PTB + sponsor | ✅ Enoki | ✅ sponsor/execute | ✅ SupportModal |
| Withdraw    | ✅ PTB + sponsor | ✅ Enoki | ✅ sponsor/execute | ✅ WithdrawButton |
| Publish content | ✅ PTB | ⚠️ Wallet sign (breaks zkLogin) | — | ✅ Dashboard modal |
| Update profile | ✅ PTB exists | — | — | ❌ Not wired |
| Content decrypt | — | ⚠️ Wallet account (breaks zkLogin) | — | ✅ EncryptedContentViewer |
| Explore     | ✅ events + RPC | ✅ useSuiClient | ❌ API not used | ✅ useCreatorProfiles |
| Creator profile page | ✅ RPC + DOF | ✅ useSuiClient | ❌ API not used | ✅ useCreatorProfile, useContentList |
| Indexer     | ✅ events | ✅ RPC in run | ✅ GET /api/events | ❌ No frontend consumer |

---

## 8. Recommendations (Priority)

1. **Use sponsor flow for publish_content** (and ensure Walrus certify step is compatible with sponsor if required) so zkLogin users can upload content without a connected wallet.
2. **Use Enoki keypair for content decrypt** (e.g. session key creation and signing) so zkLogin users can open encrypted content without useCurrentAccount.
3. **Wire Dashboard profile edit** to buildUpdateProfileTx + sponsor (or same execution path as other creator actions).
4. **Single source for package/platform IDs** (env or networkConfig), and align enoki-server, lib/ptb, and hooks.
5. **Either** wire Explore/CreatorProfile to GET /api/creators and GET /api/creator/:id **or** document that the app is on-chain-only and indexer is for future/cron.
6. Remove or repurpose useSuiPatronTransactions and clarify “wallet vs zkLogin” in docs.

---

## 9. PRPs / Docs

- **PRPs:** `docs/PRPs/` — PRD/plan structure; PRDs for PTB builders, frontend integration, backend indexer. No direct “gap list” in PRPs; this audit supplements them.
- **PTB spec:** `docs/architecture/PTB-SPECIFICATION.md` — Matches lib/ptb and Move; update if you add sponsor-based publish_content flow.
- **Implementation status:** `docs/IMPLEMENTATION_STATUS.md` — Update “Remaining” with: content upload/decrypt zkLogin gap, profile edit on-chain, indexer unused by frontend.

This audit is the single place that ties PTBs, APIs, SUI stack, and frontend into one integration view and lists concrete gaps and fixes.

---

## 10. Remediation Applied (2026-02-14)

| Gap | Fix |
|-----|-----|
| Content upload/decrypt for zkLogin | `useContentUploadUnencrypted`: when `walletAddress && !account`, Walrus steps use `executeWithEnokiKeypair`, publish_content uses `sponsorAndExecute`. `useContentDecrypt`: session key uses Enoki keypair for personal message when zkLogin. |
| Dashboard profile edit not on-chain | `handleSaveProfile` now calls `buildUpdateProfileTx` + `useSponsorTransaction().execute()` so name/bio/price persist on-chain. |
| Single source for package/platform IDs | `packages/blockchain/sdk/networkConfig.ts` prefers `NEXT_PUBLIC_PACKAGE_ID` / `NEXT_PUBLIC_PLATFORM_ID` when set; app lib/ptb and enoki-server already use env. |
| Indexer unused by frontend | Documented in IMPLEMENTATION_STATUS.md (Explore and Creator Profile use on-chain only; indexer for future/cron). |
| useSuiPatronTransactions | Export removed from hooks/index.ts; deprecation comment added in useTransactions.ts. |
