/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        exodus: {
          background: '#1a1b24',
          backgroundLight: '#2a2c39',
          text: '#ffffff',
          textSecondary: '#8f91a2',
          accent: '#5d65f6',
          green: '#3dd598',
          red: '#ff5c5c',
          yellow: '#ffba49',
          blue: '#4e7cff',
          purple: '#9c6bff',
          cyan: '#38c6db',
        },
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
}
