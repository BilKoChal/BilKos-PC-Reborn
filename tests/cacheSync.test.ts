/**
 * Active-box cache invariant after sort (TODO §1).
 *
 * The mutation helpers used to hand-roll `currentBoxPokemon` / `currentBoxCount`
 * re-derivation; they now route through `syncCurrentBox`. This locks the result:
 * the active-box cache must be reference-equal to `pcBoxes[currentBoxId]`, which
 * is exactly what `assertCurrentBoxInSync` checks (so it must not warn).
 */
import { describe, it, expect, vi } from 'vitest';
import { sortPCBoxes } from '../lib/utils/sortManager';
import { syncCurrentBox, assertCurrentBoxInSync, createEmptyCanonicalPokemon } from '../lib/canonicalModel';
import type { CanonicalSave } from '../lib/canonicalModel';
import { logger } from '../lib/utils/logger';

function makeSave(): CanonicalSave {
  const box0 = [
    createEmptyCanonicalPokemon({ speciesId: 25, dexId: 25, nickname: 'C' }),
    createEmptyCanonicalPokemon({ speciesId: 1, dexId: 1, nickname: 'A' }),
    createEmptyCanonicalPokemon({ speciesId: 4, dexId: 4, nickname: 'B' }),
  ];
  const box1 = [createEmptyCanonicalPokemon({ speciesId: 7, dexId: 7, nickname: 'D' })];
  // Minimal shape — only the fields the sort/sync helpers touch matter.
  return {
    generation: 1,
    party: [],
    partyCount: 0,
    pcBoxes: [box0, box1],
    currentBoxId: 0,
    currentBoxCount: 0,
    currentBoxPokemon: [],
  } as unknown as CanonicalSave;
}

describe('active-box cache invariant after sort (TODO §1)', () => {
  it('sortPCBoxes output keeps currentBoxPokemon reference-equal to pcBoxes[currentBoxId]', () => {
    const result = sortPCBoxes(makeSave(), 'single', 'id', 'asc');
    expect(result.success).toBe(true);
    const save = result.newData;
    expect(save.currentBoxPokemon).toBe(save.pcBoxes[save.currentBoxId]);
    expect(save.currentBoxCount).toBe(save.pcBoxes[save.currentBoxId]!.length);
  });

  it('does not trip the drift warning after a sort', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const result = sortPCBoxes(makeSave(), 'all-indiv', 'id', 'desc');
    assertCurrentBoxInSync(result.newData);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('syncCurrentBox re-points the cache when currentBoxId changes', () => {
    const save = makeSave();
    save.currentBoxId = 1;
    syncCurrentBox(save);
    expect(save.currentBoxPokemon).toBe(save.pcBoxes[1]);
    expect(save.currentBoxCount).toBe(1);
  });
});
