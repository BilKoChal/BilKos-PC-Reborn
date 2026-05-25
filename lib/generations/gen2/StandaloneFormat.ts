import { IStandalonePokemonFormat } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { decodeText } from '../../utils/textDecoder';
import { encodeGameBoyText } from '../../utils/textCodec';
import { parseGen2PokemonStruct } from './parser';
import { writeGen2PokemonStruct } from './writer';

/**
 * Standalone Pokemon format handler for Generation 2.
 * Implements the PKHeX-compatible .pk2 format:
 *   - International: 73 bytes (PokeList2 INT)
 *   - Japanese: 63 bytes (PokeList2 JPN)
 *   - Also accepts: 48 (raw party), 32 (raw box)
 *
 * Species in the PokeList2 header uses National Dex IDs
 * (Gen 2 species IDs directly equal National Dex numbers).
 * Pokemon data is always party format (48 bytes). No encryption.
 */
export class Gen2StandaloneFormat implements IStandalonePokemonFormat {
  fileExtension = '.pk2';
  acceptPattern = '.pk2';
  expectedSizes = { international: 73, japanese: 63 };
  hasEncryption = false;
  hasAbilities = false;
  hasNatures = false;

  createFile(mon: PokemonStats, region?: string): Uint8Array {
    const strLen = region === 'japanese' ? 6 : 11;
    const SIZE_2PARTY = 48;
    const totalSize = 1 + 1 + 1 + SIZE_2PARTY + strLen + strLen; // 73 for INT, 63 for JPN
    const buffer = new Uint8Array(totalSize);

    // Byte 0: Count (always 1)
    buffer[0] = 0x01;

    // Byte 1: Species (National Dex ID in Gen 2)
    buffer[1] = mon.speciesId;

    // Byte 2: Terminator
    buffer[2] = 0xFF;

    // Bytes 3-50: Pokemon data (party format, 48 bytes)
    writeGen2PokemonStruct(buffer, 3, mon, true);

    // OT Name
    const otBuf = encodeGameBoyText(mon.originalTrainerName || '?????', strLen, 0x50);
    buffer.set(otBuf, 3 + SIZE_2PARTY);

    // Nickname
    const nickBuf = encodeGameBoyText(mon.nickname || mon.speciesName || '?????', strLen, 0x50);
    buffer.set(nickBuf, 3 + SIZE_2PARTY + strLen);

    return buffer;
  }

  parseFile(buffer: Uint8Array, region?: string): PokemonStats {
    const isJapanese = buffer.length === 63;
    const strLen = isJapanese ? 6 : 11;

    let monData: Uint8Array;
    let otRaw: Uint8Array;
    let nickRaw: Uint8Array;

    if (buffer.length === 73 || buffer.length === 63) {
      // PKHeX PokeList2 format
      monData = buffer.slice(3, 3 + 48);
      otRaw = buffer.slice(3 + 48, 3 + 48 + strLen);
      nickRaw = buffer.slice(3 + 48 + strLen, 3 + 48 + strLen * 2);
    } else if (buffer.length === 48) {
      // Raw party format
      monData = buffer;
      otRaw = new Uint8Array(strLen).fill(0x50);
      nickRaw = new Uint8Array(strLen).fill(0x50);
    } else if (buffer.length === 32) {
      // Raw box format
      monData = buffer;
      otRaw = new Uint8Array(strLen).fill(0x50);
      nickRaw = new Uint8Array(strLen).fill(0x50);
    } else {
      throw new Error(
        `Invalid .pk2 file size: ${buffer.length}. Expected 73 (INT), 63 (JPN), 48 (party), or 32 (box).`
      );
    }

    const otName = decodeText(otRaw, 0, strLen);
    const nickName = decodeText(nickRaw, 0, strLen);
    const isParty = monData.length >= 48;

    return parseGen2PokemonStruct(monData, 0, isParty, nickName, otName, nickRaw, otRaw);
  }

  validateFile(buffer: Uint8Array): { valid: boolean; error?: string } {
    const size = buffer.length;
    if (size === 73 || size === 63 || size === 48 || size === 32) {
      return { valid: true };
    }
    return { valid: false, error: `Invalid .pk2 file size: ${size}. Expected 73 (INT), 63 (JPN), 48 (party), or 32 (box).` };
  }
}
