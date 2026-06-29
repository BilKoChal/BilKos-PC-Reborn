/**
 * Gen 5 type data. Same 17 types as Gen 4 (Fairy not until Gen 6).
 */
import { getTypeId as getCanonicalTypeId } from '../../../data/types';
import { getGen4PokemonTypes } from '../../gen4/data/types';
import { GEN5_SPECIES_TYPES } from './speciesTypes';

export function getGen5PokemonTypes(dexId: number): string[] {
  const gen5Types = GEN5_SPECIES_TYPES[dexId];
  if (gen5Types) return gen5Types;
  return getGen4PokemonTypes(dexId);
}

export function getGen5TypeInfo(dexId: number) {
  const types = getGen5PokemonTypes(dexId);
  const type1Name = types[0] || 'Normal';
  const type2Name = types[1] || type1Name;
  return { type1: getCanonicalTypeId(type1Name), type2: getCanonicalTypeId(type2Name), type1Name, type2Name };
}

export const GEN5_TYPE_CHART = [
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
