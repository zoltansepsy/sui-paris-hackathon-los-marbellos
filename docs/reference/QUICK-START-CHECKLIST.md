# SuiPatron — Quick Start Checklist

**Purpose:** Get developers up and running for SuiPatron MVP development  
**Last Updated:** February 2025

---

## Prerequisites

- Node.js 18+
- SUI CLI installed
- Google account (for Enoki zkLogin)

---

## Setup Tasks

### 1. Clone and Install

```bash
# Clone repo
git clone <repo-url> && cd sui-paris-hackathon-los-marbellos

# Install frontend dependencies
cd frontend && npm install

# Build Move package
cd ../move/suipatron && sui move build

# Run Move tests
sui move test
```

### 2. Environment Configuration

```bash
# Copy template
cp frontend/.env.example frontend/.env.local

# Fill in (after contract deployment):
# VITE_PACKAGE_ID=0x...
# VITE_PLATFORM_ID=0x...
# VITE_ENOKI_PUBLIC_KEY=...
# VITE_GOOGLE_CLIENT_ID=...
# VITE_SEAL_KEY_SERVER_OBJECT_IDS=0x...,0x...
# VITE_WALRUS_NETWORK=testnet
# ENOKI_SECRET_KEY=... (backend only)
```

### 3. Deploy Contracts (when ready)

```bash
cd move/suipatron && sui client publish --gas-budget 200000000
```

After publish, record Package ID and Platform ID into `frontend/.env` / `frontend/.env.local`.

---

## First Tasks

| Order | Task | Document |
|-------|------|----------|
| 1 | Read [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) | See what's done vs remaining |
| 2 | Read [SCOPE.md](../SCOPE.md) Sections 1–4 | Product vision, architecture |
| 3 | Pick a task from [01-product-breakdown](../core-planning/01-product-breakdown.md) | Start implementation |
| 4 | For complex features: create PRD from [PRPs/templates](../PRPs/templates/prd-template.md) | PRD → Plan → Implement |

---

## Validation Commands

```bash
# Move
cd move/suipatron && sui move build && sui move test

# Frontend
cd frontend && npm run build
cd frontend && npm run type-check  # if available
cd frontend && npm run dev         # local dev server
```

---

## Key Documents to Read

1. **SCOPE.md** — Full spec
2. **IMPLEMENTATION_STATUS.md** — Handover doc
3. **architecture/PTB-SPECIFICATION.md** — Building transactions
4. **PRPs/README.md** — AI-assisted workflow

---

**Ready? Start with [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md).**
