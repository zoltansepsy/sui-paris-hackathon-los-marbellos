/**
 * Supabase-backed indexer store (Phase 2). Uses tables: indexer_creators, indexer_content,
 * indexer_access_purchases, indexer_cursors. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { IndexerStore } from "./types";
import type {
  IndexedCreator,
  IndexedContent,
  IndexedAccessPurchase,
  IndexedTier,
} from "./types";

type CreatorRow = {
  profile_id: string;
  owner: string;
  name: string;
  bio: string;
  avatar_blob_id: string | null;
  suins_name: string | null;
  tiers: string; // JSONB serialized
  content_count: number;
  total_supporters: number;
  created_at: number;
};

type ContentRow = {
  content_id: string;
  creator_profile_id: string;
  title: string;
  description: string;
  blob_id: string;
  content_type: string;
  min_tier_level: number;
  created_at: number;
};

type PurchaseRow = {
  access_pass_id: string;
  creator_profile_id: string;
  supporter: string;
  amount: number;
  tier_level: number;
  expires_at: number | null;
  timestamp: number;
};

function parseTiersJson(raw: unknown): IndexedTier[] {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as IndexedTier[];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw as IndexedTier[];
  return [];
}

function rowToCreator(r: CreatorRow): IndexedCreator {
  return {
    profileId: r.profile_id,
    owner: r.owner,
    name: r.name,
    bio: r.bio ?? "",
    avatarBlobId: r.avatar_blob_id ?? undefined,
    suinsName: r.suins_name ?? undefined,
    tiers: parseTiersJson(r.tiers),
    contentCount: r.content_count ?? 0,
    totalSupporters: r.total_supporters ?? 0,
    createdAt: Number(r.created_at),
  };
}

function creatorToRow(c: IndexedCreator): CreatorRow {
  return {
    profile_id: c.profileId,
    owner: c.owner,
    name: c.name,
    bio: c.bio ?? "",
    avatar_blob_id: c.avatarBlobId ?? null,
    suins_name: c.suinsName ?? null,
    tiers: JSON.stringify(c.tiers),
    content_count: c.contentCount ?? 0,
    total_supporters: c.totalSupporters ?? 0,
    created_at: c.createdAt,
  };
}

function rowToContent(r: ContentRow): IndexedContent {
  return {
    contentId: r.content_id,
    creatorProfileId: r.creator_profile_id,
    title: r.title,
    description: r.description ?? "",
    blobId: r.blob_id,
    contentType: r.content_type,
    minTierLevel: Number(r.min_tier_level ?? 0),
    createdAt: Number(r.created_at),
  };
}

function contentToRow(c: IndexedContent): ContentRow {
  return {
    content_id: c.contentId,
    creator_profile_id: c.creatorProfileId,
    title: c.title,
    description: c.description ?? "",
    blob_id: c.blobId,
    content_type: c.contentType,
    min_tier_level: c.minTierLevel,
    created_at: c.createdAt,
  };
}

function rowToPurchase(r: PurchaseRow): IndexedAccessPurchase {
  return {
    accessPassId: r.access_pass_id,
    creatorProfileId: r.creator_profile_id,
    supporter: r.supporter,
    amount: Number(r.amount),
    tierLevel: Number(r.tier_level ?? 1),
    expiresAt: r.expires_at != null ? Number(r.expires_at) : null,
    timestamp: Number(r.timestamp),
  };
}

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY required for Supabase indexer store",
    );
  }
  return createClient(url, key);
}

export function createSupabaseStore(): IndexerStore {
  return {
    async upsertCreator(creator: IndexedCreator) {
      const supabase = getClient();
      const row = creatorToRow(creator);
      await supabase.from("indexer_creators").upsert(row, {
        onConflict: "profile_id",
      });
    },

    async upsertContent(content: IndexedContent) {
      const supabase = getClient();
      const row = contentToRow(content);
      await supabase.from("indexer_content").upsert(row, {
        onConflict: "content_id",
      });
    },

    async addAccessPurchase(purchase: IndexedAccessPurchase) {
      const supabase = getClient();
      await supabase.from("indexer_access_purchases").insert({
        access_pass_id: purchase.accessPassId,
        creator_profile_id: purchase.creatorProfileId,
        supporter: purchase.supporter,
        amount: purchase.amount,
        tier_level: purchase.tierLevel,
        expires_at: purchase.expiresAt,
        timestamp: purchase.timestamp,
      });
      const { data: creator } = await supabase
        .from("indexer_creators")
        .select("total_supporters")
        .eq("profile_id", purchase.creatorProfileId)
        .single();
      if (creator) {
        await supabase
          .from("indexer_creators")
          .update({
            total_supporters: (creator.total_supporters ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("profile_id", purchase.creatorProfileId);
      }
    },

    async getCreator(profileId: string): Promise<IndexedCreator | undefined> {
      const supabase = getClient();
      const { data, error } = await supabase
        .from("indexer_creators")
        .select("*")
        .eq("profile_id", profileId)
        .single();
      if (error || !data) return undefined;
      return rowToCreator(data as CreatorRow);
    },

    async getCreators(
      limit: number,
      cursor?: string | null,
    ): Promise<{ creators: IndexedCreator[]; nextCursor: string | null }> {
      const supabase = getClient();
      let query = supabase
        .from("indexer_creators")
        .select("*")
        .order("created_at", { ascending: true })
        .order("profile_id", { ascending: true })
        .limit(limit + 1);

      if (cursor) {
        const { data: cur } = await supabase
          .from("indexer_creators")
          .select("created_at, profile_id")
          .eq("profile_id", cursor)
          .single();
        if (cur && cur.created_at != null) {
          const created_at = cur.created_at;
          const profile_id = cur.profile_id;
          query = supabase
            .from("indexer_creators")
            .select("*")
            .or(
              `created_at.gt.${created_at},and(created_at.eq.${created_at},profile_id.gt.${profile_id})`,
            )
            .order("created_at", { ascending: true })
            .order("profile_id", { ascending: true })
            .limit(limit + 1);
        }
      }

      const { data: rows } = await query;
      const list = (rows ?? []) as CreatorRow[];
      const creators = list.slice(0, limit).map(rowToCreator);
      const hasNext = list.length > limit;
      const nextCursor =
        hasNext && creators.length > 0
          ? creators[creators.length - 1].profileId
          : null;
      return { creators, nextCursor };
    },

    async getContentByProfile(profileId: string): Promise<IndexedContent[]> {
      const supabase = getClient();
      const { data } = await supabase
        .from("indexer_content")
        .select("*")
        .eq("creator_profile_id", profileId)
        .order("created_at", { ascending: true });
      return (data ?? []).map((r: ContentRow) => rowToContent(r));
    },

    async getSupporters(profileId: string): Promise<IndexedAccessPurchase[]> {
      const supabase = getClient();
      const { data } = await supabase
        .from("indexer_access_purchases")
        .select("*")
        .eq("creator_profile_id", profileId)
        .order("timestamp", { ascending: false });
      return (data ?? []).map((r: PurchaseRow) => rowToPurchase(r));
    },

    async getLastCursor(eventType: string): Promise<string | undefined> {
      const supabase = getClient();
      const { data } = await supabase
        .from("indexer_cursors")
        .select("cursor")
        .eq("event_type", eventType)
        .single();
      return (data as { cursor: string } | null)?.cursor;
    },

    async setLastCursor(eventType: string, cursor: string) {
      const supabase = getClient();
      await supabase.from("indexer_cursors").upsert(
        {
          event_type: eventType,
          cursor,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_type" },
      );
    },
  };
}
