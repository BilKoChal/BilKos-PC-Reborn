/**
 * Populated round-trip + stat-recalc regression tests.
 *
 * These tests lock in three fixes from TODO.md:
 *   - 2.1  Gen 1 writer must NOT discard the Pokémon status condition.
 *   - 2.2  Gen 2 writer must NOT discard the party Pokémon status condition.
 *   - 2.3  Gen 1 stat recalculation must re-derive the HP DV from the other DVs.
 *
 * Unlike the existing roundTrip.test.ts (which round-trips EMPTY saves), these
 * tests inject a fully-populated party Pokémon carrying a non-OK status and
 * verify the value survives write→re-parse. They are designed to FAIL on the
 * pre-fix code (status forced to 0 / "OK", HP DV left stale) and PASS after.
 */
import { describe, it, expect } from 'vitest';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import { recalculateStats } from '../lib/utils/statCalculator';
import { recalculateGen2Stats } from '../lib/generations/gen2/statCalculator';
import { encodeStatusByte, decodeStatus } from '../lib/utils/byteHelpers';
import { GameBoyTextCodec } from '../lib/utils/GameBoyTextCodec';
import { JPN_KATAKANA } from '../lib/utils/gbCharsets';
import { Gen1Extension, Gen2Extension } from '../lib/canonicalModel';
import type { PokemonStats } from '../lib/parser/types';
import type { BaseStats } from '../lib/interfaces';

// ============================================================================
// Minimal valid save builders (mirrors roundTrip.test.ts)
// ============================================================================

function createMinimalGen1Save(): Uint8Array {
  const data = new Uint8Array(32768);
  data.fill(0xFF);

  // Player name "RED" @0x2598
  data[0x2598] = 0x91; data[0x2599] = 0x84; data[0x259A] = 0x83; data[0x259B] = 0x50;
  for (let i = 0x259C; i < 0x2598 + 11; i++) data[i] = 0x50;
  // Rival name "BLUE" @0x25F6
  data[0x25F6] = 0x80; data[0x25F7] = 0x8A; data[0x25F8] = 0x94; data[0x25F9] = 0x84; data[0x25FA] = 0x50;
  for (let i = 0x25FB; i < 0x25F6 + 11; i++) data[i] = 0x50;

  data[0x2605] = 0x00; data[0x2606] = 0x01;          // Player ID
  data[0x25F3] = 0x00; data[0x25F4] = 0x30; data[0x25F5] = 0x00; // Money
  data[0x2850] = 0x00; data[0x2851] = 0x00;          // Coins
  data[0x2602] = 0x00;                                // Badges
  data[0x2601] = 0x03;                                // Options
  data[0x2CED] = 0; data[0x2CEE] = 0; data[0x2CEF] = 0; data[0x2CF0] = 0; // Play time
  data[0x25C9] = 0xFF;                                // Bag empty
  data[0x27E6] = 0xFF;                                // PC items empty
  for (let i = 0x2F2C; i < 0x3524; i++) data[i] = 0x00;
  data[0x2F2C] = 0x00;                                // Party count 0
  for (let i = 0x25A3; i < 0x25A3 + 19; i++) data[i] = 0x00;
  for (let i = 0x25B6; i < 0x25B6 + 19; i++) data[i] = 0x00;
  for (let i = 0x2852; i < 0x2852 + 32; i++) data[i] = 0x00;
  data[0x271C] = 0x00;                                // Pikachu friendship (avoid Yellow detection)
  for (let i = 0x4000; i < 0x8000; i++) data[i] = 0x00;
  for (let i = 0x30C0; i < 0x30C0 + 1122; i++) data[i] = 0x00;

  let sum = 0;
  for (let i = 0x2598; i <= 0x3522; i++) sum += data[i]!;
  data[0x3523] = (~sum) & 0xFF;
  return data;
}

