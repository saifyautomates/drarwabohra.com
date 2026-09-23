/* Server-safe FAQ content. Copy is deliberately honest: no invented
   credentials, no cure claims, and the OTP question discloses demo mode. */

import type { Settings } from "@/lib/data";
import { formatINR } from "@/lib/data-client";

export interface FaqItem {
  q: string;
  a: string;
}

export function buildFaqs(s: Settings): FaqItem[] {
  const payLine =
    s.paymentMode === "pay-at-clinic"
      ? "No — this website doesn't collect any payment online. For in-clinic visits you simply pay at the clinic. For video or audio consults, the clinic will share payment details with you after your booking is confirmed."
      : "A small advance token may be collected to confirm your slot; the remaining fee is settled with the clinic.";

  return [
    {
      q: "How do I book an appointment?",
      a: "Tap “Book Appointment”, choose your preferred mode (voice call or video), pick a date and time slot, and confirm your details. You'll receive a booking confirmation that you can share on WhatsApp.",
    },
    {
      q: "What are the consultation plans & fees? How do I pay?",
      a: "We offer two structured consultation plans:\n• Plan A (₹2,000): 1 in-depth voice consultation + personalised medicines, diet & lifestyle advice, with a follow-up within 4 weeks INCLUDED (follow-up after 4 weeks is ₹1,500).\n• Plan B (₹4,999): 3-month complete healing plan with 1 initial consultation + 2 follow-ups, regular medicine adjustments, Custom Healing Routine PDF, and ₹50 OFF on Hair or Face Serum.\nPayment is accepted via PhonePe, Google Pay, or Paytm to 7049205128. Share your payment receipt on WhatsApp at 8319623253 to confirm your slot.",
    },
    {
      q: "How is the consultation conducted?",
      a: "Consultations are conducted 1:1 directly with Dr. Arwa Bohra via voice call. The discussion is comprehensive, unhurried, and covers your symptoms, diet, and lifestyle to prescribe your custom homeopathic remedies.",
    },
    {
      q: "What should I keep ready for my consultation?",
      a: "Any current or past prescriptions, a list of medicines you take, and clear photos of the skin or hair concern you're consulting about. For follow-ups, keep your previous notes handy.",
    },
    {
      q: "How does the online e-consultation process work?",
      a: "After you book your slot and share your UPI payment receipt on WhatsApp (8319623253), your consultation is confirmed. Dr. Arwa Bohra connects with you 1:1 directly via voice call to examine your concern and plan your personalized homeopathic regimen.",
    },
    {
      q: "Can I consult Dr. Arwa from anywhere in India or internationally?",
      a: "Yes! Dr. Arwa's E-Consultation Platform is completely online and available for patients across India and internationally. All consultations take place via voice call or video from the comfort of your home.",
    },
    {
      q: "How do I order Dr. Arwa's Hair Serum or Face Serum?",
      a: "Dr. Arwa's signature formulations can be enquired and ordered directly via WhatsApp at +91 83196 23253. Our team will guide you on genuine product dispatch and usage instructions suited to your condition.",
    },
    {
      q: "Are homeopathic medicines safe with my existing allopathic treatments?",
      a: "Yes, homeopathic constitutional remedies and mother tinctures can generally be taken alongside ongoing treatments under qualified medical supervision. During your consultation, share your current prescriptions so Dr. Arwa can plan a compatible schedule.",
    },
    {
      q: "Why does booking ask for an OTP?",
      a:
        s.otpMode === "demo"
          ? "The OTP verifies your mobile number. The site is currently running in demo mode, so the test OTP is shown on screen instead of arriving by SMS. In the live version it will come to your phone by SMS."
          : "The OTP verifies your mobile number and will arrive on your phone by SMS.",
    },
  ];
}
