const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens (flip between light and dark mode)
        ink: token('ink'),
        canvas: token('canvas'),
        paper: token('paper'),
        line: token('line'),
        muted: token('muted'),
        subtle: token('subtle'),
        leaf: token('leaf'),
        danger: token('danger'),
        white: token('surface'),
        // Fixed tokens (identical in both modes)
        night: '#0E0E0E',
        snow: '#FFFFFF',
        lime: {
          DEFAULT: '#C5F06E',
          bright: '#8BD12A',
        },
      },
      fontFamily: {
        display: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1240px',
      },
    },
  },
  plugins: [],
}
