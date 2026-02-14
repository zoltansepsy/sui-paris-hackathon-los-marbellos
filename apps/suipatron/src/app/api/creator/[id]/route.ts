import { NextRequest, NextResponse } from "next/server";
import { getCreator } from "@/app/lib/services/creators";
import { getContentByProfile } from "@/app/lib/services/content";
import { CreatorNotFoundError } from "@/shared/errors/custom-errors";

/**
 * GET /api/creator/:id
 * Single creator profile and their content list.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing creator id" },
        { status: 400 },
      );
    }

    const [creator, content] = await Promise.all([
      getCreator(id),
      getContentByProfile(id),
    ]);

    return NextResponse.json({
      creator,
      content,
    });
  } catch (e) {
    if (e instanceof CreatorNotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
