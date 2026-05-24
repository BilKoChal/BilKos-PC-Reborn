import { ISectionExtension } from '../interfaces';

/**
 * Singleton registry for modular UI/UX panel extensions.
 * Allows generations (like UI extensions in Gen 2 or Gen 3) to register custom blocks
 * that are automatically injected at runtime into the extensible component panels.
 */
class PanelExtensionRegistry {
  private static _instance: PanelExtensionRegistry;
  private _extensions: Map<string, Map<number, ISectionExtension[]>> = new Map();

  static getInstance(): PanelExtensionRegistry {
    if (!this._instance) {
      this._instance = new PanelExtensionRegistry();
    }
    return this._instance;
  }

  /**
   * Registers a section extension for a specific panel and game generation.
   */
  registerExtension(panelId: string, generation: number, extension: ISectionExtension): void {
    if (!this._extensions.has(panelId)) {
      this._extensions.set(panelId, new Map());
    }
    const genMap = this._extensions.get(panelId)!;
    if (!genMap.has(generation)) {
      genMap.set(generation, []);
    }
    const list = genMap.get(generation)!;
    // Prevent duplicate registrations
    if (!list.some(ext => ext.id === extension.id)) {
      list.push(extension);
    }
  }

  /**
   * Clears registered extensions (useful for testing or hot reloads).
   */
  clear(): void {
    this._extensions.clear();
  }

  /**
   * Retrieves all registered section extensions for a panel and generation.
   */
  getExtensions(panelId: string, generation: number): ISectionExtension[] {
    return this._extensions.get(panelId)?.get(generation) || [];
  }
}

export const extensionRegistry = PanelExtensionRegistry.getInstance();
