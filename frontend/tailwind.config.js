/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          black: 'var(--luxury-black)',
          offblack: 'var(--luxury-offblack)',
          charcoal: 'var(--luxury-charcoal)',
          card: 'var(--luxury-card)',
          border: 'var(--luxury-border)',
          gold: {
            DEFAULT: 'var(--luxury-gold)',
            light: 'var(--luxury-gold-light)',
            dark: 'var(--luxury-gold-dark)',
            muted: 'var(--luxury-gold-muted)',
            glow: 'var(--luxury-gold-glow)',
          },
          white: 'var(--luxury-white)',
          cream: 'var(--luxury-cream)',
          sand: 'var(--luxury-sand)',
          muted: 'var(--luxury-muted)',
          darkmuted: 'var(--luxury-darkmuted)'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Didot', 'Cinzel', 'Georgia', 'serif'],
        sans: ['"Montserrat"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'gold-subtle': '0 4px 20px -2px rgba(212, 175, 55, 0.15)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.3)',
        'luxury-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'luxury-card': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      },
      letterSpacing: {
        'widest-luxury': '0.25em',
        'ultra-wide': '0.35em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'gold-pulse': 'goldPulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        goldPulse: {
          '0%, 100%': { borderColor: 'rgba(212, 175, 55, 0.3)' },
          '50%': { borderColor: 'rgba(212, 175, 55, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
