"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Eye, Search, X } from "lucide-react";
import { createClient } from "@/supabase/client";

type Attachment = {
  url: string;
  name: string;
  path?: string;
  size?: number;
  type?: string;
};

type Report = {
  title?: string;
  task?: string;
  project?: string;
  date?: string;
  hours?: string | number;
  minutes?: string | number;
  status?: string;
  submittedAt?: string;
  help?: string;
  blocker?: string;
  progress?: string;
  workedOn?: string;
  remaining?: string;
  startTime?: string;
  endTime?: string;
  challenges?: string;
  nextActions?: string;
  accomplished?: string;
  expectedCompletion?: string;
  attachments?: Attachment[];
};

type ReportRow = Report & {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
};

const box =
  "flex h-10 items-center rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

const badge: Record<string, string> = {
  submitted: "bg-indigo-500/20 text-indigo-300",
  reviewed: "bg-emerald-500/20 text-emerald-400",
  "changes requested": "bg-amber-500/20 text-amber-400",
  in_progress: "bg-sky-500/20 text-sky-300",
  approved: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/20 text-amber-400",
};

function formatStatus(status?: string) {
  if (!status) return "Submitted";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHours(hours?: string | number, minutes?: string | number) {
  const h = Number(hours ?? 0);
  const m = Number(minutes ?? 0);

  if (!hours && !minutes) return "—";

  const parts: string[] = [];

  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);

  return parts.join(" ") || "0m";
}

