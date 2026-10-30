"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, CircleDot, FileText, Upload, X } from "lucide-react";
import { createClient } from "@/supabase/client";

type Status = "completed" | "in_progress" | "blocked";

const STATUS_OPTIONS: { value: Status; title: string; desc: string; icon: React.ReactNode }[] = [
  { value: "completed", title: "Completed", desc: "The work is finished", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
  { value: "in_progress", title: "In Progress", desc: "Still working on it", icon: <CircleDot className="h-5 w-5 text-indigo-400" /> },
  { value: "blocked", title: "Blocked", desc: "Something is stopping me", icon: <AlertTriangle className="h-5 w-5 text-red-400" /> },
];

const PROJECTS = ["Onboarding Revamp", "Mobile App", "Design System"];
const TASKS = ["Account linking screens", "Empty states", "Usability tests"];

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 [color-scheme:dark]";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#101116] p-5">
      <h2 className="mb-5 text-sm font-semibold text-white">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-white">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Select({ id, value, onChange, placeholder, options }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} appearance-none pr-9 ${value ? "" : "text-gray-500"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#101116] text-white">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
    </div>
  );
}

export default function SubmitReportForm() {


  const [form, setForm] = useState({
    title: "",
    date: "",
    project: "",
    task: "",
    workedOn: "",
    accomplished: "",
    progress: "",
    remaining: "",
    hours: "0",
    minutes: "0",
    startTime: "",
    endTime: "",
    status: "completed" as Status,
    challenges: "",
    blocker: "",
    help: "",
    nextActions: "",
    expectedCompletion: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const addFiles = (list: FileList | null) => {

    if (!list) return;

    const selected = Array.from(list);

    if (selected.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Each attachment must be 10 MB or smaller.");
      return;
    }

    setError("");
    setFiles((previous) => [...previous, ...selected]);

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const supabase = createClient();
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        setError("User not found. Please log in again.");
        return;
      }

      const attachments = [];

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(path, file);

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("reports")
          .getPublicUrl(path);


        attachments.push({
          name: file.name,
          path,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
        });
      }

      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("reports")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const existingReports = Array.isArray(user.reports)
        ? user.reports
        : [];

      const newReport = {
        ...form,
        attachments,
        submittedAt: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("users")
        .update({
          reports: [...existingReports, newReport],
        })
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      alert("saved")

    } catch (error) {
      console.error(error);
      setError("Failed to save report.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl pb-28">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Submit Work Report</h1>
        <p className="mt-1 text-sm text-gray-400">Record what you worked on and what you accomplished.</p>
      </header>

      <div className="space-y-4">
        <Card title="Basic Information">
          <Field label="Report title" htmlFor="title" required>
            <input id="title" value={form.title} onChange={set("title")} placeholder="e.g. Onboarding screens — account linking" className={fieldClass} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Reporting date" htmlFor="date" required>
              <input id="date" type="date" value={form.date} onChange={set("date")} className={fieldClass} />
            </Field>
            <Field label="Project" htmlFor="project" required>
              <Select id="project" value={form.project} onChange={(v) => setForm((f) => ({ ...f, project: v }))} placeholder="Select a project" options={PROJECTS} />
            </Field>
          </div>

          <Field label="Task" htmlFor="task" hint="Optional — link this report to a task.">
            <Select id="task" value={form.task} onChange={(v) => setForm((f) => ({ ...f, task: v }))} placeholder="No specific task" options={TASKS} />
          </Field>
        </Card>

        <Card title="Work Details">
          <Field label="What did you work on?" htmlFor="workedOn" required>
            <textarea id="workedOn" rows={3} value={form.workedOn} onChange={set("workedOn")} className={fieldClass} />
          </Field>
          <Field label="What did you accomplish?" htmlFor="accomplished" required>
            <textarea id="accomplished" rows={3} value={form.accomplished} onChange={set("accomplished")} className={fieldClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="What is the current progress?" htmlFor="progress">
              <textarea id="progress" rows={2} value={form.progress} onChange={set("progress")} placeholder="e.g. About 70% complete" className={fieldClass} />
            </Field>
            <Field label="What remains to be completed?" htmlFor="remaining">
              <textarea id="remaining" rows={2} value={form.remaining} onChange={set("remaining")} className={fieldClass} />
            </Field>
          </div>
        </Card>

        <Card title="Time Tracking">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <Field label="Hours" htmlFor="hours" required>
              <input id="hours" type="number" min={0} max={24} value={form.hours} onChange={set("hours")} className={fieldClass} />
            </Field>
            <Field label="Minutes" htmlFor="minutes">
              <input id="minutes" type="number" min={0} max={59} value={form.minutes} onChange={set("minutes")} className={fieldClass} />
            </Field>
            <Field label="Start time" htmlFor="startTime">
              <input id="startTime" type="time" value={form.startTime} onChange={set("startTime")} className={fieldClass} />
            </Field>
            <Field label="End time" htmlFor="endTime">
              <input id="endTime" type="time" value={form.endTime} onChange={set("endTime")} className={fieldClass} />
            </Field>
          </div>
        </Card>

        <Card title="Work Status">
          <div role="radiogroup" aria-label="Work status" className="grid gap-3 sm:grid-cols-3">
            {STATUS_OPTIONS.map((o) => {
              const active = form.status === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setForm((f) => ({ ...f, status: o.value }))}
                  className={`rounded-xl  p-4 text-left transition-colors  cursor-pointer  ${active ? " border border-indigo-400 bg-indigo-500/101 " : "border-white/10 hover:bg-white/5"
                    }`}
                >
                  {o.icon}
                  <p className="mt-3 text-sm font-semibold text-white">{o.title}</p>
                  <p className="text-xs text-gray-400">{o.desc}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Challenges and Blockers">
          <Field label="Challenges encountered" htmlFor="challenges">
            <textarea id="challenges" rows={2} value={form.challenges} onChange={set("challenges")} className={fieldClass} />
          </Field>
          <Field label="Blocker description" htmlFor="blocker" hint="Required only if your status is Blocked.">
            <textarea id="blocker" rows={2} value={form.blocker} onChange={set("blocker")} className={fieldClass} />
          </Field>
          <Field label="Help needed from your manager" htmlFor="help">
            <textarea id="help" rows={2} value={form.help} onChange={set("help")} className={fieldClass} />
          </Field>
        </Card>

        <Card title="Next Steps">
          <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
            <Field label="Planned next actions" htmlFor="nextActions">
              <textarea id="nextActions" rows={2} value={form.nextActions} onChange={set("nextActions")} className={fieldClass} />
            </Field>
            <Field label="Expected completion" htmlFor="expectedCompletion">
              <input id="expectedCompletion" type="date" value={form.expectedCompletion} onChange={set("expectedCompletion")} className={fieldClass} />
            </Field>
          </div>
        </Card>

        <Card title="Attachments">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            className={`flex flex-col items-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${dragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/15"
              }`}
          >
            <Upload className="mb-3 h-5 w-5 text-gray-300" />
            <p className="text-sm text-gray-300">
              <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none focus-visible:underline">
                Click to upload
              </button>{" "}
              or drag files here
            </p>
            <p className="mt-1 text-xs text-gray-500">Screenshots, documents · up to 10 MB each</p>
            <input ref={fileRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="fixed bottom-4 left-64 right-4 z-10 flex justify-center">
        <div className="flex w-full max-w-3xl items-center justify-end gap-3 rounded-xl border border-white/10 bg-[#101116]/95 px-5 py-3 backdrop-blur">
          {error && <p role="alert" className="mr-auto text-xs text-red-300">{error}</p>}
          <button type="button" onClick={() => history.back()} className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
            Submit Report
          </button>
        </div>
      </div>
    </form>
  );
}