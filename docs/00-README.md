# SuiPatron Technical Documentation Hub

**Version:** 1.0  
**Last Updated:** February 2025  
**Status:** Active  
**Project:** SUI Paris Hackathon — Decentralized Creator Support Platform on SUI

---

## Welcome

SuiPatron is a decentralized Patreon-like platform where creators publish exclusive content and supporters pay to access it — all enforced on-chain with zero centralized gatekeepers. This documentation hub organizes planning, architecture, and implementation guidance.

**Quick Stats:**
- **MVP Model:** Flat one-time payment, SEAL-encrypted content, Walrus storage, AccessPass NFTs
- **Tech Stack:** Move (SUI), React + Vite + TypeScript, Enoki zkLogin, SEAL, Walrus
- **Documentation:** WebTree-style structure with PRPs, PBS, and reference docs

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [SCOPE.md](SCOPE.md) | Full project specification (single source of truth) |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | Developer handover — what's done, what remains |
| [reference/QUICK-START-CHECKLIST.md](reference/QUICK-START-CHECKLIST.md) | Setup and first tasks |
| [reference/DOCUMENTATION-INDEX.md](reference/DOCUMENTATION-INDEX.md) | Complete document index |
| [PRPs/README.md](PRPs/README.md) | PRD → Plan → Implement workflow |
| [UI-UX-BRIEFING.md](UI-UX-BRIEFING.md) | Enterprise briefing for UI/UX team (Patreon-inspired, creator-first) |

---

## Documentation Structure

### Core Planning
| Document | Purpose |
|----------|---------|
| [01-product-breakdown.md](core-planning/01-product-breakdown.md) | Task table (A1–A12, P1–P14, J1–J13, Z1–Z10) |
| [02-mvp-scope.md](core-planning/02-mvp-scope.md) | Feature checklist, user flows, out-of-scope |
| [03-roadmap.md](core-planning/03-roadmap.md) | Phase 1–4 gates and hour estimates |
| [INITIAL.md](core-planning/INITIAL.md) | Feature request template |
| [INITIAL_EXAMPLE.md](core-planning/INITIAL_EXAMPLE.md) | Example feature request |

### Architecture
| Document | Purpose |
|----------|---------|
| [ARCHITECTURE-DESIGN.md](architecture/ARCHITECTURE-DESIGN.md) | Data flow, design decisions, contract summary |
| [MOVE-PATTERNS.md](architecture/MOVE-PATTERNS.md) | Move patterns used in contracts |
| [PTB-SPECIFICATION.md](architecture/PTB-SPECIFICATION.md) | PTB builders for create_profile, purchase_access, withdraw |

### Research
| Document | Purpose |
|----------|---------|
| [SUI-ECOSYSTEM-TOOLS.md](research/SUI-ECOSYSTEM-TOOLS.md) | Enoki, SEAL, Walrus, SuiNS |

### SuiPatron Project (like gig-nova/)
| Document | Purpose |
|----------|---------|
| [01-product-breakdown-and-roadmap.md](suipatron/01-product-breakdown-and-roadmap.md) | PBS with [x]/[ ] per task |
| [02-user-stories.md](suipatron/02-user-stories.md) | User stories with acceptance criteria |
| [03-data-flow-and-domain.md](suipatron/03-data-flow-and-domain.md) | Domain model, events, data flows |

### PRPs (Product Requirements Prompts)
| Path | Purpose |
|------|---------|
| [PRPs/prds/](PRPs/prds/) | PRDs for complex features |
| [PRPs/plans/](PRPs/plans/) | Implementation plans |
| [PRPs/templates/](PRPs/templates/) | PRD, plan, issue templates |

---

## Role-Based Paths

### For Developers
1. [QUICK-START-CHECKLIST](reference/QUICK-START-CHECKLIST.md)
2. [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md)
3. [ARCHITECTURE-DESIGN](architecture/ARCHITECTURE-DESIGN.md)
4. [PTB-SPECIFICATION](architecture/PTB-SPECIFICATION.md)
5. [PRPs/README](PRPs/README.md)

### For Product / Planning
1. [SCOPE](SCOPE.md) Sections 1–2
2. [02-mvp-scope](core-planning/02-mvp-scope.md)
3. [03-roadmap](core-planning/03-roadmap.md)
4. [suipatron/02-user-stories](suipatron/02-user-stories.md)

### For AI-Assisted Development
1. [PRPs/README](PRPs/README.md) — workflow and Cursor prompts
2. [INITIAL template](core-planning/INITIAL.md) — feature requests
3. [examples/](examples/README.md) — code patterns

---

## Folder Structure

```
docs/
├── 00-README.md                    # Entry point (you are here)
├── core-planning/                  # PBS, MVP scope, roadmap
├── architecture/                   # Design, Move patterns, PTB spec
├── research/                       # SUI ecosystem tools
├── reference/                      # Index, quick start, structure
├── PRPs/                           # PRDs, plans, templates
├── suipatron/                      # Project-specific PBS, user stories
├── examples/                       # Code patterns for AI dev
├── SCOPE.md                        # Full spec
└── IMPLEMENTATION_STATUS.md        # Handover doc
```

---

**Ready to build? Start with [QUICK-START-CHECKLIST](reference/QUICK-START-CHECKLIST.md).**
