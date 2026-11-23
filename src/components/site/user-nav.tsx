"use client";

import Link from "next/link";
import { BookmarkIcon, GaugeIcon, LayoutDashboardIcon, LogOutIcon, RouteIcon, ShieldIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearner } from "@/components/learner/learner-provider";
import { signOut } from "@/lib/actions/auth";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
}

export function UserNav() {
  const { status, user } = useLearner();

  if (status === "loading") return <Skeleton className="h-10 w-[8.5rem] rounded-lg" aria-label="Loading account" />;

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:pr-3" aria-label={`Account menu for ${user.displayName}`}>
          <Avatar className="size-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-signal-soft text-xs font-semibold text-foreground">{initials(user.displayName)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm sm:inline">{user.displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium">{user.displayName}</span>
          {user.email && <span className="block truncate text-xs text-muted-foreground">{user.email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard"><LayoutDashboardIcon /> Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/roadmaps"><RouteIcon /> My roadmaps</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/saved"><BookmarkIcon /> Saved resources</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/progress"><GaugeIcon /> Progress</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile"><UserIcon /> Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {user.isStaff && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin"><ShieldIcon /> Admin</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full"><LogOutIcon /> Sign out</button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
