/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "Inter", "system-ui", "sans-serif"],
      },
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
        // Premium palette
        gold: {
          50: "#fdf8ee",
          100: "#faefd3",
          200: "#f5dca3",
          300: "#eec36b",
          400: "#e8a942",
          500: "#c9a96e",
          600: "#b8883e",
          700: "#9a6b2e",
          800: "#7d5425",
          900: "#654420",
        },
        sand: {
          50: "#faf8f5",
          100: "#f0ebe3",
          200: "#e4ddd2",
          300: "#d3c7b8",
          400: "#baa99a",
          500: "#a08b7c",
          600: "#8b7063",
          700: "#735b4f",
          800: "#5e4c42",
          900: "#4e4038",
        },
        espresso: {
          DEFAULT: "#2C2420",
          50: "#f5f0ee",
          light: "#4a3e38",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        luxury:
          "0 4px 24px -4px rgba(5,150,105,0.15), 0 2px 8px -2px rgba(0,0,0,0.08)",
        "luxury-lg":
          "0 12px 40px -8px rgba(5,150,105,0.2), 0 4px 16px -4px rgba(0,0,0,0.1)",
        gold: "0 4px 24px -4px rgba(201,169,110,0.3), 0 2px 8px -2px rgba(0,0,0,0.06)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.08)",
        "card-hover":
          "0 8px 32px -8px rgba(5,150,105,0.18), 0 4px 16px -4px rgba(0,0,0,0.12)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeSlideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        stepEnter: {
          from: { opacity: 0, transform: "translateX(16px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(5,150,105,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(5,150,105,0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        fadeSlideUp: "fadeSlideUp 0.45s ease-out forwards",
        stepEnter: "stepEnter 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
