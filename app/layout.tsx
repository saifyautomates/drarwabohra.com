import type { Metadata, Viewport } from "next";
import { Tiro_Devanagari_Sanskrit, Mukta } from "next/font/google";
import "./globals.css";

const tiro = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari", "latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400"],
  display: "swap",
  preload: true,
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0e5e4a",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Dr. Arwa Bohra • Skin, Hair & Homeopathy | E-Consultation Platform",
  description:
    "Consult Dr. Arwa Bohra, Homeopathic Consultant & Skin and Hair Expert. 1:1 online voice call consultations, personalized remedies, and worldwide care.",
  metadataBase: new URL("https://drarwabohra.in"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
      </head>
      <body className={`${tiro.variable} ${mukta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
