export default function AdminLogin() {
  const input = "mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">N</div>
          <span className="text-xl font-bold tracking-widest">Karaya Ai</span>
          <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">Admin</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#101116]">
          <div className="border-b border-white/10 px-6 py-5">
            <h1 className="text-lg font-bold">Admin sign in</h1>
            <p className="mt-1 text-sm text-gray-400">Access the administration console.</p>
          </div>
          <div className="space-y-5 p-6">
            <div>
              <label className="text-sm font-semibold">Work email</label>
              <input type="email" placeholder="admin@company.com" className={input} />
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <input type="password" className={input} />
            </div>
            <button className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">Sign in</button>
          </div>
        </div>
      </div>
    </main>
  );
}