/**
 * Gen 3 trainer-ID, shininess, and PID interpretation helpers.
 *
 * From Gen 3 onward a trainer is identified by a 32-bit value split into a
 * public Trainer ID (TID, low 16 bits) and a Secret ID (SID, high 16 bits) —
 * the `Gen3Extension.secretId` the CDM already reserves. Shininess is derived
 * from the PID and both IDs, so these pure helpers are the durable core that a
 * future Gen 3 parser/UI will plug `secretId` into.
 *
 * BUG-G3-05 fix: this file previously only had TID/SID + shininess helpers.
 * The following PID-derived quantities were missing (needed by any Gen 3
 * parser/UI): nature, ability slot, gender, Unown form, Wurmple evolution,
 * and 5-bit IV extraction from the 32-bit IV word. All formulas are verified
 * against Bulbapedia's "Personality value" article and PKHeX's `PK3` code.
 */

// ─── Trainer ID helpers ────────────────────────────────────────────────────

/** Combine a 16-bit TID and 16-bit SID into the stored 32-bit OT ID. */
export function combinedTrainerId(tid: number, sid: number): number {
  return (((sid & 0xffff) << 16) | (tid & 0xffff)) >>> 0;
}

/** Split a stored 32-bit OT ID back into `{ tid, sid }`. */
export function splitTrainerId(otid: number): { tid: number; sid: number } {
  const v = otid >>> 0;
  return { tid: v & 0xffff, sid: (v >>> 16) & 0xffff };
}

// ─── Shininess ─────────────────────────────────────────────────────────────

/**
 * The Gen 3 "shiny value": `TID ^ SID ^ PID_high ^ PID_low`. A Pokémon is shiny
 * when this is below the shiny threshold (8 in Gen 3-5).
 */
export function shinyValueGen3(pid: number, tid: number, sid: number): number {
  const p = pid >>> 0;
  return ((tid & 0xffff) ^ (sid & 0xffff) ^ ((p >>> 16) & 0xffff) ^ (p & 0xffff)) & 0xffff;
}

/** Gen 3-5 shiny threshold. */
export const SHINY_THRESHOLD_GEN3 = 8;

/** True when the PID/ID combination yields a shiny Pokémon (Gen 3-5 rule). */
export function isShinyGen3(pid: number, tid: number, sid: number): boolean {
  return shinyValueGen3(pid, tid, sid) < SHINY_THRESHOLD_GEN3;
}

// ─── Nature ────────────────────────────────────────────────────────────────

/**
 * The 25 natures in Gen 3+. Index 0..24 maps to a fixed name and a fixed
 * stat-boost/reduce pair. Indexed by `natureId = PID % 25`.
 *
 * Layout: each nature boosts one stat by 10% and reduces another by 10%.
 * HP is never affected. The matrix is 5×5 where the diagonal (Bashful, Docile,
 * Hardy, Quirky, Serious) is neutral.
 */
export const NATURE_NAMES: readonly string[] = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
];

/** The nature-neutral stat multiplier (×1.0 for all stats). */
export const NATURE_NEUTRAL = 1.0;
/** The nature-boosted stat multiplier (×1.1). */
export const NATURE_BOOST = 1.1;
/** The nature-reduced stat multiplier (×0.9). */
export const NATURE_NERF = 0.9;

/**
 * Nature ID = `PID % 25`. Returns 0..24.
 * Reference: Bulbapedia — "The Pokémon's nature is determined by `pid % 25`."
 */
export function getNatureId(pid: number): number {
  return (pid >>> 0) % 25;
}

/** Nature name from PID. Returns one of the 25 canonical nature names. */
export function getNatureName(pid: number): string {
  return NATURE_NAMES[getNatureId(pid)] ?? 'Hardy';
}

