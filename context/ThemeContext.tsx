
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeContextType, ThemeMode, ThemeColor, GameCartridge } from '../uiTypes';
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

  const [theme, setTheme] = useState<ThemeColor>('default');
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
      // Default style (Pokemon Crimson Red)
      const isDark = mode === 'dark';
      root.style.setProperty('--theme-primary', isDark ? '#b91c1c' : '#dc2626');
      root.style.setProperty('--theme-secondary', '#fca5a5');
      root.style.setProperty('--theme-accent', isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)');
      root.style.setProperty('--theme-text-on-primary', '#ffffff');
    }
  }, [mode, activeGameId]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getGameTheme = (): GameCartridge | undefined => {
      if (!activeGameId) return undefined;
      return pokemonGames.find(g => g.id === activeGameId);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, theme, setTheme, activeGameId, setActiveGameId, getGameTheme }}>
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
