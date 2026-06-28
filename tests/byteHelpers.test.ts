import { describe, it, expect } from 'vitest';
import {
  parseBCD,
  setBCD,
  countSetBits,
  getUInt16BigEndian,
  setUInt16BigEndian,
  getUInt24BigEndian,
  setUInt24BigEndian,
  getUInt16LE,
  getUInt32LE,
  BitUtils,
  decodeStatus,
  getAsciiString,
} from '../lib/utils/byteHelpers';

describe('parseBCD', () => {
  it('should parse a single-byte BCD value', () => {
    const data = new Uint8Array([0x12]);
    expect(parseBCD(data, 0, 1)).toBe(12);
  });

  it('should parse a two-byte BCD value (money)', () => {
    // 0x12 0x34 → 1234
    const data = new Uint8Array([0x12, 0x34]);
    expect(parseBCD(data, 0, 2)).toBe(1234);
  });

  it('should parse a three-byte BCD value (Gen 1 money)', () => {
    // 0x01 0x23 0x45 → 12345
    const data = new Uint8Array([0x01, 0x23, 0x45]);
    expect(parseBCD(data, 0, 3)).toBe(12345);
  });

  it('should parse max money value 999999', () => {
    const data = new Uint8Array([0x99, 0x99, 0x99]);
    expect(parseBCD(data, 0, 3)).toBe(999999);
  });

  it('should parse zero value', () => {
    const data = new Uint8Array([0x00, 0x00]);
    expect(parseBCD(data, 0, 2)).toBe(0);
  });
});

describe('setBCD', () => {
  it('should write a one-byte BCD value', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    setBCD(view, 0, 12, 1);
    expect(view.getUint8(0)).toBe(0x12);
  });

  it('should round-trip BCD encode/decode', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    const value = 12345;
    setBCD(view, 0, value, 3);
    const data = new Uint8Array(buf);
    expect(parseBCD(data, 0, 3)).toBe(value);
  });

  it('should round-trip max money value', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    const value = 999999;
    setBCD(view, 0, value, 3);
    const data = new Uint8Array(buf);
    expect(parseBCD(data, 0, 3)).toBe(value);
  });
});

describe('countSetBits', () => {
  it('should count bits in an all-zero buffer', () => {
    const data = new Uint8Array(4);
    expect(countSetBits(data, 0, 4)).toBe(0);
  });

  it('should count bits in an all-one buffer', () => {
    const data = new Uint8Array([0xFF, 0xFF]);
    expect(countSetBits(data, 0, 2)).toBe(16);
  });

  it('should count specific bit patterns', () => {
    // 0b10101010 = 4 set bits
    const data = new Uint8Array([0xAA]);
    expect(countSetBits(data, 0, 1)).toBe(4);
  });

  it('should count Gen 1 Pokédex owned bits (19 bytes)', () => {
    // Create a buffer where bits 1-151 are set (all 151 species owned)
    const data = new Uint8Array(19);
    for (let i = 0; i < 19; i++) data[i] = 0xFF;
    // 19 bytes = 152 bits, but first bit (index 0) is unused placeholder
    // With all FF, count = 152
    const count = countSetBits(data, 0, 19);
    expect(count).toBe(152); // 19 * 8 = 152 bits all set
  });
});

describe('Big Endian helpers', () => {
  it('getUInt16BigEndian should read 16-bit BE', () => {
    const data = new Uint8Array([0x12, 0x34]);
    expect(getUInt16BigEndian(data, 0)).toBe(0x1234);
  });

  it('setUInt16BigEndian should write 16-bit BE', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    setUInt16BigEndian(view, 0, 0xABCD);
    expect(view.getUint8(0)).toBe(0xAB);
    expect(view.getUint8(1)).toBe(0xCD);
  });

  it('getUInt24BigEndian should read 24-bit BE', () => {
    const data = new Uint8Array([0x01, 0x23, 0x45]);
    expect(getUInt24BigEndian(data, 0)).toBe(0x012345);
  });

  it('setUInt24BigEndian should write 24-bit BE', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    setUInt24BigEndian(view, 0, 0x012345);
    expect(view.getUint8(0)).toBe(0x01);
    expect(view.getUint8(1)).toBe(0x23);
    expect(view.getUint8(2)).toBe(0x45);
  });

  it('16-bit BE round-trip', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    const value = 4660; // 0x1234
    setUInt16BigEndian(view, 0, value);
    const data = new Uint8Array(buf);
    expect(getUInt16BigEndian(data, 0)).toBe(value);
  });
});

