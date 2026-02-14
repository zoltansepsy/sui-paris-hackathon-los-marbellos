import { NextRequest, NextResponse } from "next/server";
import { getCreators } from "@/app/lib/services/creators";
import { parseCreatorsQuery } from "@/shared/validation/creator.schema";

/**
 * GET /api/creators
 * List indexed creators with cursor-based pagination.
 * Query: limit (default 20, max 100), cursor (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit, cursor } = parseCreatorsQuery(searchParams);

    const result = await getCreators(limit, cursor ?? undefined);

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
