
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { ThemeContextType, ThemeMode, GameCartridge } from '../uiTypes';
import { pokemonGames } from '../data/games';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from local storage or default to light
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('themeMode');
      return (saved as ThemeMode) || 'light';
    }
    return 'light';
  });

  // BUG-G10 fix: removed the dead `theme`/`setTheme` state. It was initialized
  // to 'default' and never read or written — the actual theming is driven
  // entirely by `activeGameId` + CSS variables in the effect below.
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('themeMode', mode);

    // Apply active game theme CSS variables dynamically
    const activeGame = pokemonGames.find(g => g.id === activeGameId);
    if (activeGame) {
      const isDark = mode === 'dark';
      const primary = isDark ? activeGame.theme.darkPrimary : activeGame.theme.primary;
      const secondary = isDark ? activeGame.theme.darkSecondary : activeGame.theme.secondary;
      const accent = isDark ? activeGame.theme.darkAccent : activeGame.theme.accent;
      const textOnPrimary = isDark ? activeGame.theme.darkTextOnPrimary : activeGame.theme.textOnPrimary;

      root.style.setProperty('--theme-primary', primary);
      root.style.setProperty('--theme-secondary', secondary);
      root.style.setProperty('--theme-accent', accent);
      root.style.setProperty('--theme-text-on-primary', textOnPrimary);
    } else {
      // UX-T04 fix: warn when activeGameId is set but no matching game is found
      // in pokemonGames. This means the active save's game version doesn't have
      // a theme entry — theming silently fell back to the default (Crimson Red)
      // with no indication. The console warning helps developers notice a
      // missing theme registration before users see inconsistent colors.
      if (activeGameId !== null) {
        console.warn(
          `[ThemeContext] Unknown activeGameId "${activeGameId}" — no matching theme found in pokemonGames. ` +
          `Falling back to default (Crimson Red). Add this game version to data/games.ts to fix.`
        );
      }
      // Default style (Pokemon Crimson Red)
      const isDark = mode === 'dark';
      root.style.setProperty('--theme-primary', isDark ? '#b91c1c' : '#dc2626');
      root.style.setProperty('--theme-secondary', '#fca5a5');
      root.style.setProperty('--theme-accent', isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)');
      root.style.setProperty('--theme-text-on-primary', '#ffffff');
    }
  }, [mode, activeGameId]);

  // BUG-G08 fix: wrap `toggleMode` in useCallback so its identity is stable
  // across renders. Without this, every provider render creates a new function,
  // which — combined with the unmemoized context value below — caused ALL
  // consumers of useTheme() to re-render on every provider state change, even
  // when nothing they cared about had actually changed.
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const getGameTheme = useCallback((): GameCartridge | undefined => {
      if (!activeGameId) return undefined;
      return pokemonGames.find(g => g.id === activeGameId);
  }, [activeGameId]);

  // BUG-G08 fix: memoize the context value so consumers only re-render when
  // the actual values change (mode, activeGameId). Previously the value
  // object was recreated on every render, causing cascading re-renders of all
  // deeply-nested components that call useTheme() (Header, PCStorage,
  // PartyList, PokemonSprite, etc.) on every provider state change.
  const value = useMemo<ThemeContextType>(() => ({
    mode, toggleMode, activeGameId, setActiveGameId, getGameTheme
  }), [mode, toggleMode, activeGameId, getGameTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
