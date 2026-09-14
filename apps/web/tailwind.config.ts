import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F7FA",
        foreground: "#172033",
        surface: {
          50: "#FFFFFF",
          100: "#F8FAFC",
          200: "#F1F5F9",
          300: "#E2E8F0",
          400: "#CBD5E1",
          500: "#94A3B8",
          600: "#64748B",
          700: "#475569",
          800: "#334155",
          850: "#1E293B",
          900: "#172033",
          950: "#0F172A",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
        },
        accent: {
          sky: "#38BDF8",
          purple: "#7C3AED",
        },
        status: {
          accessible: "#10B981",
          restricted: "#F59E0B",
          blocked: "#EF4444",
          unknown: "#64748B",
          info: "#2563EB",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        floating: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.08)",
        "glass-lg": "0 16px 48px 0 rgba(15, 23, 42, 0.1)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.05)",
        "glass-card": "0 8px 30px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)",
        "glass-hover": "0 14px 40px -4px rgba(31, 38, 135, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)",
        "glow-brand": "0 0 25px rgba(59, 130, 246, 0.3)",
        "glow-rose": "0 0 25px rgba(244, 63, 94, 0.3)",
        "glow-emerald": "0 0 25px rgba(16, 185, 129, 0.3)",
        "glow-amber": "0 0 25px rgba(245, 158, 11, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
