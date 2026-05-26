import { ParsedSave, PokemonStats } from '../parser/types';
import { IGenerationAdapter } from '../interfaces';
import { registry } from '../core/AdapterRegistry';
import { convertPokemonForTransfer } from './crossGenConverter';

export type SortCriteria = 'id' | 'species' | 'nickname' | 'level' | 'type';
export type SortDirection = 'asc' | 'desc';
export type SortScope = 'single' | 'all-indiv' | 'all-global' | 'living-dex';

export interface SortResult {
    success: boolean;
    newData: ParsedSave;
    externalRemovals?: Map<string, Array<{ location: 'party' | 'box', boxIndex?: number, index: number }>>;
}

/**
 * Comparator function for Pokemon Stats
 */
const comparePokemon = (a: PokemonStats, b: PokemonStats, criteria: SortCriteria, direction: SortDirection): number => {
  let valA: string | number;
  let valB: string | number;

  if (a.speciesId === 0 && b.speciesId === 0) return 0;
  if (a.speciesId === 0) return 1;
  if (b.speciesId === 0) return -1;

  switch (criteria) {
    case 'id': valA = a.dexId; valB = b.dexId; break;
    case 'species': valA = a.speciesName; valB = b.speciesName; break;
    case 'nickname': valA = a.nickname; valB = b.nickname; break;
    case 'level': valA = a.level; valB = b.level; break;
    case 'type': 
      valA = a.type1Name; valB = b.type1Name;
      if (valA === valB) { valA = a.type2Name; valB = b.type2Name; }
      break;
    default: return 0;
  }

  if (valA < valB) return direction === 'asc' ? -1 : 1;
  if (valA > valB) return direction === 'asc' ? 1 : -1;
  return 0;
};

const sortList = (list: PokemonStats[], criteria: SortCriteria, direction: SortDirection): PokemonStats[] => {
    const actualMons = list.filter(p => p.speciesId !== 0);
    actualMons.sort((a, b) => comparePokemon(a, b, criteria, direction));
    return actualMons;
};

// Wrapper to track origin of a Pokemon during sorting
interface SortCandidate {
    mon: PokemonStats;
    sourceTabId: string; // 'current' or external ID
    location: 'party' | 'box';
    boxIndex?: number;
    index: number;
}

/**
 * Strict Living Dex Logic
 */
