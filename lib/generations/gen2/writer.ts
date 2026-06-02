import { ParsedSave, PokemonStats, Item, isGen2Extension, isGen2SaveExtension, Gen2SaveExtension, assertCurrentBoxInSync } from '../../parser/types';
import { 
  setUInt16BigEndian, 
  setUInt24BigEndian, 
  setBCD,
  encodeStatusByte
} from '../../utils/byteHelpers';
import { calculateGen2Checksum } from './parser';
import { GameBoyTextCodec } from '../../utils/GameBoyTextCodec';
// Codec instances for Gen 2 text encoding — replaces encodeGameBoyText/sanitizePokemonText
const _codecInt = new GameBoyTextCodec('international');
const _codecJpn = new GameBoyTextCodec('japanese');
const _codecKor = new GameBoyTextCodec('korean');
/** Get the correct codec for the given region. */
function getCodec(isJapanese?: boolean, isKorean?: boolean): GameBoyTextCodec {
  if (isKorean) return _codecKor;
  return isJapanese ? _codecJpn : _codecInt;
}
/**
 * Resolve the region-correct codec from the active offset config.
 *
 * BUG FIX (TODO 2.4): the text-writing helpers below used to call
 * encodeGameBoyText()/sanitizePokemonText() WITHOUT a region flag, so every
 * JPN/KOR save had its nicknames, OT names, rival name, box names, daycare and
 * phone-contact text written with the International charmap → corrupted text on
 * export. The region is fully determined by the offset config the writer already
 * has in scope: JPN uses 6-byte strings, KOR uses a 17-byte box-name entry.
 * Routing all region-aware encodes through this resolver also fixes the latent
 * Korean gap (encodeGameBoyText only forwarded `isJapanese`, never `isKorean`).
 */
function codecForOffsets(offsets: Gen2OffsetsConfig): GameBoyTextCodec {
  const isJapanese = offsets.stringLength === 6;
  const isKorean = offsets.boxNameEntrySize === 17;
  return getCodec(isJapanese, isKorean);
}
import { 
  getGen2Offsets, 
  getBoxOffset, 
  computeBoxChecksum,
  type Gen2OffsetsConfig,
  type Gen2Version, 
  type Gen2Region 
} from './data/offsets';
import { GEN2_MOVES_LIST } from './data/constants';

export function writeGen2PokemonStruct(
  data: Uint8Array, 
  offset: number, 
  mon: PokemonStats, 
  isParty: boolean
) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // 1. Species ID
  data[offset] = mon.speciesId;

  // 2. Held Item ID
  data[offset + 1] = mon.heldItemId !== undefined ? mon.heldItemId : (mon.raw && mon.raw[1] !== undefined ? mon.raw[1]! : 0);

  // 3. Move IDs
  for (let m = 0; m < 4; m++) {
    const moveId = mon.moveIds && mon.moveIds[m] !== undefined ? mon.moveIds[m]! : 0;
    data[offset + 2 + m] = moveId;
  }

  // 4. OT ID (2 bytes Big Endian)
  setUInt16BigEndian(view, offset + 6, mon.originalTrainerId);

  // 5. Experience (3 bytes Big Endian)
  setUInt24BigEndian(view, offset + 8, mon.exp);

  // 6. Stat EVs (5 fields of 2 bytes = 10 bytes)
  setUInt16BigEndian(view, offset + 11, mon.ev.hp);
  setUInt16BigEndian(view, offset + 13, mon.ev.attack);
  setUInt16BigEndian(view, offset + 15, mon.ev.defense);
  setUInt16BigEndian(view, offset + 17, mon.ev.speed);
  setUInt16BigEndian(view, offset + 19, mon.ev.special);

  // 7. DVs / IVs (2 bytes)
  const atkIv = mon.iv.attack;
  const defIv = mon.iv.defense;
  const spdIv = mon.iv.speed;
  const spcIv = mon.iv.special;

  data[offset + 21] = ((atkIv & 0xF) << 4) | (defIv & 0xF);
  data[offset + 22] = ((spdIv & 0xF) << 4) | (spcIv & 0xF);

  // 8. Move PP & PP Ups (4 bytes)
  for (let m = 0; m < 4; m++) {
    const pps = mon.movePp && mon.movePp[m] !== undefined ? mon.movePp[m]! : 0;
    const ups = mon.movePpUps && mon.movePpUps[m] !== undefined ? mon.movePpUps[m]! : 0;
    data[offset + 23 + m] = (ups << 6) | (pps & 0x3F);
  }

  // 9. Friendship / Egg Cycles (dual-purpose byte at offset + 27)
  // For eggs: this byte stores the hatch counter (egg cycles remaining)
  // For hatched Pokemon: this byte stores friendship/happiness
  if (mon.isEgg) {
    // D2: Use isGen2Extension type guard instead of `as Gen2Extension` + `generation === 2` check
    const gen2Ext = isGen2Extension(mon.genExtension) ? mon.genExtension : null;
    const eggCycles = (gen2Ext && gen2Ext.eggCycles > 0) 
      ? gen2Ext.eggCycles 
      : (mon.raw && mon.raw[27] !== undefined ? mon.raw[27]! : 0);
    data[offset + 27] = eggCycles;
  } else {
    data[offset + 27] = mon.friendship !== undefined ? mon.friendship : 70;
  }
  data[offset + 28] = mon.pokerus !== undefined ? mon.pokerus : 0;

  // 9b. Phase 3: Write CaughtData (Crystal only) — bytes 0x1D-0x1E
  // D2: Use isGen2Extension type guard instead of `as Gen2Extension` + `generation === 2` check
  const gen2Ext = isGen2Extension(mon.genExtension) ? mon.genExtension : null;
  if (gen2Ext && gen2Ext.caughtData !== undefined && gen2Ext.caughtData !== 0) {
    data[offset + 0x1D] = (gen2Ext.caughtData >> 8) & 0xFF;
    data[offset + 0x1E] = gen2Ext.caughtData & 0xFF;
  }

  // 10. Level
  data[offset + 31] = mon.level;

  if (isParty) {
    // 11. Status condition
    // BUG FIX (TODO 2.2): previously hardcoded to 0, healing every non-OK
    // party Pokémon on export. Encode the canonical status back, preserving
    // the original raw byte (incl. sleep-turn counter) when unchanged.
    data[offset + 32] = encodeStatusByte(mon.status, mon.raw && mon.raw[32] !== undefined ? mon.raw[32] : undefined);
    data[offset + 33] = 0; // Unused padding

    // 12. Stats
    setUInt16BigEndian(view, offset + 34, mon.hp);
    setUInt16BigEndian(view, offset + 36, mon.maxHp);
    setUInt16BigEndian(view, offset + 38, mon.attack);
    setUInt16BigEndian(view, offset + 40, mon.defense);
    setUInt16BigEndian(view, offset + 42, mon.speed);
    setUInt16BigEndian(view, offset + 44, mon.spAtk);
    setUInt16BigEndian(view, offset + 46, mon.spDef);
  }
}

