"use client";

import { useMemo, useRef, useCallback, useState } from "react";
import {
  useSuiClient,
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { createContentService } from "../services/contentService";
import type { ContentUploadParams } from "../types/onchain";
import type { SessionKey } from "@mysten/seal";

/**
 * Hook for uploading encrypted content.
 *
 * Handles the full flow: SEAL encrypt → Walrus upload → build publish_content tx.
 */
export function useContentUpload() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();
  const [isPending, setIsPending] = useState(false);

  const contentService = useMemo(
    () =>
      createContentService({
        suiClient,
        packageId,
        platformId,
        network: "testnet",
      }),
    [suiClient, packageId, platformId],
  );

  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const upload = useCallback(
    async (
      params: ContentUploadParams,
      creatorProfileId: string,
      creatorCapId: string,
    ) => {
      if (!account?.address) throw new Error("Wallet not connected");
      setIsPending(true);
      try {
        const { blobId, publishTx } = await contentService.uploadContent(
          params,
          creatorProfileId,
          creatorCapId,
          async (tx) => {
            const result = await signAndExecute({
              transaction: tx.transaction,
            });
            return { digest: result.digest };
          },
          account.address,
        );

        // Sign and execute the publish_content transaction
        const publishResult = await signAndExecute({
          transaction: publishTx,
        });

        return { blobId, publishDigest: publishResult.digest };
      } finally {
        setIsPending(false);
      }
    },
    [contentService, signAndExecute, account?.address],
  );

  return { upload, isPending };
}

/**
 * Hook for uploading unencrypted content (MVP - Walrus only, no SEAL).
 *
 * Handles: File → Walrus upload → publish_content tx.
 */
export function useContentUploadUnencrypted() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();
  const [isPending, setIsPending] = useState(false);

  const contentService = useMemo(
    () =>
      createContentService({
        suiClient,
        packageId,
        platformId,
        network: "testnet",
      }),
    [suiClient, packageId, platformId],
  );

  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const upload = useCallback(
    async (
      params: ContentUploadParams,
      creatorProfileId: string,
      creatorCapId: string,
    ) => {
      if (!account?.address) throw new Error("Wallet not connected");
      setIsPending(true);
      try {
        const { blobId, publishTx } =
          await contentService.uploadContentUnencrypted(
            params,
            creatorProfileId,
            creatorCapId,
            async (tx) => {
              const result = await signAndExecute({
                transaction: tx.transaction,
              });
              return { digest: result.digest };
            },
            account.address,
          );

        // Sign and execute the publish_content transaction
        const publishResult = await signAndExecute({
          transaction: publishTx,
        });

        return { blobId, publishDigest: publishResult.digest };
      } finally {
        setIsPending(false);
      }
    },
    [contentService, signAndExecute, account?.address, suiClient],
  );

  return { upload, isPending };
}

/**
 * Hook for decrypting content.
 *
 * Manages SEAL session key lifecycle (create once, reuse for 10 min).
 */
export function useContentDecrypt() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [isPending, setIsPending] = useState(false);
  const sessionKeyRef = useRef<SessionKey | null>(null);

  const contentService = useMemo(
    () =>
      createContentService({
        suiClient,
        packageId,
        platformId,
        network: "testnet",
      }),
    [suiClient, packageId, platformId],
  );

  const ensureSessionKey = useCallback(async () => {
    if (!account?.address) throw new Error("Wallet not connected");

    // Reuse existing session key if not expired
    if (sessionKeyRef.current && !sessionKeyRef.current.isExpired()) {
      return sessionKeyRef.current;
    }

    // Create a new session key
    const sessionKey = await contentService.createSessionKey(
      account.address,
      signPersonalMessage,
    );
    sessionKeyRef.current = sessionKey;
    return sessionKey;
  }, [contentService, account?.address, signPersonalMessage]);

  const decrypt = useCallback(
    async (blobId: string, creatorProfileId: string, accessPassId: string) => {
      setIsPending(true);
      try {
        const sessionKey = await ensureSessionKey();
        return await contentService.downloadContent(
          blobId,
          sessionKey,
          accessPassId,
        );
      } catch (error) {
        // If session key expired mid-request, clear and retry once
        if (error instanceof Error && error.message.includes("expired")) {
          sessionKeyRef.current = null;
          const sessionKey = await ensureSessionKey();
          return await contentService.downloadContent(
            blobId,
            sessionKey,
            accessPassId,
          );
        }
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [contentService, ensureSessionKey],
  );

  return { decrypt, isPending };
}

/**
 * Hook for downloading public (unencrypted) content from Walrus.
 */
export function useWalrusDownload() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");

  const contentService = useMemo(
    () =>
      createContentService({
        suiClient,
        packageId,
        platformId,
        network: "testnet",
      }),
    [suiClient, packageId, platformId],
  );

  const download = useCallback(
    async (blobId: string): Promise<Uint8Array> => {
      return await contentService.downloadAvatar(blobId);
    },
    [contentService],
  );

  return { download };
}
