"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus, ConsultMode } from "@/lib/data";
import {
  formatDateLabel,
  formatTime12,
  waLink,
} from "@/lib/data-client";
import { api, ErrorNote, Field, ModeBadge, StatusBadge } from "@/components/admin/ui";

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "visited",
  "no-show",
];

export default function AppointmentsClient({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | BookingStatus>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedMobile, setCopiedMobile] = useState<string | null>(null);

  // Reschedule modal state
  const [resched, setResched] = useState<Booking | null>(null);
  const [rsMode, setRsMode] = useState<ConsultMode>("in-clinic");
  const [rsDate, setRsDate] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rsTime, setRsTime] = useState("");
  const [rsSaving, setRsSaving] = useState(false);

  // Status counts for filter chips
  const counts = useMemo(() => {
    const res: Record<string, number> = { all: bookings.length };
    for (const s of STATUSES) {
      res[s] = bookings.filter((b) => b.status === s).length;
    }
    return res;
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (dateFilter && b.date !== dateFilter) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      if (q) {
        const matchName = b.name.toLowerCase().includes(q);
        const matchMobile = b.mobile.includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchToken = b.token.toLowerCase().includes(q);
        const matchReason = b.reasons.some((r) => r.toLowerCase().includes(q));
        const matchComplaint = (b.complaint || "").toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchId && !matchToken && !matchReason && !matchComplaint) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, dateFilter, statusFilter, searchQuery]);

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
        `Permanently delete booking ${id}? This will remove it completely from the database.`
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

  function copyPhone(mobile: string) {
    navigator.clipboard.writeText(mobile);
    setCopiedMobile(mobile);
    setTimeout(() => setCopiedMobile(null), 2000);
  }

  function exportCSV() {
    if (bookings.length === 0) return;
    const headers = [
      "Booking ID",
      "Token",
      "Patient Name",
      "Mobile",
      "Age",
      "Gender",
      "Consult Date",
      "Time",
      "Mode",
      "Primary Concerns",
      "Patient Complaint",
      "Status",
      "Booked At",
    ];
    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.token}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.mobile}"`,
      b.age,
      `"${b.gender}"`,
      `"${b.date}"`,
      `"${b.time}"`,
      `"${b.mode}"`,
      `"${b.reasons.join(", ")}"`,
      `"${(b.complaint || "").replace(/"/g, '""')}"`,
      `"${b.status}"`,
      `"${b.createdAt}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `dr-arwa-appointments-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Appointments Manager
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-smoke">
            Filter, search, reschedule, call, or manage patient consultations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-xs hover:border-emerald hover:text-emerald-dark transition-all"
            title="Download CSV for Excel / Google Sheets"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            statusFilter === ""
              ? "bg-emerald text-white shadow-xs"
              : "bg-white text-smoke border border-line hover:text-ink"
          }`}
        >
          All ({counts.all || 0})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              statusFilter === s
                ? "bg-emerald text-white shadow-xs"
                : "bg-white text-smoke border border-line hover:text-ink"
            }`}
          >
            {s === "no-show" ? "No-show" : s[0].toUpperCase() + s.slice(1)}{" "}
            <span className="opacity-80">({counts[s] || 0})</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search patient name, phone, booking ID, complaint…"
            className="input !text-xs !py-2 pl-9 pr-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-smoke text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-smoke hover:text-ink text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <input
            type="date"
            className="input !text-xs !py-2"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by appointment date"
          />
        </div>

        {(searchQuery || dateFilter || statusFilter) && (
          <button
            className="btn-outline !py-2 !px-3 text-xs"
            onClick={() => {
              setSearchQuery("");
              setDateFilter("");
              setStatusFilter("");
            }}
          >
            Reset
          </button>
        )}

        <p className="ml-auto text-xs text-smoke font-medium">
          Showing <strong>{filtered.length}</strong> of {bookings.length}
        </p>
      </div>

      <ErrorNote error={error} />

      {/* Bookings Table */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-sm text-smoke">
          <p className="font-display text-lg text-ink">No bookings match your criteria</p>
          <p className="mt-1 text-xs">Try clearing your search query or date filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs uppercase tracking-wide text-smoke">
                <th className="px-4 py-3 font-semibold">Booking ID</th>
                <th className="px-4 py-3 font-semibold">Patient &amp; Contact</th>
                <th className="px-4 py-3 font-semibold">Scheduled Slot</th>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr key={b.id} className="align-top hover:bg-cream/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink font-mono text-xs">{b.id}</p>
                    <p className="text-[11px] text-smoke mt-0.5">Token: <span className="font-mono font-semibold">{b.token}</span></p>
                    <span className="mt-1.5 inline-block text-[10px] text-smoke">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-[280px]">
                    <p className="font-bold text-ink text-sm">{b.name}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-smoke">
                      <button
                        type="button"
                        onClick={() => copyPhone(b.mobile)}
                        className="font-mono hover:text-emerald-dark font-medium inline-flex items-center gap-1"
                        title="Click to copy number"
                      >
                        <span>{b.mobile}</span>
                        <span className="text-[10px] opacity-70">
                          {copiedMobile === b.mobile ? "✓ Copied" : "📋"}
                        </span>
                      </button>
                      <span>·</span>
                      <span>{b.age}y</span>
                      {b.gender ? <span>· {b.gender}</span> : null}
                    </div>

                    {b.reasons.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {b.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-semibold text-emerald-dark border border-line"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {b.complaint && (
                      <p className="mt-1 line-clamp-2 text-xs text-smoke/90 italic">
                        &quot;{b.complaint}&quot;
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">
                      {formatDateLabel(b.date)}
                    </p>
                    <p className="text-xs text-smoke font-medium">
                      {formatTime12(b.time)}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <ModeBadge mode={b.mode} />
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {/* One-click WhatsApp message button */}
                      <a
                        href={waLink(
                          b.mobile,
                          b.status === "confirmed"
                            ? `Hello ${b.name}, confirming your appointment with Dr. Arwa Bohra scheduled on ${formatDateLabel(b.date)} at ${formatTime12(b.time)}. Please ensure your phone is reachable.`
                            : `Hello ${b.name}, this is Dr. Arwa Bohra's clinic regarding your consultation booking (${b.id}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-emerald-soft px-2.5 py-1 text-xs font-bold text-emerald-dark hover:bg-emerald hover:text-white transition-colors"
                        title="Chat with Patient on WhatsApp"
                      >
                        💬 WhatsApp
                      </a>

                      {/* Direct phone call button */}
                      <a
                        href={`tel:+91${b.mobile}`}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-smoke hover:border-ink hover:text-ink transition-colors"
                        title="Call Patient"
                      >
                        📞 Call
                      </a>

                      {/* Status Lifecycle Actions */}
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
                                  `Cancel booking ${b.id}? This will free the slot for other patients.`
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

                      {/* Permanent Delete Action */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-ink">
              Reschedule Booking
            </h2>
            <p className="mt-1 text-xs text-smoke">
              {resched.id} · {resched.name} (currently {formatDateLabel(resched.date)} at {formatTime12(resched.time)})
            </p>
            <div className="mt-4 space-y-4">
              <Field label="Consultation mode">
                <select
                  className="input"
                  value={rsMode}
                  onChange={(e) => {
                    setRsMode(e.target.value as ConsultMode);
                    setRsTime("");
                    setSlots([]);
                  }}
                >
                  <option value="in-clinic">In-clinic consultation</option>
                  <option value="video">Video consultation</option>
                  <option value="audio">Voice call consultation</option>
                </select>
              </Field>

              <Field label="Target date">
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="input flex-1"
                    value={rsDate}
                    onChange={(e) => {
                      setRsDate(e.target.value);
                      setRsTime("");
                      setSlots([]);
                    }}
                  />
                  <button
                    className="btn-outline text-xs whitespace-nowrap"
                    disabled={!rsDate || slotsLoading}
                    onClick={loadSlots}
                  >
                    {slotsLoading ? "Loading…" : "Find open slots"}
                  </button>
                </div>
              </Field>

              {slots.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-smoke">
                    Available times:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setRsTime(s.time)}
                        className={`rounded-xl border px-2 py-2 text-center text-xs font-semibold transition-all ${
                          rsTime === s.time
                            ? "border-emerald bg-emerald text-white shadow-xs"
                            : s.available
                              ? "border-line text-ink hover:border-emerald bg-white"
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
                <p className="text-xs text-smoke font-medium">
                  No open slots found on that day. Try selecting another date.
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
                {rsSaving ? "Moving…" : "Confirm Reschedule"}
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
      ? "border-emerald/40 text-emerald-dark hover:bg-emerald-soft bg-emerald-soft/30"
      : tone === "danger"
        ? "border-red-200 text-red-700 hover:bg-red-50 bg-red-50/20"
        : "border-line text-smoke hover:border-ink hover:text-ink bg-white";
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all disabled:opacity-50 ${toneCls}`}
    >
      {children}
    </button>
  );
}
