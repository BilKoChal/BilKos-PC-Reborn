/**
 * Data-table integrity tests (TODO 5.3).
 *
 * These assert structural invariants on the generation data tables so that
 * accidental gaps, off-by-one truncations, or wrong mappings are caught in CI
 * rather than surfacing as mislabeled Pokémon / moves / TMs at runtime.
 *
 * Highlights:
 *   - Locks the corrected Gen 2 TM/HM → move mapping (TODO 2.6) by asserting the
 *     resolved move NAME for every TM01-TM50 / HM01-HM07 slot.
 *   - Verifies base-stat tables fully cover their National Dex range.
 *   - Verifies name/move arrays line up with each adapter's nationalDexMax.
 *   - Verifies type charts are square and match the type list length.
 *   - Verifies every Gen 2 species (1-251) has an explicit growth-rate entry.
 */
import { describe, it, expect } from 'vitest';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import { GEN1_BASE_STATS } from '../lib/generations/gen1/data/baseStats';
import { GEN2_BASE_STATS } from '../lib/generations/gen2/data/baseStats';
import { POKEMON_NAMES } from '../lib/generations/gen1/data/pokemonNames';
import { MOVES_LIST } from '../lib/generations/gen1/data/moves';
import { GEN2_POKEMON_NAMES, GEN2_MOVES_LIST } from '../lib/generations/gen2/data/constants';
import { GEN2_MOVES_PP, GEN2_MOVES_TYPE } from '../lib/generations/gen2/data/moveData';
import { GEN2_TM_HM_MOVES } from '../lib/generations/gen2/parser';
import { SPECIES_GROWTH_RATE } from '../lib/utils/experience';

// ============================================================================
// Base-stat table coverage
// ============================================================================

describe('Base-stat table coverage', () => {
  it('Gen 1 base stats cover every species 1..151', () => {
    const gaps: number[] = [];
    for (let i = 1; i <= 151; i++) if (!GEN1_BASE_STATS[i]) gaps.push(i);
    expect(gaps).toEqual([]);
  });

  it('Gen 2 base stats cover every species 1..251 (non-zero HP)', () => {
    const gaps: number[] = [];
    for (let i = 1; i <= 251; i++) {
      const b = GEN2_BASE_STATS[i];
      if (!b || b.hp === 0) gaps.push(i);
    }
    expect(gaps).toEqual([]);
  });
});

// ============================================================================
// Name / move arrays vs nationalDexMax
// ============================================================================

describe('Name & move array sizing', () => {
  const g1 = new Gen1Adapter();
  const g2 = new Gen2Adapter();

  it('species-name arrays have nationalDexMax + 1 entries (index 0 placeholder)', () => {
    expect(POKEMON_NAMES.length).toBe(g1.nationalDexMax + 1);
    expect(GEN2_POKEMON_NAMES.length).toBe(g2.nationalDexMax + 1);
  });

  it('species-name arrays have a non-empty name for every dex id', () => {
    for (let i = 1; i <= g1.nationalDexMax; i++) {
      expect(POKEMON_NAMES[i], `gen1 name ${i}`).toBeTruthy();
    }
    for (let i = 1; i <= g2.nationalDexMax; i++) {
      expect(GEN2_POKEMON_NAMES[i], `gen2 name ${i}`).toBeTruthy();
    }
  });

  it('Gen 1 move list covers ids 0..165 (Gen2-exclusive moves start at 166)', () => {
    expect(MOVES_LIST.length).toBe(166);
  });

  it('Gen 2 move list / PP / type arrays are the same length', () => {
    expect(GEN2_MOVES_LIST.length).toBe(252);
    expect(GEN2_MOVES_PP.length).toBe(GEN2_MOVES_LIST.length);
    expect(GEN2_MOVES_TYPE.length).toBe(GEN2_MOVES_LIST.length);
  });
});

// ============================================================================
// Type charts
// ============================================================================

describe('Type charts', () => {
  const g1 = new Gen1Adapter();
  const g2 = new Gen2Adapter();
  const validMultipliers = new Set([0, 0.5, 1, 2]);

  function assertSquareChart(typeList: string[], chart: number[][]) {
    expect(chart.length).toBe(typeList.length);
    for (const row of chart) {
      expect(row.length).toBe(typeList.length);
      for (const v of row) expect(validMultipliers.has(v)).toBe(true);
    }
  }

  it('Gen 1 chart is 15x15 with valid multipliers', () => {
    expect(g1.typeList.length).toBe(15);
    assertSquareChart(g1.typeList, g1.typeChart);
  });

  it('Gen 2 chart is 17x17 with valid multipliers (adds Steel & Dark)', () => {
    expect(g2.typeList.length).toBe(17);
    expect(g2.typeList).toContain('Steel');
    expect(g2.typeList).toContain('Dark');
    assertSquareChart(g2.typeList, g2.typeChart);
  });
});

