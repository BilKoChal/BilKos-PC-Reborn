import { ParsedSave, PokemonStats } from '../parser/types';
import { registry } from '../core/AdapterRegistry';
import { convertPokemonForTransfer } from './crossGenConverter';

export type MoveLocation = 
  | { type: 'party'; index: number }
  | { type: 'box'; boxIndex: number; index: number };

// Helper to check equality of locations
export function isSameLocation(a: MoveLocation, b: MoveLocation): boolean {
  if (a.type === 'party' && b.type === 'party') {
    return a.index === b.index;
  }
  if (a.type === 'box' && b.type === 'box') {
    return a.boxIndex === b.boxIndex && a.index === b.index;
  }
  return false;
}

// Helper to prepare stats when moving to/from Party/Box
// Uses the Adapter Registry to correctly recalculate stats for any generation.
//
// Generation resolution order (PKHeX pattern — entity carries its own generation):
//   1. mon.genExtension?.generation — most reliable, set by parser at parse time
//   2. generation parameter — provided by the caller from ParsedSave.generation
//   3. No generation found → skip recalculation (no-op) rather than guessing wrong
//
// We intentionally NEVER default to Gen 1. PKHeX never silently defaults to a
// generation — it either uses the entity's own Context or skips recalculation.
// Silently defaulting to Gen 1 would produce wrong stats for Gen 2+ mons (wrong
// HP IV derivation, wrong Special vs SpAtk/SpDef, and completely wrong for Gen 3+).
const prepareForLocation = (mon: PokemonStats, isGoingToParty: boolean, generation?: number) => {
    const newMon = { ...mon, isParty: isGoingToParty };
    if (isGoingToParty) {
        // Prefer the Pokemon entity's own generation (from genExtension, set at parse time),
        // then fall back to the caller-provided generation hint.
        // Uses ?? (nullish coalescing) instead of || to correctly handle generation === 0.
        const gen = mon.genExtension?.generation ?? generation;

        if (!gen) {
            // Cannot determine generation — skip stat recalculation rather than guess wrong.
            // PKHeX returns Generation=0 for unknown entities and flags them (GenU).
            // We skip recalc entirely — stale stats are better than wrong stats.
            console.warn(
                `prepareForLocation: Cannot determine generation for Pokemon #${mon.dexId} (${mon.speciesName}). ` +
                `Skipping stat recalculation — party stats may be stale.`
            );
            return newMon;
        }

        const adapter = registry.getAdapter(gen);

        if (adapter) {
            // Use the adapter's getBaseStats and recalculateStats for generation-correct logic
            const baseStats = adapter.getBaseStats(mon.dexId);
            if (baseStats) {
                const updated = adapter.recalculateStats(newMon, baseStats);
                newMon.maxHp = updated.maxHp;
                newMon.attack = updated.attack;
                newMon.defense = updated.defense;
                newMon.speed = updated.speed;
                newMon.special = updated.special;
                newMon.spAtk = updated.spAtk;
                newMon.spDef = updated.spDef;
                newMon.hp = Math.min(newMon.hp, newMon.maxHp);
                // Also update IVs if the adapter derived them (e.g., Gen2 HP IV derivation)
                // Note: recalculateStats now deep-clones iv/ev internally (B6 fix),
                // so this spread is defensive but no longer strictly necessary.
                if (updated.iv) {
                    newMon.iv = { ...updated.iv };
                }
                // Update shiny status if recalculated
                if (updated.isShiny !== undefined) {
                    newMon.isShiny = updated.isShiny;
                }
            }
        } else {
            // No adapter registered for this generation — skip recalculation
            console.warn(
                `No adapter registered for generation ${gen}. ` +
                `Cannot recalculate stats for Pokemon #${mon.dexId} (${mon.speciesName}).`
            );
        }
    }
    return newMon;
};

/**
 * Same-Container Reordering (Shift/Insert Logic)
 * Used ONLY when Source Container == Target Container (e.g. Box 1 -> Box 1)
 */
