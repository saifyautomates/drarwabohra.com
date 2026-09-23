"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ErrorNote } from "./ui";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    const res = await api("/api/auth/login", "POST", { password });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Sign-in failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-line">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-emerald shadow-xs ring-2 ring-emerald/20">
            <img
              src="/images/dr-arwa-bohra.png"
              alt="Dr. Arwa Bohra"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-ink leading-tight">Dr. Arwa Bohra</h1>
            <p className="text-xs font-semibold text-emerald-dark">Clinical Admin Portal</p>
          </div>
        </div>
        <p className="text-sm text-smoke">
          Sign in to manage appointments, products, schedule and clinic settings.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="field-label">Password</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </label>
          <ErrorNote error={error} />
          <button type="submit" disabled={busy || !password} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
