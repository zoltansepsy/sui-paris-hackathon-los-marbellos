/**
 * Tips service - business logic for tip data.
 * Uses indexer store; throws CreatorNotFoundError when creator not found.
 */

import { getIndexerStore } from "../indexer/get-store";
import { CreatorNotFoundError } from "@/shared/errors/custom-errors";
import type { IndexedTip } from "../indexer/types";

/**
 * Get all tips received by a creator profile.
 * @throws CreatorNotFoundError when creator does not exist
 */
export async function getTipsByProfile(
  profileId: string,
): Promise<IndexedTip[]> {
  const store = getIndexerStore();
  const creator = await store.getCreator(profileId);
  if (!creator) {
    throw new CreatorNotFoundError(profileId);
  }
  return store.getTipsByProfile(profileId);
}

/**
 * Get all tips sent by a specific address.
 */
export async function getTipsByTipper(tipper: string): Promise<IndexedTip[]> {
  const store = getIndexerStore();
  return store.getTipsByTipper(tipper);
}
