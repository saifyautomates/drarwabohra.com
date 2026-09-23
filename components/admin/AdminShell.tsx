"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", match: (p: string) => p === "/admin" },
  {
    href: "/admin/appointments",
    label: "Appointments",
    match: (p: string) => p.startsWith("/admin/appointments"),
  },
  {
    href: "/admin/schedule",
    label: "Schedule",
    match: (p: string) => p.startsWith("/admin/schedule"),
  },
  {
    href: "/admin/treatments",
    label: "Treatments",
    match: (p: string) => p.startsWith("/admin/treatments"),
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    match: (p: string) => p.startsWith("/admin/testimonials"),
  },
  {
    href: "/admin/videos",
    label: "Videos",
    match: (p: string) => p.startsWith("/admin/videos"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    match: (p: string) => p.startsWith("/admin/settings"),
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still navigate away even if the request fails
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="font-display text-lg text-ink">
            Dr. Arwa Bohra <span className="text-smoke">— Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-emerald-dark hover:border-emerald sm:inline-block"
            >
              View site
            </Link>
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-smoke hover:border-ink hover:text-ink disabled:opacity-60"
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
            <button
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink sm:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              Menu
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {menuOpen && (
          <nav className="border-t border-line bg-white px-4 py-2 sm:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  item.match(pathname)
                    ? "bg-emerald-soft text-emerald-dark"
                    : "text-smoke hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 sm:block">
          <nav className="sticky top-20 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  item.match(pathname)
                    ? "bg-emerald text-white"
                    : "text-smoke hover:bg-cream hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
