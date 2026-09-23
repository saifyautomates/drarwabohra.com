import Link from "next/link";

/**
 * Minimal chrome for the booking flow pages. The full public site chrome is
 * owned by the site builder — this is a neutral header/footer so /book and
 * /my-booking look complete on their own. Server-safe (no client imports).
 */
export function BookHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald font-display text-base text-white">
            A
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] text-ink">
              Dr. Arwa Bohra
            </span>
            <span className="block text-[11px] text-smoke">
              Homeopathy · Skin &amp; Hair
            </span>
          </span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-smoke">
          {title}
        </span>
      </div>
    </header>
  );
}

export function BookFooter({ phone }: { phone: string }) {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-xl px-4 py-6 text-center">
        <p className="text-xs text-smoke">
          Need help with your booking? Call or WhatsApp us at{" "}
          <a
            href={`tel:+91${phone}`}
            className="font-semibold text-emerald-dark underline-offset-2 hover:underline"
          >
            +91 {phone}
          </a>
        </p>
        <p className="mt-2 text-[11px] text-smoke/70">
          Dr. Arwa Bohra — Homeopathic Consultant · Skin &amp; Hair Expert
        </p>
      </div>
    </footer>
  );
}
