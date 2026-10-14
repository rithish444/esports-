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
        arena: {
          bg: '#0a0d14',
          card: '#111726',
          cardHover: '#161f33',
          border: '#1f2b45',
          neonCyan: '#00f2fe',
          neonOrange: '#ff7700',
          neonGreen: '#00ff88',
          neonRed: '#ff2e4d',
          gold: '#ffd700'
        }
      },
      fontFamily: {
        gaming: ['Rajdhani', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.35)',
        'neon-orange': '0 0 20px -3px rgba(255, 119, 0, 0.35)',
        'neon-green': '0 0 20px -3px rgba(0, 255, 136, 0.35)',
        'neon-red': '0 0 20px -3px rgba(255, 46, 77, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 242, 254, 0.2), inset 0 0 5px rgba(0, 242, 254, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 242, 254, 0.6), inset 0 0 10px rgba(0, 242, 254, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
