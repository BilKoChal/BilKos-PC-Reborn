import React, { useState, useEffect } from 'react';
import { getPokemonSpriteUrl, POKEMON_SPRITE_FALLBACK, getSpriteImgClasses, isGen2GameSpecificShiny } from '../../lib/sprites';
import { SpriteMode } from '../../context/SpriteContext';
import { GameVersion } from '../../lib/parser/types';
import { Sparkles } from 'lucide-react';

// ─── Gen 2 Shiny Sprite Canvas Padding ──────────────────────────────────────
// Gen 2 game-specific shiny sprites from PokeAPI are 40x40px, while regular
// sprites are 80x80px. This cache stores padded data URLs (80x80 with 20px
// transparent border on each side) so sprites render at consistent sizes.
const paddedSpriteCache = new Map<string, string>();

/**
 * Pads a 40x40 Gen 2 shiny sprite to 80x80 by drawing it centered on a
 * transparent 80x80 canvas (adding 20px transparent border on each side).
 * Results are cached by URL so each sprite is only processed once.
 */
function padSpriteTo80x80(url: string): Promise<string> {
  if (paddedSpriteCache.has(url)) {
    return Promise.resolve(paddedSpriteCache.get(url)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Only pad if the sprite is smaller than 80x80
      if (img.naturalWidth >= 80 && img.naturalHeight >= 80) {
        paddedSpriteCache.set(url, url);
        resolve(url);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        paddedSpriteCache.set(url, url);
        resolve(url);
        return;
      }

      // Center the sprite with padding on each side
      const offsetX = (80 - img.naturalWidth) / 2;
      const offsetY = (80 - img.naturalHeight) / 2;
      ctx.imageSmoothingEnabled = false; // Preserve pixel art
      ctx.drawImage(img, offsetX, offsetY, img.naturalWidth, img.naturalHeight);

      const dataUrl = canvas.toDataURL('image/png');
      paddedSpriteCache.set(url, dataUrl);
      resolve(dataUrl);
    };
    img.onerror = () => {
      // On error, just use the original URL
      paddedSpriteCache.set(url, url);
      resolve(url);
    };
    img.src = url;
  });
}

interface PokemonSpriteProps {
  dexId: number;
  isShiny: boolean;
  isEgg: boolean;
  speciesName: string;
  spriteMode: SpriteMode;
  gameVersion?: GameVersion;
  className?: string;
  imgClassName?: string;
  showOverlays?: boolean; // default true
  draggable?: boolean;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  loading?: 'lazy' | 'eager';
  /** Form identifier for species with multiple forms (e.g. Unown letter 'a'-'z') */
  form?: string;
}

/**
 * PokemonSprite — Renders a Pokemon sprite with optional egg and shiny overlays
 * using lucide-react icons.
 *
 * - Egg overlay: lucide `Egg` icon displayed over the sprite for egg Pokemon
 * - Shiny overlay: lucide `Sparkles` icon badge at top-right for shiny Pokemon
 * - Gen 2 shiny sprite padding: automatically pads 40x40px Gen 2 shiny sprites
 *   to 80x80px for consistent sizing
 */
export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  dexId,
  isShiny,
  isEgg,
  speciesName,
  spriteMode,
  gameVersion,
  className = '',
  imgClassName = '',
  showOverlays = true,
  draggable = false,
  style,
  onError,
  loading,
  form,
}) => {
  // Gen 2 shiny sprite padding state
  const [paddedSrc, setPaddedSrc] = useState<string | null>(null);
  const needsPadding = isGen2GameSpecificShiny(spriteMode, gameVersion, isShiny);
  const originalSrc = getPokemonSpriteUrl(dexId, spriteMode, gameVersion, isShiny, form);

  useEffect(() => {
    if (needsPadding) {
      padSpriteTo80x80(originalSrc).then(setPaddedSrc);
    } else {
      setPaddedSrc(null);
    }
  }, [needsPadding, originalSrc]);

  const imgSrc = paddedSrc || originalSrc;

  // Egg redesign: show a clean egg graphic INSTEAD of the species sprite (an egg
  // hides its species in-game), rather than overlaying a badge on the visible
  // species — which read as a sticker. Dependency-free inline SVG so it always
  // renders crisply at any size.
  if (isEgg) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={style}>
        <svg viewBox="0 0 100 120" role="img" aria-label={`${speciesName} (Egg)`}
          className={`w-full h-full object-contain drop-shadow-lg ${imgClassName}`}>
          <defs>
            <radialGradient id="eggShade" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#fffdf7" />
              <stop offset="70%" stopColor="#f3ecd9" />
              <stop offset="100%" stopColor="#e2d7bd" />
            </radialGradient>
          </defs>
          {/* Egg body: narrower/pointed top, rounded bottom (classic egg silhouette) */}
          <path d="M50 6 C72 6 90 44 90 74 C90 99 72 116 50 116 C28 116 10 99 10 74 C10 44 28 6 50 6 Z"
            fill="url(#eggShade)" stroke="#c9bb97" strokeWidth="2.5" />
          {/* Spots (the iconic Gen 2 egg blotches) */}
          <g fill="#6ee7b7" opacity="0.9">
            <ellipse cx="38" cy="52" rx="11" ry="9" />
            <ellipse cx="63" cy="44" rx="7" ry="6" />
            <ellipse cx="60" cy="78" rx="12" ry="10" />
            <ellipse cx="36" cy="88" rx="6" ry="5" />
          </g>
          {/* Soft highlight */}
          <ellipse cx="38" cy="34" rx="12" ry="16" fill="#ffffff" opacity="0.45" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={imgSrc}
        alt={speciesName}
        className={getSpriteImgClasses(spriteMode, imgClassName)}
        draggable={draggable}
        style={style}
        onError={onError || ((e) => { (e.target as HTMLImageElement).src = POKEMON_SPRITE_FALLBACK })}
        loading={loading}
      />
      {/* Shiny overlay — lucide Sparkles icon badge */}
      {isShiny && showOverlays && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg z-10">
          <Sparkles size={12} className="text-yellow-900" />
        </div>
      )}
    </div>
  );
};
