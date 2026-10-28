"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderKanban, LayoutDashboard, ListChecks, LogOut, Settings, Sparkles,Users } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/admin/admin-employee", icon: Users },
  { label: "Reports", href: "/admin/admin-reports", icon: FileText },
  { label: "Projects", href: "/admin/admin-projects", icon: FolderKanban },
  { label: "AI Assistant", href: "/admin/admin-chat", icon: Sparkles },
  { label: "Tasks", href: "/admin/admin-tasks", icon: ListChecks },
  { label: "Settings", href: "/admin/admin-settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0e0f13]">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">N</div>
        <span className="text-lg font-bold tracking-widest text-white">NIVO</span>
        <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${active ? "text-indigo-400" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">RM</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Rahul Mehta</p>
          <p className="truncate text-xs text-gray-400">Administrator</p>
        </div>
        <button aria-label="Log out" className="rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}