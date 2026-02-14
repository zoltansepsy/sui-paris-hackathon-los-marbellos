"use client";

import { useState, useCallback } from "react";
import { useEnokiFlow } from "./enoki-provider";
import { sponsorAndExecute } from "./sponsor-flow";
import { isEnokiConfigured } from "./enoki-provider";

export function useSponsorTransaction() {
  const enoki = useEnokiFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T>(params: {
      buildTx: () => T;
      getSender: () => Promise<string>;
    }) => {
      if (!isEnokiConfigured) {
        throw new Error(
          "Enoki is not configured. Set NEXT_PUBLIC_ENOKI_PUBLIC_KEY and NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
        );
      }

      const keypair = await enoki.getKeypair();
      const address = (await enoki.$zkLoginState.get()).address;
      if (!address) {
        throw new Error("Not signed in. Please sign in with Google first.");
      }

      const signTransaction = async (bytes: Uint8Array) => {
        const result = await keypair.signTransaction(bytes);
        return { signature: result.signature };
      };

      return sponsorAndExecute({
        buildTx:
          params.buildTx as () => import("@mysten/sui/transactions").Transaction,
        getSender: params.getSender,
        signTransaction,
      });
    },
    [enoki],
  );

  const run = useCallback(
    async <T>(params: {
      buildTx: () => T;
      getSender: () => Promise<string>;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await execute(params);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Transaction failed";
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [execute],
  );

  return { execute: run, isLoading, error, isReady: isEnokiConfigured };
}
