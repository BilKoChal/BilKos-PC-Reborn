import { useRef, useCallback } from 'react';
import { ParsedSave } from '../parser/types';

/** Default cap on undo depth. Each entry is a full `structuredClone` snapshot
 *  (~200KB for Gen 1/2), so the product bounds memory. Gen 3+ saves are larger;
 *  a Gen 3 caller can pass a smaller `maxHistory`, and the longer-term plan
 *  (TODO §3) is to move to a slot-diff/changelog model like PKHeX's SlotChangelog. */
export const DEFAULT_MAX_HISTORY = 50;

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
 *
 * @param initialPresent - the initial save state.
 * @param maxHistory - cap on retained undo snapshots (default {@link DEFAULT_MAX_HISTORY}).
 */
export function useUndoHistory(initialPresent: ParsedSave, maxHistory: number = DEFAULT_MAX_HISTORY) {
  const historyRef = useRef<UndoHistoryState>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = useCallback(() => historyRef.current.past.length > 0, []);
  const canRedo = useCallback(() => historyRef.current.future.length > 0, []);
  /** Current undo depth — handy for UI ("50+ steps") and tests. */
  const historyDepth = useCallback(() => historyRef.current.past.length, []);

  const pushState = useCallback((newPresent: ParsedSave) => {
    const h = historyRef.current;
    // Skip no-op pushes where the state object did not actually change.
    if (newPresent === h.present) return;
    // Deep clone the current present before pushing to past
    // (shallow spreads share nested arrays by reference)
    h.past.push(structuredClone(h.present));
    while (h.past.length > maxHistory) h.past.shift();
    h.present = newPresent;
    h.future = []; // Clear redo stack on new action
  }, [maxHistory]);

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

  return { canUndo, canRedo, historyDepth, pushState, undo, redo, reset, historyRef };
}
