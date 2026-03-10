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
          DEFAULT: '#76CB58',
          50: '#F5F9EB',
          100: '#E8F5E9',
          200: '#D1EBC2',
          300: '#BAE19B',
          400: '#A3D674',
          500: '#76CB58',
          600: '#5BA844',
          700: '#478635',
          800: '#336426',
          900: '#1F4217',
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
        accent: {
          DEFAULT: '#F5A623',
          50: '#FEF6E8',
          100: '#FDEDD1',
          200: '#FBDBA3',
          300: '#F9C975',
          400: '#F7B74C',
          500: '#F5A623',
          600: '#C4851C',
          700: '#936415',
          800: '#62430E',
          900: '#312107',
        },
        success: '#76CB58',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
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
      },
    },
  },
  plugins: [],
};
