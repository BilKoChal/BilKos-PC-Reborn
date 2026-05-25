import { ParsedSave, TrainerInfo, PokemonStats, Item, GameOptions, MapData, Gen2Extension, Gen2SaveExtension, isGen2Extension, HallOfFameTeam, HallOfFamePokemon, Gen2TmHmEntry } from '../../parser/types';
import { getPokemonTypes, TYPE_MAP } from '../gen1/data/pokemonTypes';
import { 
  getUInt16BigEndian, 
  getUInt24BigEndian, 
  parseBCD, 
  countSetBits, 
  decodeStatus 
} from '../../utils/byteHelpers';
import { decodeText } from '../../utils/textDecoder';
import { 
  GEN2_POKEMON_NAMES, 
  GEN2_MOVES_LIST, 
  getGen2ItemName
} from './data/constants';
import { getGen2BaseStats } from './data/baseStats';
import { calculateGen2Stat } from './statCalculator';
import { 
  getGen2Offsets, 
  getBoxOffset, 
  detectGen2Region, 
  computeBoxChecksum,
  type Gen2OffsetsConfig, 
  type Gen2Region, 
  type Gen2Version 
} from './data/offsets';

// ============================================================================
// Phase 3: Crystal-Specific Parsing Utilities
// ============================================================================

/**
 * Parse CaughtData from a Crystal Pokemon's struct bytes 0x1D-0x1E.
 *
 * The CaughtData is a 16-bit value present only in Crystal saves that records
 * the circumstances under which a Pokemon was obtained. It encodes four pieces
 * of information in a packed bitfield:
 *
 *   Bit 15-14: Met Time of Day (0=Morning, 1=Day, 2=Night, 3=Unused)
 *   Bit 13:    Unused
 *   Bit 12-8:  Met Level (0-63, the level at which the Pokemon was caught)
 *   Bit 7:     OT Gender (0=Male, 1=Female — the original trainer's gender)
 *   Bit 6-0:   Met Location (0-127, an index into the game's location table)
 *
 * When a Pokemon originates from Gold or Silver (traded into Crystal), the
 * CaughtData field is typically 0, which this function returns as null to
 * indicate that no met data is available. This distinction is important for
 * the UI because it allows displaying "Met at ???" for GS-origin Pokemon
 * rather than showing misleading default values.
 *
 * The met location IDs map to specific in-game locations. The complete mapping
 * is locale-dependent but common ones include:
 *   1=New Bark Town, 2=Cherrygrove City, 3=Violet City, etc.
 * The full list is available in PKHeX's Gen2 location tables.
 */
export function parseGen2CaughtData(caughtData: number): {
  timeOfDay: 'Morning' | 'Day' | 'Night' | 'Unknown';
  metLevel: number;
  otGender: 'Male' | 'Female';
  metLocation: number;
} | null {
  if (caughtData === 0) return null; // Not caught in Crystal (from GS trade)

  const tod = (caughtData >> 14) & 0x3;
  const metLevel = (caughtData >> 8) & 0x3F;
  const otGender = (caughtData >> 7) & 0x1;
  const metLocation = caughtData & 0x7F;

  return {
    timeOfDay: tod === 0 ? 'Morning' : tod === 1 ? 'Day' : tod === 2 ? 'Night' : 'Unknown',
    metLevel,
    otGender: otGender === 1 ? 'Female' : 'Male',
    metLocation,
  };
}

/**
 * Check whether the GS Ball mobile event is enabled in a Crystal save.
 *
 * The GS Ball event is a special mobile event from the Japanese Crystal version
 * that was later made available in the Virtual Console release of Crystal. When
 * enabled, the player can obtain the GS Ball from the Goldenrod Pokemon Center,
 * which leads to the Ilex Forest Celebi event. The flag is stored at two
 * locations in the save file (primary and backup), and the value 0x0B at the
 * primary location indicates the event is active. This function checks the
 * primary offset based on the detected region of the save.
 */
export function isGSBallEventEnabled(data: Uint8Array, offsets: Gen2OffsetsConfig): boolean {
  if (offsets.gsBallEventPrimary < 0) return false;
  if (offsets.gsBallEventPrimary >= data.length) return false;
  return data[offsets.gsBallEventPrimary] === 0x0B;
}

/**
 * Derive Move Tutor flags from the event flags array for Crystal saves.
 *
 * Crystal introduced three Move Tutors who teach special moves:
 *   - Tutor 1: Flamethrower (event flag index 0x038 for INT Crystal)
 *   - Tutor 2: Thunderbolt (event flag index 0x039)
 *   - Tutor 3: Ice Beam (event flag index 0x03A)
 *
 * When a Move Tutor has been used, the corresponding event flag is set.
 * This function reads those flags from the parsed event flags boolean array.
 * For Gold/Silver saves, there are no Move Tutors, so an empty array is returned.
 */
export function deriveMoveTutorFlags(eventFlags: boolean[], offsets: Gen2OffsetsConfig): boolean[] {
  if (offsets.moveTutorFlagIndices.length === 0) return [];
  return offsets.moveTutorFlagIndices.map(idx => idx < eventFlags.length ? eventFlags[idx]! : false);
}

// Checksum formula for Generation 2: 16-bit additive sum (stored little-endian)
export function calculateGen2Checksum(data: Uint8Array, start: number, end: number): number {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += data[i]!;
  }
  return sum & 0xFFFF;
}

// Parses Pokedex bitflags in Gen 2 saves
export function getPokedexFlagsGen2(data: Uint8Array, offset: number): boolean[] {
  const flags: boolean[] = [];
  // GSC Pokedex uses 32 bytes per flag set (256 bits).
  // This covers all 251 species with 5 bits of padding at the end.
  const POKEDEX_FLAG_BITS = 256;
  for (let i = 0; i < POKEDEX_FLAG_BITS; i++) {
    const byte = data[offset + Math.floor(i / 8)]!;
    flags.push(((byte >> (i % 8)) & 1) === 1);
  }
  return flags;
}

// Shiny determination using DV ranges from the roadmap
export function isGen2Shiny(atkIv: number, defIv: number, spdIv: number, spcIv: number): boolean {
  if (defIv !== 10 || spdIv !== 10 || spcIv !== 10) return false;
  return [2, 3, 6, 7, 10, 11, 14, 15].includes(atkIv);
}

