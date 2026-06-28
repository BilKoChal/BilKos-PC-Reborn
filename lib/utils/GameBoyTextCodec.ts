/**
 * GameBoyTextCodec — ITextCodec implementation for Gen 1 & Gen 2.
 *
 * Both Gen 1 and Gen 2 share the same Game Boy character encoding (single-byte
 * custom charmap with 0x50 terminator). This class is the authoritative source
 * for the Game Boy charmap.
 *
 * Future generations will have completely different codec classes:
 * - Gen 3: single-byte custom table, 0xFF terminator
 * - Gen 4: 16-bit LE dual-table, 0xFFFF terminator
 * - Gen 5+: UTF-16 LE, 0x0000 terminator
 *
 * The codec is constructed with a region parameter (international/japanese/korean)
 * so that all encode/decode calls are region-correct without the caller needing
 * to pass an isJapanese flag every time.
 */

import { ITextCodec } from '../interfaces';
import { JPN_KATAKANA, JPN_HIRAGANA, JPN_LATIN } from './gbCharsets';

// ── English (International) character maps ──

/** Forward map: internal byte value → Unicode character (for decoding) */
const CHAR_MAP_INT: Record<number, string> = {
  0x80: 'A', 0x81: 'B', 0x82: 'C', 0x83: 'D', 0x84: 'E', 0x85: 'F', 0x86: 'G', 0x87: 'H',
  0x88: 'I', 0x89: 'J', 0x8A: 'K', 0x8B: 'L', 0x8C: 'M', 0x8D: 'N', 0x8E: 'O', 0x8F: 'P',
  0x90: 'Q', 0x91: 'R', 0x92: 'S', 0x93: 'T', 0x94: 'U', 0x95: 'V', 0x96: 'W', 0x97: 'X',
  0x98: 'Y', 0x99: 'Z',
  0x9A: '(', 0x9B: ')', 0x9C: ':', 0x9D: ';', 0x9E: '[', 0x9F: ']',
  0xA0: 'a', 0xA1: 'b', 0xA2: 'c', 0xA3: 'd', 0xA4: 'e', 0xA5: 'f', 0xA6: 'g', 0xA7: 'h',
  0xA8: 'i', 0xA9: 'j', 0xAA: 'k', 0xAB: 'l', 0xAC: 'm', 0xAD: 'n', 0xAE: 'o', 0xAF: 'p',
  0xB0: 'q', 0xB1: 'r', 0xB2: 's', 0xB3: 't', 0xB4: 'u', 0xB5: 'v', 0xB6: 'w', 0xB7: 'x',
  0xB8: 'y', 0xB9: 'z',
  0xBA: '\u00E9', // é
  0xF6: '0', 0xF7: '1', 0xF8: '2', 0xF9: '3', 0xFA: '4', 0xFB: '5', 0xFC: '6', 0xFD: '7', 0xFE: '8', 0xFF: '9',
  0x7F: ' ',   // Space
  0x50: '',    // Terminator (mapped to empty string)
  0x5D: '\u{1F464}', // Trainer OT placeholder
  0xE0: "'",   // Apostrophe (and variants normalized to this)
  0xE1: 'Pk',
  0xE2: 'Mn',
  0xE3: '-',
  0xE4: "'",   // 'r ligature
  0xE5: "'",   // 'm ligature
  0xE6: '?',
  0xE7: '!',
  0xE8: '.',
  0xF2: '.',   // '..'
  0xEF: '\u2642', // ♂
  0xF3: '/',
  0xF4: ',',
  0xF5: '\u2640', // ♀
  0x52: '\n',  // Line break
  0x54: 'POK\u00E9', // POKé
  0x60: "'",   // Bold single quote
};

/** Reverse map: Unicode character → internal byte value (for encoding) */
const CHAR_MAP_INT_REV: Record<string, number> = {
  'A': 0x80, 'B': 0x81, 'C': 0x82, 'D': 0x83, 'E': 0x84, 'F': 0x85, 'G': 0x86, 'H': 0x87,
  'I': 0x88, 'J': 0x89, 'K': 0x8A, 'L': 0x8B, 'M': 0x8C, 'N': 0x8D, 'O': 0x8E, 'P': 0x8F,
  'Q': 0x90, 'R': 0x91, 'S': 0x92, 'T': 0x93, 'U': 0x94, 'V': 0x95, 'W': 0x96, 'X': 0x97,
  'Y': 0x98, 'Z': 0x99, '(': 0x9A, ')': 0x9B, ':': 0x9C, ';': 0x9D, '[': 0x9E, ']': 0x9F,
  'a': 0xA0, 'b': 0xA1, 'c': 0xA2, 'd': 0xA3, 'e': 0xA4, 'f': 0xA5, 'g': 0xA6, 'h': 0xA7,
  'i': 0xA8, 'j': 0xA9, 'k': 0xAA, 'l': 0xAB, 'm': 0xAC, 'n': 0xAD, 'o': 0xAE, 'p': 0xAF,
  'q': 0xB0, 'r': 0xB1, 's': 0xB2, 't': 0xB3, 'u': 0xB4, 'v': 0xB5, 'w': 0xB6, 'x': 0xB7,
  'y': 0xB8, 'z': 0xB9,
  ' ': 0x7F, '?': 0xE6, '!': 0xE7, '.': 0xE8, '-': 0xE3,
  '\u{1F464}': 0x5D,
  '\u2642': 0xEF, '\u2640': 0xF5,
  '\u00E9': 0xBA,
  "'": 0xE0, '\u2019': 0xE0, '`': 0xE0,  // Apostrophe variants
  '/': 0xF3, ',': 0xF4,
  '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF
};

