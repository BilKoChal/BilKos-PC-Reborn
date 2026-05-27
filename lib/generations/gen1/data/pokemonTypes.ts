/**
 * Gen 1 (Red/Blue/Yellow) type data.
 *
 * This module owns ALL Gen1-specific type information:
 * - Species → type mapping for Gen1's 151 Pokémon
 * - Gen1 internal type ID map (used in save file byte layout)
 * - Type name lookup from Gen1 internal IDs
 *
 * IMPORTANT: The canonical TYPE_MAP (name → modern ID) has been moved
 * to the shared `lib/data/types.ts`. Each generation's internal ID map
 * lives in its own genN/data/types.ts.
 *
 * Gen2 type data now lives in `lib/generations/gen2/data/types.ts`.
 * The `generation === 2` branch has been removed from getPokemonTypes().
 */

// Re-export canonical TYPE_MAP from shared location for backward compatibility
export { TYPE_MAP } from '../../../data/types';

// Internal Gen 1 Type IDs (Offset 0x05/0x06 in Save)
export const GEN1_TYPE_ID_MAP: Record<string, number> = {
    'Normal': 0, 'Fighting': 1, 'Flying': 2, 'Poison': 3, 'Ground': 4, 'Rock': 5,
    'Bug': 7, 'Ghost': 8,
    'Fire': 20, 'Water': 21, 'Grass': 22, 'Electric': 23, 'Psychic': 24, 'Ice': 25, 'Dragon': 26
};

export const getTypeName = (typeId: number): string => {
    // Gen 1 Type Table
    const types: Record<number, string> = {
        0: 'Normal', 1: 'Fighting', 2: 'Flying', 3: 'Poison', 4: 'Ground', 5: 'Rock',
        7: 'Bug', 8: 'Ghost', 20: 'Fire', 21: 'Water', 22: 'Grass', 23: 'Electric',
        24: 'Psychic', 25: 'Ice', 26: 'Dragon'
    };
    return types[typeId] || 'Unknown';
};

// Mapping of National Dex ID to Type Names
// STRICTLY GEN 1 TYPINGS (Magnemite/Magneton are pure Electric in Gen 1)
export const NATIONAL_DEX_TYPES: Record<number, string[]> = {
  1: ['Grass', 'Poison'], 2: ['Grass', 'Poison'], 3: ['Grass', 'Poison'],
  4: ['Fire'], 5: ['Fire'], 6: ['Fire', 'Flying'],
  7: ['Water'], 8: ['Water'], 9: ['Water'],
  10: ['Bug'], 11: ['Bug'], 12: ['Bug', 'Flying'],
  13: ['Bug', 'Poison'], 14: ['Bug', 'Poison'], 15: ['Bug', 'Poison'],
  16: ['Normal', 'Flying'], 17: ['Normal', 'Flying'], 18: ['Normal', 'Flying'],
  19: ['Normal'], 20: ['Normal'],
  21: ['Normal', 'Flying'], 22: ['Normal', 'Flying'],
  23: ['Poison'], 24: ['Poison'],
  25: ['Electric'], 26: ['Electric'],
  27: ['Ground'], 28: ['Ground'],
  29: ['Poison'], 30: ['Poison'], 31: ['Poison', 'Ground'],
  32: ['Poison'], 33: ['Poison'], 34: ['Poison', 'Ground'],
  35: ['Normal'], 36: ['Normal'],
  37: ['Fire'], 38: ['Fire'],
  39: ['Normal'], 40: ['Normal'],
  41: ['Poison', 'Flying'], 42: ['Poison', 'Flying'],
  43: ['Grass', 'Poison'], 44: ['Grass', 'Poison'], 45: ['Grass', 'Poison'],
  46: ['Bug', 'Grass'], 47: ['Bug', 'Grass'],
  48: ['Bug', 'Poison'], 49: ['Bug', 'Poison'],
  50: ['Ground'], 51: ['Ground'],
  52: ['Normal'], 53: ['Normal'],
  54: ['Water'], 55: ['Water'],
  56: ['Fighting'], 57: ['Fighting'],
  58: ['Fire'], 59: ['Fire'],
  60: ['Water'], 61: ['Water'], 62: ['Water', 'Fighting'],
  63: ['Psychic'], 64: ['Psychic'], 65: ['Psychic'],
  66: ['Fighting'], 67: ['Fighting'], 68: ['Fighting'],
  69: ['Grass', 'Poison'], 70: ['Grass', 'Poison'], 71: ['Grass', 'Poison'],
  72: ['Water', 'Poison'], 73: ['Water', 'Poison'],
  74: ['Rock', 'Ground'], 75: ['Rock', 'Ground'], 76: ['Rock', 'Ground'],
  77: ['Fire'], 78: ['Fire'],
  79: ['Water', 'Psychic'], 80: ['Water', 'Psychic'],
  81: ['Electric'], 82: ['Electric'], // Magnemite/Magneton Pure Electric in Gen 1
  83: ['Normal', 'Flying'],
  84: ['Normal', 'Flying'], 85: ['Normal', 'Flying'],
  86: ['Water'], 87: ['Water', 'Ice'],
  88: ['Poison'], 89: ['Poison'],
  90: ['Water'], 91: ['Water', 'Ice'],
  92: ['Ghost', 'Poison'], 93: ['Ghost', 'Poison'], 94: ['Ghost', 'Poison'],
  95: ['Rock', 'Ground'],
  96: ['Psychic'], 97: ['Psychic'],
  98: ['Water'], 99: ['Water'],
  100: ['Electric'], 101: ['Electric'],
  102: ['Grass', 'Psychic'], 103: ['Grass', 'Psychic'],
  104: ['Ground'], 105: ['Ground'],
  106: ['Fighting'], 107: ['Fighting'],
  108: ['Normal'],
  109: ['Poison'], 110: ['Poison'],
  111: ['Ground', 'Rock'], 112: ['Ground', 'Rock'],
  113: ['Normal'],
  114: ['Grass'],
  115: ['Normal'],
  116: ['Water'], 117: ['Water'],
  118: ['Water'], 119: ['Water'],
  120: ['Water'], 121: ['Water', 'Psychic'],
  122: ['Psychic'],
  123: ['Bug', 'Flying'],
  124: ['Ice', 'Psychic'],
  125: ['Electric'],
  126: ['Fire'],
  127: ['Bug'],
  128: ['Normal'],
  129: ['Water'], 130: ['Water', 'Flying'],
  131: ['Water', 'Ice'],
  132: ['Normal'],
  133: ['Normal'], 134: ['Water'], 135: ['Electric'], 136: ['Fire'],
  137: ['Normal'],
  138: ['Rock', 'Water'], 139: ['Rock', 'Water'],
  140: ['Rock', 'Water'], 141: ['Rock', 'Water'],
  142: ['Rock', 'Flying'],
  143: ['Normal'],
  144: ['Ice', 'Flying'],
  145: ['Electric', 'Flying'],
  146: ['Fire', 'Flying'],
  147: ['Dragon'], 148: ['Dragon'], 149: ['Dragon', 'Flying'],
  150: ['Psychic'], 151: ['Psychic'],
};

/**
 * Get Pokémon types for a given dex ID in Gen 1 context.
 *
 * This function is Gen1-only. Gen2 type lookup should use
 * `gen2/data/types.ts::getGen2PokemonTypes()` or `adapter.getTypes()`.
 *
 * @param dexId - National Dex ID
 * @returns Array of type name strings (e.g. ['Electric'])
 */
export function getPokemonTypes(dexId: number): string[] {
    return NATIONAL_DEX_TYPES[dexId] || ['Normal'];
}
