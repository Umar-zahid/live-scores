import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#0c1324',
        'surface-dim': '#0c1324',
        'surface-bright': '#33394c',
        'surface-lowest': '#070d1f',
        'surface-low': '#151b2d',
        'surface-container': '#191f31',
        'surface-high': '#23293c',
        'surface-highest': '#2e3447',
        'on-surface': '#dce1fb',
        'on-surface-variant': '#bccbb9',
        'outline': '#869585',
        'outline-variant': '#3d4a3d',
        'primary': '#4be277',
        'primary-container': '#22c55e',
        'on-primary': '#003915',
        'secondary': '#adc6ff',
        'secondary-container': '#0566d9',
        'on-secondary': '#002e6a',
        'tertiary': '#ffb4ae',
        'tertiary-container': '#ff8a83',
        'on-tertiary': '#68000a',
        'error': '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        headline: ['Chivo', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'headline-xl-mobile': ['32px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'score-display': ['28px', { lineHeight: '32px', letterSpacing: '0.02em', fontWeight: '800' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.06em', fontWeight: '700' }],
        'label-sm': ['10px', { lineHeight: '12px', letterSpacing: '0.08em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};

export default config;
