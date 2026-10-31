"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  Sparkles,
  Users,
  ChevronUp,
  UserRound,
  Building2,
  Menu,
  X,
} from "lucide-react";

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
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState("Administrator");
  const [companyName, setCompanyName] = useState("Karaya Ai Workspace");

  const profileRef = useRef<HTMLDivElement>(null);

  // Load the administrator using company_id from localStorage.
  useEffect(() => {
    let cancelled = false;

    async function loadAdmin() {
      const companyId = localStorage.getItem("company_id");

      if (!companyId) return;

      try {
        const { createClient } = await import("@/supabase/client");
        const supabase = createClient();

        const { data, error } = await supabase
          .from("admin")
          .select("full_name, company_name")
          .eq("id", companyId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("Failed to load admin profile:", error.message);
          return;
        }

        if (data) {
          setUserName(data.full_name || "Administrator");
          setCompanyName(data.company_name || "Karaya Ai Workspace");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load admin profile:", error);
        }
      }
    }

    loadAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close the mobile sidebar and profile dropdown after navigation.
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Lock background scrolling and support Escape while mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  // Close the profile dropdown when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "A";

  function handleLogout() {
    localStorage.removeItem("company_id");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("user_id");

    setMobileOpen(false);
    setProfileOpen(false);

    router.push("/login");
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0e0f13] text-white shadow-lg transition-colors hover:bg-white/10 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        aria-hidden={undefined}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] shrink-0 flex-col border-r border-white/[0.07] bg-[#0e0f13] shadow-2xl shadow-black/30 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            N
          </div>

          <span className="text-lg font-bold tracking-[0.2em] text-white">
            Karaya Ai
          </span>

          <span className="rounded-md border border-indigo-400/20 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
            Admin
          </span>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          <p className="mb-3 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Workspace
          </p>

          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  setMobileOpen(false);
                  setProfileOpen(false);
                }}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-indigo-500/10 text-white"
                    : "text-gray-400 hover:bg-white/4 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-0.75 rounded-r-full bg-indigo-400" />
                )}

                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                    active
                      ? "text-indigo-400"
                      : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />

                <span className="flex-1">{label}</span>

                {label === "AI Assistant" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div
          ref={profileRef}
          className="relative mt-auto border-t border-white/[0.07] p-3"
        >
          <div
            className={`absolute bottom-[calc(100%+8px)] left-3 right-3 z-60 origin-bottom transition-all duration-200 ease-out ${
              profileOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible translate-y-2 scale-[0.98] opacity-0"
            }`}
            aria-hidden={!profileOpen}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#17181f] p-2 shadow-2xl shadow-black/40">
              {/* User details */}
              <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-semibold text-indigo-300 ring-1 ring-indigo-400/20">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {companyName}
                  </p>
                </div>
              </div>

              <div className="my-2 h-px bg-white/[0.07]" />

              <Link
                href="/admin/admin-settings"
                tabIndex={profileOpen ? 0 : -1}
                onClick={() => {
                  setProfileOpen(false);
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <UserRound className="h-4 w-4 text-gray-400" />
                My Profile
              </Link>

              <Link
                href="/admin/admin-settings"
                tabIndex={profileOpen ? 0 : -1}
                onClick={() => {
                  setProfileOpen(false);
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Settings
              </Link>

              <div className="my-2 h-px bg-white/[0.07]" />

              <button
                type="button"
                tabIndex={profileOpen ? 0 : -1}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>

          {/* Profile toggle */}
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors duration-200 ${
              profileOpen
                ? "bg-white/6"
                : "hover:bg-white/4"
            }`}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/30 to-violet-500/20 text-sm font-semibold text-indigo-200 ring-1 ring-white/8">
              {initials}

              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0e0f13] bg-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 shrink-0 text-gray-500" />
                <p className="truncate text-xs text-gray-400">
                  {companyName}
                </p>
              </div>
            </div>

            <ChevronUp
              className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}