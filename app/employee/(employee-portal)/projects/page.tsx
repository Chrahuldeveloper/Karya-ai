import { Calendar, ListChecks, User } from "lucide-react";

const projects = [
  { name: "Atlas Mobile App", status: "Active", desc: "Redesign of the customer-facing mobile banking experience for iOS and Android.", progress: 64, lead: "Rahul Mehta", due: "Nov 19, 2026", tasks: 3, latest: "Onboarding screens — KYC step" },
  { name: "Pulse Analytics", status: "Active", desc: "Internal analytics dashboard for operations and support leads.", progress: 38, lead: "Sofia Ramos", due: "Dec 10, 2026", tasks: 2, latest: "Support lead interviews" },
  { name: "Brand Refresh 2026", status: "On hold", desc: "Updating marketing site visuals and brand guidelines.", progress: 82, lead: "Lena Fischer", due: "Dec 25, 2026", tasks: 1, latest: "Brand moodboard cleanup" },
];

export default function MyProjects() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold text-white">My Projects</h1>
      <p className="mb-6 mt-1 text-sm text-gray-400">Projects you&apos;ve been assigned to.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <article key={p.name} className="rounded-xl border border-white/10 bg-[#101116] p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-white">{p.name}</h2>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${p.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                {p.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-400">{p.desc}</p>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-indigo-400" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="text-xs text-gray-400">{p.progress}%</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-gray-400">
              <span className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{p.lead}</span>
              <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{p.due}</span>
              <span className="flex items-center gap-2"><ListChecks className="h-3.5 w-3.5" />{p.tasks} assigned tasks</span>
            </div>

            <p className="mt-4 border-t border-white/10 pt-4 text-xs text-gray-400">
              Latest: <span className="text-white">{p.latest}</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}