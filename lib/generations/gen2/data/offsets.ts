/**
 * Gen 2 Save File Offset Configuration
 *
 * All byte offsets are centralized here to support:
 * - Gold/Silver vs Crystal differences
 * - International vs Japanese vs Korean region differences
 *
 * Design: A factory function returns the correct offset map
 * based on (version, region), making parser/writer code
 * version-agnostic and region-agnostic.
 *
 * Offsets sourced from PKHeX SAV2Offsets.cs and SAV2.cs
 */

// ── Region Type ──

export type Gen2Region = 'international' | 'japanese' | 'korean';
export type Gen2Version = 'Gold' | 'Silver' | 'Crystal';

// ── Offset Configuration Interface ──

export interface Gen2OffsetsConfig {
  // ── Regional Config ──
  stringLength: number;        // 11 (INT/KOR) or 6 (JPN)
  boxCount: number;            // 14 (INT/KOR) or 9 (JPN)
  boxSlotCount: number;        // 20 (INT/KOR) or 30 (JPN)
  boxSplitIndex: number;       // 7 (INT/KOR) or 6 (JPN)
  maxTrainerNameLen: number;   // 7 (INT/KOR) or 5 (JPN/KOR)
  maxNicknameLen: number;      // 10 (INT/KOR) or 5 (JPN/KOR)
  saveSize: number;            // 0x8000 (INT/KOR) or 0x10000 (JPN)
  boxNameEntrySize: number;   // 9 (INT/JPN) or 17 (KOR)

  // ── Computed Sizes ──
  sizeBoxList: number;         // ((stringLength*2) + 32 + 1) * boxSlotCount + 2
  sizePartyList: number;       // ((stringLength*2) + 48 + 1) * 6 + 2
  sizeStored: number;          // 32 (Gen2 Pokemon body, no party stats)

  // ── Item Pouch Sizes ──
  pouchTmHmSlots: number;     // 57
  pouchItemSlots: number;     // 20
  pouchKeySlots: number;      // 26
  pouchBallSlots: number;     // 12
  pouchPcSlots: number;       // 50

  // ── SRAM Bank 1 Offsets ──
  options: number;
  trainer1: number;            // TID (2 bytes BE) + OT Name start
  rivalName: number;
  daylightSavings: number;
  timePlayed: number;          // 4 bytes: hours(2 BE) + min + sec
  palette: number;
  money: number;               // 3 bytes BCD
  coins: number;               // 2 bytes BE
  johtoBadges: number;         // 2 bytes

  // ── Item Pockets ──
  tmHmPouch: number;
  itemPouchCount: number;      // Count byte for items pocket
  itemPouchStart: number;
  keyItemPouchCount: number;
  keyItemPouchStart: number;
  ballPouchCount: number;
  ballPouchStart: number;
  pcItemPouchCount: number;
  pcItemPouchStart: number;

  // ── Story / Progress ──
  currentBoxIndex: number;
  eventFlags: number;
  eventWork: number;
  boxNames: number;

  // ── Pokemon Data ──
  otherCurrentBox: number;     // Offset for "other current box" reference
  party: number;
  pokedexCaught: number;
  pokedexSeen: number;
  daycare: number;
  currentBoxCopy: number;

  // ── Checksum ──
  accumulatedChecksumEnd: number;
  checksum1: number;
  checksum2: number;

  // ── Crystal-Only (-1 for GS) ──
  gender: number;
  blueCardPoints: number;
  mysteryGiftUnlocked: number;
  mysteryGiftItem: number;
  gsBallEventPrimary: number;     // GS Ball event flag primary offset (-1 for GS)
  gsBallEventBackup: number;     // GS Ball event flag backup offset (-1 for GS)

  // ── Move Tutor Event Flag Indices (Crystal) ──
  // These are bit indices into the event flags array
  moveTutorFlagIndices: number[]; // Empty array for GS, [index1, index2, index3] for Crystal

  // ── RTC ──
  rtcFlags: number;
}

// ── Region Config Constants ──

const INT_REGION = {
  stringLength: 11,
  boxCount: 14,
  boxSlotCount: 20,
  boxSplitIndex: 7,
  maxTrainerNameLen: 7,
  maxNicknameLen: 10,
  saveSize: 0x8000,
  boxNameEntrySize: 9,
  pouchTmHmSlots: 57,
  pouchItemSlots: 20,
  pouchKeySlots: 26,
  pouchBallSlots: 12,
  pouchPcSlots: 50,
  sizeStored: 32,
};

const JPN_REGION = {
  stringLength: 6,
  boxCount: 9,
  boxSlotCount: 30,
  boxSplitIndex: 6,
  maxTrainerNameLen: 5,
  maxNicknameLen: 5,
  saveSize: 0x10000,
  boxNameEntrySize: 9,
  pouchTmHmSlots: 57,
  pouchItemSlots: 20,
  pouchKeySlots: 26,
  pouchBallSlots: 12,
  pouchPcSlots: 50,
  sizeStored: 32,
};

