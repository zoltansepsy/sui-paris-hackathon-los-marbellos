/**
 * User and auth domain types.
 * Used by auth-context and frontend components.
 */

export interface CreatorProfile {
  profileId?: string;
  creatorCapId?: string;
  bio?: string;
  price?: number;
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
