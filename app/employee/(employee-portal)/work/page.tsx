"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/supabase/client";

type Task = {
  taskId: string;
  title: string;
  project: string;
  description: string;
  priority: string;
  due: string;
  status: string;
  progress: number;
  createdAt?: string;
  assignedTo?: string;
};

const priorityStyle: Record<string, string> = {
  Low: "bg-white/10 text-gray-300",
  Medium: "bg-indigo-500/20 text-indigo-300",
  High: "bg-amber-500/20 text-amber-400",
  Urgent: "bg-red-500/20 text-red-400",
};

const statusStyle: Record<string, string> = {
  Completed: "bg-emerald-500/20 text-emerald-400",
  Blocked: "bg-red-500/20 text-red-400",
  "In progress": "bg-indigo-500/20 text-indigo-300",
  "To do": "bg-white/10 text-gray-300",
};

const box =
  "flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function MyWork() {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("All projects");
  const [selectedStatus, setSelectedStatus] = useState("Any status");
  const [selectedPriority, setSelectedPriority] = useState("Any priority");
  const [selectedDue, setSelectedDue] = useState("Any due date");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function fetchTasks() {
      setLoading(true);
      setError("");

      try {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          if (!cancelled) {
            setError("Please sign in to view your tasks.");
            setLoading(false);
          }
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("users")
          .select("work")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          if (!cancelled) {
            setTasks([]);
            setLoading(false);
          }
          return;
        }

        const work = data.work;

        let parsedWork: unknown = work;

        if (typeof work === "string") {
          try {
            parsedWork = JSON.parse(work);
          } catch {
            parsedWork = [];
          }
        }

        const taskList: Task[] = Array.isArray(parsedWork)
          ? parsedWork
              .filter(
                (item): item is Record<string, unknown> =>
                  item !== null && typeof item === "object"
              )
              .map((item) => ({
                taskId: String(item.taskId ?? ""),
                title: String(item.title ?? "Untitled task"),
                project: String(item.project ?? "No project"),
                description: String(item.description ?? ""),
                priority: String(item.priority ?? "Medium"),
                due: String(item.due ?? ""),
                status: String(item.status ?? "To do"),
                progress: Math.min(
                  100,
                  Math.max(0, Number(item.progress) || 0)
                ),
                createdAt:
                  typeof item.createdAt === "string"
                    ? item.createdAt
                    : undefined,
                assignedTo:
                  typeof item.assignedTo === "string"
                    ? item.assignedTo
                    : undefined,
              }))
          : [];

        if (!cancelled) {
          setTasks(taskList);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);

        if (!cancelled) {
          setError("Unable to load your tasks. Please try again.");
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const projects = [
    "All projects",
    ...Array.from(new Set(tasks.map((task) => task.project))),
  ];

  const filteredTasks = tasks.filter((task) => {
    const query = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);

    const matchesProject =
      selectedProject === "All projects" ||
      task.project === selectedProject;

    const matchesStatus =
      selectedStatus === "Any status" || task.status === selectedStatus;

    const matchesPriority =
      selectedPriority === "Any priority" ||
      task.priority === selectedPriority;

    const today = new Date().toISOString().slice(0, 10);

    const matchesDue =
      selectedDue === "Any due date" ||
      (selectedDue === "Overdue" && !!task.due && task.due < today &&
        task.status !== "Completed") ||
      (selectedDue === "Today" && task.due === today) ||
      (selectedDue === "Upcoming" && !!task.due && task.due > today);

    return (
      matchesSearch &&
      matchesProject &&
      matchesStatus &&
      matchesPriority &&
      matchesDue
    );
  });

  const formatDueDate = (due: string) => {
    if (!due) return "No due date";

    const parts = due.split("-");

    if (parts.length === 3) {
      const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );

      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    }

    return due;
  };

  const selectClass =
    "h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#101116] px-3 pr-8 text-sm text-gray-300 outline-none focus:border-indigo-400";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold text-white">My Work</h1>

      <p className="mb-6 mt-1 text-sm text-gray-400">
        Everything assigned to you across projects.
      </p>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2.4fr_1fr_1fr_1fr_1fr]">
        <div className={`${box} col-span-2 justify-start gap-2 lg:col-span-1`}>
          <Search className="h-4 w-4 shrink-0 text-gray-400" />

          <input
            type="search"
            placeholder="Search tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="relative">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={selectClass}
          >
            {projects.map((project) => (
              <option key={project} value={project} className="bg-[#101116]">
                {project}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={selectClass}
          >
            {[
              "Any status",
              "To do",
              "In progress",
              "Completed",
              "Blocked",
            ].map((status) => (
              <option key={status} value={status} className="bg-[#101116]">
                {status}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={selectClass}
          >
            {["Any priority", "Low", "Medium", "High", "Urgent"].map(
              (priority) => (
                <option
                  key={priority}
                  value={priority}
                  className="bg-[#101116]"
                >
                  {priority}
                </option>
              )
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={selectedDue}
            onChange={(e) => setSelectedDue(e.target.value)}
            className={selectClass}
          >
            {["Any due date", "Today", "Upcoming", "Overdue"].map((due) => (
              <option key={due} value={due} className="bg-[#101116]">
                {due}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="rounded-xl border border-white/10 bg-[#101116] px-5 py-12 text-center text-sm text-gray-400">
          Loading your tasks...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center text-sm text-red-300"
        >
          {error}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101116] px-5 py-12 text-center">
          <p className="font-medium text-white">No tasks found</p>
          <p className="mt-1 text-sm text-gray-400">
            {tasks.length === 0
              ? "You don't have any assigned tasks yet."
              : "Try changing your search or filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#101116]">
          {filteredTasks.map((task) => (
            <li key={task.taskId || task.title} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{task.title}</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {task.project}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span
                    className={`rounded-md px-2 py-1 font-medium ${
                      priorityStyle[task.priority] ??
                      "bg-white/10 text-gray-300"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDueDate(task.due)}
                  </span>

                  <span
                    className={`rounded-md px-2 py-1 font-medium ${
                      statusStyle[task.status] ??
                      "bg-white/10 text-gray-300"
                    }`}
                  >
                    {task.status}
                  </span>

                  <div
                    className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10"
                    aria-label={`Progress ${task.progress}%`}
                  >
                    <div
                      className="h-full rounded-full bg-indigo-400"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>

                  <span className="w-8 text-right">{task.progress}%</span>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                {task.description}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && tasks.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
      )}
    </div>
  );
}