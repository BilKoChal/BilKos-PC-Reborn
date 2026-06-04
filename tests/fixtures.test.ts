/**
 * Save-fixture round-trip harness (TODO 5.4).
 *
 * Two layers:
 *  1. SYNTHETIC fixtures — built at runtime via each adapter's own parse/write path
 *     (checksum-valid, no personal data). These exercise detect→parse→write→re-parse
 *     and checksum recomputation. NOTE: because they're produced by the same code under
 *     test, they can't catch offset/region bugs that only a real dump would reveal.
 *  2. REAL fixtures — auto-discovered from `tests/fixtures/real/` if the maintainer drops
 *     privacy-safe dumps there (see tests/fixtures/README.md). Absent by default; the
 *     suite reports that and passes.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import { registry } from '../lib/core/AdapterRegistry';

// Reuse the minimal-save builders' approach: parse a blank-ish save, populate, write.
function buildSyntheticGen1(): Uint8Array {
  const a = new Gen1Adapter();
  // Start from an all-zero SRAM, parse leniently, then write to get valid checksums.
  const blank = new Uint8Array(0x8000);
  const save = a.parseSave(blank, 'synthetic.sav');
  return a.writeSave(save);
}

function buildSyntheticGen2(): Uint8Array {
  const a = new Gen2Adapter();
  const blank = new Uint8Array(0x8000);
  const save = a.parseSave(blank, 'synthetic.sav');
  return a.writeSave(save);
}

describe('Synthetic fixtures round-trip (TODO 5.4)', () => {
  it('Gen 1: detect→parse→write→re-parse preserves trainer id, party & box count', () => {
    const a = new Gen1Adapter();
    const first = buildSyntheticGen1();
    const p1 = a.parseSave(first, 'synthetic.sav');
    const p2 = a.parseSave(a.writeSave(p1), 'synthetic.sav');
    expect(p2.trainer.id).toBe(p1.trainer.id);
    expect(p2.partyCount).toBe(p1.partyCount);
    expect(p2.pcBoxes.length).toBe(p1.pcBoxes.length);
  });

  it('Gen 2: detect→parse→write→re-parse preserves trainer id, party & box count', () => {
    const a = new Gen2Adapter();
    const first = buildSyntheticGen2();
    const p1 = a.parseSave(first, 'synthetic.sav');
    const p2 = a.parseSave(a.writeSave(p1), 'synthetic.sav');
    expect(p2.trainer.id).toBe(p1.trainer.id);
    expect(p2.partyCount).toBe(p1.partyCount);
    expect(p2.pcBoxes.length).toBe(p1.pcBoxes.length);
  });

  it('synthetic saves pass their own checksum validation after write', () => {
    expect(new Gen1Adapter().validateSaveDetailed(buildSyntheticGen1()).valid).toBe(true);
    expect(new Gen2Adapter().validateSaveDetailed(buildSyntheticGen2()).valid).toBe(true);
  });
});

// ── Real fixtures (auto-discovered; absent by default) ──────────────────────
const REAL_DIR = join(__dirname, 'fixtures', 'real');
const realFiles = existsSync(REAL_DIR)
  ? readdirSync(REAL_DIR).filter(f => /\.(sav|dsv|srm)$/i.test(f))
  : [];

describe('Real save fixtures round-trip (TODO 5.4)', () => {
  if (realFiles.length === 0) {
    it('no real fixtures provided — drop privacy-safe dumps in tests/fixtures/real/ to enable', () => {
      expect(realFiles.length).toBe(0); // documents the optional path; not a failure
    });
    return;
  }

  for (const file of realFiles) {
    it(`${file}: detect → parse → write → re-parse preserves trainer id, party & boxes`, () => {
      const buf = new Uint8Array(readFileSync(join(REAL_DIR, file)));
      const parsed = registry.detectAndParse(buf, file);
      expect(parsed.success, parsed.error).toBe(true);
      const a = registry.getAdapter(parsed.generation!)!;
      const written = a.writeSave(parsed.data!);
      const re = a.parseSave(written, file);
      expect(re.trainer.id).toBe(parsed.data!.trainer.id);
      expect(re.partyCount).toBe(parsed.data!.partyCount);
      expect(re.pcBoxes.length).toBe(parsed.data!.pcBoxes.length);
    });
  }
});
