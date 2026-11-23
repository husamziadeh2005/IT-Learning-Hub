import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeading } from "@/components/dashboard/shared";
import { AvatarUploader, ChangePasswordForm, ProfileForm } from "@/components/dashboard/profile-forms";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/learner/queries";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const user = await requireUser("/dashboard/profile");
  const profile = await getProfile(user.id);
  return (
    <div className="max-w-2xl space-y-10">
      <DashboardHeading title="Profile" description="How you appear on the platform, and your account settings." />

      <section className="surface space-y-6 p-5 sm:p-6" aria-labelledby="public-heading">
        <h2 id="public-heading" className="font-semibold">Profile details</h2>
        <AvatarUploader userId={user.id} name={profile.displayName} avatarUrl={profile.avatarUrl} />
        <ProfileForm defaults={{ displayName: profile.displayName, headline: profile.headline, bio: profile.bio }} />
      </section>

      <section className="surface space-y-5 p-5 sm:p-6" aria-labelledby="account-heading">
        <h2 id="account-heading" className="font-semibold">Account</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Email</dt><dd className="mt-0.5 font-medium">{user.email}</dd></div>
          {profile.createdAt && (
            <div><dt className="text-muted-foreground">Member since</dt><dd className="mt-0.5 font-medium">{new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</dd></div>
          )}
          {user.roles.length > 0 && <div><dt className="text-muted-foreground">Roles</dt><dd className="mt-0.5 font-medium capitalize">{user.roles.join(", ")}</dd></div>}
        </dl>
        <ChangePasswordForm />
      </section>

      <form action={signOut}>
        <Button type="submit" variant="outline"><LogOutIcon /> Sign out</Button>
      </form>
    </div>
  );
}
