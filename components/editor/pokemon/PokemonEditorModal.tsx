
import React, { useState, useEffect, useMemo } from 'react';
import { PokemonStats, Generation } from '../../../lib/parser/types';
import { useTheme } from '../../../context/ThemeContext';
import { X, Save, Download, Book } from 'lucide-react';
import { deriveBaseStats, recalculateStats } from '../../../lib/utils/statCalculator';
import { getGrowthRate, getLevelFromExp as calculateLevel, getExpAtLevel as calculateMinExp } from '../../../lib/utils/experience';
import { getPokemonTypes } from '../../../lib/generations/gen1/data/pokemonTypes';
import { POKEMON_NAMES } from '../../../lib/generations/gen1/data/pokemonNames';
import { GEN2_POKEMON_NAMES } from '../../../lib/generations/gen2/data/constants';
import { MOVES_LIST, MOVES_PP } from '../../../lib/generations/gen1/data/moves';
import { createPk1Binary } from '../../../lib/generations/gen1/writer';
import { sanitizePokemonText } from '../../../lib/utils/textValidator';

// Import sub-components
import { PokemonInfoPanel } from '../panels/PokemonInfoPanel';
import { PokemonStatsPanel } from '../panels/PokemonStatsPanel';
import { PokemonMovesPanel } from '../panels/PokemonMovesPanel';
import { PokemonDetailView } from '../../ui/PokemonDetailView';

interface PokemonEditorModalProps {
    pokemon: PokemonStats;
    generation: Generation;
    isJapanese?: boolean;
    onClose: () => void;
    onSave: (mon: PokemonStats) => void;
}

