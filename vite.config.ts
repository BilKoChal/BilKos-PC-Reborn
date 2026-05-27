// vite.config.ts
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/BilKos-PC-Reborn/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          // H5: Split per-generation data into separate chunks.
          // Following PKHeX's per-generation PersonalTable pattern where each gen's
          // data is self-contained, we split each lib/generations/genN directory into
          // its own chunk. This prevents the single JS bundle from growing by 100KB+
          // per generation added. When adapters are lazy-loaded (registerLazy), Vite
          // automatically creates separate chunks for each dynamic import(). The
          // manualChunks function here provides additional control for vendor splitting.
          manualChunks(id) {
            // Split React into its own cacheable vendor chunk
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
            // Per-generation chunks are automatically created by dynamic import()
            // in AdapterRegistry (registerLazy). No explicit manualChunks needed
            // for lib/generations/* — Vite handles it via code splitting.
          },
        },
      },
    },
});
