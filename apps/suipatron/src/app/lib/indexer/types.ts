/**
 * Indexer data types aligned with Phase 2 Move events and contract API.
 * Used by the event indexer and GET /api/creators, GET /api/creator/:id.
 */

export interface IndexedTier {
  name: string;
  description: string;
  price: number; // in MIST
  tierLevel: number;
  durationMs: number | null; // null = permanent, number = subscription period in ms
}

export interface IndexedCreator {
  profileId: string;
  owner: string;
  name: string;
  bio: string;
  avatarBlobId?: string;
  suinsName?: string;
  tiers: IndexedTier[];
  contentCount: number;
  totalSupporters: number;
  createdAt: number;
}

export interface IndexedContent {
  contentId: string;
  creatorProfileId: string;
  title: string;
  description: string;
  blobId: string;
  contentType: string;
  minTierLevel: number;
  createdAt: number;
}

export interface IndexedAccessPurchase {
  accessPassId: string;
  creatorProfileId: string;
  supporter: string;
  amount: number;
  tierLevel: number;
  expiresAt: number | null; // null = permanent
  timestamp: number;
}

export interface IndexedHandle {
  handle: string;
  profileId: string;
  registeredAt: number;
}

export interface IndexedTip {
  profileId: string; // creator who received the tip
  tipper: string; // address of the tipper
  totalAmount: number; // total tip amount in MIST
  creatorAmount: number; // amount after platform fee
  platformFee: number; // platform fee portion
  timestamp: number;
}

/** Cursor-based pagination for GET /api/creators */
export interface CreatorsPage {
  creators: IndexedCreator[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

/** Async store interface: in-memory adapter or Supabase implementation */
export interface IndexerStore {
  upsertCreator(creator: IndexedCreator): Promise<void>;
  upsertContent(content: IndexedContent): Promise<void>;
  addAccessPurchase(purchase: IndexedAccessPurchase): Promise<void>;
  getCreator(profileId: string): Promise<IndexedCreator | undefined>;
  getCreators(
    limit: number,
    cursor?: string | null,
  ): Promise<{ creators: IndexedCreator[]; nextCursor: string | null }>;
  getContentByProfile(profileId: string): Promise<IndexedContent[]>;
  getSupporters(profileId: string): Promise<IndexedAccessPurchase[]>;
  upsertHandle(entry: IndexedHandle): Promise<void>;
  getHandle(handle: string): Promise<IndexedHandle | undefined>;
  getHandleByProfileId(profileId: string): Promise<IndexedHandle | undefined>;
  updateAccessPassExpiry(
    accessPassId: string,
    newExpiresAt: number,
  ): Promise<void>;
  addTip(tip: IndexedTip): Promise<void>;
  getTipsByProfile(profileId: string): Promise<IndexedTip[]>;
  getTipsByTipper(tipper: string): Promise<IndexedTip[]>;
  getLastCursor(eventType: string): Promise<string | undefined>;
  setLastCursor(eventType: string, cursor: string): Promise<void>;
}
