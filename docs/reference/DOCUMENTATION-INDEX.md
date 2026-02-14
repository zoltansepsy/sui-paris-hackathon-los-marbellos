# SuiPatron Documentation — Master Index

**Version:** 1.0  
**Last Updated:** February 2025  
**Purpose:** Complete index of all documentation

---

## Quick Navigation

| Category | Documents | Primary Use |
|----------|-----------|-------------|
| [Core Planning](#core-planning) | 3 | Task breakdown, MVP scope, roadmap |
| [Architecture](#architecture) | 3 | Design, Move patterns, PTB spec |
| [Research](#research) | 1 | SUI ecosystem tools |
| [Reference](#reference) | 3 | Index, quick start, structure |
| [PRPs](#prps) | 4+ | PRDs, plans, templates |
| [SuiPatron](#suipatron) | 3 | PBS, user stories, domain model |
| [Examples](#examples) | 1+ | Code patterns |

---

## Core Planning

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| Product Breakdown | `core-planning/01-product-breakdown.md` | Task IDs A1–A12, P1–P14, J1–J13, Z1–Z10 | 10–15 min |
| MVP Scope | `core-planning/02-mvp-scope.md` | Features F1–F13, user flows, out-of-scope | 15–20 min |
| Roadmap | `core-planning/03-roadmap.md` | Phase 1–4 gates, hour estimates | 10 min |
| INITIAL Template | `core-planning/INITIAL.md` | Feature request template for AI | 5 min |

---

## Architecture

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| Architecture Design | `architecture/ARCHITECTURE-DESIGN.md` | Data flow, design decisions, contract types | 20–30 min |
| Move Patterns | `architecture/MOVE-PATTERNS.md` | Capability, OTW, shared objects, etc. | 10 min |
| PTB Specification | `architecture/PTB-SPECIFICATION.md` | PTB builders for create_profile, purchase_access, withdraw | 15–20 min |

---

## Research

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| SUI Ecosystem Tools | `research/SUI-ECOSYSTEM-TOOLS.md` | Enoki, SEAL, Walrus, SuiNS for SuiPatron | 20–30 min |

---

## Reference

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| Documentation Index | `reference/DOCUMENTATION-INDEX.md` | This file | 5 min |
| Quick Start Checklist | `reference/QUICK-START-CHECKLIST.md` | Setup, first tasks, validation | 15 min |
| Documentation Structure | `reference/DOCUMENTATION-STRUCTURE.md` | Visual hierarchy, document flows | 10 min |

---

## PRPs

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| PRPs README | `PRPs/README.md` | Workflow, Cursor prompts | 10 min |
| PRD Template | `PRPs/templates/prd-template.md` | Template for PRDs | 5 min |
| Plan Template | `PRPs/templates/plan-template.md` | Template for implementation plans | 5 min |
| Issue Investigation | `PRPs/templates/issue-investigation-template.md` | Bug investigation template | 5 min |
| Backend Indexer PRD | `PRPs/prds/suipatron-backend-indexer.prd.md` | Event indexer, APIs | 15 min |
| PTB Builders PRD | `PRPs/prds/suipatron-ptb-builders.prd.md` | Transaction builders | 15 min |
| Frontend Integration PRD | `PRPs/prds/suipatron-frontend-integration.prd.md` | Auth, dashboard, content | 20 min |

---

## SuiPatron Project

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| PBS and Roadmap | `suipatron/01-product-breakdown-and-roadmap.md` | PBS with [x]/[ ] per task, stages | 15 min |
| User Stories | `suipatron/02-user-stories.md` | User stories with acceptance criteria | 15 min |
| Data Flow & Domain | `suipatron/03-data-flow-and-domain.md` | Domain model, events, flows | 15 min |

---

## Design

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| UI/UX Briefing | `UI-UX-BRIEFING.md` | Enterprise briefing for UI/UX team | 30–45 min |

---

## Root Documents

| Document | Path | Purpose | Read Time |
|----------|------|---------|-----------|
| SCOPE | `SCOPE.md` | Full specification (single source) | 60–90 min |
| Implementation Status | `IMPLEMENTATION_STATUS.md` | Handover — completed and remaining | 15 min |

---

## Document Flows

### Planning Flow
```
00-README → SCOPE → 01-product-breakdown → 02-mvp-scope → 03-roadmap
```

### Architecture Flow
```
ARCHITECTURE-DESIGN → MOVE-PATTERNS → PTB-SPECIFICATION
```

### PRP Flow
```
suipatron/01-product-breakdown → PRDs → Plans → Implement
```

---

**Last Updated:** February 2025
