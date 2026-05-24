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
 * Shiny support:
 * - Artwork shiny: /sprites/pokemon/other/official-artwork/shiny/{id}.png
 * - Master shiny:  /sprites/pokemon/shiny/{id}.png
 * - Game-specific shiny (Gen 2+): /sprites/pokemon/versions/generation-ii/{game}/shiny/{id}.png
 * - Game-specific shiny (Gen 1): NOT available on PokeAPI — falls back to master shiny
 */

import { SpriteMode } from '../context/SpriteContext';
import { GameVersion } from './parser/types';

// ─── Base URL Constants ──────────────────────────────────────────────────────

const POKEAPI_SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';
const TRAINERS_BASE = 'https://play.pokemonshowdown.com/sprites/trainers';

// ─── Pokemon Sprites ─────────────────────────────────────────────────────────

/**
 * Returns the URL for a Pokemon sprite based on the current sprite mode,
 * the game version, the Pokemon's National Dex ID, and shiny state.
 *
 * @param dexId        National Dex ID (e.g. 25 for Pikachu)
 * @param mode         Current sprite mode
 * @param gameVersion  Active game version string (e.g. 'Red', 'Crystal')
 * @param isShiny      Whether the Pokemon is shiny (default: false)
 */
export function getPokemonSpriteUrl(
  dexId: number,
  mode: SpriteMode,
  gameVersion?: GameVersion,
  isShiny: boolean = false
): string {
  if (isShiny) {
    return getShinyPokemonSpriteUrl(dexId, mode, gameVersion);
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
 * Game-specific shiny (Gen 2+): /sprites/pokemon/versions/generation-ii/{game}/shiny/{id}.png
 * Game-specific shiny (Gen 1): Falls back to master shiny (no game-specific shiny sprites exist)
 */
function getShinyPokemonSpriteUrl(
  dexId: number,
  mode: SpriteMode,
  gameVersion?: GameVersion
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
 * Game-specific Pokemon sprite URLs.
 * Uses PokeAPI's version-specific sprite folders:
 *   Gen 1 Red/Blue → generation-i/red-blue/transparent/
 *   Gen 1 Yellow   → generation-i/yellow/transparent/
 *   Gen 2 Gold     → generation-ii/gold/transparent/
 *   Gen 2 Silver   → generation-ii/silver/transparent/
 *   Gen 2 Crystal  → generation-ii/crystal/transparent/
 *
 * Falls back to master sprite for unknown versions.
 */
function getGameSpecificPokemonUrl(dexId: number, gameVersion?: GameVersion): string {
  switch (gameVersion) {
    case 'Red':
    case 'Blue':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-i/red-blue/transparent/${dexId}.png`;

    case 'Yellow':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-i/yellow/transparent/${dexId}.png`;

    case 'Gold':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-ii/gold/transparent/${dexId}.png`;

    case 'Silver':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-ii/silver/transparent/${dexId}.png`;

    case 'Crystal':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-ii/crystal/transparent/${dexId}.png`;

    default:
      // Unknown version → fall back to master sprite
      return `${POKEAPI_SPRITES_BASE}/pokemon/${dexId}.png`;
  }
}

/**
 * Game-specific shiny Pokemon sprite URLs.
 *
 * Gen 2+ games have version-specific shiny sprites in PokeAPI:
 *   Gold    → generation-ii/gold/shiny/
 *   Silver  → generation-ii/silver/shiny/
 *   Crystal → generation-ii/crystal/shiny/
 *
 * Gen 1 games do NOT have game-specific shiny sprites on PokeAPI,
 * so we fall back to the master shiny sprite (/sprites/pokemon/shiny/{id}.png).
 */
function getGameSpecificShinyPokemonUrl(dexId: number, gameVersion?: GameVersion): string {
  switch (gameVersion) {
    // Gen 1: No game-specific shiny sprites exist → fall back to master shiny
    case 'Red':
    case 'Blue':
    case 'Yellow':
      return `${POKEAPI_SPRITES_BASE}/pokemon/shiny/${dexId}.png`;

    case 'Gold':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-ii/gold/shiny/${dexId}.png`;

    case 'Silver':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-ii/silver/shiny/${dexId}.png`;

    case 'Crystal':
      return `${POKEAPI_SPRITES_BASE}/pokemon/versions/generation-ii/crystal/shiny/${dexId}.png`;

    default:
      // Unknown version → fall back to master shiny sprite
      return `${POKEAPI_SPRITES_BASE}/pokemon/shiny/${dexId}.png`;
  }
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
 * Game-specific trainer sprite URLs.
 * Uses PokemonShowdown's generation-suffixed trainer sprites.
 */
function getGameSpecificTrainerUrl(gender: string, gameVersion?: GameVersion): string {
  const isFemale = gender === 'Female';

  switch (gameVersion) {
    case 'Red':
    case 'Blue':
      return `${TRAINERS_BASE}/red-gen1rb.png`;

    case 'Yellow':
      return `${TRAINERS_BASE}/red-gen1.png`;

    case 'Gold':
    case 'Silver':
    case 'Crystal':
      return isFemale
        ? `${TRAINERS_BASE}/kris-gen2.png`
        : `${TRAINERS_BASE}/ethan-gen2.png`;

    default:
      // Fallback: master style
      return getMasterTrainerUrl(gender, gameVersion);
  }
}

/**
 * Master trainer sprite URLs.
 * Uses PokemonShowdown's non-generation-suffixed trainer sprites.
 */
function getMasterTrainerUrl(gender: string, gameVersion?: GameVersion): string {
  const isGen2 = gameVersion && ['Gold', 'Silver', 'Crystal'].includes(gameVersion);
  const isFemale = gender === 'Female';

  if (isGen2) {
    return isFemale
      ? `${TRAINERS_BASE}/kris.png`
      : `${TRAINERS_BASE}/ethan.png`;
  }

  // Gen 1 (or unknown)
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
