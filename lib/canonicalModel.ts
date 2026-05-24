import { Item, TrainerInfo, GameOptions, MapData, HallOfFameTeam } from './parser/types';

/**
 * Base abstract class or structure for all game-generation extensions.
 */
export interface IGenExtension {
  generation: number;
}

/**
 * Generation 1 Specific extension fields.
 */
export class Gen1Extension implements IGenExtension {
  generation = 1;
  catchRate = 0;
  special = 0; // Unified special stat
  pikachuFriendship = 0; // Yellow-only Pikachu friendship
  isParty = false;
  raw: Uint8Array = new Uint8Array();
}

/**
 * Generation 2 Specific extension fields.
 */
export class Gen2Extension implements IGenExtension {
  generation = 2;
  heldItemId = 0;
  heldItemName = "None";
  isShiny = false; // DV-based
  shinyLeaf = 0;
  pokerus = 0;
  gender = "Genderless"; // DV-based
  spAtk = 0; // Split special stats
  spDef = 0;
  friendship = 0;
  breedingCompatibility = "Unknown";
  eggCycles = 0;
}

/**
 * Generation 3 Specific extension fields.
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

/**
 * Canonical Pokemon data structure used at runtime.
 * Universal fields representing properties present in ALL generations are placed as
 * first-class fields. Fields unique to a specific generation are placed in genExtension.
 */
export class CanonicalPokemon {
  // Universal fields (present in ALL generations)
  dexId = 0; // National Pokedex number
  speciesName = ""; // e.g. "Pikachu"
  nickname = ""; // e.g. "PIKA"
  isNicknamed = false;
  level = 1;
  exp = 0;
  originalTrainerName = "";
  originalTrainerId = ""; // Kept as string for compatibility/simplicity
  gender = "Genderless";

  // Stats (unified model, populated by adapter)
  hp = 0;
  maxHp = 0;
  attack = 0;
  defense = 0;
  speed = 0;
  special = 0; // Gen 1 unified Special
  spAtk = 0;   // Gen 2+ split SpAtk
  spDef = 0;   // Gen 2+ split SpDef

  // Types
  typeIds: number[] = [];
  typeNames: string[] = [];

  // Moves
  moves: string[] = [];
  moveIds: number[] = [];
  movePp: number[] = [];
  movePpUps: number[] = [];

  // IVs / EVs
  iv: { [key: string]: number } = { hp: 0, attack: 0, defense: 0, speed: 0, special: 0 };
  ev: { [key: string]: number } = { hp: 0, attack: 0, defense: 0, speed: 0, special: 0 };

  // Status and details
  isEgg = false;
  isShiny = false;
  status = "None";

  // Generation specific extension slot
  genExtension: IGenExtension | null = null;
}

/**
 * Save extension for generation-specific save-level information
 */
export interface ISaveExtension {
  generation: number;
}

/**
 * Generation 1 Specific save-level extension
 */
export class Gen1SaveExtension implements ISaveExtension {
  generation = 1;
  daycare: CanonicalPokemon[] = [];
}

/**
 * Canonical Save data structure used at runtime.
 * Holds parsed universal data while preserving generation extension structures
 * for targeted updates.
 */
export class CanonicalSave {
  generation = 1;
  gameVersion = ""; // e.g., "Red", "Blue", "Yellow"
  originalFilename = "";
  isValid = false;

  // Universal metadata
  trainer: TrainerInfo = {
    name: "",
    id: "00000",
    money: 0,
    coins: 0,
    playTime: "00:00",
    badges: 0
  };

  party: CanonicalPokemon[] = [];
  pcBoxes: CanonicalPokemon[][] = [];
  currentBoxId = 0;

  pokedexOwned = 0;
  pokedexSeen = 0;
  pokedexOwnedFlags: boolean[] = [];
  pokedexSeenFlags: boolean[] = [];

  eventFlags: boolean[] = [];
  rawData: Uint8Array = new Uint8Array();

  items: Item[] = [];
  pcItems: Item[] = [];

  // Pockets for Gen 2+ inventory
  keyItems: Item[] = [];
  balls: Item[] = [];
  tms: Item[] = [];

  options?: GameOptions;
  map?: MapData;
  rivalStarterId?: number;
  playerStarterId?: number;
  hallOfFame?: HallOfFameTeam[];

  // Generation specific save extension slot
  genExtension: ISaveExtension | null = null;
}
