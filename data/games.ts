import { GameCartridge } from '../uiTypes';

export const pokemonGames: GameCartridge[] = [
  // Gen 1 Only
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
  // Gen 2
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