export function writeInventoryPocketGen2(
  data: Uint8Array, 
  countIdx: number, 
  start: number, 
  size: number, 
  maxCap: number, 
  items: Item[]
) {
  const count = Math.min(items.length, maxCap);
  data[countIdx] = count;

  let curr = start;
  for (let i = 0; i < count; i++) {
    const item = items[i]!;
    data[curr] = item.id;
    if (size === 2) {
      data[curr + 1] = item.count;
    }
    curr += size;
  }
  // Terminator
  data[curr] = 0xFF;
}

/**
 * Write a PC box using the offset system.
 * The box layout matches parsePCBoxGen2:
 *   [count:1] [speciesList:boxSlotCount+1] [bodies:boxSlotCount*32] [otNames:boxSlotCount*strLen] [nicknames:boxSlotCount*strLen]
 */
export function writePCBoxGen2(data: Uint8Array, offset: number, pokemonList: PokemonStats[], offsets: Gen2OffsetsConfig) {
  const slotCount = offsets.boxSlotCount;
  const strLen = offsets.stringLength;
  const count = Math.min(pokemonList.length, slotCount);
  data[offset] = count;

  const speciesListOffset = offset + 1;
  const pokemonStructStart = offset + 1 + (slotCount + 1); // count + species list + 0xFF terminator

  // Write species list
  // For egg Pokemon, the species list header must be 0xFD (253),
  // while the struct body contains the hatched species ID.
  for (let i = 0; i < count; i++) {
    const mon = pokemonList[i]!;
    data[speciesListOffset + i] = mon.isEgg ? 0xFD : mon.speciesId;
  }
  data[speciesListOffset + count] = 0xFF;

  // Clear remaining species slots
  for (let i = count + 1; i < slotCount; i++) {
    data[speciesListOffset + i] = 0x00;
  }

  // Write Pokémon structures, OT name list, and Nicknames list
  for (let i = 0; i < slotCount; i++) {
    const structOffset = pokemonStructStart + (i * 32);
    const otNamesOffset = pokemonStructStart + (slotCount * 32) + (i * strLen);
    const nicknamesOffset = pokemonStructStart + (slotCount * 32) + (slotCount * strLen) + (i * strLen);

    if (i < count) {
      const mon = pokemonList[i]!;
      
      // Write internal structure
      writeGen2PokemonStruct(data, structOffset, mon, false);

      // Encode text strings and write (region-correct codec — TODO 2.4)
      const codec = codecForOffsets(offsets);
      const nicknameBuffer = codec.encode(mon.nickname || "", strLen, 0x50);
      const otNameBuffer = codec.encode(mon.originalTrainerName || "", strLen, 0x50);

      data.set(nicknameBuffer, nicknamesOffset);
      data.set(otNameBuffer, otNamesOffset);
    } else {
      // Clear unused slots
      for (let j = 0; j < 32; j++) data[structOffset + j] = 0x00;
      for (let j = 0; j < strLen; j++) {
        data[otNamesOffset + j] = 0x00;
        data[nicknamesOffset + j] = 0x00;
      }
    }
  }
}

