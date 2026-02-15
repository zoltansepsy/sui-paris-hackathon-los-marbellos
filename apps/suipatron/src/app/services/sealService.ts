/**
 * SEAL Service — encrypt/decrypt content with identity-based encryption.
 *
 * Uses @mysten/seal for threshold encryption where the identity is
 * the creator's profile ID (32 bytes). Any valid AccessPass for that
 * creator unlocks all content.
 *
 * Reference: local-context/app/services/sealService.ts
 */

import { SealClient, EncryptedObject, SessionKey } from "@mysten/seal";
import type { SealCompatibleClient, KeyServerConfig } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { CANONICAL_SEAL_SERVERS_TESTNET, SEAL_THRESHOLD } from "../constants";

export interface SealServiceConfig {
  suiClient: SealCompatibleClient;
  packageId: string;
  serverObjectIds?: readonly string[];
}

export class SealService {
  private client: SealClient;
  private packageId: string;
  private suiClient: SealCompatibleClient;

  constructor(config: SealServiceConfig) {
    this.packageId = config.packageId;
    this.suiClient = config.suiClient;
    const serverIds = config.serverObjectIds ?? CANONICAL_SEAL_SERVERS_TESTNET;
    this.client = new SealClient({
      suiClient: config.suiClient,
      serverConfigs: serverIds.map((id) => ({ objectId: id, weight: 1 })),
      verifyKeyServers: false,
    });
  }

  /**
   * Encrypt data under a creator's profile identity.
   *
   * The SEAL identity is simply the hex creatorProfileId string.
   * All content for this creator shares the same identity,
   * meaning any valid AccessPass for the creator decrypts all content.
   *
   * @returns Encrypted bytes (BCS-encoded EncryptedObject) and the symmetric key (for backup).
   */
  async encrypt(
    creatorProfileId: string,
    data: Uint8Array,
  ): Promise<{ encryptedObject: Uint8Array; key: Uint8Array }> {
    return this.client.encrypt({
      threshold: SEAL_THRESHOLD,
      packageId: this.packageId,
      id: creatorProfileId,
      data,
    });
  }

  /**
   * Decrypt encrypted content using a session key and AccessPass.
   *
   * Steps:
   * 1. Parse EncryptedObject to get server IDs used during encryption
   * 2. Create a SealClient matched to those servers (for reliability)
   * 3. Build seal_approve PTB with the AccessPass
   * 4. Decrypt using the matched client
   *
   * @param encryptedBytes - BCS-encoded EncryptedObject from Walrus
   * @param sessionKey - Active SEAL session key
   * @param accessPassId - Object ID of the user's AccessPass NFT
   */
  async decrypt(
    encryptedBytes: Uint8Array,
    sessionKey: SessionKey,
    accessPassId: string,
  ): Promise<Uint8Array> {
    // Parse the encrypted object to find which servers encrypted it
    const encryptedObject = EncryptedObject.parse(encryptedBytes);
    const serverIds = encryptedObject.services.map(
      ([id]: [string, number]) => id,
    );

    // Create a matched client for the servers that were used to encrypt
    const serverConfigs: KeyServerConfig[] = serverIds.map((id: string) => ({
      objectId: id,
      weight: 1,
    }));
    const decryptClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs,
      verifyKeyServers: false,
    });

    // Build the seal_approve transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::seal_policy::seal_approve`,
      arguments: [
        tx.pure.vector(
          "u8",
          Array.from(
            // SEAL identity: the hex creatorProfileId from the encrypted object
            hexToBytes(encryptedObject.id),
          ),
        ),
        tx.object(accessPassId),
      ],
    });
    const txBytes = await tx.build({
      client: this.suiClient,
      onlyTransactionKind: true,
    });

    return decryptClient.decrypt({
      data: encryptedBytes,
      sessionKey,
      txBytes,
    });
  }

  /**
   * Create a SEAL session key.
   *
   * For wallet-based signing (dapp-kit), the flow is:
   * 1. Create session key (returns PersonalMessage to sign)
   * 2. User signs with wallet via signPersonalMessage
   * 3. Call setPersonalMessageSignature on the session key
   *
   * For Enoki signer, pass the signer directly.
   */
  async createSessionKey(
    address: string,
    signPersonalMessage: (params: {
      message: Uint8Array;
    }) => Promise<{ signature: string }>,
  ): Promise<SessionKey> {
    const sessionKey = await SessionKey.create({
      address,
      packageId: this.packageId,
      ttlMin: 10,
      suiClient: this.suiClient,
    });

    // Sign the personal message with the user's wallet
    const personalMessage = sessionKey.getPersonalMessage();
    const { signature } = await signPersonalMessage({
      message: personalMessage,
    });
    await sessionKey.setPersonalMessageSignature(signature);

    return sessionKey;
  }
}

/**
 * Convert a hex string (with or without 0x prefix) to bytes.
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function createSealService(config: SealServiceConfig): SealService {
  return new SealService(config);
}
