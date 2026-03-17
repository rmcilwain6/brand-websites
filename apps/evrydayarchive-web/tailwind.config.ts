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
        'mat-deep': 'var(--color-mat-deep)',
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
        placard: '2px',
        card: '8px',
        frame: '12px', // craft variant
        'frame-gallery': '2px' // gallery variant (professional, sharp)
      },
      boxShadow: {
        // Warm-tinted shadows (brownish undertone, not pure black)
        'warm-sm': '0 1px 3px 0 rgb(43 35 26 / 0.08)',
        warm: '0 4px 12px 0 rgb(43 35 26 / 0.10), 0 2px 4px -2px rgb(43 35 26 / 0.06)',
        'warm-lg': '0 10px 32px 0 rgb(43 35 26 / 0.12), 0 4px 8px -4px rgb(43 35 26 / 0.08)',
        frame: '0 8px 24px 0 rgb(43 35 26 / 0.14), 0 2px 6px -1px rgb(43 35 26 / 0.08)', // craft variant
        'frame-gallery': '0 3px 10px 0 rgb(43 35 26 / 0.18), 0 1px 3px 0 rgb(43 35 26 / 0.10)' // gallery variant (defined, less diffuse)
      },
      transitionDuration: {
        // Motion timing tokens from spec
        fast: '140ms',
        standard: '210ms',
        slow: '310ms'
      },
      animation: {
        'fade-up': 'fadeUp 280ms ease-out both',
        'fade-in': 'fadeIn 220ms ease-out both',
        marquee: 'marquee var(--marquee-duration, 75s) linear infinite',
        'slide-from-right': 'slideFromRight 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-from-left': 'slideFromLeft 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        // Used for checkpoint / exploration entries — slow fade with no lateral motion
        'checkpoint-enter': 'checkpointEnter 460ms cubic-bezier(0.16, 1, 0.3, 1) both',
        // Staggered child reveals inside checkpoint cards
        'reveal-up': 'revealUp 420ms cubic-bezier(0.16, 1, 0.3, 1) both',
        // Counter tick — quick pop for the N/N step number when it changes
        'counter-tick': 'counterTick 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        slideFromRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        checkpointEnter: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        counterTick: {
          '0%': { opacity: '0', transform: 'translateY(5px) scale(0.85)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
