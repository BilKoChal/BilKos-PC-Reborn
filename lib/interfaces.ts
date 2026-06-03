import React from 'react';
import { ParsedSave, PokemonStats } from './parser/types';
import { GameCartridge } from '../uiTypes';

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

  // ── IV/EV metadata (replaces hardcoded clamp values in editor) ──

  /** Maximum IV value for this generation.
   *  Gen1/2: 15 (4-bit DVs), Gen3+: 31 (5-bit IVs). */
  ivMax: number;

  /** Maximum EV value per stat for this generation.
   *  Gen1/2: 65535 (StatExp, u16), Gen3-5: 255, Gen6+: 252. */
  evMax: number;

  /** Maximum total EVs across all stats, or undefined if no total cap.
   *  Gen1/2: undefined (no cap, all stats can be maxed),
   *  Gen3+: 510 (enforced by the game). */
  evTotalCap: number | undefined;

  /** Display label for the IV/DV concept in this generation.
   *  'DV' for Gen1/2 (Determinant Values), 'IV' for Gen3+ (Individual Values). */
  statTermLabel: 'DV' | 'IV';

  // ── Inventory capacities (replaces hardcoded 20/50 in Inventory.tsx) ──

  /** Maximum number of items in the bag (items pocket).
   *  Gen1/2: 20, Gen3 RSE: 20-30 (pocket-based), Gen4+: unlimited (pocket-based).
   *  For pocket-based generations, this is the items-pocket capacity. */
  bagItemCapacity: number;

  /** Maximum number of items in PC item storage.
   *  Gen1/2: 50, Gen3+: 0 (no PC item storage — removed in Gen4+). */
  pcItemCapacity: number;

  // ── Feature capabilities (replaces `generation === N` checks for tab visibility) ──

  /** Whether this generation supports the Hall of Fame record.
   *  true for Gen1/2/3/5/6/7/9, varies for Gen4/8. */
  hasHallOfFame: boolean;

  /** Whether this generation has a mailbox / mail system.
   *  true for Gen2/3/4/5, false for Gen1/6+. */
  hasMailbox: boolean;

  /** Whether this generation supports custom box names.
   *  false for Gen1 (no box names), true for Gen2+.
   *  Replaces `data.generation === 2` / `data.generation >= 2` checks. */
  supportsBoxNames: boolean;

  /** Maximum character length for box names in this generation.
   *  Gen2: 8 (INT/JPN), 16 (KOR); Gen3-5: 8; Gen6-8: 14; Gen9: 16.
   *  Only meaningful when supportsBoxNames is true. */
  boxNameMaxLength: number;

  // ── Extended feature capabilities (TODO 1.4) ──
  // Added so future generations and the UI can branch on a *named capability*
  // rather than `generation === N`. Gen 1/2 values are set on both adapters;
  // the doc comments record the Gen 3+ values a future implementer will use.

  /** Pokémon Contest stats/ribbons system. false Gen1/2/5+, true Gen3-4 (RSE/DPPt). */
  hasContests: boolean;

  /** Ribbon system on individual Pokémon. false Gen1/2, true Gen3+. */
  hasRibbons: boolean;

  /** Poké Ball type is stored per Pokémon (caught-in ball). false Gen1/2, true Gen3+. */
  hasBallType: boolean;

  /** Met/origin data (location, level, game of origin) stored per Pokémon.
   *  false Gen1/2 (no met data), true Gen3+. */
  hasMetData: boolean;

  /** Box "markings" (the small shape symbols) on stored Pokémon.
   *  false Gen1, true Gen2+ (Gen2 has a simpler mark byte; Gen3+ richer). */
  hasMarkings: boolean;

  /** Fateful-encounter / "obedience" flag for event Pokémon. false Gen1/2, true Gen3+. */
  hasFatefulEncounter: boolean;

  /** Friendship/happiness system. false Gen1, true Gen2+. */
  hasFriendshipSystem: boolean;

  /** Pokérus infection status byte. false Gen1, true Gen2+. */
  hasPokerus: boolean;

  /** Alternate forms beyond cosmetic (e.g. Unown letters Gen2; Deoxys/etc Gen3+).
   *  true for Gen2+ (Unown), true Gen3+. false for Gen1. */
  hasFormSystem: boolean;

  /** A separate "caught in National Dex" / dex-completion flag exists.
   *  false Gen1/2, true Gen3+ (National Dex unlock). */
  hasNationalDexFlag: boolean;

  /** Maximum money value this generation can store. Gen1/2: 999999, Gen3+:
   *  999999 (varies by game; explicit so the UI clamps correctly). */
  maxMoney: number;

  /** Maximum Pokémon level. 100 for all mainline generations, but explicit so
   *  no code hardcodes 100. */
  maxLevel: number;

  /** TM/HM pocket layout style. 'consumable' = TMs are normal items that can
   *  stack/be used up (Gen1-4); 'permanent' = TMs are reusable records (Gen5+).
   *  Gen1/2 are 'consumable'. */
  tmHmPocketLayout: 'consumable' | 'permanent';

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

  /** Detailed checksum validation returning per-component results.
   *  Follows PKHeX's `ChecksumsValid` + `ChecksumInfo` pattern.
   *  Unlike `validateSave()` (boolean), this returns expected vs actual
   *  values for each checksum component, enabling the UI to show
   *  a "checksum OK / repaired" indicator with detail popovers. */
  validateSaveDetailed(buffer: Uint8Array): import('./parser/types').SaveValidationResult;

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

  /** Convert a National Dex ID to the internal species ID used by this generation.
   *  Gen 1 uses a different internal ordering (e.g. Rhydon=1, not Bulbasaur=1),
   *  while Gen 2+ species IDs directly equal National Dex numbers.
   *
   *  Following PKHeX's SpeciesConverter.GetInternal1() / GetNational1() pattern,
   *  each adapter knows how to convert between the two ID spaces.
   *
   *  @param dexId - National Dex ID (e.g., 25 for Pikachu)
   *  @returns Internal species ID for this generation
   */
  getInternalSpeciesId(dexId: number): number;

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

  // ── Pokédex & location data (replaces direct gen1/data imports in UI) ──

  /** Get Pokédex flavor text for a species in a specific game version.
   *  Returns the flavor text string, or undefined if not available
   *  (e.g. the species doesn't exist in this generation's dex).
   *  Each adapter internally maps version strings to its generation's entries,
   *  so the UI never hardcodes version names or entry shapes.
   *  @param dexId - National Dex ID (e.g., 25 for Pikachu)
   *  @param version - Game version string (e.g., 'Red', 'Crystal', 'Emerald')
   */
  getPokedexEntry(dexId: number, version: string): string | undefined;

  /** Get encounter/acquisition location text for a species in a specific game version.
   *  Returns a human-readable location string (e.g., "Route 1, Viridian Forest"),
   *  or undefined if the species has no location data for this version.
   *  @param dexId - National Dex ID
   *  @param version - Game version string
   */
  getEncounterLocations(dexId: number, version: string): string | undefined;

  // ── Event distributions & game events (replaces direct gen1/gen2 data imports in UI) ──

  /** Get event/encounter Pokemon distributions for this generation.
   *  Returns the full list of pre-built event Pokemon (gift legendaries,
   *  fossils, eggs, mystery gifts, etc.) available in this generation.
   *  Each distribution includes a byte blob that can be parsed with
   *  parseStandalonePokemon() or standaloneFormat.parseFile().
   *
   *  Replaces direct imports of GEN1_EVENT_DISTRIBUTIONS / GEN2_EVENT_DISTRIBUTIONS
   *  in EncounterDatabase.tsx, following PKHeX's per-generation Encounters pattern.
   */
  getEventDistributions(): import('./data/eventPokemonTypes').EventPokemonData[];

  /** Get named game event definitions for this generation, optionally filtered by version.
   *  Returns event flag entries (named, categorized) that describe in-game events
   *  like legendary encounters, gift Pokemon, story progression, and interactions.
   *
   *  The version parameter enables version-specific filtering within a generation
   *  (e.g., Crystal-only events in Gen 2). If omitted, returns all events for the
   *  generation.
   *
   *  Replaces direct imports of GEN1_EVENTS / GEN2_EVENTS in EventFlagsManager.tsx,
   *  following PKHeX's IEventFlagArray pattern where each save class owns its flag data.
   *
   *  @param version - Optional game version string (e.g., 'Gold', 'Crystal')
   */
  getGameEvents(version?: string): import('./data/gameEvents').GameEventDefinition[];

  /** Get box names from the save data.
   *  Returns an array of box name strings, or undefined if the generation
   *  does not support custom box names (Gen 1).
   *  Follows PKHeX's IBoxDetailNameRead.GetBoxName() pattern.
   *  @param save - The parsed save data
   */
  getBoxNames(save: import('./parser/types').ParsedSave): string[] | undefined;

  /** Set a box name in the save data.
   *  Mutates the save's genExtension to update the box name at the given index.
   *  Returns the updated save data (or the same reference if no change).
   *  Follows PKHeX's IBoxDetailName.SetBoxName() pattern.
   *  @param save - The parsed save data (will be mutated)
   *  @param index - Box index (0-based)
   *  @param name - New box name string
   */
  setBoxName(save: import('./parser/types').ParsedSave, index: number, name: string): import('./parser/types').ParsedSave;

  /** Maximum box name length for this generation, considering the save's region.
   *  Overrides the static `boxNameMaxLength` when region-specific lengths differ
   *  (e.g., Gen 2 KOR: 16 vs INT: 8). Follows PKHeX's per-SAV length constants.
   *  @param save - The parsed save data (used to detect region)
   */
  getBoxNameMaxLength(save: import('./parser/types').ParsedSave): number;
}

