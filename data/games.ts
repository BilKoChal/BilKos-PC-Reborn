import { GameCartridge } from '../uiTypes';
import { GEN1_GAMES } from '../lib/generations/gen1/data/themes';
import { GEN2_GAMES } from '../lib/generations/gen2/data/themes';

/**
 * Aggregate of all known version cartridges + themes (TODO 1.6).
 *
 * This list is NO LONGER a hardcoded Gen1/2 literal — it is assembled from each
 * generation's own themes data file (`lib/generations/genN/data/themes.ts`). Adding a
 * generation therefore means adding a `themes.ts` and one import line here, not editing a
 * monolithic literal. For the registry-driven view (only generations actually registered),
 * see `registry.getAllVersionThemes()`.
 */
export const pokemonGames: GameCartridge[] = [
  ...GEN1_GAMES,
  ...GEN2_GAMES,
];
