import Link from "next/link";
import { isAdminRequest } from "@/lib/auth";
import { getBookings, getSettings } from "@/lib/data";
import { nowIST, toISODate } from "@/lib/slots";
import { formatDateLabel, formatTime12 } from "@/lib/data-client";
import AdminLogin from "@/components/admin/AdminLogin";
import { ModeBadge, PageHeader, StatusBadge } from "@/components/admin/ui";

export default function AdminDashboard() {
  if (!isAdminRequest()) return <AdminLogin />;

  const settings = getSettings();
  const bookings = getBookings();
  const today = toISODate(nowIST());

  const todays = bookings.filter(
    (b) => b.date === today && b.status !== "cancelled"
  );
  const upcoming = bookings.filter(
    (b) => b.date > today && (b.status === "pending" || b.status === "confirmed")
  );
  const visited = bookings.filter((b) => b.status === "visited");
  const noShow = bookings.filter((b) => b.status === "no-show");

  const cards = [
    { label: "Today", value: todays.length, note: "appointments on the day" },
    { label: "Upcoming", value: upcoming.length, note: "future pending & confirmed" },
    { label: "Completed", value: visited.length, note: "marked visited" },
    { label: "No-show", value: noShow.length, note: "did not arrive" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub={`Welcome, ${settings.doctorName}. Today's schedule at a glance.`}
        action={
          <Link href="/admin/appointments" className="btn-primary">
            All appointments
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm font-medium text-smoke">{c.label}</p>
            <p className="mt-1 font-display text-4xl text-ink">{c.value}</p>
            <p className="mt-1 text-xs text-smoke">{c.note}</p>
          </div>
        ))}
      </div>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">Today&rsquo;s appointments</h2>
        {todays.length === 0 ? (
          <p className="mt-3 text-sm text-smoke">
            No appointments today. The day is free.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {todays
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {formatTime12(b.time)} — {b.name}
                    </p>
                    <p className="text-xs text-smoke">
                      {b.id} · {b.mobile}
                      {b.reasons.length > 0 && ` · ${b.reasons.slice(0, 2).join(", ")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModeBadge mode={b.mode} />
                    <StatusBadge status={b.status} />
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/schedule", label: "Weekly schedule", note: "Hours, slot length, blocked dates" },
          { href: "/admin/treatments", label: "Treatments", note: "Services shown on the website" },
          { href: "/admin/settings", label: "Clinic settings", note: "Fees, contact, hero copy, integrations" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="card block p-5 transition-shadow hover:shadow-lift">
            <p className="text-sm font-semibold text-emerald-dark">{q.label}</p>
            <p className="mt-1 text-xs text-smoke">{q.note}</p>
          </Link>
        ))}
      </section>

      <p className="mt-6 text-xs text-smoke">
        Registration: {settings.registration || "to be updated by clinic"}
      </p>
    </div>
  );
}
