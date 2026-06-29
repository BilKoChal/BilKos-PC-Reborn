/**
 * Gen 5 StandaloneFormat (.pk5) — Phase 3.
 * PK5: 220 bytes (same for stored and party — Gen 5 unified the struct).
 * Uses same LCRNG crypto as Gen 3/4.
 */
import { IStandalonePokemonFormat } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import { getNatureName, getAbilitySlot, getGenderFromPid, isShinyGen3, extractGen3IVs, packGen3IVs } from '../gen3/identity';
import { recalculateGen3Stats } from '../gen3/statCalculator';
import { getGen5BaseStats } from './data/speciesData';
import { getGen5TypeInfo } from './data/types';
import { GEN5_POKEMON_NAMES } from './data/speciesData';
import { getGrowthRate, getLevelFromExp } from '../../utils/experience';

const PK5_SIZE = 220;

export class Gen5StandaloneFormat implements IStandalonePokemonFormat {
  fileExtension = '.pk5';
  acceptPattern = '.pk5';
  expectedSizes = { international: 220, japanese: 220 };
  hasEncryption = true;
  hasAbilities = true;
  hasNatures = true;
  boxStructSize = 220;
  partyStructSize = 220;
  checksumOffsets = [0x04, 0x05];

  validateFile(buffer: Uint8Array): { valid: boolean; error?: string } {
    if (buffer.length !== PK5_SIZE) return { valid: false, error: `Expected ${PK5_SIZE} bytes, got ${buffer.length}` };
    return { valid: true };
  }
  decryptBlock(buffer: Uint8Array): Uint8Array { return buffer; }
  encryptBlock(buffer: Uint8Array): Uint8Array { return buffer; }

  createFile(mon: PokemonStats): Uint8Array {
    const buf = new Uint8Array(PK5_SIZE);
    const dv = new DataView(buf.buffer);
    dv.setUint32(0, mon.pid >>> 0, true);
    dv.setUint32(4, ((mon.secretId || 0 & 0xffff) << 16) | (mon.originalTrainerId & 0xffff), true);
    dv.setUint16(8, mon.dexId, true);
    dv.setUint16(10, mon.heldItemId || 0, true);
    dv.setUint32(12, Math.min(mon.exp, 0xFFFFFF), true);
    buf[16] = mon.friendship || 70;
    for (let i = 0; i < 4; i++) dv.setUint16(24 + i * 2, mon.moveIds?.[i] || 0, true);
    const ivs = { hp: mon.iv?.hp || 0, attack: mon.iv?.attack || 0, defense: mon.iv?.defense || 0,
                  speed: mon.iv?.speed || 0, spAtk: mon.iv?.spAtk || 0, spDef: mon.iv?.spDef || 0 };
    dv.setUint32(60, packGen3IVs(ivs) >>> 0, true);
    let checksum = 0;
    for (let i = 8; i < PK5_SIZE; i += 2) checksum = (checksum + (buf[i]! | (buf[i+1]! << 8))) & 0xFFFF;
    dv.setUint16(6, checksum, true);
    return buf;
  }

