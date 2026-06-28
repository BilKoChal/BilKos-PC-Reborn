/**
 * Cross-generation transfer tests (TODO 5.5).
 *
 * These lock the behavior of `lib/utils/crossGenConverter.ts`, the module that
 * remaps a CanonicalPokemon when it is dragged between save tabs of different
 * generations. It is pure data transformation (no binary I/O), so it can be
 * exercised directly with synthetic mons — exactly the kind of logic that is
 * easy to silently break when adding a generation.
 *
 * Coverage mirrors the TODO checklist:
 *   - Gen1→Gen2: catch-rate/held-item rules, friendship default (70), type
 *     upgrade (Magnemite gains Steel), genExtension swap, DV-derived gender.
 *   - Gen2→Gen1: reject dex > 151, strip moves > 165, drop held item, collapse
 *     SpAtk → unified Special, strip friendship/gender/pokerus.
 *   - The pre-flight helpers (canTransferToGen, getTransferImpactDescription)
 *     and the lower-level primitives (convertSpeciesId, validateMovesForTargetGen).
 *
 * The converter resolves the target adapter through the global `registry`
 * singleton, so we eagerly register the real Gen1/Gen2 adapters first.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { registry } from '../lib/core/AdapterRegistry';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import {
  convertPokemonForTransfer,
  convertSpeciesId,
  validateMovesForTargetGen,
  canTransferToGen,
  getTransferImpactDescription,
} from '../lib/utils/crossGenConverter';
import {
  createEmptyCanonicalPokemon,
  Gen1Extension,
  Gen2Extension,
  isGen1Extension,
  isGen2Extension,
} from '../lib/canonicalModel';
import type { PokemonStats } from '../lib/parser/types';

beforeAll(() => {
  // The converter calls registry.getAdapter() synchronously, so the real
  // adapters must be loaded. Eager registration is the public API for this.
  registry.register(new Gen1Adapter());
  registry.register(new Gen2Adapter());
});

// ── Source mon builders ──────────────────────────────────────────────────

/** A Gen 1 Pikachu (#25). Gen1 internal speciesId for Pikachu is 0x54 = 84. */
function makeGen1Pikachu(overrides: Partial<PokemonStats> = {}): PokemonStats {
  const ext = new Gen1Extension();
  ext.catchRate = 190;
  ext.special = 50;
  ext.isParty = true;
  return createEmptyCanonicalPokemon({
    speciesId: 84,
    dexId: 25,
    speciesName: 'Pikachu',
    nickname: 'SPARKY',
    level: 25,
    moveIds: [84, 85, 86, 24], // Thunder Shock, Thunderbolt, Thunder, Double Kick — all ≤ 165
    moves: ['Thunder Shock', 'Thunderbolt', 'Thunder', 'Double Kick'],
    special: 50,
    spAtk: 50,
    spDef: 50,
    iv: { hp: 0, attack: 13, defense: 9, speed: 11, special: 7, spAtk: 7, spDef: 7 },
    isParty: true,
    genExtension: ext,
    ...overrides,
  });
}

/** A Gen 1 Magnemite (#81) — Electric in Gen1, gains Steel in Gen2. */
function makeGen1Magnemite(): PokemonStats {
  const ext = new Gen1Extension();
  ext.catchRate = 190;
  ext.special = 95;
  return createEmptyCanonicalPokemon({
    speciesId: 0, // internal id irrelevant: conversion routes through dexId
    dexId: 81,
    speciesName: 'Magnemite',
    type1Name: 'Electric',
    type2Name: 'Electric',
    level: 20,
    moveIds: [33, 0, 0, 0],
    moves: ['Tackle', '', '', ''],
    spAtk: 95,
    spDef: 55,
    iv: { hp: 0, attack: 8, defense: 8, speed: 8, special: 8, spAtk: 8, spDef: 8 },
    genExtension: ext,
  });
}

