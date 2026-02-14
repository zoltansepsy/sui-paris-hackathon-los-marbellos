"use client";

import React, { createContext, useContext } from "react";
import { EnokiFlowProvider, useEnokiFlow } from "@mysten/enoki/react";

const ENOKI_API_KEY =
  process.env.NEXT_PUBLIC_ENOKI_PUBLIC_KEY ??
  process.env.VITE_ENOKI_PUBLIC_KEY ??
  "";
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  process.env.VITE_GOOGLE_CLIENT_ID ??
  "";

export const isEnokiConfigured = Boolean(ENOKI_API_KEY && GOOGLE_CLIENT_ID);
export const enokiApiKey = ENOKI_API_KEY;
export const googleClientId = GOOGLE_CLIENT_ID;

/** Network for zkLogin (must match Enoki API key's enabled networks in portal). */
const rawNetwork =
  process.env.NEXT_PUBLIC_SUI_NETWORK ??
  process.env.VITE_SUI_NETWORK ??
  "testnet";
export const enokiNetwork: "mainnet" | "testnet" | "devnet" =
  rawNetwork === "mainnet" ||
  rawNetwork === "testnet" ||
  rawNetwork === "devnet"
    ? rawNetwork
    : "testnet";

/** Optional Enoki flow: null when Enoki not configured (wallet-only mode). Use for zkLogin tx signing. */
export const EnokiFlowContext = createContext<ReturnType<
  typeof useEnokiFlow
> | null>(null);

export function useEnokiFlowOptional() {
  return useContext(EnokiFlowContext);
}

export function EnokiProvider({ children }: { children: React.ReactNode }) {
  if (!isEnokiConfigured) {
    return <>{children}</>;
  }
  return <EnokiFlowProvider apiKey={enokiApiKey}>{children}</EnokiFlowProvider>;
}

export { useEnokiFlow };