describe('Little Endian helpers', () => {
  it('getUInt16LE should read from Uint8Array', () => {
    const data = new Uint8Array([0x34, 0x12]);
    expect(getUInt16LE(data, 0)).toBe(0x1234);
  });

  it('getUInt16LE should read from DataView', () => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setUint16(0, 0x1234, true);
    expect(getUInt16LE(view, 0)).toBe(0x1234);
  });

  it('getUInt32LE should read from Uint8Array', () => {
    const data = new Uint8Array([0x78, 0x56, 0x34, 0x12]);
    expect(getUInt32LE(data, 0)).toBe(0x12345678);
  });

  it('getUInt32LE should handle unsigned result', () => {
    // 0xFF000000 as signed = negative, but >>> 0 forces unsigned
    const data = new Uint8Array([0x00, 0x00, 0x00, 0xFF]);
    expect(getUInt32LE(data, 0)).toBe(0xFF000000);
  });
});

describe('BitUtils', () => {
  it('getBit should extract individual bits', () => {
    expect(BitUtils.getBit(0b1010, 0)).toBe(false);
    expect(BitUtils.getBit(0b1010, 1)).toBe(true);
    expect(BitUtils.getBit(0b1010, 2)).toBe(false);
    expect(BitUtils.getBit(0b1010, 3)).toBe(true);
  });

  it('getRange should extract bit ranges', () => {
    // Extract bits 4-7 from 0xAB = 0b10101011 → upper nibble = 0xA
    expect(BitUtils.getRange(0xAB, 4, 4)).toBe(0xA);
    // Extract lower nibble
    expect(BitUtils.getRange(0xAB, 0, 4)).toBe(0xB);
  });
});

describe('decodeStatus', () => {
  it('should decode OK status', () => {
    expect(decodeStatus(0x00)).toBe('OK');
  });

  it('should decode Sleep status (bit 2)', () => {
    // Sleep uses bits 0-2 for turn count, bit 3 = 0
    expect(decodeStatus(0x04)).toBe('SLP'); // bit 2 set
  });

  // BUG-G02 regression: sleep counter values 1, 2, 3 must decode to SLP, not OK.
  // The old buggy code only checked `byte & (1 << 2)` (= 0x04), missing counters
  // 1 (0x01), 2 (0x02), and 3 (0x03), which silently decoded as "OK".
  it('BUG-G02 regression: sleep counter 1-3 decodes to SLP (not OK)', () => {
    expect(decodeStatus(0x01)).toBe('SLP'); // 1 turn remaining
    expect(decodeStatus(0x02)).toBe('SLP'); // 2 turns remaining
    expect(decodeStatus(0x03)).toBe('SLP'); // 3 turns remaining
  });

  it('BUG-G02 regression: all sleep counters 1-7 decode to SLP', () => {
    for (let counter = 1; counter <= 7; counter++) {
      expect(decodeStatus(counter), `counter=${counter}`).toBe('SLP');
    }
  });

  it('should decode Poison status', () => {
    expect(decodeStatus(0x08)).toBe('PSN'); // bit 3
  });

  it('should decode Burn status', () => {
    expect(decodeStatus(0x10)).toBe('BRN'); // bit 4
  });

  it('should decode Freeze status', () => {
    expect(decodeStatus(0x20)).toBe('FRZ'); // bit 5
  });

  it('should decode Paralysis status', () => {
    expect(decodeStatus(0x40)).toBe('PAR'); // bit 6
  });

  it('should prioritize SLP over other statuses when sleep bits are set', () => {
    // Sleep counter 3 + Poison bit → SLP wins (Gen 1/2 priority order)
    expect(decodeStatus(0x0B)).toBe('SLP'); // 0x08 (PSN) | 0x03 (SLP counter 3)
  });
});

describe('getAsciiString', () => {
  it('should read ASCII string up to null terminator', () => {
    const data = new Uint8Array([0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x00, 0x58]);
    expect(getAsciiString(data, 0, 7)).toBe('HELLO');
  });

  it('should read ASCII string without null terminator', () => {
    const data = new Uint8Array([0x41, 0x42, 0x43]);
    expect(getAsciiString(data, 0, 3)).toBe('ABC');
  });

  it('should respect length parameter', () => {
    const data = new Uint8Array([0x41, 0x42, 0x43, 0x44]);
    expect(getAsciiString(data, 0, 2)).toBe('AB');
  });
});
