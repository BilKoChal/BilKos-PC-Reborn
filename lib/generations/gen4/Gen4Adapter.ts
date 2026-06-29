/**
 * Gen 4 (Diamond/Pearl/Platinum/HeartGold/SoulSilver) Adapter — Phase 3.
 *
 * NDS save format:
 * - 256KB (0x40000) or 512KB (0x80000)
 * - Two blocks: general (first ~0x20000) + storage (~0x20000)
 * - Block footer: security key + checksum + save index
 * - PK4: 136 bytes stored, 236 bytes party
 * - Same LCRNG crypto + PID%24 block shuffle as Gen 3
 * - Gen 4 introduces Physical/Special split for moves
 */
import { IGenerationAdapter, BaseStats, IStandalonePokemonFormat, ITextCodec, InventoryPocket } from '../../interfaces';
import { ParsedSave, PokemonStats, SaveValidationResult } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import { calculateGen3Stat, recalculateGen3Stats } from '../gen3/statCalculator';
import { Gen4StandaloneFormat } from './StandaloneFormat';
import { GEN4_GAMES } from './data/themes';
import { GEN4_POKEMON_NAMES, GEN4_BASE_STATS, getGen4BaseStats } from './data/speciesData';
import { getGen4TypeInfo, GEN4_TYPE_CHART } from './data/types';

const SAVE_SIZE_256K = 0x40000;
const SAVE_SIZE_512K = 0x80000;

export class Gen4Adapter implements IGenerationAdapter {
  generation = 4;
  generationName = "Generation IV";
  supportedVersions = ['Diamond', 'Pearl', 'Platinum', 'HeartGold', 'SoulSilver'];
  versionThemes = GEN4_GAMES;
  partySize = 6;
  boxSlotCount = 30;
  boxCount = 18;
  nationalDexMax = 493;
  hasSplitSpecial = true;
  hasAbilities = true;
  hasNatures = true;
  hasGender = true;
  hasMultiRegionBadges = true; // HGSS has Johto+Kanto
  playTimeFormat: 'text' | 'clock' = 'clock';
  supportedEntitySizes = [
    { size: 136, context: 'stored' as const },
    { size: 236, context: 'party' as const },
  ];
  ivMax = 31; evMax = 255; evTotalCap = 510; statTermLabel: 'DV' | 'IV' = 'IV';
  bagItemCapacity = 50; pcItemCapacity = 1000;
  inventoryLayout: InventoryPocket[] = [
    { id: 'items', label: 'Items', source: 'items', capacity: 50, stackSize: 99 },
    { id: 'key_items', label: 'Key Items', source: 'keyItems', capacity: 50, stackSize: 1, quantityless: true },
    { id: 'balls', label: 'Poké Balls', source: 'balls', capacity: 24, stackSize: 99 },
    { id: 'tms', label: 'TM/HM', source: 'tms', capacity: 100, stackSize: 99 },
    { id: 'berries', label: 'Berries', source: 'pcItems', capacity: 64, stackSize: 99 },
    { id: 'pc', label: 'PC', source: 'pcItems', capacity: 1000, stackSize: 99 },
  ];
  hasHallOfFame = true; hasMailbox = false; supportsBoxNames = true; boxNameMaxLength = 8;
  hasContests = true; hasRibbons = true; hasBallType = true; hasMetData = true;
  hasMarkings = true; hasFatefulEncounter = true; hasFriendshipSystem = true;
  hasPokerus = true; hasEggs = true; hasFormSystem = true; hasNationalDexFlag = true;
  maxMoney = 999999; maxLevel = 100; tmHmPocketLayout: 'consumable' | 'permanent' = 'consumable';
  typeList = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Steel','Dark'];
  typeChart = GEN4_TYPE_CHART;