export default function AdminReports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");

  const [previewReport, setPreviewReport] = useState<ReportRow | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const companyId = localStorage.getItem("company_id");

        if (
          !companyId ||
          companyId === "undefined" ||
          !/^\d+$/.test(companyId)
        ) {
          console.error("Invalid company ID:", companyId);
          return;
        }

        const supabase = createClient();

        const { data: users, error } = await supabase
          .from("users")
          .select("user_id, full_name, email, reports")
          .eq("company_id", companyId);

        if (error) {
          console.error("Failed to fetch company users:", error.message);
          return;
        }

        const rows: ReportRow[] = [];

        for (const user of users ?? []) {
          const userReports = Array.isArray(user.reports)
            ? (user.reports as Report[])
            : [];

          userReports.forEach((report, index) => {
            rows.push({
              ...report,
              id: `${user.user_id}-${index}`,
              employeeId: String(user.user_id),
              employeeName: user.full_name ?? "Unknown employee",
              employeeEmail: user.email ?? "",
            });
          });
        }

        rows.sort((a, b) => {
          const dateA = new Date(a.submittedAt ?? a.date ?? 0).getTime();
          const dateB = new Date(b.submittedAt ?? b.date ?? 0).getTime();

          return dateB - dateA;
        });

        setReports(rows);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    if (!previewReport) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewReport(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [previewReport]);

  const employees = useMemo(
    () =>
      Array.from(
        new Map(
          reports.map((report) => [
            report.employeeId,
            {
              id: report.employeeId,
              name: report.employeeName,
            },
          ])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [reports]
  );

  const projects = useMemo(
    () =>
      [...new Set(reports.map((report) => report.project?.trim()).filter(
        (project): project is string => Boolean(project)
      ))].sort((a, b) => a.localeCompare(b)),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch = [
        report.title,
        report.task,
        report.employeeName,
        report.employeeEmail,
        report.project,
      ].some((value) => value?.toLowerCase().includes(query));

      const status = (report.status ?? "submitted").toLowerCase();

      const matchesTab =
        selectedTab === "all" ||
        (selectedTab === "pending" &&
          ["submitted", "pending", "in_progress"].includes(status)) ||
        (selectedTab === "changes" &&
          status === "changes requested");

      const matchesEmployee =
        selectedEmployee === "all" ||
        report.employeeId === selectedEmployee;

      const matchesProject =
        selectedProject === "all" ||
        report.project?.trim() === selectedProject;

      const matchesDate =
        selectedDate === "all" || report.date === selectedDate;

      return (
        matchesSearch &&
        matchesTab &&
        matchesEmployee &&
        matchesProject &&
        matchesDate
      );
    });
  }, [
    reports,
    searchTerm,
    selectedTab,
    selectedEmployee,
    selectedProject,
    selectedDate,
  ]);

  const selectClass =
    "h-full w-full min-w-0 appearance-none bg-transparent pr-6 text-sm text-gray-300 outline-none";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-bold text-white">Reports</h1>
      <p className="mb-6 mt-1 text-sm text-gray-400">
        Review work reports submitted by your team.
      </p>

      <div className="mb-4 inline-flex flex-wrap rounded-lg border border-white/10 bg-[#101116] p-1 text-sm">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending review" },
          { value: "changes", label: "Changes requested" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSelectedTab(tab.value)}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              selectedTab === tab.value
                ? "bg-[#0a0b0e] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2.4fr_1fr_1fr_1fr]">
        <div className={`${box} justify-start gap-2`}>
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search reports"
            className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

        <div className={`${box} relative`}>
          <select
            aria-label="Filter by employee"
            value={selectedEmployee}
            onChange={(event) => setSelectedEmployee(event.target.value)}
            className={selectClass}
          >
            <option value="all">All employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id} className="bg-[#101116]">
                {employee.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
        </div>

        <div className={`${box} relative`}>
          <select
            aria-label="Filter by project"
            value={selectedProject}
            onChange={(event) => setSelectedProject(event.target.value)}
            className={selectClass}
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project} value={project} className="bg-[#101116]">
                {project}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
        </div>

        <div className={`${box} relative`}>
          <select
            aria-label="Filter by date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className={selectClass}
          >
            <option value="all">Any date</option>
            {[...new Set(reports.map((report) => report.date).filter(
              (date): date is string => Boolean(date)
            ))]
              .sort((a, b) => b.localeCompare(a))
              .map((date) => (
                <option key={date} value={date} className="bg-[#101116]">
                  {formatDate(date)}
                </option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-225 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {[
                "Report title",
                "Employee",
                "Project",
                "Date",
                "Hours",
                "Status",
                "",
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
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  Loading reports...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  {reports.length === 0
                    ? "No reports found for this company."
                    : "No reports match your filters."}
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const normalizedStatus = (
                  report.status ?? "submitted"
                ).toLowerCase();

                return (
                  <tr
                    key={report.id}
                    className="border-b border-white/10 text-gray-400 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {report.title || report.task || "Untitled report"}
                    </td>
                    <td className="px-4 py-4">{report.employeeName}</td>
                    <td className="px-4 py-4">{report.project || "—"}</td>
                    <td className="px-4 py-4">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-4 py-4 font-medium text-white">
                      {formatHours(report.hours, report.minutes)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          badge[normalizedStatus] ??
                          "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {formatStatus(report.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          aria-label={`Preview ${report.title || report.task || "report"}`}
                          onClick={() => setPreviewReport(report)}
                          className="rounded-md p-2 text-gray-400 transition hover:bg-indigo-500/10 hover:text-indigo-400"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {previewReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewReport(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-preview-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#101116] shadow-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-white/10 bg-[#101116] px-6 py-5">
              <div>
                <h2
                  id="report-preview-title"
                  className="text-lg font-bold text-white"
                >
                  {previewReport.title || previewReport.task || "Report details"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {previewReport.employeeName} · {formatDate(previewReport.date)}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close report preview"
                onClick={() => setPreviewReport(null)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Employee", previewReport.employeeName],
                  ["Email", previewReport.employeeEmail || "—"],
                  ["Project", previewReport.project || "—"],
                  ["Task", previewReport.task || "—"],
                  ["Date", formatDate(previewReport.date)],
                  ["Hours", formatHours(previewReport.hours, previewReport.minutes)],
                  ["Status", formatStatus(previewReport.status)],
                  ["Progress", previewReport.progress || "—"],
                  ["Start time", previewReport.startTime || "—"],
                  ["End time", previewReport.endTime || "—"],
                  ["Expected completion", formatDate(previewReport.expectedCompletion)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/10 p-3"
                  >
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="mt-1 wrap-break-word text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>

              {[
                ["Accomplished", previewReport.accomplished],
                ["Work done", previewReport.workedOn],
                ["Remaining work", previewReport.remaining],
                ["Challenges", previewReport.challenges],
                ["Blockers", previewReport.blocker],
                ["Help needed", previewReport.help],
                ["Next actions", previewReport.nextActions],
              ].map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <h3 className="mb-1 text-sm font-semibold text-white">
                      {label}
                    </h3>
                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-gray-400">
                      {value}
                    </p>
                  </div>
                ) : null
              )}

              {previewReport.attachments &&
                previewReport.attachments.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-white">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {previewReport.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment.path ?? attachment.url}-${index}`}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-white/10 p-3 text-sm text-indigo-300 hover:bg-white/5"
                        >
                          {attachment.name || `Attachment ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}