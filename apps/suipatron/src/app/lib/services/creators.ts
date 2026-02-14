/**
 * Creator service - business logic for creator data.
 * Uses indexer store; throws CreatorNotFoundError when not found.
 */

import { getIndexerStore } from "../indexer/get-store";
import { CreatorNotFoundError } from "@/shared/errors/custom-errors";
import type { CreatorsPageResult } from "@/shared/types/creator.types";
import type { IndexedCreator } from "../indexer/types";

/**
 * Get paginated list of creators.
 */
export async function getCreators(
  limit: number,
  cursor?: string | null,
): Promise<CreatorsPageResult> {
  try {
    const store = getIndexerStore();
    const { creators, nextCursor } = await store.getCreators(limit, cursor);
    return {
      creators,
      nextCursor,
      hasNextPage: nextCursor != null,
    };
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * Get a single creator by profile ID.
 * @throws CreatorNotFoundError when creator does not exist
 */
export async function getCreator(profileId: string): Promise<IndexedCreator> {
  const store = getIndexerStore();
  const creator = await store.getCreator(profileId);
  if (!creator) {
    throw new CreatorNotFoundError(profileId);
  }
  return creator;
}
