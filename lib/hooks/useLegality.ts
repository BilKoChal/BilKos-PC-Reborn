import { useMemo } from 'react';
import { CanonicalPokemon } from '../canonicalModel';
import { analyzeStructure, limitsFromAdapter, LegalityAnalysis } from '../legality';

/** Just the adapter fields the legality limits need. */
type LegalityAdapter = {
  ivMax: number;
  evMax: number;
  evTotalCap: number | undefined;
  nationalDexMax: number;
  statTermLabel: 'DV' | 'IV';
};

/**
 * Run the structural legality analysis for one Pokémon, recomputed whenever the
 * entity or adapter changes. Returns `null` until an adapter is available (so the
 * caller can render a neutral "not analyzed" state). This is the structural pass
 * only — the analysis summary makes that explicit, so the UI must not present it
 * as a full legality guarantee.
 */
export function useLegality(
  mon: CanonicalPokemon,
  adapter: LegalityAdapter | undefined,
): LegalityAnalysis | null {
  return useMemo(() => {
    if (!adapter) return null;
    return analyzeStructure(mon, limitsFromAdapter(adapter));
  }, [mon, adapter]);
}
