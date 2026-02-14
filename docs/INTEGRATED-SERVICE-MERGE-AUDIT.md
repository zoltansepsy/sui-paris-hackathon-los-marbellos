# Branch audit: zoltan/integrated-service vs main

**Date:** February 14, 2025  
**Purpose:** Analyse Alex’s integration work on `origin/zoltan/integrated-service`, cross-reference with `main`, and define how to merge.

---

## 1. Branch overview

| Branch | Common ancestor | Commits since |
|--------|-----------------|---------------|
| **main** | `a5f0356` | 12 (Enoki PR, dapp removal, Vercel, Turbo/Next, Enoki 403 fix) |
| **origin/zoltan/integrated-service** | `a5f0356` | 7 (service layer, SEAL/Walrus integration) |

Both branches **delete `apps/dapp`**. They diverged at the same base, so merge is a matter of combining features and resolving conflicts.

---

## 2. What’s on zoltan/integrated-service (Alex’s work)

### 2.1 Commits (oldest → newest)

1. **f160681** — MVP service layer  
2. **fc52e5b** — Architecture doc  
3. **a894dab** — Merge service layer from mvp-service (lockfile)  
4. **756a115** — Integrated UI with service layer  
5. **1c9cd42** — SEAL integration (encrypted/decrypted demo buttons)  
6. **5d3dfd9** — SEAL + Walrus integration (demo buttons, upload)  
7. **852128f** — Use unencrypted upload for creator preview (SEAL architecture complete)

### 2.2 Service layer (new in suipatron)

**Services** (`apps/suipatron/src/app/services/`):

- `creatorService` — creator profile / content listing  
- `contentService` — content CRUD, config  
- `accessPassService` — access passes, has-access checks  
- `transactionService` — transaction building/execution  
- `walrusService` — Walrus upload/download  
- `sealService` — SEAL encrypt/decrypt  

**Hooks** (`apps/suipatron/src/app/hooks/`):

- `useCreator` — useCreatorProfile, useCreatorProfiles, useMyCreatorProfile, useMyCreatorCap, useContentList  
- `useAccessPass` — useMyAccessPasses, useHasAccess  
- `useTransactions` — useSuiPatronTransactions  
- `useContent` — useContentUpload, useContentDecrypt  

**Supporting additions:**

- `constants.ts` — app/chain constants  
- `adapters.ts` — adapters between services and UI  
- `suiClient.ts` — SUI client setup  
- `types/onchain.ts` — on-chain types  
- `providers.tsx` — dapp-kit/SuiClient providers (from former dapp)  

**Pages wired to services:**

- Explore, Feed, CreatorProfile, Dashboard — use hooks/services instead of raw mock data.  
- SupportModal — wired to services (no Enoki sponsor on this branch).

**Auth on integrated-service:** dapp-kit (wallet: `useCurrentAccount`, `useDisconnectWallet`). No zkLogin, no sponsor API.

**SEAL/Walrus:** Demo flows for encrypt/decrypt and upload; creator preview uses unencrypted upload per last commit.

---

## 3. What’s on main (current)

- **Enoki zkLogin** — Google sign-in, `auth-context` + `enoki-provider`, network passed to auth URL.  
- **Sponsor flow** — `POST /api/sponsor`, `POST /api/sponsor/execute`, `enoki-server`, PTB builders, `sponsor-flow.ts`, `use-sponsor-transaction`.  
- **Real on-chain UI** — CreateProfileForm, WithdrawButton, SupportModal (purchase) via PTB + sponsor.  
- **No service layer** — components call PTB + sponsor API directly; Explore/Feed/CreatorProfile use mock data.  
- **No dapp** — `apps/dapp` removed; monorepo is suipatron only.  
- **Vercel/Turbo** — vercel.json, VERCEL.md, turbo globalEnv, Next 15.3.6.  
- **Docs** — PROJECT_AUDIT, VERCEL, Enoki 403, etc.

---

## 4. Cross-reference (main vs integrated-service)

| Area | main | zoltan/integrated-service |
|------|------|----------------------------|
| **Auth** | Enoki zkLogin (Google) | dapp-kit (wallet) |
| **Sponsor API / PTB** | Yes (create profile, purchase, withdraw) | No |
| **Service layer (hooks/services)** | No | Yes (creator, content, seal, walrus, accessPass, transaction) |
| **Explore / Feed / CreatorProfile** | Mock data | Hooks + services (still no chain execution on this branch) |
| **Dashboard** | CreateProfileForm + WithdrawButton (PTB + sponsor) | Service-based UI; no PTB/sponsor |
| **SupportModal** | Real purchase_access via PTB + sponsor | Wired to services; no sponsor |
| **SEAL / Walrus** | Not in UI (contract/backend only) | Demo + upload in UI |
| **providers.tsx** | Not present (Enoki in layout/auth) | dapp-kit SuiClientProvider etc. |
| **apps/dapp** | Deleted | Deleted |

---

## 5. Merge conflicts (dry-run result)

A merge **main ← origin/zoltan/integrated-service** produces:

