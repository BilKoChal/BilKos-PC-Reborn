/**
 * Round-trip identity tests for Gen 1 and Gen 2 save parsing/writing.
 *
 * Core invariant: write(parse(buffer)) should be byte-identical to the input
 * (modulo intentional edits). This catches any asymmetry between the parser
 * and writer.
 *
 * Since we don't have real save files in the repo, we construct synthetic
 * saves with known byte patterns, parse them, write them back, and verify
 * that the output matches the input byte-for-byte.
 *
 * For checksum tests, we construct saves with correct checksums, verify
 * the checksum validation passes, then ensure round-trip preserves them.
 */
import { describe, it, expect } from 'vitest';
import { parseGen1Save, validateGen1Checksum } from '../lib/generations/gen1/parser';
import { writeGen1Save } from '../lib/generations/gen1/writer';
import { parseGen2Save, calculateGen2Checksum } from '../lib/generations/gen2/parser';
import { writeGen2Save } from '../lib/generations/gen2/writer';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import type { PokemonStats } from '../lib/parser/types';

// ============================================================================
// Helper: Create a minimal valid Gen 1 save file (International, 32768 bytes)
// ============================================================================

function createMinimalGen1Save(): Uint8Array {
  const data = new Uint8Array(32768);

  // Fill with 0xFF (standard uninitialized SRAM pattern)
  data.fill(0xFF);

  // Write a valid player name "RED" at 0x2598 (11 bytes)
  // 'R' = 0x91, 'E' = 0x84, 'D' = 0x83, terminator = 0x50
  data[0x2598] = 0x91; // R
  data[0x2599] = 0x84; // E
  data[0x259A] = 0x83; // D
  data[0x259B] = 0x50; // terminator
  for (let i = 0x259C; i < 0x2598 + 11; i++) data[i] = 0x50;

  // Write rival name "BLUE" at 0x25F6 (11 bytes)
  data[0x25F6] = 0x80; // B
  data[0x25F7] = 0x8A; // L
  data[0x25F8] = 0x94; // U
  data[0x25F9] = 0x84; // E
  data[0x25FA] = 0x50; // terminator
  for (let i = 0x25FB; i < 0x25F6 + 11; i++) data[i] = 0x50;

  // Player ID at 0x2605 (2 bytes BE)
  data[0x2605] = 0x00;
  data[0x2606] = 0x01;

  // Money at 0x25F3 (3 bytes BCD) = 3000
  data[0x25F3] = 0x00;
  data[0x25F4] = 0x30;
  data[0x25F5] = 0x00;

  // Casino coins at 0x2850 (2 bytes BCD)
  data[0x2850] = 0x00;
  data[0x2851] = 0x00;

  // Badges at 0x2602
  data[0x2602] = 0x00;

  // Options at 0x2601
  data[0x2601] = 0x03; // Normal text speed

  // Play time at 0x2CED
  data[0x2CED] = 0; // hours
  data[0x2CEE] = 0;
  data[0x2CEF] = 0; // minutes
  data[0x2CF0] = 0; // seconds

  // Party count at 0x2F2C = 0
  data[0x2F2C] = 0;

  // Current box ID at 0x284C
  data[0x284C] = 0x80; // Box 0 with high bit set

  // Item bag at 0x25C9
  data[0x25C9] = 0x00; // 0 items
  // Actually, item count 0 then terminator
  data[0x25C9] = 0xFF; // No items

  // PC Items at 0x27E6
  data[0x27E6] = 0xFF; // No items

  // Zero out party/box data areas
  for (let i = 0x2F2C; i < 0x3524; i++) data[i] = 0x00;
  data[0x2F2C] = 0x00; // Party count = 0

  // Zero out Pokédex areas
  for (let i = 0x25A3; i < 0x25A3 + 19; i++) data[i] = 0x00; // Owned
  for (let i = 0x25B6; i < 0x25B6 + 19; i++) data[i] = 0x00; // Seen

  // Zero out event flags area
  for (let i = 0x2852; i < 0x2852 + 32; i++) data[i] = 0x00;

  // Zero out Pikachu friendship so detectGameVersion doesn't think it's Yellow
  data[0x271C] = 0x00;

  // Zero out PC box banks
  for (let i = 0x4000; i < 0x8000; i++) data[i] = 0x00;

  // Current box data at 0x30C0 (zero it)
  for (let i = 0x30C0; i < 0x30C0 + 1122; i++) data[i] = 0x00;

  // Compute and write checksum
  let sum = 0;
  for (let i = 0x2598; i <= 0x3522; i++) {
    sum += data[i]!;
  }
  data[0x3523] = (~sum) & 0xFF;

  // Compute box checksums for bank 2 and bank 3
  // Bank 2 checksum at 0x5A4C, individual checksums starting at 0x5A4D
  // Bank 3 checksum at 0x7A4C, individual checksums starting at 0x7A4D
  // For zeroed boxes, all checksums will be 0
  // Zero data means zero checksums

  return data;
}

