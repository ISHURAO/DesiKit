/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        "desikit-green" : "#16a34a",
        "leaf-green" : "#15803d",
        "milk-cream" : "#fdfbf7",
        "farm-cream" : "#f7f4eb",
        "desikit-dark" : "#112b1a",
        "desikit-soft" : "#eaf5e7",
        "desikit-accent" : "#f59e0b"
      }
    },
  },
  plugins: [],
}
