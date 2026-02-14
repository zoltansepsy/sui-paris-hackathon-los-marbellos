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
import type { Transaction } from "@mysten/sui/transactions";
import { useAuth } from "../lib/auth-context";
import { useEnokiFlow } from "../lib/enoki-provider";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { buildPublishContentTx } from "../lib/ptb";

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
              transaction: tx.transaction as Transaction,
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
 * Wallet-only: requires connected wallet for Walrus steps and publish_content.
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
      if (!account?.address) {
        throw new Error("Connect wallet to upload content");
      }

      const signAndExecuteForWalrus = async (tx: {
        transaction: unknown;
      }): Promise<{ digest: string }> => {
        const result = await signAndExecute({
          transaction: tx.transaction as Transaction,
        });
        return { digest: result.digest };
      };

      setIsPending(true);
      try {
        const { blobId, publishTx } =
          await contentService.uploadContentUnencrypted(
            params,
            creatorProfileId,
            creatorCapId,
            signAndExecuteForWalrus,
            account.address,
          );

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
 * Hook for decrypting content.
 * Supports both wallet (dapp-kit) and zkLogin (Enoki) for session key signing.
 */
export function useContentDecrypt() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();
  const { walletAddress } = useAuth();
  const enoki = useEnokiFlow();
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
    const address = account?.address ?? walletAddress ?? null;
    if (!address) throw new Error("Sign in to view encrypted content");

    if (sessionKeyRef.current && !sessionKeyRef.current.isExpired()) {
      return sessionKeyRef.current;
    }

    const isZkLogin = !account?.address && !!walletAddress && isEnokiConfigured;
    const signPersonalMessageFn = isZkLogin
      ? async ({ message }: { message: Uint8Array }) => {
          const keypair = await enoki.getKeypair();
          const result = await keypair.signPersonalMessage(message);
          return { signature: result.signature };
        }
      : signPersonalMessage;

    const sessionKey = await contentService.createSessionKey(
      address,
      signPersonalMessageFn,
    );
    sessionKeyRef.current = sessionKey;
    return sessionKey;
  }, [
    contentService,
    account?.address,
    walletAddress,
    enoki,
    signPersonalMessage,
  ]);

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
