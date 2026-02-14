"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import type { User } from "@/shared/types/user.types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type StorageAdapter = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storageRef = useRef<StorageAdapter | null>(null);

  useEffect(() => {
    // Dynamic import: storage module only loads on client, never during SSR
    import("./storage").then(({ getAuthStorage }) => {
      storageRef.current = getAuthStorage();
      const stored = storageRef.current.getItem("suipatron_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore corrupt data
        }
      }
      setIsLoading(false);
    });
  }, []);

  const signIn = async (email: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      isCreator: false,
    };

    setUser(newUser);
    const storage =
      storageRef.current ?? (await import("./storage")).getAuthStorage();
    storage.setItem("suipatron_user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
    storageRef.current?.removeItem("suipatron_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    storageRef.current?.setItem("suipatron_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