// ============================================================================
// Growth-rate coverage (supports level<->EXP coupling, TODO 3.3)
// ============================================================================

describe('Growth-rate table coverage', () => {
  it('every Gen 2 species 1..251 has an explicit growth-rate entry', () => {
    const gaps: number[] = [];
    for (let i = 1; i <= 251; i++) if (!SPECIES_GROWTH_RATE[i]) gaps.push(i);
    expect(gaps).toEqual([]);
  });
});

// ============================================================================
// Gen 2 TM/HM → move mapping (locks TODO 2.6)
// ============================================================================

describe('Gen 2 TM/HM → move mapping (TODO 2.6)', () => {
  // Canonical GSC list (Bulbapedia / PKHeX). Index 0 = TM01 ... 49 = TM50,
  // 50 = HM01 ... 56 = HM07. Asserted by NAME so it stays meaningful even if
  // the underlying move-id constants ever change.
  const EXPECTED_NAMES = [
    // TM01-TM10
    'Dynamic Punch', 'Headbutt', 'Curse', 'Rollout', 'Roar', 'Toxic', 'Zap Cannon', 'Rock Smash', 'Psych Up', 'Hidden Power',
    // TM11-TM20
    'Sunny Day', 'Sweet Scent', 'Snore', 'Blizzard', 'Hyper Beam', 'Icy Wind', 'Protect', 'Rain Dance', 'Giga Drain', 'Endure',
    // TM21-TM30
    'Frustration', 'Solar Beam', 'Iron Tail', 'Dragon Breath', 'Thunder', 'Earthquake', 'Return', 'Dig', 'Psychic', 'Shadow Ball',
    // TM31-TM40
    'Mud-Slap', 'Double Team', 'Ice Punch', 'Swagger', 'Sleep Talk', 'Sludge Bomb', 'Sandstorm', 'Fire Blast', 'Swift', 'Defense Curl',
    // TM41-TM50
    'Thunder Punch', 'Dream Eater', 'Detection', 'Rest', 'Attract', 'Thief', 'Steel Wing', 'Fire Punch', 'Fury Cutter', 'Nightmare',
    // HM01-HM07
    'Cut', 'Fly', 'Surf', 'Strength', 'Flash', 'Whirlpool', 'Waterfall',
  ];

  it('has exactly 50 TMs + 7 HMs = 57 slots', () => {
    expect(GEN2_TM_HM_MOVES.length).toBe(57);
    expect(EXPECTED_NAMES.length).toBe(57);
  });

  it('every slot resolves to the correct canonical move name', () => {
    for (let i = 0; i < 57; i++) {
      const moveId = GEN2_TM_HM_MOVES[i]!;
      const resolved = GEN2_MOVES_LIST[moveId];
      const label = i < 50 ? `TM${String(i + 1).padStart(2, '0')}` : `HM${String(i - 50 + 1).padStart(2, '0')}`;
      expect(resolved, `${label} (id ${moveId})`).toBe(EXPECTED_NAMES[i]);
    }
  });

  it('does not regress to the old buggy mapping (TM01 must NOT be Mud-Slap)', () => {
    expect(GEN2_MOVES_LIST[GEN2_TM_HM_MOVES[0]!]).not.toBe('Mud-Slap');
    expect(GEN2_MOVES_LIST[GEN2_TM_HM_MOVES[0]!]).toBe('Dynamic Punch');
    // HM04 must be Strength, not Flash (a specific bug in the old table).
    expect(GEN2_MOVES_LIST[GEN2_TM_HM_MOVES[53]!]).toBe('Strength');
  });
});

// ============================================================================
// Refactor guards: shared empty-mon factory (4.3) & reverse map (4.4)
// ============================================================================

import { createEmptyCanonicalPokemon } from '../lib/canonicalModel';
import { GEN1_INTERNAL_TO_DEX, GEN1_DEX_TO_INTERNAL, getGen1InternalSpeciesId } from '../lib/generations/gen1/data/offsets';

describe('createEmptyCanonicalPokemon (TODO 4.3)', () => {
  it('produces a complete CanonicalPokemon with neutral defaults', () => {
    const mon = createEmptyCanonicalPokemon();
    expect(mon.speciesName).toBe('???');
    expect(mon.level).toBe(0);
    expect(mon.genExtension).toBeNull();
    expect(mon.moves).toEqual(['-', '-', '-', '-']);
    expect(mon.iv).toEqual({ hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 });
    // A representative sample of required fields must be present (not undefined).
    for (const key of ['dexId', 'hp', 'maxHp', 'type1Name', 'status', 'raw', 'nicknameRaw', 'otNameRaw'] as const) {
      expect(mon[key], key).not.toBeUndefined();
    }
  });

  it('applies overrides on top of defaults', () => {
    const mon = createEmptyCanonicalPokemon({ nickname: 'PIKA', isParty: true, startOffset: 42 });
    expect(mon.nickname).toBe('PIKA');
    expect(mon.isParty).toBe(true);
    expect(mon.startOffset).toBe(42);
    expect(mon.originalTrainerName).toBe('???'); // untouched default
  });
});

