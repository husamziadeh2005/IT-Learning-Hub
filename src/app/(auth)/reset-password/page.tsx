import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/auth-forms";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
      <Suspense fallback={<div className="mt-8 h-56 animate-pulse rounded-xl bg-muted" />}>
        <ResetContent />
      </Suspense>
    </>
  );
}

async function ResetContent() {
  // The recovery link signs the user in via /auth/confirm before landing here.
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="mt-6 space-y-4">
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          This page only works from the link in your password reset email, and that link may have expired.
        </p>
        <Link href="/forgot-password" className="text-sm font-medium underline underline-offset-4">Request a new reset link</Link>
      </div>
    );
  }
  return (
    <>
      <p className="mt-2 text-muted-foreground">Signed in as {user.email}. Pick a password you don&apos;t use anywhere else.</p>
      <div className="mt-8"><ResetPasswordForm /></div>
    </>
  );
}
