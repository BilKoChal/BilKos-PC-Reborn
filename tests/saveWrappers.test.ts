/**
 * Save-wrapper detection-waterfall tests (TODO 8.5.1).
 *
 * Proves the strip-then-retry fallback: a valid Gen 1 save wrapped in an
 * emulator/.dsv footer is detected after stripping, while the no-wrapper
 * failure path is unchanged (additive behavior).
 */
import { describe, it, expect } from 'vitest';
import { stripKnownWrappers, KNOWN_GB_SAVE_SIZES } from '../lib/core/saveWrappers';
import { AdapterRegistry } from '../lib/core/AdapterRegistry';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { getGen1Offsets } from '../lib/generations/gen1/data/offsets';

const DESMUME_MAGIC = '|-DESMUME SAVE-|';

/** A minimal but checksum-valid 32 KB international Gen 1 save image. */
function validGen1Save(): Uint8Array {
  const off = getGen1Offsets('international');
  const buf = new Uint8Array(0x8000);
  buf[0x2F2C] = 1;      // party count
  buf[0x2F2D] = 0x99;   // first species (non-empty)
  let sum = 0;
  for (let i = off.PLAYER_NAME; i < off.CHECKSUM; i++) sum += buf[i]!;
  buf[off.CHECKSUM] = (~sum) & 0xFF;
  return buf;
}

function withTrailingFooter(inner: Uint8Array, footer: Uint8Array): Uint8Array {
  const out = new Uint8Array(inner.length + footer.length);
  out.set(inner, 0);
  out.set(footer, inner.length);
  return out;
}

describe('stripKnownWrappers (TODO 8.5.1)', () => {
  it('strips a DeSmuME .dsv footer (magic at end) back to a known GB size', () => {
    const inner = new Uint8Array(0x8000);
    const footer = new Uint8Array([...new Uint8Array(8), ...Array.from(DESMUME_MAGIC).map(c => c.charCodeAt(0))]);
    const wrapped = withTrailingFooter(inner, footer);
    const candidates = stripKnownWrappers(wrapped, 'game.dsv');
    expect(candidates.some(c => c.handlerId === 'desmume-dsv' && c.buffer.length === 0x8000)).toBe(true);
  });

  it('strips a generic trailing footer (not the inline +16) to a known size', () => {
    const wrapped = withTrailingFooter(new Uint8Array(0x8000), new Uint8Array(100));
    const candidates = stripKnownWrappers(wrapped, 'game.sav');
    expect(candidates.some(c => c.buffer.length === 0x8000)).toBe(true);
  });

  it('does NOT handle the +16 emulator footer (adapters accept that inline)', () => {
    const wrapped = withTrailingFooter(new Uint8Array(0x8000), new Uint8Array(16));
    const candidates = stripKnownWrappers(wrapped, 'game.sav');
    // trailing-footer handler explicitly skips extra===16; no candidate offered.
    expect(candidates.every(c => c.buffer.length !== 0x8000) || candidates.length === 0).toBe(true);
  });

  it('returns [] for a clean save with no wrapper', () => {
    expect(stripKnownWrappers(new Uint8Array(0x8000), 'game.sav')).toEqual([]);
  });

  it('exposes the known GB sizes', () => {
    expect(KNOWN_GB_SAVE_SIZES).toContain(0x8000);
    expect(KNOWN_GB_SAVE_SIZES).toContain(0x10000);
  });
});

describe('detectAndParse strip-then-retry waterfall (TODO 8.5.1)', () => {
  function freshRegistry(): AdapterRegistry {
    const reg = new AdapterRegistry();
    reg.register(new Gen1Adapter());
    return reg;
  }

  it('detects a valid Gen 1 save directly (phase 1, unchanged)', () => {
    const reg = freshRegistry();
    const res = reg.detectAndParse(validGen1Save(), 'blue.sav');
    expect(res.success).toBe(true);
    expect(res.generation).toBe(1);
  });

  it('detects a Gen 1 save wrapped in a .dsv footer via strip-then-retry (phase 2)', () => {
    const reg = freshRegistry();
    const footer = new Uint8Array([...new Uint8Array(8), ...Array.from(DESMUME_MAGIC).map(c => c.charCodeAt(0))]);
    const wrapped = withTrailingFooter(validGen1Save(), footer);
    // Direct detection fails (wrong size), wrapper strip recovers it.
    const res = reg.detectAndParse(wrapped, 'blue.dsv');
    expect(res.success).toBe(true);
    expect(res.generation).toBe(1);
  });

  it('detects a Gen 1 save with a generic trailing footer', () => {
    const reg = freshRegistry();
    const wrapped = withTrailingFooter(validGen1Save(), new Uint8Array(64));
    const res = reg.detectAndParse(wrapped, 'blue.sav');
    expect(res.success).toBe(true);
    expect(res.generation).toBe(1);
  });

  it('still fails (unchanged) for a buffer that is neither a save nor a known wrapper', () => {
    const reg = freshRegistry();
    const res = reg.detectAndParse(new Uint8Array(1234), 'garbage.bin');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Unsupported save format|No compatible/);
  });
});
