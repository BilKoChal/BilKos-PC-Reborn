import { ParserResult } from './types';
import { registry } from '../core/AdapterRegistry';

/**
 * Shared entry point for parser detection.
 * Delegates actual parsing logic to the active adapter registered in AdapterRegistry.
 */
export const detectAndParseSave = async (file: File): Promise<ParserResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const view = new Uint8Array(arrayBuffer);
    const filename = file.name;

    console.log(`[Parser] Analyzing: ${filename} (${view.length} bytes)`);

    const result = registry.detectAndParse(view, filename);
    if (result.success && result.data) {
      return { success: true, data: result.data };
    }

    return { 
      success: false, 
      error: result.error || "Unsupported or corrupted save file format."
    };

  } catch (err: unknown) {
    console.error("[Parser Error]", err);
    return { success: false, error: "Critical error during file structural analysis." };
  }
};
