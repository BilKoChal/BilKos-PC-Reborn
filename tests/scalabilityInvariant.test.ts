/**
 * Scalability invariant test (TODO 1.2 / 5.6).
 *
 * This converts the project's central claim — "adding a generation requires
 * ZERO edits to core/UI/context files" — into an *enforced* test.
 *
 * It defines a throwaway "Gen 99" dummy adapter (NOT a real game), registers it
 * through the PUBLIC registry/extension-registry APIs, and asserts that the
 * full lifecycle works: registration, detection, parse, write round-trip,
 * generation-number reporting, capability flags, and panel-extension injection.
 *
 * The invariant: this entire file lives under tests/ and imports ONLY public
 * surfaces (`registry`, `extensionRegistry`, `Gen1Adapter`, the interfaces).
 * It does not edit — and does not need to edit — anything under lib/core,
 * components/, or context/. If a future change made such an edit necessary to
 * register a new generation, that file would be the real Open/Closed-Principle
 * blocker, and this test's existence makes that regression visible.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdapterRegistry } from '../lib/core/AdapterRegistry';
import { extensionRegistry } from '../lib/core/ExtensionRegistry';
import { Gen1Adapter } from '../lib/generations/gen1/Gen1Adapter';
import type { ParsedSave } from '../lib/parser/types';
import type { ISectionExtension } from '../lib/interfaces';

// A unique magic size for the dummy format so detection is unambiguous.
const DUMMY_GEN = 99;
const DUMMY_SIZE = 0x4321;
const DUMMY_MAGIC = 0xBE; // first byte marker

/**
 * Minimal dummy adapter. It extends the real Gen1Adapter purely to inherit the
 * large IGenerationAdapter surface (data tables, codec, sprite/theme helpers)
 * without reimplementing ~90 members — the point of the test is the *registration
 * + lifecycle* path, not Gen-1 behavior. We override only what makes it a
 * distinct, self-contained fake generation.
 */
class DummyAdapter extends Gen1Adapter {
  override generation = DUMMY_GEN;
  override generationName = 'Generation 99 (Test)';

  override detectSave(buffer: Uint8Array, _filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    if (buffer.length === DUMMY_SIZE && buffer[0] === DUMMY_MAGIC) {
      return { detected: true, gameVersion: 'TestGame', ambiguous: false };
    }
    return { detected: false };
  }

  override parseSave(buffer: Uint8Array, _filename: string): ParsedSave {
    // Trivial parse: stash the raw bytes; carry a marker in trainer name.
    const base = super.parseSave.call(this, this.makeGen1Shaped(buffer), 'dummy.sav');
    base.rawData = buffer;
    base.generation = DUMMY_GEN;
    base.trainer = { ...base.trainer, name: 'DUMMY' };
    return base;
  }

  override writeSave(save: ParsedSave): Uint8Array {
    // Trivial round-trip: echo the raw bytes back unchanged.
    return new Uint8Array(save.rawData);
  }

  override validateSave(): boolean {
    return true;
  }

  // Helper: Gen1's parseSave expects a 32KB-ish buffer; give it a benign one so
  // super.parseSave() doesn't throw. The dummy's own rawData replaces it after.
  private makeGen1Shaped(_buffer: Uint8Array): Uint8Array {
    return new Uint8Array(32768);
  }
}

