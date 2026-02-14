import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

// Network storage helpers
const NETWORK_KEY = "sui_network";
const DEFAULT_NETWORK = "testnet";

export type NetworkType = "devnet" | "testnet" | "mainnet";

export function getCurrentNetwork(): NetworkType {
  if (typeof window === "undefined") return DEFAULT_NETWORK;
  return (localStorage.getItem(NETWORK_KEY) as NetworkType) || DEFAULT_NETWORK;
}

export function setCurrentNetwork(network: NetworkType): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(NETWORK_KEY, network);
  }
}

export function getSuiClient(): SuiJsonRpcClient {
  const network = getCurrentNetwork();
  return new SuiJsonRpcClient({
    network,
    url: getJsonRpcFullnodeUrl(network),
  });
}

// Legacy export for backward compatibility - creates client on access
export const SUI_CLIENT = new SuiJsonRpcClient({
  network: DEFAULT_NETWORK,
  url: getJsonRpcFullnodeUrl(DEFAULT_NETWORK),
});
