
import React, { useState, useMemo } from 'react';
import { EVENT_DISTRIBUTIONS, EventPokemonData } from '../../lib/data/eventDistributions';
import { parsePk1 } from '../../lib/generations/gen1/parser';
import { ParsedSave, PokemonStats } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { useSpriteMode } from '../../context/SpriteContext';
import { getPokemonSpriteUrl, getSpriteImgClasses } from '../../lib/sprites';
import { Search, Gift, Database, Tag, ExternalLink, User, Plus, Box } from 'lucide-react';
import { TypeBadge } from '../ui/PokemonBadges';
import { getPokemonTypes } from '../../lib/generations/gen1/data/pokemonTypes';

interface EncounterDatabaseProps {
    data: ParsedSave;
    onAddPokemon: (mon: PokemonStats, target: 'party' | 'pc') => void;
    onToast: (msg: string) => void;
}

export const EncounterDatabase: React.FC<EncounterDatabaseProps> = ({ data, onAddPokemon, onToast }) => {
    const { getGameTheme } = useTheme();
    const { mode: spriteMode } = useSpriteMode();
    const theme = getGameTheme();
    
    const [search, setSearch] = useState('');

    // Filtered Events
    const filteredEvents = useMemo(() => {
        return EVENT_DISTRIBUTIONS.filter(evt => {
            const searchLower = search.toLowerCase();
            return (
                evt.title.toLowerCase().includes(searchLower) ||
                evt.tags.some(t => t.toLowerCase().includes(searchLower))
            );
        });
    }, [search]);

    const handleAddEvent = (event: EventPokemonData) => {
        // Parse raw bytes from the event definition
        const mon = parsePk1(new Uint8Array(event.bytes));
        
        if (mon) {
            // Default to Box for safety, user can move later
            // Note: The prompt asked for "Add", defaulting to box is standard for editors.
            mon.isParty = false;
            onAddPokemon(mon, 'pc');
            onToast(`Redeemed ${event.title}! Added to PC.`);
        } else {
            onToast("Error loading event data.");
        }
    };

    // Helper for Tag Colors
    const getTagColor = (tag: string) => {
        const t = tag.toLowerCase();
        switch(t) {
            case 'red': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'event': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
            case 'classic': return 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
            case 'special encounter': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
            default: return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[700px] overflow-hidden relative">
            
            {/* Header */}
            <div 
                className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-theme-primary text-theme-text-on-primary z-10 transition-colors duration-300"
            >
                <div className="flex items-center gap-3">
                    <Gift size={24} />
                    <div>
                        <h2 className="font-black text-xl uppercase tracking-widest leading-none">Mystery Gift</h2>
                        <p className="text-xs text-white/80 font-medium">Valid Event Pokemon Database</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search Events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-black/20 border border-white/20 text-sm font-bold text-white placeholder-white/60 outline-none focus:bg-black/30 transition-all"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredEvents.length === 0 ? (
                        <div className="col-span-full h-40 flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <Database size={40} className="mb-2" />
                            <span className="font-bold uppercase text-xs tracking-widest">No Events Found</span>
                        </div>
                    ) : filteredEvents.map((evt) => {
                        const types = getPokemonTypes(evt.previewDexId);
                        const spriteUrl = getPokemonSpriteUrl(evt.previewDexId, spriteMode, data.gameVersion);

                        return (
                            <div key={evt.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col gap-4 text-left group hover:-translate-y-1 duration-300">
                                <div className="flex flex-col sm:flex-row gap-5 items-start">
                                    {/* Sprite Preview */}
                                    <div className="w-full sm:w-40 h-40 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center relative overflow-hidden group-hover:border-blue-200 dark:group-hover:border-blue-700 transition-colors self-center sm:self-auto">
                                        <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                        <img 
                                            src={spriteUrl} 
                                            alt={evt.title}
                                            className={getSpriteImgClasses(spriteMode, 'w-32 h-32 object-contain transition-transform group-hover:scale-110 drop-shadow-md')}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow flex flex-col gap-2 w-full min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-gray-800 dark:text-gray-100 text-lg leading-tight">{evt.title}</h4>
                                            <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0 ml-2 h-fit">
                                                Gen {evt.generation}
                                            </span>
                                        </div>
                                        
                                        {/* Types */}
                                        <div className="flex gap-1 mb-1">
                                            {types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                        </div>
                                        
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                            {evt.description}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {evt.tags.map(tag => (
                                                <span key={tag} className={`flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border ${getTagColor(tag)}`}>
                                                    <Tag className="w-3 h-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Credit Section */}
                                        {evt.credit && (
                                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1 text-[10px] text-gray-400">
                                                <User className="w-3 h-3" />
                                                <span>Credit:</span>
                                                {evt.creditLink ? (
                                                    <a 
                                                        href={evt.creditLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 hover:underline transition-colors"
                                                    >
                                                        {evt.credit}
                                                        <ExternalLink className="w-2.5 h-2.5 mb-0.5" />
                                                    </a>
                                                ) : (
                                                    <span className="font-bold text-gray-500 dark:text-gray-400">{evt.credit}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add Button */}
                                <button 
                                    type="button"
                                    onClick={() => handleAddEvent(evt)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto hover:shadow-lg"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add to Box
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
