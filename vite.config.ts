import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

dotenv.config();

const isAdmin = process.env.BUILD_TARGET === 'admin';

export default defineConfig({
  root: isAdmin ? path.resolve(__dirname, 'src/admin_frontend') : path.resolve(__dirname, 'src/frontend'),
  build: {
    rollupOptions: {
      input: isAdmin ? path.resolve(__dirname, 'src/admin_frontend/index.html') : path.resolve(__dirname, 'src/frontend/index.html')
    },
    outDir: isAdmin ? path.resolve(__dirname, 'dist/admin') : path.resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' }),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, isAdmin ? 'src/admin_frontend/.well-known' : 'src/frontend/.well-known'),
          dest: '.'
        }
      ]
    })
  ],
});