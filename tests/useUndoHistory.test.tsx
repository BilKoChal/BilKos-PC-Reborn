// @vitest-environment happy-dom
/**
 * useUndoHistory tests (TODO §3 — bound history + expose depth).
 *
 * Covers the configurable depth cap (memory bound that lets Gen 3 tune it down),
 * the no-op push skip, and the new `historyDepth` getter — plus the core
 * undo/redo round-trip.
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoHistory } from '../lib/hooks/useUndoHistory';
import type { ParsedSave } from '../lib/parser/types';

// Distinct lightweight save-ish objects; identity is all the hook cares about.
const save = (tag: string) => ({ tag } as unknown as ParsedSave);

describe('useUndoHistory', () => {
  it('reports depth and undo/redo availability', () => {
    const { result } = renderHook(() => useUndoHistory(save('s0')));
    expect(result.current.canUndo()).toBe(false);
    expect(result.current.historyDepth()).toBe(0);

    act(() => result.current.pushState(save('s1')));
    expect(result.current.canUndo()).toBe(true);
    expect(result.current.historyDepth()).toBe(1);
  });

  it('skips a no-op push (same present reference)', () => {
    const s0 = save('s0');
    const { result } = renderHook(() => useUndoHistory(s0));
    act(() => result.current.pushState(s0)); // same reference → ignored
    expect(result.current.historyDepth()).toBe(0);
  });

  it('caps the undo depth at the configured maxHistory', () => {
    const { result } = renderHook(() => useUndoHistory(save('s0'), 3));
    act(() => {
      for (let i = 1; i <= 10; i++) result.current.pushState(save(`s${i}`));
    });
    expect(result.current.historyDepth()).toBe(3); // oldest entries dropped
  });

  it('undo/redo round-trips the present state', () => {
    const { result } = renderHook(() => useUndoHistory(save('s0')));
    act(() => result.current.pushState(save('s1')));
    let undone: ParsedSave | null = null;
    act(() => {
      undone = result.current.undo();
    });
    expect((undone as unknown as { tag: string }).tag).toBe('s0');
    expect(result.current.canRedo()).toBe(true);
    let redone: ParsedSave | null = null;
    act(() => {
      redone = result.current.redo();
    });
    expect((redone as unknown as { tag: string }).tag).toBe('s1');
  });
});
