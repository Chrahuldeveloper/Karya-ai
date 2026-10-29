"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, Plus, Search, X } from "lucide-react";
import { createClient } from "@/supabase/client";

type Project = {
  name: string;
  status?: string;
  employeeIds?: string[];
};

type Employee = {
  user_id: string;
  full_name: string;
  email?: string;
  work: Task[];
};

type Task = {
  taskId: string;
  title: string;
  description?: string;
  project: string;
  assignedTo: string;
  priority: string;
  due: string;
  status: string;
  progress: number;
  createdAt: string;
};

type TaskRow = Task & {
  employeeId: string;
  employeeName: string;
};

const priorityStyles: Record<string, string> = {
  Low: "bg-white/10 text-gray-300",
  Medium: "bg-indigo-500/20 text-indigo-300",
  High: "bg-amber-500/20 text-amber-400",
  Urgent: "bg-red-500/20 text-red-400",
};

const statusStyles: Record<string, string> = {
  Blocked: "bg-red-500/20 text-red-400",
  "In progress": "bg-indigo-500/20 text-indigo-300",
  "To do": "bg-white/10 text-gray-300",
  Completed: "bg-emerald-500/20 text-emerald-400",
};

const box =
  "flex h-10 items-center rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#101116] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500";

const emptyTaskForm = {
  title: "",
  description: "",
  employeeId: "",
  project: "",
  priority: "Medium",
  due: "",
};

