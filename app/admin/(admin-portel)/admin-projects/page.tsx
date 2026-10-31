"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ListChecks,
  Plus,
  User,
  Users,
  X,
  BriefcaseBusiness,
  LoaderCircle,
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

type Employee = {
  user_id: string;
  full_name: string;
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    status: "Active",
    desc: "",
    progress: 0,
    lead: "",
    due: "",
    employeeIds: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminId = localStorage.getItem("company_id");
        const companyId = localStorage.getItem("company_id");

        if (
          !adminId ||
          !companyId ||
          adminId === "undefined" ||
          companyId === "undefined" ||
          !/^\d+$/.test(adminId)
        ) {
          console.error("Invalid session IDs:", { adminId, companyId });
          return;
        }

        const supabase = createClient();

        const [{ data: admin, error: projectsError }, { data: employeeData, error: employeeError }] =
          await Promise.all([
            supabase
              .from("admin")
              .select("projects")
              .eq("id", adminId)
              .single(),
            supabase
              .from("users")
              .select("user_id, full_name")
              .eq("company_id", companyId),
          ]);

        if (projectsError) {
          console.error("Failed to fetch projects:", projectsError.message);
        } else {
          setProjects(
            Array.isArray(admin?.projects) ? (admin.projects as Project[]) : []
          );
        }

        if (employeeError) {
          console.error("Failed to fetch employees:", employeeError.message);
        } else {
          setEmployees(employeeData ?? []);
        }
      } catch (error) {
        console.error("Failed to load project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const adminId = localStorage.getItem("admin_id");
    const companyId = localStorage.getItem("company_id");

    if (!adminId || !companyId || saving) return;

    if (!form.employeeIds.length) {
      alert("Please assign at least one employee to this project.");
      return;
    }

    if (!form.lead || !form.employeeIds.includes(form.lead)) {
      alert("Please select a project lead from the assigned employees.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { data: admin, error: fetchError } = await supabase
        .from("admin")
        .select("projects")
        .eq("id", adminId)
        .single();

      if (fetchError) throw fetchError;

      const existingProjects: Project[] = Array.isArray(admin?.projects)
        ? (admin.projects as Project[])
        : [];

      const leadEmployee = employees.find(
        (employee) => employee.user_id === form.lead
      );

      const newProject: Project = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        status: form.status,
        desc: form.desc.trim(),
        progress: 0,
        lead: leadEmployee?.full_name ?? "",
        leadId: form.lead,
        due: form.due,
        employeeIds: [...new Set(form.employeeIds)],
        createdAt: new Date().toISOString(),
      };

      // 1. Save the project in the admin's projects column.
      const updatedAdminProjects = [...existingProjects, newProject];

      const { error: adminUpdateError } = await supabase
        .from("admin")
        .update({ projects: updatedAdminProjects })
        .eq("id", adminId);

      if (adminUpdateError) throw adminUpdateError;

      // 2. Add the project to each selected employee's users.projects column.
      // Fetch the current projects first so existing employee projects aren't lost.
      const { data: selectedEmployees, error: employeeFetchError } =
        await supabase
          .from("users")
          .select("user_id, projects")
          .eq("company_id", companyId)
          .in("user_id", newProject.employeeIds);

      if (employeeFetchError) {
        throw new Error(
          `Project was saved for the admin, but employee records could not be fetched: ${employeeFetchError.message}`
        );
      }

      const employeeUpdates = await Promise.all(
        (selectedEmployees ?? []).map(async (employee) => {
          const currentProjects = Array.isArray(employee.projects)
            ? (employee.projects as Project[])
            : [];

          // Prevent duplicate insertion if this project is already present.
          if (currentProjects.some((project) => project.id === newProject.id)) {
            return null;
          }

          const updatedEmployeeProjects = [...currentProjects, newProject];

          const { error } = await supabase
            .from("users")
            .update({ projects: updatedEmployeeProjects })
            .eq("user_id", employee.user_id)
            .eq("company_id", companyId);

          if (error) {
            throw new Error(
              `Failed to assign the project to employee ${employee.user_id}: ${error.message}`
            );
          }

          return employee.user_id;
        })
      );

      // Update the UI after the database writes succeed.
      setProjects(updatedAdminProjects);
      setShowCreate(false);

      setForm({
        name: "",
        status: "Active",
        desc: "",
        progress: 0,
        lead: "",
        due: "",
        employeeIds: [],
      });

      const assignedCount = employeeUpdates.filter(Boolean).length;

      alert(
        `Project created successfully and assigned to ${assignedCount} employee(s).`
      );
    } catch (error) {
      console.error("Failed to create project:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save the project. Check the console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleEmployee = (employeeId: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      employeeIds: checked
        ? [...new Set([...current.employeeIds, employeeId])]
        : current.employeeIds.filter((id) => id !== employeeId),
    }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-1 sm:px-2">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-indigo-400">
            <BriefcaseBusiness className="h-4 w-4" />
            Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Projects
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage projects and assign employees across your organization.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-400 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create project
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#101116] p-4">
          <p className="text-xs text-gray-400">Total projects</p>
          <p className="mt-2 text-2xl font-bold text-white">{projects.length}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101116] p-4">
          <p className="text-xs text-gray-400">Active projects</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {projects.filter((project) => project.status === "Active").length}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-white/10 bg-[#101116] p-4 sm:col-span-1">
          <p className="text-xs text-gray-400">Employees</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {employees.length}
          </p>
        </div>
      </div>

      {/* Project list */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101116] p-6 text-sm text-gray-400">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#101116] px-5 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
            <BriefcaseBusiness className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="mt-4 font-semibold text-white">No projects yet</h2>
          <p className="mt-1 text-sm text-gray-400">
            Create your first project and assign employees to get started.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-5 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#101116] p-4 transition hover:border-indigo-400/30 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="wrap-break-word font-semibold text-white">
                    {project.name}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Created{" "}
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "recently"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    project.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : project.status === "Completed"
                        ? "bg-sky-500/10 text-sky-400"
                        : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-4 min-h-10 wrap-break-word text-sm leading-6 text-gray-400">
                {project.desc || "No project description provided."}
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium text-white">
                    {project.progress}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, project.progress || 0))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 text-xs text-gray-400 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="truncate">
                    {project.lead || "No project lead"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>
                    {project.due || "No due date"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>
                    {project.employeeIds?.length ?? 0} members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Tasks can be added later</span>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-3 text-xs font-medium text-gray-400">
                  Assigned employees
                </p>

                <div className="flex flex-wrap gap-2">
                  {(project.employeeIds ?? []).length === 0 ? (
                    <span className="text-xs text-gray-500">
                      No employees assigned
                    </span>
                  ) : (
                    project.employeeIds.map((id) => {
                      const employee = employees.find(
                        (item) => item.user_id === id
                      );

                      return (
                        <span
                          key={id}
                          className="max-w-full truncate rounded-lg border border-white/5 bg-white/4 px-2.5 py-1.5 text-xs text-gray-300"
                        >
                          {employee?.full_name ?? id}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create project modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowCreate(false);
            }
          }}
        >
          <form
            onSubmit={createProject}
            className="max-h-[92dvh] w-full max-w-xl space-y-5 overflow-y-auto rounded-t-2xl border border-white/10 bg-[#15161c] p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Create project
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Add project details and choose your team.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Project name <span className="text-rose-400">*</span>
              </label>
              <input
                required
                maxLength={120}
                placeholder="e.g. Customer Dashboard"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-[#101116] p-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Description
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="What is this project about?"
                value={form.desc}
                onChange={(event) =>
                  setForm({ ...form, desc: event.target.value })
                }
                className="w-full resize-y rounded-xl border border-white/10 bg-[#101116] p-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Project lead <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={form.lead}
                onChange={(event) =>
                  setForm({
                    ...form,
                    lead: event.target.value,
                    employeeIds: event.target.value
                      ? [...new Set([...form.employeeIds, event.target.value])]
                      : form.employeeIds,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-[#101116] p-3 text-sm text-white outline-none focus:border-indigo-400/60"
              >
                <option value="">Select project lead</option>
                {employees.map((employee) => (
                  <option key={employee.user_id} value={employee.user_id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                The project lead will automatically be included in the team.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="text-sm text-gray-300">
                  Assign employees{" "}
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-xs text-indigo-300">
                  {form.employeeIds.length} selected
                </span>
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-[#101116] p-2">
                {employees.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">
                    No employees found in this company.
                  </p>
                ) : (
                  employees.map((employee) => (
                    <label
                      key={employee.user_id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition bg-white/4"
                    >
                      <input
                        type="checkbox"
                        checked={form.employeeIds.includes(employee.user_id)}
                        onChange={(event) =>
                          toggleEmployee(
                            employee.user_id,
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 shrink-0 accent-indigo-500"
                      />

                      <span className="min-w-0 flex-1 truncate text-sm text-gray-200">
                        {employee.full_name}
                      </span>

                      {form.lead === employee.user_id && (
                        <span className="rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300">
                          Lead
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#101116] p-3 text-sm text-white outline-none focus:border-indigo-400/60"
                >
                  <option>Active</option>
                  <option>On hold</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Due date
                </label>
                <input
                  type="date"
                  value={form.due}
                  onChange={(event) =>
                    setForm({ ...form, due: event.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#101116] p-3 text-sm text-white outline-none focus:border-indigo-400/60"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50 sm:py-2.5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || employees.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
              >
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {saving ? "Saving project..." : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}