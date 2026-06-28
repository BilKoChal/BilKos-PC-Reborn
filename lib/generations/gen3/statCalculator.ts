/**
 * Gen 3 stat calculator (BUG-G3-04 fix).
 *
 * Gen 3 uses a completely different stat formula from Gen 1/2:
 *
 *   HP:   floor((2 * Base + IV + floor(EV/4)) * Level / 100) + Level + 10
 *   Other: floor((floor((2 * Base + IV + floor(EV/4)) * Level / 100) + 5) * natureModifier)
 *
 * Key differences from the Gen 1/2 formula in `lib/utils/statCalculator.ts`:
 *   1. `floor(EV/4)` instead of `floor(sqrt(StatExp)/4)` — Gen 3 EVs are 0-255
 *      (not 0-65535 StatExp), and the contribution is linear, not square-root.
 *   2. Nature modifier — Gen 3 natures boost one stat ×1.1 and reduce another
 *      ×0.9 (HP is never affected). The modifier is applied AFTER the +5.
 *   3. 5-bit IVs (0-31) instead of 4-bit DVs (0-15).
 *
 * References: PKHeX `PK3` `Stats()`/`SetStats()` and Bulbapedia's "Statistics"
 * article (Generation III+ formula).
 *
 * The Gen 1/2 shared calculator in `lib/utils/statCalculator.ts` cannot be
 * reused because the EV math and nature modifier are fundamentally different.
 * A future Gen3Adapter.recalculateStats() should delegate to
 * `recalculateGen3Stats()` defined here.
 */
import { PokemonStats } from '../../parser/types';
import { BaseStats } from '../../interfaces';
import {
  getNatureId,
  getNatureModifier,
  NATURE_NEUTRAL,
} from './identity';

/**
 * Calculate a single Gen 3 stat.
 *
 * @param base      The species' base stat (0-255)
 * @param iv        The 5-bit IV (0-31)
 * @param ev        The EV (0-255; values >255 are clamped)
 * @param level     The Pokémon's level (1-100)
 * @param isHp      True for HP (uses +Level+10 instead of +5, no nature)
 * @param natureMod The nature multiplier (1.0/1.1/0.9); ignored for HP
 * @returns The computed stat value
 */
export function calculateGen3Stat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  isHp: boolean,
  natureMod: number = NATURE_NEUTRAL
): number {
  const clampedEv = Math.max(0, Math.min(ev ?? 0, 255));
  const evFactor = Math.floor(clampedEv / 4);
  const core = (2 * base + (iv & 0x1f) + evFactor) * level;
  const baseStat = Math.floor(core / 100);

  if (isHp) {
    // HP: no nature modifier, +Level+10
    return baseStat + level + 10;
  }
  // Other: +5, then ×nature
  return Math.floor((baseStat + 5) * natureMod);
}

/**
 * Recalculate all stats for a Gen 3 Pokémon based on its IVs, EVs, level, and
 * PID-derived nature. Mirrors the structure of `recalculateGen2Stats` but uses
 * the Gen 3 formula and nature modifiers.
 *
 * The PID is read from `mon.pid` (set by the Gen 3 parser or synthesized by
 * `convertPokemonForTransfer`). If `pid` is 0 (uninitialized), the nature is
 * treated as neutral (Hardy) so the calc still produces sensible values.
 *
 * Like `recalculateGen2Stats`, this:
 *   - Deep-clones iv/ev to avoid mutating the caller's objects.
 *   - Re-derives the HP stat and heals current HP to max.
 *   - Mirrors `special` from `spAtk` for backward compatibility.
 *
 * Unlike Gen 1/2, Gen 3 has true split Sp.Atk/Sp.Def IVs and EVs (no shared
 * "special" DV), so `iv.spAtk`/`iv.spDef` and `ev.spAtk`/`ev.spDef` are used
 * independently. The `iv.special`/`ev.special` fields are kept in sync with
 * `spAtk` for UI compatibility only.
 */
export function recalculateGen3Stats(mon: PokemonStats, baseStats: BaseStats): PokemonStats {
  // Deep-clone iv and ev to prevent mutating the caller's objects (matches the
  // B6 fix applied to recalculateGen2Stats).
  const newMon: PokemonStats = {
    ...mon,
    iv: { ...mon.iv },
    ev: { ...mon.ev },
  };

  // Derive nature from PID. PID 0 (uninitialized) → nature 0 (Hardy, neutral).
  const pid = mon.pid ?? 0;
  const natureId = pid !== 0 ? getNatureId(pid) : 0; // Hardy = neutral

  // HP — never affected by nature.
  newMon.maxHp = calculateGen3Stat(
    baseStats.hp,
    newMon.iv.hp,
    newMon.ev.hp,
    mon.level,
    true
  );
  newMon.hp = newMon.maxHp; // Heal to full on recalculation (matches Gen 2 behavior).

  // Other stats — each gets its own nature modifier.
  newMon.attack = calculateGen3Stat(
    baseStats.attack,
    newMon.iv.attack,
    newMon.ev.attack,
    mon.level,
    false,
    getNatureModifier(natureId, 'attack')
  );
  newMon.defense = calculateGen3Stat(
    baseStats.defense,
    newMon.iv.defense,
    newMon.ev.defense,
    mon.level,
    false,
    getNatureModifier(natureId, 'defense')
  );
  newMon.speed = calculateGen3Stat(
    baseStats.speed,
    newMon.iv.speed,
    newMon.ev.speed,
    mon.level,
    false,
    getNatureModifier(natureId, 'speed')
  );
  newMon.spAtk = calculateGen3Stat(
    baseStats.spAtk,
    newMon.iv.spAtk,
    newMon.ev.spAtk,
    mon.level,
    false,
    getNatureModifier(natureId, 'spAtk')
  );
  newMon.spDef = calculateGen3Stat(
    baseStats.spDef,
    newMon.iv.spDef,
    newMon.ev.spDef,
    mon.level,
    false,
    getNatureModifier(natureId, 'spDef')
  );

  // Mirror spAtk into `special` for backward-compat with UI code that reads
  // the unified Special field. (Gen 3 has no real "special" — this is a UI shim.)
  newMon.special = newMon.spAtk;

  return newMon;
}
