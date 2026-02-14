# SuiPatron — Enterprise UI/UX Briefing

**Version:** 1.0  
**Date:** February 2025  
**Audience:** UI/UX Team  
**Project:** Decentralized Creator Support Platform on SUI  
**Reference:** [SCOPE.md](SCOPE.md), [core-planning/02-mvp-scope.md](core-planning/02-mvp-scope.md)

---

## Executive Summary

SuiPatron is a Patreon-like platform where creators publish exclusive content and supporters pay a one-time price for permanent access. The experience must feel familiar to Web2 users (Patreon, Ko-fi, Gumroad) while differentiating through Web3 capabilities: **no platform fees**, **creator-owned content**, **on-chain proof of support**, and **human-readable identities** (SuiNS: `name@suipatron.sui`).

**Primary persona:** Creator. All flows and layouts prioritize creator onboarding, dashboard, and earnings.

**Technical foundation:** Google sign-in (Enoki zkLogin), gasless transactions (sponsored), Enoki-managed account (no wallet install). Users never see "blockchain", "wallet", or "gas" in the UI.

---

## 1. Design Principles

### 1.1 Creator-First

- Creator dashboard and profile creation are the primary flows.
- Layout adapts to creator content; brand does not compete with creator identity.
- Earnings, content management, and supporter visibility are central to the dashboard.

### 1.2 Web2-Familiar, Web3-Differentiated

- **Familiar:** Sign-in with Google, profile pages, content grids, support buttons, earnings views—mirror Patreon patterns.
- **Differentiated:** Light Web3 hints in copy and visuals:
  - "You own your content" / "Content can't be deplatformed"
  - "Keep 100% of earnings" / "No platform fees"
  - SuiNS badge as primary identity differentiator (`alice@suipatron.sui`)
  - Optional "On-chain proof of support" for supporters

### 1.3 Zero Friction Onboarding

- **No wallet install.** Sign in with Google → account ready.
- **No gas.** All actions except the support payment are sponsored (gasless).
- **Plain language.** Use "Log in", "Support", "Unlock content", "Confirm" — never "Sign message", "Approve transaction", "Connect wallet", "Pay gas".

### 1.4 SuiNS as Key Differentiator

- SuiNS subnames (`name@suipatron.sui`) are a primary feature, not an add-on.
- Display prominently on creator profile, cards, and header.
- Encourage creation during profile setup; treat as core identity, not secondary.

### 1.5 Must-Have Patreon Parity + SuiNS Differentiation

| Pattern | Implementation |
|---------|----------------|
| Creator profile layout | Hero section with avatar, name, SuiNS badge, bio, price, content grid |
| Content grid | Cards with title, type badge, lock/unlock state |
| Support CTA | Prominent "Support" button with price (e.g. "Support for 5 SUI") |
| Earnings panel | Balance, withdraw button, supporter count |
| Content upload | File picker, title, description, content type |
| Discovery | Explore grid of creator cards |
| **SuiNS (differentiator)** | Human-readable identity; badge; claim during onboarding |

---

## 2. Authentication & Onboarding

### 2.1 Sign-In Flow

**Primary CTA:** "Sign in with Google" (single button, primary styling).

- One click → redirect to Google OAuth.
- Callback → session established, redirect to dashboard (creator) or explore (new visitor).
- No password, no seed phrase, no wallet setup.
- Enoki manages account derivation (SSO-style); user sees only Google sign-in.

**Copy guidelines:**
- ✅ "Sign in with Google", "Log in securely"
- ❌ "Connect wallet", "Sign message", "Create wallet"

### 2.2 Auth Callback

- Dedicated route `/auth/callback`.
- Loading state during redirect processing.
- On success: redirect to intended destination or dashboard.
- On error: clear message + "Try again" CTA.

### 2.3 Session & Protected Routes

- Session persists across reloads.
- Dashboard, settings, content upload require auth.
- Unauthenticated access to dashboard → redirect to landing with sign-in CTA.
- Header shows user avatar + SuiNS (if set) when logged in.

---

## 3. Pages & Flows

### 3.1 Landing Page (`/`)

**Purpose:** Convert visitors to signed-in users. Communicate value for creators and supporters.

**Sections:**
1. **Hero:** Headline + subheadline + "Sign in with Google" CTA.
2. **Value prop (creators):** Keep 100% of earnings; content owned by you; human-readable identity (SuiNS).
3. **Value prop (supporters):** One-click support; on-chain proof; no platform fees.
4. **Light Web3 hints:** "Decentralized", "Content can't be deplatformed", "You own your support" — subtle, not technical.
5. **Footer:** Links, privacy, terms.

**Reference:** Patreon landing; Ko-fi; Gumroad. SuiPatron should feel as accessible.

