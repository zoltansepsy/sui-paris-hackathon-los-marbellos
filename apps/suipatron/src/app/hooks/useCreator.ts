"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { createCreatorService } from "../services/creatorService";

/**
 * Hook to get a single CreatorProfile by ID.
 */
export function useCreatorProfile(profileId: string | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["creatorProfile", profileId],
    queryFn: () => service.getCreatorProfile(profileId!),
    enabled: !!profileId,
    staleTime: 30_000,
  });
}

/**
 * Hook to get all creator profiles (event-based discovery).
 */
export function useCreatorProfiles(limit?: number) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["creatorProfiles", limit],
    queryFn: () => service.getCreatorProfiles(limit),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

/**
 * Hook to find the creator profile owned by the current user.
 */
export function useMyCreatorProfile(address: string | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["myCreatorProfile", address],
    queryFn: () => service.getCreatorByOwner(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

/**
 * Hook to get the CreatorCap owned by the current user.
 */
export function useMyCreatorCap(address: string | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["myCreatorCap", address],
    queryFn: () => service.getCreatorCapByOwner(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

/**
 * Hook to get content list for a creator profile.
 */
export function useContentList(profileId: string | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["contentList", profileId],
    queryFn: () => service.getContentList(profileId!),
    enabled: !!profileId,
    staleTime: 30_000,
  });
}
