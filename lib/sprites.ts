/**
 * Centralized Sprite URL Resolver
 *
 * Provides a single source of truth for all Pokemon and trainer sprite URLs.
 * Every component should call these functions instead of constructing URLs inline.
 *
 * Three sprite modes are supported:
 * - 'game-specific': Version-specific pixel sprites from PokeAPI's generation folders
 *   (shiny variants available for Gen 2+ games; Gen 1 has no game-specific shiny)
 * - 'master': Standard PokeAPI "master" pixel sprites (same for all versions)
 * - 'artwork': Official artwork (high-res illustrations)
 *
 * A12: Version-to-sprite-folder mapping is now DATA-DRIVEN via VERSION_SPRITE_MAP.
 * Adding a generation requires only adding rows to the table — zero control-flow edits.
 * Previously, 4 switch(gameVersion) statements were duplicated across multiple functions.
 * Now each function does a single lookup and constructs the URL from the result.
 */

import { SpriteMode } from '../context/SpriteContext';
import { GameVersion } from './parser/types';

// ─── Version → Sprite Folder Data Table (A12: replaces all switch(gameVersion)) ───

/**
 * Maps each game version to its PokeAPI sprite folder path and capabilities.
 *
 * PokeAPI URL structure:
 *   Regular:  /sprites/pokemon/versions/{gen}/{folder}/transparent/{id}.png
 *   Shiny:    /sprites/pokemon/versions/{gen}/{folder}/shiny/{id}.png
 *   Unown:    /sprites/pokemon/versions/{gen}/{folder}/transparent/201-{form}.png
 *
 * Adding Gen 3+ = adding rows to this table. No switch/case edits needed.
 * The `hasShiny` flag indicates whether PokeAPI provides game-specific shiny sprites
 * for this version (Gen 1 does NOT have game-specific shiny sprites).
 */
const VERSION_SPRITE_MAP: Record<string, { gen: string; folder: string; hasShiny: boolean }> = {
  // Gen 1
  Red:   { gen: 'generation-i', folder: 'red-blue', hasShiny: false },
  Blue:  { gen: 'generation-i', folder: 'red-blue', hasShiny: false },
  Yellow: { gen: 'generation-i', folder: 'yellow', hasShiny: false },
  // Gen 2
  Gold:    { gen: 'generation-ii', folder: 'gold', hasShiny: true },
  Silver:  { gen: 'generation-ii', folder: 'silver', hasShiny: true },
  Crystal: { gen: 'generation-ii', folder: 'crystal', hasShiny: true },
  // Gen 3 — add when supported:
  // Ruby:     { gen: 'generation-iii', folder: 'ruby-sapphire', hasShiny: true },
  // Sapphire: { gen: 'generation-iii', folder: 'ruby-sapphire', hasShiny: true },
  // Emerald:  { gen: 'generation-iii', folder: 'emerald', hasShiny: true },
  // FireRed:  { gen: 'generation-iii', folder: 'firered-leafgreen', hasShiny: true },
  // LeafGreen: { gen: 'generation-iii', folder: 'firered-leafgreen', hasShiny: true },
  // Gen 4 — add when supported:
  // Diamond:     { gen: 'generation-iv', folder: 'diamond-pearl', hasShiny: true },
  // Pearl:       { gen: 'generation-iv', folder: 'diamond-pearl', hasShiny: true },
  // Platinum:    { gen: 'generation-iv', folder: 'platinum', hasShiny: true },
  // HeartGold:   { gen: 'generation-iv', folder: 'heartgold-soulsilver', hasShiny: true },
  // SoulSilver:  { gen: 'generation-iv', folder: 'heartgold-soulsilver', hasShiny: true },
  // Gen 5:
  // Black:  { gen: 'generation-v', folder: 'black-white', hasShiny: true },
  // White:  { gen: 'generation-v', folder: 'black-white', hasShiny: true },
  // Gen 6:
  // X:              { gen: 'generation-vi', folder: 'x-y', hasShiny: true },
  // Y:              { gen: 'generation-vi', folder: 'x-y', hasShiny: true },
  // OmegaRuby:      { gen: 'generation-vi', folder: 'omegaruby-alphasapphire', hasShiny: true },
  // AlphaSapphire:  { gen: 'generation-vi', folder: 'omegaruby-alphasapphire', hasShiny: true },
  // Gen 7:
  // UltraSun:  { gen: 'generation-vii', folder: 'ultra-sun-ultra-moon', hasShiny: true },
  // UltraMoon: { gen: 'generation-vii', folder: 'ultra-sun-ultra-moon', hasShiny: true },
  // Gen 8:
  // BrilliantDiamond: { gen: 'generation-viii', folder: 'brilliant-diamond-shining-pearl', hasShiny: true },
  // ShiningPearl:     { gen: 'generation-viii', folder: 'brilliant-diamond-shining-pearl', hasShiny: true },
  // Gen 9:
  // Scarlet: { gen: 'generation-ix', folder: 'scarlet-violet', hasShiny: true },
  // Violet:  { gen: 'generation-ix', folder: 'scarlet-violet', hasShiny: true },
};

