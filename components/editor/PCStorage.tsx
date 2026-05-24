
import React, { useState, useEffect, useRef, memo } from 'react';
import { PokemonStats, GameVersion } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { Grid, ChevronLeft, ChevronRight, Monitor, List, ChevronDown, CheckCircle2, Box, MousePointer2, CheckSquare, Square, Move, Shuffle, Power, Download, Plus } from 'lucide-react';
import { TypeBadge, StatusBadge } from '../ui/PokemonBadges';
import { MoveLocation } from '../../lib/utils/manipulation';
import { useSlotLogic } from '../../lib/hooks/useSlotLogic';
import { parsePk1 } from '../../lib/generations/gen1/parser';
import { DND_DATA_TYPE } from '../../lib/hooks/dndTypes';

interface PCStorageProps {
    boxes: PokemonStats[][];
    currentBoxIndex: number;
    isMoveMode?: boolean;
    onEnableMoveMode?: () => void;
    onToggleMoveMode?: () => void;
    selectedMoveSources?: MoveLocation[];
    onPokemonClick?: (mon: PokemonStats, index: number, boxIndex: number, e: React.MouseEvent) => void;
    onEmptySlotClick?: (index: number, boxIndex: number, e: React.MouseEvent) => void;
    onToggleSelection?: (index: number, boxIndex: number) => void;
    onDropPokemon?: (index: number, boxIndex: number, e: React.DragEvent) => void;
    onMove?: (source: MoveLocation, target: MoveLocation) => void; 
    onSortClick?: () => void;
    onSetActiveBox?: (boxIndex: number) => void;
    onImport?: (newBoxData: PokemonStats[], boxIndex: number) => void;
    onToast?: (msg: string) => void;
    tabId?: string;
    gameVersion?: GameVersion;
}

type ViewMode = 'grid' | 'list';

