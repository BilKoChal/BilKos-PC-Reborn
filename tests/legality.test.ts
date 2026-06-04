/**
 * Legality boundary tests (TODO 8.5.4 / 8.5.6).
 *
 * These lock the *contract* of the legality boundary — they do NOT assert any real
 * legality logic (there is no engine yet). They guard the result shape, the
 * Valid/Fishy/Invalid semantics, and the explicit "not analyzed" placeholder so a
 * future engine can be dropped in behind a stable API.
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeLegality,
  isLegal,
  LegalitySeverity,
  type LegalityAnalysis,
  type CheckResult,
} from '../lib/legality';
import { createEmptyCanonicalPokemon } from '../lib/canonicalModel';

describe('Legality boundary (TODO 8.5.4)', () => {
  it('exposes the three PKHeX-style severities', () => {
    expect(LegalitySeverity.Valid).toBe('Valid');
    expect(LegalitySeverity.Fishy).toBe('Fishy');
    expect(LegalitySeverity.Invalid).toBe('Invalid');
  });

  it('analyzeLegality is an explicit, non-failing placeholder (analyzed:false)', () => {
    const mon = createEmptyCanonicalPokemon({ speciesId: 25, speciesName: 'Pikachu' });
    const analysis = analyzeLegality(mon);
    expect(analysis.analyzed).toBe(false); // no engine yet — must not claim a guarantee
    expect(analysis.valid).toBe(true);     // unanalyzed is treated as not-invalid
    expect(analysis.results.length).toBeGreaterThan(0);
    expect(analysis.summary).toMatch(/not analyzed/i);
  });

  it('isLegal() is false iff any result is Invalid (Fishy is only a warning)', () => {
    const base: Omit<LegalityAnalysis, 'results' | 'valid'> = { analyzed: true, summary: '' };
    const mk = (severity: LegalitySeverity): CheckResult => ({ severity, category: 'General', comment: '' });

    expect(isLegal({ ...base, valid: true, results: [mk(LegalitySeverity.Valid)] })).toBe(true);
    expect(isLegal({ ...base, valid: true, results: [mk(LegalitySeverity.Fishy)] })).toBe(true);
    expect(isLegal({ ...base, valid: false, results: [mk(LegalitySeverity.Invalid)] })).toBe(false);
    expect(isLegal({ ...base, valid: false, results: [mk(LegalitySeverity.Valid), mk(LegalitySeverity.Invalid)] })).toBe(false);
  });
});