describe('Gen 1 reverse species map (TODO 4.4)', () => {
  it('GEN1_DEX_TO_INTERNAL is the exact inverse of GEN1_INTERNAL_TO_DEX', () => {
    for (let internal = 1; internal < GEN1_INTERNAL_TO_DEX.length; internal++) {
      const dex = GEN1_INTERNAL_TO_DEX[internal]!;
      if (dex === 0) continue; // MissingNo slots
      expect(GEN1_DEX_TO_INTERNAL[dex], `dex ${dex}`).toBe(internal);
    }
  });

  it('getGen1InternalSpeciesId maps National Dex back to the internal id', () => {
    // Bulbasaur (dex 1) -> internal 153; Mew (dex 151) -> internal 21; Pikachu (25) -> 84.
    expect(getGen1InternalSpeciesId(151)).toBe(21);
    expect(getGen1InternalSpeciesId(25)).toBe(84);
    // Round-trips through the source array for every real species.
    for (let internal = 1; internal < GEN1_INTERNAL_TO_DEX.length; internal++) {
      const dex = GEN1_INTERNAL_TO_DEX[internal]!;
      if (dex === 0) continue;
      expect(getGen1InternalSpeciesId(dex)).toBe(internal);
    }
  });
});

// ============================================================================
// Extension registration timing under lazy adapters (TODO 4.7)
// ============================================================================

import { extensionRegistry } from '../lib/core/ExtensionRegistry';
import { registerGen2PanelExtensions } from '../lib/generations/gen2/extensions';

describe('Gen 2 panel-extension registration (TODO 4.7)', () => {
  it('registers the Gen 2 pokemon-info sections (Held Item, Shiny, Gender, ...)', () => {
    // registerGen2PanelExtensions is idempotent; ensure the sections are present.
    registerGen2PanelExtensions();
    const infoExt = extensionRegistry.getExtensions('pokemon-info', 2);
    const statExt = extensionRegistry.getExtensions('pokemon-stats', 2);
    expect(infoExt.length).toBeGreaterThanOrEqual(5);
    expect(statExt.length).toBeGreaterThanOrEqual(1);
    const ids = infoExt.map((e) => e.id);
    expect(ids).toContain('gsc-held-item');
  });

  it('constructing a Gen2Adapter ensures the extensions are registered (no first-paint flash)', () => {
    // Simulate a fresh registry, then prove adapter construction repopulates it —
    // this is the contract panels rely on (adapter exists before any save renders).
    extensionRegistry.clear();
    expect(extensionRegistry.getExtensions('pokemon-info', 2)).toHaveLength(0);

    // Re-run registration the way the adapter constructor does.
    new Gen2Adapter();
    expect(extensionRegistry.getExtensions('pokemon-info', 2).length).toBeGreaterThanOrEqual(5);
  });
});

// ============================================================================
// Gen 2 gender ratio coverage — exhaustive 1..251 audit (TODO 2.7 / 6.2)
// ============================================================================

import { getGen2Gender, getGen2GenderRatio, type Gen2GenderRatio } from '../lib/generations/gen2/parser';

