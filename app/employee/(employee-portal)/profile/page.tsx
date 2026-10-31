"use client";

import { Camera, Lock, Pencil, Save, X, Loader2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

type Employee = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  Company: string | null;
  user_name: string | null;
  role: string | null;
  phone?: string | null;
  about?: string | null;
  department?: string | null;
  reporting_manager?: string | null;
  date_joined?: string | null;
};

type PersonalDetails = {
  full_name: string;
  phone: string;
  about: string;
};

export default function MyProfile() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [personal, setPersonal] = useState<PersonalDetails>({
    full_name: "",
    phone: "",
    about: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const userId = localStorage.getItem("user_id");

        if (!userId) {
          setError("Your login session was not found. Please log in again.");
          return;
        }

        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (fetchError) throw fetchError;

        if (cancelled || !data) return;

        const profile = data as Employee;

        setEmployee(profile);

        setPersonal({
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          about: profile.about ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);

        if (!cancelled) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function savePersonalDetails() {
    if (!employee) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          full_name: personal.full_name.trim(),
          phone: personal.phone.trim(),
          about: personal.about.trim(),
        })
        .eq("user_id", employee.user_id)
        .select()
        .single();

      if (updateError) throw updateError;

      setEmployee((previous) =>
        previous
          ? {
              ...previous,
              full_name: data.full_name,
              phone: data.phone,
              about: data.about,
            }
          : previous
      );

      setPersonal({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        about: data.about ?? "",
      });

      setEditing(false);
      setSuccess("Your personal details have been updated.");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(
        "Could not save your changes. Check your Supabase permissions and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setPersonal({
      full_name: employee?.full_name ?? "",
      phone: employee?.phone ?? "",
      about: employee?.about ?? "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  }

  const fullName = employee?.full_name || employee?.user_name || "Employee";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const personalFields = [
    { label: "Full name", key: "full_name" as const },
    { label: "Phone", key: "phone" as const },
    { label: "About", key: "about" as const },
  ];

  const employment = [
    { label: "Work email", value: employee?.email || "Not provided" },
    { label: "Employee ID", value: employee?.user_id || "Not provided" },
    { label: "Job title", value: employee?.role || "Not provided" },
    {
      label: "Department",
      value: employee?.department || "Not provided",
    },
    {
      label: "Reporting manager",
      value: employee?.reporting_manager || "Not provided",
    },
    {
      label: "Date joined",
      value: employee?.date_joined
        ? new Date(employee.date_joined).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Not provided",
    },
    { label: "Organization", value: employee?.Company || "Not provided" },
  ];

  const card =
    "overflow-hidden rounded-xl border border-white/10 bg-[#101116]";

  if (loading) {
    return (
      <div className="mx-auto flex min-h-64 w-full max-w-3xl items-center justify-center gap-3 text-sm text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        Loading your profile...
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm font-medium text-white underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-8 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          View and manage your personal information.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <section className={`${card} p-4 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-full bg-indigo-500/20 text-2xl font-bold text-indigo-300 sm:h-24 sm:w-24">
            {initials || <UserRound className="h-9 w-9" />}

            <span
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0a0b0e] text-gray-300"
              title="Profile photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="wrap-break-word text-lg font-bold text-white sm:text-xl">
              {fullName}
            </h2>

            <p className="mt-1 break-all text-sm text-gray-400">
              {employee?.email || "No email provided"}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              {[employee?.role, employee?.Company].filter(Boolean).join(" · ") ||
                "Employee"}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Employee ID: {employee?.user_id || "Not provided"}
            </p>
          </div>
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="text-sm font-semibold text-white">
            Personal details
          </h2>

          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/5 sm:self-auto"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit details
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>

              <button
                type="button"
                onClick={savePersonalDetails}
                disabled={saving || !personal.full_name.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <dl className="divide-y divide-white/10">
          {personalFields.map((field) => (
            <div
              key={field.key}
              className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4 sm:px-5"
            >
              <dt className="text-xs font-medium text-gray-400 sm:pt-2 sm:text-sm">
                {field.label}
              </dt>

              <dd className="min-w-0 text-sm text-white">
                {editing ? (
                  field.key === "about" ? (
                    <textarea
                      value={personal[field.key]}
                      onChange={(event) =>
                        setPersonal((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Tell us a little about yourself"
                      className="w-full resize-y rounded-lg border border-white/10 bg-[#0a0b0e] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500"
                    />
                  ) : (
                    <input
                      type={field.key === "phone" ? "tel" : "text"}
                      value={personal[field.key]}
                      onChange={(event) =>
                        setPersonal((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }))
                      }
                      placeholder={
                        field.key === "phone"
                          ? "Enter your phone number"
                          : "Enter your full name"
                      }
                      className="w-full rounded-lg border border-white/10 bg-[#0a0b0e] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500"
                    />
                  )
                ) : (
                  <span className="block wrap-break-word leading-6">
                    {personal[field.key] || "Not provided"}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {editing && (
          <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-gray-500 sm:px-5">
            Changes will be saved to your employee profile.
          </p>
        )}
      </section>

      <section className={card}>
        <div className="border-b border-white/10 px-4 py-4 sm:px-5">
          <h2 className="text-sm font-semibold text-white">
            Employment details
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Information managed by your administrator.
          </p>
        </div>

        <dl className="divide-y divide-white/10">
          {employment.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-5"
            >
              <dt className="text-xs font-medium text-gray-400 sm:text-sm">
                {field.label}
              </dt>

              <dd className="min-w-0 wrap-break-word text-sm leading-6 text-white">
                {field.value}
              </dd>

              <Lock
                className="hidden h-3.5 w-3.5 text-gray-500 sm:block"
                aria-label="Read only"
              />
            </div>
          ))}
        </dl>

        <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-gray-500 sm:px-5">
          Employment details are managed by your administrator. Contact your
          administrator to request changes.
        </p>
      </section>
    </div>
  );
}