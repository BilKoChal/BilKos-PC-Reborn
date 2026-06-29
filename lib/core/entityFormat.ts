/**
 * Entity format helpers for standalone Pokémon files (TODO 8.5.3).
 *
 * This module makes the Gen 3+ entity seam *real* without implementing any
 * specific generation. It provides the two reusable, generation-agnostic
 * primitives a future Gen 3-7 standalone format needs inside its
 * `decryptBlock`/`encryptBlock`:
 *
 *   1. A PID-keyed **block shuffle** (Gen 3+ stores four equal-size data blocks
 *      reordered into one of 24 orderings keyed by the PID). The transform here
 *      is provably invertible for all 24 orders — that is the property a real
 *      implementation depends on.
 *   2. **Length-based format detection** (`getEntityFormatByLength`), the
 *      counterpart to PKHeX's `EntityFormat.GetFormatInternal`, including the
 *      ambiguous 136-byte Gen 4/5 case that needs a checksum/data probe.
 *
 * Gen 1/2 are plaintext and unshuffled, so they do not use the shuffle; their
 * `decryptBlock`/`encryptBlock` remain identity. THIS IS NOT A GEN 3
 * IMPLEMENTATION — it is the validated seam Gen 3 will plug into.
 *
 * ⚠️ When Gen 3+ is actually implemented, the *indexing* of the 24 orders (which
 * `sv` maps to which permutation) and the XOR/LCG stream MUST be validated
 * byte-for-byte against PKHeX and a real `.pk3`/`.pk4` fixture. What this module
 * guarantees today is the invertible round-trip and the size waterfall — the
 * parts that are generation-independent and testable without a fixture.
 */

import { registry } from './AdapterRegistry';

/** The 24 permutations of the four data-block slots, generated lexicographically
 *  so the table is deterministic and stable across runs. Index 0 = identity. */
export const BLOCK_ORDERS: ReadonlyArray<readonly [number, number, number, number]> = (() => {
  const out: [number, number, number, number][] = [];
  const permute = (arr: number[], chosen: number[]): void => {
    if (arr.length === 0) {
      out.push(chosen as [number, number, number, number]);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      permute([...arr.slice(0, i), ...arr.slice(i + 1)], [...chosen, arr[i]!]);
    }
  };
  permute([0, 1, 2, 3], []);
  return out;
})();

/**
 * Derive the block-order index (0..23) from a PID.
 * - Gen 3: `pid % 24`.
 * - Gen 4/5: `((pid >> 13) & 31) % 24`.
 * (Gen 6+ store blocks unshuffled in the box but apply the same idea on-disk;
 *  callers pass the generation so the right seed extraction is used.)
 */
export function getBlockOrderIndex(pid: number, generation: number): number {
  const p = pid >>> 0;
  if (generation <= 3) return p % 24;
  return ((p >> 13) & 31) % 24;
}

/**
 * Reorder `blockCount` equal-size data blocks (each `blockSize` bytes, starting
 * after a `headerSize`-byte header) into the given order. `order[i]` is the
 * source slot that should land in slot `i`. Header bytes are copied verbatim.
 */
export function shuffleBlocks(
  data: Uint8Array,
  headerSize: number,
  blockSize: number,
  order: readonly number[]
): Uint8Array {
  const out = new Uint8Array(data);
  for (let i = 0; i < order.length; i++) {
    const src = order[i]!;
    const from = headerSize + blockSize * src;
    const to = headerSize + blockSize * i;
    out.set(data.subarray(from, from + blockSize), to);
  }
  return out;
}

/** Inverse of {@link shuffleBlocks}: given the same order, restore canonical
 *  block layout. `unshuffleBlocks(shuffleBlocks(d, h, b, o), h, b, o) === d`. */
export function unshuffleBlocks(
  data: Uint8Array,
  headerSize: number,
  blockSize: number,
  order: readonly number[]
): Uint8Array {
  const out = new Uint8Array(data);
  for (let i = 0; i < order.length; i++) {
    const dst = order[i]!;
    const from = headerSize + blockSize * i;
    const to = headerSize + blockSize * dst;
    out.set(data.subarray(from, from + blockSize), to);
  }
  return out;
}

export interface EntityFormatGuess {
  /** Candidate generation(s). A single number when unambiguous; multiple when
   *  the byte length alone cannot decide (e.g. 136 → Gen 4 or Gen 5 stored). */
  generation: number | number[];
  /** 'stored' (PC box) vs 'party' (includes battle stats) where distinguishable. */
  context: 'stored' | 'party' | 'unknown';
  /** True when `generation` is a list and a checksum/data probe is required. */
  ambiguous: boolean;
}

/**
 * Map a loose entity file's byte length to its likely generation/format —
 * the counterpart to PKHeX's `EntityFormat.GetFormatInternal`. Returns null for
 * unrecognized sizes. The 136-byte case is intentionally reported as ambiguous
 * (Gen 4 *or* Gen 5 stored); resolving it needs the per-format checksum probe a
 * real implementation supplies.
 */
/**
 * Phase 1.5: getEntityFormatByLength first checks loaded adapters (via the
 * registry's `supportedEntitySizes` metadata), then falls back to the static
 * table below for sizes that belong to not-yet-loaded generations (since
 * detection happens before an adapter is loaded — chicken-and-egg).
 *
 * The static table is a known OCP violation: adding Gen 7+ requires editing
 * this central file. The long-term fix (post-Phase 1) is a static-metadata
 * registry that doesn't require adapter loading. For now, each adapter
 * declares its `supportedEntitySizes` so the information is at least
 * co-located with the generation, even if the fallback table is central.
 */
export function getEntityFormatByLength(length: number): EntityFormatGuess | null {
  // Phase 1.5: first check loaded adapters for a matching size.
  const adapters = registry.getAdapters();
  for (const adapter of adapters) {
    const match = adapter.supportedEntitySizes?.find(s => s.size === length);
    if (match) {
      return { generation: adapter.generation, context: match.context, ambiguous: false };
    }
  }

  // Fallback: static table for not-yet-loaded generations.
  switch (length) {
    // Gen 1 (PokeList single-entry sizes are handled by the Gen1 format itself)
    case 33: return { generation: 1, context: 'stored', ambiguous: false };
    case 44: return { generation: 1, context: 'party', ambiguous: false };
    // Gen 2
    case 32: return { generation: 2, context: 'stored', ambiguous: false };
    case 48: return { generation: 2, context: 'party', ambiguous: false };
    // Gen 3
    case 80: return { generation: 3, context: 'stored', ambiguous: false };
    case 100: return { generation: 3, context: 'party', ambiguous: false };
    // Gen 4 / 5 — 136 stored is AMBIGUOUS between the two generations.
    case 136: return { generation: [4, 5], context: 'stored', ambiguous: true };
    case 236: return { generation: 4, context: 'party', ambiguous: false };
    case 220: return { generation: 5, context: 'party', ambiguous: false };
    // Gen 6 / 7
    case 232: return { generation: 6, context: 'stored', ambiguous: false };
    case 260: return { generation: 6, context: 'party', ambiguous: false };
    default: return null;
  }
}
