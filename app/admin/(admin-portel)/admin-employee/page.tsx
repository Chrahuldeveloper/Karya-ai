"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, Search, X } from "lucide-react";
import { createClient } from "@/supabase/client";

type Employee = {
  user_id: string;
  full_name: string;
  email: string;
  department?: string;
  role?: string;
  status?: string;
};

const box =
  "flex h-10 items-center rounded-lg border border-white/10 bg-[#101116] px-3 text-sm text-gray-300";

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const companyId = sessionStorage.getItem("company_id");

        if (
          !companyId ||
          companyId === "undefined" ||
          !/^\d+$/.test(companyId)
        ) {
          console.error("Invalid company ID:", companyId);
          return;
        }

        const supabase = createClient();

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("company_id", companyId);

        if (error) {
          console.error("Failed to fetch employees:", error.message);
          return;
        }

        setEmployees(
          (data ?? []).map((user) => ({
            user_id: String(user.user_id),
            full_name: user.full_name ?? "Unnamed employee",
            email: user.email ?? "",
            department: user.department ?? "",
            role: user.role ?? "",
            status: user.status ?? "Active",
          }))
        );
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEmployee(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedEmployee]);

  // Build dropdown options from the fetched employee data.
  const departments = [
    ...new Set(
      employees
        .map((employee) => employee.department?.trim())
        .filter((value): value is string => Boolean(value))
    ),
  ].sort((a, b) => a.localeCompare(b));

  const roles = [
    ...new Set(
      employees
        .map((employee) => employee.role?.trim())
        .filter((value): value is string => Boolean(value))
    ),
  ].sort((a, b) => a.localeCompare(b));

  const statuses = [
    ...new Set(
      employees
        .map((employee) => employee.status?.trim() || "Active")
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const filteredEmployees = employees.filter((employee) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      employee.full_name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.user_id.toLowerCase().includes(query);

    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department?.trim() === selectedDepartment;

    const matchesRole =
      selectedRole === "all" || employee.role?.trim() === selectedRole;

    const matchesStatus =
      selectedStatus === "all" ||
      (employee.status?.trim() || "Active") === selectedStatus;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesRole &&
      matchesStatus
    );
  });

  const selectClass =
    "h-full w-full min-w-0 appearance-none bg-transparent pr-6 text-sm text-gray-300 outline-none cursor-pointer";

  const optionClass = "bg-[#101116] text-gray-200";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Employees</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage everyone in your organization.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2.4fr_1fr_1fr_1fr]">
        <div className={`${box} justify-start gap-2`}>
          <Search className="h-4 w-4 shrink-0 text-gray-400" />

          <input
            type="text"
            placeholder="Search employees"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-400"
          />
        </div>

        <div className={`${box} relative`}>
          <select
            aria-label="Filter by department"
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className={selectClass}
          >
            <option value="all" className={optionClass}>
              All departments
            </option>

            {departments.map((department) => (
              <option
                key={department}
                value={department}
                className={optionClass}
              >
                {department}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
        </div>

        {/* Role dropdown */}
        <div className={`${box} relative`}>
          <select
            aria-label="Filter by role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className={selectClass}
          >
            <option value="all" className={optionClass}>
              Any role
            </option>

            {roles.map((role) => (
              <option key={role} value={role} className={optionClass}>
                {role}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
        </div>

        {/* Status dropdown */}
        <div className={`${box} relative`}>
          <select
            aria-label="Filter by status"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className={selectClass}
          >
            <option value="all" className={optionClass}>
              Any status
            </option>

            {statuses.map((status) => (
              <option key={status} value={status} className={optionClass}>
                {status}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101116]">
        <table className="w-full min-w-205 text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {[
                "Employee",
                "ID",
                "Department",
                "Manager",
                "Role",
                "Status",
                "",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3.5 font-medium first:px-5"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  {employees.length === 0
                    ? "No employees found for this company."
                    : "No employees match your filters."}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.user_id}
                  className="border-b border-white/10 text-gray-400 last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                        {employee.full_name
                          .split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>

                      <div>
                        <p className="font-semibold text-white">
                          {employee.full_name}
                        </p>
                        <p className="text-xs">
                          {employee.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">{employee.user_id}</td>
                  <td className="px-4 py-4">
                    {employee.department || "—"}
                  </td>
                  <td className="px-4 py-4">—</td>
                  <td className="px-4 py-4">{employee.role || "—"}</td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        employee.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {employee.status || "Active"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        aria-label={`Preview ${employee.full_name}`}
                        onClick={() => setSelectedEmployee(employee)}
                        className="rounded-md p-2 text-gray-400 transition hover:bg-indigo-500/10 hover:text-indigo-400"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee preview modal */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-preview-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#101116] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2
                  id="employee-preview-title"
                  className="text-lg font-bold text-white"
                >
                  Employee details
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Employee profile information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                aria-label="Close preview"
                className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-indigo-300">
                  {selectedEmployee.full_name
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedEmployee.full_name}
                  </h3>
                  <p className="break-all text-sm text-gray-400">
                    {selectedEmployee.email || "No email available"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Employee ID",
                    value: selectedEmployee.user_id,
                  },
                  {
                    label: "Status",
                    value: selectedEmployee.status || "Active",
                  },
                  {
                    label: "Department",
                    value: selectedEmployee.department || "—",
                  },
                  {
                    label: "Job title",
                    value: selectedEmployee.role || "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/10 p-3"
                  >
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="mt-1 wrap-break-word text-sm text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}