export function movePokemonBatch(
  data: ParsedSave,
  sources: MoveLocation[],
  target: MoveLocation
): { success: boolean; newData?: ParsedSave; error?: string } {
    
    // Sort sources to ensure predictable order
    const sortedSources = [...sources].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'party' ? -1 : 1;
        if (a.type === 'box' && b.type === 'box') {
            if (a.boxIndex !== b.boxIndex) return a.boxIndex - b.boxIndex;
        }
        return a.index - b.index;
    });

    // Deep clone arrays
    const newParty = [...data.party];
    const newBoxes = data.pcBoxes.map(box => [...box]);

    const getList = (loc: MoveLocation) => loc.type === 'party' ? newParty : newBoxes[loc.boxIndex]!;
    const targetList = getList(target);

    // 1. Extract Moving Mons
    const movingMons = sortedSources.map(src => {
        const list = getList(src);
        return { ...list[src.index]! }; // Clone
    });

    // 2. Remove Sources (Descending order to preserve indices during removal)
    const reverseSources = [...sortedSources].sort((a, b) => b.index - a.index);
    reverseSources.forEach(src => {
        const list = getList(src);
        list.splice(src.index, 1);
    });

    // 3. Calculate Insertion Index
    // Adjust target index based on how many items *before* it were removed from the same container
    let insertIndex = target.index;
    const removedBeforeTarget = sources.filter(s => s.index < target.index).length;
    
    insertIndex -= removedBeforeTarget;
    if (insertIndex < 0) insertIndex = 0;
    insertIndex = Math.min(insertIndex, targetList.length);

    // 4. Insert
    for (const mon of movingMons) {
        let readyMon = { ...mon };
        // Use the save's generation to select the correct adapter for stat recalculation
        readyMon = prepareForLocation(readyMon, target.type === 'party', data.generation);
        targetList.splice(insertIndex, 0, readyMon);
        insertIndex++;
    }

    return {
        success: true,
        newData: {
            ...data,
            party: newParty,
            partyCount: newParty.length,
            pcBoxes: newBoxes,
            currentBoxPokemon: newBoxes[data.currentBoxId]!,
            currentBoxCount: newBoxes[data.currentBoxId]!.length
        }
    };
}

/**
 * Cross-Container / Cross-Save Batch Transfer (Swap/Move Logic)
 * Used for Box 1 -> Box 2 (Same Save) OR Save 1 -> Save 2
 *
 * FIX (Phase 3): isSameSave is now an explicit parameter instead of using
 * object reference equality (sourceSave === targetSave). After any prior
 * state update, React creates new object spreads, so reference equality
 * would incorrectly identify the same save as different saves.
 *
 * FIX (Phase 4): Party safety check is now done as a pre-loop batch
 * validation instead of per-item checks after null-marking.
 */