// ── Japanese character maps ──

// JPN_KATAKANA, JPN_HIRAGANA, JPN_LATIN are imported from gbCharsets.ts
// to avoid duplicating these constants across files.

const CHAR_MAP_JP: Record<number, string> = {
  0x7F: ' ',
  0x50: '',
  0x5D: '\u{1F464}',
  0xEF: '\u2642',
  0xF5: '\u2640',
  0xF0: '円',
  0xE3: 'ー',
  0xE4: '゜',
  0xE5: '゛',
  0xE6: '?',
  0xE7: '!',
  0xE8: '。',
  0xF1: '×',
};

const CHAR_MAP_JP_REV: Record<string, number> = {
  ' ': 0x7F,
  '\u2642': 0xEF,
  '\u2640': 0xF5,
  '円': 0xF0,
  'ー': 0xE3,
  '゜': 0xE4,
  '゛': 0xE5,
  '?': 0xE6,
  '!': 0xE7,
  '。': 0xE8,
  '×': 0xF1,
  '\u{1F464}': 0x5D,
  '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF
};

// ── Valid character sets for isValidChar/sanitize ──

const ALLOWED_ENG_CHARS = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  ' ',
  '(', ')', ':', ';', '[', ']', '?', '!', '.', '-', ',', '/',
  '\u{1F464}', '\u2642', '\u2640', '\u00E9'
]);

const ALLOWED_JPN_CHARS = new Set([
  ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '\u2642', '\u2640', '円', 'ー', '゜', '゛', '?', '!', '。', '×', '\u{1F464}'
]);
for (const char of JPN_KATAKANA) ALLOWED_JPN_CHARS.add(char);
for (const char of JPN_HIRAGANA) ALLOWED_JPN_CHARS.add(char);
for (const char of JPN_LATIN) ALLOWED_JPN_CHARS.add(char);

// ── GameBoyTextCodec class ──

export class GameBoyTextCodec implements ITextCodec {
  readonly charSize: 1 = 1;        // Gen 1/2: single-byte encoding
  readonly terminator = 0x50;       // Gen 1/2 terminator
  readonly isJapanese: boolean;

  constructor(region: 'international' | 'japanese' | 'korean' = 'international') {
    this.isJapanese = region === 'japanese';
  }

  decode(data: Uint8Array, offset: number, maxLength: number): string {
    let result = '';
    for (let i = 0; i < maxLength; i++) {
      if (offset + i >= data.length) break;
      const byte = data[offset + i]!;

      // Terminators: 0x50 is standard, 0x00 is often in empty/padded data
      if (byte === 0x50 || byte === 0x00) break;

      if (this.isJapanese) {
        if (byte >= 0x80 && byte <= 0xB1) {
          result += JPN_KATAKANA[byte - 0x80] || '?';
        } else if (byte >= 0xB2 && byte <= 0xE3) {
          result += JPN_HIRAGANA[byte - 0xB2] || '?';
        } else if (byte >= 0xF6 && byte <= 0xFF) {
          result += String(byte - 0xF6);
        } else if (byte >= 0x60 && byte < 0x60 + JPN_LATIN.length) {
          result += JPN_LATIN[byte - 0x60];
        } else {
          result += CHAR_MAP_JP[byte] || '?';
        }
      } else {
        result += CHAR_MAP_INT[byte] || '?';
      }
    }
    return result;
  }

  encode(text: string, maxLength: number, terminator: number = 0x50): Uint8Array {
    const buffer = new Uint8Array(maxLength);
    for (let i = 0; i < maxLength; i++) {
      if (i < text.length) {
        const char = text[i]!;
        if (this.isJapanese) {
          const kIdx = JPN_KATAKANA.indexOf(char);
          if (kIdx !== -1) {
            buffer[i] = 0x80 + kIdx;
          } else {
            const hIdx = JPN_HIRAGANA.indexOf(char);
            if (hIdx !== -1) {
              buffer[i] = 0xB2 + hIdx;
            } else {
              const lIdx = JPN_LATIN.indexOf(char);
              if (lIdx !== -1) {
                buffer[i] = 0x60 + lIdx;
              } else if (CHAR_MAP_JP_REV[char] !== undefined) {
                buffer[i] = CHAR_MAP_JP_REV[char]!;
              } else {
                buffer[i] = 0xE6; // question mark on unmatched
              }
            }
          }
        } else {
          buffer[i] = CHAR_MAP_INT_REV[char] !== undefined ? CHAR_MAP_INT_REV[char]! : 0xE6;
        }
      } else {
        buffer[i] = terminator;
      }
    }
    return buffer;
  }

  isValidChar(char: string): boolean {
    if (this.isJapanese) {
      return ALLOWED_JPN_CHARS.has(char);
    }
    // Standard English single quote alternatives can be treated as valid since we sanitize them
    if (char === "'" || char === '\u2019' || char === '`') {
      return true;
    }
    return ALLOWED_ENG_CHARS.has(char);
  }

  sanitize(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i]!;
      if (this.isJapanese) {
        if (ALLOWED_JPN_CHARS.has(char)) {
          result += char;
        }
      } else {
        // Normalize quote variants to standard single quote
        if (char === "'" || char === '\u2019' || char === '`') {
          result += "'";
        } else if (ALLOWED_ENG_CHARS.has(char)) {
          result += char;
        }
      }
    }
    return result;
  }

  nicknameMaxLength(): number {
    return this.isJapanese ? 5 : 10;
  }

  otNameMaxLength(): number {
    return this.isJapanese ? 5 : 10;
  }
}
