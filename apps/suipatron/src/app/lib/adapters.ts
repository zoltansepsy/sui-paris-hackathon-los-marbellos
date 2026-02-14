/**
 * Type adapters: convert on-chain types to UI types.
 * This lets existing UI components (CreatorCard, ContentCard, etc.)
 * work unchanged with real on-chain data.
 */

import type {
  CreatorProfile,
  Content as OnchainContent,
} from "../types/onchain";
import type { Creator, Content } from "@/shared/types/creator.types";
import { MIST_PER_SUI, WALRUS_AGGREGATOR_URL_TESTNET } from "../constants";

export function creatorProfileToCreator(profile: CreatorProfile): Creator {
  return {
    id: profile.objectId,
    owner: profile.owner, // Preserve owner address for SuiNS resolution
    name: profile.name,
    email: "",
    avatar: profile.avatarBlobId
      ? `${WALRUS_AGGREGATOR_URL_TESTNET}/blobs/${profile.avatarBlobId}`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.objectId}`,
    suinsName: profile.suinsName ?? undefined,
    bio: profile.bio,
    price: profile.price / MIST_PER_SUI,
    balance: profile.balance / MIST_PER_SUI,
    contentCount: profile.contentCount,
    supporterCount: profile.totalSupporters,
  };
}

export function onchainContentToContent(
  content: OnchainContent,
  creatorId: string,
  hasAccess: boolean,
): Content & { blobId: string } {
  return {
    id: content.objectId,
    creatorId,
    title: content.title,
    description: content.description || undefined,
    type: (content.contentType as "image" | "text" | "pdf") || "image",
    isLocked: !hasAccess,
    createdAt: new Date(content.createdAt),
    blobId: content.blobId, // Preserve blobId for Walrus fetching
  };
}
