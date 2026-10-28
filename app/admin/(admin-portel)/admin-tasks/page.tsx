import { Calendar, ChevronDown, Pencil, Plus, Search } from "lucide-react";

const tasks = [
  { title: "Design onboarding screens", project: "Atlas Mobile App", who: "Aisha Verma", priority: "High", due: "Oct 28", status: "In progress", progress: 60 },
  { title: "Accessibility audit of payments flow", project: "Atlas Mobile App", who: "Aisha Verma", priority: "Urgent", due: "Oct 26", status: "Blocked", progress: 30 },
  { title: "Interview support leads", project: "Pulse Analytics", who: "Karan Shah", priority: "Medium", due: "Oct 27", status: "In progress", progress: 75 },
  { title: "Wireframe support queue dashboard", project: "Pulse Analytics", who: "Karan Shah", priority: "Medium", due: "Oct 31", status: "To do", progress: 0 },
  { title: "Prepare brand guideline PDF", project: "Brand Refresh 2026", who: "Lena Fischer", priority: "Low", due: "Nov 9", status: "To do", progress: 10 },
];

const priority: Record<string, string> = {
  Low: "bg-white/10 text-gray-300", Medium: "bg-indigo-500/20 text-indigo-300",
  High: "bg-amber-500/20 text-amber-400", Urgent: "bg-red-500/20 text-red-400",
};
const status: Record<string, string> = {
  Blocked: "bg-red-500/20 text-red-400", "In progress": "bg-indigo-500/20 text-indigo-300", "To do": "bg-white/10 text-gray-300",
};
const box = "flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function AdminTasks() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-400">Assign and track work across projects.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
          <Plus className="h-4 w-4" /> Assign task
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2.4fr_1fr_1fr_1fr_1fr]">
        <div className={`${box} col-span-2 justify-start gap-2 lg:col-span-1`}><Search className="h-4 w-4" /><span className="text-gray-400">Search tasks</span></div>
        {["All projects", "All assignees", "Any status", "Any priority"].map((l) => (<div key={l} className={box}>{l}<ChevronDown className="h-4 w-4" /></div>))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-225 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {["Task", "Assignee", "Priority", "Due", "Status", "Progress", ""].map((h) => (<th key={h} className="px-4 py-3.5 font-medium first:px-5">{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.title} className="border-b border-white/10 text-gray-400 last:border-0">
                <td className="px-5 py-4"><p className="font-semibold text-white">{t.title}</p><p className="text-xs">{t.project}</p></td>
                <td className="px-4 py-4">{t.who}</td>
                <td className="px-4 py-4"><span className={`rounded-md px-2 py-0.5 text-xs font-medium ${priority[t.priority]}`}>{t.priority}</span></td>
                <td className="px-4 py-4"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{t.due}</span></td>
                <td className="px-4 py-4"><span className={`rounded-md px-2 py-0.5 text-xs font-medium ${status[t.status]}`}>{t.status}</span></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${t.progress}%` }} /></div>
                    <span className="text-xs">{t.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-4"><div className="flex justify-end text-white"><Pencil className="h-4 w-4" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}