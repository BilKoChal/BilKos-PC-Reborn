import { logger } from '../utils/logger';
import { IGenerationAdapter } from '../interfaces';
import { ParsedSave } from '../parser/types';
import { LazyFactory } from './LazyFactory';
import type { GameCartridge } from '../../uiTypes';

/**
 * Singleton/Registry to manage generation adapters dynamically.
 * Supports both eager registration (backward-compatible) and lazy registration
 * (via LazyFactory + dynamic import) for code-split per-generation loading.
 *
 * PKHeX comparison: PKHeX uses a hardcoded cascade in SaveUtil.GetTypeInfo()
 * with a switch expression for instantiation — no registry pattern. Our adapter
 * registry is actually MORE dynamic than PKHeX's compile-time wiring, making
 * adding a generation require zero edits to detection/aggregation code.
 *
 * H5: Lazy loading pattern. Detection only needs file size + checksum,
 * so the matching gen's adapter can be dynamically imported after detection.
 * Vite automatically splits each dynamic import() into a separate chunk.
 * Future Gen 3+ adapters will be zero-cost until the user opens a Gen 3 save.
 */
export class AdapterRegistry {
  private _adapters: Map<number, IGenerationAdapter> = new Map();
  private _factories: Map<number, LazyFactory<IGenerationAdapter>> = new Map();

  /**
   * Registers a fully-instantiated adapter (eager, backward-compatible).
   */
  register(adapter: IGenerationAdapter): void {
    this._adapters.set(adapter.generation, adapter);
  }

  /**
   * Registers a lazy factory for a generation adapter.
   * The adapter module is NOT loaded until getAdapterAsync() or preload() is called.
   * Vite treats the `import()` inside the factory as a code-splitting boundary.
   */
  registerLazy(generation: number, factory: LazyFactory<IGenerationAdapter>): void {
    this._factories.set(generation, factory);
  }

  /**
   * Retrieves an adapter for a specific generation (synchronous).
   * Returns cached instances only — does NOT trigger lazy loading.
   * For async loading, use getAdapterAsync().
   */
  getAdapter(generation: number): IGenerationAdapter | undefined {
    // Check eager adapters first
    const eager = this._adapters.get(generation);
    if (eager) return eager;

    // Check if lazy factory has already loaded
    const factory = this._factories.get(generation);
    return factory?.cached;
  }

  /**
   * Retrieves an adapter for a specific generation (async).
   * Triggers lazy loading if the adapter hasn't been loaded yet.
   * First call triggers the dynamic import; subsequent calls return cached instance.
   */
  async getAdapterAsync(generation: number): Promise<IGenerationAdapter | undefined> {
    // Check eager adapters first
    const eager = this._adapters.get(generation);
    if (eager) return eager;

    // Load from lazy factory
    const factory = this._factories.get(generation);
    if (!factory) return undefined;

    const adapter = await factory.get();

    // Cache in the eager map for fast synchronous access later
    this._adapters.set(generation, adapter);
    return adapter;
  }

  /**
   * Returns all currently loaded adapters (synchronous, for already-loaded ones).
   * Does NOT trigger lazy loading of unloaded adapters.
   */
  getAdapters(): IGenerationAdapter[] {
    const loaded = new Map<number, IGenerationAdapter>(this._adapters);
    for (const [gen, factory] of this._factories.entries()) {
      if (factory.isLoaded && factory.cached && !loaded.has(gen)) {
        loaded.set(gen, factory.cached);
      }
    }
    return Array.from(loaded.values());
  }

  /**
   * Aggregate the version cartridges + UI themes contributed by every *loaded*
   * adapter (TODO 1.6). This is the registry-driven counterpart to the static
   * `pokemonGames` aggregate: a Gen 3 adapter's themes appear here automatically
   * once it is registered and loaded — no central literal to edit. Sorted by
   * generation for stable ordering.
   */
  getAllVersionThemes(): GameCartridge[] {
    return this.getAdapters()
      .slice()
      .sort((a, b) => a.generation - b.generation)
      .flatMap(a => a.versionThemes ?? []);
  }

