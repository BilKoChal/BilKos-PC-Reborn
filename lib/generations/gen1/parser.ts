
import { ParsedSave, ParserResult, PokemonStats, Item, HallOfFameTeam, HallOfFamePokemon, GameVersion, GameOptions, Gen1Extension, Gen1SaveExtension } from '../../parser/types';
import { decodeText } from '../../utils/textDecoder';
import { 
    getUInt16BigEndian, 
    getUInt24BigEndian, 
    parseBCD, 
    countSetBits, 
    decodeStatus,
    getAsciiString
} from '../../utils/byteHelpers';
import { GEN1_INTERNAL_TO_DEX, getGen1Offsets, detectGen1Region, Gen1Region, Gen1OffsetsConfig } from './data/offsets';
import { getPokemonName } from './data/pokemonNames';
import { getTypeName } from './data/pokemonTypes';
import { getMoveName } from './data/moves';
import { getItemName } from './data/items';
import { getPokemonTypes } from './data/pokemonTypes';
import { GEN1_BASE_STATS } from './data/baseStats';
import { calculateGen1Stat } from '../../utils/statCalculator';

// --- Gen 1 Parsing Logic (Consolidated with Japanese support) ---

// Re-exports from data/offsets for backward compatibility
export { getGen1Offsets, detectGen1Region } from './data/offsets';
export type { Gen1Region, Gen1OffsetsConfig } from './data/offsets';

/**
 * Backward-compatible wrapper for detectGen1Region.
 * Returns true if the save is Japanese.
 */
export function isSaveJapanese(view: Uint8Array): boolean {
  return detectGen1Region(view) === 'japanese';
}

function getPokedexFlags(data: Uint8Array, start: number): boolean[] {
  const flags: boolean[] = [];
  flags.push(false); 

  for (let i = 0; i < 152; i++) {
     const byteIndex = Math.floor(i / 8);
     const bitIndex = i % 8;
     
     if (byteIndex < 19) {
        const byte = data[start + byteIndex]!;
        flags.push((byte & (1 << bitIndex)) !== 0);
     } else {
        flags.push(false);
     }
  }
  return flags;
}

function getEventFlags(data: Uint8Array, start: number): boolean[] {
    const flags: boolean[] = [];
    // Gen 1 Missable Objects array is 32 bytes (256 bits)
    for (let i = 0; i < 256; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        const byte = data[start + byteIndex]!;
        flags.push((byte & (1 << bitIndex)) !== 0);
    }
    return flags;
}

function parseItems(view: Uint8Array, startOffset: number, maxCapacity: number = 20): Item[] {
  const count = view[startOffset]!;
  const items: Item[] = [];
  
  let currentOffset = startOffset + 1;
  for (let i = 0; i < count && i < maxCapacity; i++) {
    const itemId = view[currentOffset]!;
    const quantity = view[currentOffset + 1]!;
    
    if (itemId === 0xFF) break;

    items.push({
      id: itemId,
      name: getItemName(itemId),
      count: quantity
    });
    
    currentOffset += 2;
  }
  return items;
}

