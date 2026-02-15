/**
 * Enoki server-side client for sponsored transactions.
 * Used by /api/sponsor and /api/sponsor/execute routes.
 */

import { EnokiClient } from "@mysten/enoki";
import type { EnokiNetwork } from "@mysten/enoki";

const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ?? process.env.PACKAGE_ID ?? "";

export function getAllowedMoveCallTargets(): string[] {
  if (!PACKAGE_ID) return [];
  return [
    `${PACKAGE_ID}::suipatron::create_profile`,
    `${PACKAGE_ID}::suipatron::update_profile`,
    `${PACKAGE_ID}::suipatron::publish_content`,
    `${PACKAGE_ID}::suipatron::purchase_access`,
    `${PACKAGE_ID}::suipatron::withdraw_earnings`,
    `${PACKAGE_ID}::suipatron::add_tier`,
    `${PACKAGE_ID}::suipatron::tip`,
    `${PACKAGE_ID}::suipatron::renew_subscription`,
    `${PACKAGE_ID}::registry::register_handle`,
  ];
}

export function getEnokiClient(): EnokiClient {
  const apiKey = process.env.ENOKI_SECRET_KEY;
  if (!apiKey) {
    throw new Error(
      "ENOKI_SECRET_KEY is required for sponsored transactions. Set it in .env.local.",
    );
  }
  return new EnokiClient({ apiKey });
}

export function getNetwork(): EnokiNetwork {
  const network =
    process.env.NEXT_PUBLIC_SUI_NETWORK ??
    process.env.VITE_SUI_NETWORK ??
    "testnet";
  if (network === "mainnet" || network === "testnet" || network === "devnet") {
    return network;
  }
  return "testnet";
}
