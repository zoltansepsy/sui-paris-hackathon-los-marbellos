import { NextRequest, NextResponse } from "next/server";
import { getCreatorByHandle } from "@/app/lib/services/registry";
import { getContentByProfile } from "@/app/lib/services/content";
import { HandleNotFoundError } from "@/shared/errors/custom-errors";
import { CreatorNotFoundError } from "@/shared/errors/custom-errors";
import { handleSchema } from "@/shared/validation/registry.schema";

/**
 * GET /api/registry/:handle
 * Resolve a creator handle to their profile and content.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle: rawHandle } = await context.params;
    if (!rawHandle) {
      return NextResponse.json(
        { error: "Missing handle parameter" },
        { status: 400 },
      );
    }

    const parseResult = handleSchema.safeParse(rawHandle);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message ?? "Invalid handle" },
        { status: 400 },
      );
    }

    const { handle, creator } = await getCreatorByHandle(parseResult.data);
    const content = await getContentByProfile(creator.profileId);

    return NextResponse.json({ handle, creator, content });
  } catch (e) {
    if (e instanceof HandleNotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    if (e instanceof CreatorNotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
