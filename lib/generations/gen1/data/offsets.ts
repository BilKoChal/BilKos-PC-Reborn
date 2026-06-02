/**
 * Gen 1 Save File Offset Configuration
 *
 * All byte offsets are centralized here to support:
 * - International vs Japanese region differences
 *
 * Design: A factory function returns the correct offset map
 * based on region, making parser/writer code region-agnostic.
 *
 * Mirrors the Gen 2 offset system (data/offsets.ts with factory pattern,
 * TypeScript interfaces, region configs).
 *
 * Offsets sourced from PKHeX SAV1Offsets.cs and SAV1.cs
 */

// ── Region Type ──

export type Gen1Region = 'international' | 'japanese';

// ── Region Configuration Interface ──

export interface Gen1RegionConfig {
  stringLength: number;       // 11 (INT) or 6 (JPN)
  boxSlotCount: number;       // 20 (INT) or 30 (JPN)
  boxCount: number;           // 12 (INT) or 8 (JPN)
  boxSplitIndex: number;      // 6 (INT) or 4 (JPN)
  maxTrainerNameLen: number;  // 7 (INT) or 5 (JPN)
  maxNicknameLen: number;     // 10 (INT) or 5 (JPN)
  saveSize: number;           // 0x8000 (32 KB) for both INT and JPN Gen 1 SRAM
}

// ── Offset Configuration Interface ──

export interface Gen1OffsetsConfig extends Gen1RegionConfig {
  // ── SRAM Bank 1 Offsets ──
  PLAYER_NAME: number;
  RIVAL_NAME: number;
  PLAYER_ID: number;
  MONEY: number;
  CASINO_COINS: number;
  BADGES: number;
  PLAY_TIME: number;
  OPTIONS: number;
  PIKACHU_FRIENDSHIP: number;
  PLAYER_STARTER: number;
  RIVAL_STARTER: number;
  POKEDEX_OWNED: number;
  POKEDEX_SEEN: number;
  ITEM_BAG: number;
  PC_ITEMS: number;
  CURRENT_BOX_ID: number;
  PARTY_DATA: number;
  PARTY_MON_SIZE: number;    // 44
  BOX_MON_SIZE: number;      // 33
  CURRENT_BOX_DATA: number;
  CHECKSUM: number;
  PC_BANK_2_START: number;   // 0x4000
  PC_BANK_3_START: number;   // 0x6000
  BOX_STRUCT_SIZE: number;
  MISSABLE_OBJECTS: number;
  DAYCARE_IN_USE: number;
  DAYCARE_NAME: number;
  DAYCARE_OT: number;
  DAYCARE_MON: number;
  PIKACHU_SURF_RECORD: number;
  STR_LEN: number;
  BOX_MON_COUNT: number;
  PARTY_OT_NAMES: number;
  PARTY_NICKNAMES: number;
  CURRENT_MAP: number;
  Y_COORD: number;
  X_COORD: number;
  LAST_MAP: number;
  WARPED_FROM_MAP: number;
  HOF_DATA: number;
}

// ── Region Config Constants ──

const INT_REGION_CONFIG: Gen1RegionConfig = {
  stringLength: 11,
  boxSlotCount: 20,
  boxCount: 12,
  boxSplitIndex: 6,
  maxTrainerNameLen: 7,
  maxNicknameLen: 10,
  saveSize: 0x8000,
};

const JPN_REGION_CONFIG: Gen1RegionConfig = {
  stringLength: 6,
  boxSlotCount: 30,
  boxCount: 8,
  boxSplitIndex: 4,
  maxTrainerNameLen: 5,
  maxNicknameLen: 5,
  // BUG FIX (TODO 2.8): Japanese Gen 1 SRAM (.sav) is 32 KB (0x8000), exactly
  // like International — the prior 0x10000 (64 KB) was factually wrong and
  // unused. Region is distinguished by DATA LAYOUT (party offsets), not size;
  // see detectGen1Region below.
  saveSize: 0x8000,
};

// ── Region-Specific Offset Tables ──