// ─── Trainer Sprite Data Table ──────────────────────────────────────────────

/**
 * Maps each game version to its trainer sprite file on PokemonShowdown.
 *
 * Each entry specifies:
 * - `gameSpecific`: Filename for game-specific (gen-suffixed) mode
 * - `master`: { male, female } filenames for master (non-suffixed) mode
 *
 * Adding Gen 3+ = adding rows. No switch edits needed.
 */
const TRAINER_SPRITE_MAP: Record<string, {
  gameSpecific: string | { male: string; female: string };
  master: { male: string; female: string };
}> = {
  // Gen 1
  Red:   { gameSpecific: 'red-gen1rb.png', master: { male: 'red.png', female: 'red.png' } },
  Blue:  { gameSpecific: 'red-gen1rb.png', master: { male: 'red.png', female: 'red.png' } },
  Yellow: { gameSpecific: 'red-gen1.png', master: { male: 'red.png', female: 'red.png' } },
  // Gen 2
  Gold:    { gameSpecific: { male: 'ethan-gen2.png', female: 'kris-gen2.png' }, master: { male: 'ethan.png', female: 'kris.png' } },
  Silver:  { gameSpecific: { male: 'ethan-gen2.png', female: 'kris-gen2.png' }, master: { male: 'ethan.png', female: 'kris.png' } },
  Crystal: { gameSpecific: { male: 'ethan-gen2.png', female: 'kris-gen2.png' }, master: { male: 'ethan.png', female: 'kris.png' } },
};

// ─── Unown Form Helper ──────────────────────────────────────────────────────

/**
 * Computes the Unown form letter from Gen 2 IVs (DVs).
 *
 * In Gen 2, Unown's letter form is derived from the Pokemon's IVs.
 * The formula combines the middle bits of each DV to produce a value 0-25,
 * mapping to letters A-Z:
 *   combined = ((atkIv & 0x6) << 5) | ((defIv & 0x6) << 3) |
 *              ((spdIv & 0x6) << 1) | ((spcIv & 0x6) >> 1)
 *   letter_index = combined % 26
 *
 * @returns Lowercase letter ('a'-'z') for Unown, or undefined for other species
 */
export function getUnownFormLetter(dexId: number, iv: { attack: number; defense: number; speed: number; special: number }): string | undefined {
  if (dexId !== 201) return undefined;
  const combined = ((iv.attack & 0x6) << 5) | ((iv.defense & 0x6) << 3) |
                   ((iv.speed & 0x6) << 1) | ((iv.special & 0x6) >> 1);
  const letterIndex = combined % 26;
  return String.fromCharCode(97 + letterIndex); // 'a' to 'z'
}

