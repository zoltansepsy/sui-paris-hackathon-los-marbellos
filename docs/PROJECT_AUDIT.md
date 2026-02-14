# SuiPatron — Full Project Audit

**Date:** February 14, 2025  
**Purpose:** Single snapshot of where the project stands relative to MVP scope.  
**References:** [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), [SCOPE.md](SCOPE.md), [suipatron/01-product-breakdown-and-roadmap.md](suipatron/01-product-breakdown-and-roadmap.md)

**Branch context:** Section 2–5 describe **`origin/main`** unless noted. Section 7 = team members, PRs, branches; Section 8 = remote branch detail; Section 9 = **`feat/enoki-sponsored-transactions`**; Section 10 = "where we are" consolidated.

---

## 1. Repo and Path Conventions

| Doc reference | Actual location |
|--------------|-----------------|
| `move/suipatron/` | **`packages/blockchain/contracts/`** — Move package name is `suipatron` |
| `frontend/` | **`apps/suipatron/`** — Next.js 15 app (not Vite); monorepo app |

**Monorepo layout:**
- **Root:** Turborepo; `pnpm`; Husky + lint-staged; `check:patterns` in pre-commit.
- **Apps:** `apps/suipatron` (SuiPatron), `apps/dapp` (skeleton).
- **Packages:** `packages/blockchain` (Move contracts + TS SDK), `packages/ui`, `packages/types`.

---

## 2. What’s Done

### 2.1 Smart contracts (A1–A8)

| Item | Status |
|------|--------|
| Location | `packages/blockchain/contracts/` |
| Modules | `sources/suipatron.move`, `sources/seal_policy.move` |
| Tests | `tests/suipatron_tests.move` — 18 unit tests (per IMPLEMENTATION_STATUS) |
| Build | `contracts/build/` present; `sui move build` may need to run outside sandbox (lock under `~/.move`) |

**Implemented:** Platform, AdminCap, CreatorProfile, Content (DOF), CreatorCap, AccessPass, all entry points (create_profile, update_profile, publish_content, purchase_access, withdraw_earnings), events, SEAL policy (`seal_approve`). Version + migrate present.

**Not done:** A9 — Deploy to Testnet and record Package ID / Platform ID in env.

### 2.2 Backend / indexer (A10–A12 partial)

| Component | Status | Location |
|-----------|--------|----------|
| **GET /api/creators** | Done | `apps/suipatron/src/app/api/creators/route.ts` |
| **GET /api/creator/:id** | Done | `apps/suipatron/src/app/api/creator/[id]/route.ts` |
| **Event indexer** | Done | `apps/suipatron/src/app/lib/indexer/` (run, store, store-supabase, types, get-store) |
| **GET /api/events** | Done | `apps/suipatron/src/app/api/events/route.ts` (cron; optional CRON_SECRET) |
| **Indexer store** | Supabase + in-memory | `store-supabase.ts`, `get-store.ts`; schema in `apps/suipatron/supabase/migrations/20250214000000_indexer_tables.sql` |
| **POST /api/sponsor** | Not on main | Done on `feat/enoki-sponsored-transactions` |
| **POST /api/sponsor/execute** | Not on main | Done on `feat/enoki-sponsored-transactions` |
| **POST /api/subname** | Not done | — |

### 2.3 Frontend app shell and UI (J1–J4, partial J5–J12)

- **Stack:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui (many components), react-hot-toast.
- **Design system:** Button, Card, Modal, Badge, Toast, Avatar, Dialog, Input, etc. — in place.
- **Layout:** Header, nav, responsive shell; Landing, Explore, Creator Profile, Dashboard, Feed, Auth callback, Settings, 404.
- **Auth:** `auth-context.tsx` + `storage.ts` — **mock only** (email sign-in, localStorage “user”). No Enoki/zkLogin. On `feat/enoki-sponsored-transactions`: Enoki zkLogin (Google) + auth callback.
- **Data source:** Pages use **mock data** (`mock-data.ts`: `mockCreators`, `mockContent`). No calls to `GET /api/creators` or `GET /api/creator/:id` from the UI.
- **Access passes:** `useAccessPasses` in `access-pass.ts` — **client-only mock** (localStorage). No on-chain AccessPass or `getOwnedObjects`.
- **Support flow:** `SupportModal` — simulated 2s delay then `addAccessPass(creator.id)` (mock). No PTB, no Enoki sponsor, no SUI.
- **Dashboard:** Profile edit, “become creator”, price, SuiNS modal — all local state; no create_profile/update_profile PTB or on-chain calls.
- **Feed:** Uses mock creators + mock content filtered by mock access passes.

