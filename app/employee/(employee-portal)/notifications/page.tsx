import { CheckCheck, ClipboardList, Clock, FolderInput, Megaphone, MessageSquare, Pencil } from "lucide-react";

const items = [
  { icon: MessageSquare, title: "Feedback from Rahul Mehta", text: "Great progress. Let's go with variant B.", time: "about 9 hours ago" },
  { icon: Clock, title: "Due today: Accessibility audit", text: "Accessibility audit of payments flow is due today.", time: "about 10 hours ago" },
  { icon: Pencil, title: "Correction requested", text: "Please add which screens were reviewed in your audit report.", time: "1 day ago", highlight: true },
  { icon: ClipboardList, title: "New task assigned", text: "Wireframe support queue dashboard — Pulse Analytics.", time: "2 days ago" },
  { icon: Megaphone, title: "Office closed on Friday", text: "Meridian Labs offices will be closed for the Diwali holiday.", time: "3 days ago" },
  { icon: FolderInput, title: "Added to Pulse Analytics", text: "Sofia Ramos added you to Pulse Analytics.", time: "12 days ago" },
];

export default function Notifications() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400">You&apos;re all caught up.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300">
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-[#101116] p-1 text-sm">
        <span className="rounded-md bg-[#0a0b0e] px-3 py-1.5 font-medium text-white">All</span>
        <span className="px-3 py-1.5 text-gray-400">Unread</span>
      </div>

      <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#101116]">
        {items.map(({ icon: Icon, title, text, time, highlight }) => (
          <li key={title} className="flex gap-4 px-5 py-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${highlight ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-sm text-gray-400">{text}</p>
              <p className="mt-1 text-xs text-gray-500">{time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}