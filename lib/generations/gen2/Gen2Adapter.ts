import { IGenerationAdapter, BaseStats, IStandalonePokemonFormat, ITextCodec } from '../../interfaces';
import { ParsedSave, PokemonStats, Gen2SaveExtension } from '../../parser/types';
import { parseGen2Save, calculateGen2Checksum, isGen2Shiny, parseGen2PokemonStruct } from './parser';
import { writeGen2Save, writeGen2PokemonStruct } from './writer';
import { calculateGen2Stat, recalculateGen2Stats } from './statCalculator';
import { 
  GEN2_POKEMON_NAMES, 
  GEN2_MOVES_LIST, 
  getGen2ItemName
} from './data/constants';
import { GEN2_BASE_STATS, getGen2BaseStats } from './data/baseStats';
import { GEN2_MOVES_PP, GEN2_MOVES_TYPE } from './data/moveData';
import { 
  getGen2Offsets, 
  detectGen2Region, 
  type Gen2OffsetsConfig,
  type Gen2Region,
  type Gen2Version
} from './data/offsets';
import { Gen2StandaloneFormat } from './StandaloneFormat';
import { GameBoyTextCodec } from '../../utils/GameBoyTextCodec';
import { getGen2PokemonTypes, GEN2_TYPE_ID_MAP } from './data/types';
import { getPokemonTypes as getGen1PokemonTypes } from '../gen1/data/pokemonTypes';
import './extensions';

export class Gen2Adapter implements IGenerationAdapter {
  generation = 2;
  generationName = "Generation II";
  supportedVersions = ['Gold', 'Silver', 'Crystal'];
  partySize = 6;
  boxSlotCount = 20;
  boxCount = 14;
  nationalDexMax = 251;
  hasSplitSpecial = true;
  hasAbilities = false;
  hasNatures = false;
  hasGender = true;
  hasMultiRegionBadges = true;
  playTimeFormat: 'text' | 'clock' = 'clock';

  // IV/EV metadata
  ivMax = 15;           // Gen1/2: 4-bit DVs (0-15)
  evMax = 65535;        // Gen1/2: StatExp (0-65535, u16)
  evTotalCap = undefined; // Gen1/2: No total EV cap
  statTermLabel: 'DV' | 'IV' = 'DV'; // Gen1/2 uses DV terminology

  getTrainerSpriteUrl(gender: string, gameVersion?: string): string {
    // Gen 2: Ethan (male) or Kris (female)
    if (gender === 'Female') {
      return 'https://play.pokemonshowdown.com/sprites/trainers/kris-gen2.png';
    }
    return 'https://play.pokemonshowdown.com/sprites/trainers/ethan-gen2.png';
  }

