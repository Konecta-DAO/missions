import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import polyfillNode from 'rollup-plugin-polyfill-node';

dotenv.config();

const buildTarget = process.env.BUILD_TARGET;
const isAdmin = buildTarget === 'admin';
const isStats = buildTarget === 'stats';

const rootDir = isAdmin
  ? 'src/admin_frontend'
  : isStats
    ? 'src/stats_frontend'
    : 'src/frontend';

export default defineConfig({
  root: path.resolve(__dirname, rootDir),
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, `${rootDir}/index.html`),
      plugins: [
        polyfillNode()
      ]
    },
    outDir: path.resolve(__dirname, `dist/${buildTarget || 'frontend'}`),
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
          CANISTER_ID_STATS_FRONTEND: process.env.CANISTER_ID_STATS_FRONTEND,
          CANISTER_ID: process.env.CANISTER_ID,
          CANISTER_CANDID_PATH: process.env.CANISTER_CANDID_PATH,
          VITE_USERGEEK_API_KEY: process.env.VITE_USERGEEK_API_KEY,
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
    environment('all', { prefix: 'DEV_' }),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'public/*'),
          dest: '.'
        },
        {
          src: path.resolve(__dirname, `${rootDir}/.well-known`),
          dest: '.'
        },
        {
          src: path.resolve(__dirname, '.ic-assets.json'),
          dest: '.'
        },
        {
          src: path.resolve(__dirname, `${rootDir}/.well-known/ii-alternative-origins`),
          dest: '.well-known'
        }
      ]
    })
  ],
});
