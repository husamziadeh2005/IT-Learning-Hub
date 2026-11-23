import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Cookie-bound Supabase client for Server Components, Server Actions and
 * Route Handlers. Reads the signed-in user's session, so queries run with
 * their RLS permissions. Reading cookies makes the caller request-time.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = requireSupabaseConfig();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the proxy refreshes sessions on every request.
        }
      },
    },
  });
}
