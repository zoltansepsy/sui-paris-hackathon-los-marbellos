# SuiPatron — SUI Ecosystem Tools

**Purpose:** SuiPatron-relevant subset of SUI ecosystem tools. Full details in [SCOPE.md](../SCOPE.md) Section 7.

---

## Tools Used

| Tool | Purpose | Docs |
|------|---------|------|
| **Enoki** | zkLogin (Google sign-in), Sponsored Transactions | [docs.enoki.mystenlabs.com](https://docs.enoki.mystenlabs.com/) |
| **SEAL** | Client-side encryption; seal_approve for access control | [seal-docs.wal.app](https://seal-docs.wal.app/) |
| **Walrus** | Decentralized blob storage (encrypted content) | [docs.sui.io/standards/walrus](https://docs.sui.io/standards/walrus) |
| **SuiNS** | Human-readable names (e.g. alice@suipatron.sui) | [testnet.suins.io](https://testnet.suins.io) |

---

## Enoki

- **zkLogin:** Passwordless sign-in via Google; derives SUI address from JWT
- **Sponsored transactions:** Backend sponsors gas; users don't need SUI for gas
- **Setup:** Enoki Portal, Google OAuth client ID, redirect URLs, whitelist Move targets

---

## SEAL

- **Encrypt:** Client-side; identity = 32 bytes (CreatorProfile ID)
- **Decrypt:** PTB calls seal_approve; key servers validate AccessPass on-chain
- **MVP identity:** Flat — all content for a creator shares same identity
- **Threshold:** 2 (at least 2 key servers agree)

---

## Walrus

- **Upload:** Store encrypted blob → returns blobId
- **Download:** Fetch by blobId
- **Note:** All data public — always encrypt with SEAL first

---

## SuiNS

- **Subnames:** `alice@suipatron.sui` via Enoki subname API
- **Resolve:** `suiClient.resolveNameServiceAddress({ name })`
- **Prerequisite:** Own `suipatron.sui` domain on testnet

---

See [SCOPE.md](../SCOPE.md) Section 7 for full integration specs.