/**
 * First-class, adapter-owned text codec.
 * Each generation adapter constructs and owns an ITextCodec instance that
 * encapsulates all character encoding logic for that generation.
 *
 * This replaces the old pattern of shared global functions (textCodec.ts,
 * textDecoder.ts, textValidator.ts) and the inline charmap in
 * BinaryWriter.string(). Gen 1/2 share a GameBoyTextCodec; Gen 3+ will
 * each have their own codec class with completely different charmaps,
 * terminators, and byte widths.
 *
 * The codec is accessed via `adapter.codec` — UI components never import
 * generation-specific encoding functions directly.
 */
export interface ITextCodec {
  /** Decode raw bytes → Unicode string, stopping at the generation's terminator.
   *  @param data   The raw byte buffer
   *  @param offset Byte offset to start reading
   *  @param maxLength Maximum number of character units to read
   */
  decode(data: Uint8Array, offset: number, maxLength: number): string;

  /** Encode a Unicode string → raw bytes.
   *  @param text   The string to encode
   *  @param maxLength Maximum number of character units to write
   *  @param terminator Terminator byte(s) to pad with (default: generation-specific)
   *  @returns Uint8Array of exactly `maxLength * charSize` bytes
   */
  encode(text: string, maxLength: number, terminator?: number): Uint8Array;

