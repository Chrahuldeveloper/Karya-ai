"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Eye,
  EyeOff,
  X,
  Plus,
  Building2,
  UserRound,
  Mail,
  LockKeyhole,
  Globe,
  MapPin,
  Users,
  BriefcaseBusiness,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#101116] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Other",
];

const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

export default function AdminRegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    companyName: "",
    website: "",
    industry: "",
    size: "",
    address: "",
    password: "",
    confirm: "",
  });

  const [roles, setRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const addRole = () => {
    const role = newRole.trim();

    if (!role) return;

    if (
      roles.some(
        (existingRole) =>
          existingRole.toLowerCase() === role.toLowerCase()
      )
    ) {
      setError("This role already exists.");
      return;
    }

    setRoles((prev) => [...prev, role]);
    setNewRole("");
    setError("");
  };

  const removeRole = (roleToRemove: string) => {
    setRoles((prev) => prev.filter((role) => role !== roleToRemove));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      setError(
        "Password needs 8+ characters, one uppercase letter and one number."
      );
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    if (roles.length === 0) {
      setError("Please add at least one company role.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: supabaseError } = await supabase
        .from("admin")
        .insert([
          {
            full_name: form.fullName,
            website: form.website || null,
            company_name: form.companyName,
            company_address: form.address,
            company_size: form.size,
            industry: form.industry,
            work_email: form.email,
            password: form.password,
            roles,
          },
        ])
        .select();

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      if (data && data.length > 0) {
        const admin = data[0];

        localStorage.setItem("admin_id", admin.id);
        localStorage.setItem("company_id", admin.id);

        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[#08090d] p-10 lg:flex xl:p-14">
          <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold shadow-lg shadow-indigo-500/20">
                K
              </div>
              <span className="text-xl font-bold tracking-[0.2em]">
                KARYA
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg ">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
              Organization management
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Build a more
              <span className="block text-indigo-400">
                connected workplace.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-gray-400">
              Create your organization, define company roles, and give your
              team a place to share work and stay aligned.
            </p>

            <div className="mt-10 space-y-5">
              {[
                {
                  icon: Building2,
                  title: "Your organization",
                  description: "Set up your company profile in one place.",
                },
                {
                  icon: Users,
                  title: "Custom team roles",
                  description: "Define the roles that fit your workflow.",
                },
                {
                  icon: BriefcaseBusiness,
                  title: "One workspace",
                  description: "Prepare your team for a more organized way to work.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#101116] text-indigo-300">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </aside>

        {/* Registration form */}
        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-10 xl:px-16">
          <div className="w-full max-w-2xl">
            {/* Mobile branding */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold">
                K
              </div>
              <span className="text-xl font-bold tracking-[0.2em]">
                KARYA
              </span>
              <span className="rounded-md bg-indigo-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                Admin
              </span>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                <span className="h-px w-6 bg-indigo-400" />
                Get started
              </div>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400">
                Set up your organization and administrator profile to get
                started with KARYA.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 rounded-2xl border border-white/10 bg-[#101116] p-5 shadow-2xl shadow-black/20 sm:p-8"
            >
              {/* Company details */}
              <fieldset className="space-y-5">
                <legend className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  Company details
                </legend>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="text-sm font-medium text-gray-300"
                    >
                      Company name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="companyName"
                      required
                      value={form.companyName}
                      onChange={update("companyName")}
                      placeholder="Meridian Labs"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="text-sm font-medium text-gray-300"
                    >
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-gray-500" />
                      <input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={update("website")}
                        placeholder="https://company.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="industry"
                      className="text-sm font-medium text-gray-300"
                    >
                      Industry <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="industry"
                        required
                        value={form.industry}
                        onChange={update("industry")}
                        className={`${inputClass} appearance-none pr-10 ${
                          form.industry ? "" : "text-gray-500"
                        }`}
                      >
                        <option value="" className="bg-[#101116]">
                          Select industry
                        </option>
                        {INDUSTRIES.map((industry) => (
                          <option
                            key={industry}
                            value={industry}
                            className="bg-[#101116] text-white"
                          >
                            {industry}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="size"
                      className="text-sm font-medium text-gray-300"
                    >
                      Company size <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="size"
                        required
                        value={form.size}
                        onChange={update("size")}
                        className={`${inputClass} appearance-none pr-10 ${
                          form.size ? "" : "text-gray-500"
                        }`}
                      >
                        <option value="" className="bg-[#101116]">
                          Select company size
                        </option>
                        {SIZES.map((size) => (
                          <option
                            key={size}
                            value={size}
                            className="bg-[#101116] text-white"
                          >
                            {size} employees
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-300"
                  >
                    Company address
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-gray-500" />
                    <input
                      id="address"
                      value={form.address}
                      onChange={update("address")}
                      placeholder="Street, city, country"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Company roles */}
              <fieldset className="space-y-4 border-t border-white/10 pt-7">
                <legend className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Company roles
                </legend>

                <p className="text-sm leading-6 text-gray-400">
                  Add the roles available in your organization. Employees can
                  be assigned these roles later.
                </p>

                <div className="flex items-start gap-2">
                  <input
                    id="newRole"
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRole();
                      }
                    }}
                    placeholder="e.g. Manager, Developer, HR"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={addRole}
                    className="mt-2 flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-300"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          aria-label={`Remove ${role}`}
                          className="rounded-full text-gray-400 transition-colors hover:text-red-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-gray-500">
                    No roles added yet.
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  {roles.length} {roles.length === 1 ? "role" : "roles"} added
                </p>
              </fieldset>

              {/* Administrator details */}
              <fieldset className="space-y-5 border-t border-white/10 pt-7">
                <legend className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <UserRound className="h-4 w-4 text-indigo-400" />
                  Administrator details
                </legend>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="text-sm font-medium text-gray-300"
                    >
                      Full name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="fullName"
                      required
                      autoComplete="name"
                      value={form.fullName}
                      onChange={update("fullName")}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-300"
                    >
                      Work email <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={update("email")}
                        placeholder="you@company.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-300"
                    >
                      Password <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-gray-500" />
                      <input
                        id="password"
                        type={show ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={form.password}
                        onChange={update("password")}
                        placeholder="Create a strong password"
                        className={`${inputClass} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShow((prev) => !prev)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-3 top-5 text-gray-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {show ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm"
                      className="text-sm font-medium text-gray-300"
                    >
                      Confirm password{" "}
                      <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="confirm"
                      type={show ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={form.confirm}
                      onChange={update("confirm")}
                      placeholder="Re-enter password"
                      className={inputClass}
                    />
                  </div>
                </div>

                <p className="text-xs leading-5 text-gray-500">
                  Use at least 8 characters, including one uppercase letter and
                  one number.
                </p>
              </fieldset>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create admin account"}
                {!loading && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                By creating an account, you agree to your organization’s
                applicable terms and policies.
              </p>
            </form>

            <p className="mt-7 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="font-semibold text-indigo-400 transition hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}