"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/supabase/client";
import { useRouter } from 'next/navigation';
const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Other"];
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
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      return setError("Password needs 8+ characters, one uppercase letter and one number.");
    }
    if (form.password !== form.confirm) return setError("Passwords don't match.");


    try {

      const supabase = createClient()

      const {data,error} = await supabase.from('admin') 
        .insert([
          { 
            full_name: form.fullName, 
            website: form.website,
            company_name :form.companyName,
            password:form.password,
            company_address:form.address,
            company_size:form.size,
            industry:form.industry,
            work_email : form.email
          },
        ])
        .select() 

      if (error) return setError(error.message);

      if (data) router.push("/admin/dashboard")

      
    } catch (error) {
      console.log(error)
    }





  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-10 text-white">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">K</div>
          <span className="text-xl font-bold tracking-widest">KARYA</span>
          <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
            Admin
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101116]">
          <div className="border-b border-white/10 px-6 py-5">
            <h1 className="text-lg font-bold">Create admin account</h1>
            <p className="mt-1 text-sm text-gray-400">Set up your organization and administrator profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Company details */}
            <fieldset className="space-y-5">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-400">Company details</legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="companyName" className="text-sm font-semibold">Company name</label>
                  <input id="companyName" required value={form.companyName} onChange={update("companyName")} placeholder="Meridian Labs" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="website" className="text-sm font-semibold">Website</label>
                  <input id="website" type="url" value={form.website} onChange={update("website")} placeholder="https://meridianlabs.com" className={inputClass} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="industry" className="text-sm font-semibold">Industry</label>
                  <div className="relative">
                    <select
                      id="industry"
                      required
                      value={form.industry}
                      onChange={update("industry")}
                      className={`${inputClass} appearance-none pr-10 ${form.industry ? "" : "text-gray-500"}`}
                    >
                      <option value="" className="bg-[#101116]">Select industry</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i} className="bg-[#101116] text-white">{i}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-6.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="size" className="text-sm font-semibold">Company size</label>
                  <div className="relative">
                    <select
                      id="size"
                      required
                      value={form.size}
                      onChange={update("size")}
                      className={`${inputClass} appearance-none pr-10 ${form.size ? "" : "text-gray-500"}`}
                    >
                      <option value="" className="bg-[#101116]">Select size</option>
                      {SIZES.map((s) => (
                        <option key={s} value={s} className="bg-[#101116] text-white">{s} employees</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-6.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="text-sm font-semibold">Company address</label>
                <input id="address" value={form.address} onChange={update("address")} placeholder="Street, city, country" className={inputClass} />
              </div>
            </fieldset>

            {/* Admin details */}
            <fieldset className="space-y-5 border-t border-white/10 pt-8">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-400">Administrator</legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="text-sm font-semibold">Full name</label>
                  <input id="fullName" required autoComplete="name" value={form.fullName} onChange={update("fullName")} placeholder="Rahul Mehta" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-semibold">Work email</label>
                  <input id="email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} placeholder="you@company.com" className={inputClass} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="text-sm font-semibold">Password</label>
                  <div className="relative">
                    <input id="password" type={show ? "text" : "password"} required autoComplete="new-password" value={form.password} onChange={update("password")} className={`${inputClass} pr-10`} />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-2 top-4.5 rounded p-1 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="text-sm font-semibold">Confirm password</label>
                  <input id="confirm" type={show ? "text" : "password"} required autoComplete="new-password" value={form.confirm} onChange={update("confirm")} className={inputClass} />
                </div>
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Create admin account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/admin/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}