import { ChevronDown, Eye, Search } from "lucide-react";

const reports = [
  { title: "Onboarding screens — KYC step", who: "Aisha Verma", project: "Atlas Mobile App", date: "Oct 25, 2026", hours: "6h 30m", status: "Submitted" },
  { title: "Support queue wireframes", who: "Karan Shah", project: "Pulse Analytics", date: "Oct 25, 2026", hours: "5h", status: "Submitted" },
  { title: "Accessibility audit blocked", who: "Aisha Verma", project: "Atlas Mobile App", date: "Oct 24, 2026", hours: "3h", status: "Changes requested" },
  { title: "Support lead interviews", who: "Karan Shah", project: "Pulse Analytics", date: "Oct 24, 2026", hours: "4h", status: "Reviewed" },
  { title: "Design system tokens review", who: "Aisha Verma", project: "Atlas Mobile App", date: "Oct 22, 2026", hours: "5h", status: "Reviewed" },
];

const badge: Record<string, string> = {
  Submitted: "bg-indigo-500/20 text-indigo-300",
  Reviewed: "bg-emerald-500/20 text-emerald-400",
  "Changes requested": "bg-amber-500/20 text-amber-400",
};
const box = "flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function AdminReports() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-bold text-white">Reports</h1>
      <p className="mb-6 mt-1 text-sm text-gray-400">Review work reports submitted by your team.</p>

      <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-[#101116] p-1 text-sm">
        <span className="rounded-md bg-[#0a0b0e] px-3 py-1.5 font-medium text-white">All</span>
        <span className="px-3 py-1.5 text-gray-400">Pending review</span>
        <span className="px-3 py-1.5 text-gray-400">Changes requested</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2.4fr_1fr_1fr_1fr]">
        <div className={`${box} col-span-2 justify-start gap-2 lg:col-span-1`}><Search className="h-4 w-4" /><span className="text-gray-400">Search reports</span></div>
        {["All employees", "All projects", "Any date"].map((l) => (<div key={l} className={box}>{l}<ChevronDown className="h-4 w-4" /></div>))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-215 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {["Report title", "Employee", "Project", "Date", "Hours", "Status", ""].map((h) => (<th key={h} className="px-4 py-3.5 font-medium first:px-5">{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.title} className="border-b border-white/10 text-gray-400 last:border-0">
                <td className="px-5 py-4 font-semibold text-white">{r.title}</td>
                <td className="px-4 py-4">{r.who}</td>
                <td className="px-4 py-4">{r.project}</td>
                <td className="px-4 py-4">{r.date}</td>
                <td className="px-4 py-4 font-medium text-white">{r.hours}</td>
                <td className="px-4 py-4"><span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badge[r.status]}`}>{r.status}</span></td>
                <td className="px-5 py-4"><div className="flex justify-end text-white"><Eye className="h-4 w-4" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}