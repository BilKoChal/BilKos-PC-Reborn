import { ParsedSave, TrainerInfo, PokemonStats, Item, GameOptions, MapData } from '../../parser/types';
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
  getGen2ItemName, 
  getGen2BaseStats 
} from './data/constants';
import { calculateGen2Stat } from './statCalculator';

// Checksum formula for Generation 2: 16-bit additive sum (stored little-endian)
export function calculateGen2Checksum(data: Uint8Array, start: number, end: number): number {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += data[i];
  }
  return sum & 0xFFFF;
}

// Parses Pokedex bitflags in Gen 2 saves
export function getPokedexFlagsGen2(data: Uint8Array, offset: number): boolean[] {
  const flags: boolean[] = [];
  // GSC Pokedex uses 25 bytes per flag set (199 bits + extra padding?)
  // Using 200 bits as a safe bet for GSC (25 * 8 = 200)
  for (let i = 0; i < 200; i++) {
    const byte = data[offset + Math.floor(i / 8)];
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
export function getGen2Gender(speciesId: number, atkIv: number): string {
  // Simple GSC gender logic based on Attack DV vs. Species female ratio thresholds.
  // We can default to Male if >= 8, Female if < 8, or Genderless for standard legendaries
  const genderless = [81, 82, 100, 101, 120, 121, 132, 137, 144, 145, 146, 150, 151, 201, 233, 243, 244, 245, 249, 250, 251];
  if (genderless.includes(speciesId)) return "Genderless";
  
  const alwaysFemale = [29, 30, 31, 113, 115, 124, 241, 242];
  if (alwaysFemale.includes(speciesId)) return "Female";
  
  const alwaysMale = [32, 33, 34, 106, 107, 236, 237];
  if (alwaysMale.includes(speciesId)) return "Male";

  // For starter classes and Eevee (87.5% Male, threshold is Atk DV < 2)
  const startersAndEevee = [1, 2, 3, 4, 5, 6, 7, 8, 9, 133, 134, 135, 136, 152, 153, 154, 155, 156, 157, 158, 159, 160, 196, 197];
  if (startersAndEevee.includes(speciesId)) {
    return atkIv < 2 ? "Female" : "Male";
  }

  // General species (50% Male / 50% Female, threshold is Atk DV < 8)
  return atkIv < 8 ? "Female" : "Male";
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
      gender: 'Genderless', pokerus: 0,
      iv: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
      raw: new Uint8Array(0), startOffset: offset, nicknameRaw: nicknameRaw || new Uint8Array(0),
      otNameRaw: otNameRaw || new Uint8Array(0)
    };
  }

  const speciesId = view[offset];
  const dexId = speciesId; // Gen 2 species IDs match National Dex index (1-251)

  const heldItemId = view[offset + 0x01];
  const heldItemName = getGen2ItemName(heldItemId);

  const moveIds = [
    view[offset + 2],
    view[offset + 3],
    view[offset + 4],
    view[offset + 5]
  ];
  const moves = moveIds.map(id => GEN2_MOVES_LIST[id] || "-");

  const originalTrainerId = getUInt16BigEndian(view, offset + 6);
  const exp = getUInt24BigEndian(view, offset + 8);

  const hpEv = getUInt16BigEndian(view, offset + 11);
  const atkEv = getUInt16BigEndian(view, offset + 13);
  const defEv = getUInt16BigEndian(view, offset + 15);
  const spdEv = getUInt16BigEndian(view, offset + 17);
  const spcEv = getUInt16BigEndian(view, offset + 19);

  const ivByte1 = view[offset + 21];
  const ivByte2 = view[offset + 22];

  const atkIv = (ivByte1 >> 4) & 0xF;
  const defIv = ivByte1 & 0xF;
  const spdIv = (ivByte2 >> 4) & 0xF;
  const spcIv = ivByte2 & 0xF;
  const hpIv = ((atkIv & 1) << 3) | ((defIv & 1) << 2) | ((spdIv & 1) << 1) | (spcIv & 1);

  const pps = [
    view[offset + 23] & 0x3F,
    view[offset + 24] & 0x3F,
    view[offset + 25] & 0x3F,
    view[offset + 26] & 0x3F
  ];

  const ppUps = [
    view[offset + 23] >> 6,
    view[offset + 24] >> 6,
    view[offset + 25] >> 6,
    view[offset + 26] >> 6
  ];

  const friendship = view[offset + 27];
  const pokerus = view[offset + 28];
  const level = view[offset + 31];

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
    status: isParty ? decodeStatus(view[offset + 32]) : "OK",
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
    raw,
    startOffset: offset,
    nicknameRaw,
    otNameRaw
  };
}

