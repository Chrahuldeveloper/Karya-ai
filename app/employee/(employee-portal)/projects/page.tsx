"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ListChecks,
  User,
  Users,
  BriefcaseBusiness,
  LoaderCircle,
  FolderKanban,
  Clock3,
  CircleCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/supabase/client";

type Project = {
  id: string;
  name: string;
  status: string;
  desc: string;
  progress: number;
  lead: string;
  leadId?: string;
  due: string;
  employeeIds: string[];
  createdAt: string;
};

type EmployeeRecord = {
  user_id: string;
  projects: Project[] | null;
};

function formatDate(dateString?: string) {
  if (!dateString) return "No due date";

  const date = new Date(`${dateString.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyles(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "completed":
      return "border-sky-500/20 bg-sky-500/10 text-sky-400";
    case "on hold":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    default:
      return "border-white/10 bg-white/5 text-gray-300";
  }
}

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const userId = localStorage.getItem("user_id");

      if (!userId || userId === "undefined" || userId === "null") {
        setError("Your session could not be found. Please log in again.");
        return;
      }

      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("user_id, projects")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const record = data as EmployeeRecord | null;
      const employeeProjects = Array.isArray(record?.projects)
        ? record.projects
        : [];

      setProjects(employeeProjects);
    } catch (err) {
      console.error("Failed to fetch employee projects:", err);
      setError("We couldn't load your projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const activeCount = projects.filter(
    (project) => project.status?.toLowerCase() === "active"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status?.toLowerCase() === "completed"
  ).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-1 pb-8 sm:px-2">
      {/* Page header */}
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-indigo-400">
            <BriefcaseBusiness className="h-4 w-4" />
            Your workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Projects
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            All the projects you're working on, together in one place.
          </p>
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-[#101116] px-3 py-2 text-xs text-gray-400 sm:self-auto">
            <FolderKanban className="h-4 w-4 text-indigo-400" />
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        )}
      </header>

      {/* Summary cards */}
      {!loading && !error && (
        <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#101116] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400 sm:text-sm">Total projects</p>
              <FolderKanban className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {projects.length}
            </p>
            <p className="mt-1 text-xs text-gray-500">Assigned to you</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101116] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400 sm:text-sm">In progress</p>
              <Clock3 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">Active projects</p>
          </div>

          <div className="col-span-2 rounded-2xl border border-white/10 bg-[#101116] p-4 sm:col-span-1 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400 sm:text-sm">Completed</p>
              <CircleCheck className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {completedCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">Finished projects</p>
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#101116] px-4 py-12 text-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-indigo-400" />
          <p className="mt-4 text-sm font-medium text-white">
            Loading your projects
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Getting your latest assignments...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div className="flex-1">
              <h2 className="font-semibold text-white">
                Unable to load projects
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">{error}</p>
              <button
                onClick={() => void fetchProjects()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#101116] px-5 py-14 text-center sm:py-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/3">
            <FolderKanban className="h-7 w-7 text-gray-400" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            No projects assigned yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
            Projects assigned to you by your administrator will appear here.
          </p>
        </div>
      )}

      {/* Project cards */}
      {!loading && !error && projects.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white sm:text-base">
              Your assignments
            </h2>
            <span className="text-xs text-gray-500">
              {projects.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const progress = Math.min(
                100,
                Math.max(0, Number(project.progress) || 0)
              );

              return (
                <article
                  key={project.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101116] transition duration-200 hover:border-indigo-400/30 hover:bg-[#12131a]"
                >
                  {/* Accent bar */}
                  <div
                    className={`h-1 w-full ${
                      project.status?.toLowerCase() === "completed"
                        ? "bg-sky-400"
                        : project.status?.toLowerCase() === "on hold"
                          ? "bg-amber-400"
                          : "bg-indigo-400"
                    }`}
                  />

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    {/* Title and status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10">
                          <BriefcaseBusiness className="h-5 w-5 text-indigo-300" />
                        </div>

                        <div className="min-w-0 pt-0.5">
                          <h3 className="wrap-break-word font-semibold leading-5 text-white">
                            {project.name || "Untitled project"}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {project.createdAt
                              ? `Created ${formatDate(project.createdAt)}`
                              : "Project assignment"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold sm:text-xs ${getStatusStyles(
                          project.status
                        )}`}
                      >
                        {project.status || "Unknown"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-4 min-h-12 wrap-break-word text-sm leading-6 text-gray-400">
                      {project.desc || "No description has been added yet."}
                    </p>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Project progress
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {progress}%
                        </span>
                      </div>

                      <div
                        className="h-1.5 overflow-hidden rounded-full bg-white/10"
                        role="progressbar"
                        aria-label={`${project.name} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.status?.toLowerCase() === "completed"
                              ? "bg-sky-400"
                              : "bg-indigo-400"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Project details */}
                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/[0.07] pt-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-500">
                            Project lead
                          </p>
                          <p className="truncate text-sm text-gray-200">
                            {project.lead || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-500">Due date</p>
                          <p className="text-sm text-gray-200">
                            {formatDate(project.due)}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-500">Team size</p>
                          <p className="text-sm text-gray-200">
                            {project.employeeIds?.length ?? 0}{" "}
                            {(project.employeeIds?.length ?? 0) === 1
                              ? "member"
                              : "members"}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4">
                          <ListChecks className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-500">Tasks</p>
                          <p className="text-sm text-gray-200">
                            Task details will appear here when available.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}