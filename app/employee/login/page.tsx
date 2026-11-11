"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, LockKeyhole, ArrowRight, UserRound } from "lucide-react";
import bcrypt from "bcryptjs";
import { createClient } from "@/supabase/client";

export default function Login() {
  const input =
    "w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 outline-none transition hover:border-white/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10";

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: employee, error: supabaseError } = await supabase
        .from("users")
        .select("id, company_id, password")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      const isValid = employee
        ? await bcrypt.compare(password, employee.password)
        : false;

      if (!employee || !isValid) {
        setError("Invalid email or password.");
        return;
      }

      localStorage.setItem("employee_id", employee.id);
      localStorage.setItem("company_id", employee.company_id);

      router.push("/employee/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-black text-white lg:grid-cols-2">
      {/* Left panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-purple-950/70 via-black to-black p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm font-bold shadow-lg shadow-purple-500/30">
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
            Your work,
            <br />
            <span className="bg-gradient-to-r from-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
              one clear
              <br />
              workspace.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-gray-400">
            Check your tasks, log your hours and send daily reports, all
            without leaving one screen.
          </p>

          <div className="mt-10 max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500">
                <UserRound size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">Today&apos;s report is waiting</p>
                <p className="text-xs text-gray-500">Takes about two minutes</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          © 2026 Karya AI. All rights reserved.
        </p>
      </section>

      {/* Right panel */}
      <section className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-700/10 blur-3xl" />

        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm font-bold">
              K
            </div>
            <span className="text-lg font-bold tracking-tight">Karya AI</span>
          </Link>

          <div className="rounded-3xl border border-purple-500/30 bg-[#08080b] p-8 shadow-[0_0_80px_-20px_rgba(168,85,247,0.45)]">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to access your workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-200">
                  Work email
                </label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={input}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${input} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            New to Karya AI?{" "}
            <Link href="/employee/register" className="font-semibold text-purple-400 transition hover:text-purple-300">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}