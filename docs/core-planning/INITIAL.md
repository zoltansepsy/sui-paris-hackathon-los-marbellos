# Feature Request Template

Use this template to request new features from AI coding assistants (Cursor, Claude Code, etc.).

**How to use:**
1. Copy this template
2. Create a new file: `feature-requests/INITIAL_[feature-name].md`
3. Fill in all sections
4. Reference in Cursor chat: "Read docs/core-planning/feature-requests/INITIAL_[name].md and implement it"

---

## FEATURE:
[Describe what you want to build — be specific about functionality and requirements]

**Requirements:**
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## EXAMPLES:
[List any example files in docs/examples/ and explain how they should be used]

**Code Patterns to Follow:**
- `docs/examples/ptb/create-profile.ts` — PTB builder pattern
- `docs/examples/frontend/` — React hooks, Enoki flow
- [Add more as examples are created]

**What to Mimic:**
- [Specific aspect from examples]
- [Another specific aspect]

---

## DOCUMENTATION:

**Architecture:**
- [architecture/ARCHITECTURE-DESIGN.md](../architecture/ARCHITECTURE-DESIGN.md)
- [architecture/PTB-SPECIFICATION.md](../architecture/PTB-SPECIFICATION.md)
- [architecture/MOVE-PATTERNS.md](../architecture/MOVE-PATTERNS.md)

**Planning:**
- [SCOPE.md](../SCOPE.md)
- [core-planning/01-product-breakdown.md](01-product-breakdown.md)
- [suipatron/02-user-stories.md](../suipatron/02-user-stories.md)

**External:**
- [Enoki docs](https://docs.enoki.mystenlabs.com/)
- [SEAL docs](https://docs.sui.io/standards/seal)
- [SUI Move](https://docs.sui.io/build/move)

---

## OTHER CONSIDERATIONS:

**Validation:**
- [ ] `sui move build && sui move test` (if Move changes)
- [ ] `npm run build` (frontend)
- [ ] Feature works as specified

**Gotchas:**
- [Gotcha 1]
- [Gotcha 2]

---

**Created:** [Date]  
**Priority:** [High/Medium/Low]  
**Estimated Effort:** [Hours]
