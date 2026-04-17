/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        crimson: "#DC143C",
        alert: "#FF3B3B",
        ice: "#E8F4FD",
        steel: "#1A2332",
        midnight: "#0D1421",
        pulse: "#00D4FF",
      },
      keyframes: {
        scan: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        ping2: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(2px, -2px)" },
          "60%": { transform: "translate(-1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        scan: "scan 2s linear infinite",
        ping2: "ping2 1.5s ease-out infinite",
        fadeIn: "fadeIn 0.5s ease forwards",
        glitch: "glitch 0.3s ease infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
