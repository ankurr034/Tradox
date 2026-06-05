/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: '#121214',
        surfaceHighlight: '#1a1a1d',
        primary: '#6d28d9', 
        secondary: '#0ea5e9',
        accent: '#2dd4bf',
      }
    },
  },
  plugins: [],
}
