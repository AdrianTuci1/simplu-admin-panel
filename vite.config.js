import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Production optimizations
  build: {
    // Enable source maps for debugging in production
    sourcemap: false,
    
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          auth: ['react-oidc-context'],
          ui: ['react-icons'],
          payments: ['@stripe/react-stripe-js', '@stripe/stripe-js']
        }
      }
    },
    
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Optimize development server
  server: {
    allowedHosts: true,
    port: 3000,
    host: true,
  },
  
  // Optimize preview server
  preview: {
    port: 4173,
    host: true
  },
  
  // Optimize CSS
  css: {
    devSourcemap: false
  }
})
