
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
export type ThemeColor = 'default' | 'blue' | 'green'; // For future theming extensibility

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  getGameTheme: () => GameCartridge | undefined;
}
