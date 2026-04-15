/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#121210",
        surface: "#1c1a16",
        "surface-light": "#2e2b24",
        primary: "#D4AA40",
        "primary-light": "#E8C860",
        "primary-dark": "#B8922E",
        "primary-on": "#1a1608",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        text: {
          DEFAULT: "#ffffff",
          secondary: "#9a9590",
          muted: "#5e5a54",
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
