/**
 * Gen 3 trainer-ID, shiny, and PID interpretation helper tests.
 *
 * BUG-G3-05 fix: added tests for the new PID-derived helpers (nature, ability
 * slot, gender, Unown form, Wurmple evolution, and IV extraction).
 */
import { describe, it, expect } from 'vitest';
import {
  combinedTrainerId,
  splitTrainerId,
  shinyValueGen3,
  isShinyGen3,
  SHINY_THRESHOLD_GEN3,
  getNatureId,
  getNatureName,
  getNatureModifier,
  NATURE_NAMES,
  NATURE_BOOST,
  NATURE_NERF,
  NATURE_NEUTRAL,
  getAbilitySlot,
  getGenderFromPid,
  getGenderFromPidByThreshold,
  getUnownFormLetterGen3,
  getWurmpleEvolution,
  extractGen3IVs,
  packGen3IVs,
} from '../lib/generations/gen3/identity';

describe('Gen 3 trainer ID (TID/SID)', () => {
  it('combines and splits as inverses', () => {
    const otid = combinedTrainerId(54321, 12345);
    expect(splitTrainerId(otid)).toEqual({ tid: 54321, sid: 12345 });
  });

  it('TID occupies the low 16 bits, SID the high 16 bits', () => {
    expect(combinedTrainerId(0x1234, 0xabcd)).toBe(0xabcd1234);
  });

  it('masks values beyond 16 bits', () => {
    expect(splitTrainerId(0xffff_ffff)).toEqual({ tid: 0xffff, sid: 0xffff });
  });
});

describe('Gen 3 shininess', () => {
  it('shiny value is TID ^ SID ^ PIDhi ^ PIDlo', () => {
    // PID 0x00000000, TID 0, SID 0 → value 0 → shiny.
    expect(shinyValueGen3(0, 0, 0)).toBe(0);
    expect(isShinyGen3(0, 0, 0)).toBe(true);
  });

  it('a value at the threshold is NOT shiny', () => {
    // Construct PID so that value === threshold (8): pidLow=8, others 0.
    expect(shinyValueGen3(0x0000_0008, 0, 0)).toBe(SHINY_THRESHOLD_GEN3);
    expect(isShinyGen3(0x0000_0008, 0, 0)).toBe(false);
  });

  it('a value just under the threshold IS shiny', () => {
    expect(shinyValueGen3(0x0000_0007, 0, 0)).toBe(7);
    expect(isShinyGen3(0x0000_0007, 0, 0)).toBe(true);
  });

  it('IDs that cancel the PID halves produce a shiny', () => {
    // PID hi=0x1234, lo=0x5678; pick TID=0x1234, SID=0x5678 → value 0.
    const pid = 0x1234_5678;
    expect(isShinyGen3(pid, 0x1234, 0x5678)).toBe(true);
  });
});

// ============================================================================
// BUG-G3-05: PID interpretation helpers
// ============================================================================

describe('BUG-G3-05: Nature derivation', () => {
  it('natureId = PID % 25', () => {
    expect(getNatureId(0)).toBe(0);          // Hardy
    expect(getNatureId(24)).toBe(24);         // Quirky
    expect(getNatureId(25)).toBe(0);          // wraps to Hardy
    expect(getNatureId(0x12345678)).toBe(0x12345678 % 25);
  });

  it('returns one of the 25 canonical nature names', () => {
    for (let pid = 0; pid < 25; pid++) {
      const name = getNatureName(pid);
      expect(NATURE_NAMES).toContain(name);
    }
  });

  it('Hardy (natureId 0) is neutral for all stats', () => {
    expect(getNatureModifier(0, 'attack')).toBe(NATURE_NEUTRAL);
    expect(getNatureModifier(0, 'defense')).toBe(NATURE_NEUTRAL);
    expect(getNatureModifier(0, 'speed')).toBe(NATURE_NEUTRAL);
    expect(getNatureModifier(0, 'spAtk')).toBe(NATURE_NEUTRAL);
    expect(getNatureModifier(0, 'spDef')).toBe(NATURE_NEUTRAL);
  });

  it('Lonely (natureId 1) boosts Attack and reduces Defense', () => {
    expect(getNatureModifier(1, 'attack')).toBe(NATURE_BOOST);
    expect(getNatureModifier(1, 'defense')).toBe(NATURE_NERF);
    expect(getNatureModifier(1, 'speed')).toBe(NATURE_NEUTRAL);
  });

  it('Modest (natureId 15) boosts SpAtk and reduces Attack', () => {
    // 15 = floor(15/5)=3 (SpAtk) boosted, 15%5=0 (Attack) reduced
    expect(getNatureModifier(15, 'spAtk')).toBe(NATURE_BOOST);
    expect(getNatureModifier(15, 'attack')).toBe(NATURE_NERF);
  });

  it('the 5 diagonal natures (0, 6, 12, 18, 24) are all neutral', () => {
    // Diagonal: natureId where floor(n/5) === n%5 → 0, 6, 12, 18, 24
    // = Hardy, Docile, Serious, Bashful, Quirky
    for (const n of [0, 6, 12, 18, 24]) {
      expect(getNatureModifier(n, 'attack')).toBe(NATURE_NEUTRAL);
      expect(getNatureModifier(n, 'defense')).toBe(NATURE_NEUTRAL);
      expect(getNatureModifier(n, 'speed')).toBe(NATURE_NEUTRAL);
      expect(getNatureModifier(n, 'spAtk')).toBe(NATURE_NEUTRAL);
      expect(getNatureModifier(n, 'spDef')).toBe(NATURE_NEUTRAL);
    }
  });
});

