import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    watch: {
      ignored: ['**/dist/**', '**/.vercel/**', '**/.git/**', '**/.agents/**'],
    },
    historyApiFallback: true,
    proxy: {
      // Proxy per le API serverless Vercel in locale (vercel dev gira su :3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
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
