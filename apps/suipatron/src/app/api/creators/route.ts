import { NextRequest, NextResponse } from "next/server";
import { getIndexerStore } from "@/app/lib/indexer/get-store";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * GET /api/creators
 * List indexed creators with cursor-based pagination.
 * Query: limit (default 20, max 100), cursor (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const store = getIndexerStore();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT),
    );
    const cursor = searchParams.get("cursor") ?? undefined;

    const { creators, nextCursor } = await store.getCreators(limit, cursor);

    return NextResponse.json({
      creators,
      nextCursor,
      hasNextPage: nextCursor != null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
