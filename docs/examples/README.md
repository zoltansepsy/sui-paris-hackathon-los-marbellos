# SuiPatron — Code Examples

**Purpose:** Code patterns for AI-assisted development. Reference these when implementing features.

---

## Structure

| Folder | Purpose |
|--------|---------|
| `move/` | Move patterns (OTW, capability, shared objects, dynamic fields) |
| `frontend/` | React hooks, Enoki flow, SEAL/Walrus usage |
| `ptb/` | PTB builder examples (create_profile, purchase_access, withdraw) |

---

## Move Examples

- **OTW (One-Time Witness):** See `packages/blockchain/contracts/sources/suipatron.move` — `SUIPATRON` struct and `init` function
- **Capability:** `AdminCap`, `CreatorCap` in suipatron.move
- **Shared Objects:** `Platform`, `CreatorProfile` — use `transfer::share_object` in init
- **Dynamic Object Fields:** `Content` stored via `dof::add` on CreatorProfile

---

## PTB Examples

See [architecture/PTB-SPECIFICATION.md](../architecture/PTB-SPECIFICATION.md) for full pseudo-code.

Key patterns:
- `Transaction` from `@mysten/sui/transactions`
- `tx.moveCall({ target, arguments })`
- `tx.object(PLATFORM_ID)`, `tx.pure.string()`, `tx.pure.u64()`
- Coin split for purchase_access: `tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)])`

---

## Frontend Examples

- **Enoki sign-in:** `useEnokiFlow()`, `createAuthorizationURL()`
- **Sponsored tx:** `sponsorAndExecuteTransaction` via backend /api/sponsor
- **SEAL encrypt:** Identity = 32 bytes (CreatorProfile ID)
- **Walrus:** Upload encrypted blob → blobId; download by blobId

---

## References

- [PTB-SPECIFICATION.md](../architecture/PTB-SPECIFICATION.md)
- [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) — Contract API
- [SCOPE.md](../SCOPE.md) — Full spec
