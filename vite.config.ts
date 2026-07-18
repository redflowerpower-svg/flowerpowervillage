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
