"use client";

import { BlocksIcon, FolderTreeIcon, GaugeIcon, LibraryBigIcon, RouteIcon, UsersIcon } from "lucide-react";
import { SideNav } from "@/components/shared/side-nav";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: GaugeIcon, exact: true },
  { href: "/admin/resources", label: "Resources", icon: LibraryBigIcon },
  { href: "/admin/departments", label: "Departments", icon: FolderTreeIcon },
  { href: "/admin/technologies", label: "Technologies", icon: BlocksIcon },
  { href: "/admin/roadmaps", label: "Roadmaps", icon: RouteIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
];

export function AdminNav() {
  return <SideNav items={ITEMS} label="Admin" />;
}
