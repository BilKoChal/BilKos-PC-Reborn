import { logger } from '../../utils/logger';

import { ParsedSave, ParserResult, PokemonStats, Item, HallOfFameTeam, HallOfFamePokemon, GameVersion, GameOptions, Gen1Extension, Gen1SaveExtension, createEmptyCanonicalPokemon } from '../../parser/types';
import { GameBoyTextCodec } from '../../utils/GameBoyTextCodec';
// Codec instances for Gen 1 text decoding.
const _codecInt = new GameBoyTextCodec('international');
const _codecJpn = new GameBoyTextCodec('japanese');
/** Decode Game Boy text using the authoritative codec. */
function decodeText(buffer: Uint8Array, offset: number, maxLength: number, isJapanese?: boolean): string {
  return (isJapanese ? _codecJpn : _codecInt).decode(buffer, offset, maxLength);
}
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
    // Gen 1 event flags: 2560 flags (320 bytes) — covers all story events,
    // NPC interactions, item pickups, and cutscene triggers.
    // The Missable Objects offset points into the larger event flag array.
    const EVENT_FLAG_BYTES = 320;
    const totalFlags = EVENT_FLAG_BYTES * 8;
    for (let i = 0; i < totalFlags; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        if (start + byteIndex >= data.length) {
            flags.push(false);
            continue;
        }
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
    logger.warn(`parsePokemonStruct: Offset 0x${offset.toString(16)} + ${minBytes} exceeds buffer length ${view.length}. Returning empty Pokemon.`);
    return createEmptyCanonicalPokemon({
      nickname: nickname || '???',
      originalTrainerName: otName || '???',
      isParty,
      startOffset: offset,
      nicknameRaw: nicknameRaw || new Uint8Array(0),
      otNameRaw: otNameRaw || new Uint8Array(0),
    });
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

    // BUG-G16 fix: Gen 1 uses a SINGLE bit (bit 3) for sound: 0=Mono, 1=Stereo.
    // The Earphone1/2/3 options (bits 4-5) are Gen 2-only — they don't exist in
    // R/B/Y. The old code read bits 4-5 and mapped them to Earphone1/2/3, then
    // used a fragile heuristic (`speedBits !== 0 && soundBits === 1 → Stereo`)
    // to recover Stereo. This produced wrong sound values for most saves.
    // Now we correctly read only bit 3.
    const sound: 'Mono' | 'Stereo' = (byte & 0x08) ? 'Stereo' : 'Mono';

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
    // The Gen 1 main-data checksum covers [PLAYER_NAME .. CHECKSUM-1] and is
    // stored in the byte at CHECKSUM. International and Japanese saves place the
    // checksum byte at DIFFERENT offsets (the JP main-data block is laid out
    // differently), so the range END must be derived from the region's CHECKSUM
    // offset rather than hardcoded. (Previously hardcoded to 0x3522 = INT only,
    // which made every Japanese save fail validation → "no compatible adapter".)
    const checksumByte = offsets.CHECKSUM;
    let sum = 0;
    for (let i = offsets.PLAYER_NAME; i < checksumByte; i++) {
        sum += view[i]!;
    }
    const calculated = (~sum) & 0xFF;
    const actual = view[checksumByte]!;
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
  const maxFlag = view[offsets.PLAY_TIME + 1]!;
  const minutes = view[offsets.PLAY_TIME + 2]!;
  const seconds = view[offsets.PLAY_TIME + 3]!;
  const displayHours = maxFlag !== 0 ? '255+' : hours.toString();
  const playTime = `${displayHours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
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
 *
 * Supports multiple .pk1 formats for maximum compatibility:
 * - 69 bytes: PKHeX PokeList1 International (count + species + terminator + 44-byte party struct + 11-byte OT + 11-byte nick)
 * - 59 bytes: PKHeX PokeList1 Japanese (count + species + terminator + 44-byte party struct + 6-byte OT + 6-byte nick)
 * - 66 bytes: Legacy format (44 struct + 11 OT + 11 Nick, no PokeList header)
 * - 44 bytes: Raw party struct (no OT/nickname)
 * - 33 bytes: Raw box struct (no OT/nickname)
 *
 * The species byte in the PokeList1 header uses Gen 1 INTERNAL species IDs
 * (not National Dex!). Must convert via GEN1_INTERNAL_TO_DEX.
 * Pokemon data is ALWAYS party format (44 bytes) in .pk1 files.
 */
export function parsePk1(buffer: Uint8Array): PokemonStats | null {
    const SIZE_1PARTY = 44;
    const SIZE_1STORED = 33;

    // Detect format based on file size
    if (buffer.length === 69) {
      // PKHeX PokeList1 International format
      // Byte 0: Count (should be 1)
      // Byte 1: Species (Gen 1 internal ID)
      // Byte 2: Terminator (0xFF)
      // Bytes 3-46: Pokemon data (party format, 44 bytes)
      // Bytes 47-57: OT Name (11 bytes)
      // Bytes 58-68: Nickname (11 bytes)
      const count = buffer[0];
      if (count !== 1) {
        logger.warn(`parsePk1: Unexpected count byte: ${count}. Expected 1.`);
      }
      const speciesInternal = buffer[1]!; // Gen 1 internal species ID
      const dexId = GEN1_INTERNAL_TO_DEX[speciesInternal] ?? speciesInternal;

      const monData = buffer.slice(3, 3 + SIZE_1PARTY);
      const otRaw = buffer.slice(3 + SIZE_1PARTY, 3 + SIZE_1PARTY + 11);
      const nickRaw = buffer.slice(3 + SIZE_1PARTY + 11, 3 + SIZE_1PARTY + 22);

      const otName = decodeText(otRaw, 0, 11);
      const nickname = decodeText(nickRaw, 0, 11);

      const mon = parsePokemonStruct(monData, 0, true, nickname, otName, nickRaw, otRaw);

      // Override dexId since the struct's speciesId is internal ID
      if (mon.speciesId !== dexId && dexId > 0) {
        mon.dexId = dexId;
        mon.speciesName = getPokemonName(dexId);
      }

      return mon;
    }

    if (buffer.length === 59) {
      // PKHeX PokeList1 Japanese format
      const count = buffer[0];
      if (count !== 1) {
        logger.warn(`parsePk1: Unexpected count byte: ${count}. Expected 1.`);
      }
      const speciesInternal = buffer[1]!;
      const dexId = GEN1_INTERNAL_TO_DEX[speciesInternal] ?? speciesInternal;

      const monData = buffer.slice(3, 3 + SIZE_1PARTY);
      const otRaw = buffer.slice(3 + SIZE_1PARTY, 3 + SIZE_1PARTY + 6);
      const nickRaw = buffer.slice(3 + SIZE_1PARTY + 6, 3 + SIZE_1PARTY + 12);

      const otName = decodeText(otRaw, 0, 6, true);
      const nickname = decodeText(nickRaw, 0, 6, true);

      const mon = parsePokemonStruct(monData, 0, true, nickname, otName, nickRaw, otRaw);

      if (mon.speciesId !== dexId && dexId > 0) {
        mon.dexId = dexId;
        mon.speciesName = getPokemonName(dexId);
      }

      return mon;
    }

    if (buffer.length === 66) {
      // Legacy format: 44 bytes struct + 11 OT + 11 Nick (no PokeList header)
      const otNameOffset = 44;
      const nickOffset = 55;

      const otName = decodeText(buffer, otNameOffset, 11);
      const nickname = decodeText(buffer, nickOffset, 11);
      const otRaw = buffer.slice(otNameOffset, otNameOffset + 11);
      const nickRaw = buffer.slice(nickOffset, nickOffset + 11);

      return parsePokemonStruct(buffer, 0, true, nickname, otName, nickRaw, otRaw);
    }

    if (buffer.length === 44) {
      // Raw party struct (no OT/nickname)
      const otRaw = new Uint8Array(11).fill(0x50);
      const nickRaw = new Uint8Array(11).fill(0x50);
      return parsePokemonStruct(buffer, 0, true, '?????', '?????', nickRaw, otRaw);
    }

    if (buffer.length === 33) {
      // Raw box struct (no OT/nickname)
      const otRaw = new Uint8Array(11).fill(0x50);
      const nickRaw = new Uint8Array(11).fill(0x50);
      return parsePokemonStruct(buffer, 0, false, '?????', '?????', nickRaw, otRaw);
    }

    logger.error("Invalid .pk1 size", buffer.length);
    return null;
}
