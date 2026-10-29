"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, Pencil, Search, X, Save, LoaderCircle } from "lucide-react";
import { createClient } from "@/supabase/client";

type Attachment = {
  name: string;
  path: string;
  url?: string;
  size?: number;
  type?: string;
};

type Report = {
  title?: string;
  date?: string;
  project?: string;
  task?: string;
  workedOn?: string;
  accomplished?: string;
  progress?: string;
  remaining?: string;
  hours?: number | string;
  minutes?: number | string;
  startTime?: string;
  endTime?: string;
  status?: string;
  challenges?: string;
  blocker?: string;
  help?: string;
  nextActions?: string;
  expectedCompletion?: string;
  attachments?: Attachment[];
  submittedAt?: string;
  [key: string]: any;
};

type ReportItem = Report & { _index: number };

const statusStyle: Record<string, string> = {
  "In progress": "bg-indigo-500/20 text-indigo-300",
  Completed: "bg-emerald-500/20 text-emerald-400",
  Blocked: "bg-red-500/20 text-red-400",
};

const box =
  "flex h-10 items-center rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

const inputStyle =
  "w-full rounded-lg border border-white/10 bg-[#101116] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500";

const labelStyle = "mb-1.5 block text-sm text-gray-400";

const fields: { key: keyof Report; label: string; type?: string }[] = [
  { key: "title", label: "Report title" },
  { key: "date", label: "Report date", type: "date" },
  { key: "project", label: "Project" },
  { key: "task", label: "Task" },
  { key: "workedOn", label: "Work completed" },
  { key: "accomplished", label: "Accomplishments" },
  { key: "progress", label: "Progress" },
  { key: "remaining", label: "Remaining work" },
  { key: "hours", label: "Hours", type: "number" },
  { key: "minutes", label: "Minutes", type: "number" },
  { key: "startTime", label: "Start time", type: "time" },
  { key: "endTime", label: "End time", type: "time" },
  { key: "challenges", label: "Challenges" },
  { key: "blocker", label: "Blockers" },
  { key: "help", label: "Help needed" },
  { key: "nextActions", label: "Next actions" },
  { key: "expectedCompletion", label: "Expected completion", type: "date" },
];

