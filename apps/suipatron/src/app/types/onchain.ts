/**
 * SuiPatron Type Definitions
 *
 * TypeScript interfaces matching on-chain Move structs,
 * event types, and parser functions.
 */

import type { SuiObjectData } from "@mysten/sui/jsonRpc";
import type { ContentType } from "../constants";

// ======== Parsed On-Chain Types ========

export interface CreatorProfile {
  objectId: string;
  version: number;
  owner: string;
  name: string;
  bio: string;
  avatarBlobId: string | null;
  suinsName: string | null;
  price: number; // in MIST
  contentCount: number;
  totalSupporters: number;
  balance: number; // in MIST (only visible to owner via object read)
}

export interface Content {
  objectId: string;
  index: number; // DOF key (u64 auto-incrementing)
  title: string;
  description: string;
  blobId: string; // Walrus blob ID (encrypted)
  createdAt: number; // timestamp_ms
  contentType: string; // "image" | "text" | "pdf"
}

export interface AccessPass {
  objectId: string;
  creatorProfileId: string;
  purchasedAt: number; // timestamp_ms
  amountPaid: number; // in MIST
  supporter: string; // address
}

export interface CreatorCap {
  objectId: string;
  creatorProfileId: string;
}

// ======== Raw Field Shapes (from SuiClient JSON responses) ========

interface CreatorProfileFields {
  version: string;
  owner: string;
  name: string;
  bio: string;
  avatar_blob_id: string | null;
  suins_name: string | null;
  price: string;
  content_count: string;
  total_supporters: string;
  balance: string;
}

interface ContentFields {
  title: string;
  description: string;
  blob_id: string;
  created_at: string;
  content_type: string;
}

interface AccessPassFields {
  creator_profile_id: string;
  purchased_at: string;
  amount_paid: string;
  supporter: string;
}

interface CreatorCapFields {
  creator_profile_id: string;
}

// ======== Event Types ========

export interface ProfileCreatedEvent {
  profile_id: string;
  owner: string;
  name: string;
  price: string;
  timestamp: string;
}

export interface ProfileUpdatedEvent {
  profile_id: string;
  name: string;
  timestamp: string;
}

export interface ContentPublishedEvent {
  content_id: string;
  profile_id: string;
  blob_id: string;
  content_type: string;
  timestamp: string;
}

export interface AccessPurchasedEvent {
  access_pass_id: string;
  profile_id: string;
  supporter: string;
  amount: string;
  timestamp: string;
}

export interface EarningsWithdrawnEvent {
  profile_id: string;
  amount: string;
  recipient: string;
  timestamp: string;
}

// ======== DTOs ========

export interface ProfileUpdateParams {
  name?: string;
  bio?: string;
  avatarBlobId?: string;
  suinsName?: string;
  price?: number; // in MIST
}

export interface ContentUploadParams {
  file: File;
  title: string;
  description: string;
  contentType: ContentType;
}

// ======== Parser Functions ========

/**
 * Parse a CreatorProfile from SUI object data.
 * Handles the raw field format from getObject/multiGetObjects responses.
 */
export function parseCreatorProfile(
  data: SuiObjectData,
): CreatorProfile | null {
  if (data.content?.dataType !== "moveObject") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data.content.fields as any;
  const fields = raw as CreatorProfileFields;
  return {
    objectId: data.objectId,
    version: parseInt(fields.version),
    owner: fields.owner,
    name: fields.name,
    bio: fields.bio,
    avatarBlobId: fields.avatar_blob_id ?? null,
    suinsName: fields.suins_name ?? null,
    price: parseInt(fields.price),
    contentCount: parseInt(fields.content_count),
    totalSupporters: parseInt(fields.total_supporters),
    balance: parseInt(fields.balance),
  };
}

/**
 * Parse an AccessPass from SUI object data.
 */
export function parseAccessPass(data: SuiObjectData): AccessPass | null {
  if (data.content?.dataType !== "moveObject") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data.content.fields as any;
  const fields = raw as AccessPassFields;
  return {
    objectId: data.objectId,
    creatorProfileId: fields.creator_profile_id,
    purchasedAt: parseInt(fields.purchased_at),
    amountPaid: parseInt(fields.amount_paid),
    supporter: fields.supporter,
  };
}

/**
 * Parse a CreatorCap from SUI object data.
 */
export function parseCreatorCap(data: SuiObjectData): CreatorCap | null {
  if (data.content?.dataType !== "moveObject") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data.content.fields as any;
  const fields = raw as CreatorCapFields;
  return {
    objectId: data.objectId,
    creatorProfileId: fields.creator_profile_id,
  };
}

/**
 * Parse Content from dynamic object field data.
 */
export function parseContent(
  data: SuiObjectData,
  index: number,
): Content | null {
  if (data.content?.dataType !== "moveObject") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data.content.fields as any;
  const fields = raw as ContentFields;
  return {
    objectId: data.objectId,
    index,
    title: fields.title,
    description: fields.description,
    blobId: fields.blob_id,
    createdAt: parseInt(fields.created_at),
    contentType: fields.content_type,
  };
}
