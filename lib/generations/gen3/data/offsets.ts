/**
 * Gen 3 Save Format Offsets (Phase 2 Sprint 1).
 *
 * Gen 3 saves use a sectioned format. The section footer layout (last 12 bytes
 * of each 4KB section) is:
 *   0xFF4: Section ID (u16 LE) + padding (u16)
 *   0xFF8: Checksum (u16 LE) + padding (u16)
 *   0xFFC: Save Index (u32 LE) — higher = active half
 *
 * The previous code had the footer layout WRONG:
 *   - Read "security key" from 0xFF8 (actually the checksum)
 *   - Read "save index" from 0xFF4+0xC = 0x1000 (OOB — in the next section!)
 *   - Validated checksums against 0xFFC (actually the save index)
 *
 * Game code for version detection is at section 0 data offset 0x00AC:
 *   AXVE = Ruby, AXPE = Sapphire, BPEE = Emerald, BPRE = FireRed, BPGE = LeafGreen
 */

export type Gen3GameCode = 'AXVE' | 'AXPE' | 'BPEE' | 'BPRE' | 'BPGE';
export type Gen3Version = 'Ruby' | 'Sapphire' | 'Emerald' | 'FireRed' | 'LeafGreen';

export const GAME_CODE_MAP: Record<string, Gen3Version> = {
  'AXVE': 'Ruby',
  'AXPE': 'Sapphire',
  'BPEE': 'Emerald',
  'BPRE': 'FireRed',
  'BPGE': 'LeafGreen',
};

// ─── Footer offsets (within a 4KB section) ───
export const SECTION_SIZE = 0x1000;
export const SECTION_COUNT = 14;
export const SECTION_DATA_SIZE = 0xF80; // 3968 bytes of data per section
export const FOOTER_SECTION_ID = 0xFF4;
export const FOOTER_CHECKSUM = 0xFF8;
export const FOOTER_SAVE_INDEX = 0xFFC;
export const HALF_SIZE = SECTION_SIZE * SECTION_COUNT; // 0xE000

// ─── Game code offset (section 0 data) ───
export const GAME_CODE_OFFSET = 0x00AC;

// ─── Section 0 (Trainer Info) offsets ───
// RS/Emerald and FRLG have different layouts!
export interface Gen3TrainerOffsets {
  trainerName: number;    // 7 bytes + 0xFF terminator
  trainerGender: number;  // 1 byte (0=Male, 1=Female)
  playTimeHours: number;  // u16 LE
  playTimeMinutes: number; // u8
  playTimeSeconds: number; // u8
  securityKey: number;    // u32 LE (used for money encryption)
  money: number;          // u32 LE (XOR-encrypted with security key)
  coins: number;          // u16 LE
  badges: number;         // varies (RS: Hoenn 8 bits; FRLG: Kanto 8 bits)
  pokedexOwned: number;   // 64 bytes (512 bits)
  pokedexSeen: number;    // 64 bytes
  pokedexNationalDex: number; // 1 byte (National Dex unlock flag)
  options: number;        // 1 byte
}

// ─── Section 1 (Team/Items) offsets ───
export interface Gen3Section1Offsets {
  partyCount: number;     // 1 byte
  partyData: number;      // 6 × 100 bytes (party format)
  bagItems: number;       // count(u8) + N × (u16 id + u16 qty)
  bagItemsCount: number;  // offset of the count byte
  bagItemsMax: number;    // max items
  keyItems: number;
  keyItemsCount: number;
  keyItemsMax: number;
  balls: number;
  ballsCount: number;
  ballsMax: number;
  tmHm: number;           // 58 bytes (50 TMs + 8 HMs, direct array)
  berries: number;        // RS/Emerald only (46 entries)
  berriesCount: number;
}

// ─── Section 4 (PC Items) offsets ───
export interface Gen3Section4Offsets {
  pcItemsCount: number;
  pcItemsData: number;
  pcItemsMax: number;
  currentBoxId: number;   // 1 byte
  boxNames: number;       // 14 × 9 bytes (8 chars + terminator)
}

// ─── PC Box layout (sections 5-13) ───
// Each box = 30 slots × 80 bytes = 2400 bytes per box
// 14 boxes total, distributed across sections 5-13
export const BOX_MON_SIZE = 80;       // stored format (encrypted)
export const BOX_SLOTS = 30;          // per box
export const BOX_COUNT = 14;
export const PC_DATA_SIZE = BOX_MON_SIZE * BOX_SLOTS * BOX_COUNT; // 33600 bytes

export interface Gen3OffsetsConfig {
  trainer: Gen3TrainerOffsets;
  section1: Gen3Section1Offsets;
  section4: Gen3Section4Offsets;
  isRS: boolean;   // Ruby/Sapphire layout
  isFRLG: boolean; // FireRed/LeafGreen layout
  isEmerald: boolean;
}

// ─── RS/Emerald Trainer Offsets ───
const RS_TRAINER: Gen3TrainerOffsets = {
  trainerName: 0x10,
  trainerGender: 0x18,
  playTimeHours: 0x0C,
  playTimeMinutes: 0x0E,
  playTimeSeconds: 0x0F,
  securityKey: 0x04,
  money: 0x20,
  coins: 0x24,
  badges: 0x28,
  pokedexOwned: 0x30,
  pokedexSeen: 0x44,
  pokedexNationalDex: 0x19C,
  options: 0x1C,
};

