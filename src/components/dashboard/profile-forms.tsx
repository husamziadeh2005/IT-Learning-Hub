"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CameraIcon, Loader2Icon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormField, FormMessage, PasswordField, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { initials } from "@/components/site/user-nav";
import { useLearner } from "@/components/learner/learner-provider";
import { saveAvatarPath, updateProfile } from "@/lib/actions/learner";
import { updatePassword } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

export function AvatarUploader({ userId, name, avatarUrl }: { userId: string; name: string; avatarUrl: string | null }) {
  const [url, setUrl] = useState(avatarUrl);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { refresh } = useLearner();

  const upload = async (file: File) => {
    if (!TYPES.includes(file.type)) return void toast.error("Use a PNG, JPEG or WebP image.");
    if (file.size > MAX_BYTES) return void toast.error("Images must be 2 MB or smaller.");
    setBusy(true);
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, cacheControl: "3600" });
    if (error) {
      setBusy(false);
      return void toast.error("Upload failed. Please try again.");
    }
    const result = await saveAvatarPath(path);
    setBusy(false);
    if (!result.ok) {
      await supabase.storage.from("avatars").remove([path]);
      return void toast.error(result.error);
    }
    setUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    toast.success("Profile photo updated");
    await refresh();
    router.refresh();
  };

  const remove = async () => {
    setBusy(true);
    const result = await saveAvatarPath(null);
    setBusy(false);
    if (!result.ok) return void toast.error(result.error);
    setUrl(null);
    toast.success("Profile photo removed");
    await refresh();
  };

  return (
    <div className="flex items-center gap-5">
      <Avatar className="size-20">
        {url && <AvatarImage src={url} alt="" />}
        <AvatarFallback className="bg-signal-soft text-xl font-semibold">{initials(name || "?")}</AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap gap-2">
        <input ref={input} type="file" accept={TYPES.join(",")} className="sr-only" id="avatar-input" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button variant="outline" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2Icon className="animate-spin" /> : <CameraIcon />} {url ? "Change photo" : "Upload photo"}
        </Button>
        {url && <Button variant="ghost" onClick={remove} disabled={busy}><TrashIcon /> Remove</Button>}
        <p className="w-full text-xs text-muted-foreground">PNG, JPEG or WebP, up to 2 MB.</p>
      </div>
    </div>
  );
}

export function ProfileForm({ defaults }: { defaults: { displayName: string; headline: string; bio: string } }) {
  const [state, action] = useActionState(updateProfile, null);
  const { refresh } = useLearner();
  // Keep the header's display name in sync after a successful save.
  useEffect(() => {
    if (state?.ok) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <FormField label="Display name" name="displayName" defaultValue={defaults.displayName} required maxLength={80} errors={state?.fieldErrors?.displayName} />
      <FormField label="Headline" name="headline" defaultValue={defaults.headline} maxLength={120} placeholder="e.g. Aspiring cloud engineer" errors={state?.fieldErrors?.headline} />
      <TextareaField label="Bio" name="bio" defaultValue={defaults.bio} maxLength={600} rows={4} hint="Up to 600 characters." errors={state?.fieldErrors?.bio} />
      <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <PasswordField label="New password" name="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." errors={state?.fieldErrors?.password} />
      <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" errors={state?.fieldErrors?.confirmPassword} />
      <SubmitButton variant="outline" pendingLabel="Updating…">Change password</SubmitButton>
    </form>
  );
}
