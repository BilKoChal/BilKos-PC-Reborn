import { GameCartridge } from '../../../../uiTypes';

/**
 * Gen 2 (GSC) version cartridges + UI themes (TODO 1.6).
 *
 * Owned by the Gen 2 generation, exposed via `Gen2Adapter.versionThemes` and aggregated
 * by `data/games.ts` + `registry.getAllVersionThemes()`. See the Gen 1 themes file for the
 * rationale (keeps theme metadata a per-generation data addition, not a core literal).
 */
export const GEN2_GAMES: GameCartridge[] = [
  {
    id: 'gold',
    name: 'GOLD',
    generation: 2,
    color: '#DAA520',
    accentColor: '#FFF8DC',
    textColor: '#111827',
    theme: {
      primary: '#DAA520',
      secondary: '#FBE49D',
      accent: 'rgba(218, 165, 32, 0.15)',
      textOnPrimary: '#111827',
      darkPrimary: '#F3C63F',
      darkSecondary: '#8F6E0A',
      darkAccent: 'rgba(243, 198, 63, 0.2)',
      darkTextOnPrimary: '#111827'
    }
  },
  {
    id: 'silver',
    name: 'SILVER',
    generation: 2,
    color: '#C0C0C0',
    accentColor: '#F2F2F2',
    textColor: '#111827',
    theme: {
      primary: '#8A95A5',
      secondary: '#D2D7DF',
      accent: 'rgba(138, 149, 165, 0.15)',
      textOnPrimary: '#ffffff',
      darkPrimary: '#A3B3C8',
      darkSecondary: '#475569',
      darkAccent: 'rgba(163, 179, 200, 0.2)',
      darkTextOnPrimary: '#111827'
    }
  },
  {
    id: 'crystal',
    name: 'CRYSTAL',
    generation: 2,
    color: '#48D1CC',
    accentColor: '#E0FFFF',
    textColor: '#1e293b',
    theme: {
      primary: '#06B6D4',
      secondary: '#A5F3FC',
      accent: 'rgba(6, 182, 212, 0.15)',
      textOnPrimary: '#ffffff',
      darkPrimary: '#22D3EE',
      darkSecondary: '#0891B2',
      darkAccent: 'rgba(34, 211, 238, 0.2)',
      darkTextOnPrimary: '#111827'
    }
  },
];
