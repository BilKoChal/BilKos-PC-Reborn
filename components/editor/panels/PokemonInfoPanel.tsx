import React from 'react';
import { PokemonStats, Generation } from '../../../lib/parser/types';
import { User, Fingerprint } from 'lucide-react';
import { Autocomplete } from '../../ui/Autocomplete';
import { TypeBadge } from '../../ui/PokemonBadges';
import { PokemonSprite } from '../../ui/PokemonSprite';
// Adapter-driven: species names are now accessed via adapter.getAllSpeciesNames()
// instead of direct generation-specific imports. This eliminates the hardcoded
// `generation === 2 ? GEN2_POKEMON_NAMES : POKEMON_NAMES` branching.
import { extensionRegistry } from '../../../lib/core/ExtensionRegistry';
import { useSaveContextSafe } from '../../../context/SaveContext';
import { IGenerationAdapter } from '../../../lib/interfaces';
import { useSpriteMode } from '../../../context/SpriteContext';
import { getPokemonSpriteUrl, ITEM_SPRITE_FALLBACK, getSpriteImgClasses, getUnownFormLetter, setUnownFormDVs } from '../../../lib/sprites';

interface PokemonInfoPanelProps {
    mon: PokemonStats;
    generation?: number;
    adapter?: IGenerationAdapter;
    types: string[];
    isJapanese?: boolean;
    updateField: (field: keyof PokemonStats, value: unknown) => void;
    handleSpeciesChange: (name: string) => void;
    handleExpChange: (newExp: number) => void;
}