// ============================================================================
// Phase 2: Missing Save Section Writers
// ============================================================================

/**
 * Write the rival's name back to the save file.
 * The rival name is stored at offsets.rivalName using standard Game Boy
 * text encoding. We only write if the trainer info has a rivalName set.
 */
function writeGen2RivalName(data: Uint8Array, offsets: Gen2OffsetsConfig, rivalName: string | undefined) {
  if (!rivalName) return;
  const rivalBuf = codecForOffsets(offsets).encode(rivalName, offsets.stringLength, 0x50);
  data.set(rivalBuf, offsets.rivalName);
}

/**
 * Write event flags back to the save file.
 * Each flag is a single bit in a dense byte array. We pack the boolean
 * array back into bytes, setting each bit according to the flag value.
 * Only writes flags that are within the valid range (0-1999 for Gen 2).
 */
function writeGen2EventFlags(data: Uint8Array, offset: number, flags: boolean[], count: number) {
  const byteCount = Math.ceil(count / 8);
  // First, zero out the flag region
  for (let i = 0; i < byteCount; i++) {
    if (offset + i < data.length) {
      data[offset + i] = 0;
    }
  }
  // Set individual flag bits
  for (let i = 0; i < count && i < flags.length; i++) {
    if (flags[i]) {
      const byteIdx = offset + Math.floor(i / 8);
      if (byteIdx < data.length) {
        data[byteIdx] = data[byteIdx]! | (1 << (i % 8));
      }
    }
  }
}

/**
 * Write daycare data back to the save file.
 * The daycare uses NOB (Nickname-OT-Body) interleaved format for each parent.
 * We write the Pokemon structures back and update the breeding metadata.
 */
function writeGen2Daycare(
  data: Uint8Array, 
  offsets: Gen2OffsetsConfig, 
  gen2SaveExt: Gen2SaveExtension
) {
  const strLen = offsets.stringLength;
  const offset = offsets.daycare;

  // Write Parent 1
  if (gen2SaveExt.daycareParent1) {
    const mon = gen2SaveExt.daycareParent1;
    const nick1Start = offset;
    const ot1Start = offset + strLen;
    const body1Start = offset + (strLen * 2);

    writeGen2PokemonStruct(data, body1Start, mon, false);
    const codec1 = codecForOffsets(offsets);
    const nickBuf = codec1.encode(mon.nickname || "", strLen, 0x50);
    const otBuf = codec1.encode(mon.originalTrainerName || "", strLen, 0x50);
    data.set(nickBuf, nick1Start);
    data.set(otBuf, ot1Start);
  }

  // Write Parent 2
  if (gen2SaveExt.daycareParent2) {
    const mon = gen2SaveExt.daycareParent2;
    const parent2Offset = offset + (strLen * 2) + 32;
    const nick2Start = parent2Offset;
    const ot2Start = parent2Offset + strLen;
    const body2Start = parent2Offset + (strLen * 2);

    writeGen2PokemonStruct(data, body2Start, mon, false);
    const codec2 = codecForOffsets(offsets);
    const nickBuf = codec2.encode(mon.nickname || "", strLen, 0x50);
    const otBuf = codec2.encode(mon.originalTrainerName || "", strLen, 0x50);
    data.set(nickBuf, nick2Start);
    data.set(otBuf, ot2Start);
  }

  // Write daycare metadata
  const metadataOffset = offset + ((strLen * 2) + 32) * 2;
  if (metadataOffset + 1 < data.length) {
    data[metadataOffset] = gen2SaveExt.daycareBreedingStatus;
    data[metadataOffset + 1] = gen2SaveExt.daycareStepsUntilEgg;
  }
}

/**
 * Write box names back to the save file.
 * Each box name is encoded into boxNameEntrySize bytes at the boxNames offset.
 */
