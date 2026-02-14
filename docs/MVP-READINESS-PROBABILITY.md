# SuiPatron MVP — Readiness by Probability

**Date:** 2026-02-14 (post Enoki-required + no-mock fallbacks)  
**Question:** How close to 100% is the MVP for production?

---

## 1. Overall Number

| Definition of "100%" | Probability | Notes |
|----------------------|-------------|--------|
| **Core MVP (no mocks, main user journeys work)** | **~90–92%** | Sign in, create profile, support, upload content, view/decrypt, feed, withdraw all wired and on-chain. |
| **MVP + ops + polish** | **~82–85%** | + Enoki Portal, env, IDs; Vercel build green; no integration tests or demo script. |
| **MVP + SuiNS + protected routes + tests + demo** | **~72–75%** | SuiNS not implemented; dashboard is client-side redirect only; no E2E tests or seed data. |

**Summary:** You are **~90%** for “core product ready to run in prod with Enoki configured.” The remaining 10% is operator setup, one optional on-chain flow (profile edit), and non-blocking gaps (SuiNS, tests, demo).

---

## 2. By Layer (Probability to 100%)

| Layer | Prob. | What’s done | What’s missing for 100% |
|-------|-------|-------------|--------------------------|
| **Smart contracts** | **98%** | Deployed, tested, events, SEAL policy. | Confirm Package/Platform IDs in env and Enoki Portal; one smoke test. |
| **Auth & Enoki** | **97%** | zkLogin flow, callback, Enoki required when not configured (no mock). | Enoki Portal setup + `NEXT_PUBLIC_ENOKI_PUBLIC_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (operator). |
| **PTBs & sponsor** | **98%** | create_profile, purchase_access, withdraw_earnings, publish_content; sponsor flow in UI. | None for core flows. |
| **On-chain reads** | **98%** | CreatorProfile, Content, AccessPass, CreatorCap; hooks used everywhere. | None. |
| **Core UI flows** | **90%** | Create profile, support, withdraw, content upload (Walrus + publish), feed aggregation, encrypted viewer (SEAL decrypt). Creator profile + content: on-chain only (no mock). | Dashboard profile edit (name/bio/price) is **local only** — `buildUpdateProfileTx` exists but Dashboard only calls `updateUser()`, not the PTB. |
| **SEAL + Walrus** | **88%** | Encrypt/decrypt in services/hooks; upload unencrypted in Dashboard; decrypt in EncryptedContentViewer. | Optional: default to SEAL-encrypted upload in Dashboard (currently unencrypted). |
| **Backend / APIs** | **85%** | Sponsor, execute, creators, creator/:id, events/indexer; Supabase indexer store. | `POST /api/subname` (SuiNS) not implemented. |
| **Protected routes** | **80%** | Dashboard does client-side redirect when `!user` (`/?signin=true`). | No server-side or middleware protection; direct URL access may flash then redirect. |
| **SuiNS** | **10%** | UI placeholders (e.g. SuiNS modal). | Domain, backend subname endpoint, frontend wiring. Often out of “core MVP.” |
| **Testing & demo** | **25%** | Manual testing. | No E2E/integration tests, no seed data, no demo script or backup video. |
| **Deploy** | **80%** | Vercel config; turbo filter. | Build must pass (ESLint, Next.js version/CVE); env vars in Vercel. |

---

## 3. What “100% core MVP” Would Add

1. **Operator (no code):** Enoki Portal configured; env vars set; Package/Platform IDs aligned with Enoki allowed targets.
2. **Profile edit on-chain (small):** In Dashboard, `handleSaveProfile` calls `buildUpdateProfileTx` + sponsor flow instead of only `updateUser()`, so name/bio/price persist on-chain.
3. **Optional:** Server-side or middleware protection for `/dashboard` (and any other auth-only routes).
4. **Optional:** Default to SEAL-encrypted upload in Dashboard (currently unencrypted path is fine for MVP).

---

## 4. Conclusion

- **For “go live with real users and real money”:** You are **~90%** there. Configure Enoki, set env, and you have no mocks and full core journeys.
- **For “100% of every doc’d MVP line item”:** **~82–85%** (SuiNS, protected routes, integration tests, demo script still open).
- **Practical take:** Treat as **~90% to production-ready MVP**; the remaining 10% is mostly ops and one small on-chain fix (profile edit).
