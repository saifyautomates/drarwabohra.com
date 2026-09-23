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
        <div className="rule-gold mb-4" />
        <h1 className="font-display text-2xl text-ink">Clinic Admin</h1>
        <p className="mt-1.5 text-sm text-smoke">
          Sign in to manage appointments, schedule and settings.
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
