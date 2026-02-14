"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig } from "@hack/blockchain/sdk/networkConfig";
import { initEnokiWallets } from "../lib/enoki-wallet-register";

const DEFAULT_NETWORK = "testnet";

// WebTree-style: register Enoki wallets so ConnectButton shows Google + wallets in one modal
if (typeof window !== "undefined") {
  try {
    initEnokiWallets();
  } catch (e) {
    console.warn("[SuiPatron] Enoki wallet registration failed:", e);
  }
}

export function SuiPatronProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={DEFAULT_NETWORK}
      >
        <WalletProvider autoConnect storageKey="suipatron-wallet">
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
