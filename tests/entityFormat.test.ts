/**
 * Entity-format seam tests (TODO 8.5.3).
 *
 * These prove the Gen 3+ entity primitives are correct and reusable WITHOUT
 * implementing any generation: the block shuffle is invertible for all 24
 * orderings, PID→order indexing matches the documented Gen3 / Gen4-5 rules, and
 * length detection reports the ambiguous 136-byte Gen4/5 case.
 */
import { describe, it, expect } from 'vitest';
import {
  BLOCK_ORDERS,
  getBlockOrderIndex,
  shuffleBlocks,
  unshuffleBlocks,
  getEntityFormatByLength,
} from '../lib/core/entityFormat';

describe('Block-order permutation table (TODO 8.5.3)', () => {
  it('has exactly 24 unique orderings, identity first', () => {
    expect(BLOCK_ORDERS).toHaveLength(24);
    expect(BLOCK_ORDERS[0]).toEqual([0, 1, 2, 3]);
    const unique = new Set(BLOCK_ORDERS.map(o => o.join('')));
    expect(unique.size).toBe(24);
    // Every order is a permutation of 0..3.
    for (const o of BLOCK_ORDERS) {
      expect([...o].sort()).toEqual([0, 1, 2, 3]);
    }
  });
});

describe('Block shuffle is invertible for all 24 orders (TODO 8.5.3)', () => {
  // Build a 8-byte header + four 12-byte blocks (Gen 3 geometry: 8 + 48 = 56).
  function makeEntity(): Uint8Array {
    const buf = new Uint8Array(8 + 12 * 4);
    for (let i = 0; i < buf.length; i++) buf[i] = i & 0xFF;
    return buf;
  }

  it('unshuffle(shuffle(x)) === x for every ordering, header preserved', () => {
    const original = makeEntity();
    for (let n = 0; n < 24; n++) {
      const order = BLOCK_ORDERS[n]!;
      const shuffled = shuffleBlocks(original, 8, 12, order);
      const restored = unshuffleBlocks(shuffled, 8, 12, order);
      expect(Array.from(restored), `order ${n}`).toEqual(Array.from(original));
      // Header (first 8 bytes) is never moved.
      expect(Array.from(shuffled.subarray(0, 8))).toEqual(Array.from(original.subarray(0, 8)));
    }
  });

  it('a non-identity order actually moves block bytes', () => {
    const original = makeEntity();
    const order = BLOCK_ORDERS[23]!; // [3,2,1,0] — full reverse
    const shuffled = shuffleBlocks(original, 8, 12, order);
    expect(Array.from(shuffled)).not.toEqual(Array.from(original));
    // Slot 0 should now hold the bytes that were in source block 3.
    expect(Array.from(shuffled.subarray(8, 8 + 12)))
      .toEqual(Array.from(original.subarray(8 + 12 * 3, 8 + 12 * 4)));
  });

  it('works for Gen 4/5 geometry (32-byte blocks) too', () => {
    const buf = new Uint8Array(8 + 32 * 4);
    for (let i = 0; i < buf.length; i++) buf[i] = (i * 7) & 0xFF;
    const order = BLOCK_ORDERS[10]!;
    expect(Array.from(unshuffleBlocks(shuffleBlocks(buf, 8, 32, order), 8, 32, order)))
      .toEqual(Array.from(buf));
  });
});

describe('PID → block-order index (TODO 8.5.3)', () => {
  it('Gen 3 uses pid % 24', () => {
    expect(getBlockOrderIndex(0, 3)).toBe(0);
    expect(getBlockOrderIndex(25, 3)).toBe(1);
    expect(getBlockOrderIndex(23, 3)).toBe(23);
  });

  it('Gen 4/5 use ((pid >> 13) & 31) % 24', () => {
    expect(getBlockOrderIndex(0xABCDE, 4)).toBe(((0xABCDE >> 13) & 31) % 24);
    expect(getBlockOrderIndex(0xABCDE, 5)).toBe(((0xABCDE >> 13) & 31) % 24);
  });

  it('always returns a valid index into BLOCK_ORDERS', () => {
    for (const pid of [0, 1, 0xFFFFFFFF, 0x12345678, 999999]) {
      for (const gen of [3, 4, 5]) {
        const idx = getBlockOrderIndex(pid, gen);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(24);
        expect(BLOCK_ORDERS[idx]).toBeDefined();
      }
    }
  });
});

describe('getEntityFormatByLength (TODO 8.5.3)', () => {
  it('maps known sizes to the right generation/context', () => {
    expect(getEntityFormatByLength(33)).toMatchObject({ generation: 1, context: 'stored' });
    expect(getEntityFormatByLength(48)).toMatchObject({ generation: 2, context: 'party' });
    expect(getEntityFormatByLength(80)).toMatchObject({ generation: 3, context: 'stored' });
    expect(getEntityFormatByLength(100)).toMatchObject({ generation: 3, context: 'party' });
  });

  it('reports 136 bytes as ambiguous between Gen 4 and Gen 5 (needs a checksum probe)', () => {
    const guess = getEntityFormatByLength(136);
    expect(guess).not.toBeNull();
    expect(guess!.ambiguous).toBe(true);
    expect(guess!.generation).toEqual([4, 5]);
  });

  it('returns null for unrecognized sizes', () => {
    expect(getEntityFormatByLength(1)).toBeNull();
    expect(getEntityFormatByLength(12345)).toBeNull();
  });
});
