/**
 * PTB (Programmable Transaction Block) builders for SuiPatron Phase 2.
 * See docs/architecture/PTB-SPECIFICATION.md and docs/IMPLEMENTATION_STATUS.md
 */

import { Transaction } from "@mysten/sui/transactions";

const CLOCK_OBJECT_ID = "0x6";

function getPackageId(): string {
  const id =
    process.env.NEXT_PUBLIC_PACKAGE_ID ?? process.env.VITE_PACKAGE_ID ?? "";
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_PACKAGE_ID (or VITE_PACKAGE_ID) not configured",
    );
  }
  return id;
}

function getPlatformId(): string {
  const id =
    process.env.NEXT_PUBLIC_PLATFORM_ID ?? process.env.VITE_PLATFORM_ID ?? "";
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_PLATFORM_ID (or VITE_PLATFORM_ID) not configured",
    );
  }
  return id;
}

function getRegistryId(): string {
  const id =
    process.env.NEXT_PUBLIC_REGISTRY_ID ?? process.env.VITE_REGISTRY_ID ?? "";
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_REGISTRY_ID (or VITE_REGISTRY_ID) not configured",
    );
  }
  return id;
}

/**
 * Build create_profile transaction with initial tier.
 */
export function buildCreateProfileTx(
  name: string,
  bio: string,
  tierName: string,
  tierDescription: string,
  tierPriceMist: bigint,
  tierLevel: number,
  tierDurationMs: bigint | null,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();
  const platform = getPlatformId();

  tx.moveCall({
    target: `${pkg}::suipatron::create_profile`,
    arguments: [
      tx.object(platform),
      tx.pure.string(name),
      tx.pure.string(bio),
      tx.pure.string(tierName),
      tx.pure.string(tierDescription),
      tx.pure.u64(tierPriceMist),
      tx.pure.u64(tierLevel),
      tx.pure.option("u64", tierDurationMs),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build purchase_access transaction.
 * Splits payment from gas coin and calls purchase_access with tier_index.
 */
export function buildPurchaseAccessTx(
  profileId: string,
  tierIndex: number,
  priceMist: bigint,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();
  const platform = getPlatformId();

  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);

  tx.moveCall({
    target: `${pkg}::suipatron::purchase_access`,
    arguments: [
      tx.object(platform),
      tx.object(profileId),
      tx.pure.u64(tierIndex),
      payment,
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build withdraw_earnings transaction.
 */
export function buildWithdrawEarningsTx(
  profileId: string,
  creatorCapId: string,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();

  tx.moveCall({
    target: `${pkg}::suipatron::withdraw_earnings`,
    arguments: [
      tx.object(profileId),
      tx.object(creatorCapId),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build update_profile transaction (for Dashboard profile edit).
 * Phase 2: no price param — use buildAddTierTx to manage tiers.
 */
export function buildUpdateProfileTx(
  profileId: string,
  creatorCapId: string,
  updates: {
    name?: string | null;
    bio?: string | null;
    avatarBlobId?: string | null;
    suinsName?: string | null;
  },
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();

  tx.moveCall({
    target: `${pkg}::suipatron::update_profile`,
    arguments: [
      tx.object(profileId),
      tx.object(creatorCapId),
      tx.pure.option("string", updates.name ?? null),
      tx.pure.option("string", updates.bio ?? null),
      tx.pure.option("string", updates.avatarBlobId ?? null),
      tx.pure.option("string", updates.suinsName ?? null),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build publish_content transaction with tier gating.
 */
export function buildPublishContentTx(
  profileId: string,
  creatorCapId: string,
  title: string,
  description: string,
  blobId: string,
  contentType: "image" | "text" | "pdf",
  minTierLevel: number,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();

  tx.moveCall({
    target: `${pkg}::suipatron::publish_content`,
    arguments: [
      tx.object(profileId),
      tx.object(creatorCapId),
      tx.pure.string(title),
      tx.pure.string(description),
      tx.pure.string(blobId),
      tx.pure.string(contentType),
      tx.pure.u64(minTierLevel),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build add_tier transaction to add a new tier to a creator profile.
 */
export function buildAddTierTx(
  profileId: string,
  creatorCapId: string,
  name: string,
  description: string,
  priceMist: bigint,
  tierLevel: number,
  durationMs: bigint | null,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();

  tx.moveCall({
    target: `${pkg}::suipatron::add_tier`,
    arguments: [
      tx.object(profileId),
      tx.object(creatorCapId),
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.u64(priceMist),
      tx.pure.u64(tierLevel),
      tx.pure.option("u64", durationMs),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build tip transaction. Splits coin from gas and sends to creator.
 */
export function buildTipTx(profileId: string, amountMist: bigint): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();
  const platform = getPlatformId();

  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);

  tx.moveCall({
    target: `${pkg}::suipatron::tip`,
    arguments: [
      tx.object(platform),
      tx.object(profileId),
      payment,
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build renew_subscription transaction.
 * Extends an existing subscription AccessPass.
 */
export function buildRenewSubscriptionTx(
  profileId: string,
  accessPassId: string,
  priceMist: bigint,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();
  const platform = getPlatformId();

  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);

  tx.moveCall({
    target: `${pkg}::suipatron::renew_subscription`,
    arguments: [
      tx.object(platform),
      tx.object(profileId),
      tx.object(accessPassId),
      payment,
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build register_handle transaction for creator registry.
 */
export function buildRegisterHandleTx(
  profileId: string,
  creatorCapId: string,
  handle: string,
): Transaction {
  const tx = new Transaction();
  const pkg = getPackageId();
  const registry = getRegistryId();

  tx.moveCall({
    target: `${pkg}::registry::register_handle`,
    arguments: [
      tx.object(registry),
      tx.object(profileId),
      tx.object(creatorCapId),
      tx.pure.string(handle),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}
