import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111114",
        paper: "#f7f7f5",
        brand: {
          DEFAULT: "#8a1c2c",
          dark: "#6b1422",
          soft: "#f7e8ea",
        },
        gold: "#b8892b",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        // "serif" is kept as an alias so older templates pick up the new heading font
        serif: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,20,0.04), 0 8px 24px -12px rgba(17,17,20,0.12)",
        lift: "0 2px 4px rgba(17,17,20,0.04), 0 20px 40px -16px rgba(17,17,20,0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
