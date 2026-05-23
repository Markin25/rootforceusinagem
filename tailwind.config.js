/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--brand))',
          light: 'rgb(var(--brand-light))',
          dark: 'rgb(var(--brand-dark))',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          dark: 'rgb(var(--accent-dark))',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#e6c864',
          dark: '#b49328',
          muted: '#D4AF37/80',
        },
        steel: {
          DEFAULT: '#5A6A78',
          light: '#8A99A6',
          dark: '#3E4A54',
        },
        gray: {
          900: '#111111',
          800: '#1e1e1e',
          700: '#2d2d2d',
          600: '#3d3d3d',
          500: '#5a5a5a',
          400: '#8a8a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-gold': '0 0 30px rgba(212, 175, 55, 0.2)',
        'glow-gold-lg': '0 0 50px rgba(212, 175, 55, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #f5d989 50%, #D4AF37 100%)',
      },
    },
  },
  plugins: [],
};
