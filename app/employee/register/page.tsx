"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ChevronDown,
  BriefcaseBusiness,
  UserRound,
  Mail,
  LockKeyhole,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

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
    "w-full rounded-xl border border-white/10 bg-[#101116] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-500 hover:border-white/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-[#15161c]";

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

      const { error: insertError } = await supabase.from("users").insert([
        {
          full_name: userName,
          email: form.email.trim(),
          Company: selectedCompany.company_name,
          role: form.role,
          company_id: form.company_id,
          user_name: userName,
          password: form.password,
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-4 py-10 text-white sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#111218] shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#08090d] p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
                <BriefcaseBusiness size={23} />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                KARYA
              </span>
            </Link>

            <div className="mt-24">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
                Employee Portal
              </p>

              <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
                Your work.
                <br />
                Your team.
                <br />
                Your impact.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                Join your organization, connect with your team, and keep your
                work moving forward in one place.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-5">
            {[
              "A workspace built around your team",
              "Access based on your company role",
              "One place to manage your work",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={19}
                  className="shrink-0 text-indigo-400"
                />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}

            <div className="border-t border-white/10 pt-5 text-xs text-gray-500">
            </div>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <BriefcaseBusiness size={21} />
              </div>

              <span className="text-xl font-bold tracking-tight text-white">
                KARYA
              </span>
            </Link>

            <div className="mb-8">
              <div className="mb-3 inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                Employee registration
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Enter your details to join your organization.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

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
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Work email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

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
                <label
                  htmlFor="company_id"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Company
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <select
                    id="company_id"
                    required
                    value={form.company_id}
                    onChange={update("company_id")}
                    disabled={companiesLoading}
                    className={`${inputClass} appearance-none pl-11 pr-10 ${
                      form.company_id ? "" : "text-gray-500"
                    }`}
                  >
                    <option value="" className="bg-[#101116] text-white">
                      {companiesLoading
                        ? "Loading companies..."
                        : companies.length > 0
                          ? "Select your company"
                          : "No companies available"}
                    </option>

                    {companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                        className="bg-[#101116] text-white"
                      >
                        {company.company_name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Role in the company
                </label>

                <div className="relative">
                  <BriefcaseBusiness
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <select
                    id="role"
                    required
                    value={form.role}
                    onChange={update("role")}
                    disabled={!form.company_id || companiesLoading}
                    className={`${inputClass} appearance-none pl-11 pr-10 ${
                      form.role ? "" : "text-gray-500"
                    }`}
                  >
                    <option value="" className="bg-[#101116] text-white">
                      {!form.company_id
                        ? "Select a company first"
                        : availableRoles.length > 0
                          ? "Select your role"
                          : "No roles available"}
                    </option>

                    {availableRoles.map((role) => (
                      <option
                        key={role}
                        value={role}
                        className="bg-[#101116] text-white"
                      >
                        {role}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

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
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-400"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || companiesLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating your account..." : "Create account"}

                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              <p className="text-center text-sm leading-6 text-gray-500">
                By creating an account, you agree to follow your
                organization&apos;s policies.
              </p>
            </form>

            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/employee/login"
                  className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-gray-500 lg:hidden">
              © {new Date().getFullYear()} KARYA
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}