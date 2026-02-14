/**
 * Content Service — orchestrates SEAL + Walrus + TransactionService
 * for complete content upload and download lifecycles.
 *
 * Reference: local-context/app/services/deliverableService.ts
 */

import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import type { SessionKey } from "@mysten/seal";
import type { Signer } from "@mysten/sui/cryptography";
import type { Transaction } from "@mysten/sui/transactions";
import type { ContentUploadParams } from "../types/onchain";
import { SealService, createSealService } from "./sealService";
import { WalrusService, createWalrusService } from "./walrusService";
import {
  TransactionService,
  createTransactionService,
} from "./transactionService";

export interface ContentServiceConfig {
  suiClient: SuiJsonRpcClient;
  packageId: string;
  platformId: string;
  network?: "testnet" | "mainnet";
}

export class ContentService {
  private _sealService: SealService | null = null;
  private walrusService: WalrusService;
  private transactionService: TransactionService;
  private suiClient: SuiJsonRpcClient;
  private packageId: string;

  constructor(private config: ContentServiceConfig) {
    this.suiClient = config.suiClient;
    this.packageId = config.packageId;
    this.walrusService = createWalrusService(
      config.suiClient,
      config.network ?? "testnet",
    );
    this.transactionService = createTransactionService(
      config.packageId,
      config.platformId,
    );
  }

  /**
   * Lazy-init SEAL service to avoid WASM loading during SSR.
   */
  private get sealService(): SealService {
    if (!this._sealService) {
      this._sealService = createSealService({
        suiClient: this.suiClient,
        packageId: this.packageId,
      });
    }
    return this._sealService;
  }

  /**
   * Upload encrypted content and build the publish_content transaction.
   *
   * Flow:
   * 1. Read file bytes
   * 2. SEAL encrypt with creatorProfileId identity
   * 3. Upload encrypted bytes to Walrus
   * 4. Build publish_content transaction (caller signs/executes)
   *
   * @returns The Walrus blob ID and the publish transaction to sign.
   */
  async uploadContent(
    params: ContentUploadParams,
    creatorProfileId: string,
    creatorCapId: string,
    signAndExecute: (tx: {
      transaction: string;
      options?: Record<string, unknown>;
    }) => Promise<{ digest: string }>,
    ownerAddress: string,
  ): Promise<{ blobId: string; publishTx: Transaction }> {
    // Step 1: Read file as bytes
    const fileBytes = new Uint8Array(await params.file.arrayBuffer());

    // Step 2: Encrypt with SEAL
    const { encryptedObject } = await this.sealService.encrypt(
      creatorProfileId,
      fileBytes,
    );

    // Step 3: Upload to Walrus
    const blobId = await this.walrusService.uploadEncryptedContent(
      encryptedObject,
      signAndExecute,
      ownerAddress,
    );

    // Step 4: Build publish_content transaction
    const publishTx = this.transactionService.buildPublishContentTx(
      creatorProfileId,
      creatorCapId,
      params.title,
      params.description,
      blobId,
      params.contentType,
    );

    return { blobId, publishTx };
  }

  /**
   * Download and decrypt content.
   *
   * Flow:
   * 1. Download encrypted blob from Walrus
   * 2. SEAL decrypt using session key + AccessPass
   *
   * @returns Decrypted content bytes.
   */
  async downloadContent(
    blobId: string,
    sessionKey: SessionKey,
    accessPassId: string,
  ): Promise<Uint8Array> {
    // Step 1: Download from Walrus
    const encryptedBytes = await this.walrusService.downloadBlob(blobId);

    // Step 2: Decrypt with SEAL
    return this.sealService.decrypt(encryptedBytes, sessionKey, accessPassId);
  }

  /**
   * Upload an avatar image (no encryption, public).
   */
  async uploadAvatar(
    file: File,
    signer: Signer,
    ownerAddress?: string,
  ): Promise<string> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    return this.walrusService.uploadPublicFile(bytes, signer, ownerAddress);
  }

  /**
   * Download an avatar (no decryption, public).
   */
  async downloadAvatar(blobId: string): Promise<Uint8Array> {
    return this.walrusService.downloadBlob(blobId);
  }

  /**
   * Create a SEAL session key (delegates to SealService).
   */
  async createSessionKey(
    address: string,
    signPersonalMessage: (params: {
      message: Uint8Array;
    }) => Promise<{ signature: string }>,
  ): Promise<SessionKey> {
    return this.sealService.createSessionKey(address, signPersonalMessage);
  }
}

export function createContentService(
  config: ContentServiceConfig,
): ContentService {
  return new ContentService(config);
}