// Estimate gender based on Attack DV (used if real gender ratio is unknown)
// GSC gender is determined by comparing the Attack DV against a species-specific
// threshold. The threshold depends on the species' gender ratio:
//   Genderless   → no gender
//   100% Male    → always Male
//   87.5% M/12.5% F → Female if atkIv ≤ 1
//   75% M/25% F  → Female if atkIv ≤ 3
//   50% M/50% F  → Female if atkIv ≤ 7
//   25% M/75% F  → Female if atkIv ≤ 11
//   100% Female  → always Female
//
// Data verified against Bulbapedia + PokeAPI (gender_rate field) for species 1–251.
export function getGen2Gender(speciesId: number, atkIv: number): string {
  // ── Genderless (21 species) ──
  const genderless = [
    81, 82, 100, 101, 120, 121, 132, 137, 144, 145, 146,
    150, 151, 201, 233, 243, 244, 245, 249, 250, 251
  ];
  if (genderless.includes(speciesId)) return 'Genderless';

  // ── Always Female / 0% Male (9 species) ──
  const alwaysFemale = [29, 30, 31, 113, 115, 124, 238, 241, 242];
  if (alwaysFemale.includes(speciesId)) return 'Female';

  // ── Always Male / 0% Female (8 species) ──
  const alwaysMale = [32, 33, 34, 106, 107, 128, 236, 237];
  if (alwaysMale.includes(speciesId)) return 'Male';

  // ── 87.5% Male / 12.5% Female → Female if atkIv ≤ 1 (32 species) ──
  const male87 = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,                     // Kanto starters
    133, 134, 135, 136, 196, 197,                     // Eevee family
    138, 139, 140, 141, 142,                           // Fossils
    143,                                               // Snorlax
    152, 153, 154, 155, 156, 157, 158, 159, 160,      // Johto starters
    175, 176                                           // Togepi line
  ];
  if (male87.includes(speciesId)) return atkIv <= 1 ? 'Female' : 'Male';

  // ── 75% Male / 25% Female → Female if atkIv ≤ 3 (12 species) ──
  const male75 = [
    58, 59,     // Growlithe line
    63, 64, 65, // Abra line
    66, 67, 68, // Machop line
    125, 126,   // Electabuzz, Magmar
    239, 240    // Elekid, Magby
  ];
  if (male75.includes(speciesId)) return atkIv <= 3 ? 'Female' : 'Male';

  // ── 25% Male / 75% Female → Female if atkIv ≤ 11 (11 species) ──
  const female75 = [
    35, 36,       // Clefairy line
    37, 38,       // Vulpix line
    39, 40,       // Jigglypuff line
    173, 174,     // Cleffa, Igglybuff
    209, 210,     // Snubbull line
    222           // Corsola
  ];
  if (female75.includes(speciesId)) return atkIv <= 11 ? 'Female' : 'Male';

  // ── Default: 50% Male / 50% Female → Female if atkIv ≤ 7 ──
  return atkIv <= 7 ? 'Female' : 'Male';
}

// Map 2-byte type IDs inside Gen 2 structure
export function getGen2TypeName(typeId: number): string {
  const GSC_TYPES: Record<number, string> = {
    0: "Normal", 1: "Fighting", 2: "Flying", 3: "Poison", 4: "Ground", 
    5: "Rock", 7: "Bug", 8: "Ghost", 9: "Steel", 20: "Fire", 21: "Water", 
    22: "Grass", 23: "Electric", 24: "Psychic", 25: "Ice", 26: "Dragon", 27: "Dark"
  };
  return GSC_TYPES[typeId] || "Normal";
}

