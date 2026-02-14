import { NextRequest, NextResponse } from "next/server";
import { getIndexerStore } from "@/app/lib/indexer/get-store";

/**
 * GET /api/creator/:id
 * Single creator profile and their content list.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const store = getIndexerStore();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing creator id" },
        { status: 400 },
      );
    }

    const creator = await store.getCreator(id);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const content = await store.getContentByProfile(id);

    return NextResponse.json({
      creator,
      content,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
