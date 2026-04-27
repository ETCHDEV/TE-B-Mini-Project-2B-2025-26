/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        dataprep: {
          bg: '#1a1f3a',
          panel: '#2d3a5f',
          accent: '#1dd1a1',
          secondary: '#26d0ce',
          deep: '#0f1422',
        },
      },
      boxShadow: {
        panel: '0 4px 24px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(29, 209, 161, 0.25)',
        glowMagenta: '0 0 48px rgba(168, 85, 247, 0.2)',
      },
      backgroundSize: {
        '200': '200% 200%',
        '300': '300% 100%',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '40%': { transform: 'translate(8%, -6%) scale(1.08)' },
          '70%': { transform: 'translate(-6%, 5%) scale(0.96)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'shimmer-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up-delayed': 'fade-in-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both',
        'fade-in-up-slow': 'fade-in-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both',
        'float-slow': 'float-slow 16s ease-in-out infinite',
        'float-slower': 'float-slow 22s ease-in-out infinite reverse',
        'pulse-soft': 'pulse-soft 2.8s ease-in-out infinite',
        'gradient-flow': 'gradient-flow 10s ease infinite',
        'shimmer-line': 'shimmer-line 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
