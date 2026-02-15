/**
 * SuiNS Service — resolve addresses to SuiNS names and vice versa.
 *
 * Uses @mysten/sui SDK's built-in SuiNS resolution functions.
 */

import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

export interface SuiNSService {
  /**
   * Resolve an address to its SuiNS name(s).
   * Returns the primary name (first in list) or null if none found.
   */
  resolveName(address: string): Promise<string | null>;

  /**
   * Resolve a SuiNS name to its address.
   */
  resolveAddress(name: string): Promise<string | null>;
}

export function createSuiNSService(
  suiClient: SuiJsonRpcClient,
): SuiNSService {
  return {
    async resolveName(address: string): Promise<string | null> {
      try {
        const result = await suiClient.resolveNameServiceNames({
          address,
          format: "at", // Use @ format (alice@sui)
        });

        // Return primary name (first in list) or null
        return result.data[0] ?? null;
      } catch (error) {
        console.error("Failed to resolve SuiNS name:", error);
        return null;
      }
    },

    async resolveAddress(name: string): Promise<string | null> {
      try {
        const result = await suiClient.resolveNameServiceAddress({
          name,
        });

        return result ?? null;
      } catch (error) {
        console.error("Failed to resolve SuiNS address:", error);
        return null;
      }
    },
  };
}
