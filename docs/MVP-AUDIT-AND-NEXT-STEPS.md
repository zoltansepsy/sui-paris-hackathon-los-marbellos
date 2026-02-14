# SuiPatron MVP — Code & Docs Audit + Probability Analysis

**Date:** 2026-02-14  
**Purpose:** Single source of truth for where the MVP stands and what to do next.  
**References:** `docs/SCOPE.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/suipatron/01-product-breakdown-and-roadmap.md`, `CLAUDE.md`.

---

## 1. Executive Summary

| Area | Completion (prob.) | One-line |
|------|--------------------|----------|
| **Smart contracts** | **~98%** | Deployed, tested; IDs in code may need verification. |
| **Auth & sponsor** | **~95%** | Enoki zkLogin + sponsor flow wired; Portal setup manual. |
| **On-chain reads & PTBs** | **~95%** | Creator/content/AccessPass services + PTBs used in UI. |
| **Core UI flows** | **~70%** | Create profile, support, withdraw work; upload/decrypt/feed partial. |
| **SEAL + Walrus** | **~60%** | Services + hooks exist; not wired in upload modal or content viewer. |
| **Indexer & APIs** | **~85%** | Implemented; Explore uses on-chain, not indexer. |
| **SuiNS** | **~10%** | No backend endpoint; UI is local-only mock. |
| **Demo polish** | **~30%** | No seed data, no integration tests, no demo script. |

**Overall MVP readiness (probability): ~72%** — Core “sign in → create profile → support → withdraw” works. Gaps: content upload (real file → chain), encrypted content view (SEAL decrypt in UI), feed content aggregation, SuiNS, and demo prep.

---

## 2. Audit by Layer

### 2.1 Smart Contracts (A1–A8, A9, A13)

| Item | Status | Evidence |
|------|--------|----------|
| Move package (Platform, CreatorProfile, AccessPass, Content, seal_policy, events) | Done | `packages/blockchain/contracts/sources/`, 18/18 tests pass |
| Deploy to Testnet | Done | IMPLEMENTATION_STATUS lists Package ID & Platform ID |
| Version + migrate | Done | VERSION, migrate() in suipatron.move |

**Note:** `docs/IMPLEMENTATION_STATUS.md` lists different Package/Platform IDs than `packages/blockchain/sdk/networkConfig.ts`. **Action:** Confirm which deploy is canonical and align both (env + Enoki Portal allowed targets).

**Probability:** ~98% (only ID alignment and smoke test remain).

---

### 2.2 Auth & Enoki (P1–P2, Z4)

| Item | Status | Evidence |
|------|--------|----------|
| Google zkLogin (Enoki) | Done | `auth-context.tsx`, `enoki-provider.tsx`, network in createAuthorizationURL |
| Auth callback | Done | `/auth/callback`, AuthCallback page |
| Mock auth when Enoki not configured | Done | MockAuthProvider in auth-context |
| Enoki Portal (app, OAuth, redirects, allowed targets) | Manual | Docs; not in repo |

**Probability:** ~95% (app code complete; Portal and env vars are operator tasks).

---

### 2.3 Backend / Serverless (A10–A12)

| Endpoint / component | Status | Evidence |
|----------------------|--------|----------|
| `POST /api/sponsor` | Done | `apps/suipatron/src/app/api/sponsor/route.ts` |
| `POST /api/sponsor/execute` | Done | `apps/suipatron/src/app/api/sponsor/execute/route.ts` |
| `GET /api/creators` | Done | Uses indexer store `getCreators` |
| `GET /api/creator/:id` | Done | Uses indexer store (creator + content) |
| `GET /api/events` | Done | Triggers indexer run (poll events → store) |
| Event indexer (poll + store) | Done | `lib/indexer/run.ts`, store-supabase, get-store |
| Indexer persistence | Done | Supabase when env set; else in-memory |
| `POST /api/subname` | Not implemented | No route; SuiNS not in repo |

**Probability:** ~85% (indexer + creator APIs done; subname missing).

---

### 2.4 PTBs & Sponsor Flow (P3–P5, P13)

| Item | Status | Evidence |
|------|--------|----------|
| buildCreateProfileTx | Done | `lib/ptb/index.ts`, used by CreateProfileForm |
| buildPurchaseAccessTx | Done | Used by SupportModal |
| buildWithdrawEarningsTx | Done | Used by WithdrawButton |
| buildUpdateProfileTx | Done | In ptb; not used in Dashboard (profile edit is local only) |
| buildPublishContentTx | Done | In ptb + transactionService |
| useSponsorTransaction + sponsor flow | Done | `use-sponsor-transaction.ts`, `sponsor-flow.ts` |
| getCreatedProfileFromTx | Done | CreateProfileForm reads profile/cap from tx result |

**Probability:** ~95%.

---

### 2.5 On-Chain Reads & Services (P14, P3–P14 integration)

