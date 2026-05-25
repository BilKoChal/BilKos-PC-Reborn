import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPokemonSpriteUrl, POKEMON_SPRITE_FALLBACK, getSpriteImgClasses, isGen2GameSpecificShiny } from '../../lib/sprites';
import { SpriteMode } from '../../context/SpriteContext';
import { GameVersion } from '../../lib/parser/types';

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

      // Center the sprite with 20px padding on each side
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

interface PokemonSpriteWithOverlaysProps {
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

export const PokemonSpriteWithOverlays: React.FC<PokemonSpriteWithOverlaysProps> = ({
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

  // For egg Pokemon, show an egg visual
  if (isEgg && showOverlays) {
    return (
      <div className={`relative ${className}`}>
        {/* Egg body - CSS-drawn egg shape */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-[70%] h-[85%]">
            {/* Main egg shape */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50 to-green-100 dark:from-gray-200 dark:via-green-100 dark:to-green-200 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-green-200 dark:border-green-400 shadow-md">
              {/* Egg spots */}
              <div className="absolute top-[25%] left-[20%] w-3 h-3 rounded-full bg-green-200 dark:bg-green-500/40"></div>
              <div className="absolute top-[40%] right-[25%] w-4 h-4 rounded-full bg-green-200 dark:bg-green-500/40"></div>
              <div className="absolute bottom-[30%] left-[35%] w-2.5 h-2.5 rounded-full bg-green-200 dark:bg-green-500/40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For regular Pokemon, show sprite with optional overlays
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
      {/* Shiny star overlay */}
      {isShiny && showOverlays && (
        <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg z-10">
          <span className="text-[10px] leading-none text-yellow-900 font-black">★</span>
        </div>
      )}
    </div>
  );
};