/**
 * Compute the Gen 2 DVs (IVs) needed to make an Unown show a specific letter,
 * changing as little as possible (TODO 3.8).
 *
 * Only the "middle" bits (bit 1 and bit 2, i.e. `& 6`) of each DV affect the
 * letter, per `getUnownFormLetter`. We preserve every other bit of the existing
 * DVs (so HP-DV/shininess/stat impact is minimized) and pick the bit-pair
 * combination that yields the requested letter while touching the fewest DVs.
 *
 * @param letter Target form letter 'a'-'z' (case-insensitive)
 * @param iv     Current DVs
 * @returns New { attack, defense, speed, special } DVs, or the input unchanged
 *          if the letter is invalid.
 */
export function setUnownFormDVs(
  letter: string,
  iv: { attack: number; defense: number; speed: number; special: number },
): { attack: number; defense: number; speed: number; special: number } {
  const target = letter.toLowerCase().charCodeAt(0) - 97;
  if (target < 0 || target > 25) return iv;

  const opts = [0, 2, 4, 6]; // possible values of (dv & 6)
  const letterOf = (a: number, d: number, s: number, c: number) =>
    (((a & 6) << 5) | ((d & 6) << 3) | ((s & 6) << 1) | ((c & 6) >> 1)) % 26;

  let best: { a: number; d: number; s: number; c: number } | null = null;
  let bestCost = Infinity;
  for (const a of opts) for (const d of opts) for (const s of opts) for (const c of opts) {
    if (letterOf(a, d, s, c) !== target) continue;
    const cost =
      (a !== (iv.attack & 6) ? 1 : 0) +
      (d !== (iv.defense & 6) ? 1 : 0) +
      (s !== (iv.speed & 6) ? 1 : 0) +
      (c !== (iv.special & 6) ? 1 : 0);
    if (cost < bestCost) { bestCost = cost; best = { a, d, s, c }; }
  }
  if (!best) return iv;

  // Preserve all non-form bits (~6) of each DV; replace only the &6 portion.
  return {
    attack: (iv.attack & ~6) | best.a,
    defense: (iv.defense & ~6) | best.d,
    speed: (iv.speed & ~6) | best.s,
    special: (iv.special & ~6) | best.c,
  };
}

// ─── Base URL Constants ──────────────────────────────────────────────────────

const POKEAPI_SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';
const TRAINERS_BASE = 'https://play.pokemonshowdown.com/sprites/trainers';

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Looks up the version sprite info from the data table.
 * Returns undefined if the version is not in the map.
 */
function getVersionSpriteInfo(gameVersion?: GameVersion) {
  if (!gameVersion) return undefined;
  return VERSION_SPRITE_MAP[gameVersion];
}

/**
 * Looks up the trainer sprite info from the data table.
 * Returns undefined if the version is not in the map.
 */
function getTrainerSpriteInfo(gameVersion?: GameVersion) {
  if (!gameVersion) return undefined;
  return TRAINER_SPRITE_MAP[gameVersion];
}

// ─── Pokemon Sprites ─────────────────────────────────────────────────────────

/**
 * Returns the URL for a Pokemon sprite based on the current sprite mode,
 * the game version, the Pokemon's National Dex ID, shiny state, and form.
 *
 * @param dexId        National Dex ID (e.g. 25 for Pikachu, 201 for Unown)
 * @param mode         Current sprite mode
 * @param gameVersion  Active game version string (e.g. 'Red', 'Crystal')
 * @param isShiny      Whether the Pokemon is shiny (default: false)
 * @param form         Form identifier for species with multiple forms
 *                    (e.g. 'a'-'z','!','?' for Unown). Currently only
 *                    Unown (dexId 201) uses form sprites.
 */
export function getPokemonSpriteUrl(
  dexId: number,
  mode: SpriteMode,
  gameVersion?: GameVersion,
  isShiny: boolean = false,
  form?: string
): string {
  // Unown form sprites: species 201 with a form letter
  if (dexId === 201 && form && !isShiny) {
    return getUnownFormSpriteUrl(form, mode, gameVersion);
  }

  if (isShiny) {
    return getShinyPokemonSpriteUrl(dexId, mode, gameVersion, form);
  }

  switch (mode) {
    case 'game-specific':
      return getGameSpecificPokemonUrl(dexId, gameVersion);

    case 'artwork':
      return `${POKEAPI_SPRITES_BASE}/pokemon/other/official-artwork/${dexId}.png`;

    case 'master':
    default:
      return `${POKEAPI_SPRITES_BASE}/pokemon/${dexId}.png`;
  }
}

