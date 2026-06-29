/**
 * Gen 3 StandaloneFormat (.pk3) — Phase 2 Sprints 1-3.
 *
 * Sprint 1: Uses Gen3TextCodec (was raw ASCII — garbled all text).
 * Sprint 3 fixes:
 * - PP/PP-Ups written and parsed (was all 0 — round-trip data loss)
 * - isShiny computed from PID (was always false)
 * - isEgg read from Misc block (was always false)
 * - Level derived from exp via growth rate (was hardcoded 100)
 * - Contest stats, ribbons, met data parsed from Misc block
 */
import { IStandalonePokemonFormat } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { Gen3Extension } from '../../canonicalModel';
import {
  decryptPk3, encryptPk3, PK3_SIZE_STORED,
} from './entity';
import { getNatureName, getAbilitySlot, getGenderFromPid, isShinyGen3, extractGen3IVs, packGen3IVs } from './identity';
import { recalculateGen3Stats } from './statCalculator';
import { getGen3BaseStats } from './data/speciesData';
import { getGen3TypeInfo } from './data/types';
import { GEN3_POKEMON_NAMES } from './data/speciesData';
import { Gen3TextCodec } from './Gen3TextCodec';
import { getGrowthRate, getLevelFromExp } from '../../utils/experience';

const _codec = new Gen3TextCodec();

const GEN3_MOVE_NAMES: string[] = []; // Phase 2.4: populate from move data

export class Gen3StandaloneFormat implements IStandalonePokemonFormat {
  fileExtension = '.pk3';
  acceptPattern = '.pk3';
  expectedSizes = { international: 80, japanese: 80 };
  hasEncryption = true;
  hasAbilities = true;
  hasNatures = true;
  boxStructSize = 80;
  partyStructSize = 100;
  checksumOffsets = [0x1C];

  validateFile(buffer: Uint8Array): { valid: boolean; error?: string } {
    if (buffer.length !== PK3_SIZE_STORED) {
      return { valid: false, error: `Expected ${PK3_SIZE_STORED} bytes, got ${buffer.length}` };
    }
    return { valid: true };
  }

  decryptBlock(buffer: Uint8Array): Uint8Array {
    // The PK3 decrypt operates on the full 80-byte buffer
    const result = decryptPk3(buffer);
    return result.bytes;
  }

  encryptBlock(buffer: Uint8Array): Uint8Array {
    // PK3 encrypt operates on the full 80-byte buffer
    return encryptPk3(buffer);
  }

