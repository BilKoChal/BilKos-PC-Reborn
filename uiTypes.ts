
export interface GameCartridge {
  id: string;
  name: string;
  generation: number;
  color: string;
  accentColor: string; // Used for stickers/details
  textColor: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    textOnPrimary: string;
    darkPrimary: string;
    darkSecondary: string;
    darkAccent: string;
    darkTextOnPrimary: string;
  };
}

export type ThemeMode = 'light' | 'dark';

// Phase 0.1g: Removed dead `ThemeColor = 'default' | 'blue' | 'green'` type.
// It was deprecated and nothing imported it. Theming is driven entirely by
// `activeGameId` + CSS variables.

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  getGameTheme: () => GameCartridge | undefined;
}