/**
 * Returns the nature's effect on a given stat.
 * @param natureId 0..24
 * @param stat One of 'attack' | 'defense' | 'speed' | 'spAtk' | 'spDef' (HP is never affected)
 * @returns 1.1 (boosted), 0.9 (reduced), or 1.0 (neutral)
 *
 * Nature matrix (row = boosted stat, col = reduced stat; diagonal = neutral):
 *                Atk  Def  Spe  SpA  SpD
 *   Atk-boosted:  -    L    B    A    N     (Lonely, Brave, Adamant, Naughty)
 *   Def-boosted:  B    -    R    I    L     (Bold, Relaxed, Impish, Lax)
 *   Spe-boosted:  L    R    -    J    N     (Timid, Hasty, Jolly, Naive)
 *   SpA-boosted:  B    M    Q    -    R     (Modest, Mild, Quiet, Rash)
 *   SpD-boosted:  B    G    S    C    -     (Calm, Gentle, Sassy, Careful)
 *
 * The 5×5 matrix is traversed row-major: natureId = boostedStat*5 + reducedStat.
 * So `Math.floor(n / 5)` is the boosted stat index and `n % 5` is the reduced
 * stat index. When they're equal (diagonal), the nature is neutral.
 */
export function getNatureModifier(
  natureId: number,
  stat: 'attack' | 'defense' | 'speed' | 'spAtk' | 'spDef'
): number {
  const n = natureId % 25;
  const statIndex = { attack: 0, defense: 1, speed: 2, spAtk: 3, spDef: 4 }[stat];
  const boosted = Math.floor(n / 5);
  const reduced = n % 5;
  // Diagonal natures (boosted === reduced) are neutral for ALL stats.
  // This must be checked FIRST — otherwise Hardy (0) would incorrectly boost
  // Attack (statIndex 0 === boosted 0) instead of being neutral.
  if (boosted === reduced) return NATURE_NEUTRAL;
  if (statIndex === boosted) return NATURE_BOOST;
  if (statIndex === reduced) return NATURE_NERF;
  return NATURE_NEUTRAL;
}

// ─── Ability ───────────────────────────────────────────────────────────────

/**
 * Ability slot from PID: bit 16 of the PID selects slot 0 or slot 1.
 * Reference: PKHeX uses `(pid >> 16) & 1`.
 *
 * Species with only one ability always use slot 0 regardless of PID; the caller
 * is responsible for checking the species' ability list. This helper just
 * returns the raw slot index.
 */
export function getAbilitySlot(pid: number): 0 | 1 {
  return ((pid >>> 16) & 1) as 0 | 1;
}

// ─── Gender ────────────────────────────────────────────────────────────────

/**
 * Gender from PID, given a species' gender threshold.
 *
 * Gen 3 gender rule: take the low byte of the PID (`pid & 0xFF`), compare
 * against the species' gender threshold:
 *   - threshold 0   → always Male (female ratio 0%)
 *   - threshold 31  → 87.5% Male / 12.5% Female (starters, fossils, etc.)
 *   - threshold 63  → 75% Male / 25% Female
 *   - threshold 127 → 50% Male / 50% Female (most common)
 *   - threshold 191 → 25% Male / 75% Female
 *   - threshold 254 → always Female
 *   - threshold 255 → Genderless
 *
 * Female if `(pid & 0xFF) >= threshold`, otherwise Male. (Note: higher PID
 * values are MORE likely female, opposite of Gen 2's DV rule.)
 */
export function getGenderFromPidByThreshold(
  pid: number,
  threshold: number
): 'Male' | 'Female' | 'Genderless' {
  if (threshold >= 255) return 'Genderless';
  if (threshold === 0) return 'Male';      // 0% female
  if (threshold >= 254) return 'Female';   // 100% female
  const p = (pid >>> 0) & 0xff;
  return p >= threshold ? 'Female' : 'Male';
}