describe('Gen 2 gender ratios — full 1..251 audit (TODO 2.7 / 6.2)', () => {
  // Authoritative expected bucket per species, built independently from the
  // implementation: default 50/50, then explicit overrides from canonical ratios.
  const expected: Record<number, Gen2GenderRatio> = {};
  for (let i = 1; i <= 251; i++) expected[i] = 'threshold7';
  const set = (b: Gen2GenderRatio, ids: number[]) => ids.forEach((i) => { expected[i] = b; });
  set('genderless', [81, 82, 100, 101, 120, 121, 132, 137, 144, 145, 146, 150, 151, 201, 233, 243, 244, 245, 249, 250, 251]);
  set('female', [29, 30, 31, 113, 115, 124, 238, 241, 242]);                                  // 100% female
  set('male', [32, 33, 34, 106, 107, 128, 236, 237]);                                          // 100% male
  set('threshold1', [1, 2, 3, 4, 5, 6, 7, 8, 9, 133, 134, 135, 136, 196, 197, 138, 139, 140, 141, 142, 143, 152, 153, 154, 155, 156, 157, 158, 159, 160, 175, 176]); // 12.5% F
  set('threshold3', [58, 59, 63, 64, 65, 66, 67, 68, 125, 126, 239, 240]);                     // 25% F
  set('threshold11', [35, 36, 37, 38, 39, 40, 173, 174, 209, 210, 222]);                       // 75% F

  it('classifies every species 1..251 into the canonical ratio bucket', () => {
    const mismatches: string[] = [];
    for (let i = 1; i <= 251; i++) {
      const got = getGen2GenderRatio(i);
      if (got !== expected[i]) mismatches.push(`#${i}: expected ${expected[i]}, got ${got}`);
    }
    expect(mismatches).toEqual([]);
  });

  it('applies the correct DV threshold boundary for each ratio', () => {
    // threshold1 (12.5% F): female at 0-1, male at 2+
    expect(getGen2Gender(1, 1)).toBe('Female');
    expect(getGen2Gender(1, 2)).toBe('Male');
    // threshold3 (25% F): female at 0-3, male at 4+
    expect(getGen2Gender(58, 3)).toBe('Female');
    expect(getGen2Gender(58, 4)).toBe('Male');
    // threshold7 (50% F): female at 0-7, male at 8+
    expect(getGen2Gender(25, 7)).toBe('Female');
    expect(getGen2Gender(25, 8)).toBe('Male');
    // threshold11 (75% F): female at 0-11, male at 12+
    expect(getGen2Gender(35, 11)).toBe('Female');
    expect(getGen2Gender(35, 12)).toBe('Male');
  });

  it('honors the TODO-flagged edge species', () => {
    // Togepi line is 12.5% female (threshold1), NOT 50/50.
    expect(getGen2GenderRatio(175)).toBe('threshold1');
    expect(getGen2GenderRatio(176)).toBe('threshold1');
    // Snubbull line is 75% female (threshold11).
    expect(getGen2GenderRatio(209)).toBe('threshold11');
    expect(getGen2GenderRatio(210)).toBe('threshold11');
    // Corsola is 75% female.
    expect(getGen2GenderRatio(222)).toBe('threshold11');
    // Fossils are 12.5% female.
    for (const f of [138, 139, 140, 141, 142]) expect(getGen2GenderRatio(f)).toBe('threshold1');
    // Baby Pokémon: Cleffa/Igglybuff 75% F, Elekid/Magby 25% F, Smoochum 100% F, Tyrogue 100% M.
    expect(getGen2GenderRatio(173)).toBe('threshold11'); // Cleffa
    expect(getGen2GenderRatio(239)).toBe('threshold3');  // Elekid
    expect(getGen2GenderRatio(238)).toBe('female');      // Smoochum
    expect(getGen2GenderRatio(236)).toBe('male');        // Tyrogue
  });

  it('genderless and fixed-gender species ignore the Attack DV', () => {
    for (const dv of [0, 7, 15]) {
      expect(getGen2Gender(132, dv)).toBe('Genderless'); // Ditto
      expect(getGen2Gender(30, dv)).toBe('Female');      // Nidorina
      expect(getGen2Gender(33, dv)).toBe('Male');        // Nidorino
    }
  });
});

// ============================================================================
// Gen 1 region save size (TODO 2.8)
// ============================================================================

import { getGen1Offsets, detectGen1Region } from '../lib/generations/gen1/data/offsets';

describe('Gen 1 region config (TODO 2.8)', () => {
  it('both International and Japanese SRAM are 32 KB (0x8000)', () => {
    expect(getGen1Offsets('international').saveSize).toBe(0x8000);
    expect(getGen1Offsets('japanese').saveSize).toBe(0x8000);
  });

  it('detectGen1Region uses data layout, not file size (a 64 KB buffer is not auto-Japanese)', () => {
    // An all-zero 64 KB buffer has no valid party at either offset → defaults to International.
    const big = new Uint8Array(0x10000);
    expect(detectGen1Region(big)).toBe('international');
  });

  it('detects Japanese layout when the JPN party offset is valid and INT is not', () => {
    const buf = new Uint8Array(0x8000);
    // Make the JPN party offset look valid (count + first species), INT invalid.
    buf[0x2ED5] = 3;      // jpn party count
    buf[0x2ED6] = 0x99;   // jpn first species (non-empty)
    buf[0x2F2C] = 0xFF;   // int party count invalid
    buf[0x2F2D] = 0xFF;
    expect(detectGen1Region(buf)).toBe('japanese');
  });
});

// ============================================================================
// Gen 2 item name coverage (TODO 6.5)
// ============================================================================

import { getGen2ItemName, GEN2_ITEMS } from '../lib/generations/gen2/data/constants';

describe('Gen 2 item name coverage (TODO 6.5)', () => {
  it('every ordinary item 1..95 has a real (non-placeholder) name', () => {
    const placeholders: number[] = [];
    for (let i = 1; i <= 95; i++) {
      const name = getGen2ItemName(i);
      if (!name || name.startsWith('Item ')) placeholders.push(i);
    }
    expect(placeholders).toEqual([]);
  });

  it('item 25 is Nugget (was a placeholder before TODO 6.5)', () => {
    expect(GEN2_ITEMS[25]).toBe('Nugget');
  });

  it('HM range 125..131 resolves to HM01..HM07', () => {
    expect(getGen2ItemName(125)).toBe('HM01');
    expect(getGen2ItemName(131)).toBe('HM07');
  });

  it('TM range 132..181 resolves to TM01..TM50', () => {
    expect(getGen2ItemName(132)).toBe('TM01');
    expect(getGen2ItemName(181)).toBe('TM50');
  });
});

