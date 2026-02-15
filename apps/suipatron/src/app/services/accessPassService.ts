/**
 * Access Pass Service — query AccessPass NFTs for supporters.
 *
 * AccessPass is an owned NFT proving a supporter paid for access
 * to a specific creator's content. Used for:
 * - Checking if a user has access to a creator
 * - Listing all creators a user supports
 * - Providing the AccessPass object ID for SEAL decryption
 */

import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import type { AccessPass } from "../types/onchain";
import { parseAccessPass } from "../types/onchain";

export class AccessPassService {
  constructor(
    private suiClient: SuiJsonRpcClient,
    private packageId: string,
  ) {}

  /**
   * Get all AccessPass NFTs owned by an address.
   */
  async getAccessPassesByOwner(ownerAddress: string): Promise<AccessPass[]> {
    const passType = `${this.packageId}::suipatron::AccessPass`;
    const response = await this.suiClient.getOwnedObjects({
      owner: ownerAddress,
      filter: { StructType: passType },
      options: { showContent: true },
    });

    return response.data
      .map((obj) => (obj.data ? parseAccessPass(obj.data) : null))
      .filter((p): p is AccessPass => p !== null);
  }

  /**
   * Get the AccessPass for a specific creator, if the user has one.
   */
  async getAccessPassForCreator(
    ownerAddress: string,
    creatorProfileId: string,
  ): Promise<AccessPass | null> {
    const passes = await this.getAccessPassesByOwner(ownerAddress);
    return passes.find((p) => p.creatorProfileId === creatorProfileId) ?? null;
  }

  /**
   * Check if an address has access to a specific creator's content.
   */
  async hasAccessToCreator(
    ownerAddress: string,
    creatorProfileId: string,
  ): Promise<boolean> {
    const pass = await this.getAccessPassForCreator(
      ownerAddress,
      creatorProfileId,
    );
    return pass !== null;
  }
}

export function createAccessPassService(
  suiClient: SuiJsonRpcClient,
  packageId: string,
): AccessPassService {
  return new AccessPassService(suiClient, packageId);
}
