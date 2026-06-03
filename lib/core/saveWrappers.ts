/**
 * Save-wrapper handlers: strip emulator/flashcart wrappers before detection
 * (TODO 8.5.1).
 *
 * PKHeX runs detection as an ordered waterfall and, before giving up, strips
 * known wrappers (DeSmuME `.dsv` RTC footers, Dolphin `.gci`, Action-Replay,
 * trailing emulator footers) and retries. This module formalizes that
 * "strip-then-retry" step in ONE place so new wrappers — and Gen 3+ emulator
 * formats — are added here rather than special-cased inside each adapter.
 *
 * Design contract: these handlers are a *fallback*. `AdapterRegistry.detectAndParse`
 * first tries direct detection (where the Gen 1/2 adapters already accept the
 * common GB `+16` emulator footer inline, so that path is unchanged). Only if
 * direct detection fails does it ask these handlers to produce candidate inner
 * buffers and retry. A handler must therefore be conservative: `canHandle` should
 * be a precise fingerprint, and `strip` must return the inner save bytes.
 */

/** Known raw Game Boy / Game Boy Color SRAM image sizes (Gen 1/2). */
export const KNOWN_GB_SAVE_SIZES: readonly number[] = [0x8000, 0x10000]; // 32 KB, 64 KB

export interface SaveWrapperHandler {
  /** Stable identifier (reported on success so the UI/logs can say what was stripped). */
  id: string;
  /** Precise fingerprint: can this handler strip a wrapper from this buffer? */
  canHandle(buffer: Uint8Array, filename: string): boolean;
  /** Return the inner save buffer with the wrapper removed. */
  strip(buffer: Uint8Array): Uint8Array;
}

const DESMUME_MAGIC = '|-DESMUME SAVE-|'; // 16 ASCII bytes at the very end of a .dsv

/** DeSmuME `.dsv`: a raw save image followed by a footer ending in the 16-byte
 *  magic "|-DESMUME SAVE-|". We strip back to the largest known GB save size
 *  that fits, which is the inner SRAM image. */
const desmumeDsvHandler: SaveWrapperHandler = {
  id: 'desmume-dsv',
  canHandle(buffer, filename) {
    if (buffer.length <= DESMUME_MAGIC.length) return false;
    const tail = buffer.subarray(buffer.length - DESMUME_MAGIC.length);
    const tailStr = String.fromCharCode(...tail);
    const hasMagic = tailStr === DESMUME_MAGIC;
    // Accept on magic, or on a .dsv extension as a softer hint.
    return hasMagic || filename.toLowerCase().endsWith('.dsv');
  },
  strip(buffer) {
    return stripToLargestKnownSize(buffer);
  },
};

/** Generic trailing-footer handler: some emulators/flashcarts append a small
 *  metadata footer after a power-of-two SRAM image (sizes the adapters don't
 *  already accept, i.e. not the inline `+16`). If the buffer is a known size
 *  plus a modest footer, strip back to the known size. */
const trailingFooterHandler: SaveWrapperHandler = {
  id: 'trailing-footer',
  canHandle(buffer) {
    for (const size of KNOWN_GB_SAVE_SIZES) {
      const extra = buffer.length - size;
      // Footer between 1 and 512 bytes; skip 16 (already accepted inline by the
      // adapters, so this handler need not — and to avoid masking real issues).
      if (extra > 0 && extra <= 512 && extra !== 16) return true;
    }
    return false;
  },
  strip(buffer) {
    return stripToLargestKnownSize(buffer);
  },
};

/** Truncate (from the start) to the largest known GB save size that is <= length. */
function stripToLargestKnownSize(buffer: Uint8Array): Uint8Array {
  let best = -1;
  for (const size of KNOWN_GB_SAVE_SIZES) {
    if (buffer.length >= size && size > best) best = size;
  }
  return best > 0 ? buffer.subarray(0, best) : buffer;
}

/** Ordered list of handlers (most specific first). */
export const SAVE_WRAPPER_HANDLERS: readonly SaveWrapperHandler[] = [
  desmumeDsvHandler,
  trailingFooterHandler,
];

export interface StrippedCandidate {
  handlerId: string;
  buffer: Uint8Array;
}

/**
 * Produce candidate inner buffers by applying every handler that fingerprints
 * the input. De-duplicates by resulting length so the caller doesn't retry the
 * same stripped buffer twice. Returns [] when nothing matches (caller then
 * reports the original "unsupported format" error, unchanged).
 */
export function stripKnownWrappers(buffer: Uint8Array, filename: string): StrippedCandidate[] {
  const out: StrippedCandidate[] = [];
  const seenLengths = new Set<number>([buffer.length]); // never re-offer the original
  for (const handler of SAVE_WRAPPER_HANDLERS) {
    if (!handler.canHandle(buffer, filename)) continue;
    const stripped = handler.strip(buffer);
    if (!seenLengths.has(stripped.length)) {
      seenLengths.add(stripped.length);
      out.push({ handlerId: handler.id, buffer: stripped });
    }
  }
  return out;
}
