"use client";

import { useMemo, useCallback } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
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

  const txService = useMemo(
    () => createTransactionService(packageId, platformId),
    [packageId, platformId],
  );

  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction({
      execute: async ({ bytes, signature }) => {
        const result = await suiClient.executeTransactionBlock({
          transactionBlock: bytes,
          signature,
          options: { showEffects: true, showEvents: true },
        });
        return result;
      },
    });

  const createProfile = useCallback(
    async (name: string, bio: string, price: number) => {
      const tx = txService.buildCreateProfileTx(name, bio, price);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute],
  );

  const updateProfile = useCallback(
    async (
      profileId: string,
      creatorCapId: string,
      updates: ProfileUpdateParams,
    ) => {
      const tx = txService.buildUpdateProfileTx(
        profileId,
        creatorCapId,
        updates,
      );
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute],
  );

  const purchaseAccess = useCallback(
    async (profileId: string, price: number) => {
      const tx = txService.buildPurchaseAccessTx(profileId, price);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute],
  );

  const withdrawEarnings = useCallback(
    async (profileId: string, creatorCapId: string) => {
      const tx = txService.buildWithdrawEarningsTx(profileId, creatorCapId);
      return signAndExecute({ transaction: tx });
    },
    [txService, signAndExecute],
  );

  return {
    createProfile,
    updateProfile,
    purchaseAccess,
    withdrawEarnings,
    isPending,
  };
}
