/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#EEF2F7',
          100: '#D4DEE9',
          200: '#A9BDD3',
          300: '#7E9CBD',
          400: '#537BA7',
          500: '#1E3A5F',
          600: '#182F4C',
          700: '#122439',
          800: '#0C1926',
          900: '#060E13',
        },
        accent: {
          DEFAULT: '#52B788',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#52B788',
          500: '#34D399',
          600: '#2AA873',
          700: '#208A5E',
          800: '#166B49',
          900: '#0D4D34',
        },
        secondary: {
          DEFAULT: '#2D2E2F',
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#2D2E2F',
          600: '#1A1A1A',
          700: '#141414',
          800: '#0F0F0F',
          900: '#0A0A0A',
        },
        surface: {
          DEFAULT: '#F0F4F8',
          alt: '#E8EEF4',
          card: '#FFFFFF',
        },
        success: '#52B788',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(30, 58, 95, 0.08)',
        'glass-lg': '0 12px 48px rgba(30, 58, 95, 0.12)',
        'card': '0 1px 3px rgba(30, 58, 95, 0.06), 0 1px 2px rgba(30, 58, 95, 0.04)',
        'card-hover': '0 10px 40px rgba(30, 58, 95, 0.12)',
        'stat': '0 4px 24px rgba(30, 58, 95, 0.08)',
        'bottom-bar': '0 -4px 24px rgba(30, 58, 95, 0.06)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E3A5F 0%, #537BA7 100%)',
        'gradient-accent': 'linear-gradient(135deg, #52B788 0%, #6EE7B7 100%)',
        'gradient-dark': 'linear-gradient(135deg, #060E13 0%, #1E3A5F 100%)',
        'gradient-surface': 'linear-gradient(180deg, #F0F4F8 0%, #E8EEF4 100%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
