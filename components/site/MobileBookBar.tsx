"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Sticky bottom booking bar — mobile only. Hidden on /book and /admin
 * so it never covers the booking flow or the admin console.
 */
export default function MobileBookBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/book") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <Link href="/book" className="btn-primary w-full !py-3.5 text-[15px]">
        Book Appointment
      </Link>
    </div>
  );
}