  /**
   * Returns all registered generation numbers (both eager and lazy).
   */
  getRegisteredGenerations(): number[] {
    const gens = new Set<number>(this._adapters.keys());
    for (const gen of this._factories.keys()) {
      gens.add(gen);
    }
    return Array.from(gens).sort((a, b) => a - b);
  }

  /**
   * Preload a specific generation's adapter without using it yet.
   * Useful for preloading after initial page load or on hover.
   */
  async preload(generation: number): Promise<void> {
    const factory = this._factories.get(generation);
    if (factory) {
      const adapter = await factory.get();
      this._adapters.set(generation, adapter);
    }
  }

  /**
   * Preload all registered adapters (async).
   * Useful after initial render to ensure all adapters are available.
   */
  async preloadAll(): Promise<void> {
    const promises = Array.from(this._factories.entries()).map(async ([gen, factory]) => {
      const adapter = await factory.get();
      this._adapters.set(gen, adapter);
    });
    await Promise.all(promises);
  }

  /**
   * Check if a specific generation's adapter is already loaded.
   */
  isLoaded(generation: number): boolean {
    if (this._adapters.has(generation)) return true;
    const factory = this._factories.get(generation);
    return factory?.isLoaded ?? false;
  }

  /**
   * Run the auto-detection cascade across all registered adapters to detect and parse the save.
   * Supports both eager and lazy-loaded adapters.
   * If one adapter detects but fails to parse, the cascade continues to the next adapter.
   *
   * H5: This method is async because lazy-loaded adapters may need to be
   * dynamically imported before they can detect/parse. The async version is
   * detectAndParseAsync(); the synchronous version only checks already-loaded adapters.
   */
  detectAndParse(buffer: Uint8Array, filename: string): { success: boolean; generation?: number; data?: ParsedSave; error?: string; ambiguous?: boolean } {
    // Synchronous: only checks already-loaded adapters
    let lastError: string | undefined;
    for (const [gen, adapter] of this._adapters.entries()) {
      const detectResult = adapter.detectSave(buffer, filename);
      if (detectResult.detected) {
        try {
          const parsed = adapter.parseSave(buffer, filename);
          return {
            success: true,
            generation: gen,
            data: parsed,
            ambiguous: detectResult.ambiguous
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          lastError = `Failed to parse detected save for Gen ${gen}: ${message}`;
          logger.warn(lastError);
          continue;
        }
      }
    }
    return {
      success: false,
      error: lastError || `Unsupported save format. No compatible generation adapter found for this file size (${buffer.length} bytes).`
    };
  }

  /**
   * Async version of detectAndParse that loads lazy adapters as needed.
   * Loads ALL registered adapters (eager + lazy) before attempting detection,
   * following PKHeX's sequential probe pattern.
   */
  async detectAndParseAsync(buffer: Uint8Array, filename: string): Promise<{ success: boolean; generation?: number; data?: ParsedSave; error?: string; ambiguous?: boolean }> {
    // Ensure all lazy adapters are loaded
    await this.preloadAll();

    // Now run the synchronous detection on all loaded adapters
    return this.detectAndParse(buffer, filename);
  }
}

// Global registry singleton.
// H5: Gen 1 and Gen 2 are registered via lazy factories so Vite can code-split
// them into separate chunks. The first call to getAdapterAsync() or preload()
// triggers the dynamic import; subsequent calls use the cached instance.
export const registry = new AdapterRegistry();

registry.registerLazy(1, new LazyFactory(() =>
  import('../generations/gen1/Gen1Adapter').then(m => new m.Gen1Adapter())
));
registry.registerLazy(2, new LazyFactory(() =>
  import('../generations/gen2/Gen2Adapter').then(m => new m.Gen2Adapter())
));
