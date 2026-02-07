/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          matte: '#121212',
          carbon: '#1E1E1E',
          soft: '#2A2A2A',
        },
        heat: '#FF5722',
        steel: '#2196F3',
      },
      fontSize: {
        'micro': ['10px', { lineHeight: '14px', letterSpacing: '0.05em' }],
        'nano': ['11px', { lineHeight: '16px', letterSpacing: '0.05em' }],
        'caption': ['13px', { lineHeight: '18px', letterSpacing: '0.02em' }],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