function sortLivingDex(
    targetSave: ParsedSave, 
    externalSaves: { id: string, data: ParsedSave }[]
): SortResult {
    
    // D1: Adapter-driven — replaces hardcoded `generation === 1` / `generation === 2` checks.
    // Box slot count comes from adapter (handles Japanese Gen1 30-slot boxes internally).
    // nationalDexMax comes from adapter; 151 is a dead-code safety net.
    const adapter = registry.getAdapter(targetSave.generation);
    const numBoxes = targetSave.pcBoxes.length;
    const boxCapacity = adapter?.boxSlotCount ?? 20;
    const maxDex = adapter?.nationalDexMax ?? 151;
    const livingDexBoxesCount = Math.ceil(maxDex / boxCapacity);
    const overflowStartBox = livingDexBoxesCount;

    // --- Phase 1: Collect ALL Pokemon from Target Save ONLY ---
    const targetCandidates: SortCandidate[] = [];
    
    targetSave.party.forEach((mon, idx) => {
        targetCandidates.push({ mon: { ...mon, isParty: false }, sourceTabId: 'current', location: 'party', index: idx });
    });
    targetSave.pcBoxes.forEach((box, boxIdx) => {
        box.forEach((mon, idx) => {
            targetCandidates.push({ mon: { ...mon, isParty: false }, sourceTabId: 'current', location: 'box', boxIndex: boxIdx, index: idx });
        });
    });

    // Initialize Target Boxes
    const newBoxes: PokemonStats[][] = Array.from({ length: numBoxes }, () => []);
    
    const dexKeepers = new Map<number, SortCandidate>(); // ID -> Candidate
    const overflow: SortCandidate[] = [];

    // Group Target Pokemon by ID
    const targetGroups = new Map<number, SortCandidate[]>();
    
    targetCandidates.forEach(c => {
        if (c.mon.dexId >= 1 && c.mon.dexId <= maxDex) {
            if (!targetGroups.has(c.mon.dexId)) targetGroups.set(c.mon.dexId, []);
            targetGroups.get(c.mon.dexId)?.push(c);
        } else {
            // Glitch mons or outside range immediately to overflow
            overflow.push(c);
        }
    });

    // Select Keepers from Target Save
    for (let id = 1; id <= maxDex; id++) {
        const group = targetGroups.get(id);
        if (group && group.length > 0) {
            // Sort by Level Descending (Higher level wins)
            group.sort((a, b) => b.mon.level - a.mon.level);
            
            // Winner takes the slot
            dexKeepers.set(id, group[0]!);
            
            // Rest go to overflow
            for (let i = 1; i < group.length; i++) {
                overflow.push(group[i]!);
            }
        }
    }

    // --- Phase 2: Fill Gaps from External Saves (Move Logic) ---
    const usedExternalCandidates = new Set<SortCandidate>();

    if (externalSaves.length > 0) {
        for (let id = 1; id <= maxDex; id++) {
            // If we ALREADY have a keeper from Target save, skip.
            if (dexKeepers.has(id)) continue;

            // Slot is empty. Look in external saves.
            let bestExternal: SortCandidate | null = null;

            for (const ext of externalSaves) {
                // Collect matching ID from this save
                const matches: SortCandidate[] = [];
                
                ext.data.party.forEach((mon, idx) => {
                    if (mon.dexId === id) matches.push({ mon: { ...mon, isParty: false }, sourceTabId: ext.id, location: 'party', index: idx });
                });
                ext.data.pcBoxes.forEach((box, boxIdx) => {
                    box.forEach((mon, idx) => {
                        if (mon.dexId === id) matches.push({ mon: { ...mon, isParty: false }, sourceTabId: ext.id, location: 'box', boxIndex: boxIdx, index: idx });
                    });
                });

                if (matches.length > 0) {
                    // Pick best from this save
                    matches.sort((a, b) => b.mon.level - a.mon.level);
                    const candidate = matches[0]!;

                    // Compare with current best external found so far
                    if (!bestExternal || candidate.mon.level > bestExternal.mon.level) {
                        bestExternal = candidate;
                    }
                }
            }

            if (bestExternal) {
                dexKeepers.set(id, bestExternal);
                usedExternalCandidates.add(bestExternal);
            }
        }
    }

    // --- Phase 3: Construct Boxes ---

    // 3a. Place Keepers (Living Dex)
    // FIX (B2): Apply cross-gen conversion for Pokemon from external saves.
    // When pulling a Pokemon from a different-generation save, species IDs, move IDs,
    // held items, types, and genExtension must be converted. Simply copying as-is
    // produces corrupt data. Follows PKHeX's ConvertToType() pattern.
    const targetGen = targetSave.generation;
    for (let id = 1; id <= maxDex; id++) {
        const keeper = dexKeepers.get(id);
        if (keeper) {
            const boxIndex = Math.floor((id - 1) / boxCapacity);
            if (boxIndex < overflowStartBox) {
                // Convert cross-gen Pokemon before placing them
                let monToPlace = keeper.mon;
                const sourceGen = keeper.sourceTabId === 'current' ? targetGen : (externalSaves.find(e => e.id === keeper.sourceTabId)?.data.generation ?? targetGen);
                if (sourceGen !== targetGen) {
                    const result = convertPokemonForTransfer(keeper.mon, sourceGen, targetGen);
                    if (!result.mon) {
                        // Impossible transfer — skip this mon, send to overflow
                        console.warn(`Living-dex cross-gen transfer blocked: ${result.error}`);
                        overflow.push(keeper);
                        continue;
                    }
                    if (result.warnings.length > 0) {
                        console.warn(`Living-dex cross-gen warnings for ${keeper.mon.speciesName}:`, result.warnings);
                    }
                    monToPlace = result.mon;
                }
                newBoxes[boxIndex]!.push(monToPlace);
            } else {
                overflow.push(keeper);
            }
        }
    }

    // 3b. Place Overflow (Target Save Only)
    // Sort overflow by ID for neatness
    overflow.sort((a, b) => a.mon.dexId - b.mon.dexId);

    // Fill Overflow Boxes
    let currentOvBox = overflowStartBox;
    for (const item of overflow) {
        while (currentOvBox < numBoxes && newBoxes[currentOvBox]!.length >= boxCapacity) {
            currentOvBox++;
        }
        if (currentOvBox < numBoxes) {
            newBoxes[currentOvBox]!.push(item.mon);
        } else {
            console.warn("Storage Full! Dropping pokemon:", item.mon.nickname);
        }
    }

    // --- Phase 4: Party Safety ---
    // Rule: Party must not be empty.
    let partyMon: PokemonStats | undefined = undefined;

    // Try finding one in overflow (Boxes (numBoxes - 1) -> overflowStartBox)
    for (let i = numBoxes - 1; i >= overflowStartBox; i--) {
        if (newBoxes[i] && newBoxes[i]!.length > 0) {
            partyMon = newBoxes[i]!.pop();
            if (partyMon) break;
        }
    }

    // If still no party mon, steal from Living Dex (Boxes (overflowStartBox - 1) -> 0)
    if (!partyMon) {
        for (let i = overflowStartBox - 1; i >= 0; i--) {
            if (newBoxes[i] && newBoxes[i]!.length > 0) {
                partyMon = newBoxes[i]!.pop();
                if (partyMon) break;
            }
        }
    }

    // Ensure Party Mon is set to Party Mode
    const finalParty: PokemonStats[] = [];
    if (partyMon) {
        finalParty.push({ ...partyMon, isParty: true });
    }

    // --- Phase 5: Calculate Removals ---
    const externalRemovals = new Map<string, Array<{ location: 'party' | 'box', boxIndex?: number, index: number }>>();

    usedExternalCandidates.forEach(c => {
        if (c.sourceTabId !== 'current') {
            if (!externalRemovals.has(c.sourceTabId)) {
                externalRemovals.set(c.sourceTabId, []);
            }
            externalRemovals.get(c.sourceTabId)?.push({
                location: c.location,
                boxIndex: c.boxIndex,
                index: c.index
            });
        }
    });

    return {
        success: true,
        newData: {
            ...targetSave,
            pcBoxes: newBoxes,
            party: finalParty,
            partyCount: finalParty.length,
            currentBoxPokemon: newBoxes[targetSave.currentBoxId] ?? [],
            currentBoxCount: (newBoxes[targetSave.currentBoxId] ?? []).length
        },
        externalRemovals
    };
}

