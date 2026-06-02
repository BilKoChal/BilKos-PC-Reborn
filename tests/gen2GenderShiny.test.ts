import { describe, it, expect } from 'vitest';
import type { PokemonStats } from '../lib/parser/types';
import {
  calculateGen2Checksum,
  isGen2Shiny,
  getGen2Gender,
  getPokedexFlagsGen2,
} from '../lib/generations/gen2/parser';
import { calculateGen2Stat, recalculateGen2Stats } from '../lib/generations/gen2/statCalculator';
import { BaseStats } from '../lib/interfaces';

// ============================================================================
// Gen 2 Checksum Tests
// ============================================================================

describe('calculateGen2Checksum', () => {
  it('should compute 16-bit additive checksum over a zeroed buffer', () => {
    const data = new Uint8Array(256);
    const sum = calculateGen2Checksum(data, 0, 255);
    expect(sum).toBe(0);
  });

  it('should compute checksum for known byte values', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const sum = calculateGen2Checksum(data, 0, 4);
    expect(sum).toBe(1 + 2 + 3 + 4 + 5);
  });

  it('should handle wraparound at 16-bit boundary', () => {
    // Fill with 0xFF (255 each), 258 bytes → 255 * 258 = 65790 → 65790 & 0xFFFF = 2
    const data = new Uint8Array(258).fill(0xFF);
    const sum = calculateGen2Checksum(data, 0, 257);
    expect(sum).toBe((255 * 258) & 0xFFFF);
  });

  it('should match single-byte checksum', () => {
    const data = new Uint8Array([0x42]);
    expect(calculateGen2Checksum(data, 0, 0)).toBe(0x42);
  });
});

// ============================================================================
// Gen 2 Shiny DV Tests (validated against Bulbapedia)
// ============================================================================

describe('isGen2Shiny', () => {
  // Bulbapedia: A Pokémon is shiny if:
  //   Defense DV = 10
  //   Speed DV = 10
  //   Special DV = 10
  //   Attack DV ∈ {2, 3, 6, 7, 10, 11, 14, 15}

  it('should return true for the classic shiny DVs (10, 10, 10, 10)', () => {
    expect(isGen2Shiny(10, 10, 10, 10)).toBe(true);
  });

  it('should return true for all valid Attack DV values with Def=Spd=Spc=10', () => {
    const validAtk = [2, 3, 6, 7, 10, 11, 14, 15];
    for (const atk of validAtk) {
      expect(isGen2Shiny(atk, 10, 10, 10)).toBe(true);
    }
  });

  it('should return false for invalid Attack DV values even with other DVs at 10', () => {
    const invalidAtk = [0, 1, 4, 5, 8, 9, 12, 13];
    for (const atk of invalidAtk) {
      expect(isGen2Shiny(atk, 10, 10, 10)).toBe(false);
    }
  });

  it('should return false if Defense DV is not 10', () => {
    expect(isGen2Shiny(10, 9, 10, 10)).toBe(false);
    expect(isGen2Shiny(10, 11, 10, 10)).toBe(false);
  });

  it('should return false if Speed DV is not 10', () => {
    expect(isGen2Shiny(10, 10, 9, 10)).toBe(false);
    expect(isGen2Shiny(10, 10, 11, 10)).toBe(false);
  });

  it('should return false if Special DV is not 10', () => {
    expect(isGen2Shiny(10, 10, 10, 9)).toBe(false);
    expect(isGen2Shiny(10, 10, 10, 11)).toBe(false);
  });

  it('should return false for all-zero DVs', () => {
    expect(isGen2Shiny(0, 0, 0, 0)).toBe(false);
  });

  it('should return false for all-max DVs except the Attack check', () => {
    // Attack = 15 is valid for shiny, but needs def=spd=spc=10
    expect(isGen2Shiny(15, 15, 15, 15)).toBe(false);
  });

  it('should derive correct HP DV for shiny Pokemon', () => {
    // HP DV = ((atk&1)<<3) | ((def&1)<<2) | ((spd&1)<<1) | (spc&1)
    // For atk=10 (bit0=0), def=10 (bit0=0), spd=10 (bit0=0), spc=10 (bit0=0)
    // HP DV = 0
    const hpIv = ((10 & 1) << 3) | ((10 & 1) << 2) | ((10 & 1) << 1) | (10 & 1);
    expect(hpIv).toBe(0); // Shiny Gyarados HP DV = 0 or 8

    // For atk=15 (bit0=1), def=10 (bit0=0), spd=10 (bit0=0), spc=10 (bit0=0)
    const hpIv2 = ((15 & 1) << 3) | ((10 & 1) << 2) | ((10 & 1) << 1) | (10 & 1);
    expect(hpIv2).toBe(8);
  });
});

