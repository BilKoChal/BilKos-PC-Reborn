import React, { useState, useEffect } from 'react';
import { getPokemonSpriteUrl, POKEMON_SPRITE_FALLBACK, getSpriteImgClasses, isGen2GameSpecificShiny } from '../../lib/sprites';
import { SpriteMode } from '../../context/SpriteContext';
import { GameVersion } from '../../lib/parser/types';
import { Egg, Sparkles } from 'lucide-react';

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
      {/* Egg overlay — lucide Egg icon */}
      {isEgg && showOverlays && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-green-400/80 dark:bg-green-500/80 rounded-full p-1.5 shadow-lg border-2 border-white dark:border-gray-800">
            <Egg size={16} className="text-white" />
          </div>
        </div>
      )}
      {/* Shiny overlay — lucide Sparkles icon badge */}
      {isShiny && showOverlays && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg z-10">
          <Sparkles size={12} className="text-yellow-900" />
        </div>
      )}
    </div>
  );
};
