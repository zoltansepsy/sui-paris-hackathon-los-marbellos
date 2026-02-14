# SuiPatron — User Stories

**Project:** SuiPatron (Decentralized Creator Support Platform)  
**Scope:** MVP (hackathon)  
**Last Updated:** February 2025  
**Reference:** [01-product-breakdown-and-roadmap.md](01-product-breakdown-and-roadmap.md), [core-planning/02-mvp-scope.md](../core-planning/02-mvp-scope.md)

---

## User Personas

### Creator
- Publishes exclusive content, sets access price, earns from supporters
- Uses SEAL + Walrus for encrypted content; CreatorCap for auth
- Needs: profile creation, content upload, earnings withdrawal

### Supporter
- Browses creators, pays for access, views decrypted content
- Holds AccessPass NFT as proof of payment
- Needs: discovery, purchase flow, content access

---

## Epic: Auth & Onboarding

### US-1.1 — Sign in with Google (Creator / Supporter)

**As a** Creator or Supporter  
**I want to** sign in with my Google account  
**So that** I can use the platform without setting up a wallet or holding gas tokens

**Priority:** Must-Have  
**Related PBS:** P1, P2, Z4  
**Related:** Enoki zkLogin, useEnokiFlow

**Acceptance Criteria:**
- [ ] Click "Sign in with Google" → redirects to Google OAuth
- [ ] After callback, user has SUI address derived from Google JWT
- [ ] Session persists across page loads
- [ ] Protected routes (dashboard) require auth

**Happy Path:** Click CTA → Google OAuth → redirect to /auth/callback → session established → redirect to dashboard or explore.  
**Unhappy Paths:** OAuth denied → show error; callback fails → show error with retry.

---

## Epic: Creator Profile & Content

### US-2.1 — Create Creator Profile (Creator)

**As a** Creator  
**I want to** create a creator profile with name, bio, avatar, and access price  
**So that** supporters can discover me and pay for access to my content

**Priority:** Must-Have  
**Related PBS:** P3, P5, A9, A10  
**Related:** create_profile PTB, Enoki sponsor

**Acceptance Criteria:**
- [ ] Form: name, bio, avatar (optional), price (SUI)
- [ ] Submit → sponsored transaction creates CreatorProfile + CreatorCap
- [ ] Creator receives CreatorCap (owned)
- [ ] Profile appears on Explore after indexer picks up event

**Happy Path:** Fill form → Submit → Enoki sponsors tx → CreatorProfile + CreatorCap created → redirect to dashboard.  
**Unhappy Paths:** Validation error → show inline; tx fails → toast with retry.

---

### US-2.2 — Upload Content (Creator)

**As a** Creator  
**I want to** upload a file (image, text, PDF) and have it encrypted and stored  
**So that** only supporters with AccessPass can decrypt and view it

**Priority:** Must-Have  
**Related PBS:** P6, P7, P8, A6  
**Related:** SEAL encrypt, Walrus upload, publish_content PTB

**Acceptance Criteria:**
- [ ] File picker, title, description, content type
- [ ] File encrypted client-side with SEAL (identity = creatorProfileId)
- [ ] Encrypted blob uploaded to Walrus → blobId
- [ ] Sponsored tx publishes Content metadata on-chain
- [ ] Content appears in creator's content grid

**Happy Path:** Select file → Fill metadata → Encrypt → Upload → Publish tx → Content in grid.  
**Unhappy Paths:** File too large → validation; Walrus fails → retry; tx fails → toast.

---

### US-2.3 — Withdraw Earnings (Creator)

**As a** Creator  
**I want to** withdraw my accumulated SUI balance  
**So that** I receive payments from supporters

**Priority:** Must-Have  
**Related PBS:** P13, J7  
**Related:** withdraw_earnings PTB

**Acceptance Criteria:**
- [ ] Dashboard shows balance
- [ ] Click "Withdraw" → sponsored tx transfers full balance to creator
- [ ] Balance updates to 0
- [ ] SUI received at creator's address

**Happy Path:** View balance → Click Withdraw → Confirm → Tx executes → Balance 0.  
**Unhappy Paths:** Zero balance → disable button or show message; tx fails → toast.

---

## Epic: Supporter Flows

### US-3.1 — Browse and Purchase Access (Supporter)

**As a** Supporter  
**I want to** browse creators, see their profile and price, and pay for access  
**So that** I receive an AccessPass NFT and can view all of their content

**Priority:** Must-Have  
**Related PBS:** J4, J5, J6, P4, P5, P14  
**Related:** purchase_access PTB, useMyAccessPasses

**Acceptance Criteria:**
- [ ] Explore page lists creators
- [ ] Creator Profile shows bio, price, content count
- [ ] "Support" button shows price
- [ ] Confirm modal → sponsored tx (payment + mint AccessPass)
- [ ] Supporter receives AccessPass NFT
- [ ] Content unlocks for supporter

**Happy Path:** Browse → Click creator → Click Support → Confirm → Tx executes → Access granted.  
**Unhappy Paths:** Insufficient SUI → error; already has AccessPass → show "You have access".

---

### US-3.2 — View Decrypted Content (Supporter)

**As a** Supporter with AccessPass  
**I want to** click on content and view it decrypted  
**So that** I can read/watch what I paid for

**Priority:** Must-Have  
**Related PBS:** P9, P10, P11, J9  
**Related:** Walrus download, SEAL decrypt, seal_approve

**Acceptance Criteria:**
- [ ] Content cards show title, type badge
- [ ] Click card → download from Walrus → SEAL decrypt (seal_approve validates AccessPass)
- [ ] Decrypted content renders (image, text, PDF)
- [ ] Without AccessPass, content is locked or shows upgrade CTA

**Happy Path:** Click content → Download → Decrypt → Render.  
**Unhappy Paths:** No AccessPass → show lock/CTA; decrypt fails → error message.

---

### US-3.3 — Supporter Feed (Supporter)

**As a** Supporter  
**I want to** see a feed of content from creators I support  
**So that** I can browse and open content in one place

**Priority:** Must-Have  
**Related PBS:** J10, P14  
**Related:** useMyAccessPasses, content list by creator

**Acceptance Criteria:**
- [ ] Feed lists creators I have AccessPass for
- [ ] Content from each creator shown
- [ ] Click content → opens viewer (same as US-3.2)

---

## Epic: Discovery & Indexing

### US-4.1 — Explore Creators (All Users)

**As a** user (creator or supporter)  
**I want to** browse all creators on the platform  
**So that** I can discover who to support

**Priority:** Must-Have  
**Related PBS:** J4, A12  
**Related:** GET /api/creators or event-based discovery

**Acceptance Criteria:**
- [ ] Explore page shows creator grid
- [ ] Each card: avatar, name, price, content count
- [ ] Click → Creator Profile page