/**
 * A Gen 2 Charizard (#6) with a held item, friendship, and a Gen2-only move.
 * Kanto species (dex ≤ 151) so it is *eligible* to transfer back to Gen 1.
 */
function makeGen2Charizard(overrides: Partial<PokemonStats> = {}): PokemonStats {
  const ext = new Gen2Extension();
  ext.heldItemId = 1;
  ext.heldItemName = 'Master Ball';
  ext.friendship = 200;
  ext.gender = 'Male';
  return createEmptyCanonicalPokemon({
    speciesId: 6,
    dexId: 6,
    speciesName: 'Charizard',
    level: 50,
    heldItemId: 1,
    heldItemName: 'Master Ball',
    friendship: 200,
    gender: 'Male',
    pokerus: 4,
    moveIds: [172, 53, 0, 0], // Flame Wheel (172 > 165, Gen2-only), Flamethrower (53)
    moves: ['Flame Wheel', 'Flamethrower', '', ''],
    spAtk: 109,
    spDef: 85,
    iv: { hp: 0, attack: 10, defense: 10, speed: 10, special: 10, spAtk: 10, spDef: 10 },
    genExtension: ext,
    ...overrides,
  });
}

// ── Gen 1 → Gen 2 ──────────────────────────────────────────────────────────

describe('convertPokemonForTransfer — Gen 1 → Gen 2', () => {
  it('upgrades types (Magnemite gains Steel)', () => {
    const res = convertPokemonForTransfer(makeGen1Magnemite(), 1, 2);
    expect(res.error).toBeUndefined();
    expect(res.mon).not.toBeNull();
    expect(res.mon!.type1Name).toBe('Electric');
    expect(res.mon!.type2Name).toBe('Steel');
  });

  it('sets default friendship (70) and warns', () => {
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 2);
    expect(res.mon!.friendship).toBe(70);
    expect(res.warnings.some(w => /friendship/i.test(w))).toBe(true);
  });

  it('leaves no held item (Gen 1 had none)', () => {
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 2);
    expect(res.mon!.heldItemId).toBe(0);
    expect(res.mon!.heldItemName).toBe('None');
  });

  it('replaces the genExtension with a Gen2Extension', () => {
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 2);
    expect(isGen2Extension(res.mon!.genExtension)).toBe(true);
    expect(isGen1Extension(res.mon!.genExtension)).toBe(false);
  });

  it('keeps the National Dex id stable across the hop', () => {
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 2);
    expect(res.mon!.dexId).toBe(25);
    // Gen2 speciesId equals the National Dex id.
    expect(res.mon!.speciesId).toBe(25);
  });

  it('clears stale raw bytes so the Gen 2 writer rebuilds them', () => {
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 2);
    expect(res.mon!.raw.length).toBe(0);
    expect(res.mon!.startOffset).toBe(0);
  });
});

// ── Gen 2 → Gen 1 ──────────────────────────────────────────────────────────

