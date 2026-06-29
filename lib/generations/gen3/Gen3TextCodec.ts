/**
 * Gen3TextCodec — ITextCodec for Gen 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen).
 *
 * Gen 3 uses a custom single-byte charmap with 0xFF terminator, completely
 * different from Gen 1/2's Game Boy charmap (where 'A' = 0x80).
 * In Gen 3: 'A' = 0xBB, 'a' = 0xD5, '0' = 0xA1, space = 0x00.
 *
 * Source: Bulbapedia "Character encoding (Generation III)"
 */
import { ITextCodec } from '../../interfaces';

// Gen 3 International charmap: byte → Unicode character
const GEN3_CHARMAP: Record<number, string> = {
  0x00: ' ', 0x01: 'À', 0x02: 'Á', 0x03: 'Â', 0x04: 'Ç', 0x05: 'È', 0x06: 'É',
  0x07: 'Ê', 0x08: 'Ë', 0x09: 'Ì', 0x0A: 'Î', 0x0B: 'Ï', 0x0C: 'Ò', 0x0D: 'Ó',
  0x0E: 'Ô', 0x0F: 'Œ', 0x10: 'Ù', 0x11: 'Ú', 0x12: 'Û', 0x13: 'Ñ', 0x14: 'ß',
  0x15: 'à', 0x16: 'á', 0x17: 'â', 0x18: 'ç', 0x19: 'è', 0x1A: 'é', 0x1B: 'ê',
  0x1C: 'ë', 0x1D: 'ì', 0x1E: 'î', 0x1F: 'ï', 0x20: 'ò', 0x21: 'ó', 0x22: 'ô',
  0x23: 'œ', 0x24: 'ù', 0x25: 'ú', 0x26: 'û', 0x27: 'ñ', 0x28: 'ß', 0x29: '²',
  0x2A: '³', 0x2B: '¼', 0x2C: '½', 0x2D: '¾', 0x2E: '×', 0x2F: '÷',
  0x30: '¿', 0x31: '¡', 0x32: 'Á', 0x33: 'Â', 0x34: 'È', 0x35: 'É', 0x36: 'Ê',
  0x37: 'Ì', 0x38: 'Î', 0x39: 'Ï', 0x3A: 'Ò', 0x3B: 'Ó', 0x3C: 'Ô', 0x3D: 'Ù',
  0x3E: 'Ú', 0x3F: 'Û',
  0x51: '…', 0x52: '«', 0x53: '»', 0x54: '“', 0x55: '”', 0x56: '‘', 0x57: '’',
  0x58: '♂', 0x59: '♀', 0x5A: 'Poké', 0x5B: '›', 0x5C: '‹', 0x5D: '₽',
  0x5E: '∞', 0x5F: '✚',
  0x60: '★', 0x61: '→', 0x62: '↓', 0x63: '↑', 0x64: '←',
  0x65: '⅛', 0x66: '⅜', 0x67: '⅝', 0x68: '⅞',
  0x69: '↖', 0x6A: '↘', 0x6B: '↗', 0x6C: '↙', 0x6D: '◄', 0x6E: '►',
  0x6F: '▲', 0x70: '▼', 0x71: '○', 0x72: '●', 0x73: '◇', 0x74: '◆',
  0x75: '♠', 0x76: '♣', 0x77: '♥', 0x78: '♦', 0x79: '♪', 0x7A: '♫',
  0x7B: '°', 0x7C: '∉', 0x7D: '∩', 0x7E: '∈', 0x7F: '∪',
  0x80: '✦', 0x81: '✧', 0x82: '✩', 0x83: '✪', 0x84: '✫', 0x85: '✬',
  0x86: '✭', 0x87: '✮', 0x88: '✯', 0x89: '✰',
  0xA1: '0', 0xA2: '1', 0xA3: '2', 0xA4: '3', 0xA5: '4', 0xA6: '5',
  0xA7: '6', 0xA8: '7', 0xA9: '8', 0xAA: '9',
  0xAB: '!', 0xAC: '?', 0xAD: '.', 0xAE: '-', 0xAF: '·',
  0xB0: '…', 0xB1: '“', 0xB2: '”', 0xB3: '‘', 0xB4: '’',
  0xB5: '♂', 0xB6: '♀', 0xB7: '¥', 0xB8: ',',
  0xB9: '×', 0xBA: '/', 0xBB: 'A', 0xBC: 'B', 0xBD: 'C', 0xBE: 'D',
  0xBF: 'E', 0xC0: 'F', 0xC1: 'G', 0xC2: 'H', 0xC3: 'I', 0xC4: 'J',
  0xC5: 'K', 0xC6: 'L', 0xC7: 'M', 0xC8: 'N', 0xC9: 'O', 0xCA: 'P',
  0xCB: 'Q', 0xCC: 'R', 0xCD: 'S', 0xCE: 'T', 0xCF: 'U', 0xD0: 'V',
  0xD1: 'W', 0xD2: 'X', 0xD3: 'Y', 0xD4: 'Z',
  0xD5: 'a', 0xD6: 'b', 0xD7: 'c', 0xD8: 'd', 0xD9: 'e', 0xDA: 'f',
  0xDB: 'g', 0xDC: 'h', 0xDD: 'i', 0xDE: 'j', 0xDF: 'k', 0xE0: 'l',
  0xE1: 'm', 0xE2: 'n', 0xE3: 'o', 0xE4: 'p', 0xE5: 'q', 0xE6: 'r',
  0xE7: 's', 0xE8: 't', 0xE9: 'u', 0xEA: 'v', 0xEB: 'w', 0xEC: 'x',
  0xED: 'y', 0xEE: 'z',
  0xEF: '▶', 0xF0: ':', 0xF1: 'Ä', 0xF2: 'Ö', 0xF3: 'Ü', 0xF4: 'ä',
  0xF5: 'ö', 0xF6: 'ü',
  0xFF: '', // terminator
};

