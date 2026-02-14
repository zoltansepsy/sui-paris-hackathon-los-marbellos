/**
 * Returns the indexer store: Supabase if configured, otherwise in-memory.
 * Env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.
 */

import type { IndexerStore } from "./types";
import { indexerStore as memoryStore } from "./store";
import { createSupabaseStore } from "./store-supabase";

let supabaseStore: IndexerStore | null = null;

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

/**
 * Use Supabase store when SUPABASE_URL and key are set; otherwise in-memory (e.g. local dev).
 */
export function getIndexerStore(): IndexerStore {
  if (isSupabaseConfigured()) {
    if (!supabaseStore) {
      supabaseStore = createSupabaseStore();
    }
    return supabaseStore;
  }
  return memoryStore;
}
