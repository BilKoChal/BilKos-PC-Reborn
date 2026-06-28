/**
 * Cross-Generation Pokemon Transfer Converter
 *
 * When transferring a Pokemon between save files of different generations,
 * generation-specific internal IDs (species, moves, items, types) must be
 * remapped, and fields that don't exist in the target generation must be
 * stripped or defaulted. Simply copying the CanonicalPokemon as-is would
 * produce corrupt data because:
 *
 * - Gen1 uses internal species ordering (Rhydon=1, Mew=21); Gen2 uses National Dex
 * - Gen2 adds moves 166-251 that don't exist in Gen1
 * - Gen1 has no held items; Gen2 does
 * - Gen2 adds Steel/Dark types that don't exist in Gen1
 * - The raw binary struct layout is completely different between generations
 *
 * This module follows PKHeX's pattern:
 *   - PK1.ConvertToPK2() remaps species, converts catchRate→heldItem
 *   - PK2.ConvertToPK1() remaps species, strips Gen2-only moves, drops heldItem
 *   - EntityConverter rejects impossible transfers (species > 151 → Gen1)
 *
 * DESIGN: The CanonicalPokemon's `dexId` (National Dex) is the universal key.
 * All conversions route through it: sourceGen internal ID → dexId → targetGen internal ID.
 *
 * HUB-AND-SPOKE (TODO 8.5.5): this converter is pairwise today, which is fine for the
 * Gen 1 ↔ Gen 2 scope. As the generation matrix grows (past ~Gen 5), transfers should
 * pivot from O(N²) pairwise converters to routing through a neutral hub format — and
 * `CanonicalPokemon` is already that hub (the role HOME's `PKH` plays in PKHeX). Each
 * generation then only converts to/from the hub (O(N) spokes), not to every peer. See
 * `docs/CROSS_GEN_TRANSFER.md`.
 */

import { PokemonStats } from '../parser/types';
import { registry } from '../core/AdapterRegistry';
import { Gen1Extension, Gen2Extension, Gen3Extension } from '../canonicalModel';
import { GEN1_DEX_TO_INTERNAL } from '../generations/gen1/data/offsets';
import { GEN1_CATCH_RATES } from '../generations/gen1/data/baseStats';
import { getNatureName, getAbilitySlot, getGenderFromPid } from '../generations/gen3/identity';

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum move ID that exists in Gen 1. Moves 166-251 are Gen2-exclusive. */
const MAX_GEN1_MOVE_ID = 165;

/** Default move ID when all moves are stripped (Pound). */
const DEFAULT_MOVE_ID = 1;

/** Default base friendship when transferring from Gen1→Gen2 (PKHeX uses PersonalInfo.BaseFriendship). */
const DEFAULT_BASE_FRIENDSHIP = 70;

/** Maximum National Dex ID for Kanto Pokemon (cannot exist in Gen1). */
const MAX_GEN1_DEX_ID = 151;

/** Maximum National Dex ID for Gen 2 (Johto). */
const MAX_GEN2_DEX_ID = 251;

/** Maximum National Dex ID for Gen 3 (Hoenn). Gen 3 internal speciesId == National Dex ID. */
const MAX_GEN3_DEX_ID = 386;

// ── Reverse Mapping: National Dex → Gen1 Internal ID ──────────────────────

/** National Dex ID → Gen1 internal species ID — shared from data/offsets.ts (TODO 4.4). */
const DEX_TO_GEN1_INTERNAL = GEN1_DEX_TO_INTERNAL;

// ── Conversion Result ──────────────────────────────────────────────────────

export interface ConversionResult {
    /** The converted Pokemon, or null if conversion failed. */
    mon: PokemonStats | null;
    /** Warnings about data that was lost or modified during conversion. */
    warnings: string[];
    /** Error message if conversion is impossible (e.g., species doesn't exist in target gen). */
    error?: string;
}

// ── Species ID Conversion ──────────────────────────────────────────────────

