"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLinkIcon, InboxIcon, MailCheckIcon } from "lucide-react";
import { FormField, FormMessage, PasswordField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { requestPasswordReset, resendConfirmation, signIn, signUp, updatePassword } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/validation/schemas";

/** Local development only: the Supabase stack captures auth emails in Mailpit instead of sending them. */
function DevInboxNotice({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="rounded-lg border border-dashed px-4 py-3 text-left text-xs leading-5 text-muted-foreground">
      <p className="flex items-center gap-1.5 font-medium text-foreground">
        <InboxIcon className="size-3.5" aria-hidden="true" /> Local development
      </p>
      <p className="mt-1">
        Emails from the local Supabase stack are not delivered to real inboxes. They are captured here:{" "}
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4">
          open test inbox <ExternalLinkIcon className="size-3" aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}

function ResendConfirmation({ email, devInboxUrl }: { email: string; devInboxUrl?: string }) {
  const [state, action] = useActionState(resendConfirmation, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="email" value={email} />
      <FormMessage state={state} />
      <SubmitButton variant="outline" className="w-full" pendingLabel="Sending…">Resend confirmation email</SubmitButton>
      <DevInboxNotice url={state?.devInboxUrl ?? devInboxUrl} />
    </form>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signIn, null);
  return (
    <div className="space-y-5">
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <FormMessage state={state} />
        <FormField label="Email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} errors={state?.fieldErrors?.email} />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          errors={state?.fieldErrors?.password}
          labelAction={<Link href="/forgot-password" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot password?</Link>}
        />
        <SubmitButton size="lg" className="w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
      </form>
      {state?.resendEmail && <ResendConfirmation key={state.resendEmail} email={state.resendEmail} devInboxUrl={state.devInboxUrl} />}
    </div>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(signUp, null);
  if (state?.ok) {
    return (
      <div className="surface p-6 text-center" role="status">
        <MailCheckIcon className="mx-auto size-8 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.message}</p>
        <p className="mt-4 text-xs text-muted-foreground">Didn&apos;t get it? Check your spam folder, or send it again.</p>
        {state.resendEmail && (
          <div className="mt-5">
            <ResendConfirmation email={state.resendEmail} devInboxUrl={state.devInboxUrl} />
          </div>
        )}
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <FormField label="Name" name="displayName" autoComplete="name" required defaultValue={state?.values?.displayName} errors={state?.fieldErrors?.displayName} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} errors={state?.fieldErrors?.email} />
      <PasswordField label="Password" name="password" autoComplete="new-password" required hint="At least 8 characters, with a letter and a number." errors={state?.fieldErrors?.password} />
      <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" required errors={state?.fieldErrors?.confirmPassword} />
      <div className="space-y-1">
        <label className="flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" name="terms" className="mt-1 size-4 accent-[var(--primary)]" aria-invalid={state?.fieldErrors?.terms ? true : undefined} />
          <span>
            I agree to the <Link href="/terms" className="font-medium underline underline-offset-4">Terms of use</Link> and{" "}
            <Link href="/privacy" className="font-medium underline underline-offset-4">Privacy policy</Link>.
          </span>
        </label>
        {state?.fieldErrors?.terms && <p className="text-xs font-medium text-destructive">{state.fieldErrors.terms[0]}</p>}
      </div>
      <SubmitButton size="lg" className="w-full" pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      {state?.ok && <DevInboxNotice url={state.devInboxUrl} />}
      {!state?.ok && (
        <>
          <FormField label="Email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} errors={state?.fieldErrors?.email} />
          <SubmitButton size="lg" className="w-full" pendingLabel="Sending…">Send reset link</SubmitButton>
        </>
      )}
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <PasswordField label="New password" name="password" autoComplete="new-password" required hint="At least 8 characters, with a letter and a number." errors={state?.fieldErrors?.password} />
      <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" required errors={state?.fieldErrors?.confirmPassword} />
      <SubmitButton size="lg" className="w-full" pendingLabel="Saving…">Update password</SubmitButton>
    </form>
  );
}
