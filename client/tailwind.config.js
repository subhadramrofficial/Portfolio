/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF6F3",
        bgAlt: "#F3ECE8",
        ink: "#2A2622",
        inkSoft: "#6E655F",
        roseSoft: "#E7D3CD",
        roseDeep: "#A96B5F",
        border: "#E7DED8",
      },
      fontFamily: {
        heading: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
