import Link from "next/link";
import { ArrowLeft, Calendar, Clock, FileText, ListChecks, User } from "lucide-react";

const project = {
  name: "Atlas Mobile App",
  status: "Active",
  desc: "Redesign of the customer-facing mobile banking experience for iOS and Android. Covers onboarding, payments, accessibility and the shared icon and token system.",
  progress: 64,
  lead: "Rahul Mehta",
  start: "Aug 3, 2026",
  due: "Nov 19, 2026",
  hours: "42h 30m",
};

const tasks = [
  { title: "Design onboarding screens", priority: "High", due: "Oct 28", status: "In progress", progress: 60 },
  { title: "Accessibility audit of payments flow", priority: "Urgent", due: "Oct 26", status: "Blocked", progress: 30 },
  { title: "Update icon set to v2 tokens", priority: "Low", due: "Oct 25", status: "Completed", progress: 100 },
];

const team = [
  { name: "Rahul Mehta", role: "Project lead" },
  { name: "Aisha Verma", role: "Product Designer" },
  { name: "Sofia Ramos", role: "Researcher" },
  { name: "Lena Fischer", role: "Front-end Engineer" },
];

const reports = [
  { title: "Onboarding screens — KYC step", meta: "Oct 25 · 6h 30m", status: "Reviewed" },
  { title: "Icon migration finished", meta: "Oct 25 · 1h 30m", status: "Submitted" },
  { title: "Accessibility audit blocked", meta: "Oct 24 · 3h", status: "Changes requested" },
];

const priorityStyle: Record<string, string> = {
  Low: "bg-white/10 text-gray-300",
  High: "bg-amber-500/20 text-amber-400",
  Urgent: "bg-red-500/20 text-red-400",
};
const statusStyle: Record<string, string> = {
  Completed: "bg-emerald-500/20 text-emerald-400",
  Blocked: "bg-red-500/20 text-red-400",
  "In progress": "bg-indigo-500/20 text-indigo-300",
  Reviewed: "bg-emerald-500/20 text-emerald-400",
  Submitted: "bg-indigo-500/20 text-indigo-300",
  "Changes requested": "bg-amber-500/20 text-amber-400",
};

const card = "rounded-xl border border-white/10 bg-[#101116]";

export default function ProjectDetails() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <Link href="/employee/my-projects" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <section className={`${card} p-6`}>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">{project.status}</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">{project.desc}</p>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-indigo-400" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-sm font-medium text-white">{project.progress}%</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 md:grid-cols-4">
          {[
            { icon: User, label: "Project lead", value: project.lead },
            { icon: Calendar, label: "Start date", value: project.start },
            { icon: Calendar, label: "Due date", value: project.due },
            { icon: Clock, label: "Hours logged", value: project.hours },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="flex items-center gap-2 text-xs text-gray-400">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className={card}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <ListChecks className="h-4 w-4 text-gray-400" />
                My tasks in this project
              </h2>
              <span className="text-xs text-gray-400">{tasks.length} assigned</span>
            </div>
            <ul className="divide-y divide-white/10">
              {tasks.map((t) => (
                <li key={t.title} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <p className="font-semibold text-white">{t.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={`rounded-md px-2 py-0.5 font-medium ${priorityStyle[t.priority]}`}>{t.priority}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{t.due}</span>
                    <span className={`rounded-md px-2 py-0.5 font-medium ${statusStyle[t.status]}`}>{t.status}</span>
                    <div className="h-1.5 w-16 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className="w-8 text-right">{t.progress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileText className="h-4 w-4 text-gray-400" />
                Recent reports
              </h2>
              <span className="text-xs font-medium text-indigo-400">View all</span>
            </div>
            <ul className="divide-y divide-white/10">
              {reports.map((r) => (
                <li key={r.title} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-white">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.meta}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className={`${card} h-fit`}>
          <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Team</h2>
          <ul className="space-y-4 p-5">
            {team.map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}