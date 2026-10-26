import { Calendar, ChevronDown, Search } from "lucide-react";

const tasks = [
  { title: "Update icon set to v2 tokens", project: "Atlas Mobile App", desc: "Migrate remaining 40 icons to the new stroke and color tokens.", priority: "Low", due: "Oct 25", status: "Completed", progress: 100 },
  { title: "Accessibility audit of payments flow", project: "Atlas Mobile App", desc: "Audit contrast, tap targets, and screen reader labels across the payments flow.", priority: "Urgent", due: "Oct 26", status: "Blocked", progress: 30 },
  { title: "Interview support leads", project: "Pulse Analytics", desc: "Run 4 discovery interviews and synthesize findings.", priority: "Medium", due: "Oct 27", status: "In progress", progress: 75 },
  { title: "Design onboarding screens", project: "Atlas Mobile App", desc: "Create high-fidelity mockups for the 5-step onboarding flow including KYC upload and account linking.", priority: "High", due: "Oct 28", status: "In progress", progress: 60 },
  { title: "Wireframe support queue dashboard", project: "Pulse Analytics", desc: "Low-fidelity wireframes for the support team queue overview.", priority: "Medium", due: "Oct 31", status: "To do", progress: 0 },
  { title: "Prepare brand guideline PDF", project: "Brand Refresh 2026", desc: "Assemble final brand guideline document for review.", priority: "Low", due: "Nov 9", status: "To do", progress: 10 },
];

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

const box = "flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function MyWork() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold text-white">My Work</h1>
      <p className="mb-6 mt-1 text-sm text-gray-400">Everything assigned to you across projects.</p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2.4fr_1fr_1fr_1fr_1fr]">
        <div className={`${box} col-span-2 justify-start gap-2 lg:col-span-1`}>
          <Search className="h-4 w-4" />
          <span className="text-gray-400">Search tasks</span>
        </div>
        {["All projects", "Any status", "Any priority", "Any due date"].map((l) => (
          <div key={l} className={box}>{l}<ChevronDown className="h-4 w-4" /></div>
        ))}
      </div>

      <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#101116]">
        {tasks.map((t) => (
          <li key={t.title} className="px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">{t.title}</h2>
                <p className="mt-0.5 text-xs text-gray-400">{t.project}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className={`rounded-md px-2 py-0.5 font-medium ${priorityStyle[t.priority]}`}>{t.priority}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{t.due}</span>
                <span className={`rounded-md px-2 py-0.5 font-medium ${statusStyle[t.status]}`}>{t.status}</span>
                <div className="h-1.5 w-16 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-indigo-400" style={{ width: `${t.progress}%` }} />
                </div>
                <span className="w-8 text-right">{t.progress}%</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-400">{t.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}