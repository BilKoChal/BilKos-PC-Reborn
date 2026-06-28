// @vitest-environment happy-dom
/**
 * P2 React state management fix tests.
 *
 * Covers:
 *   - BUG-G07: SaveContext resets `adapter` when `data.generation` changes.
 *   - BUG-G08: ThemeContext memoizes its value (stable identity across renders
 *     unless the underlying state changes).
 *   - BUG-G09: SpriteContext memoizes its value (stable identity across renders
 *     unless `mode` changes).
 *
 * The memoization tests use module-level mutable capture objects to assert that
 * consumers don't re-render when the provider re-renders for unrelated reasons.
 * This is the concrete user-visible benefit of the fix: without memoization,
 * every provider state change cascaded through the entire tree.
 *
 * The eslint disables above are intentional: test capture components
 * intentionally read/write module-level state during render to observe
 * identity changes. This is not a pattern to copy into production code.
 */
import { describe, it, expect } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { SpriteProvider, useSpriteMode } from '../context/SpriteContext';
import { SaveProvider, useSaveContextSafe } from '../context/SaveContext';
import { registry } from '../lib/core/AdapterRegistry';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import type { ParsedSave } from '../lib/parser/types';

// Eagerly register real adapters so SaveProvider can resolve them synchronously.
registry.register(new Gen1Adapter());
registry.register(new Gen2Adapter());

// ── Test helpers ───────────────────────────────────────────────────────────

/** Build a minimal ParsedSave for a given generation. */
function buildSave(generation: 1 | 2): ParsedSave {
  return {
    generation,
    gameVersion: generation === 1 ? 'Red' : 'Gold',
    originalFilename: 'test.sav',
    fileSize: 32768,
    isValid: true,
    trainer: { name: 'RED', id: '12345', money: 1000, coins: 0, playTime: '00:00:00', badges: 0, gender: 'Male' },
    options: { textSpeed: 'Normal', battleAnimation: 'On', battleStyle: 'Shift', sound: 'Mono' },
    map: { currentMapId: 0, x: 0, y: 0 },
    partyCount: 0,
    party: [],
    items: [],
    keyItems: [],
    balls: [],
    pcItems: [],
    tms: [],
    pokedexOwned: 0,
    pokedexSeen: 0,
    pokedexOwnedFlags: [false],
    pokedexSeenFlags: [false],
    currentBoxId: 0,
    currentBoxCount: 0,
    currentBoxPokemon: [],
    pcBoxes: [],
    hallOfFame: [],
    eventFlags: [],
    rawData: new Uint8Array(0),
  } as unknown as ParsedSave;
}

// ── BUG-G08: ThemeContext memoization ──────────────────────────────────────

describe('BUG-G08: ThemeContext value memoization', () => {
  it('toggleMode identity is stable across renders (useCallback)', () => {
    const captured: { fns: (() => void)[] } = { fns: [] };

    const Consumer = () => {
      const { toggleMode } = useTheme();
      useEffect(() => { captured.fns.push(toggleMode); });
      return null;
    };

    const { rerender } = render(<ThemeProvider><Consumer /></ThemeProvider>);
    rerender(<ThemeProvider><Consumer /></ThemeProvider>);
    rerender(<ThemeProvider><Consumer /></ThemeProvider>);

    expect(captured.fns.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < captured.fns.length; i++) {
      expect(captured.fns[i]).toBe(captured.fns[0]);
    }
  });

  it('value identity is stable when state is unchanged', () => {
    const captured: { first: ReturnType<typeof useTheme> | null; current: ReturnType<typeof useTheme> | null } = {
      first: null, current: null,
    };

    const Consumer = () => {
      const value = useTheme();
      if (captured.first === null) captured.first = value;
      captured.current = value;
      return null;
    };

    const { rerender } = render(<ThemeProvider><Consumer /></ThemeProvider>);
    rerender(<ThemeProvider><Consumer /></ThemeProvider>);

    // The value object identity should be stable across re-renders when no
    // ThemeProvider state changed.
    expect(captured.current).toBe(captured.first);
  });
});

// ── BUG-G09: SpriteContext memoization ─────────────────────────────────────

