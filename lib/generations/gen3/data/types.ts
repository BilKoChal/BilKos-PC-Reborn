/**
 * Gen 3 type data (Phase 2 Sprint 1).
 * Gen 3 uses the same 17 types as Gen 2 (no new types until Fairy in Gen 6).
 * Type IDs are canonical (0-18 from lib/data/types.ts).
 */
import { getTypeId as getCanonicalTypeId } from '../../../data/types';
import { getGen2PokemonTypes } from '../../gen2/data/types';
import { getPokemonTypes as getGen1PokemonTypes } from '../../gen1/data/pokemonTypes';
import { GEN3_SPECIES_TYPES } from './speciesTypes';

export function getGen3PokemonTypes(dexId: number): string[] {
  // Phase 2 Sprint 1 (GAP-C5 fix): check Gen 3-specific types first for Hoenn species.
  const gen3Types = GEN3_SPECIES_TYPES[dexId];
  if (gen3Types) return gen3Types;
  // Species 1-251 reuse Gen 2 types (includes Steel/Dark corrections).
  return getGen2PokemonTypes(dexId, getGen1PokemonTypes);
}

export function getGen3TypeInfo(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string } {
  const types = getGen3PokemonTypes(dexId);
  const type1Name = types[0] || 'Normal';
  const type2Name = types[1] || type1Name;
  return {
    type1: getCanonicalTypeId(type1Name),
    type2: getCanonicalTypeId(type2Name),
    type1Name,
    type2Name,
  };
}

// Gen 3 type chart (same as Gen 2 — 17×17)
export const GEN3_TYPE_CHART = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 0.5, 1],
  [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1],
  [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1],
  [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1],
  [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 0.5, 1],
  [1, 1, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 0.5, 1],
  [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2],
  [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 0, 1],
  [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 2, 1],
  [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 0.5, 1],
  [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 0],
  [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 0.5, 2],
  [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 0.5, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 0.5],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1],
  [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0.5, 1],
  [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 0.5],
];