export const PokemonEditorModal: React.FC<PokemonEditorModalProps> = ({ pokemon: initialData, generation, isJapanese, onClose, onSave }) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    const [mon, setMon] = useState<PokemonStats>(initialData);
    const [isDirty, setIsDirty] = useState(false);
    
    // Modal states
    const [showDexEntry, setShowDexEntry] = useState(false);

    // Derived Types state
    const types = useMemo(() => {
        return getPokemonTypes(mon.dexId, generation);
    }, [mon.dexId, generation]);

    // Recalculate Stats when EVs/DVs/Level change
    const baseStats = useMemo(() => deriveBaseStats(initialData, generation), [initialData.speciesId, generation]);

    useEffect(() => {
        if (!baseStats) return;
        const newStats = recalculateStats(mon, baseStats, generation);
        if (
            newStats.hp !== mon.hp || newStats.attack !== mon.attack || 
            newStats.speed !== mon.speed || newStats.special !== mon.special
        ) {
            setMon(prev => ({ 
                ...prev, 
                hp: newStats.hp, maxHp: newStats.maxHp, attack: newStats.attack,
                defense: newStats.defense, speed: newStats.speed, spAtk: newStats.spAtk,
                spDef: newStats.spDef, special: newStats.special
            }));
        }
    }, [mon.level, mon.iv, mon.ev, baseStats, generation]);

    // Helper to safely clamp values
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    const updateField = (field: keyof PokemonStats, value: any) => {
        setIsDirty(true);
        setMon(prev => ({ ...prev, [field]: value }));
    };

    const handleSpeciesChange = (name: string) => {
        const id = generation === 2 
            ? GEN2_POKEMON_NAMES.indexOf(name) 
            : POKEMON_NAMES.indexOf(name);
        if (id > 0) {
            const speciesTypes = getPokemonTypes(id, generation);
            setMon(prev => ({ 
                ...prev, 
                speciesName: name, 
                dexId: id,
                type1Name: speciesTypes[0] || 'Normal',
                type2Name: speciesTypes[1] || speciesTypes[0] || 'Normal'
            }));
            setIsDirty(true);
        }
    };

    const handleLevelChange = (newLevel: number) => {
        const lvl = clamp(newLevel, 1, 100);
        const rate = getGrowthRate(mon.dexId);
        const minExp = calculateMinExp(lvl, rate);
        
        setMon(prev => ({
            ...prev,
            level: lvl,
            exp: minExp
        }));
        setIsDirty(true);
    };

    const handleExpChange = (newExp: number) => {
        const rate = getGrowthRate(mon.dexId);
        const newLvl = calculateLevel(newExp, rate);
        
        setMon(prev => ({
            ...prev,
            exp: newExp,
            level: newLvl
        }));
        setIsDirty(true);
    };

    const updateIV = (stat: keyof typeof mon.iv, value: number) => {
        const val = clamp(value, 0, 15);
        setMon(prev => ({ ...prev, iv: { ...prev.iv, [stat]: val } }));
        setIsDirty(true);
    };

    const updateEV = (stat: keyof typeof mon.ev, value: number) => {
        const val = clamp(value, 0, 65535);
        setMon(prev => ({ ...prev, ev: { ...prev.ev, [stat]: val } }));
        setIsDirty(true);
    };

    const updateMove = (index: number, moveName: string) => {
        const newMoves = [...mon.moves];
        newMoves[index] = moveName;
        
        const moveId = MOVES_LIST.indexOf(moveName);
        const newIds = [...mon.moveIds];
        const newPps = [...mon.movePp];
        
        if (moveId !== -1) {
            newIds[index] = moveId;
            // Reset PP to Base PP when move changes
            const basePP = MOVES_PP[moveId] || 0;
            newPps[index] = basePP; 
        }
        
        setMon(prev => ({ 
            ...prev, 
            moves: newMoves, 
            moveIds: newIds, 
            movePp: newPps,
            movePpUps: [...prev.movePpUps]
        }));
        setIsDirty(true);
    };

    const updatePpUp = (index: number, count: number) => {
        const newPpUps = [...mon.movePpUps];
        newPpUps[index] = clamp(count, 0, 3);
        setMon(prev => ({ ...prev, movePpUps: newPpUps }));
        setIsDirty(true);
    };

    const handleSave = () => {
        onSave(mon);
        onClose();
    };

    const handleExportPk1 = () => {
        try {
            const binary = createPk1Binary(mon);
            const blob = new Blob([binary], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${mon.nickname || mon.speciesName}.pk1`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to export pk1", e);
            alert("Failed to export .pk1 file");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {showDexEntry && (
                <PokemonDetailView 
                    id={mon.dexId}
                    owned={true} // Contextual: in editor means owned
                    seen={true}
                    version={'Red'} // Default for viewing purposes, doesn't matter much for text
                    onClose={() => setShowDexEntry(false)}
                />
            )}

            <div 
                className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div 
                    className="min-h-[5rem] h-auto px-4 py-3 sm:px-6 sm:py-0 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 bg-theme-primary text-theme-text-on-primary shrink-0 shadow-md relative z-10 transition-colors duration-300"
                >
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center gap-3 sm:gap-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-wider">Nickname</label>
                                <input 
                                    type="text" 
                                    value={mon.nickname}
                                    onChange={(e) => updateField('nickname', sanitizePokemonText(e.target.value, isJapanese).substring(0, isJapanese ? 5 : 10))}
                                    maxLength={isJapanese ? 5 : 10}
                                    className="bg-transparent border-b-2 border-white/30 hover:border-white focus:border-white outline-none text-2xl sm:text-3xl font-black tracking-tighter italic drop-shadow-md w-32 sm:w-48 placeholder-white/50 transition-all"
                                />
                            </div>

                            <div className="flex items-end gap-2 pb-1">
                                <div className="flex items-center gap-1 bg-black/20 px-2 sm:px-3 py-1 rounded-lg text-sm font-bold border border-white/10 backdrop-blur-sm shadow-inner">
                                    <span className="opacity-70 text-[10px] sm:text-xs">LVL</span>
                                    <input 
                                        type="number" 
                                        value={mon.level}
                                        onChange={(e) => handleLevelChange(Number(e.target.value))}
                                        className="bg-transparent w-8 sm:w-10 text-center outline-none border-b border-transparent focus:border-white/50 font-mono"
                                        min={1} max={100}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Close Button */}
                        <button onClick={onClose} className="sm:hidden p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95 -mr-2">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3">
                        <div className="flex-1 sm:flex-none">
                            {isDirty && <span className="text-[10px] sm:text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2 w-fit whitespace-nowrap"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full"></div> Unsaved Changes</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowDexEntry(true)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                title="Show Dex Entry"
                            >
                                <Book size={20} />
                            </button>
                            <button 
                                onClick={handleExportPk1}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                title="Export .pk1"
                            >
                                <Download size={20} />
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-sm shadow-xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all whitespace-nowrap ml-2">
                                <Save size={18} /> Save
                            </button>
                            {/* Desktop Close Button */}
                            <button onClick={onClose} className="hidden sm:block p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:h-full">
                        
                        {/* Left Column: Identity */}
                        <div className="lg:col-span-4 p-6 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <PokemonInfoPanel 
                                mon={mon}
                                generation={generation}
                                types={types}
                                isJapanese={isJapanese}
                                updateField={updateField}
                                handleSpeciesChange={handleSpeciesChange}
                                handleExpChange={handleExpChange}
                            />
                        </div>

                        {/* Middle Column: Stats */}
                        <div className="lg:col-span-4 p-6 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <PokemonStatsPanel 
                                mon={mon}
                                generation={generation}
                                updateIV={updateIV}
                                updateEV={updateEV}
                            />
                        </div>

                        {/* Right Column: Moves */}
                        <div className="lg:col-span-4 p-6 bg-white dark:bg-gray-900">
                            <PokemonMovesPanel 
                                mon={mon}
                                generation={generation}
                                updateMove={updateMove}
                                updatePpUp={updatePpUp}
                                updateField={updateField}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
