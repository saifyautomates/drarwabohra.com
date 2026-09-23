"use client";

import { useState } from "react";
import type { BookingStatus, ConsultMode } from "@/lib/data";
import { modeLabel } from "@/lib/data-client";

/* ------------------------------------------------------------------ */
/* Small shared admin UI primitives                                     */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-smoke">{hint}</span>}
    </label>
  );
}

export function SaveButton({
  saving,
  children,
}: {
  saving: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
      {saving ? "Saving…" : (children ?? "Save changes")}
    </button>
  );
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-gold-soft text-gold-dark",
  confirmed: "bg-emerald-soft text-emerald-dark",
  cancelled: "bg-cream text-smoke",
  visited: "bg-emerald text-white",
  "no-show": "bg-cream text-smoke",
};

const STATUS_TEXT: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  visited: "Visited",
  "no-show": "No-show",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`badge ${STATUS_STYLES[status]}`}>{STATUS_TEXT[status]}</span>
  );
}

export function ModeBadge({ mode }: { mode: ConsultMode }) {
  return <span className="badge badge-open">{modeLabel(mode)}</span>;
}

export function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {error}
    </p>
  );
}

export function SavedNote({ saved }: { saved: boolean }) {
  if (!saved) return null;
  return (
    <p className="rounded-xl border border-emerald/30 bg-emerald-soft px-4 py-3 text-sm font-medium text-emerald-dark">
      Saved.
    </p>
  );
}

/** POST/PUT JSON helper with { ok, error } convention. */
export async function api<T = unknown>(
  url: string,
  method: string,
  body?: unknown
): Promise<{ ok: boolean; error?: string; data?: T }> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    } & T;
    if (!res.ok) return { ok: false, error: data.error ?? `Request failed (${res.status})` };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export function useSaveForm<T>(url: string, method: "PUT" | "POST" = "PUT") {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(body: unknown): Promise<T | null> {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await api<T>(url, method, body);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Save failed.");
      return null;
    }
    setSaved(true);
    return (res.data as T) ?? null;
  }

  return { saving, error, saved, setError, save };
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="rule-gold mb-3" />
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-smoke">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
