"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#plans", label: "Plans & Fees" },
  { href: "/products", label: "Our Products" },
  { href: "/treatments", label: "Treatments" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({
  clinicName,
  doctorName,
}: {
  clinicName: string;
  doctorName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Secret Triple-Click Admin Trigger State
  const [clicks, setClicks] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Triple click detector for doctor avatar
  function handlePhotoTripleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setClicks((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        setShowAdminModal(true);
        setAdminError(null);
        setAdminPass("");
        return 0;
      }

      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        setClicks(0);
      }, 1500);

      return nextCount;
    });
  }

  // Handle Admin Login submission
  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminPass) return;
    setAdminBusy(true);
    setAdminError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      setAdminBusy(false);

      if (!res.ok || !data.ok) {
        setAdminError(data.error || "Incorrect password. Please try again.");
        return;
      }

      setShowAdminModal(false);
      window.location.href = "/admin";
    } catch {
      setAdminBusy(false);
      setAdminError("Network error. Please try again.");
    }
  }

  // Close modal on Escape
  useEffect(() => {
    if (!showAdminModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAdminModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAdminModal]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6"
          aria-label="Main navigation"
        >
          {/* Left Brand & Doctor Avatar with Triple-Click Trigger */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handlePhotoTripleClick}
              title="Dr. Arwa Bohra (Tap 3 times for Admin Portal)"
              className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-emerald-soft bg-paper shadow-sm active:scale-95 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald"
            >
              <Image
                src="/images/dr-arwa-bohra.png"
                alt={doctorName}
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover object-top"
              />
            </button>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="leading-tight group truncate"
            >
              <span className="block font-display text-[15px] sm:text-[17px] text-ink group-hover:text-emerald-dark transition-colors truncate">
                {doctorName}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-medium tracking-wide text-emerald-dark truncate">
                Homeopathy &amp; Skin Expert
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "text-emerald-dark font-semibold"
                    : "text-ink/80 hover:text-emerald-dark"
                }`}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}

            {/* Social Links on Desktop */}
            <div className="flex items-center gap-2 ml-2 mr-1">
              <a
                href="https://www.youtube.com/@DrArwaBohra"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr. Arwa on YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF0000] text-white hover:bg-[#CC0000] shadow-sm transition-all hover:scale-105"
                title="YouTube @DrArwaBohra (439K+ Subs)"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/drarwabohra/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr. Arwa on Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90 shadow-sm transition-all hover:scale-105"
                title="Instagram @drarwabohra"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
            <Link href="/book" className="btn-primary ml-2 !px-5">
              Book Appointment
            </Link>
          </div>

          {/* Mobile Right Controls: Streamlined so text never cuts off */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <Link
              href="/book"
              className="btn-primary !px-3.5 !py-1.5 text-xs font-bold shadow-xs"
            >
              Book
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink active:scale-95 transition-transform"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M5 5l10 10M15 5L5 15" />
                ) : (
                  <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {open && (
          <div className="border-t border-line bg-paper px-4 pb-5 pt-3 md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className={`block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? "bg-emerald-soft text-emerald-dark font-semibold"
                      : "text-ink/85 hover:bg-cream"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Social Links inside Mobile Drawer */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-xs text-smoke font-medium">Follow Dr. Arwa:</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.youtube.com/@DrArwaBohra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-[#FF0000] px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>439K+ Subs</span>
                </a>
                <a
                  href="https://www.instagram.com/drarwabohra/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 w-full !py-3 text-sm font-bold"
            >
              Book Appointment Now
            </Link>
          </div>
        )}
      </header>

      {/* Secret Admin Authentication Modal (Triggered by 3 clicks on Doctor Avatar) */}
      {showAdminModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAdminModal(false)}
        >
          <div
            className="card relative w-full max-w-sm p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-smoke hover:bg-cream hover:text-ink transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-line">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-emerald shadow-xs ring-2 ring-emerald/20">
                <Image
                  src="/images/dr-arwa-bohra.png"
                  alt="Dr. Arwa Bohra"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-ink leading-tight">
                  Admin Panel Login
                </h3>
                <p className="text-[11px] font-semibold text-emerald-dark">
                  Triple-Tap Verification
                </p>
              </div>
            </div>

            <p className="text-xs text-smoke leading-relaxed">
              Enter your clinic admin password to access appointments, patient records, products, and analytics.
            </p>

            <form onSubmit={handleAdminLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="input text-sm"
                />
              </div>

              {adminError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                  {adminError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={adminBusy || !adminPass}
                  className="btn-primary flex-1 !py-2.5 text-xs font-bold disabled:opacity-60"
                >
                  {adminBusy ? "Unlocking…" : "Unlock Admin Panel →"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="btn-outline !py-2.5 !px-3 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
