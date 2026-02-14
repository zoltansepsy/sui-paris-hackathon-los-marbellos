# SuiPatron

A decentralized creator support platform built on SUI blockchain. Support creators with one-time payments for permanent content access—no recurring subscriptions, no platform fees.

## Features

### For Creators
- **Keep 100% of Earnings** - Zero platform fees
- **Content Ownership** - Your content can't be deplatformed
- **SuiNS Identity** - Human-readable names like `alice@suipatron.sui`
- **Simple Dashboard** - Manage profile, content, and earnings

### For Supporters
- **One-Time Payment** - Pay once, access forever
- **No Wallet Setup** - Sign in with Google (Enoki zkLogin)
- **Gasless Transactions** - No gas fees for most actions
- **On-Chain Proof** - Verifiable proof of support

## Pages

- **Landing** (`/`) - Hero section with value propositions
- **Explore** (`/explore`) - Discover creators
- **Creator Profile** (`/creator/:id`) - Public creator page with content grid
- **Dashboard** (`/dashboard`) - Creator management interface
- **Feed** (`/feed`) - Content from supported creators
- **Settings** (`/settings`) - Profile and account management

## Design Principles

1. **Creator-First** - All flows prioritize creator experience
2. **Web2-Familiar** - Feels like Patreon, but with Web3 benefits
3. **Zero Friction** - No blockchain jargon in UI
4. **SuiNS Differentiation** - Human-readable identities as key feature

## Tech Stack

- React 18 with TypeScript
- React Router 7 (Data mode)
- Tailwind CSS v4
- Radix UI components
- Lucide React icons
- Sonner for toasts

## Mock Implementation

This is a UI/UX prototype with simulated backend:
- Authentication uses localStorage (simulates Enoki zkLogin)
- Content and creators are mock data
- Access passes stored in localStorage
- All transactions are simulated

## Getting Started

The app runs immediately with mock data. Key flows:

1. **Sign in**: Enter any email to simulate Google OAuth
2. **Become a Creator**: Set up profile and claim SuiNS name
3. **Support a Creator**: One-time payment for permanent access
4. **View Content**: Access unlocked content in your feed

## Copy Guidelines

✅ Use: "Sign in", "Support", "Unlock", "Confirm"
❌ Avoid: "Connect wallet", "Sign transaction", "Gas fee", "Blockchain"

## Notes

- No real blockchain integration (prototype only)
- All data persists in localStorage
- Responsive design works on mobile and desktop
- Dark mode supported via system preferences