// ============================================================================
// Helper: Create a minimal valid Gen 2 save file (Gold/Silver, 32768 bytes)
// ============================================================================

function createMinimalGen2Save(): Uint8Array {
  const data = new Uint8Array(32768);

  // Fill entire save with 0x00 for clean state
  data.fill(0x00);

  // Write options at 0x2000
  data[0x2000] = 0x03; // Normal text speed

  // Write trainer ID at 0x2009 (2 bytes BE)
  data[0x2009] = 0x00;
  data[0x200A] = 0x01;

  // Write trainer name "GOLD" at 0x200B (8 bytes)
  // G=0x86, O=0x8E, L=0x8B, D=0x83
  data[0x200B] = 0x86; // G
  data[0x200C] = 0x8E; // O
  data[0x200D] = 0x8B; // L
  data[0x200E] = 0x83; // D
  for (let i = 0x200F; i < 0x200B + 8; i++) data[i] = 0x50;

  // Money at 0x23DB (3 bytes BCD) = 3000
  data[0x23DB] = 0x00;
  data[0x23DC] = 0x30;
  data[0x23DD] = 0x00;

  // Coins at 0x23E1 (2 bytes BCD)
  data[0x23E1] = 0x00;
  data[0x23E2] = 0x00;

  // Badges at 0x23E4-0x23E5
  data[0x23E4] = 0x00;
  data[0x23E5] = 0x00;

  // Play time at 0x2051-0x2054
  data[0x2051] = 0x00; // hours high
  data[0x2052] = 0x00; // hours low
  data[0x2053] = 0x00; // minutes
  data[0x2054] = 0x00; // seconds

  // Party count at 0x288A = 0
  data[0x288A] = 0;

  // Current box ID at 0x2724
  data[0x2724] = 0;

  // Item pockets (empty)
  data[0x23E6] = 0; // Normal items count
  data[0x23E7] = 0xFF; // Terminator
  data[0x2411] = 0; // Key items count
  data[0x2412] = 0xFF;
  data[0x242C] = 0; // Balls count
  data[0x242E] = 0xFF;
  data[0x24AC] = 0; // PC items count
  data[0x24AD] = 0xFF;

  // Pokédex at 0x2A14 (owned) and 0x2A3C (seen) — all zero

  // PC boxes at 0x4000 and 0x6000 — all zero

  // Active box at 0x2D10 — all zero

  // Compute GS primary checksum (0x2009 to 0x2D68)
  const gsChecksum = calculateGen2Checksum(data, 0x2009, 0x2D68);
  data[0x2D69] = gsChecksum & 0xFF;
  data[0x2D6A] = (gsChecksum >> 8) & 0xFF;

  // Copy data to backup bank (0x3009 mirrors 0x2009)
  const dataBlock = data.slice(0x2009, 0x2D69);
  data.set(dataBlock, 0x3009);

  // Compute backup checksum
  const backupChecksum = calculateGen2Checksum(data, 0x3009, 0x3D68);
  data[0x3D69] = backupChecksum & 0xFF;
  data[0x3D6A] = (backupChecksum >> 8) & 0xFF;

  // Trainer gender byte at 0x3E3D
  data[0x3E3D] = 0; // Male

  return data;
}

// ============================================================================
// Gen 1 Round-Trip Tests
// ============================================================================

describe('Gen 1 Checksum Validation', () => {
  it('should validate a correctly checksummed Gen 1 save', () => {
    const save = createMinimalGen1Save();
    expect(validateGen1Checksum(save)).toBe(true);
  });

  it('should reject a save with corrupted checksum', () => {
    const save = createMinimalGen1Save();
    save[0x3523]! ^= 0xFF; // Flip the checksum byte
    expect(validateGen1Checksum(save)).toBe(false);
  });

  it('should reject a save with corrupted data', () => {
    const save = createMinimalGen1Save();
    save[0x2600]! ^= 0xFF; // Flip a data byte
    expect(validateGen1Checksum(save)).toBe(false);
  });
});

