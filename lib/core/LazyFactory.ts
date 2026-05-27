/**
 * LazyFactory — Deferred loading and instantiation of a module.
 *
 * Following PKHeX's pattern where save format handlers are loaded on-demand
 * (rather than all PersonalTables at once), this factory defers both the
 * dynamic import AND the class instantiation until the first call to get().
 *
 * Key design decisions (adapted from PKHeX for web):
 * - PKHeX eagerly loads ALL 23 PersonalTables (~1.23 MB + object overhead)
 *   because it's a desktop app where 8 MB is trivial. For a web app, we
 *   must lazy-load per-generation to keep the initial bundle small.
 * - PKHeX uses C# static constructors for lazy initialization; we use
 *   dynamic import() + Promise caching.
 * - PKHeX's sequential probe pattern (IsG1, IsG2, ...) stops at first match;
 *   our LazyFactory allows loading only the matching generation's adapter.
 *
 * Usage with AdapterRegistry:
 * ```ts
 * registry.registerLazy(1, new LazyFactory(() =>
 *   import('../generations/gen1/Gen1Adapter').then(m => new m.Gen1Adapter())
 * ));
 * ```
 *
 * Vite automatically code-splits each dynamic import() into a separate chunk.
 * Future Gen 3+ adapters will be zero-cost until the user opens a Gen 3 save.
 */
export class LazyFactory<T> {
  private instance: T | undefined;
  private loader: () => Promise<T>;
  private loading: Promise<T> | undefined;

  constructor(loader: () => Promise<T>) {
    this.loader = loader;
  }

  /**
   * Get or create the instance. Concurrent calls share the same Promise
   * (prevents double-loading if get() is called while already loading).
   */
  async get(): Promise<T> {
    if (this.instance !== undefined) return this.instance;
    if (this.loading) return this.loading;

    this.loading = this.loader().then((inst) => {
      this.instance = inst;
      this.loading = undefined;
      return inst;
    });

    return this.loading;
  }

  /** Check if the instance has already been loaded. */
  get isLoaded(): boolean {
    return this.instance !== undefined;
  }

  /** Get the cached instance synchronously (returns undefined if not loaded yet). */
  get cached(): T | undefined {
    return this.instance;
  }

  /** Force reload (e.g., after a hot module replacement). */
  reset(): void {
    this.instance = undefined;
    this.loading = undefined;
  }
}