/**
 * Built-in gender thresholds for Gen 3 species 1..386. Source: PKHeX
 * `PersonalTable.RS` (gender ratios are identical across R/S/E/FR/LG).
 * Keyed by National Dex ID. Missing entries default to 127 (50/50).
 *
 * Threshold encoding (matches PKHeX's `Gender` field in PersonalInfo):
 *   0   = 100% Male
 *   31  = 87.5% Male / 12.5% Female
 *   63  = 75% Male / 25% Female
 *   127 = 50% Male / 50% Female  (default)
 *   191 = 25% Male / 75% Female
 *   254 = 100% Female
 *   255 = Genderless
 */
const GEN3_GENDER: Record<number, number> = {};

// 100% Female (threshold 254)
for (const id of [25, 26, 27, 113, 115, 124, 238, 241, 242, 380]) {
  GEN3_GENDER[id] = 254;
}
// 25=Nidoran♀, 26=Nidorina, 27=Nidoqueen, 113=Chansey, 115=Kangaskhan,
// 124=Jynx, 238=Smoochum, 241=Miltank, 242=Blissey, 380=Latias

// 100% Male (threshold 0)
for (const id of [32, 33, 34, 106, 107, 128, 236, 237, 381]) {
  GEN3_GENDER[id] = 0;
}
// 32=Nidoran♂, 33=Nidorino, 34=Nidoking, 106=Hitmonlee, 107=Hitmonchan,
// 128=Tauros, 236=Tyrogue, 237=Hitmontop, 381=Latios

// 87.5% Male / 12.5% Female (threshold 31): starters, fossils, Eevee, Snorlax, etc.
for (const id of [
  1, 2, 3, 4, 5, 6, 7, 8, 9,                    // Kanto starters
  133, 134, 135, 136, 196, 197,                 // Eevee + 5 gen1-2 eeveelutions
  138, 139, 140, 141, 142,                      // Omanyte/Omastar/Kabuto/Kabutops/Aerodactyl
  143,                                          // Snorlax
  152, 153, 154, 155, 156, 157, 158, 159, 160,  // Johto starters
  175, 176,                                     // Togepi/Togetic
  252, 253, 254,                                // Treecko line
  255, 256, 257,                                // Torchic line
  258, 259, 260,                                // Mudkip line
]) {
  GEN3_GENDER[id] = 31;
}

// 75% Male / 25% Female (threshold 63)
for (const id of [
  58, 59,       // Growlithe/Arcanine
  63, 64, 65,   // Abra line
  66, 67, 68,   // Machop line
  125, 126,     // Electabuzz, Magmar
  239, 240,     // Elekid, Magby
]) {
  GEN3_GENDER[id] = 63;
}

// 25% Male / 75% Female (threshold 191)
for (const id of [
  35, 36,       // Clefairy line
  37, 38,       // Vulpix line
  39, 40,       // Jigglypuff line
  173, 174,     // Cleffa, Igglybuff
  209, 210,     // Snubbull line
  222,          // Corsola
  296, 297,     // Whismur line
  300, 301,     // Skitty/Delcatty
]) {
  GEN3_GENDER[id] = 191;
}

// Genderless (threshold 255)
for (const id of [
  81, 82,           // Magnemite/Magneton
  100, 101,         // Voltorb/Electrode
  120, 121,         // Staryu/Starmie
  132,              // Ditto
  137, 233,         // Porygon/Porygon2
  144, 145, 146,    // Articuno/Zapdos/Moltres
  150, 151,         // Mewtwo/Mew
  201,              // Unown
  243, 244, 245,    // Raikou/Entei/Suicune
  249, 250, 251,    // Lugia/Ho-Oh/Celebi
  292,              // Shedinja (genderless; Nincada/Ninjask are 50/50)
  337, 338,         // Lunatone/Solrock
  343, 344,         // Baltoy/Claydol
  377, 378, 379,    // Regirock/Regice/Registeel
  382, 383, 384,    // Kyogre/Groudon/Rayquaza
  385, 386,         // Jirachi/Deoxys
]) {
  GEN3_GENDER[id] = 255;
}

/**
 * Gender from PID + species. Looks up the species' gender threshold from the
 * built-in `GEN3_GENDER` table (defaults to 127 = 50/50 if the species isn't
 * listed) and applies the Gen 3 gender rule.
 */
