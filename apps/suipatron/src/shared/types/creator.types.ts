/**
 * Creator and Content domain types.
 * Used by mock-data, frontend pages, API responses, and services.
 */

export interface CreatorsPageResult {
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
}

export interface Creator {
  id: string;
  owner: string; // SUI address of creator (for SuiNS resolution)
  name: string;
  email: string;
  avatar: string;
  suinsName?: string;
  bio?: string;
  price: number;
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
  createdAt: Date;
}