function createMinimalGen2Save(): Uint8Array {
  const data = new Uint8Array(32768);
  data.fill(0x00);
  data[0x2000] = 0x03;                                // Options
  data[0x2009] = 0x00; data[0x200A] = 0x01;          // Trainer ID
  data[0x200B] = 0x86; data[0x200C] = 0x8E; data[0x200D] = 0x8B; data[0x200E] = 0x83; // "GOLD"
  for (let i = 0x200F; i < 0x200B + 8; i++) data[i] = 0x50;
  data[0x23DB] = 0x00; data[0x23DC] = 0x30; data[0x23DD] = 0x00; // Money
  data[0x23E4] = 0x00; data[0x23E5] = 0x00;          // Badges
  data[0x288A] = 0;                                   // Party count 0
  data[0x2724] = 0;                                   // Current box id
  data[0x23E6] = 0; data[0x23E7] = 0xFF;             // Items
  data[0x2411] = 0; data[0x2412] = 0xFF;             // Key items
  data[0x242C] = 0; data[0x242E] = 0xFF;             // Balls
  data[0x24AC] = 0; data[0x24AD] = 0xFF;             // PC items

  const gsChecksum = (() => { let s = 0; for (let i = 0x2009; i <= 0x2D68; i++) s += data[i]!; return s & 0xFFFF; })();
  data[0x2D69] = gsChecksum & 0xFF; data[0x2D6A] = (gsChecksum >> 8) & 0xFF;
  const dataBlock = data.slice(0x2009, 0x2D69);
  data.set(dataBlock, 0x3009);
  let bs = 0; for (let i = 0x3009; i <= 0x3D68; i++) bs += data[i]!;
  data[0x3D69] = (bs & 0xFFFF) & 0xFF; data[0x3D6A] = ((bs & 0xFFFF) >> 8) & 0xFF;
  data[0x3E3D] = 0;                                   // Gender male
  return data;
}

// ============================================================================
// CDM Pokémon factories (a fully-formed party mon the writer can serialize)
// ============================================================================

function buildGen1PartyMon(overrides: Partial<PokemonStats> = {}): PokemonStats {
  const ext = new Gen1Extension();
  ext.catchRate = 45;
  ext.special = 50;
  ext.isParty = true;
  const mon: PokemonStats = {
    speciesId: 0, dexId: 25, speciesName: 'PIKACHU', nickname: 'SPARKY', isNicknamed: true,
    pid: 0, form: 0,
    originalTrainerName: 'RED', originalTrainerId: 1, secretId: 0, originalTrainerGender: 'Male',
    level: 50, exp: 125000, friendship: 0,
    hp: 100, maxHp: 100, attack: 60, defense: 55, speed: 90, special: 50, spAtk: 50, spDef: 50,
    iv: { hp: 0, attack: 12, defense: 9, speed: 15, special: 7, spAtk: 7, spDef: 7 },
    ev: { hp: 1000, attack: 2000, defense: 1500, speed: 3000, special: 1200, spAtk: 1200, spDef: 1200 },
    moves: ['THUNDERSHOCK', 'GROWL', 'TAIL WHIP', 'QUICK ATTACK'],
    moveIds: [84, 45, 39, 98], movePp: [30, 40, 30, 30], movePpUps: [0, 0, 0, 0],
    status: 'OK', catchRate: 45,
    type1: 23, type2: 23, type1Name: 'Electric', type2Name: 'Electric',
    isParty: true, isEgg: false, isShiny: false, gender: 'Male', pokerus: 0,
    genExtension: ext,
    raw: new Uint8Array(44), startOffset: 0,
    nicknameRaw: new Uint8Array(11), otNameRaw: new Uint8Array(11),
  };
  return { ...mon, ...overrides };
}

function buildGen2PartyMon(overrides: Partial<PokemonStats> = {}): PokemonStats {
  const ext = new Gen2Extension();
  ext.spAtk = 50; ext.spDef = 55; ext.friendship = 70;
  const mon: PokemonStats = {
    speciesId: 155, dexId: 155, speciesName: 'CYNDAQUIL', nickname: 'BLAZE', isNicknamed: true,
    pid: 0, form: 0,
    originalTrainerName: 'GOLD', originalTrainerId: 1, secretId: 0, originalTrainerGender: 'Male',
    level: 40, exp: 64000, friendship: 70,
    hp: 90, maxHp: 90, attack: 55, defense: 48, speed: 70, special: 50, spAtk: 50, spDef: 55,
    iv: { hp: 0, attack: 10, defense: 8, speed: 13, special: 6, spAtk: 6, spDef: 6 },
    ev: { hp: 500, attack: 800, defense: 600, speed: 900, special: 400, spAtk: 400, spDef: 400 },
    moves: ['TACKLE', 'LEER', 'SMOKESCREEN', 'EMBER'],
    moveIds: [33, 43, 108, 52], movePp: [35, 30, 20, 25], movePpUps: [0, 0, 0, 0],
    status: 'OK', catchRate: 0,
    type1: 1, type2: 1, type1Name: 'Fire', type2Name: 'Fire',
    isParty: true, isEgg: false, isShiny: false, gender: 'Male', pokerus: 0,
    heldItemId: 0, heldItemName: 'None',
    genExtension: ext,
    raw: new Uint8Array(48), startOffset: 0,
    nicknameRaw: new Uint8Array(11), otNameRaw: new Uint8Array(11),
  };
  return { ...mon, ...overrides };
}

