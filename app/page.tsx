"use client";

import { useEffect, useRef } from "react";

const features = [
  { glyph: "◷", title: "Attendance & shifts", text: "Clock-ins, rosters and swaps in one live view. Karya flags gaps before they become overtime.", span: "md:col-span-2" },
  { glyph: "₹", title: "Payroll that closes itself", text: "Salaries, tax and payslips calculated and ready to approve in minutes.", span: "" },
  { glyph: "✦", title: "Leave without the chase", text: "Requests, balances and approvals handled in a single tap from any device.", span: "" },
  { glyph: "◎", title: "Performance & goals", text: "Set goals, collect feedback and run reviews without a single spreadsheet.", span: "" },
  { glyph: "⬡", title: "Onboarding in a day", text: "Offer letter to first login with documents, equipment and training checklists automated.", span: "md:col-span-2" },
];

const stats = [
  { n: "98%", l: "payroll runs approved on first review" },
  { n: "6 hrs", l: "saved per manager, every week" },
  { n: "40+", l: "policies Karya enforces automatically" },
  { n: "2 min", l: "to approve a full team's leave" },
];

const steps = [
  { t: "Bring your team in", d: "Upload a sheet or connect your HR tools. Everyone gets a profile in minutes." },
  { t: "Set your rules once", d: "Shifts, leave types, pay cycles and approvals. Karya remembers every one." },
  { t: "Let Karya run the routine", d: "Daily tasks happen on their own. You only see what needs a decision." },
];

