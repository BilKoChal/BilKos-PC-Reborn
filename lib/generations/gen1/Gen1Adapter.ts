import { IGenerationAdapter, BaseStats } from '../../interfaces';
import { ParsedSave, PokemonStats } from '../../parser/types';
import { detectGameVersion, validateGen1Checksum, parseGen1Save, parsePk1 } from './parser';
import { writeGen1Save, createPk1Binary } from './writer';
import { calculateGen1Stat, recalculateStats } from '../../utils/statCalculator';
import { getPokemonName } from './data/pokemonNames';
import { getMoveName } from './data/moves';
import { getItemName } from './data/items';
import { getPokemonTypes } from './data/pokemonTypes';
import { GEN1_BASE_STATS } from './data/baseStats';
import { decodeText } from '../../utils/textDecoder';
import { encodeGameBoyText } from '../../utils/textCodec';

/**
 * Gen 1 Generation Adapter.
 * Adapts internal Red/Blue/Yellow binaries to conform with multi-gen abstract contracts.
 */
export class Gen1Adapter implements IGenerationAdapter {
  generation = 1;
  generationName = "Generation I";
  supportedVersions = ['Red', 'Blue', 'Yellow'];
  partySize = 6;
  boxSlotCount = 20;
  boxCount = 12;

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

  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string } {
    const size = buffer.length;
    if (size === 32768 || size === 32768 + 16) {
      const isValid = validateGen1Checksum(buffer);
      if (isValid) {
        return {
          detected: true,
          gameVersion: detectGameVersion(buffer, filename)
        };
      }
    }
    return { detected: false };
  }

  parseSave(buffer: Uint8Array, filename: string): ParsedSave {
    return parseGen1Save(buffer, filename);
  }

  writeSave(save: ParsedSave): Uint8Array {
    return writeGen1Save(save);
  }

  validateSave(buffer: Uint8Array): boolean {
    return validateGen1Checksum(buffer);
  }

  parseStandalonePokemon(buffer: Uint8Array): PokemonStats {
    const parsed = parsePk1(buffer);
    if (!parsed) {
      throw new Error("Failed to parse pk1 standalone file.");
    }
    return parsed;
  }

  createStandalonePokemon(mon: PokemonStats): Uint8Array {
    return createPk1Binary(mon);
  }

  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number {
    return calculateGen1Stat(base, iv, ev, level, isHp);
  }

  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats {
    return recalculateStats(mon, baseStats, 1);
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

  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string {
    return decodeText(buffer, offset, maxLength);
  }

  encodeText(text: string, length: number, terminator: number = 0x50): Uint8Array {
    return encodeGameBoyText(text, length, terminator);
  }
}
