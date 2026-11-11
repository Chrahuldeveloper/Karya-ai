"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ChevronDown,
  UserRound,
  Mail,
  LockKeyhole,
  Building2,
  BriefcaseBusiness,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

type Company = {
  id: string;
  company_name: string;
  roles: string[];
};

function normalizeRoles(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((role) => {
        if (typeof role === "string") {
          return role.trim();
        }

        if (role && typeof role === "object") {
          const item = role as Record<string, unknown>;
          const name = item.name ?? item.role ?? item.label;

          return typeof name === "string" ? name.trim() : "";
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();

    try {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return normalizeRoles(parsed);
      }
    } catch {
      // Continue checking other formats.
    }

    if (raw.startsWith("{") && raw.endsWith("}")) {
      return raw
        .slice(1, -1)
        .split(",")
        .map((role) => role.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean);
    }

    return raw
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
  }

  return [];
}

export default function EmployeeRegister() {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    Company: "",
    role: "",
    company_id: "",
    password: "",
    confirm: "",
    user_id: "",
    user_name: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-500 hover:border-white/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60";

  useEffect(() => {
    let cancelled = false;

    const fetchCompanies = async () => {
      setCompaniesLoading(true);

      const { data, error } = await supabase
        .from("admin")
        .select("id, company_name, roles");

      if (cancelled) return;

      if (error) {
        console.error("Error fetching companies:", error);
        setError("Unable to load companies. Please refresh the page.");
        setCompaniesLoading(false);
        return;
      }

      setCompanies(
        (data ?? []).map((company) => ({
          id: String(company.id),
          company_name: company.company_name,
          roles: normalizeRoles(company.roles),
        }))
      );

      setCompaniesLoading(false);
    };

    fetchCompanies();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "company_id"
          ? {
              role: "",
              Company:
                companies.find((company) => company.id === value)
                  ?.company_name ?? "",
            }
          : {}),
      }));
    };

  const selectedCompany = companies.find(
    (company) => company.id === form.company_id
  );

  const availableRoles = selectedCompany?.roles ?? [];

  const generateUserId = () => {
    return `K-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Your passwords do not match.");
      return;
    }

    if (!form.company_id) {
      setError("Please select your company.");
      return;
    }

    if (!selectedCompany) {
      setError("The selected company could not be found.");
      return;
    }

    if (!availableRoles.includes(form.role)) {
      setError("Please select a valid role for your company.");
      return;
    }

    setLoading(true);

    try {
      const userId = generateUserId();
      const userName = form.fullName.trim();

      const hashedPassword = await bcrypt.hash(form.password, 12);

      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            full_name: userName,
            email: form.email.trim(),
            Company: selectedCompany.company_name,
            role: form.role,
            company_id: form.company_id,
            user_name: userName,
            password: hashedPassword,
            user_id: userId,
          },
        ]);

      if (insertError) {
        console.error("Employee registration error:", insertError);
        setError(insertError.message || "Unable to create your account.");
        return;
      }

      localStorage.setItem("user_id", userId);
      localStorage.setItem("user_name", userName);
      localStorage.setItem("company_id", form.company_id);
      localStorage.setItem("company_name", selectedCompany.company_name);
      localStorage.setItem("role", form.role);

      router.push("/employee/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const iconLeft =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500";
  const iconRight =
    "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500";
  const labelClass = "mb-2 block text-sm font-medium text-gray-200";

  return (
    <main className="grid min-h-screen bg-black text-white lg:grid-cols-2">
      {/* Left panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-linear-to-br from-purple-950/70 via-black to-black p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-fuchsia-500 text-sm font-bold shadow-lg shadow-purple-500/30">
            K
          </div>
          <span className="text-lg font-bold tracking-tight">Karya AI</span>
        </Link>

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200">
            <UserRound size={13} />
            Employee portal
          </div>

          <h1 className="max-w-lg text-5xl font-bold leading-[1.1] tracking-tight">
            Your work.
            <br />
            Your team.
            <br />
            <span className="bg-linear-to-r from-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
              Your impact.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-gray-400">
            Join your organization, connect with your team and keep your work
            moving forward in one place.
          </p>

          <div className="mt-10 max-w-md space-y-4 rounded-xl border border-white/10 bg-white/3 p-5 backdrop-blur">
            {[
              "A workspace built around your team",
              "Access based on your company role",
              "One place to manage your work",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-purple-400" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          © 2026 Karya AI. All rights reserved.
        </p>
      </section>

      {/* Right panel */}
      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-700/10 blur-3xl" />

        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-fuchsia-500 text-sm font-bold">
              K
            </div>
            <span className="text-lg font-bold tracking-tight">Karya AI</span>
          </Link>

          <div className="rounded-3xl border border-purple-500/30 bg-[#08080b] p-8 shadow-[0_0_80px_-20px_rgba(168,85,247,0.45)]">
            <h2 className="text-2xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter your details to join your organization.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full name
                </label>
                <div className="relative">
                  <UserRound size={17} className={iconLeft} />
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={update("fullName")}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Work email
                </label>
                <div className="relative">
                  <Mail size={17} className={iconLeft} />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={update("email")}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company_id" className={labelClass}>
                  Company
                </label>
                <div className="relative">
                  <Building2 size={17} className={iconLeft} />
                  <select
                    id="company_id"
                    required
                    value={form.company_id}
                    onChange={update("company_id")}
                    disabled={companiesLoading}
                    className={`${inputClass} appearance-none pl-11 pr-10 ${form.company_id ? "" : "text-gray-500"}`}
                  >
                    <option value="" className="bg-[#08080b] text-white">
                      {companiesLoading
                        ? "Loading companies..."
                        : companies.length > 0
                          ? "Select your company"
                          : "No companies available"}
                    </option>

                    {companies.map((company) => (
                      <option key={company.id} value={company.id} className="bg-[#08080b] text-white">
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={iconRight} />
                </div>
              </div>

              <div>
                <label htmlFor="role" className={labelClass}>
                  Role in the company
                </label>
                <div className="relative">
                  <BriefcaseBusiness size={17} className={iconLeft} />
                  <select
                    id="role"
                    required
                    value={form.role}
                    onChange={update("role")}
                    disabled={!form.company_id || companiesLoading}
                    className={`${inputClass} appearance-none pl-11 pr-10 ${form.role ? "" : "text-gray-500"}`}
                  >
                    <option value="" className="bg-[#08080b] text-white">
                      {!form.company_id
                        ? "Select a company first"
                        : availableRoles.length > 0
                          ? "Select your role"
                          : "No roles available"}
                    </option>

                    {availableRoles.map((role) => (
                      <option key={role} value={role} className="bg-[#08080b] text-white">
                        {role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={iconRight} />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className={iconLeft} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={update("password")}
                    className={`${inputClass} pl-11 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className={labelClass}>
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className={iconLeft} />
                  <input
                    id="confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={update("confirm")}
                    className={`${inputClass} pl-11 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || companiesLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-fuchsia-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating your account..." : "Create account"}
                {!loading && (
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                By creating an account, you agree to follow your
                organization&apos;s policies.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/employee/login" className="font-semibold text-purple-400 transition hover:text-purple-300">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}