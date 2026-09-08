/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Railway theme - deep reds, greens, natural tones
        railway: {
          'red-dark':   '#8B1414',   // deep red from train
          'red-bright': '#C41E3A',   // Indian railway red
          'red-light':  '#DC2F3D',   // lighter red accent
          'green-dark': '#1B4332',   // dark green tunnel
          'green-mid':  '#2D6A4F',   // medium green foliage
          'green-light': '#40916C',  // bright green
          'dark':       '#0B0B0B',   // near black shadows
          'white':      '#FFFFFF',   // pure white text
          'gray-light': '#E8E8E8',   // light gray
          'gold':       '#D4A574',   // metallic accent
        },
        ff: {
          bg:           '#E8ECFF',
          'bg-dark':    '#D4DCFF',
          surface:      '#F5F8FF',
          border:       '#D1DEFF',
          accent:       '#5B7FFF',
          sidebar:      '#1A1F3A',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.10)',
        'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.15)',
        'glow-red': '0 0 20px rgba(196, 30, 58, 0.30)',
      },
    },
  },
  plugins: [],
}
