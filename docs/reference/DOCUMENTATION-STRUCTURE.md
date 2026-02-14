# SuiPatron Documentation Structure

**Version:** 1.0  
**Last Updated:** February 2025  
**Purpose:** Visual representation of documentation organization

---

## Documentation Hierarchy

```
docs/
│
├── 00-README.md                    # Entry point
├── SCOPE.md                        # Full spec (single source)
├── IMPLEMENTATION_STATUS.md        # Handover doc
│
├── core-planning/
│   ├── 01-product-breakdown.md     # Task table (A, P, J, Z)
│   ├── 02-mvp-scope.md             # Features, user flows
│   ├── 03-roadmap.md               # Phase gates, hours
│   ├── INITIAL.md                  # Feature request template
│   ├── INITIAL_EXAMPLE.md
│   └── feature-requests/           # INITIAL_[name].md
│
├── architecture/
│   ├── ARCHITECTURE-DESIGN.md      # Data flow, design decisions
│   ├── MOVE-PATTERNS.md            # Move patterns
│   └── PTB-SPECIFICATION.md        # PTB builders
│
├── research/
│   └── SUI-ECOSYSTEM-TOOLS.md      # Enoki, SEAL, Walrus, SuiNS
│
├── reference/
│   ├── DOCUMENTATION-INDEX.md      # Master index
│   ├── QUICK-START-CHECKLIST.md    # Onboarding
│   └── DOCUMENTATION-STRUCTURE.md  # This file
│
├── PRPs/
│   ├── README.md
│   ├── templates/                  # prd, plan, issue templates
│   ├── prds/                       # PRDs
│   ├── plans/                      # Implementation plans
│   └── reports/                    # Optional reports
│
├── suipatron/                      # Project-specific
│   ├── 01-product-breakdown-and-roadmap.md
│   ├── 02-user-stories.md
│   └── 03-data-flow-and-domain.md
│
└── examples/
    ├── README.md
    ├── move/
    ├── frontend/
    └── ptb/
```

---

## Document Flows

### Planning Flow

```
00-README
    │
    ├─→ SCOPE ──────────┬─→ 01-product-breakdown
    │                   ├─→ 02-mvp-scope
    │                   └─→ 03-roadmap
    │
    └─→ QUICK-START-CHECKLIST
```

### Architecture Flow

```
ARCHITECTURE-DESIGN
    │
    ├─→ MOVE-PATTERNS
    └─→ PTB-SPECIFICATION
```

### PRP Flow

```
suipatron/01-product-breakdown-and-roadmap
    │
    └─→ PRDs ─→ Plans ─→ Implement
```

---

## Document Categories

| Purpose | Documents |
|---------|-----------|
| Planning | PBS, MVP scope, roadmap |
| Architecture | Design, Move patterns, PTB spec |
| Reference | Index, quick start, structure |
| Execution | PRPs (PRDs, plans) |
| Project | suipatron/ PBS, user stories, domain |

---

**Last Updated:** February 2025
