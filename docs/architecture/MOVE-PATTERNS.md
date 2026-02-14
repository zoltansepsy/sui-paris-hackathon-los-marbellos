# SuiPatron — Move Patterns

**Source:** [docs/MOVE-PATTERNS.md](../MOVE-PATTERNS.md) (adapted for SuiPatron)  
**Purpose:** Patterns used in SuiPatron contracts — read before writing or changing Move.

**Last updated:** February 2025

---

## 1. Patterns We Use

| Pattern | When to Use | Module / File |
|---------|-------------|---------------|
| **One-Time Witness (OTW)** | Module init; singleton Platform + AdminCap at package publish | `suipatron.move` (init) |
| **Capability** | Access control: AdminCap (platform admin), CreatorCap (per-creator auth) | `suipatron.move` |
| **Shared Objects** | Platform, CreatorProfile — concurrent read/write | `suipatron.move` |
| **Dynamic Object Fields** | Content items on CreatorProfile (unbounded) | `suipatron.move` |
| **Events** | All state changes (ProfileCreated, ContentPublished, etc.) | `suipatron.move` |
| **Version Tracking** | Platform + CreatorProfile version fields, migrate function | `suipatron.move` |

---

## 2. SuiPatron Snippets

### One-Time Witness

```move
// init with OTW — SUIPATRON passed as &SUIPATRON
public fun init(witness: SUIPATRON, ctx: &mut TxContext) {
    let (pack, upgrade_cap) = sui::package::claim(/* ... */);
    let platform = Platform { /* ... */ };
    let admin_cap = AdminCap { id: object::new(ctx) };
    // transfer_admin_cap to deployer
}
```

### Capability Pattern

```move
// AdminCap — platform admin only
public struct AdminCap has key, store {
    id: UID,
}

// CreatorCap — proves ownership of a CreatorProfile
public struct CreatorCap has key, store {
    id: UID,
    creator_profile_id: ID,
}
```

### Shared Objects

```move
// Platform and CreatorProfile are shared
shared_object::move(platform);
shared_object::move(profile);
```

### Dynamic Object Fields

```move
// Content stored as DOF on CreatorProfile
dynamic_object_field::add(&mut profile.id, content_id, content);
```

---

## 3. Naming and Layout

- **Modules:** `suipatron.move` (core), `seal_policy.move` (SEAL validation)
- **Structs:** PascalCase — `CreatorProfile`, `AccessPass`, `CreatorCap`, `AdminCap`
- **Functions:** `snake_case` — `create_profile`, `purchase_access`, `withdraw_earnings`

---

## 4. References

- [Sui Move by Example](https://examples.sui.io/)
- [Sui Move Patterns](https://docs.sui.io/standards/patterns)
- [Sui Docs – Move](https://docs.sui.io/build/move)

---

## 5. Commands

```bash
cd move/suipatron && sui move build
cd move/suipatron && sui move test
cd move/suipatron && sui client publish --gas-budget 200000000
```

After publish, add Package ID and Platform ID to `frontend/.env`.
