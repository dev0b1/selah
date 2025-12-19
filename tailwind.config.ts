import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spiritual/Calming Prayer App Palette
        prayer: {
          bg: "#0f172a",
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#c4b5fd",
          light: "#e9d5ff",
          dark: "#1e1b4b",
        },
        daily: {
          bg: "#0f1724",
          primary: "#6d28d9",
          accent: "#f59e0b",
          pink: "#ff4d7e",
          soft: "#7c3aed",
        },
        exroast: {
          bg: "#0b1020",
          primary: "#7c3aed",
          accent: "#ffd23f",
          warm: "#ff6b6b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-clash)", "system-ui", "sans-serif"],
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
