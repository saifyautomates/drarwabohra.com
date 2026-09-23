"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus, ConsultMode } from "@/lib/data";
import {
  formatDateLabel,
  formatTime12,
  modeLabel,
} from "@/lib/data-client";
import { api, ErrorNote, Field, ModeBadge, StatusBadge } from "@/components/admin/ui";

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "visited",
  "no-show",
];

const MODES: ConsultMode[] = ["in-clinic", "video", "audio"];

export default function AppointmentsClient({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | BookingStatus>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reschedule modal state
  const [resched, setResched] = useState<Booking | null>(null);
  const [rsMode, setRsMode] = useState<ConsultMode>("in-clinic");
  const [rsDate, setRsDate] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rsTime, setRsTime] = useState("");
  const [rsSaving, setRsSaving] = useState(false);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (dateFilter && b.date !== dateFilter) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      return true;
    });
  }, [bookings, dateFilter, statusFilter]);

  async function update(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    const res = await api<{ booking: Booking }>(`/api/admin/bookings/${id}`, "PUT", body);
    setBusyId(null);
    if (!res.ok || !res.data?.booking) {
      setError(res.error ?? "Update failed.");
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? res.data!.booking : b)));
    router.refresh();
  }

  const setStatus = (id: string, status: BookingStatus) =>
    update(id, { status });

  async function remove(id: string) {
    if (
      !window.confirm(
        `Permanently delete booking ${id}? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusyId(id);
    setError(null);
    const res = await api<{ ok: boolean }>(`/api/admin/bookings/${id}`, "DELETE");
    setBusyId(null);
    if (!res.ok) {
      setError(res.error ?? "Failed to delete booking.");
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    router.refresh();
  }

  function openReschedule(b: Booking) {
    setResched(b);
    setRsMode(b.mode);
    setRsDate(b.date);
    setRsTime("");
    setSlots([]);
  }

  async function loadSlots() {
    if (!resched || !rsDate) return;
    setSlotsLoading(true);
    const res = await api<{ slots: { time: string; available: boolean }[] }>(
      `/api/admin/availability?date=${rsDate}&mode=${rsMode}`,
      "GET"
    );
    setSlotsLoading(false);
    if (res.ok && res.data) setSlots(res.data.slots);
    else setError(res.error ?? "Could not load slots.");
  }

  async function confirmReschedule() {
    if (!resched || !rsTime) return;
    setRsSaving(true);
    setError(null);
    const res = await api<{ booking: Booking }>(
      `/api/admin/bookings/${resched.id}`,
      "PUT",
      { reschedule: { mode: rsMode, date: rsDate, time: rsTime } }
    );
    setRsSaving(false);
    if (!res.ok || !res.data?.booking) {
      setError(res.error ?? "Reschedule failed.");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === resched.id ? res.data!.booking : b))
    );
    setResched(null);
    router.refresh();
  }

  return (
    <div>
      {/* Filters */}
      <div className="card mb-5 flex flex-wrap items-end gap-3 p-4">
        <Field label="Date">
          <input
            type="date"
            className="input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            className="input"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | BookingStatus)
            }
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "no-show" ? "No-show" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        {(dateFilter || statusFilter) && (
          <button
            className="btn-outline"
            onClick={() => {
              setDateFilter("");
              setStatusFilter("");
            }}
          >
            Clear filters
          </button>
        )}
        <p className="ml-auto text-xs text-smoke">{filtered.length} shown</p>
      </div>

      <div className="mb-4">
        <ErrorNote error={error} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-sm text-smoke">
          No bookings match. New bookings will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs uppercase tracking-wide text-smoke">
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr key={b.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{b.id}</p>
                    <p className="text-xs text-smoke">Token {b.token}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-xs text-smoke">
                      {b.mobile} · {b.age}y
                      {b.gender ? `, ${b.gender}` : ""}
                    </p>
                    {b.reasons.length > 0 && (
                      <p className="mt-0.5 text-xs text-smoke">
                        {b.reasons.join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {formatDateLabel(b.date)}
                    </p>
                    <p className="text-xs text-smoke">{formatTime12(b.time)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ModeBadge mode={b.mode} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {b.status === "pending" && (
                        <ActionBtn
                          busy={busyId === b.id}
                          onClick={() => setStatus(b.id, "confirmed")}
                          tone="go"
                        >
                          Confirm
                        </ActionBtn>
                      )}
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <>
                          <ActionBtn
                            busy={busyId === b.id}
                            onClick={() => openReschedule(b)}
                          >
                            Reschedule
                          </ActionBtn>
                          <ActionBtn
                            busy={busyId === b.id}
                            onClick={() => setStatus(b.id, "visited")}
                          >
                            Visited
                          </ActionBtn>
                          <ActionBtn
                            busy={busyId === b.id}
                            onClick={() => setStatus(b.id, "no-show")}
                          >
                            No-show
                          </ActionBtn>
                          <ActionBtn
                            busy={busyId === b.id}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Cancel booking ${b.id}? This cannot be undone.`
                                )
                              )
                                setStatus(b.id, "cancelled");
                            }}
                          >
                            Cancel
                          </ActionBtn>
                        </>
                      )}
                      {b.status !== "pending" && b.status !== "confirmed" && (
                        <ActionBtn
                          busy={busyId === b.id}
                          onClick={() => setStatus(b.id, "pending")}
                          tone="go"
                        >
                          Reopen
                        </ActionBtn>
                      )}
                      <ActionBtn
                        busy={busyId === b.id}
                        onClick={() => remove(b.id)}
                        tone="danger"
                      >
                        Delete
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reschedule modal */}
      {resched && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="card w-full max-w-md p-6">
            <h3 className="font-display text-xl text-ink">
              Reschedule {resched.id}
            </h3>
            <p className="mt-1 text-sm text-smoke">
              Currently {formatDateLabel(resched.date)}, {formatTime12(resched.time)} —{" "}
              {modeLabel(resched.mode)}
            </p>
            <div className="mt-5 space-y-4">
              <Field label="Consult mode">
                <select
                  className="input"
                  value={rsMode}
                  onChange={(e) => setRsMode(e.target.value as ConsultMode)}
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {modeLabel(m)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="New date">
                <input
                  type="date"
                  className="input"
                  value={rsDate}
                  onChange={(e) => setRsDate(e.target.value)}
                />
              </Field>
              <button className="btn-outline w-full" onClick={loadSlots} disabled={slotsLoading}>
                {slotsLoading ? "Loading…" : "Show available slots"}
              </button>
              {slots.length > 0 && (
                <div>
                  <span className="field-label">New time</span>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setRsTime(s.time)}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                          rsTime === s.time
                            ? "border-emerald bg-emerald text-white"
                            : s.available
                              ? "border-line text-ink hover:border-emerald"
                              : "cursor-not-allowed border-line bg-cream text-smoke/50"
                        }`}
                      >
                        {formatTime12(s.time)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slots.length > 0 && !slots.some((s) => s.available) && (
                <p className="text-sm text-smoke">
                  No open slots that day. Try another date or mode.
                </p>
              )}
              <ErrorNote error={error} />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="btn-outline flex-1"
                onClick={() => {
                  setResched(null);
                  setError(null);
                }}
              >
                Close
              </button>
              <button
                className="btn-primary flex-1 disabled:opacity-60"
                disabled={!rsTime || rsSaving}
                onClick={confirmReschedule}
              >
                {rsSaving ? "Moving…" : "Confirm reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  busy,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  tone?: "go" | "danger";
}) {
  const toneCls =
    tone === "go"
      ? "border-emerald/40 text-emerald-dark hover:bg-emerald-soft"
      : tone === "danger"
        ? "border-red-200 text-red-700 hover:bg-red-50"
        : "border-line text-smoke hover:border-ink hover:text-ink";
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${toneCls}`}
    >
      {children}
    </button>
  );
}
