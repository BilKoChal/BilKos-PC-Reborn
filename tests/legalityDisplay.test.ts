/**
 * Legality UI-wiring tests (TODO §4).
 *
 * Covers the pure pieces that back the editor's legality badge — the display
 * mappers (tone/headline/notable results) — and the save-level clone scan that
 * maps bulk results back to party/box slot locations.
 */
import { describe, it, expect } from 'vitest';
import {
  analysisTone,
  analysisHeadline,
  notableResults,
  analyzeStructure,
  analyzeSaveClones,
  LegalitySeverity,
  type LegalityAnalysis,
  type StructuralLimits,
} from '../lib/legality';
import { createEmptyCanonicalPokemon } from '../lib/canonicalModel';

const GEN12: StructuralLimits = {
  ivMax: 15, evMax: 65535, evTotalCap: undefined, nationalDexMax: 251, maxLevel: 100, statTermLabel: 'DV',
};

function pikachu(overrides: Parameters<typeof createEmptyCanonicalPokemon>[0] = {}) {
  return createEmptyCanonicalPokemon({
    speciesId: 25, dexId: 25, speciesName: 'Pikachu', nickname: 'PIKA', level: 50,
    moveIds: [84, 85, 0, 0],
    iv: { hp: 15, attack: 15, defense: 15, speed: 15, special: 15, spAtk: 15, spDef: 15 },
    ...overrides,
  });
}

const analysisWith = (...severities: LegalitySeverity[]): LegalityAnalysis => ({
  analyzed: true,
  valid: !severities.includes(LegalitySeverity.Invalid),
  summary: '',
  results: severities.map((severity) => ({ severity, category: 'General', comment: 'x' })),
});

describe('legality display helpers', () => {
  it('tone reflects the worst severity', () => {
    expect(analysisTone(analysisWith(LegalitySeverity.Valid))).toBe('valid');
    expect(analysisTone(analysisWith(LegalitySeverity.Valid, LegalitySeverity.Fishy))).toBe('warn');
    expect(analysisTone(analysisWith(LegalitySeverity.Fishy, LegalitySeverity.Invalid))).toBe('error');
  });

  it('tone is unknown for null or unanalyzed input', () => {
    expect(analysisTone(null)).toBe('unknown');
    expect(analysisTone({ analyzed: false, valid: true, results: [], summary: '' })).toBe('unknown');
  });

  it('headline pluralises issues and warnings, else "Looks legal"', () => {
    expect(analysisHeadline(analysisWith(LegalitySeverity.Valid))).toBe('Looks legal');
    expect(analysisHeadline(analysisWith(LegalitySeverity.Fishy))).toBe('1 warning');
    expect(analysisHeadline(analysisWith(LegalitySeverity.Fishy, LegalitySeverity.Fishy))).toBe('2 warnings');
    expect(analysisHeadline(analysisWith(LegalitySeverity.Invalid))).toBe('1 issue');
    expect(analysisHeadline(analysisWith(LegalitySeverity.Invalid, LegalitySeverity.Invalid))).toBe('2 issues');
    expect(analysisHeadline(null)).toBe('Not analyzed');
  });

  it('notableResults drops plain Valid entries', () => {
    const a = analysisWith(LegalitySeverity.Valid, LegalitySeverity.Fishy, LegalitySeverity.Invalid);
    const notable = notableResults(a);
    expect(notable).toHaveLength(2);
    expect(notable.every((r) => r.severity !== LegalitySeverity.Valid)).toBe(true);
  });

  it('integrates with a real analysis from analyzeStructure', () => {
    const clean = analyzeStructure(pikachu(), GEN12);
    expect(analysisTone(clean)).toBe('valid');
    expect(analysisHeadline(clean)).toBe('Looks legal');

    const bad = analyzeStructure(pikachu({ level: 255 }), GEN12);
    expect(analysisTone(bad)).toBe('error');
    expect(analysisHeadline(bad)).toBe('1 issue');
  });
});

describe('analyzeSaveClones', () => {
  function saveWith(party: ReturnType<typeof pikachu>[], boxes: ReturnType<typeof pikachu>[][]) {
    return { party, pcBoxes: boxes };
  }

  it('returns nothing for a save of distinct Pokémon', () => {
    const save = saveWith(
      [pikachu({ nickname: 'A', originalTrainerId: 1 })],
      [[pikachu({ dexId: 6, speciesId: 6, nickname: 'B', originalTrainerId: 2 })]],
    );
    const report = analyzeSaveClones(save);
    expect(report.groups).toEqual([]);
    expect(report.results).toEqual([]);
  });

  it('maps a cross-location clone group back to party + box slots', () => {
    // Same identity in party slot 0 and box 1 slot 2.
    const clone = () => pikachu({ nickname: 'PIKA', originalTrainerId: 7 });
    const box0 = [pikachu({ dexId: 1, speciesId: 1, nickname: 'BULBA', originalTrainerId: 9 })];
    const box1 = [
      pikachu({ dexId: 4, speciesId: 4, nickname: 'CHAR', originalTrainerId: 3 }),
      pikachu({ dexId: 7, speciesId: 7, nickname: 'SQUIRT', originalTrainerId: 4 }),
      clone(),
    ];
    const save = saveWith([clone()], [box0, box1]);

    const report = analyzeSaveClones(save);
    expect(report.groups).toHaveLength(1);
    const slots = report.groups[0]!.slots;
    expect(slots).toContainEqual({ location: 'party', index: 0 });
    expect(slots).toContainEqual({ location: 'box', index: 2, boxIndex: 1 });
    expect(report.results[0]!.severity).toBe(LegalitySeverity.Fishy);
  });
});
