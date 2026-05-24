import { IGenerationAdapter, IGenerationMetadata, IGenerationBinaryOps } from '../interfaces';
import { ParsedSave } from '../parser/types';
import { Gen1Adapter } from '../generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../generations/gen2/Gen2Adapter';

/**
 * Singleton/Registry to manage generation adapters dynamically.
 * Provides APIs to register adapters and automatically parse uploaded saves
 * through a detection cascade.
 */
export class AdapterRegistry {
  private _adapters: Map<number, IGenerationAdapter> = new Map();

  /**
   * Registers a new generation adapter.
   */
  register(adapter: IGenerationAdapter): void {
    this._adapters.set(adapter.generation, adapter);
  }

  /**
   * Retrieves an adapter for a specific generation.
   */
  getAdapter(generation: number): IGenerationAdapter | undefined {
    return this._adapters.get(generation);
  }

  /**
   * Returns all registered adapters.
   */
  getAdapters(): IGenerationAdapter[] {
    return Array.from(this._adapters.values());
  }

  /**
   * Run the auto-detection cascade across all registered adapters to detect and parse the save.
   * If one adapter detects but fails to parse, the cascade continues to the next adapter.
   */
  detectAndParse(buffer: Uint8Array, filename: string): { success: boolean; generation?: number; data?: ParsedSave; error?: string } {
    let lastError: string | undefined;
    for (const [gen, adapter] of this._adapters.entries()) {
      const detectResult = adapter.detectSave(buffer, filename);
      if (detectResult.detected) {
        try {
          const parsed = adapter.parseSave(buffer, filename);
          return {
            success: true,
            generation: gen,
            data: parsed
          };
        } catch (err: unknown) {
          // Parse failed for this adapter, but try the next one
          const message = err instanceof Error ? err.message : String(err);
          lastError = `Failed to parse detected save for Gen ${gen}: ${message}`;
          console.warn(lastError);
          continue; // Fall through to the next adapter instead of returning immediately
        }
      }
    }
    return {
      success: false,
      error: lastError || `Unsupported save format. No compatible generation adapter found for this file size (${buffer.length} bytes).`
    };
  }
}

// Global registry singleton with native pre-registered adapters
export const registry = new AdapterRegistry();
registry.register(new Gen1Adapter());
registry.register(new Gen2Adapter());
