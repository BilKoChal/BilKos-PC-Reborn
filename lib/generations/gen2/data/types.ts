/**
 * Gen 2 (Gold/Silver/Crystal) type data.
 *
 * This module owns ALL Gen2-specific type information:
 * - Species → type mapping for Gen2's 251 Pokémon (including Steel/Dark additions)
 * - Gen2 internal type ID map (used in save file byte layout)
 * - Type name lookup from Gen2 internal IDs
 *
 * Gen2 introduced Steel and Dark types. Some Gen1 Pokémon gained the Steel
 * type in Gen2 (most notably Magnemite/Magneton: Electric → Electric/Steel).
 *
 * This data was previously housed in `gen1/data/pokemonTypes.ts` with a
 * `generation === 2` branch, which violated generation namespace isolation.
 */

// ─── Gen2 Internal Type IDs (offset 0x05/0x06 in save structure) ───
// Gen2 extends Gen1's internal IDs with Steel and Dark.
export const GEN2_TYPE_ID_MAP: Record<string, number> = {
  'Normal': 0, 'Fighting': 1, 'Flying': 2, 'Poison': 3,
  'Ground': 4, 'Rock': 5, 'Bug': 7, 'Ghost': 8,
  'Steel': 9,  // New in Gen2
  'Fire': 20, 'Water': 21, 'Grass': 22, 'Electric': 23,
  'Psychic': 24, 'Ice': 25, 'Dragon': 26,
  'Dark': 27,  // New in Gen2
};

/** Get Gen2 internal type ID from type name. Returns 0 for unknown. */
export function getGen2InternalTypeId(typeName: string): number {
  return GEN2_TYPE_ID_MAP[typeName] ?? 0;
}

/** Get type name from Gen2 internal type ID. Returns 'Unknown' for unknown. */
export function getGen2TypeName(typeId: number): string {
  const GSC_TYPES: Record<number, string> = {
    0: "Normal", 1: "Fighting", 2: "Flying", 3: "Poison", 4: "Ground",
    5: "Rock", 7: "Bug", 8: "Ghost", 9: "Steel",
    20: "Fire", 21: "Water", 22: "Grass", 23: "Electric",
    24: "Psychic", 25: "Ice", 26: "Dragon", 27: "Dark"
  };
  return GSC_TYPES[typeId] || "Unknown";
}

// ─── Species → Type Mapping ───

/**
 * Gen2 species type data.
 *
 * Covers all 251 species with Gen2-correct typings.
 * For Gen1 species 1-151, this includes type corrections from Gen1
 * (e.g. Magnemite/Magneton gained Steel type in Gen2).
 * For Gen2 species 152-251, these are the original GSC typings.
 */
