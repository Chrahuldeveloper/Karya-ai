"use client";

import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

type Task = {
  taskId?: string;
  id?: string;
  title: string;
  description?: string;
  project?: string;
  priority?: string;
  due?: string;
  status?: string;
  progress?: number;
  assignedTo?: string;
  createdAt?: string;
};

type Project = {
  id?: string;
  name: string;
  status?: string;
  desc?: string;
  description?: string;
  progress?: number;
  lead?: string;
  due?: string;
  createdAt?: string;
};

type Report = {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  project?: string;
  createdAt?: string;
  date?: string;
  hours?: number | string;
  duration?: number | string;
};

type Employee = {
  full_name: string;
  Company: string;
  user_id: string;
  work: Task[] | null;
  projects: Project[] | null;
  reports: Report[] | null;
  notifications: unknown[] | null;
  stats: Record<string, unknown> | null;
};

const priorityStyle: Record<string, string> = {
  Low: "bg-slate-500/15 text-slate-300",
  Medium: "bg-indigo-500/20 text-indigo-300",
  High: "bg-amber-500/20 text-amber-400",
  Urgent: "bg-red-500/20 text-red-400",
};

const statusStyle: Record<string, string> = {
  Blocked: "bg-red-500/15 text-red-400",
  "In progress": "bg-indigo-500/20 text-indigo-300",
  "To do": "bg-white/10 text-gray-300",
  Todo: "bg-white/10 text-gray-300",
  Pending: "bg-amber-500/15 text-amber-400",
  Completed: "bg-emerald-500/15 text-emerald-400",
  Done: "bg-emerald-500/15 text-emerald-400",
  Active: "bg-emerald-500/15 text-emerald-400",
  Reviewed: "bg-emerald-500/15 text-emerald-400",
  Submitted: "bg-indigo-500/20 text-indigo-300",
  "Changes requested": "bg-amber-500/15 text-amber-400",
};

const card = "rounded-xl border border-white/10 bg-[#101116]";

