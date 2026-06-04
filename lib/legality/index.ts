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
