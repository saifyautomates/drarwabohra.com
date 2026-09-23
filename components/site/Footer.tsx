import Link from "next/link";
import type { Settings } from "@/lib/data";
import { waLink } from "@/lib/data";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/treatments", label: "Treatments" },
  { href: "/about", label: "About Dr. Arwa Bohra" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book Appointment" },
];

export default function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-cream/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-ink">{settings.doctorName}</p>
          <p className="mt-1 text-sm text-smoke">{settings.doctorTitle}</p>
          <p className="mt-4 text-sm leading-relaxed text-smoke">
            {settings.address}
          </p>
          <p className="mt-2 text-sm">
            <a
              href={`tel:+91${settings.phone}`}
              className="font-medium text-emerald-dark underline-offset-2 hover:underline"
            >
              +91 {settings.phone}
            </a>
          </p>
          <a
            href={waLink(
              settings.whatsapp,
              "Hi, I want to book an online consultation with Dr. Arwa Bohra."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-4"
          >
            WhatsApp Support
          </a>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-widest text-smoke">
            Quick links
          </p>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-ink/80 underline-offset-2 hover:text-emerald-dark hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-smoke">
            Follow Dr. Arwa
          </p>
          <p className="mt-2 text-xs text-smoke">
            Join 439,000+ subscribers for health, hair &amp; homeopathic routines.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#FF0000] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#CC0000] hover:shadow-md transition-all active:scale-[0.98]"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube (439K+)
              </a>
            )}
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} Dr. Arwa Bohra. All rights reserved.
          </p>
          <p>Online Homeopathy E-Consultation Platform.</p>
        </div>
      </div>
    </footer>
  );
}