// Reverse map: Unicode character → Gen 3 byte
const GEN3_CHARMAP_REV: Record<string, number> = {};
for (const [byteStr, char] of Object.entries(GEN3_CHARMAP)) {
  if (char && char.length === 1) {
    GEN3_CHARMAP_REV[char] = parseInt(byteStr, 10);
  }
}

export class Gen3TextCodec implements ITextCodec {
  readonly charSize = 1 as const;
  readonly terminator = 0xFF;
  readonly isJapanese = false;
  private _maxTrainerNameLength = 7;
  private _maxNicknameLength = 10;

  nicknameMaxLength(): number { return this._maxNicknameLength; }
  otNameMaxLength(): number { return this._maxTrainerNameLength; }

  decode(data: Uint8Array, offset: number, maxLength: number): string {
    let str = '';
    for (let i = 0; i < maxLength && offset + i < data.length; i++) {
      const b = data[offset + i]!;
      if (b === 0xFF) break; // terminator
      const ch = GEN3_CHARMAP[b] ?? '?';
      str += ch;
    }
    return str;
  }

  encode(text: string, maxLength: number, terminator: number = 0xFF): Uint8Array {
    const buf = new Uint8Array(maxLength).fill(terminator);
    let pos = 0;
    for (const ch of text) {
      if (pos >= maxLength - 1) break; // leave room for terminator
      const byte = GEN3_CHARMAP_REV[ch] ?? GEN3_CHARMAP_REV[ch.toUpperCase()] ?? 0x00; // default to space
      buf[pos++] = byte;
    }
    return buf;
  }

  isValidChar(char: string): boolean {
    return char in GEN3_CHARMAP_REV || char.toUpperCase() in GEN3_CHARMAP_REV;
  }

  sanitize(text: string): string {
    let result = '';
    for (const ch of text) {
      if (this.isValidChar(ch)) {
        result += ch;
      }
    }
    return result;
  }
}