export function parseGen2PokemonStruct(
  view: Uint8Array, 
  offset: number, 
  isParty: boolean, 
  nickname: string, 
  otName: string,
  nicknameRaw: Uint8Array, 
  otNameRaw: Uint8Array
): PokemonStats {
  // Bounds checking: ensure we have enough bytes to read the base structure
  const minBytes = isParty ? 48 : 32;
  if (offset + minBytes > view.length) {
    console.warn(`parseGen2PokemonStruct: Offset 0x${offset.toString(16)} + ${minBytes} exceeds buffer length ${view.length}. Returning empty Pokemon.`);
    return {
      speciesId: 0, dexId: 0, speciesName: '???', nickname: nickname || '???', isNicknamed: false,
      pid: 0, form: 0, originalTrainerName: otName || '???', originalTrainerId: 0, secretId: 0,
      originalTrainerGender: 'Male', level: 0, exp: 0, friendship: 0,
      hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0,
      type1: 0, type2: 0, type1Name: 'Normal', type2Name: 'Normal',
      status: 'OK', catchRate: 0, moves: ['-', '-', '-', '-'], moveIds: [0, 0, 0, 0],
      movePp: [0, 0, 0, 0], movePpUps: [0, 0, 0, 0], isParty, isEgg: false, isShiny: false,
      gender: 'Genderless', pokerus: 0, genExtension: null,
      iv: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      raw: new Uint8Array(0), startOffset: offset, nicknameRaw: nicknameRaw || new Uint8Array(0),
      otNameRaw: otNameRaw || new Uint8Array(0)
    };
  }

  const speciesId = view[offset]!;
  const dexId = speciesId; // Gen 2 species IDs match National Dex index (1-251)

  const heldItemId = view[offset + 0x01]!;
  const heldItemName = getGen2ItemName(heldItemId);

  const moveIds = [
    view[offset + 2]!,
    view[offset + 3]!,
    view[offset + 4]!,
    view[offset + 5]!
  ];
  const moves = moveIds.map(id => GEN2_MOVES_LIST[id] || "-");

  const originalTrainerId = getUInt16BigEndian(view, offset + 6);
  const exp = getUInt24BigEndian(view, offset + 8);

  const hpEv = getUInt16BigEndian(view, offset + 11);
  const atkEv = getUInt16BigEndian(view, offset + 13);
  const defEv = getUInt16BigEndian(view, offset + 15);
  const spdEv = getUInt16BigEndian(view, offset + 17);
  const spcEv = getUInt16BigEndian(view, offset + 19);

  const ivByte1 = view[offset + 21]!;
  const ivByte2 = view[offset + 22]!;

  const atkIv = (ivByte1 >> 4) & 0xF;
  const defIv = ivByte1 & 0xF;
  const spdIv = (ivByte2 >> 4) & 0xF;
  const spcIv = ivByte2 & 0xF;
  const hpIv = ((atkIv & 1) << 3) | ((defIv & 1) << 2) | ((spdIv & 1) << 1) | (spcIv & 1);

  const pps = [
    view[offset + 23]! & 0x3F,
    view[offset + 24]! & 0x3F,
    view[offset + 25]! & 0x3F,
    view[offset + 26]! & 0x3F
  ];

  const ppUps = [
    view[offset + 23]! >> 6,
    view[offset + 24]! >> 6,
    view[offset + 25]! >> 6,
    view[offset + 26]! >> 6
  ];

  const friendship = view[offset + 27]!;
  const pokerus = view[offset + 28]!;
  const caughtDataRaw = (view[offset + 0x1D]! << 8) | view[offset + 0x1E]!;
  const level = view[offset + 31]!;

  const baseStats = getGen2BaseStats(dexId);

  // Generate stats either from party block or calculate them for PC box
  let currentHp = 0;
  let maxHp = 0;
  let attack = 0;
  let defense = 0;
  let speed = 0;
  let spAtk = 0;
  let spDef = 0;

  if (isParty && offset + 48 <= view.length) {
    currentHp = getUInt16BigEndian(view, offset + 34);
    maxHp = getUInt16BigEndian(view, offset + 36);
    attack = getUInt16BigEndian(view, offset + 38);
    defense = getUInt16BigEndian(view, offset + 40);
    speed = getUInt16BigEndian(view, offset + 42);
    spAtk = getUInt16BigEndian(view, offset + 44);
    spDef = getUInt16BigEndian(view, offset + 46);
  } else {
    // Dynamically calculate for PC box slots
    maxHp = calculateGen2Stat(baseStats.hp, hpIv, hpEv, level, true);
    currentHp = maxHp;
    attack = calculateGen2Stat(baseStats.atk, atkIv, atkEv, level, false);
    defense = calculateGen2Stat(baseStats.def, defIv, defEv, level, false);
    speed = calculateGen2Stat(baseStats.spe, spdIv, spdEv, level, false);
    spAtk = calculateGen2Stat(baseStats.spa, spcIv, spcEv, level, false);
    spDef = calculateGen2Stat(baseStats.spd, spcIv, spcEv, level, false);
  }

  const isShiny = isGen2Shiny(atkIv, defIv, spdIv, spcIv);
  const gender = getGen2Gender(speciesId, atkIv);

  // Use types from GSC constants or Fallback to standard mapping
  const parsedTypes = getPokemonTypes(dexId, 2);
  const t1Name = parsedTypes[0] || 'Normal';
  const t2Name = parsedTypes[1] || t1Name;
  const type1Id = TYPE_MAP[t1Name] !== undefined ? TYPE_MAP[t1Name] : 0;
  const type2Id = TYPE_MAP[t2Name] !== undefined ? TYPE_MAP[t2Name] : 0;

  const raw = view.slice(offset, offset + (isParty ? 48 : 32));

  // Create Gen2 extension with generation-specific data
  const gen2Ext = new Gen2Extension();
  gen2Ext.heldItemId = heldItemId;
  gen2Ext.heldItemName = heldItemName;
  gen2Ext.isShiny = isShiny;
  gen2Ext.pokerus = pokerus;
  gen2Ext.gender = gender;
  gen2Ext.spAtk = spAtk;
  gen2Ext.spDef = spDef;
  gen2Ext.friendship = friendship;

  // ── Phase 3: Parse CaughtData (Crystal only) ──
  // The CaughtData is a 16-bit value at bytes 0x1D-0x1E in the Pokemon struct.
  // It is only meaningful for Crystal saves; for Gold/Silver, it is always 0.
  gen2Ext.caughtData = caughtDataRaw;
  const caughtInfo = parseGen2CaughtData(caughtDataRaw);
  if (caughtInfo) {
    gen2Ext.metLocation = caughtInfo.metLocation;
    gen2Ext.metLevel = caughtInfo.metLevel;
    gen2Ext.metTimeOfDay = caughtInfo.timeOfDay;
    gen2Ext.caughtOtGender = caughtInfo.otGender;
  }

  return {
    speciesId,
    dexId,
    speciesName: GEN2_POKEMON_NAMES[dexId] || `Species ${dexId}`,
    nickname,
    isNicknamed: nickname !== (GEN2_POKEMON_NAMES[dexId] || "").toUpperCase(),
    pid: 0,
    form: 0,
    originalTrainerName: otName,
    originalTrainerId,
    secretId: 0,
    originalTrainerGender: "Male",
    level,
    exp,
    friendship,
    hp: currentHp,
    maxHp,
    attack,
    defense,
    speed,
    special: spAtk, // Backwards compatibility for UI
    spAtk,
    spDef,
    iv: { hp: hpIv, attack: atkIv, defense: defIv, speed: spdIv, special: spcIv, spAtk: spcIv, spDef: spcIv },
    ev: { hp: hpEv, attack: atkEv, defense: defEv, speed: spdEv, special: spcEv, spAtk: spcEv, spDef: spcEv },
    moves,
    moveIds,
    movePp: pps,
    movePpUps: ppUps,
    status: isParty ? decodeStatus(view[offset + 32]!) : "OK",
    catchRate: 0,
    type1: type1Id,
    type2: type2Id,
    type1Name: t1Name,
    type2Name: t2Name,
    isParty,
    isEgg: speciesId === 253, // GSC Egg identifier index
    isShiny,
    gender,
    heldItemId,
    heldItemName,
    pokerus,
    genExtension: gen2Ext,
    raw,
    startOffset: offset,
    nicknameRaw,
    otNameRaw
  };
}

/**
 * Parse a .pk2 file (PKHeX PokeList2 format) into a PokemonStats object.
 *
 * PKHeX PokeList2 International format (73 bytes):
 *   Byte 0:      Count (should be 1)
 *   Byte 1:      Species (Gen 2 National Dex ID)
 *   Byte 2:      Terminator (0xFF)
 *   Bytes 3-50:  Pokemon data (party format, 48 bytes)
 *   Bytes 51-61: OT Name (11 bytes)
 *   Bytes 62-72: Nickname (11 bytes)
 */
export function parsePk2(buffer: Uint8Array): PokemonStats | null {
  const SIZE_2PARTY = 48;

  if (buffer.length === 73) {
    // PKHeX PokeList2 International format
    const count = buffer[0];
    if (count !== 1) {
      console.warn(`parsePk2: Unexpected count byte: ${count}. Expected 1.`);
    }
    const speciesId = buffer[1]!;

    const monData = buffer.slice(3, 3 + SIZE_2PARTY);
    const otRaw = buffer.slice(3 + SIZE_2PARTY, 3 + SIZE_2PARTY + 11);
    const nickRaw = buffer.slice(3 + SIZE_2PARTY + 11, 3 + SIZE_2PARTY + 22);

    const otName = decodeText(otRaw, 0, 11);
    const nickname = decodeText(nickRaw, 0, 11);

    const mon = parseGen2PokemonStruct(monData, 0, true, nickname, otName, nickRaw, otRaw);

    return mon;
  }

  if (buffer.length === 63) {
    // PKHeX PokeList2 Japanese format (shorter names)
    const count = buffer[0];
    if (count !== 1) {
      console.warn(`parsePk2: Unexpected count byte: ${count}. Expected 1.`);
    }

    const monData = buffer.slice(3, 3 + SIZE_2PARTY);
    const otRaw = buffer.slice(3 + SIZE_2PARTY, 3 + SIZE_2PARTY + 6);
    const nickRaw = buffer.slice(3 + SIZE_2PARTY + 6, 3 + SIZE_2PARTY + 12);

    const otName = decodeText(otRaw, 0, 6, true);
    const nickname = decodeText(nickRaw, 0, 6, true);

    const mon = parseGen2PokemonStruct(monData, 0, true, nickname, otName, nickRaw, otRaw);

    return mon;
  }

  // Legacy format: 48 bytes struct + 11 OT + 11 Nick (no PokeList header)
  if (buffer.length === 70) {
    const otNameOffset = 48;
    const nickOffset = 59;

    const otName = decodeText(buffer, otNameOffset, 11);
    const nickname = decodeText(buffer, nickOffset, 11);
    const otRaw = buffer.slice(otNameOffset, otNameOffset + 11);
    const nickRaw = buffer.slice(nickOffset, nickOffset + 11);

    return parseGen2PokemonStruct(buffer, 0, true, nickname, otName, nickRaw, otRaw);
  }

  // Raw party struct only (48 bytes)
  if (buffer.length === 48) {
    const otRaw = new Uint8Array(11).fill(0x50);
    const nickRaw = new Uint8Array(11).fill(0x50);

    return parseGen2PokemonStruct(buffer, 0, true, '???', '???', nickRaw, otRaw);
  }

  console.warn(`parsePk2: Unrecognized .pk2 file size: ${buffer.length} bytes`);
  return null;
}