So: **UI and flows exist as a high-fidelity prototype on mock data; no blockchain or real backend wired in.**

### 2.4 Dependencies (apps/suipatron)

Installed but **not yet used** in code:

- `@mysten/enoki`, `@mysten/sui`, `@mysten/dapp-kit`
- `@mysten/seal`, `@mysten/walrus`
- `@supabase/supabase-js` (used by indexer store when configured)

---

## 3. What’s Not Done (MVP)

### 3.1 Contract and env

- [ ] **A9:** Deploy Move package to SUI Testnet; set `VITE_PACKAGE_ID` / `NEXT_PUBLIC_PACKAGE_ID`, `VITE_PLATFORM_ID` / `NEXT_PUBLIC_PLATFORM_ID`; update Enoki allowed move call targets.

### 3.2 Auth and backend

- [ ] **P1–P2, Z4:** Enoki Portal + Google OAuth; zkLogin flow; auth callback with Enoki; replace mock auth.
- [ ] **A10:** `POST /api/sponsor` and `POST /api/sponsor/execute` (Enoki sponsor + execute).
- [ ] **A11:** `POST /api/subname` (SuiNS subname for creators).
- [ ] **Z5:** Register `suipatron.sui` on testnet; wire subname in profile setup.

### 3.3 PTB and sponsored flows

- [ ] **P3–P5, P13:** PTB builders: create_profile, update_profile, publish_content, purchase_access, withdraw_earnings; wire Enoki `sponsorAndExecuteTransaction` for all user actions.
- [ ] **P14:** `useMyAccessPasses()` (or equivalent) — fetch user’s AccessPass NFTs via SUI (e.g. getOwnedObjects), replace mock `useAccessPasses`.

### 3.4 Content pipeline

- [ ] **P6–P8:** SEAL encrypt; Walrus upload; content upload flow (encrypt → upload → publish_content tx).
- [ ] **P9–P11:** Walrus download; SEAL decrypt (with seal_approve); content access flow (download → decrypt → render).
- [ ] **J9:** Content viewer: image, text, PDF renderers for decrypted blobs.

### 3.5 UI wired to real data

- [ ] **Explore:** Replace `mockCreators` with `GET /api/creators` (and optional pagination).
- [ ] **Creator profile:** Replace mock lookup with `GET /api/creator/:id`; keep Support modal but wire to purchase_access PTB + sponsor.
- [ ] **Feed:** Replace mock creators/content/access with indexer + on-chain AccessPasses.
- [ ] **Dashboard:** Wire profile form to create_profile/update_profile PTB; content list to indexer; upload to encrypt → Walrus → publish_content; earnings/withdraw to withdraw_earnings PTB.

### 3.6 SuiNS and polish

- [ ] **P12:** SuiNS subname creation from backend + frontend.
- [ ] **J11–J13:** Loading/skeletons, error toasts/empty states, demo seed data.
- [ ] **Z6–Z10:** Integration tests (sign in → create profile → upload; browse → purchase → decrypt); demo script; Vercel deploy config.

---

## 4. Summary Table