export const GSC_SPECIES_TYPES: Record<number, string[]> = {
  // Gen1 species with Gen2 corrections
  81: ['Electric', 'Steel'],   // Magnemite — gained Steel in Gen2
  82: ['Electric', 'Steel'],   // Magneton — gained Steel in Gen2

  // Gen2 Johto species (152-251)
  152: ['Grass'], 153: ['Grass'], 154: ['Grass'],
  155: ['Fire'], 156: ['Fire'], 157: ['Fire'],
  158: ['Water'], 159: ['Water'], 160: ['Water'],
  161: ['Normal'], 162: ['Normal'],
  163: ['Normal', 'Flying'], 164: ['Normal', 'Flying'],
  165: ['Bug', 'Flying'], 166: ['Bug', 'Flying'],
  167: ['Bug', 'Poison'], 168: ['Bug', 'Poison'],
  169: ['Poison', 'Flying'],
  170: ['Water', 'Electric'], 171: ['Water', 'Electric'],
  172: ['Electric'], 173: ['Normal'], 174: ['Normal'],
  175: ['Normal'], 176: ['Normal', 'Flying'],
  177: ['Psychic', 'Flying'], 178: ['Psychic', 'Flying'],
  179: ['Electric'], 180: ['Electric'], 181: ['Electric'],
  182: ['Grass'],
  183: ['Water'], 184: ['Water'],
  185: ['Rock'],
  186: ['Water'],
  187: ['Grass', 'Flying'], 188: ['Grass', 'Flying'], 189: ['Grass', 'Flying'],
  190: ['Normal'],
  191: ['Grass'], 192: ['Grass'],
  193: ['Bug', 'Flying'],
  194: ['Water', 'Ground'], 195: ['Water', 'Ground'],
  196: ['Psychic'], 197: ['Dark'],
  198: ['Dark', 'Flying'],
  199: ['Water', 'Psychic'],
  200: ['Ghost'],
  201: ['Psychic'],
  202: ['Psychic'],
  203: ['Normal', 'Psychic'],
  204: ['Bug'], 205: ['Bug', 'Steel'],
  206: ['Normal'],
  207: ['Ground', 'Flying'],
  208: ['Steel', 'Ground'],
  209: ['Normal'], 210: ['Normal'],
  211: ['Water', 'Poison'],
  212: ['Bug', 'Steel'],
  213: ['Bug', 'Rock'],
  214: ['Bug', 'Fighting'],
  215: ['Dark', 'Ice'],
  216: ['Normal'], 217: ['Normal'],
  218: ['Fire'], 219: ['Fire', 'Rock'],
  220: ['Ice', 'Ground'], 221: ['Ice', 'Ground'],
  222: ['Water', 'Rock'],
  223: ['Water'], 224: ['Water'],
  225: ['Ice', 'Flying'],
  226: ['Water', 'Flying'],
  227: ['Steel', 'Flying'],
  228: ['Dark', 'Fire'], 229: ['Dark', 'Fire'],
  230: ['Water', 'Dragon'],
  231: ['Ground'], 232: ['Ground'],
  233: ['Normal'],
  234: ['Normal'],
  235: ['Normal'],
  236: ['Fighting'], 237: ['Fighting'],
  238: ['Ice', 'Psychic'],
  239: ['Electric'],
  240: ['Fire'],
  241: ['Normal'],
  242: ['Normal'],
  243: ['Electric'], 244: ['Fire'], 245: ['Water'],
  246: ['Rock', 'Ground'], 247: ['Rock', 'Ground'], 248: ['Rock', 'Dark'],
  249: ['Psychic', 'Flying'],
  250: ['Fire', 'Flying'],
  251: ['Grass', 'Psychic'],
};

/**
 * Get Pokémon types for a given dex ID in Gen 2 context.
 *
 * Looks up Gen2-specific type overrides first (e.g. Magnemite/Magneton
 * Steel type), then falls back to the shared Gen1 NATIONAL_DEX_TYPES
 * for species 1-151 that weren't retyped.
 *
 * @param dexId - National Dex ID
 * @param gen1Fallback - Fallback type lookup for Gen1 species without Gen2 overrides
 * @returns Array of type name strings (e.g. ['Electric', 'Steel'])
 */
export function getGen2PokemonTypes(
  dexId: number,
  gen1Fallback?: (dexId: number) => string[]
): string[] {
  // Check Gen2-specific overrides first (Magnemite/Magneton + all Johto species)
  const gscTypes = GSC_SPECIES_TYPES[dexId];
  if (gscTypes) return gscTypes;

  // Fall back to Gen1 types for Kanto species not retyped in Gen2
  if (gen1Fallback) return gen1Fallback(dexId);

  return ['Normal'];
}

/**
 * Build the full type info object for a Gen2 Pokémon.
 * Used by the Gen2 adapter's getTypes() method.
 */
export function getGen2TypeInfo(
  dexId: number,
  gen1Fallback?: (dexId: number) => string[]
): { type1: number; type2: number; type1Name: string; type2Name: string } {
  const types = getGen2PokemonTypes(dexId, gen1Fallback);
  const type1Name = types[0] || 'Normal';
  const type2Name = types[1] || type1Name;

  return {
    type1: GEN2_TYPE_ID_MAP[type1Name] ?? 0,
    type2: GEN2_TYPE_ID_MAP[type2Name] ?? 0,
    type1Name,
    type2Name,
  };
}
