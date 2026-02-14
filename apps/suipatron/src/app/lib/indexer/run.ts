/**
 * SuiPatron event indexer: polls SUI chain for ProfileCreated, ProfileUpdated,
 * ContentPublished, AccessPurchased, EarningsWithdrawn and upserts into the store.
 * Uses getObject to fill bio/title/description not present in events.
 */

import { SuiClient } from "@mysten/sui/client";
import { getIndexerStore } from "./get-store";
import type {
  IndexedCreator,
  IndexedContent,
  IndexedAccessPurchase,
} from "./types";

const EVENT_TYPES = [
  "ProfileCreated",
  "ProfileUpdated",
  "ContentPublished",
  "AccessPurchased",
  "EarningsWithdrawn",
] as const;

function getPackageId(): string {
  const id =
    process.env.NEXT_PUBLIC_PACKAGE_ID ??
    process.env.VITE_PACKAGE_ID ??
    process.env.PACKAGE_ID;
  if (!id)
    throw new Error(
      "PACKAGE_ID or NEXT_PUBLIC_PACKAGE_ID or VITE_PACKAGE_ID required for indexer",
    );
  return id;
}

function getRpcUrl(): string {
  const network =
    process.env.NEXT_PUBLIC_SUI_NETWORK ??
    process.env.VITE_SUI_NETWORK ??
    "testnet";
  if (network === "mainnet") return "https://fullnode.mainnet.sui.io";
  if (network === "devnet") return "https://fullnode.devnet.sui.io";
  return "https://fullnode.testnet.sui.io";
}

function pick<T extends Record<string, unknown>>(obj: T, key: string): unknown {
  return obj[key] ?? obj[key.replace(/([A-Z])/g, "_$1").toLowerCase()];
}

function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (v != null && typeof v === "object" && "toString" in (v as object))
    return String((v as { toString(): string }).toString());
  return String(v ?? "");
}

function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

/** Extract optional string from Move Option<T> (vec array) or raw value */
function optStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v || undefined;
  if (Array.isArray(v)) return v[0] != null ? str(v[0]) : undefined;
  if (typeof v === "object" && v !== null && "vec" in v) {
    const arr = (v as { vec: unknown[] }).vec;
    return arr?.[0] != null ? str(arr[0]) : undefined;
  }
  return str(v) || undefined;
}