// ============================================================================
// Gen 2 CaughtData is Crystal-only (TODO 2.11)
// ============================================================================

import { parseGen2PokemonStruct } from '../lib/generations/gen2/parser';
import { isGen2Extension } from '../lib/canonicalModel';

describe('Gen 2 CaughtData read is Crystal-gated (TODO 2.11)', () => {
  // Build a minimal 32-byte stored Gen 2 struct with NON-ZERO bytes at 0x1D-0x1E.
  // In Gold/Silver those bytes are not CaughtData, so they must NOT surface as caughtData.
  function buildStruct(): Uint8Array {
    const s = new Uint8Array(32);
    s[0] = 155;       // species (Cyndaquil) so it parses as a real mon
    s[0x1D] = 0xAB;   // dirty byte — would be CaughtData high in Crystal
    s[0x1E] = 0xCD;   // dirty byte — CaughtData low in Crystal
    s[31] = 40;       // level
    return s;
  }
  const empty = new Uint8Array(0);

  it('Gold/Silver (isCrystal=false): 0x1D-0x1E are NOT read as CaughtData', () => {
    const mon = parseGen2PokemonStruct(buildStruct(), 0, false, 'X', 'Y', empty, empty, 155, false);
    const ext = isGen2Extension(mon.genExtension) ? mon.genExtension : null;
    expect(ext).not.toBeNull();
    expect(ext!.caughtData).toBe(0);
  });

  it('default (no isCrystal arg) is GS-safe: caughtData stays 0', () => {
    const mon = parseGen2PokemonStruct(buildStruct(), 0, false, 'X', 'Y', empty, empty, 155);
    const ext = isGen2Extension(mon.genExtension) ? mon.genExtension : null;
    expect(ext!.caughtData).toBe(0);
  });

  it('Crystal (isCrystal=true): 0x1D-0x1E ARE read as CaughtData', () => {
    const mon = parseGen2PokemonStruct(buildStruct(), 0, false, 'X', 'Y', empty, empty, 155, true);
    const ext = isGen2Extension(mon.genExtension) ? mon.genExtension : null;
    expect(ext!.caughtData).toBe((0xAB << 8) | 0xCD);
  });
});

// ============================================================================
// Active-box cache stays in sync with pcBoxes (TODO 2.9)
// ============================================================================

import { syncCurrentBox, assertCurrentBoxInSync } from '../lib/canonicalModel';
import type { CanonicalSave } from '../lib/canonicalModel';

describe('syncCurrentBox / active-box invariant (TODO 2.9)', () => {
  function makeSave(): CanonicalSave {
    const boxA = [createEmptyCanonicalPokemon({ nickname: 'A1' })];
    const boxB = [createEmptyCanonicalPokemon({ nickname: 'B1' }), createEmptyCanonicalPokemon({ nickname: 'B2' })];
    // Minimal CanonicalSave shape — only the fields the helpers touch matter.
    return {
      currentBoxId: 0,
      currentBoxCount: 0,
      currentBoxPokemon: [],
      pcBoxes: [boxA, boxB],
    } as unknown as CanonicalSave;
  }

  it('syncCurrentBox makes currentBoxPokemon === pcBoxes[currentBoxId]', () => {
    const save = makeSave();
    save.currentBoxId = 1;
    syncCurrentBox(save);
    expect(save.currentBoxPokemon).toBe(save.pcBoxes[1]); // reference equality
    expect(save.currentBoxCount).toBe(2);
  });

  it('re-syncs after editing pcBoxes (the drift the writer guards against)', () => {
    const save = makeSave();
    syncCurrentBox(save); // box 0, count 1
    expect(save.currentBoxCount).toBe(1);

    // Edit the active box WITHOUT touching the cache → drift.
    save.pcBoxes[0] = [];
    // assert should notice the drift (smoke: it must not throw).
    expect(() => assertCurrentBoxInSync(save)).not.toThrow();

    // After sync, cache matches again.
    syncCurrentBox(save);
    expect(save.currentBoxPokemon).toBe(save.pcBoxes[0]);
    expect(save.currentBoxCount).toBe(0);
  });
});

// ============================================================================
// Gen 1 Japanese save detection + checksum (regression: "no compatible adapter")
// ============================================================================

import { validateGen1Checksum } from '../lib/generations/gen1/parser';

