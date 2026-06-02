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

import { logger } from './utils/logger';

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

  // ── Phase 3: Crystal-Specific CaughtData ──
  /** Raw 2-byte CaughtData value from Pokemon struct bytes 0x1D-0x1E (Crystal only, 0 for GS) */
  caughtData: number = 0;
  /** Met location ID (0-127, Crystal only) */
  metLocation: number = 0;
  /** Met level (0-63, Crystal only) */
  metLevel: number = 0;
  /** Time of day when caught: 'Morning' | 'Day' | 'Night' | 'Unknown' (Crystal only) */
  metTimeOfDay: string = 'Unknown';
  /** Original Trainer gender from CaughtData (Crystal only) */
  caughtOtGender: string = 'Male';
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

/**
 * Build a fully-zeroed CanonicalPokemon with neutral defaults, optionally
 * overriding specific fields (TODO 4.3).
 *
 * Both the Gen 1 and Gen 2 parsers need an "empty / placeholder" Pokémon to
 * return when a struct can't be read (out-of-bounds offset). They used to each
 * inline a ~20-field object literal, so adding a new required field to
 * CanonicalPokemon meant editing every parser (and risking drift). Centralizing
 * the default here means the CDM's required-field list lives in exactly one
 * place — adding a future generation or CDM field updates this single factory.
 *
 * @param overrides Partial fields to apply on top of the neutral defaults
 *                  (e.g. nickname, originalTrainerName, isParty, startOffset).
 */
