/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0A0712',
        velvet: '#120D1F',
        curtain: '#1C1530',
        line: '#2E2447',
        paper: '#F4EFFB',
        mute: '#A89DC2',
        gold: { DEFAULT: '#E8B84B', deep: '#C99A2E', soft: '#F5D88A' },
        royal: { DEFAULT: '#7C4DFF', deep: '#5B2FD4', soft: '#B79BFF' },
        crimson: '#E5486A',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { poster: '12px', pill: '999px' },
      boxShadow: {
        poster: '0 18px 40px -16px rgba(0,0,0,.85)',
        glow: '0 0 0 2px #E8B84B',
        royal: '0 10px 50px -12px rgba(124,77,255,.55)',
        gold: '0 10px 40px -14px rgba(232,184,75,.5)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
      animation: { 'fade-up': 'fade-up .5s ease-out both', 'fade-in': 'fade-in .4s ease-out both' },
    },
  },
  plugins: [],
};