export default function AdminTasks() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const [form, setForm] = useState(emptyTaskForm);

  const supabase = useMemo(() => createClient(), []);

  const loadData = async () => {
    setLoading(true);

    try {
      const adminId = sessionStorage.getItem("admin_id");
      const companyId = sessionStorage.getItem("company_id");

      if (
        !adminId ||
        !companyId ||
        !/^\d+$/.test(adminId) ||
        !/^\d+$/.test(companyId)
      ) {
        setErrorMessage(
          "Invalid session IDs. Please sign in again."
        );
        return;
      }

      const { data: userData, error: usersError } = await supabase
        .from("users")
        .select("user_id, full_name, email, work")
        .eq("company_id", companyId);

      if (usersError) throw usersError;

      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("projects")
        .eq("id", adminId)
        .single();

      if (adminError) throw adminError;

      const loadedProjects: Project[] = Array.isArray(
        adminData?.projects
      )
        ? adminData.projects
        : [];

      const loadedEmployees: Employee[] = (userData ?? []).map(
        (user) => {
          let work: Task[] = [];

          if (Array.isArray(user.work)) {
            work = user.work as Task[];
          } else if (typeof user.work === "string") {
            try {
              const parsed = JSON.parse(user.work);
              if (Array.isArray(parsed)) work = parsed;
            } catch {
              work = [];
            }
          }

          return {
            user_id: String(user.user_id),
            full_name: user.full_name ?? "Unnamed employee",
            email: user.email ?? "",
            work,
          };
        }
      );

      setEmployees(loadedEmployees);
      setProjects(loadedProjects);

      const allTasks: TaskRow[] = [];

      loadedEmployees.forEach((employee) => {
        employee.work.forEach((task, index) => {
          if (!task || typeof task !== "object" || !task.title) return;

          allTasks.push({
            ...task,
            taskId:
              task.taskId ??
              `${employee.user_id}-${index}`,
            project: task.project ?? "",
            assignedTo: task.assignedTo ?? employee.user_id,
            priority: task.priority ?? "Medium",
            due: task.due ?? "",
            status: task.status ?? "To do",
            progress: Number(task.progress ?? 0),
            createdAt: task.createdAt ?? "",
            employeeId: employee.user_id,
            employeeName: employee.full_name,
          });
        });
      });

      allTasks.sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );

      setTasks(allTasks);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setErrorMessage("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [modalOpen]);

  const availableProjects = useMemo(() => {
    if (!form.employeeId) return projects;

    return projects.filter(
      (project) =>
        !Array.isArray(project.employeeIds) ||
        project.employeeIds.length === 0 ||
        project.employeeIds.includes(form.employeeId)
    );
  }, [projects, form.employeeId]);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch = [
        task.title,
        task.description,
        task.project,
        task.employeeName,
      ].some((value) => value?.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (filterProject === "all" ||
          task.project === filterProject) &&
        (filterEmployee === "all" ||
          task.employeeId === filterEmployee) &&
        (filterStatus === "all" ||
          task.status === filterStatus) &&
        (filterPriority === "all" ||
          task.priority === filterPriority)
      );
    });
  }, [
    tasks,
    searchTerm,
    filterProject,
    filterEmployee,
    filterStatus,
    filterPriority,
  ]);

  const handleAssignTask = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Please enter a task title.");
      return;
    }

    if (!form.employeeId || !form.project) {
      setErrorMessage("Select an employee and a project.");
      return;
    }

    const companyId = sessionStorage.getItem("company_id");

    if (!companyId || !/^\d+$/.test(companyId)) {
      setErrorMessage("Invalid company ID. Please sign in again.");
      return;
    }

    const employee = employees.find(
      (item) => item.user_id === form.employeeId
    );

    if (!employee) {
      setErrorMessage("Selected employee was not found.");
      return;
    }

    const project = availableProjects.find(
      (item) => item.name === form.project
    );

    if (!project) {
      setErrorMessage(
        "This employee is not assigned to the selected project."
      );
      return;
    }

    setSaving(true);

    try {
      const newTask: Task = {
        taskId: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim(),
        project: project.name,
        assignedTo: employee.user_id,
        priority: form.priority,
        due: form.due,
        status: "To do",
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedWork = [...employee.work, newTask];

      const { error } = await supabase
        .from("users")
        .update({ work: updatedWork })
        .eq("user_id", employee.user_id)
        .eq("company_id", companyId);

      if (error) throw error;

      setEmployees((current) =>
        current.map((item) =>
          item.user_id === employee.user_id
            ? { ...item, work: updatedWork }
            : item
        )
      );

      setTasks((current) => [
        {
          ...newTask,
          employeeId: employee.user_id,
          employeeName: employee.full_name,
        },
        ...current,
      ]);

      setForm(emptyTaskForm);
      setModalOpen(false);
      setSuccessMessage("Task assigned successfully.");
    } catch (error) {
      console.error("Failed to assign task:", error);
      setErrorMessage(
        "Could not save the task. Check your database permissions and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (
    field: keyof typeof emptyTaskForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "employeeId" ? { project: "" } : {}),
    }));
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-400">
            Assign and track work across projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMessage("");
            setSuccessMessage("");
            setForm(emptyTaskForm);
            setModalOpen(true);
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          <Plus className="h-4 w-4" />
          Assign task
        </button>
      </div>

      {errorMessage && !modalOpen && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2.4fr_1fr_1fr_1fr_1fr]">
        <div className={`${box} justify-start gap-2`}>
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tasks"
            className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

        {[
          {
            label: "All projects",
            value: filterProject,
            set: setFilterProject,
            options: projects.map((project) => ({
              value: project.name,
              label: project.name,
            })),
          },
          {
            label: "All assignees",
            value: filterEmployee,
            set: setFilterEmployee,
            options: employees.map((employee) => ({
              value: employee.user_id,
              label: employee.full_name,
            })),
          },
          {
            label: "Any status",
            value: filterStatus,
            set: setFilterStatus,
            options: ["To do", "In progress", "Blocked", "Completed"].map(
              (value) => ({ value, label: value })
            ),
          },
          {
            label: "Any priority",
            value: filterPriority,
            set: setFilterPriority,
            options: ["Low", "Medium", "High", "Urgent"].map(
              (value) => ({ value, label: value })
            ),
          },
        ].map((filter) => (
          <div key={filter.label} className={`${box} relative`}>
            <select
              aria-label={filter.label}
              value={filter.value}
              onChange={(event) => filter.set(event.target.value)}
              className="h-full w-full min-w-0 appearance-none bg-transparent pr-6 text-sm text-gray-300 outline-none"
            >
              <option value="all" className="bg-[#101116]">
                {filter.label}
              </option>

              {filter.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#101116]"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-225 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {[
                "Task",
                "Assignee",
                "Priority",
                "Due",
                "Status",
                "Progress",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3.5 font-medium first:px-5"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  Loading tasks...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  {tasks.length === 0
                    ? "No tasks yet. Assign a task to get started."
                    : "No tasks match your filters."}
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.taskId}
                  className="border-b border-white/10 text-gray-400 last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">
                      {task.title}
                    </p>
                    <p className="text-xs">{task.project}</p>
                  </td>

                  <td className="px-4 py-4">{task.employeeName}</td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        priorityStyles[task.priority] ??
                        priorityStyles.Medium
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {task.due || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        statusStyles[task.status] ??
                        statusStyles["To do"]
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-indigo-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, task.progress)
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs">{task.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-task-title"
            onClick={(event) => event.stopPropagation()}
            className="my-auto w-full max-w-lg rounded-xl border border-white/10 bg-[#101116] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2
                  id="assign-task-title"
                  className="text-lg font-bold text-white"
                >
                  Assign task
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Assign work to an employee for a project.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-4 p-6">
              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm text-gray-300">
                  Task title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="e.g. Design onboarding screens"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the task..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-300">
                  Employee *
                </label>
                <select
                  required
                  value={form.employeeId}
                  onChange={(event) =>
                    updateForm("employeeId", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option
                      key={employee.user_id}
                      value={employee.user_id}
                      className="bg-[#101116]"
                    >
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-300">
                  Project *
                </label>
                <select
                  required
                  value={form.project}
                  onChange={(event) =>
                    updateForm("project", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select project</option>
                  {availableProjects.map((project) => (
                    <option
                      key={project.name}
                      value={project.name}
                      className="bg-[#101116]"
                    >
                      {project.name}
                    </option>
                  ))}
                </select>

                {form.employeeId && availableProjects.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-400">
                    No projects are assigned to this employee.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm("priority", event.target.value)
                    }
                    className={inputClass}
                  >
                    {["Low", "Medium", "High", "Urgent"].map((value) => (
                      <option
                        key={value}
                        value={value}
                        className="bg-[#101116]"
                      >
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={form.due}
                    onChange={(event) =>
                      updateForm("due", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || employees.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {saving ? "Assigning..." : "Assign task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}