---

### 3.2 Creator Profile Page (`/creator/:id`)

**Purpose:** Public creator presence. Drive support conversions.

**Layout (Patreon-inspired):**
- **Header:** Avatar (large), creator name, **SuiNS badge** (`name@suipatron.sui`), bio.
- **Price + CTA:** "Support for X SUI" — prominent, above the fold.
- **Content grid:** Cards with title, type badge (image/text/PDF), lock or unlock icon.
- **Supporter count:** "X supporters" near price.

**States:**
- **Visitor (no AccessPass):** Content cards show lock icon or blurred preview; CTA = "Support to unlock".
- **Supporter (has AccessPass):** Content unlocked; CTA = "You have access" or hidden.

**SuiNS:** Display as badge/chip next to name. Clickable to copy or resolve.

---

### 3.3 Support / Purchase Modal

**Trigger:** "Support" button on creator profile.

**Content:**
- Creator name + avatar.
- Price (e.g. "5 SUI").
- "Unlocks all content" or similar.
- "Confirm" / "Support" button.
- Note: "You'll need SUI to complete this. No gas fees."

**Flow:**
1. User confirms.
2. Sponsored tx executes (payment + AccessPass mint).
3. Loading state during tx.
4. Success: "Access granted" toast; modal closes; content unlocks.
5. Error: Human-readable message + "Try again".

**Copy:**
- ✅ "Confirm support", "Unlock all content", "Payment of 5 SUI"
- ❌ "Approve transaction", "Sign", "Gas fee"

---

### 3.4 Creator Dashboard (`/dashboard`)

**Purpose:** Creator hub for profile, content, earnings, supporters.

**Sections:**
1. **Profile editor:** Name, bio, avatar, price, SuiNS (claim or display).
2. **Content uploader:** "Add content" — file picker, title, description, type.
3. **Content list:** Published content with edit/delete (if supported) or view-only.
4. **Earnings panel:** Balance (SUI), "Withdraw" button, recent supporters.
5. **Supporter list:** Who has purchased (if indexer provides).

**SuiNS:**
- If not claimed: "Claim your SuiNS name" CTA (e.g. `yourname@suipatron.sui`).
- If claimed: Display prominently; optional "Change" if supported.

**Empty states:**
- No content: "Upload your first piece of content" + CTA.
- No earnings: "Earnings appear here when supporters pay."
- No supporters: "Your supporters will appear here."

---

### 3.5 Content Upload Flow

**Entry:** "Add content" or "Upload" in dashboard.

**Steps:**
1. Select file (image, PDF, text).
2. Title, description, content type (auto-detected or manual).
3. "Publish" — encrypt (SEAL) + upload (Walrus) + on-chain publish.
4. Progress feedback: "Encrypting…", "Uploading…", "Publishing…".
5. Success: Content appears in grid; toast confirmation.

**UX notes:**
- File size limits and type validation before upload.
- Clear error messages for failures (e.g. "Upload failed. Please try again.").

---

### 3.6 Content Viewer

**Purpose:** Render decrypted content (image, text, PDF).

**Flow:**
1. User clicks content card.
2. Download from Walrus → SEAL decrypt (seal_approve validates AccessPass).
3. Loading state during decrypt.
4. Render: image (lightbox), text (markdown/plain), PDF (embedded viewer).
5. Back/close to return to feed or creator page.

**States:**
- Locked (no AccessPass): Show teaser or "Support to unlock" overlay.
- Loading: Skeleton or spinner.
- Error: "Could not load content. Try again."

---

### 3.7 Supporter Feed (`/feed`)

**Purpose:** Single place for supporters to see content from creators they support.

**Layout:**
- List of creators the user has AccessPass for.
- Per creator: content cards (same as profile page, but unlocked).
- Click card → content viewer.

**Empty state:** "Support a creator to see their content here." + link to Explore.

---

### 3.8 Explore Page (`/explore`)

**Purpose:** Discover creators.

**Layout:**
- Grid of CreatorCards.
- Each card: avatar, name, SuiNS (if set), price, content count, supporter count.
- Search/filter (if indexer supports).
- Pagination or infinite scroll.

**Reference:** Patreon discover; Ko-fi explore.

---

### 3.9 Settings (`/settings`)

**Purpose:** Profile edit, SuiNS, account info.

**Sections:**
- Profile (name, bio, avatar) — may duplicate dashboard editor.
- SuiNS: claim, display, or change.
- Sign out.

---

## 4. Design System

### 4.1 Components