const KOR_REGION = {
  stringLength: 11,
  boxCount: 14,
  boxSlotCount: 20,
  boxSplitIndex: 7,
  maxTrainerNameLen: 5,
  maxNicknameLen: 5,
  saveSize: 0x8000,
  boxNameEntrySize: 17,
  pouchTmHmSlots: 57,
  pouchItemSlots: 20,
  pouchKeySlots: 26,
  pouchBallSlots: 12,
  pouchPcSlots: 50,
  sizeStored: 32,
};

// ── Computed Size Helper ──

function computeSizes(region: typeof INT_REGION) {
  const SIZE_2STORED = 32;
  const SIZE_2PARTY = 48;
  const sizeBoxList = (((region.stringLength * 2) + SIZE_2STORED + 1) * region.boxSlotCount) + 2;
  const sizePartyList = (((region.stringLength * 2) + SIZE_2PARTY + 1) * 6) + 2;
  return { sizeBoxList, sizePartyList };
}

// ── Version/Region Offset Tables ──

const INT_GS_OFFSETS = {
  rtcFlags: 0x0C60,
  options: 0x2000,
  trainer1: 0x2009,
  rivalName: 0x2021,
  daylightSavings: 0x2042,
  timePlayed: 0x2053,
  palette: 0x206B,
  money: 0x23DB,
  coins: 0x23E2,
  johtoBadges: 0x23E4,
  tmHmPouch: 0x23E6,
  itemPouchCount: 0x241E,
  itemPouchStart: 0x241F,
  keyItemPouchCount: 0x2448,
  keyItemPouchStart: 0x2449,
  ballPouchCount: 0x2463,
  ballPouchStart: 0x2464,
  pcItemPouchCount: 0x247D,
  pcItemPouchStart: 0x247E,
  currentBoxIndex: 0x2724,
  eventFlags: 0x261F,
  eventWork: 0x251F,
  boxNames: 0x2727,
  otherCurrentBox: 0x284C,
  party: 0x288A,
  pokedexCaught: 0x2A4C,
  pokedexSeen: 0x2A6C,
  daycare: 0x2AA8,
  currentBoxCopy: 0x2D6C,
  accumulatedChecksumEnd: 0x2D68,
  checksum1: 0x2D69,
  checksum2: 0x7E6D,
  gender: -1,
  blueCardPoints: -1,
  mysteryGiftUnlocked: -1,
  mysteryGiftItem: -1,
  gsBallEventPrimary: -1,
  gsBallEventBackup: -1,
  moveTutorFlagIndices: [],
};

const INT_CRYSTAL_OFFSETS = {
  rtcFlags: 0x0C60,
  options: 0x2000,
  trainer1: 0x2009,
  rivalName: 0x2021,
  daylightSavings: 0x2042,
  timePlayed: 0x2052,     // 1 byte earlier than GS!
  palette: 0x206A,
  money: 0x23DC,
  coins: 0x23E3,
  johtoBadges: 0x23E5,
  tmHmPouch: 0x23E7,
  itemPouchCount: 0x241F,
  itemPouchStart: 0x2420,
  keyItemPouchCount: 0x2449,
  keyItemPouchStart: 0x244A,
  ballPouchCount: 0x2464,
  ballPouchStart: 0x2465,
  pcItemPouchCount: 0x247E,
  pcItemPouchStart: 0x247F,
  currentBoxIndex: 0x2700,
  eventFlags: 0x2600,
  eventWork: 0x2500,
  boxNames: 0x2703,
  otherCurrentBox: 0x284C,
  party: 0x2865,
  pokedexCaught: 0x2A27,
  pokedexSeen: 0x2A47,
  daycare: 0x2A83,
  currentBoxCopy: 0x2D10,
  accumulatedChecksumEnd: 0x2B82,
  checksum1: 0x2D0D,
  checksum2: 0x1F0D,
  gender: 0x3E3D,
  blueCardPoints: 0x27D9,
  mysteryGiftUnlocked: 0xBE3,
  mysteryGiftItem: 0xBE4,
  gsBallEventPrimary: 0x3E3C,
  gsBallEventBackup: 0x3E44,
  moveTutorFlagIndices: [0x038, 0x039, 0x03A], // Crystal move tutor event flag indices
};

