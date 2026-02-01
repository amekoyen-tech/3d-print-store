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
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
