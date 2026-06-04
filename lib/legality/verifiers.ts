/**
 * Structural legality verifiers (TODO §4).
 *
 * The first real, if partial, step of the legality engine sketched in `./README.md`.
 * These check the cheap, generation-agnostic *structural* facts (stat ranges, EV
 * totals, level bounds, species range, move sanity) — NOT encounter consistency.
 * They are deliberately limited so the UI can surface real findings without the
 * boundary ever claiming a full legality guarantee (the summary always says so).
 *
 * Crucially, every limit comes from the adapter's capability metadata via
 * `StructuralLimits`, so there is no `generation === N` branching here — Gen 1/2
 * (DVs 0–15, no EV total cap) and Gen 3+ (IVs 0–31, 510 EV total cap) flow through
 * the exact same code. Adding a generation = passing different limits.
 */
import { CanonicalPokemon } from '../canonicalModel';
import { PokemonIVs, PokemonEVs } from '../parser/types';
import { CheckResult, LegalitySeverity } from './types';

/** The generation facts the structural verifiers need, sourced from the adapter. */
export interface StructuralLimits {
  /** Max value for any single IV/DV (Gen1/2: 15, Gen3+: 31). */
  ivMax: number;
  /** Max value for any single EV (Gen1/2: 65535, Gen3-5: 255, Gen6+: 252). */
  evMax: number;
  /** Max total EVs across stats, or undefined when the generation has no cap. */
  evTotalCap: number | undefined;
  /** Highest valid National Dex ID for the generation. */
  nationalDexMax: number;
  /** Hard level cap — 100 in every mainline generation. */
  maxLevel: number;
  /** 'DV' (Gen1/2) or 'IV' (Gen3+) — used only for human-readable comments. */
  statTermLabel: 'DV' | 'IV';
}

/** The subset of adapter metadata the limits are built from. */
type LimitSource = {
  ivMax: number;
  evMax: number;
  evTotalCap: number | undefined;
  nationalDexMax: number;
  statTermLabel: 'DV' | 'IV';
};

/** Build {@link StructuralLimits} from an adapter's capability fields. */
export function limitsFromAdapter(adapter: LimitSource): StructuralLimits {
  return {
    ivMax: adapter.ivMax,
    evMax: adapter.evMax,
    evTotalCap: adapter.evTotalCap,
    nationalDexMax: adapter.nationalDexMax,
    maxLevel: 100, // universal mainline constant, not a per-generation fact
    statTermLabel: adapter.statTermLabel,
  };
}

// Stat keys that exist on every generation's IV/EV structs.
const IV_KEYS: ReadonlyArray<keyof PokemonIVs> = ['hp', 'attack', 'defense', 'speed', 'special', 'spAtk', 'spDef'];
const EV_KEYS: ReadonlyArray<keyof PokemonEVs> = ['hp', 'attack', 'defense', 'speed', 'special', 'spAtk', 'spDef'];
// Stats summed for the EV-total cap. Excludes the unified `special` mirror to avoid
// double-counting against the split spAtk/spDef the total cap applies to (Gen3+).
const EV_TOTAL_KEYS: ReadonlyArray<keyof PokemonEVs> = ['hp', 'attack', 'defense', 'speed', 'spAtk', 'spDef'];

/** A slot that holds no Pokémon (all-zero identity) — nothing to verify. */
export function isEmptySlot(entity: CanonicalPokemon): boolean {
  return entity.speciesId === 0 && entity.dexId === 0 && entity.level === 0;
}

function invalid(category: CheckResult['category'], comment: string): CheckResult {
  return { severity: LegalitySeverity.Invalid, category, comment };
}
function fishy(category: CheckResult['category'], comment: string): CheckResult {
  return { severity: LegalitySeverity.Fishy, category, comment };
}

/** Level must sit within [1, maxLevel]. */
export function verifyLevel(entity: CanonicalPokemon, limits: StructuralLimits): CheckResult[] {
  if (entity.level < 1 || entity.level > limits.maxLevel) {
    return [invalid('Level', `Level ${entity.level} is outside the valid range 1–${limits.maxLevel}.`)];
  }
  return [];
}

/** Every IV/DV must sit within [0, ivMax]. */
export function verifyIVs(entity: CanonicalPokemon, limits: StructuralLimits): CheckResult[] {
  const out: CheckResult[] = [];
  for (const key of IV_KEYS) {
    const value = entity.iv[key];
    if (value < 0 || value > limits.ivMax) {
      out.push(invalid('IVs', `${limits.statTermLabel} ${key} is ${value}, outside 0–${limits.ivMax}.`));
    }
  }
  return out;
}

/** Every EV within [0, evMax]; and, where the generation caps it, the total ≤ cap. */
export function verifyEVs(entity: CanonicalPokemon, limits: StructuralLimits): CheckResult[] {
  const out: CheckResult[] = [];
  for (const key of EV_KEYS) {
    const value = entity.ev[key];
    if (value < 0 || value > limits.evMax) {
      out.push(invalid('EVs', `EV ${key} is ${value}, outside 0–${limits.evMax}.`));
    }
  }
  if (limits.evTotalCap !== undefined) {
    const total = EV_TOTAL_KEYS.reduce((sum, key) => sum + entity.ev[key], 0);
    if (total > limits.evTotalCap) {
      out.push(invalid('EVs', `EV total is ${total}, exceeding the ${limits.evTotalCap} cap.`));
    }
  }
  return out;
}

/** A present, non-egg Pokémon must have a Dex ID within [1, nationalDexMax]. */
export function verifySpecies(entity: CanonicalPokemon, limits: StructuralLimits): CheckResult[] {
  if (entity.dexId > limits.nationalDexMax) {
    return [invalid('Encounter', `Dex #${entity.dexId} does not exist in this generation (max ${limits.nationalDexMax}).`)];
  }
  if (entity.dexId < 1 && !entity.isEgg) {
    return [invalid('Encounter', `Dex #${entity.dexId} is not a valid species.`)];
  }
  return [];
}

/** Duplicate non-empty move slots are impossible in legitimate play. */
export function verifyMoves(entity: CanonicalPokemon): CheckResult[] {
  const seen = new Set<number>();
  for (const id of entity.moveIds) {
    if (id === 0) continue;
    if (seen.has(id)) {
      return [invalid('Moves', `Move slot ${id} is duplicated.`)];
    }
    seen.add(id);
  }
  if (!entity.isEgg && seen.size === 0) {
    return [fishy('Moves', 'Pokémon knows no moves.')];
  }
  return [];
}

/** Run every structural verifier and collect their results. */
export function structuralVerifiers(entity: CanonicalPokemon, limits: StructuralLimits): CheckResult[] {
  return [
    ...verifyLevel(entity, limits),
    ...verifyIVs(entity, limits),
    ...verifyEVs(entity, limits),
    ...verifySpecies(entity, limits),
    ...verifyMoves(entity),
  ];
}
