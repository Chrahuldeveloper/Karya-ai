import { ChevronDown, Eye, Pencil, Plus, Search } from "lucide-react";

const employees = [
  { name: "Aisha Verma", email: "aisha.verma@meridianlabs.com", id: "ML-0482", dept: "Design", manager: "Rahul Mehta", role: "Product Designer", status: "Active" },
  { name: "Karan Shah", email: "karan.shah@meridianlabs.com", id: "ML-0391", dept: "Design", manager: "Rahul Mehta", role: "UX Researcher", status: "Active" },
  { name: "Lena Fischer", email: "lena.fischer@meridianlabs.com", id: "ML-0275", dept: "Marketing", manager: "Sofia Ramos", role: "Brand Lead", status: "Active" },
  { name: "Dev Patel", email: "dev.patel@meridianlabs.com", id: "ML-0518", dept: "Engineering", manager: "Sofia Ramos", role: "Front-end Engineer", status: "On leave" },
  { name: "Meera Iyer", email: "meera.iyer@meridianlabs.com", id: "ML-0533", dept: "Engineering", manager: "Sofia Ramos", role: "Back-end Engineer", status: "Active" },
];

const box = "flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function AdminEmployees() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="mt-1 text-sm text-gray-400">Manage everyone in your organization.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
          <Plus className="h-4 w-4" /> Add employee
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[2.4fr_1fr_1fr_1fr]">
        <div className={`${box} col-span-2 justify-start gap-2 lg:col-span-1`}><Search className="h-4 w-4" /><span className="text-gray-400">Search employees</span></div>
        {["All departments", "Any role", "Any status"].map((l) => (<div key={l} className={box}>{l}<ChevronDown className="h-4 w-4" /></div>))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-205 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {["Employee", "ID", "Department", "Manager", "Role", "Status", ""].map((h) => (<th key={h} className="px-4 py-3.5 font-medium first:px-5">{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-white/10 text-gray-400 last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">{e.name.split(" ").map((x) => x[0]).join("")}</span>
                    <div><p className="font-semibold text-white">{e.name}</p><p className="text-xs">{e.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-4">{e.id}</td>
                <td className="px-4 py-4">{e.dept}</td>
                <td className="px-4 py-4">{e.manager}</td>
                <td className="px-4 py-4">{e.role}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${e.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{e.status}</span>
                </td>
                <td className="px-5 py-4"><div className="flex justify-end gap-4 text-white"><Eye className="h-4 w-4" /><Pencil className="h-4 w-4" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}