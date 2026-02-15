/**
 * User and auth domain types.
 * Used by auth-context and frontend components.
 */

import type { Tier } from "./creator.types";

export interface CreatorProfile {
  profileId?: string;
  creatorCapId?: string;
  bio?: string;
  tiers?: Tier[];
  balance?: number;
  contentCount?: number;
  supporterCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  suinsName?: string;
  isCreator?: boolean;
  creatorProfile?: CreatorProfile;
}
