/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        accent: {
          DEFAULT: "#2563eb",
          soft: "#eff6ff",
        },
        success: {
          DEFAULT: "#16a34a",
          soft: "#f0fdf4",
        },
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
    },
  },
  plugins: [],
};
