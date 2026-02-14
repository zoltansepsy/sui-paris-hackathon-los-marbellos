/**
 * Registry service - business logic for creator handle lookups.
 * Uses indexer store; throws HandleNotFoundError when not found.
 */

import { getIndexerStore } from "../indexer/get-store";
import { HandleNotFoundError } from "@/shared/errors/custom-errors";
import { CreatorNotFoundError } from "@/shared/errors/custom-errors";
import type { IndexedHandle, IndexedCreator } from "../indexer/types";

/**
 * Look up a handle and return the indexed handle entry.
 * @throws HandleNotFoundError when handle does not exist
 */
export async function lookupHandle(handle: string): Promise<IndexedHandle> {
  const store = getIndexerStore();
  const entry = await store.getHandle(handle);
  if (!entry) {
    throw new HandleNotFoundError(handle);
  }
  return entry;
}

/**
 * Resolve a handle to its creator profile.
 * @throws HandleNotFoundError when handle does not exist
 * @throws CreatorNotFoundError when the profile referenced by the handle is missing
 */
export async function getCreatorByHandle(
  handle: string,
): Promise<{ handle: IndexedHandle; creator: IndexedCreator }> {
  const store = getIndexerStore();
  const entry = await store.getHandle(handle);
  if (!entry) {
    throw new HandleNotFoundError(handle);
  }
  const creator = await store.getCreator(entry.profileId);
  if (!creator) {
    throw new CreatorNotFoundError(entry.profileId);
  }
  return { handle: entry, creator };
}

/**
 * Get the handle registered for a creator profile, or null if none.
 */
export async function getHandleForCreator(
  profileId: string,
): Promise<IndexedHandle | null> {
  const store = getIndexerStore();
  const entry = await store.getHandleByProfileId(profileId);
  return entry ?? null;
}
