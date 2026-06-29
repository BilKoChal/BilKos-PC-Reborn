import { GameCartridge } from '../../../../uiTypes';

export const GEN3_GAMES: GameCartridge[] = [
  {
    id: 'ruby', name: 'RUBY', generation: 3,
    color: '#CD2626', accentColor: '#FF6B6B', textColor: '#ffffff',
    theme: { primary: '#CD2626', secondary: '#FFB3B3', accent: 'rgba(205,38,38,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#EF4444', darkSecondary: '#7F1D1D', darkAccent: 'rgba(239,68,68,0.2)', darkTextOnPrimary: '#ffffff' }
  },
  {
    id: 'sapphire', name: 'SAPPHIRE', generation: 3,
    color: '#2563EB', accentColor: '#6BB3FF', textColor: '#ffffff',
    theme: { primary: '#2563EB', secondary: '#B3D4FF', accent: 'rgba(37,99,235,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#3B82F6', darkSecondary: '#1E3A5F', darkAccent: 'rgba(59,130,246,0.2)', darkTextOnPrimary: '#ffffff' }
  },
  {
    id: 'emerald', name: 'EMERALD', generation: 3,
    color: '#059669', accentColor: '#6EE7B7', textColor: '#ffffff',
    theme: { primary: '#059669', secondary: '#A7F3D0', accent: 'rgba(5,150,105,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#10B981', darkSecondary: '#064E3B', darkAccent: 'rgba(16,185,129,0.2)', darkTextOnPrimary: '#ffffff' }
  },
  {
    id: 'firered', name: 'FIRE RED', generation: 3,
    color: '#DC2626', accentColor: '#FCA5A5', textColor: '#ffffff',
    theme: { primary: '#DC2626', secondary: '#FECACA', accent: 'rgba(220,38,38,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#EF4444', darkSecondary: '#7F1D1D', darkAccent: 'rgba(239,68,68,0.2)', darkTextOnPrimary: '#ffffff' }
  },
  {
    id: 'leafgreen', name: 'LEAF GREEN', generation: 3,
    color: '#16A34A', accentColor: '#86EFAC', textColor: '#ffffff',
    theme: { primary: '#16A34A', secondary: '#BBF7D0', accent: 'rgba(22,163,74,0.15)', textOnPrimary: '#ffffff',
      darkPrimary: '#22C55E', darkSecondary: '#14532D', darkAccent: 'rgba(34,197,94,0.2)', darkTextOnPrimary: '#ffffff' }
  },
];