export function createEmptyCanonicalPokemon(overrides: Partial<CanonicalPokemon> = {}): CanonicalPokemon {
  return {
    speciesId: 0,
    dexId: 0,
    speciesName: '???',
    nickname: '???',
    isNicknamed: false,
    pid: 0,
    form: 0,
    originalTrainerName: '???',
    originalTrainerId: 0,
    secretId: 0,
    originalTrainerGender: 'Male',
    level: 0,
    exp: 0,
    friendship: 0,
    hp: 0,
    maxHp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    special: 0,
    spAtk: 0,
    spDef: 0,
    iv: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
    ev: { hp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0 },
    moves: ['-', '-', '-', '-'],
    moveIds: [0, 0, 0, 0],
    movePp: [0, 0, 0, 0],
    movePpUps: [0, 0, 0, 0],
    status: 'OK',
    catchRate: 0,
    type1: 0,
    type2: 0,
    type1Name: 'Normal',
    type2Name: 'Normal',
    isParty: false,
    isEgg: false,
    isShiny: false,
    gender: 'Genderless',
    pokerus: 0,
    genExtension: null,
    raw: new Uint8Array(0),
    startOffset: 0,
    nicknameRaw: new Uint8Array(0),
    otNameRaw: new Uint8Array(0),
    ...overrides,
  };
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
 * Type guard for Generation 1 save-level extension.
 * Use this to narrow `data.genExtension: ISaveExtension | null` to `Gen1SaveExtension`,
 * replacing unsafe `as Gen1SaveExtension` casts and `data.generation === 1` checks
 * when accessing save-level extension fields. Follows PKHeX's `sav is SAV1` pattern.
 */
export function isGen1SaveExtension(ext: ISaveExtension | null | undefined): ext is Gen1SaveExtension {
  return ext !== null && ext !== undefined && ext.generation === 1;
}

/**
 * Type guard for Generation 2 save-level extension.
 * Use this to narrow `data.genExtension: ISaveExtension | null` to `Gen2SaveExtension`,
 * replacing unsafe `as Gen2SaveExtension` / `as any` casts and `data.generation >= 2` /
 * `data.generation === 2` checks when accessing save-level extension fields.
 * Follows PKHeX's `sav is SAV2` / `sav is IBoxDetailName` pattern.
 */
export function isGen2SaveExtension(ext: ISaveExtension | null | undefined): ext is Gen2SaveExtension {
  return ext !== null && ext !== undefined && ext.generation === 2;
}

/**
 * Generation 1 Specific save-level extension.
 */
export class Gen1SaveExtension implements ISaveExtension {
  generation = 1;
  daycare: CanonicalPokemon[] = [];
}

/**
 * Gen 2 Mail structure.
 * Mail items stored in the mailbox and attached to party Pokemon.
 */
export interface Gen2Mail {
  messageLine1: string;
  messageLine2: string;
  authorNationality: number;
  authorName: string;
  authorTid: number;
  appearPokemon: number;
  mailType: number;
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

  /** Kanto region badges (1 byte, 8 bits for 8 badges) */
  kantoBadges: number = 0;

  // ── Phase 2: Rival Name ──
  /** Rival's trainer name, decoded from the save file */
  rivalName: string = '';

  // ── Phase 2: Box Names ──
  /** Names for each PC box (14 for INT/KOR, 9 for JPN) */
  boxNames: string[] = [];

  // ── Phase 2: Daycare Data ──
  /** Daycare parent 1 (null if no Pokemon at daycare) */
  daycareParent1: CanonicalPokemon | null = null;
  /** Daycare parent 2 (null if no second Pokemon — usually Ditto) */
  daycareParent2: CanonicalPokemon | null = null;
  /** Number of steps until an egg is produced (0 = no egg pending) */
  daycareStepsUntilEgg: number = 0;
  /** Daycare breeding status byte */
  daycareBreedingStatus: number = 0;

  // ── Phase 2: Map/Position Data ──
  /** Current map group + number (combined as 16-bit) */
  currentMapId: number = 0;
  /** Player X position on the current map */
  mapX: number = 0;
  /** Player Y position on the current map */
  mapY: number = 0;

  // ── Phase 2: Hall of Fame ──
  /** Byte offset where Hall of Fame data starts in the save (for writer preservation) */
  hallOfFameOffset: number = 0;

  // ── Phase 2.5: Mailbox ──
  /** Mailbox data (null if not yet parsed or not Gen 2) */
  mailbox: { partyMail: (Gen2Mail | null)[]; mailboxMail: (Gen2Mail | null)[]; mailboxCount: number } | null = null;

  // ── Phase 2: Event Flags ──
  /** Byte offset where event flags start (for writer) */
  eventFlagsOffset: number = 0;
  /** Byte offset where event work variables start (for writer) */
  eventWorkOffset: number = 0;

  // ── Phase 3: Crystal-Specific Data ──
  /** Blue Card points (Crystal only, -1 for GS) */
  blueCardPoints: number = -1;
  /** Mystery Gift unlocked status (Crystal only, -1 for GS) */
  mysteryGiftUnlocked: number = -1;
  /** Mystery Gift item ID (Crystal only, 0 for GS) */
  mysteryGiftItem: number = 0;
  /** Whether the GS Ball event is enabled (Crystal only) */
  gsBallEventEnabled: boolean = false;
  /** Move Tutor flags — which move tutors have been used (Crystal only, derived from event flags) */
  moveTutorFlags: boolean[] = [];

  // ── Phase 4: Advanced Features ──
  /** RTC flags byte (latched RTC data) */
  rtcFlags: number = 0;
  /** Mom savings amount (BCD, same format as money) */
  momSavings: number = 0;
  /** Phone contacts — up to 39 entries */
  phoneContacts: { trainerClass: number; name: string; mapGroup: number; mapNumber: number }[] = [];
  /** Unown caught form letters (26 entries for A-Z) */
  unownCaughtForms: number[] = [];
  /** Unown unlock flags byte */
  unownUnlockedFlags: number = 0;
  /** First Unown form seen */
  unownFirstSeen: number = 0;
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

/**
 * Re-derive the active-box cache from the authoritative `pcBoxes` (TODO 2.9).
 *
 * `currentBoxPokemon`/`currentBoxCount` are a *cache* of `pcBoxes[currentBoxId]`.
 * The writers treat `pcBoxes` as the single source of truth (they derive the
 * in-SRAM "current box" copy from it), so if any edit path mutates `pcBoxes`
 * without refreshing this cache (or vice-versa), the UI and the exported file
 * can silently disagree. Several call sites hand-rolled this re-derivation;
 * route them through this one helper so the invariant lives in one place.
 *
 * Returns the same save object (mutated) for convenient chaining.
 */
export function syncCurrentBox<T extends CanonicalSave>(save: T): T {
  const active = save.pcBoxes[save.currentBoxId] ?? [];
  save.currentBoxPokemon = active;
  save.currentBoxCount = active.length;
  return save;
}

/**
 * Dev-only invariant check: the active-box cache must equal `pcBoxes[currentBoxId]`
 * (TODO 2.9). Logs a warning if they have drifted. No-op in production so it never
 * affects users; it exists to catch a desync during development/tests before it
 * becomes a silent data discrepancy on export.
 */
export function assertCurrentBoxInSync(save: CanonicalSave): void {
  const active = save.pcBoxes[save.currentBoxId] ?? [];
  // Reference-equality is the cheap, intended check (syncCurrentBox assigns the
  // same array). Fall back to a length compare for the rebuilt-array case.
  if (save.currentBoxPokemon !== active && save.currentBoxPokemon.length !== active.length) {
    logger.warn(
      `[invariant] currentBoxPokemon is out of sync with pcBoxes[${save.currentBoxId}] ` +
      `(cache=${save.currentBoxPokemon.length}, box=${active.length}). ` +
      `Call syncCurrentBox() after editing pcBoxes.`,
    );
  }
}
