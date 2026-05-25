/**
 * Canonical Data Model (CDM) — The Authoritative Runtime Type System
 *
 * This file defines the unified data structures that the entire application
 * operates on. Every component, parser, writer, and utility reads from and
 * writes to these types.
 *
 * DESIGN RATIONALE: Universal Fields vs genExtension
 *
 * Some fields like `isShiny`, `gender`, `isEgg`, and `special`/`spAtk`/`spDef`
 * appear both as universal first-class fields AND inside generation-specific
 * extensions. This is an intentional design tradeoff:
 *
 * - Universal fields provide O(1) access for UI rendering without type guards
 *   or unsafe casts. Every panel, card, and slot component can read these
 *   directly without knowing which generation it's rendering.
 *
 * - Extension fields preserve generation-specific raw/metadata for binary
 *   serialization round-tripping. For example, Gen2Extension.isShiny stores
 *   the DV-based shiny status as parsed from the raw binary, while the
 *   universal isShiny is the current (possibly user-modified) value.
 *
 * - If we removed the universal fields and forced all access through
 *   genExtension, every UI component would need type guards, increasing
 *   code complexity and the chance of runtime type errors significantly.
 *
 * This tradeoff is documented here so future maintainers understand that
 * the duplication is deliberate and serves the Open-Closed Principle:
 * new generations can add their own extensions without modifying universal
 * UI rendering code, while universal fields provide ergonomic access for
 * the 90% use case.
 *
 * GEN 3+ PATH: When adding a new generation, create a GenNExtension class
 * implementing IGenExtension and register it in the parser. The genExtension
 * slot is the ONLY place where generation-specific fields should live —
 * never add optional fields like `abilityId?` or `natureId?` directly to
 * CanonicalPokemon. This ensures the "zero core modifications per generation"
 * promise of the ROADMAP.
 */

// Leaf types are defined in parser/types.ts to avoid circular dependencies.
// The CDM references them by importing from parser/types.
import type {
  Item,
  TrainerInfo,
  GameOptions,
  MapData,
  HallOfFameTeam,
  PokemonIVs,
  PokemonEVs,
  Generation,
  GameVersion,
} from './parser/types';

// ============================================================================
// Generation Extension Interfaces & Classes
// ============================================================================

/**
 * Base interface for all game-generation Pokemon extensions.
 * Each generation implements this to store fields that only exist in that era.
 */
export interface IGenExtension {
  generation: number;
}

/**
 * Type guard for Generation 1 extension.
 */
export function isGen1Extension(ext: IGenExtension | null | undefined): ext is Gen1Extension {
  return ext !== null && ext !== undefined && ext.generation === 1;
}

/**
 * Type guard for Generation 2 extension.
 */
export function isGen2Extension(ext: IGenExtension | null | undefined): ext is Gen2Extension {
  return ext !== null && ext !== undefined && ext.generation === 2;
}

/**
 * Type guard for Generation 3 extension.
 */
export function isGen3Extension(ext: IGenExtension | null | undefined): ext is Gen3Extension {
  return ext !== null && ext !== undefined && ext.generation === 3;
}

/**
 * Generation 1 Specific extension fields.
 * Stores Gen1-only data that doesn't map to universal fields.
 */
export class Gen1Extension implements IGenExtension {
  generation = 1;
  catchRate = 0;           // Byte 0x07 in Gen 1 Pokemon struct
  special = 0;             // Unified special stat (Gen1 has no SpAtk/SpDef split)
  pikachuFriendship = 0;   // Yellow-only Pikachu friendship
  isParty = false;         // Whether this Pokemon is in the party (affects struct size)
  raw: Uint8Array = new Uint8Array();  // Raw binary struct bytes for round-tripping
}

/**
 * Generation 2 Specific extension fields.
 * Stores Gen2-only data. Note: universal fields like isShiny, gender,
 * friendship, heldItemId/Name, pokerus, spAtk/spDef also exist as flat
 * fields on CanonicalPokemon for O(1) UI access. This extension preserves
 * the DV-based originals and any metadata not in universal fields.
 */
