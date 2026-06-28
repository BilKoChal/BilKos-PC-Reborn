
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

// BUG-G10 fix: removed the dead `theme: ThemeColor` / `setTheme` fields from
// ThemeContextType. They were initialized to 'default' and never read or
// written anywhere in the codebase — the actual theming is driven entirely by
// `activeGameId` + CSS variables. Keeping them in the public API misled
// consumers into thinking they could set a ThemeColor separately from the
// active game. `ThemeColor` is retained for type compatibility but is no
// longer part of the context contract.

/**
 * @deprecated Kept for type compatibility only — theming is driven by
 * `activeGameId`, not by a separate ThemeColor value.
 */
export type ThemeColor = 'default' | 'blue' | 'green';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  getGameTheme: () => GameCartridge | undefined;
}
