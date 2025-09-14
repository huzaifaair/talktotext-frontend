/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",        // App Router pages
    "./components/**/*.{js,ts,jsx,tsx}", // Shared components
    "./lib/**/*.{js,ts,jsx,tsx}",        // (optional) agar lib me UI code ho
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
}
