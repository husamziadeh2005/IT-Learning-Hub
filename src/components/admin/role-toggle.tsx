"use client";

import { ShieldCheckIcon, ShieldIcon } from "lucide-react";
import { ActionButton } from "./admin-ui";
import { setUserRole } from "@/lib/actions/admin";

export function RoleToggle({ userId, role, active, disabled }: { userId: string; role: "admin" | "editor"; active: boolean; disabled?: boolean }) {
  const label = role === "admin" ? "Admin" : "Editor";
  if (disabled) {
    return <span className="inline-flex h-9 items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium" title="You can't change your own admin role"><ShieldCheckIcon className="size-4" aria-hidden="true" /> {label}</span>;
  }
  return (
    <ActionButton
      action={() => setUserRole(userId, role, !active)}
      variant={active ? "secondary" : "outline"}
      ariaLabel={active ? `Remove ${label} role` : `Grant ${label} role`}
      confirm={role === "admin" && !active ? { title: "Grant administrator access?", description: "Administrators can delete content and manage every user's roles.", confirmLabel: "Grant admin" } : undefined}
    >
      {active ? <ShieldCheckIcon /> : <ShieldIcon />} {active ? label : `Make ${label.toLowerCase()}`}
    </ActionButton>
  );
}
