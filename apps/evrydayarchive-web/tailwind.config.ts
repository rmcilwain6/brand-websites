import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — resolved via CSS variables so dark mode is automatic
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        sun: 'var(--color-sun)',
        accent: '#F06F42',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'ink-faint': 'var(--color-ink-faint)',
        border: 'var(--color-border)'
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        // Named radii matching the brand metaphor
        placard: '4px',
        card: '8px',
        frame: '12px'
      },
      boxShadow: {
        // Warm-tinted shadows (brownish undertone, not pure black)
        'warm-sm': '0 1px 3px 0 rgb(43 35 26 / 0.08)',
        warm: '0 4px 12px 0 rgb(43 35 26 / 0.10), 0 2px 4px -2px rgb(43 35 26 / 0.06)',
        'warm-lg': '0 10px 32px 0 rgb(43 35 26 / 0.12), 0 4px 8px -4px rgb(43 35 26 / 0.08)',
        frame: '0 8px 24px 0 rgb(43 35 26 / 0.14), 0 2px 6px -1px rgb(43 35 26 / 0.08)'
      },
      transitionDuration: {
        // Motion timing tokens from spec
        fast: '140ms',
        standard: '210ms',
        slow: '310ms'
      }
    }
  },
  plugins: []
};

export default config;