/**
 * Returns the URL for a shiny Pokemon sprite.
 *
 * Artwork shiny: /sprites/pokemon/other/official-artwork/shiny/{id}.png
 * Master shiny:  /sprites/pokemon/shiny/{id}.png
 * Game-specific shiny (Gen 2+): /sprites/pokemon/versions/{gen}/{folder}/shiny/{id}.png
 * Game-specific shiny (Gen 1): Falls back to master shiny (no game-specific shiny sprites exist)
 */
function getShinyPokemonSpriteUrl(
  dexId: number,
  mode: SpriteMode,
  gameVersion?: GameVersion,
  _form?: string
): string {
  switch (mode) {
    case 'game-specific':
      return getGameSpecificShinyPokemonUrl(dexId, gameVersion);

    case 'artwork':
      return `${POKEAPI_SPRITES_BASE}/pokemon/other/official-artwork/shiny/${dexId}.png`;

    case 'master':
    default:
      return `${POKEAPI_SPRITES_BASE}/pokemon/shiny/${dexId}.png`;
  }
}

/**
 * Game-specific Pokemon sprite URL — DATA-DRIVEN (A12).
 * Looks up the version in VERSION_SPRITE_MAP and constructs the URL.
 * Falls back to master sprite for unknown versions.
 */
function getGameSpecificPokemonUrl(dexId: number, gameVersion?: GameVersion): string {
  const info = getVersionSpriteInfo(gameVersion);
  if (info) {
    return `${POKEAPI_SPRITES_BASE}/pokemon/versions/${info.gen}/${info.folder}/transparent/${dexId}.png`;
  }
  // Unknown version → fall back to master sprite
  return `${POKEAPI_SPRITES_BASE}/pokemon/${dexId}.png`;
}

/**
 * Game-specific shiny Pokemon sprite URL — DATA-DRIVEN (A12).
 * Uses VERSION_SPRITE_MAP.hasShiny to determine if game-specific shiny exists.
 * Falls back to master shiny for versions without game-specific shiny sprites.
 */
function getGameSpecificShinyPokemonUrl(dexId: number, gameVersion?: GameVersion): string {
  const info = getVersionSpriteInfo(gameVersion);
  if (info && info.hasShiny) {
    return `${POKEAPI_SPRITES_BASE}/pokemon/versions/${info.gen}/${info.folder}/shiny/${dexId}.png`;
  }
  // No game-specific shiny (Gen 1 or unknown) → fall back to master shiny
  return `${POKEAPI_SPRITES_BASE}/pokemon/shiny/${dexId}.png`;
}

// ─── Trainer Sprites ─────────────────────────────────────────────────────────

/**
 * Returns the URL for a trainer sprite based on the current sprite mode,
 * the game version, and the trainer's gender.
 *
 * @param gender       'Male' | 'Female'
 * @param mode         Current sprite mode
 * @param gameVersion  Active game version string
 */
export function getTrainerSpriteUrl(
  gender: string,
  mode: SpriteMode,
  gameVersion?: GameVersion
): string {
  switch (mode) {
    case 'game-specific':
      return getGameSpecificTrainerUrl(gender, gameVersion);

    case 'artwork':
      // No artwork-style trainer sprites exist; fall back to master-style
      return getMasterTrainerUrl(gender, gameVersion);

    case 'master':
    default:
      return getMasterTrainerUrl(gender, gameVersion);
  }
}

/**
 * Game-specific trainer sprite URL — DATA-DRIVEN (A12).
 * Looks up the version in TRAINER_SPRITE_MAP and resolves the filename.
 */
