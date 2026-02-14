"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { createSuiNSService } from "../services/suinsService";

/**
 * Hook to resolve a SUI address to its SuiNS name.
 * Returns the primary name (first in list) or undefined if none found.
 */
export function useSuinsName(address: string | undefined) {
  const suiClient = useSuiClient();

  const service = useMemo(
    () => createSuiNSService(suiClient),
    [suiClient],
  );

  return useQuery({
    queryKey: ["suinsName", address],
    queryFn: () => service.resolveName(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (SuiNS names change rarely)
    retry: false, // Don't retry if no name found
  });
}

/**
 * Hook to resolve a SuiNS name to its address.
 */
export function useSuinsAddress(name: string | undefined) {
  const suiClient = useSuiClient();

  const service = useMemo(
    () => createSuiNSService(suiClient),
    [suiClient],
  );

  return useQuery({
    queryKey: ["suinsAddress", name],
    queryFn: () => service.resolveAddress(name!),
    enabled: !!name,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });
}
