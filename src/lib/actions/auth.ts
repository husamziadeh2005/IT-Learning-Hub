"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { devInboxUrl, siteUrl } from "@/lib/env";
import { safeNext } from "@/lib/auth/session";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  zodFieldErrors,
  type AuthFormState,
  type FormState,
} from "@/lib/validation/schemas";

/** Map Supabase Auth errors to messages that are safe and useful to show. */
function authMessage(error: { message: string; code?: string; status?: number }) {
  const code = error.code ?? "";
  if (code === "invalid_credentials") return "That email and password combination is not correct.";
  if (code === "email_not_confirmed") return "Please confirm your email address first — check your inbox for the link.";
  if (code === "user_already_exists" || code === "email_exists") return "An account with this email already exists. Try signing in instead.";
  if (code === "weak_password") return "That password is too weak. Use at least 8 characters with letters and numbers.";
  if (code === "over_email_send_rate_limit" || error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (code === "same_password") return "Your new password must be different from the current one.";
  return "Something went wrong. Please try again.";
}

const confirmRedirect = `${siteUrl}/auth/confirm?next=/dashboard`;
const inbox = devInboxUrl ? { devInboxUrl } : {};

export async function signIn(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  const values = { email: String(form.get("email") ?? "") };
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error?.code === "email_not_confirmed") {
    return { ok: false, message: authMessage(error), values, resendEmail: parsed.data.email, ...inbox };
  }
  if (error) return { ok: false, message: authMessage(error), values };
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const raw = {
    displayName: form.get("displayName"),
    email: form.get("email"),
    password: form.get("password"),
    confirmPassword: form.get("confirmPassword"),
    terms: form.get("terms") ?? undefined,
  };
  const values = { displayName: String(raw.displayName ?? ""), email: String(raw.email ?? "") };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: confirmRedirect,
    },
  });
  if (error) return { ok: false, message: authMessage(error), values };

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return {
      ok: true,
      message: `We sent a confirmation link to ${parsed.data.email}. Open it to activate your account.`,
      resendEmail: parsed.data.email,
      ...inbox,
    };
  }
  redirect("/dashboard?welcome=1");
}

export async function resendConfirmation(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: confirmRedirect },
  });
  // Like password reset, only rate limits are surfaced so this endpoint
  // cannot be used to discover which emails are registered.
  if (error && (error.status === 429 || error.code === "over_email_send_rate_limit")) {
    return { ok: false, message: authMessage(error), resendEmail: parsed.data.email, ...inbox };
  }
  return {
    ok: true,
    message: `A new confirmation link is on its way to ${parsed.data.email}.`,
    resendEmail: parsed.data.email,
    ...inbox,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
  const values = { email: String(form.get("email") ?? "") };
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });
  // Rate-limit errors are worth surfacing; anything else is reported the same
  // way as success so the form cannot be used to discover registered emails.
  if (error && (error.status === 429 || error.code === "over_email_send_rate_limit")) {
    return { ok: false, message: authMessage(error), values };
  }
  return {
    ok: true,
    message: `If an account exists for ${parsed.data.email}, a password reset link is on its way. It expires in one hour.`,
    ...inbox,
  };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({ password: form.get("password"), confirmPassword: form.get("confirmPassword") });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, message: "Your reset link has expired. Request a new one to continue." };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: authMessage(error) };
  redirect("/dashboard?password=updated");
}
