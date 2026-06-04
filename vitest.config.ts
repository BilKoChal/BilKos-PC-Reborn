import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      // Coverage gate (TODO 5.7): thresholds set as a *floor* just below the
      // current numbers so `npm run test:coverage` passes today and any drop
      // fails CI. Ratchet these upward as coverage improves.
      thresholds: {
        statements: 55,
        lines: 55,
        functions: 42,
        branches: 37,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