  private _codec: any = null;
  get codec(): ITextCodec { return this._codec; }
  setCodecRegion(_region: 'international' | 'japanese' | 'korean'): void {}

  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    const size = buffer.length;
    if (size !== SAVE_SIZE_256K && size !== SAVE_SIZE_512K) return { detected: false };
    const lowerFile = filename.toLowerCase();
    if (lowerFile.includes('diamond')) return { detected: true, gameVersion: 'Diamond', ambiguous: false };
    if (lowerFile.includes('pearl')) return { detected: true, gameVersion: 'Pearl', ambiguous: false };
    if (lowerFile.includes('platinum')) return { detected: true, gameVersion: 'Platinum', ambiguous: false };
    if (lowerFile.includes('heartgold') || lowerFile.includes('hg')) return { detected: true, gameVersion: 'HeartGold', ambiguous: false };
    if (lowerFile.includes('soulsilver') || lowerFile.includes('ss')) return { detected: true, gameVersion: 'SoulSilver', ambiguous: false };
    return { detected: false };
  }

  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    const version = this.detectSave(buffer, filename).gameVersion || 'Diamond';
    const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    // NDS save: block 0 at offset 0, block 1 at offset 0x20000
    const block0 = 0;
    // Trainer info is in the general block
    const tid = dv.getUint16(block0, true);
    const sid = dv.getUint16(block0 + 2, true);
    // Phase 3: full NDS parsing deferred — return basic save structure
    const pcBoxes: PokemonStats[][] = [];
    for (let i = 0; i < this.boxCount; i++) pcBoxes.push([]);
    return {
      generation: 4, gameVersion: version, originalFilename: filename, fileSize: buffer.length,
      isValid: true,
      trainer: { name: '???', id: tid.toString().padStart(5, '0'), money: 0, coins: 0, playTime: '00:00:00', badges: 0, gender: 'Male', secretId: sid },
      options: { textSpeed: 'Normal', battleAnimation: 'On', battleStyle: 'Shift', sound: 'Mono' },
      map: { currentMapId: 0, x: 0, y: 0 }, partyCount: 0, party: [],
      items: [], keyItems: [], balls: [], pcItems: [], tms: [],
      pokedexOwned: 0, pokedexSeen: 0, pokedexOwnedFlags: [false], pokedexSeenFlags: [false],
      currentBoxId: 0, currentBoxCount: 0, currentBoxPokemon: [], pcBoxes,
      hallOfFame: [], eventFlags: [], rawData: buffer, genExtension: { generation: 4, gameVersion: version } as ParsedSave['genExtension'],
    } as ParsedSave;
  }

  writeSave(save: ParsedSave): Uint8Array {
    if (save.rawData) return save.rawData;
    throw new Error('Gen 4 write not yet implemented');
  }
  recomputeChecksums(buffer: Uint8Array): Uint8Array { return buffer; }
  validateSave(buffer: Uint8Array): boolean { return buffer.length === SAVE_SIZE_256K || buffer.length === SAVE_SIZE_512K; }
  validateSaveDetailed(buffer: Uint8Array): SaveValidationResult {
    const valid = this.validateSave(buffer);
    return { valid, summary: valid ? 'Valid size' : 'Invalid size', details: [{ label: 'File size', valid, expected: SAVE_SIZE_256K, actual: buffer.length }] };
  }

  supportsStandalone = true;
  readonly standaloneFormat: IStandalonePokemonFormat = new Gen4StandaloneFormat();
  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number { return calculateGen3Stat(base, iv, ev, level, isHp); }
  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats { return recalculateGen3Stats(mon, baseStats); }
  getBaseStats(dexId: number): BaseStats | undefined { return getGen4BaseStats(dexId); }
  getPokemonName(dexId: number): string { return GEN4_POKEMON_NAMES[dexId] || `Species ${dexId}`; }
  getMoveName(moveId: number): string { return `Move ${moveId}`; }
  getItemName(itemId: number): string { return `Item ${itemId}`; }
  getTypes(dexId: number) { return getGen4TypeInfo(dexId); }
  getAllSpeciesNames(): string[] { return GEN4_POKEMON_NAMES; }
  getInternalSpeciesId(dexId: number): number { return dexId; }
  getAllMoveNames(): string[] { return []; }
  getMoveBasePp(_moveId: number): number { return 0; }
  getMoveType(_moveId: number): string { return 'Normal'; }
  getAllItemNames(): string[] { return []; }
  getPokedexEntry(_dexId: number, _version: string): string | undefined { return undefined; }
  getEncounterLocations(_dexId: number, _version: string): string | undefined { return undefined; }
  getEventDistributions(): any[] { return []; }
  getGameEvents(_version?: string): any[] { return []; }
  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    let str = ''; for (let i = 0; i < maxLength && offset + i * 2 < buffer.length; i++) { const b = dv_getU16(buffer, offset + i * 2); if (b === 0xFFFF) break; str += String.fromCharCode(b); } return str;
  }
  encodeText(text: string, length: number, terminator: number = 0xFFFF): Uint8Array {
    const buf = new Uint8Array(length * 2).fill(0xFF); for (let i = 0; i < Math.min(text.length, length - 1); i++) { buf[i * 2] = text.charCodeAt(i) & 0xFF; } return buf;
  }
  detectRegion(): 'international' | 'japanese' | 'korean' { return 'international'; }
  getBoxNames(save: ParsedSave): string[] | undefined { return Array.from({ length: this.boxCount }, (_, i) => `BOX ${i + 1}`); }
  setBoxName(save: ParsedSave, _index: number, _name: string): ParsedSave { return save; }
  getBoxNameMaxLength(_save: ParsedSave): number { return this.boxNameMaxLength; }
}
function dv_getU16(buf: Uint8Array, off: number): number { return (buf[off]! | (buf[off + 1]! << 8)) >>> 0; }
