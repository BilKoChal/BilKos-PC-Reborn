import { IGenerationAdapter, BaseStats, IStandalonePokemonFormat, ITextCodec, InventoryPocket } from '../../interfaces';
import { ParsedSave, PokemonStats, SaveValidationResult } from '../../parser/types';
import { detectGameVersion, validateGen1Checksum, parseGen1Save } from './parser';
import { writeGen1Save, createPk1Binary, recomputeGen1Checksums } from './writer';
import { getGen1Offsets, detectGen1Region } from './data/offsets';
import { calculateGen1Stat, recalculateStats } from '../../utils/statCalculator';
import { getPokemonName, POKEMON_NAMES } from './data/pokemonNames';
import { getMoveName, MOVES_LIST, MOVES_PP, MOVES_TYPE } from './data/moves';
import { getItemName } from './data/items';
import { getPokemonTypes } from './data/pokemonTypes';
import { GEN1_BASE_STATS } from './data/baseStats';
import { getGen1InternalSpeciesId } from './data/offsets';
import { Gen1StandaloneFormat } from './StandaloneFormat';
import { POKEDEX_ENTRIES } from './data/pokedexEntries';
import { POKEMON_LOCATIONS } from './data/pokemonLocations';
import { GEN1_GAMES } from './data/themes';
import { GameBoyTextCodec } from '../../utils/GameBoyTextCodec';
import { GEN1_EVENT_DISTRIBUTIONS } from './data/eventDistributions';
import { GEN1_EVENTS } from './data/events';
import { type GameEventDefinition } from '../../data/gameEvents';
import { type EventPokemonData } from '../../data/eventPokemonTypes';

/**
 * Gen 1 Generation Adapter.
 * Adapts internal Red/Blue/Yellow binaries to conform with multi-gen abstract contracts.
 */
export class Gen1Adapter implements IGenerationAdapter {
  // ── Species ID conversion (PKHeX SpeciesConverter.GetInternal1/GetNational1 pattern) ──
  // National Dex → Gen1 internal id conversion is shared from
  // gen1/data/offsets.ts (getGen1InternalSpeciesId) — see TODO 4.4.

  generation = 1;
  generationName = "Generation I";
  supportedVersions = ['Red', 'Blue', 'Yellow'];
  versionThemes = GEN1_GAMES;
  partySize = 6;
  boxSlotCount = 20;
  boxCount = 12;
  nationalDexMax = 151;
  hasSplitSpecial = false;
  hasAbilities = false;
  hasNatures = false;
  hasGender = false;
  hasMultiRegionBadges = false;
  playTimeFormat: 'text' | 'clock' = 'text';

  // IV/EV metadata
  ivMax = 15;           // Gen1/2: 4-bit DVs (0-15)
  evMax = 65535;        // Gen1/2: StatExp (0-65535, u16)
  evTotalCap = undefined; // Gen1/2: No total EV cap
  statTermLabel: 'DV' | 'IV' = 'DV'; // Gen1/2 uses DV terminology

  // Inventory capacities
  bagItemCapacity = 20;   // Gen1: 20 items in bag
  pcItemCapacity = 50;    // Gen1: 50 items in PC storage

  // TODO 1.8: Gen 1 has a single bag pocket + PC item storage.
  inventoryLayout: InventoryPocket[] = [
    { id: 'items', label: 'Bag', source: 'items', capacity: 20, stackSize: 99 },
    { id: 'pc', label: 'PC', source: 'pcItems', capacity: 50, stackSize: 99 },
  ];

  // Feature capabilities
  hasHallOfFame = true;    // Gen1 has Hall of Fame
  hasMailbox = false;      // Gen1 has no mail system
  supportsBoxNames = false; // Gen1 has no custom box names
  boxNameMaxLength = 0;    // N/A — Gen1 doesn't support box names

  // Extended capabilities (TODO 1.4) — Gen 1 RBY
  hasContests = false;
  hasRibbons = false;
  hasBallType = false;
  hasMetData = false;
  hasMarkings = false;
  hasFatefulEncounter = false;
  hasFriendshipSystem = false; // friendship/happiness introduced in Gen 2
  hasPokerus = false;          // Pokérus introduced in Gen 2
  hasFormSystem = false;       // no alternate forms in Gen 1
  hasNationalDexFlag = false;
  maxMoney = 999999;
  maxLevel = 100;
  tmHmPocketLayout: 'consumable' | 'permanent' = 'consumable';

  getTrainerSpriteUrl(gender: string, gameVersion?: string): string {
    // Yellow uses the anime-style Red sprite; Red/Blue use the classic sprite
    if (gameVersion === 'Yellow') {
      return 'https://play.pokemonshowdown.com/sprites/trainers/red-gen1.png';
    }
    return 'https://play.pokemonshowdown.com/sprites/trainers/red-gen1rb.png';
  }