function writeGen2BoxNames(data: Uint8Array, offsets: Gen2OffsetsConfig, boxNames: string[]) {
  const offset = offsets.boxNames;
  const entrySize = offsets.boxNameEntrySize;
  const maxNameLen = entrySize - 1; // Reserve 1 byte for terminator
  const codec = codecForOffsets(offsets); // region-correct (incl. Korean) — TODO 2.4

  for (let i = 0; i < offsets.boxCount && i < boxNames.length; i++) {
    const nameOffset = offset + (i * entrySize);
    let name = boxNames[i] || '';

    // Sanitize: strip unsupported characters before encoding to prevent
    // them from becoming '?' (0xE6) which causes the "??????" corruption bug.
    name = codec.sanitize(name);

    // Enforce maximum name length based on entry size (generation-aware)
    if (name.length > maxNameLen) {
      name = name.substring(0, maxNameLen);
    }

    const nameBuf = codec.encode(name, entrySize, 0x50);
    data.set(nameBuf, nameOffset);
  }
}

/**
 * Write TM/HM pocket data back to the save file.
 * The TM/HM pocket is a direct byte array where index = TM/HM number
 * and value = quantity. TMs can have count 0-99, HMs are always 0 or 1.
 */
function writeGen2TmHmPocket(data: Uint8Array, offsets: Gen2OffsetsConfig, tms: Item[]) {
  const offset = offsets.tmHmPouch;

  // Clear the entire TM/HM pocket first (57 bytes)
  for (let i = 0; i < 57; i++) {
    if (offset + i < data.length) {
      data[offset + i] = 0;
    }
  }

  // Write each TM/HM entry
  for (const item of tms) {
    // Convert item ID back to TM/HM index
    // TM item IDs: 0xC6 (198) to 0xF7 (247) → index 0-49
    // HM item IDs: 0xF8 (248) to 0xFE (254) → index 50-56
    const idx = item.id - 0xC5 - 1; // Convert item ID to 0-based index
    if (idx >= 0 && idx < 57 && offset + idx < data.length) {
      // HMs can only be 0 or 1, TMs can be 0-99
      data[offset + idx] = idx >= 50 ? Math.min(item.count, 1) : Math.min(item.count, 99);
    }
  }
}

/**
 * Write map/position data back to the save file.
 * Updates the player's current map ID and X/Y coordinates.
 */
function writeGen2MapData(data: Uint8Array, offsets: Gen2OffsetsConfig, mapData: { currentMapId: number; x: number; y: number } | undefined) {
  if (!mapData) return;

  const isCrystal = offsets.gender >= 0;
  const isJapanese = offsets.stringLength === 6;
  const isKorean = offsets.boxNameEntrySize === 17;

  let mapGroupOffset: number;
  let mapXOffset: number;
  let mapYOffset: number;

  if (isJapanese) {
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
    mapGroupOffset = offsets.trainer1 + 0x308;
    mapXOffset = mapGroupOffset + 2;
    mapYOffset = mapGroupOffset + 3;
  }

  if (mapGroupOffset + 3 < data.length) {
    data[mapGroupOffset] = mapData.currentMapId & 0xFF;
    data[mapGroupOffset + 1] = (mapData.currentMapId >> 8) & 0xFF;
    data[mapXOffset] = mapData.x;
    data[mapYOffset] = mapData.y;
  }
}

/**
 * Write Crystal-specific save data back to the save file.
 * This includes: Blue Card points, Mystery Gift data, and GS Ball event flag.
 * These fields are only written for Crystal saves (offsets >= 0).
 * For Gold/Silver, all offsets are -1 and no data is written.
 */
function writeGen2CrystalData(
  data: Uint8Array,
  offsets: Gen2OffsetsConfig,
  gen2SaveExt: Gen2SaveExtension
) {
  // Blue Card Points (Crystal only)
  if (offsets.blueCardPoints >= 0 && offsets.blueCardPoints < data.length) {
    data[offsets.blueCardPoints] = gen2SaveExt.blueCardPoints >= 0
      ? gen2SaveExt.blueCardPoints
      : data[offsets.blueCardPoints]!; // Preserve original if not set
  }

  // Mystery Gift Unlocked (Crystal only)
  if (offsets.mysteryGiftUnlocked >= 0 && offsets.mysteryGiftUnlocked < data.length) {
    if (gen2SaveExt.mysteryGiftUnlocked >= 0) {
      data[offsets.mysteryGiftUnlocked] = gen2SaveExt.mysteryGiftUnlocked;
    }
  }

  // Mystery Gift Item (Crystal only)
  if (offsets.mysteryGiftItem >= 0 && offsets.mysteryGiftItem < data.length) {
    data[offsets.mysteryGiftItem] = gen2SaveExt.mysteryGiftItem;
  }

  // GS Ball Event (Crystal only)
  if (gen2SaveExt.gsBallEventEnabled && offsets.gsBallEventPrimary >= 0) {
    if (offsets.gsBallEventPrimary < data.length) {
      data[offsets.gsBallEventPrimary] = 0x0B;
    }
    if (offsets.gsBallEventBackup >= 0 && offsets.gsBallEventBackup < data.length) {
      data[offsets.gsBallEventBackup] = 0x0B;
    }
  }
}

