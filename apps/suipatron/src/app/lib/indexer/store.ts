/**
 * In-memory indexer store. Idempotent upserts by profileId / contentId.
 * Used when Supabase is not configured (local dev). Implements IndexerStore (async).
 */

import type { IndexerStore } from "./types";
import type {
  IndexedCreator,
  IndexedContent,
  IndexedAccessPurchase,
  IndexedHandle,
} from "./types";

const creators = new Map<string, IndexedCreator>();
const contentByProfile = new Map<string, IndexedContent[]>();
const contentById = new Map<string, IndexedContent>();
const purchasesByProfile = new Map<string, IndexedAccessPurchase[]>();
const handlesByName = new Map<string, IndexedHandle>();
const handlesByProfile = new Map<string, IndexedHandle>();

/** Ordered list of profile IDs for stable pagination (insertion order) */
const creatorOrder: string[] = [];

function ensureContentList(profileId: string): IndexedContent[] {
  let list = contentByProfile.get(profileId);
  if (!list) {
    list = [];
    contentByProfile.set(profileId, list);
  }
  return list;
}

function ensurePurchaseList(profileId: string): IndexedAccessPurchase[] {
  let list = purchasesByProfile.get(profileId);
  if (!list) {
    list = [];
    purchasesByProfile.set(profileId, list);
  }
  return list;
}

const syncStore = {
  upsertCreator(creator: IndexedCreator): void {
    const id = creator.profileId;
    creators.set(id, creator);
    if (!creatorOrder.includes(id)) {
      creatorOrder.push(id);
    }
  },

  upsertContent(content: IndexedContent): void {
    contentById.set(content.contentId, content);
    const list = ensureContentList(content.creatorProfileId);
    const idx = list.findIndex((c) => c.contentId === content.contentId);
    if (idx >= 0) list[idx] = content;
    else list.push(content);
  },

  addAccessPurchase(purchase: IndexedAccessPurchase): void {
    ensurePurchaseList(purchase.creatorProfileId).push(purchase);
    const creator = creators.get(purchase.creatorProfileId);
    if (creator) {
      creator.totalSupporters = creator.totalSupporters + 1;
      creators.set(purchase.creatorProfileId, creator);
    }
  },

  getCreator(profileId: string): IndexedCreator | undefined {
    return creators.get(profileId);
  },

  getCreators(
    limit: number,
    cursor?: string | null,
  ): { creators: IndexedCreator[]; nextCursor: string | null } {
    let start = 0;
    if (cursor) {
      const pos = creatorOrder.indexOf(cursor);
      start = pos === -1 ? 0 : pos + 1;
    }
    const ids = creatorOrder.slice(start, start + limit);
    const list = ids
      .map((id) => creators.get(id))
      .filter(Boolean) as IndexedCreator[];
    const hasNext = creatorOrder.length > start + limit;
    const nextCursor =
      hasNext && list.length > 0 ? list[list.length - 1].profileId : null;
    return {
      creators: list,
      nextCursor,
    };
  },

  getContentByProfile(profileId: string): IndexedContent[] {
    return ensureContentList(profileId).slice();
  },

  getSupporters(profileId: string): IndexedAccessPurchase[] {
    return ensurePurchaseList(profileId).slice();
  },

  upsertHandle(entry: IndexedHandle): void {
    handlesByName.set(entry.handle, entry);
    handlesByProfile.set(entry.profileId, entry);
  },

  getHandle(handle: string): IndexedHandle | undefined {
    return handlesByName.get(handle);
  },

  getHandleByProfileId(profileId: string): IndexedHandle | undefined {
    return handlesByProfile.get(profileId);
  },

  getLastCursor(eventType: string): string | undefined {
    return (
      globalThis as unknown as { __indexerCursors?: Record<string, string> }
    ).__indexerCursors?.[eventType];
  },

  setLastCursor(eventType: string, cursor: string): void {
    const g = globalThis as unknown as {
      __indexerCursors?: Record<string, string>;
    };
    if (!g.__indexerCursors) g.__indexerCursors = {};
    g.__indexerCursors[eventType] = cursor;
  },
};

/** Async adapter for in-memory store (same IndexerStore interface). */
export const indexerStore: IndexerStore = {
  upsertCreator: (c) => Promise.resolve(syncStore.upsertCreator(c)),
  upsertContent: (c) => Promise.resolve(syncStore.upsertContent(c)),
  addAccessPurchase: (p) => Promise.resolve(syncStore.addAccessPurchase(p)),
  getCreator: (id) => Promise.resolve(syncStore.getCreator(id)),
  getCreators: (limit, cursor) =>
    Promise.resolve(syncStore.getCreators(limit, cursor)),
  getContentByProfile: (id) =>
    Promise.resolve(syncStore.getContentByProfile(id)),
  getSupporters: (id) => Promise.resolve(syncStore.getSupporters(id)),
  upsertHandle: (e) => Promise.resolve(syncStore.upsertHandle(e)),
  getHandle: (h) => Promise.resolve(syncStore.getHandle(h)),
  getHandleByProfileId: (id) =>
    Promise.resolve(syncStore.getHandleByProfileId(id)),
  getLastCursor: (t) => Promise.resolve(syncStore.getLastCursor(t)),
  setLastCursor: (t, c) => Promise.resolve(syncStore.setLastCursor(t, c)),
};
