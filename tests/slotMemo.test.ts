/**
 * Shared slot memo comparator tests (TODO §3).
 */
import { describe, it, expect } from 'vitest';
import { arePokemonSlotPropsEqual, type SharedSlotMemoProps } from '../lib/utils/slotMemo';

const base = (): SharedSlotMemoProps => {
  const mon = { id: 1 };
  const onDropPokemon = () => {};
  return { mon, isSelected: false, isMoveMode: false, gameVersion: 'Crystal', tabId: 't1', spriteMode: 'master', onDropPokemon };
};

describe('arePokemonSlotPropsEqual', () => {
  it('is true when all shared props are identical', () => {
    const a = base();
    expect(arePokemonSlotPropsEqual(a, { ...a })).toBe(true);
  });

  it('detects a changed mon reference', () => {
    const a = base();
    expect(arePokemonSlotPropsEqual(a, { ...a, mon: { id: 1 } })).toBe(false);
  });

  it.each<keyof SharedSlotMemoProps>(['isSelected', 'isMoveMode', 'gameVersion', 'tabId', 'spriteMode'])(
    'detects a changed %s',
    (key) => {
      const a = base();
      const next = { ...a, [key]: key === 'isSelected' || key === 'isMoveMode' ? true : 'changed' } as SharedSlotMemoProps;
      expect(arePokemonSlotPropsEqual(a, next)).toBe(false);
    },
  );

  it('detects a changed onDropPokemon handler reference', () => {
    const a = base();
    expect(arePokemonSlotPropsEqual(a, { ...a, onDropPokemon: () => {} })).toBe(false);
  });
});
