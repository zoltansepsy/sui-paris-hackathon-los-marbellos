"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Client-only access pass utilities.
 * Uses dynamic import so storage module is never loaded during SSR (WebTree pattern).
 */

export function useAccessPasses(userId: string | undefined) {
  const [accessPasses, setAccessPasses] = useState<string[]>([]);
  const storageRef = useRef<{
    getItem: (k: string) => string | null;
    setItem: (k: string, v: string) => void;
    removeItem: (k: string) => void;
  } | null>(null);

  useEffect(() => {
    import("./storage").then(({ getAccessPassStorage }) => {
      storageRef.current = getAccessPassStorage();
      if (userId) {
        const stored = storageRef.current.getItem(`suipatron_access_${userId}`);
        if (stored) {
          try {
            setAccessPasses(JSON.parse(stored));
          } catch {
            setAccessPasses([]);
          }
        }
      }
    });
  }, [userId]);

  const hasAccessPass = useCallback(
    (creatorId: string) => accessPasses.includes(creatorId),
    [accessPasses],
  );

  const addAccessPass = useCallback(
    (creatorId: string) => {
      if (!userId || !storageRef.current) return;
      const current = [...accessPasses];
      if (!current.includes(creatorId)) {
        current.push(creatorId);
        storageRef.current.setItem(
          `suipatron_access_${userId}`,
          JSON.stringify(current),
        );
        setAccessPasses(current);
      }
    },
    [userId, accessPasses],
  );

  const refresh = useCallback(() => {
    if (storageRef.current && userId) {
      const stored = storageRef.current.getItem(`suipatron_access_${userId}`);
      if (stored) {
        try {
          setAccessPasses(JSON.parse(stored));
        } catch {
          setAccessPasses([]);
        }
      }
    }
  }, [userId]);

  return { accessPasses, hasAccessPass, addAccessPass, refresh };
}
