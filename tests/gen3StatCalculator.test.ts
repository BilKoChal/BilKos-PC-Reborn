/**
 * Gen 3 stat calculator tests (BUG-G3-04 fix).
 *
 * Verifies the Gen 3 stat formula:
 *   HP:   floor((2 * Base + IV + floor(EV/4)) * Level / 100) + Level + 10
 *   Other: floor((floor((2 * Base + IV + floor(EV/4)) * Level / 100) + 5) * natureMod)
 *
 * Key differences from the Gen 1/2 formula (verified against PKHeX and Bulbapedia):
 *   - floor(EV/4) instead of floor(sqrt(StatExp)/4)
 *   - Nature modifier (×1.1 boost, ×0.9 nerf, ×1.0 neutral)
 *   - 5-bit IVs (0-31) instead of 4-bit DVs (0-15)
 */
import { describe, it, expect } from 'vitest';
import { calculateGen3Stat, recalculateGen3Stats } from '../lib/generations/gen3/statCalculator';
import { getNatureName, getNatureId } from '../lib/generations/gen3/identity';
import type { PokemonStats } from '../lib/parser/types';
import type { BaseStats } from '../lib/interfaces';

describe('calculateGen3Stat', () => {
  // Reference: Bulbapedia Gen III stat formula
  // HP   = floor((2*Base + IV + floor(EV/4)) * Level / 100) + Level + 10
  // Other = floor((floor((2*Base + IV + floor(EV/4)) * Level / 100) + 5) * natureMod)

  it('calculates HP for level 100 Mewtwo with max IVs/EVs (neutral nature)', () => {
    // Mewtwo: base HP = 106, IV = 31, EV = 255, Level = 100
    // EV factor = floor(255/4) = 63
    // Core = (2*106 + 31 + 63) * 100 = (212 + 31 + 63) * 100 = 30600
    // HP = floor(30600/100) + 100 + 10 = 306 + 110 = 416
    const hp = calculateGen3Stat(106, 31, 255, 100, true);
    expect(hp).toBe(416);
  });

  it('calculates Sp.Atk for level 100 Mewtwo with max IVs/EVs (neutral nature)', () => {
    // Mewtwo: base SpA = 154, IV = 31, EV = 255, Level = 100, neutral nature
    // Core = (2*154 + 31 + 63) * 100 = (308 + 31 + 63) * 100 = 40200
    // Base stat = floor(40200/100) = 402
    // Stat = floor((402 + 5) * 1.0) = 407
    const spAtk = calculateGen3Stat(154, 31, 255, 100, false, 1.0);
    expect(spAtk).toBe(407);
  });

  it('BUG-G3-04: applies nature boost (×1.1) to Sp.Atk', () => {
    // Modest nature boosts Sp.Atk by 10%.
    // Base stat (402, from above) + 5 = 407, × 1.1 = floor(447.7) = 447
    const spAtkModest = calculateGen3Stat(154, 31, 255, 100, false, 1.1);
    expect(spAtkModest).toBe(447);
  });

  it('BUG-G3-04: applies nature nerf (×0.9) to Attack', () => {
    // Modest nature nerfs Attack by 10%.
    // Mewtwo base Atk = 110, IV=31, EV=255, L100
    // Core = (2*110 + 31 + 63) * 100 = (220 + 31 + 63) * 100 = 31400
    // Base stat = floor(31400/100) = 314
    // Stat = floor((314 + 5) * 0.9) = floor(319 * 0.9) = floor(287.1) = 287
    const atkModest = calculateGen3Stat(110, 31, 255, 100, false, 0.9);
    expect(atkModest).toBe(287);
  });

  it('HP is never affected by nature modifier (ignores the param)', () => {
    // HP formula doesn't use natureMod — passing 1.1 or 0.9 should give the same result.
    const hpNeutral = calculateGen3Stat(106, 31, 255, 100, true, 1.0);
    const hpWithBoost = calculateGen3Stat(106, 31, 255, 100, true, 1.1);
    const hpWithNerf = calculateGen3Stat(106, 31, 255, 100, true, 0.9);
    expect(hpNeutral).toBe(hpWithBoost);
    expect(hpNeutral).toBe(hpWithNerf);
  });

  it('uses floor(EV/4), not sqrt(EV/4) like Gen 1/2', () => {
    // This is the KEY Gen 3 difference. With EV=255, floor(255/4)=63.
    // The Gen 1/2 formula with StatExp=65535 gives floor(sqrt(65535)/4)=63 (by coincidence here).
    // But with EV=16, floor(16/4)=4, while the Gen 1/2 formula with StatExp=16
    // gives floor(sqrt(16)/4) = floor(4/4) = 1. So the formulas diverge.
    // Level 100, base 50, IV 0, EV 16:
    //   Gen 3: floor((2*50 + 0 + 4) * 100 / 100) + 5 = 104 + 5 = 109
    const gen3Stat = calculateGen3Stat(50, 0, 16, 100, false, 1.0);
    expect(gen3Stat).toBe(109);
  });

  it('clamps EV to 0-255 (values > 255 are capped)', () => {
    // EV = 65535 (the Gen 1/2 max StatExp) should be clamped to 255 in Gen 3.
    const withOverflow = calculateGen3Stat(50, 0, 65535, 100, false, 1.0);
    const withCapped = calculateGen3Stat(50, 0, 255, 100, false, 1.0);
    expect(withOverflow).toBe(withCapped);
  });

  it('masks IV to 5 bits (0-31)', () => {
    // IV = 32 should wrap to 0 (32 & 0x1f = 0).
    const iv32 = calculateGen3Stat(50, 32, 0, 100, false, 1.0);
    const iv0 = calculateGen3Stat(50, 0, 0, 100, false, 1.0);
    expect(iv32).toBe(iv0);
  });

  it('calculates level 5 Bulbasaur HP with zero IVs/EVs', () => {
    // Bulbasaur: base HP = 45, IV = 0, EV = 0, Level = 5
    // Core = (2*45 + 0 + 0) * 5 = 450
    // HP = floor(450/100) + 5 + 10 = 4 + 15 = 19
    const hp = calculateGen3Stat(45, 0, 0, 5, true);
    expect(hp).toBe(19);
  });
});

