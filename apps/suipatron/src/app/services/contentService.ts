/**
 * Content Service — orchestrates SEAL + Walrus + TransactionService
 * for complete content upload and download lifecycles.
 *
 * Reference: local-context/app/services/deliverableService.ts
 */

import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import type { SessionKey } from "@mysten/seal";
import type { Transaction } from "@mysten/sui/transactions";
import type { ContentUploadParams } from "../types/onchain";
import { SealService, createSealService } from "./sealService";
import { WalrusService, createWalrusService } from "./walrusService";
import {
  TransactionService,
  createTransactionService,
} from "./transactionService";
import { CLOCK_OBJECT_ID } from "../constants";

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
      config.suiClient,
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
    console.log("🔒 SEAL: Original file size:", fileBytes.length, "bytes");

    // Step 2: Encrypt with SEAL
    const { encryptedObject } = await this.sealService.encrypt(
      creatorProfileId,
      fileBytes,
    );
    console.log("🔒 SEAL: Encrypted size:", encryptedObject.length, "bytes");
    console.log("🔒 SEAL: Using identity (creator profile ID):", creatorProfileId);

    // Step 3: Upload to Walrus
    const blobId = await this.walrusService.uploadEncryptedContent(
      encryptedObject,
      signAndExecute,
      ownerAddress,
    );
    console.log("🔒 SEAL: Encrypted blob uploaded to Walrus with ID:", blobId);

    // Step 4: Build publish_content transaction
    const publishTx = this.transactionService.buildPublishContentTx(
      creatorProfileId,
      creatorCapId,
      params.title,
      params.description,
      blobId,
      params.contentType,
    );

    // Set transaction sender (required for signing)
    publishTx.setSender(ownerAddress);

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
   * Upload content WITHOUT encryption (MVP - just Walrus, no SEAL).
   *
   * Flow:
   * 1. Read file bytes
   * 2. Upload to Walrus (public, no encryption)
   * 3. Build publish_content transaction (caller signs/executes)
   *
   * @returns The Walrus blob ID and the publish transaction to sign.
   */
  async uploadContentUnencrypted(
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

    // Step 2: Upload to Walrus (public, no encryption)
    const blobId = await this.walrusService.uploadPublicFile(
      fileBytes,
      signAndExecute,
      ownerAddress,
    );

    // Step 3: Build publish_content transaction
    const publishTx = this.transactionService.buildPublishContentTx(
      creatorProfileId,
      creatorCapId,
      params.title,
      params.description,
      blobId,
      params.contentType,
    );

    // Set transaction sender (required for signing)
    publishTx.setSender(ownerAddress);

    return { blobId, publishTx };
  }

  /**
   * Upload an avatar image (no encryption, public).
   */
  async uploadAvatar(
    file: File,
    signAndExecute: (tx: {
      transaction: any;
      options?: Record<string, unknown>;
    }) => Promise<{ digest: string }>,
    ownerAddress: string,
  ): Promise<string> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    return this.walrusService.uploadPublicFile(bytes, signAndExecute, ownerAddress);
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

  /**
   * NEW: Upload content with BUNDLED PTB (certify + publish in 1 transaction).
   *
   * Reduces signatures from 3 → 2:
   * - Signature 1: Register blob with Walrus
   * - Signature 2: Certify blob + Publish content (BUNDLED in 1 PTB)
   *
   * Flow:
   * 1. Read file bytes
   * 2. Upload to Walrus (returns blobId + certifyTx)
   * 3. Build PTB that merges certifyTx + publish_content
   * 4. Return bundled PTB for caller to sign (1 signature instead of 2)
   */
  async uploadContentBundled(
    params: ContentUploadParams,
    creatorProfileId: string,
    creatorCapId: string,
    signAndExecute: (tx: {
      transaction: string;
      options?: Record<string, unknown>;
    }) => Promise<{ digest: string }>,
    ownerAddress: string,
  ): Promise<{ blobId: string; bundledTx: Transaction }> {
    // Step 1: Read file as bytes
    const fileBytes = new Uint8Array(await params.file.arrayBuffer());

    // Step 2: Upload to Walrus (returns certify TX instead of executing it)
    const { blobId, certifyTx } =
      await this.walrusService.uploadFileReturnCertifyTx(
        fileBytes,
        signAndExecute,
        ownerAddress,
      );

    console.log("📦 Walrus upload complete. BlobId:", blobId);
    console.log("🔗 Building bundled PTB (certify + publish)...");

    // Step 3: Create a new Transaction that includes certify + publish
    // We'll execute certify first, then publish in the same PTB
    const bundledTx = certifyTx; // Start with certify transaction

    // Step 4: Add publish_content move call to the certify transaction
    bundledTx.moveCall({
      target: `${this.packageId}::suipatron::publish_content`,
      arguments: [
        bundledTx.object(creatorProfileId),
        bundledTx.object(creatorCapId),
        bundledTx.pure.string(params.title),
        bundledTx.pure.string(params.description),
        bundledTx.pure.string(blobId),
        bundledTx.pure.string(params.contentType),
        bundledTx.object(CLOCK_OBJECT_ID), // Clock object (required for timestamp)
      ],
    });

    // Set transaction sender
    bundledTx.setSender(ownerAddress);

    console.log("✅ Bundled PTB created (certify + publish in 1 transaction)");

    return { blobId, bundledTx };
  }
}

export function createContentService(
  config: ContentServiceConfig,
): ContentService {
  return new ContentService(config);
}
