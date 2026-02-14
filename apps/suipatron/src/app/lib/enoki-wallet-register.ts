/**
 * Register Enoki wallets with dapp-kit (WebTree-style).
 * When called before WalletProvider, the ConnectButton modal will show
 * both "Google" (Enoki) and other wallets in a single entry point.
 * Must run on client only, before WalletProvider mounts.
 */

import { registerEnokiWallets } from "@mysten/enoki";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

const ENOKI_API_KEY =
  process.env.NEXT_PUBLIC_ENOKI_PUBLIC_KEY ??
  process.env.VITE_ENOKI_PUBLIC_KEY ??
  "";
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  process.env.VITE_GOOGLE_CLIENT_ID ??
  "";
const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK ??
  process.env.VITE_SUI_NETWORK ??
  "testnet") as "mainnet" | "testnet" | "devnet";

let enokiRegistered = false;

export function initEnokiWallets(): void {
  if (typeof window === "undefined") return;
  if (enokiRegistered) return;
  if (!ENOKI_API_KEY) {
    return;
  }

  try {
    const suiClient = new SuiJsonRpcClient({
      url: getJsonRpcFullnodeUrl(NETWORK),
      network: NETWORK,
    });
    const config: Parameters<typeof registerEnokiWallets>[0] = {
      apiKey: ENOKI_API_KEY,
      client: suiClient,
      network: NETWORK,
      providers: {},
    };
    if (GOOGLE_CLIENT_ID) {
      config.providers = {
        google: {
          clientId: GOOGLE_CLIENT_ID,
        },
      };
    }
    registerEnokiWallets(config);
    enokiRegistered = true;
  } catch (err) {
    console.warn("[Enoki] Wallet registration failed:", err);
  }
}