describe('recalculateGen3Stats', () => {
  // A neutral PID (PID 0 → nature 0 = Hardy, which is on the diagonal → all stats neutral)
  const NEUTRAL_PID = 0;

  // A Modest PID: natureId 15 → boosts SpAtk, nerfs Attack
  // 15 % 25 = 15, so PID 15 → Modest
  const MODEST_PID = 15;

  function buildMon(overrides: Partial<PokemonStats> = {}): PokemonStats {
    return {
      pid: NEUTRAL_PID,
      speciesId: 150, // Mewtwo
      dexId: 150,
      speciesName: 'Mewtwo',
      nickname: 'MEWTWO',
      level: 100,
      iv: { hp: 31, attack: 31, defense: 31, speed: 31, special: 31, spAtk: 31, spDef: 31 },
      ev: { hp: 255, attack: 255, defense: 255, speed: 255, special: 255, spAtk: 255, spDef: 255 },
      hp: 1, maxHp: 1, attack: 1, defense: 1, speed: 1, spAtk: 1, spDef: 1, special: 1,
      ...overrides,
    } as Partial<PokemonStats> as PokemonStats;
  }

  const mewtwoBase: BaseStats = {
    hp: 106, attack: 110, defense: 90, speed: 130, spAtk: 154, spDef: 90,
  };

  it('recalculates all 6 stats for a level 100 Mewtwo with max IVs/EVs (neutral nature)', () => {
    const mon = buildMon({ pid: NEUTRAL_PID });
    const result = recalculateGen3Stats(mon, mewtwoBase);

    // Expected (neutral nature):
    // HP:   floor((2*106+31+63)*100/100) + 100 + 10 = 306 + 110 = 416
    // Atk:  floor((floor((2*110+31+63)*100/100) + 5) * 1.0) = 314 + 5 = 319
    // Def:  floor((floor((2*90+31+63)*100/100) + 5) * 1.0) = 274 + 5 = 279
    // Spe:  floor((floor((2*130+31+63)*100/100) + 5) * 1.0) = 354 + 5 = 359
    // SpA:  floor((floor((2*154+31+63)*100/100) + 5) * 1.0) = 402 + 5 = 407
    // SpD:  floor((floor((2*90+31+63)*100/100) + 5) * 1.0) = 274 + 5 = 279
    expect(result.maxHp).toBe(416);
    expect(result.attack).toBe(319);
    expect(result.defense).toBe(279);
    expect(result.speed).toBe(359);
    expect(result.spAtk).toBe(407);
    expect(result.spDef).toBe(279);
  });

  it('BUG-G3-04: applies Modest nature (boost SpAtk, nerf Attack)', () => {
    const mon = buildMon({ pid: MODEST_PID });
    expect(getNatureName(MODEST_PID)).toBe('Modest');
    const result = recalculateGen3Stats(mon, mewtwoBase);

    // SpAtk boosted ×1.1: floor((402 + 5) * 1.1) = floor(447.7) = 447
    expect(result.spAtk).toBe(447);
    // Attack nerfed ×0.9: floor((314 + 5) * 0.9) = floor(287.1) = 287
    expect(result.attack).toBe(287);
    // HP unaffected by nature
    expect(result.maxHp).toBe(416);
  });

  it('auto-heals HP to max on recalculation (matches Gen 2 behavior)', () => {
    const mon = buildMon({ pid: NEUTRAL_PID, hp: 1, maxHp: 1 });
    const result = recalculateGen3Stats(mon, mewtwoBase);
    expect(result.hp).toBe(result.maxHp);
  });

  it('does not mutate the caller\'s iv/ev objects (deep-clone guarantee)', () => {
    const mon = buildMon({ pid: NEUTRAL_PID });
    const originalIv = { ...mon.iv };
    const originalEv = { ...mon.ev };
    recalculateGen3Stats(mon, mewtwoBase);
    expect(mon.iv).toEqual(originalIv);
    expect(mon.ev).toEqual(originalEv);
  });

  it('mirrors spAtk into the `special` field for UI compatibility', () => {
    const mon = buildMon({ pid: NEUTRAL_PID });
    const result = recalculateGen3Stats(mon, mewtwoBase);
    expect(result.special).toBe(result.spAtk);
  });

  it('PID 0 (uninitialized) is treated as Hardy (neutral) — no crash', () => {
    const mon = buildMon({ pid: 0 });
    // Should not throw, and should produce the same stats as a neutral PID.
    const result = recalculateGen3Stats(mon, mewtwoBase);
    expect(result.maxHp).toBe(416);
    expect(getNatureId(0)).toBe(0); // Hardy
  });

  it('BUG-G3-04 regression: diverges from the Gen 1/2 formula for low EVs', () => {
    // With EV=16, the Gen 3 formula gives floor(16/4)=4, while the Gen 1/2
    // formula gives floor(sqrt(16)/4)=1. So a level 100 mon with base 50,
    // IV 0, EV 16 should give different results between the two formulas.
    // Gen 3: floor((2*50 + 0 + 4) * 100 / 100) + 5 = 104 + 5 = 109
    const mon = buildMon({
      pid: NEUTRAL_PID,
      level: 100,
      iv: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      ev: { hp: 0, attack: 16, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
    });
    const base: BaseStats = { hp: 50, attack: 50, defense: 50, speed: 50, spAtk: 50, spDef: 50 };
    const result = recalculateGen3Stats(mon, base);
    // Attack: floor((2*50 + 0 + 4) * 100 / 100) + 5 = 104 + 5 = 109 (neutral nature)
    expect(result.attack).toBe(109);
  });
});
