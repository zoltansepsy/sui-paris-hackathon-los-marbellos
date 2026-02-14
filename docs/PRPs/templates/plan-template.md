# Plan Template: [Feature Name] - [Phase]

**Implementation Plan** - Step-by-step execution plan with validation gates.

**PRD:** `PRPs/prds/[name].prd.md`  
**Phase:** [Phase number/name]  
**Created:** [Date]  
**Status:** [Draft/Ready/In Progress/Complete]

---

## Context

### PRD Reference
- **PRD:** `PRPs/prds/[name].prd.md`
- **Phase:** [Phase number/name]

### Goals
- [Goal 1]
- [Goal 2]

### Scope
**In Scope:** [Item 1], [Item 2]  
**Out of Scope:** [Item - other phase]

---

## Tasks

### Task 1: [Task Name]
**Description:** [What needs to be done]

**Files to Create/Modify:**
- `path/to/file.ts` - [Purpose]

**Implementation Details:**
```typescript
// Code pattern
```

**Validation:**
- [ ] Code follows patterns
- [ ] Tests written

---

## Validation Commands

```bash
# Move
cd move/suipatron && sui move build && sui move test

# Frontend
cd frontend && npm run build
```

**Success Criteria:**
- [ ] All commands pass
- [ ] Feature works as specified

---

**Last Updated:** [Date]
