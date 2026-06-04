/**
 * Legality analysis boundary (TODO 8.5.4).
 *
 * ⚠️ PLACEHOLDER — there is no legality engine yet, and none is planned for the
 * Gen 1/2 scope. `analyzeLegality` exists so that (a) the module boundary is real
 * and callable, and (b) future per-generation verifiers have a single, typed home
 * (see `./README.md` for the intended design). Today it returns an `analyzed:false`
 * result that is treated as "Valid (not checked)" — it must NOT be presented to
 * users as a legality guarantee.
 */
import { CanonicalPokemon } from '../canonicalModel';
import { LegalityAnalysis, LegalitySeverity } from './types';
import { StructuralLimits, structuralVerifiers, isEmptySlot } from './verifiers';

/**
 * Analyze a single entity's legality.
 *
 * Placeholder: returns an unanalyzed result. A real implementation would, per the
 * "find a consistent encounter" thesis, locate candidate encounters for the entity
 * and run a set of per-generation `Verifier`s (moves, IVs, EVs, gender/PID, …),
 * accumulating `CheckResult`s.
 */
export function analyzeLegality(_entity: CanonicalPokemon): LegalityAnalysis {
  return {
    valid: true,
    analyzed: false,
    results: [
      {
        severity: LegalitySeverity.Valid,
        category: 'General',
        comment: 'Legality checking is not implemented for this generation yet.',
      },
    ],
    summary: 'Not analyzed (no legality engine for this scope).',
  };
}

export * from './types';

/**
 * Run the structural (non-encounter) legality checks against an entity.
 *
 * Unlike {@link analyzeLegality}, this performs a *real* analysis (`analyzed:true`)
 * of the dimensions it covers — stat ranges, EV totals, level, species range, move
 * sanity — using limits sourced from the adapter (see {@link StructuralLimits}). The
 * summary always makes the partial scope explicit, so the UI can show concrete
 * findings without implying a full legality guarantee.
 */
export function analyzeStructure(entity: CanonicalPokemon, limits: StructuralLimits): LegalityAnalysis {
  if (isEmptySlot(entity)) {
    return {
      valid: true,
      analyzed: true,
      results: [{ severity: LegalitySeverity.Valid, category: 'General', comment: 'Empty slot — nothing to analyze.' }],
      summary: 'Empty slot.',
    };
  }

  const results = structuralVerifiers(entity, limits);
  const invalidCount = results.filter((r) => r.severity === LegalitySeverity.Invalid).length;
  const fishyCount = results.filter((r) => r.severity === LegalitySeverity.Fishy).length;

  if (results.length === 0) {
    results.push({
      severity: LegalitySeverity.Valid,
      category: 'General',
      comment: 'All structural checks passed.',
    });
  }

  let summary: string;
  if (invalidCount > 0) {
    summary = `${invalidCount} structural problem(s) found (no encounter analysis).`;
  } else if (fishyCount > 0) {
    summary = 'Structural checks passed with warnings (no encounter analysis).';
  } else {
    summary = 'Structural checks passed (no encounter analysis).';
  }

  return { valid: invalidCount === 0, analyzed: true, results, summary };
}

export * from './verifiers';
export * from './bulk';
export * from './display';
export * from './save';
