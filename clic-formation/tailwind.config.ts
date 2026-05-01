import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Color System
        background: {
          light: "#f8fafc", // slate-50
          dark: "#020617",  // slate-950
        },
        surface: {
          light: "#ffffff", // white
          dark: "#0f172a",  // slate-900
        },
        primary: {
          DEFAULT: "#2563eb", // blue-600
          hover: "#1d4ed8",   // blue-700
          dark: "#3b82f6",    // blue-500
        },
        success: {
          DEFAULT: "#059669", // emerald-600
          dark: "#10b981",    // emerald-500
        },
        warning: {
          DEFAULT: "#f59e0b", // amber-500
          dark: "#fbbf24",    // amber-400
        },
        border: {
          light: "#e2e8f0", // slate-200
          dark: "#1e293b",  // slate-800
        },
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
