"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    match: (p: string) => p === "/admin",
  },
  {
    href: "/admin/appointments",
    label: "Appointments",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/appointments"),
  },
  {
    href: "/admin/patients",
    label: "Patients",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/patients"),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/products"),
  },
  {
    href: "/admin/schedule",
    label: "Schedule",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/schedule"),
  },
  {
    href: "/admin/treatments",
    label: "Treatments",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/treatments"),
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/testimonials"),
  },
  {
    href: "/admin/videos",
    label: "Videos",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/admin/videos"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
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
      // still navigate away
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-emerald shadow-xs transition-transform group-hover:scale-105 ring-2 ring-emerald/20">
                <img
                  src="/images/dr-arwa-bohra.png"
                  alt="Dr. Arwa Bohra"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <span className="block font-display text-base sm:text-lg font-bold text-ink leading-tight group-hover:text-emerald-dark transition-colors">
                  Dr. Arwa Bohra
                </span>
                <span className="block text-[11px] font-semibold text-emerald-dark tracking-wide">
                  Clinical Admin Portal
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-line text-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-smoke font-medium">E-Consultation Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-xs hover:border-emerald hover:text-emerald-dark transition-all"
            >
              <span>View Live Website</span>
              <span className="text-[11px] opacity-60">↗</span>
            </Link>

            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-smoke hover:border-red-200 hover:text-red-600 hover:bg-red-50/50 transition-all disabled:opacity-60"
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink sm:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <nav className="border-t border-line bg-white px-4 py-3 sm:hidden shadow-lg animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-emerald text-white shadow-xs"
                        : "bg-paper text-smoke hover:text-ink"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-dark"
              >
                Open Public Website ↗
              </Link>
              <span className="text-[11px] text-smoke">v3.2 Secure</span>
            </div>
          </nav>
        )}
      </header>

      {/* Main Layout Container */}
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-56 shrink-0 sm:block">
          <nav className="sticky top-24 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-smoke">
              Management Suite
            </div>
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-emerald text-white shadow-sm"
                      : "text-ink/80 hover:bg-white hover:text-emerald-dark hover:shadow-xs"
                  }`}
                >
                  <span className={active ? "text-white" : "text-smoke"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Doctor Profile Card */}
            <div className="mt-8 rounded-2xl border border-line bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src="/images/dr-arwa-bohra.png"
                  alt="Dr. Arwa Bohra"
                  className="h-10 w-10 rounded-full border border-emerald-soft object-cover object-top shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink">
                    Dr. Arwa Bohra
                  </p>
                  <p className="truncate text-[10px] font-medium text-emerald-dark">
                    Consultant Doctor
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-dark font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                  Online
                </span>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-smoke hover:text-emerald-dark transition-colors"
                >
                  Visit Site ↗
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
