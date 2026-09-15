/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0C0C0C",
        "primary-text": "#D7E2EA",
        "secondary-text": "rgba(215, 226, 234, 0.65)",
        "white-section": "#FFFFFF",
      },
      fontFamily: {
        kanit: ["Kanit", "sans-serif"],
        sans: ["Kanit", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.18em",
        tighter: "-0.04em",
      },
    },
  },
  plugins: [],
};
