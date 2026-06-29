/**
 * Gen 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen) Adapter — Phase 2.1.
 *
 * Implements IGenerationAdapter for Gen 3. This adapter:
 * - Detects 128KB Gen 3 saves by section footer structure
 * - Parses trainer info, party, and PC boxes from sectioned save format
 * - Uses the LCRNG-based PK3 crypto from entity.ts for standalone files
 * - Uses the Gen 3 stat formula from statCalculator.ts
 * - Uses PID interpretation helpers from identity.ts
 *
 * Gen 3 save format (from Bulbapedia + PKHeX):
 * - 128KB (0x20000) Flash EEPROM
 * - Two halves (primary 0x0000-0xFFFF, secondary 0x10000-0x1FFFF)
 * - Each half: 14 sections × 4KB (0x1000)
 * - Section footer (last 12 bytes at 0xFF4 within each section):
 *   - 0xFF4: Section ID (u32 LE, 0-13)
 *   - 0xFF8: Security key (u32 LE)
 *   - 0xFFC: Checksum (u16 LE, additive sum of data region)
 *   - 0xFFE: Save index (u16 LE, higher = active half)
 *
 * Section assignments (RS vs FRLG differ slightly):
 * - 0: Trainer info
 * - 1: Team/Items
 * - 2: Game state
 * - 3: Misc data
 * - 4: PC items
 * - 5-13: PC boxes (9 boxes in sections 5-7, remaining in 8-13)
 */
import { IGenerationAdapter, BaseStats, IStandalonePokemonFormat, ITextCodec, InventoryPocket } from '../../interfaces';
import { ParsedSave, PokemonStats, SaveValidationResult } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import { calculateGen3Stat, recalculateGen3Stats } from './statCalculator';
import { Gen3StandaloneFormat } from './StandaloneFormat';
import { GEN3_GAMES } from './data/themes';
import { GEN3_POKEMON_NAMES, GEN3_BASE_STATS, getGen3BaseStats } from './data/speciesData';
import { getGen3TypeInfo, GEN3_TYPE_CHART } from './data/types';
import { getNatureName, getAbilitySlot, getGenderFromPid, extractGen3IVs } from './identity';
import { getTypeId as getCanonicalTypeId } from '../../data/types';

// ─── Gen 3 Save Format Constants ───
const SAVE_SIZE = 0x20000;       // 128KB
const SECTION_SIZE = 0x1000;     // 4KB
const SECTION_COUNT = 14;        // 14 sections per half
const SECTION_DATA_SIZE = 3968;  // 0xF80 — data region per section
const SECTION_FOOTER_OFFSET = 0xFF4; // Start of footer within a section
const HALF_SIZE = SECTION_SIZE * SECTION_COUNT; // 0xE000 — 14 sections

// Security key signatures (from PKHeX)
const SIG_RS = 0x08012025;
const SIG_FRLGE = 0x08012028;

export type Gen3Version = 'Ruby' | 'Sapphire' | 'Emerald' | 'FireRed' | 'LeafGreen';

/** Detect which half of the save is the active one (higher save index). */
function detectActiveHalf(buffer: Uint8Array): { halfStart: number; saveIndex: number } {
  // Check section 0's footer in both halves
  const half0Sec0Footer = SECTION_FOOTER_OFFSET;
  const half1Sec0Footer = HALF_SIZE + SECTION_FOOTER_OFFSET;

  const idx0 = buffer[half0Sec0Footer + 0xC]! | (buffer[half0Sec0Footer + 0xD]! << 8); // save index at 0xFFE
  const idx1 = buffer.length > half1Sec0Footer + 0xD
    ? (buffer[half1Sec0Footer + 0xC]! | (buffer[half1Sec0Footer + 0xD]! << 8))
    : -1;

  // The half with the higher save index is active
  if (idx1 > idx0) {
    return { halfStart: HALF_SIZE, saveIndex: idx1 };
  }
  return { halfStart: 0, saveIndex: idx0 };
}

/** Read a section's ID from its footer. */
function readSectionId(buffer: Uint8Array, halfStart: number, slot: number): number {
  const footerOffset = halfStart + slot * SECTION_SIZE + SECTION_FOOTER_OFFSET;
  return buffer[footerOffset]! | (buffer[footerOffset + 1]! << 8);
}

