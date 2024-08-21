import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import polyfillNode from 'rollup-plugin-polyfill-node';

dotenv.config();

const isAdmin = process.env.BUILD_TARGET === 'admin';

export default defineConfig({
  root: isAdmin ? path.resolve(__dirname, 'src/admin_frontend') : path.resolve(__dirname, 'src/frontend'),
  build: {
    rollupOptions: {
      input: isAdmin ? path.resolve(__dirname, 'src/admin_frontend/index.html') : path.resolve(__dirname, 'src/frontend/index.html'),
      plugins: [
        polyfillNode()
      ]
    },
    outDir: isAdmin ? path.resolve(__dirname, 'dist/admin') : path.resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env': JSON.stringify({
          DFX_VERSION: process.env.DFX_VERSION,
          DFX_NETWORK: process.env.DFX_NETWORK,
          CANISTER_CANDID_PATH_BACKEND: process.env.CANISTER_CANDID_PATH_BACKEND,
          CANISTER_ID_FRONTEND: process.env.CANISTER_ID_FRONTEND,
          CANISTER_ID_BACKEND: process.env.CANISTER_ID_BACKEND,
          CANISTER_ID_ADMIN_FRONTEND: process.env.CANISTER_ID_ADMIN_FRONTEND,
          CANISTER_ID: process.env.CANISTER_ID,
          CANISTER_CANDID_PATH: process.env.CANISTER_CANDID_PATH,
        })
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
