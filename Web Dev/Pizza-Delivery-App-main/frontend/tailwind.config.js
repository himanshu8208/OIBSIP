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
          DEFAULT: '#ff6b08',
          hover: '#ff8c3b',
          dark: '#e05300',
          glow: 'rgba(255, 107, 8, 0.4)'
        },
        dark: {
          bg: '#0e0e10',
          card: '#16161a',
          border: '#232329',
          text: '#f1f1f3',
          muted: '#8b8b9e'
        },
        veg: '#2ecc71',
        nonveg: '#e74c3c'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        accent: ['Orbitron', 'sans-serif']
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 8, 0.35)',
        'glow-green': '0 0 20px rgba(46, 204, 113, 0.35)',
        'glow-red': '0 0 20px rgba(231, 76, 60, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backdropBlur: {
        'glass': '12px'
      }
    },
  },
  plugins: [],
}
