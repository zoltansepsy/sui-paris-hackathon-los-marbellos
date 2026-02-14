/**
 * Platform service - reads Platform shared object for fee config and stats.
 * Uses on-chain reads via SUI client (not indexer).
 */

import { SuiClient } from "@mysten/sui/client";
import type { PlatformConfig } from "@hack/types";

export type { PlatformConfig };

function getRpcUrl(): string {
  const network =
    process.env.NEXT_PUBLIC_SUI_NETWORK ??
    process.env.VITE_SUI_NETWORK ??
    "testnet";
  if (network === "mainnet") return "https://fullnode.mainnet.sui.io";
  if (network === "devnet") return "https://fullnode.devnet.sui.io";
  return "https://fullnode.testnet.sui.io";
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
 * Get current platform fee configuration and stats from on-chain Platform object.
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  const client = new SuiClient({ url: getRpcUrl() });
  const platformId = getPlatformId();

  const obj = await client.getObject({
    id: platformId,
    options: { showContent: true },
  });

  const content = obj.data?.content;
  if (!content || typeof content !== "object" || !("fields" in content)) {
    throw new Error("Failed to read Platform object");
  }

  const f = (content as { fields: Record<string, unknown> }).fields;

  // treasury is a Balance<SUI> which appears as { value: string } on-chain
  const treasury = f.treasury as { value?: string } | undefined;
  const treasuryBalance = Number(treasury?.value ?? 0);

  return {
    feeBps: Number(f.platform_fee_bps ?? 0),
    treasuryBalance,
    totalCreators: Number(f.total_creators ?? 0),
    totalAccessPasses: Number(f.total_access_passes ?? 0),
  };
}