function getStatusClass(status?: string) {
  if (!status) return "bg-white/10 text-gray-300";

  return (
    statusStyle[status] ??
    "bg-white/10 text-gray-300"
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "No due date";

  const dateOnly = dateString.match(/^\d{4}-\d{2}-\d{2}$/);

  const date = dateOnly
    ? new Date(`${dateString}T12:00:00`)
    : new Date(dateString);

  if (Number.isNaN(date.getTime())) return "No due date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatHours(value?: number | string) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const text = value.trim();

  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minutesMatch = text.match(/(\d+(?:\.\d+)?)\s*m/i);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

    return hours + minutes / 60;
  }

  const numericValue = Number(text);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function isCompleted(status?: string) {
  const normalized = status?.toLowerCase().trim();

  return normalized === "completed" || normalized === "done";
}

function isActiveProject(status?: string) {
  const normalized = status?.toLowerCase().trim();

  return (
    normalized === "active" ||
    normalized === "in progress" ||
    normalized === "in-progress"
  );
}

function getReportDate(report: Report) {
  return report.createdAt || report.date || "";
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export default function Home() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [weekEnd, setWeekEnd] = useState<Date | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const current = new Date();

      const start = new Date(current);
      const day = start.getDay();
      const difference = day === 0 ? 6 : day - 1;

      start.setDate(start.getDate() - difference);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      setNow(current);
      setWeekStart(start);
      setWeekEnd(end);
    };

    updateClock();

    const interval = window.setInterval(updateClock, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchEmployee() {
      setLoading(true);
      setError("");

      try {
        const userId = window.localStorage.getItem("user_id");

        if (!userId) {
          if (!cancelled) {
            setError("Employee ID was not found. Please log in again.");
            setLoading(false);
          }

          return;
        }

        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("users")
          .select(
            "user_id, full_name, Company, work, projects, reports, notifications, stats"
          )
          .eq("user_id", userId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!cancelled && data) {
          setEmployee({
            user_id: data.user_id,
            full_name: data.full_name ?? "Employee",
            Company: data.Company ?? "",
            work: Array.isArray(data.work) ? data.work : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            reports: Array.isArray(data.reports) ? data.reports : [],
            notifications: Array.isArray(data.notifications)
              ? data.notifications
              : [],
            stats: data.stats ?? null,
          });
        }
      } catch (err) {
        console.error("Failed to load employee dashboard:", err);

        if (!cancelled) {
          setError(
            "Unable to load your dashboard. Please try refreshing the page."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEmployee();

    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = employee?.full_name ?? "Employee";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hour = now?.getHours();

  const greeting =
    hour === undefined
      ? "Welcome"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";

  const dateText = now
    ? now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  const work = employee?.work ?? [];
  const projects = employee?.projects ?? [];
  const reports = employee?.reports ?? [];

  const completedTasks = work.filter((task) =>
    isCompleted(task.status)
  ).length;

  const activeProjects = projects.filter((project) =>
    isActiveProject(project.status)
  ).length;

  const reportsThisWeek =
    weekStart && weekEnd
      ? reports.filter((report) => {
          const dateString = getReportDate(report);

          if (!dateString) return false;

          const reportDate = new Date(dateString);

          if (!isValidDate(reportDate)) return false;

          return (
            reportDate.getTime() >= weekStart.getTime() &&
            reportDate.getTime() < weekEnd.getTime()
          );
        }).length
      : 0;

  const hoursThisWeek =
    weekStart && weekEnd
      ? reports.reduce((total, report) => {
          const dateString = getReportDate(report);

          if (!dateString) return total;

          const reportDate = new Date(dateString);

          if (!isValidDate(reportDate)) return total;

          const isThisWeek =
            reportDate.getTime() >= weekStart.getTime() &&
            reportDate.getTime() < weekEnd.getTime();

          if (!isThisWeek) return total;

          return (
            total +
            formatHours(report.hours ?? report.duration)
          );
        }, 0)
      : 0;

  const stats = [
    {
      label: "Reports this week",
      value: String(reportsThisWeek),
      icon: FileText,
      color: "text-indigo-400",
      background: "bg-indigo-500/10",
    },
    {
      label: "Tasks completed",
      value: String(completedTasks),
      icon: CheckCircle2,
      color: "text-emerald-400",
      background: "bg-emerald-500/10",
    },
    {
      label: "Active projects",
      value: String(activeProjects),
      icon: FolderKanban,
      color: "text-sky-400",
      background: "bg-sky-500/10",
    },
    {
      label: "Hours this week",
      value: `${Number(hoursThisWeek.toFixed(2))}h`,
      icon: Clock,
      color: "text-amber-400",
      background: "bg-amber-500/10",
    },
  ];

  const recentTasks = [...work].slice(0, 4);
  const recentProjects = [...projects].slice(0, 3);
  const recentReports = [...reports]
    .sort((a, b) => {
      const dateA = getReportDate(a);
      const dateB = getReportDate(b);

      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.localeCompare(dateA);
    })
    .slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-10 text-white">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-400">
            {dateText}
            {employee?.Company ? ` · ${employee.Company}` : ""}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}
            {employee ? `, ${fullName}` : ""}
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Here&apos;s what&apos;s happening with your work.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/employee/notifications"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#101116] transition hover:bg-white/5"
          >
            <Bell className="h-4 w-4" />
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-bold text-indigo-300">
            {initials || "E"}
          </div>
        </div>
      </header>

      {loading && (
        <div className={`${card} flex items-center gap-3 p-6`}>
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
          <p className="text-sm text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-semibold text-white underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`${card} p-5 transition hover:border-white/20`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {stat.label}
                    </p>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.background}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/employee/submit-report"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <FileText className="h-4 w-4" />
              Submit Today&apos;s Report
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>

            <Link
              href="/employee/reports"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101116] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              <FileText className="h-4 w-4 text-indigo-400" />
              View My Reports
              <ArrowRight className="ml-auto h-4 w-4 text-gray-500" />
            </Link>

            <Link
              href="/employee/projects"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101116] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5 sm:col-span-2 lg:col-span-1"
            >
              <FolderKanban className="h-4 w-4 text-indigo-400" />
              View My Projects
              <ArrowRight className="ml-auto h-4 w-4 text-gray-500" />
            </Link>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  My Work
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Tasks assigned to you
                </p>
              </div>

              <Link
                href="/employee/work"
                className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-gray-600" />

                <p className="mt-3 text-sm font-medium text-gray-300">
                  No tasks assigned yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your assigned tasks will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {recentTasks.map((task, index) => {
                  const progress = Math.max(
                    0,
                    Math.min(100, Number(task.progress) || 0)
                  );

                  return (
                    <li
                      key={
                        task.taskId ??
                        task.id ??
                        `${task.title}-${index}`
                      }
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-white/2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="wrap-break-word text-sm font-semibold text-white">
                          {task.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {task.project || "No project assigned"}
                        </p>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-indigo-400 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <span className="text-[11px] text-gray-500">
                            {progress}% complete
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {task.priority && (
                          <span
                            className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                              priorityStyle[task.priority] ??
                              "bg-white/10 text-gray-300"
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}

                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-medium ${getStatusClass(task.status)}`}
                        >
                          {task.status || "To do"}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(task.due)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Projects */}
          <section className={card}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  My Projects
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Projects you&apos;re involved in
                </p>
              </div>

              <Link
                href="/employee/projects"
                className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FolderKanban className="mx-auto h-8 w-8 text-gray-600" />

                <p className="mt-3 text-sm font-medium text-gray-300">
                  No projects assigned yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Projects assigned to you will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {recentProjects.map((project, index) => {
                  const progress = Math.max(
                    0,
                    Math.min(100, Number(project.progress) || 0)
                  );

                  return (
                    <article
                      key={project.id ?? `${project.name}-${index}`}
                      className="rounded-xl border border-white/10 hover:bg-white/2 p-4 transition hover:border-indigo-500/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                          <FolderKanban className="h-5 w-5 text-indigo-400" />
                        </div>

                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-medium ${getStatusClass(project.status)}`}
                        >
                          {project.status || "Not started"}
                        </span>
                      </div>

                      <h3 className="mt-4 wrap-break-word text-sm font-semibold">
                        {project.name}
                      </h3>

                      {(project.desc || project.description) && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
                          {project.desc || project.description}
                        </p>
                      )}

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            Progress
                          </span>

                          <span className="font-medium text-white">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-indigo-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-gray-400">
                        <span className="min-w-0 truncate">
                          {project.lead
                            ? `Lead: ${project.lead}`
                            : "No lead assigned"}
                        </span>

                        <span className="flex shrink-0 items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(project.due)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={card}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Recent Reports
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Your latest submitted work reports
                </p>
              </div>

              <Link
                href="/employee/reports"
                className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-600" />

                <p className="mt-3 text-sm font-medium text-gray-300">
                  No reports submitted yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your submitted reports will appear here.
                </p>

                <Link
                  href="/employee/submit-report"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
                >
                  Submit a report
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {recentReports.map((report, index) => (
                  <li
                    key={report.id ?? `${report.title}-${index}`}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                        <FileText className="h-4 w-4 text-indigo-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="wrap-break-word text-sm font-semibold text-white">
                          {report.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {report.project || "No project"}
                          {" · "}
                          {formatDate(getReportDate(report))}
                        </p>

                        {report.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {report.description}
                          </p>
                        )}

                        {(report.hours !== undefined ||
                          report.duration !== undefined) && (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatHours(
                              report.hours ?? report.duration
                            ).toFixed(1)}
                            {" hours"}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${getStatusClass(report.status)}`}
                    >
                      {report.status || "Submitted"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}