function getGameSpecificTrainerUrl(gender: string, gameVersion?: GameVersion): string {
  const info = getTrainerSpriteInfo(gameVersion);
  if (info) {
    const entry = info.gameSpecific;
    if (typeof entry === 'string') {
      // Version has a single sprite (no gender differentiation)
      return `${TRAINERS_BASE}/${entry}`;
    }
    // Version has gendered sprites
    return `${TRAINERS_BASE}/${gender === 'Female' ? entry.female : entry.male}`;
  }
  // Unknown version → fall back to master style
  return getMasterTrainerUrl(gender, gameVersion);
}

/**
 * Master trainer sprite URL — DATA-DRIVEN (A12).
 * Looks up the version in TRAINER_SPRITE_MAP and resolves the filename.
 */
function getMasterTrainerUrl(gender: string, gameVersion?: GameVersion): string {
  const info = getTrainerSpriteInfo(gameVersion);
  if (info) {
    const isFemale = gender === 'Female';
    return `${TRAINERS_BASE}/${isFemale ? info.master.female : info.master.male}`;
  }
  // Unknown version → default to Red (Gen 1 male trainer)
  return `${TRAINERS_BASE}/red.png`;
}

// ─── Fallback URLs ───────────────────────────────────────────────────────────

/** Fallback URL for missing Pokemon sprites (pokeball placeholder) */
export const POKEMON_SPRITE_FALLBACK = `${POKEAPI_SPRITES_BASE}/pokemon/0.png`;

/** Fallback URL for missing item sprites (pokeball placeholder) */
export const ITEM_SPRITE_FALLBACK = `${POKEAPI_SPRITES_BASE}/items/poke-ball.png`;

/** Fallback URL for missing trainer sprites */
export const TRAINER_SPRITE_FALLBACK = `${TRAINERS_BASE}/red-gen1rb.png`;

// ─── Badge & Item Sprites (mode-independent) ─────────────────────────────────

/** Badge sprite URL — not affected by sprite mode */
export function getBadgeSpriteUrl(gen: number, index: number): string {
  if (gen === 2) {
    if (index < 8) {
      // Johto Badges: IDs 9 to 16 in PokeAPI
      return `${POKEAPI_SPRITES_BASE}/badges/${index + 9}.png`;
    } else {
      // Kanto Badges: IDs 1 to 8 in PokeAPI
      return `${POKEAPI_SPRITES_BASE}/badges/${(index - 8) + 1}.png`;
    }
  }
  // Gen 1: Kanto Badges: IDs 1 to 8 in PokeAPI
  return `${POKEAPI_SPRITES_BASE}/badges/${index + 1}.png`;
}

/** Item sprite URL — not affected by sprite mode */
export function getItemSpriteUrl(slug: string): string {
  return `${POKEAPI_SPRITES_BASE}/items/${slug}.png`;
}

// ─── Static Artwork URLs (Home Page) ─────────────────────────────────────────

/**
 * Returns the static artwork sprite URL for a Pokemon.
 * Used on the home page where sprites should always be artwork
 * regardless of the user's sprite mode setting.
 *
 * @param dexId National Dex ID
 */
export function getArtworkSpriteUrl(dexId: number): string {
  return `${POKEAPI_SPRITES_BASE}/pokemon/other/official-artwork/${dexId}.png`;
}

// ─── CSS Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns the CSS class string that ensures sprites fit consistently
 * regardless of their source resolution.
 *
 * - Master & game-specific sprites are 96x96 px → `pixelated` rendering is fine
 * - Artwork sprites are 475x475+ px → must be scaled down with `object-contain`
 *   and no pixelated rendering
 */
export function getSpriteImgClasses(mode: SpriteMode, baseClasses: string = ''): string {
  if (mode === 'artwork') {
    // Artwork: smooth rendering (no pixelated), object-contain to fit in container
    return `${baseClasses} object-contain`.replace(/\bpixelated\b/g, '').trim();
  }
  // Master & game-specific: pixelated rendering for crisp pixel art
  if (!baseClasses.includes('pixelated')) {
    return `${baseClasses} pixelated`.trim();
  }
  return baseClasses;
}