export const PokemonInfoPanel: React.FC<PokemonInfoPanelProps> = ({ 
    mon, generation: generationProp, adapter: adapterProp, types, isJapanese, updateField, handleSpeciesChange, handleExpChange 
}) => {
    const ctx = useSaveContextSafe();
    const generation = (generationProp ?? ctx?.generation ?? 1) as Generation;
    const adapter = adapterProp ?? ctx?.adapter;
    const { mode: spriteMode } = useSpriteMode();
    
    // Safety clamp
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    
    const spriteUrl = getPokemonSpriteUrl(mon.dexId, spriteMode, ctx?.data?.gameVersion, mon.isShiny);

    // Fetch extensions registered for the Info Panel in the active generation.
    // TODO 4.7: an empty result is a safe no-op — extensions are registered when
    // the generation's adapter is constructed (before any save renders), so this
    // returns the Gen 2 sections on first paint; for gens with no extensions it
    // simply renders the universal fields.
    const extensions = extensionRegistry.getExtensions('pokemon-info', generation);

    // Dynamic species options based on adapter (replaces hardcoded generation branching)
    const pokemonOptions = (adapter?.getAllSpeciesNames() ?? []).slice(0, (adapter?.nationalDexMax ?? 151) + 1);

    return (
        <div className="flex flex-col gap-6 bg-white dark:bg-gray-900 h-full">
            {/* Sprite & Types */}
            <div className="flex flex-col items-center">
                <div className={`w-64 h-64 relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-[2rem] border shadow-inner mb-4 transition-all duration-300 ${
                    mon.isEgg
                        ? 'border-green-300 dark:border-green-500 shadow-[0_0_20px_rgba(74,222,128,0.25)]'
                        : mon.isShiny 
                            ? 'border-yellow-400 dark:border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.35)]' 
                            : 'border-gray-100 dark:border-gray-700'
                }`}>
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 rounded-[2rem]"></div>
                    
                    {/* Shiny Sparkle Indicator */}
                    {mon.isShiny && !mon.isEgg && (
                        <div className="absolute top-3.5 right-4 text-yellow-500 font-extrabold text-[10px] tracking-widest flex items-center gap-0.5 animate-pulse bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800/40 shadow-sm z-20">
                            <span>✨</span>SHINY
                        </div>
                    )}

                    {/* EGG Label */}
                    {mon.isEgg && (
                        <div className="absolute top-3.5 right-4 text-green-600 dark:text-green-400 font-extrabold text-[10px] tracking-widest flex items-center gap-0.5 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800/40 shadow-sm z-20">
                            🥚EGG
                        </div>
                    )}

                    {/* Gender Emblem Indicator */}
                    {mon.gender && mon.gender !== 'Genderless' && !mon.isEgg && (
                        <div className={`absolute top-3.5 left-4 font-black text-[10px] px-1.5 py-0.5 rounded-md border shadow-sm z-20 select-none ${
                            mon.gender === 'Female' 
                                ? 'bg-pink-50 text-pink-500 border-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/30' 
                                : 'bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30'
                        }`}>
                            {mon.gender === 'Female' ? '♀ FEM' : '♂ MALE'}
                        </div>
                    )}

                    <PokemonSprite
                        dexId={mon.dexId}
                        isShiny={mon.isShiny}
                        isEgg={mon.isEgg}
                        speciesName={mon.speciesName}
                        spriteMode={spriteMode}
                        gameVersion={ctx?.data?.gameVersion}
                        className="w-48 h-48 z-10"
                        imgClassName="w-48 h-48 object-contain drop-shadow-2xl transition-transform hover:scale-110 duration-500"
                        form={getUnownFormLetter(mon.dexId, mon.iv)}
                    />
                    {/* Type Badges — hidden for eggs */}
                    {!mon.isEgg && (
                        <div className="absolute -bottom-3 flex gap-2">
                            {types.map(t => <TypeBadge key={t} type={t} size="md" className="shadow-lg border-2 border-white dark:border-gray-900" />)}
                        </div>
                    )}
                </div>
                
                {/* Species Selector */}
                <div className="w-full mt-2">
                    <label className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase ml-1 mb-1">
                        <span>Species</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">#{mon.dexId.toString().padStart(3, '0')}</span>
                    </label>
                    <Autocomplete 
                        options={pokemonOptions} 
                        value={mon.speciesName} 
                        onChange={handleSpeciesChange}
                        placeholder="Change Species..."
                        className="shadow-sm"
                    />
                </div>

                {/* Unown Form Selector (Gen 2, species 201) — adjusts DVs to match (TODO 3.8) */}
                {mon.dexId === 201 && (
                    <div className="w-full mt-2">
                        <label className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase ml-1 mb-1">
                            <span>Unown Form</span>
                            <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px] uppercase">
                                {getUnownFormLetter(mon.dexId, mon.iv) ?? '?'}
                            </span>
                        </label>
                        <div className="grid grid-cols-7 sm:grid-cols-9 gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5">
                            {Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)).map(letter => {
                                const current = getUnownFormLetter(mon.dexId, mon.iv);
                                const isActive = current === letter;
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => updateField('iv', setUnownFormDVs(letter, mon.iv))}
                                        title={`Set form ${letter.toUpperCase()} (adjusts DVs)`}
                                        className={`aspect-square rounded text-xs font-black uppercase transition-colors ${
                                            isActive
                                                ? 'bg-purple-500 text-white shadow'
                                                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                        }`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                            Changing the form adjusts this Pokémon's DVs (which also affects its stats).
                        </p>
                    </div>
                )}
            </div>

            {/* EXP Block */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
                    Experience Points
                </label>
                <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg p-1.5 border border-blue-200 dark:border-blue-800/50 shadow-inner">
                    <input 
                        type="number" 
                        value={mon.exp} 
                        onChange={(e) => handleExpChange(Number(e.target.value))} 
                        className="w-full text-center text-sm font-mono font-bold bg-transparent outline-none text-gray-700 dark:text-gray-200"
                    />
                </div>
            </div>

            {/* OT Block */}
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-3 border border-purple-100 dark:border-purple-800/30">
                <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block mb-2">
                    Original Trainer
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-1.5 border border-purple-200 dark:border-purple-800/50 shadow-inner flex items-center gap-1.5">
                        <User size={12} className="text-purple-400" />
                        <input 
                            type="text" 
                            value={mon.originalTrainerName}
                            onChange={(e) => updateField('originalTrainerName', (adapter?.codec?.sanitize(e.target.value) ?? e.target.value).substring(0, isJapanese ? 5 : 7))}
                            maxLength={isJapanese ? 5 : 7}
                            className="w-full text-xs font-bold bg-transparent outline-none text-gray-700 dark:text-gray-200"
                            placeholder="OT Name"
                        />
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-1.5 border border-purple-200 dark:border-purple-800/50 shadow-inner flex items-center gap-1.5">
                        <Fingerprint size={12} className="text-purple-400" />
                        <input 
                            type="number" 
                            value={mon.originalTrainerId}
                            onChange={(e) => updateField('originalTrainerId', clamp(Number(e.target.value), 0, 65535))}
                            className="w-full text-xs font-mono font-bold bg-transparent outline-none text-gray-700 dark:text-gray-200"
                            placeholder="ID"
                        />
                    </div>
                </div>
                {mon.originalTrainerName === '👤' && (
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-2 font-medium flex items-center gap-1 animate-in fade-in duration-200">
                        <span>👤 In-Game NPC Trade placeholder (0x5D code preserved).</span>
                    </p>
                )}
            </div>

            {/* Render Extensions */}
            {extensions.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {extensions.map(ext => (
                        <div key={ext.id} className="extension-container">
                            {ext.render(mon, {
                                generation,
                                onChange: (field, val) => updateField(field as keyof PokemonStats, val),
                                theme: undefined
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