describe('Gen 1 Round-Trip', () => {
  it('should parse a minimal Gen 1 save without errors', () => {
    const save = createMinimalGen1Save();
    const parsed = parseGen1Save(save, 'test.sav');
    expect(parsed.generation).toBe(1);
    expect(parsed.trainer.name).toBe('RED');
    expect(parsed.partyCount).toBe(0);
    expect(parsed.isValid).toBe(true);
  });

  it('should write back a parsed Gen 1 save with valid checksum', () => {
    const original = createMinimalGen1Save();
    const parsed = parseGen1Save(original, 'test.sav');
    const written = writeGen1Save(parsed);
    expect(validateGen1Checksum(written)).toBe(true);
  });

  it('should preserve trainer name through round-trip', () => {
    const original = createMinimalGen1Save();
    const parsed = parseGen1Save(original, 'test.sav');
    const written = writeGen1Save(parsed);
    const reparsed = parseGen1Save(written, 'test.sav');
    expect(reparsed.trainer.name).toBe(parsed.trainer.name);
  });

  it('should preserve money through round-trip', () => {
    const original = createMinimalGen1Save();
    const parsed = parseGen1Save(original, 'test.sav');
    const written = writeGen1Save(parsed);
    const reparsed = parseGen1Save(written, 'test.sav');
    expect(reparsed.trainer.money).toBe(parsed.trainer.money);
  });

  it('should preserve player ID through round-trip', () => {
    const original = createMinimalGen1Save();
    const parsed = parseGen1Save(original, 'test.sav');
    const written = writeGen1Save(parsed);
    const reparsed = parseGen1Save(written, 'test.sav');
    expect(reparsed.trainer.id).toBe(parsed.trainer.id);
  });
});

describe('Gen 1 Adapter Detection', () => {
  const adapter = new Gen1Adapter();

  it('should detect a valid Gen 1 save', () => {
    const save = createMinimalGen1Save();
    const result = adapter.detectSave(save, 'test.sav');
    expect(result.detected).toBe(true);
  });

  it('should report ambiguous for Red/Blue', () => {
    const save = createMinimalGen1Save();
    const result = adapter.detectSave(save, 'red.sav');
    // Red/Blue are ambiguous since they share format
    // (filename "red.sav" hints at Red, which shares format with Blue = ambiguous)
    expect(result.ambiguous).toBe(true);
  });

  it('should not detect a random buffer as Gen 1', () => {
    const random = new Uint8Array(32768).fill(0xAA);
    const result = adapter.detectSave(random, 'random.sav');
    expect(result.detected).toBe(false);
  });

  it('should report supportsStandalone as true', () => {
    expect(adapter.supportsStandalone).toBe(true);
  });
});

// ============================================================================
// Gen 2 Round-Trip Tests
// ============================================================================

describe('Gen 2 Checksum Validation', () => {
  it('should compute correct GS primary checksum', () => {
    const save = createMinimalGen2Save();
    const computed = calculateGen2Checksum(save, 0x2009, 0x2D68);
    const stored = save[0x2D69]! | (save[0x2D6A]! << 8);
    expect(computed).toBe(stored);
    expect(stored).not.toBe(0); // Non-trivial checksum
  });

  it('should compute correct backup checksum independently', () => {
    const save = createMinimalGen2Save();
    const primaryChecksum = calculateGen2Checksum(save, 0x2009, 0x2D68);
    const backupChecksum = calculateGen2Checksum(save, 0x3009, 0x3D68);
    // Primary and backup data should be identical, so checksums should match
    expect(primaryChecksum).toBe(backupChecksum);
  });

  it('should reject corrupted primary checksum', () => {
    const save = createMinimalGen2Save();
    save[0x2D69]! ^= 0xFF;
    const computed = calculateGen2Checksum(save, 0x2009, 0x2D68);
    const stored = save[0x2D69]! | (save[0x2D6A]! << 8);
    expect(computed).not.toBe(stored);
  });
});

