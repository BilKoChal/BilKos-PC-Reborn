/**
 * Save-level legality helpers (TODO §4).
 *
 * Bridges the per-entity / bulk analyzers to the whole-save shape the app holds
 * (`party` + `pcBoxes`). `analyzeSaveClones` flattens every stored Pokémon, runs
 * the {@link analyzeBulk} clone detector, and maps each duplicate group back to
 * concrete slot locations so the UI can point at the offending Pokémon.
 */
import { CanonicalSave, CanonicalPokemon } from '../canonicalModel';
import { analyzeBulk } from './bulk';
import { CheckResult } from './types';

/** A concrete location within a save. */
export interface SlotRef {
  location: 'party' | 'box';
  index: number;
  /** Present when `location === 'box'`. */
  boxIndex?: number;
}

/** A set of slots whose Pokémon share one identity (likely clones). */
export interface CloneGroup {
  reason: string;
  slots: SlotRef[];
}

export interface SaveCloneReport {
  results: CheckResult[];
  groups: CloneGroup[];
}

/** Flatten party then each box into a single ordered list with slot refs. */
function flattenSave(save: Pick<CanonicalSave, 'party' | 'pcBoxes'>): { entity: CanonicalPokemon; ref: SlotRef }[] {
  const flat: { entity: CanonicalPokemon; ref: SlotRef }[] = [];
  save.party.forEach((entity, index) => {
    flat.push({ entity, ref: { location: 'party', index } });
  });
  save.pcBoxes.forEach((box, boxIndex) => {
    box.forEach((entity, index) => {
      flat.push({ entity, ref: { location: 'box', index, boxIndex } });
    });
  });
  return flat;
}

/**
 * Scan an entire save for duplicate identities across party and all boxes.
 * Returns the bulk `CheckResult`s plus the slot locations of each clone group.
 */
export function analyzeSaveClones(save: Pick<CanonicalSave, 'party' | 'pcBoxes'>): SaveCloneReport {
  const flat = flattenSave(save);
  const bulk = analyzeBulk(flat.map((f) => f.entity));

  const groups: CloneGroup[] = bulk.duplicateGroups.map((group) => ({
    reason: group.reason,
    slots: group.indices.map((i) => flat[i]!.ref),
  }));

  return { results: bulk.results, groups };
}
