"use client";

import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@hack/blockchain/sdk/networkConfig";
import { createCreatorService } from "../services/creatorService";
import {
  indexedCreatorToCreator,
  indexedContentToContent,
} from "../lib/adapters";
import type { Content as OnchainContent } from "../types/onchain";

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

/**
 * Hook to get multiple creator profiles by their IDs.
 * Used for Feed page to show supported creators.
 */
export function useCreatorProfilesByIds(profileIds: string[] | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  return useQuery({
    queryKey: ["creatorProfilesByIds", profileIds?.join(",")],
    queryFn: () => service.getCreatorProfilesByIds(profileIds!),
    enabled: !!profileIds && profileIds.length > 0,
    staleTime: 30_000,
  });
}

export interface FeedContentByCreator {
  profileId: string;
  contents: OnchainContent[];
}

/** List creators from indexer API (cursor pagination). Use when indexer is running. */
export function useIndexedCreators(limit = 20, cursor?: string | null) {
  const queryKey = ["indexedCreators", limit, cursor ?? ""];
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/creators?${params}`);
      if (!res.ok) throw new Error("Failed to fetch creators");
      const data = (await res.json()) as {
        creators: Array<{
          profileId: string;
          owner: string;
          name: string;
          bio: string;
          avatarBlobId?: string;
          suinsName?: string;
          price: number;
          contentCount: number;
          totalSupporters: number;
          createdAt: number;
        }>;
        nextCursor: string | null;
        hasNextPage: boolean;
      };
      return {
        creators: data.creators.map(indexedCreatorToCreator),
        nextCursor: data.nextCursor,
        hasNextPage: data.hasNextPage,
      };
    },
    staleTime: 60_000,
  });

  return {
    creators: query.data?.creators ?? [],
    nextCursor: query.data?.nextCursor ?? null,
    hasNextPage: query.data?.hasNextPage ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    error: query.error,
  };
}

/** Single creator + content from indexer API. Returns isNotFound on 404 (use on-chain fallback). */
export function useIndexedCreator(
  profileId: string | undefined,
  hasAccess: boolean,
) {
  const query = useQuery({
    queryKey: ["indexedCreator", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/creator/${profileId}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch creator");
      const data = (await res.json()) as {
        creator: {
          profileId: string;
          owner: string;
          name: string;
          bio: string;
          avatarBlobId?: string;
          suinsName?: string;
          price: number;
          contentCount: number;
          totalSupporters: number;
          createdAt: number;
        };
        content: Array<{
          contentId: string;
          creatorProfileId: string;
          title: string;
          description: string;
          blobId: string;
          contentType: string;
          createdAt: number;
        }>;
      };
      return {
        creator: indexedCreatorToCreator(data.creator),
        content: data.content.map((c) =>
          indexedContentToContent(
            {
              contentId: c.contentId,
              creatorProfileId: c.creatorProfileId,
              title: c.title,
              description: c.description,
              blobId: c.blobId,
              contentType: c.contentType,
              createdAt: c.createdAt,
            },
            hasAccess,
          ),
        ),
      };
    },
    enabled: !!profileId,
    staleTime: 60_000,
  });

  return {
    creator: query.data?.creator ?? undefined,
    content: query.data?.content ?? [],
    isLoading: query.isLoading,
    isNotFound: query.isSuccess && query.data === null,
    refetch: query.refetch,
  };
}

/**
 * Fetch content for multiple creator profiles in parallel.
 * Returns an array of { profileId, contents } for building a merged feed.
 */
export function useFeedContent(profileIds: string[] | undefined) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");

  const service = useMemo(
    () => createCreatorService(suiClient, packageId),
    [suiClient, packageId],
  );

  const queries = useQueries({
    queries: (profileIds ?? []).map((profileId) => ({
      queryKey: ["contentList", profileId] as const,
      queryFn: () => service.getContentList(profileId),
      enabled: !!profileId,
      staleTime: 30_000,
    })),
  });

  const data = useMemo((): FeedContentByCreator[] => {
    return (profileIds ?? []).map((profileId, i) => ({
      profileId,
      contents: queries[i]?.data ?? [],
    }));
  }, [profileIds, queries]);

  const isLoading = queries.some((q) => q.isLoading);

  return { data, isLoading };
}
