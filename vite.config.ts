import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dining: resolve(__dirname, 'dining.html'),
        kitchen: resolve(__dirname, 'kitchen.html'),
      },
    },
  },
  server: {
    port: 3000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    watch: {
      ignored: ['**/dist/**', '**/.vercel/**', '**/.git/**', '**/.agents/**', '**/video_out/**', '**/scratch/**'],
    },
    proxy: {
      '/api-octorate': {
        target: 'https://api.octorate.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-octorate/, ''),
      },
    },
  },
  preview: {
    port: 4173,
  },
});

