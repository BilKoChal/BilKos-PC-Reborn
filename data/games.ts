import { GameCartridge } from '../uiTypes';
import { GEN1_GAMES } from '../lib/generations/gen1/data/themes';
import { GEN2_GAMES } from '../lib/generations/gen2/data/themes';

/**
 * Aggregate of all known version cartridges + themes.
 *
 * Phase 1.3: This is still a static aggregate (not yet auto-aggregating from
 * `registry.getAllVersionThemes()`) because the registry only returns themes
 * for *loaded* adapters, and adapters are lazy-loaded — at app startup, no
 * adapter is loaded yet, so the registry would return an empty list. The
 * static import ensures themes are available immediately for the home page
 * and theme context.
 *
 * Phase 1.3 will complete when lazy-loading is replaced with eager registration
 * (or when the registry gains a `getAllVersionThemesStatic()` that reads from
 * the lazy factory metadata without triggering the import). Until then, adding
 * a generation means adding a `themes.ts` and one import line here — the only
 * hand-maintained central file for themes.
 */
export const pokemonGames: GameCartridge[] = [
  ...GEN1_GAMES,
  ...GEN2_GAMES,
];