export function parseItemsPocketGen2(view: Uint8Array, start: number, countIdx: number, size: number, maxCap: number): Item[] {
  const count = view[countIdx]!;
  const items: Item[] = [];
  let curr = start;

  for (let i = 0; i < count && i < maxCap; i++) {
    const id = view[curr]!;
    const qty = size === 2 ? view[curr + 1]! : 1;
    if (id === 0xFF || id === 0) break;

    items.push({
      id,
      name: getGen2ItemName(id),
      count: qty
    });
    curr += size;
  }
  return items;
}

/**
 * Parse a PC box using the offset system.
 * The box layout is:
 *   [count:1] [speciesList:boxSlotCount+1] [bodies:boxSlotCount*32] [otNames:boxSlotCount*strLen] [nicknames:boxSlotCount*strLen]
 *   Followed by a 2-byte checksum.
 */
export function parsePCBoxGen2(view: Uint8Array, offset: number, offsets: Gen2OffsetsConfig): PokemonStats[] {
  const count = view[offset]!;
  const list: PokemonStats[] = [];
  const slotCount = offsets.boxSlotCount;
  const strLen = offsets.stringLength;

  if (count === 0 || count > slotCount) return list;

  const speciesListOffset = offset + 1;
  const pokemonStructStart = offset + 1 + (slotCount + 1); // count + species list + 0xFF terminator

  for (let i = 0; i < count; i++) {
    const speciesId = view[speciesListOffset + i]!;
    if (speciesId === 0xFF) break;

    const structOffset = pokemonStructStart + (i * 32);
    const otNamesStart = pokemonStructStart + (slotCount * 32) + (i * strLen);
    const nicknamesStart = pokemonStructStart + (slotCount * 32) + (slotCount * strLen) + (i * strLen);

    const nicknameRaw = view.slice(nicknamesStart, nicknamesStart + strLen);
    const otNameRaw = view.slice(otNamesStart, otNamesStart + strLen);

    const nickname = decodeText(nicknameRaw, 0, strLen);
    const otName = decodeText(otNameRaw, 0, strLen);

    list.push(parseGen2PokemonStruct(
      view,
      structOffset,
      false,
      nickname,
      otName,
      nicknameRaw,
      otNameRaw
    ));
  }

  return list;
}

// ============================================================================
// Phase 2: Missing Save Section Parsers
// ============================================================================

/**
 * Parse the rival's name from the save file.
 * The rival name is stored at offsets.rivalName using the standard
 * Game Boy text encoding with stringLength bytes available.
 *
 * The rival's name is a fixed string that is set at the start of the game
 * when Professor Oak asks "What's his name?" — it cannot be changed in-game
 * afterward without editing the save file. This parser allows editors to
 * read and modify the rival's name for save file editing purposes.
 */
export function parseGen2RivalName(data: Uint8Array, offsets: Gen2OffsetsConfig): string {
  if (data.length <= offsets.rivalName + offsets.stringLength) return '';
  const raw = data.slice(offsets.rivalName, offsets.rivalName + offsets.stringLength);
  return decodeText(raw, 0, offsets.maxTrainerNameLen);
}

/**
 * Parse event flags from the save file.
 *
 * Event flags in Gen 2 are a dense bitfield spanning 2000 individual flags
 * (250 bytes), controlling every story event, NPC interaction, item pickup,
 * door unlock, and cutscene trigger in the game. They are critical for
 * save editors because they determine game progress state. Alongside the
 * flags are 256 bytes of "event work" variables that store dynamic values
 * like the current step count for the Day-Care Lady, the state of puzzles,
 * and other scripted counters.
 *
 * The flags and work variables live at offsets.eventFlags and offsets.eventWork
 * respectively. The layout is region/version-dependent, which is why they
 * are centralized in the offset system rather than hardcoded.
 */
export function parseGen2EventFlags(data: Uint8Array, offset: number, count: number): boolean[] {
  const flags: boolean[] = [];
  for (let i = 0; i < count; i++) {
    const byteIdx = offset + Math.floor(i / 8);
    if (byteIdx >= data.length) {
      flags.push(false);
      continue;
    }
    const byte = data[byteIdx]!;
    flags.push(((byte >> (i % 8)) & 1) === 1);
  }
  return flags;
}

/**
 * Parse Hall of Fame data from SRAM Bank 0.
 *
 * The Hall of Fame stores up to 50 teams (one per Elite Four champion run).
 * Each team consists of up to 6 Pokemon entries stored in a compact format.
 * Each entry contains:
 *   - 1 byte: Species ID (internal index, matches National Dex for Gen 2)
 *   - 1 byte: Level at time of victory
 *   - stringLength bytes: Nickname
 *
 * Entries with species ID 0xFF or 0x00 indicate empty slots. A team with
 * all empty entries signals the end of the Hall of Fame data. The data is
 * stored in SRAM Bank 0 at offset 0x0C6C for International saves (varies
 * by version/region). The writer should preserve this data as-is since it
 * is read-only in most save editors.
 */