function parsePokemonStruct(
  view: Uint8Array, 
  offset: number, 
  isParty: boolean, 
  nickname: string, 
  otName: string,
  nicknameRaw: Uint8Array, 
  otNameRaw: Uint8Array
): PokemonStats {
  // Bounds checking: ensure we have enough bytes to read the base structure
  const minBytes = isParty ? 44 : 33;
  if (offset + minBytes > view.length) {
    console.warn(`parsePokemonStruct: Offset 0x${offset.toString(16)} + ${minBytes} exceeds buffer length ${view.length}. Returning empty Pokemon.`);
    return {
      pid: 0, speciesId: 0, dexId: 0, speciesName: '???', nickname: nickname || '???', isNicknamed: false,
      form: 0, originalTrainerName: otName || '???', originalTrainerId: 0, secretId: 0,
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
  const dexId = GEN1_INTERNAL_TO_DEX[speciesId] ?? 0;

  const catchRate = view[offset + 0x07]!;

  const moveIds = [
      view[offset + 8]!,
      view[offset + 9]!,
      view[offset + 10]!,
      view[offset + 11]!
  ];

  const moves = moveIds.map(id => getMoveName(id));

  const pps = [
      view[offset + 29]! & 0x3F,
      view[offset + 30]! & 0x3F,
      view[offset + 31]! & 0x3F,
      view[offset + 32]! & 0x3F
  ];
  
  const ppUps = [
      view[offset + 29]! >> 6,
      view[offset + 30]! >> 6,
      view[offset + 31]! >> 6,
      view[offset + 32]! >> 6
  ];

  const originalTrainerId = getUInt16BigEndian(view, offset + 0x0C);

  const hpEv = getUInt16BigEndian(view, offset + 0x11);
  const atkEv = getUInt16BigEndian(view, offset + 0x13);
  const defEv = getUInt16BigEndian(view, offset + 0x15);
  const spdEv = getUInt16BigEndian(view, offset + 0x17);
  const spcEv = getUInt16BigEndian(view, offset + 0x19);

  const ivByte1 = view[offset + 0x1B]!;
  const ivByte2 = view[offset + 0x1C]!;

  const atkIv = (ivByte1 >> 4) & 0xF;
  const defIv = ivByte1 & 0xF;
  const spdIv = (ivByte2 >> 4) & 0xF;
  const spcIv = ivByte2 & 0xF;
  const hpIv = ((atkIv & 1) << 3) | ((defIv & 1) << 2) | ((spdIv & 1) << 1) | (spcIv & 1);

  let currentHp = 0;
  let maxHp = 0;
  let attack = 0;
  let defense = 0;
  let speed = 0;
  let special = 0;
  
  let level = view[offset + 0x03]!; 

  if (isParty) {
      const partyLevel = view[offset + 33]!;
      if (partyLevel > 0) {
          level = partyLevel;
      }
      currentHp = getUInt16BigEndian(view, offset + 1);
      maxHp = getUInt16BigEndian(view, offset + 34);
      attack = getUInt16BigEndian(view, offset + 36);
      defense = getUInt16BigEndian(view, offset + 38);
      speed = getUInt16BigEndian(view, offset + 40);
      special = getUInt16BigEndian(view, offset + 42);
  } else {
      currentHp = getUInt16BigEndian(view, offset + 1);
      // For Box Pokemon, stats are not stored. We must calculate them using Base Stats + IVs + EVs.
      const base = GEN1_BASE_STATS[dexId];
      if (base) {
          maxHp = calculateGen1Stat(base.hp, hpIv, hpEv, level, true);
          attack = calculateGen1Stat(base.atk!, atkIv, atkEv, level, false);
          defense = calculateGen1Stat(base.def!, defIv, defEv, level, false);
          speed = calculateGen1Stat(base.spe!, spdIv, spdEv, level, false);
          special = calculateGen1Stat(base.spc!, spcIv, spcEv, level, false);
      } else {
          maxHp = currentHp; 
      }
  }

  const structSize = isParty ? 44 : 33;

  // Create Gen1 extension with generation-specific data
  const gen1Ext = new Gen1Extension();
  gen1Ext.catchRate = catchRate;
  gen1Ext.special = special;
  gen1Ext.pikachuFriendship = 0; // Set at save level for Yellow
  gen1Ext.isParty = isParty;
  gen1Ext.raw = view.slice(offset, offset + structSize);

  return {
    pid: 0,
    speciesId,
    dexId,
    speciesName: getPokemonName(dexId),
    nickname,
    isNicknamed: nickname !== getPokemonName(dexId),
    form: 0,
    originalTrainerName: otName,
    originalTrainerId,
    secretId: 0,
    originalTrainerGender: 'Male',
    level,
    exp: getUInt24BigEndian(view, offset + 14),
    friendship: 0,
    hp: currentHp,
    maxHp,
    attack,
    defense,
    speed,
    special,
    spAtk: special,
    spDef: special,
    type1: view[offset + 5]!,
    type2: view[offset + 6]!,
    type1Name: getTypeName(view[offset + 5]!),
    type2Name: getTypeName(view[offset + 6]!),
    status: decodeStatus(view[offset + 4]!),
    catchRate: catchRate,
    moves,
    moveIds,
    movePp: pps,
    movePpUps: ppUps,
    isParty,
    isEgg: false,
    isShiny: false,
    gender: 'Genderless',
    pokerus: 0,
    genExtension: gen1Ext,
    
    iv: { hp: hpIv, attack: atkIv, defense: defIv, speed: spdIv, special: spcIv, spAtk: spcIv, spDef: spcIv },
    ev: { hp: hpEv, attack: atkEv, defense: defEv, speed: spdEv, special: spcEv, spAtk: spcEv, spDef: spcEv },
    
    raw: view.slice(offset, offset + structSize),
    startOffset: offset,
    nicknameRaw: nicknameRaw.slice(0),
    otNameRaw: otNameRaw.slice(0)
  };
}

function parseBox(view: Uint8Array, boxStart: number, offsets: Gen1OffsetsConfig, isJapanese: boolean): PokemonStats[] {
    const boxPokemon: PokemonStats[] = [];
    const boxCount = view[boxStart]!;
    const monCount = offsets.BOX_MON_COUNT;
    
    if (boxCount > monCount) return []; 

    const boxStructSize = offsets.BOX_MON_SIZE; // 33 bytes
    const boxStructsStart = boxStart + 1 + (monCount + 1); // e.g. 1 + 21 = 22 indices
    const boxOtNamesStart = boxStructsStart + (monCount * boxStructSize);
    const boxNicknamesStart = boxOtNamesStart + (monCount * offsets.STR_LEN);

    for (let i = 0; i < boxCount; i++) {
        const currentStruct = boxStructsStart + (i * boxStructSize);
        const currentNickOffset = boxNicknamesStart + (i * offsets.STR_LEN);
        const currentOtOffset = boxOtNamesStart + (i * offsets.STR_LEN);
        
        const nickname = decodeText(view, currentNickOffset, offsets.STR_LEN, isJapanese);
        const otName = decodeText(view, currentOtOffset, offsets.STR_LEN, isJapanese);
        
        const nicknameRaw = view.slice(currentNickOffset, currentNickOffset + offsets.STR_LEN);
        const otNameRaw = view.slice(currentOtOffset, currentOtOffset + offsets.STR_LEN);

        const pokemon = parsePokemonStruct(view, currentStruct, false, nickname, otName, nicknameRaw, otNameRaw);
        
        boxPokemon.push(pokemon);
    }
    return boxPokemon;
}

function parseDaycare(view: Uint8Array, offsets: Gen1OffsetsConfig, isJapanese: boolean): PokemonStats | undefined {
    const inUse = view[offsets.DAYCARE_IN_USE]!;
    if (inUse === 0) return undefined;

    const nickname = decodeText(view, offsets.DAYCARE_NAME, offsets.STR_LEN, isJapanese);
    const otName = decodeText(view, offsets.DAYCARE_OT, offsets.STR_LEN, isJapanese);
    const nicknameRaw = view.slice(offsets.DAYCARE_NAME, offsets.DAYCARE_NAME + offsets.STR_LEN);
    const otNameRaw = view.slice(offsets.DAYCARE_OT, offsets.DAYCARE_OT + offsets.STR_LEN);

    return parsePokemonStruct(
        view, 
        offsets.DAYCARE_MON, 
        false, 
        nickname, 
        otName, 
        nicknameRaw, 
        otNameRaw
    );
}

function parseOptions(view: Uint8Array, offsets: Gen1OffsetsConfig): GameOptions {
    const byte = view[offsets.OPTIONS]!;
    const battleAnimation = (byte & 0x80) ? 'Off' : 'On';
    const battleStyle = (byte & 0x40) ? 'Set' : 'Shift';
    const speedBits = byte & 0x7;
    let textSpeed: string = 'Normal';
    if (speedBits === 1) textSpeed = 'Fast';
    else if (speedBits === 5) textSpeed = 'Slow';
    else if (speedBits === 3) textSpeed = 'Normal';
    else textSpeed = speedBits.toString();
    
    const soundBits = (byte >> 4) & 0x3;
    let sound: 'Mono' | 'Stereo' | 'Earphone1' | 'Earphone2' | 'Earphone3' = 'Mono';
    if (soundBits === 0) sound = 'Mono';
    else if (soundBits === 1) sound = 'Earphone1'; 
    else if (soundBits === 2) sound = 'Earphone2';
    else if (soundBits === 3) sound = 'Earphone3';
    
    if (speedBits !== 0 && soundBits === 1) sound = 'Stereo';

    return { textSpeed, battleAnimation, battleStyle, sound };
}

function parseHallOfFame(view: Uint8Array, offsets: Gen1OffsetsConfig, isJapanese: boolean): HallOfFameTeam[] {
    const teams: HallOfFameTeam[] = [];
    const hofStart = offsets.HOF_DATA;
    const structSize = 16;
    const monsPerTeam = 6;
    const maxTeams = 50;
    const strLen = offsets.STR_LEN;

    for (let i = 0; i < maxTeams; i++) {
        const teamMons: HallOfFamePokemon[] = [];
        
        for (let j = 0; j < monsPerTeam; j++) {
            const offset = hofStart + (i * monsPerTeam * structSize) + (j * structSize);
            const speciesId = view[offset]!;
            const dexId = GEN1_INTERNAL_TO_DEX[speciesId] ?? 0;
            
            if (speciesId === 0 || speciesId === 0xFF || dexId === 0) continue;

            const level = view[offset + 1]!;
            const nickname = decodeText(view, offset + 2, strLen, isJapanese);
            const speciesName = getPokemonName(dexId);
            const finalNickname = (nickname && nickname.trim()) ? nickname : speciesName;

            teamMons.push({ speciesId, dexId, speciesName, nickname: finalNickname, level, types: getPokemonTypes(dexId) });
        }

        if (teamMons.length > 0) {
            teams.push({ id: i + 1, pokemon: teamMons });
        } else {
            break; 
        }
    }
    return teams.reverse();
}

export function detectGameVersion(view: Uint8Array, filename?: string): GameVersion {
  const potentialHeaderOffsets = [0x30, 0x134];
  for (const offset of potentialHeaderOffsets) {
      if (view.byteLength < offset + 16) continue;
      const title = getAsciiString(view, offset, 16).toUpperCase();
      if (title.startsWith("POKEMON")) {
          if (title.includes("RED")) return 'Red';
          if (title.includes("BLUE")) return 'Blue';
          if (title.includes("YELL")) return 'Yellow';
      }
  }
  // Safe pikachu friendship offset fallback
  const region = detectGen1Region(view);
  const offsets = getGen1Offsets(region);
  if (view.byteLength > offsets.PIKACHU_FRIENDSHIP) {
    const pikachuFriendship = view[offsets.PIKACHU_FRIENDSHIP]!;
    if (pikachuFriendship > 0) return 'Yellow';
  }
  if (filename) {
      const lower = filename.toLowerCase();
      if (lower.includes('yellow')) return 'Yellow';
      if (lower.includes('red')) return 'Red';
      if (lower.includes('blue')) return 'Blue';
  }
  return 'Red';
}

export function validateGen1Checksum(view: Uint8Array, customOffsets?: Gen1OffsetsConfig): boolean {
    const region = detectGen1Region(view);
    const offsets = customOffsets || getGen1Offsets(region);
    let sum = 0;
    for (let i = offsets.PLAYER_NAME; i <= 0x3522; i++) {
        sum += view[i]!;
    }
    const calculated = (~sum) & 0xFF;
    const actual = view[offsets.CHECKSUM]!;
    return calculated === actual;
}

export function parseGen1Save(buffer: Uint8Array, filename: string = "save.sav"): ParsedSave {
  const view = buffer; 
  const region = detectGen1Region(view);
  const offsets = getGen1Offsets(region);
  const isJapanese = region === 'japanese';
  const gameVersion = detectGameVersion(view, filename);

  const isValid = validateGen1Checksum(view, offsets);
  const name = decodeText(view, offsets.PLAYER_NAME, offsets.STR_LEN, isJapanese);
  const rivalName = decodeText(view, offsets.RIVAL_NAME, offsets.STR_LEN, isJapanese);
  const id = getUInt16BigEndian(view, offsets.PLAYER_ID).toString().padStart(5, '0');
  const money = parseBCD(view, offsets.MONEY, 3);
  const coins = parseBCD(view, offsets.CASINO_COINS, 2);
  const pikachuFriendship = view[offsets.PIKACHU_FRIENDSHIP];
  
  // Parse Yellow-only Surfing Pikachu high score (little-endian BCD)
  let pikachuSurfScore = 0;
  if (gameVersion === 'Yellow' && offsets.PIKACHU_SURF_RECORD !== undefined && view.length > offsets.PIKACHU_SURF_RECORD + 1) {
      const lowByte = view[offsets.PIKACHU_SURF_RECORD]!;
      const highByte = view[offsets.PIKACHU_SURF_RECORD + 1]!;
      const d1 = lowByte & 0x0F;
      const d2 = (lowByte >> 4) & 0x0F;
      const d3 = highByte & 0x0F;
      const d4 = (highByte >> 4) & 0x0F;
      pikachuSurfScore = d4 * 1000 + d3 * 100 + d2 * 10 + d1;
  }
  
  const hours = view[offsets.PLAY_TIME]!; 
  const minutes = view[offsets.PLAY_TIME + 2]!;
  const seconds = view[offsets.PLAY_TIME + 3]!;
  const playTime = `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  const badges = view[offsets.BADGES]!;
  
  const pokedexOwned = countSetBits(view, offsets.POKEDEX_OWNED, 19);
  const pokedexSeen = countSetBits(view, offsets.POKEDEX_SEEN, 19);
  const pokedexOwnedFlags = getPokedexFlags(view, offsets.POKEDEX_OWNED);
  const pokedexSeenFlags = getPokedexFlags(view, offsets.POKEDEX_SEEN);
  const eventFlags = getEventFlags(view, offsets.MISSABLE_OBJECTS);

  const options = parseOptions(view, offsets);
  const daycare = parseDaycare(view, offsets, isJapanese);
  const playerStarterId = GEN1_INTERNAL_TO_DEX[view[offsets.PLAYER_STARTER]!] ?? 0;
  const rivalStarterId = GEN1_INTERNAL_TO_DEX[view[offsets.RIVAL_STARTER]!] ?? 0;
  
  const mapData = {
      currentMapId: view[offsets.CURRENT_MAP]!,
      x: view[offsets.X_COORD]!,
      y: view[offsets.Y_COORD]!,
      lastMapId: view[offsets.LAST_MAP]!,
      warpedFromMap: view[offsets.WARPED_FROM_MAP]!
  };

  const partyCount = view[offsets.PARTY_DATA]!;
  const party: PokemonStats[] = [];
  const partyStart = offsets.PARTY_DATA;
  const partyStructSize = offsets.PARTY_MON_SIZE;
  const partyStructsStart = partyStart + 8;
  const partyOtNamesStart = offsets.PARTY_OT_NAMES;
  const partyNicknamesStart = offsets.PARTY_NICKNAMES;

  for (let i = 0; i < partyCount; i++) {
    const currentStruct = partyStructsStart + (i * partyStructSize);
    const currentNickOffset = partyNicknamesStart + (i * offsets.STR_LEN);
    const currentOtOffset = partyOtNamesStart + (i * offsets.STR_LEN);
    const nickname = decodeText(view, currentNickOffset, offsets.STR_LEN, isJapanese);
    const otName = decodeText(view, currentOtOffset, offsets.STR_LEN, isJapanese);
    const nicknameRaw = view.slice(currentNickOffset, currentNickOffset + offsets.STR_LEN);
    const otNameRaw = view.slice(currentOtOffset, currentOtOffset + offsets.STR_LEN);
    
    party.push(parsePokemonStruct(view, currentStruct, true, nickname, otName, nicknameRaw, otNameRaw));
  }

  const maxBoxes = offsets.boxCount;
  const currentBoxId = view[offsets.CURRENT_BOX_ID]! & 0x7F; 
  const allBoxes: PokemonStats[][] = [];
  for (let i = 0; i < maxBoxes; i++) {
      let boxOffset = 0;
      if (i < offsets.boxSplitIndex) boxOffset = offsets.PC_BANK_2_START + (i * offsets.BOX_STRUCT_SIZE);
      else boxOffset = offsets.PC_BANK_3_START + ((i - offsets.boxSplitIndex) * offsets.BOX_STRUCT_SIZE);
      allBoxes.push(parseBox(view, boxOffset, offsets, isJapanese));
  }
  
  // Guard currentBoxId to avoid out of bounds in Japanese games
  const safeBoxId = currentBoxId < maxBoxes ? currentBoxId : 0;
  allBoxes[safeBoxId] = parseBox(view, offsets.CURRENT_BOX_DATA, offsets, isJapanese);

  const bagItems = parseItems(view, offsets.ITEM_BAG, 20);
  const pcItems = parseItems(view, offsets.PC_ITEMS, 50);
  const hallOfFame = parseHallOfFame(view, offsets, isJapanese);

  // Create Gen1 save extension with generation-specific save data
  const gen1SaveExt = new Gen1SaveExtension();
  gen1SaveExt.daycare = daycare ? [daycare] : [];

  return {
    generation: 1,
    gameVersion: gameVersion,
    originalFilename: filename,
    fileSize: view.length,
    isValid: isValid,
    trainer: { name, id, money, coins, playTime, badges, rivalName, pikachuFriendship, pikachuSurfScore, gender: 'Male' },
    options,
    map: mapData,
    playerStarterId,
    rivalStarterId,
    pokedexOwned, pokedexSeen, pokedexOwnedFlags, pokedexSeenFlags,
    eventFlags,
    partyCount,
    party,
    currentBoxId: safeBoxId,
    currentBoxCount: allBoxes[safeBoxId].length,
    currentBoxPokemon: allBoxes[safeBoxId],
    pcBoxes: allBoxes,
    hallOfFame,
    items: bagItems,
    pcItems,
    rawData: view,
    genExtension: gen1SaveExt
  };
}

/**
 * Parses a standalone .pk1 file.
 * Supports:
 * - 66 bytes: Raw data (44 struct + 11 OT + 11 Nick)
 * - 69 bytes: PKHeX format (3 padding + 66 data)
 */
export function parsePk1(buffer: Uint8Array): PokemonStats | null {
    let view = buffer;

    // Handle 69-byte file (Header/Padding usually 0x00 0x00 0x00)
    // The actual data starts at index 3.
    if (buffer.length === 69) {
        view = buffer.slice(3); // Strip first 3 bytes
    } 
    else if (buffer.length !== 66) {
        console.error("Invalid .pk1 size", buffer.length);
        return null;
    }

    // After stripping, view should be 66 bytes.
    // 0-43: Pokemon Struct (44 bytes)
    // 44-54: OT Name (11 bytes)
    // 55-65: Nickname (11 bytes)

    const otNameOffset = 44;
    const nickOffset = 55;

    const otName = decodeText(view, otNameOffset, 11);
    const nickname = decodeText(view, nickOffset, 11);
    const otRaw = view.slice(otNameOffset, otNameOffset + 11);
    const nickRaw = view.slice(nickOffset, nickOffset + 11);

    // Treat as Party Mon (isParty=true) to parse stats if present
    return parsePokemonStruct(view, 0, true, nickname, otName, nickRaw, otRaw);
}
