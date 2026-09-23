import type { Config } from "tailwindcss";

/**
 * Design tokens — calm clinical premium.
 * Paper #FBFAF8 · ink #1A1A1A · deep teal/emerald #0E5E4A (CTAs, badges,
 * active states) · gold #C9A24B ONLY for tiny highlights, never large areas.
 * NO gradients anywhere.
 */
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF8",
        cream: "#F3F0E8",
        ink: "#1A1A1A",
        smoke: "#6B675E",
        line: "#E8E2D5",
        emerald: {
          DEFAULT: "#0E5E4A",
          dark: "#0A4636",
          deep: "#073327",
          soft: "#E2EEE8",
        },
        gold: {
          DEFAULT: "#C9A24B",
          dark: "#A8842F",
          soft: "#F7EFDD",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,26,26,.05), 0 8px 24px -12px rgba(26,26,26,.18)",
        lift: "0 2px 4px rgba(26,26,26,.06), 0 16px 40px -16px rgba(26,26,26,.28)",
      },
    },
  },
  plugins: [],
};
export default config;
