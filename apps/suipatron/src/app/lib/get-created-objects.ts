import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

export interface CreatedProfileResult {
  profileId: string;
  creatorCapId: string;
}

export async function getCreatedProfileFromTx(
  digest: string,
): Promise<CreatedProfileResult | null> {
  const network =
    process.env.NEXT_PUBLIC_SUI_NETWORK ??
    process.env.VITE_SUI_NETWORK ??
    "testnet";
  const net = network as "mainnet" | "testnet" | "devnet" | "localnet";
  const client = new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(net),
    network: net,
  });
  const tx = await client.getTransactionBlock({
    digest,
    options: { showObjectChanges: true },
  });

  const changes = tx.objectChanges;
  if (!Array.isArray(changes)) return null;

  let profileId: string | null = null;
  let creatorCapId: string | null = null;

  for (const change of changes) {
    if (change.type === "created" && change.objectId && change.objectType) {
      if (change.objectType.includes("CreatorProfile")) {
        profileId = change.objectId;
      } else if (change.objectType.includes("CreatorCap")) {
        creatorCapId = change.objectId;
      }
    }
  }

  if (profileId && creatorCapId) {
    return { profileId, creatorCapId };
  }
  return null;
}
