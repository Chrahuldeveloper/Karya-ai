import { Camera, Lock, Pencil } from "lucide-react";

const personal = [
  { label: "Full name", value: "Aisha Verma" },
  { label: "Phone", value: "+91 98200 41123" },
  { label: "About", value: "Designing calm, useful software." },
];

const employment = [
  { label: "Work email", value: "aisha.verma@meridianlabs.com" },
  { label: "Employee ID", value: "ML-0482" },
  { label: "Job title", value: "Product Designer" },
  { label: "Department", value: "Design" },
  { label: "Reporting manager", value: "Rahul Mehta" },
  { label: "Date joined", value: "Mar 11, 2024" },
  { label: "Organization", value: "Meridian Labs" },
];

export default function MyProfile() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <section className="flex items-center gap-5 rounded-xl border border-white/10 bg-[#101116] p-6">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-2xl font-bold text-indigo-300">
            AV
          </div>
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0a0b0e] text-white">
            <Camera className="h-3.5 w-3.5" />
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Aisha Verma</h2>
          <p className="text-sm text-gray-400">Product Designer · Design · Meridian Labs</p>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#101116]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Personal details</h2>
          <button className="flex items-center gap-2 text-xs font-medium text-white">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <dl className="divide-y divide-white/10">
          {personal.map((r) => (
            <div key={r.label} className="flex px-5 py-3.5 text-sm">
              <dt className="w-52 shrink-0 text-gray-400">{r.label}</dt>
              <dd className="text-white">{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#101116]">
        <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Employment details</h2>
        <dl className="divide-y divide-white/10">
          {employment.map((r) => (
            <div key={r.label} className="flex items-center px-5 py-3.5 text-sm">
              <dt className="w-52 shrink-0 text-gray-400">{r.label}</dt>
              <dd className="flex-1 text-white">{r.value}</dd>
              <Lock className="h-3.5 w-3.5 text-gray-400" />
            </div>
          ))}
        </dl>
        <p className="border-t border-white/10 px-5 py-3 text-xs text-gray-400">
          These details are managed by your administrator. Contact HR to request changes.
        </p>
      </section>
    </div>
  );
}