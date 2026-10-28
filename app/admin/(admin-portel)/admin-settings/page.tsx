const toggles = [
  { title: "Require manager review", desc: "Reports must be reviewed before they are marked complete.", on: true },
  { title: "Daily report reminders", desc: "Remind employees who haven't submitted by the deadline.", on: true },
  { title: "Weekly summary email", desc: "Send administrators a weekly activity summary.", on: false },
  { title: "Allow report edits after submit", desc: "Employees can edit reports until they are reviewed.", on: true },
];

const card = "rounded-xl border border-white/10 bg-[#101116]";
const input = "mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white outline-none";

export default function AdminSettings() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <section className={card}>
        <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Organization</h2>
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div><label className="text-sm font-semibold text-white">Organization name</label><input defaultValue="Meridian Labs" className={input} /></div>
          <div><label className="text-sm font-semibold text-white">Email domain</label><input defaultValue="meridianlabs.com" className={input} /></div>
          <div><label className="text-sm font-semibold text-white">Timezone</label><input defaultValue="Asia/Kolkata (IST)" className={input} /></div>
          <div><label className="text-sm font-semibold text-white">Daily report deadline</label><input defaultValue="6:00 PM" className={input} /></div>
        </div>
        <div className="flex justify-end border-t border-white/10 px-5 py-4">
          <button className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white">Save changes</button>
        </div>
      </section>

      <section className={card}>
        <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Reporting rules</h2>
        <ul className="divide-y divide-white/10">
          {toggles.map((t) => (
            <li key={t.title} className="flex items-center justify-between px-5 py-4">
              <div><p className="text-sm font-semibold text-white">{t.title}</p><p className="text-xs text-gray-400">{t.desc}</p></div>
              <span className={`relative h-6 w-11 rounded-full ${t.on ? "bg-indigo-500" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#0e0f13] ${t.on ? "left-5.5" : "left-0.5"}`} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}