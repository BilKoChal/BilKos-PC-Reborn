
import { JPN_KATAKANA, JPN_HIRAGANA, JPN_LATIN } from './gbCharsets';

// A simplified mapping for Gen 1 & Gen 2 (English). 
const CHAR_MAP: Record<number, string> = {
  0x80: 'A', 0x81: 'B', 0x82: 'C', 0x83: 'D', 0x84: 'E', 0x85: 'F', 0x86: 'G', 0x87: 'H', 0x88: 'I',
  0x89: 'J', 0x8A: 'K', 0x8B: 'L', 0x8C: 'M', 0x8D: 'N', 0x8E: 'O', 0x8F: 'P', 0x90: 'Q', 0x91: 'R',
  0x92: 'S', 0x93: 'T', 0x94: 'U', 0x95: 'V', 0x96: 'W', 0x97: 'X', 0x98: 'Y', 0x99: 'Z',
  0x9A: '(', 0x9B: ')', 0x9C: ':', 0x9D: ';', 0x9E: '[', 0x9F: ']', 0xA0: 'a', 0xA1: 'b', 0xA2: 'c',
  0xA3: 'd', 0xA4: 'e', 0xA5: 'f', 0xA6: 'g', 0xA7: 'h', 0xA8: 'i', 0xA9: 'j', 0xAA: 'k', 0xAB: 'l',
  0xAC: 'm', 0xAD: 'n', 0xAE: 'o', 0xAF: 'p', 0xB0: 'q', 0xB1: 'r', 0xB2: 's', 0xB3: 't', 0xB4: 'u',
  0xB5: 'v', 0xB6: 'w', 0xB7: 'x', 0xB8: 'y', 0xB9: 'z', 
  
  // Numerics
  0xF6: '0',
  0xF7: '1', 0xF8: '2', 0xF9: '3', 0xFA: '4', 0xFB: '5', 0xFC: '6', 0xFD: '7', 0xFE: '8', 0xFF: '9',
  0xBA: 'é',
  
  // Special chars
  0x7F: ' ', // Space
  0x50: '', // Terminator
  0x5D: '👤', // Trainer special OT placeholder
  0xE8: '.',
  0xF2: '.', // '..'
  0xE3: '-',
  0xE6: '?',
  0xE7: '!',
  0xF3: '/', 
  0xF4: ',',
  
  // Gen 1 Specifics
  0xE1: 'Pk', 
  0xE2: 'Mn',
  0x60: "'", // Bold single quote
  0xEF: '♂',
  0xF5: '♀', // Actually female symbol in some contexts
  0xE0: "'",
  0xE4: "'", // 'r
  0xE5: "'", // 'm
  0x52: '\n', // Line break (handled as space or ignored)
  0x54: 'POKé',
};

// JPN_KATAKANA, JPN_HIRAGANA, JPN_LATIN imported from gbCharsets.ts

const CHAR_MAP_JP: Record<number, string> = {
  0x7F: ' ', // Space
  0x50: '', // Terminator
  0x5D: '👤', // Trainer special OT placeholder
  0xEF: '♂',
  0xF5: '♀',
  0xF0: '円',
  0xE3: 'ー',
  0xE4: '゜',
  0xE5: '゛',
  0xE6: '?',
  0xE7: '!',
  0xE8: '。',
  0xF1: '×',
};

export const decodeText = (buffer: Uint8Array, offset: number, maxLength: number, isJapanese?: boolean): string => {
  let result = '';
  for (let i = 0; i < maxLength; i++) {
    if (offset + i >= buffer.length) break;
    const byte = buffer[offset + i]!;
    
    // Terminators: 0x50 is standard, but 0x00 is often found in empty/padded data
    if (byte === 0x50 || byte === 0x00) break; 
    
    if (isJapanese) {
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
      const char = CHAR_MAP[byte] || '?';
      result += char;
    }
  }
  return result;
};