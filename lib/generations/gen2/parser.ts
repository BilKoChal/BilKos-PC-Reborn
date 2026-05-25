import { ParsedSave, TrainerInfo, PokemonStats, Item, GameOptions, MapData, Gen2Extension, Gen2SaveExtension, isGen2Extension } from '../../parser/types';
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

/**
 * Main Gen 2 save parser.
 * Uses centralized offset system for version/region-aware parsing.
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

  const trainer: TrainerInfo = {
    name: trainerName,
    id: tid.toString().padStart(5, '0'),
    money,
    coins,
    playTime,
    badges,
    gender: trainerGender,
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

  // ── Build Gen2SaveExtension ──
  const gen2SaveExt = new Gen2SaveExtension();
  gen2SaveExt.region = region;
  gen2SaveExt.gameVersion = gameVersion;

  return {
    generation: 2,
    gameVersion,
    originalFilename,
    fileSize: data.length,
    isValid: isChecksumValid,
    trainer,
    options,
    partyCount,
    party: partyList,
    items: pocketItems,
    keyItems,
    balls,
    pcItems,
    pokedexOwned,
    pokedexSeen,
    pokedexOwnedFlags: pokedexOwnedChecked,
    pokedexSeenFlags: pokedexSeenChecked,
    currentBoxId,
    currentBoxCount,
    currentBoxPokemon,
    pcBoxes,
    hallOfFame: [],
    eventFlags: [],
    rawData: data,
    genExtension: gen2SaveExt
  };
}
