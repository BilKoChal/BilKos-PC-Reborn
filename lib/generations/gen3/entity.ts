/**
 * Gen 3 entity (PK3) crypto + block shuffle (TODO §4).
 *
 * Implements the Generation III stored-Pokémon (`.pk3`, 80-byte) encryption on
 * top of the validated, generation-agnostic shuffle primitives in
 * `lib/core/entityFormat.ts`. The PK3 layout:
 *
 *   0x00 u32  Personality value (PID)
 *   0x04 u32  OT ID (TID in low 16 bits, SID in high 16 bits)
 *   0x08      …header… (nickname, language, OT name, markings)
 *   0x1C u16  Checksum (sum of the 24 u16 words of the decrypted data region)
 *   0x1E u16  (sanity / padding)
 *   0x20 0x30 Data region: four 12-byte blocks (Growth, Attacks, EVs, Misc),
 *             XOR-encrypted with an LCRNG stream cipher seeded from `PID ^ OTID`
 *             and shuffled into one of 24 orderings selected by `PID % 24`.
 *
 * Decrypt = XOR the 48-byte region with the LCRNG stream, then unshuffle to
 * canonical G/A/E/M order. Encrypt = shuffle canonical, then XOR. The LCRNG
 * stream is symmetric (re-applying it with the same seed recovers the plaintext),
 * and the checksum is a word-sum (order-independent), so the whole transform
 * round-trips exactly AND matches PKHeX / real Gen 3 cartridges.
 *
 * BUG FIX (BUG-G3-01): Previously used a fixed-key XOR (`data[i] ^ (PID ^ OTID)`
 * for every 4-byte word). The real Gen 3 algorithm is an LCRNG stream cipher:
 *   seed = (PID ^ OTID) >>> 0
 *   for each 4-byte chunk:
 *     seed = (seed * 0x41C64E6D + 0x6073) >>> 0    (LCRNG advance, BEFORE XOR)
 *     chunk = chunk ^ seed
 * Each chunk gets a FRESH PRNG output. The old fixed-key XOR would silently
 * corrupt any real Gen 3 save opened in this editor (and produce files no real
 * game or PKHeX could read). The fix implements the LCRNG correctly.
 *
 * Reference: PKHeX `PK3.cs` `Encrypt()` / `Decrypt()` and Bulbapedia's
 * "Pokémon data substructures (Generation III)" article. The LCRNG constants
 * `0x41C64E6D` / `0x6073` are the standard Pokémon LCRNG (also used by the
 * Gen 3/4/5 PRNG, egg generation, etc.).
 */
import { BLOCK_ORDERS, getBlockOrderIndex, shuffleBlocks, unshuffleBlocks } from '../../core/entityFormat';

export const PK3_SIZE_STORED = 80;
export const PK3_DATA_OFFSET = 0x20;
export const PK3_DATA_SIZE = 48; // 4 blocks × 12 bytes
export const PK3_BLOCK_SIZE = 12;
export const PK3_CHECKSUM_OFFSET = 0x1c;

// LCRNG constants — the standard Pokémon Linear Congruential RNG used by Gen 3-5.
const LCRNG_MULT = 0x41c64e6d;
const LCRNG_ADD = 0x6073;

function readU32LE(data: Uint8Array, offset: number): number {
  return (
    (data[offset]! | (data[offset + 1]! << 8) | (data[offset + 2]! << 16) | (data[offset + 3]! << 24)) >>> 0
  );
}

function writeU16LE(data: Uint8Array, offset: number, value: number): void {
  data[offset] = value & 0xff;
  data[offset + 1] = (value >> 8) & 0xff;
}

function readU16LE(data: Uint8Array, offset: number): number {
  return (data[offset]! | (data[offset + 1]! << 8)) & 0xffff;
}

/**
 * Advance the Pokémon LCRNG by one step. Returns the next 32-bit state.
 *   next = (seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
 * Uses `Math.imul` to stay in 32-bit range without floating-point precision loss.
 */
function lcrngNext(seed: number): number {
  return (Math.imul(seed >>> 0, LCRNG_MULT) + LCRNG_ADD) >>> 0;
}

/**
 * The 32-bit seed for the PK3 stream cipher: `PID ^ OTID`. This is the value
 * fed into the LCRNG; the LCRNG is then advanced once per 4-byte chunk BEFORE
 * each XOR (so the first chunk is XORed with `lcrngNext(PID ^ OTID)`, not with
 * `PID ^ OTID` itself).
 */
export function pk3CryptoKey(pid: number, otid: number): number {
  return ((pid >>> 0) ^ (otid >>> 0)) >>> 0;
}

