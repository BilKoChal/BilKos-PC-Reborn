/**
 * Structural legality + bulk analysis tests (TODO §4).
 *
 * Unlike `legality.test.ts` (which only locks the *boundary* contract), these
 * exercise real logic: the generation-agnostic structural verifiers and the
 * cross-entity clone detector. Generation-agnosticism is proven by running the
 * SAME entity through Gen1/2-style limits (DV 0–15, no EV cap) and Gen3-style
 * limits (IV 0–31, 510 EV cap) and getting different, correct verdicts.
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeStructure,
  limitsFromAdapter,
  verifyIVs,
  verifyEVs,
  verifyLevel,
  verifySpecies,
  verifyMoves,
  analyzeBulk,
  isLegal,
  LegalitySeverity,
  type StructuralLimits,
} from '../lib/legality';
import { createEmptyCanonicalPokemon } from '../lib/canonicalModel';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';

const GEN12: StructuralLimits = {
  ivMax: 15,
  evMax: 65535,
  evTotalCap: undefined,
  nationalDexMax: 251,
  maxLevel: 100,
  statTermLabel: 'DV',
};

const GEN3: StructuralLimits = {
  ivMax: 31,
  evMax: 255,
  evTotalCap: 510,
  nationalDexMax: 386,
  maxLevel: 100,
  statTermLabel: 'IV',
};

function mon(overrides: Parameters<typeof createEmptyCanonicalPokemon>[0] = {}) {
  // A minimally "present" Pikachu so it isn't treated as an empty slot.
  return createEmptyCanonicalPokemon({
    speciesId: 25,
    dexId: 25,
    speciesName: 'Pikachu',
    nickname: 'PIKA',
    level: 50,
    moveIds: [84, 85, 0, 0],
    iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
    ...overrides,
  });
}

describe('limitsFromAdapter', () => {
  it('reads capability fields straight off the adapter (Gen1)', () => {
    const limits = limitsFromAdapter(new Gen1Adapter());
    expect(limits.ivMax).toBe(15);
    expect(limits.evMax).toBe(65535);
    expect(limits.evTotalCap).toBeUndefined();
    expect(limits.nationalDexMax).toBe(151);
    expect(limits.maxLevel).toBe(100); // universal constant
    expect(limits.statTermLabel).toBe('DV');
  });
});

describe('verifyLevel', () => {
  it('accepts levels within 1..maxLevel', () => {
    expect(verifyLevel(mon({ level: 1 }), GEN12)).toEqual([]);
    expect(verifyLevel(mon({ level: 100 }), GEN12)).toEqual([]);
  });
  it('rejects level above the cap', () => {
    const r = verifyLevel(mon({ level: 101 }), GEN12);
    expect(r).toHaveLength(1);
    expect(r[0]!.severity).toBe(LegalitySeverity.Invalid);
  });
});

describe('verifyIVs (DV/IV range is generation-driven)', () => {
  it('DV 15 is legal in Gen1/2', () => {
    expect(verifyIVs(mon(), GEN12)).toEqual([]);
  });
  it('an all-31 IV spread is legal in Gen3 but illegal in Gen1/2', () => {
    const perfect = mon({ iv: { hp: 31, attack: 31, defense: 31, speed: 31, special: 31, spAtk: 31, spDef: 31 } });
    expect(verifyIVs(perfect, GEN3)).toEqual([]);
    expect(verifyIVs(perfect, GEN12).length).toBeGreaterThan(0); // 31 > DV cap of 15
  });
});

describe('verifyEVs (per-stat + total cap)', () => {
  it('Gen1/2 has no total cap — maxed StatExp on every stat is legal', () => {
    const maxed = mon({ ev: { hp: 65535, attack: 65535, defense: 65535, speed: 65535, special: 65535, spAtk: 65535, spDef: 65535 } });
    expect(verifyEVs(maxed, GEN12)).toEqual([]);
  });
  it('Gen3 enforces the 510 total cap', () => {
    const underCap = mon({ ev: { hp: 252, attack: 252, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 } });
    expect(verifyEVs(underCap, GEN3)).toEqual([]); // 252+252 = 504 ≤ 510
    const wayOver = mon({ ev: { hp: 252, attack: 252, defense: 252, speed: 0, special: 0, spAtk: 0, spDef: 0 } }); // 756 > 510
    const r2 = verifyEVs(wayOver, GEN3);
    expect(r2.some((c) => c.comment.includes('total'))).toBe(true);
  });
  it('Gen3 rejects a single EV above 255', () => {
    const r = verifyEVs(mon({ ev: { hp: 300, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 } }), GEN3);
    expect(r.some((c) => c.severity === LegalitySeverity.Invalid)).toBe(true);
  });
});

describe('verifySpecies', () => {
  it('rejects a Dex ID beyond the generation maximum', () => {
    const r = verifySpecies(mon({ dexId: 300 }), GEN12); // 300 > 251
    expect(r.some((c) => c.severity === LegalitySeverity.Invalid)).toBe(true);
    expect(verifySpecies(mon({ dexId: 300 }), GEN3)).toEqual([]); // 300 <= 386
  });
});

describe('verifyMoves', () => {
  it('flags duplicate move slots as Invalid', () => {
    const r = verifyMoves(mon({ moveIds: [84, 84, 0, 0] }));
    expect(r.some((c) => c.severity === LegalitySeverity.Invalid)).toBe(true);
  });
  it('flags an empty moveset on a non-egg as Fishy', () => {
    const r = verifyMoves(mon({ moveIds: [0, 0, 0, 0] }));
    expect(r.some((c) => c.severity === LegalitySeverity.Fishy)).toBe(true);
  });
});

describe('analyzeStructure', () => {
  it('treats an all-zero entity as an empty slot', () => {
    const result = analyzeStructure(createEmptyCanonicalPokemon(), GEN12);
    expect(result.analyzed).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.summary).toMatch(/empty slot/i);
  });

  it('a clean Pokémon passes, and the summary never claims full legality', () => {
    const result = analyzeStructure(mon(), GEN12);
    expect(result.valid).toBe(true);
    expect(result.analyzed).toBe(true);
    expect(result.summary).toMatch(/no encounter analysis/i); // no false guarantee
    expect(isLegal(result)).toBe(true);
  });

  it('aggregates multiple problems and reports invalid', () => {
    const bad = mon({ level: 255, iv: { hp: 99, attack: 99, defense: 99, speed: 99, special: 99, spAtk: 99, spDef: 99 } });
    const result = analyzeStructure(bad, GEN12);
    expect(result.valid).toBe(false);
    expect(isLegal(result)).toBe(false);
    expect(result.results.length).toBeGreaterThan(1);
  });
});

describe('analyzeBulk (clone detection)', () => {
  it('finds nothing in a collection of distinct Pokémon', () => {
    const box = [mon({ nickname: 'A', originalTrainerId: 1 }), mon({ dexId: 6, nickname: 'B', originalTrainerId: 2 })];
    const { results, duplicateGroups } = analyzeBulk(box);
    expect(results).toEqual([]);
    expect(duplicateGroups).toEqual([]);
  });

  it('flags two byte-identical Gen1/2 Pokémon (composite identity) as Fishy clones', () => {
    const clone = () => mon({ nickname: 'PIKA', originalTrainerId: 7 });
    const { results, duplicateGroups } = analyzeBulk([clone(), clone()]);
    expect(duplicateGroups).toHaveLength(1);
    expect(duplicateGroups[0]!.indices).toEqual([0, 1]);
    expect(results[0]!.severity).toBe(LegalitySeverity.Fishy);
  });

  it('groups Gen3 entities by repeated PID', () => {
    const a = mon({ pid: 0xABCDEF01, nickname: 'X' });
    const b = mon({ pid: 0xABCDEF01, nickname: 'Y' }); // different nickname, same PID → clone
    const c = mon({ pid: 0x12345678, nickname: 'Z' });
    const { duplicateGroups } = analyzeBulk([a, b, c]);
    expect(duplicateGroups).toHaveLength(1);
    expect(duplicateGroups[0]!.indices).toEqual([0, 1]);
  });

  it('ignores empty slots', () => {
    const { duplicateGroups } = analyzeBulk([createEmptyCanonicalPokemon(), createEmptyCanonicalPokemon()]);
    expect(duplicateGroups).toEqual([]);
  });
});