| Area | Done | Remaining |
|------|------|-----------|
| **Move contracts** | Implemented and tested (A1–A8) | Deploy (A9) |
| **Indexer + API** | Indexer, store (Supabase + memory), GET creators/creator, GET events | Sponsor, execute, subname APIs |
| **Frontend shell** | Next.js app, design system, all main pages, mock auth & mock data | Wire to Enoki, PTBs, indexer, SEAL/Walrus |
| **Auth** | Mock (email + localStorage) | Enoki zkLogin (Google) |
| **Creator/Explore/Feed** | UI and flows on mock data | Real API + on-chain AccessPass + content decrypt |
| **Content** | — | SEAL encrypt/decrypt, Walrus up/down, publish_content, viewer |
| **Payments & withdraw** | Support modal (simulated) | purchase_access + withdraw_earnings PTB + sponsor |
| **SuiNS** | UI placeholder | Domain + backend + subname flow |
| **DevOps / demo** | — | Enoki Portal, env, cron for indexer, integration tests, demo script, Vercel |

---

## 5. Recommended Next Steps (priority)

1. **Deploy contracts (A9)** — Publish from `packages/blockchain/contracts`; record Package ID and Platform ID; add to Enoki Portal.
2. **Enoki auth (P1–P2)** — Replace mock sign-in with Enoki zkLogin; auth callback; protect dashboard/feed.
3. **Sponsor API (A10)** — Implement `POST /api/sponsor` and `POST /api/sponsor/execute` using Enoki.
4. **PTB + sponsor in UI (P3–P5, P13)** — buildCreateProfileTx, buildPurchaseAccessTx, buildWithdrawTx; call sponsor API from Dashboard and Support modal.
5. **Wire Explore/Creator to API** — Use `GET /api/creators` and `GET /api/creator/:id`; run indexer (cron or manual) so data exists; optionally keep mock as fallback when indexer empty.
6. **AccessPass from chain (P14)** — Replace mock `useAccessPasses` with fetching user’s AccessPass NFTs (e.g. getOwnedObjects) so Feed and Creator profile show real “has access”.
7. **Content pipeline (P6–P11)** — SEAL + Walrus + upload flow; download + decrypt + viewer for supported creators.

---

## 6. Doc and Path Fixes to Apply

- **IMPLEMENTATION_STATUS.md:** Replace `move/suipatron` with `packages/blockchain/contracts` in paths and commands; replace `frontend/` with `apps/suipatron/` where relevant.
- **CLAUDE.md:** Same path updates; confirm “Backend” section points at `apps/suipatron` (e.g. `src/app/api/`) and indexer at `src/app/lib/indexer/`.
- **PBS (01-product-breakdown-and-roadmap.md):** Mark A12 and indexer-related work as done; mark J1–J4 (and partial J5–J12) to reflect “UI done, data source mock”; keep P1–P14 and remaining Z/J as open until implemented.

---

## 7. Team Members, PRs, and Branches

**Repo:** `origin` = `https://github.com/zoltansepsy/sui-paris-hackathon-los-marbellos.git`

### 7.1 Contributors (by commit count)

| Author | Commits | Main work |
|--------|---------|-----------|
| **Zoltan Sepsy** | 10 | Scope/CLAUDE, MVP smart contracts (Move), gitignore; MVP service layer (apps/dapp); architecture doc; integrated-service (services into suipatron); mvp-frontend merge. |
| **Joao Gameiro** | 4 | Monorepo merge (Move + Next.js dApp + turbo); API indexer + Supabase; Next.js app (SSR, patterns); **Enoki sponsored transactions** (feat/enoki-sponsored-transactions). |
| **Paul Rivers** | 1 | UI/UX design brief, features-to-patterns doc, initial briefing, **SUI-Patron-apple** assets (on **mvp-frontend** only). |
| zoltansepsy (GH) | 1 | Merge of PR #1 (mvp-smart-contracts). |

### 7.2 Pull requests (GitHub)

| PR | Title | Author | State | Branch | Merged into |
|----|--------|--------|--------|--------|-------------|
| **#1** | MVP smart contracts | zoltansepsy | **Merged** (Feb 13, 2026) | `zoltan/mvp-smart-contracts` | main |
| **#2** | MVP service layer | zoltansepsy | **Open** | `zoltan/mvp-service` | — (target likely main) |

