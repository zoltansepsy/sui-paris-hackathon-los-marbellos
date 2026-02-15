import { NextRequest, NextResponse } from "next/server";
import { getTipsByProfile } from "@/app/lib/services/tips";
import { CreatorNotFoundError } from "@/shared/errors/custom-errors";

/**
 * GET /api/creator/:id/tips
 * Returns all tips received by a creator.
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

    const tips = await getTipsByProfile(id);

    return NextResponse.json({ tips });
  } catch (e) {
    if (e instanceof CreatorNotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
