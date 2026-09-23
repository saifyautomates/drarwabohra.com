import type { Metadata } from "next";
import { Tiro_Devanagari_Sanskrit, Mukta } from "next/font/google";
import "./globals.css";

// Tiro Devanagari Sanskrit — the Devanagari-capable serif available in this
// Next version (Tiro Devanagari Serif is not yet exported by next/font here).
const tiro = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari", "latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400"],
  display: "swap",
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dr. Arwa Bohra — Skin, Hair & Homeopathy | E-Consultation Platform",
  description:
    "Consult Dr. Arwa Bohra, Homeopathic Consultant & Skin and Hair Expert. 1:1 online voice call consultations, personalized remedies, and worldwide care.",
  metadataBase: new URL("https://drarwabohra.in"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${tiro.variable} ${mukta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