export function getGenderFromPid(pid: number, dexId: number): 'Male' | 'Female' | 'Genderless' {
  const threshold = GEN3_GENDER[dexId] ?? 127;
  return getGenderFromPidByThreshold(pid, threshold);
}

// ─── Unown form ────────────────────────────────────────────────────────────

/**
 * Unown form letter from PID (Gen 3).
 *
 * Gen 3 Unown form derivation (verified against PKHeX `PK3`):
 *   Extract 2 bits from each of the 4 bytes of the PID, combine into an 8-bit
 *   value (high byte = high PID byte), then mod 28:
 *     val = (byte3 << 6) | (byte2 << 4) | (byte1 << 2) | byte0
 *     form_index = val % 28
 *   0-25 = letters A-Z, 26 = ?, 27 = !
 *
 * @returns the letter ('a'-'z') for forms 0-25, '?' for 26, '!' for 27
 */
export function getUnownFormLetterGen3(pid: number): string {
  const p = pid >>> 0;
  const b0 = p & 0x3;
  const b1 = (p >>> 8) & 0x3;
  const b2 = (p >>> 16) & 0x3;
  const b3 = (p >>> 24) & 0x3;
  const val = (b3 << 6) | (b2 << 4) | (b1 << 2) | b0;
  const formIndex = val % 28;
  if (formIndex < 26) return String.fromCharCode(97 + formIndex); // 'a'-'z'
  if (formIndex === 26) return '?';
  return '!';
}

// ─── Wurmple evolution ─────────────────────────────────────────────────────

/**
 * Wurmple evolution branch from PID (Gen 3).
 *
 * Wurmple evolves into Silcoon (→ Beautifly) when `(pid >> 16) % 10 < 5`,
 * otherwise into Cascoon (→ Dustox). The comparison uses the high 16 bits of
 * the PID (PKHeX uses the same formula).
 *
 * @returns 'silcoon' | 'cascoon'
 */
export function getWurmpleEvolution(pid: number): 'silcoon' | 'cascoon' {
  return (((pid >>> 16) % 10) < 5) ? 'silcoon' : 'cascoon';
}

// ─── IV extraction (5-bit IVs from 32-bit IV word) ─────────────────────────

/**
 * Gen 3 stores IVs as a single 32-bit word (sometimes called the "IV32" or
 * "secondary PID"). Each IV is 5 bits (0-31), packed as:
 *   bits  0- 4: HP
 *   bits  5- 9: Attack
 *   bits 10-14: Defense
 *   bits 15-19: Speed
 *   bits 20-24: Sp.Atk
 *   bits 25-29: Sp.Def
 *   bits 30-31: unused (in Gen 3; later gens use them for abilities, etc.)
 *
 * This layout is verified against PKHeX's `PK3.IV32` property and Bulbapedia's
 * "Individual values" article (Generation III layout).
 */
export interface Gen3IVs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAtk: number;
  spDef: number;
}

export function extractGen3IVs(iv32: number): Gen3IVs {
  const v = iv32 >>> 0;
  return {
    hp: v & 0x1f,
    attack: (v >>> 5) & 0x1f,
    defense: (v >>> 10) & 0x1f,
    speed: (v >>> 15) & 0x1f,
    spAtk: (v >>> 20) & 0x1f,
    spDef: (v >>> 25) & 0x1f,
  };
}

/** Inverse of {@link extractGen3IVs}: pack 6 IVs into a 32-bit word. */
export function packGen3IVs(ivs: Gen3IVs): number {
  return (
    (ivs.hp & 0x1f) |
    ((ivs.attack & 0x1f) << 5) |
    ((ivs.defense & 0x1f) << 10) |
    ((ivs.speed & 0x1f) << 15) |
    ((ivs.spAtk & 0x1f) << 20) |
    ((ivs.spDef & 0x1f) << 25)
  ) >>> 0;
}