  // Gen 1 Types only: 15 types
  typeList = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 
    'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon'
  ];

  // Raw Gen 1 15x15 effectiveness matrix [attacker][defender]
  // 0: No Effect, 0.5: Not Very Effective, 1: Neutral, 2: Super Effective
  typeChart = [
    // Normal (0)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1],
    // Fire (1)
    [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5],
    // Water (2)
    [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5],
    // Electric (3)
    [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5],
    // Grass (4)
    [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5],
    // Ice (5)
    [1, 1, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2],
    // Fighting (6)
    [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1],
    // Poison (7)
    [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 2, 0.5, 0.5, 1],
    // Ground (8)
    [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1],
    // Flying (9)
    [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1],
    // Psychic (10)
    [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1],
    // Bug (11)
    [1, 0.5, 1, 1, 2, 1, 0.5, 2, 0.5, 0.5, 2, 1, 1, 0.5, 1],
    // Rock (13)
    [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1],
    // Ghost (14)
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1],
    // Dragon (15)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2]
  ];

  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    const size = buffer.length;
    if (size === 32768 || size === 32768 + 16) {
      // The checksum byte and summed range differ between International and
      // Japanese layouts. detectGen1Region's party-offset heuristic picks one,
      // but to be robust we accept the save if EITHER region's checksum
      // validates (a real JP cart save was failing because only the INT layout
      // was ever checked → "no compatible adapter").
      const intValid = validateGen1Checksum(buffer, getGen1Offsets('international'));
      const jpnValid = validateGen1Checksum(buffer, getGen1Offsets('japanese'));
      if (intValid || jpnValid) {
        const version = detectGameVersion(buffer, filename);
        // Yellow has a unique checksum/layout — unambiguous.
        // Red and Blue share the same format — ambiguous unless filename disambiguates.
        const isAmbiguous = version !== 'Yellow';
        return {
          detected: true,
          gameVersion: version,
          ambiguous: isAmbiguous
        };
      }
    }
    return { detected: false };
  }

  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    const parsed = parseGen1Save(buffer, filename);
    // TODO 1.7: make the adapter-owned codec the single region-correct source of
    // truth for UI sanitization. Previously setCodecRegion was never called, so
    // `adapter.codec` was stuck at 'international' even for Japanese saves.
    this.setCodecRegion(this.detectRegion(parsed));
    return parsed;
  }

  writeSave(save: ParsedSave): Uint8Array {
    return writeGen1Save(save);
  }

  validateSave(buffer: Uint8Array): boolean {
    return validateGen1Checksum(buffer);
  }

  /** TODO 8.5.2: first-class, named checksum step. Derives region from the
   *  buffer and recomputes all Gen 1 checksums (per-box, bank, main). */
  recomputeChecksums(buffer: Uint8Array): Uint8Array {
    const region = detectGen1Region(buffer);
    const offsets = getGen1Offsets(region);
    return recomputeGen1Checksums(buffer, offsets, region === 'japanese');
  }

  validateSaveDetailed(buffer: Uint8Array): SaveValidationResult {
    const region = detectGen1Region(buffer);
    const offsets = getGen1Offsets(region);

    // Main checksum: inverted byte sum from PLAYER_NAME to 0x3522
    let sum = 0;
    for (let i = offsets.PLAYER_NAME; i <= 0x3522; i++) {
      sum += buffer[i]!;
    }
    const mainExpected = (~sum) & 0xFF;
    const mainActual = buffer[offsets.CHECKSUM]!;
    const mainValid = mainExpected === mainActual;

    const details: SaveValidationResult['details'] = [
      {
        label: 'Main Checksum',
        valid: mainValid,
        expected: mainExpected,
        actual: mainActual,
      },
    ];

    const allValid = mainValid;
    return {
      valid: allValid,
      summary: allValid ? 'Checksum valid' : 'Main checksum invalid',
      details,
    };
  }

  supportsStandalone = true;

  /** The PKHeX-compatible file extension for this generation */
  readonly standaloneExtension = '.pk1';

  /** Standalone Pokemon format handler for Gen 1 (.pk1) */
  readonly standaloneFormat: IStandalonePokemonFormat = new Gen1StandaloneFormat();

  parseStandalonePokemon(buffer: Uint8Array): PokemonStats {
    return this.standaloneFormat.parseFile(buffer);
  }

  createStandalonePokemon(mon: PokemonStats): Uint8Array {
    return createPk1Binary(mon, 'international');
  }

  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number {
    return calculateGen1Stat(base, iv, ev, level, isHp);
  }

  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats {
    // D1: Pass hasSplitSpecial=false instead of relying on generation >= 2 check inside
    return recalculateStats(mon, baseStats, 1, false);
  }

  getBaseStats(dexId: number): BaseStats | undefined {
    const raw = GEN1_BASE_STATS[dexId];
    if (!raw) return undefined;
    // Map Gen 1 naming convention (atk/def/spe/spc) to unified BaseStats (attack/defense/speed/spAtk/spDef)
    return {
      hp: raw.hp,
      attack: raw.atk,
      defense: raw.def,
      speed: raw.spe,
      spAtk: raw.spc,
      spDef: raw.spc // Gen 1: SpDef mirrors SpAtk (unified Special)
    };
  }

  getPokemonName(dexId: number): string {
    return getPokemonName(dexId);
  }

  getMoveName(moveId: number): string {
    return getMoveName(moveId);
  }

  getItemName(itemId: number): string {
    return getItemName(itemId);
  }

  getTypes(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string } {
    const types = getPokemonTypes(dexId);
    const type1Name = types[0] || 'Normal';
    const type2Name = types[1] || type1Name;

    const internalMap: Record<string, number> = {
      'Normal': 0, 'Fighting': 1, 'Flying': 2, 'Poison': 3, 'Ground': 4, 'Rock': 5, 
      'Bug': 7, 'Ghost': 8, 
      'Fire': 20, 'Water': 21, 'Grass': 22, 'Electric': 23, 'Psychic': 24, 'Ice': 25, 'Dragon': 26
    };

    return {
      type1: internalMap[type1Name] !== undefined ? internalMap[type1Name] : 0,
      type2: internalMap[type2Name] !== undefined ? internalMap[type2Name] : 0,
      type1Name,
      type2Name
    };
  }

  getAllSpeciesNames(): string[] {
    return POKEMON_NAMES;
  }

  /** Convert National Dex ID → Gen 1 internal species ID.
   *  Gen 1 uses a different internal ordering (Rhydon=1, not Bulbasaur=1).
   *  Following PKHeX's SpeciesConverter.GetInternal1() pattern. */
  getInternalSpeciesId(dexId: number): number {
    return getGen1InternalSpeciesId(dexId);
  }

  getAllMoveNames(): string[] {
    return MOVES_LIST;
  }

  getMoveBasePp(moveId: number): number {
    return MOVES_PP[moveId] || 0;
  }

  getMoveType(moveId: number): string {
    return MOVES_TYPE[moveId] || 'Normal';
  }

  getAllItemNames(): string[] {
    return Array.from({ length: 256 }, (_, i) => {
      const name = getItemName(i);
      return (name !== '-' && !name.startsWith('Item ')) ? name : null;
    }).filter(Boolean) as string[];
  }

  getPokedexEntry(dexId: number, version: string): string | undefined {
    const entry = POKEDEX_ENTRIES[dexId];
    if (!entry) return undefined;
    // Gen 1: Red & Blue share the same entry; Yellow has unique text
    if (version === 'Yellow') return entry.yellow;
    return entry.red_blue;
  }

  getEncounterLocations(dexId: number, version: string): string | undefined {
    const loc = POKEMON_LOCATIONS[dexId];
    if (!loc) return undefined;
    if (version === 'Yellow') return loc.yellow;
    if (version === 'Blue') return loc.blue;
    return loc.red;
  }

  // ── Event distributions & game events (A7) ──

  getEventDistributions(): EventPokemonData[] {
    return GEN1_EVENT_DISTRIBUTIONS;
  }

  getGameEvents(_version?: string): GameEventDefinition[] {
    // Gen 1 has no version-specific events — all events apply to R/B/Y equally
    return GEN1_EVENTS;
  }

  getBoxNames(_save: ParsedSave): string[] | undefined {
    // Gen 1 does not support custom box names
    return undefined;
  }

  setBoxName(save: ParsedSave, _index: number, _name: string): ParsedSave {
    // Gen 1 does not support custom box names — no-op
    return save;
  }

  getBoxNameMaxLength(_save: ParsedSave): number {
    // Gen 1 does not support custom box names
    return 0;
  }

  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    return this._codec.decode(buffer, offset, maxLength);
  }

  encodeText(text: string, length: number, terminator: number = 0x50): Uint8Array {
    return this._codec.encode(text, length, terminator);
  }

  // ── Adapter-owned codec & region detection (A5) ──

  private _codec: GameBoyTextCodec = new GameBoyTextCodec('international');

  /** First-class text codec for Gen 1. Region is set when a save is parsed. */
  get codec(): ITextCodec { return this._codec; }

  /** Set the codec region based on save detection. Called by parser after detection. */
  setCodecRegion(region: 'international' | 'japanese' | 'korean'): void {
    this._codec = new GameBoyTextCodec(region);
  }

  detectRegion(save: { rawData?: Uint8Array; generation?: number; genExtension?: unknown }): 'international' | 'japanese' | 'korean' {
    // B4: Removed redundant `if (save.generation === 1)` guard — this method
    // is on Gen1Adapter, so it's always called for Gen 1 saves. The generation
    // check was a leftover from when this logic lived in the shared textValidator.ts.
    if (!save || !save.rawData) return 'international';
    if (save.rawData.byteLength < 0x3524) return 'international';
    const view = save.rawData;
    const intPartyCount = view[0x2F2C]!;
    const intFirstSpecies = view[0x2F2D]!;
    const jpnPartyCount = view[0x2ED5]!;
    const jpnFirstSpecies = view[0x2ED6]!;
    const intPartyValid = intPartyCount >= 1 && intPartyCount <= 6 && intFirstSpecies !== 0xFF && intFirstSpecies !== 0x00;
    const jpnPartyValid = jpnPartyCount >= 1 && jpnPartyCount <= 6 && jpnFirstSpecies !== 0xFF && jpnFirstSpecies !== 0x00;
    if (jpnPartyValid && !intPartyValid) return 'japanese';
    return 'international';
  }
}
