"use client";

import {  useState , useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff , ChevronDown} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useRouter } from 'next/navigation';

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";

export default function RegisterPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    Company:"",
    company_id : "",
    password: "",
    confirm: "",
    user_id : "",
    user_name : ""
  });

  const [companies, setCompanies] = useState<{ id: string; company_name: string }[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("admin")
        .select("id, company_name");

      if (error) {
        setError("Failed to load companies.");
        return;
      }

      setCompanies(data ?? []);
    };

    fetchCompanies();
  }, []);

  const [show, setShow] = useState(false);
  
  const [error, setError] = useState<string>("");

  const update =
  (field: keyof typeof form) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };


const generateUserId = () => {
  const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
  return `K-${uniqueNumber}`;
};

const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      return setError("Password needs 8+ characters, one uppercase letter and one number.");
    }

    if (form.password !== form.confirm) return setError("Passwords don't match.");

    try {
      const supabase = createClient()

      const selectedCompany = companies.find(
        (company) => String(company.id) === String(form.company_id)
      );

      if (!selectedCompany) {
        setError("Please select a valid company.");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            full_name: form.fullName,
            email: form.email,
            Company: selectedCompany.company_name,
            company_id: selectedCompany.id,
            user_name: form.user_name,
            password: form.password,
            user_id: generateUserId(),
          },
        ])
        .select();

      if (error) {
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
      sessionStorage.setItem("user_id", data[0].user_id);
      sessionStorage.setItem("full_name", data[0].full_name);
      sessionStorage.setItem("company", data[0].Company);
      sessionStorage.setItem("company_id", String(data[0].company_id));

      router.push("/employee/dashboard");
    }

    } catch (error) {
      console.log(error)
    }

  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">K</div>
          <span className="text-xl font-bold tracking-widest">KARYA</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#101116]">
          <div className="border-b border-white/10 px-6 py-5">
            <h1 className="text-lg font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-gray-400">Use your work email to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <label htmlFor="fullName" className="text-sm font-semibold">Full name</label>
              <input id="fullName" required autoComplete="name" value={form.fullName} onChange={update("fullName")} placeholder="Aisha Verma" className={inputClass} />
            </div>

            <div>
              <label htmlFor="user Name" className="text-sm font-semibold">User name</label>
              <input id="user Name" required autoComplete="name" value={form.user_name} onChange={update("user_name")} placeholder="Aisha Verma" className={inputClass} />
            </div>

            <div>
              <label htmlFor="company" className="text-sm font-semibold">
                Company
              </label>

              <div className="relative">
                <select
                  id="company"
                  required
                  value={form.company_id}
                  onChange={update("company_id")}
                  className={`${inputClass} appearance-none pr-10 ${
                    form.company_id ? "" : "text-gray-500"
                  }`}
                >
                  <option value="" className="bg-[#101116]">
                    Select company
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

                <ChevronDown className="pointer-events-none absolute right-3 top-6.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm font-semibold">Work email</label>
              <input id="email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} placeholder="you@company.com" className={inputClass} />
            </div>

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

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Create account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}