// ============================================================================
// Gen 2 Gender Tests (validated against Bulbapedia gender ratios)
// ============================================================================

describe('getGen2Gender', () => {
  // ── Genderless species ──

  it('should return Genderless for Magnemite (81)', () => {
    expect(getGen2Gender(81, 7)).toBe('Genderless');
  });

  it('should return Genderless for Mewtwo (150)', () => {
    expect(getGen2Gender(150, 7)).toBe('Genderless');
  });

  it('should return Genderless for Mew (151)', () => {
    expect(getGen2Gender(151, 7)).toBe('Genderless');
  });

  it('should return Genderless for Lugia (249)', () => {
    expect(getGen2Gender(249, 7)).toBe('Genderless');
  });

  it('should return Genderless for Ho-Oh (250)', () => {
    expect(getGen2Gender(250, 7)).toBe('Genderless');
  });

  it('should return Genderless for Celebi (251)', () => {
    expect(getGen2Gender(251, 7)).toBe('Genderless');
  });

  // ── Always Female species (0% Male) ──

  it('should return Female for Nidorina (30) regardless of atkIv', () => {
    expect(getGen2Gender(30, 0)).toBe('Female');
    expect(getGen2Gender(30, 15)).toBe('Female');
  });

  it('should return Female for Chansey (113)', () => {
    expect(getGen2Gender(113, 15)).toBe('Female');
  });

  it('should return Female for Miltank (241)', () => {
    expect(getGen2Gender(241, 0)).toBe('Female');
  });

  // ── Always Male species (0% Female) ──

  it('should return Male for Nidorino (33) regardless of atkIv', () => {
    expect(getGen2Gender(33, 0)).toBe('Male');
    expect(getGen2Gender(33, 15)).toBe('Male');
  });

  it('should return Male for Hitmonlee (106)', () => {
    expect(getGen2Gender(106, 0)).toBe('Male');
  });

  it('should return Male for Tauros (128)', () => {
    expect(getGen2Gender(128, 15)).toBe('Male');
  });

  // ── 87.5% Male / 12.5% Female → Female if atkIv ≤ 1 ──

  it('should return Female for Bulbasaur (1) with atkIv ≤ 1', () => {
    expect(getGen2Gender(1, 0)).toBe('Female');
    expect(getGen2Gender(1, 1)).toBe('Female');
  });

  it('should return Male for Bulbasaur (1) with atkIv > 1', () => {
    expect(getGen2Gender(1, 2)).toBe('Male');
    expect(getGen2Gender(1, 15)).toBe('Male');
  });

  it('should return Female for Eevee (133) with atkIv ≤ 1', () => {
    expect(getGen2Gender(133, 0)).toBe('Female');
    expect(getGen2Gender(133, 1)).toBe('Female');
  });

  it('should return Female for Totodile (158) with atkIv ≤ 1', () => {
    expect(getGen2Gender(158, 1)).toBe('Female');
  });

  it('should return Male for all starters with atkIv = 2', () => {
    // All starters are 87.5% Male
    expect(getGen2Gender(1, 2)).toBe('Male');   // Bulbasaur
    expect(getGen2Gender(4, 2)).toBe('Male');   // Charmander
    expect(getGen2Gender(7, 2)).toBe('Male');   // Squirtle
    expect(getGen2Gender(152, 2)).toBe('Male'); // Chikorita
    expect(getGen2Gender(155, 2)).toBe('Male'); // Cyndaquil
    expect(getGen2Gender(158, 2)).toBe('Male'); // Totodile
  });

  // ── 75% Male / 25% Female → Female if atkIv ≤ 3 ──

  it('should return Female for Growlithe (58) with atkIv ≤ 3', () => {
    expect(getGen2Gender(58, 0)).toBe('Female');
    expect(getGen2Gender(58, 3)).toBe('Female');
  });

  it('should return Male for Growlithe (58) with atkIv > 3', () => {
    expect(getGen2Gender(58, 4)).toBe('Male');
    expect(getGen2Gender(58, 15)).toBe('Male');
  });

  it('should return Female for Abra (63) with atkIv ≤ 3', () => {
    expect(getGen2Gender(63, 3)).toBe('Female');
  });

  // ── 25% Male / 75% Female → Female if atkIv ≤ 11 ──

  it('should return Female for Clefairy (35) with atkIv ≤ 11', () => {
    expect(getGen2Gender(35, 0)).toBe('Female');
    expect(getGen2Gender(35, 11)).toBe('Female');
  });

  it('should return Male for Clefairy (35) with atkIv > 11', () => {
    expect(getGen2Gender(35, 12)).toBe('Male');
    expect(getGen2Gender(35, 15)).toBe('Male');
  });

  it('should return Female for Vulpix (37) with atkIv ≤ 11', () => {
    expect(getGen2Gender(37, 11)).toBe('Female');
  });

  it('should return Male for Vulpix (37) with atkIv = 12', () => {
    expect(getGen2Gender(37, 12)).toBe('Male');
  });

  // ── 50% Male / 50% Female → Female if atkIv ≤ 7 (default) ──

  it('should return Female for Pikachu (25) with atkIv ≤ 7', () => {
    expect(getGen2Gender(25, 0)).toBe('Female');
    expect(getGen2Gender(25, 7)).toBe('Female');
  });

  it('should return Male for Pikachu (25) with atkIv > 7', () => {
    expect(getGen2Gender(25, 8)).toBe('Male');
    expect(getGen2Gender(25, 15)).toBe('Male');
  });

  it('should return Female for Pidgey (16) with atkIv = 7', () => {
    expect(getGen2Gender(16, 7)).toBe('Female');
  });

  it('should return Male for Pidgey (16) with atkIv = 8', () => {
    expect(getGen2Gender(16, 8)).toBe('Male');
  });
});

