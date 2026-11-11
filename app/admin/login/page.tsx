"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import bcrypt from "bcryptjs";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/supabase/client";

export default function AdminLogin() {
  const input =
    "w-full rounded-xl border border-white/10 bg-black/50 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all [color-scheme:dark] focus:border-violet-400 focus:bg-black/70 focus:ring-4 focus:ring-violet-500/15";

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: admin, error: supabaseError } = await supabase
        .from("admin")
        .select("id, password")
        .eq("work_email", email.trim().toLowerCase())
        .maybeSingle();

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      const isValid = admin
        ? await bcrypt.compare(password, admin.password)
        : false;

      if (!admin || !isValid) {
        setError("Invalid email or password.");
        return;
      }

      localStorage.setItem("admin_id", admin.id);
      localStorage.setItem("company_id", admin.id);

      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-black text-white lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-violet-700/40 blur-[130px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.07)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

        <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-700 text-lg font-bold shadow-[0_0_30px_rgba(139,92,246,0.7)]">
            K
          </span>
          <span className="text-lg font-semibold tracking-tight">Karya AI</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin console
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">
            Your whole team,{" "}
            <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-fuchsia-400 bg-clip-text text-transparent">
              one calm dashboard.
            </span>
          </h1>
          <p className="mt-5 text-zinc-400">
            Review reports, track projects and see who needs a nudge, all
            without leaving one screen.
          </p>

          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-800">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">12 reports ready to review</p>
                <p className="text-xs text-zinc-500">Updated a few minutes ago</p>
              </div>
            </div>
            <div className="ml-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
              </div>
              <p className="text-xs text-zinc-400">Sprint 75% done</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-zinc-600">
          © 2026 Karya AI. All rights reserved.
        </p>
      </aside>

      {/* Form */}
      <section className="relative flex items-center justify-center px-5 py-12">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-700/20 blur-[110px] lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 font-bold shadow-[0_0_24px_rgba(139,92,246,0.6)]">
              K
            </span>
            <span className="text-lg font-semibold">Karya AI</span>
            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
              Admin
            </span>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-violet-500/40 via-white/10 to-transparent p-px shadow-[0_30px_100px_-30px_rgba(124,58,237,0.6)]">
            <div className="rounded-3xl bg-zinc-950/95 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Sign in to open the administration console.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className={`${input} pl-11 pr-4`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`${input} pl-11 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((p) => !p)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-zinc-500 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

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
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_36px_rgba(139,92,246,0.45)] transition hover:shadow-[0_0_48px_rgba(139,92,246,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New to Karya AI?{" "}
            <Link
              href="/admin/register"
              className="font-semibold text-violet-400 transition hover:text-violet-300"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}