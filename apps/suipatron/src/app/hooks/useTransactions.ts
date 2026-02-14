"use client";

import { useMemo, useCallback } from "react";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { createTransactionService } from "../services/transactionService";
import type { ProfileUpdateParams } from "../types/onchain";

/**
 * Hook providing transaction execution methods for all SuiPatron entry functions.
 *
 * Each method builds the PTB then signs and executes via the connected wallet.
 */
export function useSuiPatronTransactions() {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const platformId = useNetworkVariable("platformId");
  const account = useCurrentAccount();

  const txService = useMemo(
    () => createTransactionService(packageId, platformId, suiClient),
    [packageId, platformId, suiClient],
  );

  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();

  const createProfile = useCallback(
    async (name: string, bio: string, price: number) => {
      if (!account?.address) throw new Error("Wallet not connected");
      const tx = txService.buildCreateProfileTx(name, bio, price);
      tx.setSender(account.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute, account],
  );

  const updateProfile = useCallback(
    async (
      profileId: string,
      creatorCapId: string,
      updates: ProfileUpdateParams,
    ) => {
      if (!account?.address) throw new Error("Wallet not connected");
      const tx = txService.buildUpdateProfileTx(
        profileId,
        creatorCapId,
        updates,
      );
      tx.setSender(account.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute, account],
  );

  const purchaseAccess = useCallback(
    async (profileId: string, price: number) => {
      if (!account?.address) throw new Error("Wallet not connected");
      const tx = txService.buildPurchaseAccessTx(profileId, price);
      tx.setSender(account.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute, account],
  );

  const withdrawEarnings = useCallback(
    async (profileId: string, creatorCapId: string) => {
      if (!account?.address) throw new Error("Wallet not connected");
      const tx = txService.buildWithdrawEarningsTx(profileId, creatorCapId);
      tx.setSender(account.address);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute, account],
  );

  return {
    createProfile,
    updateProfile,
    purchaseAccess,
    withdrawEarnings,
    isPending,
  };
}
