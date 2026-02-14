# Feature Request Example: Add SuiNS Subname to Profile Flow

Example of a well-structured feature request following the INITIAL template.

---

## FEATURE:
Add SuiNS subname registration to the creator profile creation flow. When a creator creates their profile, optionally register a subname (e.g. `alice@suipatron.sui`) via the backend, and display it on their profile.

**Requirements:**
- Backend endpoint `POST /api/subname` that calls Enoki subname API
- Frontend: trigger subname creation after create_profile tx succeeds (optional step)
- Display SuiNS badge on creator profile cards and creator profile page
- Domain `suipatron.sui` must be registered on testnet

**Acceptance Criteria:**
- [ ] Creator can optionally add subname during or after profile creation
- [ ] Backend creates subname via Enoki API with creator's SUI address
- [ ] Subname displayed as badge (e.g. `alice@suipatron.sui`) on profile
- [ ] Resolve subname to address works for display

---

## EXAMPLES:

**Code Patterns to Follow:**
- `docs/examples/ptb/create-profile.ts` — PTB builder for create_profile
- `docs/architecture/PTB-SPECIFICATION.md` — PTB patterns

**What to Mimic:**
- Enoki API call pattern for subnames
- Optional step in onboarding flow

---

## DOCUMENTATION:

**Architecture:**
- [architecture/ARCHITECTURE-DESIGN.md](../architecture/ARCHITECTURE-DESIGN.md)
- [SCOPE.md](../SCOPE.md) Section 7.4 (SuiNS Integration)

**PBS Task IDs:** A11, P12, Z5

---

## OTHER CONSIDERATIONS:

**Gotchas:**
- Domain must be registered at testnet.suins.io first
- Enoki subname API requires ENOKI_SECRET_KEY
- Subname creation is async — handle loading/error states

---

**Created:** February 2025  
**Priority:** P1 (nice-to-have)  
**Estimated Effort:** 4–6 hours