| Conflict | Type | Resolution direction |
|----------|------|----------------------|
| **apps/suipatron/.env.example** | modify/delete | **Keep main.** integrated-service deleted it; main has a good example. |
| **apps/suipatron/src/app/components/SupportModal.tsx** | content | **Keep main’s PTB + sponsor flow.** Optionally reuse integrated-service’s modal structure or copy over only non-auth, non-tx UI. |
| **apps/suipatron/src/app/lib/auth-context.tsx** | content | **Keep main.** Enoki zkLogin + mock fallback. Do not switch to dapp-kit. |
| **apps/suipatron/src/app/pages/Dashboard.tsx** | content | **Keep main’s CreateProfileForm + WithdrawButton.** Add use of services/hooks for *data* (e.g. creator profile, content list) where useful. |
| **apps/suipatron/src/app/providers.tsx** | rename/delete | **Decide per strategy below.** main has no providers.tsx; integrated-service added it for dapp-kit. For Enoki-only we may not need it; if we keep dapp-kit alongside Enoki, keep file and merge. |
| **docs/IMPLEMENTATION_STATUS.md** | content | Merge manually: keep main’s task list, add any integrated-service notes that are still relevant. |
| **pnpm-lock.yaml** | content | Regenerate after resolving package.json: `pnpm install`. |

---

## 6. Recommended merge strategy

**Goal:** Keep main as the source of truth for **auth (Enoki zkLogin)** and **sponsor flow (PTB + sponsor API)**. Bring in Alex’s **service layer and SEAL/Walrus UI** so that Explore/Feed/CreatorProfile (and optionally Dashboard) can use services/hooks for data and for future chain-backed features, while all **transactions** still go through the existing sponsor flow.

### Option A — Merge into main, resolve in one pass (recommended)

1. **Branch from main:**  
   `git checkout main && git checkout -b merge/integrated-service`

2. **Merge:**  
   `git merge origin/zoltan/integrated-service`

3. **Resolve conflicts:**
   - **.env.example** — Keep main’s version.
   - **auth-context.tsx** — Keep main (Enoki + mock). Discard dapp-kit auth from integrated-service.
   - **SupportModal.tsx** — Keep main’s PTB + sponsor purchase flow. Optionally copy over any UI/structure from integrated-service that doesn’t touch auth or tx execution.
   - **Dashboard.tsx** — Keep main’s CreateProfileForm and WithdrawButton. Integrate services/hooks only for *reading* data (e.g. useCreator, useContentList) where it fits.
   - **providers.tsx** — If we stay Enoki-only: remove the file and any layout reference to it. If we want dapp-kit alongside Enoki later: keep and adapt (e.g. SuiClientProvider only, no wallet auth).
   - **IMPLEMENTATION_STATUS.md** — Merge both: keep main’s checklist, add any new items from integrated-service.
   - **pnpm-lock.yaml** — After fixing package.json if needed, run `pnpm install`.

4. **Keep from integrated-service (no conflict):**
   - All of `apps/suipatron/src/app/services/`
   - All of `apps/suipatron/src/app/hooks/`
   - `constants.ts`, `adapters.ts`, `suiClient.ts`, `types/onchain.ts`
   - SEAL/Walrus demo and upload changes (from the last 3 commits)
   - `SETUP.md`, `docs/ARCHITECTURE.md`, and other docs that don’t conflict

5. **Wire-up after merge (optional):**
   - Explore/Feed/CreatorProfile: already use hooks on integrated-service; after merge they’ll use the new hooks/services with main’s auth.
   - Dashboard: optionally use `useMyCreatorProfile`, `useContentList`, etc., for display while keeping CreateProfileForm and WithdrawButton for mutations via sponsor flow.
   - SupportModal: keep current main behaviour; later, if services expose “prepare purchase” logic (e.g. building params), call that then still use PTB + sponsor for execution.

### Option B — Cherry-pick only service layer + SEAL/Walrus

- Skip a full merge; cherry-pick or copy in only:
  - `src/app/services/`, `src/app/hooks/`, `constants.ts`, `adapters.ts`, `suiClient.ts`, `types/onchain.ts`
  - The SEAL/Walrus UI commits (or selected files from them)
- Then manually wire Explore/Feed/CreatorProfile/Dashboard to these modules. No conflict with auth or sponsor, but more manual work and no single merge commit.

---

## 7. Summary

| Item | Action |
|------|--------|
| **Auth** | Keep main (Enoki zkLogin). Do not adopt dapp-kit auth from integrated-service. |
| **Sponsor / PTB** | Keep main. All create profile, purchase, withdraw stay on sponsor flow. |
| **Service layer** | Bring in from integrated-service (hooks + services + adapters + constants + suiClient + types). |
| **SEAL/Walrus UI** | Bring in from integrated-service (demo + upload, including “unencrypted preview” fix). |
| **Explore / Feed / CreatorProfile** | Use integrated-service’s hook-based data flow; ensure they run under main’s auth. |
| **Dashboard** | Keep main’s CreateProfileForm + WithdrawButton; add service/hook usage for data where useful. |
| **SupportModal** | Keep main’s purchase flow; optionally reuse non-tx UI from integrated-service. |
| **providers.tsx** | Prefer Enoki-only (delete) unless you explicitly add dapp-kit later. |

**Recommended:** Proceed with **Option A** (merge into a branch from main, resolve conflicts as above, then open a PR to main). That preserves one clear history and keeps Enoki + sponsor as the single auth and execution path while adding Alex’s integration layer and SEAL/Walrus work.