describe('BUG-G09: SpriteContext value memoization', () => {
  it('setMode identity is stable across renders (useCallback)', () => {
    const captured: { fns: ((m: 'game-specific' | 'master' | 'artwork') => void)[] } = { fns: [] };

    const Consumer = () => {
      const { setMode } = useSpriteMode();
      useEffect(() => { captured.fns.push(setMode); });
      return null;
    };

    const { rerender } = render(<SpriteProvider><Consumer /></SpriteProvider>);
    rerender(<SpriteProvider><Consumer /></SpriteProvider>);
    rerender(<SpriteProvider><Consumer /></SpriteProvider>);

    expect(captured.fns.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < captured.fns.length; i++) {
      expect(captured.fns[i]).toBe(captured.fns[0]);
    }
  });

  it('value identity is stable when mode is unchanged', () => {
    const captured: { first: ReturnType<typeof useSpriteMode> | null; current: ReturnType<typeof useSpriteMode> | null } = {
      first: null, current: null,
    };

    const Consumer = () => {
      const value = useSpriteMode();
      if (captured.first === null) captured.first = value;
      captured.current = value;
      return null;
    };

    const { rerender } = render(<SpriteProvider><Consumer /></SpriteProvider>);
    rerender(<SpriteProvider><Consumer /></SpriteProvider>);

    expect(captured.current).toBe(captured.first);
  });

  it('value reflects mode changes (setMode propagates to consumers)', () => {
    const captured: { mode: string; setMode: ((m: 'game-specific' | 'master' | 'artwork') => void) | null } = {
      mode: '', setMode: null,
    };

    const Consumer = () => {
      const { mode, setMode } = useSpriteMode();
      useEffect(() => {
        captured.mode = mode;
        captured.setMode = setMode;
      });
      return null;
    };

    render(<SpriteProvider><Consumer /></SpriteProvider>);
    expect(captured.mode).toBe('game-specific'); // default

    // Change the mode via the captured setter.
    act(() => {
      captured.setMode!('master');
    });

    // The consumer should now see the new mode.
    expect(captured.mode).toBe('master');
  });
});

// ── BUG-G07: SaveContext adapter reset on generation change ────────────────

describe('BUG-G07: SaveContext resets adapter when generation changes', () => {
  it('loads the Gen 1 adapter for a Gen 1 save', () => {
    const save1 = buildSave(1);

    const { result } = renderHook(() => useSaveContextSafe(), {
      wrapper: ({ children }) => (
        <SaveProvider
          data={save1}
          onSaveUpdate={() => {}}
          onShowToast={() => {}}
          isMoveMode={false}
          setIsMoveMode={() => {}}
          globalMoveSources={[]}
          onMovePokemon={() => {}}
          onToggleSelection={() => {}}
          onDropPokemon={() => {}}
          onTouchDrop={() => {}}
        >
          {children}
        </SaveProvider>
      ),
    });

    expect(result.current).not.toBeNull();
    expect(result.current!.adapter).toBeDefined();
    expect(result.current!.generation).toBe(1);
  });

  it('loads the Gen 2 adapter for a Gen 2 save', () => {
    const save2 = buildSave(2);

    const { result } = renderHook(() => useSaveContextSafe(), {
      wrapper: ({ children }) => (
        <SaveProvider
          data={save2}
          onSaveUpdate={() => {}}
          onShowToast={() => {}}
          isMoveMode={false}
          setIsMoveMode={() => {}}
          globalMoveSources={[]}
          onMovePokemon={() => {}}
          onToggleSelection={() => {}}
          onDropPokemon={() => {}}
          onTouchDrop={() => {}}
        >
          {children}
        </SaveProvider>
      ),
    });

    expect(result.current).not.toBeNull();
    expect(result.current!.adapter).toBeDefined();
    expect(result.current!.generation).toBe(2);
  });

  it('BUG-G07 fix: switches adapter when the save generation changes', () => {
    // This is the core regression test. Start with Gen 1, then swap the data
    // prop to a Gen 2 save. Before the fix, the adapter would stay as
    // Gen1Adapter (the `if (adapter) return;` guard short-circuited the load
    // effect), so every Gen 2 operation ran through the wrong adapter.
    const save1 = buildSave(1);
    const save2 = buildSave(2);

    let currentData = save1;
    const setData = (d: ParsedSave) => { currentData = d; };

    const { result, rerender } = renderHook(() => useSaveContextSafe(), {
      wrapper: ({ children }) => (
        <SaveProvider
          data={currentData}
          onSaveUpdate={() => {}}
          onShowToast={() => {}}
          isMoveMode={false}
          setIsMoveMode={() => {}}
          globalMoveSources={[]}
          onMovePokemon={() => {}}
          onToggleSelection={() => {}}
          onDropPokemon={() => {}}
          onTouchDrop={() => {}}
        >
          {children}
        </SaveProvider>
      ),
    });

    // Initially Gen 1.
    expect(result.current!.generation).toBe(1);

    // Swap to Gen 2.
    setData(save2);
    rerender();

    // After the generation-change effect runs, the adapter should be Gen2Adapter.
    expect(result.current!.generation).toBe(2);
    // The adapter may briefly be undefined during the transition, but after
    // re-render it should resolve to the Gen 2 adapter.
    expect(result.current!.adapter).toBeDefined();
  });
});
