"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Loader2,
  RefreshCw,
  FolderKanban,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

type WorkItem = {
  taskId?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  progress?: number;
  project?: string;
  due?: string;
  createdAt?: string;
  assignedTo?: string;
};

type Project = {
  id?: string;
  name?: string;
  title?: string;
  status?: string;
  progress?: number;
  due?: string;
  createdAt?: string;
};

type Report = {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  submittedAt?: string;
  date?: string;
  project?: string;
  taskTitle?: string;
};

type Employee = {
  id: number;
  user_id: string;
  full_name: string;
  email?: string;
  Company?: string;
  company_id?: number;
  role?: string;
  work?: WorkItem[] | null;
  projects?: Project[] | null;
  reports?: Report[] | null;
};

type Admin = {
  id: number;
  company_name: string;
  full_name: string;
  work_email: string;
};

const card =
  "rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-xl";

const badge: Record<string, string> = {
  submitted: "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30",
  pending: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  blocked: "bg-red-500/15 text-red-400 ring-1 ring-red-400/30",
  approved: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  completed: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
};

function getStatusClass(status?: string) {
  return (
    badge[(status || "").toLowerCase()] ||
    "bg-white/10 text-zinc-300 ring-1 ring-white/10"
  );
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isToday(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatDuration(createdAt?: string) {
  if (!createdAt) return "";

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000)
  );

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes
    ? `${hours}h ${remainingMinutes}m ago`
    : `${hours}h ago`;
}

