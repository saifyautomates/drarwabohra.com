import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import SectionHeading from "@/components/site/SectionHeading";
import FaqAccordion from "@/components/site/FaqAccordion";
import { buildFaqs } from "@/components/site/faq-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FAQ — Dr. Arwa Bohra | Booking, Fees & Consultations",
  description:
    "Frequently asked questions about booking, fees, cancellations and online consultations with Dr. Arwa Bohra.",
};

export default function FaqPage() {
  const faqs = buildFaqs(getSettings());

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="FAQ"
        title="Frequently asked questions"
        subline="Straight answers about booking, fees and consultations. Still unsure? Message the clinic on WhatsApp."
      />
      <div className="mt-10">
        <FaqAccordion items={faqs} idPrefix="faq-page" />
      </div>
      <div className="mt-10 text-center">
        <Link href="/book" className="btn-primary !px-7 !py-3.5">
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
