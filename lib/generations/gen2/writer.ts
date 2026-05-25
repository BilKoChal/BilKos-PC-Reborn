import { ParsedSave, PokemonStats, Item } from '../../parser/types';
import { 
  setUInt16BigEndian, 
  setUInt24BigEndian, 
  setBCD 
} from '../../utils/byteHelpers';
import { calculateGen2Checksum } from './parser';
import { encodeGameBoyText } from '../../utils/textCodec';

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
  // Map held item name or lookup held item code
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

export function writePCBoxGen2(data: Uint8Array, offset: number, pokemonList: PokemonStats[]) {
  const count = Math.min(pokemonList.length, 20);
  data[offset] = count;

  const speciesListOffset = offset + 1;
  const pokemonStructStart = offset + 22;

  // Write species list
  for (let i = 0; i < count; i++) {
    data[speciesListOffset + i] = pokemonList[i]!.speciesId;
  }
  data[speciesListOffset + count] = 0xFF;

  // Write Pokémon structures, OT name list, and Nicknames list
  for (let i = 0; i < count; i++) {
    const structOffset = pokemonStructStart + (i * 32);
    const otNamesOffset = pokemonStructStart + (20 * 32) + (i * 11);
    const nicknamesOffset = pokemonStructStart + (20 * 32) + (20 * 11) + (i * 11);

    const mon = pokemonList[i]!;
    
    // Write internal structure
    writeGen2PokemonStruct(data, structOffset, mon, false);

    // Encode text strings and write
    const nicknameBuffer = encodeGameBoyText(mon.nickname || "", 11, 0x50);
    const otNameBuffer = encodeGameBoyText(mon.originalTrainerName || "", 11, 0x50);

    data.set(nicknameBuffer, nicknamesOffset);
    data.set(otNameBuffer, otNamesOffset);
  }
}

export function writeGen2Save(save: ParsedSave): Uint8Array {
  const data = new Uint8Array(save.rawData);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // --- Write Game Options ---
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
    data[0x2000] = optByte;
    data[0x3000] = optByte; // Write to backup options offset as well to avoid checksum/backup mismatch errors in PKHeX
  }

  // --- Write Trainer Metadata ---
  const tidNum = parseInt(save.trainer.id, 10) || 0;
  setUInt16BigEndian(view, 0x2009, tidNum);

  const trainerNameBuf = encodeGameBoyText(save.trainer.name || "", 8, 0x50);
  data.set(trainerNameBuf, 0x200B);

  setBCD(view, 0x23DB, save.trainer.money, 3);
  setBCD(view, 0x23E1, save.trainer.coins || 0, 2);
  data[0x23E4] = save.trainer.badges & 0xFF;
  data[0x23E5] = (save.trainer.badges >> 8) & 0xFF;

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

  data[0x2051] = (hoursVal >> 8) & 0xFF;
  data[0x2052] = hoursVal & 0xFF;
  data[0x2053] = minutesVal;
  data[0x2054] = secondsVal;

  // Save trainer gender
  if (save.trainer.gender === 'Female') {
    data[0x3E3D] = 1;
  } else {
    data[0x3E3D] = 0;
  }

  // --- Write Party Pokémon ---
  const partyCount = Math.min(save.party.length, 6);
  data[0x288A] = partyCount;
  for (let i = 0; i < partyCount; i++) {
    data[0x288B + i] = save.party[i]!.speciesId;
  }
  data[0x288B + partyCount] = 0xFF;

  for (let i = 0; i < partyCount; i++) {
     const structOffset = 0x2892 + (i * 48);
     const otNamesOffset = 0x29B2 + (i * 11);
     const nicknamesOffset = 0x29F4 + (i * 11);

     const mon = save.party[i]!;
     writeGen2PokemonStruct(data, structOffset, mon, true);

     const nicknameBuffer = encodeGameBoyText(mon.nickname, 11, 0x50);
     const otNameBuffer = encodeGameBoyText(mon.originalTrainerName, 11, 0x50);

     data.set(nicknameBuffer, nicknamesOffset);
     data.set(otNameBuffer, otNamesOffset);
  }

  // --- Write Inventory pockets ---
  writeInventoryPocketGen2(data, 0x23E6, 0x23E7, 2, 20, save.items || []);
  if (save.keyItems) {
    writeInventoryPocketGen2(data, 0x2411, 0x2412, 1, 25, save.keyItems);
  }
  if (save.balls) {
    writeInventoryPocketGen2(data, 0x242C, 0x242E, 2, 12, save.balls);
  }
  if (save.pcItems) {
    writeInventoryPocketGen2(data, 0x24AC, 0x24AD, 2, 50, save.pcItems);
  }

  // --- Write PC Boxes ---
  // Save current dynamic active box in Bank 1 at sBox offset 0x2D10
  const activeBoxId = save.currentBoxId || 0;
  data[0x2724] = activeBoxId; // currentBoxId index flag

  // Write all 14 boxes in SRAM Banks 2 & 3
  if (save.pcBoxes && save.pcBoxes.length === 14) {
    for (let b = 0; b < 14; b++) {
      const boxOffset = b < 7
        ? 0x4000 + (b * 1102)
        : 0x6000 + ((b - 7) * 1102);

      writePCBoxGen2(data, boxOffset, save.pcBoxes[b]!);
    }

    // Copy the active edited box content to Bank 1 active box location at 0x2D10
    writePCBoxGen2(data, 0x2D10, save.pcBoxes[activeBoxId]!);
  }

  // --- Recompute Checksums and dual-bank redundancy copies ---
  const isCrystal = save.gameVersion === 'Crystal';

  if (isCrystal) {
    // Primary checksum
    const sum = calculateGen2Checksum(data, 0x2009, 0x2B82);
    data[0x2D0D] = sum & 0xFF;
    data[0x2D0E] = (sum >> 8) & 0xFF;

    // Copy primary DATA (excluding checksum) to backup bank
    const crystalDataBlock = data.slice(0x2009, 0x2D0D);
    data.set(crystalDataBlock, 0x3009);

    // Independently compute and write the backup checksum over the backup data range
    const backupSum = calculateGen2Checksum(data, 0x3009, 0x3B82);
    data[0x3D0D] = backupSum & 0xFF;
    data[0x3D0E] = (backupSum >> 8) & 0xFF;
  } else {
    // Primary checksum
    const sum = calculateGen2Checksum(data, 0x2009, 0x2D68);
    data[0x2D69] = sum & 0xFF;
    data[0x2D6A] = (sum >> 8) & 0xFF;

    // Copy primary DATA (excluding checksum) to backup bank
    const gsDataBlock = data.slice(0x2009, 0x2D69);
    data.set(gsDataBlock, 0x3009);

    // Independently compute and write the backup checksum over the backup data range
    const backupSum = calculateGen2Checksum(data, 0x3009, 0x3D68);
    data[0x3D69] = backupSum & 0xFF;
    data[0x3D6A] = (backupSum >> 8) & 0xFF;
  }

  return data;
}
