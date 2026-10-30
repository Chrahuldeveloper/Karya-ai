"use client";

import { useEffect, useState } from "react";
import { Calendar, ListChecks, Plus, User, Users } from "lucide-react";
import { createClient } from "@/supabase/client";

type Project = {
  id: string;
  name: string;
  status: string;
  desc: string;
  progress: number;
  lead: string;
  due: string;
  employeeIds: string[];
  createdAt: string;
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<
    { user_id: string; full_name: string }[]
  >([]);
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

    const adminId = localStorage.getItem("company_id");

    const companyId = localStorage.getItem("company_id");

    if (
      !adminId ||
      adminId === "undefined" ||
      !companyId ||
      companyId === "undefined" ||
      !/^\d+$/.test(adminId) ||
      !/^\d+$/.test(companyId)
    ) {
      console.error("Invalid session IDs:", { adminId, companyId });
      setLoading(false);
      return;
    }

  const supabase = createClient();

  const { data: admin, error: projectsError } = await supabase
    .from("admin")
    .select("projects")
    .eq("id", adminId)
    .single();

  if (projectsError) {
    console.error("Failed to fetch projects:", projectsError.message);
  } else {
    setProjects(Array.isArray(admin?.projects) ? admin.projects : []);
  }

  const { data: employeeData, error: employeeError } = await supabase
    .from("users")
    .select("user_id, full_name")
    .eq("company_id", companyId);

  if (employeeError) {
    console.error("Failed to fetch employees:", employeeError.message);
  } else {
    setEmployees(employeeData ?? []);
  }

  setLoading(false);
};
    fetchData();
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const adminId = sessionStorage.getItem("admin_id");
    if (!adminId) return;

    setSaving(true);

    try {
      const supabase = createClient();

      const { data: admin, error: fetchError } = await supabase
        .from("admin")
        .select("projects")
        .eq("id", adminId)
        .single();

      if (fetchError) throw fetchError;

      const existing: Project[] = Array.isArray(admin?.projects)
        ? admin.projects
        : [];

      const employee = employees.find((item) => item.user_id === form.lead);

      const newProject: Project = {
        id: crypto.randomUUID(),
        ...form,
        lead: employee?.full_name ?? form.lead,
        createdAt: new Date().toISOString(),
      };

      const updatedProjects = [...existing, newProject];

      const { error: updateError } = await supabase
        .from("admin")
        .update({ projects: updatedProjects })
        .eq("id", adminId);

      if (updateError) throw updateError;

      setProjects(updatedProjects);
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
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to save project. Check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-400">
            All projects across your organization.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          <Plus className="h-4 w-4" /> Create project
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-gray-400">No projects yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border border-white/10 bg-[#101116] p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-white">{p.name}</h2>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                  {p.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-400">{p.desc}</p>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{p.progress}%</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> {p.lead || "No lead"}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> {p.due || "No due date"}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />{" "}
                  {p.employeeIds?.length ?? 0} members
                </span>
                <span className="flex items-center gap-2">
                  <ListChecks className="h-3.5 w-3.5" /> Tasks
                </span>
              </div>

              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="mb-2 text-xs text-gray-400">Assigned employees</p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.employeeIds ?? []).map((id) => {
                    const employee = employees.find((e) => e.user_id === id);
                    return (
                      <span
                        key={id}
                        className="rounded-md bg-white/5 px-2 py-1 text-xs text-gray-300"
                      >
                       {employee?.full_name ?? id}
                      </span>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={createProject}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-white/10 bg-[#15161c] p-6"
          >
            <h2 className="text-lg font-semibold text-white">Create project</h2>

            <input
              required
              placeholder="Project name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#101116] p-3 text-sm text-white"
            />

            <textarea
              placeholder="Project description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#101116] p-3 text-sm text-white"
            />

            <select
              required
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#101116] p-3 text-sm text-white"
            >
              <option value="">Select project lead</option>
              {employees.map((employee) => (
                <option key={employee.user_id} value={employee.user_id}>
                {employee.full_name}
                </option>
              ))}
            </select>

            <div>
              <p className="mb-2 text-sm text-gray-400">Employees working on it</p>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {employees.map((employee) => (
                  <label
                    key={employee.user_id}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={form.employeeIds.includes(employee.user_id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          employeeIds: e.target.checked
                            ? [...form.employeeIds, employee.user_id]
                            : form.employeeIds.filter(
                                (id) => id !== employee.user_id
                              ),
                        })
                      }
                    />
                    {employee.full_name}{" "}
                    <span className="text-xs text-gray-500">
                      ({employee.user_id})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#101116] p-3 text-sm text-white"
            >
              <option>Active</option>
              <option>On hold</option>
              <option>Completed</option>
            </select>

            <input
              type="date"
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#101116] p-3 text-sm text-white"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}