describe('BUG-G3-05: Ability slot derivation', () => {
  it('returns bit 16 of the PID (0 or 1)', () => {
    expect(getAbilitySlot(0x00000000)).toBe(0);
    expect(getAbilitySlot(0x00010000)).toBe(1);  // bit 16 set
    expect(getAbilitySlot(0x00000001)).toBe(0);  // bit 0 set, not bit 16
    expect(getAbilitySlot(0xffff0000)).toBe(1);  // all high bits set incl. bit 16
  });

  it('only bit 16 (not bit 19) determines the slot', () => {
    // 0x00080000 = bit 19 only → bit 16 is 0 → slot 0
    expect(getAbilitySlot(0x00080000)).toBe(0);
    // 0x00010000 = bit 16 only → slot 1
    expect(getAbilitySlot(0x00010000)).toBe(1);
    // 0x00090000 = bits 16 AND 19 → bit 16 is 1 → slot 1
    expect(getAbilitySlot(0x00090000)).toBe(1);
  });
});

describe('BUG-G3-05: Gender derivation', () => {
  it('threshold 255 (genderless) always returns Genderless', () => {
    expect(getGenderFromPidByThreshold(0, 255)).toBe('Genderless');
    expect(getGenderFromPidByThreshold(0xFF, 255)).toBe('Genderless');
  });

  it('threshold 0 (100% male) always returns Male', () => {
    expect(getGenderFromPidByThreshold(0, 0)).toBe('Male');
    expect(getGenderFromPidByThreshold(0xFF, 0)).toBe('Male');
  });

  it('threshold 254 (100% female) always returns Female', () => {
    expect(getGenderFromPidByThreshold(0, 254)).toBe('Female');
    expect(getGenderFromPidByThreshold(0xFF, 254)).toBe('Female');
  });

  it('threshold 127 (50/50): pid&0xFF < 127 → Male, >= 127 → Female', () => {
    expect(getGenderFromPidByThreshold(0, 127)).toBe('Male');       // 0 < 127
    expect(getGenderFromPidByThreshold(126, 127)).toBe('Male');     // 126 < 127
    expect(getGenderFromPidByThreshold(127, 127)).toBe('Female');   // 127 >= 127
    expect(getGenderFromPidByThreshold(255, 127)).toBe('Female');   // 255 >= 127
  });

  it('getGenderFromPid looks up species thresholds (Bulbasaur = 87.5% male = threshold 31)', () => {
    // Bulbasaur #1: threshold 31. pid&0xFF < 31 → Male, >= 31 → Female.
    expect(getGenderFromPid(0, 1)).toBe('Male');      // 0 < 31
    expect(getGenderFromPid(30, 1)).toBe('Male');     // 30 < 31
    expect(getGenderFromPid(31, 1)).toBe('Female');   // 31 >= 31
  });

  it('getGenderFromPid: Nidoran♀ (#25) is always Female', () => {
    expect(getGenderFromPid(0, 25)).toBe('Female');
    expect(getGenderFromPid(255, 25)).toBe('Female');
  });

  it('getGenderFromPid: Magnemite (#81) is Genderless', () => {
    expect(getGenderFromPid(0, 81)).toBe('Genderless');
    expect(getGenderFromPid(255, 81)).toBe('Genderless');
  });

  it('getGenderFromPid: unknown species defaults to 50/50 (threshold 127)', () => {
    // Species 500 doesn't exist in the table → default 127
    expect(getGenderFromPid(0, 500)).toBe('Male');
    expect(getGenderFromPid(200, 500)).toBe('Female');
  });
});

