/**
 * Legality display helpers (TODO §4 — wire analyzeStructure into the UI).
 *
 * Pure mapping from a {@link LegalityAnalysis} to the bits the UI needs: a tone
 * (for colour), a short headline, and the list of issues worth showing. Keeping
 * this logic out of the component makes the "what does the badge say?" decision
 * unit-testable and consistent wherever legality is surfaced.
 */
import { LegalityAnalysis, CheckResult, LegalitySeverity } from './types';

/** UI tone buckets — map to colours in the component, not here. */
export type LegalityTone = 'valid' | 'warn' | 'error' | 'unknown';

/** Worst severity present drives the overall tone. */
export function analysisTone(analysis: LegalityAnalysis | null): LegalityTone {
  if (!analysis || !analysis.analyzed) return 'unknown';
  if (analysis.results.some((r) => r.severity === LegalitySeverity.Invalid)) return 'error';
  if (analysis.results.some((r) => r.severity === LegalitySeverity.Fishy)) return 'warn';
  return 'valid';
}

/** Short pill label, e.g. "Looks legal", "1 warning", "2 issues". */
export function analysisHeadline(analysis: LegalityAnalysis | null): string {
  if (!analysis || !analysis.analyzed) return 'Not analyzed';

  const issues = analysis.results.filter((r) => r.severity === LegalitySeverity.Invalid).length;
  const warnings = analysis.results.filter((r) => r.severity === LegalitySeverity.Fishy).length;

  if (issues > 0) return `${issues} ${issues === 1 ? 'issue' : 'issues'}`;
  if (warnings > 0) return `${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`;
  return 'Looks legal';
}

/** The results worth listing in a popover (everything that isn't a plain Valid). */
export function notableResults(analysis: LegalityAnalysis | null): CheckResult[] {
  if (!analysis) return [];
  return analysis.results.filter((r) => r.severity !== LegalitySeverity.Valid);
}
