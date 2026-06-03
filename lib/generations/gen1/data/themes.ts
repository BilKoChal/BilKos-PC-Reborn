import { GameCartridge } from '../../../../uiTypes';

/**
 * Gen 1 (RBY) version cartridges + UI themes (TODO 1.6).
 *
 * This data is OWNED by the Gen 1 generation, exposed via `Gen1Adapter.versionThemes`
 * and aggregated by `data/games.ts` + `registry.getAllVersionThemes()`. Keeping it here
 * (not in a hardcoded Gen1/2 literal in `data/games.ts`) is what lets "add a generation =
 * add data" hold: a Gen 3 adapter ships its own themes file and they appear automatically.
 */
export const GEN1_GAMES: GameCartridge[] = [
  {
    id: 'red',
    name: 'RED',
    generation: 1,
    color: '#FF3B3B',
    accentColor: '#FFcccc',
    textColor: '#ffffff',
    theme: {
      primary: '#EF4444',
      secondary: '#FCA5A5',
      accent: 'rgba(239, 68, 68, 0.15)',
      textOnPrimary: '#ffffff',
      darkPrimary: '#F87171',
      darkSecondary: '#B91C1C',
      darkAccent: 'rgba(248, 113, 113, 0.2)',
      darkTextOnPrimary: '#ffffff'
    }
  },
  {
    id: 'blue',
    name: 'BLUE',
    generation: 1,
    color: '#3B4CCA',
    accentColor: '#ccccFF',
    textColor: '#ffffff',
    theme: {
      primary: '#3B82F6',
      secondary: '#93C5FD',
      accent: 'rgba(59, 130, 246, 0.15)',
      textOnPrimary: '#ffffff',
      darkPrimary: '#60A5FA',
      darkSecondary: '#1D4ED8',
      darkAccent: 'rgba(96, 165, 250, 0.2)',
      darkTextOnPrimary: '#ffffff'
    }
  },
  {
    id: 'yellow',
    name: 'YELLOW',
    generation: 1,
    color: '#FFD733',
    accentColor: '#FFFFE0',
    textColor: '#1e293b',
    theme: {
      primary: '#EAB308',
      secondary: '#FEF08A',
      accent: 'rgba(234, 179, 8, 0.15)',
      textOnPrimary: '#1e293b',
      darkPrimary: '#FACC15',
      darkSecondary: '#A16207',
      darkAccent: 'rgba(250, 204, 21, 0.2)',
      darkTextOnPrimary: '#1e293b'
    }
  },
];
