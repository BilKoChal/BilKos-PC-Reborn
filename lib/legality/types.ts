/**
 * Legality analysis result types (TODO 8.5.4).
 *
 * This is the *boundary* for future entity legality checking — it mirrors PKHeX's
 * `LegalityAnalysis` / `CheckResult` / `Severity`. There is intentionally **no real
 * legality engine here yet** (see `analyzeLegality` in `./index.ts` and the design
 * note in `./README.md`). The point of defining the result shape now is so that
 * scattered entity validation (IV/EV ranges, move-learnability, gender/PID
 * consistency, …) has a single home to grow into instead of becoming ad-hoc checks
 * that later fight a real engine.
 *
 * This is *entity*-level validation. It is deliberately distinct from *save*-level
 * integrity (`SaveValidationResult` / `validateSaveDetailed`, which is about
 * checksums). See TODO 8.5.6 — keeping these two namings separate is intentional.
 */

/** Severity of a single legality check, mirroring PKHeX's `Severity`. */
export enum LegalitySeverity {
  /** The bytes are consistent with a legitimate origin. */
  Valid = 'Valid',
  /** Technically possible but suspicious — surfaced as a warning, not a failure. */
  Fishy = 'Fishy',
  /** No legitimate origin is consistent with these bytes. */
  Invalid = 'Invalid',
}

/** Broad category a check belongs to (kept small now; extend per generation). */
export type LegalityCategory =
  | 'Encounter'
  | 'Moves'
  | 'IVs'
  | 'EVs'
  | 'Gender'
  | 'Level'
  | 'Nickname'
  | 'Trainer'
  | 'General';

/** One verifier's verdict, mirroring PKHeX's `CheckResult`. */
export interface CheckResult {
  severity: LegalitySeverity;
  category: LegalityCategory;
  /** Human-readable explanation (e.g. "Move not learnable at this level"). */
  comment: string;
}

/**
 * The aggregate result for one entity, mirroring PKHeX's `LegalityAnalysis`.
 * `valid` is true iff no result is `Invalid` (Fishy results are warnings).
 */
export interface LegalityAnalysis {
  /** True iff there are no `Invalid` results. */
  valid: boolean;
  /** True once a real engine has run; false for the current placeholder. */
  analyzed: boolean;
  /** Individual check verdicts. */
  results: CheckResult[];
  /** One-line human summary. */
  summary: string;
}

/** True iff the analysis contains no `Invalid` results. */
export function isLegal(analysis: LegalityAnalysis): boolean {
  return !analysis.results.some(r => r.severity === LegalitySeverity.Invalid);
}
