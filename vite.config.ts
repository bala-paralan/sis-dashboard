import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/sis-dashboard/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('hls.js') || id.includes('node_modules/hls.js')) {
            return 'vendor-hls'
          }
          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'vendor-leaflet'
          }
          if (id.includes('zustand')) {
            return 'vendor-zustand'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.tsx',
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
});