export function parseGen2HallOfFame(
  data: Uint8Array,
  offsets: Gen2OffsetsConfig
): HallOfFameTeam[] {
  const teams: HallOfFameTeam[] = [];
  const strLen = offsets.stringLength;
  const entrySize = 2 + strLen; // species + level + nickname

  // Hall of Fame is stored in SRAM Bank 0, starting at 0x0C6C for INT GS
  // The exact offset varies by version/region; use a computed offset
  const isCrystal = offsets.gender >= 0;
  const hofOffset = isCrystal ? 0x0C86 : 0x0C6C;

  // Safety: don't parse beyond buffer
  if (hofOffset + (50 * entrySize * 6) > data.length) {
    return teams;
  }

  for (let team = 0; team < 50; team++) {
    const teamOffset = hofOffset + (team * entrySize * 6);
    const pokemon: HallOfFamePokemon[] = [];

    for (let slot = 0; slot < 6; slot++) {
      const entryOffset = teamOffset + (slot * entrySize);

      if (entryOffset + entrySize > data.length) break;

      const speciesId = data[entryOffset]!;
      if (speciesId === 0xFF || speciesId === 0) break; // No more entries in this team

      const level = data[entryOffset + 1]!;
      const nickRaw = data.slice(entryOffset + 2, entryOffset + 2 + strLen);
      const nickname = decodeText(nickRaw, 0, strLen);

      // Use GEN2_POKEMON_NAMES for species name (species ID = National Dex in Gen 2)
      const speciesName = GEN2_POKEMON_NAMES[speciesId] || `Species ${speciesId}`;

      // Get type info from the adapter's type table
      const parsedTypes = getPokemonTypes(speciesId, 2);
      const types = parsedTypes.length > 0 ? parsedTypes : ['Normal'];

      pokemon.push({
        speciesId,
        dexId: speciesId,
        speciesName,
        nickname,
        level,
        types,
      });
    }

    if (pokemon.length > 0) {
      teams.push({ id: team, pokemon });
    } else {
      // No more teams with data
      break;
    }
  }

  return teams;
}

/**
 * Parse daycare data from the save file.
 *
 * The Route 34 Day-Care in Gold/Silver/Crystal stores up to 2 Pokemon
 * (parents) that can breed. The data is stored in NOB format:
 *   - Nickname (stringLength bytes)
 *   - OT Name (stringLength bytes)
 *   - Body (32 bytes — the standard Gen 2 Pokemon structure without party stats)
 *
 * After the two parent entries, there are metadata bytes:
 *   - Daycare step counter / breeding status byte
 *   - Steps until egg byte
 *
 * This is different from the regular PokeList format used for party and boxes,
 * which stores all nicknames and OT names together after all bodies. The daycare
 * interleaves name and body data for each parent sequentially.
 */
export function parseGen2Daycare(
  data: Uint8Array,
  offsets: Gen2OffsetsConfig
): { parent1: PokemonStats | null; parent2: PokemonStats | null; breedingStatus: number; stepsUntilEgg: number } {
  const strLen = offsets.stringLength;
  const SIZE_2STORED = 32;
  const offset = offsets.daycare;

  // Parent 1: Nickname + OT + Body (interleaved NOB format)
  let parent1: PokemonStats | null = null;
  const nick1Start = offset;
  const ot1Start = offset + strLen;
  const body1Start = offset + (strLen * 2);

  if (body1Start + SIZE_2STORED <= data.length) {
    const body1Species = data[body1Start]!;
    if (body1Species !== 0 && body1Species !== 0xFF) {
      const nick1Raw = data.slice(nick1Start, nick1Start + strLen);
      const ot1Raw = data.slice(ot1Start, ot1Start + strLen);
      const nick1 = decodeText(nick1Raw, 0, strLen);
      const ot1 = decodeText(ot1Raw, 0, strLen);
      parent1 = parseGen2PokemonStruct(data, body1Start, false, nick1, ot1, nick1Raw, ot1Raw);
    }
  }

  // Parent 2: same NOB format, offset after parent 1
  let parent2: PokemonStats | null = null;
  const parent2Offset = offset + (strLen * 2) + SIZE_2STORED;
  const nick2Start = parent2Offset;
  const ot2Start = parent2Offset + strLen;
  const body2Start = parent2Offset + (strLen * 2);

  if (body2Start + SIZE_2STORED <= data.length) {
    const body2Species = data[body2Start]!;
    if (body2Species !== 0 && body2Species !== 0xFF) {
      const nick2Raw = data.slice(nick2Start, nick2Start + strLen);
      const ot2Raw = data.slice(ot2Start, ot2Start + strLen);
      const nick2 = decodeText(nick2Raw, 0, strLen);
      const ot2 = decodeText(ot2Raw, 0, strLen);
      parent2 = parseGen2PokemonStruct(data, body2Start, false, nick2, ot2, nick2Raw, ot2Raw);
    }
  }

  // Daycare metadata: breeding status and steps until egg
  // These bytes follow the two parent entries
  const metadataOffset = parent2Offset + (strLen * 2) + SIZE_2STORED;
  let breedingStatus = 0;
  let stepsUntilEgg = 0;

  if (metadataOffset + 1 < data.length) {
    breedingStatus = data[metadataOffset]!;
    stepsUntilEgg = data[metadataOffset + 1]!;
  }

  return { parent1, parent2, breedingStatus, stepsUntilEgg };
}

/**
 * Parse box names from the save file.
 *
 * Each PC box has a custom name (up to 9 characters for INT/JPN, 17 for Korean)
 * stored at offsets.boxNames. The names are stored sequentially with each
 * entry using boxNameEntrySize bytes. Box names default to the game's built-in
 * names ("BOX 1", "BOX 2", etc.) but can be customized by the player in the PC
 * interface. This parser extracts those custom names for display in the editor.
 */
export function parseGen2BoxNames(
  data: Uint8Array,
  offsets: Gen2OffsetsConfig
): string[] {
  const names: string[] = [];
  const offset = offsets.boxNames;
  const entrySize = offsets.boxNameEntrySize;
  // The usable name length is entrySize minus 1 for the terminator, 
  // but we decode the full entrySize bytes and let decodeText handle termination
  const nameDecodeLen = entrySize - 1;

  for (let i = 0; i < offsets.boxCount; i++) {
    const nameOffset = offset + (i * entrySize);
    if (nameOffset + entrySize > data.length) {
      names.push(`BOX ${i + 1}`);
      continue;
    }
    const raw = data.slice(nameOffset, nameOffset + entrySize);
    const decoded = decodeText(raw, 0, nameDecodeLen);
    // Preserve the actual decoded name (even if empty).
    // The UI is responsible for displaying a default like "BOX N" for empty names.
    // Previously, replacing empty names with "BOX N" caused corruption on re-encode
    // because the literal "BOX N" string would be encoded over the original raw data.
    names.push(decoded.trim());
  }

  return names;
}

