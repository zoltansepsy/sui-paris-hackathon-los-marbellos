/**
 * Creator Service — on-chain read operations for creator profiles and content.
 *
 * Uses SuiJsonRpcClient to query objects, events, and dynamic fields.
 * Event-based discovery is the MVP approach (no indexer needed).
 *
 * Reference: local-context/app/services/jobService.ts (getJob, query patterns)
 */

import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import type {
  CreatorProfile,
  Content,
  CreatorCap,
  ProfileCreatedEvent,
} from "../types/onchain";
import {
  parseCreatorProfile,
  parseCreatorCap,
  parseContent,
} from "../types/onchain";

export class CreatorService {
  constructor(
    private suiClient: SuiJsonRpcClient,
    private packageId: string,
  ) {}

  /**
   * Fetch a single CreatorProfile by object ID.
   */
  async getCreatorProfile(profileId: string): Promise<CreatorProfile | null> {
    const response = await this.suiClient.getObject({
      id: profileId,
      options: { showContent: true },
    });
    if (!response.data) return null;
    return parseCreatorProfile(response.data);
  }

  /**
   * Get all creator profiles by querying ProfileCreated events.
   *
   * Steps:
   * 1. Query ProfileCreated events (most recent first)
   * 2. Extract profile_id from each event
   * 3. Batch-fetch all profile objects
   * 4. Parse and return
   *
   * This is the MVP approach — works without an indexer.
   */
  async getCreatorProfiles(limit: number = 50): Promise<CreatorProfile[]> {
    const events = await this.suiClient.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::suipatron::ProfileCreated`,
      },
      order: "descending",
      limit,
    });

    const profileIds = events.data.map((e) => {
      const parsed = e.parsedJson as ProfileCreatedEvent;
      return parsed.profile_id;
    });

    if (profileIds.length === 0) return [];

    const objects = await this.suiClient.multiGetObjects({
      ids: profileIds,
      options: { showContent: true },
    });

    return objects
      .map((obj) => (obj.data ? parseCreatorProfile(obj.data) : null))
      .filter((p): p is CreatorProfile => p !== null);
  }

  /**
   * Get content list for a creator by reading dynamic object fields.
   *
   * Content is stored as DOFs on CreatorProfile, keyed by u64 index.
   * We use getDynamicFields to enumerate, then getDynamicFieldObject
   * to fetch each Content item.
   */
  async getContentList(profileId: string): Promise<Content[]> {
    const fields = await this.suiClient.getDynamicFields({
      parentId: profileId,
    });

    const contents: Content[] = [];
    for (const field of fields.data) {
      const contentObj = await this.suiClient.getDynamicFieldObject({
        parentId: profileId,
        name: field.name,
      });
      if (contentObj.data) {
        const index =
          typeof field.name.value === "string"
            ? parseInt(field.name.value)
            : (field.name.value as number);
        const content = parseContent(contentObj.data, index);
        if (content) contents.push(content);
      }
    }

    return contents.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Find creator profile owned by a specific address.
   *
   * Queries ProfileCreated events to find the matching owner,
   * then fetches the full profile. MVP: one profile per user.
   */
  async getCreatorByOwner(
    ownerAddress: string,
  ): Promise<CreatorProfile | null> {
    const events = await this.suiClient.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::suipatron::ProfileCreated`,
      },
      order: "descending",
      limit: 100,
    });

    const match = events.data.find((e) => {
      const parsed = e.parsedJson as ProfileCreatedEvent;
      return parsed.owner === ownerAddress;
    });

    if (!match) return null;
    const parsed = match.parsedJson as ProfileCreatedEvent;
    return this.getCreatorProfile(parsed.profile_id);
  }

  /**
   * Get the CreatorCap owned by an address.
   *
   * Uses getOwnedObjects filtered by CreatorCap type.
   * Returns the first match (MVP: one cap per user).
   */
  async getCreatorCapByOwner(ownerAddress: string): Promise<CreatorCap | null> {
    const capType = `${this.packageId}::suipatron::CreatorCap`;
    const response = await this.suiClient.getOwnedObjects({
      owner: ownerAddress,
      filter: { StructType: capType },
      options: { showContent: true },
    });

    const first = response.data[0];
    if (!first?.data) return null;
    return parseCreatorCap(first.data);
  }
}

export function createCreatorService(
  suiClient: SuiJsonRpcClient,
  packageId: string,
): CreatorService {
  return new CreatorService(suiClient, packageId);
}
