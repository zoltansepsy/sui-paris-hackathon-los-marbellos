# SuiPatron — UI/UX Design Briefing

> Enterprise-grade design specification for the SuiPatron MVP.
> This document is self-contained. A designer should be able to produce every screen, component, and interaction without external references.

---

## Table of Contents

1. [Product Context & Brand Identity](#1-product-context--brand-identity)
2. [Design System Foundation](#2-design-system-foundation)
3. [Technical Constraints](#3-technical-constraints)
4. [Information Architecture](#4-information-architecture)
5. [Screen-by-Screen Specification](#5-screen-by-screen-specification)
6. [User Flows](#6-user-flows)
7. [Component Library Specification](#7-component-library-specification)
8. [Micro-interactions & Motion Design](#8-micro-interactions--motion-design)
9. [Responsive Strategy](#9-responsive-strategy)
10. [Accessibility Requirements](#10-accessibility-requirements)
11. [Content Guidelines](#11-content-guidelines)
12. [Design Tokens (Figma-Ready)](#12-design-tokens-figma-ready)

---

## 1. Product Context & Brand Identity

### 1.1 What Is SuiPatron?

SuiPatron is a **decentralized creator support platform** built on the SUI blockchain. Creators publish exclusive content (images, text, PDFs). Supporters pay a **one-time flat price** set by the creator to unlock **all** of that creator's content permanently. There are no recurring subscriptions, no tiers, and no platform fees in the MVP.

**Key differentiators from Patreon/Ko-fi:**

| Dimension | Traditional Platforms | SuiPatron |
|---|---|---|
| Revenue share | 5–30% platform cut | 0% — creator keeps everything |
| Content access | Centralized servers, can be censored | Encrypted on Walrus, decrypted client-side via SEAL |
| Proof of support | None | On-chain AccessPass NFT |
| Authentication | Email/password, wallet required | Google sign-in (zkLogin), no wallet, no gas tokens |
| Identity | Username | Human-readable `name@suipatron.sui` via SuiNS |

### 1.2 Target Users

**Creators (supply side):**
- Independent artists, writers, photographers, educators
- Age 22–40, digitally native, curious about Web3 but not necessarily crypto-savvy
- Motivated by: keeping more revenue, censorship resistance, on-chain provenance
- Pain points: platform fees, deplatforming risk, no ownership of audience relationship

**Supporters (demand side):**
- Fans of independent creators, early adopters
- Age 18–35, comfortable with Google sign-in, may have zero crypto experience
- Motivated by: supporting creators directly, exclusive content, on-chain proof of patronage
- Pain points: subscription fatigue (prefer one-time payments), distrust of centralized middlemen

### 1.3 Brand Personality

| Attribute | Expression |
|---|---|
| **Trustworthy** | Clean layouts, clear pricing, visible on-chain proof. No hype language. |
| **Modern** | Dark theme, glass-morphism accents, smooth animations. Feels like a premium SaaS, not a crypto dApp. |
| **Approachable** | Friendly copy, no jargon (hide blockchain complexity). Google sign-in front and center. |
| **Creator-first** | Content showcased beautifully. Creator profiles feel like personal galleries. |
| **Transparent** | All payments visible, earnings shown clearly, transaction links to explorer. |

### 1.4 Brand Voice

- **Tone:** Confident but warm. Professional but not corporate. Web3-aware but jargon-free.
- **Do say:** "Support creators directly" / "Your content, your rules" / "One payment, permanent access"
- **Don't say:** "Mint your NFT" / "Connect your wallet" / "Gas fees" / "On-chain transaction"
- **Error messages:** Human, empathetic, actionable. Never raw error codes.

### 1.5 Competitive Visual Positioning

SuiPatron should feel like the intersection of:
- **Gumroad** (clean, creator-focused marketplace aesthetic)
- **Linear** (dark theme, polished micro-interactions, developer-grade precision)
- **Stripe** (trust through clarity, whitespace, structured information)

It should NOT feel like:
- A typical DeFi dashboard (dense data tables, neon gradients)
- A meme-coin landing page (aggressive CTAs, countdown timers)
- Patreon (dated, cluttered, ad-heavy)

---

## 2. Design System Foundation

### 2.1 Color Palette

#### Primary Palette

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--brand-primary` | `#6366F1` | `239 84% 67%` | Primary actions, links, active states, brand accent |
| `--brand-primary-hover` | `#4F46E5` | `239 84% 59%` | Hover state for primary elements |
| `--brand-primary-subtle` | `#EEF2FF` | `226 100% 97%` | Light backgrounds for primary-related surfaces (light mode) |
| `--brand-primary-muted` | `rgba(99,102,241,0.15)` | — | Subtle tints on dark backgrounds |

#### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#10B981` | Payment confirmed, content unlocked, withdrawal complete |
| `--success-subtle` | `rgba(16,185,129,0.15)` | Success badge backgrounds |
| `--warning` | `#F59E0B` | Pending states, low balance alerts |
| `--warning-subtle` | `rgba(245,158,11,0.15)` | Warning badge backgrounds |
| `--error` | `#EF4444` | Failed transactions, validation errors |
| `--error-subtle` | `rgba(239,68,68,0.15)` | Error badge backgrounds |
| `--info` | `#3B82F6` | Informational callouts, tips |

#### Dark Theme Surface Colors (Primary Theme)

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--bg-base` | `#0B0F1A` | `224 38% 7%` | Page background, deepest layer |
| `--bg-raised` | `#111827` | `221 39% 11%` | Cards, panels, raised surfaces |
| `--bg-overlay` | `#1F2937` | `215 28% 17%` | Modals, dropdowns, popovers |
| `--bg-elevated` | `#374151` | `215 19% 27%` | Hover states on raised surfaces, active items |
| `--bg-input` | `#1E293B` | `217 33% 17%` | Form input backgrounds |

#### Text Colors

| Token | Hex | Opacity | Usage |
|---|---|---|---|
| `--text-primary` | `#F9FAFB` | 100% | Headings, primary content |
| `--text-secondary` | `#9CA3AF` | — | Descriptions, secondary labels |
| `--text-tertiary` | `#6B7280` | — | Timestamps, metadata, placeholders |
| `--text-disabled` | `#4B5563` | — | Disabled elements |
| `--text-on-brand` | `#FFFFFF` | 100% | Text on primary-colored backgrounds |

#### Border & Divider Colors

| Token | Hex | Usage |
|---|---|---|
| `--border-default` | `rgba(255,255,255,0.08)` | Card borders, dividers |
| `--border-hover` | `rgba(255,255,255,0.16)` | Hover state borders |
| `--border-focus` | `#6366F1` | Focus rings (matches brand primary) |

### 2.2 Typography

**Font Stack:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Scale Name | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-lg` | 48px / 3rem | 1.1 | 700 (Bold) | -0.025em | Landing hero heading |
| `display-sm` | 36px / 2.25rem | 1.15 | 700 (Bold) | -0.02em | Section headings |
| `heading-lg` | 24px / 1.5rem | 1.25 | 600 (Semibold) | -0.015em | Page titles, card headings |
| `heading-md` | 20px / 1.25rem | 1.3 | 600 (Semibold) | -0.01em | Sub-section headings |
| `heading-sm` | 16px / 1rem | 1.4 | 600 (Semibold) | 0 | Card titles, labels |
| `body-lg` | 18px / 1.125rem | 1.6 | 400 (Regular) | 0 | Hero subtitles, feature descriptions |
| `body-md` | 16px / 1rem | 1.5 | 400 (Regular) | 0 | Paragraph text, descriptions |
| `body-sm` | 14px / 0.875rem | 1.5 | 400 (Regular) | 0 | Secondary text, metadata |
| `caption` | 12px / 0.75rem | 1.4 | 500 (Medium) | 0.02em | Badges, timestamps, labels |
| `overline` | 11px / 0.6875rem | 1.4 | 600 (Semibold) | 0.08em | Section overlines (uppercase) |

### 2.3 Spacing Scale

Based on a 4px base unit. All spacing uses these values exclusively.

| Token | Value | Common Usage |
|---|---|---|
| `--space-0` | 0px | — |
| `--space-1` | 4px | Inline icon padding, tight gaps |
| `--space-2` | 8px | Badge padding, compact gaps |
| `--space-3` | 12px | Button padding (vertical), input padding |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Medium content gaps |
| `--space-6` | 24px | Section padding, card internal spacing |
| `--space-8` | 32px | Major section gaps |
| `--space-10` | 40px | Page section breaks |
| `--space-12` | 48px | Hero section vertical padding |
| `--space-16` | 64px | Major layout spacing |
| `--space-20` | 80px | Page-level vertical padding |
| `--space-24` | 96px | Hero section top padding |

### 2.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Badges, small elements |
| `--radius-md` | 8px | Buttons, inputs, small cards |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, large containers |
| `--radius-2xl` | 24px | Feature cards, hero containers |
| `--radius-full` | 9999px | Avatars, pills, circular buttons |

### 2.5 Elevation (Shadows)

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle depth on cards |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Raised cards, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, popovers |
| `--shadow-glow` | `0 0 20px rgba(99,102,241,0.25)` | Primary CTA hover glow |
| `--shadow-inner` | `inset 0 1px 2px rgba(0,0,0,0.3)` | Pressed button state |

### 2.6 Glass-Morphism Effect

Used sparingly on feature cards, hero containers, and modal backdrops:

```css
background: rgba(17, 24, 39, 0.6);
backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### 2.7 Iconography

**Icon library:** Lucide React (consistent, MIT-licensed, 24x24 default grid)

| Category | Icons Needed |
|---|---|
| Navigation | Home, Compass (explore), LayoutDashboard, Rss (feed), Settings, LogOut |
| Actions | Upload, Download, Eye, EyeOff, Lock, Unlock, Copy, ExternalLink |
| Content types | Image, FileText, FileType (PDF) |
| Status | Check, X, AlertTriangle, Info, Loader2 (spinning) |
| Social | Heart, Users, Star, Wallet |
| Brand | Shield (security), Zap (gasless), Globe (decentralized), Key (encryption) |

**Icon sizing:**
- Inline (in text/buttons): 16px
- Standard (navigation, card icons): 20px
- Feature (landing page features): 24px
- Hero illustrations: 40–48px

### 2.8 Illustration Style

For empty states and the landing page:
- Flat, minimal vector illustrations
- Use brand primary (`#6366F1`) as the dominant color with muted backgrounds
- Geometric shapes preferred over organic/hand-drawn
- Style reference: Linear.app empty states, Stripe documentation illustrations

---

## 3. Technical Constraints

### 3.1 Framework & Tooling

| Layer | Technology | Implication for Design |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components; pages can stream partial UI |
| Styling | Tailwind CSS 3.4 + CVA | All design tokens must map to Tailwind config values |
| UI Primitives | Radix UI (via Slot pattern) | Accessible primitives for modals, dropdowns, tooltips |
| Animation | tailwindcss-animate | CSS-based animations only (no Framer Motion) |
| Icons | Lucide React | SVG icons, tree-shakeable |
| State | React Query (TanStack) | Data fetching has loading/error/success states built-in |

### 3.2 Existing Components (Already Built)

| Component | Status | Notes |
|---|---|---|
| `Button` | Built | Variants: default, outline, secondary, ghost. Sizes: sm, default, lg. |
| `Card` | Built | Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Everything else | Not built | All other components need to be designed and implemented |

### 3.3 Third-Party UI Elements

| Element | Source | Styling Control |
|---|---|---|
| Google Sign-In button | Custom implementation (Enoki zkLogin) | Full control — we render our own button |
| Wallet info display | dApp Kit `ConnectButton` | Limited styling — can wrap with custom component |

### 3.4 Content Types to Render

The design must include viewers/renderers for:

| Type | File Extensions | Render Approach |
|---|---|---|
| Image | .png, .jpg, .jpeg, .gif, .webp | `<img>` with lightbox modal |
| Text/Article | .txt, .md | Rendered markdown with prose typography |
| PDF | .pdf | Embedded PDF viewer (iframe or react-pdf) |

---

## 4. Information Architecture

### 4.1 Sitemap

```
SuiPatron
│
├── / (Landing Page) ← Public
│   └── [Sign in with Google] → /auth/callback → /explore
│
├── /auth/callback ← Auth handler (no visible UI, redirect only)
│
├── /explore ← Public (browsable without auth)
│   └── Creator cards grid
│       └── Click card → /creator/:id
│
├── /creator/:id ← Public profile page
│   ├── Creator header (name, bio, avatar, price, SuiNS badge)
│   ├── "Support" button → Purchase modal
│   └── Content grid
│       └── Click content → Content viewer (inline or modal)
│
├── /dashboard ← Authenticated (creator only)
│   ├── Profile editor tab
│   ├── Content management tab
│   │   └── Upload content modal
│   ├── Earnings tab
│   │   └── Withdraw button → Confirmation modal
│   └── Supporters tab
│
├── /feed ← Authenticated (supporter only)
│   ├── Supported creators sidebar/list
│   └── Content feed from all supported creators
│       └── Click content → Content viewer
│
└── /settings ← Authenticated
    ├── Profile info
    ├── SuiNS name management
    └── Account info (address, session)
```

### 4.2 Navigation Model

**Header (persistent across all pages):**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo: SuiPatron]    Explore    Dashboard    Feed    [Avatar ▾]    │
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---|---|
| Logo | Always visible. Links to `/explore` if authenticated, `/` if not. |
| Explore | Visible always. Links to `/explore`. |
| Dashboard | Visible only for authenticated users who have a creator profile. |
| Feed | Visible only for authenticated users. |
| Avatar dropdown | Shows: SuiNS name or truncated address, Settings link, Sign Out. |
| Pre-auth state | Navigation shows only: Logo, Explore, "Sign in with Google" button. |

**Mobile navigation:** Bottom tab bar with icons (Explore, Dashboard, Feed, Profile).

### 4.3 Page Access Matrix

| Page | Unauthenticated | Authenticated (No Profile) | Authenticated (Creator) |
|---|---|---|---|
| Landing `/` | Full access | Redirect to `/explore` | Redirect to `/explore` |
| Explore `/explore` | Full access | Full access | Full access |
| Creator Profile `/creator/:id` | Full access (Support button prompts sign-in) | Full access | Full access |
| Dashboard `/dashboard` | Redirect to `/` | Show "Create Profile" CTA | Full access |
| Feed `/feed` | Redirect to `/` | Full access (may be empty) | Full access |
| Settings `/settings` | Redirect to `/` | Full access | Full access |

---

## 5. Screen-by-Screen Specification

### 5.1 Landing Page (`/`)

**Purpose:** Convert visitors to sign-ups. Communicate the value proposition in under 10 seconds.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]                                     [Sign in with Google]    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                     ┌─────────────────────┐                          │
│                     │  HERO SECTION        │                          │
│                     │                     │                          │
│                     │  "Support creators. │                          │
│                     │   Own your access." │                          │
│                     │                     │                          │
│                     │  Subtitle text      │                          │
│                     │                     │                          │
│                     │  [Get Started]      │                          │
│                     │  [Explore Creators] │                          │
│                     └─────────────────────┘                          │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Feature 1    │  │ Feature 2    │  │ Feature 3    │               │
│  │              │  │              │  │              │               │
│  │ Gasless      │  │ Encrypted    │  │ Decentralized│               │
│  │ Sign in with │  │ Content is   │  │ No middleman │               │
│  │ Google. No   │  │ encrypted    │  │ can censor   │               │
│  │ wallet, no   │  │ with SEAL.   │  │ or remove    │               │
│  │ gas tokens.  │  │ Only paid    │  │ your content.│               │
│  │              │  │ supporters   │  │              │               │
│  │ [Zap icon]   │  │ can decrypt. │  │ [Globe icon] │               │
│  │              │  │ [Key icon]   │  │              │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  "How It Works" — 3-step horizontal flow                             │
│                                                                      │
│  ① Sign in with Google   ② Find a creator   ③ Pay once,             │
│     (no wallet needed)      you love            access forever       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Bottom CTA: "Ready to support creators?"                            │
│              [Get Started — it's free]                                │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  Footer: Built on SUI  |  Powered by SEAL + Walrus  |  GitHub       │
└──────────────────────────────────────────────────────────────────────┘
```

**Content Hierarchy:**
1. Hero heading — `display-lg`, bold, centered
2. Hero subtitle — `body-lg`, `--text-secondary`, centered, max 2 lines
3. Primary CTA — Large `Button` (brand-primary), "Get Started" → triggers Google sign-in
4. Secondary CTA — Ghost `Button`, "Explore Creators" → navigates to `/explore`
5. Feature cards — 3-column grid, glass-morphism cards with icon + heading + description
6. How It Works — 3-step numbered horizontal flow
7. Bottom CTA — Repeated sign-in prompt
8. Footer — Minimal: ecosystem links, GitHub

**Visual Treatment:**
- Hero section: Subtle gradient mesh or animated grain background behind the heading
- Feature cards: Glass-morphism with `--bg-raised` background, subtle border glow on hover
- "How It Works" steps: Connected by a horizontal line/arrow, numbered with brand-primary circles

**States:**
- Only one state: the page always renders the same (no loading/error/empty states)
- If user is already authenticated: redirect to `/explore` (never show the landing page)

---

### 5.2 Explore Page (`/explore`)

**Purpose:** Browse and discover creators. Primary entry point for supporters.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header with navigation]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Explore Creators                              [Search input 🔍]    │
│  Discover and support independent creators                           │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │ Avatar    │  │ Avatar    │  │ Avatar    │  │ Avatar    │        │
│  │           │  │           │  │           │  │           │        │
│  │ Name      │  │ Name      │  │ Name      │  │ Name      │        │
│  │ @suins    │  │ @suins    │  │ @suins    │  │ @suins    │        │
│  │           │  │           │  │           │  │           │        │
│  │ Bio       │  │ Bio       │  │ Bio       │  │ Bio       │        │
│  │ (2 lines) │  │ (2 lines) │  │ (2 lines) │  │ (2 lines) │        │
│  │           │  │           │  │           │  │           │        │
│  │ 5 SUI     │  │ 2 SUI     │  │ 10 SUI    │  │ 1 SUI     │        │
│  │ 23 fans   │  │ 8 fans    │  │ 45 fans   │  │ 3 fans    │        │
│  │ 12 posts  │  │ 5 posts   │  │ 30 posts  │  │ 1 post    │        │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │
│                                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │  ...       │  │  ...       │  │  ...       │  │  ...       │        │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │
│                                                                      │
│                    [Load More] or infinite scroll                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Creator Card Anatomy:**

```
┌─────────────────────────┐
│  ┌──────┐               │
│  │Avatar│  Creator Name  │
│  │64x64 │  @name.suipatron │
│  └──────┘               │
│                         │
│  Bio text, truncated    │
│  to 2 lines max...      │
│                         │
│  ─────────────────────  │
│                         │
│  💰 5 SUI    👥 23      │
│  (price)     (supporters)│
│  📄 12 posts            │
│                         │
└─────────────────────────┘
```

**Card Details:**
- Avatar: 64x64px, `--radius-full`, fallback to initials on colored circle (brand-primary)
- Creator name: `heading-sm`, `--text-primary`
- SuiNS badge: `caption`, `--text-tertiary`, shown as `@name.suipatron` if available
- Bio: `body-sm`, `--text-secondary`, max 2 lines with ellipsis
- Divider: 1px `--border-default`
- Price: `body-sm`, `--text-primary`, bold, with SUI icon
- Supporters count: `caption`, `--text-tertiary`, with Users icon
- Content count: `caption`, `--text-tertiary`, with FileText icon
- Card: `--bg-raised`, `--radius-lg`, `--border-default`, `--shadow-sm`
- Hover: border transitions to `--border-hover`, subtle `translateY(-2px)` lift

**Grid Layout:**
- Desktop (1280px+): 4 columns, 24px gap
- Tablet (768px–1279px): 3 columns, 20px gap
- Mobile (< 768px): 1 column (full-width cards), 16px gap

**Search Bar:**
- Placeholder: "Search creators by name..."
- Position: Top-right on desktop, full-width above grid on mobile
- Behavior: Client-side filter (no server search in MVP)

**States:**

| State | Visual |
|---|---|
| **Loading** | 8 skeleton cards (pulse animation) matching card dimensions |
| **Empty (no creators)** | Centered illustration + "No creators yet" + "Be the first — create your profile" CTA |
| **Empty (search no results)** | Centered illustration + "No creators match '{query}'" + "Try a different search" |
| **Error (fetch failed)** | Centered error icon + "Something went wrong" + "Try again" button |
| **Populated** | Grid of creator cards |

---

### 5.3 Creator Profile Page (`/creator/:id`)

**Purpose:** View a specific creator's profile and content. Purchase access. View unlocked content.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header with navigation]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    CREATOR HEADER                             │    │
│  │                                                              │    │
│  │  ┌────────┐                                                  │    │
│  │  │ Avatar │   Creator Name                                   │    │
│  │  │ 96x96  │   @name.suipatron  ✓                             │    │
│  │  └────────┘                                                  │    │
│  │                                                              │    │
│  │  Bio text goes here. Can be multiple lines. This is the      │    │
│  │  creator's description of themselves and their content.      │    │
│  │                                                              │    │
│  │  ┌─────────────┐  ┌──────────┐  ┌──────────────┐            │    │
│  │  │ 45 Supporters│  │ 12 Posts │  │ Joined Dec '24│            │    │
│  │  └─────────────┘  └──────────┘  └──────────────┘            │    │
│  │                                                              │    │
│  │  ┌────────────────────────────────────────────┐              │    │
│  │  │  Support this creator                       │              │    │
│  │  │  One-time payment: 5 SUI                    │              │    │
│  │  │  Unlock all content permanently             │              │    │
│  │  │  [Support for 5 SUI]                        │              │    │
│  │  └────────────────────────────────────────────┘              │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Content (12 items)                                                  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ 🔒/🔓    │  │ 🔒/🔓    │  │ 🔒/🔓    │  │ 🔒/🔓    │            │
│  │ Thumb    │  │ Thumb    │  │ Thumb    │  │ Thumb    │            │
│  │          │  │          │  │          │  │          │            │
│  │ Title    │  │ Title    │  │ Title    │  │ Title    │            │
│  │ [IMG]    │  │ [PDF]    │  │ [TXT]    │  │ [IMG]    │            │
│  │ 2h ago   │  │ 1d ago   │  │ 3d ago   │  │ 1w ago   │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Creator Header Section:**
- Avatar: 96x96px, `--radius-full`
- Name: `heading-lg`, `--text-primary`
- SuiNS: `body-sm`, `--brand-primary`, with verified badge icon
- Bio: `body-md`, `--text-secondary`, full text (no truncation)
- Stats: Row of stat badges (Supporters, Posts, Joined date) with icons
- Support CTA panel: Prominent card with price, description, and primary action button

**Content Card Anatomy:**

```
┌─────────────────────────┐
│ [Lock/Unlock icon]  [Type badge: IMG/PDF/TXT]
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │  Thumbnail or     │  │
│  │  placeholder       │  │
│  │  (blurred if       │  │
│  │  locked)           │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Content Title          │
│  2 hours ago            │
└─────────────────────────┘
```

**Content Card Details:**
- Lock icon: Top-left overlay, 🔒 (locked, `--text-tertiary`) or 🔓 (unlocked, `--success`)
- Type badge: Top-right pill badge (IMG = blue, PDF = red, TXT = green)
- Thumbnail: For images, show blurred thumbnail when locked; for PDF/text, show type-specific placeholder icon
- Title: `heading-sm`, `--text-primary`, max 2 lines
- Timestamp: `caption`, `--text-tertiary`, relative format ("2h ago", "3d ago")

**Support CTA Panel (Visitor / Non-supporter):**

```
┌────────────────────────────────────────────┐
│  Support this creator                       │
│                                            │
│  One-time payment · Permanent access        │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │        Support for 5 SUI             │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ✓ Unlock all current & future content     │
│  ✓ On-chain proof of support (NFT)         │
│  ✓ 100% goes to the creator                │
└────────────────────────────────────────────┘
```

**Access Granted State (Supporter):**
Replace the Support CTA panel with:

```
┌────────────────────────────────────────────┐
│  ✓ Access Granted                           │
│                                            │
│  You supported this creator on Dec 15, 2024 │
│  Amount paid: 5 SUI                         │
│                                            │
│  [View AccessPass on Explorer ↗]            │
└────────────────────────────────────────────┘
```
- Background: `--success-subtle`
- Check icon: `--success`
- "View on Explorer" link: `body-sm`, `--brand-primary`

**States Matrix:**

| State | Header | Content Grid | Support Panel |
|---|---|---|---|
| **Loading** | Skeleton | 4 skeleton cards | Skeleton |
| **Creator not found** | — | Full-page "Creator not found" + "Back to Explore" | — |
| **No access (visitor)** | Full | Cards with blurred thumbnails + lock icons | "Support for X SUI" CTA |
| **No access (signed in)** | Full | Cards with blurred thumbnails + lock icons | "Support for X SUI" CTA |
| **Has access** | Full + "Access Granted" badge on avatar | Cards unlocked, clickable | "Access Granted" confirmation |
| **No content yet** | Full | "This creator hasn't published content yet" | Support CTA still visible |
| **Own profile** | Full + "Edit Profile" button | Cards always unlocked | Hidden (show "Go to Dashboard" link instead) |

---

### 5.4 Purchase Confirmation Modal

**Triggered by:** Clicking "Support for X SUI" button on Creator Profile page.

**Layout:**

```
┌──────────────────────────────────────────────┐
│                                              │
│  Confirm Support                       [✕]   │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌──────┐  Creator Name                      │
│  │Avatar│  @name.suipatron                   │
│  └──────┘                                    │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  Payment Summary                             │
│                                              │
│  Access price              5.000 SUI         │
│  Gas fees                  Sponsored (Free)  │
│  ──────────────────────────────────────────  │
│  Total                     5.000 SUI         │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  You'll receive:                             │
│  • Permanent access to all content           │
│  • AccessPass NFT as proof of support        │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │         Confirm & Pay 5 SUI          │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │             Cancel                    │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

**Modal States:**

| State | Visual |
|---|---|
| **Default** | As shown above |
| **Processing** | "Confirm & Pay" button shows spinner + "Processing..." text. Disable Cancel. |
| **Success** | Modal content transitions to: large check icon + "Access Granted!" + confetti animation + "View Content" button |
| **Error** | Modal shows inline error message above buttons: "Transaction failed. Please try again." + Reset to default state. |
| **Insufficient funds** | Price line shows warning icon + "Insufficient SUI balance" in `--error`. Confirm button disabled. |

---

### 5.5 Creator Dashboard (`/dashboard`)

**Purpose:** Creator's command center. Manage profile, upload content, view earnings, see supporters.

**Layout (tab-based):**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header with navigation]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Dashboard                                                           │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Earnings │ │Supporters│ │ Content  │ │ Profile  │               │
│  │ 125 SUI  │ │    23    │ │    12    │ │ Complete │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│  [Profile]  [Content]  [Earnings]  [Supporters]  ← Tab navigation   │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                      │
│  [Active tab content renders below]                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Stats Row (always visible):**
4 stat cards in a horizontal row at the top:
- **Earnings:** Total SUI earned (with SUI icon), `heading-lg`, `--text-primary`
- **Supporters:** Total supporter count, `heading-lg`, `--text-primary`
- **Content:** Total published content count, `heading-lg`, `--text-primary`
- **Profile:** Completion status badge (Complete / Incomplete), `heading-sm`

Each stat card: `--bg-raised`, `--radius-lg`, padding 24px, with label (`caption`, `--text-tertiary`) above the value.

#### 5.5.1 Profile Tab

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Profile Settings                                                    │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐     │
│  │                      │  │ Creator Name                      │     │
│  │   ┌──────────────┐   │  │ [________________________]        │     │
│  │   │              │   │  │                                  │     │
│  │   │   Avatar     │   │  │ Bio                              │     │
│  │   │   preview    │   │  │ [________________________]        │     │
│  │   │              │   │  │ [________________________]        │     │
│  │   └──────────────┘   │  │ [________________________]        │     │
│  │                      │  │                                  │     │
│  │   [Change Avatar]    │  │ Access Price (SUI)               │     │
│  │                      │  │ [_____5_____]                     │     │
│  └──────────────────────┘  │                                  │     │
│                            │ SuiNS Name                       │     │
│                            │ @name.suipatron ✓ (read-only)    │     │
│                            │                                  │     │
│                            │ [Save Changes]                   │     │
│                            └──────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Form Fields:**
- **Creator Name:** Text input, required, max 50 chars
- **Bio:** Textarea, optional, max 500 chars, with character counter
- **Access Price:** Number input with SUI suffix, required, min 0.001
- **Avatar:** Click-to-upload area (128x128 preview), accepts .png/.jpg/.webp, max 2MB
- **SuiNS Name:** Read-only display if set, or "Claim your @name.suipatron" button if not

**Form States:**
- Default: All fields populated from on-chain data
- Dirty (unsaved changes): "Save Changes" button becomes active (brand-primary)
- Saving: Button shows spinner + "Saving..."
- Saved: Success toast "Profile updated" (auto-dismiss 3s)
- Error: Error toast with message + form fields retain entered values

#### 5.5.2 Content Tab

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Your Content                                   [+ Upload Content]   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ [Thumb]  Title of content                        IMG  2h ago │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ [Thumb]  Another piece of content                PDF  1d ago │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ [Thumb]  My latest article                       TXT  3d ago │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ [Thumb]  Gallery photo set                       IMG  1w ago │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Content List Item:**
- Thumbnail: 48x48, rounded, type-specific placeholder or actual preview
- Title: `heading-sm`, `--text-primary`
- Type badge: Pill badge (IMG/PDF/TXT) with type-specific color
- Timestamp: `caption`, `--text-tertiary`, relative

**Empty State:**

```
┌──────────────────────────────────────────────┐
│                                              │
│        [Upload illustration]                 │
│                                              │
│   No content published yet                   │
│                                              │
│   Upload your first piece of exclusive       │
│   content for your supporters.               │
│                                              │
│   [+ Upload Your First Content]              │
│                                              │
└──────────────────────────────────────────────┘
```

#### 5.5.3 Content Upload Modal

**Triggered by:** "Upload Content" button on Content tab.

```
┌──────────────────────────────────────────────┐
│                                              │
│  Upload Content                        [✕]   │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │         Drag & drop your file        │    │
│  │         or click to browse           │    │
│  │                                      │    │
│  │     Supports: PNG, JPG, PDF, TXT     │    │
│  │              Max size: 5MB           │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Title *                                     │
│  [_______________________________________]   │
│                                              │
│  Description                                 │
│  [_______________________________________]   │
│  [_______________________________________]   │
│                                              │
│  Content Type (auto-detected)                │
│  [Image ▾]                                   │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │          Encrypt & Upload             │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │             Cancel                    │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

**Upload Flow States (button label changes):**

| Step | Button Label | Progress Indicator |
|---|---|---|
| 1. File selected | "Encrypt & Upload" | — |
| 2. Encrypting | "Encrypting with SEAL..." | Indeterminate progress bar |
| 3. Uploading to Walrus | "Uploading to Walrus..." | Progress bar (if available) |
| 4. Publishing on-chain | "Publishing on-chain..." | Spinner |
| 5. Done | "Content Published!" | Check icon, auto-close after 2s |
| Error at any step | "Upload Failed — Try Again" | Error message above button |

**File Drop Zone States:**
- Default: Dashed border `--border-default`, centered icon + text
- Drag over: Border becomes `--brand-primary`, background becomes `--brand-primary-muted`
- File selected: Shows file preview (image thumb / file icon + filename + size), with "Remove" option
- Invalid file: Shake animation + error text "Unsupported file type"

#### 5.5.4 Earnings Tab

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Earnings                                                            │
│                                                                      │
│  ┌──────────────────────────────────────┐                            │
│  │                                      │                            │
│  │  Available Balance                   │                            │
│  │                                      │                            │
│  │  125.500 SUI                         │                            │
│  │  ≈ $XXX.XX USD                       │                            │
│  │                                      │                            │
│  │  [Withdraw All]                      │                            │
│  │                                      │                            │
│  └──────────────────────────────────────┘                            │
│                                                                      │
│  Recent Transactions                                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ ↓ Received  5 SUI   from 0x1a2b...   2 hours ago  [↗]       │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ ↑ Withdrawn 50 SUI  to 0x3c4d...     3 days ago   [↗]       │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ ↓ Received  10 SUI  from 0x5e6f...   1 week ago   [↗]       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Balance Card:**
- Large balance display: `display-sm`, `--text-primary`
- USD estimate (optional, can be deferred): `body-sm`, `--text-tertiary`
- "Withdraw All" button: brand-primary, full width within card
- If balance is 0: Button disabled, text reads "No balance to withdraw"

**Transaction List:**
- Received (incoming): Green arrow icon + `--success` text
- Withdrawn (outgoing): Orange arrow icon + `--warning` text
- Address: Truncated (0x1a2b...3c4d), monospace font
- Explorer link: ExternalLink icon, opens SUI explorer in new tab
- Empty state: "No transactions yet. Earnings will appear here when supporters purchase access."

**Withdrawal Confirmation Modal:**

```
┌──────────────────────────────────────────────┐
│                                              │
│  Withdraw Earnings                     [✕]   │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  Amount               125.500 SUI            │
│  Destination           0x1a2b...3c4d         │
│  Gas fees              Sponsored (Free)      │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │       Confirm Withdrawal              │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │             Cancel                    │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

#### 5.5.5 Supporters Tab

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Your Supporters (23)                                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ [Avatar]  0x1a2b...3c4d    5 SUI    Dec 15, 2024   [↗]      │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ [Avatar]  @alice.suipatron  10 SUI   Dec 10, 2024   [↗]      │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │ [Avatar]  0x5e6f...7a8b    5 SUI    Dec 5, 2024    [↗]      │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Supporter Row:**
- Avatar: 32x32, fallback to Jazzicon or gradient based on address
- Identity: SuiNS name if available, otherwise truncated address (monospace)
- Amount paid: `body-sm`, `--text-primary`, with SUI icon
- Date: `caption`, `--text-tertiary`, absolute date format
- Explorer link: ExternalLink icon (view AccessPass NFT)

**Empty State:** "No supporters yet. Share your profile to get started!"

#### 5.5.6 Dashboard — No Creator Profile State

If an authenticated user navigates to `/dashboard` but has no CreatorProfile:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│           [Creator illustration]                                     │
│                                                                      │
│     Become a Creator on SuiPatron                                    │
│                                                                      │
│     Set your price, publish encrypted content,                       │
│     and earn directly from your supporters.                          │
│                                                                      │
│     ┌────────────────────────────────────┐                           │
│     │     Create Your Creator Profile     │                           │
│     └────────────────────────────────────┘                           │
│                                                                      │
│     ✓ No platform fees — keep 100%                                   │
│     ✓ Content encrypted and censorship-resistant                     │
│     ✓ Get your own @name.suipatron identity                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Clicking "Create Your Creator Profile" opens the **Create Profile Modal** (same layout as Profile Tab form, but in a modal with a "Create Profile" submit button).

---

### 5.6 Supporter Feed (`/feed`)

**Purpose:** Aggregated content feed from all creators the supporter has purchased access to.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header with navigation]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Your Feed                                                           │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐  │
│  │                      │  │                                      │  │
│  │  Supported Creators  │  │  ┌──────────────────────────────┐    │  │
│  │                      │  │  │ [Avatar] Creator Name         │    │  │
│  │  ┌────────────────┐  │  │  │ Title of content              │    │  │
│  │  │ [A] Creator 1  │  │  │  │ Description preview...        │    │  │
│  │  ├────────────────┤  │  │  │ [IMG]  2 hours ago            │    │  │
│  │  │ [A] Creator 2  │  │  │  │                              │    │  │
│  │  ├────────────────┤  │  │  │  ┌──────────────────────┐    │    │  │
│  │  │ [A] Creator 3  │  │  │  │  │   [Content preview   │    │    │  │
│  │  └────────────────┘  │  │  │  │    or thumbnail]      │    │    │  │
│  │                      │  │  │  └──────────────────────┘    │    │  │
│  │  Total: 3 creators   │  │  └──────────────────────────────┘    │  │
│  │  12 content items    │  │                                      │  │
│  │                      │  │  ┌──────────────────────────────┐    │  │
│  │                      │  │  │ [Avatar] Creator Name         │    │  │
│  │                      │  │  │ Another content title         │    │  │
│  │                      │  │  │ ...                           │    │  │
│  │                      │  │  └──────────────────────────────┘    │  │
│  │                      │  │                                      │  │
│  └──────────────────────┘  └──────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Left Sidebar — Supported Creators:**
- List of creators the user has AccessPasses for
- Each item: 32px avatar + creator name
- Clicking a creator filters the feed to only their content
- "All" option at top to show all content
- Active filter highlighted with `--brand-primary` left border

**Main Feed — Content Cards:**
- Cards sorted by `created_at` descending (newest first)
- Each card shows: creator avatar + name, content title, description (2 lines), type badge, timestamp
- Clicking a card opens the content viewer

**Feed Content Card (expanded format):**

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌──────┐  Creator Name   @name.suipatron          2 hours ago      │
│  │Avatar│                                                            │
│  └──────┘                                                            │
│                                                                      │
│  Content Title                                                  [IMG]│
│  Description text, can be 2-3 lines. This is the creator's          │
│  description of this content piece.                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │           [Thumbnail / Preview]                               │    │
│  │           (click to view full content)                        │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**States:**

| State | Visual |
|---|---|
| **Loading** | 3 skeleton feed cards |
| **No AccessPasses** | "You haven't supported any creators yet." + "Explore Creators" CTA |
| **Has passes but no content** | "Your supported creators haven't published content yet. Check back soon!" |
| **Populated** | Feed cards sorted by date |

---

### 5.7 Content Viewer

**Triggered by:** Clicking on an unlocked content card (on Creator Profile or Feed page).

The viewer can be implemented as a **full-width inline expansion** or a **modal/overlay**. Modal is recommended for the MVP for simplicity.

**Image Viewer:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                              [✕]     │
│                                                                      │
│                                                                      │
│                    ┌──────────────────────┐                          │
│                    │                      │                          │
│                    │                      │                          │
│                    │    Full-resolution    │                          │
│                    │    decrypted image    │                          │
│                    │                      │                          │
│                    │                      │                          │
│                    └──────────────────────┘                          │
│                                                                      │
│  Title of the image                                                  │
│  Description text from the creator                                   │
│  Published Dec 15, 2024                                              │
│                                                                      │
│  [Download] [← Previous]  [Next →]                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Text/Article Viewer:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                              [✕]     │
│                                                                      │
│  Article Title                                                       │
│  Published Dec 15, 2024                                              │
│                                                                      │
│  ──────────────────────────────────────────────────────────────      │
│                                                                      │
│  Rendered markdown content here. Supports headers, bold, italic,     │
│  lists, code blocks, links, and images.                              │
│                                                                      │
│  ## Subheading                                                       │
│                                                                      │
│  More text content with proper prose typography...                    │
│                                                                      │
│  ──────────────────────────────────────────────────────────────      │
│                                                                      │
│  [Download .md] [← Previous]  [Next →]                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**PDF Viewer:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                              [✕]     │
│                                                                      │
│  PDF Title                                                           │
│  Published Dec 15, 2024                                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │              Embedded PDF viewer                              │    │
│  │              (react-pdf or iframe)                            │    │
│  │                                                              │    │
│  │              Page 1 of 5                                      │    │
│  │              [← Prev] [Next →] [Zoom]                        │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [Download PDF]                                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Decryption Loading State:**
Before content renders, show a decryption progress indicator:

```
┌──────────────────────────────────────────────┐
│                                              │
│         [Key/Shield animated icon]           │
│                                              │
│         Decrypting content...                │
│                                              │
│         This may take a moment the           │
│         first time.                          │
│                                              │
│         [progress spinner]                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 5.8 Settings Page (`/settings`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header with navigation]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Settings                                                            │
│                                                                      │
│  Account                                                             │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ Signed in as                                                 │    │
│  │ user@gmail.com                                               │    │
│  │                                                              │    │
│  │ SUI Address                                                  │    │
│  │ 0x1a2b3c4d5e6f...  [Copy]                                   │    │
│  │                                                              │    │
│  │ SuiNS Name                                                  │    │
│  │ @name.suipatron  OR  [Claim your @name]                      │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Session                                                             │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ Network: Testnet                                             │    │
│  │ Session expires: in 23 hours                                 │    │
│  │                                                              │    │
│  │ [Sign Out]                                                   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. User Flows

### 6.1 Flow 1: Creator Onboarding

```
[Landing Page]
    │
    ▼
[Click "Sign in with Google"]
    │
    ▼
[Google OAuth popup / redirect] ← (external)
    │
    ▼
[/auth/callback] ← (processing screen: spinner + "Setting up your account...")
    │
    ▼
[Redirect to /explore]
    │
    ▼
[User clicks "Dashboard" in nav]
    │
    ▼
[/dashboard shows "Create Profile" CTA] ← (no profile exists yet)
    │
    ▼
[Click "Create Your Creator Profile"]
    │
    ▼
[Create Profile Modal opens]
    │
    ├─ Fill: Name (required)
    ├─ Fill: Bio (optional)
    ├─ Fill: Access Price in SUI (required)
    ├─ Upload: Avatar (optional)
    │
    ▼
[Click "Create Profile"]
    │
    ▼
[Button: "Creating profile..." with spinner] ← sponsored transaction
    │
    ▼
[Success toast: "Profile created!"]
[Modal closes]
[Dashboard renders with full tab navigation]
    │
    ▼
[(Optional) Backend auto-creates SuiNS subname]
[Toast: "Your identity: @name.suipatron"]
```

**Key Design Moments:**
- Auth callback page: Minimal — centered spinner + brief text. Should last < 3 seconds.
- Create Profile modal: Feel premium, not like a boring form. Use subtle animation on open.
- Success moment: Use the success toast pattern consistently.

### 6.2 Flow 2: Content Upload (Creator)

```
[Dashboard → Content tab]
    │
    ▼
[Click "+ Upload Content" button]
    │
    ▼
[Upload Content Modal opens]
    │
    ├─ Drag-and-drop file OR click to browse
    ├─ File appears as preview (image thumb or file icon)
    ├─ Content type auto-detected
    ├─ Fill: Title (required)
    ├─ Fill: Description (optional)
    │
    ▼
[Click "Encrypt & Upload"]
    │
    ├─ Step 1: "Encrypting with SEAL..." (indeterminate bar)
    ├─ Step 2: "Uploading to Walrus..." (progress bar if available)
    ├─ Step 3: "Publishing on-chain..." (spinner)
    │
    ▼
[Step 4: "Content Published!" — check icon]
    │
    ▼
[Modal auto-closes after 2s]
[Content appears at top of content list]
[Success toast: "Content published successfully"]
```

**Key Design Moments:**
- Multi-step progress: The button label changes to communicate each step clearly. Users should never wonder "is it working?"
- File preview: Immediate visual feedback that the right file was selected.

### 6.3 Flow 3: Supporter Purchase

```
[/explore — browse creator cards]
    │
    ▼
[Click on a creator card]
    │
    ▼
[/creator/:id loads]
[Content cards show blurred thumbnails + lock icons]
[Support CTA panel shows price]
    │
    ▼
[Click "Support for 5 SUI"]
    │
    ▼
[Purchase Confirmation Modal opens]
    │
    ├─ Shows: creator info, price, gas (sponsored), total
    ├─ Shows: what they receive (permanent access + NFT)
    │
    ▼
[Click "Confirm & Pay 5 SUI"]
    │
    ▼
[Button: "Processing..." with spinner]
    │
    ▼
[Modal transitions to success state]
    │
    ├─ Large check icon
    ├─ "Access Granted!" heading
    ├─ Subtle confetti animation
    ├─ "View Content" button
    │
    ▼
[Click "View Content" OR close modal]
    │
    ▼
[Page updates:]
    ├─ Support CTA panel → "Access Granted" confirmation
    ├─ Content cards → thumbnails unblurred, lock → unlock icon
    └─ Content cards are now clickable
```

**Key Design Moments:**
- Blurred → unblurred content transition: This is the "magic moment." Should feel like unlocking a treasure chest. Consider a brief shimmer/reveal animation on the thumbnails.
- Confetti: Subtle, short (1.5s), celebratory. Not overwhelming.
- Price transparency: Gas being "Sponsored (Free)" should be a highlighted benefit.

### 6.4 Flow 4: Content Access (Supporter)

```
[/creator/:id OR /feed — click on an unlocked content card]
    │
    ▼
[Content Viewer Modal opens]
    │
    ▼
[Decryption Loading State shows]
    │
    ├─ Shield/key icon with animation
    ├─ "Decrypting content..."
    ├─ (First time: may require a wallet signature for SEAL session key)
    │
    ▼
[Content renders based on type:]
    │
    ├─ Image → Full-resolution image with lightbox controls
    ├─ Text → Rendered markdown with prose typography
    └─ PDF → Embedded PDF viewer with page navigation

[Navigation:]
    ├─ ← Previous / Next → buttons to browse content
    ├─ Download button (optional, type-dependent)
    └─ ✕ Close button
```

**Key Design Moments:**
- Decryption animation: Should feel magical and secure — reinforces the value of encryption.
- First-time session: If SEAL requires a signature, show a clear explanation ("Sign once to unlock viewing for this session").

### 6.5 Flow 5: Earnings Withdrawal (Creator)

```
[Dashboard → Earnings tab]
    │
    ▼
[Balance card shows: 125.500 SUI]
[Transaction history shows recent activity]
    │
    ▼
[Click "Withdraw All"]
    │
    ▼
[Withdrawal Confirmation Modal opens]
    │
    ├─ Shows: amount, destination address, gas (sponsored)
    │
    ▼
[Click "Confirm Withdrawal"]
    │
    ▼
[Button: "Processing..." with spinner]
    │
    ▼
[Success toast: "125.500 SUI withdrawn successfully"]
[Modal closes]
[Balance updates to 0.000 SUI]
[New "Withdrawn" entry appears in transaction list]
```

---

## 7. Component Library Specification

### 7.1 Button

**Already built.** Variants and sizes documented here for design reference.

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| `default` (primary) | `--brand-primary` | `--text-on-brand` | None | Primary actions: "Support", "Create", "Withdraw" |
| `secondary` | `--bg-elevated` | `--text-primary` | None | Secondary actions: "Cancel", "View", "Download" |
| `outline` | Transparent | `--text-primary` | `--border-default` | Tertiary actions, filters |
| `ghost` | Transparent | `--text-secondary` | None | Navigation, inline actions, "Sign Out" |
| `destructive` | `--error` | `--text-on-brand` | None | Not used in MVP (no delete actions) |

| Size | Height | Padding | Font Size | Icon Size |
|---|---|---|---|---|
| `sm` | 32px | 12px 16px | 13px | 14px |
| `default` | 40px | 12px 20px | 14px | 16px |
| `lg` | 48px | 14px 24px | 16px | 20px |

**States:**
- Default → Hover (darken 10%) → Active (darken 15% + `shadow-inner`) → Disabled (50% opacity, no pointer events)
- Loading: Show Loader2 spinning icon left of text, disable click

### 7.2 Card

**Already built.** Design specifications:

- Background: `--bg-raised`
- Border: 1px `--border-default`
- Radius: `--radius-lg` (12px)
- Shadow: `--shadow-sm`
- Padding: 24px (via CardContent)

**Hover state (clickable cards only):**
- Border: `--border-hover`
- Transform: `translateY(-2px)`
- Shadow: `--shadow-md`
- Transition: 200ms ease

### 7.3 Input (Text)

| Property | Value |
|---|---|
| Height | 40px |
| Background | `--bg-input` |
| Border | 1px `--border-default` |
| Radius | `--radius-md` (8px) |
| Padding | 12px 16px |
| Font size | 14px (`body-sm`) |
| Placeholder color | `--text-tertiary` |

**States:**
- Default: `--border-default`
- Focus: `--border-focus` (brand-primary) + 2px ring `rgba(99,102,241,0.3)`
- Error: `--error` border + error message below in `caption` size, `--error` color
- Disabled: 50% opacity, `--bg-elevated` background

### 7.4 Textarea

Same as Input but:
- Min height: 96px (3 lines)
- Resize: vertical only
- Character counter: Right-aligned below, `caption` size, `--text-tertiary`

### 7.5 Select (Dropdown)

Same input styling as Text Input with:
- Chevron-down icon on the right (16px, `--text-tertiary`)
- Dropdown: `--bg-overlay`, `--shadow-lg`, `--radius-md`, `--border-default`
- Option hover: `--bg-elevated`
- Selected option: `--brand-primary-muted` background + `--brand-primary` text

### 7.6 Modal

| Property | Value |
|---|---|
| Overlay | `rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(4px)` |
| Container | `--bg-raised`, `--radius-xl` (16px), `--shadow-lg` |
| Max width | 480px |
| Padding | 24px |
| Close button | Ghost icon button (X), top-right corner |

**Animation:**
- Open: Overlay fades in (200ms), modal scales from 95% to 100% + fades in (250ms, ease-out)
- Close: Reverse of open (200ms, ease-in)

**Sections:**
- Header: Title (`heading-lg`) + optional close button
- Divider: 1px `--border-default`, full width (margin: -24px horizontal, then padding back)
- Body: Scrollable if content exceeds viewport
- Footer: Action buttons, right-aligned (primary right, secondary left)

### 7.7 Toast (Notification)

| Property | Value |
|---|---|
| Position | Bottom-right, 24px from edges |
| Width | 360px max |
| Background | `--bg-overlay` |
| Border | 1px `--border-default` |
| Radius | `--radius-lg` |
| Shadow | `--shadow-lg` |
| Padding | 16px |

**Variants:**

| Variant | Left Icon | Left Border |
|---|---|---|
| Success | Check circle, `--success` | 3px `--success` |
| Error | X circle, `--error` | 3px `--error` |
| Warning | AlertTriangle, `--warning` | 3px `--warning` |
| Info | Info, `--info` | 3px `--info` |

**Behavior:**
- Auto-dismiss: 4 seconds for success/info, 6 seconds for warnings, persistent for errors (until dismissed)
- Stack: Multiple toasts stack vertically with 8px gap
- Animation: Slide in from right (300ms), slide out to right (200ms)
- Max visible: 3 toasts, oldest auto-dismissed if exceeded

### 7.8 Badge

| Size | Height | Padding | Font | Radius |
|---|---|---|---|---|
| `sm` | 20px | 2px 6px | `caption` (12px) | `--radius-sm` |
| `md` | 24px | 4px 8px | `body-sm` (14px) | `--radius-sm` |

**Variants:**

| Variant | Background | Text | Usage |
|---|---|---|---|
| `default` | `--bg-elevated` | `--text-secondary` | Generic labels |
| `primary` | `--brand-primary-muted` | `--brand-primary` | Active filters, highlights |
| `success` | `--success-subtle` | `--success` | "Access Granted", "Unlocked" |
| `warning` | `--warning-subtle` | `--warning` | "Pending" |
| `error` | `--error-subtle` | `--error` | "Failed" |
| `image` | `rgba(59,130,246,0.15)` | `#3B82F6` | Content type: IMG |
| `text` | `rgba(16,185,129,0.15)` | `#10B981` | Content type: TXT |
| `pdf` | `rgba(239,68,68,0.15)` | `#EF4444` | Content type: PDF |

### 7.9 Avatar

| Size | Dimensions | Font (initials) | Usage |
|---|---|---|---|
| `xs` | 24x24 | 10px | Inline references |
| `sm` | 32x32 | 12px | Lists, supporter rows |
| `md` | 48x48 | 16px | Card headers |
| `lg` | 64x64 | 20px | Creator cards (explore grid) |
| `xl` | 96x96 | 28px | Creator profile header |
| `2xl` | 128x128 | 36px | Profile editor preview |

**Fallback:** If no avatar image:
1. Show initials (first letter of name) on a brand-primary gradient circle
2. Gradient: `linear-gradient(135deg, #6366F1, #8B5CF6)`
3. Text: white, centered, bold

**Shape:** Always `--radius-full` (circle)

### 7.10 Skeleton Loader

Used as placeholder during data loading. Matches the shape of the content it replaces.

| Property | Value |
|---|---|
| Background | `--bg-elevated` |
| Animation | Pulse: opacity oscillates 0.4 → 1.0 → 0.4, 1.5s duration, ease-in-out |
| Radius | Matches the element it replaces |

**Common skeleton patterns:**
- Creator card: Avatar circle + 2 text lines + stat row
- Feed card: Avatar + 3 text lines + large rectangle
- Profile header: Large avatar + 3 text lines + stat pills
- Content card: Rectangle (thumbnail) + 1 text line + badge

### 7.11 Empty State

Consistent pattern for all empty states across the app.

```
┌──────────────────────────────────────────────┐
│                                              │
│         [Illustration or icon, 120px]        │
│                                              │
│         Heading (heading-md)                 │
│         Description text (body-sm,           │
│         --text-secondary, centered)          │
│                                              │
│         [CTA Button] (optional)              │
│                                              │
└──────────────────────────────────────────────┘
```

### 7.12 File Drop Zone

Used in the content upload modal.

| Property | Value |
|---|---|
| Border | 2px dashed `--border-default` |
| Radius | `--radius-lg` |
| Background | Transparent |
| Min height | 160px |
| Padding | 32px |

**States:**
- Default: Dashed border, Upload icon + "Drag & drop" text centered
- Drag over: Border `--brand-primary`, background `--brand-primary-muted`, icon pulses
- File selected: Border solid `--border-default`, shows file preview + filename + size + "Remove" link
- Error: Border `--error`, shake animation (200ms), error text below

### 7.13 Tab Navigation

Used in the Dashboard.

| Property | Value |
|---|---|
| Height | 44px |
| Gap between tabs | 0 (flush) |
| Active indicator | 2px bottom border, `--brand-primary` |
| Tab text | `body-sm`, `--text-tertiary` (inactive), `--text-primary` + `--brand-primary` underline (active) |
| Hover | `--text-secondary`, subtle background `--bg-elevated` |

### 7.14 Progress Bar

| Property | Value |
|---|---|
| Height | 4px |
| Background (track) | `--bg-elevated` |
| Background (fill) | `--brand-primary` |
| Radius | `--radius-full` |

**Variants:**
- Determinate: Fill width represents % progress
- Indeterminate: Animated shimmer moving left-to-right (1.5s, infinite)

### 7.15 Tooltip

| Property | Value |
|---|---|
| Background | `--bg-overlay` |
| Border | 1px `--border-default` |
| Radius | `--radius-md` |
| Padding | 8px 12px |
| Font | `caption` (12px), `--text-primary` |
| Shadow | `--shadow-md` |
| Delay | 500ms on hover |
| Arrow | 6px, matching background |

---

## 8. Micro-interactions & Motion Design

### 8.1 Transition Defaults

| Property | Duration | Easing |
|---|---|---|
| Color changes | 150ms | ease |
| Transform (hover lifts) | 200ms | ease-out |
| Opacity (fade in/out) | 200ms | ease |
| Layout shifts | 300ms | ease-in-out |
| Modal open/close | 250ms | ease-out (open), ease-in (close) |
| Page transitions | 200ms | ease |

### 8.2 Specific Animations

| Element | Animation | Duration | Trigger |
|---|---|---|---|
| **Card hover** | `translateY(-2px)` + shadow increase | 200ms | Mouse enter |
| **Button press** | `scale(0.97)` | 100ms | Mouse down |
| **Toast enter** | Slide from right + fade in | 300ms | On show |
| **Toast exit** | Slide to right + fade out | 200ms | On dismiss |
| **Modal overlay** | Opacity 0 → 0.6 | 200ms | On open |
| **Modal container** | Scale 0.95 → 1 + opacity 0 → 1 | 250ms | On open |
| **Content unlock** | Blur 8px → 0 + opacity 0.5 → 1 | 500ms | After purchase success |
| **Confetti** | Particle burst from center | 1500ms | Purchase success |
| **Skeleton pulse** | Opacity 0.4 → 1 → 0.4 | 1500ms | While loading |
| **Spinner** | Rotate 360deg | 1000ms | While processing |
| **File drop zone drag** | Border pulse + icon scale | 200ms | Drag enter |
| **Lock → unlock icon** | Rotate 15deg + color change | 300ms | After purchase |
| **Balance counter** | Number count up/down animation | 500ms | After withdrawal |
| **Tab switch** | Underline slide to new tab | 200ms | Tab click |

### 8.3 Loading Patterns

| Context | Pattern |
|---|---|
| Page load | Full skeleton layout matching final content |
| Button action | Inline spinner in button, button disabled |
| Content decrypt | Dedicated decrypt animation (shield icon + spinner) |
| File upload | Multi-step progress indicator (step labels change) |
| Data refetch | Subtle pulse on the refreshing section only (no full skeleton) |

---

## 9. Responsive Strategy

### 9.1 Breakpoints

| Name | Min Width | Tailwind | Layout |
|---|---|---|---|
| Mobile | 0px | Default | Single column, stacked |
| Tablet | 768px | `md:` | 2-3 columns, sidebar collapses |
| Desktop | 1024px | `lg:` | Full layout with sidebars |
| Wide | 1280px | `xl:` | 4-column grids, max-width container |

### 9.2 Max Content Width

- Page container: `max-width: 1280px`, centered with `margin: 0 auto`
- Content area (e.g., articles): `max-width: 720px` for readability
- Page horizontal padding: 16px (mobile), 24px (tablet), 32px (desktop)

### 9.3 Page-Specific Responsive Behavior

| Page | Mobile | Tablet | Desktop |
|---|---|---|---|
| **Landing** | Stack hero + features vertically. Full-width CTA. | 2-column features. | 3-column features, max-width hero. |
| **Explore** | 1-column card stack. Search above grid. | 2-column grid. | 3-4 column grid. Search inline with heading. |
| **Creator Profile** | Stack header + content vertically. Full-width support CTA. | Side-by-side header + CTA. 2-column content. | Same as tablet but with 3-column content. |
| **Dashboard** | Stat cards: 2x2 grid. Tabs as horizontal scroll. Content list full-width. | Stat cards: 4 in row. Same tabs. | Full layout. |
| **Feed** | Sidebar becomes top horizontal scroll of avatars. Full-width cards. | Sidebar as left panel (200px). | Sidebar (240px) + main feed. |

### 9.4 Touch Targets

- Minimum touch target: 44x44px (WCAG 2.5.5)
- Button min-height on mobile: 44px (override `sm` size to 44px on touch devices)
- Card clickable area: entire card surface
- Close buttons: 44x44px touch area even if visually smaller

### 9.5 Navigation Responsive

| Viewport | Navigation Pattern |
|---|---|
| Desktop (1024px+) | Horizontal header bar with text links |
| Tablet (768–1023px) | Horizontal header, icons only (no text labels) |
| Mobile (< 768px) | Bottom tab bar with icons + short labels (Explore, Dashboard, Feed, Account) |

---

## 10. Accessibility Requirements

### 10.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|---|---|
| **Color contrast** | All text meets 4.5:1 ratio against backgrounds. Large text (18px+) meets 3:1. Verified: `--text-primary` (#F9FAFB) on `--bg-base` (#0B0F1A) = ~18:1. `--text-secondary` (#9CA3AF) on `--bg-base` = ~7:1. `--text-tertiary` (#6B7280) on `--bg-base` = ~4.5:1. |
| **Focus indicators** | Visible focus ring (2px `--brand-primary` + 2px offset) on all interactive elements. Never use `outline: none` without replacement. |
| **Keyboard navigation** | All interactive elements reachable via Tab. Enter/Space activates buttons. Escape closes modals. Arrow keys navigate within tab groups. |
| **Screen reader** | All images have alt text. Icons have `aria-label`. Modals use `role="dialog"` + `aria-modal`. Toast notifications use `role="alert"`. Loading states announce via `aria-live="polite"`. |
| **Motion** | Respect `prefers-reduced-motion`. Disable all animations except essential loading indicators. |
| **Touch targets** | Minimum 44x44px on mobile. |

### 10.2 Semantic HTML

| Element | HTML |
|---|---|
| Page heading | `<h1>` (one per page) |
| Sections | `<section>` with `aria-labelledby` |
| Navigation | `<nav>` with `aria-label` |
| Cards | `<article>` (if standalone) or `<div role="listitem">` (in grids) |
| Modals | `<dialog>` or `div` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Forms | `<form>` with `<label>` for every input, `aria-describedby` for error messages |
| Buttons | `<button>` (never `<div onClick>`), with `aria-disabled` instead of hiding |

### 10.3 Color-Blind Safety

- Never convey information through color alone. Always pair with icons or text:
  - Locked: Lock icon + "Locked" text (not just red color)
  - Success: Check icon + "Success" text (not just green)
  - Error: X icon + error message text (not just red border)
- Content type badges include text labels (IMG, PDF, TXT), not just color

---

## 11. Content Guidelines

### 11.1 Page Copy

| Page | Heading | Subheading |
|---|---|---|
| **Landing** | "Support creators. Own your access." | "One payment. Permanent access. No middlemen. Powered by SUI." |
| **Explore** | "Explore Creators" | "Discover and support independent creators" |
| **Creator Profile** | `{Creator Name}` | `{Bio}` |
| **Dashboard** | "Dashboard" | (No subheading — stat cards serve as the summary) |
| **Feed** | "Your Feed" | "Content from creators you support" |
| **Settings** | "Settings" | "Manage your account" |

### 11.2 Button Labels

| Context | Label | NOT |
|---|---|---|
| Google sign-in | "Sign in with Google" | "Connect Wallet" / "Login" |
| Purchase access | "Support for {X} SUI" | "Mint NFT" / "Subscribe" |
| Upload content | "Encrypt & Upload" | "Submit" / "Post" |
| Withdraw | "Withdraw All" | "Claim Rewards" |
| Confirm action | "Confirm & Pay {X} SUI" | "OK" / "Yes" |
| Create profile | "Create Profile" | "Register" / "Sign Up" |
| Explore CTA | "Explore Creators" | "Browse" |

### 11.3 Empty State Messages

| Context | Heading | Description | CTA |
|---|---|---|---|
| Explore (no creators) | "No creators yet" | "Be the first to share your work on SuiPatron." | "Create Your Profile" |
| Explore (no search results) | "No results for '{query}'" | "Try a different search term." | (none) |
| Creator content (none) | "No content yet" | "This creator hasn't published any content yet. Check back soon!" | (none, or "Follow" in future) |
| Dashboard content (none) | "No content published yet" | "Upload your first piece of exclusive content for your supporters." | "Upload Your First Content" |
| Dashboard supporters (none) | "No supporters yet" | "Share your profile link to start gaining supporters." | "Copy Profile Link" |
| Dashboard earnings (zero) | "No earnings yet" | "Earnings will appear here when supporters purchase access." | (none) |
| Feed (no passes) | "You haven't supported any creators yet" | "Explore creators and support the ones you love." | "Explore Creators" |
| Feed (passes but no content) | "Nothing new yet" | "Your supported creators haven't published new content. Check back soon!" | (none) |

### 11.4 Error Messages

| Context | Message |
|---|---|
| Transaction failed | "Something went wrong with the transaction. Please try again." |
| Insufficient balance | "You don't have enough SUI for this payment. You need at least {X} SUI." |
| Network error | "Unable to connect. Please check your internet and try again." |
| Content decrypt failed | "Unable to decrypt this content. Please try again in a moment." |
| File too large | "File size exceeds the 5MB limit. Please choose a smaller file." |
| Unsupported file type | "This file type isn't supported. Please upload a PNG, JPG, PDF, or TXT file." |
| Profile creation failed | "Unable to create your profile. Please try again." |
| Session expired | "Your session has expired. Please sign in again." |

### 11.5 Loading State Messages

| Context | Message |
|---|---|
| Auth callback | "Setting up your account..." |
| Creating profile | "Creating your profile..." |
| Uploading content (encrypt) | "Encrypting with SEAL..." |
| Uploading content (upload) | "Uploading to Walrus..." |
| Uploading content (publish) | "Publishing on-chain..." |
| Processing payment | "Processing payment..." |
| Withdrawing | "Processing withdrawal..." |
| Decrypting content | "Decrypting content..." |

---

## 12. Design Tokens (Figma-Ready)

### 12.1 Figma Variable Collections

These values should be imported as Figma Variables for consistent token usage across all frames.

#### Collection: Colors / Dark Theme (Default)

```
Brand/Primary:          #6366F1
Brand/Primary Hover:    #4F46E5
Brand/Primary Subtle:   rgba(99,102,241,0.15)

Surface/Base:           #0B0F1A
Surface/Raised:         #111827
Surface/Overlay:        #1F2937
Surface/Elevated:       #374151
Surface/Input:          #1E293B

Text/Primary:           #F9FAFB
Text/Secondary:         #9CA3AF
Text/Tertiary:          #6B7280
Text/Disabled:          #4B5563
Text/On Brand:          #FFFFFF

Border/Default:         rgba(255,255,255,0.08)
Border/Hover:           rgba(255,255,255,0.16)
Border/Focus:           #6366F1

Status/Success:         #10B981
Status/Success Subtle:  rgba(16,185,129,0.15)
Status/Warning:         #F59E0B
Status/Warning Subtle:  rgba(245,158,11,0.15)
Status/Error:           #EF4444
Status/Error Subtle:    rgba(239,68,68,0.15)
Status/Info:            #3B82F6

Badge/Image:            #3B82F6
Badge/Image BG:         rgba(59,130,246,0.15)
Badge/Text:             #10B981
Badge/Text BG:          rgba(16,185,129,0.15)
Badge/PDF:              #EF4444
Badge/PDF BG:           rgba(239,68,68,0.15)
```

#### Collection: Spacing

```
0:    0px
1:    4px
2:    8px
3:    12px
4:    16px
5:    20px
6:    24px
8:    32px
10:   40px
12:   48px
16:   64px
20:   80px
24:   96px
```

#### Collection: Radii

```
sm:     6px
md:     8px
lg:     12px
xl:     16px
2xl:    24px
full:   9999px
```

#### Collection: Shadows

```
sm:     0 1px 2px rgba(0,0,0,0.3)
md:     0 4px 12px rgba(0,0,0,0.4)
lg:     0 8px 24px rgba(0,0,0,0.5)
glow:   0 0 20px rgba(99,102,241,0.25)
inner:  inset 0 1px 2px rgba(0,0,0,0.3)
```

#### Collection: Typography

```
Display LG:    48px / 1.1 / Bold / -0.025em
Display SM:    36px / 1.15 / Bold / -0.02em
Heading LG:    24px / 1.25 / Semibold / -0.015em
Heading MD:    20px / 1.3 / Semibold / -0.01em
Heading SM:    16px / 1.4 / Semibold / 0
Body LG:       18px / 1.6 / Regular / 0
Body MD:       16px / 1.5 / Regular / 0
Body SM:       14px / 1.5 / Regular / 0
Caption:       12px / 1.4 / Medium / 0.02em
Overline:      11px / 1.4 / Semibold / 0.08em (uppercase)
```

### 12.2 Figma Page Structure (Recommended)

```
SuiPatron Design File
├── Cover
├── Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing & Layout
│   └── Icons
├── Components
│   ├── Atoms (Button, Badge, Avatar, Input, Tooltip)
│   ├── Molecules (Card, Toast, Modal, FileDropZone, TabNav)
│   └── Organisms (CreatorCard, ContentCard, ProfileHeader, StatCard)
├── Pages
│   ├── Landing
│   ├── Explore
│   ├── Creator Profile (with all access states)
│   ├── Dashboard (all tabs)
│   ├── Feed
│   └── Settings
├── Flows (prototype connections)
│   ├── Creator Onboarding
│   ├── Content Upload
│   ├── Supporter Purchase
│   ├── Content Access
│   └── Earnings Withdrawal
└── States Matrix
    ├── Loading States
    ├── Empty States
    ├── Error States
    └── Responsive Breakpoints
```

### 12.3 Prototype Connections

For each flow, connect frames in Figma with interactions:

| Flow | Key Prototype Interactions |
|---|---|
| **Creator Onboarding** | Landing → (click CTA) → Auth loading → Explore → Dashboard empty → Create Profile modal → Dashboard populated |
| **Content Upload** | Dashboard Content tab → (click Upload) → Upload modal → (multi-step progress) → Success → Content list updated |
| **Supporter Purchase** | Explore → (click card) → Creator Profile (locked) → (click Support) → Confirm modal → Success → Creator Profile (unlocked) |
| **Content Access** | Creator Profile (unlocked) → (click content) → Decrypt loading → Content viewer |
| **Earnings Withdrawal** | Dashboard Earnings tab → (click Withdraw) → Confirm modal → Success → Balance zero |

---

*End of UI/UX Design Briefing. This document contains all information required to produce production-quality Figma designs for the SuiPatron MVP.*