// ============================================================================
// 2.1 — Gen 1 status survives round-trip
// ============================================================================

describe('Gen 1 populated round-trip — status condition (TODO 2.1)', () => {
  const adapter = new Gen1Adapter();

  const statuses = ['SLP', 'PSN', 'BRN', 'FRZ', 'PAR'] as const;

  for (const status of statuses) {
    it(`preserves "${status}" on a party Pokémon through write→parse`, () => {
      const save = adapter.parseSave(createMinimalGen1Save(), 'red.sav');
      const mon = buildGen1PartyMon({ status });
      save.party = [mon];
      save.partyCount = 1;

      const written = adapter.writeSave(save);
      const reparsed = adapter.parseSave(written, 'red.sav');

      expect(reparsed.party).toHaveLength(1);
      expect(reparsed.party[0]!.status).toBe(status);
    });
  }

  it('keeps "OK" as OK (no false positive)', () => {
    const save = adapter.parseSave(createMinimalGen1Save(), 'red.sav');
    save.party = [buildGen1PartyMon({ status: 'OK' })];
    save.partyCount = 1;
    const reparsed = adapter.parseSave(adapter.writeSave(save), 'red.sav');
    expect(reparsed.party[0]!.status).toBe('OK');
  });
});

// ============================================================================
// 2.2 — Gen 2 status survives round-trip
// ============================================================================

describe('Gen 2 populated round-trip — status condition (TODO 2.2)', () => {
  const adapter = new Gen2Adapter();
  const statuses = ['SLP', 'PSN', 'BRN', 'FRZ', 'PAR'] as const;

  for (const status of statuses) {
    it(`preserves "${status}" on a party Pokémon through write→parse`, () => {
      const save = adapter.parseSave(createMinimalGen2Save(), 'gold.sav');
      const mon = buildGen2PartyMon({ status });
      save.party = [mon];
      save.partyCount = 1;

      const written = adapter.writeSave(save);
      const reparsed = adapter.parseSave(written, 'gold.sav');

      expect(reparsed.party).toHaveLength(1);
      expect(reparsed.party[0]!.status).toBe(status);
    });
  }

  it('keeps "OK" as OK (no false positive)', () => {
    const save = adapter.parseSave(createMinimalGen2Save(), 'gold.sav');
    save.party = [buildGen2PartyMon({ status: 'OK' })];
    save.partyCount = 1;
    const reparsed = adapter.parseSave(adapter.writeSave(save), 'gold.sav');
    expect(reparsed.party[0]!.status).toBe('OK');
  });
});

// ============================================================================
// encodeStatusByte unit tests (inverse of decodeStatus)
// ============================================================================

describe('encodeStatusByte (inverse of decodeStatus)', () => {
  it('round-trips every status string through decode(encode(x)) === x', () => {
    for (const s of ['OK', 'SLP', 'PSN', 'BRN', 'FRZ', 'PAR']) {
      expect(decodeStatus(encodeStatusByte(s))).toBe(s);
    }
  });

  it('preserves the original raw byte when the status is unchanged (sleep counter intact)', () => {
    // A sleep byte of 0x05 (counter = 5) still decodes to "SLP"; encoding "SLP"
    // with that original byte must preserve 0x05 exactly, not collapse to 0x04.
    expect(encodeStatusByte('SLP', 0x05)).toBe(0x05);
  });

  it('synthesizes a fresh byte when the status actually changed', () => {
    // Original byte was Burn (0x10) but the new status is Paralysis → must emit
    // the paralysis bit, NOT keep the stale burn byte.
    expect(encodeStatusByte('PAR', 0x10)).toBe(1 << 6);
  });

  it('encodes OK as 0', () => {
    expect(encodeStatusByte('OK')).toBe(0);
    expect(encodeStatusByte('OK', 0x20)).toBe(0); // FRZ original, now cured
  });
});

// ============================================================================
// 2.3 — Gen 1 HP DV is re-derived (not left stale)
// ============================================================================

