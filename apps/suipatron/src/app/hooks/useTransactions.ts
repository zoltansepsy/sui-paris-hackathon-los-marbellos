"use client";

import { useMemo, useCallback, useState } from "react";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { useAuth } from "../lib/auth-context";
import { useEnokiFlowOptional } from "../lib/enoki-provider";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { createTransactionService } from "../services/transactionService";
import type { Transaction } from "@mysten/sui/transactions";
import { executeWithEnokiKeypair } from "../lib/enoki-execute";
import type { ProfileUpdateParams } from "../types/onchain";
import { toBase64 } from "@mysten/bcs";

/**
 * Unified transaction execution: uses connected wallet when present,
 * otherwise zkLogin (Enoki keypair) when signed in with Google. User pays gas in both cases.
 */
export function useSuiPatronTransactions() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();
  const { walletAddress } = useAuth();
  const enoki = useEnokiFlowOptional();
  const [zkPending, setZkPending] = useState(false);

  const txService = useMemo(
    () => createTransactionService(packageId, platformId, suiClient),
    [packageId, platformId, suiClient],
  );

  const { mutateAsync: signAndExecute, isPending: walletPending } =
    useSignAndExecuteTransaction();

  const sender = account?.address ?? walletAddress ?? null;
  const useZkLogin =
    !account?.address && !!walletAddress && !!enoki && isEnokiConfigured;

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
      setZkPending(true);
      try {
        return await executeWithEnokiKeypair({
          tx,
          sender: walletAddress,
          signTransaction: signWithEnoki,
        });
      } finally {
        setZkPending(false);
      }
    },
    [walletAddress, signWithEnoki, enoki],
  );

  const createProfile = useCallback(
    async (name: string, bio: string, price: number) => {
      if (!sender) throw new Error("Sign in or connect wallet to continue");
      const tx = txService.buildCreateProfileTx(name, bio, price);
      if (useZkLogin) return executeZk(tx);
      tx.setSender(account!.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, sender, useZkLogin, account, signAndExecute, executeZk],
  );

  const updateProfile = useCallback(
    async (
      profileId: string,
      creatorCapId: string,
      updates: ProfileUpdateParams,
    ) => {
      if (!sender) throw new Error("Sign in or connect wallet to continue");
      const tx = txService.buildUpdateProfileTx(
        profileId,
        creatorCapId,
        updates,
      );
      if (useZkLogin) return executeZk(tx);
      tx.setSender(account!.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, sender, useZkLogin, account, signAndExecute, executeZk],
  );

  const purchaseAccess = useCallback(
    async (profileId: string, price: number) => {
      if (!sender) throw new Error("Sign in or connect wallet to continue");
      const tx = txService.buildPurchaseAccessTx(profileId, price);
      if (useZkLogin) return executeZk(tx);
      tx.setSender(account!.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, sender, useZkLogin, account, signAndExecute, executeZk],
  );

  const withdrawEarnings = useCallback(
    async (profileId: string, creatorCapId: string) => {
      if (!sender) throw new Error("Sign in or connect wallet to continue");
      const tx = txService.buildWithdrawEarningsTx(profileId, creatorCapId);
      if (useZkLogin) return executeZk(tx);
      tx.setSender(account!.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, sender, useZkLogin, account, signAndExecute, executeZk],
  );

  return {
    createProfile,
    updateProfile,
    purchaseAccess,
    withdrawEarnings,
    isPending: walletPending || zkPending,
  };
}
