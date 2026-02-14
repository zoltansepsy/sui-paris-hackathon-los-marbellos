# Enoki sponsored transactions end-to-end

## Summary

Adds full Enoki integration for sponsored transactions and zkLogin (Google sign-in): backend sponsor/execute APIs, PTB builders for all SuiPatron entry points, sponsor flow + hook, and wired UI (create profile, purchase access, withdraw). Users can sign in with Google and submit create_profile / purchase_access / withdraw_earnings without a wallet; gas is sponsored.

## Changes

### Backend

- **POST /api/sponsor** — Accepts transaction kind bytes and sender; calls Enoki `createSponsoredTransaction` with `allowedMoveCallTargets`; returns `bytes` and `digest`.
- **POST /api/sponsor/execute** — Accepts `digest` and `signature`; calls Enoki `executeSponsoredTransaction`.
- **enoki-server.ts** — Server-side Enoki client for sponsor/execute (uses `ENOKI_SECRET_KEY`).

### PTB builders (`lib/ptb/index.ts`)

- `buildCreateProfileTx`, `buildUpdateProfileTx`, `buildPublishContentTx`, `buildPurchaseAccessTx`, `buildWithdrawEarningsTx` for all SuiPatron Move entry points.

### Auth

- **Enoki zkLogin** — `EnokiFlowProvider`, `enoki-provider.tsx`; auth context uses `useEnokiFlow`, `createAuthorizationURL` → Google → `/auth/callback`; user from `enoki.$zkLoginState`.
- **Auth callback** — `/auth/callback` processes redirect and establishes Enoki session.

### Sponsor flow

- **sponsor-flow.ts** — Build → sponsor (API) → sign (EnokiKeypair) → execute (API).
- **use-sponsor-transaction.ts** — Hook for components to run the full flow.

### UI wired to sponsor flow

- **Dashboard:** `CreateProfileForm` (create_profile PTB + sponsor), `WithdrawButton` (withdraw_earnings PTB + sponsor).
- **SupportModal:** Real purchase_access via sponsor flow when Enoki is configured; mock fallback when env vars are not set.
- **Landing:** "Sign in with Google" CTA and Enoki sign-in.

### Other

- **get-created-objects.ts** — Helper to parse created objects from transaction result.
- **.env.example** — `ENOKI_SECRET_KEY` and Enoki-related vars.
- **docs/ENOKI_IMPLEMENTATION_AUDIT.md** — Implementation audit vs Enoki docs.
- **IMPLEMENTATION_STATUS.md** — Updated for sponsor APIs, Enoki auth, PTBs, and wired flows.

## How to test

1. Set Enoki env vars in `apps/suipatron/.env.local`: `ENOKI_SECRET_KEY`, and in `.env`: `NEXT_PUBLIC_ENOKI_PUBLIC_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_PACKAGE_ID`, `NEXT_PUBLIC_PLATFORM_ID`.
2. Run `pnpm dev` (or `cd apps/suipatron && pnpm dev`).
3. Sign in with Google → create profile (Dashboard) → or support a creator (purchase access) → or withdraw (Dashboard). All use sponsored transactions.

## Base branch

- **Target:** `main` (same as current default; one commit ahead with this feature).

## Refs

- [Enoki SDK](https://docs.enoki.mystenlabs.com/ts-sdk), [HTTP API](https://docs.enoki.mystenlabs.com/http-api)
- `docs/ENOKI_IMPLEMENTATION_AUDIT.md` for alignment notes and deprecation (EnokiFlowProvider; long-term migration to wallet-standard suggested).
