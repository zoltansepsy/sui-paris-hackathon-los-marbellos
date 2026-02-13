# Move patterns – SUI Paris Hack

**Heavy focus:** All on-chain code in this repo must follow the patterns below. Agents and devs: read this before writing or changing Move.

**Last updated:** 2026-02-13

---

## 1. Patterns we use

Fill this section with the patterns your team chose and when to use them.

| Pattern | When to use | Module / file |
|--------|-------------|----------------|
| **Capability** | Access control: only holder can call certain functions | _e.g. `sources/capability.move`_ |
| **Hot Potato** | One-time action: object must be consumed in the same tx | _e.g. …_ |
| **Witness** | One-time init: prove type is unique (e.g. `sui::package::UpgradeCap`) | _e.g. …_ |
| **One-Time Witness** | Module init; passed as `&T` with `drop` only for that type | _e.g. …_ |

---

## 2. Snippets (add your own or from Sui samples)

### Capability pattern

Use for admin- or role-gated functions. Issue a capability object to authorized callers; require it in `public entry` / `public fun`.

```move
// Example: admin-only action
public struct AdminCap has key, store {
    id: sui::object::UID,
}

public fun do_admin_thing(cap: &AdminCap, ctx: &mut TxContext) {
    // only holder of AdminCap can call
}
```

### Hot Potato pattern

Use when an object must be consumed in the same transaction (e.g. claim flow). Struct has no `key`, `store`, or `drop`; must be passed to a function that “consumes” it.

```move
// Example: one-time claim
public struct ClaimPotato { /* no abilities */ }

public fun consume_claim(potato: ClaimPotato) {
    // potato is destroyed here
}
```

### Witness / One-Time Witness

Use for one-time initialization (e.g. creating a shared object or issuing a single admin cap). Often used with `sui::package::UpgradeCap` or a custom witness type.

```move
// Example: init with witness
public fun init(witness: T, ctx: &mut TxContext) {
    let (pack, upgrade_cap) = sui::package::claim(/* ... */);
    // one-time setup
}
```

---

## 3. Naming and layout

- **Modules:** One module per “feature” or resource type (e.g. `capability.move`, `main.move`). Match package name in `Move.toml` (e.g. `hack`).
- **Structs:** PascalCase. Suffixes like `Cap` for capabilities, `Potato` for hot potatoes, or your team convention.
- **Functions:** `snake_case`. Prefer `public entry` for tx entry points; use `public fun` when called from other Move code.

---

## 4. References

- [Sui Move by Example](https://examples.sui.io/)
- [Sui Move Patterns](https://docs.sui.io/standards/patterns)
- [Sui Docs – Move](https://docs.sui.io/build/move)

---

## 5. Commands

```bash
# From repo root
pnpm --filter @hack/blockchain build:contracts   # sui move build
pnpm --filter @hack/blockchain test:contracts    # sui move test

# From packages/blockchain/contracts
sui move build
sui move test
sui client publish --gas-budget 100000000
```

After publish, add Package ID and object IDs to `packages/blockchain/sdk/networkConfig.ts` (and optionally `apps/dapp/.env.local`).
