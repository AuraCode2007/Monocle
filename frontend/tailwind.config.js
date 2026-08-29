/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#0b1120',
          panel: '#151f32',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#10b981',
          eng: '#f97316',
          trd: '#eab308',
          st: '#3b82f6',
          joint: '#a855f7',
        }
      }
    },
  },
  plugins: [],
}