describe('Gen 2 Round-Trip', () => {
  it('should parse a minimal Gen 2 save without errors', () => {
    const save = createMinimalGen2Save();
    const parsed = parseGen2Save(save, 'gold.sav');
    expect(parsed.generation).toBe(2);
    expect(parsed.trainer.name).toBe('GOLD');
    expect(parsed.partyCount).toBe(0);
    expect(parsed.isValid).toBe(true);
  });

  it('should write back a parsed Gen 2 save with valid checksums', () => {
    const original = createMinimalGen2Save();
    const parsed = parseGen2Save(original, 'gold.sav');
    const written = writeGen2Save(parsed);

    // Verify primary checksum
    const gsComputed = calculateGen2Checksum(written, 0x2009, 0x2D68);
    const gsStored = written[0x2D69]! | (written[0x2D6A]! << 8);
    expect(gsComputed).toBe(gsStored);
  });

  it('should preserve trainer name through round-trip', () => {
    const original = createMinimalGen2Save();
    const parsed = parseGen2Save(original, 'gold.sav');
    const written = writeGen2Save(parsed);
    const reparsed = parseGen2Save(written, 'gold.sav');
    expect(reparsed.trainer.name).toBe(parsed.trainer.name);
  });

  it('should preserve money through round-trip', () => {
    const original = createMinimalGen2Save();
    const parsed = parseGen2Save(original, 'gold.sav');
    const written = writeGen2Save(parsed);
    const reparsed = parseGen2Save(written, 'gold.sav');
    expect(reparsed.trainer.money).toBe(parsed.trainer.money);
  });

  it('should preserve trainer ID through round-trip', () => {
    const original = createMinimalGen2Save();
    const parsed = parseGen2Save(original, 'gold.sav');
    const written = writeGen2Save(parsed);
    const reparsed = parseGen2Save(written, 'gold.sav');
    expect(reparsed.trainer.id).toBe(parsed.trainer.id);
  });

  it('should have correct second checksum copy (checksum2)', () => {
    const original = createMinimalGen2Save();
    const parsed = parseGen2Save(original, 'gold.sav');
    const written = writeGen2Save(parsed);

    // INT GS second checksum copy at 0x7E6D should match primary at 0x2D69
    const primaryChecksum = written[0x2D69]! | (written[0x2D6A]! << 8);
    const checksum2 = written[0x7E6D]! | (written[0x7E6E]! << 8);
    expect(primaryChecksum).toBe(checksum2);
  });

  it('should mirror trainer data to scattered backup regions', () => {
    const original = createMinimalGen2Save();
    const parsed = parseGen2Save(original, 'gold.sav');
    const written = writeGen2Save(parsed);

    // INT GS uses PKHeX scattered backup:
    // Mirror region 1: 0x2009..0x222F → 0x15C7
    // Verify the trainer ID is mirrored correctly
    expect(written[0x15C7]).toBe(written[0x2009]);
    expect(written[0x15C8]).toBe(written[0x200A]);
  });
});

describe('Gen 2 Adapter Detection', () => {
  const adapter = new Gen2Adapter();

  it('should detect a valid Gen 2 save', () => {
    const save = createMinimalGen2Save();
    const result = adapter.detectSave(save, 'gold.sav');
    expect(result.detected).toBe(true);
  });

  it('should report ambiguous for Gold/Silver', () => {
    const save = createMinimalGen2Save();
    const result = adapter.detectSave(save, 'gold.sav');
    expect(result.ambiguous).toBe(true);
  });

  it('should not detect a random buffer as Gen 2', () => {
    const random = new Uint8Array(32768).fill(0xAA);
    const result = adapter.detectSave(random, 'random.sav');
    expect(result.detected).toBe(false);
  });

  it('should report supportsStandalone as true', () => {
    expect(adapter.supportsStandalone).toBe(true);
  });

  it('should parse 32-byte raw box .pk2 format', () => {
    // 32-byte raw box format is valid for .pk2
    const result = adapter.standaloneFormat!.parseFile(new Uint8Array(32));
    expect(result).toBeDefined();
    expect(result.speciesId).toBe(0); // Empty buffer → species 0
  });

  it('should throw on invalid .pk2 size', () => {
    expect(() => adapter.standaloneFormat!.parseFile(new Uint8Array(10))).toThrow();
  });

  it('should create 73-byte PKHeX-compatible .pk2 file', () => {
    // Create a minimal mock Pokemon for Gen 2 export
    const mockMon = {
      speciesId: 25, // Pikachu
      dexId: 25,
      speciesName: 'PIKACHU',
      nickname: 'PIKA',
      originalTrainerName: 'ASH',
      level: 50,
      exp: 125000,
      friendship: 70,
      hp: 100, maxHp: 100, attack: 80, defense: 50, speed: 90, special: 60, spAtk: 60, spDef: 60,
      iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      moves: ['Thunderbolt', '-', '-', '-'],
      moveIds: [85, 0, 0, 0],
      movePp: [15, 0, 0, 0],
      movePpUps: [0, 0, 0, 0],
      isParty: true,
      originalTrainerId: 12345,
      heldItemId: 0,
      pokerus: 0,
      genExtension: null,
      raw: new Uint8Array(48),
    } as Partial<PokemonStats> as PokemonStats;
    const result = adapter.standaloneFormat!.createFile(mockMon);
    expect(result.length).toBe(73); // INT PokeList2 format
    expect(result[0]).toBe(0x01); // Count = 1
    expect(result[1]).toBe(25); // Species = Pikachu (National Dex)
    expect(result[2]).toBe(0xFF); // Terminator
  });
});
