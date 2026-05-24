
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    return 'master'; // Default: master sprites
  });

  useEffect(() => {
    localStorage.setItem(SPRITE_MODE_KEY, mode);
  }, [mode]);

  const setMode = (newMode: SpriteMode) => {
    setModeState(newMode);
  };

  return (
    <SpriteContext.Provider value={{ mode, setMode }}>
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