/**
 * Convert a speciesId from one generation's internal format to another's.
 * Returns null if the species doesn't exist in the target generation.
 *
 * BUG-G04 fix: previously returned the source `speciesId` unchanged for any
 * `toGen >= 3`, which would silently corrupt Gen 1 → Gen 3 transfers (a Gen 1
 * Pikachu has speciesId=84 internally; returning 84 as the Gen 3 speciesId
 * would point at a completely different Pokémon). Gen 3 uses the National Dex
 * ID as its internal speciesId (same as Gen 2), so the correct mapping is
 * `dexId` for any target generation ≥ 2.
 */
export function convertSpeciesId(speciesId: number, fromGen: number, toGen: number, dexId: number): number | null {
    // Same generation → no conversion needed
    if (fromGen === toGen) return speciesId;

    // For cross-gen, we always use dexId as the universal key.
    // Gen2 speciesId = dexId (National Dex order), Gen1 speciesId = internal ordering.

    if (toGen === 1) {
        // Target is Gen1: species must be ≤ 151 Kanto Pokemon
        if (dexId > MAX_GEN1_DEX_ID || dexId < 1) return null;
        const internalId = DEX_TO_GEN1_INTERNAL[dexId];
        return internalId ?? null;
    }

    if (toGen === 2) {
        // Target is Gen2: speciesId = dexId (National Dex order)
        if (dexId < 1 || dexId > MAX_GEN2_DEX_ID) return null;
        return dexId;
    }

    if (toGen >= 3) {
        // BUG-G04 fix: Gen 3+ uses National Dex ID as the internal speciesId
        // (verified against PKHeX PersonalTable.RS — internal index == dexId for
        // species 1..386). Reject anything outside the Gen 3 dex range.
        if (dexId < 1 || dexId > MAX_GEN3_DEX_ID) return null;
        return dexId;
    }

    return null;
}

// ── Move Validation ────────────────────────────────────────────────────────

/**
 * Validate and sanitize move IDs for a target generation.
 * Returns the sanitized move array and a list of warnings.
 */
export function validateMovesForTargetGen(
    moveIds: number[],
    moveNames: string[],
    targetGen: number
): { moves: number[]; warnings: string[] } {
    const warnings: string[] = [];

    if (targetGen === 1) {
        // Gen1 only has moves 0-165. Strip Gen2-only moves.
        const kept: number[] = [];
        let anyStripped = false;

        for (let i = 0; i < Math.min(moveIds.length, 4); i++) {
            const moveId = moveIds[i] ?? 0;
            if (moveId > 0 && moveId <= MAX_GEN1_MOVE_ID) {
                kept.push(moveId);
            } else if (moveId > MAX_GEN1_MOVE_ID) {
                anyStripped = true;
                const name = moveNames[i] ?? `ID ${moveId}`;
                warnings.push(`Move "${name}" does not exist in Gen 1 and was removed.`);
            }
            // moveId === 0: just skip (empty slot)
        }

        // If all moves were stripped, default to Pound (move 1) — PKHeX pattern
        if (anyStripped && kept.length === 0) {
            kept.push(DEFAULT_MOVE_ID);
            warnings.push(`All moves were Gen 2-exclusive; defaulted to Pound.`);
        }

        // Pad to 4 slots
        while (kept.length < 4) kept.push(0);

        return { moves: kept.slice(0, 4), warnings };
    }

    // Gen2+ supports all moves up to its generation's max
    const result = moveIds.slice(0, 4);
    while (result.length < 4) result.push(0);
    return { moves: result, warnings };
}

// ── Main Conversion Function ──────────────────────────────────────────────

/**
 * Convert a Pokemon for cross-generation transfer.
 *
 * Follows PKHeX's ConvertToType pattern:
 * 1. Validate species exists in target generation
 * 2. Remap speciesId to target generation's internal format
 * 3. Validate/sanitize move IDs
 * 4. Handle items, types, genExtension, and other gen-specific fields
 * 5. Recalculate stats with target generation's adapter
 *
 * @param mon The source Pokemon to convert
 * @param sourceGen The source save's generation
 * @param targetGen The target save's generation
 * @returns ConversionResult with the converted mon or an error
 */
