import { ParsedSave, PokemonStats, Item, isGen2Extension, Gen2SaveExtension } from '../../parser/types';
import { 
  setUInt16BigEndian, 
  setUInt24BigEndian, 
  setBCD 
} from '../../utils/byteHelpers';
import { calculateGen2Checksum } from './parser';
import { encodeGameBoyText } from '../../utils/textCodec';
import { 
  getGen2Offsets, 
  getBoxOffset, 
  computeBoxChecksum,
  type Gen2OffsetsConfig,
  type Gen2Version, 
  type Gen2Region 
} from './data/offsets';

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

  // 9. Friendship and Pokerus
  data[offset + 27] = mon.friendship !== undefined ? mon.friendship : 70;
  data[offset + 28] = mon.pokerus !== undefined ? mon.pokerus : 0;

  // 10. Level
  data[offset + 31] = mon.level;

  if (isParty) {
    // 11. Status condition
    data[offset + 32] = 0; // OK
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
  for (let i = 0; i < count; i++) {
    data[speciesListOffset + i] = pokemonList[i]!.speciesId;
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

      // Encode text strings and write
      const nicknameBuffer = encodeGameBoyText(mon.nickname || "", strLen, 0x50);
      const otNameBuffer = encodeGameBoyText(mon.originalTrainerName || "", strLen, 0x50);

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

/**
 * Main Gen 2 save writer.
 * Uses centralized offset system for version/region-aware writing.
 */
export function writeGen2Save(save: ParsedSave): Uint8Array {
  const data = new Uint8Array(save.rawData);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // ── Determine version and region ──
  const gameVersion = (save.gameVersion || 'Gold') as Gen2Version;
  
  // Get region from Gen2SaveExtension, default to international
  let region: Gen2Region = 'international';
  if (save.genExtension && 'region' in save.genExtension) {
    const extRegion = (save.genExtension as Gen2SaveExtension).region;
    if (extRegion === 'japanese' || extRegion === 'korean' || extRegion === 'international') {
      region = extRegion as Gen2Region;
    }
  }

  const offsets = getGen2Offsets(gameVersion, region);
  const strLen = offsets.stringLength;

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
  const trainerNameBuf = encodeGameBoyText(save.trainer.name || "", strLen, 0x50);
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

  // ── Write Party Pokémon ──
  const partyCount = Math.min(save.party.length, 6);
  data[offsets.party] = partyCount;

  // Party species list
  const partySpeciesStart = offsets.party + 1;
  for (let i = 0; i < partyCount; i++) {
    data[partySpeciesStart + i] = save.party[i]!.speciesId;
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

    const nicknameBuffer = encodeGameBoyText(mon.nickname, strLen, 0x50);
    const otNameBuffer = encodeGameBoyText(mon.originalTrainerName, strLen, 0x50);

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