const INT_OFFSETS = {
  PLAYER_NAME:     0x2598,
  RIVAL_NAME:      0x25F6,
  PLAYER_ID:       0x2605,
  MONEY:           0x25F3,
  CASINO_COINS:    0x2850,
  BADGES:          0x2602,
  PLAY_TIME:       0x2CED,
  OPTIONS:         0x2601,
  PIKACHU_FRIENDSHIP: 0x271C,
  PLAYER_STARTER:  0x29C3,
  RIVAL_STARTER:   0x29C1,
  POKEDEX_OWNED:   0x25A3,
  POKEDEX_SEEN:    0x25B6,
  ITEM_BAG:        0x25C9,
  PC_ITEMS:        0x27E6,
  CURRENT_BOX_ID:  0x284C,
  PARTY_DATA:      0x2F2C,
  PARTY_MON_SIZE:  44,
  BOX_MON_SIZE:    33,
  CURRENT_BOX_DATA:0x30C0,
  CHECKSUM:        0x3523,
  PC_BANK_2_START: 0x4000,
  PC_BANK_3_START: 0x6000,
  BOX_STRUCT_SIZE: 0x462,
  MISSABLE_OBJECTS: 0x2852,
  DAYCARE_IN_USE:  0x2CF4,
  DAYCARE_NAME:    0x2CF5,
  DAYCARE_OT:      0x2D00,
  DAYCARE_MON:     0x2D0B,
  PIKACHU_SURF_RECORD: 0x2741, // Yellow Only (Surfing Pikachu mini-game high score)
  STR_LEN:         11,
  BOX_MON_COUNT:   20,
  PARTY_OT_NAMES:  0x303C,
  PARTY_NICKNAMES: 0x307E,
  CURRENT_MAP:     0x260A,
  Y_COORD:         0x260D,
  X_COORD:         0x260E,
  LAST_MAP:        0x2611,
  WARPED_FROM_MAP: 0x29E8,
  HOF_DATA:        0x0598,
};

const JPN_OFFSETS = {
  PLAYER_NAME:     0x2598,
  RIVAL_NAME:      0x25F3,
  PLAYER_ID:       0x2601,
  MONEY:           0x25EF,
  CASINO_COINS:    0x2850,
  BADGES:          0x25FE,
  PLAY_TIME:       0x2CED,
  OPTIONS:         0x25FD,
  PIKACHU_FRIENDSHIP: 0x271C,
  PLAYER_STARTER:  0x29C3,
  RIVAL_STARTER:   0x29C1,
  POKEDEX_OWNED:   0x25A3,
  POKEDEX_SEEN:    0x25B6,
  ITEM_BAG:        0x25C9,
  PC_ITEMS:        0x27E6,
  CURRENT_BOX_ID:  0x284C,
  PARTY_DATA:      0x2ED5,
  PARTY_MON_SIZE:  44,
  BOX_MON_SIZE:    33,
  CURRENT_BOX_DATA:0x307C,
  CHECKSUM:        0x3523,
  PC_BANK_2_START: 0x4000,
  PC_BANK_3_START: 0x6000,
  BOX_STRUCT_SIZE: 0x566,
  MISSABLE_OBJECTS: 0x2852,
  DAYCARE_IN_USE:  0x2CF4,
  DAYCARE_NAME:    0x2CF5,
  DAYCARE_OT:      0x2CFB,
  DAYCARE_MON:     0x2D06,
  PIKACHU_SURF_RECORD: 0x2741, // Yellow Only (Surfing Pikachu mini-game high score)
  STR_LEN:         6,
  BOX_MON_COUNT:   30,
  PARTY_OT_NAMES:  0x302D,
  PARTY_NICKNAMES: 0x3053,
  CURRENT_MAP:     0x260A,
  Y_COORD:         0x260D,
  X_COORD:         0x260E,
  LAST_MAP:        0x2611,
  WARPED_FROM_MAP: 0x29E8,
  HOF_DATA:        0x0598,
};

// ── Factory Function ──

/**
 * Returns the correct offset configuration for a given Gen 1 region.
 * This is the single source of truth for all byte offsets in Gen 1 parsing/writing.
 */
export function getGen1Offsets(region: Gen1Region = 'international'): Gen1OffsetsConfig {
  const regionConfig = region === 'japanese' ? JPN_REGION_CONFIG : INT_REGION_CONFIG;
  const offsets = region === 'japanese' ? JPN_OFFSETS : INT_OFFSETS;
  return { ...regionConfig, ...offsets };
}

// ── Region Detection ──

/**
 * Detects the region of a Gen 1 save file based on its data layout.
 *
 * Japanese and International Gen 1 SRAM are BOTH 32 KB (0x8000) — they differ
 * only in internal layout (Japanese uses shorter 6-char strings, which shifts
 * party/box offsets). So region is detected by checking which region's party
 * structure is valid, NOT by file size. (TODO 2.8: a previous version keyed off
 * a non-existent 64 KB size; that branch was dead because detection only ever
 * accepts 32 KB files.) Defaults to International when ambiguous.
 */
