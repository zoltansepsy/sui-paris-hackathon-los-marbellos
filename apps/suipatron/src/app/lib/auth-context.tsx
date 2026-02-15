"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import type { User } from "@/shared/types/user.types";
import { EnokiFlowProvider, useEnokiFlow } from "@mysten/enoki/react";
import {
  isEnokiConfigured,
  enokiApiKey,
  googleClientId,
} from "./enoki-provider";

interface AuthContextType {
  user: User | null;
  walletAddress: string | null;
  isLoading: boolean;
  signIn: (emailOrRedirect?: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type StorageAdapter = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function userFromAddress(address: string): User {
  const short = truncateAddress(address);
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
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address ?? null;

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
      value={{ user, walletAddress, isLoading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function MockAuthProviderInner({ children }: { children: React.ReactNode }) {
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storageRef = useRef<StorageAdapter | null>(null);

  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  const walletAddress = currentAccount?.address ?? null;

  // Derive user from wallet or mock
  const user: User | null = walletAddress
    ? {
        name: truncateAddress(walletAddress),
        email: "",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
        isCreator: false,
        ...mockUser, // preserve any updateUser overrides
        id: walletAddress, // always use wallet address as id
      }
    : mockUser;

  useEffect(() => {
    import("./storage").then(({ getAuthStorage }) => {
      storageRef.current = getAuthStorage();
      const stored = storageRef.current.getItem("suipatron_user");
      if (stored) {
        try {
          setMockUser(JSON.parse(stored));
        } catch {
          /* ignore */
        }
      }
      setIsLoading(false);
    });
  }, []);

  // Mock sign-in for dev (when no wallet connected)
  const signIn = async (email?: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: (email || "demo@example.com").split("@")[0],
      email: email || "demo@example.com",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || "demo"}`,
      isCreator: false,
    };

    setMockUser(newUser);
    const storage =
      storageRef.current ?? (await import("./storage")).getAuthStorage();
    storage.setItem("suipatron_user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const signOut = () => {
    if (walletAddress) {
      disconnectWallet();
    }
    setMockUser(null);
    storageRef.current?.removeItem("suipatron_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...mockUser, ...updates };
    setMockUser(updatedUser as User);
    storageRef.current?.setItem("suipatron_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, walletAddress, isLoading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isEnokiConfigured) {
    return (
      <EnokiFlowProvider apiKey={enokiApiKey}>
        <EnokiAuthProviderInner>{children}</EnokiAuthProviderInner>
      </EnokiFlowProvider>
    );
  }
  return <MockAuthProviderInner>{children}</MockAuthProviderInner>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