export function transferPokemonBatch(
    sourceSave: ParsedSave,
    targetSave: ParsedSave,
    sources: MoveLocation[],
    targetStart: MoveLocation,
    isSameSave?: boolean
): { success: boolean; newSource?: ParsedSave; newTarget?: ParsedSave; error?: string } {
    
    // FIX (Phase 3): Use explicit isSameSave parameter when provided,
    // otherwise fall back to reference equality for backward compatibility
    const sameSave = isSameSave !== undefined ? isSameSave : sourceSave === targetSave;

    // FIX (Phase 4): Pre-loop batch validation for party safety
    // Calculate how many Pokemon are being moved OUT of the party BEFORE we start null-marking
    const partyMovingOut = sources.filter(s => s.type === 'party').length;
    const targetIsParty = targetStart.type === 'party';
    
    // Check if moving Pokemon from party would empty it
    if (partyMovingOut > 0) {
        // Moving Pokemon from party — check if we'd empty the party
        const currentPartyCount = sourceSave.party.filter(m => m !== null).length;
        
        // If moving to a non-party container, swaps bring Pokemon back to the source (party)
        // only if target is also party. When target is box, no Pokemon come back to party via swap.
        // However, if target slots are occupied, those Pokemon swap INTO the party slot,
        // so they don't reduce the party count.
        if (!targetIsParty) {
            // Moving from party to box — calculate effective party drain
            const targetBoxList = targetSave.pcBoxes[targetStart.boxIndex]!;
            let occupiedTargetCount = 0;
            for (let i = 0; i < partyMovingOut; i++) {
                const tgtIdx = targetStart.index + i;
                const tgtLimit = 20; // Box limit
                if (tgtIdx < tgtLimit && targetBoxList[tgtIdx]) {
                    occupiedTargetCount++;
                }
            }
            // Swaps bring Pokemon back to the party, so they don't reduce the count
            if (currentPartyCount - partyMovingOut + occupiedTargetCount < 1) {
                return { success: false, error: "Cannot move — party must have at least 1 Pokémon." };
            }
        }
    }

    // 1. Create Working Copies
    // If same save, source and target structure references must share the same arrays to avoid overwrites.
    
    let sourceParty = [...sourceSave.party];
    let sourceBoxes = sourceSave.pcBoxes.map(b => [...b]);
    let targetParty: PokemonStats[];
    let targetBoxes: PokemonStats[][];

    if (sameSave) {
        targetParty = sourceParty;
        targetBoxes = sourceBoxes;
    } else {
        targetParty = [...targetSave.party];
        targetBoxes = targetSave.pcBoxes.map(b => [...b]);
    }

    const getList = (isSource: boolean, loc: MoveLocation) => {
        const party = isSource ? sourceParty : targetParty;
        const boxes = isSource ? sourceBoxes : targetBoxes;
        return loc.type === 'party' ? party : boxes[loc.boxIndex]!;
    };

    // 2. Sort Sources (Ascending)
    const sortedSources = [...sources].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'party' ? -1 : 1;
        if (a.type === 'box' && b.type === 'box') {
            if (a.boxIndex !== b.boxIndex) return a.boxIndex - b.boxIndex;
        }
        return a.index - b.index;
    });

    // 3. Execution Loop
    for (let i = 0; i < sortedSources.length; i++) {
        const srcLoc = sortedSources[i]!;
        
        // Calculate Target Location sequentially
        const currentTgtIndex = targetStart.index + i;
        const tgtLoc: MoveLocation = { ...targetStart, index: currentTgtIndex };

        const srcList = getList(true, srcLoc);
        const tgtList = getList(false, tgtLoc);
        
        // Check limits
        const tgtLimit = tgtLoc.type === 'party' ? 6 : 20;
        if (tgtLoc.index >= tgtLimit) break; // Stop if target full/out of bounds

        // Get Mons
        const srcMon = srcList[srcLoc.index]!;
        // If srcMon is null (already moved in a weird overlap edge case), skip
        if (!srcMon) continue;

        const tgtMon = tgtList[tgtLoc.index]; // Might be undefined/null

        // Per-item party safety check is REMOVED here — replaced by the
        // pre-loop batch validation above. This was the source of the
        // "party safety check is broken for multi-move" bug, where
        // null-marking from earlier iterations caused the count to be
        // incorrect for later iterations.

        // Prepare Stats
        const isTgtParty = tgtLoc.type === 'party';
        const isSrcParty = srcLoc.type === 'party';
        
        // Use source save's generation for source mon, target save's generation for target mon
        const sourceGen = sourceSave.generation;
        const targetGen = sameSave ? sourceSave.generation : targetSave.generation;

        // FIX (Phase 5 — B2): Cross-gen conversion.
        // When transferring between different generations, species IDs, move IDs,
        // held items, types, and genExtension must be converted. Simply copying
        // the CanonicalPokemon as-is produces corrupt data because Gen1 uses
        // internal species ordering while Gen2 uses National Dex order, and
        // Gen2 has moves/items/types that don't exist in Gen1.
        // Follows PKHeX's PK1.ConvertToPK2() / PK2.ConvertToPK1() pattern.
        let sourceMonForTarget: PokemonStats;
        if (!sameSave && sourceGen !== targetGen) {
            const result = convertPokemonForTransfer({ ...srcMon }, sourceGen, targetGen);
            if (!result.mon) {
                // Impossible transfer (e.g., Gen2-only species to Gen1) — skip this mon
                console.warn(`Cross-gen transfer blocked: ${result.error}`);
                continue;
            }
            // Log any warnings about data loss
            if (result.warnings.length > 0) {
                console.warn(`Cross-gen transfer warnings for ${srcMon.speciesName}:`, result.warnings);
            }
            sourceMonForTarget = result.mon;
        } else {
            sourceMonForTarget = { ...srcMon };
        }
        const readySource = prepareForLocation(sourceMonForTarget, isTgtParty, isTgtParty ? targetGen : sourceGen) as PokemonStats;
        
        if (tgtMon) {
            // --- SWAP ---
            // Also convert the swapped target mon if it's going to a different gen
            let targetMonForSource: PokemonStats;
            if (!sameSave && sourceGen !== targetGen) {
                const result = convertPokemonForTransfer({ ...tgtMon }, targetGen, sourceGen);
                if (!result.mon) {
                    // Can't swap — target mon can't exist in source gen. Fall back to move-only.
                    console.warn(`Cross-gen swap blocked for target mon: ${result.error}. Falling back to move-only.`);
                    if (tgtLoc.index >= tgtList.length) {
                        tgtList.push(readySource);
                    } else {
                        tgtList[tgtLoc.index] = readySource;
                    }
                    (srcList as (PokemonStats | null)[])[srcLoc.index] = null;
                    continue;
                }
                if (result.warnings.length > 0) {
                    console.warn(`Cross-gen transfer warnings for ${tgtMon.speciesName}:`, result.warnings);
                }
                targetMonForSource = result.mon;
            } else {
                targetMonForSource = { ...tgtMon };
            }
            const readyTarget = prepareForLocation(targetMonForSource, isSrcParty, isSrcParty ? sourceGen : targetGen) as PokemonStats;
            
            srcList[srcLoc.index] = readyTarget;
            tgtList[tgtLoc.index] = readySource;
        } else {
            // --- MOVE (Source -> Empty Target) ---
            if (tgtLoc.index >= tgtList.length) {
                tgtList.push(readySource);
            } else {
                tgtList[tgtLoc.index] = readySource;
            }
            
            // Mark Source as Null (to be removed later) to preserve indices for subsequent iterations
            (srcList as (PokemonStats | null)[])[srcLoc.index] = null; 
        }
    }

    // 4. Cleanup Nulls & Reconstruct Save Objects
    const cleanList = (list: PokemonStats[]) => (list as (PokemonStats | null)[]).filter((m): m is PokemonStats => m !== null);

    const buildNewSave = (original: ParsedSave, newParty: PokemonStats[], newBoxes: PokemonStats[][]) => {
        const cleanedParty = cleanList(newParty);
        const cleanedBoxes = newBoxes.map(b => cleanList(b));
        
        return {
            ...original,
            party: cleanedParty,
            partyCount: cleanedParty.length,
            pcBoxes: cleanedBoxes,
            currentBoxPokemon: cleanedBoxes[original.currentBoxId]!,
            currentBoxCount: cleanedBoxes[original.currentBoxId]!.length
        };
    };

    if (sameSave) {
        // If same save, sourceBoxes AND targetBoxes point to the same arrays, so cleaning one cleans the "other".
        const resultSave = buildNewSave(sourceSave, sourceParty, sourceBoxes);
        return { success: true, newSource: resultSave, newTarget: resultSave };
    } else {
        const newSrc = buildNewSave(sourceSave, sourceParty, sourceBoxes);
        const newTgt = buildNewSave(targetSave, targetParty, targetBoxes);
        return { success: true, newSource: newSrc, newTarget: newTgt };
    }
}

// Legacy single transfer wrapper
export function transferPokemon(
    sourceData: ParsedSave,
    targetData: ParsedSave,
    sourceLoc: MoveLocation,
    targetLoc: MoveLocation
) {
    return transferPokemonBatch(sourceData, targetData, [sourceLoc], targetLoc);
}
