import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core bundle
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase SDK bundle (loaded only when needed)
          'vendor-firebase': [
            'firebase/app',
            'firebase/firestore',
            'firebase/storage',
            'firebase/auth'
          ],
          // Animation library bundle
          'vendor-animation': ['framer-motion'],
          // UI utilities bundle
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging (can disable if not needed)
    sourcemap: false,
  },
  // Optimize deps for faster cold starts
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['firebase'],
  },
})
