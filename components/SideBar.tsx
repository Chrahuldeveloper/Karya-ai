"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListChecks,
  FilePlus2,
  FileText,
  FolderKanban,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Work", href: "/employee/work", icon: ListChecks },
  { label: "Submit Report", href: "/employee/submit-report", icon: FilePlus2 },
  { label: "My Reports", href: "/employee/reports", icon: FileText },
  { label: "My Projects", href: "/employee/projects", icon: FolderKanban },
  { label: "Notifications", href: "/employee/notifications", icon: Bell },
  { label: "My Profile", href: "/employee/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

type SidebarProps = {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
};

export default function Sidebar({
  userName = "Aisha Verma",
  userRole = "Product Designer",
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0e0f13]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
          N
        </div>
        <span className="text-lg font-bold tracking-widest text-white">NIVO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4.5  w-4.5 ${active ? "text-indigo-400" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
          <p className="truncate text-xs text-gray-400">{userRole}</p>
        </div>
        <button
          onClick={onLogout}
          aria-label="Log out"
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}