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
