/**
 * Parser Type Definitions
 *
 * This file defines the leaf types used by the Canonical Data Model (CDM)
 * and re-exports the CDM types as backward-compatible aliases.
 *
 * ARCHITECTURE: The authoritative type definitions for Pokemon and Save
 * data live in `lib/canonicalModel.ts` (CanonicalPokemon, CanonicalSave).
 * This file provides the leaf types (Item, TrainerInfo, PokemonIVs, etc.)
 * that the CDM references, and re-exports the CDM types under their
 * historical names (PokemonStats, ParsedSave) for backward compatibility.
 *
 * MIGRATION NOTE: All new code should import CanonicalPokemon and
 * CanonicalSave from canonicalModel. The PokemonStats and ParsedSave
 * aliases exist so that existing imports throughout the codebase continue
 * to work without modification. They are structurally identical —
 * PokemonStats IS CanonicalPokemon, ParsedSave IS CanonicalSave.
 */

import type { CanonicalPokemon, CanonicalSave } from '../canonicalModel';

/** Backward-compatible alias: PokemonStats = CanonicalPokemon */
export type PokemonStats = CanonicalPokemon;

/** Backward-compatible alias: ParsedSave = CanonicalSave */
export type ParsedSave = CanonicalSave;

// Re-export genExtension types and type guards for convenience
export type { IGenExtension, ISaveExtension, Gen2Mail } from '../canonicalModel';
export {
  isGen1Extension,
  isGen2Extension,
  isGen3Extension,
  isGen1SaveExtension,
  isGen2SaveExtension,
  Gen1Extension,
  Gen2Extension,
  Gen3Extension,
  Gen1SaveExtension,
  Gen2SaveExtension,
} from '../canonicalModel';

// ============================================================================
// Leaf Types — Referenced by the CDM but defined here
// ============================================================================

/**
 * Generation number — widened from `1 | 2` to `number` so that adding
 * Gen 3+ does not require editing this type. The adapter registry
 * validates generation numbers at runtime; the type system no longer
 * constrains them.
 */
export type Generation = number;

/**
 * Game version string — widened from a closed union to `string` so that
 * adding new game versions does not require editing this type. Each
 * adapter declares its `supportedVersions: string[]` for runtime
 * validation; UI components use `default` branches for unknown versions.
 *
 * Known values (for reference): 'Red', 'Blue', 'Yellow', 'Gold',
 * 'Silver', 'Crystal', 'Ruby', 'Sapphire', 'Emerald', 'FireRed',
 * 'LeafGreen', etc.
 */
export type GameVersion = string;

export interface Item {
  id: number;
  name: string;
  count: number;
  pocket?: number; // 1: Items
}

export interface PokemonIVs {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    special: number;
    // Gen 1 mirrors Special
    spAtk?: number;   
    spDef?: number;   
}

export interface PokemonEVs {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    special: number;
    spAtk?: number;   
    spDef?: number;   
}

export interface HallOfFamePokemon {
    speciesId: number;
    dexId: number;
    speciesName: string;
    nickname: string;
    level: number;
    types: string[];
}

export interface HallOfFameTeam {
    id: number;
    pokemon: HallOfFamePokemon[];
}

export interface TrainerInfo {
    name: string;
    id: string; 
    money: number;
    coins: number;
    playTime: string;
    badges: number; 
    rivalName?: string;
    pikachuFriendship?: number;
    pikachuSurfScore?: number;
    gender?: 'Male' | 'Female'; // Always Male in Gen 1 logic, Male or Female in Gen 2
}

export interface GameOptions {
    textSpeed: 'Fast' | 'Normal' | 'Slow' | 'Instant' | string;
    battleAnimation: 'On' | 'Off';
    battleStyle: 'Shift' | 'Set';
    sound: 'Mono' | 'Stereo' | 'Earphone1' | 'Earphone2' | 'Earphone3';
}

export interface MapData {
    currentMapId: number;
    x: number;
    y: number;
    lastMapId?: number;
    warpedFromMap?: number;
}

// ============================================================================
// Gen 2 Daycare Data
// ============================================================================

/**
 * Gen 2 Daycare data structure.
 * The Route 34 daycare stores up to 2 parents in NOB format
 * (Nickname + OT Name + Body), plus breeding metadata.
 */
export interface Gen2DaycareData {
    /** Parent 1 Pokemon (null if no Pokemon deposited) */
    parent1: PokemonStats | null;
    /** Parent 2 Pokemon (null if no second parent, usually a Ditto) */
    parent2: PokemonStats | null;
    /** Byte offset of the daycare data in the save file */
    offset: number;
    /** Breeding status byte (0 = no egg, non-zero = egg being produced) */
    breedingStatus: number;
    /** Steps remaining until an egg is produced */
    stepsUntilEgg: number;
}

// ============================================================================
// Gen 2 TM/HM Pocket Item
// ============================================================================

/**
 * A single TM or HM entry in the Gen 2 TM/HM pocket.
 * Unlike regular items, TMs/HMs are stored as a direct byte array
 * where index = TM/HM number and value = quantity.
 */
export interface Gen2TmHmEntry {
    /** TM/HM index (0-49 for TMs, 50-56 for HMs) */
    index: number;
    /** Item ID in the game's item table */
    itemId: number;
    /** Display name (e.g. "TM01", "HM01") */
    name: string;
    /** Quantity owned (0 = not owned, 1-99 for TMs, always 1 for HMs) */
    count: number;
    /** Which move this TM/HM teaches */
    moveId: number;
    /** Name of the move this TM/HM teaches */
    moveName: string;
}

export interface ParserResult {
  success: boolean;
  data?: ParsedSave;
  error?: string;
  /** Whether the detected game version is ambiguous (e.g. Red/Blue, Gold/Silver
   *  share checksums). When true, the app should show a version-picker modal
   *  instead of auto-confirming. When false/undefined, the version is certain
   *  (e.g. Yellow, Crystal) and can be opened directly. */
  ambiguous?: boolean;
}

// ============================================================================
// Gen 2 Phone Contact
// ============================================================================

/**
 * Gen 2 Phone Contact entry.
 * Each phone contact stores the trainer's name, class, and map location
 * so the player can rematch them via the PokeGear phone feature.
 */
export interface Gen2PhoneContact {
  trainerClass: number;
  name: string;
  mapGroup: number;
  mapNumber: number;
}
