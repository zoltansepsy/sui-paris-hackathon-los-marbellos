# SuiPatron — Development Roadmap

**Source:** [SCOPE.md](../SCOPE.md) Section 9  
**Purpose:** Phase gates and hour estimates — link to SCOPE for full timeline

---

## Phase 1: Foundation (Hours 0–4)

**Goal:** Repo scaffolded, contracts compiling, zkLogin working, UI shell renders, deployment pipeline live.

**Phase 1 Gate (must pass before continuing):**
- [ ] Move package compiles with all core types and functions
- [ ] Frontend deploys to Vercel and renders
- [ ] Google sign-in works end-to-end (user gets SUI address)
- [ ] Design system has Button, Card, Modal, Badge, Toast

---

## Phase 2: Core Flows (Hours 4–10)

**Goal:** Profile creation, content upload (encrypted), access purchase all working with sponsored transactions.

**Phase 2 Gate:**
- [ ] Contract deployed to Testnet with verified Package ID
- [ ] Can create a creator profile via UI (sponsored tx)
- [ ] Can upload encrypted content (SEAL + Walrus)
- [ ] Can purchase access (sponsored tx, receives AccessPass NFT)
- [ ] Events emitting for all actions

---

## Phase 3: Content Access & Integration (Hours 10–16)

**Goal:** Supporters can decrypt and view content. Creator can withdraw. SuiNS works. Indexer running.

**Phase 3 Gate:**
- [ ] Full flow works: sign in → browse → subscribe → view decrypted content
- [ ] Creator can withdraw earnings
- [ ] SuiNS subnames created for creators
- [ ] Indexer provides creator list + content list APIs
- [ ] Error states handled gracefully

---

## Phase 4: Demo Polish (Hours 16–20)

**Goal:** Demo-ready product. Seed data. Presentation prepared.

**Phase 4 Gate (SHIP IT):**
- [ ] Demo script tested and timed (≤ 3 minutes)
- [ ] Seeded with 3+ creators, realistic prices, 5+ content items
- [ ] Full flow works without errors on demo path
- [ ] Backup: screen recording of successful flow

---

See [SCOPE.md](../SCOPE.md) Section 9 for detailed hour-by-hour breakdown.
