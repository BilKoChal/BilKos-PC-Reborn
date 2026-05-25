import React, { useState } from 'react';
import { getPokemonSpriteUrl, POKEMON_SPRITE_FALLBACK, getSpriteImgClasses } from '../../lib/sprites';
import { SpriteMode } from '../../context/SpriteContext';
import { GameVersion } from '../../lib/parser/types';

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
}) => {
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
  return (
    <div className={`relative ${className}`}>
      <img 
        src={getPokemonSpriteUrl(dexId, spriteMode, gameVersion, isShiny)}
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