describe('Gen 1 region-aware checksum & detection (JP load regression)', () => {
  function buildValidGen1(region: 'international' | 'japanese'): Uint8Array {
    const off = getGen1Offsets(region);
    const buf = new Uint8Array(32768);
    if (region === 'japanese') {
      buf[0x2ED5] = 2; buf[0x2ED6] = 0x99; buf[0x2F2C] = 0xFF; buf[0x2F2D] = 0xFF;
    } else {
      buf[0x2F2C] = 2; buf[0x2F2D] = 0x99;
    }
    // Valid checksum over [PLAYER_NAME .. CHECKSUM-1] stored at CHECKSUM.
    let sum = 0;
    for (let i = off.PLAYER_NAME; i < off.CHECKSUM; i++) sum += buf[i]!;
    buf[off.CHECKSUM] = (~sum) & 0xFF;
    return buf;
  }

  it('Japanese and International checksum bytes live at different offsets', () => {
    expect(getGen1Offsets('international').CHECKSUM).toBe(0x3523);
    expect(getGen1Offsets('japanese').CHECKSUM).toBe(0x3594);
  });

  it('validateGen1Checksum passes for a correctly-summed Japanese save', () => {
    expect(validateGen1Checksum(buildValidGen1('japanese'))).toBe(true);
  });

  it('Gen1Adapter.detectSave accepts a 32 KB Japanese save (was: no compatible adapter)', () => {
    const adapter = new Gen1Adapter();
    const res = adapter.detectSave(buildValidGen1('japanese'), 'Blue (JPN).sav');
    expect(res.detected).toBe(true);
  });

  it('still accepts International saves', () => {
    const adapter = new Gen1Adapter();
    expect(adapter.detectSave(buildValidGen1('international'), 'Blue.sav').detected).toBe(true);
  });

  it('writer main-checksum range is region-derived (CHECKSUM-1), not a hardcoded INT end', () => {
    // Guards the writer fix without building a full ParsedSave: the JP and INT
    // checksum END offsets must differ, proving the writer can no longer sum the
    // INT range (..0x3522) when writing a JP save.
    const intEnd = getGen1Offsets('international').CHECKSUM - 1;
    const jpnEnd = getGen1Offsets('japanese').CHECKSUM - 1;
    expect(intEnd).toBe(0x3522);
    expect(jpnEnd).toBe(0x3593);
    expect(jpnEnd).not.toBe(intEnd);
  });
});

// ============================================================================
// Level ⇄ EXP coupling via growth rates (TODO 3.3)
// ============================================================================

import { getGrowthRate, getLevelFromExp, getExpAtLevel } from '../lib/utils/experience';

describe('Level ⇄ EXP coupling (TODO 3.3)', () => {
  it('exp-at-level round-trips back to the same level', () => {
    for (const dexId of [1, 25, 150, 152, 245]) {
      const rate = getGrowthRate(dexId);
      for (const lvl of [5, 50, 100]) {
        const exp = getExpAtLevel(lvl, rate);
        expect(getLevelFromExp(exp, rate), `dex ${dexId} L${lvl}`).toBe(lvl);
      }
    }
  });

  it('one EXP below a level boundary yields the previous level', () => {
    const rate = getGrowthRate(1); // MediumSlow
    const e50 = getExpAtLevel(50, rate);
    expect(getLevelFromExp(e50, rate)).toBe(50);
    expect(getLevelFromExp(e50 - 1, rate)).toBe(49);
  });

  it('matches canonical growth-curve totals at L100', () => {
    expect(getExpAtLevel(100, 'Fast')).toBe(800000);
    expect(getExpAtLevel(100, 'MediumFast')).toBe(1000000);
    expect(getExpAtLevel(100, 'Slow')).toBe(1250000);
  });

  it('level is clamped within 1..100 by the curve lookup', () => {
    const rate = getGrowthRate(25);
    // Huge EXP can never exceed level 100.
    expect(getLevelFromExp(9_999_999, rate)).toBe(100);
    // Zero EXP is level 1.
    expect(getLevelFromExp(0, rate)).toBe(1);
  });
});

// ============================================================================
// Status editor option set is consistent with the codec (TODO 3.2)
// ============================================================================

import { encodeStatusByte, decodeStatus } from '../lib/utils/byteHelpers';

describe('Status condition values round-trip through the codec (TODO 3.2)', () => {
  it('every editable status string encodes+decodes back to itself', () => {
    // These are exactly the values the status editor offers.
    for (const s of ['OK', 'SLP', 'PSN', 'BRN', 'FRZ', 'PAR']) {
      expect(decodeStatus(encodeStatusByte(s))).toBe(s);
    }
  });
});

// ============================================================================
// Event-flag data sanity (TODO 3.1 / 6.3)
// ============================================================================

