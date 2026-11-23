import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Create your free account</h1>
      <p className="mt-2 text-muted-foreground">Save resources, follow roadmaps and track your progress.</p>
      <div className="mt-8">
        <SignUpForm />
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Sign in</Link>
      </p>
    </>
  );
}
