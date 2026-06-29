/**
 * Gen 4 type data. Same 17 types as Gen 3 (Fairy not until Gen 6).
 * Gen 4 introduced the Physical/Special split for moves (not types).
 */
import { getTypeId as getCanonicalTypeId } from '../../../data/types';
import { getGen3PokemonTypes } from '../../gen3/data/types';
import { GEN4_SPECIES_TYPES } from './speciesTypes';

export function getGen4PokemonTypes(dexId: number): string[] {
  const gen4Types = GEN4_SPECIES_TYPES[dexId];
  if (gen4Types) return gen4Types;
  return getGen3PokemonTypes(dexId);
}

export function getGen4TypeInfo(dexId: number) {
  const types = getGen4PokemonTypes(dexId);
  const type1Name = types[0] || 'Normal';
  const type2Name = types[1] || type1Name;
  return { type1: getCanonicalTypeId(type1Name), type2: getCanonicalTypeId(type2Name), type1Name, type2Name };
}

// Gen 4 type chart (same as Gen 3 — 17×17)
export const GEN4_TYPE_CHART = [
  [1,1,1,1,1,1,1,1,1,1,1,1,0.5,0,1,0.5,1], [1,0.5,0.5,1,2,2,1,1,1,1,1,2,0.5,1,0.5,2,1],
  [1,2,0.5,1,0.5,1,1,1,2,1,1,1,2,1,0.5,1,1], [1,1,2,0.5,0.5,1,1,1,0,2,1,1,1,1,0.5,1,1],
  [1,0.5,2,1,0.5,1,1,0.5,2,0.5,1,0.5,2,1,0.5,0.5,1], [1,1,0.5,1,2,0.5,1,1,2,2,1,1,1,1,2,0.5,1],
  [2,1,1,1,1,2,1,0.5,1,0.5,0.5,0.5,2,0,1,2,2], [1,1,1,1,2,1,1,0.5,0.5,1,1,1,0.5,0.5,1,0,1],
  [1,2,1,2,0.5,1,1,2,1,0,1,0.5,2,1,1,2,1], [1,1,1,0.5,2,1,2,1,1,1,1,2,0.5,1,1,0.5,1],
  [1,1,1,1,1,1,2,2,1,1,0.5,1,1,1,1,0.5,0], [1,0.5,1,1,2,1,0.5,0.5,1,0.5,2,1,1,0.5,1,0.5,2],
  [1,2,1,1,1,2,0.5,1,0.5,2,1,2,1,1,1,0.5,1], [0,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,0.5],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1], [1,0.5,0.5,0.5,1,2,1,1,1,1,1,1,2,1,1,0.5,1],
  [1,1,1,1,1,1,0.5,1,1,1,2,1,1,2,1,0.5,0.5],
];
