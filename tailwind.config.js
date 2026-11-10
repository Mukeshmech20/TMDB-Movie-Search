/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#14121C',
        velvet: '#1D1A28',
        curtain: '#2A2538',
        line: '#3A3450',
        paper: '#EDE8F2',
        mute: '#A9A1BC',
        amber: { DEFAULT: '#FFB347', deep: '#E8932A' },
        crimson: '#E04A67',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { poster: '10px', pill: '999px' },
      boxShadow: {
        poster: '0 14px 30px -12px rgba(0,0,0,.7)',
        glow: '0 0 0 2px #FFB347',
      },
    },
  },
  plugins: [],
};
