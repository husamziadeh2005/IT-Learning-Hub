"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Supabase client for Client Components (one instance per tab). */
export function createClient() {
  if (!browserClient) {
    const { url, key } = requireSupabaseConfig();
    browserClient = createBrowserClient<Database>(url, key);
  }
  return browserClient;
}
