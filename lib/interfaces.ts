import React from 'react';
import { ParsedSave, PokemonStats } from './parser/types';
import { GameCartridge } from '../types';

// ============================================================================
// Base Stats Interface — replaces `any` return types from getBaseStats()
// ============================================================================

/**
 * Unified base stats structure used across all generation adapters.
 * Gen 1 mirrors spAtk/spDef from the single Special base stat.
 * Gen 2+ provides independent spAtk/spDef values.
 */
export interface BaseStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAtk: number;
    spDef: number;
}

// ============================================================================
// Standalone Pokemon Format — Scalable PKx Support for Future Gens
// ============================================================================

/**
 * Describes how a generation serializes standalone Pokemon (.pkx) files.
 * Each generation's adapter owns a StandalonePokemonFormat instance that
 * defines its specific file format, validation rules, and serialization logic.
 *
 * This abstraction allows adding Gen 3+ support (with encryption, abilities,
 * natures, etc.) without modifying any UI code or the adapter interface.
 * PCStorage and PokemonEditorModal use this interface generically.
 */
export interface IStandalonePokemonFormat {
  /** File extension including dot (e.g., '.pk1', '.pk2', '.pk3') */
  fileExtension: string;
  
  /** MIME type / accept pattern for file input elements (e.g., '.pk1,.pk2') */
  acceptPattern: string;
  
  /** Expected file sizes for validation (INT and JPN variants) */
  expectedSizes: {
    international: number;
    japanese: number;
  };
  
  /** Whether this generation uses encryption for Pokemon data (Gen3+ = true) */
  hasEncryption: boolean;
  
  /** Whether this generation has the Ability system (Gen3+ = true) */
  hasAbilities: boolean;
  
  /** Whether this generation has the Nature system (Gen3+ = true) */
  hasNatures: boolean;
  
  /** Create a standalone .pkx file from a canonical Pokemon */
  createFile(mon: import('./parser/types').PokemonStats, region?: string): Uint8Array;
  
  /** Parse a standalone .pkx file into a canonical Pokemon */
  parseFile(buffer: Uint8Array, region?: string): import('./parser/types').PokemonStats;
  
  /** Validate a .pkx file buffer (check size, checksums, etc.) */
  validateFile(buffer: Uint8Array): { valid: boolean; error?: string };
}

// ============================================================================
// Interface Segregation: Focused sub-interfaces for IGenerationAdapter
// ============================================================================

/**
 * Generation metadata and configuration properties.
 * Provides static information about a generation's capabilities and structure.
 *
 * These fields replace the ~27 hardcoded `generation === 1 / === 2` checks
 * scattered across UI components. Each adapter declares its own values,
 * so adding Gen 3+ never requires touching UI code again.
 *
 * Example: `const maxDex = adapter.nationalDexMax;` works for every generation.
 */
export interface IGenerationMetadata {
  generation: number;
  generationName: string;
  supportedVersions: string[];
  partySize: number;
  boxSlotCount: number;
  boxCount: number;
  typeList: string[];
  typeChart: number[][];

  // ── Adapter-driven generation facts (replaces hardcoded branching) ──

  /** Highest National Dex ID in this generation.
   *  Gen1=151, Gen2=251, Gen3=386, Gen4=493, Gen5=649, Gen6=721, Gen7=809, Gen8=905, Gen9=1025 */
  nationalDexMax: number;

  /** Whether this generation splits the Special stat into SpAtk/SpDef.
   *  false for Gen1, true for Gen2+ */
  hasSplitSpecial: boolean;

  /** Whether this generation has the Ability system.
   *  false for Gen1-2, true for Gen3+ */
  hasAbilities: boolean;

  /** Whether this generation has the Nature system.
   *  false for Gen1-2, true for Gen3+ */
  hasNatures: boolean;

  /** Whether this generation supports player gender selection.
   *  false for Gen1 (always Male), true for Gen2+ */
  hasGender: boolean;

  /** Whether this generation has badges from multiple regions.
   *  false for Gen1 (Kanto only), true for Gen2+ (Johto + Kanto, etc.) */
  hasMultiRegionBadges: boolean;

  /** Play time display format used by this generation.
   *  'text' = "12h 34m 56s" (Gen1), 'clock' = "12:34:56" (Gen2+) */
  playTimeFormat: 'text' | 'clock';

  /** Returns the URL of the trainer sprite image for this generation/version/gender.
   *  Used by TrainerCard to display the correct trainer portrait.
   *  @param gender - Player gender string ('Male' | 'Female')
   *  @param gameVersion - Specific game version (e.g. 'Red', 'Yellow', 'Crystal')
   */
  getTrainerSpriteUrl(gender: string, gameVersion?: string): string;
}

/**
 * Binary serialization and deserialization operations.
 * Handles reading/writing save files and standalone Pokemon binary formats.
 */
