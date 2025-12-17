/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // Dark Slate Blue (Background)
        secondary: '#f8fafc', // Light Text
        // Accent removed to resolve caching conflict
        muted: '#94a3b8', // Slate Gray (Secondary Text)
        surface: '#1e293b', // Darker Slate (Card Background)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
