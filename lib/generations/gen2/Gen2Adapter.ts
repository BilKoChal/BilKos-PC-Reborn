import { IGenerationAdapter, BaseStats } from '../../interfaces';
import { ParsedSave, PokemonStats } from '../../parser/types';
import { parseGen2Save, calculateGen2Checksum, isGen2Shiny } from './parser';
import { writeGen2Save } from './writer';
import { calculateGen2Stat, recalculateGen2Stats } from './statCalculator';
import { 
  GEN2_POKEMON_NAMES, 
  GEN2_MOVES_LIST, 
  getGen2ItemName, 
  getGen2BaseStats 
} from './data/constants';
import { decodeText } from '../../utils/textDecoder';
import { encodeGameBoyText } from '../../utils/textCodec';
import { getPokemonTypes } from '../gen1/data/pokemonTypes';
import { MOVES_PP } from '../gen1/data/moves';
import './extensions';

// Specific GSC typings incorporating Dark (16) and Steel (15/8) types
const GSC_SPECIES_TYPES: Record<number, string[]> = {
  81: ['Electric', 'Steel'],  // Magnemite
  82: ['Electric', 'Steel'],  // Magneton
  152: ['Grass'], 153: ['Grass'], 154: ['Grass'], 
  155: ['Fire'], 156: ['Fire'], 157: ['Fire'], 
  158: ['Water'], 159: ['Water'], 160: ['Water'], 
  161: ['Normal'], 162: ['Normal'], 
  163: ['Normal', 'Flying'], 164: ['Normal', 'Flying'], 
  165: ['Bug', 'Flying'], 166: ['Bug', 'Flying'], 
  167: ['Bug', 'Poison'], 168: ['Bug', 'Poison'], 
  169: ['Poison', 'Flying'], 
  170: ['Water', 'Electric'], 171: ['Water', 'Electric'], 
  172: ['Electric'], 173: ['Normal'], 174: ['Normal'], 
  175: ['Normal'], 176: ['Normal', 'Flying'], 
  177: ['Psychic', 'Flying'], 178: ['Psychic', 'Flying'], 
  179: ['Electric'], 180: ['Electric'], 181: ['Electric'], 
  182: ['Grass'], 
  183: ['Water'], 184: ['Water'], 
  185: ['Rock'], 
  186: ['Water'], 
  187: ['Grass', 'Flying'], 188: ['Grass', 'Flying'], 189: ['Grass', 'Flying'], 
  190: ['Normal'], 
  191: ['Grass'], 192: ['Grass'], 
  193: ['Bug', 'Flying'], 
  194: ['Water', 'Ground'], 195: ['Water', 'Ground'], 
  196: ['Psychic'], 197: ['Dark'], 
  198: ['Dark', 'Flying'], 
  199: ['Water', 'Psychic'], 
  200: ['Ghost'], 
  201: ['Psychic'], 
  202: ['Psychic'], 
  203: ['Normal', 'Psychic'], 
  204: ['Bug'], 205: ['Bug', 'Steel'], 
  206: ['Normal'], 
  207: ['Ground', 'Flying'], 
  208: ['Steel', 'Ground'], 
  209: ['Normal'], 210: ['Normal'], 
  211: ['Water', 'Poison'], 
  212: ['Bug', 'Steel'], 
  213: ['Bug', 'Rock'], 
  214: ['Bug', 'Fighting'], 
  215: ['Dark', 'Ice'], 
  216: ['Normal'], 217: ['Normal'], 
  218: ['Fire'], 219: ['Fire', 'Rock'], 
  220: ['Ice', 'Ground'], 221: ['Ice', 'Ground'], 
  222: ['Water', 'Rock'], 
  223: ['Water'], 224: ['Water'], 
  225: ['Ice', 'Flying'], 
  226: ['Water', 'Flying'], 
  227: ['Steel', 'Flying'], 
  228: ['Dark', 'Fire'], 229: ['Dark', 'Fire'], 
  230: ['Water', 'Dragon'], 
  231: ['Ground'], 232: ['Ground'], 
  233: ['Normal'], 
  234: ['Normal'], 
  235: ['Normal'], 
  236: ['Fighting'], 237: ['Fighting'], 
  238: ['Ice', 'Psychic'], 
  239: ['Electric'], 
  240: ['Fire'], 
  241: ['Normal'], 
  242: ['Normal'], 
  243: ['Electric'], 244: ['Fire'], 245: ['Water'], 
  246: ['Rock', 'Ground'], 247: ['Rock', 'Ground'], 248: ['Rock', 'Dark'], 
  249: ['Psychic', 'Flying'], 
  250: ['Fire', 'Flying'], 
  251: ['Grass', 'Psychic']
};

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

  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string } {
    const size = buffer.length;
    // Standard GSC save file is 32768 bytes
    if (size === 32768 || size === 32768 + 16 || size === 65536) {
      // Compute GSC Checksums to see if they match GS or Crystal ranges
      const gsSumComputed = calculateGen2Checksum(buffer, 0x2009, 0x2D68);
      const gsSumStored = buffer[0x2D69] | (buffer[0x2D6A] << 8);

      const crySumComputed = calculateGen2Checksum(buffer, 0x2009, 0x2B82);
      const crySumStored = buffer[0x2D0D] | (buffer[0x2D0E] << 8);

      const lowerFile = filename.toLowerCase();

      // Checksum validation flags — at least one checksum must be valid to accept the save
      const gsValid = gsSumComputed === gsSumStored && gsSumStored !== 0;
      const cryValid = crySumComputed === crySumStored && crySumStored !== 0;

      // If neither checksum validates, use lenient fallback based on filename hints
      if (!gsValid && !cryValid) {
        if (lowerFile.includes('crystal')) {
          return { detected: true, gameVersion: 'Crystal' };
        } else if (lowerFile.includes('silver')) {
          return { detected: true, gameVersion: 'Silver' };
        } else if (lowerFile.includes('gold')) {
          return { detected: true, gameVersion: 'Gold' };
        }
        return { detected: false };
      }

      // Both checksums valid — determine game version from filename hints + checksums
      if (cryValid && gsValid) {
        // Both checksums match. Use filename to disambiguate, or default to Crystal
        // since Crystal's checksum range is a subset of GS's range.
        if (lowerFile.includes('crystal')) {
          return { detected: true, gameVersion: 'Crystal' };
        } else if (lowerFile.includes('silver')) {
          return { detected: true, gameVersion: 'Silver' };
        } else if (lowerFile.includes('gold')) {
          return { detected: true, gameVersion: 'Gold' };
        }
        // Default to Crystal when both checksums match and no filename hint
        return { detected: true, gameVersion: 'Crystal' };
      }

      // Only Crystal checksum valid
      if (cryValid) {
        return { detected: true, gameVersion: 'Crystal' };
      }

      // Only GS checksum valid — use filename to distinguish Gold vs Silver
      if (lowerFile.includes('silver')) {
        return { detected: true, gameVersion: 'Silver' };
      }
      // Default to Gold when GS checksum matches
      return { detected: true, gameVersion: 'Gold' };
    }
    return { detected: false };
  }

  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    return parseGen2Save(buffer, filename);
  }

  writeSave(save: ParsedSave): Uint8Array {
    return writeGen2Save(save);
  }

  validateSave(buffer: Uint8Array): boolean {
    const gsSumComputed = calculateGen2Checksum(buffer, 0x2009, 0x2D68);
    const gsSumStored = buffer[0x2D69] | (buffer[0x2D6A] << 8);

    const crySumComputed = calculateGen2Checksum(buffer, 0x2009, 0x2B82);
    const crySumStored = buffer[0x2D0D] | (buffer[0x2D0E] << 8);

    return (crySumComputed === crySumStored && crySumStored !== 0) || 
           (gsSumComputed === gsSumStored && gsSumStored !== 0);
  }

  parseStandalonePokemon(buffer: Uint8Array): PokemonStats {
    // Graceful fallback dummy since GSC doesn't strictly focus on loose standalone files
    throw new Error("GSC Standalone Pokemon files (.pk2) parsing not explicitly requested.");
  }

  createStandalonePokemon(mon: PokemonStats): Uint8Array {
    throw new Error("GSC Standalone Pokemon files (.pk2) writing not explicitly requested.");
  }

  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number {
    return calculateGen2Stat(base, iv, ev, level, isHp);
  }

  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats {
    // Delegate to the correct Gen 2 recalculation which properly derives HP IV
    // from Attack, Defense, Speed, and Special DVs (Gen 2 HP IV formula).
    const result = recalculateGen2Stats(mon, baseStats);

    // Recalculate shiny status based on edited DVs
    result.isShiny = isGen2Shiny(result.iv.attack, result.iv.defense, result.iv.speed, result.iv.special);

    return result;
  }

  getBaseStats(dexId: number): BaseStats | undefined {
    const raw = getGen2BaseStats(dexId);
    if (!raw) return undefined;
    // Map Gen 2 naming convention (atk/def/spe/spa/spd) to unified BaseStats (attack/defense/speed/spAtk/spDef)
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
    const types = GSC_SPECIES_TYPES[dexId] || getPokemonTypes(dexId) || ['Normal'];
    const type1Name = types[0] || 'Normal';
    const type2Name = types[1] || type1Name;

    const internalMap: Record<string, number> = {
      'Normal': 0, 'Fighting': 1, 'Flying': 2, 'Poison': 3, 'Ground': 4, 'Rock': 5, 
      'Bug': 7, 'Ghost': 8, 'Steel': 9,
      'Fire': 20, 'Water': 21, 'Grass': 22, 'Electric': 23, 'Psychic': 24, 'Ice': 25, 'Dragon': 26, 'Dark': 27
    };

    return {
      type1: internalMap[type1Name] !== undefined ? internalMap[type1Name] : 0,
      type2: internalMap[type2Name] !== undefined ? internalMap[type2Name] : 0,
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
    // Gen 2 shares base PP with Gen 1 for moves 0-165.
    // For Gen 2-exclusive moves (166+), default to a conservative 10 if unknown.
    // When a dedicated Gen2 MOVES_PP array is created, this should use it.
    const pp = MOVES_PP[moveId];
    if (pp !== undefined && pp > 0) return pp;
    // Gen 2 move IDs 166-251 don't exist in Gen1's MOVES_PP;
    // return a safe default. Real PP values should be added to a Gen2 PP table.
    return 10;
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

  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    return decodeText(buffer, offset, maxLength);
  }

  encodeText(text: string, length: number, terminator: number = 0x50): Uint8Array {
    return encodeGameBoyText(text, length, terminator);
  }
}
