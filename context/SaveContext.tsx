import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ParsedSave, Generation, GameVersion } from '../lib/parser/types';
import { MoveLocation } from '../lib/utils/manipulation';
import { IGenerationAdapter } from '../lib/interfaces';
import { registry } from '../lib/core/AdapterRegistry';

export interface SaveContextValue {
  // Core data
  data: ParsedSave;
  generation: Generation;
  gameVersion: GameVersion | undefined;

  // Update handler
  onSaveUpdate: (newData: ParsedSave) => void;
  onShowToast: (msg: string) => void;

  // Move mode state
  isMoveMode: boolean;
  setIsMoveMode: (val: boolean) => void;
  globalMoveSources: MoveLocation[];
  onMovePokemon: (target: MoveLocation, e?: React.MouseEvent) => void;
  onToggleSelection: (target: MoveLocation) => void;
  onDropPokemon: (target: MoveLocation, e?: React.DragEvent) => void;

  // Adapter access
  adapter: IGenerationAdapter | undefined;
}

export const SaveContext = createContext<SaveContextValue | null>(null);

interface SaveProviderProps {
  data: ParsedSave;
  onSaveUpdate: (newData: ParsedSave) => void;
  onShowToast: (msg: string) => void;
  isMoveMode: boolean;
  setIsMoveMode: (val: boolean) => void;
  globalMoveSources: MoveLocation[];
  onMovePokemon: (target: MoveLocation, e?: React.MouseEvent) => void;
  onToggleSelection: (target: MoveLocation) => void;
  onDropPokemon: (target: MoveLocation, e?: React.DragEvent) => void;
  children: ReactNode;
}

export const SaveProvider: React.FC<SaveProviderProps> = ({
  data,
  onSaveUpdate,
  onShowToast,
  isMoveMode,
  setIsMoveMode,
  globalMoveSources,
  onMovePokemon,
  onToggleSelection,
  onDropPokemon,
  children,
}) => {
  const value = useMemo<SaveContextValue>(() => ({
    data,
    generation: data.generation,
    gameVersion: data.gameVersion,
    onSaveUpdate,
    onShowToast,
    isMoveMode,
    setIsMoveMode,
    globalMoveSources,
    onMovePokemon,
    onToggleSelection,
    onDropPokemon,
    adapter: registry.getAdapter(data.generation),
  }), [data, onSaveUpdate, onShowToast, isMoveMode, setIsMoveMode, globalMoveSources, onMovePokemon, onToggleSelection, onDropPokemon]);

  return (
    <SaveContext.Provider value={value}>
      {children}
    </SaveContext.Provider>
  );
};

/**
 * Custom hook to access the SaveContext.
 * Throws an error if used outside of a SaveProvider.
 */
export function useSaveContext(): SaveContextValue {
  const context = useContext(SaveContext);
  if (context === null) {
    throw new Error('useSaveContext must be used within a SaveProvider');
  }
  return context;
}

/**
 * Safe version of useSaveContext that returns null instead of throwing
 * when used outside a SaveProvider. Useful for backward-compatible fallbacks.
 */
export function useSaveContextSafe(): SaveContextValue | null {
  return useContext(SaveContext);
}