/**
 * Write Phase 4 advanced feature data back to the save file.
 * This includes: RTC flags, Mom savings, Unown Dex, and Phone Contacts.
 * For fields that haven't been edited (still at defaults), the raw data
 * is preserved from the original save to avoid corrupting untouched fields.
 */
function writeGen2Phase4Data(
  data: Uint8Array,
  offsets: Gen2OffsetsConfig,
  gen2SaveExt: Gen2SaveExtension
) {
  // Phase 4: RTC flags
  if (offsets.rtcFlags >= 0 && offsets.rtcFlags < data.length) {
    data[offsets.rtcFlags] = gen2SaveExt.rtcFlags;
  }

  // Phase 4: Mom Savings (3-byte BCD, same format as money)
  if (offsets.momSavings >= 0 && offsets.momSavings + 2 < data.length) {
    data[offsets.momSavings] = (gen2SaveExt.momSavings >> 16) & 0xFF;
    data[offsets.momSavings + 1] = (gen2SaveExt.momSavings >> 8) & 0xFF;
    data[offsets.momSavings + 2] = gen2SaveExt.momSavings & 0xFF;
  }

  // Phase 4: Unown Dex (28 bytes: 26 caught forms + 1 unlock flags + 1 first seen)
  if (offsets.unownDex > 0 && offsets.unownDex + 27 < data.length) {
    const unownOffset = offsets.unownDex;
    // Only write if we have parsed data (unownCaughtForms has 26 entries)
    if (gen2SaveExt.unownCaughtForms.length === 26) {
      for (let i = 0; i < 26; i++) {
        data[unownOffset + i] = gen2SaveExt.unownCaughtForms[i]!;
      }
      data[unownOffset + 26] = gen2SaveExt.unownUnlockedFlags;
      data[unownOffset + 27] = gen2SaveExt.unownFirstSeen;
    }
    // If unownCaughtForms is empty (not parsed), preserve raw data — already in data buffer
  }

  // Phase 4: Phone Contacts
  // Phone contacts are stored as fixed-size entries at offsets.phoneContacts.
  // Each entry is: [name: stringLength bytes] [trainerClass: 1] [mapGroup: 1] [mapNumber: 1]
  // The total entry stride is stringLength + 3.
  if (offsets.phoneContacts > 0 && gen2SaveExt.phoneContacts.length > 0) {
    const phoneOffset = offsets.phoneContacts;
    const strLen = offsets.stringLength;
    const entryStride = strLen + 3;

    // Clear the phone contact region first
    for (let i = 0; i < 39; i++) {
      const entryOffset = phoneOffset + (i * entryStride);
      if (entryOffset + entryStride <= data.length) {
        // Clear name area
        for (let j = 0; j < strLen; j++) {
          data[entryOffset + j] = 0x00;
        }
        // Clear metadata area
        data[entryOffset + strLen] = 0x00;
        data[entryOffset + strLen + 1] = 0x00;
        data[entryOffset + strLen + 2] = 0x00;
      }
    }

    // Write each contact
    for (let i = 0; i < gen2SaveExt.phoneContacts.length && i < 39; i++) {
      const contact = gen2SaveExt.phoneContacts[i]!;
      const entryOffset = phoneOffset + (i * entryStride);
      if (entryOffset + entryStride > data.length) break;

      // Encode the name (region-correct codec — TODO 2.4)
      const nameBuf = codecForOffsets(offsets).encode(contact.name, strLen, 0x50);
      data.set(nameBuf, entryOffset);

      // Write metadata
      data[entryOffset + strLen] = contact.trainerClass;
      data[entryOffset + strLen + 1] = contact.mapGroup;
      data[entryOffset + strLen + 2] = contact.mapNumber;
    }
  }
  // If phoneContacts is empty (not parsed), preserve raw data — already in data buffer
}

/**
 * Main Gen 2 save writer.
 * Uses centralized offset system for version/region-aware writing.
 * Phase 2 adds: rival name, event flags, daycare, box names, TM/HM pocket, map data.
 */
