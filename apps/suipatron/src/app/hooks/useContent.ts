"use client";

import { useMemo, useRef, useCallback, useState } from "react";
import {
  useSuiClient,
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { toBase64 } from "@mysten/bcs";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { createContentService } from "../services/contentService";
import type { ContentUploadParams } from "../types/onchain";
import type { SessionKey } from "@mysten/seal";
import type { Transaction } from "@mysten/sui/transactions";
import { useAuth } from "../lib/auth-context";
import { useEnokiFlow, useEnokiFlowOptional } from "../lib/enoki-provider";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { executeWithEnokiKeypair } from "../lib/enoki-execute";

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
 * Uses connected wallet or zkLogin (Enoki keypair) for Walrus steps and publish_content.
 */
export function useContentUploadUnencrypted() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();
  const { walletAddress } = useAuth();
  const enoki = useEnokiFlowOptional();
  const [isPending, setIsPending] = useState(false);

  const sender = account?.address ?? walletAddress ?? null;
  const useZkLogin =
    !account?.address && !!walletAddress && !!enoki && isEnokiConfigured;

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

  const signWithEnoki = useCallback(
    async (bytes: Uint8Array) => {
      if (!enoki) throw new Error("Enoki not available");
      const keypair = await enoki.getKeypair();
      const result = await keypair.signTransaction(bytes);
      const sig =
        typeof result.signature === "string"
          ? result.signature
          : toBase64(result.signature as Uint8Array);
      return { signature: sig };
    },
    [enoki],
  );

  const executeZk = useCallback(
    async (tx: Transaction) => {
      if (!walletAddress) throw new Error("Sign in to continue");
      return await executeWithEnokiKeypair({
        tx,
        sender: walletAddress,
        signTransaction: signWithEnoki,
      });
    },
    [walletAddress, signWithEnoki],
  );

  const upload = useCallback(
    async (
      params: ContentUploadParams,
      creatorProfileId: string,
      creatorCapId: string,
    ) => {
      if (!sender) {
        throw new Error("Sign in or connect wallet to upload content");
      }

      const signAndExecuteForWalrus = async (tx: {
        transaction: unknown;
      }): Promise<{ digest: string }> => {
        const transaction = tx.transaction as Transaction;
        if (useZkLogin) {
          const result = await executeZk(transaction);
          return { digest: result.digest };
        }
        const result = await signAndExecute({
          transaction,
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
            sender,
          );

        if (useZkLogin) {
          const publishResult = await executeZk(publishTx);
          return { blobId, publishDigest: publishResult.digest };
        }
        const publishResult = await signAndExecute({
          transaction: publishTx,
        });
        return { blobId, publishDigest: publishResult.digest };
      } finally {
        setIsPending(false);
      }
    },
    [contentService, signAndExecute, sender, useZkLogin, executeZk],
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