/** Find a section by its ID within the active half. */
function findSection(buffer: Uint8Array, halfStart: number, sectionId: number): { slot: number; dataOffset: number } | null {
  for (let slot = 0; slot < SECTION_COUNT; slot++) {
    const id = readSectionId(buffer, halfStart, slot);
    if (id === sectionId) {
      return { slot, dataOffset: halfStart + slot * SECTION_SIZE };
    }
  }
  return null;
}

/** Compute the Gen 3 section checksum (additive sum of u16 words over data region). */
function computeSectionChecksum(buffer: Uint8Array, sectionStart: number): number {
  let sum = 0;
  for (let i = 0; i < SECTION_DATA_SIZE; i += 2) {
    sum = (sum + (buffer[sectionStart + i]! | (buffer[sectionStart + i + 1]! << 8))) & 0xFFFF;
  }
  return sum;
}

export class Gen3Adapter implements IGenerationAdapter {
  generation = 3;
  generationName = "Generation III";
  supportedVersions: string[] = ['Ruby', 'Sapphire', 'Emerald', 'FireRed', 'LeafGreen'];
  versionThemes = GEN3_GAMES;
  partySize = 6;
  boxSlotCount = 30;
  boxCount = 14;
  nationalDexMax = 386;
  hasSplitSpecial = true;
  hasAbilities = true;
  hasNatures = true;
  hasGender = true;
  hasMultiRegionBadges = true;
  playTimeFormat: 'text' | 'clock' = 'clock';
  supportedEntitySizes = [
    { size: 80, context: 'stored' as const },
    { size: 100, context: 'party' as const },
  ];

  ivMax = 31;
  evMax = 255;
  evTotalCap = 510;
  statTermLabel: 'DV' | 'IV' = 'IV';

  bagItemCapacity = 30;
  pcItemCapacity = 30;
  inventoryLayout: InventoryPocket[] = [
    { id: 'items', label: 'Items', source: 'items', capacity: 30, stackSize: 99 },
    { id: 'key_items', label: 'Key Items', source: 'keyItems', capacity: 30, stackSize: 1, quantityless: true },
    { id: 'balls', label: 'Poké Balls', source: 'balls', capacity: 16, stackSize: 99 },
    { id: 'tms', label: 'TM/HM', source: 'tms', capacity: 64, stackSize: 99 },
    { id: 'berries', label: 'Berries', source: 'pcItems', capacity: 46, stackSize: 99 },
    { id: 'pc', label: 'PC', source: 'pcItems', capacity: 30, stackSize: 99 },
  ];

  hasHallOfFame = true;
  hasMailbox = false;
  supportsBoxNames = true;
  boxNameMaxLength = 8;
  hasContests = true;
  hasRibbons = true;
  hasBallType = true;
  hasMetData = true;
  hasMarkings = true;
  hasFatefulEncounter = true;
  hasFriendshipSystem = true;
  hasPokerus = true;
  hasEggs = true;
  hasFormSystem = true;
  hasNationalDexFlag = true;
  maxMoney = 999999;
  maxLevel = 100;
  tmHmPocketLayout: 'consumable' | 'permanent' = 'consumable';