const JPN_GS_OFFSETS = {
  rtcFlags: 0x1000,
  options: 0x2000,
  trainer1: 0x2009,
  rivalName: 0x2017,
  daylightSavings: 0x2029,
  timePlayed: 0x2034,
  palette: 0x204C,
  money: 0x23BC,
  coins: 0x23C3,
  johtoBadges: 0x23C5,
  tmHmPouch: 0x23C7,
  itemPouchCount: 0x23FF,
  itemPouchStart: 0x2400,
  keyItemPouchCount: 0x2429,
  keyItemPouchStart: 0x242A,
  ballPouchCount: 0x2444,
  ballPouchStart: 0x2445,
  pcItemPouchCount: 0x245E,
  pcItemPouchStart: 0x245F,
  currentBoxIndex: 0x2705,
  eventFlags: 0x2600,
  eventWork: 0x2500,
  boxNames: 0x2708,
  otherCurrentBox: 0x2842,
  party: 0x283E,
  pokedexCaught: 0x29CE,
  pokedexSeen: 0x29EE,
  daycare: 0x2A2A,
  currentBoxCopy: 0x2D10,
  accumulatedChecksumEnd: 0x2C8B,
  checksum1: 0x2D0D,
  checksum2: 0x7F0D,
  gender: -1,
  blueCardPoints: -1,
  mysteryGiftUnlocked: -1,
  mysteryGiftItem: -1,
  gsBallEventPrimary: -1,
  gsBallEventBackup: -1,
  moveTutorFlagIndices: [],
};

const JPN_CRYSTAL_OFFSETS = {
  rtcFlags: 0x0C80,
  options: 0x2000,
  trainer1: 0x2009,
  rivalName: 0x2017,
  daylightSavings: 0x2029,
  timePlayed: 0x2034,
  palette: 0x204C,
  money: 0x23BE,
  coins: 0x23C5,
  johtoBadges: 0x23C7,
  tmHmPouch: 0x23C9,
  itemPouchCount: 0x2401,
  itemPouchStart: 0x2402,
  keyItemPouchCount: 0x242B,
  keyItemPouchStart: 0x242C,
  ballPouchCount: 0x2446,
  ballPouchStart: 0x2447,
  pcItemPouchCount: 0x2460,
  pcItemPouchStart: 0x2461,
  currentBoxIndex: 0x26E2,
  eventFlags: 0x25E2,
  eventWork: 0x24E2,
  boxNames: 0x26E5,
  otherCurrentBox: 0x2842,
  party: 0x281A,
  pokedexCaught: 0x29AA,
  pokedexSeen: 0x29CA,
  daycare: 0x2A06,
  currentBoxCopy: 0x2D10,
  accumulatedChecksumEnd: 0x2AE2,
  checksum1: 0x2D0D,
  checksum2: 0x7F0D,
  gender: 0x8000,
  blueCardPoints: 0x278E,
  mysteryGiftUnlocked: 0xB51,
  mysteryGiftItem: 0xB52,
  gsBallEventPrimary: 0xA000,
  gsBallEventBackup: 0xA083,
  moveTutorFlagIndices: [0x038, 0x039, 0x03A], // Crystal move tutor event flag indices
};

const KOR_GS_OFFSETS = {
  rtcFlags: 0x1060,
  options: 0x2000,
  trainer1: 0x2009,
  rivalName: 0x2021,
  daylightSavings: 0x2042,
  timePlayed: 0x204D,
  palette: 0x2065,
  money: 0x23D3,
  coins: 0x23DA,
  johtoBadges: 0x23DC,
  tmHmPouch: 0x23DE,
  itemPouchCount: 0x2416,
  itemPouchStart: 0x2417,
  keyItemPouchCount: 0x2440,
  keyItemPouchStart: 0x2441,
  ballPouchCount: 0x245B,
  ballPouchStart: 0x245C,
  pcItemPouchCount: 0x2475,
  pcItemPouchStart: 0x2476,
  currentBoxIndex: 0x26FC,
  eventFlags: 0x25F7,
  eventWork: 0x24F7,
  boxNames: 0x26FF,
  otherCurrentBox: 0x284C,
  party: 0x28CC,
  pokedexCaught: 0x2A8E,
  pokedexSeen: 0x2AAE,
  daycare: 0x2AEA,
  currentBoxCopy: 0x2DAE,
  accumulatedChecksumEnd: 0x2DAA,
  checksum1: 0x2DAB,
  checksum2: 0x7E6B,
  gender: -1,
  blueCardPoints: -1,
  mysteryGiftUnlocked: -1,
  mysteryGiftItem: -1,
  gsBallEventPrimary: -1,
  gsBallEventBackup: -1,
  moveTutorFlagIndices: [],
};

// ── Factory Function ──

/**
 * Returns the correct offset configuration for a given Gen 2 version and region.
 * This is the single source of truth for all byte offsets in Gen 2 parsing/writing.
 */
