# SuiPatron — Product Breakdown Structure

**Source:** [SCOPE.md](../SCOPE.md) Section 8  
**Purpose:** Task IDs and deliverables — link to SCOPE for full details

---

## Smart Contract + Backend

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| A1 | Write Move package: Platform, AdminCap, init | — | Compiling `suipatron.move` | 1 |
| A2 | Write: CreatorProfile, create_profile (flat price) | A1 | Functions + unit tests | 1 |
| A3 | Write: AccessPass, purchase_access | A2 | Payment + minting logic | 1 |
| A4 | Write: Content, publish_content (dynamic object fields) | A2 | Content storage logic | 1 |
| A5 | Write: withdraw_earnings | A2 | Withdrawal logic | 1 |
| A6 | Write: seal_policy::seal_approve | A3 | SEAL validation function | 2 |
| A7 | Write: All events | A2-A5 | Event emission in all functions | 2 |
| A8 | Write + run Move unit tests | A1-A7 | Passing test suite | 2 |
| A9 | Deploy package to SUI Testnet | A8 | Package ID, Platform ID, AdminCap ID | 2 |
| A10 | Backend: sponsor endpoint | A9 | Working `/api/sponsor` | 2 |
| A11 | Backend: subname endpoint | A9 | Working `/api/subname` | 3 |
| A12 | Backend: event indexer | A9 | Working `/api/creators`, `/api/creator/:id` | 3 |
| A13 | Version tracking + migrate function | A1 | Upgrade-ready contracts | 3 |

---

## Full-Stack Integration

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| P1 | Enoki zkLogin: Google sign-in flow | Scaffold | Working auth with session persistence | 1 |
| P2 | Auth callback handling + redirect | P1 | `/auth/callback` route | 1 |
| P3 | Transaction builder: create_profile PTB | A9 | `buildCreateProfileTx()` | 2 |
| P4 | Transaction builder: purchase_access PTB | A9 | `buildPurchaseAccessTx()` | 2 |
| P5 | Enoki sponsored transaction execution | P3, A10 | Gasless transaction flow | 2 |
| P6 | SEAL encryption pipeline | A6 | `encryptContent()` helper | 2 |
| P7 | Walrus upload pipeline | P6 | `uploadToWalrus()` helper | 2 |
| P8 | Content upload flow (encrypt → upload → publish tx) | P6, P7, A9 | End-to-end upload | 2 |
| P9 | Walrus download pipeline | — | `downloadFromWalrus()` helper | 3 |
| P10 | SEAL decryption pipeline | A6 | `decryptContent()` helper | 3 |
| P11 | Content access flow (download → decrypt → render) | P9, P10 | End-to-end decrypt | 3 |
| P12 | SuiNS subname creation (frontend trigger → backend) | A11 | Subname flow | 3 |
| P13 | Transaction builder: withdraw_earnings PTB | A9 | `buildWithdrawTx()` | 3 |
| P14 | User's AccessPass fetching + caching | A9 | Hook: `useMyAccessPasses()` | 2 |

---

## UI/UX + Frontend

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| J1 | Design system: Button, Card, Modal, Badge, Toast | Scaffold | Component library | 1 |
| J2 | Layout: Header, navigation, responsive shell | J1 | App shell | 1 |
| J3 | Landing page: hero, features, CTA | J1, J2 | `/` route | 1 |
| J4 | Explore page: creator grid | J1 | `/explore` route (mock data initially) | 1 |
| J5 | Creator Profile page: header, price, content grid | J1 | `/creator/:id` route | 2 |
| J6 | Support modal: payment confirmation UI | J5 | Modal component | 2 |
| J7 | Creator Dashboard: profile editor, price setting | J1 | `/dashboard` route | 2 |
| J8 | Content uploader: file picker, metadata form | J7 | Upload UI component | 2 |
| J9 | Content viewer: image, text, PDF renderers | J5 | Decrypted content display | 3 |
| J10 | Supporter feed: subscriptions list, content feed | J1 | `/feed` route | 3 |
| J11 | Loading states, skeleton screens | J1 | Polish | 3 |
| J12 | Error toasts, empty states | J1 | Polish | 3 |
| J13 | Demo data seeding + demo polish | All | Demo-ready UI | 4 |

---

## Architecture + DevOps + Coordination

| ID | Task | Depends On | Deliverable | Phase |
|---|---|---|---|---|
| Z1 | Scaffold monorepo: frontend (Vite+React+Tailwind), move package | — | Working repo structure | 1 |
| Z2 | Configure Vercel deployment | Z1 | Auto-deploy from main | 1 |
| Z3 | Environment configuration (.env, .env.local, Vercel env vars) | Z1 | Documented env setup | 1 |
| Z4 | Enoki Portal setup (app, OAuth, allowed targets) | — | Configured portal | 1 |
| Z5 | SuiNS domain registration (testnet) | — | Own `suipatron.sui` | 1 |
| Z6 | Integration testing: sign in → create profile → upload | Phase 2 | Test report | 3 |
| Z7 | Integration testing: browse → subscribe → decrypt | Phase 3 | Test report | 3 |
| Z8 | Seed demo data (3 creators, realistic prices, 5+ content items) | Phase 3 | Demo-ready state | 4 |
| Z9 | Demo script writing | Phase 3 | 3-minute pitch script | 4 |
| Z10 | Bug bash + final fixes | Phase 3 | Release candidate | 4 |

---

See [SCOPE.md](../SCOPE.md) Section 8 for full task descriptions.