export function convertPokemonForTransfer(
    mon: PokemonStats,
    sourceGen: number,
    targetGen: number
): ConversionResult {
    const warnings: string[] = [];

    // Same generation → no conversion needed
    if (sourceGen === targetGen) {
        return { mon, warnings };
    }

    // ── 1. Validate species exists in target generation ──
    if (targetGen === 1 && mon.dexId > MAX_GEN1_DEX_ID) {
        return {
            mon: null,
            warnings,
            error: `${mon.speciesName} (National Dex #${mon.dexId}) is a Gen 2+ Pokémon and cannot exist in a Gen 1 save.`
        };
    }

    if (targetGen === 2 && mon.dexId > MAX_GEN2_DEX_ID) {
        return {
            mon: null,
            warnings,
            error: `${mon.speciesName} (National Dex #${mon.dexId}) cannot exist in a Gen 2 save.`
        };
    }

    // BUG-G05 fix: gate Gen 3 transfers to the Gen 3 dex range (1..386).
    // Previously this case was missing and the function fell through to
    // `canTransferToGen` which returned `true` for any dexId when targetGen >= 3.
    if (targetGen >= 3 && mon.dexId > MAX_GEN3_DEX_ID) {
        return {
            mon: null,
            warnings,
            error: `${mon.speciesName} (National Dex #${mon.dexId}) cannot exist in a Gen 3 save (max ${MAX_GEN3_DEX_ID}).`
        };
    }

    // ── 2. Build the converted mon ──
    const targetAdapter = registry.getAdapter(targetGen);
    if (!targetAdapter) {
        return {
            mon: null,
            warnings,
            error: `No adapter registered for generation ${targetGen}. Cannot convert.`
        };
    }

    // Start with a shallow clone
    const converted: PokemonStats = { ...mon, iv: { ...mon.iv }, ev: { ...mon.ev } };

    // ── 3. Species ID conversion ──
    const newSpeciesId = convertSpeciesId(mon.speciesId, sourceGen, targetGen, mon.dexId);
    if (newSpeciesId === null) {
        return {
            mon: null,
            warnings,
            error: `Cannot map species ID for ${mon.speciesName} from Gen ${sourceGen} to Gen ${targetGen}.`
        };
    }
    converted.speciesId = newSpeciesId;

    // ── 4. Species name update (may differ between gens) ──
    converted.speciesName = targetAdapter.getPokemonName(mon.dexId);

    // ── 5. Type recalculation ──
    // Types must come from the target generation's data (e.g., Magnemite gains Steel in Gen2)
    const typeInfo = targetAdapter.getTypes(mon.dexId);
    if (typeInfo) {
        converted.type1Name = typeInfo.type1Name;
        converted.type2Name = typeInfo.type2Name;
    }

    // ── 6. Move validation ──
    const moveIds = [...(mon.moveIds ?? [])];
    const moveNames = [...(mon.moves ?? [])];
    const moveResult = validateMovesForTargetGen(moveIds, moveNames, targetGen);
    warnings.push(...moveResult.warnings);

    converted.moveIds = moveResult.moves;

    // Update move names and PP from target adapter
    converted.moves = converted.moveIds.map(id => id ? (targetAdapter.getMoveName(id) ?? '') : '');
    converted.movePp = converted.moveIds.map(id => id ? (targetAdapter.getMoveBasePp(id) ?? 0) : 0);
    converted.movePpUps = [0, 0, 0, 0]; // Reset PP Ups on transfer

    // ── 7. Gen1→Gen2 specific conversions ──
    if (sourceGen === 1 && targetGen === 2) {
        // Items: Gen1 has no held items. Leave heldItemId=0 (no item).
        converted.heldItemId = 0;
        converted.heldItemName = 'None';

        // Friendship: Gen1 has no friendship. Set to default base friendship.
        converted.friendship = DEFAULT_BASE_FRIENDSHIP;
        warnings.push(`Friendship set to ${DEFAULT_BASE_FRIENDSHIP} (Gen 1 has no friendship value).`);

        // GenExtension: Replace Gen1Extension with Gen2Extension
        const gen2Ext = new Gen2Extension();
        gen2Ext.heldItemId = 0;
        gen2Ext.heldItemName = 'None';
        gen2Ext.friendship = DEFAULT_BASE_FRIENDSHIP;
        gen2Ext.pokerus = 0; // Gen1 has no Pokérus
        gen2Ext.gender = 'Genderless'; // Will be derived from DVs by recalculateStats
        gen2Ext.isShiny = mon.isShiny ?? false;

        converted.genExtension = gen2Ext;
    }

    // ── 8. Gen2→Gen1 specific conversions ──
    if (sourceGen === 2 && targetGen === 1) {
        // Items: Gen1 has no held items. Strip held item.
        if (mon.heldItemId && mon.heldItemId !== 0) {
            warnings.push(`Held item "${mon.heldItemName}" was removed (Gen 1 has no held items).`);
        }
        converted.heldItemId = undefined;
        converted.heldItemName = undefined;

        // Friendship: Gen1 has no friendship. Strip it.
        if (mon.friendship && mon.friendship > 0) {
            warnings.push(`Friendship (${mon.friendship}) was removed (Gen 1 has no friendship).`);
        }
        converted.friendship = 0;

        // Gender: Gen1 has no gender. Strip it.
        converted.gender = 'Genderless';

        // Pokérus: Gen1 has no Pokérus. Strip it.
        converted.pokerus = 0;

        // GenExtension: Replace Gen2Extension with Gen1Extension
        const gen1Ext = new Gen1Extension();
        // Catch rate: Look up from Gen1 data table
        gen1Ext.catchRate = GEN1_CATCH_RATES[mon.dexId] ?? 45;
        // Special: Use SpAtk value as the unified Special stat
        gen1Ext.special = mon.spAtk ?? mon.special ?? 0;
        gen1Ext.isParty = mon.isParty ?? false;

        converted.genExtension = gen1Ext;

        // Special stat: Gen1 uses unified Special (use SpAtk value)
        converted.special = mon.spAtk ?? mon.special ?? 0;
    }

    // ── 8b. Gen{1,2}→Gen3 specific conversions (BUG-G3-03 fix) ──
    // Previously, transferring into Gen 3 left the stale Gen1/Gen2Extension
    // attached to the mon (with DV-based fields like isShiny, gender, spAtk,
    // spDef) and never constructed a Gen3Extension carrying the abilityId,
    // natureId, secretId, ribbons, or contestStats that Gen 3 expects. This
    // branch synthesizes a fresh Gen3Extension and pads DVs (0-15) into Gen 3
    // IVs (0-31). The actual stat recalculation with the Gen 3 formula
    // (floor(EV/4) + nature modifier) happens in step 10 via
    // `targetAdapter.recalculateStats()`.
    if (targetGen >= 3 && sourceGen < 3) {
        // Synthesize a PID. Use the existing PID if present (shouldn't be for
        // Gen 1/2), otherwise derive a deterministic one from TID + dexId +
        // a constant. Real Gen 3 saves always have a PID; we just need one
        // for nature/ability/gender derivation in the absence of source data.
        const pid = mon.pid && mon.pid !== 0
            ? mon.pid
            : (((mon.originalTrainerId ?? 0) ^ (mon.dexId * 0x1000) ^ 0x7FFFFFFF) >>> 0);
        converted.pid = pid;

        // Synthesize a Secret ID (Gen 1/2 have no SID).
        const sid = 0;
        converted.secretId = sid;

        // Pad DVs (0-15) to Gen 3 IVs (0-31): replicate each DV bit into the
        // low 4 bits AND set bit 4 from the DV's MSB. This preserves the DV
        // value (0-15) in the low nibble and adds a deterministic high bit
        // so the IV is in the 0-31 range. (PKHeX's `PK2.ConvertToPK3` does a
        // similar DV→IV padding.)
        const padDvToIv = (dv: number): number => ((dv & 0xF) | ((dv & 0x8) << 1)) >>> 0;
        converted.iv = {
            hp: padDvToIv(mon.iv.hp),
            attack: padDvToIv(mon.iv.attack),
            defense: padDvToIv(mon.iv.defense),
            speed: padDvToIv(mon.iv.speed),
            special: padDvToIv(mon.iv.special),
            spAtk: padDvToIv(mon.iv.special),  // Gen 3 splits Special into SpAtk
            spDef: padDvToIv(mon.iv.special),  // and SpDef, both from the shared DV
        };

        // Cap StatExp (0-65535) to Gen 3 EVs (0-255 per stat, 510 total).
        // Simple per-stat cap; total-cap enforcement is a UI concern.
        const capEv = (ev: number): number => Math.min(ev ?? 0, 255);
        converted.ev = {
            hp: capEv(mon.ev.hp),
            attack: capEv(mon.ev.attack),
            defense: capEv(mon.ev.defense),
            speed: capEv(mon.ev.speed),
            special: capEv(mon.ev.special),
            spAtk: capEv(mon.ev.special),
            spDef: capEv(mon.ev.special),
        };

        // Derive nature, ability slot, and gender from the synthesized PID.
        const natureName = getNatureName(pid);
        const abilitySlot = getAbilitySlot(pid); // 0 or 1
        const gender = getGenderFromPid(pid, mon.dexId);

        // Build the Gen3Extension.
        const gen3Ext = new Gen3Extension();
        gen3Ext.natureId = pid % 25;
        gen3Ext.natureName = natureName;
        gen3Ext.abilityId = abilitySlot; // slot index; real parser would look up the species' ability
        gen3Ext.abilityName = abilitySlot === 1 ? 'Ability 2' : 'Ability 1';
        gen3Ext.secretId = sid;
        gen3Ext.characteristic = '';
        gen3Ext.ribbons = [];
        gen3Ext.contestStats = { cool: 0, beauty: 0, cute: 0, smart: 0, tough: 0, sheen: 0 };
        gen3Ext.pokeblockFlavorPrefs = [];
        converted.genExtension = gen3Ext;

        // Update flat fields for O(1) UI access.
        converted.isShiny = mon.isShiny ?? false; // Shiny status is rechecked by recalculateStats
        converted.gender = gender;
        converted.originalTrainerGender = mon.originalTrainerGender ?? 'Male';

        // Gen 3 items use a different ID space; reset to "no item" — a real
        // Gen 3 adapter would map the Gen 1/2 item ID to the closest Gen 3
        // equivalent, but that table doesn't exist yet.
        if (mon.heldItemId && mon.heldItemId !== 0) {
            warnings.push(`Held item "${mon.heldItemName}" was reset (Gen 3 uses a different item ID table).`);
        }
        converted.heldItemId = 0;
        converted.heldItemName = 'None';

        // Friendship: Gen 3 uses the same 0-255 range as Gen 2.
        if (sourceGen === 1) {
            converted.friendship = DEFAULT_BASE_FRIENDSHIP;
            warnings.push(`Friendship set to ${DEFAULT_BASE_FRIENDSHIP} (Gen 1 has no friendship value).`);
        }

        warnings.push(`Synthesized PID=${pid.toString(16)}, Nature=${natureName}, Ability slot=${abilitySlot}.`);
    }

    // ── 9. Discard stale raw bytes ──
    // Raw binary struct bytes are generation-specific and cannot be reused.
    // They will be rebuilt by the target generation's writer on export.
    converted.raw = new Uint8Array(0);
    converted.nicknameRaw = new Uint8Array(0);
    converted.startOffset = 0;

    // ── 10. Recalculate stats with target generation's adapter ──
    const baseStats = targetAdapter.getBaseStats(mon.dexId);
    if (baseStats) {
        const recalcMon = targetAdapter.recalculateStats(converted, baseStats);
        converted.maxHp = recalcMon.maxHp;
        converted.attack = recalcMon.attack;
        converted.defense = recalcMon.defense;
        converted.speed = recalcMon.speed;
        converted.special = recalcMon.special;
        converted.spAtk = recalcMon.spAtk;
        converted.spDef = recalcMon.spDef;
        converted.hp = Math.min(converted.hp, converted.maxHp);

        // Update IVs if the adapter derived them (e.g., Gen2 HP IV derivation)
        // Note: recalculateStats now deep-clones iv/ev internally (B6 fix),
        // so this spread is defensive but no longer strictly necessary.
        if (recalcMon.iv) {
            converted.iv = { ...recalcMon.iv };
        }
        // Update shiny status if recalculated
        if (recalcMon.isShiny !== undefined) {
            converted.isShiny = recalcMon.isShiny;
        }
    }

    return { mon: converted, warnings };
}

