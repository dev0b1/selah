import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        star: "hsl(var(--star))",
        moon: "hsl(var(--moon))",
        nebula: "hsl(var(--nebula))",
        "cosmic-glow": "hsl(var(--cosmic-glow))",
        // Spiritual/Calming Prayer App Palette (keep for backward compatibility)
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
        selah: {
          wood: '#E6D3B3',
          'wood-dark': '#352714',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "serif"],
        body: ["Crimson Pro", "serif"],
        serif: ["Cormorant Garamond", "Georgia", "Times New Roman", "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        breathingGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { opacity: "1", boxShadow: "0 0 40px hsl(var(--primary) / 0.5)" },
        },
        floatGentle: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        moonGlow: {
          "0%, 100%": { boxShadow: "0 0 30px hsl(var(--moon) / 0.3), 0 0 60px hsl(var(--moon) / 0.2)" },
          "50%": { boxShadow: "0 0 50px hsl(var(--moon) / 0.5), 0 0 100px hsl(var(--moon) / 0.3)" },
        },
        orbit: {
          from: { transform: "rotate(0deg) translateX(100px) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(100px) rotate(-360deg)" },
        },
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "breathing-glow": "breathingGlow 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "float-gentle": "floatGentle 6s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "moon-glow": "moonGlow 8s ease-in-out infinite",
        "orbit": "orbit 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
