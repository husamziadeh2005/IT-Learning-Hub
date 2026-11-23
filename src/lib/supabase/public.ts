import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Anonymous, cookie-free client for reading the public catalog. Because it
 * never touches the request, it can be used inside `"use cache"` functions
 * and the results shared between all visitors. RLS limits it to published
 * content.
 */
export function createPublicClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
