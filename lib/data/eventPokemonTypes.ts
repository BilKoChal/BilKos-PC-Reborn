/**
 * Shared type definitions for Event Pokemon distributions.
 *
 * This file is the single source of truth for the EventPokemonData interface,
 * which was previously duplicated across gen1 and gen2 eventDistributions files.
 */

import { GameVersion } from "../parser/types";

export interface EventPokemonData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  generation: 1 | 2 | 3;
  previewDexId: number;
  previewVersion: GameVersion;
  format: 'pk1' | 'pk2' | 'pk3';
  bytes: number[];
  credit?: string;
  creditLink?: string;
}
