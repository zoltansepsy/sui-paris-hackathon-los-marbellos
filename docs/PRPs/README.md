# PRPs (Product Requirements Prompts) — SuiPatron

This directory follows the PRPs-agentic-eng structure for managing product requirements, implementation plans, and related artifacts.

---

## Structure

```
PRPs/
├── README.md (this file)
├── templates/
│   ├── prd-template.md
│   ├── plan-template.md
│   └── issue-investigation-template.md
├── prds/
│   ├── suipatron-backend-indexer.prd.md
│   ├── suipatron-ptb-builders.prd.md
│   └── suipatron-frontend-integration.prd.md
├── plans/
│   └── [feature]-phase-[n].plan.md
└── reports/
```

---

## Workflow

### For Complex Features: PRD → Plan → Implement

1. **Create PRD** — Use `templates/prd-template.md`, save to `prds/[feature].prd.md`
2. **Create Plan** — Use `templates/plan-template.md`, save to `plans/[feature]-phase-[n].plan.md`
3. **Implement** — In Cursor: "Read PRPs/plans/[name].plan.md and implement it step by step"
4. **Update** — Mark phase complete, move plan to `plans/completed/` when done

### For Simple Features: INITIAL → Implement

1. **Create INITIAL** — Use `core-planning/INITIAL.md`, save to `core-planning/feature-requests/INITIAL_[name].md`
2. **Implement** — In Cursor: "Read INITIAL_[name].md and implement it"

### For Bug Fixes: Issue Investigation → Fix

1. **Investigate** — Use `templates/issue-investigation-template.md`, save to `issues/[number].md`
2. **Fix** — In Cursor: "Read PRPs/issues/[number].md and implement the fix plan"

---

## Cursor Usage

### Execute Plan
```
Read docs/PRPs/plans/[name].plan.md and implement it step by step.

After each task, run:
- cd move/suipatron && sui move build && sui move test
- cd frontend && npm run build

Continue until all validations pass.
```

### Create PRD
```
Read core-planning/feature-requests/INITIAL_[name].md and create a PRD following docs/PRPs/templates/prd-template.md.
Save to docs/PRPs/prds/[name].prd.md
```

### Create Plan
```
Read docs/PRPs/prds/[name].prd.md and create implementation plan for Phase 1.
Follow docs/PRPs/templates/plan-template.md.
Save to docs/PRPs/plans/[name]-phase-1.plan.md
```

---

## Validation Commands (SuiPatron)

```bash
# Move
cd move/suipatron && sui move build && sui move test

# Frontend
cd frontend && npm run build
cd frontend && npm run type-check   # if available
cd frontend && npm run dev          # local dev
```

---

## Related Documents

- [SCOPE.md](../SCOPE.md) — Full specification
- [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) — Handover doc
- [suipatron/01-product-breakdown-and-roadmap.md](../suipatron/01-product-breakdown-and-roadmap.md) — PBS
