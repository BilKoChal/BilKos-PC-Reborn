// Re-export from generation-specific event distribution files.
// This file is kept for backward compatibility; new code should import
// directly from the gen-specific files:
//   lib/generations/gen1/data/eventDistributions.ts
//   lib/generations/gen2/data/eventDistributions.ts

// Shared type — single source of truth
export { type EventPokemonData } from './eventPokemonTypes';

// Backward-compatible aliases (both gen-specific types are now the same shared type)
export { GEN1_EVENT_DISTRIBUTIONS, type EventPokemonData as Gen1EventPokemonData } from '../generations/gen1/data/eventDistributions';
export { GEN2_EVENT_DISTRIBUTIONS, type EventPokemonData as Gen2EventPokemonData } from '../generations/gen2/data/eventDistributions';

import { GEN1_EVENT_DISTRIBUTIONS } from '../generations/gen1/data/eventDistributions';
import { GEN2_EVENT_DISTRIBUTIONS } from '../generations/gen2/data/eventDistributions';
import { EventPokemonData } from './eventPokemonTypes';

// Combined array for backward compatibility
export const EVENT_DISTRIBUTIONS: EventPokemonData[] = [
  ...GEN1_EVENT_DISTRIBUTIONS,
  ...GEN2_EVENT_DISTRIBUTIONS,
];
