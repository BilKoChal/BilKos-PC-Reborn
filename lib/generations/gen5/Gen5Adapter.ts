/**
 * Gen 5 (Black/White/Black2/White2) Adapter — Phase 3.
 * NDS save format (same dual-block as Gen 4). 649 species.
 * PK5: 220 bytes (unified stored/party).
 */
import { IGenerationAdapter, BaseStats, IStandalonePokemonFormat, ITextCodec, InventoryPocket } from '../../interfaces';
import { ParsedSave, PokemonStats, SaveValidationResult } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import { calculateGen3Stat, recalculateGen3Stats } from '../gen3/statCalculator';
import { Gen5StandaloneFormat } from './StandaloneFormat';
import { GEN5_GAMES } from './data/themes';
import { GEN5_POKEMON_NAMES, GEN5_BASE_STATS, getGen5BaseStats } from './data/speciesData';
import { getGen5TypeInfo, GEN5_TYPE_CHART } from './data/types';

export class Gen5Adapter implements IGenerationAdapter {
  generation = 5;
  generationName = "Generation V";
  supportedVersions = ['Black', 'White', 'Black2', 'White2'];
  versionThemes = GEN5_GAMES;
  partySize = 6; boxSlotCount = 30; boxCount = 24; nationalDexMax = 649;
  hasSplitSpecial = true; hasAbilities = true; hasNatures = true; hasGender = true;
  hasMultiRegionBadges = false; playTimeFormat: 'text' | 'clock' = 'clock';
  supportedEntitySizes = [{ size: 220, context: 'stored' as const }, { size: 220, context: 'party' as const }];
  ivMax = 31; evMax = 255; evTotalCap = 510; statTermLabel: 'DV' | 'IV' = 'IV';
  bagItemCapacity = 100; pcItemCapacity = 1000;
  inventoryLayout: InventoryPocket[] = [
    { id: 'items', label: 'Items', source: 'items', capacity: 100, stackSize: 99 },
    { id: 'key_items', label: 'Key Items', source: 'keyItems', capacity: 50, stackSize: 1, quantityless: true },
    { id: 'balls', label: 'Poké Balls', source: 'balls', capacity: 24, stackSize: 99 },
    { id: 'tms', label: 'TM/HM', source: 'tms', capacity: 100, stackSize: 99 },
    { id: 'berries', label: 'Berries', source: 'pcItems', capacity: 64, stackSize: 99 },
    { id: 'pc', label: 'PC', source: 'pcItems', capacity: 1000, stackSize: 99 },
  ];
  hasHallOfFame = true; hasMailbox = false; supportsBoxNames = true; boxNameMaxLength = 8;
  hasContests = false; hasRibbons = true; hasBallType = true; hasMetData = true;
  hasMarkings = true; hasFatefulEncounter = true; hasFriendshipSystem = true;
  hasPokerus = true; hasEggs = true; hasFormSystem = true; hasNationalDexFlag = true;
  maxMoney = 9999999; maxLevel = 100; tmHmPocketLayout: 'consumable' | 'permanent' = 'consumable';
  typeList = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Steel','Dark'];
  typeChart = GEN5_TYPE_CHART;
  private _codec: any = null;
  get codec(): ITextCodec { return this._codec; }
  setCodecRegion(_r: 'international' | 'japanese' | 'korean'): void {}

  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    if (buffer.length !== 0x40000) return { detected: false };
    const f = filename.toLowerCase();
    if (f.includes('black2')) return { detected: true, gameVersion: 'Black2', ambiguous: false };
    if (f.includes('white2')) return { detected: true, gameVersion: 'White2', ambiguous: false };
    if (f.includes('black')) return { detected: true, gameVersion: 'Black', ambiguous: false };
    if (f.includes('white')) return { detected: true, gameVersion: 'White', ambiguous: false };
    return { detected: false };
  }
  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    const version = this.detectSave(buffer, filename).gameVersion || 'Black';
    const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const tid = dv.getUint16(0, true); const sid = dv.getUint16(2, true);
    const pcBoxes: PokemonStats[][] = []; for (let i = 0; i < this.boxCount; i++) pcBoxes.push([]);
    return { generation: 5, gameVersion: version, originalFilename: filename, fileSize: buffer.length, isValid: true,
      trainer: { name: '???', id: tid.toString().padStart(5, '0'), money: 0, coins: 0, playTime: '00:00:00', badges: 0, gender: 'Male', secretId: sid },
      options: { textSpeed: 'Normal', battleAnimation: 'On', battleStyle: 'Shift', sound: 'Mono' },
      map: { currentMapId: 0, x: 0, y: 0 }, partyCount: 0, party: [], items: [], keyItems: [], balls: [], pcItems: [], tms: [],
      pokedexOwned: 0, pokedexSeen: 0, pokedexOwnedFlags: [false], pokedexSeenFlags: [false],
      currentBoxId: 0, currentBoxCount: 0, currentBoxPokemon: [], pcBoxes, hallOfFame: [], eventFlags: [],
      rawData: buffer, genExtension: { generation: 5, gameVersion: version } as ParsedSave['genExtension'] } as ParsedSave;
  }
  writeSave(save: ParsedSave): Uint8Array { if (save.rawData) return save.rawData; throw new Error('Gen 5 write not yet implemented'); }
  recomputeChecksums(buffer: Uint8Array): Uint8Array { return buffer; }
  validateSave(buffer: Uint8Array): boolean { return buffer.length === 0x40000; }
  validateSaveDetailed(buffer: Uint8Array): SaveValidationResult { const v = this.validateSave(buffer); return { valid: v, summary: v ? 'Valid' : 'Invalid', details: [{ label: 'Size', valid: v, expected: 0x40000, actual: buffer.length }] }; }
  supportsStandalone = true;
  readonly standaloneFormat: IStandalonePokemonFormat = new Gen5StandaloneFormat();
  calculateStat(b: number, i: number, e: number, l: number, h: boolean): number { return calculateGen3Stat(b, i, e, l, h); }
  recalculateStats(m: PokemonStats, b: BaseStats): PokemonStats { return recalculateGen3Stats(m, b); }
  getBaseStats(d: number): BaseStats | undefined { return getGen5BaseStats(d); }
  getPokemonName(d: number): string { return GEN5_POKEMON_NAMES[d] || `Species ${d}`; }
  getMoveName(m: number): string { return `Move ${m}`; }
  getItemName(i: number): string { return `Item ${i}`; }
  getTypes(d: number) { return getGen5TypeInfo(d); }
  getAllSpeciesNames(): string[] { return GEN5_POKEMON_NAMES; }
  getInternalSpeciesId(d: number): number { return d; }
  getAllMoveNames(): string[] { return []; }
  getMoveBasePp(_m: number): number { return 0; }
  getMoveType(_m: number): string { return 'Normal'; }
  getAllItemNames(): string[] { return []; }
  getPokedexEntry(_d: number, _v: string): string | undefined { return undefined; }
  getEncounterLocations(_d: number, _v: string): string | undefined { return undefined; }
  getEventDistributions(): any[] { return []; }
  getGameEvents(_v?: string): any[] { return []; }
  decodeText(b: Uint8Array, o: number, m: number): string { let s = ''; for (let i = 0; i < m && o+i*2 < b.length; i++) { const v = b[o+i*2]!|(b[o+i*2+1]!<<8); if (v===0xFFFF) break; s+=String.fromCharCode(v); } return s; }
  encodeText(t: string, l: number, _ter: number = 0xFFFF): Uint8Array { const b = new Uint8Array(l*2).fill(0xFF); for (let i = 0; i < Math.min(t.length,l-1); i++) b[i*2] = t.charCodeAt(i)&0xFF; return b; }
  detectRegion(): 'international' | 'japanese' | 'korean' { return 'international'; }
  getBoxNames(_s: ParsedSave): string[] | undefined { return Array.from({length: this.boxCount}, (_, i) => `BOX ${i+1}`); }
  setBoxName(s: ParsedSave, _i: number, _n: string): ParsedSave { return s; }
  getBoxNameMaxLength(_s: ParsedSave): number { return this.boxNameMaxLength; }
}
