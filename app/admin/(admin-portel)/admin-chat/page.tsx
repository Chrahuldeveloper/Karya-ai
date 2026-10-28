import { AlertTriangle, ArrowUp, Paperclip, Sparkles } from "lucide-react";

const suggestions = [
  "Summarize today's work progress",
  "Who hasn't submitted a report?",
  "Show blocked tasks",
  "Which projects are at risk?",
];

const projects = [
  { name: "Atlas Mobile App", progress: 64, note: "On track" },
  { name: "Pulse Analytics", progress: 38, note: "Slightly behind" },
  { name: "Brand Refresh 2026", progress: 82, note: "On hold" },
];

const blocked = [
  { task: "Accessibility audit of payments flow", who: "Aisha Verma", project: "Atlas Mobile App" },
  { task: "API rate-limit handling", who: "Meera Iyer", project: "Pulse Analytics" },
];

const missing = ["Dev Patel", "Meera Iyer", "Tom Becker", "Nina Rossi"];

function AiAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-500 px-4 py-2.5 text-sm text-white">{children}</div>
    </div>
  );
}

export default function AdminChat() {
  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-3xl flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
        <AiAvatar />
        <div>
          <h1 className="text-lg font-bold text-white">NIVO Assistant</h1>
          <p className="text-xs text-gray-400">Ask about work progress, reports, projects and your team.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        <UserMessage>Give me a summary of today&apos;s work progress.</UserMessage>

        {/* AI: summary */}
        <div className="flex gap-3">
          <AiAvatar />
          <div className="w-full max-w-[85%] space-y-4">
            <p className="text-sm leading-relaxed text-gray-200">
              Here&apos;s where things stand as of 6:00 PM. 31 of 48 employees have submitted their reports, and overall progress is steady across active projects.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Reports in", value: "31 / 48" },
                { label: "Pending review", value: "9" },
                { label: "Blocked tasks", value: "4" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-[#101116] p-3">
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="mt-1 text-lg font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#101116]">
              <p className="border-b border-white/10 px-4 py-3 text-xs font-semibold text-white">Project progress</p>
              <ul className="space-y-3 p-4">
                {projects.map((p) => (
                  <li key={p.name}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-white">{p.name}</span>
                      <span className="text-gray-400">{p.progress}% · {p.note}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${p.progress}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#101116]">
              <p className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold text-white">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                Needs attention
              </p>
              <ul className="divide-y divide-white/10">
                {blocked.map((b) => (
                  <li key={b.task} className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{b.task}</p>
                    <p className="text-xs text-gray-400">{b.who} · {b.project}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <UserMessage>Who hasn&apos;t submitted a report today?</UserMessage>

        {/* AI: missing reports */}
        <div className="flex gap-3">
          <AiAvatar />
          <div className="w-full max-w-[85%] space-y-3">
            <p className="text-sm leading-relaxed text-gray-200">17 employees haven&apos;t submitted yet. Here are the first few:</p>
            <ul className="flex flex-wrap gap-2">
              {missing.map((n) => (
                <li key={n} className="flex items-center gap-2 rounded-full border border-white/10 bg-[#101116] py-1 pl-1 pr-3 text-xs text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-semibold text-indigo-300">
                    {n.split(" ").map((x) => x[0]).join("")}
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex gap-3">
          <AiAvatar />
          <div className="flex items-center gap-1 rounded-2xl bg-[#101116] px-4 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          </div>
        </div>
      </div>

      {/* Suggestions + input */}
      <div className="pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <span key={s} className="rounded-full border border-white/10 bg-[#101116] px-3 py-1.5 text-xs text-gray-300">{s}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101116] px-3 py-2.5">
          <Paperclip className="h-4 w-4 text-gray-400" />
          <span className="flex-1 text-sm text-gray-500">Ask about progress, reports or projects…</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <ArrowUp className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}