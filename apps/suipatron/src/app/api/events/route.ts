import { NextRequest, NextResponse } from "next/server";
import { runIndexer } from "@/app/lib/indexer/run";

/**
 * GET /api/events
 * Internal endpoint: run the event indexer (poll SUI and update store).
 * Call via Vercel Cron (e.g. every minute) or manually for development.
 * Optionally protect with CRON_SECRET or restrict by IP in production.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runIndexer();

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