const people = [
  { n: "Ananya Rao", s: "Present", c: "from-violet-400 to-fuchsia-500" },
  { n: "Rohit Verma", s: "Remote", c: "from-indigo-400 to-violet-600" },
  { n: "Meera Iyer", s: "On leave", c: "from-purple-400 to-violet-700" },
  { n: "Karthik Reddy", s: "Present", c: "from-fuchsia-400 to-purple-600" },
];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const mock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-speed],[data-x]"));
    const state = els.map(() => ({ x: 0, y: 0 }));
    let tilt = 16;
    let raf = 0;

    const tick = () => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const max = document.body.scrollHeight - vh;

      els.forEach((el, i) => {
        const p = el.parentElement!.getBoundingClientRect();
        const d = p.top + p.height / 2 - vh / 2;
        const ty = reduce ? 0 : -d * parseFloat(el.dataset.speed || "0");
        const tx = reduce ? 0 : d * parseFloat(el.dataset.x || "0");
        const s = state[i];
        s.y += (ty - s.y) * 0.09;
        s.x += (tx - s.x) * 0.09;
        el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      });

      if (mock.current) {
        const target = reduce ? 0 : Math.max(0, 16 - sy * 0.028);
        tilt += (target - tilt) * 0.09;
        mock.current.style.transform = `perspective(1600px) rotateX(${tilt.toFixed(2)}deg) scale(${(0.96 + (16 - tilt) * 0.0025).toFixed(3)})`;
      }

      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? sy / max : 0})`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      html.style.scrollBehavior = prevBehavior;
    };
  }, []);

  return (
    <div ref={root} className="relative min-h-screen overflow-x-clip bg-black font-sans text-zinc-200 antialiased selection:bg-violet-500/40 selection:text-white">
      <div ref={bar} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-violet-600 via-fuchsia-400 to-violet-300" />

      <header className="fixed inset-x-0 top-0 z-50 px-4">
        <nav className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-xl">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 text-sm shadow-[0_0_20px_rgba(139,92,246,0.7)]">क</span>
            Karya AI
          </a>
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#ai" className="transition hover:text-white">Karya Assistant</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
          </div>
          <a  className=" cursor-pointer rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(124,58,237,0.5)] transition hover:shadow-[0_0_36px_rgba(139,92,246,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            Get Started
          </a>
        </nav>
      </header>

      <section id="top" className="relative isolate flex min-h-screen flex-col items-center overflow-hidden px-6 pt-36">
        <div data-speed="0.35" className="pointer-events-none absolute -left-40 top-10 -z-10 h-[34rem] w-[34rem] rounded-full bg-violet-700/40 blur-[140px]" />
        <div data-speed="0.18" className="pointer-events-none absolute -right-32 top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/25 blur-[140px]" />
        <div data-speed="-0.12" className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-[26rem] w-[40rem] rounded-full bg-indigo-700/30 blur-[150px]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-200 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          Employee management, run by AI
        </div>

        <h1 className="max-w-4xl text-center text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          Run every team, shift and payday{" "}
          <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-fuchsia-400 bg-clip-text text-transparent">
            from one calm place.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-center text-base text-zinc-400 sm:text-lg">
          Karya AI handles attendance, leave, payroll and reviews automatically, so your managers spend time on people instead of paperwork.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a href="#cta" className="rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-7 py-3.5 font-medium text-white shadow-[0_0_40px_rgba(139,92,246,0.55)] transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            Start free for 14 days
          </a>
          <a href="#features" className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-zinc-200 backdrop-blur transition hover:border-violet-400/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            See what it does
          </a>
        </div>

        <div className="relative mt-20 w-full max-w-5xl pb-24">
          <div className="absolute inset-x-10 -top-6 h-40 rounded-full bg-violet-600/40 blur-[90px]" />
          <div ref={mock} className="relative origin-top overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-b from-zinc-900/90 to-black p-3 shadow-[0_40px_120px_-20px_rgba(124,58,237,0.55)] will-change-transform">
            <div className="flex gap-3 rounded-2xl bg-black/70 p-4">
              <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-white/5 pr-4 text-sm sm:flex">
                {["Overview", "People", "Attendance", "Payroll", "Leave", "Reviews"].map((t, i) => (
                  <div key={t} className={`rounded-lg px-3 py-2 ${i === 0 ? "bg-violet-500/15 text-violet-200" : "text-zinc-500"}`}>{t}</div>
                ))}
              </aside>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[["Headcount", "248"], ["Present today", "231"], ["Open leave", "12"], ["Next payroll", "3 days"]].map(([l, v]) => (
                    <div key={l} className="rounded-xl border border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
                      <p className="text-xs text-zinc-500">{l}</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  <div className="rounded-xl border border-white/5 p-4 md:col-span-3">
                    <p className="mb-4 text-xs text-zinc-500">Attendance this week</p>
                    <div className="flex h-32 items-end gap-3">
                      {[62, 78, 70, 92, 85, 40, 30].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-700 to-violet-300" style={{ height: `${h}%`, opacity: 0.45 + h / 180 }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/5 p-4 md:col-span-2">
                    <p className="mb-2 text-xs text-zinc-500">Team right now</p>
                    {people.map((p) => (
                      <div key={p.n} className="flex items-center gap-3 text-sm">
                        <span className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${p.c} text-xs font-semibold text-white`}>{p.n[0]}</span>
                        <span className="flex-1 truncate text-zinc-300">{p.n}</span>
                        <span className="text-xs text-zinc-500">{p.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.n} className="bg-black p-8">
              <p className="bg-gradient-to-b from-white to-violet-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">{s.n}</p>
              <p className="mt-3 text-sm text-zinc-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
          Everything your people team does, handled.
        </h2>
        <p className="mt-4 max-w-xl text-zinc-400">One platform replaces the spreadsheets, chat threads and reminders you use today.</p>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black p-8 transition duration-500 hover:border-violet-400/40 ${f.span}`}>
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/0 blur-3xl transition duration-500 group-hover:bg-violet-600/30" />
              <div className="relative">
                <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 text-xl text-white shadow-[0_0_30px_rgba(124,58,237,0.5)]">{f.glyph}</div>
                <h3 className="text-xl font-medium text-white">{f.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="relative isolate my-16 min-h-[110vh] scroll-mt-10 overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-black via-violet-950/60 to-black" />
        <div data-x="0.35" className="pointer-events-none absolute left-0 top-1/2 -z-10 -translate-y-1/2 whitespace-nowrap text-[26vw] font-bold leading-none tracking-tighter text-violet-500/[0.07]">
          KARYA KARYA
        </div>
        <div data-speed="0.25" className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[130px]" />

        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-32 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              Ask Karya instead of digging through reports.
            </h2>
            <p className="mt-5 max-w-md text-zinc-400">
              Type a question in plain language. Karya reads your attendance, payroll and leave data and answers with numbers, not guesses.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-300">
              {["Who is absent more than twice this month?", "What will overtime cost us next week?", "Draft a warning letter for repeated late arrivals."].map((q) => (
                <li key={q} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur">
                  <span className="text-violet-400">✦</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[34rem]">
            <div data-speed="0.12" className="absolute inset-x-0 top-8 mx-auto w-full max-w-md rounded-3xl border border-violet-400/25 bg-black/70 p-6 shadow-[0_30px_100px_-20px_rgba(124,58,237,0.7)] backdrop-blur-xl">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm text-white">
                Which team has the highest overtime this month?
              </p>
              <div className="mt-4 max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-300">
                Customer Support is at 186 overtime hours, 34% above last month. Most of it comes from the night shift on weekends. Want me to propose a new roster?
              </div>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200">Propose roster</span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">Show breakdown</span>
              </div>
            </div>

            <div data-speed="0.38" className="absolute -left-4 bottom-6 w-56 rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-2xl backdrop-blur-xl sm:-left-10">
              <p className="text-xs text-zinc-500">Leave approved</p>
              <p className="mt-1 text-sm text-white">Ananya Rao, 3 days</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" /></div>
            </div>

            <div data-speed="-0.1" className="absolute -right-2 top-0 w-48 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/30 to-black p-4 shadow-2xl backdrop-blur-xl sm:-right-8">
              <p className="text-xs text-violet-200">Payroll draft ready</p>
              <p className="mt-1 text-2xl font-semibold text-white">₹48.2L</p>
              <p className="text-xs text-zinc-400">248 employees</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">Set up in an afternoon.</h2>
        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent md:block" />
          {steps.map((s, i) => (
            <div key={s.t} className="relative">
              <div className="relative z-10 mb-6 grid h-14 w-14 place-items-center rounded-full border border-violet-400/40 bg-black text-lg font-semibold text-violet-200 shadow-[0_0_30px_rgba(124,58,237,0.45)]">{i + 1}</div>
              <h3 className="text-xl font-medium text-white">{s.t}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="relative isolate mx-6 my-24 scroll-mt-24 overflow-hidden rounded-[2.5rem] border border-violet-400/25 px-6 py-28 text-center md:mx-auto md:max-w-6xl">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-700/50 via-black to-black" />
        <div data-speed="0.2" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-violet-500/40 blur-[110px]" />
        <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
          Give your team time back.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-zinc-300">See Karya AI run on your own data in a 30-minute walkthrough.</p>
        <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder="Work email" aria-label="Work email" className="flex-1 rounded-full border border-white/15 bg-black/60 px-5 py-3.5 text-white placeholder-zinc-500 backdrop-blur focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          <button type="submit" className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 py-3.5 font-medium text-white shadow-[0_0_40px_rgba(139,92,246,0.55)] transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            Book a demo
          </button>
        </form>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-10 text-sm text-zinc-500 sm:flex-row">
        <span className="flex items-center gap-2 text-zinc-300">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-violet-400 to-violet-700 text-xs text-white">क</span>
          Karya AI
        </span>
        <span>© 2026 Karya AI. All rights reserved.</span>
      </footer>
    </div>
  );
}