export class Gen2Extension implements IGenExtension {
  generation = 2;
  heldItemId = 0;
  heldItemName = "None";
  isShiny = false;               // DV-based shiny determination
  shinyLeaf = 0;                 // Not used in GSC but reserved
  pokerus = 0;                   // PokeRus status byte
  gender = "Genderless";         // DV-based gender determination
  spAtk = 0;                     // Split Special Attack stat
  spDef = 0;                     // Split Special Defense stat
  friendship = 0;                // Base friendship / happiness
  breedingCompatibility = "Unknown";
  eggCycles = 0;
}

/**
 * Generation 3 Specific extension fields.
 * Stores Gen3-only data: abilities, natures, ribbons, contest stats, etc.
 * This is the key extension that proves the CDM's value — without it,
 * these fields would be bolted onto CanonicalPokemon as optional properties.
 */
export class Gen3Extension implements IGenExtension {
  generation = 3;
  abilityId = 0;
  abilityName = "None";
  natureId = 0;
  natureName = "None";
  characteristic = "";
  ribbons: string[] = [];
  contestStats = { cool: 0, beauty: 0, cute: 0, smart: 0, tough: 0, sheen: 0 };
  secretId = 0;
  pokeblockFlavorPrefs: string[] = [];
}

// ============================================================================
// Canonical Pokemon — The Unified Runtime Pokemon Type
// ============================================================================

/**
 * Canonical Pokemon data structure used at runtime.
 *
 * This is THE type that every parser produces, every writer consumes,
 * and every UI component renders. It replaces the former `PokemonStats`
 * interface (now a type alias pointing here for backward compatibility).
 *
 * Universal fields representing properties present in ALL generations are
 * placed as first-class fields. Fields unique to a specific generation
 * live in `genExtension`, accessible via type guards like `isGen2Extension()`.
 */
export interface CanonicalPokemon {
  // ── Identity ──────────────────────────────────────────────────────────
  speciesId: number;           // Internal species ID (Gen1 differs from dex)
  dexId: number;               // National Pokedex number
  speciesName: string;         // e.g. "Pikachu"
  nickname: string;            // e.g. "PIKA"
  isNicknamed: boolean;

  // ── Personality & Form ────────────────────────────────────────────────
  pid: number;                 // Personality value (0 for Gen1/2, non-zero for Gen3+)
  form: number;                // Form index (0 = default)

  // ── Original Trainer ──────────────────────────────────────────────────
  originalTrainerName: string;
  originalTrainerId: number;   // Numeric OT ID (display as 5-digit string via padStart)
  secretId: number;            // Secret ID (0 for Gen1/2, used from Gen3+)
  originalTrainerGender: string;

  // ── Level & Experience ────────────────────────────────────────────────
  level: number;
  exp: number;
  friendship: number;          // Friendship/happiness (0 for Gen1, used from Gen2+)

  // ── Stats ─────────────────────────────────────────────────────────────
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  special: number;             // Gen 1 unified Special (mirrored to spAtk/spDef)
  spAtk: number;               // Gen 2+ split SpAtk (mirrored from special in Gen1)
  spDef: number;               // Gen 2+ split SpDef (mirrored from special in Gen1)

  // ── IVs / EVs ────────────────────────────────────────────────────────
  iv: PokemonIVs;
  ev: PokemonEVs;

  // ── Moves ─────────────────────────────────────────────────────────────
  moves: string[];
  moveIds: number[];
  movePp: number[];
  movePpUps: number[];

  // ── Status & Type ────────────────────────────────────────────────────
  status: string;
  catchRate: number;           // Byte 0x07 in Gen 1 struct (stored in Gen1Extension too)

  type1: number;               // Internal type ID
  type2: number;               // Internal type ID
  type1Name: string;           // e.g. "Electric"
  type2Name: string;           // e.g. "Flying"

  // ── UI Helpers & Universal Flags ──────────────────────────────────────
  isParty: boolean;            // Whether in party (affects struct size/serialization)
  isEgg: boolean;
  isShiny: boolean;            // Universal shiny flag (DV-calculated in Gen1/2, PID-based in Gen3+)
  gender: string;              // Universal gender flag
  pokerus: number;             // PokeRus status

