/**
 * Sponsor flow: build PTB -> sponsor via API -> sign with Enoki -> execute.
 */

import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { fromBase64, toBase64 } from "@mysten/bcs";

const API_BASE = ""; // Same origin for Next.js API routes

async function getSuiClient(): Promise<SuiJsonRpcClient> {
  const network =
    process.env.NEXT_PUBLIC_SUI_NETWORK ??
    process.env.VITE_SUI_NETWORK ??
    "testnet";
  const net = network as "mainnet" | "testnet" | "devnet" | "localnet";
  return new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(net),
    network: net,
  });
}

export interface SponsorAndExecuteParams {
  buildTx: () => import("@mysten/sui/transactions").Transaction;
  getSender: () => Promise<string>;
  signTransaction: (bytes: Uint8Array) => Promise<{ signature: string }>;
}

export interface SponsorAndExecuteResult {
  digest: string;
}

/**
 * Full sponsor flow: build -> sponsor -> sign -> execute.
 */
export async function sponsorAndExecute({
  buildTx,
  getSender,
  signTransaction,
}: SponsorAndExecuteParams): Promise<SponsorAndExecuteResult> {
  const tx = buildTx();
  const client = await getSuiClient();

  const transactionKindBytes = await tx.build({
    client,
    onlyTransactionKind: true,
  });
  const transactionKindBytesBase64 = toBase64(transactionKindBytes);

  const sender = await getSender();

  const sponsorRes = await fetch(`${API_BASE}/api/sponsor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionKindBytes: transactionKindBytesBase64,
      sender,
    }),
  });

  if (!sponsorRes.ok) {
    const err = await sponsorRes.json().catch(() => ({}));
    throw new Error(
      err.error ??
        `Sponsor failed: ${sponsorRes.status} ${sponsorRes.statusText}`,
    );
  }

  const { sponsoredTxBytes, digest } = await sponsorRes.json();
  if (!sponsoredTxBytes || !digest) {
    throw new Error("Invalid sponsor response");
  }

  const sponsoredTxBytesU8 = fromBase64(sponsoredTxBytes);
  const { signature } = await signTransaction(sponsoredTxBytesU8);

  const executeRes = await fetch(`${API_BASE}/api/sponsor/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ digest, signature }),
  });

  if (!executeRes.ok) {
    const err = await executeRes.json().catch(() => ({}));
    throw new Error(
      err.error ??
        `Execute failed: ${executeRes.status} ${executeRes.statusText}`,
    );
  }

  const result = await executeRes.json();
  return { digest: result.digest ?? digest };
}