describe('convertPokemonForTransfer — Gen 2 → Gen 1', () => {
  it('rejects a Pokémon whose National Dex id exceeds 151', () => {
    // Chikorita #152 is Johto-only and cannot exist in a Gen 1 save.
    const chikorita = createEmptyCanonicalPokemon({
      dexId: 152,
      speciesId: 152,
      speciesName: 'Chikorita',
      genExtension: new Gen2Extension(),
    });
    const res = convertPokemonForTransfer(chikorita, 2, 1);
    expect(res.mon).toBeNull();
    expect(res.error).toBeTruthy();
    expect(res.error).toMatch(/Gen 1/);
  });

  it('strips Gen 2-exclusive moves (id > 165) and warns', () => {
    const res = convertPokemonForTransfer(makeGen2Charizard(), 2, 1);
    expect(res.error).toBeUndefined();
    // Flame Wheel (172) removed; Flamethrower (53) kept.
    expect(res.mon!.moveIds).toContain(53);
    expect(res.mon!.moveIds).not.toContain(172);
    expect(res.warnings.some(w => /does not exist in Gen 1/i.test(w))).toBe(true);
  });

  it('drops the held item and warns', () => {
    const res = convertPokemonForTransfer(makeGen2Charizard(), 2, 1);
    expect(res.mon!.heldItemId).toBeUndefined();
    expect(res.mon!.heldItemName).toBeUndefined();
    expect(res.warnings.some(w => /held item/i.test(w))).toBe(true);
  });

  it('collapses SpAtk into the unified Special stat', () => {
    const res = convertPokemonForTransfer(makeGen2Charizard(), 2, 1);
    // Source SpAtk was 109; Gen1 Special is seeded from it (stats are then
    // recalculated, but the unified Special field must be populated).
    expect(res.mon!.special).toBeGreaterThan(0);
    expect(res.mon!.spAtk).toBe(res.mon!.special);
  });

  it('strips friendship, gender and pokerus', () => {
    const res = convertPokemonForTransfer(makeGen2Charizard(), 2, 1);
    expect(res.mon!.friendship).toBe(0);
    expect(res.mon!.gender).toBe('Genderless');
    expect(res.mon!.pokerus).toBe(0);
  });

  it('replaces the genExtension with a Gen1Extension carrying the catch rate', () => {
    const res = convertPokemonForTransfer(makeGen2Charizard(), 2, 1);
    const ext = res.mon!.genExtension;
    expect(isGen1Extension(ext)).toBe(true);
    expect((ext as Gen1Extension).catchRate).toBeGreaterThan(0);
  });
});

// ── No-op same-gen transfer ──────────────────────────────────────────────

describe('convertPokemonForTransfer — same generation', () => {
  it('returns the mon untouched with no warnings', () => {
    const mon = makeGen1Pikachu();
    const res = convertPokemonForTransfer(mon, 1, 1);
    expect(res.mon).toBe(mon);
    expect(res.warnings).toEqual([]);
  });
});

// ── Primitive helpers ────────────────────────────────────────────────────

describe('convertSpeciesId', () => {
  it('maps any dex ≤ 151 to a valid Gen 1 internal id', () => {
    // Pikachu #25 → Gen1 internal 0x54 (84).
    expect(convertSpeciesId(25, 2, 1, 25)).toBe(84);
  });

  it('returns null when the dex id is out of Gen 1 range', () => {
    expect(convertSpeciesId(152, 2, 1, 152)).toBeNull();
    expect(convertSpeciesId(0, 2, 1, 0)).toBeNull();
  });

  it('uses the National Dex id directly for Gen 2 targets', () => {
    expect(convertSpeciesId(84, 1, 2, 25)).toBe(25);
    expect(convertSpeciesId(0, 1, 2, 251)).toBe(251);
    expect(convertSpeciesId(0, 1, 2, 252)).toBeNull();
  });

  it('is a no-op within the same generation', () => {
    expect(convertSpeciesId(84, 1, 1, 25)).toBe(84);
  });

  // BUG-G04 fix: Gen 3 uses the National Dex ID as its internal speciesId
  // (same as Gen 2). Previously the function returned the source `speciesId`
  // unchanged for any toGen >= 3, which would corrupt Gen 1 → Gen 3 transfers
  // (a Gen 1 Pikachu has speciesId=84; returning 84 as the Gen 3 speciesId
  // would point at a completely different Pokémon).
  it('BUG-G04 fix: uses National Dex id for Gen 3 targets', () => {
    expect(convertSpeciesId(84, 1, 3, 25)).toBe(25);  // Gen1 Pikachu → Gen3
    expect(convertSpeciesId(25, 2, 3, 25)).toBe(25);  // Gen2 Pikachu → Gen3
    expect(convertSpeciesId(0, 1, 3, 386)).toBe(386); // Deoxys
  });

  it('BUG-G04 fix: rejects dex out of Gen 3 range (1..386)', () => {
    expect(convertSpeciesId(0, 1, 3, 0)).toBeNull();
    expect(convertSpeciesId(0, 1, 3, 387)).toBeNull(); // Turtwig (Gen 4)
    expect(convertSpeciesId(0, 1, 3, 470)).toBeNull(); // Leafeon (Gen 4)
  });
});