/**
 * Parse the TM/HM pocket from the save file.
 *
 * Gen 2 stores TMs and HMs differently from regular items. The TM/HM pocket
 * uses a direct byte array where the array index maps to the TM/HM number,
 * and the value is the quantity (0 = not owned, 1-99 for TMs, always 1 for HMs).
 * There are 50 TMs and 7 HMs, totaling 57 slots stored contiguously.
 *
 * TM/HM item IDs in Gen 2:
 *   TM01 = item ID 0xC5+1 = 0xC6 (198) ... TM50 = 0xC5+50 = 0xF7 (247)
 *   HM01 = item ID 0xC5+51 = 0xF8 (248) ... HM07 = 0xC5+57 = 0xFE (254)
 *
 * The move taught by TM#i is move ID (i + 0), since TMs directly map to
 * move IDs (TM01 = move 1, etc.). However, the actual mapping is more complex
 * — Gen 2 TM numbers don't match move IDs sequentially. We use the known
 * Gen 2 TM/HM-to-move mapping table.
 */
export function parseGen2TmHmPocket(data: Uint8Array, offsets: Gen2OffsetsConfig): Item[] {
  const items: Item[] = [];
  const offset = offsets.tmHmPouch;

  // Gen 2 TM/HM to move ID mapping
  // TM01-TM50 move IDs and HM01-HM07 move IDs
  const TM_HM_MOVES: number[] = [
    // TM01 - TM10
    189, 8, 245, 34, 69, 37, 249, 129, 3, 236,
    // TM11 - TM20
    92, 253, 68, 60, 219, 115, 188, 202, 242, 36,
    // TM21 - TM30
    216, 82, 161, 6, 130, 153, 248, 89, 87, 129,
    // TM31 - TM40
    24, 116, 185, 97, 99, 227, 63, 234, 156, 213,
    // TM41 - TM50
    28, 16, 168, 247, 55, 57, 196, 201, 218, 97,
    // HM01 - HM07
    15, 19, 57, 148, 70, 91, 250,
  ];

  for (let i = 0; i < 57; i++) {
    if (offset + i >= data.length) break;
    const qty = data[offset + i]!;
    if (qty > 0) {
      const isHm = i >= 50;
      const tmHmNum = isHm ? (i - 50 + 1) : (i + 1);
      const itemId = 0xC5 + i + 1; // Item ID for this TM/HM
      const moveId = TM_HM_MOVES[i] || 0;
      const moveName = GEN2_MOVES_LIST[moveId] || '-';
      const name = isHm
        ? `HM${String(tmHmNum).padStart(2, '0')} - ${moveName}`
        : `TM${String(tmHmNum).padStart(2, '0')} - ${moveName}`;

      items.push({
        id: itemId,
        name,
        count: qty,
        pocket: 5, // TM/HM pocket
      });
    }
  }

  return items;
}

/**
 * Parse map/position data from the save file.
 *
 * The player's current position on the overworld map is stored in the save
 * file at fixed offsets within the SRAM Bank 1 data region. This includes
 * the current map ID (a 16-bit value encoding map group and map number),
 * and the player's X/Y tile coordinates within that map. These values are
 * useful for save editors that want to teleport the player or verify their
 * current location. The exact offsets vary between Gold/Silver and Crystal
 * due to the slightly different save layouts, so they are computed from the
 * offset configuration.
 */
export function parseGen2MapData(data: Uint8Array, offsets: Gen2OffsetsConfig): MapData {
  // Map data offsets are relative to the trainer block start.
  // INT GS: map group+number at 0x2311, X at 0x2313, Y at 0x2314
  // INT Crystal: map group+number at 0x2312, X at 0x2314, Y at 0x2315
  // These are offset from the trainer block start (0x2009), so:
  // GS: 0x2311 - 0x2009 = 0x308 relative
  // Crystal: 0x2312 - 0x2009 = 0x309 relative
  const isCrystal = offsets.gender >= 0;
  const isJapanese = offsets.stringLength === 6;
  const isKorean = offsets.boxNameEntrySize === 17;

  let mapGroupOffset: number;
  let mapXOffset: number;
  let mapYOffset: number;

  if (isJapanese) {
    // JP offsets are slightly different
    mapGroupOffset = offsets.trainer1 + 0x2F8;
    mapXOffset = mapGroupOffset + 2;
    mapYOffset = mapGroupOffset + 3;
  } else if (isKorean) {
    mapGroupOffset = offsets.trainer1 + 0x2FA;
    mapXOffset = mapGroupOffset + 2;
    mapYOffset = mapGroupOffset + 3;
  } else if (isCrystal) {
    mapGroupOffset = offsets.trainer1 + 0x309;
    mapXOffset = mapGroupOffset + 2;
    mapYOffset = mapGroupOffset + 3;
  } else {
    // INT GS
    mapGroupOffset = offsets.trainer1 + 0x308;
    mapXOffset = mapGroupOffset + 2;
    mapYOffset = mapGroupOffset + 3;
  }

  if (mapGroupOffset + 3 >= data.length) {
    return { currentMapId: 0, x: 0, y: 0 };
  }

  const currentMapId = data[mapGroupOffset]! | (data[mapGroupOffset + 1]! << 8);
  const x = data[mapXOffset]!;
  const y = data[mapYOffset]!;

  return { currentMapId, x, y };
}

/**
 * Main Gen 2 save parser.
 * Uses centralized offset system for version/region-aware parsing.
 * Phase 2 adds: rival name, hall of fame, event flags, daycare, box names,
 * TM/HM pocket, and map/position data.
 */
