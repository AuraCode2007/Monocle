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
          dark: '#4F4F53',
          panel: '#FFFFFF',
          border: 'rgba(79, 79, 83, 0.18)',
          accent: '#8B88C6',
          eng: '#8B88C6',
          trd: '#D1A751',
          st: '#4F4F53',
          joint: '#8B88C6',
        },
      },
    },
  },
  plugins: [],
}