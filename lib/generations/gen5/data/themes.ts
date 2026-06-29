import { GameCartridge } from '../../../../uiTypes';

export const GEN5_GAMES: GameCartridge[] = [
  { id: 'black', name: 'BLACK', generation: 5, color: '#2A2A2A', accentColor: '#4A4A4A', textColor: '#ffffff',
    theme: { primary: '#2A2A2A', secondary: '#5A5A5A', accent: 'rgba(42,42,42,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#3A3A3A', darkSecondary: '#1A1A1A', darkAccent: 'rgba(58,58,58,0.2)', darkTextOnPrimary: '#ffffff' } },
  { id: 'white', name: 'WHITE', generation: 5, color: '#F0F0F0', accentColor: '#D0D0D0', textColor: '#2A2A2A',
    theme: { primary: '#909090', secondary: '#C8C8C8', accent: 'rgba(144,144,144,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#A8A8A8', darkSecondary: '#404040', darkAccent: 'rgba(168,168,168,0.2)', darkTextOnPrimary: '#2A2A2A' } },
  { id: 'black2', name: 'BLACK 2', generation: 5, color: '#1A1A2A', accentColor: '#3A3A5A', textColor: '#ffffff',
    theme: { primary: '#1A1A4A', secondary: '#4A4A7A', accent: 'rgba(26,26,74,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#2A2A6A', darkSecondary: '#0A0A2A', darkAccent: 'rgba(42,42,106,0.2)', darkTextOnPrimary: '#ffffff' } },
  { id: 'white2', name: 'WHITE 2', generation: 5, color: '#E8E8F0', accentColor: '#C8C8E0', textColor: '#2A2A3A',
    theme: { primary: '#606090', secondary: '#A0A0C8', accent: 'rgba(96,96,144,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#7878A8', darkSecondary: '#303050', darkAccent: 'rgba(120,120,168,0.2)', darkTextOnPrimary: '#2A2A3A' } },
];