export function parseGen2Save(data: Uint8Array, originalFilename: string = "save.sav"): ParsedSave {
  if (data.length < 32768) {
    throw new Error(`Invalid save file size: ${data.length} bytes. Gen 2 saves must be at least 32KB.`);
  }

  // ── Detect Region ──
  const region = detectGen2Region(data);

  // ── Detect Game Version ──
  // We need to try both GS and Crystal checksums to determine version.
  // Use temporary offsets for checksum detection before we know the version.
  const gsSumComputed = calculateGen2Checksum(data, 0x2009, 0x2D68);
  const gsSumStored = data[0x2D69]! | (data[0x2D6A]! << 8);

  const crySumComputed = calculateGen2Checksum(data, 0x2009, 0x2B82);
  const crySumStored = data[0x2D0D]! | (data[0x2D0E]! << 8);

  // For Japanese saves, the Crystal checksum range is different
  let crySumComputedJpn = 0;
  let crySumStoredJpn = 0;
  if (region === 'japanese') {
    crySumComputedJpn = calculateGen2Checksum(data, 0x2009, 0x2AE2);
    crySumStoredJpn = data[0x2D0D]! | (data[0x2D0E]! << 8);
  }

  let gameVersion: Gen2Version = 'Gold';
  let isChecksumValid = false;

  const lowerFilename = originalFilename.toLowerCase();

  // Version detection logic using region-appropriate checksums
  const gsValid = gsSumComputed === gsSumStored && gsSumStored !== 0;
  const cryValid = region === 'japanese'
    ? (crySumComputedJpn === crySumStoredJpn && crySumStoredJpn !== 0)
    : (crySumComputed === crySumStored && crySumStored !== 0);

  if (lowerFilename.includes('crystal')) {
    if (cryValid) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    } else if (gsValid) {
      gameVersion = 'Gold';
      isChecksumValid = true;
    } else {
      gameVersion = 'Crystal';
      isChecksumValid = false;
    }
  } else if (lowerFilename.includes('silver')) {
    gameVersion = 'Silver';
    if (gsValid) {
      isChecksumValid = true;
    } else if (cryValid) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    }
  } else if (lowerFilename.includes('gold')) {
    gameVersion = 'Gold';
    if (gsValid) {
      isChecksumValid = true;
    } else if (cryValid) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    }
  } else {
    // No clear filename indicator. Trust checksums.
    if (gsValid) {
      gameVersion = 'Gold';
      isChecksumValid = true;
    } else if (cryValid) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    } else {
      gameVersion = 'Gold';
      isChecksumValid = false;
    }
  }

  // Korean saves don't have Crystal
  if (region === 'korean' && gameVersion === 'Crystal') {
    gameVersion = 'Gold'; // Fallback
  }

  // ── Get Offsets for this version/region ──
  const offsets = getGen2Offsets(gameVersion, region);

  // ── Parse Trainer Info ──
  const tid = getUInt16BigEndian(data, offsets.trainer1);
  // Trainer name starts at trainer1 + 2 (after 2-byte TID)
  const trainerNameStart = offsets.trainer1 + 2;
  const trainerNameRaw = data.slice(trainerNameStart, trainerNameStart + offsets.stringLength);
  const trainerName = decodeText(trainerNameRaw, 0, offsets.maxTrainerNameLen);

  const money = parseBCD(data, offsets.money, 3);
  const coins = parseBCD(data, offsets.coins, 2);
  const badges = data[offsets.johtoBadges]! | (data[offsets.johtoBadges + 1]! << 8);
  const kantoBadges = data[offsets.kantoBadges] ?? 0;

  // Play time: hours(2 bytes BE) + minutes(1 byte) + seconds(1 byte)
  const timeOffset = offsets.timePlayed;
  const hours = (data[timeOffset]! << 8) | data[timeOffset + 1]!;
  const minutes = data[timeOffset + 2]! || 0;
  const seconds = data[timeOffset + 3]! || 0;
  const playTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Gender: Crystal only (offset >= 0), GS always Male
  const trainerGender: 'Male' | 'Female' = offsets.gender >= 0
    ? (data[offsets.gender] === 1 ? 'Female' : 'Male')
    : 'Male';

  // ── Phase 2: Parse Rival Name ──
  const rivalName = parseGen2RivalName(data, offsets);

  const trainer: TrainerInfo = {
    name: trainerName,
    id: tid.toString().padStart(5, '0'),
    money,
    coins,
    playTime,
    badges,
    gender: trainerGender,
    rivalName,
  };

  // ── Parse Party Pokémon ──
  const partyCount = data[offsets.party]!;
  const partyList: PokemonStats[] = [];
  const strLen = offsets.stringLength;

  // Party list layout:
  // [count:1] [species:6] [0xFF:1] [bodies:6*48] [otNames:6*strLen] [nicknames:6*strLen]
  const partySpeciesStart = offsets.party + 1;
  const partyBodiesStart = offsets.party + 1 + 6 + 1; // count + 6 species + 0xFF
  const partyOtNamesStart = partyBodiesStart + (6 * 48);
  const partyNicknamesStart = partyOtNamesStart + (6 * strLen);

  for (let i = 0; i < partyCount && i < 6; i++) {
    const structOffset = partyBodiesStart + (i * 48);
    const otNamesOffset = partyOtNamesStart + (i * strLen);
    const nicknamesOffset = partyNicknamesStart + (i * strLen);

    const nicknameRaw = data.slice(nicknamesOffset, nicknamesOffset + strLen);
    const otNameRaw = data.slice(otNamesOffset, otNamesOffset + strLen);

    const nickname = decodeText(nicknameRaw, 0, strLen);
    const otName = decodeText(otNameRaw, 0, strLen);

    partyList.push(parseGen2PokemonStruct(
      data,
      structOffset,
      true,
      nickname,
      otName,
      nicknameRaw,
      otNameRaw
    ));
  }

  // ── Parse Inventory ──
  const pocketItems = parseItemsPocketGen2(data, offsets.itemPouchStart, offsets.itemPouchCount, 2, offsets.pouchItemSlots);
  const keyItems = parseItemsPocketGen2(data, offsets.keyItemPouchStart, offsets.keyItemPouchCount, 1, offsets.pouchKeySlots);
  const balls = parseItemsPocketGen2(data, offsets.ballPouchStart, offsets.ballPouchCount, 2, offsets.pouchBallSlots);
  const pcItems = parseItemsPocketGen2(data, offsets.pcItemPouchStart, offsets.pcItemPouchCount, 2, offsets.pouchPcSlots);

  // ── Phase 2: Parse TM/HM Pocket ──
  const tms = parseGen2TmHmPocket(data, offsets);

  // ── Parse Pokedex ──
  const pokedexOwnedChecked = getPokedexFlagsGen2(data, offsets.pokedexCaught);
  const pokedexSeenChecked = getPokedexFlagsGen2(data, offsets.pokedexSeen);
  
  const pokedexOwned = pokedexOwnedChecked.filter(Boolean).length;
  const pokedexSeen = pokedexSeenChecked.filter(Boolean).length;

  // ── Parse PC Boxes ──
  // Uses the corrected box stride calculation (sizeBoxList + 2 for per-box checksum)
  const pcBoxes: PokemonStats[][] = [];
  for (let boxIdx = 0; boxIdx < offsets.boxCount; boxIdx++) {
    const boxOffset = getBoxOffset(boxIdx, offsets);
    pcBoxes.push(parsePCBoxGen2(data, boxOffset, offsets));
  }

  // Active PC box ID
  const currentBoxIdValue = data[offsets.currentBoxIndex] !== undefined ? (data[offsets.currentBoxIndex]! & 0x7F) : 0;
  const currentBoxId = Math.max(0, Math.min(offsets.boxCount - 1, currentBoxIdValue));

  const currentBoxCount = pcBoxes[currentBoxId]?.length || 0;
  const currentBoxPokemon = pcBoxes[currentBoxId] || [];

  // Option parsing for GSC
  const optionsByte = data[offsets.options]!;
  const gscBattleAnimation = (optionsByte & 0x80) ? 'Off' : 'On';
  const gscBattleStyle = (optionsByte & 0x40) ? 'Set' : 'Shift';
  const gscSpeedBits = optionsByte & 0x7;
  let gscTextSpeed: string = 'Normal';
  if (gscSpeedBits === 1) gscTextSpeed = 'Fast';
  else if (gscSpeedBits === 5) gscTextSpeed = 'Slow';
  else if (gscSpeedBits === 3) gscTextSpeed = 'Normal';
  else gscTextSpeed = gscSpeedBits.toString();

  const gscSoundBits = (optionsByte >> 4) & 0x3;
  let gscSound: 'Mono' | 'Stereo' | 'Earphone1' | 'Earphone2' | 'Earphone3' = 'Mono';
  if (gscSoundBits === 0) gscSound = 'Mono';
  else if (gscSoundBits === 1) gscSound = 'Stereo';
  else if (gscSoundBits === 2) gscSound = 'Earphone1';
  else if (gscSoundBits === 3) gscSound = 'Earphone2';

  const options: GameOptions = {
    textSpeed: gscTextSpeed,
    battleAnimation: gscBattleAnimation,
    battleStyle: gscBattleStyle,
    sound: gscSound
  };

  // ── Phase 2: Parse Hall of Fame ──
  const hallOfFame = parseGen2HallOfFame(data, offsets);

  // ── Phase 2: Parse Event Flags ──
  // 2000 event flags (250 bytes) — covers all story progress, NPC interactions, items, etc.
  const eventFlags = parseGen2EventFlags(data, offsets.eventFlags, 2000);

  // ── Phase 2: Parse Daycare ──
  const daycareData = parseGen2Daycare(data, offsets);
  const daycare: PokemonStats[] = [];
  if (daycareData.parent1) daycare.push(daycareData.parent1);
  if (daycareData.parent2) daycare.push(daycareData.parent2);

  // ── Phase 2: Parse Box Names ──
  const boxNames = parseGen2BoxNames(data, offsets);

  // ── Phase 2: Parse Map Data ──
  const mapData = parseGen2MapData(data, offsets);

  // ── Build Gen2SaveExtension ──
  const gen2SaveExt = new Gen2SaveExtension();
  gen2SaveExt.region = region;
  gen2SaveExt.gameVersion = gameVersion;
  gen2SaveExt.rivalName = rivalName;
  gen2SaveExt.boxNames = boxNames;
  gen2SaveExt.daycareParent1 = daycareData.parent1;
  gen2SaveExt.daycareParent2 = daycareData.parent2;
  gen2SaveExt.daycareStepsUntilEgg = daycareData.stepsUntilEgg;
  gen2SaveExt.daycareBreedingStatus = daycareData.breedingStatus;
  gen2SaveExt.currentMapId = mapData.currentMapId;
  gen2SaveExt.mapX = mapData.x;
  gen2SaveExt.mapY = mapData.y;
  gen2SaveExt.hallOfFameOffset = 0x0C6C; // Default for INT GS, computed above for others
  gen2SaveExt.kantoBadges = kantoBadges;
  gen2SaveExt.eventFlagsOffset = offsets.eventFlags;
  gen2SaveExt.eventWorkOffset = offsets.eventWork;

  // ── Phase 3: Crystal-Specific Save Data ──
  // Blue Card Points (Crystal only)
  if (offsets.blueCardPoints >= 0 && offsets.blueCardPoints < data.length) {
    gen2SaveExt.blueCardPoints = data[offsets.blueCardPoints]!;
  }

  // Mystery Gift (Crystal only)
  if (offsets.mysteryGiftUnlocked >= 0 && offsets.mysteryGiftUnlocked < data.length) {
    gen2SaveExt.mysteryGiftUnlocked = data[offsets.mysteryGiftUnlocked]!;
  }
  if (offsets.mysteryGiftItem >= 0 && offsets.mysteryGiftItem < data.length) {
    gen2SaveExt.mysteryGiftItem = data[offsets.mysteryGiftItem]!;
  }

  // GS Ball Event (Crystal only)
  gen2SaveExt.gsBallEventEnabled = isGSBallEventEnabled(data, offsets);

  // Move Tutor Flags (Crystal only — derived from event flags)
  gen2SaveExt.moveTutorFlags = deriveMoveTutorFlags(eventFlags, offsets);

  // ── Phase 4: RTC, Mom Savings, Unown Dex, Phone Contacts ──

  // Phase 4: RTC
  gen2SaveExt.rtcFlags = data[offsets.rtcFlags] ?? 0;

  // Phase 4: Mom Savings (3-byte BCD, same format as money)
  if (offsets.momSavings + 2 < data.length) {
    gen2SaveExt.momSavings = parseBCD(data, offsets.momSavings, 3);
  }

  // Phase 4: Unown Dex
  if (offsets.unownDex > 0 && offsets.unownDex + 27 < data.length) {
    const unownOffset = offsets.unownDex;
    // 26 bytes: caught forms (1 byte per letter, 0=not caught, 1=caught)
    for (let i = 0; i < 26; i++) {
      gen2SaveExt.unownCaughtForms.push(data[unownOffset + i] ?? 0);
    }
    gen2SaveExt.unownUnlockedFlags = data[unownOffset + 26] ?? 0;
    gen2SaveExt.unownFirstSeen = data[unownOffset + 27] ?? 0;
  }

  // Phase 4: Phone Contacts
  if (offsets.phoneContacts > 0) {
    const phoneOffset = offsets.phoneContacts;
    const entryStride = offsets.stringLength + 3; // name + trainerClass + mapGroup + mapNumber
    for (let i = 0; i < 39; i++) {
      const nameOffset = phoneOffset + (i * entryStride);
      // Check if slot is occupied (first byte non-zero and non-0xFF)
      if (nameOffset >= data.length || data[nameOffset] === 0 || data[nameOffset] === 0xFF) continue;
      const name = decodeText(data, nameOffset, offsets.stringLength);
      const trainerClass = data[nameOffset + offsets.stringLength] ?? 0;
      const mapGroup = data[nameOffset + offsets.stringLength + 1] ?? 0;
      const mapNumber = data[nameOffset + offsets.stringLength + 2] ?? 0;
      gen2SaveExt.phoneContacts.push({ trainerClass, name, mapGroup, mapNumber });
    }
  }

  return {
    generation: 2,
    gameVersion,
    originalFilename,
    fileSize: data.length,
    isValid: isChecksumValid,
    trainer,
    options,
    map: mapData,
    partyCount,
    party: partyList,
    items: pocketItems,
    keyItems,
    balls,
    pcItems,
    tms,
    pokedexOwned,
    pokedexSeen,
    pokedexOwnedFlags: pokedexOwnedChecked,
    pokedexSeenFlags: pokedexSeenChecked,
    currentBoxId,
    currentBoxCount,
    currentBoxPokemon,
    pcBoxes,
    hallOfFame,
    eventFlags,
    daycare: daycare.length > 0 ? daycare : undefined,
    rawData: data,
    genExtension: gen2SaveExt
  };
}
