/**
 * Public Supabase configuration. Both values are safe to expose to the
 * browser: the publishable key only grants what Row Level Security allows.
 * The secret / service-role key is never read anywhere in this app.
 */
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function requireSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).",
    );
  }
  return config;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * The local Supabase stack (`supabase start`) never delivers real email: every
 * auth email is captured by Mailpit. When the app points at a local stack we
 * surface that inbox in the UI so confirmation links are not "lost".
 * Port 54324 is `[inbucket].port` in supabase/config.toml.
 */
export const devInboxUrl = (() => {
  if (process.env.NODE_ENV === "production") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return hostname === "127.0.0.1" || hostname === "localhost" ? `http://${hostname}:54324` : null;
  } catch {
    return null;
  }
})();
