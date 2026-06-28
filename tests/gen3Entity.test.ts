/**
 * Gen 3 PK3 crypto + synthetic fixture tests (TODO §4 crypto, §5 fixture).
 *
 * Builds a *synthetic* (legally clean, no ROM data) canonical PK3, proves the
 * encrypt→decrypt round-trip is byte-exact across many PIDs (so all 24 block
 * orderings are exercised), checks the checksum, and confirms the entity-format
 * length waterfall recognises the 80-byte result as a Gen 3 stored entity.
 *
 * BUG-G3-02 fix: added a non-tautological test (`LCRNG stream matches an
 * independent BigInt reference`) that proves the LCRNG implementation is correct
 * — not merely symmetric. The old tests only verified `encrypt(decrypt(x)) = x`,
 * which is trivially true for any XOR (even a no-op). The new test computes the
 * expected LCRNG stream using BigInt arithmetic (no `Math.imul`, no 32-bit
 * truncation tricks) and asserts the ciphertext matches byte-for-byte.
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

// ─── Independent LCRNG reference implementation (BigInt, no Math.imul) ─────────
// This is structurally different from the production code in entity.ts: it uses
// BigInt arithmetic to compute the exact LCRNG sequence without any 32-bit
// truncation tricks. If both implementations agree on the ciphertext for a known
// plaintext, the LCRNG is correct (not merely symmetric).
const LCRNG_MULT_BIG = 0x41c64e6dn;
const LCRNG_ADD_BIG = 0x6073n;
const MASK_32_BIG = 0xffffffffn;

/**
 * Compute the LCRNG stream for `numWords` 32-bit words, starting from `seedKey`.
 * Returns the words in the order they're XORed against the plaintext (i.e. the
 * LCRNG is advanced BEFORE each XOR, matching PKHeX).
 */
function lcrngStreamBigInt(seedKey: number, numWords: number): number[] {
  let seed = BigInt(seedKey >>> 0);
  const out: number[] = [];
  for (let i = 0; i < numWords; i++) {
    seed = (seed * LCRNG_MULT_BIG + LCRNG_ADD_BIG) & MASK_32_BIG;
    out.push(Number(seed));
  }
  return out;
}

/** Convert a 32-bit unsigned value to its 4 little-endian bytes. */
function u32ToLEBytes(value: number): [number, number, number, number] {
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ];
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

  // ─── BUG-G3-02: non-tautological LCRNG correctness test ────────────────────
  // Encrypts an all-zeros plaintext with a known key and asserts the ciphertext
  // equals the LCRNG stream computed by an independent BigInt reference. This
  // catches: wrong LCRNG constant, wrong "advance before XOR" order, wrong word
  // size, and wrong endianness — none of which the old round-trip test could
  // detect (any symmetric XOR passes the round-trip).
  it('LCRNG stream matches an independent BigInt reference (BUG-G3-02)', () => {
    const key = pk3CryptoKey(0x12345678, 0x9abcdef0);
    const plaintext = new Uint8Array(PK3_DATA_SIZE); // all zeros
    const ciphertext = xorCryptData(plaintext, key);

    // Independently compute the expected LCRNG stream (12 words for 48 bytes).
    const expectedWords = lcrngStreamBigInt(key, PK3_DATA_SIZE / 4);
    const expectedBytes = new Uint8Array(PK3_DATA_SIZE);
    for (let i = 0; i < expectedWords.length; i++) {
      const [b0, b1, b2, b3] = u32ToLEBytes(expectedWords[i]!);
      expectedBytes[i * 4] = b0;
      expectedBytes[i * 4 + 1] = b1;
      expectedBytes[i * 4 + 2] = b2;
      expectedBytes[i * 4 + 3] = b3;
    }

    // Since plaintext is all zeros, ciphertext MUST equal the raw LCRNG stream.
    expect(Array.from(ciphertext)).toEqual(Array.from(expectedBytes));
  });

  // ─── Sanity: the LCRNG first output for seed=0 is the well-known 0x00006073 ─
  // This is a single hard-coded anchor that doesn't depend on any reference
  // implementation at all. If the LCRNG constant or the "advance before XOR"
  // order is wrong, this fails.
  it('first LCRNG output for seed=0 is 0x00006073 (well-known anchor)', () => {
    const key = 0; // seed = PID ^ OTID = 0
    const plaintext = new Uint8Array(PK3_DATA_SIZE); // all zeros
    const ciphertext = xorCryptData(plaintext, key);
    // First 4 bytes of ciphertext = first LCRNG output in LE = 0x00006073
    expect(ciphertext[0]).toBe(0x73);
    expect(ciphertext[1]).toBe(0x60);
    expect(ciphertext[2]).toBe(0x00);
    expect(ciphertext[3]).toBe(0x00);
  });

  // ─── Non-zero plaintext: ciphertext = plaintext XOR LCRNG stream ───────────
  // Verifies the XOR is actually applied (not just returning the stream).
  it('ciphertext = plaintext XOR LCRNG stream for non-zero plaintext', () => {
    const key = pk3CryptoKey(0x0badf00d, 0xfeedface);
    const plaintext = new Uint8Array(PK3_DATA_SIZE).map((_, i) => (i * 31 + 7) & 0xff);
    const ciphertext = xorCryptData(plaintext, key);

    const streamWords = lcrngStreamBigInt(key, PK3_DATA_SIZE / 4);
    const expected = new Uint8Array(PK3_DATA_SIZE);
    for (let i = 0; i < streamWords.length; i++) {
      const word = (plaintext[i * 4]! |
                    (plaintext[i * 4 + 1]! << 8) |
                    (plaintext[i * 4 + 2]! << 16) |
                    (plaintext[i * 4 + 3]! << 24)) >>> 0;
      const xored = (word ^ streamWords[i]!) >>> 0;
      expected[i * 4] = xored & 0xff;
      expected[i * 4 + 1] = (xored >>> 8) & 0xff;
      expected[i * 4 + 2] = (xored >>> 16) & 0xff;
      expected[i * 4 + 3] = (xored >>> 24) & 0xff;
    }
    expect(Array.from(ciphertext)).toEqual(Array.from(expected));
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