// ============================================================================
// Gen 2 Pokédex Flag Tests
// ============================================================================

describe('getPokedexFlagsGen2', () => {
  it('should return 256 flags for the full Pokédex range', () => {
    const data = new Uint8Array(32); // 32 bytes = 256 bits
    const flags = getPokedexFlagsGen2(data, 0);
    expect(flags.length).toBe(256);
  });

  it('should correctly parse set bits', () => {
    const data = new Uint8Array(32);
    // Set bit 0 of byte 0 → flags[0] = true (species #1 = Bulbasaur in Gen 2 Pokédex)
    data[0] = 0x01;
    // Set bit 7 of byte 1 → flags[15] = true (species #16 = Pidgey)
    data[1] = 0x80;

    const flags = getPokedexFlagsGen2(data, 0);
    expect(flags[0]).toBe(true);    // Bit 0 of byte 0 = species #1
    expect(flags[15]).toBe(true);   // Bit 7 of byte 1 = species #16
    expect(flags[1]).toBe(false);   // Bit 1 of byte 0 = unset
    expect(flags[16]).toBe(false);  // Bit 0 of byte 2 = unset
  });

  it('should handle species #251 (Celebi) at bit 250', () => {
    const data = new Uint8Array(32);
    // Species #251 uses bit index 250 (0-based: species 1=bit0, species 251=bit250)
    // Bit 250 is in byte 31 (250/8 = 31.25 → byte 31), bit position 2 (250 % 8 = 2)
    data[31] = 0x04; // bit 2 set

    const flags = getPokedexFlagsGen2(data, 0);
    expect(flags[250]).toBe(true); // Bit 250 = species #251 = Celebi
  });

  it('should parse all-ones as every species owned', () => {
    const data = new Uint8Array(32).fill(0xFF);
    const flags = getPokedexFlagsGen2(data, 0);
    const ownedCount = flags.filter(Boolean).length;
    expect(ownedCount).toBe(256); // All bits set including unused
  });

  it('should parse all-zeros as nothing owned', () => {
    const data = new Uint8Array(32);
    const flags = getPokedexFlagsGen2(data, 0);
    const ownedCount = flags.filter(Boolean).length;
    expect(ownedCount).toBe(0);
  });
});

