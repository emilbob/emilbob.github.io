import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#0a0a0a',
        ash:     '#111111',
        carbon:  '#181818',
        smoke:   '#222222',
        mist:    '#b0b0b0',
        bone:    '#d8d8d8',
        ivory:   '#f5f5f5',
        electric:'#ffffff',
        warm:    '#c8b89a',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
        '2xs':     ['1.125rem', { lineHeight: '1.6' }],
        display:   ['clamp(5rem,12vw,13rem)',    { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        headline:  ['clamp(3.2rem,7vw,8rem)',    { lineHeight: '0.95', letterSpacing: '-0.03em' }],
      },
      spacing: {
        section: 'clamp(6rem,12vw,14rem)',
        gutter:  'clamp(1.5rem,5vw,6rem)',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        circ: 'cubic-bezier(0.85, 0, 0.15, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
