/**
 * Execute a transaction using Enoki keypair (zkLogin).
 * User pays gas; no sponsor. Use when user is signed in with zkLogin and no wallet connected.
 */

import type { Transaction } from "@mysten/sui/transactions";
import { getSuiClient } from "./suiClient";

export interface ExecuteWithEnokiParams {
  tx: Transaction;
  sender: string;
  signTransaction: (bytes: Uint8Array) => Promise<{ signature: string }>;
}

/**
 * Build tx with sender, sign with Enoki keypair, submit to RPC.
 * Returns digest. Throws on failure.
 */
export async function executeWithEnokiKeypair({
  tx,
  sender,
  signTransaction,
}: ExecuteWithEnokiParams): Promise<{ digest: string }> {
  const client = getSuiClient();
  tx.setSender(sender);
  const bytes = await tx.build({ client });
  const { signature } = await signTransaction(bytes);
  const result = await client.core.executeTransaction({
    transaction: bytes,
    signatures: [signature],
    include: { effects: true },
  });
  const digest =
    result.$kind === "Transaction"
      ? result.Transaction.digest
      : result.FailedTransaction?.digest;
  if (!digest) {
    throw new Error("Transaction failed or missing digest");
  }
  return { digest };
}
