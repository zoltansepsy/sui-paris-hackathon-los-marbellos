"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { createAccessPassService } from "../services/accessPassService";

/**
 * Hook to get all AccessPass NFTs owned by the current user.
 */
export function useMyAccessPasses(address: string | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createAccessPassService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["myAccessPasses", address],
    queryFn: () => service.getAccessPassesByOwner(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

/**
 * Hook to check if the user has access to a specific creator.
 * Returns the AccessPass if found, null otherwise.
 */
export function useHasAccess(
  address: string | undefined,
  creatorProfileId: string | undefined,
) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createAccessPassService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["hasAccess", address, creatorProfileId],
    queryFn: () => service.getAccessPassForCreator(address!, creatorProfileId!),
    enabled: !!address && !!creatorProfileId,
    staleTime: 30_000,
  });
}
