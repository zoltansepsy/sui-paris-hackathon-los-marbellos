import { NextRequest, NextResponse } from "next/server";
import { getEnokiClient } from "@/app/lib/enoki-server";

/**
 * POST /api/sponsor/execute
 * Executes a sponsored transaction with the user's signature.
 * Body: { digest: string, signature: string (base64) }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { digest, signature } = body;

    if (!digest || typeof digest !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid digest" },
        { status: 400 },
      );
    }

    if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid signature (base64 string)" },
        { status: 400 },
      );
    }

    const enoki = getEnokiClient();

    const result = await enoki.executeSponsoredTransaction({
      digest,
      signature,
    });

    return NextResponse.json({
      digest: result.digest,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to execute sponsored transaction";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
