# PRD: SuiPatron Frontend Integration

**Product Requirement Document** — Auth (Enoki zkLogin), sponsored transaction flow, Creator Dashboard, content upload, Supporter Feed, content viewer.

**Created:** February 2025  
**Status:** Draft  
**Related:** [SCOPE.md](../../SCOPE.md) Sections 5–7, [core-planning/02-mvp-scope.md](../../core-planning/02-mvp-scope.md)

---

## Goal

Integrate the SuiPatron frontend with Enoki zkLogin, the backend sponsor API, PTB builders, SEAL/Walrus, and all UI pages. End-to-end flows: sign in → create profile → upload content → purchase access → view decrypted content → withdraw earnings.

**Business Value:**
- Complete MVP user experience
- Demo-ready product

**User Value:**
- Gasless sign-in with Google
- Full creator and supporter workflows

---

## Context

### Related Documentation
- [SCOPE.md](../../SCOPE.md) Sections 5–7 (Frontend, Backend, Integrations)
- [architecture/PTB-SPECIFICATION.md](../../architecture/PTB-SPECIFICATION.md)
- [PRPs/prds/suipatron-ptb-builders.prd.md](suipatron-ptb-builders.prd.md)
- [PRPs/prds/suipatron-backend-indexer.prd.md](suipatron-backend-indexer.prd.md)

### Dependencies
- **Requires:** PTB builders, backend sponsor endpoint, Enoki Portal configured
- **Blocks:** Demo, ship

### PBS Task IDs
- P1–P14 (integration), J1–J13 (UI), Z1–Z10 (scaffold, config)

---

## Requirements

### Functional Requirements
1. **Auth:** Google sign-in via Enoki zkLogin; auth callback; session persistence; protected routes
2. **Sponsored transactions:** Wire PTB builders to backend /api/sponsor and /api/sponsor/execute
3. **Creator Dashboard:** Profile editor, price setting, content list, content uploader, earnings panel, withdraw
4. **Content upload:** SEAL encrypt → Walrus upload → publish_content PTB
5. **Supporter flows:** Explore, Creator Profile page, Support modal, purchase_access PTB
6. **Content access:** Walrus download → SEAL decrypt → render (image, text, PDF)
7. **Supporter Feed:** List supported creators, content feed, content viewer
8. **Hooks:** useMyAccessPasses, useCreatorProfile, useContentDecrypt

### Non-Functional Requirements
- **UX:** Loading states, error toasts, empty states
- **Responsive:** Mobile-friendly layout

### Acceptance Criteria
- [ ] Sign in with Google works; user gets SUI address
- [ ] Create profile (sponsored) works
- [ ] Upload content (encrypt → Walrus → publish) works
- [ ] Purchase access (sponsored) works; AccessPass received
- [ ] View decrypted content works for supporters
- [ ] Withdraw earnings works for creators
- [ ] All pages render; error handling in place

---

## Implementation Phases

| # | Phase | Description | Status | Depends | Plan |
|---|-------|-------------|--------|---------|------|
| 1 | Auth + scaffold | Enoki zkLogin, callback, auth context, protected routes | pending | Z1, Z4 | - |
| 2 | Sponsor flow + PTBs | Wire PTBs to /api/sponsor; create profile, purchase access | pending | A10, PTB PRD Phase 1 | - |
| 3 | Dashboard + content upload | Creator Dashboard, content uploader, SEAL + Walrus | pending | 2, P6, P7 | - |
| 4 | Content access + feed | Decrypt pipeline, content viewer, Supporter Feed | pending | 3, P9, P10 | - |
| 5 | Withdraw + polish | Withdraw flow, loading/error states, empty states | pending | 4 | - |

---

## Technical Considerations

### Integration Points
- Enoki `useEnokiFlow`, `createAuthorizationURL`, `sponsorAndExecuteTransaction`
- SEAL SDK (encrypt, decrypt)
- Walrus SDK (upload, download)
- Backend /api/sponsor, /api/sponsor/execute

### Gotchas & Constraints
- SEAL identity = 32 bytes (CreatorProfile ID)
- Session key caching for SEAL decrypt
- Enoki Portal: whitelist all Move entry functions

---

**Last Updated:** February 2025
