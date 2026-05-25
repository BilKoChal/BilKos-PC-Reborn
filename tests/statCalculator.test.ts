import { describe, it, expect } from 'vitest';
import { calculateGen1Stat, deriveBaseStats, recalculateStats } from '../lib/utils/statCalculator';
import { BaseStats } from '../lib/interfaces';

describe('calculateGen1Stat', () => {
  // Reference: Bulbapedia Gen I stat formula
  // HP   = floor(( (Base + DV) * 2 + floor(ceil(sqrt(StatExp)) / 4) ) * Level / 100) + Level + 10
  // Other = floor(( (Base + DV) * 2 + floor(ceil(sqrt(StatExp)) / 4) ) * Level / 100) + 5

  it('should calculate HP for level 100 Mewtwo with max DVs and EVs', () => {
    // Mewtwo: base HP = 106, DV = 15, Stat Exp = 65535, Level = 100
    // EV factor = floor(ceil(sqrt(65535)) / 4) = floor(ceil(255.998) / 4) = floor(256 / 4) = 64
    // Core = ((106 + 15) * 2 + 64) * 100 = (242 + 64) * 100 = 30600
    // HP = floor(30600 / 100) + 100 + 10 = 306 + 110 = 416
    const hp = calculateGen1Stat(106, 15, 65535, 100, true);
    expect(hp).toBe(416);
  });

  it('should calculate Special Attack for level 100 Mewtwo with max DVs and EVs', () => {
    // Mewtwo: base Spc = 154, DV = 15, Stat Exp = 65535, Level = 100
    // Core = ((154 + 15) * 2 + 64) * 100 = (338 + 64) * 100 = 40200
    // Stat = floor(40200 / 100) + 5 = 402 + 5 = 407
    const spc = calculateGen1Stat(154, 15, 65535, 100, false);
    expect(spc).toBe(407);
  });

  it('should calculate Attack for level 100 Mewtwo with max DVs and EVs', () => {
    // Mewtwo: base Atk = 110, DV = 15, Stat Exp = 65535, Level = 100
    // Core = ((110 + 15) * 2 + 64) * 100 = (250 + 64) * 100 = 31400
    // Stat = floor(31400 / 100) + 5 = 314 + 5 = 319
    const atk = calculateGen1Stat(110, 15, 65535, 100, false);
    expect(atk).toBe(319);
  });

  it('should calculate HP for level 5 Bulbasaur with zero DVs and EVs', () => {
    // Bulbasaur: base HP = 45, DV = 0, Stat Exp = 0, Level = 5
    // EV factor = floor(ceil(sqrt(0)) / 4) = floor(0 / 4) = 0
    // Core = ((45 + 0) * 2 + 0) * 5 = 450
    // HP = floor(450 / 100) + 5 + 10 = 4 + 15 = 19
    const hp = calculateGen1Stat(45, 0, 0, 5, true);
    expect(hp).toBe(19);
  });

  it('should calculate non-HP stat for level 5 Bulbasaur with zero DVs and EVs', () => {
    // Bulbasaur: base Atk = 49, DV = 0, Stat Exp = 0, Level = 5
    // Core = ((49 + 0) * 2 + 0) * 5 = 490
    // Stat = floor(490 / 100) + 5 = 4 + 5 = 9
    const atk = calculateGen1Stat(49, 0, 0, 5, false);
    expect(atk).toBe(9);
  });

  it('should handle mid-level with moderate DVs/EVs', () => {
    // Level 50 Pikachu: base HP = 35, DV = 7, Stat Exp = 10000
    // EV factor = floor(ceil(sqrt(10000)) / 4) = floor(100 / 4) = 25
    // Core = ((35 + 7) * 2 + 25) * 50 = (84 + 25) * 50 = 5450
    // HP = floor(5450 / 100) + 50 + 10 = 54 + 60 = 114
    const hp = calculateGen1Stat(35, 7, 10000, 50, true);
    expect(hp).toBe(114);
  });

  it('should produce zero EV factor for zero stat exp', () => {
    // Stat exp = 0 → sqrt(0) = 0 → ceil(0) = 0 → floor(0/4) = 0
    expect(calculateGen1Stat(50, 8, 0, 100, false)).toBe(
      Math.floor(((50 + 8) * 2 + 0) * 100 / 100) + 5
    );
  });
});

describe('deriveBaseStats', () => {
  it('should correctly derive base stats from known values', () => {
    // Create a mock Pokemon with known base stats, IVs, EVs, level
    const baseHp = 106;
    const baseAtk = 110;
    const dv = 15;
    const statExp = 65535;
    const level = 100;

    const hp = calculateGen1Stat(baseHp, dv, statExp, level, true);
    const atk = calculateGen1Stat(baseAtk, dv, statExp, level, false);

    const mon = {
      maxHp: hp,
      attack: atk,
      defense: calculateGen1Stat(90, dv, statExp, level, false),
      speed: calculateGen1Stat(130, dv, statExp, level, false),
      spAtk: calculateGen1Stat(154, dv, statExp, level, false),
      spDef: calculateGen1Stat(154, dv, statExp, level, false),
      iv: { hp: dv, attack: dv, defense: dv, speed: dv, special: dv, spAtk: dv, spDef: dv },
      ev: { hp: statExp, attack: statExp, defense: statExp, speed: statExp, special: statExp, spAtk: statExp, spDef: statExp },
      level,
    } as any;

    const derived = deriveBaseStats(mon, 1);
    expect(derived).not.toBeNull();
    expect(derived!.hp).toBe(baseHp);
    expect(derived!.attack).toBe(baseAtk);
  });

  it('should return null for zero level or maxHp', () => {
    const mon = { maxHp: 0, level: 0 } as any;
    expect(deriveBaseStats(mon, 1)).toBeNull();
  });
});

describe('recalculateStats', () => {
  it('should recalculate all stats for Gen 1 Pokemon', () => {
    const baseStats: BaseStats = {
      hp: 45, attack: 49, defense: 49, speed: 45, spAtk: 65, spDef: 65,
    };

    const mon = {
      iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      level: 5,
    } as any;

    const result = recalculateStats(mon, baseStats, 1);

    // Verify HP formula
    // ((45 + 15) * 2 + 0) * 5 / 100 + 5 + 10 = 600/100 + 15 = 21
    expect(result.maxHp).toBe(21);
    expect(result.hp).toBe(result.maxHp); // Auto-heal on recalc

    // Special should mirror spAtk in Gen 1
    expect(result.special).toBe(result.spAtk);
    expect(result.spDef).toBe(result.spAtk); // Gen 1: spDef = spAtk
  });

  it('should auto-heal HP to max on recalculation', () => {
    const baseStats: BaseStats = {
      hp: 45, attack: 49, defense: 49, speed: 45, spAtk: 65, spDef: 65,
    };
    const mon = {
      hp: 1, // Damaged
      maxHp: 20,
      iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      level: 5,
    } as any;

    const result = recalculateStats(mon, baseStats, 1);
    expect(result.hp).toBe(result.maxHp);
  });
});
