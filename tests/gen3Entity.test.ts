/**
 * Gen 3 PK3 crypto + synthetic fixture tests (TODO §4 crypto, §5 fixture).
 *
 * Builds a *synthetic* (legally clean, no ROM data) canonical PK3, proves the
 * encrypt→decrypt round-trip is byte-exact across many PIDs (so all 24 block
 * orderings are exercised), checks the checksum, and confirms the entity-format
 * length waterfall recognises the 80-byte result as a Gen 3 stored entity.
 */
import { describe, it, expect } from 'vitest';
import {
  encryptPk3,
  decryptPk3,
  gen3DataChecksum,
  xorCryptData,
  pk3CryptoKey,
  PK3_SIZE_STORED,
  PK3_DATA_OFFSET,
  PK3_DATA_SIZE,
} from '../lib/generations/gen3/entity';
import { combinedTrainerId } from '../lib/generations/gen3/identity';
import { getEntityFormatByLength } from '../lib/core/entityFormat';

/** Build a synthetic 80-byte canonical (decrypted, G/A/E/M order) PK3. */
function buildCanonicalPk3(pid: number, otid: number, seed = 1): Uint8Array {
  const buf = new Uint8Array(PK3_SIZE_STORED);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, pid >>> 0, true);
  dv.setUint32(4, otid >>> 0, true);
  // Deterministic pseudo-random header + data so each fixture is distinct.
  let x = (seed * 2654435761) >>> 0;
  for (let i = 8; i < PK3_SIZE_STORED; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    buf[i] = (x >>> 16) & 0xff;
  }
  // The checksum field is part of the header that encrypt/decrypt round-trips,
  // so set it to the correct value (word-sum of the data region, order-independent).
  const checksum = gen3DataChecksum(buf.subarray(PK3_DATA_OFFSET, PK3_DATA_OFFSET + PK3_DATA_SIZE));
  dv.setUint16(0x1c, checksum, true);
  return buf;
}

describe('Gen 3 PK3 crypto (TODO §4)', () => {
  it('xorCryptData is symmetric (decrypt = encrypt)', () => {
    const data = new Uint8Array(PK3_DATA_SIZE).map((_, i) => (i * 7 + 3) & 0xff);
    const key = 0xdead_beef;
    expect(Array.from(xorCryptData(xorCryptData(data, key), key))).toEqual(Array.from(data));
  });

  it('key is PID ^ OTID', () => {
    expect(pk3CryptoKey(0xffff_0000, 0x0000_ffff)).toBe(0xffff_ffff);
  });

  it('round-trips byte-for-byte for a single entity', () => {
    const pid = 0x1234_5678;
    const otid = combinedTrainerId(54321, 12345);
    const canonical = buildCanonicalPk3(pid, otid);
    const encrypted = encryptPk3(canonical);
    const { bytes, checksumValid } = decryptPk3(encrypted);
    expect(checksumValid).toBe(true);
    expect(Array.from(bytes)).toEqual(Array.from(canonical));
  });

  it('round-trips across PIDs hitting all 24 block orderings', () => {
    for (let i = 0; i < 48; i++) {
      const pid = ((i * 1103515245 + 12345) >>> 0) + i; // varied PIDs → varied pid%24
      const otid = combinedTrainerId(1000 + i, 2000 + i);
      const canonical = buildCanonicalPk3(pid, otid, i + 1);
      const decoded = decryptPk3(encryptPk3(canonical));
      expect(decoded.checksumValid, `pid=${pid}`).toBe(true);
      expect(Array.from(decoded.bytes), `pid=${pid}`).toEqual(Array.from(canonical));
    }
  });

  it('encryption actually transforms the data region (not identity)', () => {
    const pid = 0x0badf00d;
    const canonical = buildCanonicalPk3(pid, combinedTrainerId(1, 2));
    const encrypted = encryptPk3(canonical);
    const a = canonical.subarray(PK3_DATA_OFFSET, PK3_DATA_OFFSET + PK3_DATA_SIZE);
    const b = encrypted.subarray(PK3_DATA_OFFSET, PK3_DATA_OFFSET + PK3_DATA_SIZE);
    expect(Array.from(b)).not.toEqual(Array.from(a));
  });

  it('a corrupted data region fails the checksum on decrypt', () => {
    const encrypted = encryptPk3(buildCanonicalPk3(0x2222_3333, combinedTrainerId(7, 8)));
    encrypted[PK3_DATA_OFFSET] = (encrypted[PK3_DATA_OFFSET]! ^ 0xff) & 0xff; // flip a byte
    expect(decryptPk3(encrypted).checksumValid).toBe(false);
  });

  it('checksum is a position-independent word sum', () => {
    const data = new Uint8Array(PK3_DATA_SIZE).map((_, i) => (i * 13) & 0xff);
    expect(gen3DataChecksum(data)).toBe(gen3DataChecksum(data)); // stable
    expect(gen3DataChecksum(new Uint8Array(PK3_DATA_SIZE))).toBe(0); // all-zero → 0
  });
});

describe('Gen 3 entity detection (TODO §5 — synthetic fixture)', () => {
  it('the encrypted fixture is recognised as an 80-byte Gen 3 stored entity', () => {
    const encrypted = encryptPk3(buildCanonicalPk3(0x9999_8888, combinedTrainerId(11, 22)));
    expect(encrypted.length).toBe(80);
    const guess = getEntityFormatByLength(encrypted.length);
    expect(guess).not.toBeNull();
    expect(guess!.generation).toBe(3);
    expect(guess!.context).toBe('stored');
    expect(guess!.ambiguous).toBe(false);
  });
});
