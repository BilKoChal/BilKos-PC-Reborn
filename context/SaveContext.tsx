import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { ParsedSave, Generation, GameVersion } from '../lib/parser/types';
import { MoveLocation } from '../lib/utils/manipulation';
import { IGenerationAdapter } from '../lib/interfaces';
import { registry } from '../lib/core/AdapterRegistry';

export interface SaveContextValue {
  data: ParsedSave;
  generation: Generation;
  gameVersion: GameVersion | undefined;
  onSaveUpdate: (newData: ParsedSave) => void;
  onShowToast: (msg: string) => void;
  isMoveMode: boolean;
  setIsMoveMode: (val: boolean) => void;
  globalMoveSources: MoveLocation[];
  onMovePokemon: (target: MoveLocation, e?: React.MouseEvent) => void;
  onToggleSelection: (target: MoveLocation) => void;
  onDropPokemon: (target: MoveLocation, e?: React.DragEvent) => void;
  onTouchDrop: (target: MoveLocation) => void;
  activeTabId: string | undefined;
  adapter: IGenerationAdapter | undefined;
  /** Whether the adapter is currently being loaded (lazy-loading state) */
  adapterLoading: boolean;
  /** Called when a drag session begins — stores drag source, clears click-selections */
  onBeginDragSession?: (tabId: string, location: { type: 'box'; boxIndex: number; index: number } | { type: 'party'; index: number }) => void;
  /** Called when a drag session ends (cancel or complete) */
  onEndDragSession?: () => void;
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
  onTouchDrop: (target: MoveLocation) => void;
  activeTabId?: string;
  onBeginDragSession?: (tabId: string, location: { type: 'box'; boxIndex: number; index: number } | { type: 'party'; index: number }) => void;
  onEndDragSession?: () => void;
  children: ReactNode;
}

export const SaveProvider: React.FC<SaveProviderProps> = ({
  data, onSaveUpdate, onShowToast, isMoveMode, setIsMoveMode,
  globalMoveSources, onMovePokemon, onToggleSelection, onDropPokemon, onTouchDrop, activeTabId,
  onBeginDragSession, onEndDragSession, children,
}) => {
  // H5: Adapter may need async loading if lazy-registered.
  // First try synchronous access (already loaded), then async load if needed.
  const [adapter, setAdapter] = useState<IGenerationAdapter | undefined>(
    () => registry.getAdapter(data.generation)
  );
  const [adapterLoading, setAdapterLoading] = useState(!registry.isLoaded(data.generation));

  useEffect(() => {
    if (adapter) return; // Already loaded

    let cancelled = false;
    setAdapterLoading(true);

    registry.getAdapterAsync(data.generation).then((loaded) => {
      if (!cancelled) {
        setAdapter(loaded);
        setAdapterLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [data.generation, adapter]);

  const value = useMemo<SaveContextValue>(() => ({
    data, generation: data.generation, gameVersion: data.gameVersion,
    onSaveUpdate, onShowToast, isMoveMode, setIsMoveMode,
    globalMoveSources, onMovePokemon, onToggleSelection, onDropPokemon, onTouchDrop,
    activeTabId, adapter, adapterLoading,
    onBeginDragSession, onEndDragSession,
  }), [data, onSaveUpdate, onShowToast, isMoveMode, setIsMoveMode, globalMoveSources, onMovePokemon, onToggleSelection, onDropPokemon, onTouchDrop, activeTabId, adapter, adapterLoading, onBeginDragSession, onEndDragSession]);

  return (
    <SaveContext.Provider value={value}>
      {children}
    </SaveContext.Provider>
  );
};

export function useSaveContext(): SaveContextValue {
  const context = useContext(SaveContext);
  if (context === null) {
    throw new Error('useSaveContext must be used within a SaveProvider');
  }
  return context;
}

export function useSaveContextSafe(): SaveContextValue | null {
  return useContext(SaveContext);
}
