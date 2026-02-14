# Features To Patterns

## Quick Feature Reference

- **Creator Newsfeed**: Dynamic Object Fields (DOF) + Walrus.
- **Creator Registry**: Dynamic Fields (DF) + String Mapping.
- **Subscription Tiers**: `Sui::Clock` + Table (DF) + Internal Logic.
- **Individual Requests**: Hot Potato Pattern + Escrow.
- **Community NFTs**: One-Time Witness (OTW) + Enoki/Sui Stack.
- **One-Time Tips**: Simple Transfer + Platform Fee PTB.
- **Pay-per-Post**: Escrow logic + Specific Vector Access.
- **Crowdfunding**: Shared Object + CampaignCap + Contributor Table (DF).
- **Content Encryption**: Sui Seal + Nonce-based Ephemeral Keys.
- **Platform Fees**: Programmable Transaction Blocks (PTB).

---

## Detailed Implementation Ideas

### Creator Newsfeed (DOF + Walrus)

We will use Dynamic Object Fields to attach `Post` objects to a `CreatorProfile`. Each post is its own object containing metadata and a Walrus Blob ID. This allows the frontend to index the creator's feed efficiently by querying child objects rather than scanning the entire chain, while Walrus handles the heavy lifting of storing videos and high‑res images.

### Creator Registry (DF + Mapping)

To allow fans to find creators by name or handle, a shared `Registry` object will use Dynamic Fields. It stores a lightweight mapping of `String` (the handle) to `ID` (the Creator Profile). Since these mappings do not need to exist as standalone objects, Dynamic Fields keep the storage costs low and the lookups fast.

### Subscription Tiers (Clock + Internal Logic)

Tiers are managed using the `Sui::Clock` module to track time‑based expiry. A table (implemented via Dynamic Fields) inside the Tier object will map `address` to `timestamp_ms`. Every time a user tries to access content, the contract checks if the current time is less than their stored expiry.

### Individual Requests (Hot Potato)

For custom requests (like a personal shoutout), we use the Hot Potato pattern to ensure completion. A user's payment creates a `RequestReceipt` with no abilities, meaning the transaction must finish with the creator either fulfilling it or the system refunding it after a timeout. This protects the fan's money from being stuck if a creator is inactive.

### Community NFTs (OTW + Enoki)

To give creators their own brand, we use the One‑Time Witness (OTW) pattern to initialize a unique NFT collection for their community. Leveraging your existing Enoki setup, creators can easily upload media that gets minted as membership NFTs for users who reach specific payment tiers.

### One-Time Tips & Platform Fees (PTBs)

Instead of complex escrow for a simple tip, we use Programmable Transaction Blocks (PTBs). In a single transaction, the PTB splits the fan’s `Coin<SUI>`, sending the majority to the creator and a small percentage to the platform treasury. This ensures a seamless user experience with only one signature required.

### Pay-per-Post (Modified Escrow)

This leverages your existing Fiverr‑style escrow model but applies it to a single content object. When a user pays for a single post, a Dynamic Field is added to their profile granting them specific access to that Walrus Blob ID without requiring a full monthly subscription.

### Crowdfunding Content (Shared Object + Caps)

A creator can launch a campaign using a Shared Object to collect funds from multiple early investors. A `CampaignCap` ensures only the creator can withdraw once the goal is hit. A Dynamic Field table tracks contributors so they receive automatic free access or discounts once the content is released.

### Content Encryption (Sui Seal)

To prevent unauthorized link sharing, we use Sui Seal to store content keys. The contract generates a unique nonce (seed) for authorized users which, when combined with the sealed master key on the frontend, allows the user to decrypt the Walrus blob locally. This makes shared keys useless for anyone who did not trigger the on‑chain access check.
