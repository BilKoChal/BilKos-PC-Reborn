/**
 * Vitest global setup (TODO §5 — component/render test harness).
 *
 * Registers the jest-dom matchers (e.g. `toBeInTheDocument`, `toHaveAttribute`)
 * and tears down any mounted React tree after each test. The logic-only tests
 * run under the default `node` environment and never touch the DOM; component
 * tests opt in per-file with `// @vitest-environment happy-dom`.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  // Only relevant when a component test mounted a tree (happy-dom env).
  if (typeof document !== 'undefined') {
    cleanup();
  }
});
