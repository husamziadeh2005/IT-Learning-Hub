import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/forms/auth-forms";
import { safeNext } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERRORS: Record<string, string> = {
  "link-expired": "That confirmation link is invalid or has expired. Sign in below and we'll offer to send you a new one.",
  "reset-expired": "That password reset link is invalid or has expired. Request a new one below.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Sign in to continue where you left off.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted" />}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here? <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">Create a free account</Link>
      </p>
    </>
  );
}

async function LoginForm({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  return (
    <>
      {error && <p role="alert" className="mb-5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</p>}
      <SignInForm next={safeNext(typeof params.next === "string" ? params.next : undefined)} />
    </>
  );
}
