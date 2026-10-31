"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Globe,
  BriefcaseBusiness,
  Users,
  MapPin,
  Mail,
  Phone,
  UserRound,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { createClient } from "@/supabase/client";

type AdminDetails = {
  id: number;
  company_name: string;
  website: string;
  industry: string;
  company_size: string;
  company_address: string;
  full_name: string;
  work_email: string;
  phone: string;
  roles: string[];
};

const card = "rounded-2xl border border-white/10 bg-[#101116]";

const input =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0c0d11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const fieldLabel = "text-sm font-medium text-gray-300";

const initialDetails: AdminDetails = {
  id: 0,
  company_name: "",
  website: "",
  industry: "",
  company_size: "",
  company_address: "",
  full_name: "",
  work_email: "",
  phone: "",
  roles: [],
};

export default function AdminSettings() {
  const supabase = createClient();

  const [details, setDetails] = useState<AdminDetails>(initialDetails);
  const [form, setForm] = useState<AdminDetails>(initialDetails);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const storedAdminId = localStorage.getItem("company_id");

      if (!storedAdminId) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const adminId = Number(storedAdminId);

      if (!Number.isFinite(adminId)) {
        throw new Error("Invalid admin session. Please log in again.");
      }

      const { data, error: fetchError } = await supabase
        .from("admin")
        .select(
          "id, company_name, website, industry, company_size, company_address, full_name, work_email, phone, roles"
        )
        .eq("id", adminId)
        .single();

      if (fetchError) throw fetchError;

      const record: AdminDetails = {
        id: data.id,
        company_name: data.company_name || "",
        website: data.website || "",
        industry: data.industry || "",
        company_size: data.company_size || "",
        company_address: data.company_address || "",
        full_name: data.full_name || "",
        work_email: data.work_email || "",
        phone: data.phone || "",
        roles: Array.isArray(data.roles) ? data.roles : [],
      };

      setDetails(record);
      setForm(record);
    } catch (err) {
      console.error("Failed to load admin settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load organization details."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  function updateField(
    field: keyof AdminDetails,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function cancelEditing() {
    setForm(details);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function saveChanges() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.company_name.trim()) {
        throw new Error("Organization name is required.");
      }

      if (!form.full_name.trim()) {
        throw new Error("Contact person's name is required.");
      }

      if (!form.work_email.trim()) {
        throw new Error("Work email is required.");
      }

      const { data, error: updateError } = await supabase
        .from("admin")
        .update({
          company_name: form.company_name.trim(),
          website: form.website.trim(),
          industry: form.industry.trim(),
          company_size: form.company_size,
          company_address: form.company_address.trim(),
          full_name: form.full_name.trim(),
          work_email: form.work_email.trim(),
          phone: form.phone.trim(),
        })
        .eq("id", details.id)
        .select(
          "id, company_name, website, industry, company_size, company_address, full_name, work_email, phone, roles"
        )
        .single();

      if (updateError) throw updateError;

      const updated: AdminDetails = {
        id: data.id,
        company_name: data.company_name || "",
        website: data.website || "",
        industry: data.industry || "",
        company_size: data.company_size || "",
        company_address: data.company_address || "",
        full_name: data.full_name || "",
        work_email: data.work_email || "",
        phone: data.phone || "",
        roles: Array.isArray(data.roles) ? data.roles : [],
      };

      setDetails(updated);
      setForm(updated);
      setEditing(false);
      setSuccess("Organization details updated successfully.");
    } catch (err) {
      console.error("Failed to save admin settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function displayValue(value?: string) {
    return value?.trim() || "Not provided";
  }

  function DetailItem({
    icon: Icon,
    label,
    value,
    href,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string;
    href?: string;
  }) {
    const shownValue = displayValue(value);

    return (
      <div className="flex min-w-0 gap-3 rounded-xl border border-white/6 bg-white/2 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10">
          <Icon className="h-4.5  w-4.5 text-indigo-300" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>

          {href && shownValue !== "Not provided" ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block wrap-break-word text-sm font-medium text-indigo-300 hover:text-indigo-200"
            >
              {shownValue}
            </a>
          ) : (
            <p className="mt-1 wrap-break-word text-sm font-medium text-gray-200">
              {shownValue}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-400">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-indigo-400" />
        Loading organization details...
      </div>
    );
  }

  if (error && !details.id) {
    return (
      <div className={`${card} mx-auto max-w-3xl p-6`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h2 className="font-semibold text-white">
              Unable to load settings
            </h2>
            <p className="mt-1 text-sm text-gray-400">{error}</p>

            <button
              onClick={() => void loadDetails()}
              className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            Organization management
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your organization and contact information.
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => {
              setForm(details);
              setEditing(true);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-400"
          >
            <Pencil className="h-4 w-4" />
            Edit details
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              onClick={() => void saveChanges()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Organization banner */}
      <section className={`${card} overflow-hidden`}>
        <div className="h-1 bg-linear-to-r from-indigo-500 via-violet-400 to-indigo-500" />

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
            <Building2 className="h-8 w-8 text-indigo-300" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
              Organization
            </p>

            {editing ? (
              <input
                aria-label="Organization name"
                value={form.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                placeholder="Organization name"
                className={`${input} mt-2 max-w-xl text-lg font-semibold`}
              />
            ) : (
              <h2 className="mt-1 wrap-break-word text-xl font-bold text-white sm:text-2xl">
                {displayValue(details.company_name)}
              </h2>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {details.industry && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                  {details.industry}
                </span>
              )}

              {details.company_size && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                  {details.company_size} employees
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Organization profile
          </div>
        </div>
      </section>

      <section className={card}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
            <Building2 className="h-4 w-4 text-indigo-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Organization details
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Basic information about your company
            </p>
          </div>
        </div>

        {editing ? (
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={fieldLabel}>Organization name *</label>
              <input
                value={form.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                className={input}
                placeholder="Enter organization name"
              />
            </div>

            <div>
              <label className={fieldLabel}>Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                className={input}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className={fieldLabel}>Industry</label>
              <input
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                className={input}
                placeholder="e.g. Technology"
              />
            </div>

            <div>
              <label className={fieldLabel}>Company size</label>
              <select
                value={form.company_size}
                onChange={(e) => updateField("company_size", e.target.value)}
                className={input}
              >
                <option value="" className="bg-[#101116]">
                  Select company size
                </option>
                {["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"].map(
                  (size) => (
                    <option key={size} value={size} className="bg-[#101116]">
                      {size} employees
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={fieldLabel}>Company address</label>
              <textarea
                rows={3}
                value={form.company_address}
                onChange={(e) =>
                  updateField("company_address", e.target.value)
                }
                className={`${input} resize-y`}
                placeholder="Enter company address"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <DetailItem
              icon={Globe}
              label="Website"
              value={details.website}
              href={
                details.website &&
                /^https?:\/\//i.test(details.website)
                  ? details.website
                  : undefined
              }
            />

            <DetailItem
              icon={BriefcaseBusiness}
              label="Industry"
              value={details.industry}
            />

            <DetailItem
              icon={Users}
              label="Company size"
              value={details.company_size}
            />

            <DetailItem
              icon={MapPin}
              label="Company address"
              value={details.company_address}
            />
          </div>
        )}
      </section>

      <section className={card}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
            <UserRound className="h-4 w-4 text-violet-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Contact details
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Administrator and primary contact information
            </p>
          </div>
        </div>

        {editing ? (
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={fieldLabel}>Full name *</label>
              <input
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                className={input}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className={fieldLabel}>Work email *</label>
              <input
                type="email"
                value={form.work_email}
                onChange={(e) => updateField("work_email", e.target.value)}
                className={input}
                placeholder="name@company.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={fieldLabel}>Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={input}
                placeholder="Enter phone number"
              />
              <p className="mt-2 text-xs text-gray-500">
                Include your country code if needed, e.g. +91.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <DetailItem
              icon={UserRound}
              label="Full name"
              value={details.full_name}
            />

            <DetailItem
              icon={Mail}
              label="Work email"
              value={details.work_email}
              href={
                details.work_email
                  ? `mailto:${details.work_email}`
                  : undefined
              }
            />

            <DetailItem
              icon={Phone}
              label="Phone number"
              value={details.phone}
              href={
                details.phone
                  ? `tel:${details.phone.replace(/[^\d+]/g, "")}`
                  : undefined
              }
            />
          </div>
        )}
      </section>

      <section className={card}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Account information
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Your assigned administrator roles
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="mb-3 text-xs font-medium text-gray-500">
            Assigned roles
          </p>

          <div className="flex flex-wrap gap-2">
            {details.roles.length > 0 ? (
              details.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/15 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {role}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No roles assigned</span>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500">
            Roles are displayed for reference and cannot be edited on this page.
          </p>
        </div>
      </section>

      {editing && (
        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#15161d]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            Remember to save your changes.
          </p>

          <div className="flex gap-2">
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 disabled:opacity-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              onClick={() => void saveChanges()}
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 sm:flex-none"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}