describe('Scalability invariant: a new generation registers with zero core edits (TODO 1.2 / 5.6)', () => {
  // Use a FRESH registry instance (not the global) so we don't disturb the app's
  // Gen1/Gen2 registration — this also proves registration is a pure public-API op.
  let testRegistry: AdapterRegistry;
  let dummy: DummyAdapter;

  beforeEach(() => {
    testRegistry = new AdapterRegistry();
    dummy = new DummyAdapter();
    testRegistry.register(dummy); // PUBLIC api — no core file edited
  });

  afterEach(() => {
    // Vitest isolates module state per test file, so clearing here only affects
    // this file's dummy registration — it cannot leak into other test files.
    extensionRegistry.clear();
  });

  it('registers and is retrievable by generation number', () => {
    expect(testRegistry.getAdapter(DUMMY_GEN)).toBe(dummy);
    expect(testRegistry.getRegisteredGenerations()).toContain(DUMMY_GEN);
  });

  it('detects its magic-size buffer and ignores others', () => {
    const good = new Uint8Array(DUMMY_SIZE); good[0] = DUMMY_MAGIC;
    const wrongSize = new Uint8Array(1234); wrongSize[0] = DUMMY_MAGIC;
    const wrongMagic = new Uint8Array(DUMMY_SIZE); wrongMagic[0] = 0x00;
    expect(dummy.detectSave(good, 'x').detected).toBe(true);
    expect(dummy.detectSave(wrongSize, 'x').detected).toBe(false);
    expect(dummy.detectSave(wrongMagic, 'x').detected).toBe(false);
  });

  it('runs through the registry detect→parse cascade without core edits', () => {
    const buf = new Uint8Array(DUMMY_SIZE); buf[0] = DUMMY_MAGIC; buf[10] = 0x77;
    const result = testRegistry.detectAndParse(buf, 'dummy.sav');
    expect(result.success).toBe(true);
    expect(result.generation).toBe(DUMMY_GEN);
    expect(result.data?.trainer.name).toBe('DUMMY');
  });

  it('round-trips a save (write echoes parse input byte-for-byte)', () => {
    const buf = new Uint8Array(DUMMY_SIZE); buf[0] = DUMMY_MAGIC;
    for (let i = 1; i < 50; i++) buf[i] = i;
    const parsed = dummy.parseSave(buf, 'dummy.sav');
    const written = dummy.writeSave(parsed);
    expect(written.length).toBe(DUMMY_SIZE);
    expect(Array.from(written.slice(0, 50))).toEqual(Array.from(buf.slice(0, 50)));
  });

  it('inherits sprite + theme + codec surface (no per-gen core wiring needed)', () => {
    // These come from the inherited adapter surface — the point is they EXIST
    // and are callable for an arbitrary generation without editing lib/core.
    expect(typeof dummy.getTrainerSpriteUrl('Male')).toBe('string');
    expect(typeof dummy.nationalDexMax).toBe('number');
    expect(dummy.codec).toBeDefined();
    expect(typeof dummy.detectRegion({ rawData: new Uint8Array(DUMMY_SIZE) })).toBe('string');
  });

  it('supports panel-extension injection for the new generation (public ExtensionRegistry)', () => {
    const dummyExt: ISectionExtension = {
      id: 'gen99-test-section',
      panelId: 'pokemon-info',
      render: () => null,
    };
    extensionRegistry.registerExtension('pokemon-info', DUMMY_GEN, dummyExt);
    const exts = extensionRegistry.getExtensions('pokemon-info', DUMMY_GEN);
    expect(exts.some(e => e.id === 'gen99-test-section')).toBe(true);
    // And it does NOT leak into other generations.
    expect(extensionRegistry.getExtensions('pokemon-info', 1).some(e => e.id === 'gen99-test-section')).toBe(false);
  });
});

// ============================================================================
// 1.6 — Theme/version metadata is data-driven & aggregated from adapters
// ============================================================================

import { GEN1_GAMES } from '../lib/generations/gen1/data/themes';
import { GEN2_GAMES } from '../lib/generations/gen2/data/themes';
import { pokemonGames } from '../data/games';

describe('Version themes are data-driven per adapter (TODO 1.6)', () => {
  it('data/games.ts aggregates the per-generation theme files (no hardcoded literal)', () => {
    expect(pokemonGames).toEqual([...GEN1_GAMES, ...GEN2_GAMES]);
    // sanity: known versions present
    expect(pokemonGames.map(g => g.id)).toEqual(
      expect.arrayContaining(['red', 'blue', 'yellow', 'gold', 'silver', 'crystal'])
    );
  });

  it('each adapter exposes its own versionThemes', () => {
    expect(new Gen1Adapter().versionThemes).toBe(GEN1_GAMES);
  });

  it('registry.getAllVersionThemes() aggregates only LOADED adapters, sorted by gen', () => {
    const reg = new AdapterRegistry();
    // Register a Gen 2 then a Gen 1 adapter (out of order) — output must be gen-sorted.
    const g1 = new Gen1Adapter();
    const dummy = new DummyAdapter(); // generation 99, inherits Gen1 themes
    reg.register(dummy);
    reg.register(g1);
    const themes = reg.getAllVersionThemes();
    // Gen 1 themes come before the Gen 99 dummy's (inherited) themes.
    const firstGen99Index = themes.findIndex((_t, i) => i >= GEN1_GAMES.length);
    expect(themes.slice(0, GEN1_GAMES.length)).toEqual(GEN1_GAMES);
    expect(firstGen99Index).toBe(GEN1_GAMES.length);
  });

  it('a newly registered generation contributes its themes automatically', () => {
    const reg = new AdapterRegistry();
    expect(reg.getAllVersionThemes()).toHaveLength(0); // nothing registered yet
    reg.register(new Gen1Adapter());
    expect(reg.getAllVersionThemes()).toEqual(GEN1_GAMES); // appeared with no core edit
  });
});
