/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#D4AF37', light: '#E9CF77', deep: '#7A5C0E' },
        night: { DEFAULT: '#0F172A', 800: '#1E293B', 700: '#334155' },
        ivory: '#FDFBF7',
        parchment: { DEFAULT: '#F3EAD3', dark: '#E7D9B5' },
        cardinal: '#9B1B30',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        halo: { '0%,100%': { opacity: '0.45', transform: 'scale(1)' }, '50%': { opacity: '0.9', transform: 'scale(1.18)' } },
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        glory: { '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
      },
      animation: {
        halo: 'halo 2.4s ease-in-out infinite',
        rise: 'rise .35s ease-out both',
        glory: 'glory 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
