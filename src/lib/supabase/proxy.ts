import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/env";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Refresh the Supabase session on every matched request and apply cheap,
 * optimistic redirects. This is NOT the authorization boundary — every page,
 * Server Action and the database (RLS) re-check access themselves.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  if (!config) return response;

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // Validates the JWT and refreshes it when needed. Do not run code between
  // client creation and this call.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Carry refreshed auth cookies and cache headers onto the redirect.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = response.headers.get(header);
      if (value) redirect.headers.set(header, value);
    }
    return redirect;
  };

  if (!signedIn && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
  }
  if (signedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo("/dashboard");
  }
  return response;
}
