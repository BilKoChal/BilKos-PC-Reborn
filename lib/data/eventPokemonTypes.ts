/**
 * Shared type definitions for Event Pokemon distributions.
 *
 * This file is the single source of truth for the EventPokemonData interface,
 * which was previously duplicated across gen1 and gen2 eventDistributions files.
 *
 * A11: `generation` widened from `1 | 2 | 3` to `number` and `format` widened
 * from `'pk1' | 'pk2' | 'pk3'` to `string` — adding Gen 4+ requires no type changes.
 */

import { GameVersion } from "../parser/types";

export interface EventPokemonData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  /** Generation number (1, 2, 3, ...). Widened from `1 | 2 | 3` for extensibility. */
  generation: number;
  previewDexId: number;
  previewVersion: GameVersion;
  /** Standalone file format extension (e.g., 'pk1', 'pk2', 'pk3'). Widened from union for extensibility. */
  format: string;
  bytes: number[];
  credit?: string;
  creditLink?: string;
}
