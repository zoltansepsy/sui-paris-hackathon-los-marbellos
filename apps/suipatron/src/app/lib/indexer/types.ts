/**
 * Indexer data types aligned with SCOPE Section 12 and Move events.
 * Used by the event indexer and GET /api/creators, GET /api/creator/:id.
 */

export interface IndexedCreator {
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
}

export interface IndexedContent {
  contentId: string;
  creatorProfileId: string;
  title: string;
  description: string;
  blobId: string;
  contentType: string;
  createdAt: number;
}

export interface IndexedAccessPurchase {
  accessPassId: string;
  creatorProfileId: string;
  supporter: string;
  amount: number;
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
  getLastCursor(eventType: string): Promise<string | undefined>;
  setLastCursor(eventType: string, cursor: string): Promise<void>;
}
