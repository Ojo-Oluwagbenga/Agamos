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
          black: '#111111',
          offblack: '#161616',
          charcoal: '#1E1E1E',
          card: '#222222',
          border: '#2E2E2E',
          gold: {
            DEFAULT: '#D4AF37',
            light: '#E5C158',
            dark: '#AA8820',
            muted: 'rgba(212, 175, 55, 0.15)',
            glow: 'rgba(212, 175, 55, 0.25)',
          },
          white: '#FFFFFF',
          cream: '#F9F8F6',
          sand: '#EFECE6',
          muted: '#8E8E93',
          darkmuted: '#555555'
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
        'luxury-card': '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
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
