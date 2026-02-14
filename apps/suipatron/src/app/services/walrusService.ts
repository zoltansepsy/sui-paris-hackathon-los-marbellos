/**
 * Walrus Service — blob upload (via upload relay) and download (via aggregator).
 *
 * Uses the @mysten/walrus SDK with upload relay for reliable uploads
 * and aggregator HTTP endpoint for fast downloads.
 *
 * Reference: local-context/app/services/walrusServiceSDK.ts
 */

import { WalrusClient } from "@mysten/walrus";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import type { Signer } from "@mysten/sui/cryptography";
import {
  WALRUS_AGGREGATOR_URL_TESTNET,
  WALRUS_UPLOAD_RELAY_TESTNET,
  WALRUS_DEFAULT_EPOCHS,
  WALRUS_UPLOAD_RELAY_TIP,
} from "../constants";

export class WalrusService {
  private client: WalrusClient | null = null;

  constructor(
    private suiClient: SuiJsonRpcClient,
    private network: "testnet" | "mainnet" = "testnet",
  ) {}

  /**
   * Lazy-initialize WalrusClient to avoid WASM loading during SSR.
   */
  private ensureClient(): WalrusClient {
    if (!this.client) {
      this.client = new WalrusClient({
        network: this.network,
        suiClient: this.suiClient,
        uploadRelay: {
          host: WALRUS_UPLOAD_RELAY_TESTNET,
          sendTip: { max: WALRUS_UPLOAD_RELAY_TIP },
        },
        storageNodeClientOptions: { timeout: 60_000 },
      });
    }
    return this.client;
  }

  /**
   * Upload encrypted content using the flow API.
   *
   * Flow: encode → register(tx) → sign+execute → wait → upload → certify(tx) → sign+execute
   *
   * Returns the Walrus blob ID after successful upload and certification.
   */
  async uploadEncryptedContent(
    encryptedBytes: Uint8Array,
    signAndExecute: (tx: {
      transaction: unknown;
      options?: Record<string, unknown>;
    }) => Promise<{ digest: string }>,
    ownerAddress: string,
  ): Promise<string> {
    const client = this.ensureClient();

    const flow = client.writeBlobFlow({ blob: encryptedBytes });

    // Step 1: Encode the blob (compute metadata, slivers)
    await flow.encode();

    // Step 2: Build registration transaction
    const registerTx = flow.register({
      epochs: WALRUS_DEFAULT_EPOCHS,
      deletable: false,
      owner: ownerAddress,
    });

    // Set transaction sender (required for signing)
    registerTx.setSender(ownerAddress);

    // Step 3: Sign and execute the registration transaction
    const registerResult = await signAndExecute({
      transaction: registerTx,
    });

    // Step 4: Wait for network sync before uploading slivers
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Step 5: Upload slivers to storage nodes (or upload relay)
    await flow.upload({ digest: registerResult.digest });

    // Step 6: Build and execute certification transaction
    const certifyTx = flow.certify();

    // Set transaction sender (required for signing)
    certifyTx.setSender(ownerAddress);

    await signAndExecute({
      transaction: certifyTx,
    });

    // Step 7: Get the blob info
    const result = await flow.getBlob();
    return result.blobId;
  }

  /**
   * Upload a public file directly (e.g., avatar images — no encryption).
   * Uses the same flow as uploadEncryptedContent but without encryption.
   */
  async uploadPublicFile(
    data: Uint8Array,
    signAndExecute: (tx: {
      transaction: unknown;
      options?: Record<string, unknown>;
    }) => Promise<{ digest: string }>,
    ownerAddress: string,
  ): Promise<string> {
    const client = this.ensureClient();

    const flow = client.writeBlobFlow({ blob: data });

    // Step 1: Encode the blob
    await flow.encode();

    // Step 2: Build registration transaction
    const registerTx = flow.register({
      epochs: WALRUS_DEFAULT_EPOCHS,
      deletable: false,
      owner: ownerAddress,
    });

    // Set transaction sender (required for signing)
    registerTx.setSender(ownerAddress);

    // Step 3: Sign and execute the registration transaction
    const registerResult = await signAndExecute({
      transaction: registerTx,
    });

    // Step 4: Wait for network sync
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Step 5: Upload slivers
    await flow.upload({ digest: registerResult.digest });

    // Step 6: Build and execute certification transaction
    const certifyTx = flow.certify();

    // Set transaction sender (required for signing)
    certifyTx.setSender(ownerAddress);

    await signAndExecute({
      transaction: certifyTx,
    });

    // Step 7: Get the blob info
    const result = await flow.getBlob();
    return result.blobId;
  }

  /**
   * Download a blob by ID.
   *
   * Tries the aggregator HTTP endpoint first (faster), falls back to SDK.
   */
  async downloadBlob(blobId: string): Promise<Uint8Array> {
    // Try aggregator first
    try {
      const url = `${WALRUS_AGGREGATOR_URL_TESTNET}/blobs/${blobId}`;
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      }
    } catch {
      // Fall through to SDK
    }

    // Fallback: use SDK readBlob
    const client = this.ensureClient();
    return client.readBlob({ blobId });
  }
}

export function createWalrusService(
  suiClient: SuiJsonRpcClient,
  network: "testnet" | "mainnet" = "testnet",
): WalrusService {
  return new WalrusService(suiClient, network);
}
