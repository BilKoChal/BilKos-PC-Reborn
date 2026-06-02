/**
 * Tiny logging facade (TODO 4.2).
 *
 * Diagnostic logging (`debug`/`info`/`log`/`warn`) is silenced in PRODUCTION
 * builds so the shipped app no longer spams the browser console — e.g. the
 * parser previously logged "[Parser] Analyzing …" for every file opened, and
 * the parsers warn on every malformed/odd-sized buffer. `error` is ALWAYS
 * emitted because genuine failures should surface even in production.
 *
 * Environment detection uses Vite's `import.meta.env.DEV` (true in `vite`/dev
 * and in the vitest test runner, false in `vite build`). Access is wrapped in a
 * type-safe cast (NOT `as any`) because this project's tsconfig only pulls in
 * Node types, so `import.meta.env` isn't in the ambient `ImportMeta` type.
 */

interface ViteLikeEnv {
  DEV?: boolean;
  PROD?: boolean;
  MODE?: string;
}

function detectDev(): boolean {
  try {
    const env = (import.meta as unknown as { env?: ViteLikeEnv }).env;
    if (!env) return true; // No bundler env (plain Node) → treat as dev/verbose.
    if (typeof env.DEV === 'boolean') return env.DEV;
    if (typeof env.PROD === 'boolean') return !env.PROD;
    return env.MODE !== 'production';
  } catch {
    return true;
  }
}

const isDev = detectDev();

type LogArgs = readonly unknown[];

export const logger = {
  /** Verbose tracing — dev only. */
  debug: (...args: LogArgs): void => { if (isDev) console.debug(...args); },
  /** Informational — dev only. */
  info: (...args: LogArgs): void => { if (isDev) console.info(...args); },
  /** General logging — dev only. */
  log: (...args: LogArgs): void => { if (isDev) console.log(...args); },
  /** Non-fatal warnings — dev only (kept out of production noise). */
  warn: (...args: LogArgs): void => { if (isDev) console.warn(...args); },
  /** Genuine errors — ALWAYS emitted, including in production. */
  error: (...args: LogArgs): void => { console.error(...args); },
};
