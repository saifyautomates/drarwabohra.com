import Link from "next/link";
import { isAdminRequest } from "@/lib/auth";
import { getBookings, getSettings, type Booking } from "@/lib/data";
import { nowIST, toISODate } from "@/lib/slots";
import { formatDateLabel, formatINR, formatTime12, waLink } from "@/lib/data-client";
import AdminLogin from "@/components/admin/AdminLogin";
import { ModeBadge, PageHeader, StatusBadge } from "@/components/admin/ui";

export default function AdminDashboard() {
  if (!isAdminRequest()) return <AdminLogin />;

  const settings = getSettings();
  const bookings = getBookings();
  const today = toISODate(nowIST());

  // Date filters
  const todays = bookings.filter(
    (b) => b.date === today && b.status !== "cancelled"
  );
  const upcoming = bookings.filter(
    (b) => b.date >= today && (b.status === "pending" || b.status === "confirmed")
  );
  const visited = bookings.filter((b) => b.status === "visited");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  // Helper to determine estimated fee for a booking
  const getBookingFee = (b: Booking) => {
    const text = `${b.complaint ?? ""} ${b.reasons.join(" ")}`.toLowerCase();
    if (text.includes("plan b") || text.includes("4999") || text.includes("3 month")) {
      return settings.planBFee ?? 4999;
    }
    return settings.planAFee ?? 2000;
  };

  // Financial calculations
  const totalRealizedRevenue = [...visited, ...confirmed].reduce(
    (acc, b) => acc + getBookingFee(b),
    0
  );
  const pipelineRevenue = pending.reduce((acc, b) => acc + getBookingFee(b), 0);
  const todaysRevenue = todays
    .filter((b) => b.status === "confirmed" || b.status === "visited")
    .reduce((acc, b) => acc + getBookingFee(b), 0);

  const totalActiveBookings = bookings.filter((b) => b.status !== "cancelled").length;
  const avgTicket =
    totalActiveBookings > 0
      ? Math.round(
          bookings
            .filter((b) => b.status !== "cancelled")
            .reduce((acc, b) => acc + getBookingFee(b), 0) / totalActiveBookings
        )
      : settings.planAFee ?? 2000;

  // Plan Distribution
  const planACount = bookings.filter(
    (b) => getBookingFee(b) === (settings.planAFee ?? 2000) && b.status !== "cancelled"
  ).length;
  const planBCount = bookings.filter(
    (b) => getBookingFee(b) === (settings.planBFee ?? 4999) && b.status !== "cancelled"
  ).length;

  // Clinical Concerns Distribution
  const concernCounts: Record<string, number> = {};
  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    for (const r of b.reasons) {
      concernCounts[r] = (concernCounts[r] ?? 0) + 1;
    }
  }
  const sortedConcerns = Object.entries(concernCounts).sort((a, b) => b[1] - a[1]);
  const maxConcernCount = Math.max(...Object.values(concernCounts), 1);

  // Conversion percentages
  const totalAllTime = bookings.length || 1;
  const confirmationRate = Math.round(
    ((confirmed.length + visited.length) / totalAllTime) * 100
  );
  const cancellationRate = Math.round((cancelled.length / totalAllTime) * 100);

  return (
    <div className="space-y-8">
      {/* Primary Financial & Operational Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink font-semibold">
            Financial &amp; Volume Analytics
          </h2>
          <span className="text-xs text-smoke font-medium">All figures in INR (₹)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Realized Revenue */}
          <div className="card p-5 sm:p-6 border-l-4 border-l-emerald shadow-sm bg-paper relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
                Realized Revenue
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-soft text-emerald-dark font-bold text-sm">
                ₹
              </span>
            </div>
            <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
              {formatINR(totalRealizedRevenue)}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
              <span>Confirmed &amp; Completed</span>
              <span className="font-semibold text-emerald-dark">
                {confirmed.length + visited.length} consults
              </span>
            </div>
          </div>

          {/* Card 2: Pipeline / Pending Revenue */}
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
              <span>Awaiting UPI confirmation</span>
              <span className="font-semibold text-gold-dark">{pending.length} pending</span>
            </div>
          </div>

          {/* Card 3: Today's Consultations */}
          <div className="card p-5 sm:p-6 border-l-4 border-l-blue-500 shadow-sm bg-paper relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Today&rsquo;s Consults
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                📞
              </span>
            </div>
            <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
              {todays.length}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
              <span>Today&rsquo;s Revenue:</span>
              <span className="font-semibold text-ink">{formatINR(todaysRevenue)}</span>
            </div>
          </div>

          {/* Card 4: Average Consultation Value (ARPU) */}
          <div className="card p-5 sm:p-6 border-l-4 border-l-purple-500 shadow-sm bg-paper relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Avg. Ticket / Patient
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 font-bold text-sm">
                📈
              </span>
            </div>
            <p className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink">
              {formatINR(avgTicket)}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-smoke border-t border-line/60 pt-2">
              <span>Confirmation Rate</span>
              <span className="font-semibold text-emerald-dark">{confirmationRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Breakdown & Product Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan A & Plan B Performance */}
        <div className="card p-6 lg:col-span-2 shadow-sm bg-paper">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg text-ink font-semibold">
                Consultation Plan Performance
              </h3>
              <p className="text-xs text-smoke">
                Volume and revenue generated per healing plan tier
              </p>
            </div>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink">
              Total Active: {totalActiveBookings}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Plan A Tier Card */}
            <div className="rounded-xl border-2 border-emerald/20 bg-emerald-soft/20 p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs font-bold text-emerald-dark uppercase">
                  Plan A · Essential Care
                </span>
                <span className="font-bold text-ink font-mono text-sm">
                  {formatINR(settings.planAFee ?? 2000)}
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-ink">
                {planACount} <span className="text-xs font-normal text-smoke">Patients</span>
              </p>
              <p className="text-xs text-smoke mt-1">
                Estimated Volume: <strong className="text-ink">{formatINR(planACount * (settings.planAFee ?? 2000))}</strong>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink/85 border-t border-emerald/20 pt-2.5">
                <li>• 1 In-depth Voice Call</li>
                <li>• Follow-up within 4 weeks: <strong>Included</strong></li>
                <li>• Follow-up after 4 weeks: ₹1,500</li>
              </ul>
            </div>

            {/* Plan B Tier Card */}
            <div className="rounded-xl border-2 border-gold/40 bg-amber-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 uppercase">
                  Plan B · Complete Care
                </span>
                <span className="font-bold text-ink font-mono text-sm">
                  {formatINR(settings.planBFee ?? 4999)}
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-ink">
                {planBCount} <span className="text-xs font-normal text-smoke">Patients</span>
              </p>
              <p className="text-xs text-smoke mt-1">
                Estimated Volume: <strong className="text-ink">{formatINR(planBCount * (settings.planBFee ?? 4999))}</strong>
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
                UPI (PhonePe / GPay / Paytm): <span className="font-mono text-base font-bold text-ink">{settings.upiNumber ?? "7049205128"}</span>
              </p>
              <p className="text-xs text-smoke mt-0.5">
                Patients share transaction screenshots on WhatsApp: <strong>+91 {settings.phone}</strong>
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
                  <p className="text-sm font-bold text-ink">₹{settings.hairSerumPrice ?? 499}</p>
                  <p className="text-[10px] text-emerald-dark font-medium">₹50 OFF w/ Plan B</p>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">💧 Face Serum</p>
                  <p className="text-xs text-smoke">+ ₹80 shipping across India</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">₹{settings.faceSerumPrice ?? 549}</p>
                  <p className="text-[10px] text-emerald-dark font-medium">₹50 OFF w/ Plan B</p>
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
                  <span className="font-bold text-emerald-dark">{confirmationRate}%</span>
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