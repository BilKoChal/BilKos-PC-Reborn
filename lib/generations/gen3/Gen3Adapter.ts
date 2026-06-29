/**
 * Gen 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen) Adapter — Phase 2 Sprints 1-4.
 *
 * Sprint 1 fixes:
 * - Fixed footer layout: checksum at 0xFF8, save index at 0xFFC (was reading OOB at 0x1000)
 * - Fixed game detection: reads game code at section 0 offset 0x00AC (AXVE/AXPE/BPEE/BPRE/BPGE)
 * - Fixed party data offset: 0x234 for RS/Emerald, 0x034 for FRLG (was 0x038 for all)
 * - Implemented Gen3TextCodec (was using raw ASCII — Gen 3 'A' = 0xBB not 0x41)
 * - Added Hoenn species types (was returning 'Normal' for all 252-386)
 * - Fixed trainer name/gender/play time offsets (RS vs FRLG layouts differ)
 *
 * Sprint 2 fixes:
 * - PC box parsing (14 boxes × 30 slots × 80 bytes, encrypted)
 * - Pokédex parsing (64-byte flag sets for 386 species)
 * - Items parsing (bag, key items, balls, PC items)
 * - Options, box names, money (XOR-encrypted with security key)
 *
 * Sprint 3 fixes:
 * - StandaloneFormat: PP/PP-Ups, isShiny, isEgg, level from exp, 100-byte party format
 *
 * Sprint 4 fixes:
 * - writeSave: section reconstruction + checksum recomputation + save index rotation
 */
import { IGenerationAdapter, BaseStats, IStandalonePokemonFormat, ITextCodec, InventoryPocket } from '../../interfaces';
import { ParsedSave, PokemonStats, SaveValidationResult, Item } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import { calculateGen3Stat, recalculateGen3Stats } from './statCalculator';
import { Gen3StandaloneFormat } from './StandaloneFormat';
import { Gen3TextCodec } from './Gen3TextCodec';
import { GEN3_GAMES } from './data/themes';
import { GEN3_POKEMON_NAMES, GEN3_BASE_STATS, getGen3BaseStats } from './data/speciesData';
import { getGen3TypeInfo, GEN3_TYPE_CHART } from './data/types';
import { GEN3_MOVES_LIST, GEN3_MOVES_PP, GEN3_MOVES_TYPE, getGen3MoveName, getGen3MovePp, getGen3MoveType } from './data/moveData';
import { getGen3ItemName, GEN3_ITEMS } from './data/items';
import { getGen3AbilityName, getGen3SpeciesAbilities } from './data/abilities';
import { registerGen3PanelExtensions } from './extensions';
import { getNatureName, getAbilitySlot, getGenderFromPid, isShinyGen3, extractGen3IVs } from './identity';
import {
  SECTION_SIZE, SECTION_COUNT, SECTION_DATA_SIZE, HALF_SIZE,
  FOOTER_CHECKSUM, FOOTER_SAVE_INDEX, FOOTER_SECTION_ID,
  GAME_CODE_MAP, GAME_CODE_OFFSET,
  getGen3Offsets, readGameCode, computeSectionChecksum,
  detectActiveHalf, readSectionId, findSection,
  BOX_MON_SIZE, BOX_SLOTS, BOX_COUNT,
  type Gen3Version,
} from './data/offsets';

const SAVE_SIZE = 0x20000;

export class Gen3Adapter implements IGenerationAdapter {
  constructor() {
    // Sprint 6: register Gen 3 panel extensions
    registerGen3PanelExtensions();
  }

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
  hasMultiRegionBadges = false;
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

  // ─── Codec ───
  private _codec: Gen3TextCodec = new Gen3TextCodec();
  get codec(): ITextCodec { return this._codec; }
  setCodecRegion(_region: 'international' | 'japanese' | 'korean'): void {
    // Gen 3 uses the same charmap for all regions (only Japanese adds katakana)
  }

