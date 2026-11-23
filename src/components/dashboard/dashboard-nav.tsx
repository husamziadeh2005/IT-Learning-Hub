"use client";

import { BookmarkIcon, GaugeIcon, HistoryIcon, LayoutDashboardIcon, RouteIcon, UserIcon } from "lucide-react";
import { SideNav } from "@/components/shared/side-nav";

const ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/roadmaps", label: "My roadmaps", icon: RouteIcon },
  { href: "/dashboard/saved", label: "Saved", icon: BookmarkIcon },
  { href: "/dashboard/progress", label: "Progress", icon: GaugeIcon },
  { href: "/dashboard/history", label: "History", icon: HistoryIcon },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
];

export function DashboardNav() {
  return <SideNav items={ITEMS} label="Dashboard" />;
}