export interface IGenerationBinaryOps {
  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean };
  parseSave(buffer: Uint8Array, filename: string): ParsedSave;
  writeSave(save: ParsedSave): Uint8Array;
  validateSave(buffer: Uint8Array): boolean;

  /** Whether this generation supports standalone Pokemon file parsing/creation
   *  (e.g. .pk1 for Gen 1, .pk2 for Gen 2). Callers should check this flag
   *  before calling parseStandalonePokemon/createStandalonePokemon to avoid
   *  runtime throws. Gen 1 supports it; Gen 2+ may not yet. */
  supportsStandalone: boolean;

  /** Parse a standalone Pokemon binary file into a PokemonStats object.
   *  Throws if supportsStandalone is false — callers must check first. */
  parseStandalonePokemon(buffer: Uint8Array): PokemonStats;

  /** Create a standalone Pokemon binary from a PokemonStats object.
   *  Throws if supportsStandalone is false — callers must check first. */
  createStandalonePokemon(mon: PokemonStats): Uint8Array;

  /** Standalone Pokemon format handler for this generation.
   *  Provides structured access to file extensions, validation, and
   *  serialization. Use this for PKx file operations instead of
   *  calling parseStandalonePokemon/createStandalonePokemon directly
   *  when the full format metadata is needed (e.g., for UI file inputs). */
  readonly standaloneFormat?: IStandalonePokemonFormat;
}

/**
 * Stat calculation operations.
 * Provides generation-specific stat formulas and recalculation logic.
 */
export interface IGenerationStatsOps {
  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number;
  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats;
  getBaseStats(dexId: number): BaseStats | undefined;
}

/**
 * Data access operations for species, moves, items, and types.
 * Provides human-readable names, type assignments, and list enumeration.
 *
 * List enumeration methods (getAllSpeciesNames, getAllMoveNames, etc.) are
 * needed by UI components like Autocomplete dropdowns and Pokédex grids.
 * Without them, components would import generation-specific data modules
 * directly, which defeats the adapter pattern.
 */
export interface IGenerationDataAccess {
  /** Look up a single Pokémon name by National Dex ID. */
  getPokemonName(dexId: number): string;
  /** Look up a single move name by move ID. */
  getMoveName(moveId: number): string;
  /** Look up a single item name by item ID. */
  getItemName(itemId: number): string;
  /** Get type1/type2 for a species by National Dex ID. */
  getTypes(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string };

  // ── List enumeration (for Autocomplete, Pokédex grid, etc.) ──

  /** Full ordered array of species names. Index = National Dex ID.
   *  Index 0 is a placeholder. Length = nationalDexMax + 1. */
  getAllSpeciesNames(): string[];

  /** Full ordered array of move names. Index = move ID.
   *  Index 0 is a placeholder ("-"). */
  getAllMoveNames(): string[];

  /** Base PP for a given move ID. Returns 0 if unknown. */
  getMoveBasePp(moveId: number): number;

  /** Type name for a given move ID (e.g. 'Fire', 'Water'). Returns 'Normal' if unknown. */
  getMoveType(moveId: number): string;

  /** All valid item names for the generation (for autocomplete). */
  getAllItemNames(): string[];
}

/**
 * Text encoding and decoding operations.
 * Handles generation-specific character encoding for Pokemon names, trainer names, etc.
 */
export interface IGenerationTextCodec {
  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string;
  encodeText(text: string, length: number, terminator?: number): Uint8Array;
}

// ============================================================================
// Composite Interface — backward compatible with existing adapters
// ============================================================================

/**
 * Complete interface representing a Generation Adapter.
 * Composed from focused sub-interfaces following the Interface Segregation Principle (ISP).
 *
 * Consumers should depend on the specific sub-interface they need when possible:
 * - Use `IGenerationMetadata` when only reading generation config
 * - Use `IGenerationDataAccess` when only looking up names/types
 * - Use `IGenerationBinaryOps` when only parsing/writing saves
 * - Use `IGenerationStatsOps` when only calculating/recalculating stats
 * - Use `IGenerationTextCodec` when only encoding/decoding text
 *
 * The full `IGenerationAdapter` remains available for components that need
 * the complete adapter functionality (e.g., the AdapterRegistry).
 */
export interface IGenerationAdapter extends
  IGenerationMetadata,
  IGenerationBinaryOps,
  IGenerationStatsOps,
  IGenerationDataAccess,
  IGenerationTextCodec {}

// ============================================================================
// Extension System Interfaces
// ============================================================================

/**
 * Metadata/Context passed to visual panels/section extensions during render.
 * All `any` types have been replaced with proper types.
 */
export interface IExtensionRenderContext {
  generation: number;
  onChange: (field: string, value: unknown) => void;
  theme: GameCartridge | undefined;
  appState?: Record<string, unknown>;
}

/**
 * Interface representing an individual section extension that can inject customized UI
 * fields/behavior into an extensible panel on a per-generation basis.
 */
export interface ISectionExtension {
  id: string;
  panelId: string;

  /**
   * Renders the extension's additional UI fields.
   * @param data The active entity data (e.g. PokemonStats or a move context object)
   * @param context Additional metadata and event dispatcher handlers
   */
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext): React.ReactNode;

  /**
   * Optional event-binding hook called once UI component mounts
   */
  bindEvents?(container: HTMLElement, context: IExtensionRenderContext): void;
}

/**
 * Interface representing a modular, reusable UI panel capable of registering and
 * presenting external generation custom extensions.
 */
export interface IPanelExtension {
  id: string;
  registerExtension(generation: number, extension: ISectionExtension): void;
  getExtensions(generation: number): ISectionExtension[];
}