| Item | Status | Evidence |
|------|--------|----------|
| CreatorService (getCreatorProfile, getCreatorProfiles, getContentList, getCreatorByOwner, getCreatorCapByOwner) | Done | `services/creatorService.ts` — events + multiGetObjects + dynamic fields |
| AccessPassService (getAccessPassesByOwner, getAccessPassForCreator) | Done | `services/accessPassService.ts` |
| useCreatorProfile, useCreatorProfiles, useContentList, useMyCreatorProfile, useMyCreatorCap | Done | `hooks/useCreator.ts` |
| useMyAccessPasses, useHasAccess | Done | `hooks/useAccessPass.ts` |
| Explore data source | On-chain | useCreatorProfiles() → event-based discovery (not GET /api/creators) |

**Probability:** ~95%.

---

### 2.6 SEAL + Walrus (P6–P11)

| Item | Status | Evidence |
|------|--------|----------|
| SealService (encrypt, decrypt, createSessionKey) | Done | `services/sealService.ts` |
| WalrusService (upload flow, download) | Done | `services/walrusService.ts` |
| ContentService (uploadContent SEAL+Walrus, uploadContentUnencrypted, downloadContent) | Done | `services/contentService.ts` |
| useContentUpload (encrypted) | Done | `hooks/useContent.ts` — not used in UI |
| useContentUploadUnencrypted | Done | Not used in UI |
| useContentDecrypt | Done | Not used in ContentCard |
| useWalrusDownload | Done | Used by ContentCard for **unencrypted** blobs only |
| Dashboard “Add Content” modal | UI only | No file input state, no useContentUpload/Unencrypted; “Publish” only toasts |
| ContentCard for encrypted content | Missing | Only Walrus download; no SEAL decrypt, no session key, no AccessPass |

**Conclusion:** SEAL encrypt + Walrus upload + publish_content and SEAL decrypt are implemented in services/hooks but **not wired** in the UI. ContentCard assumes public blobs (e.g. unencrypted MVP path).

**Probability:** ~60% (backend/hooks ready; UI wiring ~0% for full SEAL path).

---

### 2.7 UI Pages & Flows (J1–J13)

| Page / flow | Status | Notes |
|-------------|--------|--------|
| Landing | Done | CTA, sign-in |
| Explore | Done | useCreatorProfiles (on-chain), search, creator cards |
| Creator profile | Done | useCreatorProfile, useContentList, useHasAccess; SupportModal (sponsor); fallback mock |
| Support modal | Done | buildPurchaseAccessTx + useSponsorTransaction; addAccessPass (local) |
| Dashboard shell | Done | CreateProfileForm, WithdrawButton (both sponsor), earnings UI |
| Create profile | Done | On-chain via sponsor |
| Withdraw | Done | On-chain via sponsor |
| Profile edit (name, bio, price) | Local only | updateUser(); no update_profile PTB in Dashboard |
| Content upload | Not wired | Modal present; no file picker → Walrus/SEAL/publish_content |
| Content viewer | Partial | ContentCard: Walrus download when !isLocked; no SEAL decrypt |
| Feed | Partial | useMyAccessPasses, supported creators; **feedContent = []** (no aggregation of content from supported creators) |
| SuiNS claim | Mock | Modal; handleClaimSuiNS only updates local user state; no /api/subname |
| Loading / empty / error | Partial | LoadingState, some toasts; not comprehensive |

**Probability:** ~70% (critical paths work; upload, decrypt, feed content, SuiNS missing or mock).

---

### 2.8 Docs vs Code

| Doc | Accuracy | Notes |
|-----|----------|--------|
| IMPLEMENTATION_STATUS.md | Partially outdated | References `apps/dapp/`; app is `apps/suipatron/`. Checkboxes for “Wire Explore to GET /api/creators” — Explore uses on-chain, not API. SEAL/Walrus items say “[ ]” but services exist; UI wiring is what’s missing. |
| PBS (01-product-breakdown-and-roadmap.md) | Outdated | Many “[ ]” for P1–P14, J1–J13; several are done in code. |
| SCOPE.md | Authoritative | Matches architecture and MVP scope. |
| CLAUDE.md | Minor | Says “Vite” for frontend; app is Next.js. |

---

## 3. Probability Summary Table

| Capability | P(ready for demo) | Blocker / next step |
|------------|-------------------|----------------------|
| Sign in with Google | 95% | Enoki Portal + env |
| Create creator profile (on-chain) | 95% | Verify Package ID in Enoki allowed targets |
| Support creator (pay + AccessPass) | 95% | None |
| Withdraw earnings | 95% | None |
| Browse creators (Explore) | 95% | None (on-chain) |
| View creator page + content list | 90% | None |
| View **unencrypted** content (e.g. public blob) | 85% | ContentCard + useWalrusDownload work |
| View **encrypted** content (SEAL decrypt) | 25% | Wire useContentDecrypt + session key + AccessPass in ContentCard |
| Upload content (file → chain) | 20% | Wire file picker + useContentUploadUnencrypted (or useContentUpload) in Dashboard modal |
| Feed with real content from supported creators | 40% | feedContent is []; aggregate content from supportedCreators |
| SuiNS subname | 10% | Implement POST /api/subname + Enoki subname API; wire modal |
| Indexer as primary discovery | 85% | Implemented; optional (Explore uses on-chain) |
| Demo seed data + script | 30% | Not started |