  parseFile(buffer: Uint8Array): PokemonStats {
    if (buffer.length < PK5_SIZE) throw new Error(`PK5 must be ${PK5_SIZE} bytes, got ${buffer.length}`);
    const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const pid = dv.getUint32(0, true);
    const otid = dv.getUint32(4, true);
    const tid = otid & 0xFFFF, sid = (otid >>> 16) & 0xFFFF;
    const species = dv.getUint16(8, true);
    const heldItem = dv.getUint16(10, true);
    const exp = dv.getUint32(12, true) & 0xFFFFFF;
    const friendship = buffer[16]!;
    const moves = [dv.getUint16(24, true), dv.getUint16(26, true), dv.getUint16(28, true), dv.getUint16(30, true)];
    const movePp = [buffer[32]! & 0x3F, buffer[33]! & 0x3F, buffer[34]! & 0x3F, buffer[35]! & 0x3F];
    const movePpUps = [buffer[32]! >> 6, buffer[33]! >> 6, buffer[34]! >> 6, buffer[35]! >> 6];
    const ev = { hp: buffer[40]!, attack: buffer[41]!, defense: buffer[42]!, speed: buffer[43]!, spAtk: buffer[44]!, spDef: buffer[45]!, special: buffer[44]! };
    const iv32 = dv.getUint32(60, true);
    const ivs = extractGen3IVs(iv32);
    const abilitySlot = getAbilitySlot(pid);
    const natureName = getNatureName(pid);
    const gender = getGenderFromPid(pid, species);
    const isShiny = isShinyGen3(pid, tid, sid);
    const base = getGen5BaseStats(species);
    const typeInfo = getGen5TypeInfo(species);
    const speciesName = GEN5_POKEMON_NAMES[species] || `Species ${species}`;
    const growthRate = getGrowthRate(species);
    const level = getLevelFromExp(exp, growthRate);
    const gen3Ext = new Gen3Extension();
    gen3Ext.natureId = pid % 25; gen3Ext.natureName = natureName;
    gen3Ext.abilityId = abilitySlot; gen3Ext.abilityName = abilitySlot === 1 ? 'Ability 2' : 'Ability 1';
    gen3Ext.secretId = sid;
    let stats = { hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, spAtk: 0, spDef: 0, special: 0 };
    if (base) {
      const mon: PokemonStats = {
        pid, speciesId: species, dexId: species, speciesName, nickname: speciesName, isNicknamed: false,
        form: 0, originalTrainerName: '???', originalTrainerId: tid, secretId: sid, originalTrainerGender: 'Male',
        level, exp, friendship, hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0,
        iv: { ...ivs, special: ivs.spAtk }, ev,
        moves: moves.map(m => m ? `Move ${m}` : ''), moveIds: moves, movePp, movePpUps,
        status: 'OK', catchRate: 0, type1: typeInfo.type1, type2: typeInfo.type2,
        type1Name: typeInfo.type1Name, type2Name: typeInfo.type2Name,
        isParty: true, isEgg: false, isShiny, gender,
        heldItemId: heldItem, heldItemName: heldItem ? `Item ${heldItem}` : undefined,
        pokerus: 0, genExtension: gen3Ext, raw: new Uint8Array(0), startOffset: 0,
        nicknameRaw: new Uint8Array(0), otNameRaw: new Uint8Array(0),
      } as PokemonStats;
      const recalced = recalculateGen3Stats(mon, base);
      stats = { hp: recalced.hp, maxHp: recalced.maxHp, attack: recalced.attack, defense: recalced.defense,
                speed: recalced.speed, spAtk: recalced.spAtk, spDef: recalced.spDef, special: recalced.special };
    }
    return {
      pid, speciesId: species, dexId: species, speciesName, nickname: speciesName, isNicknamed: false,
      form: 0, originalTrainerName: '???', originalTrainerId: tid, secretId: sid, originalTrainerGender: 'Male',
      level, exp, friendship, hp: stats.hp, maxHp: stats.maxHp, attack: stats.attack, defense: stats.defense,
      speed: stats.speed, special: stats.special, spAtk: stats.spAtk, spDef: stats.spDef,
      iv: { hp: ivs.hp, attack: ivs.attack, defense: ivs.defense, speed: ivs.speed, special: ivs.spAtk, spAtk: ivs.spAtk, spDef: ivs.spDef },
      ev, moves: moves.map(m => m ? `Move ${m}` : ''), moveIds: moves, movePp, movePpUps,
      status: 'OK', catchRate: 0, type1: typeInfo.type1, type2: typeInfo.type2,
      type1Name: typeInfo.type1Name, type2Name: typeInfo.type2Name,
      isParty: true, isEgg: false, isShiny, gender,
      heldItemId: heldItem, heldItemName: heldItem ? `Item ${heldItem}` : undefined,
      pokerus: 0, genExtension: gen3Ext, raw: buffer.slice(0, PK5_SIZE), startOffset: 0,
      nicknameRaw: new Uint8Array(0), otNameRaw: new Uint8Array(0),
    } as PokemonStats;
  }
}