| Component | Variants | Notes |
|-----------|----------|-------|
| Button | Primary, secondary, ghost, destructive | Loading state for async actions |
| Card | Creator card, content card, earnings card | Consistent elevation, border radius |
| Modal | Confirm, support, content viewer | Overlay, ESC to close |
| Toast | Success, error, info | Auto-dismiss; actionable errors |
| Badge | Content type, SuiNS, access status | SuiNS badge = primary differentiator |
| Avatar | S, M, L | Fallback initial or placeholder |
| EmptyState | Per context | Illustration + CTA |
| LoadingSpinner / Skeleton | Per component | Reduce perceived latency |

### 4.2 Typography & Color

- **Typography:** Inter or similar; clear hierarchy (H1–H4, body, caption).
- **Color:** 
  - Primary accent for CTAs (e.g. indigo/violet).
  - SuiNS badge: distinct color to emphasize identity.
  - Success (green), error (red), neutral grays.
- **Theme:** Dark or light; ensure contrast and accessibility (WCAG).

### 4.3 Responsiveness

- **Mobile-first.** Creator content is often consumed on mobile.
- Breakpoints: mobile, tablet, desktop.
- Touch targets ≥ 44px on mobile.
- Grid adapts: 1 col mobile, 2–3 tablet, 3–4 desktop.

### 4.4 Accessibility

- WCAG 2.1 AA target.
- Keyboard navigation.
- Screen reader support for dynamic content (toasts, modals).
- Sufficient color contrast; do not rely on color alone.

---

## 5. Web3-Specific UX Guidelines

### 5.1 Copy Rules

| Do | Don't |
|----|-------|
| "Sign in with Google" | "Connect wallet" |
| "Support" / "Unlock" | "Subscribe" (we use one-time) |
| "Confirm" / "Complete" | "Sign" / "Approve transaction" |
| "Payment of X SUI" | "Gas fee", "Transaction fee" |
| "Your content" / "Creator-owned" | "On-chain", "Decentralized" (overuse) |
| "Human-readable identity" | "Wallet address", "Public key" |

### 5.2 Loading & Errors

- **Tx in progress:** Clear loading state (e.g. "Setting up your profile…", "Processing support…").
- **Tx success:** Toast + state update.
- **Tx error:** Human-readable message (e.g. "Something went wrong. Please try again.") + retry CTA. No raw error codes in UI.
- **Network error:** "Connection issue. Check your internet and try again."

### 5.3 SuiNS UX

- **Claim flow:** Simple input for subname (e.g. `alice` → `alice@suipatron.sui`). Validation (availability, format).
- **Display:** Badge/chip format; optional tooltip: "Your SuiNS identity".
- **Copy:** One-click copy of full SuiNS name.

---

## 6. Reference Materials

### 6.1 Inspiration

- **Patreon:** Creator profile layout, content grid, support CTA, earnings.
- **Ko-fi:** Simpler one-off support model.
- **Gumroad:** Creator product pages, minimal friction.
- **SuiPatron docs:** [SCOPE.md](SCOPE.md), [02-mvp-scope.md](core-planning/02-mvp-scope.md), [02-user-stories.md](suipatron/02-user-stories.md).

### 6.2 Technical Constraints

- **Auth:** Enoki zkLogin (Google only for MVP).
- **Transactions:** Sponsored via Enoki; no user gas.
- **Content:** Encrypted (SEAL), stored (Walrus); decrypt requires AccessPass.
- **Identity:** SuiNS subnames via backend `/api/subname`.

### 6.3 Routes Summary

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing | No |
| `/auth/callback` | Auth callback | No |
| `/explore` | Explore | No |
| `/creator/:id` | Creator profile | No |
| `/dashboard` | Creator dashboard | Yes |
| `/feed` | Supporter feed | Yes |
| `/settings` | Settings | Yes |

---

## 7. Deliverables

1. **Design system:** Components, tokens, typography, color.
2. **Wireframes / low-fidelity:** All pages and key flows.
3. **High-fidelity mockups:** Landing, creator profile, dashboard, support modal, content viewer, explore.
4. **Prototype:** Interactive flow for sign-in → create profile → upload content → support → view content.
5. **Responsive specs:** Breakpoints and layout behavior.
6. **Copy deck:** All primary CTAs, labels, and error messages.
7. **SuiNS UI spec:** Claim flow, display, badge treatment.

---

## 8. Success Criteria

- Creator can complete onboarding (sign in → create profile → set SuiNS → upload content) in &lt; 5 minutes.
- Supporter can discover creator → support → view content in &lt; 3 minutes.
- No blockchain jargon in primary user-facing copy.
- SuiNS visible and prominent as identity differentiator.
- Mobile-responsive; WCAG AA where feasible.
- All async actions have loading and error states.

---

**Document owner:** Product / Design  
**Last updated:** February 2025  
**Related:** [SCOPE.md](SCOPE.md), [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