/**
 * Check if a cross-generation transfer is possible without actually converting.
 * Useful for UI validation before the user initiates a transfer.
 *
 * BUG-G05 fix: previously returned `true` for any `dexId` when `targetGen >= 3`,
 * which would silently allow a Gen 4+ Pokémon (e.g. Leafeon #470) into a Gen 3
 * transfer (max 386), producing an invalid Pokémon. Gen 3 now correctly checks
 * the Hoenn dex range 1..386. Higher generations should add their own branches.
 */
export function canTransferToGen(dexId: number, targetGen: number): boolean {
    if (targetGen === 1) return dexId >= 1 && dexId <= MAX_GEN1_DEX_ID;
    if (targetGen === 2) return dexId >= 1 && dexId <= MAX_GEN2_DEX_ID;
    if (targetGen === 3) return dexId >= 1 && dexId <= MAX_GEN3_DEX_ID;
    // Higher generations should add their own range checks here.
    // Defaulting to `false` is safer than `true` — better to reject an unknown
    // transfer than silently corrupt.
    return false;
}

/**
 * Get a user-facing description of what will happen during a cross-gen transfer.
 * Useful for confirmation dialogs.
 */
export function getTransferImpactDescription(
    mon: PokemonStats,
    sourceGen: number,
    targetGen: number
): string[] {
    if (sourceGen === targetGen) return [];

    const impacts: string[] = [];
    const moveIds = mon.moveIds ?? [];

    if (targetGen === 1 && sourceGen === 2) {
        if (mon.heldItemId && mon.heldItemId !== 0) {
            impacts.push(`Held item "${mon.heldItemName}" will be removed.`);
        }
        if (moveIds.some(id => id > MAX_GEN1_MOVE_ID)) {
            impacts.push('Gen 2-exclusive moves will be removed.');
        }
        impacts.push('Friendship and held items will be lost.');
        impacts.push('Stats will be recalculated using Gen 1 formulas.');
        impacts.push('SpAtk and SpDef will collapse to a unified Special stat.');
    }

    if (targetGen === 2 && sourceGen === 1) {
        impacts.push('Types will be updated to Gen 2 values (e.g., Magnemite gains Steel).');
        impacts.push('Friendship will be set to a default value.');
        impacts.push('Gender and shiny status will be derived from DVs.');
        impacts.push('Stats will be recalculated using Gen 2 formulas (split SpAtk/SpDef).');
    }

    // BUG-G3-03 fix: document Gen 3 transfer impacts so the UI can warn the user.
    if (targetGen >= 3 && sourceGen < 3) {
        impacts.push('DVs (0-15) will be padded to Gen 3 IVs (0-31); the upper bit is filled from the DV bit.');
        impacts.push('Stat Experience (0-65535) will be capped at the Gen 3 EV cap (0-255 per stat, 510 total).');
        impacts.push('A Personality ID (PID), Secret ID, Nature, and Ability slot will be synthesized.');
        impacts.push('Held item will be re-mapped to the Gen 3 item table (item IDs differ).');
        impacts.push('Caught data, ribbons, and contest stats will be initialized to defaults.');
        impacts.push('Stats will be recalculated using Gen 3 formulas (floor(EV/4) + nature modifier).');
    }

    return impacts;
}
