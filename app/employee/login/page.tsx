"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import { createClient } from "@/supabase/client";

export default function Login() {
  const input = "mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">N</div>
          <span className="text-xl font-bold tracking-widest">Karaya Ai</span>
          <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">Employee</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#101116]">
          <div className="border-b border-white/10 px-6 py-5">
            <h1 className="text-lg font-bold">Employee sign in</h1>
            <p className="mt-1 text-sm text-gray-400">Access your workspace.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <label htmlFor="email" className="text-sm font-semibold">Work email</label>
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
            <div>
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}