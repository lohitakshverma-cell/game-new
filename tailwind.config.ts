import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Minimalist (beminimalist.co) palette
        cream: "#F7F3EC",
        ink: "#1A1A18",
        stone: "#6B6862",
        bone: "#E5DDD3",
        terracotta: "#B96E4F",
        amber: "#92400E",
        sage: "#7B8C6E",
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "Arial", "sans-serif"],
        body: ["var(--font-inter)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "\"Courier New\"", "monospace"],
      },
      letterSpacing: {
        label: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
