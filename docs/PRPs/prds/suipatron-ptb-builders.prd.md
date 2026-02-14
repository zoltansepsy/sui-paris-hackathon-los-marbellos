# PRD: SuiPatron PTB Builders

**Product Requirement Document** — Transaction builders in `frontend/src/lib/transactions.ts` for create_profile, purchase_access, withdraw_earnings, publish_content, update_profile.

**Created:** February 2025  
**Status:** Draft  
**Related:** [architecture/PTB-SPECIFICATION.md](../../architecture/PTB-SPECIFICATION.md), [IMPLEMENTATION_STATUS.md](../../IMPLEMENTATION_STATUS.md)

---

## Goal

Implement PTB (Programmable Transaction Block) builder functions that construct SUI transactions for all SuiPatron entry functions. These are used by the frontend to build transactions that are then sponsored via Enoki and executed on SUI Testnet. Without these builders, the UI cannot create profiles, purchase access, withdraw earnings, or publish content.

**Business Value:**
- Enables all core on-chain flows
- Gasless UX via Enoki sponsorship

**User Value:**
- Creators can create profiles, upload content, withdraw
- Supporters can purchase access

---

## Context

### Related Documentation
- [architecture/PTB-SPECIFICATION.md](../../architecture/PTB-SPECIFICATION.md) — Full PTB spec
- [IMPLEMENTATION_STATUS.md](../../IMPLEMENTATION_STATUS.md) — Contract API Quick Reference
- [SCOPE.md](../../SCOPE.md) Section 7 — Integration specs

### Dependencies
- **Requires:** Contract deployed (A9); Package ID, Platform ID in env
- **Blocks:** P5 (sponsored tx execution), P8 (content upload), P13 (withdraw)

### PBS Task IDs
- P3 (create_profile PTB), P4 (purchase_access PTB), P13 (withdraw PTB), P8 (publish_content)

---

## Requirements

### Functional Requirements
1. `buildCreateProfileTx(name, bio, priceMist)` — returns Transaction
2. `buildPurchaseAccessTx(profileId, priceMist, paymentCoin)` — returns Transaction
3. `buildWithdrawTx(profileId, creatorCapId)` — returns Transaction
4. `buildPublishContentTx(profileId, creatorCapId, title, description, blobId, contentType)` — returns Transaction
5. `buildUpdateProfileTx(profileId, creatorCapId, updates)` — returns Transaction
6. All builders use Transaction from `@mysten/sui/transactions`
7. Clock object `0x6` and Package/Platform IDs from env

### Non-Functional Requirements
- **Correctness:** PTBs must match contract entry function signatures
- **Type safety:** TypeScript types for all parameters

### Acceptance Criteria
- [ ] All 5 builders implemented and exported
- [ ] buildCreateProfileTx produces valid create_profile call
- [ ] buildPurchaseAccessTx handles coin split correctly
- [ ] buildWithdrawTx, buildPublishContentTx, buildUpdateProfileTx produce valid calls
- [ ] Integration with Enoki sponsor flow works end-to-end

---

## Implementation Phases

| # | Phase | Description | Status | Depends | Plan |
|---|-------|-------------|--------|---------|------|
| 1 | Core PTB builders | buildCreateProfileTx, buildPurchaseAccessTx, buildWithdrawTx | pending | A9 | - |
| 2 | Content + profile PTBs | buildPublishContentTx, buildUpdateProfileTx | pending | 1 | - |

---

## Technical Considerations

### Integration Points
- `@mysten/sui` Transaction API
- Enoki `sponsorAndExecuteTransaction` (via backend /api/sponsor)

### Gotchas & Constraints
- Price in MIST (1 SUI = 1_000_000_000)
- purchase_access requires Coin<SUI> — use tx.splitCoins from gas or a mergeable coin
- Option types for update_profile — use tx.pure.option

---

**Last Updated:** February 2025