describe('recalculateStats Gen 1 HP-DV derivation (TODO 2.3)', () => {
  const base: BaseStats = { hp: 60, attack: 80, defense: 50, speed: 90, spAtk: 50, spDef: 50 };

  it('re-derives HP DV from Atk/Def/Spe/Spc DVs even if iv.hp is stale', () => {
    // DVs: Atk=15(odd→1), Def=14(even→0), Spe=13(odd→1), Spc=12(even→0)
    // Derived HP DV = (1<<3)|(0<<2)|(1<<1)|0 = 8 + 0 + 2 + 0 = 10
    const expectedHpDv = ((15 & 1) << 3) | ((14 & 1) << 2) | ((13 & 1) << 1) | (12 & 1);
    expect(expectedHpDv).toBe(10);

    const mon = buildGen1PartyMon({
      iv: { hp: 0 /* deliberately wrong */, attack: 15, defense: 14, speed: 13, special: 12, spAtk: 12, spDef: 12 },
    });

    const result = recalculateStats(mon, base, 1, /* hasSplitSpecial */ false);
    expect(result.iv.hp).toBe(expectedHpDv);
    // And the original mon's iv must NOT be mutated (deep-clone guarantee).
    expect(mon.iv.hp).toBe(0);
  });

  it('produces a self-consistent HP DV for max DVs', () => {
    const mon = buildGen1PartyMon({
      iv: { hp: 3, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
    });
    const result = recalculateStats(mon, base, 1, false);
    expect(result.iv.hp).toBe(15); // all odd → 1111b = 15
  });
});

describe('recalculateGen2Stats HP-DV derivation (regression guard)', () => {
  const base: BaseStats = { hp: 70, attack: 84, defense: 78, speed: 100, spAtk: 109, spDef: 85 };

  it('derives HP DV identically to the Gen 1 rule', () => {
    const ext = new Gen2Extension();
    const mon = buildGen2PartyMon({
      iv: { hp: 0, attack: 15, defense: 14, speed: 13, special: 12, spAtk: 12, spDef: 12 },
      genExtension: ext,
    });
    const result = recalculateGen2Stats(mon, base);
    expect(result.iv.hp).toBe(10);
  });
});

// ============================================================================
// 2.4 — Gen 2 region-correct text encoding on the box/name write path
// ============================================================================

describe('Gen 2 region-correct text encoding (TODO 2.4)', () => {
  it('International codec and Japanese codec encode katakana differently', () => {
    // The 2.4 bug was harmless ONLY if INT and JPN encodings were identical.
    // This locks in the premise that they are NOT: a katakana glyph encodes to
    // a real byte under the JPN codec but is unsupported (sanitized away) under
    // the International codec.
    const kana = JPN_KATAKANA.find((c) => c && c.trim().length > 0)!;
    expect(kana).toBeTruthy();

    const intCodec = new GameBoyTextCodec('international');
    const jpnCodec = new GameBoyTextCodec('japanese');

    expect(jpnCodec.isValidChar(kana)).toBe(true);
    expect(intCodec.isValidChar(kana)).toBe(false);

    const jpnBytes = jpnCodec.encode(kana, 5, 0x50);
    const intBytes = intCodec.encode(kana, 5, 0x50);
    // Different region codecs must NOT produce the same bytes for this glyph.
    expect(Array.from(jpnBytes)).not.toEqual(Array.from(intBytes));
  });

  it('preserves an International box-mon nickname through the box write path', () => {
    // Guards the writePCBoxGen2 text path that 2.4 refactored to use
    // codecForOffsets(): an International box mon's nickname must survive
    // write -> re-parse unchanged.
    const adapter = new Gen2Adapter();
    const save = adapter.parseSave(createMinimalGen2Save(), 'gold.sav');
    expect(save.pcBoxes.length).toBeGreaterThan(0);

    const mon = buildGen2PartyMon({ isParty: false, nickname: 'BOXMON', originalTrainerName: 'GOLD' });
    save.pcBoxes[0] = [mon];

    const reparsed = adapter.parseSave(adapter.writeSave(save), 'gold.sav');
    expect(reparsed.pcBoxes[0]!.length).toBe(1);
    expect(reparsed.pcBoxes[0]![0]!.nickname).toBe('BOXMON');
    expect(reparsed.pcBoxes[0]![0]!.originalTrainerName).toBe('GOLD');
  });
});