export default function AdminDashboard() {
  const supabase = createClient();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const storedAdminId = localStorage.getItem("company_id");

      if (!storedAdminId) {
        throw new Error(
          "Admin session not found. Please log in again."
        );
      }

      const parsedAdminId = Number(storedAdminId);

      if (!Number.isFinite(parsedAdminId)) {
        throw new Error("Invalid admin session. Please log in again.");
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("id, company_name, full_name, work_email")
        .eq("id", parsedAdminId)
        .single();

      if (adminError) throw adminError;

      setAdmin(adminData as Admin);

      const { data: employeeData, error: employeeError } = await supabase
        .from("users")
        .select(
          "id, user_id, full_name, email, Company, company_id, role, work, projects, reports"
        )
        .eq("company_id", adminData.id);

      if (employeeError) throw employeeError;

      setEmployees((employeeData || []) as Employee[]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const allWork = employees.flatMap((employee) =>
    asArray<WorkItem>(employee.work).map((item) => ({
      ...item,
      assignedTo: item.assignedTo || employee.user_id,
    }))
  );

  const allReports = employees.flatMap((employee) =>
    asArray<Report>(employee.reports).map((report) => ({
      ...report,
      employeeName: employee.full_name,
      employeeId: employee.user_id,
    }))
  );

  const allProjects = employees.flatMap((employee) =>
    asArray<Project>(employee.projects)
  );

  const uniqueProjects = Array.from(
    new Map(
      allProjects.map((project, index) => [
        project.id || project.name || project.title || `project-${index}`,
        project,
      ])
    ).values()
  );

  const reportsToday = allReports.filter((report) =>
    isToday(
      report.submittedAt || report.createdAt || report.date
    )
  );

  const submittedEmployeeIds = new Set(
    reportsToday.map((report) => report.employeeId)
  );

  const pendingReviews = allReports.filter((report) => {
    const status = (report.status || "").toLowerCase();

    return (
      status === "submitted" ||
      status === "pending review" ||
      status === "awaiting review"
    );
  });

  const blockedTasks = allWork.filter(
    (task) => (task.status || "").toLowerCase() === "blocked"
  );

  const missingReports = employees.filter(
    (employee) => !submittedEmployeeIds.has(employee.user_id)
  );

  const stats = [
    {
      label: "Total employees",
      value: employees.length.toString(),
      icon: Users,
      tone: "from-violet-500 to-violet-800",
    },
    {
      label: "Reports today",
      value: `${submittedEmployeeIds.size} / ${employees.length}`,
      icon: FileText,
      tone: "from-indigo-500 to-violet-700",
    },
    {
      label: "Pending reviews",
      value: pendingReviews.length.toString(),
      icon: CheckCircle2,
      tone: "from-fuchsia-500 to-purple-700",
    },
    {
      label: "Blocked tasks",
      value: blockedTasks.length.toString(),
      icon: AlertTriangle,
      tone: "from-rose-500 to-violet-800",
    },
  ];

  const displayedProjects = uniqueProjects;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-violet-400" />
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${card} mx-auto max-w-3xl p-6`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h2 className="font-semibold text-white">
              Could not load dashboard
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{error}</p>
            <button
              onClick={() => void loadDashboard()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition hover:shadow-[0_0_34px_rgba(139,92,246,0.7)]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      <div className="pointer-events-none absolute -top-24 left-1/4 -z-10 h-72 w-96 rounded-full bg-violet-700/20 blur-[120px]" />

      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs text-zinc-400">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {admin?.company_name
              ? ` · ${admin.company_name}`
              : ""}
          </p>

          <h1 className="mt-1 bg-gradient-to-r from-white via-violet-100 to-violet-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Admin overview
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Track reporting, projects and team activity.
          </p>

          {admin?.full_name && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Welcome, {admin.full_name}
            </p>
          )}
        </div>

        <button
          onClick={() => void loadDashboard()}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 backdrop-blur transition hover:border-violet-400/40 hover:bg-violet-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className={`${card} group relative min-w-0 overflow-hidden p-4 transition duration-300 hover:border-violet-400/40 sm:p-5`}
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-600/0 blur-3xl transition duration-500 group-hover:bg-violet-600/30" />

            <div className="relative flex items-start justify-between gap-2">
              <span className="text-xs leading-5 text-zinc-400 sm:text-sm">
                {label}
              </span>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <p className="relative mt-4 wrap-break-word text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Reports */}
        <section className={`${card} min-w-0 overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Reports awaiting review
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {pendingReviews.length} report
                {pendingReviews.length === 1 ? "" : "s"} to review
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              {pendingReviews.length} pending
            </span>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </span>
              <p className="mt-4 text-sm text-zinc-200">
                No reports awaiting review
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Submitted reports will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {pendingReviews.map((report, index) => {
                const status = report.status || "Submitted";
                const employeeName =
                  (report as Report & { employeeName?: string })
                    .employeeName || "Employee";

                const title =
                  report.title ||
                  report.taskTitle ||
                  report.description ||
                  "Work report";

                return (
                  <li
                    key={report.id || `${title}-${index}`}
                    className="group flex flex-col gap-3 px-4 py-4 transition hover:bg-violet-500/[0.06] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="wrap-break-word text-sm font-semibold text-white">
                        {title}
                      </p>
                      <p className="mt-1 wrap-break-word text-xs text-zinc-400">
                        {employeeName}
                        {report.project ? ` · ${report.project}` : ""}
                        {(report.submittedAt || report.createdAt) &&
                          ` · ${formatDuration(
                            report.submittedAt || report.createdAt
                          )}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(status)}`}
                      >
                        {status}
                      </span>

                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Project progress */}
          <section className={card}>
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-800 shadow-[0_0_18px_rgba(124,58,237,0.4)]">
                <FolderKanban className="h-4 w-4 text-white" />
              </span>
              <h2 className="text-sm font-semibold text-white">
                Project progress
              </h2>
            </div>

            {displayedProjects.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-zinc-500">
                No projects found.
              </p>
            ) : (
              <ul className="space-y-5 p-5">
                {displayedProjects.slice(0, 6).map((project, index) => {
                  const name =
                    project.name || project.title || "Untitled project";

                  const progress = Math.min(
                    100,
                    Math.max(0, Number(project.progress) || 0)
                  );

                  return (
                    <li key={project.id || `${name}-${index}`}>
                      <div className="mb-2 flex items-start justify-between gap-3 text-xs">
                        <span className="wrap-break-word text-zinc-200">
                          {name}
                        </span>
                        <span className="shrink-0 font-medium text-violet-300">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(139,92,246,0.7)] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {project.status && (
                        <p className="mt-2 text-xs text-zinc-500">
                          {project.status}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={card}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Not submitted today
              </h2>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 ring-1 ring-amber-400/30">
                {missingReports.length}
              </span>
            </div>

            {missingReports.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-400" />
                <p className="mt-2 text-sm text-zinc-400">
                  Everyone has submitted a report.
                </p>
              </div>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto p-5">
                {missingReports.map((employee) => {
                  const initials = (employee.full_name || "E")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <li
                      key={employee.user_id}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-xs font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.4)]">
                        {initials}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">
                          {employee.full_name || "Unnamed employee"}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {employee.role || "Employee"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-right text-xs text-zinc-600">
          Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
        </p>
      )}
    </div>
  );
}