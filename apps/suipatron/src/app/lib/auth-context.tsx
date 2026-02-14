"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuthStorage } from "./storage";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  suinsName?: string;
  isCreator?: boolean;
  creatorProfile?: {
    bio?: string;
    price?: number;
    balance?: number;
    contentCount?: number;
    supporterCount?: number;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const storage = getAuthStorage();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = storage.getItem("suipatron_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore corrupt data
      }
    }
    setIsLoading(false);
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
    storage.setItem("suipatron_user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
    storage.removeItem("suipatron_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    storage.setItem("suipatron_user", JSON.stringify(updatedUser));
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
