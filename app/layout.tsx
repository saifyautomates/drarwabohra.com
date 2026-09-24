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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
