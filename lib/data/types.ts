/**
 * Shared, generation-agnostic type data.
 *
 * The canonical TYPE_MAP uses the "modern" type ID scheme (Gen3+ order),
 * which is also what PKHeX uses as its universal MoveType enum.
 * Each generation's adapter may maintain its own internal type ID map
 * (e.g. Gen1 uses Fire=20 internally, Gen2 uses Steel=9, Dark=27)
 * for save-file byte mapping; those live in `genN/data/types.ts`.
 *
 * UI components and adapters that only need the canonical name→ID or
 * ID→name mapping should import from this shared module.
 */

// Canonical type name → ID (Gen3+ / PKHeX order)
export const TYPE_MAP: Record<string, number> = {
  "Normal": 0,
  "Fighting": 1,
  "Flying": 2,
  "Poison": 3,
  "Ground": 4,
  "Rock": 5,
  "Bug": 6,
  "Ghost": 7,
  "Steel": 8,
  "Fire": 9,
  "Water": 10,
  "Grass": 11,
  "Electric": 12,
  "Psychic": 13,
  "Ice": 14,
  "Dragon": 15,
  "Dark": 16,
  "Fairy": 17,
  "???": 18,
  "Stellar": 19,
};

/** Reverse lookup: canonical ID → type name */
export const TYPE_NAME_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([name, id]) => [id, name])
);

/** Get canonical type ID from name. Returns 0 (Normal) for unknown types. */
export function getTypeId(typeName: string): number {
  return TYPE_MAP[typeName] ?? 0;
}

/** Get canonical type name from ID. Returns 'Unknown' for unknown IDs. */
export function getTypeName(typeId: number): string {
  return TYPE_NAME_MAP[typeId] || 'Unknown';
}
