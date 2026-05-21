import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211b',
        leaf: '#15803d',
        moss: '#dff4e6',
        paper: '#fbfcf8',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 33, 27, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