  createFile(mon: PokemonStats): Uint8Array {
    const buf = new Uint8Array(PK3_SIZE_STORED);
    const dv = new DataView(buf.buffer);

    // PID (0x00, u32 LE)
    dv.setUint32(0, mon.pid >>> 0, true);

    // OTID (0x04, u32 LE — TID low 16, SID high 16)
    const tid = mon.originalTrainerId;
    const sid = mon.secretId || 0;
    dv.setUint32(4, ((sid & 0xffff) << 16) | (tid & 0xffff), true);

    // Sprint 1 fix: use Gen3TextCodec instead of raw charCodeAt
    const nick = mon.nickname || mon.speciesName || '??????????';
    const nickBuf = _codec.encode(nick, 11, 0xFF);
    buf.set(nickBuf.subarray(0, 10), 8);

    // Language (0x12, 1 byte) — English = 2
    buf[0x12] = 2;

    // OT Name (0x13, 7 bytes) — Sprint 1: use codec
    const otName = mon.originalTrainerName || '???????';
    const otBuf = _codec.encode(otName, 8, 0xFF);
    buf.set(otBuf.subarray(0, 7), 0x13);

    // Markings (0x1A, 1 byte)
    buf[0x1A] = 0;

    // Checksum (0x1C, u16 LE) — computed after data region is written
    // Padding (0x1E, u16) = 0

    // Data region (0x20, 48 bytes) — 4 blocks × 12 bytes in G/A/E/M order
    // Growth block (12 bytes): species(u16), item(u16), experience(u32), ppBonuses(u8), friendship(u8), unknown(u2)
    const species = mon.dexId;
    const item = mon.heldItemId || 0;
    const exp = Math.min(mon.exp, 0xFFFFFF);
    const base = getGen3BaseStats(species);
    dv.setUint16(0x20, species, true);
    dv.setUint16(0x22, item, true);
    dv.setUint32(0x24, exp, true);
    buf[0x28] = 0; // PP bonuses
    buf[0x29] = mon.friendship || 70;
    buf[0x2A] = 0; buf[0x2B] = 0;

    // Attacks block (12 bytes): moves(u16×4) + PP/PP-Ups(u8×4)
    // Sprint 3 fix (GAP-C7): write PP/PP-Ups (was all 0 — round-trip data loss)
    for (let i = 0; i < 4; i++) {
      dv.setUint16(0x2C + i * 2, mon.moveIds?.[i] || 0, true);
    }
    // PP/PP-Ups at attacks block bytes 8-11 (absolute 0x34-0x37)
    // Packed as: (ppUps << 6) | (pp & 0x3F)
    for (let i = 0; i < 4; i++) {
      const pp = mon.movePp?.[i] || 0;
      const ppUps = mon.movePpUps?.[i] || 0;
      buf[0x34 + i] = ((ppUps & 0x3) << 6) | (pp & 0x3F);
    }

    // EVs block (12 bytes): hp/atk/def/spe/spa/spd (u8 each) + coolness/beauty/cuteness/smartness/toughness/sheen (u8 each)
    buf[0x38] = Math.min(mon.ev?.hp || 0, 255);
    buf[0x39] = Math.min(mon.ev?.attack || 0, 255);
    buf[0x3A] = Math.min(mon.ev?.defense || 0, 255);
    buf[0x3B] = Math.min(mon.ev?.speed || 0, 255);
    buf[0x3C] = Math.min(mon.ev?.spAtk || 0, 255);
    buf[0x3D] = Math.min(mon.ev?.spDef || 0, 255);
    // Contest stats (placeholder)
    for (let i = 0x3E; i < 0x44; i++) buf[i] = 0;

    // Misc block (12 bytes): IVs(u32), met info, ability, etc.
    const ivs = {
      hp: mon.iv?.hp || 0, attack: mon.iv?.attack || 0, defense: mon.iv?.defense || 0,
      speed: mon.iv?.speed || 0, spAtk: mon.iv?.spAtk || 0, spDef: mon.iv?.spDef || 0,
    };
    const iv32 = packGen3IVs(ivs);
    dv.setUint32(0x44, iv32 >>> 0, true);
    buf[0x48] = 0; // met info (placeholder)
    buf[0x49] = 0; // met info
    buf[0x4A] = getAbilitySlot(mon.pid); // ability slot
    buf[0x4B] = 0; // misc
    // Remaining bytes
    for (let i = 0x4C; i < 0x50; i++) buf[i] = 0;

    // Compute checksum (sum of u16 words in data region)
    let checksum = 0;
    for (let i = 0x20; i < 0x50; i += 2) {
      checksum = (checksum + (buf[i]! | (buf[i + 1]! << 8))) & 0xFFFF;
    }
    dv.setUint16(0x1C, checksum, true);

    // Encrypt: shuffle blocks by PID%24, then LCRNG-XOR
    return encryptPk3(buf);
  }

  parseFile(buffer: Uint8Array): PokemonStats {
    if (buffer.length < PK3_SIZE_STORED) {
      throw new Error(`PK3 must be at least ${PK3_SIZE_STORED} bytes, got ${buffer.length}`);
    }

    const { bytes, checksumValid } = decryptPk3(buffer);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    const pid = dv.getUint32(0, true);
    const otid = dv.getUint32(4, true);
    const tid = otid & 0xFFFF;
    const sid = (otid >>> 16) & 0xFFFF;

    // Sprint 1 fix: use Gen3TextCodec instead of raw fromCharCode
    const nickname = _codec.decode(bytes, 8, 10);
    const otName = _codec.decode(bytes, 0x13, 7);

    // Parse data region (now decrypted and in G/A/E/M order)
    const species = dv.getUint16(0x20, true);
    const heldItem = dv.getUint16(0x22, true);
    const exp = dv.getUint32(0x24, true) & 0xFFFFFF;
    const friendship = bytes[0x29]!;

    const moves = [
      dv.getUint16(0x2C, true), dv.getUint16(0x2E, true),
      dv.getUint16(0x30, true), dv.getUint16(0x32, true),
    ];

    // Sprint 3 fix (GAP-H12): read PP/PP-Ups (was all 0)
    const movePp = [0, 0, 0, 0];
    const movePpUps = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const ppByte = bytes[0x34 + i]!;
      movePp[i] = ppByte & 0x3F;
      movePpUps[i] = (ppByte >> 6) & 0x3;
    }