// ─── FRLG Trainer Offsets ───
const FRLG_TRAINER: Gen3TrainerOffsets = {
  trainerName: 0x04,
  trainerGender: 0x08,
  playTimeHours: 0x0E,
  playTimeMinutes: 0x10,
  playTimeSeconds: 0x11,
  securityKey: 0x0F20,
  money: 0x0F20 + 4,
  coins: 0x0F20 + 8,
  badges: 0x0F20 + 0x0C,
  pokedexOwned: 0x0F20 + 0x10,
  pokedexSeen: 0x0F20 + 0x54,
  pokedexNationalDex: 0x0F20 + 0x98,
  options: 0x0C,
};

// ─── RS/Emerald Section 1 Offsets ───
const RS_SECTION1: Gen3Section1Offsets = {
  partyCount: 0x234,
  partyData: 0x238,
  bagItems: 0x000,
  bagItemsCount: 0x000,
  bagItemsMax: 20,
  keyItems: 0x000,
  keyItemsCount: 0x000,
  keyItemsMax: 20,
  balls: 0x000,
  ballsCount: 0x000,
  ballsMax: 16,
  tmHm: 0x000,
  berries: 0x000,
  berriesCount: 0x000,
};

// ─── FRLG Section 1 Offsets ───
const FRLG_SECTION1: Gen3Section1Offsets = {
  partyCount: 0x034,
  partyData: 0x038,
  bagItems: 0x000,
  bagItemsCount: 0x000,
  bagItemsMax: 42,
  keyItems: 0x000,
  keyItemsCount: 0x000,
  keyItemsMax: 30,
  balls: 0x000,
  ballsCount: 0x000,
  ballsMax: 13,
  tmHm: 0x000,
  berries: 0x000,
  berriesCount: 0x000,
};

const RS_SECTION4: Gen3Section4Offsets = {
  pcItemsCount: 0x000,
  pcItemsData: 0x004,
  pcItemsMax: 30,
  currentBoxId: 0x000,
  boxNames: 0x000,
};

const FRLG_SECTION4: Gen3Section4Offsets = {
  pcItemsCount: 0x000,
  pcItemsData: 0x004,
  pcItemsMax: 30,
  currentBoxId: 0x000,
  boxNames: 0x000,
};

export function getGen3Offsets(version: string): Gen3OffsetsConfig {
  const isFRLG = version === 'FireRed' || version === 'LeafGreen';
  const isEmerald = version === 'Emerald';
  const isRS = !isFRLG && !isEmerald;

  if (isFRLG) {
    return {
      trainer: FRLG_TRAINER,
      section1: FRLG_SECTION1,
      section4: FRLG_SECTION4,
      isRS: false,
      isFRLG: true,
      isEmerald: false,
    };
  }
  // RS and Emerald share the same layout (with minor Emerald differences)
  return {
    trainer: RS_TRAINER,
    section1: RS_SECTION1,
    section4: RS_SECTION4,
    isRS,
    isFRLG: false,
    isEmerald,
  };
}

/** Read the 4-byte game code from section 0 at offset 0x00AC. */
export function readGameCode(data: Uint8Array, sec0Start: number): string {
  return String.fromCharCode(
    data[sec0Start + GAME_CODE_OFFSET]!,
    data[sec0Start + GAME_CODE_OFFSET + 1]!,
    data[sec0Start + GAME_CODE_OFFSET + 2]!,
    data[sec0Start + GAME_CODE_OFFSET + 3]!,
  );
}

/** Compute the Gen 3 section checksum (additive sum of u16 words over data region). */
export function computeSectionChecksum(buffer: Uint8Array, sectionStart: number): number {
  let sum = 0;
  for (let i = 0; i < SECTION_DATA_SIZE; i += 2) {
    sum = (sum + (buffer[sectionStart + i]! | (buffer[sectionStart + i + 1]! << 8))) & 0xFFFF;
  }
  return sum;
}

/** Detect which half has the higher save index (the active half). */
export function detectActiveHalf(buffer: Uint8Array): number {
  // Save index is at section footer offset 0xFFC (u32 LE) for section 0 in each half.
  // Half 0: section 0 footer at offset FOOTER_SAVE_INDEX = 0xFFC
  // Half 1: section 0 footer at offset HALF_SIZE + FOOTER_SAVE_INDEX
  const idx0 = buffer[FOOTER_SAVE_INDEX]! | (buffer[FOOTER_SAVE_INDEX + 1]! << 8);
  const idx1Offset = HALF_SIZE + FOOTER_SAVE_INDEX;
  const idx1 = buffer.length > idx1Offset + 1
    ? (buffer[idx1Offset]! | (buffer[idx1Offset + 1]! << 8))
    : -1;
  return idx1 > idx0 ? HALF_SIZE : 0;
}

/** Read a section's ID from its footer. */
export function readSectionId(buffer: Uint8Array, halfStart: number, slot: number): number {
  const footerOffset = halfStart + slot * SECTION_SIZE + FOOTER_SECTION_ID;
  return buffer[footerOffset]! | (buffer[footerOffset + 1]! << 8);
}

/** Find a section by its ID within the active half. */
export function findSection(buffer: Uint8Array, halfStart: number, sectionId: number): { slot: number; dataOffset: number } | null {
  for (let slot = 0; slot < SECTION_COUNT; slot++) {
    const id = readSectionId(buffer, halfStart, slot);
    if (id === sectionId) {
      return { slot, dataOffset: halfStart + slot * SECTION_SIZE };
    }
  }
  return null;
}
