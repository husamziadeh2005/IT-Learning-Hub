import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/session";

/**
 * Landing point for links in Supabase Auth emails (sign-up confirmation,
 * password recovery, email change). Supports both the PKCE `code` flow used
 * by the default templates and the `token_hash` flow used by custom ones.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  // Already signed in and holding a PKCE code: there's nothing to exchange.
  // Skipping avoids a failed exchange disturbing a valid session (for
  // example a stale or crafted link opened while logged in).
  if (code && !tokenHash) {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.sub) return NextResponse.redirect(new URL(next, origin));
  }

  let error: { message: string } | null = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    error = { message: "missing token" };
  }

  if (error) {
    const reason = next === "/reset-password" ? "reset-expired" : "link-expired";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
