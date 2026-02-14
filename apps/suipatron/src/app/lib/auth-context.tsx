"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { User } from "@/shared/types/user.types";
import { EnokiFlowProvider, useEnokiFlow } from "@mysten/enoki/react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import {
  isEnokiConfigured,
  enokiApiKey,
  googleClientId,
  enokiNetwork,
  EnokiFlowContext,
} from "./enoki-provider";

interface AuthContextType {
  user: User | null;
  /** zkLogin address (Enoki). Use for on-chain queries. */
  walletAddress: string | null;
  isLoading: boolean;
  signIn: (emailOrRedirect?: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userFromAddress(address: string): User {
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return {
    id: address,
    name: short,
    email: "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
    isCreator: false,
  };
}

function EnokiAuthProviderInner({ children }: { children: React.ReactNode }) {
  const enoki = useEnokiFlow();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = (state: { address?: string }) => {
      if (state?.address) {
        setUser(userFromAddress(state.address));
      } else {
        setUser(null);
      }
    };
    syncUser(enoki.$zkLoginState.get());
    setIsLoading(false);
    const unsub = enoki.$zkLoginState.subscribe(syncUser);
    return () => unsub();
  }, [enoki]);

  const signIn = useCallback(async () => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "";
    const url = await enoki.createAuthorizationURL({
      provider: "google",
      clientId: googleClientId,
      redirectUrl,
      network: enokiNetwork,
    });
    window.location.href = url;
  }, [enoki]);

  const signOut = useCallback(async () => {
    await enoki.logout();
    setUser(null);
  }, [enoki]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        walletAddress: user?.id ?? null,
        isLoading,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Wallet-only auth when Enoki is not configured.
 * Derives user from dapp-kit useCurrentAccount(); no sponsor flow.
 */
function WalletAuthProviderInner({ children }: { children: React.ReactNode }) {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [userOverrides, setUserOverrides] = useState<Partial<User>>({});

  const user = useMemo(() => {
    const address = account?.address ?? null;
    if (!address) return null;
    const base = userFromAddress(address);
    return { ...base, ...userOverrides };
  }, [account?.address, userOverrides]);

  const signIn = useCallback(async () => {
    // No-op: user connects wallet via dapp-kit ConnectButton / wallet UI
  }, []);

  const signOut = useCallback(() => {
    disconnect();
    setUserOverrides({});
  }, [disconnect]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUserOverrides((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        walletAddress: account?.address ?? null,
        isLoading: false,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Provides Enoki flow to context so hooks can use zkLogin signing when configured. */
function EnokiFlowContextProvider({ children }: { children: React.ReactNode }) {
  const enoki = useEnokiFlow();
  return (
    <EnokiFlowContext.Provider value={enoki}>
      {children}
    </EnokiFlowContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isEnokiConfigured) {
    return (
      <EnokiFlowProvider apiKey={enokiApiKey}>
        <EnokiFlowContextProvider>
          <EnokiAuthProviderInner>{children}</EnokiAuthProviderInner>
        </EnokiFlowContextProvider>
      </EnokiFlowProvider>
    );
  }
  return (
    <EnokiFlowContext.Provider value={null}>
      <WalletAuthProviderInner>{children}</WalletAuthProviderInner>
    </EnokiFlowContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
