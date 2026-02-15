import { NextRequest, NextResponse } from "next/server";
import {
  getEnokiClient,
  getAllowedMoveCallTargets,
  getNetwork,
} from "@/app/lib/enoki-server";

/**
 * POST /api/sponsor
 * Accepts transaction kind bytes and sender, sponsors via Enoki, returns sponsored tx bytes and digest.
 * Body: { transactionKindBytes: string (base64), sender: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionKindBytes, sender } = body;

    if (!transactionKindBytes || typeof transactionKindBytes !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid transactionKindBytes (base64 string)" },
        { status: 400 },
      );
    }

    if (!sender || typeof sender !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid sender address" },
        { status: 400 },
      );
    }

    const allowedMoveCallTargets = getAllowedMoveCallTargets();
    if (allowedMoveCallTargets.length === 0) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_PACKAGE_ID (or PACKAGE_ID) not configured. Deploy contracts first.",
        },
        { status: 500 },
      );
    }

    const enoki = getEnokiClient();
    const network = getNetwork();

    const result = await enoki.createSponsoredTransaction({
      network,
      transactionKindBytes,
      sender,
      allowedMoveCallTargets,
    });

    return NextResponse.json({
      sponsoredTxBytes: result.bytes,
      digest: result.digest,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sponsor transaction";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