/**
 * XOR a 48-byte data region with the LCRNG stream cipher seeded from `key`.
 * Symmetric: applying it twice with the same key returns the original bytes
 * (encrypt and decrypt are the same operation).
 *
 * The LCRNG is advanced ONCE per 4-byte chunk BEFORE the XOR, matching PKHeX:
 *   let seed = key
 *   for each 4-byte chunk i:
 *     seed = lcrngNext(seed)         // advance FIRST
 *     chunk[i] ^= seed               // 32-bit LE XOR with the fresh output
 */
export function xorCryptData(data: Uint8Array, key: number): Uint8Array {
  if (data.length !== PK3_DATA_SIZE) {
    throw new Error(`PK3 data region must be ${PK3_DATA_SIZE} bytes, got ${data.length}`);
  }
  const out = new Uint8Array(data);
  let seed = key >>> 0;
  for (let i = 0; i < PK3_DATA_SIZE; i += 4) {
    seed = lcrngNext(seed); // advance BEFORE XOR (PKHeX order)
    const word = readU32LE(out, i) ^ seed;
    out[i] = word & 0xff;
    out[i + 1] = (word >>> 8) & 0xff;
    out[i + 2] = (word >>> 16) & 0xff;
    out[i + 3] = (word >>> 24) & 0xff;
  }
  return out;
}

/**
 * The PK3 checksum: the sum of the 24 little-endian u16 words of the *decrypted*
 * data region, truncated to 16 bits. Position-independent (a plain sum), so it
 * is identical for the shuffled and unshuffled layouts.
 */
export function gen3DataChecksum(decryptedData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < decryptedData.length; i += 2) {
    sum = (sum + readU16LE(decryptedData, i)) & 0xffff;
  }
  return sum;
}

export interface DecryptedPk3 {
  /** 80-byte buffer with the data region decrypted and unshuffled (G/A/E/M). */
  bytes: Uint8Array;
  /** True when the stored checksum matched the recomputed one. */
  checksumValid: boolean;
}

/** Decrypt + unshuffle a stored PK3. Does not mutate the input. */
export function decryptPk3(raw: Uint8Array): DecryptedPk3 {
  if (raw.length < PK3_SIZE_STORED) {
    throw new Error(`PK3 must be at least ${PK3_SIZE_STORED} bytes, got ${raw.length}`);
  }
  const pid = readU32LE(raw, 0);
  const otid = readU32LE(raw, 4);
  const key = pk3CryptoKey(pid, otid);
  const order = BLOCK_ORDERS[getBlockOrderIndex(pid, 3)]!;

  const encrypted = raw.subarray(PK3_DATA_OFFSET, PK3_DATA_OFFSET + PK3_DATA_SIZE);
  const decryptedShuffled = xorCryptData(encrypted, key);
  const checksumValid = gen3DataChecksum(decryptedShuffled) === readU16LE(raw, PK3_CHECKSUM_OFFSET);

  // Data region is its own 48-byte buffer; unshuffle with headerSize 0.
  const canonicalData = unshuffleBlocks(decryptedShuffled, 0, PK3_BLOCK_SIZE, order);

  const bytes = new Uint8Array(raw.subarray(0, PK3_SIZE_STORED));
  bytes.set(canonicalData, PK3_DATA_OFFSET);
  return { bytes, checksumValid };
}

/**
 * Shuffle + encrypt a canonical PK3 (data region in G/A/E/M order), refreshing
 * the checksum. Inverse of {@link decryptPk3}:
 * `decryptPk3(encryptPk3(x)).bytes` equals `x` for any valid 80-byte `x`.
 */
export function encryptPk3(canonical: Uint8Array): Uint8Array {
  if (canonical.length < PK3_SIZE_STORED) {
    throw new Error(`PK3 must be at least ${PK3_SIZE_STORED} bytes, got ${canonical.length}`);
  }
  const pid = readU32LE(canonical, 0);
  const otid = readU32LE(canonical, 4);
  const key = pk3CryptoKey(pid, otid);
  const order = BLOCK_ORDERS[getBlockOrderIndex(pid, 3)]!;

  const canonicalData = canonical.subarray(PK3_DATA_OFFSET, PK3_DATA_OFFSET + PK3_DATA_SIZE);
  const shuffled = shuffleBlocks(canonicalData, 0, PK3_BLOCK_SIZE, order);
  const checksum = gen3DataChecksum(shuffled);
  const encrypted = xorCryptData(shuffled, key);

  const out = new Uint8Array(canonical.subarray(0, PK3_SIZE_STORED));
  writeU16LE(out, PK3_CHECKSUM_OFFSET, checksum);
  out.set(encrypted, PK3_DATA_OFFSET);
  return out;
}
