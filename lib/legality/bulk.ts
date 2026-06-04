/**
 * Bulk analysis (TODO §4 — legality README backlog).
 *
 * The third validation layer named in `./README.md`: cross-entity anomaly
 * detection. Where `analyzeStructure` validates one Pokémon in isolation, this
 * scans a collection (a box, or all boxes) for *duplicate identities* — the
 * signature of clones produced by cheating tools.
 *
 * Identity is generation-agnostic:
 *   - Encrypted generations (Gen 3+) carry a 32-bit PID; a repeated non-zero PID
 *     is the canonical clone signal, so we group by PID.
 *   - Gen 1/2 have no PID (pid === 0), so we fall back to a composite identity
 *     (species + every DV + OT ID + nickname) that two independently-caught
 *     Pokémon would essentially never share.
 *
 * Duplicates are reported as `Fishy`, not `Invalid`: a clone is suspicious but
 * each copy is, byte-for-byte, a legitimate-looking entity.
 */
import { CanonicalPokemon } from '../canonicalModel';
import { PokemonIVs } from '../parser/types';
import { CheckResult, LegalitySeverity } from './types';
import { isEmptySlot } from './verifiers';

/** A set of entities (by input index) that share one identity. */
export interface DuplicateGroup {
  /** Indices into the analyzed array that share this identity. */
  indices: number[];
  /** Human-readable description of the shared identity. */
  reason: string;
}

export interface BulkAnalysis {
  /** One `Fishy` result per duplicate group (empty when nothing is suspicious). */
  results: CheckResult[];
  /** The raw groups, for callers that want to highlight the offending slots. */
  duplicateGroups: DuplicateGroup[];
}

const IV_KEYS: ReadonlyArray<keyof PokemonIVs> = ['hp', 'attack', 'defense', 'speed', 'special', 'spAtk', 'spDef'];

/** Stable identity key for one entity (PID when present, else Gen1/2 composite). */
function identityKey(entity: CanonicalPokemon): string {
  if (entity.pid !== 0) {
    return `pid:${entity.pid}`;
  }
  const dv = IV_KEYS.map((k) => entity.iv[k]).join(',');
  return `g12:${entity.dexId}|${dv}|${entity.originalTrainerId}|${entity.nickname}`;
}

/**
 * Scan a collection of entities for duplicate identities (likely clones).
 * Empty slots are ignored. Returns one `Fishy` CheckResult per duplicate group.
 */
export function analyzeBulk(entities: ReadonlyArray<CanonicalPokemon>): BulkAnalysis {
  const buckets = new Map<string, number[]>();

  entities.forEach((entity, index) => {
    if (isEmptySlot(entity)) return;
    const key = identityKey(entity);
    const existing = buckets.get(key);
    if (existing) existing.push(index);
    else buckets.set(key, [index]);
  });

  const duplicateGroups: DuplicateGroup[] = [];
  for (const indices of buckets.values()) {
    if (indices.length < 2) continue;
    const first = entities[indices[0]!]!;
    const label = first.nickname && first.nickname !== '???' ? first.nickname : first.speciesName;
    duplicateGroups.push({
      indices: [...indices],
      reason: `${indices.length}× "${label}" share an identical identity (possible clones).`,
    });
  }

  const results: CheckResult[] = duplicateGroups.map((group) => ({
    severity: LegalitySeverity.Fishy,
    category: 'General',
    comment: group.reason,
  }));

  return { results, duplicateGroups };
}