export default function MyReports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modal, setModal] = useState<"view" | "edit" | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [draft, setDraft] = useState<Report>({});

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All projects");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const [sortOrder, setSortOrder] = useState("Newest");

  useEffect(() => {
    const fetchReports = async () => {
      const userId = sessionStorage.getItem("user_id");

      if (!userId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("users")
        .select("reports")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching reports:", error.message);
        setErrorMessage("Unable to load reports.");
      } else {
        const savedReports: Report[] = Array.isArray(data?.reports)
          ? data.reports
          : [];

        setReports(
          savedReports
            .map((report, index) => ({ ...report, _index: index }))
            .reverse()
        );
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  const openView = (report: ReportItem) => {
    setSelectedReport(report);
    setDraft({ ...report });
    setErrorMessage("");
    setModal("view");
  };

  const openEdit = (report: ReportItem) => {
    setSelectedReport(report);
    setDraft({ ...report });
    setErrorMessage("");
    setModal("edit");
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setSelectedReport(null);
    setErrorMessage("");
  };

  const updateDraft = (key: keyof Report, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveReport = async () => {
    const userId = sessionStorage.getItem("user_id");

    if (!userId || !selectedReport) {
      setErrorMessage("Unable to identify the report or user.");
      return;
    }

    if (!draft.title?.trim()) {
      setErrorMessage("Report title is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("reports")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const savedReports: Report[] = Array.isArray(data?.reports)
        ? [...data.reports]
        : [];

      if (selectedReport._index >= savedReports.length) {
        throw new Error("This report could not be found. Refresh and try again.");
      }

      const updatedReport: Report = {
        ...savedReports[selectedReport._index],
        ...draft,
        title: draft.title.trim(),
      };

      delete updatedReport._index;

      savedReports[selectedReport._index] = updatedReport;

      const { error: updateError } = await supabase
        .from("users")
        .update({ reports: savedReports })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setReports((current) =>
        current.map((report) =>
          report._index === selectedReport._index
            ? { ...updatedReport, _index: selectedReport._index }
            : report
        )
      );

      setSelectedReport({
        ...updatedReport,
        _index: selectedReport._index,
      });
      setDraft(updatedReport);
      setModal("view");
    } catch (error) {
      console.error("Error updating report:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update report."
      );
    } finally {
      setSaving(false);
    }
  };

  const projects = [
    "All projects",
    ...Array.from(
      new Set(reports.map((report) => report.project).filter(Boolean))
    ),
  ];

  const filteredReports = reports
    .filter((report) => {
      const query = search.toLowerCase();

      const matchesSearch =
        (report.title ?? "").toLowerCase().includes(query) ||
        (report.project ?? "").toLowerCase().includes(query) ||
        (report.task ?? "").toLowerCase().includes(query);

      const matchesProject =
        projectFilter === "All projects" ||
        report.project === projectFilter;

      const matchesStatus =
        statusFilter === "Any status" || report.status === statusFilter;

      return matchesSearch && matchesProject && matchesStatus;
    })
    .sort((a, b) => {
      const aDate = new Date(a.submittedAt ?? a.date ?? 0).getTime();
      const bDate = new Date(b.submittedAt ?? b.date ?? 0).getTime();

      return sortOrder === "Newest" ? bDate - aDate : aDate - bDate;
    });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Reports</h1>
          <p className="mt-1 text-sm text-gray-400">
            Your complete reporting history.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/submit-report")}
          className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          New report
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1fr]">
        <div className={`${box} col-span-2 gap-2 lg:col-span-1`}>
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports"
            className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className={box}
        >
          {projects.map((project) => (
            <option key={project} value={project} className="bg-[#101116]">
              {project}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={box}
        >
          {["Any status", "In progress", "Completed", "Blocked"].map(
            (status) => (
              <option key={status} value={status} className="bg-[#101116]">
                {status}
              </option>
            )
          )}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={box}
        >
          <option className="bg-[#101116]">Newest</option>
          <option className="bg-[#101116]">Oldest</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-200 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              <th className="px-5 py-3.5 font-medium">Report Title</th>
              <th className="px-3 py-3.5 font-medium">Date</th>
              <th className="px-3 py-3.5 font-medium">Project</th>
              <th className="px-3 py-3.5 font-medium">Hours</th>
              <th className="px-3 py-3.5 font-medium">Work Status</th>
              <th className="px-3 py-3.5 font-medium">Submitted</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  Loading reports...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  No reports found.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr
                  key={report._index}
                  className="border-b border-white/10 text-gray-400"
                >
                  <td className="px-5 py-4">
                    <p className="text-white">{report.title}</p>
                  </td>

                  <td className="px-3 py-4">{report.date || "-"}</td>
                  <td className="px-3 py-4">{report.project || "-"}</td>
                  <td className="px-3 py-4 font-medium text-white">
                    {report.hours ?? 0}h {report.minutes ?? 0}m
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        statusStyle[report.status ?? ""] ??
                        "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {report.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    {report.submittedAt
                      ? new Date(report.submittedAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4 text-white">
                      <button
                        type="button"
                        title="View report"
                        onClick={() => openView(report)}
                        className="rounded p-1 hover:bg-white/10 hover:text-indigo-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        title="Edit report"
                        onClick={() => openEdit(report)}
                        className="rounded p-1 hover:bg-white/10 hover:text-indigo-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View / Edit modal */}
      {modal && selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#15161c] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  id="report-modal-title"
                  className="text-xl font-semibold text-white"
                >
                  {modal === "view" ? "Report details" : "Edit report"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {modal === "view"
                    ? "Review the submitted report."
                    : "Update the report and save your changes."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === "view" ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedReport.title || "Untitled report"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {selectedReport.project || "No project"} ·{" "}
                    {selectedReport.date || "No date"}
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-md px-2 py-1 text-xs ${
                      statusStyle[selectedReport.status ?? ""] ??
                      "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {selectedReport.status || "Unknown status"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Task", selectedReport.task],
                    ["Hours", `${selectedReport.hours ?? 0}h ${selectedReport.minutes ?? 0}m`],
                    ["Start time", selectedReport.startTime],
                    ["End time", selectedReport.endTime],
                    ["Progress", selectedReport.progress],
                    ["Remaining work", selectedReport.remaining],
                    ["Work completed", selectedReport.workedOn],
                    ["Accomplishments", selectedReport.accomplished],
                    ["Challenges", selectedReport.challenges],
                    ["Blockers", selectedReport.blocker],
                    ["Help needed", selectedReport.help],
                    ["Next actions", selectedReport.nextActions],
                    ["Expected completion", selectedReport.expectedCompletion],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className={labelStyle}>{label}</p>
                      <p className="whitespace-pre-wrap wrap-break-word text-sm text-white">
                        {value || "-"}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-white">
                    Attachments
                  </h3>

                  {selectedReport.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedReport.attachments.map((file, index) => (
                        <div
                          key={`${file.path}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.size != null
                                ? `${(file.size / 1024).toFixed(1)} KB`
                                : file.type || "File"}
                            </p>
                          </div>

                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-sm text-indigo-300 hover:text-indigo-200"
                            >
                              Open file
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No attachments.</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setModal("edit")}
                    className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit report
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveReport();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((field) => {
                    const isLongText = [
                      "workedOn",
                      "accomplished",
                      "progress",
                      "remaining",
                      "challenges",
                      "blocker",
                      "help",
                      "nextActions",
                    ].includes(field.key as string);

                    return (
                      <div
                        key={field.key}
                        className={isLongText ? "sm:col-span-2" : ""}
                      >
                        <label className={labelStyle}>{field.label}</label>

                        {isLongText ? (
                          <textarea
                            value={String(draft[field.key] ?? "")}
                            onChange={(e) =>
                              updateDraft(field.key, e.target.value)
                            }
                            rows={3}
                            className={inputStyle}
                          />
                        ) : (
                          <input
                            type={field.type || "text"}
                            min={field.type === "number" ? 0 : undefined}
                            value={String(draft[field.key] ?? "")}
                            onChange={(e) =>
                              updateDraft(field.key, e.target.value)
                            }
                            className={inputStyle}
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="sm:col-span-2">
                    <label className={labelStyle}>Work status</label>
                    <select
                      value={String(draft.status ?? "In progress")}
                      onChange={(e) => updateDraft("status", e.target.value)}
                      className={inputStyle}
                    >
                      <option className="bg-[#15161c]">In progress</option>
                      <option className="bg-[#15161c]">Completed</option>
                      <option className="bg-[#15161c]">Blocked</option>
                    </select>
                  </div>
                </div>

                {errorMessage && (
                  <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                    {errorMessage}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({ ...selectedReport });
                      setErrorMessage("");
                      setModal("view");
                    }}
                    disabled={saving}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}

            {modal === "view" && errorMessage && (
              <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}