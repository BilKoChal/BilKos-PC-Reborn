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
export type { IGenExtension, ISaveExtension } from '../canonicalModel';
export {
  isGen1Extension,
  isGen2Extension,
  isGen3Extension,
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

export interface ParserResult {
  success: boolean;
  data?: ParsedSave;
  error?: string;
}