// Version to color mapping for themed drag rings
const getVersionThemeColor = (version?: GameVersion) => {
    switch (version) {
        case 'Red': return { ring: 'ring-red-400', border: 'border-red-400', shadow: 'shadow-red-400/50', bg: 'bg-red-50 dark:bg-red-900/20' };
        case 'Blue': return { ring: 'ring-blue-400', border: 'border-blue-400', shadow: 'shadow-blue-400/50', bg: 'bg-blue-50 dark:bg-blue-900/20' };
        case 'Yellow': return { ring: 'ring-yellow-400', border: 'border-yellow-400', shadow: 'shadow-yellow-400/50', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
        case 'Gold': return { ring: 'ring-amber-400', border: 'border-amber-400', shadow: 'shadow-amber-400/50', bg: 'bg-amber-50 dark:bg-amber-900/20' };
        case 'Silver': return { ring: 'ring-slate-400', border: 'border-slate-400', shadow: 'shadow-slate-400/50', bg: 'bg-slate-50 dark:bg-slate-900/20' };
        case 'Crystal': return { ring: 'ring-cyan-400', border: 'border-cyan-400', shadow: 'shadow-cyan-400/50', bg: 'bg-cyan-50 dark:bg-cyan-900/20' };
        default: return { ring: 'ring-blue-400', border: 'border-blue-400', shadow: 'shadow-blue-400/50', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    }
};

// Memoized Slot Component
const BoxSlot = memo<{
    mon: PokemonStats | undefined;
    slotIndex: number;
    viewedBoxIndex: number;
    isMoveMode?: boolean;
    isSelected: boolean;
    viewMode: ViewMode;
    tabId?: string;
    gameVersion?: GameVersion;
    onPokemonClick?: (mon: PokemonStats, index: number, boxIndex: number, e: React.MouseEvent) => void;
    onEmptySlotClick?: (index: number, boxIndex: number, e: React.MouseEvent) => void;
    onToggleSelection?: (index: number, boxIndex: number) => void;
    onDropPokemon?: (index: number, boxIndex: number, e: React.DragEvent) => void;
    onEnableMoveMode?: () => void;
}>(({ 
    mon, slotIndex, viewedBoxIndex, isMoveMode, isSelected, viewMode,
    tabId, gameVersion,
    onPokemonClick, onEmptySlotClick, onToggleSelection, onDropPokemon, onEnableMoveMode 
}) => {
    
    const [isDragOver, setIsDragOver] = useState(false);
    const themeColors = getVersionThemeColor(gameVersion);

    // Use DRY hook
    const { 
        handleDragStart, handleDragOver, handleDrop, handlePointerDown, handlePointerUp, handleClick 
    } = useSlotLogic({
        mon, index: slotIndex, boxIndex: viewedBoxIndex, isMoveMode, isSelected, tabId,
        onEnableMoveMode, onToggleSelection, onPokemonClick, onEmptySlotClick, onDropPokemon
    });

    if (viewMode === 'list') {
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
                onDragOver={(e) => {
                    handleDragOver(e);
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    setIsDragOver(false);
                    handleDrop(e);
                }}
                className={`
                    flex items-center p-0 rounded-2xl border transition-all cursor-pointer group h-24 overflow-hidden relative select-none
                    ${isDragOver
                        ? `ring-4 ${themeColors.ring} ${themeColors.border} scale-105 z-40 ${themeColors.shadow} shadow-xl ${themeColors.bg}`
                        : mon
                            ? `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 shadow-sm hover:shadow-md 
                               ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-400' : ''}`
                            : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 border-dashed opacity-60'
                    }
                `}
            >
                {/* Left: Index & Decoration */}
                <div className="h-full w-12 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative shrink-0">
                    <span className="text-2xl font-black text-gray-200 dark:text-gray-700 absolute font-mono">{String(slotIndex + 1).padStart(2, '0')}</span>
                    {/* List View Checkbox */}
                    {isMoveMode && mon && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); onToggleSelection && onToggleSelection(slotIndex, viewedBoxIndex); }}
                            className="absolute top-1 left-1 z-30 p-2 cursor-pointer"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-500 bg-white rounded shadow-sm" />
                            ) : (
                                <Square className="w-4 h-4 text-blue-400 bg-white/60 rounded shadow-sm hover:text-blue-500" />
                            )}
                        </div>
                    )}
                </div>

                {mon ? (
                    <>
                        <div className="w-24 h-24 flex items-center justify-center shrink-0 -ml-2">
                            <img 
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.dexId}.png`}
                                alt={mon.speciesName}
                                className="w-20 h-20 object-contain pixelated drop-shadow-md transition-transform group-hover:scale-110"
                            />
                        </div>
                        <div className="flex-grow min-w-0 pr-4 flex flex-col justify-center h-full">
                            <div className="flex items-end gap-2 mb-1">
                                <span className="font-black text-xl text-gray-800 dark:text-white leading-none tracking-tight truncate">{mon.nickname}</span>
                                <span className="text-xs font-bold text-gray-400 uppercase pb-0.5">{mon.speciesName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex gap-1">
                                    <TypeBadge type={mon.type1Name} size="sm" showLabel={false} />
                                    {mon.type1 !== mon.type2 && <TypeBadge type={mon.type2Name} size="sm" showLabel={false} />}
                                </div>
                                <div className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                    Lv.{mon.level}
                                </div>
                                {mon.status !== 'OK' && <StatusBadge status={mon.status} size="sm" />}
                            </div>
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${Math.min(100, (mon.hp / mon.maxHp) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-300 dark:text-gray-700 font-bold uppercase tracking-widest text-sm">
                        {isDragOver ? 'Drop Here' : 'Empty Slot'}
                    </div>
                )}
            </div>
        );
    }

    // Grid View
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
            onDragOver={(e) => {
                handleDragOver(e);
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                setIsDragOver(false);
                handleDrop(e);
            }}
            className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-between p-2
                transition-all duration-200 border-2 group select-none
                ${isDragOver
                    ? `ring-4 ${themeColors.ring} ${themeColors.border} scale-110 z-40 ${themeColors.shadow} shadow-2xl ${themeColors.bg} animate-pulse`
                    : mon 
                        ? `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                           ${isSelected 
                               ? 'border-blue-500 ring-4 ring-offset-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg z-20' 
                               : isMoveMode 
                                   ? 'hover:border-blue-400 cursor-grab active:cursor-grabbing' 
                                   : 'hover:border-blue-500 hover:shadow-md cursor-pointer'
                           } 
                          `
                        : `bg-gray-200/50 dark:bg-gray-800/30 border-transparent border-dashed 
                           ${isMoveMode ? 'hover:border-blue-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'hover:bg-gray-200 dark:hover:bg-gray-800/50'}
                          `
                }
            `}
        >
            {/* Multi-Select Checkbox */}
            {isMoveMode && mon && (
                <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSelection && onToggleSelection(slotIndex, viewedBoxIndex); }}
                    className="absolute top-1 left-1 z-30 p-1 cursor-pointer"
                >
                    {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-500 bg-white rounded shadow-sm" />
                    ) : (
                        <Square className="w-4 h-4 text-blue-400 bg-white/60 rounded shadow-sm hover:text-blue-500 hover:bg-white transition-colors" />
                    )}
                </div>
            )}

            {mon ? (
                <>
                    <div className="w-full flex justify-between items-start pl-4">
                        <div className="flex flex-col gap-1">
                             <TypeBadge type={mon.type1Name} size="sm" showLabel={false} />
                             {mon.type1 !== mon.type2 && <TypeBadge type={mon.type2Name} size="sm" showLabel={false} />}
                        </div>
                        <span className="text-xs font-bold text-gray-400">Lv.{mon.level}</span>
                    </div>

                    {/* Sprite */}
                    <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.dexId}.png`} 
                        alt={mon.speciesName}
                        className={`w-24 h-24 object-contain pixelated transition-transform -my-2 ${!isMoveMode && 'group-hover:scale-110'}`}
                        loading="lazy"
                        draggable={false}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }}
                    />
                    
                    <div className="w-full text-center relative z-10">
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate leading-none mb-1">
                            {mon.nickname}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase truncate">
                            {mon.speciesName}
                        </div>
                    </div>

                    {mon.status !== 'OK' && (
                        <div className="absolute top-8 right-2">
                            <StatusBadge status={mon.status} size="sm" />
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700">
                    {isDragOver ? (
                        <>
                            <Plus size={24} className="mb-1 opacity-80" />
                            <span className="text-[10px] font-bold uppercase">Drop Here</span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-mono font-bold">{slotIndex + 1}</span>
                            <Box size={24} className="mt-2 opacity-50" />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    return (
        prev.mon === next.mon &&
        prev.isSelected === next.isSelected &&
        prev.viewMode === next.viewMode &&
        prev.isMoveMode === next.isMoveMode &&
        prev.viewedBoxIndex === next.viewedBoxIndex &&
        prev.gameVersion === next.gameVersion
    );
});

export const PCStorage: React.FC<PCStorageProps> = ({ 
    boxes, currentBoxIndex, isMoveMode, onEnableMoveMode, onToggleMoveMode, selectedMoveSources = [], 
    onPokemonClick, onEmptySlotClick, onToggleSelection, onDropPokemon, onSortClick, onSetActiveBox, onImport, onToast,
    tabId, gameVersion
}) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    const isLightTheme = theme?.id === 'yellow' || theme?.id === 'gold' || theme?.id === 'silver' || theme?.id === 'crystal';
    const headerTextColor = isLightTheme ? 'text-gray-900 border-black/10' : 'text-white border-white/10';
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Viewing State (Default to current active box)
    const [viewedBoxIndex, setViewedBoxIndex] = useState(currentBoxIndex);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isBoxMenuOpen, setIsBoxMenuOpen] = useState(false);
    const boxMenuRef = useRef<HTMLDivElement>(null);

    const activeBox = boxes[viewedBoxIndex] || [];
    const MAX_BOXES = boxes.length;

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (boxMenuRef.current && !boxMenuRef.current.contains(event.target as Node)) {
                setIsBoxMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const nextBox = () => setViewedBoxIndex((prev) => (prev + 1) % MAX_BOXES);
    const prevBox = () => setViewedBoxIndex((prev) => (prev - 1 + MAX_BOXES) % MAX_BOXES);
    
    const jumpToBox = (index: number) => {
        setViewedBoxIndex(index);
        setIsBoxMenuOpen(false);
    };

    const isSlotSelected = (idx: number) => {
        return selectedMoveSources.some(s => s.type === 'box' && s.boxIndex === viewedBoxIndex && s.index === idx);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !onImport) return;
        
        const files: File[] = Array.from(e.target.files);
        let importedCount = 0;

        for (const file of files) {
            if (!file.name.endsWith('.pk1')) continue;

            const buffer = await file.arrayBuffer();
            const mon = parsePk1(new Uint8Array(buffer));

            if (!mon) {
                if (onToast) onToast(`Error: Invalid .pk1 file (${file.name})`);
                continue;
            }

            let targetBoxIndex = viewedBoxIndex;
            
            if (boxes[targetBoxIndex].length >= 20) {
                let foundIndex = -1;
                for (let i = 1; i < MAX_BOXES; i++) {
                    const checkIndex = (viewedBoxIndex + i) % MAX_BOXES;
                    if (boxes[checkIndex].length < 20) {
                        foundIndex = checkIndex;
                        break;
                    }
                }

                if (foundIndex !== -1) {
                    targetBoxIndex = foundIndex;
                    if (onToast) onToast(`Box ${viewedBoxIndex + 1} is full! Importing to Box ${targetBoxIndex + 1}.`);
                } else {
                    if (onToast) onToast("PC Storage is completely full! Cannot import.");
                    break;
                }
            }

            mon.isParty = false;
            
            const targetBoxData = [...boxes[targetBoxIndex]];
            targetBoxData.push(mon);
            
            onImport(targetBoxData, targetBoxIndex);
            importedCount++;
            
            if (onToast) onToast(`Imported ${mon.nickname} successfully!`);
        }
        
        e.target.value = '';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-auto relative">
            <input 
                type="file" 
                multiple 
                accept=".pk1" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
            />

            {/* --- HEADER --- */}
            <div 
                className="flex flex-col z-20 relative shadow-md transition-colors duration-300 bg-theme-primary text-theme-text-on-primary"
            >
                {/* Row 1: Title & Tools */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-current/10">
                    <div className="flex items-center gap-2">
                        <Monitor size={18} />
                        <span className="font-bold text-base uppercase tracking-wide hidden sm:block">PC Storage</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {onImport && (
                            <button 
                                onClick={handleImportClick}
                                className={`p-1 rounded-lg transition-colors border bg-current/10 hover:bg-current/20 border-transparent ${isLightTheme ? 'text-gray-900' : 'text-white'}`}
                                title="Import .pk1"
                            >
                                <Download size={16} />
                            </button>
                        )}

                        {/* View Mode Toggle */}
                        <div className={`flex rounded-lg p-0.5 ${isLightTheme ? 'bg-black/10' : 'bg-black/20'}`}>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1 rounded transition-all ${
                                    viewMode === 'grid' 
                                        ? (isLightTheme ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm') 
                                        : (isLightTheme ? 'text-gray-900/60 hover:text-gray-900 hover:bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10')
                                }`}
                                title="Grid View"
                            >
                                <Grid size={14} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1 rounded transition-all ${
                                    viewMode === 'list' 
                                        ? (isLightTheme ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm') 
                                        : (isLightTheme ? 'text-gray-900/60 hover:text-gray-900 hover:bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10')
                                }`}
                                title="List View"
                            >
                                <List size={14} />
                            </button>
                        </div>

                        {onSortClick && (
                            <button 
                                onClick={onSortClick}
                                className={`p-1 rounded-lg transition-colors border bg-current/10 hover:bg-current/20 border-transparent ${isLightTheme ? 'text-gray-900/90' : 'text-white/90'}`}
                                title="Sort PC"
                            >
                                <Shuffle size={16} />
                            </button>
                        )}

                        {onToggleMoveMode && (
                            <button 
                                onClick={onToggleMoveMode}
                                className={`
                                    p-1 rounded-lg transition-all border
                                    ${isMoveMode 
                                        ? (isLightTheme ? 'bg-gray-900 text-white border-transparent shadow-sm' : 'bg-white text-blue-600 border-white shadow-sm') 
                                        : `bg-current/10 border-transparent ${isLightTheme ? 'text-gray-900' : 'text-white'} hover:bg-current/20`
                                    }
                                `}
                                title={isMoveMode ? "Disable Move Mode" : "Enable Move Mode"}
                            >
                                <Move size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Row 2: Box Navigation (Compact) */}
                <div className={`px-4 py-1.5 flex items-center justify-between ${isLightTheme ? 'bg-black/5' : 'bg-black/10'}`}>
                    <button 
                        onClick={prevBox} 
                        className={`w-8 h-8 flex items-center justify-center bg-current/10 hover:bg-current/20 rounded-full transition-all active:scale-95 shadow-sm border border-transparent ${isLightTheme ? 'text-gray-900' : 'text-white'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2" ref={boxMenuRef}>
                        <div className="relative">
                            <button 
                                onClick={() => setIsBoxMenuOpen(!isBoxMenuOpen)}
                                className={`flex items-center justify-center gap-2 px-3 py-1 bg-current/10 hover:bg-current/20 rounded-full transition-colors min-w-[100px] ${isLightTheme ? 'text-gray-900' : 'text-white'}`}
                            >
                                <span className="font-bold text-sm uppercase tracking-wider select-none leading-none">BOX {viewedBoxIndex + 1}</span>
                                <ChevronDown size={14} className="opacity-70" />
                            </button>

                            {/* Dropdown Menu */}
                            {isBoxMenuOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700">
                                        Jump to Box
                                    </div>
                                    <div className="max-h-60 overflow-y-auto no-scrollbar p-1">
                                        {boxes.map((box, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => jumpToBox(idx)}
                                                className={`
                                                    w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors
                                                    ${idx === viewedBoxIndex 
                                                        ? 'bg-theme-accent text-theme-primary font-bold' 
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${idx === currentBoxIndex ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                    <span>BOX {idx + 1}</span>
                                                </div>
                                                <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 rounded-full">
                                                    {box.length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={nextBox} 
                        className={`w-8 h-8 flex items-center justify-center bg-current/10 hover:bg-current/20 rounded-full transition-all active:scale-95 shadow-sm border border-transparent ${isLightTheme ? 'text-gray-900' : 'text-white'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* --- ACTIVE BOX STATUS BAR --- */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    {viewedBoxIndex === currentBoxIndex ? (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-900/50">
                            <CheckCircle2 size={12} /> Active Box
                        </span>
                    ) : (
                        <div className="flex items-center gap-2">
                            {onSetActiveBox && (
                                <button 
                                    onClick={() => onSetActiveBox(viewedBoxIndex)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase transition-all border border-blue-200 dark:border-blue-800 shadow-sm"
                                    title="Set this box as the current active box in-game"
                                >
                                    <Power size={12} /> Set Active
                                </button>
                            )}
                            <span className="text-gray-400 dark:text-gray-500 font-mono hidden sm:inline">
                                (Current: <strong>BOX {currentBoxIndex + 1}</strong>)
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-gray-400 font-mono font-bold">
                    {activeBox.length} / 20 <span className="text-[10px] font-normal opacity-70">POKÉMON</span>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-4 bg-gray-100 dark:bg-black/20">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {Array.from({ length: 20 }).map((_, slotIndex) => (
                            <BoxSlot 
                                key={slotIndex}
                                mon={activeBox[slotIndex]}
                                slotIndex={slotIndex}
                                viewedBoxIndex={viewedBoxIndex}
                                isMoveMode={isMoveMode}
                                isSelected={isSlotSelected(slotIndex)}
                                viewMode="grid"
                                tabId={tabId}
                                gameVersion={gameVersion}
                                onPokemonClick={onPokemonClick}
                                onEmptySlotClick={onEmptySlotClick}
                                onToggleSelection={onToggleSelection}
                                onDropPokemon={onDropPokemon}
                                onEnableMoveMode={onEnableMoveMode}
                            />
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="flex flex-col gap-3">
                         {Array.from({ length: 20 }).map((_, slotIndex) => (
                            <BoxSlot 
                                key={slotIndex}
                                mon={activeBox[slotIndex]}
                                slotIndex={slotIndex}
                                viewedBoxIndex={viewedBoxIndex}
                                isMoveMode={isMoveMode}
                                isSelected={isSlotSelected(slotIndex)}
                                viewMode="list"
                                tabId={tabId}
                                gameVersion={gameVersion}
                                onPokemonClick={onPokemonClick}
                                onEmptySlotClick={onEmptySlotClick}
                                onToggleSelection={onToggleSelection}
                                onDropPokemon={onDropPokemon}
                                onEnableMoveMode={onEnableMoveMode}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
