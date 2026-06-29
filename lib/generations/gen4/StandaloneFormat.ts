/**
 * Gen 4 StandaloneFormat (.pk4) — Phase 3.
 * PK4: 136 bytes stored, 236 bytes party.
 * Uses same LCRNG crypto as Gen 3 but with larger struct (PID%24 block shuffle).
 * Gen 4 uses 16-bit LE text (UTF-16 with 0xFFFF terminator).
 */
import { IStandalonePokemonFormat } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import { decryptPk3, encryptPk3 } from '../gen3/entity';
import { getNatureName, getAbilitySlot, getGenderFromPid, isShinyGen3, extractGen3IVs, packGen3IVs } from '../gen3/identity';
import { recalculateGen3Stats } from '../gen3/statCalculator';
import { getGen4BaseStats } from './data/speciesData';
import { getGen4TypeInfo } from './data/types';
import { GEN4_POKEMON_NAMES } from './data/speciesData';
import { getGrowthRate, getLevelFromExp } from '../../utils/experience';

// Gen 4 PK4: 136 bytes stored, 236 bytes party
export const PK4_SIZE_STORED = 136;
export const PK4_SIZE_PARTY = 236;
export const PK4_DATA_OFFSET = 0x08; // Data region starts after 8-byte header
export const PK4_DATA_SIZE = 128; // 4 blocks × 32 bytes
export const PK4_BLOCK_SIZE = 32;

export class Gen4StandaloneFormat implements IStandalonePokemonFormat {
  fileExtension = '.pk4';
  acceptPattern = '.pk4';
  expectedSizes = { international: 136, japanese: 136 };
  hasEncryption = true;
  hasAbilities = true;
  hasNatures = true;
  boxStructSize = 136;
  partyStructSize = 236;
  checksumOffsets = [0x04, 0x05]; // u16 checksum at offset 4

  validateFile(buffer: Uint8Array): { valid: boolean; error?: string } {
    if (buffer.length !== PK4_SIZE_STORED && buffer.length !== PK4_SIZE_PARTY) {
      return { valid: false, error: `Expected ${PK4_SIZE_STORED} or ${PK4_SIZE_PARTY} bytes, got ${buffer.length}` };
    }
    return { valid: true };
  }

  decryptBlock(buffer: Uint8Array): Uint8Array {
    // Gen 4 uses same LCRNG as Gen 3 but with 128-byte data region (4×32 bytes)
    // The crypto is the same algorithm, just larger blocks
    const result = decryptPk3(buffer.subarray(0, 80)); // Use Gen 3 crypto for the first 80 bytes
    const out = new Uint8Array(buffer);
    out.set(result.bytes.subarray(0, 48), PK4_DATA_OFFSET);
    return out;
  }

  encryptBlock(buffer: Uint8Array): Uint8Array {
    return buffer; // Phase 3: full implementation deferred
  }

  createFile(mon: PokemonStats): Uint8Array {
    // Phase 3: basic PK4 creation (stored format, 136 bytes)
    const buf = new Uint8Array(PK4_SIZE_STORED);
    const dv = new DataView(buf.buffer);

    // Header (8 bytes): PID(4) + OTID(4) — same as Gen 3
    dv.setUint32(0, mon.pid >>> 0, true);
    const tid = mon.originalTrainerId;
    const sid = mon.secretId || 0;
    dv.setUint32(4, ((sid & 0xffff) << 16) | (tid & 0xffff), true);

    // Checksum at offset 6-7 (u16 LE) — computed after data
    // Data region: 128 bytes at offset 8

    // For now, write the basic fields (full struct layout deferred to Phase 3 completion)
    // Species (u16 at offset 8)
    dv.setUint16(8, mon.dexId, true);
    // Held item (u16 at offset 10)
    dv.setUint16(10, mon.heldItemId || 0, true);
    // Experience (u32 at offset 12)
    dv.setUint32(12, Math.min(mon.exp, 0xFFFFFF), true);
    // Friendship (u8 at offset 16)
    buf[16] = mon.friendship || 70;
    // Moves (4×u16 at offset 24)
    for (let i = 0; i < 4; i++) {
      dv.setUint16(24 + i * 2, mon.moveIds?.[i] || 0, true);
    }
    // IVs (u32 at offset 60)
    const ivs = { hp: mon.iv?.hp || 0, attack: mon.iv?.attack || 0, defense: mon.iv?.defense || 0,
                  speed: mon.iv?.speed || 0, spAtk: mon.iv?.spAtk || 0, spDef: mon.iv?.spDef || 0 };
    dv.setUint32(60, packGen3IVs(ivs) >>> 0, true);

    // Compute checksum (sum of u16 words in data region)
    let checksum = 0;
    for (let i = PK4_DATA_OFFSET; i < PK4_SIZE_STORED; i += 2) {
      checksum = (checksum + (buf[i]! | (buf[i + 1]! << 8))) & 0xFFFF;
    }
    dv.setUint16(6, checksum, true);

    return buf;
  }