No PRs yet for: `feat/enoki-sponsored-transactions`, `mvp-frontend`, `zoltan/integrated-service`.

### 7.3 Branch ↔ PR / owner

| Branch | Has PR? | Owner / content |
|--------|---------|------------------|
| **origin/main** | — | Default; includes PR #1 (Move). Joao’s indexer + Next.js app. |
| **feat/enoki-sponsored-transactions** | No | Joao — Enoki sponsor + PTB + zkLogin (local only, not pushed in audit snapshot). |
| **origin/mvp-frontend** | No | Zoltan + Paul — mvp-service merge, SUI-Patron-apple, UI/UX brief. |
| **origin/zoltan/mvp-service** | Yes (#2 open) | Zoltan — service layer in apps/dapp. |
| **origin/zoltan/integrated-service** | No | Zoltan — service layer integrated into apps/suipatron. |
| **origin/zoltan/mvp-smart-contracts** | Yes (#1 merged) | Zoltan — Move contracts (now on main). |

---

## 8. Remote Branches — Detail (Zoltan + Paul)

| Branch | Base | What it adds |
|--------|------|--------------|
| **origin/main** | — | Next.js app (a5f0356), indexer + Supabase (0c785c6), monorepo merge, zoltan/mvp-smart-contracts (Move). No Enoki, no sponsor APIs, mock auth. |
| **origin/mvp-frontend** | 5053b48 (pre–indexer) | Merge of **zoltan/mvp-service**; **SUI-Patron-apple/** (separate Vite app: full UI design system, pages: Dashboard, Onboarding, Upload, Withdraw, AccessPasses, CreatorProfile, Feed, Payment); docs: ARCHITECTURE.md, UI_UX_DESIGN_BRIEF.md, Features-to-Patterns.md, Initial Briefing. **apps/dapp**: hooks + services (creator, content, seal, walrus, transaction, accessPass). No Enoki, no sponsor; wallet/dapp-kit oriented. |
| **origin/zoltan/mvp-service** | 5053b48 | Service layer in **apps/dapp**: hooks + services + types. No UI in suipatron. |
| **origin/zoltan/integrated-service** | a5f0356 (main) | Integrates service layer **into apps/suipatron**: copies hooks, services, types from dapp into suipatron; adds adapters, providers, constants, suiClient; wires Explore, Dashboard, CreatorProfile, Feed, SupportModal to services. Auth uses **dapp-kit** (useCurrentAccount, useDisconnectWallet) — wallet-based, not zkLogin. No sponsor API, no PTB builders, no Enoki. |

**Summary:** Zoltan's work = service-layer abstraction (creator/content/SEAL/Walrus/transaction services) + design system and reference UI in SUI-Patron-apple + integration of services into Next.js suipatron app. Paul's commit (mvp-frontend) = UI/UX brief + SUI-Patron-apple assets. Auth on Zoltan's branches is wallet (dapp-kit), not Enoki zkLogin.

---

## 9. Branch: feat/enoki-sponsored-transactions (Our Work)

**Base:** Same as main (a5f0356 + 0c785c6). **Single extra commit:** Enoki sponsored transactions end-to-end.

### 9.1 What this branch adds

| Area | Implementation |
|------|----------------|
| **Sponsor API** | `POST /api/sponsor` — accepts transactionKindBytes, sender, allowedMoveCallTargets; returns bytes, digest. |
| **Execute API** | `POST /api/sponsor/execute` — digest + signature; Enoki executeSponsoredTransaction. |
| **Enoki server** | `enoki-server.ts` — server-side Enoki client for sponsor/execute. |
| **PTB builders** | `lib/ptb/index.ts`: buildCreateProfileTx, buildUpdateProfileTx, buildPublishContentTx, buildPurchaseAccessTx, buildWithdrawEarningsTx. |
| **Sponsor flow** | `lib/sponsor-flow.ts` — build → sponsor → sign → execute. `use-sponsor-transaction.ts` hook. |
| **Auth** | Enoki zkLogin: EnokiFlowProvider, enoki-provider.tsx; auth-context uses useEnokiFlow, createAuthorizationURL → Google → /auth/callback; user from enoki.$zkLoginState. |
| **Auth callback** | AuthCallback.tsx — processes redirect, establishes Enoki session. |
| **Dashboard** | CreateProfileForm.tsx (real create_profile PTB + sponsor); WithdrawButton.tsx (real withdraw_earnings PTB + sponsor). |
| **Support modal** | SupportModal.tsx — real purchase_access PTB + sponsor flow (no mock). |
| **Landing** | "Sign in with Google" CTA; Enoki sign-in. |
| **Helpers** | get-created-objects.ts for parsing created objects from tx result. |

Explore/Feed/Creator profile still use **mock data**; indexer/API unchanged from main. No service layer; components call PTB + sponsor API directly.

### 9.2 Cross-reference with Zoltan's branches

| File / area | feat/enoki-sponsored-transactions | origin/zoltan/integrated-service |
|-------------|-----------------------------------|----------------------------------|
| **auth-context.tsx** | Enoki: useEnokiFlow, createAuthorizationURL, zkLogin state | dapp-kit: useCurrentAccount, useDisconnectWallet, wallet address |
| **SupportModal** | PTB + sponsor flow (real purchase_access) | Wired to services; no sponsor |
| **Dashboard** | CreateProfileForm + WithdrawButton (PTB + sponsor) | Service-based profile/withdraw; no PTB/sponsor |
| **Explore / Feed / CreatorProfile** | Mock data | Use hooks/services; still no chain execution |
| **New on our branch only** | api/sponsor, api/sponsor/execute, lib/ptb/, lib/sponsor-flow.ts, use-sponsor-transaction.ts, enoki-provider.tsx, enoki-server.ts, CreateProfileForm.tsx, WithdrawButton.tsx, Enoki auth in layout |

**Conflict:** Merging integrated-service into our branch (or vice versa) will conflict on auth-context.tsx, SupportModal.tsx, Dashboard.tsx, and possibly layout.tsx/providers. Auth model is incompatible: we need Enoki zkLogin for sponsored tx; Zoltan's branch assumes wallet (dapp-kit). Resolution: keep Enoki auth and sponsor flow; optionally adopt Zoltan's **services** as a layer between UI and our PTB/sponsor (e.g. creatorService wrapping API + indexer, while transactions still go through our sponsor flow).

---

## 10. Where We Are — Consolidated

| Area | origin/main | feat/enoki-sponsored-transactions | origin/zoltan/integrated-service | origin/mvp-frontend |
|------|-------------|-----------------------------------|----------------------------------|---------------------|
| **Move contracts** | Done (A1–A8) | Same | Same | Same |
| **Indexer + GET creators/creator** | Done | Same | Same | Older base (no indexer in mvp-frontend base) |
| **POST /api/sponsor, execute** | No | **Yes** | No | No |
| **Auth** | Mock | **Enoki zkLogin** | dapp-kit wallet | dapp-kit / mock |
| **PTB + sponsor in UI** | No | **Yes** (create profile, purchase, withdraw) | No | No |
| **Explore/Feed/Creator data** | Mock | Mock | Services + API (no chain) | SUI-Patron-apple mock |
| **Service layer (hooks/services)** | No | No | **Yes** (in suipatron) | Yes (in apps/dapp) |
| **Design system / reference UI** | suipatron (Next.js) | Same | Same | SUI-Patron-apple (Vite) + docs |

**Recommended path:** Use **feat/enoki-sponsored-transactions** as the integration branch for MVP: it has the only working Enoki sponsor flow and real on-chain create profile / purchase / withdraw. After merge to main, optionally bring in Zoltan's service layer (hooks/services) and wire Explore/Feed/Creator to API + those services while keeping Enoki auth and sponsor flow for all transactions. Resolve auth by keeping our Enoki implementation; do not switch back to wallet-only.

---

*Audit complete. Use IMPLEMENTATION_STATUS.md for ongoing task tracking and this document for snapshot + branch cross-reference.*