  /** Whether a single Unicode character can be represented in this encoding.
   *  Replaces the standalone `isValidPokemonChar()` from textValidator.ts.
   */
  isValidChar(char: string): boolean;

  /** Sanitize a string by removing/normalizing characters that can't be encoded.
   *  Replaces the standalone `sanitizePokemonText()` from textValidator.ts.
   */
  sanitize(text: string): string;

  /** Maximum nickname length in characters for this generation/region.
   *  Gen 1/2 INT: 10, Gen 1/2 JPN: 5, Gen 3+: varies.
   */
  nicknameMaxLength(): number;

  /** Maximum OT (Original Trainer) name length in characters for this generation/region.
   *  Gen 1/2 INT: 10 (7 for box), Gen 1/2 JPN: 5.
   */
  otNameMaxLength(): number;

  /** Size of one character unit in bytes. 1 for Gen 1-3, 2 for Gen 4+. */
  readonly charSize: 1 | 2;

  /** Default terminator value for this encoding.
   *  Gen 1/2: 0x50, Gen 3: 0xFF, Gen 4/5: 0xFFFF, Gen 6+: 0x0000 */
  readonly terminator: number;

  /** Whether this codec instance is configured for Japanese region. */
  readonly isJapanese: boolean;
}

/**
 * Text encoding and decoding operations.
 * Handles generation-specific character encoding for Pokemon names, trainer names, etc.
 *
 * NOTE: The decodeText/encodeText methods on this interface are convenience
 * pass-throughs to `adapter.codec.decode()` / `adapter.codec.encode()`,
 * kept for backward compatibility. New code should prefer `adapter.codec`
 * directly for the extended API (isValidChar, sanitize, nicknameMaxLength, etc.).
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
  IGenerationTextCodec {

  /** First-class text codec owned by this adapter.
   *  Provides the full encoding API: decode, encode, isValidChar, sanitize,
   *  nicknameMaxLength, otNameMaxLength, charSize, terminator, isJapanese.
   *  Use this instead of importing textCodec/textDecoder/textValidator directly.
   *
   *  The codec is constructed with the appropriate region (international/japanese)
   *  based on save detection, so all encode/decode calls are region-correct.
   */
  readonly codec: ITextCodec;

  /** Detect the region of a save file.
   *  Each adapter knows its own region detection logic, eliminating the need
   *  for shared utilities with hardcoded generation branches.
   *
   *  Following PKHeX's ILangDeviantSave.Japanese/Korean pattern: each save
   *  format knows its own region, detected at construction time rather than
   *  via a global utility with per-gen branching.
   *
   *  @param save - A parsed save object (or raw data with generation info)
   *  @returns 'international' | 'japanese' | 'korean'
   */
  detectRegion(save: { rawData?: Uint8Array; generation?: number; genExtension?: unknown }): 'international' | 'japanese' | 'korean';
}

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