/**
 * Main Sort Function
 */
export function sortPCBoxes(
  targetSave: ParsedSave,
  scope: SortScope,
  criteria: SortCriteria,
  direction: SortDirection,
  externalSaves: { id: string, data: ParsedSave }[] = []
): SortResult {
  
  if (scope === 'living-dex') {
      return sortLivingDex(targetSave, externalSaves);
  } 
  
  // -- Standard Sorting (Current Save Only) --
  
  let newBoxes = targetSave.pcBoxes.map(box => [...box]); // Deep clone

  if (scope === 'single') {
    const boxIdx = targetSave.currentBoxId;
    newBoxes[boxIdx] = sortList(newBoxes[boxIdx]!, criteria, direction);
  } 
  else if (scope === 'all-indiv') {
    for (let i = 0; i < newBoxes.length; i++) {
      newBoxes[i] = sortList(newBoxes[i]!, criteria, direction);
    }
  } 
  else if (scope === 'all-global') {
    let allMons: PokemonStats[] = [];
    newBoxes.forEach(box => allMons.push(...box));
    allMons = sortList(allMons, criteria, direction);
    
    const numBoxes = targetSave.pcBoxes.length;
    const adapter = registry.getAdapter(targetSave.generation);
    // D1: Adapter-driven box capacity — replaces `generation === 1 && numBoxes === 8 ? 30 : 20`
    const boxCapacity = adapter?.boxSlotCount ?? 20;
    const maxDex = adapter?.nationalDexMax ?? 151;

    newBoxes = Array.from({ length: numBoxes }, () => []);
    for (let i = 0; i < numBoxes; i++) {
        const start = i * boxCapacity;
        const end = start + boxCapacity;
        if (start < allMons.length) {
            newBoxes[i] = allMons.slice(start, end);
        }
    }
  }

  return {
    success: true,
    newData: {
      ...targetSave,
      pcBoxes: newBoxes,
      currentBoxPokemon: newBoxes[targetSave.currentBoxId] ?? [],
      currentBoxCount: (newBoxes[targetSave.currentBoxId] ?? []).length
    }
  };
}