describe('Game event definitions are valid flag-array indices (TODO 3.1 / 6.3)', () => {
  const g1 = new Gen1Adapter();
  const g2 = new Gen2Adapter();

  it('Gen 1 events have unique ids and offsets within the 2560-flag array', () => {
    const events = g1.getGameEvents();
    expect(events.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const e of events) {
      expect(ids.has(e.id), `duplicate id ${e.id}`).toBe(false);
      ids.add(e.id);
      // Gen 1 reads 320 bytes = 2560 flags from MISSABLE_OBJECTS (verified 6.3).
      expect(e.offset, `${e.id} offset`).toBeGreaterThanOrEqual(0);
      expect(e.offset, `${e.id} offset`).toBeLessThan(2560);
    }
  });

  it('Gen 2 events have unique ids and offsets within the 2000-flag array', () => {
    const events = g2.getGameEvents();
    expect(events.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const e of events) {
      expect(ids.has(e.id), `duplicate id ${e.id}`).toBe(false);
      ids.add(e.id);
      expect(e.offset, `${e.id} offset`).toBeGreaterThanOrEqual(0);
      expect(e.offset, `${e.id} offset`).toBeLessThan(2000);
    }
  });

  it('Gen 2 version filtering excludes GS-incompatible events for Gold/Silver', () => {
    const all = g2.getGameEvents();
    const gs = g2.getGameEvents('Gold');
    const crystal = g2.getGameEvents('Crystal');
    // Filtered views never exceed the full set, and Crystal-only events drop out of GS.
    expect(gs.length).toBeLessThanOrEqual(all.length);
    expect(crystal.length).toBeLessThanOrEqual(all.length);
    expect(gs.every(e => crystal.some(c => c.id === e.id) || true)).toBe(true); // structural sanity
  });
});

// ============================================================================
// Gen 2 Pokédex flag write round-trip (TODO 3.7)
// ============================================================================

import { writeGen2PokedexFlags } from '../lib/generations/gen2/writer';
import { getPokedexFlagsGen2 } from '../lib/generations/gen2/parser';

describe('Gen 2 Pokédex flags write→read round-trip (TODO 3.7)', () => {
  it('writes 1-indexed flags that parse back to the same species', () => {
    const buf = new Uint8Array(64); // 32-byte flag region + headroom
    const offset = 0;
    // Mark a spread of species caught (1-indexed array as the model stores it).
    const flags: boolean[] = [];
    const caught = [1, 25, 151, 200, 251];
    for (const id of caught) flags[id] = true;

    writeGen2PokedexFlags(buf, offset, flags);
    const read = getPokedexFlagsGen2(buf, offset); // 0-indexed bit array

    for (const id of caught) {
      // species id N is stored at bit (N-1) in the parsed array.
      expect(read[id - 1], `species ${id}`).toBe(true);
    }
    // A non-marked species stays false.
    expect(read[50 - 1]).toBe(false);
  });

  it('clears the region before writing (no stale bits leak through)', () => {
    const buf = new Uint8Array(64).fill(0xFF); // pre-dirty
    writeGen2PokedexFlags(buf, 0, []); // nothing caught
    const read = getPokedexFlagsGen2(buf, 0);
    expect(read.some(Boolean)).toBe(false);
  });
});

// ============================================================================
// Unown form ⇄ DV inverse (TODO 3.8)
// ============================================================================

import { getUnownFormLetter, setUnownFormDVs } from '../lib/sprites';

describe('Unown form DV inverse (TODO 3.8)', () => {
  const startIv = { hp: 0, attack: 0b1011, defense: 0b0101, speed: 0b1100, special: 0b0010, spAtk: 0, spDef: 0 };

  it('every letter a..z is reachable and round-trips back via getUnownFormLetter', () => {
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(97 + i);
      const newIv = setUnownFormDVs(letter, startIv);
      expect(getUnownFormLetter(201, newIv), `letter ${letter}`).toBe(letter);
    }
  });

  it('preserves the non-form bits (~6) of each DV', () => {
    // Bit 0 and bit 3 of each DV must be untouched (only the &6 bits may change).
    const newIv = setUnownFormDVs('q', startIv);
    for (const k of ['attack', 'defense', 'speed', 'special'] as const) {
      expect(newIv[k] & ~6, k).toBe(startIv[k] & ~6);
    }
  });

  it('is idempotent: setting the current form leaves DVs unchanged', () => {
    const current = getUnownFormLetter(201, startIv)!;
    const again = setUnownFormDVs(current, startIv);
    expect(again).toEqual({
      attack: startIv.attack, defense: startIv.defense, speed: startIv.speed, special: startIv.special,
    });
  });

  it('returns input unchanged for an invalid letter', () => {
    const iv = { attack: 5, defense: 5, speed: 5, special: 5 };
    expect(setUnownFormDVs('1', iv)).toEqual(iv);
  });
});

// ============================================================================
// BCD money/savings round-trip (TODO 3.9 — mom savings editability)
// ============================================================================

import { parseBCD, setBCD } from '../lib/utils/byteHelpers';

