/**
 * Transaction Service — PTB builders for all SuiPatron entry functions.
 *
 * Each method returns a Transaction object. The caller is responsible
 * for signing and executing (via dapp-kit's useSignAndExecuteTransaction
 * or Enoki's sponsorAndExecuteTransaction).
 *
 * Reference: local-context/app/services/jobService.ts (transaction builder pattern)
 */

import { Transaction } from "@mysten/sui/transactions";
import { CLOCK_OBJECT_ID } from "../constants";
import type { ProfileUpdateParams } from "../types";

export class TransactionService {
  constructor(
    private packageId: string,
    private platformId: string,
  ) {}

  /**
   * Build create_profile transaction.
   *
   * Creates: CreatorProfile (shared) + CreatorCap (owned, transferred to sender)
   * Emits: ProfileCreated
   */
  buildCreateProfileTx(name: string, bio: string, price: number): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::suipatron::create_profile`,
      arguments: [
        tx.object(this.platformId),
        tx.pure.string(name),
        tx.pure.string(bio),
        tx.pure.u64(price),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });
    return tx;
  }

  /**
   * Build update_profile transaction with partial updates.
   *
   * Pass only the fields you want to change in `updates`.
   * Unspecified fields are sent as Option::None (no change).
   *
   * Emits: ProfileUpdated
   */
  buildUpdateProfileTx(
    profileId: string,
    creatorCapId: string,
    updates: ProfileUpdateParams,
  ): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::suipatron::update_profile`,
      arguments: [
        tx.object(profileId),
        tx.object(creatorCapId),
        tx.pure.option("string", updates.name ?? null),
        tx.pure.option("string", updates.bio ?? null),
        tx.pure.option("string", updates.avatarBlobId ?? null),
        tx.pure.option("string", updates.suinsName ?? null),
        tx.pure.option("u64", updates.price ?? null),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });
    return tx;
  }

  /**
   * Build publish_content transaction.
   *
   * blobId is the Walrus blob ID of SEAL-encrypted content.
   *
   * Creates: Content as dynamic object field on CreatorProfile
   * Emits: ContentPublished
   */
  buildPublishContentTx(
    profileId: string,
    creatorCapId: string,
    title: string,
    description: string,
    blobId: string,
    contentType: string,
  ): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::suipatron::publish_content`,
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

  /**
   * Build purchase_access transaction.
   *
   * Splits exact payment amount from gas coin.
   *
   * Creates: AccessPass NFT (transferred to sender)
   * Emits: AccessPurchased
   */
  buildPurchaseAccessTx(profileId: string, price: number): Transaction {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [price]);
    tx.moveCall({
      target: `${this.packageId}::suipatron::purchase_access`,
      arguments: [
        tx.object(this.platformId),
        tx.object(profileId),
        coin,
        tx.object(CLOCK_OBJECT_ID),
      ],
    });
    return tx;
  }

  /**
   * Build withdraw_earnings transaction.
   *
   * Transfers full balance from CreatorProfile to creator's address.
   *
   * Emits: EarningsWithdrawn
   */
  buildWithdrawEarningsTx(
    profileId: string,
    creatorCapId: string,
  ): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::suipatron::withdraw_earnings`,
      arguments: [
        tx.object(profileId),
        tx.object(creatorCapId),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });
    return tx;
  }
}

export function createTransactionService(
  packageId: string,
  platformId: string,
): TransactionService {
  return new TransactionService(packageId, platformId);
}
