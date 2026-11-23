import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-muted-foreground">Enter the email you signed up with and we&apos;ll send you a secure link to choose a new one.</p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remembered it? <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Back to sign in</Link>
      </p>
    </>
  );
}