---

## 4. Recommended Next Steps (Priority Order)

### P0 — Must-have for MVP demo

1. **Wire content upload in Dashboard**  
   - In “Add Content” modal: file input, title, description, content type.  
   - Call `useContentUploadUnencrypted` (or `useContentUpload` if you want SEAL) with creator profile/cap from auth.  
   - On success: refetch content list (or invalidate query) and close modal.  
   - **Probability after:** upload ~90%.

2. **Wire encrypted content view (optional but high value)**  
   - In ContentCard (or dedicated viewer): when content is locked but user has AccessPass, offer “View” → useContentDecrypt(blobId, sessionKey, accessPassId) then render (image/text/PDF).  
   - Ensure session key creation (e.g. useContentDecrypt’s flow) runs with current wallet/Enoki.  
   - **Probability after:** encrypted view ~85%.

3. **Feed content aggregation**  
   - Replace `feedContent = []` with: for each supportedCreator, fetch content (useContentList or batch); flatten and sort; show in “Latest Content” with creator attribution.  
   - **Probability after:** feed ~85%.

4. **Verify deployment and env**  
   - Confirm Package ID and Platform ID in `networkConfig.ts` (and .env) match the deployed package.  
   - Confirm Enoki Portal has these Move targets allowed for sponsorship.  
   - Smoke test: create profile, support, withdraw on testnet.

### P1 — Should-have for polish

5. **Dashboard profile edit on-chain**  
   - Wire “Save” in profile edit to buildUpdateProfileTx + useSponsorTransaction (optional for MVP if create profile is enough).

6. **Use indexer for Explore (optional)**  
   - Switch Explore to GET /api/creators with cursor if you want indexer as source of truth; or keep on-chain and add cron for indexer so /api/creators stays warm for other clients.

7. **Loading and error states**  
   - Consistent LoadingState/skeletons and error toasts on all critical flows.

### P2 — Nice-to-have

8. **SuiNS**  
   - Register domain; implement POST /api/subname (Enoki subname API); wire “Claim Name” to it.

9. **Demo prep**  
   - Seed 3+ creators, 5+ content items; 3-minute script; backup recording.

---

## 5. Quick Reference: Key Files

| Purpose | Path |
|--------|------|
| Auth (Enoki + mock) | `apps/suipatron/src/app/lib/auth-context.tsx`, `enoki-provider.tsx` |
| Sponsor flow | `apps/suipatron/src/app/lib/sponsor-flow.ts`, `use-sponsor-transaction.ts` |
| PTBs | `apps/suipatron/src/app/lib/ptb/index.ts` |
| Creator/content on-chain | `apps/suipatron/src/app/services/creatorService.ts`, `hooks/useCreator.ts` |
| AccessPass | `apps/suipatron/src/app/services/accessPassService.ts`, `hooks/useAccessPass.ts` |
| SEAL + Walrus + content | `apps/suipatron/src/app/services/contentService.ts`, `sealService.ts`, `walrusService.ts` |
| Content hooks (upload/decrypt) | `apps/suipatron/src/app/hooks/useContent.ts` |
| Indexer | `apps/suipatron/src/app/lib/indexer/run.ts`, get-store, store-supabase |
| Explore | `apps/suipatron/src/app/pages/Explore.tsx` |
| Creator profile + Support | `apps/suipatron/src/app/pages/CreatorProfile.tsx`, `SupportModal.tsx` |
| Dashboard + Create/Withdraw | `apps/suipatron/src/app/pages/Dashboard.tsx`, `CreateProfileForm.tsx`, `WithdrawButton.tsx` |
| Content display | `apps/suipatron/src/app/components/ContentCard.tsx` |
| Network config | `packages/blockchain/sdk/networkConfig.ts` |

---

## 6. Doc Updates Suggested

- **IMPLEMENTATION_STATUS.md:** Replace `apps/dapp/` with `apps/suipatron/`; update “Remaining” so SEAL/Walrus show “services + hooks done, UI wiring remaining”; mark “Wire Explore to GET /api/creators” as N/A (Explore uses on-chain) or “optional”.
- **PBS (01-product-breakdown-and-roadmap.md):** Refresh [x]/[ ] from this audit so P1–P2, P3–P5, P13–P14, J1–J7 and part of J9–J10 reflect current code.
- **CLAUDE.md:** Set frontend to Next.js (not Vite) and point to this audit for “where we are” and “next steps”.

---

*End of audit. Use this document to prioritise MVP work and keep IMPLEMENTATION_STATUS and PBS in sync with the codebase.*