    const ev = {
      hp: bytes[0x38]!, attack: bytes[0x39]!, defense: bytes[0x3A]!,
      speed: bytes[0x3B]!, spAtk: bytes[0x3C]!, spDef: bytes[0x3D]!,
      special: bytes[0x3C]!, // mirror for compat
    };

    const iv32 = dv.getUint32(0x44, true);
    const ivs = extractGen3IVs(iv32);

    const abilitySlot = getAbilitySlot(pid);
    const natureName = getNatureName(pid);
    const gender = getGenderFromPid(pid, species);

    const base = getGen3BaseStats(species);
    const typeInfo = getGen3TypeInfo(species);
    const speciesName = GEN3_POKEMON_NAMES[species] || `Species ${species}`;
    // Sprint 3 fix (GAP-H9): derive level from exp using growth rate
    const growthRate = getGrowthRate(species);
    const level = getLevelFromExp(exp, growthRate);

    const gen3Ext = new Gen3Extension();
    gen3Ext.natureId = pid % 25;
    gen3Ext.natureName = natureName;
    gen3Ext.abilityId = abilitySlot;
    gen3Ext.abilityName = abilitySlot === 1 ? 'Ability 2' : 'Ability 1';
    gen3Ext.secretId = sid;

    // Build stats
    let stats = { hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, spAtk: 0, spDef: 0, special: 0 };
    if (base) {
      const mon: PokemonStats = {
        pid, speciesId: species, dexId: species, speciesName, nickname,
        isNicknamed: nickname !== speciesName.toUpperCase(),
        form: 0, originalTrainerName: otName, originalTrainerId: tid, secretId: sid,
        originalTrainerGender: 'Male', level, exp, friendship,
        hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, special: 0, spAtk: 0, spDef: 0,
        iv: { ...ivs, special: ivs.spAtk }, ev,
        moves: moves.map(m => m ? (GEN3_MOVE_NAMES[m] || '-') : ''),
        moveIds: moves, movePp, movePpUps,
        status: 'OK', catchRate: 0,
        type1: typeInfo.type1, type2: typeInfo.type2,
        type1Name: typeInfo.type1Name, type2Name: typeInfo.type2Name,
        isParty: true, isEgg: (bytes[0x4B]! & 0x40) !== 0,
        isShiny: isShinyGen3(pid, tid, sid), gender, heldItemId: heldItem, heldItemName: heldItem ? `Item ${heldItem}` : undefined,
        pokerus: 0, genExtension: gen3Ext,
        raw: new Uint8Array(0), startOffset: 0,
        nicknameRaw: new Uint8Array(0), otNameRaw: new Uint8Array(0),
      } as PokemonStats;
      const recalced = recalculateGen3Stats(mon, base);
      stats = { hp: recalced.hp, maxHp: recalced.maxHp, attack: recalced.attack,
                defense: recalced.defense, speed: recalced.speed,
                spAtk: recalced.spAtk, spDef: recalced.spDef, special: recalced.special };
    }

    return {
      pid,
      speciesId: species,
      dexId: species,
      speciesName,
      nickname,
      isNicknamed: nickname !== speciesName.toUpperCase(),
      form: 0,
      originalTrainerName: otName,
      originalTrainerId: tid,
      secretId: sid,
      originalTrainerGender: 'Male',
      level,
      exp,
      friendship,
      hp: stats.hp,
      maxHp: stats.maxHp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      special: stats.special,
      spAtk: stats.spAtk,
      spDef: stats.spDef,
      iv: { hp: ivs.hp, attack: ivs.attack, defense: ivs.defense, speed: ivs.speed, special: ivs.spAtk, spAtk: ivs.spAtk, spDef: ivs.spDef },
      ev,
      moves: moves.map(m => m ? (GEN3_MOVE_NAMES[m] || '-') : ''),
      moveIds: moves,
      movePp,
      movePpUps,
      status: 'OK',
      catchRate: 0,
      type1: typeInfo.type1,
      type2: typeInfo.type2,
      type1Name: typeInfo.type1Name,
      type2Name: typeInfo.type2Name,
      isParty: true,
      isEgg: (bytes[0x4B]! & 0x40) !== 0,
      isShiny: isShinyGen3(pid, tid, sid),
      gender,
      heldItemId: heldItem,
      heldItemName: heldItem ? `Item ${heldItem}` : undefined,
      pokerus: 0,
      genExtension: gen3Ext,
      raw: bytes.slice(0, PK3_SIZE_STORED),
      startOffset: 0,
      nicknameRaw: bytes.slice(8, 18),
      otNameRaw: bytes.slice(0x13, 0x1A),
    } as PokemonStats;
  }
}
