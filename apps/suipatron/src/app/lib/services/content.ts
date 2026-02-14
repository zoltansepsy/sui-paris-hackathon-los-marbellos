/**
 * Content service - business logic for content data.
 * Uses indexer store.
 */

import { getIndexerStore } from "../indexer/get-store";
import type { IndexedContent } from "../indexer/types";

/**
 * Get all content for a creator profile.
 */
export async function getContentByProfile(
  profileId: string,
): Promise<IndexedContent[]> {
  try {
    const store = getIndexerStore();
    return await store.getContentByProfile(profileId);
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}