describe('BUG-G3-05: Unown form derivation', () => {
  it('returns a letter a-z, ?, or !', () => {
    for (let pid = 0; pid < 1000; pid++) {
      const form = getUnownFormLetterGen3(pid);
      expect(form).toMatch(/^[a-z?]$/);
    }
  });

  it('PID 0 → form "a" (val=0, mod 28 = 0)', () => {
    expect(getUnownFormLetterGen3(0)).toBe('a');
  });
});

describe('BUG-G3-05: Wurmple evolution', () => {
  it('(pid >> 16) % 10 < 5 → silcoon, else cascoon', () => {
    // pid = 0 → (0 >> 16) % 10 = 0 < 5 → silcoon
    expect(getWurmpleEvolution(0)).toBe('silcoon');
    // pid = 0x00050000 → (0x00050000 >> 16) % 10 = 5 % 10 = 5, NOT < 5 → cascoon
    expect(getWurmpleEvolution(0x00050000)).toBe('cascoon');
    // pid = 0x00040000 → (0x00040000 >> 16) % 10 = 4 < 5 → silcoon
    expect(getWurmpleEvolution(0x00040000)).toBe('silcoon');
    // pid = 0x000F0000 → (0x000F0000 >> 16) % 10 = 15 % 10 = 5 → cascoon
    expect(getWurmpleEvolution(0x000F0000)).toBe('cascoon');
  });
});

describe('BUG-G3-05: Gen 3 IV extraction (5-bit IVs from 32-bit word)', () => {
  it('extracts each 5-bit IV from its documented bit position', () => {
    // Construct a 32-bit word where each IV field has a known value.
    // HP=0x1f (bits 0-4), Atk=0x1f (bits 5-9), Def=0x1f (bits 10-14), etc.
    const iv32 = (0x1f) | (0x1f << 5) | (0x1f << 10) | (0x1f << 15) | (0x1f << 20) | (0x1f << 25);
    const ivs = extractGen3IVs(iv32);
    expect(ivs.hp).toBe(31);
    expect(ivs.attack).toBe(31);
    expect(ivs.defense).toBe(31);
    expect(ivs.speed).toBe(31);
    expect(ivs.spAtk).toBe(31);
    expect(ivs.spDef).toBe(31);
  });

  it('extracts zero IVs from a zero word', () => {
    const ivs = extractGen3IVs(0);
    expect(ivs).toEqual({ hp: 0, attack: 0, defense: 0, speed: 0, spAtk: 0, spDef: 0 });
  });

  it('packGen3IVs is the inverse of extractGen3IVs', () => {
    const original = { hp: 12, attack: 25, defense: 7, speed: 31, spAtk: 18, spDef: 0 };
    const packed = packGen3IVs(original);
    const extracted = extractGen3IVs(packed);
    expect(extracted).toEqual(original);
  });

  it('masks IVs to 5 bits (0-31) on pack', () => {
    // Values > 31 should be masked to 5 bits.
    const overflow = { hp: 32, attack: 100, defense: 255, speed: -1, spAtk: 50, spDef: 0 };
    const packed = packGen3IVs(overflow);
    const extracted = extractGen3IVs(packed);
    expect(extracted.hp).toBe(0);       // 32 & 0x1f = 0
    expect(extracted.attack).toBe(4);   // 100 & 0x1f = 4
    expect(extracted.defense).toBe(31); // 255 & 0x1f = 31
    // speed -1 >>> 0 = 0xFFFFFFFF, & 0x1f = 31
    expect(extracted.speed).toBe(31);
    expect(extracted.spAtk).toBe(18);   // 50 & 0x1f = 18
  });
});
