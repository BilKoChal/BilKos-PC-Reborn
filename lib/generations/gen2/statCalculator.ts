
import { PokemonStats } from '../../parser/types';
import { calculateGen1Stat } from '../../utils/statCalculator';

export interface Gen2BaseStats {
    hp: number;
    atk: number;
    def: number;
    spe: number;
    spa: number;
    spd: number;
}

/**
 * Calculates a specific stat in Gen 2.
 * Gen 2 shares the exact same DV (IV) and Stat Experience (EV) formulas as Gen 1,
 * but allows independent base stats for SpAtk and SpDef.
 */
export function calculateGen2Stat(base: number, iv: number, ev: number, level: number, isHp: boolean): number {
    return calculateGen1Stat(base, iv, ev, level, isHp);
}

/**
 * Recalculates all stats for a Gen 2 Pokemon based on its current DVs/IVs, Stat Experience/EVs, and level,
 * fully resolving SpAtk and SpDef separately.
 */
export function recalculateGen2Stats(mon: PokemonStats, baseStats: Gen2BaseStats): PokemonStats {
    const newMon = { ...mon };
    
    // GSC shares Defense DVs/IVs, Speed DVs/IVs, and Special DVs/IVs.
    // HP DV/IV is derived from the other 4 DVs/IVs just like Gen 1.
    // Specifically, iv.hp is derived.
    const atkIv = mon.iv.attack;
    const defIv = mon.iv.defense;
    const spdIv = mon.iv.speed;
    const spcIv = mon.iv.special; // Shared Special DV in GSC
    
    const hpIv = ((atkIv & 1) << 3) | ((defIv & 1) << 2) | ((spdIv & 1) << 1) | (spcIv & 1);
    
    newMon.iv.hp = hpIv;

    newMon.maxHp = calculateGen2Stat(baseStats.hp, hpIv, mon.ev.hp, mon.level, true);
    newMon.hp = newMon.maxHp; // Heal to full on recalculation
    
    newMon.attack = calculateGen2Stat(baseStats.atk, atkIv, mon.ev.attack, mon.level, false);
    newMon.defense = calculateGen2Stat(baseStats.def, defIv, mon.ev.defense, mon.level, false);
    newMon.speed = calculateGen2Stat(baseStats.spe, spdIv, mon.ev.speed, mon.level, false);
    
    // SpAtk and SpDef are calculated using the single shared special IV/EV
    newMon.spAtk = calculateGen2Stat(baseStats.spa, spcIv, mon.ev.special, mon.level, false);
    newMon.spDef = calculateGen2Stat(baseStats.spd, spcIv, mon.ev.special, mon.level, false);
    
    // Let's also populate unified "special" with spAtk for compatibility
    newMon.special = newMon.spAtk;

    return newMon;
}