export function parseItemsPocketGen2(view: Uint8Array, start: number, countIdx: number, size: number, maxCap: number): Item[] {
  const count = view[countIdx];
  const items: Item[] = [];
  let curr = start;

  for (let i = 0; i < count && i < maxCap; i++) {
    const id = view[curr];
    const qty = size === 2 ? view[curr + 1] : 1;
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

export function parsePCBoxGen2(view: Uint8Array, offset: number): PokemonStats[] {
  const count = view[offset];
  const list: PokemonStats[] = [];
  if (count === 0 || count > 20) return list;

  const speciesListOffset = offset + 1;
  const pokemonStructStart = offset + 22; // 1 (count) + 21 (species list + 0xFF terminator)

  for (let i = 0; i < count; i++) {
    const speciesId = view[speciesListOffset + i];
    if (speciesId === 0xFF) break;

    const structOffset = pokemonStructStart + (i * 32);
    const otNamesStart = pokemonStructStart + (20 * 32) + (i * 11);
    const nicknamesStart = pokemonStructStart + (20 * 32) + (20 * 11) + (i * 11);

    const nicknameRaw = view.slice(nicknamesStart, nicknamesStart + 11);
    const otNameRaw = view.slice(otNamesStart, otNamesStart + 11);

    const nickname = decodeText(nicknameRaw, 0, 11);
    const otName = decodeText(otNameRaw, 0, 11);

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

export function parseGen2Save(data: Uint8Array, originalFilename: string = "save.sav"): ParsedSave {
  if (data.length < 32768) {
    throw new Error(`Invalid save file size: ${data.length} bytes. Gen 2 saves must be at least 32KB.`);
  }

  // Detect GSC format version using primary checksums
  const gsSumComputed = calculateGen2Checksum(data, 0x2009, 0x2D68);
  const gsSumStored = data[0x2D69] | (data[0x2D6A] << 8);

  const crySumComputed = calculateGen2Checksum(data, 0x2009, 0x2B82);
  const crySumStored = data[0x2D0D] | (data[0x2D0E] << 8);

  let gameVersion: 'Gold' | 'Silver' | 'Crystal' = 'Gold';
  let isChecksumValid = false;

  const lowerFilename = originalFilename.toLowerCase();

  if (lowerFilename.includes('crystal')) {
    if (crySumComputed === crySumStored && crySumStored !== 0) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    } else if (gsSumComputed === gsSumStored && gsSumStored !== 0) {
      gameVersion = 'Gold';
      isChecksumValid = true;
    } else {
      gameVersion = 'Crystal';
      isChecksumValid = false;
    }
  } else if (lowerFilename.includes('silver')) {
    gameVersion = 'Silver';
    if (gsSumComputed === gsSumStored && gsSumStored !== 0) {
      isChecksumValid = true;
    } else if (crySumComputed === crySumStored && crySumStored !== 0) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    }
  } else if (lowerFilename.includes('gold')) {
    gameVersion = 'Gold';
    if (gsSumComputed === gsSumStored && gsSumStored !== 0) {
      isChecksumValid = true;
    } else if (crySumComputed === crySumStored && crySumStored !== 0) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    }
  } else {
    // No clear filename indicator. Trust checksums.
    if (gsSumComputed === gsSumStored && gsSumStored !== 0) {
      gameVersion = 'Gold';
      isChecksumValid = true;
    } else if (crySumComputed === crySumStored && crySumStored !== 0) {
      gameVersion = 'Crystal';
      isChecksumValid = true;
    } else {
      // Neither checksum validates — do not default to a version
      // Return as invalid rather than guessing a corrupted file's game version
      gameVersion = 'Gold';
      isChecksumValid = false;
    }
  }

  // --- Parse Trainer Info ---
  const tid = getUInt16BigEndian(data, 0x2009);
  const trainerNameRaw = data.slice(0x200B, 0x2013);
  const trainerName = decodeText(trainerNameRaw, 0, 8);

  const money = parseBCD(data, 0x23DB, 3);
  const coins = parseBCD(data, 0x23E1, 2);
  const badges = data[0x23E4] | (data[0x23E5] << 8);

  const hours = (data[0x2051] << 8) | data[0x2052];
  const minutes = data[0x2053] || 0;
  const seconds = data[0x2054] || 0;
  const playTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const genderByte = data[0x3E3D] || 0;
  const trainerGender: 'Male' | 'Female' = genderByte === 1 ? 'Female' : 'Male';

  const trainer: TrainerInfo = {
    name: trainerName,
    id: tid.toString().padStart(5, '0'),
    money,
    coins,
    playTime,
    badges,
    gender: trainerGender,
  };

  // --- Parse Party Pokémon ---
  const partyCount = data[0x288A];
  const partyList: PokemonStats[] = [];

  for (let i = 0; i < partyCount && i < 6; i++) {
    const structOffset = 0x2892 + (i * 48);
    const otNamesStart = 0x29B2 + (i * 11);
    const nicknamesStart = 0x29F4 + (i * 11);

    const nicknameRaw = data.slice(nicknamesStart, nicknamesStart + 11);
    const otNameRaw = data.slice(otNamesStart, otNamesStart + 11);

    const nickname = decodeText(nicknameRaw, 0, 11);
    const otName = decodeText(otNameRaw, 0, 11);

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

  // --- Parse Inventory ---
  const pocketItems = parseItemsPocketGen2(data, 0x23E7, 0x23E6, 2, 20); // Normal items count at 0x23E6
  const keyItems = parseItemsPocketGen2(data, 0x2412, 0x2411, 1, 25);   // Key items (no quantity byte)
  const balls = parseItemsPocketGen2(data, 0x242E, 0x242C, 2, 12);       // Poké Balls count at 0x242C
  const pcItems = parseItemsPocketGen2(data, 0x24AD, 0x24AC, 2, 50);     // PC items

  // --- Parse Pokedex ---
  const pokedexOwnedChecked = getPokedexFlagsGen2(data, 0x2A14);
  const pokedexSeenChecked = getPokedexFlagsGen2(data, 0x2A3C);
  
  const pokedexOwned = pokedexOwnedChecked.filter(Boolean).length;
  const pokedexSeen = pokedexSeenChecked.filter(Boolean).length;

  // --- Parse PC Boxes ---
  // Bank 2 (0x4000) holds boxes 1-7, Bank 3 (0x6000) holds boxes 8-14
  const pcBoxes: PokemonStats[][] = [];
  for (let boxIdx = 0; boxIdx < 14; boxIdx++) {
    const boxOffset = boxIdx < 7
      ? 0x4000 + (boxIdx * 1102)
      : 0x6000 + ((boxIdx - 7) * 1102);

    pcBoxes.push(parsePCBoxGen2(data, boxOffset));
  }

  // Active PC box ID (starts at 1 in some fields, let's standardise 0-13 indices)
  const currentBoxIdValue = data[0x2724] !== undefined ? (data[0x2724] & 0x7F) : 0;
  const currentBoxId = Math.max(0, Math.min(13, currentBoxIdValue));

  const currentBoxCount = pcBoxes[currentBoxId]?.length || 0;
  const currentBoxPokemon = pcBoxes[currentBoxId] || [];

  // Option parsing for GSC
  const optionsByte = data[0x2000];
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
    eventFlags: [],
    rawData: data
  };
}