export function writeGen2Save(save: ParsedSave): Uint8Array {
  // TODO 2.9: dev-only guard — the writer treats pcBoxes as the source of truth
  // and derives the active-box SRAM copy from it. Warn (dev/test only) if the
  // currentBoxPokemon cache drifted from pcBoxes[currentBoxId].
  assertCurrentBoxInSync(save);
  const data = new Uint8Array(save.rawData);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // ── Determine version and region ──
  const gameVersion = (save.gameVersion || 'Gold') as Gen2Version;
  
  // D2: Use isGen2SaveExtension type guard for safe region access
  let region: Gen2Region = 'international';
  if (isGen2SaveExtension(save.genExtension)) {
    const extRegion = save.genExtension.region;
    if (extRegion === 'japanese' || extRegion === 'korean' || extRegion === 'international') {
      region = extRegion as Gen2Region;
    }
  }

  const offsets = getGen2Offsets(gameVersion, region);
  const strLen = offsets.stringLength;

  // D2: Use isGen2SaveExtension type guard for safe extension access
  const gen2SaveExt = isGen2SaveExtension(save.genExtension) ? save.genExtension : new Gen2SaveExtension();

  // ── Write Game Options ──
  if (save.options) {
    let optByte = 0;
    if (save.options.battleAnimation === 'Off') {
      optByte |= 0x80;
    }
    if (save.options.battleStyle === 'Set') {
      optByte |= 0x40;
    }
    
    // Text speed raw or named
    let speedVal = 3; // Default Normal
    const ts = save.options.textSpeed;
    if (ts === 'Fast' || ts === '1') speedVal = 1;
    else if (ts === 'Slow' || ts === '5') speedVal = 5;
    else if (ts === 'Instant' || ts === '0') speedVal = 0;
    else if (ts === 'Normal' || ts === '3') speedVal = 3;
    else {
      const parsed = parseInt(ts, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 7) {
        speedVal = parsed;
      }
    }
    optByte |= speedVal;

    if (save.options.sound === 'Earphone1') {
      optByte |= 0x20;
    } else if (save.options.sound === 'Earphone2') {
      optByte |= 0x30;
    } else if (save.options.sound === 'Stereo') {
      optByte |= 0x10;
    }
    data[offsets.options] = optByte;
  }

  // ── Write Trainer Metadata ──
  const tidNum = parseInt(save.trainer.id, 10) || 0;
  setUInt16BigEndian(view, offsets.trainer1, tidNum);

  const trainerNameStart = offsets.trainer1 + 2; // After 2-byte TID
  const trainerNameBuf = codecForOffsets(offsets).encode(save.trainer.name || "", strLen, 0x50);
  data.set(trainerNameBuf, trainerNameStart);

  setBCD(view, offsets.money, save.trainer.money, 3);
  setBCD(view, offsets.coins, save.trainer.coins || 0, 2);
  data[offsets.johtoBadges] = save.trainer.badges & 0xFF;
  data[offsets.johtoBadges + 1] = (save.trainer.badges >> 8) & 0xFF;

  // Save playtime format: "HH:MM:SS" or fallback
  const timeParts = (save.trainer.playTime || "").split(':');
  let hoursVal = 0;
  let minutesVal = 0;
  let secondsVal = 0;
  if (timeParts.length >= 2) {
    hoursVal = parseInt(timeParts[0]!, 10) || 0;
    minutesVal = parseInt(timeParts[1]!, 10) || 0;
    secondsVal = parseInt(timeParts[2]!, 10) || 0;
  } else {
    // Fallback if playTime was formatted as Gen1 "12h 34m"
    const hoursMatch = (save.trainer.playTime || "").match(/(\d+)\s*h/i);
    const minutesMatch = (save.trainer.playTime || "").match(/(\d+)\s*m/i);
    const secondsMatch = (save.trainer.playTime || "").match(/(\d+)\s*s/i);
    if (hoursMatch) hoursVal = parseInt(hoursMatch[1]!, 10) || 0;
    if (minutesMatch) minutesVal = parseInt(minutesMatch[1]!, 10) || 0;
    if (secondsMatch) secondsVal = parseInt(secondsMatch[1]!, 10) || 0;
  }

  const timeOffset = offsets.timePlayed;
  data[timeOffset] = (hoursVal >> 8) & 0xFF;
  data[timeOffset + 1] = hoursVal & 0xFF;
  data[timeOffset + 2] = minutesVal;
  data[timeOffset + 3] = secondsVal;

  // Save trainer gender (Crystal only)
  if (offsets.gender >= 0) {
    data[offsets.gender] = save.trainer.gender === 'Female' ? 1 : 0;
  }

  // ── Phase 2: Write Rival Name ──
  writeGen2RivalName(data, offsets, save.trainer.rivalName);

  // ── Write Party Pokémon ──
  const partyCount = Math.min(save.party.length, 6);
  data[offsets.party] = partyCount;

  // Party species list
  const partySpeciesStart = offsets.party + 1;
  // Party species list — write 0xFD for egg Pokemon
  for (let i = 0; i < partyCount; i++) {
    const mon = save.party[i]!;
    data[partySpeciesStart + i] = mon.isEgg ? 0xFD : mon.speciesId;
  }
  data[partySpeciesStart + partyCount] = 0xFF;

  // Party list layout:
  // [count:1] [species:6] [0xFF:1] [bodies:6*48] [otNames:6*strLen] [nicknames:6*strLen]
  const partyBodiesStart = offsets.party + 1 + 6 + 1;
  const partyOtNamesStart = partyBodiesStart + (6 * 48);
  const partyNicknamesStart = partyOtNamesStart + (6 * strLen);

  for (let i = 0; i < partyCount; i++) {
    const structOffset = partyBodiesStart + (i * 48);
    const otNamesOffset = partyOtNamesStart + (i * strLen);
    const nicknamesOffset = partyNicknamesStart + (i * strLen);

    const mon = save.party[i]!;
    writeGen2PokemonStruct(data, structOffset, mon, true);

    const partyCodec = codecForOffsets(offsets);
    const nicknameBuffer = partyCodec.encode(mon.nickname, strLen, 0x50);
    const otNameBuffer = partyCodec.encode(mon.originalTrainerName, strLen, 0x50);

    data.set(nicknameBuffer, nicknamesOffset);
    data.set(otNameBuffer, otNamesOffset);
  }

  // ── Write Inventory pockets ──
  writeInventoryPocketGen2(data, offsets.itemPouchCount, offsets.itemPouchStart, 2, offsets.pouchItemSlots, save.items || []);
  if (save.keyItems) {
    writeInventoryPocketGen2(data, offsets.keyItemPouchCount, offsets.keyItemPouchStart, 1, offsets.pouchKeySlots, save.keyItems);
  }
  if (save.balls) {
    writeInventoryPocketGen2(data, offsets.ballPouchCount, offsets.ballPouchStart, 2, offsets.pouchBallSlots, save.balls);
  }
  if (save.pcItems) {
    writeInventoryPocketGen2(data, offsets.pcItemPouchCount, offsets.pcItemPouchStart, 2, offsets.pouchPcSlots, save.pcItems);
  }

  // ── Phase 2: Write TM/HM Pocket ──
  if (save.tms && save.tms.length > 0) {
    writeGen2TmHmPocket(data, offsets, save.tms);
  }

  // ── Phase 2: Write Event Flags ──
  if (save.eventFlags && save.eventFlags.length > 0) {
    writeGen2EventFlags(data, offsets.eventFlags, save.eventFlags, 2000);
  }

  // ── Phase 2: Write Box Names ──
  if (gen2SaveExt.boxNames && gen2SaveExt.boxNames.length > 0) {
    writeGen2BoxNames(data, offsets, gen2SaveExt.boxNames);
  }

  // ── Phase 2: Write Daycare Data ──
  writeGen2Daycare(data, offsets, gen2SaveExt);

  // ── Phase 2: Write Map Data ──
  writeGen2MapData(data, offsets, save.map);

  // ── Phase 3: Write Crystal-Specific Data ──
  writeGen2CrystalData(data, offsets, gen2SaveExt);

  // ── Phase 4: Write RTC, Mom Savings, Unown Dex, Phone Contacts ──
  writeGen2Phase4Data(data, offsets, gen2SaveExt);

  // ── Write PC Boxes ──
  const activeBoxId = save.currentBoxId || 0;
  data[offsets.currentBoxIndex] = activeBoxId;

  // Write all boxes in SRAM Banks 2 & 3 using corrected box stride
  if (save.pcBoxes && save.pcBoxes.length === offsets.boxCount) {
    for (let b = 0; b < offsets.boxCount; b++) {
      const boxOffset = getBoxOffset(b, offsets);
      writePCBoxGen2(data, boxOffset, save.pcBoxes[b]!, offsets);
    }

    // Copy the active edited box content to the current box copy offset
    const activeBoxOffset = getBoxOffset(activeBoxId, offsets);
    const copyOffset = offsets.currentBoxCopy;
    // Copy sizeBoxList + 2 bytes (box data + checksum)
    const copySize = offsets.sizeBoxList + 2;
    const boxData = data.slice(activeBoxOffset, activeBoxOffset + copySize);
    data.set(boxData, copyOffset);
  }

  // ── Recompute per-box checksums ──
  for (let b = 0; b < offsets.boxCount; b++) {
    const boxOffset = getBoxOffset(b, offsets);
    const checksum = computeBoxChecksum(data, boxOffset, offsets.sizeBoxList);
    data[boxOffset + offsets.sizeBoxList] = checksum & 0xFF;
    data[boxOffset + offsets.sizeBoxList + 1] = (checksum >> 8) & 0xFF;
  }

  // ── Recompute main checksums and backup data ──
  const isCrystal = gameVersion === 'Crystal';

  if (isCrystal) {
    // Primary checksum
    const sum = calculateGen2Checksum(data, offsets.trainer1, offsets.accumulatedChecksumEnd);
    data[offsets.checksum1] = sum & 0xFF;
    data[offsets.checksum1 + 1] = (sum >> 8) & 0xFF;

    if (region === 'japanese') {
      // JP Crystal: copy trainer block to backup at 0x7209
      const blockSize = 0xADA;
      const primaryData = data.slice(offsets.trainer1, offsets.trainer1 + blockSize);
      data.set(primaryData, 0x7209);
      // Compute backup checksum over the backup range
      const backupEnd = 0x7209 + blockSize - 1;
      const backupSum = calculateGen2Checksum(data, 0x7209, backupEnd);
      data[0x7209 + blockSize] = backupSum & 0xFF;
      data[0x7209 + blockSize + 1] = (backupSum >> 8) & 0xFF;
    } else {
      // INT Crystal: copy primary DATA to backup bank at 0x1209
      const crystalDataBlock = data.slice(0x2009, 0x2B83);
      data.set(crystalDataBlock, 0x1209);
      // Compute backup checksum independently
      const backupEnd = 0x1209 + crystalDataBlock.length - 1;
      const backupSum = calculateGen2Checksum(data, 0x1209, backupEnd);
      // Write backup checksum at the corresponding position
      data[0x2D0D + (0x1209 - 0x2009)] = backupSum & 0xFF;
      data[0x2D0D + (0x1209 - 0x2009) + 1] = (backupSum >> 8) & 0xFF;
    }

    // Second checksum copy
    const sum2 = calculateGen2Checksum(data, offsets.trainer1, offsets.accumulatedChecksumEnd);
    data[offsets.checksum2] = sum2 & 0xFF;
    data[offsets.checksum2 + 1] = (sum2 >> 8) & 0xFF;
  } else {
    // Gold/Silver
    // Primary checksum
    const sum = calculateGen2Checksum(data, offsets.trainer1, offsets.accumulatedChecksumEnd);
    data[offsets.checksum1] = sum & 0xFF;
    data[offsets.checksum1 + 1] = (sum >> 8) & 0xFF;

    if (region === 'japanese') {
      // JP GS: copy trainer block to backup at 0x7209
      const blockSize = 0xC83;
      const primaryData = data.slice(offsets.trainer1, offsets.trainer1 + blockSize);
      data.set(primaryData, 0x7209);
      const backupEnd = 0x7209 + blockSize - 1;
      const backupSum = calculateGen2Checksum(data, 0x7209, backupEnd);
      data[0x7209 + blockSize] = backupSum & 0xFF;
      data[0x7209 + blockSize + 1] = (backupSum >> 8) & 0xFF;
    } else if (region === 'korean') {
      // Korean GS: uses a multi-region checksum at checksum2 offset
      // Simple block copy for backup
      const gsDataBlock = data.slice(offsets.trainer1, offsets.checksum1);
      data.set(gsDataBlock, 0x3009);
      // Korean second checksum covers multiple regions
      // For now, compute simple backup sum
      const backupSum = calculateGen2Checksum(data, 0x3009, 0x3009 + gsDataBlock.length - 1);
      data[offsets.checksum2] = backupSum & 0xFF;
      data[offsets.checksum2 + 1] = (backupSum >> 8) & 0xFF;
    } else {
      // INT GS: scattered backup mirroring (matches PKHeX's GetFinalData)
      // Mirror region 1: 0x2009..0x222F → 0x15C7
      data.set(data.slice(0x2009, 0x2230), 0x15C7);
      // Mirror region 2: 0x222F..0x23D9 → 0x3D69
      data.set(data.slice(0x222F, 0x23DA), 0x3D69);
      // Mirror region 3: 0x23D9..0x2856 → 0x0C6B
      data.set(data.slice(0x23D9, 0x2857), 0x0C6B);
      // Mirror region 4: 0x2856..0x288A → 0x7E39
      data.set(data.slice(0x2856, 0x288B), 0x7E39);
      // Mirror region 5: 0x288A..0x2D69 → 0x10E8
      data.set(data.slice(0x288A, 0x2D69), 0x10E8);
    }

    // Second checksum copy (GS)
    const sum2 = calculateGen2Checksum(data, offsets.trainer1, offsets.accumulatedChecksumEnd);
    data[offsets.checksum2] = sum2 & 0xFF;
    data[offsets.checksum2 + 1] = (sum2 >> 8) & 0xFF;
  }

  return data;
}