// ============================================================================
// Gen 2 Stat Calculator Tests
// ============================================================================

describe('calculateGen2Stat', () => {
  it('should use the same formula as Gen 1 (shared formula)', () => {
    // Gen 2 shares the same stat formula with Gen 1
    // Test: Mewtwo level 100 with max DVs/EVs
    const hp = calculateGen2Stat(106, 15, 65535, 100, true);
    expect(hp).toBe(416);

    const spc = calculateGen2Stat(154, 15, 65535, 100, false);
    expect(spc).toBe(407);
  });
});

describe('recalculateGen2Stats', () => {
  it('should recalculate stats with split SpAtk/SpDef', () => {
    const baseStats: BaseStats = {
      hp: 45, attack: 49, defense: 49, speed: 45, spAtk: 65, spDef: 65,
    };

    const mon = {
      iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      level: 5,
    } as Partial<PokemonStats> as PokemonStats;

    const result = recalculateGen2Stats(mon, baseStats);

    // Both SpAtk and SpDef should use the shared special DV (15) and EV (0)
    expect(result.spAtk).toBe(calculateGen2Stat(65, 15, 0, 5, false));
    expect(result.spDef).toBe(calculateGen2Stat(65, 15, 0, 5, false));
    expect(result.spAtk).toBe(result.spDef); // Same base stat in this case
  });

  it('should handle different SpAtk/SpDef base stats (e.g., Blastoise)', () => {
    const baseStats: BaseStats = {
      hp: 79, attack: 83, defense: 100, speed: 78, spAtk: 85, spDef: 105,
    };

    const mon = {
      iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      level: 100,
    } as Partial<PokemonStats> as PokemonStats;

    const result = recalculateGen2Stats(mon, baseStats);

    // SpAtk and SpDef should differ because base stats differ
    expect(result.spAtk).not.toBe(result.spDef);
    expect(result.spAtk).toBe(calculateGen2Stat(85, 15, 0, 100, false));
    expect(result.spDef).toBe(calculateGen2Stat(105, 15, 0, 100, false));
  });

  it('should derive HP IV from other DVs (Gen 2 HP formula)', () => {
    const baseStats: BaseStats = {
      hp: 45, attack: 49, defense: 49, speed: 45, spAtk: 65, spDef: 65,
    };

    // Set DVs where HP IV derivation is verifiable
    const atkIv = 15; // bit0 = 1
    const defIv = 15; // bit0 = 1
    const spdIv = 15; // bit0 = 1
    const spcIv = 15; // bit0 = 1
    const expectedHpIv = (1 << 3) | (1 << 2) | (1 << 1) | 1; // = 15

    const mon = {
      iv: { hp: 0, attack: atkIv, defense: defIv, speed: spdIv, special: spcIv, spAtk: spcIv, spDef: spcIv },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      level: 5,
    } as Partial<PokemonStats> as PokemonStats;

    const result = recalculateGen2Stats(mon, baseStats);
    expect(result.iv.hp).toBe(expectedHpIv);
  });

  it('should auto-heal HP to max on recalculation', () => {
    const baseStats: BaseStats = {
      hp: 45, attack: 49, defense: 49, speed: 45, spAtk: 65, spDef: 65,
    };

    const mon = {
      hp: 1,
      iv: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      level: 5,
    } as Partial<PokemonStats> as PokemonStats;

    const result = recalculateGen2Stats(mon, baseStats);
    expect(result.hp).toBe(result.maxHp);
  });
});
