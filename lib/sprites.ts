/**
 * Centralized Sprite URL Resolver
 *
 * Provides a single source of truth for all Pokemon and trainer sprite URLs.
 * Every component should call these functions instead of constructing URLs inline.
 *
 * Three sprite modes are supported:
 * - 'game-specific': Version-specific pixel sprites from PokeAPI's generation folders
 * - 'master': Standard PokeAPI "master" pixel sprites (same for all versions)
 * - 'artwork': Official artwork (high-res illustrations)
 */

import { SpriteMode } from '../context/SpriteContext';
import { GameVersion } from './parser/types';

// ─── Base URL Constants ──────────────────────────────────────────────────────

const POKEAPI_SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';
const TRAINERS_BASE = 'https://play.pokemonshowdown.com/sprites/trainers';

// ─── Pokemon Sprites ─────────────────────────────────────────────────────────

/**
 * Returns the URL for a Pokemon sprite based on the current sprite mode,
 * the game version, and the Pokemon's National Dex ID.
 *
 * @param dexId    National Dex ID (e.g. 25 for Pikachu)
 * @param mode     Current sprite mode
 * @param gameVersion  Active game version string (e.g. 'Red', 'Crystal')
 */
export function getPokemonSpriteUrl(
  dexId: number,
  mode: SpriteMode,
  gameVersion?: GameVersion
): string {
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

// ─── CSS Helper ──────────────────────────────────────────────────────────────

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