export function detectGen1Region(buffer: Uint8Array): Gen1Region {
  // Check whether the International or Japanese party offset holds a valid party.
  const intPartyCount = buffer[0x2F2C]!;
  const intFirstSpecies = buffer[0x2F2D]!;
  const jpnPartyCount = buffer[0x2ED5]!;
  const jpnFirstSpecies = buffer[0x2ED6]!;
  const intPartyValid = intPartyCount >= 1 && intPartyCount <= 6 && intFirstSpecies !== 0xFF && intFirstSpecies !== 0x00;
  const jpnPartyValid = jpnPartyCount >= 1 && jpnPartyCount <= 6 && jpnFirstSpecies !== 0xFF && jpnFirstSpecies !== 0x00;
  if (jpnPartyValid && !intPartyValid) return 'japanese';
  return 'international';
}

// ── Internal Index to National Dex ID ──
// Based on pokered constants/pokemon_constants.asm
export const GEN1_INTERNAL_TO_DEX = [
    0,   // 0 (MissingNo)
    112, // 1: Rhydon
    115, // 2: Kangaskhan
    32,  // 3: NidoranM
    35,  // 4: Clefairy
    21,  // 5: Spearow
    100, // 6: Voltorb
    34,  // 7: Nidoking
    80,  // 8: Slowbro
    2,   // 9: Ivysaur
    103, // 10: Exeggutor
    108, // 11: Lickitung
    102, // 12: Exeggcute
    88,  // 13: Grimer
    94,  // 14: Gengar
    29,  // 15: NidoranF
    31,  // 16: Nidoqueen
    104, // 17: Cubone
    111, // 18: Rhyhorn
    131, // 19: Lapras
    59,  // 20: Arcanine
    151, // 21: Mew
    130, // 22: Gyarados
    90,  // 23: Shellder
    72,  // 24: Tentacool
    92,  // 25: Gastly
    123, // 26: Scyther
    120, // 27: Staryu
    9,   // 28: Blastoise
    127, // 29: Pinsir
    114, // 30: Tangela
    0,   // 31: MissingNo
    0,   // 32: MissingNo
    58,  // 33: Growlithe
    95,  // 34: Onix
    22,  // 35: Fearow
    16,  // 36: Pidgey
    79,  // 37: Slowpoke
    64,  // 38: Kadabra
    75,  // 39: Graveler
    113, // 40: Chansey
    67,  // 41: Machoke
    122, // 42: Mr. Mime
    106, // 43: Hitmonlee
    107, // 44: Hitmonchan
    24,  // 45: Arbok
    47,  // 46: Parasect
    54,  // 47: Psyduck
    96,  // 48: Drowzee
    76,  // 49: Golem
    0,   // 50: MissingNo
    126, // 51: Magmar
    0,   // 52: MissingNo
    125, // 53: Electabuzz
    82,  // 54: Magneton
    109, // 55: Koffing
    0,   // 56: MissingNo
    56,  // 57: Mankey
    86,  // 58: Seel
    50,  // 59: Diglett
    128, // 60: Tauros
    0,   // 61: MissingNo
    0,   // 62: MissingNo
    0,   // 63: MissingNo
    83,  // 64: Farfetch'd
    48,  // 65: Venonat
    149, // 66: Dragonite
    0,   // 67: MissingNo
    0,   // 68: MissingNo
    0,   // 69: MissingNo
    85,  // 70: Doduo
    60,  // 71: Poliwag
    124, // 72: Jynx
    146, // 73: Moltres
    144, // 74: Articuno
    145, // 75: Zapdos
    132, // 76: Ditto
    52,  // 77: Meowth
    98,  // 78: Krabby
    0,   // 79: MissingNo
    0,   // 80: MissingNo
    0,   // 81: MissingNo
    37,  // 82: Vulpix
    38,  // 83: Ninetales
    25,  // 84: Pikachu
    26,  // 85: Raichu
    0,   // 86: MissingNo
    0,   // 87: MissingNo
    147, // 88: Dratini
    148, // 89: Dragonair
    140, // 90: Kabuto
    141, // 91: Kabutops
    116, // 92: Horsea
    117, // 93: Seadra
    0,   // 94: MissingNo
    0,   // 95: MissingNo
    27,  // 96: Sandshrew
    28,  // 97: Sandslash
    138, // 98: Omanyte
    139, // 99: Omastar
    39,  // 100: Jigglypuff
    40,  // 101: Wigglytuff
    133, // 102: Eevee
    136, // 103: Flareon
    135, // 104: Jolteon
    134, // 105: Vaporeon
    66,  // 106: Machop
    41,  // 107: Zubat
    23,  // 108: Ekans
    46,  // 109: Paras
    61,  // 110: Poliwhirl
    62,  // 111: Poliwrath
    13,  // 112: Weedle
    14,  // 113: Kakuna
    15,  // 114: Beedrill
    0,   // 115: MissingNo
    84,  // 116: Dodrio
    57,  // 117: Primeape
    51,  // 118: Dugtrio
    49,  // 119: Venomoth
    87,  // 120: Dewgong
    0,   // 121: MissingNo
    0,   // 122: MissingNo
    10,  // 123: Caterpie
    11,  // 124: Metapod
    12,  // 125: Butterfree
    68,  // 126: Machamp
    0,   // 127: MissingNo
    55,  // 128: Golduck
    97,  // 129: Hypno
    42,  // 130: Golbat
    150, // 131: Mewtwo
    143, // 132: Snorlax
    129, // 133: Magikarp
    0,   // 134: MissingNo
    0,   // 135: MissingNo
    89,  // 136: Muk
    0,   // 137: MissingNo
    99,  // 138: Kingler
    91,  // 139: Cloyster
    0,   // 140: MissingNo
    101, // 141: Electrode
    36,  // 142: Clefable
    110, // 143: Weezing
    53,  // 144: Persian
    105, // 145: Marowak
    0,   // 146: MissingNo
    93,  // 147: Haunter
    63,  // 148: Abra
    65,  // 149: Alakazam
    17,  // 150: Pidgeotto
    18,  // 151: Pidgeot
    121, // 152: Starmie
    1,   // 153: Bulbasaur
    3,   // 154: Venusaur
    73,  // 155: Tentacruel
    0,   // 156: MissingNo
    118, // 157: Goldeen
    119, // 158: Seaking
    0,   // 159: MissingNo
    0,   // 160: MissingNo
    0,   // 161: MissingNo
    0,   // 162: MissingNo
    77,  // 163: Ponyta
    78,  // 164: Rapidash
    19,  // 165: Rattata
    20,  // 166: Raticate
    33,  // 167: Nidorino
    30,  // 168: Nidorina
    74,  // 169: Geodude
    137, // 170: Porygon
    142, // 171: Aerodactyl
    0,   // 172: MissingNo
    81,  // 173: Magnemite
    0,   // 174: MissingNo
    0,   // 175: MissingNo
    4,   // 176: Charmander
    7,   // 177: Squirtle
    5,   // 178: Charmeleon
    8,   // 179: Wartortle
    6,   // 180: Charizard
    0,   // 181: MissingNo
    0,   // 182: MissingNo
    0,   // 183: MissingNo
    0,   // 184: MissingNo
    43,  // 185: Oddish
    44,  // 186: Gloom
    45,  // 187: Vileplume
    69,  // 188: Bellsprout
    70,  // 189: Weepinbell
    71,  // 190: Victreebel
];

// ── National Dex → Gen 1 internal species ID (reverse of GEN1_INTERNAL_TO_DEX) ──
//
// TODO 4.4: this reverse map was previously rebuilt in three places
// (Gen1Adapter static field, gen1/writer.ts, crossGenConverter.ts). It is now
// derived once here, next to its source array, and imported everywhere.
// Gen 1 uses a different internal ordering than the National Dex (e.g. Rhydon
// is internal id 1), so this conversion is required for all save reads/writes.
export const GEN1_DEX_TO_INTERNAL: Record<number, number> = (() => {
  const map: Record<number, number> = {};
  GEN1_INTERNAL_TO_DEX.forEach((dex, internal) => {
    if (dex !== 0) map[dex] = internal;
  });
  return map;
})();

/**
 * Convert a National Dex ID to the Gen 1 internal species ID.
 * Falls back to the dex id itself when no mapping exists (defensive).
 */
export function getGen1InternalSpeciesId(dexId: number): number {
  return GEN1_DEX_TO_INTERNAL[dexId] ?? dexId;
}