  typeList = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 
    'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark'
  ];

  // Gen 2 (GSC) Type Effectiveness Chart — 17×17 matrix
  // Order: Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground,
  //        Flying, Psychic, Bug, Rock, Ghost, Dragon, Steel, Dark
  // Values: 0 = no effect, 0.5 = not very effective, 1 = normal, 2 = super effective
  typeChart = [
    // Atk↓ Def→     Nor Fir Wat Ele Gra Ice Fig Poi Gro Fly Psy Bug Roc Gho Dra Ste Dar
    /* Normal */    [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1, 0.5,   0,   1, 0.5,   1],
    /* Fire */      [1, 0.5, 0.5,   1,   2,   2,   1,   1,   1,   1,   1,   2, 0.5,   1, 0.5,   2,   1],
    /* Water */     [1,   2, 0.5,   1, 0.5,   1,   1,   1,   2,   1,   1,   1,   2,   1, 0.5,   1,   1],
    /* Electric */  [1,   1,   2, 0.5, 0.5,   1,   1,   1,   0,   2,   1,   1,   1,   1, 0.5,   1,   1],
    /* Grass */     [1, 0.5,   2,   1, 0.5,   1,   1, 0.5,   2, 0.5,   1, 0.5,   2,   1, 0.5, 0.5,   1],
    /* Ice */       [1,   1, 0.5,   1,   2, 0.5,   1,   1,   2,   2,   1,   1,   1,   1,   2, 0.5,   1],
    /* Fighting */  [2,   1,   1,   1,   1,   2,   1, 0.5,   1, 0.5, 0.5, 0.5,   2,   0,   1,   2,   2],
    /* Poison */    [1,   1,   1,   1,   2,   1,   1, 0.5, 0.5,   1,   1,   1, 0.5, 0.5,   1,   0,   1],
    /* Ground */    [1,   2,   1,   2, 0.5,   1,   1,   2,   1,   0,   1, 0.5,   2,   1,   1,   2,   1],
    /* Flying */    [1,   1,   1, 0.5,   2,   1,   2,   1,   1,   1,   1,   2, 0.5,   1,   1, 0.5,   1],
    /* Psychic */   [1,   1,   1,   1,   1,   1,   2,   2,   1,   1, 0.5,   1,   1,   1,   1, 0.5,   0],
    /* Bug */       [1, 0.5,   1,   1,   2,   1, 0.5, 0.5,   1, 0.5,   2,   1,   1, 0.5,   1, 0.5,   2],
    /* Rock */      [1,   2,   1,   1,   1,   2, 0.5,   1, 0.5,   2,   1,   2,   1,   1,   1, 0.5,   1],
    /* Ghost */     [0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   1,   2,   1,   1, 0.5],
    /* Dragon */    [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   1],
    /* Steel */     [1, 0.5, 0.5, 0.5,   1,   2,   1,   1,   1,   1,   1,   1,   2,   1,   1, 0.5,   1],
    /* Dark */      [1,   1,   1,   1,   1,   1, 0.5,   1,   1,   1,   2,   1,   1,   2,   1, 0.5, 0.5],
  ];

  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    const size = buffer.length;
    
    // Detect region first
    const region = detectGen2Region(buffer);
    
    // Japanese saves are 64KB, International/Korean are 32KB
    if (region === 'japanese' ? (size < 0x10000) : (size < 0x8000)) {
      return { detected: false };
    }
    
    // Allow 32KB + 16 bytes (some emulators add a header)
    const expectedSize = region === 'japanese' ? 0x10000 : 0x8000;
    if (size !== expectedSize && size !== expectedSize + 16 && !(region === 'international' && size === 0x10000)) {
      return { detected: false };
    }

    // Compute checksums for version detection
    // Use region-appropriate offsets for Crystal detection
    const gsSumComputed = calculateGen2Checksum(buffer, 0x2009, region === 'japanese' ? 0x2C8B : 0x2D68);
    const gsChecksumOffset = region === 'korean' ? 0x2DAB : 0x2D69;
    const gsSumStored = buffer[gsChecksumOffset]! | (buffer[gsChecksumOffset + 1]! << 8);

    const cryEnd = region === 'japanese' ? 0x2AE2 : 0x2B82;
    const crySumComputed = calculateGen2Checksum(buffer, 0x2009, cryEnd);
    // Crystal checksum is always at 0x2D0D for all regions
    const crySumStored = buffer[0x2D0D]! | (buffer[0x2D0E]! << 8);

    const lowerFile = filename.toLowerCase();

    // Checksum validation flags
    const gsValid = gsSumComputed === gsSumStored && gsSumStored !== 0;
    const cryValid = crySumComputed === crySumStored && crySumStored !== 0;

    // Korean saves don't have Crystal
    if (region === 'korean') {
      if (gsValid) {
        return { detected: true, gameVersion: lowerFile.includes('silver') ? 'Silver' : 'Gold', ambiguous: true };
      }
      // Even if checksum fails, if it's the right size for Korean, try
      return { detected: true, gameVersion: 'Gold', ambiguous: true };
    }

    // If neither checksum validates, use filename hints
    if (!gsValid && !cryValid) {
      if (lowerFile.includes('crystal')) {
        return { detected: true, gameVersion: 'Crystal', ambiguous: false };
      } else if (lowerFile.includes('silver')) {
        return { detected: true, gameVersion: 'Silver', ambiguous: true };
      } else if (lowerFile.includes('gold')) {
        return { detected: true, gameVersion: 'Gold', ambiguous: true };
      }
      return { detected: false };
    }

    // Both checksums valid — disambiguate
    if (cryValid && gsValid) {
      if (lowerFile.includes('crystal')) {
        return { detected: true, gameVersion: 'Crystal', ambiguous: false };
      } else if (lowerFile.includes('silver')) {
        return { detected: true, gameVersion: 'Silver', ambiguous: true };
      } else if (lowerFile.includes('gold')) {
        return { detected: true, gameVersion: 'Gold', ambiguous: true };
      }
      return { detected: true, gameVersion: 'Crystal', ambiguous: false };
    }

    // Only Crystal checksum valid
    if (cryValid) {
      return { detected: true, gameVersion: 'Crystal', ambiguous: false };
    }

    // Only GS checksum valid
    if (lowerFile.includes('silver')) {
      return { detected: true, gameVersion: 'Silver', ambiguous: true };
    }
    return { detected: true, gameVersion: 'Gold', ambiguous: true };
  }

  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    return parseGen2Save(buffer, filename);
  }

  writeSave(save: ParsedSave): Uint8Array {
    return writeGen2Save(save);
  }

  validateSave(buffer: Uint8Array): boolean {
    const region = detectGen2Region(buffer);
    
    // Try all checksum variants for the region
    if (region === 'japanese') {
      const gsSum = calculateGen2Checksum(buffer, 0x2009, 0x2C8B);
      const gsStored = buffer[0x2D0D]! | (buffer[0x2D0E]! << 8);
      if (gsSum === gsStored && gsStored !== 0) return true;

      const crySum = calculateGen2Checksum(buffer, 0x2009, 0x2AE2);
      return crySum === gsStored && gsStored !== 0;
    }
    
    if (region === 'korean') {
      const korSum = calculateGen2Checksum(buffer, 0x2009, 0x2DAA);
      const korStored = buffer[0x2DAB]! | (buffer[0x2DAC]! << 8);
      return korSum === korStored && korStored !== 0;
    }

    // International
    const gsSum = calculateGen2Checksum(buffer, 0x2009, 0x2D68);
    const gsStored = buffer[0x2D69]! | (buffer[0x2D6A]! << 8);

    const crySum = calculateGen2Checksum(buffer, 0x2009, 0x2B82);
    const cryStored = buffer[0x2D0D]! | (buffer[0x2D0E]! << 8);

    return (crySum === cryStored && cryStored !== 0) || 
           (gsSum === gsStored && gsStored !== 0);
  }

  supportsStandalone = true;

  /** The PKHeX-compatible file extension for this generation */
  readonly standaloneExtension = '.pk2';

  /** Standalone Pokemon format handler for Gen 2 (.pk2) */
  readonly standaloneFormat: IStandalonePokemonFormat = new Gen2StandaloneFormat();

  /**
   * Parse a standalone .pk2 file into a PokemonStats object.
   *
   * Supports multiple .pk2 formats for maximum compatibility:
   * - 73 bytes: PKHeX PokeList2 International (count + species + terminator + 48-byte party struct + 11-byte OT + 11-byte nick)
   * - 63 bytes: PKHeX PokeList2 Japanese (count + species + terminator + 48-byte party struct + 6-byte OT + 6-byte nick)
   * - 48 bytes: Raw party format (no wrapper, no OT/nickname)
   * - 32 bytes: Raw box format (no wrapper, no OT/nickname)
   */
  parseStandalonePokemon(buffer: Uint8Array): PokemonStats {
    const isJapanese = buffer.length === 63; // SIZE_2JLIST
    const strLen = isJapanese ? 6 : 11;

    let monData: Uint8Array;
    let otRaw: Uint8Array;
    let nickRaw: Uint8Array;

    if (buffer.length === 73 || buffer.length === 63) {
      // PKHeX PokeList2 format (standard .pk2 file)
      // Byte 0: Count (always 1)
      // Byte 1: Species (National Dex ID in Gen 2)
      // Byte 2: Terminator (0xFF)
      // Bytes 3-50: Pokemon data (party format, 48 bytes = SIZE_2PARTY)
      // Bytes 51-61: OT Name (11 bytes for INT, 6 for JPN)
      // Bytes 62-72: Nickname (11 bytes for INT, 6 for JPN)
      const count = buffer[0];
      if (count !== 1) {
        console.warn(`parseStandalonePokemon(.pk2): Unexpected count byte: ${count}. Expected 1.`);
      }
      monData = buffer.slice(3, 3 + 48);
      otRaw = buffer.slice(3 + 48, 3 + 48 + strLen);
      nickRaw = buffer.slice(3 + 48 + strLen, 3 + 48 + strLen * 2);
    } else if (buffer.length === 48) {
      // Raw party format (no wrapper)
      monData = buffer;
      otRaw = new Uint8Array(strLen).fill(0x50);
      nickRaw = new Uint8Array(strLen).fill(0x50);
    } else if (buffer.length === 32) {
      // Raw box format (no wrapper)
      monData = buffer;
      otRaw = new Uint8Array(strLen).fill(0x50);
      nickRaw = new Uint8Array(strLen).fill(0x50);
    } else {
      throw new Error(
        `Invalid .pk2 file size: ${buffer.length}. Expected 73 (INT PokeList2), 63 (JPN PokeList2), 48 (party), or 32 (box).`
      );
    }

    const otName = this._codec.decode(otRaw, 0, strLen);
    const nickName = this._codec.decode(nickRaw, 0, strLen);
    const isParty = monData.length >= 48;

    return parseGen2PokemonStruct(monData, 0, isParty, nickName, otName, nickRaw, otRaw);
  }

  /**
   * Create a PKHeX-compatible .pk2 file from a PokemonStats object.
   *
   * Output format: PokeList2 single-entry (PKHeX standard)
   * - International: 73 bytes (1 count + 1 species + 1 terminator + 48 party struct + 11 OT + 11 nick)
   * - Japanese: 63 bytes (1 count + 1 species + 1 terminator + 48 party struct + 6 OT + 6 nick)
   *
   * The species byte in the PokeList2 header uses the National Dex ID
   * (Gen 2 species IDs directly equal National Dex numbers).
   * Pokemon data is ALWAYS in party format (48 bytes), even for box Pokemon.
   */
  createStandalonePokemon(mon: PokemonStats): Uint8Array {
    // Default to International (11-byte strings). JPN support would require
    // detecting the region from the save context, which is not available here.
    const strLen = 11; // International default
    const SIZE_2PARTY = 48;
    const totalSize = 1 + 1 + 1 + SIZE_2PARTY + strLen + strLen; // = 73 for INT
    const buffer = new Uint8Array(totalSize);

    // Byte 0: Count (always 1)
    buffer[0] = 0x01;

    // Byte 1: Species (National Dex ID in Gen 2)
    buffer[1] = mon.speciesId;

    // Byte 2: Terminator
    buffer[2] = 0xFF;

    // Bytes 3-50: Pokemon data (party format, 48 bytes)
    // Always use party format per PKHeX standard
    writeGen2PokemonStruct(buffer, 3, mon, true);

    // Bytes 51-61: OT Name (11 bytes for INT)
    const otBuf = this._codec.encode(mon.originalTrainerName || '?????', strLen, 0x50);
    buffer.set(otBuf, 3 + SIZE_2PARTY);

    // Bytes 62-72: Nickname (11 bytes for INT)
    const nickBuf = this._codec.encode(mon.nickname || mon.speciesName || '?????', strLen, 0x50);
    buffer.set(nickBuf, 3 + SIZE_2PARTY + strLen);

    return buffer;
  }

  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number {
    return calculateGen2Stat(base, iv, ev, level, isHp);
  }

  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats {
    const result = recalculateGen2Stats(mon, baseStats);
    result.isShiny = isGen2Shiny(result.iv.attack, result.iv.defense, result.iv.speed, result.iv.special);
    return result;
  }

  getBaseStats(dexId: number): BaseStats | undefined {
    const raw = getGen2BaseStats(dexId);
    if (!raw || raw.hp === 0) return undefined;
    return {
      hp: raw.hp,
      attack: raw.atk,
      defense: raw.def,
      speed: raw.spe,
      spAtk: raw.spa,
      spDef: raw.spd
    };
  }

  getPokemonName(dexId: number): string {
    return GEN2_POKEMON_NAMES[dexId] || `Species ${dexId}`;
  }

  getMoveName(moveId: number): string {
    return GEN2_MOVES_LIST[moveId] || "-";
  }

  getItemName(itemId: number): string {
    return getGen2ItemName(itemId);
  }

  getTypes(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string } {
    // Use Gen2-specific type lookup with Gen1 fallback for Kanto species
    const types = getGen2PokemonTypes(dexId, getGen1PokemonTypes);
    const type1Name = types[0] || 'Normal';
    const type2Name = types[1] || type1Name;

    return {
      type1: GEN2_TYPE_ID_MAP[type1Name] ?? 0,
      type2: GEN2_TYPE_ID_MAP[type2Name] ?? 0,
      type1Name,
      type2Name
    };
  }

  getAllSpeciesNames(): string[] {
    return GEN2_POKEMON_NAMES;
  }

  getAllMoveNames(): string[] {
    return GEN2_MOVES_LIST;
  }

  getMoveBasePp(moveId: number): number {
    const pp = GEN2_MOVES_PP[moveId];
    return pp !== undefined ? pp : 0;
  }

  getMoveType(moveId: number): string {
    return GEN2_MOVES_TYPE[moveId] || 'Normal';
  }

  getAllItemNames(): string[] {
    const list: string[] = [];
    // Ordinary items (1-95)
    for (let i = 1; i <= 95; i++) {
      const name = getGen2ItemName(i);
      if (name && !name.startsWith('Item ')) {
        list.push(name);
      }
    }
    // GSC HMs (125-131)
    for (let i = 125; i <= 131; i++) {
      list.push(getGen2ItemName(i));
    }
    // GSC TMs (132-181)
    for (let i = 132; i <= 181; i++) {
      list.push(getGen2ItemName(i));
    }
    return list;
  }

  getPokedexEntry(dexId: number, version: string): string | undefined {
    // Gen 2 Pokédex flavor text data files have not been created yet.
    // When pokedexEntries.ts is added to gen2/data/, this method will
    // look up version-specific entries (Gold/Silver/Crystal each have
    // unique flavor text). For now, return undefined to signal no data.
    void dexId; void version;
    return undefined;
  }

  getEncounterLocations(dexId: number, version: string): string | undefined {
    // Gen 2 encounter location data files have not been created yet.
    // When pokemonLocations.ts is added to gen2/data/, this method will
    // look up version-specific locations (Gold/Silver share many, Crystal
    // differs). For now, return undefined to signal no data.
    void dexId; void version;
    return undefined;
  }

  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    return this._codec.decode(buffer, offset, maxLength);
  }

  encodeText(text: string, length: number, terminator: number = 0x50): Uint8Array {
    return this._codec.encode(text, length, terminator);
  }

  // ── Adapter-owned codec & region detection (A5) ──

  private _codec: GameBoyTextCodec = new GameBoyTextCodec('international');

  /** First-class text codec for Gen 2. Region is set when a save is parsed. */
  get codec(): ITextCodec { return this._codec; }

  /** Set the codec region based on save detection. Called by parser after detection. */
  setCodecRegion(region: 'international' | 'japanese' | 'korean'): void {
    this._codec = new GameBoyTextCodec(region);
  }

  detectRegion(save: { rawData?: Uint8Array; generation?: number; genExtension?: unknown }): 'international' | 'japanese' | 'korean' {
    if (!save) return 'international';
    // Gen 2: check via save extension's region field
    const gen2Ext = save.genExtension as { region?: string } | null;
    if (gen2Ext?.region === 'japanese') return 'japanese';
    if (gen2Ext?.region === 'korean') return 'korean';
    return 'international';
  }

  // ── Phase 2: Convenience Methods for Save-Level Data ──

  /**
   * Get box names from a parsed Gen 2 save.
   * Returns an array of box names (14 for INT/KOR, 9 for JPN).
   * Falls back to default "BOX N" names if the extension is not available.
   */
  getBoxNames(save: ParsedSave): string[] {
    const ext = save.genExtension as Gen2SaveExtension | null;
    if (ext && ext.boxNames && ext.boxNames.length > 0) {
      return ext.boxNames;
    }
    // Fallback: generate default names
    const count = save.pcBoxes?.length || 14;
    return Array.from({ length: count }, (_, i) => `BOX ${i + 1}`);
  }

  /**
   * Get rival name from a parsed Gen 2 save.
   * Returns the rival's name, or empty string if not available.
   */
  getRivalName(save: ParsedSave): string {
    const ext = save.genExtension as Gen2SaveExtension | null;
    if (ext && ext.rivalName) return ext.rivalName;
    return save.trainer.rivalName || '';
  }

  /**
   * Get daycare Pokemon from a parsed Gen 2 save.
   * Returns up to 2 daycare parents.
   */
  getDaycarePokemon(save: ParsedSave): PokemonStats[] {
    return save.daycare || [];
  }

  /**
   * Get the number of event flags in a Gen 2 save.
   * GSC always has 2000 event flags.
   */
  getEventFlagCount(): number {
    return 2000;
  }

  /**
   * Get map/position data from a parsed Gen 2 save.
   */
  getMapData(save: ParsedSave): { currentMapId: number; x: number; y: number } {
    if (save.map) return save.map;
    const ext = save.genExtension as Gen2SaveExtension | null;
    if (ext) return { currentMapId: ext.currentMapId, x: ext.mapX, y: ext.mapY };
    return { currentMapId: 0, x: 0, y: 0 };
  }

  // ── Phase 3: Crystal-Specific Convenience Methods ──

  /**
   * Check whether the save is a Crystal save.
   * Crystal saves have unique features like gender selection, Blue Card,
   * Mystery Gift, GS Ball event, and Move Tutors that Gold/Silver lack.
   */
  isCrystal(save: ParsedSave): boolean {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.gameVersion === 'Crystal';
  }

  /**
   * Get Blue Card points from a Crystal save.
   * Returns -1 for Gold/Silver saves (no Blue Card), or the point count for Crystal.
   * The Blue Card tracks Battle Tower wins and can be exchanged for prizes.
   */
  getBlueCardPoints(save: ParsedSave): number {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.blueCardPoints ?? -1;
  }

  /**
   * Get Mystery Gift status from a Crystal save.
   * Returns { unlocked: number, item: number } or null for Gold/Silver saves.
   * Mystery Gift is an infrared communication feature exclusive to Crystal
   * that allows players to receive items from other players or special events.
   */
  getMysteryGiftStatus(save: ParsedSave): { unlocked: number; item: number } | null {
    const ext = save.genExtension as Gen2SaveExtension | null;
    if (!ext || ext.mysteryGiftUnlocked < 0) return null;
    return { unlocked: ext.mysteryGiftUnlocked, item: ext.mysteryGiftItem };
  }

  /**
   * Check whether the GS Ball event is enabled in a Crystal save.
   * The GS Ball event enables the Ilex Forest Celebi encounter. It was
   * originally available via the Mobile System GB in Japan and later via
   * Virtual Console releases. Returns false for Gold/Silver saves.
   */
  isGSBallEventEnabled(save: ParsedSave): boolean {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.gsBallEventEnabled ?? false;
  }

  /**
   * Get Move Tutor usage flags from a Crystal save.
   * Returns an array of 3 booleans indicating whether each Move Tutor
   * has been used (true = used, false = still available). The three
   * tutors teach Flamethrower, Thunderbolt, and Ice Beam respectively.
   * Returns an empty array for Gold/Silver saves (no Move Tutors).
   */
  getMoveTutorFlags(save: ParsedSave): boolean[] {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.moveTutorFlags ?? [];
  }

  /**
   * Get CaughtData (met location/level/time/OT gender) for a specific Pokemon.
   * Returns null if the Pokemon has no CaughtData (Gold/Silver origin or
   * empty field). The CaughtData is only present in Crystal saves and
   * records where and when a Pokemon was obtained.
   */
  getPokemonCaughtData(mon: PokemonStats): {
    timeOfDay: string;
    metLevel: number;
    otGender: string;
    metLocation: number;
    raw: number;
  } | null {
    const ext = mon.genExtension;
    if (!ext || ext.generation !== 2) return null;
    const gen2Ext = ext as import('../../canonicalModel').Gen2Extension;
    if (gen2Ext.caughtData === 0) return null;
    return {
      timeOfDay: gen2Ext.metTimeOfDay,
      metLevel: gen2Ext.metLevel,
      otGender: gen2Ext.caughtOtGender,
      metLocation: gen2Ext.metLocation,
      raw: gen2Ext.caughtData,
    };
  }

  // ── Phase 4: Advanced Features Convenience Methods ──

  /**
   * Get RTC (Real-Time Clock) flags from a Gen 2 save.
   * Returns the raw RTC flags byte. The RTC is used for time-based
   * events like day/night cycles and berry growth.
   */
  getRtcFlags(save: ParsedSave): number {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.rtcFlags ?? 0;
  }

  /**
   * Get Mom savings amount from a Gen 2 save.
   * Mom can save a percentage of battle earnings for the player.
   * Returns 0 if the extension is not available.
   */
  getMomSavings(save: ParsedSave): number {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.momSavings ?? 0;
  }

  /**
   * Get phone contacts from a Gen 2 save.
   * Returns an array of phone contacts (up to 39) with trainer class,
   * name, and map location info. Returns empty array if not available.
   */
  getPhoneContacts(save: ParsedSave): { trainerClass: number; name: string; mapGroup: number; mapNumber: number }[] {
    const ext = save.genExtension as Gen2SaveExtension | null;
    return ext?.phoneContacts ?? [];
  }

  /**
   * Get Unown Pokedex data from a Gen 2 save.
   * Returns the caught Unown form data (26 entries for A-Z),
   * unlock flags, and first seen form. Returns null if no data.
   */
  getUnownDexData(save: ParsedSave): { caughtForms: number[]; unlockedFlags: number; firstSeen: number } | null {
    const ext = save.genExtension as Gen2SaveExtension | null;
    if (!ext || ext.unownCaughtForms.length === 0) return null;
    return {
      caughtForms: ext.unownCaughtForms,
      unlockedFlags: ext.unownUnlockedFlags,
      firstSeen: ext.unownFirstSeen,
    };
  }
}
