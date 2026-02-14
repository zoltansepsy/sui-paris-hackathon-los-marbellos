/**
 * PTB (Programmable Transaction Block) builders for SuiPatron.
 * See docs/architecture/PTB-SPECIFICATION.md
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

/**
 * Build create_profile transaction.
 */
export function buildCreateProfileTx(
  name: string,
  bio: string,
  priceMist: bigint,
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
      tx.pure.u64(priceMist),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build purchase_access transaction.
 * Splits payment from gas coin and calls purchase_access.
 */
export function buildPurchaseAccessTx(
  profileId: string,
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
 */
export function buildUpdateProfileTx(
  profileId: string,
  creatorCapId: string,
  updates: {
    name?: string | null;
    bio?: string | null;
    avatarBlobId?: string | null;
    suinsName?: string | null;
    priceMist?: bigint | null;
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
      tx.pure.option("u64", updates.priceMist ?? null),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Build publish_content transaction.
 */
export function buildPublishContentTx(
  profileId: string,
  creatorCapId: string,
  title: string,
  description: string,
  blobId: string,
  contentType: "image" | "text" | "pdf",
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
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}
