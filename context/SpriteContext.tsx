
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';

/**
 * Sprite display mode — controls which sprite set is used throughout the app.
 *
 * - 'game-specific': Version-specific pixel sprites (e.g. Red/Blue Charizard,
 *   Yellow Pikachu, Gold/Crystal sprites). Trainer sprites also game-specific.
 * - 'master': Standard PokeAPI "master" pixel sprites (same sprite for all
 *   versions of a generation). Trainer sprites use non-generation-suffixed URLs.
 * - 'artwork': Official artwork (high-res illustrations). Trainer sprites
 *   fall back to master-style (no artwork trainers exist).
 */
export type SpriteMode = 'game-specific' | 'master' | 'artwork';

export interface SpriteContextType {
  mode: SpriteMode;
  setMode: (mode: SpriteMode) => void;
}

const SpriteContext = createContext<SpriteContextType | undefined>(undefined);

const SPRITE_MODE_KEY = 'spriteMode';

export const SpriteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SpriteMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SPRITE_MODE_KEY);
      if (saved === 'game-specific' || saved === 'master' || saved === 'artwork') {
        return saved;
      }
    }
    return 'game-specific'; // Default: game-specific sprites
  });

  useEffect(() => {
    localStorage.setItem(SPRITE_MODE_KEY, mode);
  }, [mode]);

  // BUG-G09 fix: wrap `setMode` in useCallback so its identity is stable across
  // renders. The previous inline arrow `(newMode) => setModeState(newMode)`
  // created a new function reference on every render, which defeated memoization
  // of the context value below and caused all consumers of useSpriteMode() to
  // re-render on every provider state change.
  const setMode = useCallback((newMode: SpriteMode) => {
    setModeState(newMode);
  }, []);

  // BUG-G09 fix: memoize the context value so consumers only re-render when
  // `mode` actually changes. With `setMode` now stable via useCallback, the
  // value object identity is stable across renders unless `mode` changes.
  const value = useMemo<SpriteContextType>(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <SpriteContext.Provider value={value}>
      {children}
    </SpriteContext.Provider>
  );
};

export const useSpriteMode = (): SpriteContextType => {
  const context = useContext(SpriteContext);
  if (context === undefined) {
    throw new Error('useSpriteMode must be used within a SpriteProvider');
  }
  return context;
};
