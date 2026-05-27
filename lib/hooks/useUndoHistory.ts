import { useRef, useCallback } from 'react';
import { ParsedSave } from '../parser/types';

const MAX_HISTORY = 50;

export interface UndoHistoryState {
  past: ParsedSave[];
  present: ParsedSave;
  future: ParsedSave[];
}

/**
 * Custom hook for managing undo/redo history of ParsedSave state.
 * Uses `structuredClone()` for deep cloning (modern Web API, available in all current browsers).
 * Follows the past[] / present / future[] pattern for O(1) undo/redo.
 *
 * Inspired by PKHeX's `SlotChangelog` with `UndoStack`/`RedoStack`,
 * but uses full-state snapshots (simpler, feasible at ~200KB per snapshot for Gen 1/2).
 */
export function useUndoHistory(initialPresent: ParsedSave) {
  const historyRef = useRef<UndoHistoryState>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = useCallback(() => historyRef.current.past.length > 0, []);
  const canRedo = useCallback(() => historyRef.current.future.length > 0, []);

  const pushState = useCallback((newPresent: ParsedSave) => {
    const h = historyRef.current;
    // Deep clone the current present before pushing to past
    // (shallow spreads share nested arrays by reference)
    h.past.push(structuredClone(h.present));
    if (h.past.length > MAX_HISTORY) h.past.shift();
    h.present = newPresent;
    h.future = []; // Clear redo stack on new action
  }, []);

  const undo = useCallback((): ParsedSave | null => {
    const h = historyRef.current;
    if (h.past.length === 0) return null;
    h.future.push(structuredClone(h.present));
    const previous = h.past.pop()!;
    h.present = previous;
    return previous;
  }, []);

  const redo = useCallback((): ParsedSave | null => {
    const h = historyRef.current;
    if (h.future.length === 0) return null;
    h.past.push(structuredClone(h.present));
    const next = h.future.pop()!;
    h.present = next;
    return next;
  }, []);

  const reset = useCallback((newPresent: ParsedSave) => {
    historyRef.current = { past: [], present: newPresent, future: [] };
  }, []);

  return { canUndo, canRedo, pushState, undo, redo, reset, historyRef };
}
