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

    // === New: Disable minification and keep names ===
    build: {
      minify: false,        // stops all whitespace removal and mangling
      sourcemap: true,      // generates .map files so browser devtools show your original code
    },
    esbuild: {
      minifyIdentifiers: false,  // preserves variable/function names (backup)
      keepNames: true,           // ensures function/class names are untouched
    },
});
