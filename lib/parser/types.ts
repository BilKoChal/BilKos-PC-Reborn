import type { IGenExtension } from '../canonicalModel';

export type Generation = 1 | 2;

export type GameVersion = 'Red' | 'Blue' | 'Yellow' | 'Gold' | 'Silver' | 'Crystal';

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

export interface PokemonStats {
  speciesId: number;
  dexId: number;
  speciesName: string;
  nickname: string;
  isNicknamed: boolean;
  
  pid: number;
  form: number;

  originalTrainerName: string;
  originalTrainerId: number;
  secretId: number;
  originalTrainerGender: string;
  
  level: number;
  exp: number;
  friendship: number;
  
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  special: number;
  spAtk: number; // Mirrored for UI compatibility
  spDef: number; // Mirrored for UI compatibility
  
  iv: PokemonIVs;
  ev: PokemonEVs;
  
  moves: string[];
  moveIds: number[];
  movePp: number[];
  movePpUps: number[];
  
  status: string;
  catchRate: number; // Byte 0x07 in Gen 1
  
  type1: number;
  type2: number;
  type1Name: string;
  type2Name: string;

  // UI Helpers
  isParty: boolean;
  isEgg: boolean;
  isShiny: boolean;
  gender: string;
  pokerus: number;
  heldItemId?: number;
  heldItemName?: string;
  genExtension?: IGenExtension | null;
  
  // Raw Data Preservation
  raw: Uint8Array;
  startOffset: number;
  nicknameRaw: Uint8Array;
  otNameRaw: Uint8Array;
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

export interface ParsedSave {
  generation: Generation;
  gameVersion?: GameVersion;
  originalFilename?: string;
  fileSize: number;
  isValid: boolean;
  
  trainer: TrainerInfo;
  options?: GameOptions;
  map?: MapData;
  
  rivalStarterId?: number;
  playerStarterId?: number;

  pokedexOwned: number;
  pokedexSeen: number;
  pokedexOwnedFlags: boolean[];
  pokedexSeenFlags: boolean[];

  partyCount: number;
  party: PokemonStats[];
  daycare?: PokemonStats[]; 
  
  currentBoxId: number;
  currentBoxCount: number;
  currentBoxPokemon: PokemonStats[];
  pcBoxes: PokemonStats[][];

  hallOfFame: HallOfFameTeam[];
  
  eventFlags: boolean[]; // 256 bits (32 bytes) for Missable Objects

  items: Item[]; 
  pcItems: Item[];
  
  // Optional arrays to satisfy generic UI interfaces
  keyItems?: Item[];
  balls?: Item[];
  tms?: Item[];
  
  rawData: Uint8Array;
}

export interface ParserResult {
  success: boolean;
  data?: ParsedSave;
  error?: string;
}
