import { ParsedSave, PokemonStats } from '../parser/types';
import { registry } from '../core/AdapterRegistry';

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
// Uses the Adapter Registry to correctly recalculate stats for any generation
const prepareForLocation = (mon: PokemonStats, isGoingToParty: boolean, generation?: number) => {
    const newMon = { ...mon, isParty: isGoingToParty };
    if (isGoingToParty) {
        // Determine the generation from the Pokemon data or the provided generation hint
        const gen = generation || 1; // Default to Gen 1 if no generation info available
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
                if (updated.iv) {
                    newMon.iv = { ...updated.iv };
                }
                // Update shiny status if recalculated
                if (updated.isShiny !== undefined) {
                    newMon.isShiny = updated.isShiny;
                }
            }
        } else {
            // Fallback: if no adapter is registered for this generation, log a warning
            console.warn(`No adapter registered for generation ${gen}. Cannot recalculate stats for Pokemon #${mon.dexId}.`);
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

    const getList = (loc: MoveLocation) => loc.type === 'party' ? newParty : newBoxes[loc.boxIndex];
    const targetList = getList(target);

    // 1. Extract Moving Mons
    const movingMons = sortedSources.map(src => {
        const list = getList(src);
        return { ...list[src.index] }; // Clone
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
            currentBoxPokemon: newBoxes[data.currentBoxId],
            currentBoxCount: newBoxes[data.currentBoxId].length
        }
    };
}

/**
 * Cross-Container / Cross-Save Batch Transfer (Swap/Move Logic)
 * Used for Box 1 -> Box 2 (Same Save) OR Save 1 -> Save 2
 */
export function transferPokemonBatch(
    sourceSave: ParsedSave,
    targetSave: ParsedSave,
    sources: MoveLocation[],
    targetStart: MoveLocation
): { success: boolean; newSource?: ParsedSave; newTarget?: ParsedSave; error?: string } {
    
    // Determine if we are operating on the same save file
    const isSameSave = sourceSave === targetSave;

    // 1. Create Working Copies
    // If same save, source and target structure references must share the same arrays to avoid overwrites.
    
    let sourceParty = [...sourceSave.party];
    let sourceBoxes = sourceSave.pcBoxes.map(b => [...b]);
    let targetParty: PokemonStats[];
    let targetBoxes: PokemonStats[][];

    if (isSameSave) {
        targetParty = sourceParty;
        targetBoxes = sourceBoxes;
    } else {
        targetParty = [...targetSave.party];
        targetBoxes = targetSave.pcBoxes.map(b => [...b]);
    }

    const getList = (isSource: boolean, loc: MoveLocation) => {
        const party = isSource ? sourceParty : targetParty;
        const boxes = isSource ? sourceBoxes : targetBoxes;
        return loc.type === 'party' ? party : boxes[loc.boxIndex];
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
        const srcLoc = sortedSources[i];
        
        // Calculate Target Location sequentially
        const currentTgtIndex = targetStart.index + i;
        const tgtLoc: MoveLocation = { ...targetStart, index: currentTgtIndex };

        const srcList = getList(true, srcLoc);
        const tgtList = getList(false, tgtLoc);
        
        // Check limits
        const tgtLimit = tgtLoc.type === 'party' ? 6 : 20;
        if (tgtLoc.index >= tgtLimit) break; // Stop if target full/out of bounds

        // Get Mons
        const srcMon = srcList[srcLoc.index];
        // If srcMon is null (already moved in a weird overlap edge case), skip
        if (!srcMon) continue;

        const tgtMon = tgtList[tgtLoc.index]; // Might be undefined/null

        // Validate Party Safety (Min 1 Pokemon)
        // If Source is Party, and we are moving (tgtMon is empty), check remaining count
        if (srcLoc.type === 'party' && !tgtMon) {
             const nonNullCount = srcList.filter(m => m !== null).length;
             if (nonNullCount <= 1) {
                 continue; // Cannot empty party
             }
        }

        // Prepare Stats
        const isTgtParty = tgtLoc.type === 'party';
        const isSrcParty = srcLoc.type === 'party';
        
        // Use source save's generation for source mon, target save's generation for target mon
        const sourceGen = sourceSave.generation;
        const targetGen = targetSave.generation;
        const readySource = prepareForLocation({ ...srcMon }, isTgtParty, isTgtParty ? targetGen : sourceGen);
        
        if (tgtMon) {
            // --- SWAP ---
            const readyTarget = prepareForLocation({ ...tgtMon }, isSrcParty, isSrcParty ? sourceGen : targetGen);
            
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
            currentBoxPokemon: cleanedBoxes[original.currentBoxId],
            currentBoxCount: cleanedBoxes[original.currentBoxId].length
        };
    };

    if (isSameSave) {
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