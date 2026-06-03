/**
 * Pokédex flavor-text & location completeness tests (TODO 6.4).
 *
 * The Gen 2 Pokédex flavor-text (`pokedexEntries.ts`) and encounter-location
 * (`pokemonLocations.ts`) tables are large hand-maintained data files, one entry
 * per species with separate Gold / Silver / Crystal strings. It is easy for a
 * future edit (or a new species row) to leave a gap or a placeholder behind.
 *
 * These tests assert, *through the adapter's public accessors* rather than the
 * raw tables, that every species 1..nationalDexMax resolves to a non-empty,
 * non-placeholder string for all three versions. They turn "we filled the gaps"
 * into an enforced invariant — and will fail loudly if a Gen 2 species row is
 * dropped or stubbed.
 */
import { describe, it, expect } from 'vitest';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';

const adapter = new Gen2Adapter();
const VERSIONS = ['Gold', 'Silver', 'Crystal'];

/** Strings that signal an unfinished / stubbed entry rather than real data. */
const PLACEHOLDER = /^(todo|tbd|placeholder|unknown|n\/?a|\?\?\?|-+)$/i;

function isMeaningful(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0 && !PLACEHOLDER.test(value.trim());
}

describe('Gen 2 Pokédex flavor text completeness', () => {
  it('has a meaningful entry for every species 1..nationalDexMax in all versions', () => {
    const gaps: string[] = [];
    for (let dex = 1; dex <= adapter.nationalDexMax; dex++) {
      for (const version of VERSIONS) {
        const text = adapter.getPokedexEntry(dex, version);
        if (!isMeaningful(text)) gaps.push(`#${dex} (${version})`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('returns a Gold-version fallback for an unrecognized version string', () => {
    const gold = adapter.getPokedexEntry(1, 'Gold');
    expect(adapter.getPokedexEntry(1, 'NotAVersion')).toBe(gold);
  });

  it('returns undefined for an out-of-range species', () => {
    expect(adapter.getPokedexEntry(adapter.nationalDexMax + 1, 'Gold')).toBeUndefined();
    expect(adapter.getPokedexEntry(0, 'Gold')).toBeUndefined();
  });
});

describe('Gen 2 encounter-location completeness', () => {
  it('has a meaningful location for every species 1..nationalDexMax in all versions', () => {
    const gaps: string[] = [];
    for (let dex = 1; dex <= adapter.nationalDexMax; dex++) {
      for (const version of VERSIONS) {
        const loc = adapter.getEncounterLocations(dex, version);
        if (!isMeaningful(loc)) gaps.push(`#${dex} (${version})`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('returns undefined for an out-of-range species', () => {
    expect(adapter.getEncounterLocations(adapter.nationalDexMax + 1, 'Gold')).toBeUndefined();
    expect(adapter.getEncounterLocations(0, 'Gold')).toBeUndefined();
  });
});