export function getGen2Offsets(
  version: Gen2Version,
  region: Gen2Region
): Gen2OffsetsConfig {
  const isCrystal = version === 'Crystal';
  const isJapanese = region === 'japanese';
  const isKorean = region === 'korean';

  // Select region config
  const regionConfig = isJapanese ? JPN_REGION : isKorean ? KOR_REGION : INT_REGION;

  // Compute sizes based on region
  const sizes = computeSizes(regionConfig);

  // Select version-specific offsets
  let offsets;
  if (isJapanese) {
    offsets = isCrystal ? JPN_CRYSTAL_OFFSETS : JPN_GS_OFFSETS;
  } else if (isKorean) {
    offsets = KOR_GS_OFFSETS; // No Korean Crystal exists
  } else {
    offsets = isCrystal ? INT_CRYSTAL_OFFSETS : INT_GS_OFFSETS;
  }

  return {
    ...regionConfig,
    ...sizes,
    ...offsets,
  };
}

// ── Box Offset Calculation ──

/**
 * Calculates the byte offset for a given box index in the save file.
 * Boxes are stored in SRAM banks 2 (0x4000) and 3 (0x6000).
 * Each box occupies (sizeBoxList + 2) bytes: the box data plus a 2-byte checksum.
 *
 * This fixes the critical "box stride bug" where the +2 per-box checksum
 * was missing, causing boxes 2+ to be read from wrong offsets.
 */
export function getBoxOffset(boxIdx: number, offsets: Gen2OffsetsConfig): number {
  const boxStride = offsets.sizeBoxList + 2; // Include 2-byte trailing checksum
  return boxIdx < offsets.boxSplitIndex
    ? 0x4000 + (boxIdx * boxStride)
    : 0x6000 + ((boxIdx - offsets.boxSplitIndex) * boxStride);
}

// ── Party Offset Calculation ──

/**
 * Calculates sub-offsets for party Pokemon data.
 * The party list is laid out as:
 *   [count:1] [species:6+1] [bodies:6*48] [otNames:6*strLen] [nicknames:6*strLen] [terminator:1]
 */
export function getPartyOffsets(partyStart: number, offsets: Gen2OffsetsConfig) {
  const strLen = offsets.stringLength;
  const count = partyStart;
  const speciesList = partyStart + 1;
  const bodiesStart = partyStart + 1 + (6 + 1); // count + species(6) + 0xFF terminator
  const otNamesStart = bodiesStart + (6 * 48);
  const nicknamesStart = otNamesStart + (6 * strLen);

  return { count, speciesList, bodiesStart, otNamesStart, nicknamesStart };
}

// ── Box Checksum ──

/**
 * Computes the 16-bit checksum for a single PC box.
 * The checksum covers sizeBoxList bytes starting from boxOffset.
 */
export function computeBoxChecksum(data: Uint8Array, boxOffset: number, sizeBoxList: number): number {
  let sum = 0;
  for (let i = 0; i < sizeBoxList; i++) {
    sum += data[boxOffset + i]!;
  }
  return sum & 0xFFFF;
}

// ── Region Detection ──

/**
 * Detects the region of a Gen 2 save file based on its size and checksum patterns.
 *
 * Detection logic:
 * 1. Japanese saves are 64KB (0x10000), International/Korean are 32KB (0x8000)
 * 2. Korean saves have different checksum ranges and specific offsets
 * 3. Default to International if no specific region is detected
 */
export function detectGen2Region(data: Uint8Array): Gen2Region {
  // Japanese saves are 64KB
  if (data.length >= 0x10000) return 'japanese';

  // Distinguish Korean from International using checksum validation
  // Korean checksum covers different ranges than International
  const korChecksumEnd = 0x2DAA;
  const intGsChecksumEnd = 0x2D68;
  const intCryChecksumEnd = 0x2B82;

  // Try Korean checksum first
  const korSum = calculateRegionChecksum(data, 0x2009, korChecksumEnd);
  const korStored = data[0x2DAB]! | (data[0x2DAC]! << 8);

  if (korSum === korStored && korStored !== 0) return 'korean';

  // Try International GS checksum
  const intGsSum = calculateRegionChecksum(data, 0x2009, intGsChecksumEnd);
  const intGsStored = data[0x2D69]! | (data[0x2D6A]! << 8);

  if (intGsSum === intGsStored && intGsStored !== 0) return 'international';

  // Try International Crystal checksum
  const intCrySum = calculateRegionChecksum(data, 0x2009, intCryChecksumEnd);
  const intCryStored = data[0x2D0D]! | (data[0x2D0E]! << 8);

  if (intCrySum === intCryStored && intCryStored !== 0) return 'international';

  // Default to international if no specific region detected
  return 'international';
}

/**
 * Simple 16-bit additive checksum over a range (same algorithm as the main checksum).
 */
function calculateRegionChecksum(data: Uint8Array, start: number, end: number): number {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += data[i]!;
  }
  return sum & 0xFFFF;
}
