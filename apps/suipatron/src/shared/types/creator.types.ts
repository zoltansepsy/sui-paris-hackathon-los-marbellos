/**
 * Creator, Tier, and Content domain types.
 * Used by mock-data, frontend pages, API responses, and services.
 */

export interface Tier {
  name: string;
  description: string;
  price: number; // in SUI (display units)
  tierLevel: number;
  durationMs: number | null; // null = permanent, number = subscription period in ms
}

export interface CreatorsPageResult {
  creators: Array<{
    profileId: string;
    owner: string;
    name: string;
    bio: string;
    avatarBlobId?: string;
    suinsName?: string;
    tiers: Tier[];
    contentCount: number;
    totalSupporters: number;
    createdAt: number;
  }>;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface Creator {
  id: string;
  owner: string; // SUI address of creator (for SuiNS resolution)
  name: string;
  email: string;
  avatar: string;
  suinsName?: string;
  bio?: string;
  tiers: Tier[];
  balance?: number;
  contentCount: number;
  supporterCount: number;
}

export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  type: "image" | "text" | "pdf";
  thumbnail?: string;
  isLocked: boolean;
  minTierLevel: number;
  createdAt: Date;
}
