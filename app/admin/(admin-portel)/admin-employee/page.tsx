"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, Pencil, Plus, Search, X } from "lucide-react";

const employees = [
  { name: "Aisha Verma", email: "aisha.verma@meridianlabs.com", id: "ML-0482", dept: "Design", manager: "Rahul Mehta", role: "Product Designer", status: "Active" },
  { name: "Karan Shah", email: "karan.shah@meridianlabs.com", id: "ML-0391", dept: "Design", manager: "Rahul Mehta", role: "UX Researcher", status: "Active" },
  { name: "Lena Fischer", email: "lena.fischer@meridianlabs.com", id: "ML-0275", dept: "Marketing", manager: "Sofia Ramos", role: "Brand Lead", status: "Active" },
  { name: "Dev Patel", email: "dev.patel@meridianlabs.com", id: "ML-0518", dept: "Engineering", manager: "Sofia Ramos", role: "Front-end Engineer", status: "On leave" },
  { name: "Meera Iyer", email: "meera.iyer@meridianlabs.com", id: "ML-0533", dept: "Engineering", manager: "Sofia Ramos", role: "Back-end Engineer", status: "Active" },
];

const DEPARTMENTS = ["Design", "Engineering", "Marketing", "Operations", "HR"];
const MANAGERS = ["Rahul Mehta", "Sofia Ramos", "Lena Fischer"];

const box = "flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";
const field =
  "mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 [color-scheme:dark]";

function SelectField({ id, label, placeholder, options }: { id: string; label: string; placeholder: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-white">{label}</label>
      <div className="relative">
        <select id={id} defaultValue="" className={`${field} appearance-none pr-10`}>
          <option value="" className="bg-[#101116]">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#101116] text-white">{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-6.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

export default function AdminEmployees() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="mt-1 text-sm text-gray-400">Manage everyone in your organization.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
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

      {/* Add employee modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-employee-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#101116] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 id="add-employee-title" className="text-lg font-bold text-white">Add employee</h2>
                <p className="mt-1 text-sm text-gray-400">Create a new employee profile.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="emp-name" className="text-sm font-semibold text-white">Full name</label>
                  <input id="emp-name" placeholder="Aisha Verma" className={field} />
                </div>
                <div>
                  <label htmlFor="emp-id" className="text-sm font-semibold text-white">Employee ID</label>
                  <input id="emp-id" placeholder="ML-0482" className={field} />
                </div>
              </div>

              <div>
                <label htmlFor="emp-email" className="text-sm font-semibold text-white">Work email</label>
                <input id="emp-email" type="email" placeholder="name@company.com" className={field} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField id="emp-dept" label="Department" placeholder="Select department" options={DEPARTMENTS} />
                <div>
                  <label htmlFor="emp-role" className="text-sm font-semibold text-white">Job title</label>
                  <input id="emp-role" placeholder="Product Designer" className={field} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField id="emp-manager" label="Reporting manager" placeholder="Select manager" options={MANAGERS} />
                <div>
                  <label htmlFor="emp-joined" className="text-sm font-semibold text-white">Date joined</label>
                  <input id="emp-joined" type="date" className={field} />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                >
                  Add employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}