  // ── Generation-Specific Optional Fields (for Gen2+) ──────────────────
  // NOTE: These exist as universal flat fields for O(1) UI access.
  // The canonical source of truth for these is genExtension.
  heldItemId?: number;         // Gen2+ held item
  heldItemName?: string;       // Gen2+ held item name

  // ── Generation Extension Slot ─────────────────────────────────────────
  // This is THE key architectural feature of the CDM. All generation-
  // specific data that doesn't belong in universal fields lives here.
  // Access via type guards: isGen1Extension(), isGen2Extension(), etc.
  genExtension: IGenExtension | null;

  // ── Raw Data Preservation ─────────────────────────────────────────────
  raw: Uint8Array;             // Raw binary struct bytes for round-trip serialization
  startOffset: number;         // Byte offset in the save file
  nicknameRaw: Uint8Array;     // Raw encoded nickname bytes
  otNameRaw: Uint8Array;       // Raw encoded OT name bytes
}

// ============================================================================
// Save Extension Interfaces & Classes
// ============================================================================

/**
 * Base interface for save-level generation extensions.
 */
export interface ISaveExtension {
  generation: number;
}

/**
 * Generation 1 Specific save-level extension.
 */
export class Gen1SaveExtension implements ISaveExtension {
  generation = 1;
  daycare: CanonicalPokemon[] = [];
}

/**
 * Generation 2 Specific save-level extension.
 * Can be extended with Gen2-only save data (e.g., phone contacts, mom savings).
 */
export class Gen2SaveExtension implements ISaveExtension {
  generation = 2;

  // ── Region & Version ──
  /** Detected save region: 'international', 'japanese', or 'korean' */
  region: string = 'international';
  /** Detected game version: 'Gold', 'Silver', or 'Crystal' */
  gameVersion: string = 'Gold';
}

// ============================================================================
// Canonical Save — The Unified Runtime Save Type
// ============================================================================

/**
 * Canonical Save data structure used at runtime.
 *
 * This is THE type that every parser produces and every writer consumes.
 * It replaces the former `ParsedSave` interface (now a type alias pointing
 * here for backward compatibility).
 */
export interface CanonicalSave {
  // ── Identification ────────────────────────────────────────────────────
  generation: Generation;
  gameVersion?: GameVersion;
  originalFilename?: string;
  fileSize: number;
  isValid: boolean;

  // ── Trainer Info ──────────────────────────────────────────────────────
  trainer: TrainerInfo;
  options?: GameOptions;
  map?: MapData;

  // ── Story Progress ────────────────────────────────────────────────────
  rivalStarterId?: number;
  playerStarterId?: number;

  // ── Pokedex ──────────────────────────────────────────────────────────
  pokedexOwned: number;
  pokedexSeen: number;
  pokedexOwnedFlags: boolean[];
  pokedexSeenFlags: boolean[];

  // ── Party ─────────────────────────────────────────────────────────────
  partyCount: number;
  party: CanonicalPokemon[];
  daycare?: CanonicalPokemon[];

  // ── PC Storage ────────────────────────────────────────────────────────
  currentBoxId: number;
  currentBoxCount: number;
  currentBoxPokemon: CanonicalPokemon[];
  pcBoxes: CanonicalPokemon[][];

  // ── Hall of Fame ──────────────────────────────────────────────────────
  hallOfFame: HallOfFameTeam[];

  // ── Event Flags ───────────────────────────────────────────────────────
  eventFlags: boolean[];

  // ── Inventory ─────────────────────────────────────────────────────────
  items: Item[];
  pcItems: Item[];

  // Optional arrays to satisfy generic UI interfaces (Gen2+ pockets)
  keyItems?: Item[];
  balls?: Item[];
  tms?: Item[];

  // ── Raw Data ──────────────────────────────────────────────────────────
  rawData: Uint8Array;

  // ── Generation Extension Slot ─────────────────────────────────────────
  genExtension: ISaveExtension | null;
}