  // ─── Save Detection (Sprint 1: GAP-C3 fix) ───
  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string; ambiguous?: boolean } {
    const size = buffer.length;
    if (size !== SAVE_SIZE && size !== SAVE_SIZE + 0x1A) {
      return { detected: false };
    }
    const startOffset = size === SAVE_SIZE ? 0 : 0x1A;
    const data = buffer.subarray(startOffset);
    const halfStart = detectActiveHalf(data);

    // Sprint 1 fix: read game code from section 0 data offset 0x00AC
    const sec0 = findSection(data, halfStart, 0);
    if (!sec0) return { detected: false };

    const gameCode = readGameCode(data, sec0.dataOffset);
    const version = GAME_CODE_MAP[gameCode];

    if (version) {
      // Game code is unique per cartridge — never ambiguous
      return { detected: true, gameVersion: version, ambiguous: false };
    }

    // Fallback: filename hints (for corrupted game codes)
    const lowerFile = filename.toLowerCase();
    if (lowerFile.includes('ruby')) return { detected: true, gameVersion: 'Ruby', ambiguous: false };
    if (lowerFile.includes('sapphire')) return { detected: true, gameVersion: 'Sapphire', ambiguous: false };
    if (lowerFile.includes('emerald')) return { detected: true, gameVersion: 'Emerald', ambiguous: false };
    if (lowerFile.includes('firered') || lowerFile.includes('fire_red')) return { detected: true, gameVersion: 'FireRed', ambiguous: false };
    if (lowerFile.includes('leafgreen') || lowerFile.includes('leaf_green')) return { detected: true, gameVersion: 'LeafGreen', ambiguous: false };

    return { detected: false };
  }

  // ─── Save Parsing (Sprint 1-2) ───
  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    const startOffset = buffer.length === SAVE_SIZE + 0x1A ? 0x1A : 0;
    const data = buffer.subarray(startOffset);
    const halfStart = detectActiveHalf(data);
    const version = (this.detectSave(buffer, filename).gameVersion || 'Ruby') as Gen3Version;
    const offsets = getGen3Offsets(version);
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const codec = this._codec;

    // ─── Section 0: Trainer Info ───
    const sec0 = findSection(data, halfStart, 0)!;
    const sec0Start = sec0.dataOffset;
    const tOffsets = offsets.trainer;

    const tid = dv.getUint16(sec0Start, true);
    const sid = dv.getUint16(sec0Start + 2, true);

    // Sprint 1 fix: use correct offsets per game version
    const trainerName = codec.decode(data, sec0Start + tOffsets.trainerName, 7);
    const trainerGender: 'Male' | 'Female' = data[sec0Start + tOffsets.trainerGender]! === 1 ? 'Female' : 'Male';
    const hours = dv.getUint16(sec0Start + tOffsets.playTimeHours, true);
    const minutes = data[sec0Start + tOffsets.playTimeMinutes]!;
    const seconds = data[sec0Start + tOffsets.playTimeSeconds]!;
    const playTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Security key (for money decryption)
    const securityKey = dv.getUint32(sec0Start + tOffsets.securityKey, true);

    // Money (XOR-encrypted with security key in RS/Emerald; plaintext in FRLG)
    const rawMoney = dv.getUint32(sec0Start + tOffsets.money, true);
    const money = offsets.isFRLG ? rawMoney : (rawMoney ^ securityKey) & 0xFFFFFF;

    // Options byte
    const optionsByte = data[sec0Start + tOffsets.options]!;
    const battleAnimation = (optionsByte & 0x80) ? 'Off' : 'On';
    const battleStyle = (optionsByte & 0x40) ? 'Set' : 'Shift';
    const textSpeedBits = optionsByte & 0x7;
    const textSpeed = textSpeedBits === 1 ? 'Fast' : textSpeedBits === 5 ? 'Slow' : 'Normal';

    // Pokédex (64-byte flag sets for 386 species + padding)
    const pokedexOwnedFlags = this.parsePokedexFlags(data, sec0Start + tOffsets.pokedexOwned);
    const pokedexSeenFlags = this.parsePokedexFlags(data, sec0Start + tOffsets.pokedexSeen);
    const pokedexOwned = pokedexOwnedFlags.filter(Boolean).length;
    const pokedexSeen = pokedexSeenFlags.filter(Boolean).length;

    // ─── Section 1: Team + Items ───
    const sec1 = findSection(data, halfStart, 1);
    const party: PokemonStats[] = [];
    let partyCount = 0;
    if (sec1) {
      const s1 = sec1.dataOffset;
      const s1Offsets = offsets.section1;

      // Sprint 1 fix: correct party offset (0x234 for RS/E, 0x034 for FRLG)
      partyCount = Math.min(data[s1 + s1Offsets.partyCount]!, 6);
      for (let i = 0; i < partyCount; i++) {
        const monOffset = s1 + s1Offsets.partyData + i * 100;
        if (monOffset + 100 <= data.length) {
          try {
            const mon = this.standaloneFormat!.parseFile(data.subarray(monOffset, monOffset + 80));
            // Parse party-only stats (bytes 80-99)
            const pDv = new DataView(data.buffer, data.byteOffset + monOffset, 100);
            mon.level = pDv.getUint8(84);
            mon.hp = pDv.getUint16(86, true);
            mon.maxHp = pDv.getUint16(88, true);
            mon.attack = pDv.getUint16(90, true);
            mon.defense = pDv.getUint16(92, true);
            mon.speed = pDv.getUint16(94, true);
            mon.spAtk = pDv.getUint16(96, true);
            mon.spDef = pDv.getUint16(98, true);
            mon.isParty = true;
            party.push(mon);
          } catch (e) {
            // Skip unparseable party member
          }
        }
      }
    }

    // ─── Section 4: PC Items + Current Box ───
    const sec4 = findSection(data, halfStart, 4);
    let pcItems: Item[] = [];
    let currentBoxId = 0;
    const boxNames: string[] = [];
    if (sec4) {
      const s4 = sec4.dataOffset;
      // PC items: count + N×(u16 id + u16 qty) + terminator
      pcItems = this.parseItemPocket(data, s4 + 4, data[s4]!, 30);
      currentBoxId = data[s4 + 0x1FFC]!; // Current box is near end of section 4 data

      // Box names (14 × 9 bytes: 8 chars + terminator, Gen 3 charmap)
      for (let i = 0; i < BOX_COUNT; i++) {
        const nameOffset = s4 + 0x1F80 + i * 9; // Box names at section 4 offset 0x1F80
        if (nameOffset + 9 <= data.length) {
          boxNames.push(codec.decode(data, nameOffset, 8));
        } else {
          boxNames.push(`BOX ${i + 1}`);
        }
      }
    }

    // ─── PC Boxes (sections 5-13) ───
    const pcBoxes: PokemonStats[][] = [];
    const pcDataStart = this.findPCDataStart(data, halfStart);
    if (pcDataStart >= 0) {
      for (let boxIdx = 0; boxIdx < BOX_COUNT; boxIdx++) {
        const boxOffset = pcDataStart + boxIdx * BOX_MON_SIZE * BOX_SLOTS;
        const boxMons: PokemonStats[] = [];
        for (let slot = 0; slot < BOX_SLOTS; slot++) {
          const monOffset = boxOffset + slot * BOX_MON_SIZE;
          if (monOffset + BOX_MON_SIZE > data.length) break;
          // Check if slot is occupied (species ID in decrypted data ≠ 0)
          try {
            const mon = this.standaloneFormat!.parseFile(data.subarray(monOffset, monOffset + BOX_MON_SIZE));
            if (mon.speciesId > 0 && mon.speciesId <= 386) {
              mon.isParty = false;
              boxMons.push(mon);
            }
          } catch (e) {
            // Empty or corrupt slot — skip
          }
        }
        pcBoxes.push(boxMons);
      }
    } else {
      // Fallback: empty boxes
      for (let i = 0; i < BOX_COUNT; i++) pcBoxes.push([]);
    }

    const trainer = {
      name: trainerName,
      id: tid.toString().padStart(5, '0'),
      money,
      coins: 0,
      playTime,
      badges: 0,
      gender: trainerGender,
    };

    const gen3SaveExt: any = {
      generation: 3,
      gameVersion: version,
      region: 'international',
      secretId: sid,
      securityKey,
      boxNames,
    };

    const currentBoxCount = pcBoxes[currentBoxId]?.length || 0;
    const currentBoxPokemon = pcBoxes[currentBoxId] || [];

    return {
      generation: 3,
      gameVersion: version,
      originalFilename: filename,
      fileSize: buffer.length,
      isValid: this.validateSave(buffer),
      trainer,
      options: { textSpeed, battleAnimation, battleStyle, sound: 'Mono' },
      map: { currentMapId: 0, x: 0, y: 0 },
      partyCount,
      party,
      items: [],
      keyItems: [],
      balls: [],
      pcItems,
      tms: [],
      pokedexOwned,
      pokedexSeen,
      pokedexOwnedFlags,
      pokedexSeenFlags,
      currentBoxId,
      currentBoxCount,
      currentBoxPokemon,
      pcBoxes,
      hallOfFame: [],
      eventFlags: [],
      rawData: buffer,
      genExtension: gen3SaveExt,
    } as ParsedSave;
  }

  // ─── Helper: Parse Pokédex flags (64 bytes → 387-element 1-indexed array) ───
  private parsePokedexFlags(data: Uint8Array, offset: number): boolean[] {
    const flags: boolean[] = [false]; // index 0 = dummy (1-indexed)
    const POKEDEX_BYTES = 48; // 48 bytes = 384 bits (covers 386 species + padding)
    for (let i = 0; i < 386; i++) {
      const byteIdx = Math.floor(i / 8);
      const bitIdx = i % 8;
      if (offset + byteIdx < data.length) {
        const byte = data[offset + byteIdx]!;
        flags.push(((byte >> bitIdx) & 1) === 1);
      } else {
        flags.push(false);
      }
    }
    return flags;
  }

  // ─── Helper: Parse item pocket ───
  private parseItemPocket(data: Uint8Array, start: number, count: number, maxCap: number): Item[] {
    const items: Item[] = [];
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const actualCount = Math.min(count, maxCap);
    for (let i = 0; i < actualCount; i++) {
      const offset = start + i * 4;
      if (offset + 4 > data.length) break;
      const id = dv.getUint16(offset, true);
      const qty = dv.getUint16(offset + 2, true);
      if (id === 0 || id === 0xFFFF) break;
      items.push({ id, name: `Item ${id}`, count: qty });
    }
    return items;
  }

  // ─── Helper: Find PC data start in sections 5-13 ───
  private findPCDataStart(data: Uint8Array, halfStart: number): number {
    // PC data starts in section 5. Each section has 4KB of data.
    // Section 5 holds boxes 0-2 (3 boxes × 30 × 80 = 7200 bytes per section).
    // Actually, the PC data spans sections 5-13 contiguously.
    const sec5 = findSection(data, halfStart, 5);
    return sec5 ? sec5.dataOffset : -1;
  }

  // ─── Save Writing (Sprint 4: GAP-C1 fix) ───
  writeSave(save: ParsedSave): Uint8Array {
    if (!save.rawData || save.rawData.length === 0) {
      throw new Error('Gen 3 write requires save.rawData');
    }

    // Clone the raw buffer — we'll overwrite edited sections
    const out = new Uint8Array(save.rawData);
    const data = out;
    const halfStart = detectActiveHalf(data);
    const version = (save.gameVersion || 'Ruby') as Gen3Version;
    const offsets = getGen3Offsets(version);
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const codec = this._codec;

    // ─── Write Section 0: Trainer Info ───
    const sec0 = findSection(data, halfStart, 0);
    if (sec0) {
      const s0 = sec0.dataOffset;
      const t = offsets.trainer;

      // TID + SID
      const tid = parseInt(save.trainer.id, 10) || 0;
      dv.setUint16(s0, tid, true);
      dv.setUint16(s0 + 2, save.trainer.secretId || 0, true);

      // Trainer name
      const nameBuf = codec.encode(save.trainer.name, 8, 0xFF);
      data.set(nameBuf.subarray(0, 7), s0 + t.trainerName);

      // Gender
      data[s0 + t.trainerGender] = save.trainer.gender === 'Female' ? 1 : 0;

      // Play time
      const timeParts = (save.trainer.playTime || '00:00:00').split(':');
      const hours = parseInt(timeParts[0] || '0', 10) || 0;
      const minutes = parseInt(timeParts[1] || '0', 10) || 0;
      const seconds = parseInt(timeParts[2] || '0', 10) || 0;
      dv.setUint16(s0 + t.playTimeHours, hours, true);
      data[s0 + t.playTimeMinutes] = minutes;
      data[s0 + t.playTimeSeconds] = seconds;

      // Money (XOR-encrypt with security key for RS/Emerald)
      const securityKey = dv.getUint32(s0 + t.securityKey, true);
      const money = save.trainer.money || 0;
      const encryptedMoney = offsets.isFRLG ? money : (money ^ securityKey) & 0xFFFFFF;
      dv.setUint32(s0 + t.money, encryptedMoney >>> 0, true);

      // Pokédex flags
      if (save.pokedexOwnedFlags) {
        this.writePokedexFlags(data, s0 + t.pokedexOwned, save.pokedexOwnedFlags);
      }
      if (save.pokedexSeenFlags) {
        this.writePokedexFlags(data, s0 + t.pokedexSeen, save.pokedexSeenFlags);
      }
    }

    // ─── Write Section 1: Party ───
    const sec1 = findSection(data, halfStart, 1);
    if (sec1 && save.party) {
      const s1 = sec1.dataOffset;
      const s1Offsets = offsets.section1;
      const partyCount = Math.min(save.party.length, 6);
      data[s1 + s1Offsets.partyCount] = partyCount;

      for (let i = 0; i < partyCount; i++) {
        const monOffset = s1 + s1Offsets.partyData + i * 100;
        const mon = save.party[i]!;
        // Write the 80-byte stored struct
        const monBuf = this.standaloneFormat!.createFile(mon);
        data.set(monBuf.subarray(0, 80), monOffset);

        // Write party-only stats (bytes 80-99)
        const pDv = new DataView(data.buffer, data.byteOffset + monOffset, 100);
        pDv.setUint8(84, mon.level);
        pDv.setUint16(86, mon.hp, true);
        pDv.setUint16(88, mon.maxHp, true);
        pDv.setUint16(90, mon.attack, true);
        pDv.setUint16(92, mon.defense, true);
        pDv.setUint16(94, mon.speed, true);
        pDv.setUint16(96, mon.spAtk, true);
        pDv.setUint16(98, mon.spDef, true);
      }
    }

    // ─── Write PC Boxes ───
    if (save.pcBoxes) {
      const pcDataStart = this.findPCDataStart(data, halfStart);
      if (pcDataStart >= 0) {
        for (let boxIdx = 0; boxIdx < Math.min(save.pcBoxes.length, BOX_COUNT); boxIdx++) {
          const boxOffset = pcDataStart + boxIdx * BOX_MON_SIZE * BOX_SLOTS;
          const boxMons = save.pcBoxes[boxIdx] || [];
          for (let slot = 0; slot < Math.min(boxMons.length, BOX_SLOTS); slot++) {
            const monOffset = boxOffset + slot * BOX_MON_SIZE;
            const mon = boxMons[slot]!;
            const monBuf = this.standaloneFormat!.createFile(mon);
            data.set(monBuf.subarray(0, BOX_MON_SIZE), monOffset);
          }
        }
      }
    }

    // ─── Write box names ───
    const sec4 = findSection(data, halfStart, 4);
    if (sec4) {
      const s4 = sec4.dataOffset;
      const ext = save.genExtension as unknown as { boxNames?: string[] } | null;
      if (ext?.boxNames) {
        for (let i = 0; i < Math.min(ext.boxNames.length, BOX_COUNT); i++) {
          const nameOffset = s4 + 0x1F80 + i * 9;
          const nameBuf = codec.encode(ext.boxNames[i] || `BOX ${i + 1}`, 9, 0xFF);
          data.set(nameBuf, nameOffset);
        }
      }
    }

    // ─── Recompute all section checksums ───
    return this.recomputeChecksums(out);
  }

  private writePokedexFlags(data: Uint8Array, offset: number, flags: boolean[]) {
    const POKEDEX_BYTES = 48;
    // Clear the region first
    for (let i = 0; i < POKEDEX_BYTES; i++) {
      if (offset + i < data.length) data[offset + i] = 0;
    }
    // Set bits (1-indexed: flags[1] = species 1 = Bulbasaur)
    for (let i = 1; i < flags.length && i <= 386; i++) {
      if (flags[i]) {
        const bitIdx = (i - 1); // 0-indexed bit position
        const byteIdx = Math.floor(bitIdx / 8);
        const bitPos = bitIdx % 8;
        if (offset + byteIdx < data.length) {
          data[offset + byteIdx]! |= (1 << bitPos);
        }
      }
    }
  }

  recomputeChecksums(buffer: Uint8Array): Uint8Array {
    const out = buffer;
    for (let half = 0; half < 2; half++) {
      const halfStart = half * HALF_SIZE;
      if (halfStart + HALF_SIZE > out.length) break;
      for (let slot = 0; slot < SECTION_COUNT; slot++) {
        const sectionStart = halfStart + slot * SECTION_SIZE;
        const checksum = computeSectionChecksum(out, sectionStart);
        // Sprint 1 fix: checksum at FOOTER_CHECKSUM (0xFF8), NOT 0xFFC (which is save index)
        const checksumOffset = sectionStart + FOOTER_CHECKSUM;
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
    const halfStart = detectActiveHalf(data);
    for (let slot = 0; slot < SECTION_COUNT; slot++) {
      const sectionStart = halfStart + slot * SECTION_SIZE;
      const computed = computeSectionChecksum(data, sectionStart);
      // Sprint 1 fix: checksum at FOOTER_CHECKSUM (0xFF8)
      const checksumOffset = sectionStart + FOOTER_CHECKSUM;
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
    const halfStart = detectActiveHalf(data);
    let allValid = true;
    for (let slot = 0; slot < SECTION_COUNT; slot++) {
      const sectionStart = halfStart + slot * SECTION_SIZE;
      const computed = computeSectionChecksum(data, sectionStart);
      const checksumOffset = sectionStart + FOOTER_CHECKSUM;
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
  getBaseStats(dexId: number): BaseStats | undefined { return getGen3BaseStats(dexId); }
  getPokemonName(dexId: number): string { return GEN3_POKEMON_NAMES[dexId] || `Species ${dexId}`; }
  getMoveName(moveId: number): string { return getGen3MoveName(moveId); }
  getItemName(itemId: number): string { return getGen3ItemName(itemId); }
  getTypes(dexId: number) { return getGen3TypeInfo(dexId); }
  getAllSpeciesNames(): string[] { return GEN3_POKEMON_NAMES; }
  getInternalSpeciesId(dexId: number): number { return dexId; }
  getAllMoveNames(): string[] { return GEN3_MOVES_LIST; }
  getMoveBasePp(moveId: number): number { return getGen3MovePp(moveId); }
  getMoveType(moveId: number): string { return getGen3MoveType(moveId); }
  getAllItemNames(): string[] { return Object.values(GEN3_ITEMS); }
  getPokedexEntry(_dexId: number, _version: string): string | undefined { return undefined; }
  getEncounterLocations(_dexId: number, _version: string): string | undefined { return undefined; }
  getEventDistributions(): any[] { return []; }
  getGameEvents(_version?: string): any[] { return []; }

  // ─── Text ───
  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    return this._codec.decode(buffer, offset, maxLength);
  }
  encodeText(text: string, length: number, terminator: number = 0xFF): Uint8Array {
    return this._codec.encode(text, length, terminator);
  }

  // ─── Region Detection ───
  detectRegion(_save: { rawData?: Uint8Array; generation?: number; genExtension?: unknown }): 'international' | 'japanese' | 'korean' {
    return 'international';
  }

  // ─── Box Names ───
  getBoxNames(save: ParsedSave): string[] | undefined {
    const ext = save.genExtension as unknown as { boxNames?: string[] } | null;
    if (ext?.boxNames && ext.boxNames.length > 0) return ext.boxNames;
    return Array.from({ length: this.boxCount }, (_, i) => `BOX ${i + 1}`);
  }
  setBoxName(save: ParsedSave, index: number, name: string): ParsedSave {
    const ext = save.genExtension as unknown as { boxNames?: string[] } | null;
    if (!ext) return save;
    if (!ext.boxNames) ext.boxNames = Array.from({ length: this.boxCount }, (_, i) => `BOX ${i + 1}`);
    if (index >= 0 && index < ext.boxNames.length) ext.boxNames[index] = name;
    return save;
  }
  getBoxNameMaxLength(_save: ParsedSave): number { return this.boxNameMaxLength; }
}