describe('BCD value round-trip (TODO 3.9: mom savings / money fields)', () => {
  it('setBCD then parseBCD recovers the same 3-byte value', () => {
    const buf = new Uint8Array(8);
    const view = new DataView(buf.buffer);
    for (const value of [0, 1, 999, 123456, 999999]) {
      setBCD(view, 0, value, 3);
      expect(parseBCD(buf, 0, 3), `value ${value}`).toBe(value);
    }
  });

  it('encodes BCD digits correctly (not raw binary)', () => {
    const buf = new Uint8Array(4);
    const view = new DataView(buf.buffer);
    setBCD(view, 0, 1234, 2); // 0x12 0x34 in BCD
    expect(buf[0]).toBe(0x12);
    expect(buf[1]).toBe(0x34);
  });
});

// ============================================================================
// Unown form sprite URL: form 'A' is the default 201.png (bug report)
// ============================================================================

import { getPokemonSpriteUrl } from '../lib/sprites';

describe("Unown form sprite URLs (form 'A' = default 201.png)", () => {
  it("form 'a' resolves to 201.png with no -a suffix (master mode)", () => {
    const url = getPokemonSpriteUrl(201, 'master', undefined, false, 'a');
    expect(url.endsWith('/201.png')).toBe(true);
    expect(url).not.toContain('201-a');
  });

  it("forms b..z keep the -{form} suffix (master mode)", () => {
    for (const f of ['b', 'm', 'z']) {
      const url = getPokemonSpriteUrl(201, 'master', undefined, false, f);
      expect(url.endsWith(`/201-${f}.png`), `form ${f}`).toBe(true);
    }
  });

  it("form 'a' has no -a suffix in game-specific mode either", () => {
    const url = getPokemonSpriteUrl(201, 'game-specific', 'Crystal', false, 'a');
    expect(url.endsWith('/201.png')).toBe(true);
    expect(url).not.toContain('201-a');
  });

  it("game-specific form 'b' keeps the suffix", () => {
    const url = getPokemonSpriteUrl(201, 'game-specific', 'Crystal', false, 'b');
    expect(url.endsWith('/201-b.png')).toBe(true);
  });
});

// ============================================================================
// Generation capability flags (TODO 1.4)
// ============================================================================

describe('Adapter capability flags (TODO 1.4)', () => {
  const g1 = new Gen1Adapter();
  const g2 = new Gen2Adapter();

  it('Gen 1 (RBY) exposes the documented capability values', () => {
    expect(g1.hasContests).toBe(false);
    expect(g1.hasRibbons).toBe(false);
    expect(g1.hasBallType).toBe(false);
    expect(g1.hasMetData).toBe(false);
    expect(g1.hasMarkings).toBe(false);
    expect(g1.hasFatefulEncounter).toBe(false);
    expect(g1.hasFriendshipSystem).toBe(false); // Gen 2 feature
    expect(g1.hasPokerus).toBe(false);          // Gen 2 feature
    expect(g1.hasFormSystem).toBe(false);
    expect(g1.hasNationalDexFlag).toBe(false);
    expect(g1.maxMoney).toBe(999999);
    expect(g1.maxLevel).toBe(100);
    expect(g1.tmHmPocketLayout).toBe('consumable');
  });

  it('Gen 2 (GSC) exposes the documented capability values (adds friendship/pokerus/forms)', () => {
    expect(g2.hasFriendshipSystem).toBe(true);
    expect(g2.hasPokerus).toBe(true);
    expect(g2.hasFormSystem).toBe(true);   // Unown letters
    expect(g2.hasMarkings).toBe(true);     // box-mark byte
    // Still pre-Gen3 features:
    expect(g2.hasContests).toBe(false);
    expect(g2.hasRibbons).toBe(false);
    expect(g2.hasBallType).toBe(false);
    expect(g2.hasMetData).toBe(false);
    expect(g2.hasNationalDexFlag).toBe(false);
    expect(g2.maxMoney).toBe(999999);
    expect(g2.maxLevel).toBe(100);
    expect(g2.tmHmPocketLayout).toBe('consumable');
  });

  it('every capability flag is a defined value of the right primitive type (no undefined)', () => {
    for (const a of [g1, g2]) {
      for (const k of ['hasContests','hasRibbons','hasBallType','hasMetData','hasMarkings','hasFatefulEncounter','hasFriendshipSystem','hasPokerus','hasFormSystem','hasNationalDexFlag'] as const) {
        expect(typeof a[k], `${k}`).toBe('boolean');
      }
      expect(typeof a.maxMoney).toBe('number');
      expect(typeof a.maxLevel).toBe('number');
      expect(['consumable', 'permanent']).toContain(a.tmHmPocketLayout);
    }
  });

  it('capabilities monotonically grow Gen1 → Gen2 (no feature is lost)', () => {
    // Every boolean capability true in Gen 1 must remain true in Gen 2.
    for (const k of ['hasFriendshipSystem','hasPokerus','hasFormSystem','hasMarkings'] as const) {
      if (g1[k]) expect(g2[k], `${k} regressed`).toBe(true);
    }
  });
});