/**
 * Computes the integer-scale CSS style for small sprites (master/game-specific)
 * displayed in a large container (e.g. Pokédex detail panel).
 *
 * The source sprite is 96x96px for master/game-specific modes.
 * Integer scaling (2x, 3x, 4x…) keeps pixels sharp without blurring.
 * Artwork is already high-res and doesn't need scaling.
 *
 * @param mode          Current sprite mode
 * @param containerSize The container's width/height in px (e.g. 256, 320)
 * @returns CSS style properties object with width, height, and image-rendering
 */
export function getIntegerScaleStyle(
  mode: SpriteMode,
  containerSize: number
): { width: string; height: string; imageRendering: string; objectFit: string } {
  if (mode === 'artwork') {
    // Artwork is already high-res — just fit naturally
    return {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      imageRendering: 'auto',
    };
  }

  // Source sprite is 96x96px. Find the largest integer scale that fits.
  const SPRITE_SIZE = 96;
  const maxScale = Math.floor(containerSize / SPRITE_SIZE);
  const scale = Math.max(1, maxScale);
  const displaySize = SPRITE_SIZE * scale;

  return {
    width: `${displaySize}px`,
    height: `${displaySize}px`,
    imageRendering: 'pixelated',
    objectFit: 'contain',
  };
}

/**
 * Returns the effective sprite mode for a given context.
 * Some views (like Encounters) should not use game-specific sprites
 * because they show cross-generation content.
 *
 * @param mode       Current sprite mode from context
 * @param allowGameSpecific Whether game-specific sprites are appropriate for this view
 * @returns The effective sprite mode to use
 */
export function getEffectiveSpriteMode(
  mode: SpriteMode,
  allowGameSpecific: boolean = true
): SpriteMode {
  if (mode === 'game-specific' && !allowGameSpecific) {
    return 'master';
  }
  return mode;
}

// ─── Unown Form Sprites ────────────────────────────────────────────────────

/**
 * Returns the sprite URL for a specific Unown form — DATA-DRIVEN (A12).
 * Looks up the version in VERSION_SPRITE_MAP and constructs the URL.
 * Falls back to master form sprite for unknown versions.
 *
 * @param form        The form letter (lowercase: 'a'-'z', '!', '?')
 * @param mode        Current sprite mode
 * @param gameVersion Active game version
 */
function getUnownFormSpriteUrl(form: string, mode: SpriteMode, gameVersion?: GameVersion): string {
  const f = form.toLowerCase();
  switch (mode) {
    case 'game-specific': {
      const info = getVersionSpriteInfo(gameVersion);
      if (info) {
        return `${POKEAPI_SPRITES_BASE}/pokemon/versions/${info.gen}/${info.folder}/transparent/201-${f}.png`;
      }
      // Unknown version → fall back to master form sprite
      return `${POKEAPI_SPRITES_BASE}/pokemon/201-${f}.png`;
    }
    case 'artwork':
      // No artwork per-form — fall back to default Unown artwork
      return `${POKEAPI_SPRITES_BASE}/pokemon/other/official-artwork/201.png`;
    case 'master':
    default:
      return `${POKEAPI_SPRITES_BASE}/pokemon/201-${f}.png`;
  }
}

// ─── Gen 2 Shiny Sprite Detection ─────────────────────────────────────────

/**
 * Returns true if the given sprite configuration would produce a Gen 2
 * game-specific shiny sprite URL. These sprites are 40x40px (half the
 * 80x80 regular size) and need Canvas padding to normalize sizing.
 *
 * DATA-DRIVEN (A12): Uses VERSION_SPRITE_MAP.hasShiny instead of
 * hardcoded version name checks.
 *
 * @param mode        Current sprite mode
 * @param gameVersion Active game version
 * @param isShiny     Whether the Pokemon is shiny
 */
export function isGen2GameSpecificShiny(
  mode: SpriteMode,
  gameVersion?: GameVersion,
  isShiny: boolean = false
): boolean {
  if (!isShiny || mode !== 'game-specific') return false;
  const info = getVersionSpriteInfo(gameVersion);
  return info?.hasShiny === true;
}
