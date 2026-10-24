/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080B12',
        bg2: '#0E1420',
        panel: '#121B2A',
        panel2: '#16202F',
        miku: 'rgb(var(--c-accent) / <alpha-value>)',
        cyan: 'rgb(var(--c-accent2) / <alpha-value>)',
        soft: '#F4F7FC',
        muted: '#8B98AC',
        line: '#253447',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 28px -6px rgb(var(--c-accent) / 0.45)',
        'glow-sm': '0 0 14px -4px rgb(var(--c-accent) / 0.40)',
      },
      borderRadius: {
        xl2: '1.3rem',
      },
    },
  },
  plugins: [],
}
