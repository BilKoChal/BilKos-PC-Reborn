import { describe, it, expect } from 'vitest';
import { decodeText } from '../lib/utils/textDecoder';
import { encodeGameBoyText, CHAR_MAP_REV } from '../lib/utils/textCodec';

describe('Game Boy Text Codec — encode/decode symmetry', () => {
  it('should round-trip uppercase A-Z', () => {
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(0x41 + i); // 'A' to 'Z'
      const encoded = encodeGameBoyText(char, 3, 0x50);
      const decoded = decodeText(encoded, 0, 3);
      expect(decoded).toBe(char);
    }
  });

  it('should round-trip lowercase a-z', () => {
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(0x61 + i); // 'a' to 'z'
      const encoded = encodeGameBoyText(char, 3, 0x50);
      const decoded = decodeText(encoded, 0, 3);
      expect(decoded).toBe(char);
    }
  });

  it('should round-trip digits 0-9', () => {
    const digits = '0123456789';
    const encoded = encodeGameBoyText(digits, 12, 0x50);
    const decoded = decodeText(encoded, 0, 12);
    expect(decoded).toBe(digits);
  });

  it('should round-trip space character', () => {
    const text = 'A B';
    const encoded = encodeGameBoyText(text, 5, 0x50);
    const decoded = decodeText(encoded, 0, 5);
    expect(decoded).toBe('A B');
  });

  it('should round-trip special punctuation', () => {
    const special = '?!-.';
    const encoded = encodeGameBoyText(special, 6, 0x50);
    const decoded = decodeText(encoded, 0, 6);
    expect(decoded).toBe(special);
  });

  it('should pad with terminator bytes', () => {
    const text = 'AB';
    const encoded = encodeGameBoyText(text, 5, 0x50);
    // First 2 bytes should be 'A', 'B'; remaining 3 should be 0x50
    expect(encoded[0]).toBe(CHAR_MAP_REV['A']);
    expect(encoded[1]).toBe(CHAR_MAP_REV['B']);
    expect(encoded[2]).toBe(0x50);
    expect(encoded[3]).toBe(0x50);
    expect(encoded[4]).toBe(0x50);
  });

  it('should truncate text that exceeds buffer length', () => {
    const text = 'HELLO';
    const encoded = encodeGameBoyText(text, 3, 0x50);
    // Only first 3 characters should be encoded
    expect(encoded[0]).toBe(CHAR_MAP_REV['H']);
    expect(encoded[1]).toBe(CHAR_MAP_REV['E']);
    expect(encoded[2]).toBe(CHAR_MAP_REV['L']);
  });

  it('should handle empty string', () => {
    const encoded = encodeGameBoyText('', 3, 0x50);
    expect(encoded[0]).toBe(0x50);
    expect(encoded[1]).toBe(0x50);
    expect(encoded[2]).toBe(0x50);
  });

  it('should round-trip a typical trainer name', () => {
    const name = 'RED';
    const encoded = encodeGameBoyText(name, 11, 0x50);
    const decoded = decodeText(encoded, 0, 11);
    expect(decoded).toBe(name);
  });

  it('should round-trip a typical Pokemon nickname', () => {
    const name = 'PIKACHU';
    const encoded = encodeGameBoyText(name, 11, 0x50);
    const decoded = decodeText(encoded, 0, 11);
    expect(decoded).toBe(name);
  });

  it('should handle the é character (Pokemon)', () => {
    const text = 'POKéMON';
    const encoded = encodeGameBoyText(text, 11, 0x50);
    const decoded = decodeText(encoded, 0, 11);
    expect(decoded).toBe(text);
  });

  it('should handle gender symbols', () => {
    const maleText = 'NIDORAN♂';
    const encoded = encodeGameBoyText(maleText, 11, 0x50);
    const decoded = decodeText(encoded, 0, 11);
    expect(decoded).toBe(maleText);
  });

  it('should replace unknown characters with question mark', () => {
    const text = 'A@B'; // '@' is not in the Game Boy charset
    const encoded = encodeGameBoyText(text, 5, 0x50);
    const decoded = decodeText(encoded, 0, 5);
    // '@' should be encoded as '?' (0xE6), which decodes back to '?'
    expect(decoded).toBe('A?B');
  });

  it('should handle mixed case text', () => {
    // Gen 1/2 games typically use uppercase, but the codec supports lowercase
    const text = 'Ash';
    const encoded = encodeGameBoyText(text, 5, 0x50);
    const decoded = decodeText(encoded, 0, 5);
    expect(decoded).toBe(text);
  });

  it('should correctly encode and decode 11-byte Gen 1 name fields', () => {
    const name = 'BLUE';
    const encoded = encodeGameBoyText(name, 11, 0x50);
    expect(encoded.length).toBe(11);

    // Verify terminator placement
    for (let i = name.length; i < 11; i++) {
      expect(encoded[i]).toBe(0x50);
    }

    const decoded = decodeText(encoded, 0, 11);
    expect(decoded).toBe(name);
  });

  it('should correctly encode and decode 8-byte Gen 2 name fields', () => {
    const name = 'ETHAN';
    const encoded = encodeGameBoyText(name, 8, 0x50);
    expect(encoded.length).toBe(8);

    const decoded = decodeText(encoded, 0, 8);
    expect(decoded).toBe(name);
  });
});

describe('decodeText — edge cases', () => {
  it('should stop at null byte (0x00)', () => {
    const data = new Uint8Array([0x80, 0x81, 0x00, 0x82]); // A, B, null, C
    const result = decodeText(data, 0, 4);
    expect(result).toBe('AB');
  });

  it('should stop at terminator byte (0x50)', () => {
    const data = new Uint8Array([0x80, 0x81, 0x50, 0x82]); // A, B, term, C
    const result = decodeText(data, 0, 4);
    expect(result).toBe('AB');
  });

  it('should decode numeric characters', () => {
    // 0xF6 = '0', 0xF7 = '1', ..., 0xFF = '9'
    const data = new Uint8Array([0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0x50]);
    const result = decodeText(data, 0, 6);
    expect(result).toBe('01234');
  });

  it('should return empty string for buffer starting with terminator', () => {
    const data = new Uint8Array([0x50, 0x80, 0x81]);
    const result = decodeText(data, 0, 3);
    expect(result).toBe('');
  });
});