export async function runIndexer(): Promise<{
  processed: number;
  errors: string[];
}> {
  const packageId = getPackageId();
  const client = new SuiClient({ url: getRpcUrl() });
  const store = getIndexerStore();
  const fullType = (name: string) => `${packageId}::suipatron::${name}`;
  let processed = 0;
  const errors: string[] = [];

  for (const eventType of EVENT_TYPES) {
    const cursorRaw = await store.getLastCursor(eventType);
    let cursor: { txDigest: string; eventSeq: string } | undefined;
    if (cursorRaw) {
      const parsed = JSON.parse(cursorRaw) as {
        txDigest: string;
        eventSeq: number | string;
      };
      cursor = {
        txDigest: parsed.txDigest,
        eventSeq: String(parsed.eventSeq ?? ""),
      };
    } else {
      cursor = undefined;
    }
    try {
      const page = await client.queryEvents({
        query: { MoveEventType: fullType(eventType) },
        limit: 50,
        order: "ascending",
        cursor: cursor ?? undefined,
      });

      for (const event of page.data) {
        const id =
          event.id?.txDigest && event.id?.eventSeq != null
            ? `${event.id.txDigest}:${event.id.eventSeq}`
            : `${Date.now()}:${processed}`;
        const parsed = (event.parsedJson ?? {}) as Record<string, unknown>;

        try {
          if (eventType === "ProfileCreated") {
            const profileId = str(pick(parsed, "profile_id"));
            if (!profileId) continue;
            const obj = await client.getObject({
              id: profileId,
              options: { showContent: true },
            });
            const content = obj.data?.content;
            if (content && typeof content === "object" && "fields" in content) {
              const f = (content as { fields: Record<string, unknown> }).fields;
              const creator: IndexedCreator = {
                profileId,
                owner: str(f.owner ?? pick(parsed, "owner")),
                name: str(f.name ?? pick(parsed, "name")),
                bio: str(f.bio ?? ""),
                avatarBlobId: optStr(f.avatar_blob_id),
                suinsName: optStr(f.suins_name),
                price: num(f.price ?? pick(parsed, "price")),
                contentCount: num(f.content_count ?? 0),
                totalSupporters: num(f.total_supporters ?? 0),
                createdAt: num(pick(parsed, "timestamp")),
              };
              await store.upsertCreator(creator);
            } else {
              await store.upsertCreator({
                profileId,
                owner: str(pick(parsed, "owner")),
                name: str(pick(parsed, "name")),
                bio: "",
                price: num(pick(parsed, "price")),
                contentCount: 0,
                totalSupporters: 0,
                createdAt: num(pick(parsed, "timestamp")),
              });
            }
            processed++;
          } else if (eventType === "ProfileUpdated") {
            const profileId = str(pick(parsed, "profile_id"));
            if (!profileId) continue;
            const obj = await client.getObject({
              id: profileId,
              options: { showContent: true },
            });
            const content = obj.data?.content;
            if (content && typeof content === "object" && "fields" in content) {
              const f = (content as { fields: Record<string, unknown> }).fields;
              const existing = await store.getCreator(profileId);
              const creator: IndexedCreator = {
                profileId,
                owner: str(f.owner),
                name: str(f.name ?? pick(parsed, "name")),
                bio: str(f.bio ?? ""),
                avatarBlobId: optStr(f.avatar_blob_id),
                suinsName: optStr(f.suins_name),
                price: num(f.price),
                contentCount: num(
                  f.content_count ?? existing?.contentCount ?? 0,
                ),
                totalSupporters: num(
                  f.total_supporters ?? existing?.totalSupporters ?? 0,
                ),
                createdAt:
                  existing?.createdAt ?? num(pick(parsed, "timestamp")),
              };
              await store.upsertCreator(creator);
            }
            processed++;
          } else if (eventType === "ContentPublished") {
            const contentId = str(pick(parsed, "content_id"));
            const profileId = str(pick(parsed, "profile_id"));
            if (!contentId || !profileId) continue;
            const obj = await client.getObject({
              id: contentId,
              options: { showContent: true },
            });
            const contentObj = obj.data?.content;
            if (
              contentObj &&
              typeof contentObj === "object" &&
              "fields" in contentObj
            ) {
              const f = (contentObj as { fields: Record<string, unknown> })
                .fields;
              const content: IndexedContent = {
                contentId,
                creatorProfileId: profileId,
                title: str(f.title),
                description: str(f.description),
                blobId: str(f.blob_id ?? pick(parsed, "blob_id")),
                contentType: str(
                  f.content_type ?? pick(parsed, "content_type"),
                ),
                createdAt: num(f.created_at ?? pick(parsed, "timestamp")),
              };
              await store.upsertContent(content);
              const creator = await store.getCreator(profileId);
              if (creator) {
                const contentList = await store.getContentByProfile(profileId);
                creator.contentCount = contentList.length;
                await store.upsertCreator(creator);
              }
            } else {
              await store.upsertContent({
                contentId,
                creatorProfileId: profileId,
                title: "",
                description: "",
                blobId: str(pick(parsed, "blob_id")),
                contentType: str(pick(parsed, "content_type")),
                createdAt: num(pick(parsed, "timestamp")),
              });
            }
            processed++;
          } else if (eventType === "AccessPurchased") {
            const purchase: IndexedAccessPurchase = {
              accessPassId: str(pick(parsed, "access_pass_id")),
              creatorProfileId: str(pick(parsed, "profile_id")),
              supporter: str(pick(parsed, "supporter")),
              amount: num(pick(parsed, "amount")),
              timestamp: num(pick(parsed, "timestamp")),
            };
            await store.addAccessPurchase(purchase);
            processed++;
          }
          // EarningsWithdrawn: we could refresh creator balance via getObject; skip for now to avoid extra RPC
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`${eventType} ${id}: ${msg}`);
        }
      }

      const nextCursor =
        page.nextCursor ??
        (page.data.length > 0 ? page.data[page.data.length - 1]?.id : null);
      if (
        nextCursor &&
        typeof nextCursor === "object" &&
        "txDigest" in nextCursor
      ) {
        await store.setLastCursor(eventType, JSON.stringify(nextCursor));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`query ${eventType}: ${msg}`);
    }
  }

  return { processed, errors };
}
