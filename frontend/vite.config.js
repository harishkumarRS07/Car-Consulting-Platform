import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
      },
    },
  },
  build: {
    // Production build optimizations
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'production' ? false : 'inline',
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-icons'],
        },
      },
    },
  },
  // Environment variables
  define: {
    'process.env.VITE_ENV': JSON.stringify(process.env.VITE_ENV || 'development'),
  },
});
