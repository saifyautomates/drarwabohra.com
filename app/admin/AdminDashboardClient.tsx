"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Booking, Settings } from "@/lib/data";
import {
  formatDateLabel,
  formatINR,
  formatTime12,
  waLink,
} from "@/lib/data-client";
import { StatusBadge } from "@/components/admin/ui";

type TimeRange = "today" | "yesterday" | "week" | "month" | "all";

interface AdminDashboardClientProps {
  initialBookings: Booking[];
  settings: Settings;
}

export default function AdminDashboardClient({
  initialBookings,
  settings,
}: AdminDashboardClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Helper to determine estimated fee for a booking
  const getBookingFee = (b: Booking) => {
    const text = `${b.complaint ?? ""} ${(b.reasons || []).join(" ")}`.toLowerCase();
    if (
      text.includes("plan b") ||
      text.includes("4999") ||
      text.includes("3 month")
    ) {
      return settings.planBFee ?? 4999;
    }
    return settings.planAFee ?? 2000;
  };

  // Dates in IST (UTC+5:30)
  const todayObj = useMemo(() => {
    const now = new Date();
    // UTC + 5.5 hours for IST
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return istTime;
  }, []);

  const todayStr = useMemo(() => {
    return todayObj.toISOString().slice(0, 10);
  }, [todayObj]);

  const yesterdayStr = useMemo(() => {
    const d = new Date(todayObj.getTime() - 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [todayObj]);

  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date(todayObj.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [todayObj]);

  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date(todayObj.getTime() - 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [todayObj]);

  // Check if a booking falls within a time range
  const isBookingInRange = (b: Booking, range: TimeRange) => {
    const d = b.date || b.createdAt.slice(0, 10);
    if (range === "today") return d === todayStr;
    if (range === "yesterday") return d === yesterdayStr;
    if (range === "week") return d >= sevenDaysAgoStr;
    if (range === "month") return d >= thirtyDaysAgoStr;
    return true; // "all"
  };

  // Filtered bookings based on selected time range
  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => isBookingInRange(b, timeRange));
  }, [initialBookings, timeRange]);

  // Paid patients in filtered period (Visited or Confirmed)
  const paidBookings = useMemo(() => {
    return filteredBookings.filter(
      (b) => b.status === "confirmed" || b.status === "visited"
    );
  }, [filteredBookings]);

  // All-time paid bookings (for reference/fallback)
  const allPaidBookings = useMemo(() => {
    return initialBookings.filter(
      (b) => b.status === "confirmed" || b.status === "visited"
    );
  }, [initialBookings]);

  // Pending bookings (Awaiting payment / confirmation)
  const pendingBookings = useMemo(() => {
    return filteredBookings.filter((b) => b.status === "pending");
  }, [filteredBookings]);

  // Realized revenue in selected period
  const realizedRevenue = useMemo(() => {
    return paidBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
  }, [paidBookings]);

  // Pending pipeline revenue in selected period
  const pipelineRevenue = useMemo(() => {
    return pendingBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
  }, [pendingBookings]);

  // Average ticket size
  const avgTicket = useMemo(() => {
    if (paidBookings.length === 0) return settings.planAFee ?? 2000;
    return Math.round(realizedRevenue / paidBookings.length);
  }, [paidBookings.length, realizedRevenue, settings.planAFee]);

  // Range counts for tab badges
  const rangeCounts = useMemo(() => {
    const calc = (r: TimeRange) =>
      initialBookings.filter(
        (b) =>
          isBookingInRange(b, r) &&
          (b.status === "confirmed" || b.status === "visited")
      ).length;
    return {
      today: calc("today"),
      yesterday: calc("yesterday"),
      week: calc("week"),
      month: calc("month"),
      all: allPaidBookings.length,
    };
  }, [initialBookings, allPaidBookings.length]);

  // Chart Data preparation: Daily breakdown
  const chartData = useMemo(() => {
    // Generate dates according to range
    const days: { date: string; label: string; revenue: number; count: number }[] =
      [];

    if (timeRange === "today") {
      // 3 slots or single day
      const rev = paidBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
      days.push({
        date: todayStr,
        label: "Today (" + formatDateLabel(todayStr) + ")",
        revenue: rev,
        count: paidBookings.length,
      });
    } else if (timeRange === "yesterday") {
      const yBookings = initialBookings.filter(
        (b) =>
          isBookingInRange(b, "yesterday") &&
          (b.status === "confirmed" || b.status === "visited")
      );
      days.push({
        date: yesterdayStr,
        label: "Yesterday (" + formatDateLabel(yesterdayStr) + ")",
        revenue: yBookings.reduce((acc, b) => acc + getBookingFee(b), 0),
        count: yBookings.length,
      });
    } else if (timeRange === "week") {
      // 7 days ending today
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayObj.getTime() - i * 24 * 60 * 60 * 1000);
        const dStr = d.toISOString().slice(0, 10);
        const dayBookings = initialBookings.filter(
          (b) =>
            (b.date === dStr || b.createdAt.slice(0, 10) === dStr) &&
            (b.status === "confirmed" || b.status === "visited")
        );
        const rev = dayBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        days.push({
          date: dStr,
          label: `${dayName} ${d.getDate()}`,
          revenue: rev,
          count: dayBookings.length,
        });
      }
    } else if (timeRange === "month") {
      // Last 14-30 days condensed into 7-10 buckets or daily
      for (let i = 13; i >= 0; i--) {
        const d = new Date(todayObj.getTime() - i * 2 * 24 * 60 * 60 * 1000);
        const dStr = d.toISOString().slice(0, 10);
        // group within 2 days
        const nextDStr = new Date(d.getTime() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        const dayBookings = initialBookings.filter(
          (b) =>
            (b.date >= dStr && b.date < nextDStr) &&
            (b.status === "confirmed" || b.status === "visited")
        );
        const rev = dayBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
        days.push({
          date: dStr,
          label: `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`,
          revenue: rev,
          count: dayBookings.length,
        });
      }
    } else {
      // All time: list unique dates or all bookings with revenue
      const dateMap: Record<string, { revenue: number; count: number }> = {};
      for (const b of allPaidBookings) {
        const d = b.date || b.createdAt.slice(0, 10);
        if (!dateMap[d]) dateMap[d] = { revenue: 0, count: 0 };
        dateMap[d].revenue += getBookingFee(b);
        dateMap[d].count += 1;
      }

      const sortedDates = Object.keys(dateMap).sort();
      if (sortedDates.length === 0) {
        days.push({
          date: todayStr,
          label: formatDateLabel(todayStr),
          revenue: 0,
          count: 0,
        });
      } else {
        for (const d of sortedDates) {
          days.push({
            date: d,
            label: formatDateLabel(d),
            revenue: dateMap[d].revenue,
            count: dateMap[d].count,
          });
        }
      }
    }

    return days;
  }, [
    timeRange,
    paidBookings,
    todayStr,
    yesterdayStr,
    todayObj,
    initialBookings,
    allPaidBookings,
  ]);

  const maxChartRevenue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.revenue), 2000);
  }, [chartData]);

  // Overall Plan Distribution (All-time)
  const planACount = initialBookings.filter(
    (b) =>
      getBookingFee(b) === (settings.planAFee ?? 2000) &&
      b.status !== "cancelled"
  ).length;
  const planBCount = initialBookings.filter(
    (b) =>
      getBookingFee(b) === (settings.planBFee ?? 4999) &&
      b.status !== "cancelled"
  ).length;

  // Clinical Concerns Distribution
  const concernCounts: Record<string, number> = {};
  for (const b of initialBookings) {
    if (b.status === "cancelled") continue;
    for (const r of b.reasons || []) {
      concernCounts[r] = (concernCounts[r] ?? 0) + 1;
    }
  }
  const sortedConcerns = Object.entries(concernCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const maxConcernCount = Math.max(...Object.values(concernCounts), 1);

  // Conversion rates
  const totalAllTime = initialBookings.length || 1;
  const confirmedAll = initialBookings.filter(
    (b) => b.status === "confirmed" || b.status === "visited"
  ).length;
  const cancelledAll = initialBookings.filter(
    (b) => b.status === "cancelled"
  ).length;
  const confirmationRate = Math.round((confirmedAll / totalAllTime) * 100);
  const cancellationRate = Math.round((cancelledAll / totalAllTime) * 100);

  return (
    <div className="space-y-8">
      {/* Header Bar with Time Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Financial &amp; Appointments Analytics
          </h1>
          <p className="text-xs text-smoke mt-1">
            Real-time consultation earnings, payment ledger, and revenue breakdown.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-cream/60 p-1.5">
          {(
            [
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "This Month" },
              { key: "all", label: "All Time" },
            ] as const
          ).map((tab) => {
            const count = rangeCounts[tab.key];
            const active = timeRange === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTimeRange(tab.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-emerald text-white shadow-sm font-bold"
                    : "text-ink/80 hover:bg-white hover:text-ink"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-emerald-soft text-emerald-dark"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards: Dynamic for Selected Time Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Realized Earning / Sales */}
        <div className="card p-5 sm:p-6 border-l-4 border-l-emerald shadow-sm bg-paper relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
              Appointment Earnings ({timeRange === "all" ? "All Time" : timeRange})
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-soft text-emerald-dark font-bold text-sm">
              ₹
            </span>
          </div>
          <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
            {formatINR(realizedRevenue)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
            <span>Verified Paid Patients</span>
            <span className="font-semibold text-emerald-dark">
              {paidBookings.length} consult{paidBookings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Revenue */}
        <div className="card p-5 sm:p-6 border-l-4 border-l-gold shadow-sm bg-paper relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
              Pending Pipeline
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-soft text-gold-dark font-bold text-sm">
              ⏳
            </span>
          </div>
          <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
            {formatINR(pipelineRevenue)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
            <span>Awaiting UPI / Verification</span>
            <span className="font-semibold text-gold-dark">
              {pendingBookings.length} pending
            </span>
          </div>
        </div>

        {/* Card 3: Paid Consultations Count */}
        <div className="card p-5 sm:p-6 border-l-4 border-l-sky-500 shadow-sm bg-paper relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Paid Appointments
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 font-bold text-sm">
              📞
            </span>
          </div>
          <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
            {paidBookings.length}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
            <span>Total Volume in Period:</span>
            <span className="font-semibold text-ink">
              {filteredBookings.length} bookings
            </span>
          </div>
        </div>

        {/* Card 4: Avg Fee per Patient */}
        <div className="card p-5 sm:p-6 border-l-4 border-l-purple-500 shadow-sm bg-paper relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Avg. Ticket / Fee
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 font-bold text-sm">
              📈
            </span>
          </div>
          <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
            {formatINR(avgTicket)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
            <span>Confirmation Rate</span>
            <span className="font-semibold text-emerald-dark">
              {confirmationRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Revenue Graph Section */}
      <section className="card p-6 shadow-sm bg-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
              <h2 className="font-display text-xl font-bold text-ink">
                Appointment Earnings Trend
              </h2>
            </div>
            <p className="text-xs text-smoke mt-0.5">
              Daily revenue curve and consultation volume across selected period ({timeRange.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-emerald" />
              <span className="font-medium text-smoke">Paid Revenue (₹)</span>
            </div>
            <div className="rounded-lg bg-emerald-soft px-3 py-1 text-emerald-dark font-mono font-bold">
              Total: {formatINR(realizedRevenue)}
            </div>
          </div>
        </div>

        {/* Visual Bar / Curve Chart */}
        <div className="relative pt-6 pb-2">
          {/* Chart Bars */}
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 px-2 border-b border-line">
            {chartData.map((d, idx) => {
              const heightPct =
                maxChartRevenue > 0
                  ? Math.max(8, Math.round((d.revenue / maxChartRevenue) * 100))
                  : 8;
              const hasRevenue = d.revenue > 0;
              const isHovered = hoveredDataIndex === idx;

              return (
                <div
                  key={idx}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredDataIndex(idx)}
                  onMouseLeave={() => setHoveredDataIndex(null)}
                  onClick={() => setHoveredDataIndex(idx)}
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-30 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                      <div className="rounded-xl bg-ink px-3 py-1.5 text-center text-white shadow-xl text-xs whitespace-nowrap">
                        <span className="font-bold text-emerald-light">
                          {formatINR(d.revenue)}
                        </span>
                        <span className="block text-[10px] text-white/70">
                          {d.count} patient{d.count !== 1 ? "s" : ""} paid
                        </span>
                      </div>
                      <div className="h-2 w-2 rotate-45 bg-ink -mt-1" />
                    </div>
                  )}

                  {/* Top value label */}
                  {hasRevenue && (
                    <span className="text-[10px] font-mono font-bold text-emerald-dark mb-1 hidden sm:inline">
                      ₹{d.revenue >= 1000 ? `${d.revenue / 1000}k` : d.revenue}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 ${
                      hasRevenue
                        ? isHovered
                          ? "bg-gradient-to-t from-emerald-dark to-emerald shadow-lg scale-105"
                          : "bg-gradient-to-t from-emerald to-emerald-light shadow-xs"
                        : "bg-cream/60 hover:bg-cream"
                    }`}
                  />

                  {/* X-axis label */}
                  <span className="mt-2 text-[10px] sm:text-xs text-smoke font-medium truncate max-w-[60px] text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHO PAID: Dedicated Patient Payment Ledger */}
      <section className="card p-6 shadow-sm bg-paper border-2 border-emerald/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-white text-xs font-bold">
                ✓
              </span>
              <h2 className="font-display text-xl font-bold text-ink">
                Who Paid • Patient Payment Ledger
              </h2>
            </div>
            <p className="text-xs text-smoke mt-0.5">
              List of patients with verified appointment consultation fee payments ({timeRange.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-bold text-emerald-dark">
              {paidBookings.length} Verified Payment{paidBookings.length !== 1 ? "s" : ""}
            </span>
            <Link
              href="/admin/appointments"
              className="text-xs font-semibold text-emerald-dark hover:underline"
            >
              All Appointments →
            </Link>
          </div>
        </div>

        {paidBookings.length === 0 ? (
          <div className="rounded-2xl border border-line bg-cream/30 p-8 text-center">
            <span className="text-3xl">💳</span>
            <h3 className="font-display text-base font-bold text-ink mt-2">
              No payments recorded for this time range ({timeRange})
            </h3>
            <p className="text-xs text-smoke mt-1 max-w-md mx-auto">
              There are no confirmed or visited consultations in the selected range.
              Switch to All Time to see verified patient payments.
            </p>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className="btn-primary !py-2 !px-4 text-xs font-semibold mt-4"
            >
              View All Time Paid Patients ({allPaidBookings.length})
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs font-bold uppercase tracking-wider text-smoke">
                <tr>
                  <th className="py-3">Patient Name</th>
                  <th className="py-3">Mobile &amp; WhatsApp</th>
                  <th className="py-3">Appointment Date</th>
                  <th className="py-3">Consultation Tier</th>
                  <th className="py-3">Fee Paid</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {paidBookings.map((b) => {
                  const fee = getBookingFee(b);
                  const isPlanB = fee > 3000;
                  return (
                    <tr key={b.id} className="hover:bg-cream/40 transition-colors">
                      {/* Patient Name & Details */}
                      <td className="py-3.5 font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald-dark font-bold text-xs uppercase">
                            {b.name.slice(0, 2)}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-ink">
                              {b.name}
                            </span>
                            <span className="block text-[11px] font-normal text-smoke">
                              ID: {b.id} • {b.age}y {b.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 font-mono text-xs">
                        <a
                          href={`tel:+91${b.mobile}`}
                          className="text-ink hover:text-emerald-dark font-medium underline-offset-2 hover:underline"
                        >
                          +91 {b.mobile}
                        </a>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 text-xs text-ink font-medium">
                        <div>{formatDateLabel(b.date)}</div>
                        <div className="text-[11px] text-smoke">
                          {formatTime12(b.time)}
                        </div>
                      </td>

                      {/* Tier / Concern */}
                      <td className="py-3.5">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${
                            isPlanB
                              ? "bg-gold-soft text-gold-dark border border-gold/30"
                              : "bg-emerald-soft text-emerald-dark border border-emerald/30"
                          }`}
                        >
                          {isPlanB ? "Plan B (Complete)" : "Plan A (Essential)"}
                        </span>
                        {b.reasons && b.reasons.length > 0 && (
                          <span className="block text-[11px] text-smoke mt-0.5">
                            {b.reasons.join(", ")}
                          </span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5">
                        <div className="font-mono text-base font-extrabold text-emerald-dark">
                          {formatINR(fee)}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-dark bg-emerald-soft/80 px-1.5 py-0.5 rounded">
                          <span>✓</span> Paid via UPI
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Quick Contact Actions */}
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waLink(
                              b.mobile,
                              `Hello ${b.name}, this is from Dr. Arwa Bohra Clinic regarding your consultation booking (${b.id}). Payment of ${formatINR(fee)} is verified.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-dark transition-colors inline-flex items-center gap-1"
                          >
                            <span>WhatsApp</span>
                          </a>
                          <Link
                            href="/admin/appointments"
                            className="rounded-lg border border-line bg-paper px-2 py-1 text-xs font-semibold text-smoke hover:text-ink"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Consultation Plan Performance & Official UPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 shadow-sm bg-paper">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-ink font-semibold">
                Consultation Plan Performance
              </h2>
              <p className="text-xs text-smoke">
                Volume and revenue generated per healing plan tier
              </p>
            </div>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink">
              Total Active: {initialBookings.filter((b) => b.status !== "cancelled").length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Plan A */}
            <div className="rounded-2xl border border-emerald/30 bg-emerald-soft/20 p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs font-bold text-emerald-dark">
                  PLAN A • ESSENTIAL CARE
                </span>
                <span className="font-mono text-base font-bold text-emerald-dark">
                  ₹{settings.planAFee ?? 2000}
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-ink">
                {planACount} <span className="text-xs font-normal text-smoke">Patients</span>
              </p>
              <p className="text-xs text-smoke mt-1">
                Estimated Volume:{" "}
                <strong className="text-ink">
                  {formatINR(planACount * (settings.planAFee ?? 2000))}
                </strong>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink/85 border-t border-emerald/20 pt-2.5">
                <li>• 1 In-depth Voice Call</li>
                <li>• Follow-up within 4 weeks: Included</li>
                <li>• Follow-up after 4 weeks: ₹1,500</li>
              </ul>
            </div>

            {/* Plan B */}
            <div className="rounded-2xl border border-gold/40 bg-gold-soft/20 p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-gold-dark">
                  PLAN B • COMPLETE CARE
                </span>
                <span className="font-mono text-base font-bold text-gold-dark">
                  ₹{settings.planBFee ?? 4999}
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-ink">
                {planBCount} <span className="text-xs font-normal text-smoke">Patients</span>
              </p>
              <p className="text-xs text-smoke mt-1">
                Estimated Volume:{" "}
                <strong className="text-ink">
                  {formatINR(planBCount * (settings.planBFee ?? 4999))}
                </strong>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink/85 border-t border-gold/30 pt-2.5">
                <li>• 1 Consultation + 2 Follow-ups (over 3 months)</li>
                <li>• Custom Healing Routine PDF included</li>
                <li>• ₹50 OFF Hair/Face Serum applied</li>
              </ul>
            </div>
          </div>

          {/* Quick Payment & Settlement Box */}
          <div className="mt-6 rounded-xl border border-line bg-cream/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
                Official Clinic Payment Channels
              </p>
              <p className="text-sm font-semibold text-ink mt-0.5">
                UPI (PhonePe / GPay / Paytm):{" "}
                <span className="font-mono text-base font-bold text-ink">
                  {settings.upiNumber ?? "7049205128"}
                </span>
              </p>
              <p className="text-xs text-smoke mt-0.5">
                Patients share transaction screenshots on WhatsApp:{" "}
                <strong>+91 {settings.phone}</strong>
              </p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !py-2 !px-4 text-xs font-semibold shrink-0"
            >
              Open Clinic WhatsApp
            </a>
          </div>
        </div>

        {/* Bestseller Products & Conversion Rates */}
        <div className="card p-6 shadow-sm bg-paper flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg text-ink font-semibold">
              Bestseller Remedies
            </h3>
            <p className="text-xs text-smoke mb-4">
              Nationwide remedy delivery &amp; product add-ons
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-white p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">🧴 Hair Serum</p>
                  <p className="text-xs text-smoke">+ ₹80 shipping across India</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">
                    ₹{settings.hairSerumPrice ?? 499}
                  </p>
                  <p className="text-[10px] text-emerald-dark font-medium">
                    ₹50 OFF w/ Plan B
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">💧 Face Serum</p>
                  <p className="text-xs text-smoke">+ ₹80 shipping across India</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">
                    ₹{settings.faceSerumPrice ?? 549}
                  </p>
                  <p className="text-[10px] text-emerald-dark font-medium">
                    ₹50 OFF w/ Plan B
                  </p>
                </div>
              </div>
            </div>

            <div className="rule-gold my-4" />

            <h4 className="text-xs font-bold uppercase tracking-wider text-smoke mb-3">
              Operational Health Indicators
            </h4>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-ink">Confirmation Rate</span>
                  <span className="font-bold text-emerald-dark">
                    {confirmationRate}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-cream overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald transition-all duration-500"
                    style={{ width: `${Math.min(confirmationRate, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-ink">Cancellation Rate</span>
                  <span className="font-bold text-smoke">{cancellationRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-cream overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400 transition-all duration-500"
                    style={{ width: `${Math.min(cancellationRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-line text-[11px] text-smoke">
            Appointments cancellation allowed up to 4 hours prior.
          </div>
        </div>
      </div>

      {/* Top Health Concerns Distribution */}
      <section className="card p-6 shadow-sm bg-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="font-display text-lg text-ink font-semibold">
              Top Patient Health Concerns
            </h3>
            <p className="text-xs text-smoke">
              Primary conditions patients are consulting Dr. Arwa Bohra for
            </p>
          </div>
          <span className="text-xs font-medium text-smoke">
            Based on active inquiries &amp; intake forms
          </span>
        </div>

        {sortedConcerns.length === 0 ? (
          <p className="text-sm text-smoke py-4 text-center">
            No patient concerns logged yet. Data will populate as patients book.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedConcerns.map(([concern, count]) => {
              const pct = Math.round((count / maxConcernCount) * 100);
              return (
                <div
                  key={concern}
                  className="rounded-xl border border-line bg-white p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-ink">{concern}</span>
                    <span className="font-mono text-xs font-bold text-emerald-dark">
                      {count} patient{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-cream overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald-dark"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
