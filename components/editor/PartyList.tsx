
import React, { memo } from 'react';
import { PokemonStats, Generation, GameVersion } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Ban, MousePointer2 } from 'lucide-react';
import { TypeBadge, StatusBadge } from '../ui/PokemonBadges';
import { MoveLocation } from '../../lib/utils/manipulation';
import { useSlotLogic } from '../../lib/hooks/useSlotLogic';

interface PartyListProps {
    party: PokemonStats[];
    generation: Generation;
    gameVersion?: GameVersion;
    isMoveMode?: boolean;
    onEnableMoveMode?: () => void;
    selectedMoveSources?: MoveLocation[];
    onPokemonClick?: (mon: PokemonStats, index: number, e: React.MouseEvent) => void;
    onEmptySlotClick?: (index: number, e: React.MouseEvent) => void;
    onToggleSelection?: (index: number) => void;
    onDropPokemon?: (index: number, e: React.DragEvent) => void;
}

// Memoized Slot Component
const PokemonSlot = memo<{ 
    mon: PokemonStats; 
    index: number; 
    isSelected?: boolean;
    isMoveMode?: boolean;
    onEnableMoveMode?: () => void;
    onClick: (mon: PokemonStats, index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    onToggleSelection?: (index: number) => void;
    onDropPokemon?: (index: number, boxIndex: number | undefined, e: React.DragEvent) => void;
}>(({ mon, index, isSelected, isMoveMode, onEnableMoveMode, onClick, onToggleSelection, onDropPokemon }) => {
    
    // Use the DRY hook
    const { 
        handleDragStart, handleDrop, handlePointerDown, handlePointerUp, handleClick 
    } = useSlotLogic({
        mon, index, isMoveMode, isSelected, onEnableMoveMode,
        onToggleSelection, onPokemonClick: onClick, onDropPokemon
    });

    // HP Calculation
    const hpPercent = mon.maxHp > 0 ? (mon.hp / mon.maxHp) * 100 : 0;
    let hpColor = 'bg-green-500';
    if (hpPercent < 50) hpColor = 'bg-yellow-500';
    if (hpPercent < 20) hpColor = 'bg-red-500';

    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.dexId}.png`;

    return (
        <div 
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onMouseUp={handlePointerUp}
            onTouchEnd={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onClick={handleClick}
            draggable={!!mon}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`
                bg-white dark:bg-gray-800 rounded-xl border p-3 shadow-sm transition-all flex flex-col justify-between h-full select-none relative
                ${isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-400 scale-95 bg-blue-50 dark:bg-blue-900/20' 
                    : isMoveMode
                        ? 'border-blue-200 dark:border-blue-900 cursor-grab hover:border-blue-400 hover:shadow-md active:cursor-grabbing'
                        : 'border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 group active:scale-95'
                }
            `}
        >
             {/* Checkbox for Multi-Select */}
             {isMoveMode && (
                 <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSelection && onToggleSelection(index); }}
                    className="absolute top-2 left-2 z-20 p-2 -m-2 cursor-pointer"
                 >
                     <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}>
                         {isSelected && <MousePointer2 size={12} className="text-white" />}
                     </div>
                 </div>
             )}

             {!isMoveMode && (
                 <div className="absolute top-2 left-2 text-gray-300 dark:text-gray-600 flex items-center gap-1 z-10">
                    <span className="font-mono text-xs font-bold opacity-50">{index + 1}</span>
                 </div>
             )}

             {/* Top Right: Level & Status */}
             <div className="flex justify-end items-start w-full mb-1 h-6 relative z-10 pl-6">
                 <div className="flex gap-1 items-center">
                    {mon.status !== 'OK' && <StatusBadge status={mon.status} />}
                    <div className="text-xs font-black text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Lv.{mon.level}
                    </div>
                 </div>
             </div>

             {/* Center: Sprite */}
             <div className="flex-grow flex items-center justify-center py-2 relative">
                 <div className={`w-40 h-40 relative flex items-center justify-center transition-transform duration-300 ${!isMoveMode && 'group-hover:scale-105'}`}>
                    <img 
                        src={spriteUrl} 
                        alt={mon.speciesName}
                        className="w-full h-full object-contain pixelated"
                        draggable={false}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }}
                    />
                 </div>
             </div>
             
             {/* Info Block */}
             <div className="flex flex-col items-center gap-0.5 mb-2 w-full px-1">
                 <div className="flex items-center justify-center gap-1.5 w-full">
                     <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight leading-none truncate max-w-full text-center">
                        {mon.nickname}
                     </h3>
                 </div>
                 
                 <span className="text-xs text-gray-400 uppercase font-bold tracking-wide truncate max-w-full">{mon.speciesName}</span>
             </div>

             {/* Types */}
             <div className="flex gap-1 justify-center mb-3 flex-wrap">
                 <TypeBadge type={mon.type1Name} size="sm" />
                 {mon.type1 !== mon.type2 && mon.type2Name !== mon.type1Name && (
                     <TypeBadge type={mon.type2Name} size="sm" />
                 )}
             </div>

             {/* HP Bar */}
             <div className="w-full space-y-1">
                 <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                    <span>HP</span>
                    <span>{mon.hp}/{mon.maxHp}</span>
                 </div>
                 <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-100 dark:border-gray-600">
                     <div 
                        className={`h-full ${hpColor} transition-all duration-500`} 
                        style={{ width: `${hpPercent}%` }}
                     ></div>
                 </div>
             </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.mon === next.mon && 
        prev.isSelected === next.isSelected && 
        prev.isMoveMode === next.isMoveMode
    );
});

export const PartyList: React.FC<PartyListProps> = ({ 
    party, isMoveMode, onEnableMoveMode, selectedMoveSources = [], 
    onPokemonClick, onEmptySlotClick, onToggleSelection, onDropPokemon
}) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();

    const isSlotSelected = (idx: number) => {
        return selectedMoveSources.some(s => s.type === 'party' && s.index === idx);
    };

    const handleEmptyDrop = (e: React.DragEvent, idx: number) => {
        if (onDropPokemon) {
            e.preventDefault();
            onDropPokemon(idx, e);
        }
    };

    return (
        <div 
            className="relative w-full flex flex-col rounded-2xl p-5 transition-all duration-300 bg-theme-primary text-theme-text-on-primary shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Heart className="fill-current" size={24} />
                    <h3 className="font-black text-xl tracking-wide uppercase">Party</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-black/20 px-3 py-1.5 rounded-full font-bold backdrop-blur-sm border border-white/10">
                        {party.length} / 6
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                {party.map((mon, idx) => (
                    <div key={`${idx}-party`} className="h-80">
                        <PokemonSlot 
                            mon={mon} 
                            index={idx} 
                            isSelected={isSlotSelected(idx)}
                            isMoveMode={isMoveMode}
                            onEnableMoveMode={onEnableMoveMode}
                            onClick={(m, i, b, e) => onPokemonClick && onPokemonClick(m, i, e)}
                            onToggleSelection={(i) => onToggleSelection && onToggleSelection(i)}
                            onDropPokemon={(i, b, e) => onDropPokemon && onDropPokemon(i, e)}
                        />
                    </div>
                ))}
                
                {Array.from({ length: 6 - party.length }).map((_, i) => {
                    const actualIdx = party.length + i;
                    return (
                        <div 
                            key={`empty-${i}`} 
                            onClick={(e) => onEmptySlotClick && onEmptySlotClick(actualIdx, e)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleEmptyDrop(e, actualIdx)}
                            className={`
                                h-80 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-default
                                ${isMoveMode ? 'hover:bg-white/20 cursor-pointer hover:border-white/60' : 'bg-white/10 group'}
                            `}
                        >
                            <div className="p-3 bg-white/10 rounded-full text-white/50 group-hover:text-white/80 group-hover:scale-110 transition-all">
                                <Ban size={32} />
                            </div>
                            <span className="text-sm text-white/50 font-bold uppercase tracking-widest group-hover:text-white/80">Empty Slot</span>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-auto pt-4 text-xs text-white/60 text-center uppercase font-bold tracking-widest">
                {isMoveMode ? 'Drag or Check to Move' : 'Click to Edit / Hold to Move'}
            </div>
        </div>
    );
};
