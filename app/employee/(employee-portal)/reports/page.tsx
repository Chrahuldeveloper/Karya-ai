import { ChevronDown, Eye, Pencil, Search } from "lucide-react";

const reports = [
  { title: "Onboarding screens — KYC step", date: "Oct 25, 2026", project: "Atlas Mobile App", hours: "6h 30m", status: "In progress", submitted: "Oct 25, 6:00 PM" },
  { title: "Icon migration finished", date: "Oct 25, 2026", project: "Atlas Mobile App", hours: "1h 30m", status: "Completed", submitted: "Oct 25, 7:00 PM" },
  { title: "Accessibility audit blocked", date: "Oct 24, 2026", project: "Atlas Mobile App", hours: "3h", status: "Blocked", submitted: "Oct 24, 6:00 PM", note: "Changes requested" },
  { title: "Support lead interviews", date: "Oct 24, 2026", project: "Pulse Analytics", hours: "4h", status: "In progress", submitted: "Oct 24, 5:00 PM" },
  { title: "Design system tokens review", date: "Oct 22, 2026", project: "Atlas Mobile App", hours: "5h", status: "Completed", submitted: "Oct 22, 6:00 PM" },
];

const statusStyle: Record<string, string> = {
  "In progress": "bg-indigo-500/20 text-indigo-300",
  Completed: "bg-emerald-500/20 text-emerald-400",
  Blocked: "bg-red-500/20 text-red-400",
};

const box = "flex h-10 items-center rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function MyReports() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Reports</h1>
          <p className="mt-1 text-sm text-gray-400">Your complete reporting history.</p>
        </div>
        <button className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
          New report
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1fr]">
        <div className={`${box} col-span-2 gap-2 lg:col-span-1`}>
          <Search className="h-4 w-4" />
          <span className="text-gray-400">Search reports</span>
        </div>
        <div className={box}>mm/dd/yyyy</div>
        <div className={box}>mm/dd/yyyy</div>
        <div className={`${box} justify-between`}>All projects <ChevronDown className="h-4 w-4" /></div>
        <div className={`${box} justify-between`}>Any status <ChevronDown className="h-4 w-4" /></div>
        <div className={`${box} justify-between`}>Newest <ChevronDown className="h-4 w-4" /></div>
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
            {reports.map((r) => (
              <tr key={r.title} className="border-b border-white/10 text-gray-400">
                <td className="px-5 py-4">
                  <p className=" text-white">{r.title}</p>
                  {r.note && (
                    <span className="mt-1.5 inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      {r.note}
                    </span>
                  )}
                </td>
                <td className="px-3 py-4">{r.date}</td>
                <td className="px-3 py-4">{r.project}</td>
                <td className="px-3 py-4 font-medium text-white">{r.hours}</td>
                <td className="px-3 py-4">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-3 py-4">{r.submitted}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-4 text-white">
                    <Eye className="h-4 w-4" />
                    <Pencil className="h-4 w-4" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="py-5 text-center text-sm font-medium text-white">Load more (2 remaining)</div>
      </div>
    </div>
  );
}