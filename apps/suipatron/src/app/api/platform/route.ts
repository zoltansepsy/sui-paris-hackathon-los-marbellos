import { NextResponse } from "next/server";
import { getPlatformConfig } from "@/app/lib/services/platform";

/**
 * GET /api/platform
 * Returns current platform fee configuration and stats from on-chain.
 */
export async function GET() {
  try {
    const config = await getPlatformConfig();
    return NextResponse.json(config);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
