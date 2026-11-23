import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/env";
import type { AppRole } from "@/lib/catalog/labels";

export interface SessionUser {
  id: string;
  email: string | null;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
}

/**
 * Data Access Layer: the single place that turns the request's cookies into
 * a verified user. `getClaims()` validates the JWT signature, unlike
 * `getSession()`, so the result is safe to authorize with. Roles come from
 * the `user_roles` table (never from user-editable metadata).
 *
 * Wrapped in React `cache` so it runs once per request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!getSupabaseConfig()) return null;
  // Session checks compare token expiry with the current time, so they must
  // run per request — never during a prerender or prefetch.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", claims.sub);
  const roles = (roleRows ?? []).map((r) => r.role);
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    roles,
    isStaff: roles.includes("admin") || roles.includes("editor"),
    isAdmin: roles.includes("admin"),
  };
});

export async function requireUser(next = "/dashboard") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireStaff() {
  const user = await requireUser("/admin");
  if (!user.isStaff) redirect("/dashboard?denied=admin");
  return user;
}

export async function requireAdmin() {
  const user = await requireStaff();
  if (!user.isAdmin) redirect("/admin?denied=admin-only");
  return user;
}

/** Only allow same-site relative redirects (prevents open redirects). */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = "/dashboard") {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
