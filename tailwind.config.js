/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#111118",
        surface: "#1a1a2e",
        "surface-light": "#2d2d44",
        primary: "#6C5CE7",
        "primary-light": "#a855f7",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        text: {
          DEFAULT: "#ffffff",
          secondary: "#888899",
          muted: "#555566",
        },
      },
      borderRadius: {
        card: "14px",
        button: "12px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
