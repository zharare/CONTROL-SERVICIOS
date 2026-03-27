import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        consitec: {
          50: '#eef4fb',
          100: '#d7e6f7',
          500: '#1f4f7a',
          700: '#0a2540',
          accent: '#ff8a3d'
        }
      }
    }
  },
  plugins: []
};

export default config;
