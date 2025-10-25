/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3f7',
          100: '#ebe6f0',
          200: '#d6cce1',
          300: '#b8a6c7',
          400: '#9a7fad',
          500: '#76459b', // Main brand color
          600: '#6a3d8a',
          700: '#5e3579',
          800: '#522d68',
          900: '#462557',
        },
        secondary: {
          50: '#f8f7f9',
          100: '#f1eff3',
          200: '#e3dfe7',
          300: '#d0c9d5',
          400: '#b8aebf',
          500: '#9d8fa9',
          600: '#8a7a96',
          700: '#756680',
          800: '#62546a',
          900: '#4f4354',
        },
        accent: {
          50: '#faf9fb',
          100: '#f5f3f7',
          200: '#ebe6f0',
          300: '#d6cce1',
          400: '#b8a6c7',
          500: '#9a7fad',
          600: '#8a6f9a',
          700: '#7a5f87',
          800: '#6a4f74',
          900: '#5a3f61',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
        'ethiopian': ['Noto Sans Ethiopic', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'tilet-pattern': `
          radial-gradient(circle at 25% 25%, rgba(118, 69, 155, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(118, 69, 155, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, rgba(118, 69, 155, 0.05) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(118, 69, 155, 0.05) 25%, transparent 25%)
        `,
        'tilet-subtle': `
          linear-gradient(135deg, rgba(118, 69, 155, 0.03) 0%, rgba(118, 69, 155, 0.08) 100%)
        `,
        'tilet-border': `
          linear-gradient(90deg, transparent 0%, rgba(118, 69, 155, 0.2) 50%, transparent 100%)
        `
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'tilet': '0 4px 6px -1px rgba(118, 69, 155, 0.1), 0 2px 4px -1px rgba(118, 69, 155, 0.06)',
        'tilet-lg': '0 10px 15px -3px rgba(118, 69, 155, 0.1), 0 4px 6px -2px rgba(118, 69, 155, 0.05)',
        'tilet-xl': '0 20px 25px -5px rgba(118, 69, 155, 0.1), 0 10px 10px -5px rgba(118, 69, 155, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