  parseFile(buffer: Uint8Array): PokemonStats {
    if (buffer.length < PK4_SIZE_STORED) {
      throw new Error(`PK4 must be at least ${PK4_SIZE_STORED} bytes, got ${buffer.length}`);
    }
    const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    const pid = dv.getUint32(0, true);
    const otid = dv.getUint32(4, true);
    const tid = otid & 0xFFFF;
    const sid = (otid >>> 16) & 0xFFFF;

    // Gen 4 data region is at offset 8, 128 bytes, NOT encrypted in stored format
    // (Gen 4 encrypts only party-format Pokémon in the save, not standalone files)
    const species = dv.getUint16(8, true);
    const heldItem = dv.getUint16(10, true);
    const exp = dv.getUint32(12, true) & 0xFFFFFF;
    const friendship = buffer[16]!;

    const moves = [dv.getUint16(24, true), dv.getUint16(26, true), dv.getUint16(28, true), dv.getUint16(30, true)];
    const movePp = [buffer[32]! & 0x3F, buffer[33]! & 0x3F, buffer[34]! & 0x3F, buffer[35]! & 0x3F];
    const movePpUps = [buffer[32]! >> 6, buffer[33]! >> 6, buffer[34]! >> 6, buffer[35]! >> 6];

    const ev = { hp: buffer[40]!, attack: buffer[41]!, defense: buffer[42]!, speed: buffer[43]!,
                 spAtk: buffer[44]!, spDef: buffer[45]!, special: buffer[44]! };

    const iv32 = dv.getUint32(60, true);
    const ivs = extractGen3IVs(iv32);

    const abilitySlot = getAbilitySlot(pid);
    const natureName = getNatureName(pid);
    const gender = getGenderFromPid(pid, species);
    const isShiny = isShinyGen3(pid, tid, sid); // Same shiny formula as Gen 3

    const base = getGen4BaseStats(species);
    const typeInfo = getGen4TypeInfo(species);
    const speciesName = GEN4_POKEMON_NAMES[species] || `Species ${species}`;
    const growthRate = getGrowthRate(species);
    const level = getLevelFromExp(exp, growthRate);

    const gen3Ext = new Gen3Extension();
    gen3Ext.natureId = pid % 25;
    gen3Ext.natureName = natureName;
    gen3Ext.abilityId = abilitySlot;
    gen3Ext.abilityName = abilitySlot === 1 ? 'Ability 2' : 'Ability 1';
    gen3Ext.secretId = sid;

    let stats = { hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, spAtk: 0, spDef: 0, special: 0 };
    if (base) {
      const mon: PokemonStats = {
        pid, speciesId: species, dexId: species, speciesName, nickname: speciesName,
        isNicknamed: false, form: 0, originalTrainerName: '???', originalTrainerId: tid, secretId: sid,
        originalTrainerGender: 'Male', level, exp, friendship,
        hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0,
        iv: { ...ivs, special: ivs.spAtk }, ev,
        moves: moves.map(m => m ? `Move ${m}` : ''), moveIds: moves, movePp, movePpUps,
        status: 'OK', catchRate: 0,
        type1: typeInfo.type1, type2: typeInfo.type2, type1Name: typeInfo.type1Name, type2Name: typeInfo.type2Name,
        isParty: true, isEgg: false, isShiny, gender,
        heldItemId: heldItem, heldItemName: heldItem ? `Item ${heldItem}` : undefined,
        pokerus: 0, genExtension: gen3Ext,
        raw: new Uint8Array(0), startOffset: 0, nicknameRaw: new Uint8Array(0), otNameRaw: new Uint8Array(0),
      } as PokemonStats;
      const recalced = recalculateGen3Stats(mon, base); // Gen 4 uses same stat formula as Gen 3
      stats = { hp: recalced.hp, maxHp: recalced.maxHp, attack: recalced.attack, defense: recalced.defense,
                speed: recalced.speed, spAtk: recalced.spAtk, spDef: recalced.spDef, special: recalced.special };
    }

    return {
      pid, speciesId: species, dexId: species, speciesName, nickname: speciesName, isNicknamed: false,
      form: 0, originalTrainerName: '???', originalTrainerId: tid, secretId: sid,
      originalTrainerGender: 'Male', level, exp, friendship,
      hp: stats.hp, maxHp: stats.maxHp, attack: stats.attack, defense: stats.defense,
      speed: stats.speed, special: stats.special, spAtk: stats.spAtk, spDef: stats.spDef,
      iv: { hp: ivs.hp, attack: ivs.attack, defense: ivs.defense, speed: ivs.speed, special: ivs.spAtk, spAtk: ivs.spAtk, spDef: ivs.spDef },
      ev, moves: moves.map(m => m ? `Move ${m}` : ''), moveIds: moves, movePp, movePpUps,
      status: 'OK', catchRate: 0,
      type1: typeInfo.type1, type2: typeInfo.type2, type1Name: typeInfo.type1Name, type2Name: typeInfo.type2Name,
      isParty: true, isEgg: false, isShiny, gender,
      heldItemId: heldItem, heldItemName: heldItem ? `Item ${heldItem}` : undefined,
      pokerus: 0, genExtension: gen3Ext,
      raw: buffer.slice(0, PK4_SIZE_STORED), startOffset: 0,
      nicknameRaw: new Uint8Array(0), otNameRaw: new Uint8Array(0),
    } as PokemonStats;
  }
}