describe('validateMovesForTargetGen', () => {
  it('strips Gen 2-only moves for a Gen 1 target and pads to 4 slots', () => {
    const { moves, warnings } = validateMovesForTargetGen([53, 200, 172, 0], ['Flamethrower', 'a', 'b', ''], 1);
    expect(moves).toHaveLength(4);
    expect(moves).toContain(53);
    expect(moves).not.toContain(200);
    expect(moves).not.toContain(172);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('defaults to Pound (1) if every move was Gen 2-exclusive', () => {
    const { moves, warnings } = validateMovesForTargetGen([200, 246, 251, 199], ['a', 'b', 'c', 'd'], 1);
    expect(moves[0]).toBe(1);
    expect(warnings.some(w => /Pound/i.test(w))).toBe(true);
  });

  it('keeps all moves for a Gen 2 target', () => {
    const { moves, warnings } = validateMovesForTargetGen([172, 200, 53, 0], ['a', 'b', 'c', ''], 2);
    expect(moves).toEqual([172, 200, 53, 0]);
    expect(warnings).toEqual([]);
  });
});

describe('canTransferToGen', () => {
  it('gates Gen 1 to dex 1..151', () => {
    expect(canTransferToGen(151, 1)).toBe(true);
    expect(canTransferToGen(152, 1)).toBe(false);
    expect(canTransferToGen(0, 1)).toBe(false);
  });

  it('gates Gen 2 to dex 1..251', () => {
    expect(canTransferToGen(251, 2)).toBe(true);
    expect(canTransferToGen(252, 2)).toBe(false);
  });

  // BUG-G05 fix: Gen 3 now correctly gates to 1..386. Previously returned
  // `true` for any dexId when targetGen >= 3, which would silently allow a
  // Gen 4 Leafeon (#470) into a Gen 3 transfer.
  it('BUG-G05 fix: gates Gen 3 to dex 1..386', () => {
    expect(canTransferToGen(386, 3)).toBe(true);   // Deoxys
    expect(canTransferToGen(387, 3)).toBe(false);  // Turtwig (Gen 4)
    expect(canTransferToGen(470, 3)).toBe(false);  // Leafeon (Gen 4)
    expect(canTransferToGen(0, 3)).toBe(false);
  });

  it('BUG-G05 fix: returns false for unknown generations (safe default)', () => {
    // Previously returned `true` for any unknown targetGen. Now returns `false`
    // so an unsupported generation can't silently accept an invalid transfer.
    expect(canTransferToGen(25, 99)).toBe(false);
  });
});

describe('getTransferImpactDescription', () => {
  it('describes losses for a Gen 2 → Gen 1 transfer', () => {
    const impacts = getTransferImpactDescription(makeGen2Charizard(), 2, 1);
    expect(impacts.length).toBeGreaterThan(0);
    expect(impacts.some(i => /held item/i.test(i))).toBe(true);
    expect(impacts.some(i => /Gen 2-exclusive moves/i.test(i))).toBe(true);
  });

  it('describes upgrades for a Gen 1 → Gen 2 transfer', () => {
    const impacts = getTransferImpactDescription(makeGen1Magnemite(), 1, 2);
    expect(impacts.some(i => /Steel/i.test(i))).toBe(true);
    expect(impacts.some(i => /friendship/i.test(i))).toBe(true);
  });

  it('returns nothing for a same-gen transfer', () => {
    expect(getTransferImpactDescription(makeGen1Pikachu(), 1, 1)).toEqual([]);
  });
});

// ============================================================================
// Hub-and-spoke invariant (TODO 8.5.5): dexId is the transfer hub key
// ============================================================================

describe('Hub-and-spoke transfer: National Dex id survives a round-trip (TODO 8.5.5)', () => {
  it('Gen 1 → Gen 2 → Gen 1 preserves the dexId (the hub key)', () => {
    const original = makeGen1Pikachu();
    const toGen2 = convertPokemonForTransfer(original, 1, 2);
    expect(toGen2.mon).not.toBeNull();
    expect(toGen2.mon!.dexId).toBe(original.dexId); // hub key preserved outbound

    const backToGen1 = convertPokemonForTransfer(toGen2.mon!, 2, 1);
    expect(backToGen1.mon).not.toBeNull();
    expect(backToGen1.mon!.dexId).toBe(original.dexId); // …and on the return hop
  });

  it('conversion routes through dexId, not pairwise internal ids (internal id is recomputed)', () => {
    // Pikachu: Gen 1 internal id 84, Gen 2 internal id = National Dex 25.
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 2);
    expect(res.mon!.dexId).toBe(25);
    expect(res.mon!.speciesId).toBe(25); // target-gen internal id derived FROM the hub dexId
  });
});

// ============================================================================
// BUG-G3-03 fix: Gen 3 transfer handling
// ============================================================================
// Gen 3 is not yet registered as an adapter (it's "Planned" per the README),
// so `convertPokemonForTransfer` into Gen 3 will refuse with "No adapter
// registered for generation 3". These tests verify:
//   1. The refusal is graceful (returns an error, doesn't throw).
//   2. The species-range gate (BUG-G05) rejects Gen 4+ species BEFORE the
//      adapter lookup, so the error message is specific.
//   3. The impact-description helper (BUG-G3-03) documents what a Gen 3
//      transfer would do, so the UI can warn the user even before the
//      adapter exists.
describe('BUG-G3-03: Gen 3 transfer handling', () => {
  it('rejects a Gen 3 transfer with a clear error when no adapter is registered', () => {
    const res = convertPokemonForTransfer(makeGen1Pikachu(), 1, 3);
    expect(res.mon).toBeNull();
    expect(res.error).toBeTruthy();
    expect(res.error!).toMatch(/generation 3/i);
  });

  it('BUG-G05 fix: rejects Gen 4+ species before the adapter lookup (specific error)', () => {
    // Build a mon with dexId > 386 (Leafeon #470) — should be rejected by the
    // species gate, not by the adapter-missing gate.
    const leafeon = { ...makeGen1Pikachu(), dexId: 470, speciesName: 'Leafeon' };
    const res = convertPokemonForTransfer(leafeon, 1, 3);
    expect(res.mon).toBeNull();
    expect(res.error).toBeTruthy();
    expect(res.error!).toMatch(/Gen 3 save/i);   // species-gate message, not adapter message
    expect(res.error!).not.toMatch(/adapter/i);
  });

  it('BUG-G3-03 fix: getTransferImpactDescription documents Gen 3 transfer impacts', () => {
    const impacts = getTransferImpactDescription(makeGen1Pikachu(), 1, 3);
    expect(impacts.length).toBeGreaterThan(0);
    // Should mention DV→IV padding, EV capping, PID/Nature synthesis, and the
    // Gen 3 stat formula.
    expect(impacts.some(i => /DVs/i.test(i))).toBe(true);
    expect(impacts.some(i => /PID|Nature/i.test(i))).toBe(true);
    expect(impacts.some(i => /Gen 3 formulas/i.test(i))).toBe(true);
  });

  it('BUG-G3-03 fix: Gen 2 → Gen 3 impact description also documents the changes', () => {
    const impacts = getTransferImpactDescription(makeGen2Charizard(), 2, 3);
    expect(impacts.some(i => /DVs/i.test(i))).toBe(true);
    expect(impacts.some(i => /PID|Nature/i.test(i))).toBe(true);
  });
});
