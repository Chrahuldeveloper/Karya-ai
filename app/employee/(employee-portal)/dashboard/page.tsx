"use client";

import { ArrowRight, Bell, Calendar, CheckCircle2, Clock, FileText, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

const stats = [
  { label: "Reports this week", value: "0", icon: FileText },
  { label: "Tasks completed", value: "1", icon: CheckCircle2 },
  { label: "Active projects", value: "2", icon: FolderKanban },
  { label: "Hours this week", value: "0h", icon: Clock },
];

const work = [
  { title: "Design onboarding screens", project: "Atlas Mobile App", priority: "High", due: "Oct 28", status: "In progress", progress: 60 },
  { title: "Accessibility audit of payments flow", project: "Atlas Mobile App", priority: "Urgent", due: "Oct 26", status: "Blocked", progress: 30 },
  { title: "Wireframe support queue dashboard", project: "Pulse Analytics", priority: "Medium", due: "Oct 31", status: "To do", progress: 0 },
  { title: "Interview support leads", project: "Pulse Analytics", priority: "Medium", due: "Oct 27", status: "In progress", progress: 75 },
];

const reports = [
  { title: "Onboarding screens — KYC step", meta: "Oct 25 · Atlas Mobile App · 6h 30m", status: "Reviewed" },
  { title: "Icon migration finished", meta: "Oct 25 · Atlas Mobile App · 1h 30m", status: "Submitted" },
  { title: "Accessibility audit blocked", meta: "Oct 24 · Atlas Mobile App · 3h", status: "Changes requested" },
  { title: "Support lead interviews", meta: "Oct 24 · Pulse Analytics · 4h", status: "Reviewed" },
];

const priorityStyle: Record<string, string> = {
  Medium: "bg-indigo-500/20 text-indigo-300",
  High: "bg-amber-500/20 text-amber-400",
  Urgent: "bg-red-500/20 text-red-400",
};

const statusStyle: Record<string, string> = {
  Blocked: "bg-red-500/20 text-red-400",
  "In progress": "bg-indigo-500/20 text-indigo-300",
  "To do": "bg-white/10 text-gray-300",
  Reviewed: "bg-emerald-500/20 text-emerald-400",
  Submitted: "bg-indigo-500/20 text-indigo-300",
  "Changes requested": "bg-amber-500/20 text-amber-400",
};

const card = "rounded-xl border border-white/10 bg-[#101116]";

export default function Home() {

  const [employee, setEmployee] = useState<{
    full_name: string;
    Company: string;
  } | null>(null);

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      
      const userId = localStorage.getItem("user_id");

      if (!userId) return;

      const supabase = createClient();

      const { data, error } = await supabase
        .from("users")
        .select("full_name, Company")
        .eq("user_id", userId)
        .single();

      if (!error && data) setEmployee(data);
    };

    fetchEmployee();

    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);


  const fullName = employee?.full_name ?? "Employee";
  
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hour = now?.getHours();

  const greeting =
    hour === undefined
      ? ""
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";

  const dateText = now
    ? now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400">
            {dateText} · {employee?.Company ?? "Loading company..."}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {greeting}, {fullName}
          </h1>         
           <p className="mt-1 text-sm text-gray-400">What are you working on today?</p>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
            {initials}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-4">
        <p className="flex items-center gap-3 text-sm font-medium text-white">
          <Clock className="h-4 w-4 text-indigo-300" />
          Your daily work report is pending.
        </p>
        <Link href={"/employee/submit-report"}>
          <button className=" cursor-pointer rounded-lg bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white">Submit Report</button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={`${card} p-5`}>
            <div className="flex items-center justify-between text-xs text-gray-400">
              {label}
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-indigo-500 text-sm font-semibold text-white">
          <FileText className="h-4 w-4" /> Submit Today&apos;s Report
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-semibold text-white">
          <FileText className="h-4 w-4" /> View My Reports
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-semibold text-white">
          <FolderKanban className="h-4 w-4" /> View My Projects
        </button>
      </div>

      <div className="space-y-5">
        <section className={card}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Today&apos;s Work</h2>
            <span className="text-xs font-medium text-indigo-400">View all</span>
          </div>
          <ul className="divide-y divide-white/10">
            {work.map((t) => (
              <li key={t.title} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{t.project}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {priorityStyle[t.priority] && (
                    <span className={`rounded-md px-2 py-0.5 font-medium ${priorityStyle[t.priority]}`}>{t.priority}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{t.due}</span>
                  <span className={`rounded-md px-2 py-0.5 font-medium ${statusStyle[t.status]}`}>{t.status}</span>
                  <div className="h-1.5 w-16 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${t.progress}%` }} />
                  </div>
                  <span className="w-8 text-right">{t.progress}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Recent Reports</h2>
            <span className="text-xs font-medium text-indigo-400">View all</span>
          </div>
          <ul className="divide-y divide-white/10">
            {reports.map((r) => (
              <li key={r.title} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.meta}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>{r.status}</span>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}