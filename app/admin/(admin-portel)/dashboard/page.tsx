import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Users } from "lucide-react";

const stats = [
  { label: "Total employees", value: "48", icon: Users },
  { label: "Reports today", value: "31 / 48", icon: FileText },
  { label: "Pending reviews", value: "9", icon: CheckCircle2 },
  { label: "Blocked tasks", value: "4", icon: AlertTriangle },
];

const reviews = [
  { title: "Onboarding screens — KYC step", who: "Aisha Verma", meta: "Atlas Mobile App · 6h 30m", status: "Submitted" },
  { title: "Support queue wireframes", who: "Karan Shah", meta: "Pulse Analytics · 5h", status: "Submitted" },
  { title: "Accessibility audit blocked", who: "Aisha Verma", meta: "Atlas Mobile App · 3h", status: "Blocked" },
  { title: "Brand moodboard cleanup", who: "Lena Fischer", meta: "Brand Refresh 2026 · 4h", status: "Submitted" },
];

const projects = [
  { name: "Atlas Mobile App", progress: 64 },
  { name: "Pulse Analytics", progress: 38 },
  { name: "Brand Refresh 2026", progress: 82 },
];

const missing = ["Dev Patel", "Meera Iyer", "Tom Becker", "Nina Rossi"];

const badge: Record<string, string> = {
  Submitted: "bg-indigo-500/20 text-indigo-300",
  Blocked: "bg-red-500/20 text-red-400",
};
const card = "rounded-xl border border-white/10 bg-[#101116]";

export default function AdminDashboard() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div>
        <p className="text-xs text-gray-400">Monday, October 26 · Meridian Labs</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Admin overview</h1>
        <p className="mt-1 text-sm text-gray-400">Track reporting, projects and team activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={`${card} p-5`}>
            <div className="flex items-center justify-between text-xs text-gray-400">{label}<Icon className="h-4 w-4" /></div>
            <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className={card}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Reports awaiting review</h2>
            <span className="text-xs font-medium text-indigo-400">View all</span>
          </div>
          <ul className="divide-y divide-white/10">
            {reviews.map((r) => (
              <li key={r.title} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.who} · {r.meta}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badge[r.status]}`}>{r.status}</span>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <section className={card}>
            <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Project progress</h2>
            <ul className="space-y-4 p-5">
              {projects.map((p) => (
                <li key={p.name}>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-white">{p.name}</span><span className="text-gray-400">{p.progress}%</span></div>
                  <div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${p.progress}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Not submitted today</h2>
            <ul className="space-y-3 p-5">
              {missing.map((n) => (
                <li key={n} className="flex items-center gap-3 text-sm text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                    {n.split(" ").map((x) => x[0]).join("")}
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}