  typeList = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
    'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark'
  ];
  typeChart = GEN3_TYPE_CHART;

  // ─── Codec (Phase 2.2: implement Gen 3 text codec) ───
  private _codec: any = null; // Phase 2.2: replace with Gen3TextCodec
  get codec(): ITextCodec { return this._codec; }
  setCodecRegion(region: 'international' | 'japanese' | 'korean'): void { /* Phase 2.2 */ }

  // ─── Save Detection ───
  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    const size = buffer.length;
    // Accept 128KB or 128KB + header
    if (size !== SAVE_SIZE && size !== SAVE_SIZE + 0x1A) {
      return { detected: false };
    }

    const startOffset = size === SAVE_SIZE ? 0 : 0x1A;
    const { halfStart } = detectActiveHalf(buffer.subarray(startOffset));

    // Check section 0 footer for security key
    const sec0 = findSection(buffer.subarray(startOffset), halfStart, 0);
    if (!sec0) return { detected: false };

    const footerOffset = halfStart + sec0.slot * SECTION_SIZE + SECTION_FOOTER_OFFSET;
    const securityKey = buffer[startOffset + footerOffset + 4]! |
                        (buffer[startOffset + footerOffset + 5]! << 8) |
                        (buffer[startOffset + footerOffset + 6]! << 16) |
                        (buffer[startOffset + footerOffset + 7]! << 24);

    const lowerFile = filename.toLowerCase();
    const isRS = securityKey === SIG_RS;
    const isFRLGE = securityKey === SIG_FRLGE;

    if (isRS) {
      // Distinguish Ruby/Sapphire/Emerald by game code in section 0
      // Phase 2.2: read game code from section 0 data
      if (lowerFile.includes('emerald')) return { detected: true, gameVersion: 'Emerald', ambiguous: false };
      if (lowerFile.includes('sapphire')) return { detected: true, gameVersion: 'Sapphire', ambiguous: false };
      return { detected: true, gameVersion: 'Ruby', ambiguous: true };
    }
    if (isFRLGE) {
      if (lowerFile.includes('leaf')) return { detected: true, gameVersion: 'LeafGreen', ambiguous: false };
      return { detected: true, gameVersion: 'FireRed', ambiguous: true };
    }

    // Fallback: filename hints
    if (lowerFile.includes('ruby')) return { detected: true, gameVersion: 'Ruby', ambiguous: false };
    if (lowerFile.includes('sapphire')) return { detected: true, gameVersion: 'Sapphire', ambiguous: false };
    if (lowerFile.includes('emerald')) return { detected: true, gameVersion: 'Emerald', ambiguous: false };
    if (lowerFile.includes('firered') || lowerFile.includes('fire_red')) return { detected: true, gameVersion: 'FireRed', ambiguous: false };
    if (lowerFile.includes('leafgreen') || lowerFile.includes('leaf_green')) return { detected: true, gameVersion: 'LeafGreen', ambiguous: false };

    return { detected: false };
  }

  // ─── Save Parsing ───
  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    const startOffset = buffer.length === SAVE_SIZE + 0x1A ? 0x1A : 0;
    const data = buffer.subarray(startOffset);
    const { halfStart } = detectActiveHalf(data);
    const version = this.detectSave(buffer, filename).gameVersion || 'Ruby';

    // Section 0: Trainer info
    const sec0 = findSection(data, halfStart, 0)!;
    const sec0Start = sec0.dataOffset;
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const tid = dv.getUint16(sec0Start, true);
    const sid = dv.getUint16(sec0Start + 2, true);

    // Trainer name (Gen 3 charmap — Phase 2.2: implement proper codec)
    let trainerName = '';
    for (let i = 0; i < 7; i++) {
      const b = data[sec0Start + 4 + i]!;
      if (b === 0xFF) break;
      trainerName += String.fromCharCode(b);
    }

    const trainerGender: 'Male' | 'Female' = data[sec0Start + 8]! === 1 ? 'Female' : 'Male';

    // Play time: hours(u16 LE) + minutes(u8) + seconds(u8) at offset 0x0E
    const hours = dv.getUint16(sec0Start + 0x0E, true);
    const minutes = data[sec0Start + 0x10]!;
    const seconds = data[sec0Start + 0x11]!;
    const playTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Section 1: Team + Items
    const sec1 = findSection(data, halfStart, 1);
    const party: PokemonStats[] = [];
    let partyCount = 0;
    if (sec1) {
      // Party count is at offset 0x034 in section 1 (RS/FRLGE)
      partyCount = Math.min(data[sec1.dataOffset + 0x034]!, 6);
      // Party Pokémon start at offset 0x038, each is 100 bytes (party format)
      for (let i = 0; i < partyCount; i++) {
        const monOffset = sec1.dataOffset + 0x038 + i * 100;
        if (monOffset + 100 <= data.length) {
          const monBuf = data.slice(monOffset, monOffset + 100);
          // Parse using the standalone format (first 80 bytes = stored, last 20 = party stats)
          try {
            const mon = this.standaloneFormat!.parseFile(monBuf.subarray(0, 80));
            // Add party-only stats from the last 20 bytes
            if (monBuf.length >= 100) {
              const pDv = new DataView(monBuf.buffer, monBuf.byteOffset, monBuf.byteLength);
              mon.level = pDv.getUint8(84);
              mon.status = data[monOffset + 80]! === 0 ? 'OK' : 'SLP'; // simplified
              mon.hp = pDv.getUint16(86, true);
              mon.maxHp = pDv.getUint16(90, true);
              mon.attack = pDv.getUint16(92, true);
              mon.defense = pDv.getUint16(94, true);
              mon.speed = pDv.getUint16(96, true);
              mon.spAtk = pDv.getUint16(98, true);
              mon.spDef = pDv.getUint16(100 - 2, true);
            }
            mon.isParty = true;
            party.push(mon);
          } catch (e) {
            // Skip unparseable party member
          }
        }
      }
    }

    // PC Boxes: sections 5-13
    const pcBoxes: PokemonStats[][] = [];
    // Phase 2.2: parse PC box layout (14 boxes × 30 slots × 80 bytes)
    // For now, initialize empty boxes
    for (let i = 0; i < this.boxCount; i++) {
      pcBoxes.push([]);
    }

    const trainer = {
      name: trainerName,
      id: tid.toString().padStart(5, '0'),
      money: 0,
      coins: 0,
      playTime,
      badges: 0,
      gender: trainerGender,
    };

    const gen3SaveExt = {
      generation: 3,
      gameVersion: version,
      region: 'international' as const,
      secretId: sid,
      securityKey: 0,
    };

    return {
      generation: 3,
      gameVersion: version,
      originalFilename: filename,
      fileSize: buffer.length,
      isValid: this.validateSave(buffer),
      trainer,
      options: { textSpeed: 'Normal', battleAnimation: 'On', battleStyle: 'Shift', sound: 'Mono' },
      map: { currentMapId: 0, x: 0, y: 0 },
      partyCount,
      party,
      items: [],
      keyItems: [],
      balls: [],
      pcItems: [],
      tms: [],
      pokedexOwned: 0,
      pokedexSeen: 0,
      pokedexOwnedFlags: [false],
      pokedexSeenFlags: [false],
      currentBoxId: 0,
      currentBoxCount: 0,
      currentBoxPokemon: [],
      pcBoxes,
      hallOfFame: [],
      eventFlags: [],
      rawData: buffer,
      genExtension: gen3SaveExt as ParsedSave['genExtension'],
    } as ParsedSave;
  }

  // ─── Save Writing ───
  writeSave(save: ParsedSave): Uint8Array {
    // Phase 2.1: For now, return the raw data (read-only support).
    // Full write implementation requires section reconstruction + checksum recomputation.
    if (save.rawData && save.rawData.length > 0) {
      return save.rawData;
    }
    throw new Error('Gen 3 write not yet implemented — save.rawData is required');
  }

  recomputeChecksums(buffer: Uint8Array): Uint8Array {
    // Phase 2.1: Recompute all section checksums in both halves
    const out = new Uint8Array(buffer);
    for (let half = 0; half < 2; half++) {
      const halfStart = half * HALF_SIZE;
      if (halfStart + HALF_SIZE > out.length) break;
      for (let slot = 0; slot < SECTION_COUNT; slot++) {
        const sectionStart = halfStart + slot * SECTION_SIZE;
        const checksum = computeSectionChecksum(out, sectionStart);
        const checksumOffset = sectionStart + SECTION_FOOTER_OFFSET + 8; // 0xFFC
        out[checksumOffset] = checksum & 0xFF;
        out[checksumOffset + 1] = (checksum >> 8) & 0xFF;
      }
    }
    return out;
  }

  validateSave(buffer: Uint8Array): boolean {
    const startOffset = buffer.length === SAVE_SIZE + 0x1A ? 0x1A : 0;
    const data = buffer.subarray(startOffset);
    if (data.length < SAVE_SIZE) return false;
    const { halfStart } = detectActiveHalf(data);
    // Validate all 14 section checksums in the active half
    for (let slot = 0; slot < SECTION_COUNT; slot++) {
      const sectionStart = halfStart + slot * SECTION_SIZE;
      const computed = computeSectionChecksum(data, sectionStart);
      const checksumOffset = sectionStart + SECTION_FOOTER_OFFSET + 8;
      const stored = data[checksumOffset]! | (data[checksumOffset + 1]! << 8);
      if (computed !== stored) return false;
    }
    return true;
  }

  validateSaveDetailed(buffer: Uint8Array): SaveValidationResult {
    const details: SaveValidationResult['details'] = [];
    const startOffset = buffer.length === SAVE_SIZE + 0x1A ? 0x1A : 0;
    const data = buffer.subarray(startOffset);
    if (data.length < SAVE_SIZE) {
      return { valid: false, summary: 'Save too small', details: [{ label: 'File size', valid: false, expected: SAVE_SIZE, actual: data.length }] };
    }
    const { halfStart } = detectActiveHalf(data);
    let allValid = true;
    for (let slot = 0; slot < SECTION_COUNT; slot++) {
      const sectionStart = halfStart + slot * SECTION_SIZE;
      const computed = computeSectionChecksum(data, sectionStart);
      const checksumOffset = sectionStart + SECTION_FOOTER_OFFSET + 8;
      const stored = data[checksumOffset]! | (data[checksumOffset + 1]! << 8);
      const valid = computed === stored;
      if (!valid) allValid = false;
      details.push({ label: `Section ${slot} checksum`, valid, expected: computed, actual: stored });
    }
    return {
      valid: allValid,
      summary: allValid ? 'All section checksums valid' : `${details.filter(d => d.valid).length}/${SECTION_COUNT} section checksums valid`,
      details,
    };
  }

  // ─── Standalone Format ───
  supportsStandalone = true;
  readonly standaloneFormat: IStandalonePokemonFormat = new Gen3StandaloneFormat();

  // ─── Stats ───
  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number {
    return calculateGen3Stat(base, iv, ev, level, isHp);
  }

  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats {
    return recalculateGen3Stats(mon, baseStats);
  }

  // ─── Data Access ───
  getBaseStats(dexId: number): BaseStats | undefined {
    return getGen3BaseStats(dexId);
  }

  getPokemonName(dexId: number): string {
    return GEN3_POKEMON_NAMES[dexId] || `Species ${dexId}`;
  }

  getMoveName(moveId: number): string {
    // Phase 2.4: populate Gen 3 move names
    return `Move ${moveId}`;
  }

  getItemName(itemId: number): string {
    return `Item ${itemId}`;
  }

  getTypes(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string } {
    return getGen3TypeInfo(dexId);
  }

  getAllSpeciesNames(): string[] {
    return GEN3_POKEMON_NAMES;
  }

  getInternalSpeciesId(dexId: number): number {
    return dexId; // Gen 3 uses National Dex ID as internal species ID
  }

  getAllMoveNames(): string[] {
    return []; // Phase 2.4
  }

  getMoveBasePp(moveId: number): number {
    return 0; // Phase 2.4
  }

  getMoveType(moveId: number): string {
    return 'Normal'; // Phase 2.4
  }

  getAllItemNames(): string[] {
    return []; // Phase 2.4
  }

  getPokedexEntry(dexId: number, version: string): string | undefined {
    return undefined; // Phase 2.4
  }

  getEncounterLocations(dexId: number, version: string): string | undefined {
    return undefined; // Phase 2.4
  }

  getEventDistributions(): any[] {
    return []; // Phase 2.4
  }

  getGameEvents(version?: string): any[] {
    return []; // Phase 2.4
  }

  // ─── Text ───
  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    let str = '';
    for (let i = 0; i < maxLength && offset + i < buffer.length; i++) {
      const b = buffer[offset + i]!;
      if (b === 0xFF) break;
      str += String.fromCharCode(b);
    }
    return str;
  }

  encodeText(text: string, length: number, terminator: number = 0xFF): Uint8Array {
    const buf = new Uint8Array(length).fill(terminator);
    for (let i = 0; i < Math.min(text.length, length - 1); i++) {
      buf[i] = text.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  // ─── Region Detection ───
  detectRegion(save: { rawData?: Uint8Array; generation?: number; genExtension?: unknown }): 'international' | 'japanese' | 'korean' {
    // Gen 3 doesn't have region variants like Gen 1/2
    return 'international';
  }

  // ─── Box name support (required by IGenerationAdapter) ───
  getBoxNames(save: ParsedSave): string[] | undefined {
    const count = save.pcBoxes?.length || this.boxCount;
    return Array.from({ length: count }, (_, i) => `BOX ${i + 1}`);
  }

  setBoxName(save: ParsedSave, index: number, name: string): ParsedSave {
    // Phase 2.2: implement box name storage
    return save;
  }

  getBoxNameMaxLength(save: ParsedSave): number {
    return this.boxNameMaxLength;
  }
}
