"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Client-only access pass utilities (Phase 2 — tier-aware).
 * Uses dynamic import so storage module is never loaded during SSR.
 */

export interface AccessPassEntry {
  creatorId: string;
  tierLevel: number;
  expiresAt: number | null; // epoch ms, null = permanent
}

type StorageAdapter = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
};

/** Migrate legacy string[] format to AccessPassEntry[] */
function migrateEntries(raw: unknown): AccessPassEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      // Legacy format: just a creator ID string
      return { creatorId: item, tierLevel: 1, expiresAt: null };
    }
    // Already new format
    return item as AccessPassEntry;
  });
}

export function useAccessPasses(userId: string | undefined) {
  const [entries, setEntries] = useState<AccessPassEntry[]>([]);
  const storageRef = useRef<StorageAdapter | null>(null);

  useEffect(() => {
    import("./storage").then(({ getAccessPassStorage }) => {
      storageRef.current = getAccessPassStorage();
      if (userId) {
        const stored = storageRef.current.getItem(`suipatron_access_${userId}`);
        if (stored) {
          try {
            setEntries(migrateEntries(JSON.parse(stored)));
          } catch {
            setEntries([]);
          }
        }
      }
    });
  }, [userId]);

  const hasAccessPass = useCallback(
    (creatorId: string) => {
      const now = Date.now();
      return entries.some(
        (e) =>
          e.creatorId === creatorId &&
          (e.expiresAt === null || e.expiresAt > now),
      );
    },
    [entries],
  );

  const hasAccessAtTier = useCallback(
    (creatorId: string, minTierLevel: number) => {
      const now = Date.now();
      return entries.some(
        (e) =>
          e.creatorId === creatorId &&
          e.tierLevel >= minTierLevel &&
          (e.expiresAt === null || e.expiresAt > now),
      );
    },
    [entries],
  );

  const addAccessPass = useCallback(
    (
      creatorId: string,
      tierLevel: number = 1,
      expiresAt: number | null = null,
    ) => {
      if (!userId || !storageRef.current) return;
      const current = [...entries];
      const existingIdx = current.findIndex((e) => e.creatorId === creatorId);
      const newEntry: AccessPassEntry = { creatorId, tierLevel, expiresAt };
      if (existingIdx >= 0) {
        // Upgrade: keep the higher tier level
        if (tierLevel > current[existingIdx].tierLevel) {
          current[existingIdx] = newEntry;
        }
      } else {
        current.push(newEntry);
      }
      storageRef.current.setItem(
        `suipatron_access_${userId}`,
        JSON.stringify(current),
      );
      setEntries(current);
    },
    [userId, entries],
  );

  const refresh = useCallback(() => {
    if (storageRef.current && userId) {
      const stored = storageRef.current.getItem(`suipatron_access_${userId}`);
      if (stored) {
        try {
          setEntries(migrateEntries(JSON.parse(stored)));
        } catch {
          setEntries([]);
        }
      }
    }
  }, [userId]);

  // Backward-compatible: list of creator IDs (for components that only need presence check)
  const accessPasses = entries.map((e) => e.creatorId);

  return {
    accessPasses,
    entries,
    hasAccessPass,
    hasAccessAtTier,
    addAccessPass,
    refresh,
  };
}
