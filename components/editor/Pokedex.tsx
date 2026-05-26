
import React, { useState, useMemo, useEffect } from 'react';
import { ParsedSave, GameVersion } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { useSpriteMode } from '../../context/SpriteContext';
import { getPokemonSpriteUrl, getSpriteImgClasses, getIntegerScaleStyle } from '../../lib/sprites';
import { Check, Eye, Ban, Search, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { PokemonDetailView } from '../ui/PokemonDetailView';
import { useSaveContextSafe } from '../../context/SaveContext';

interface PokedexProps {
    data: ParsedSave;
    onUpdate?: (owned: boolean[], seen: boolean[]) => void;
}

export const Pokedex: React.FC<PokedexProps> = ({ data, onUpdate }) => {
    const { getGameTheme } = useTheme();
    const { mode: spriteMode } = useSpriteMode();
    const theme = getGameTheme();
    const ctx = useSaveContextSafe();
    const adapter = ctx?.adapter;

    // D1: Adapter-driven — removes `data.generation === 2 ? 251 : 151` fallback.
    // The adapter always provides nationalDexMax; 151 is a dead-code safety net.
    const maxDex = adapter?.nationalDexMax ?? 151;
    const pokemonNames = adapter?.getAllSpeciesNames() ?? [];

    // State
    const [search, setSearch] = useState('');
    const [sortMode, setSortMode] = useState<'id' | 'name'>('id');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    
    // Data State
    const [ownedFlags, setOwnedFlags] = useState([...data.pokedexOwnedFlags]);
    const [seenFlags, setSeenFlags] = useState([...data.pokedexSeenFlags]);

    // Update parent when flags change
    useEffect(() => {
        if (onUpdate) {
            onUpdate(ownedFlags, seenFlags);
        }
    }, [ownedFlags, seenFlags]);

    const toggleEntry = (id: number) => {
        const isSeen = seenFlags[id];
        const isOwned = ownedFlags[id];
        const newSeen = [...seenFlags];
        const newOwned = [...ownedFlags];

        if (!isSeen && !isOwned) {
            newSeen[id] = true; // Hidden -> Seen
        } else if (isSeen && !isOwned) {
            newOwned[id] = true; // Seen -> Owned
            newSeen[id] = true;
        } else {
            newSeen[id] = false; // Owned -> Hidden
            newOwned[id] = false;
        }

        setSeenFlags(newSeen);
        setOwnedFlags(newOwned);
    };

    const sortedAndFilteredIds = useMemo(() => {
        let list = Array.from({ length: maxDex }, (_, i) => i + 1);

        // Filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            list = list.filter(id => {
                const name = pokemonNames[id] || '';
                return name.toLowerCase().includes(lowerSearch) || id.toString().includes(search);
            });
        }

        // Sort
        list.sort((a, b) => {
            let valA: string | number = a;
            let valB: string | number = b;
            
            if (sortMode === 'name') {
                valA = pokemonNames[a]!;
                valB = pokemonNames[b]!;
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [search, sortMode, sortDir, maxDex, pokemonNames]);

    const stats = useMemo(() => {
        const owned = ownedFlags.filter((f, i) => i <= maxDex && f).length;
        const seen = seenFlags.filter((f, i) => i <= maxDex && f).length;
        return { owned, seen };
    }, [ownedFlags, seenFlags, maxDex]);

    const detectedVersion = data.gameVersion || 'Red';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[700px] overflow-hidden relative">
            
            {/* Detail Modal Overlay */}
            {selectedId && (
                <PokemonDetailView 
                    id={selectedId}
                    owned={ownedFlags[selectedId]!}
                    seen={seenFlags[selectedId]!}
                    version={detectedVersion}
                    onClose={() => setSelectedId(null)}
                    onToggleStatus={() => toggleEntry(selectedId)}
                />
            )}

            {/* Header */}
            <div 
                className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-theme-primary text-theme-text-on-primary z-10"
            >
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-2 bg-white/20 rounded-full border-4 border-white/30 shadow-inner shrink-0">
                        <div className="w-4 h-4 bg-blue-300 rounded-full animate-pulse shadow-[0_0_10px_#60A5FA]"></div>
                    </div>
                    <div>
                        <h2 className="font-black text-xl uppercase tracking-widest leading-none">Pokédex</h2>
                        <div className="text-xs font-bold opacity-80 mt-1 flex gap-3">
                            <span className="bg-black/20 px-2 py-0.5 rounded">SEEN: {stats.seen}</span>
                            <span className="bg-black/20 px-2 py-0.5 rounded">OWNED: {stats.owned}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow md:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/20 border border-white/10 text-sm font-bold text-white placeholder-white/50 outline-none focus:bg-black/30 transition-all"
                        />
                    </div>
                    
                    {/* Sort Toggle */}
                    <button 
                        onClick={() => {
                            if (sortMode === 'id') setSortMode('name');
                            else { setSortMode('id'); setSortDir('asc'); }
                        }}
                        className="px-3 py-2 bg-black/20 rounded-lg text-white font-bold text-xs uppercase hover:bg-black/30 transition-colors border border-white/10 whitespace-nowrap"
                    >
                        {sortMode === 'id' ? 'No.' : 'Name'}
                    </button>
                    <button 
                        onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="px-2 py-2 bg-black/20 rounded-lg text-white hover:bg-black/30 transition-colors border border-white/10"
                    >
                        {sortDir === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900/50 custom-scrollbar">
                {sortedAndFilteredIds.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">
                        No Pokemon Found
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                        {sortedAndFilteredIds.map((id) => {
                            const isSeen = seenFlags[id];
                            const isOwned = ownedFlags[id];
                            const name = pokemonNames[id];

                            return (
                                <div 
                                    key={id}
                                    onClick={() => setSelectedId(id)}
                                    className={`
                                        relative aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 group
                                        ${isOwned 
                                            ? 'bg-white dark:bg-gray-800 border-green-500/50 shadow-md hover:border-green-500' 
                                            : isSeen 
                                                ? 'bg-white/80 dark:bg-gray-800/80 border-blue-400/30 hover:border-blue-400' 
                                                : 'bg-gray-200 dark:bg-gray-800/30 border-transparent hover:bg-gray-300 dark:hover:bg-gray-700'
                                        }
                                        hover:-translate-y-1
                                    `}
                                >
                                    <span className="absolute top-1 left-2 text-[9px] font-black text-gray-300 dark:text-gray-600 font-mono">
                                        #{id.toString().padStart(3, '0')}
                                    </span>

                                    <div className="absolute top-1 right-1 z-10">
                                        {isOwned ? (
                                            <div className="bg-green-500 text-white p-0.5 rounded-full shadow-sm"><Check size={10} /></div>
                                        ) : isSeen ? (
                                            <div className="bg-blue-400 text-white p-0.5 rounded-full shadow-sm"><Eye size={10} /></div>
                                        ) : (
                                            <div className="text-gray-300 dark:text-gray-700 opacity-50"><Ban size={12} /></div>
                                        )}
                                    </div>

                                    <img 
                                        src={getPokemonSpriteUrl(id, spriteMode, data.gameVersion)} 
                                        alt={name}
                                        style={spriteMode !== 'artwork' ? getIntegerScaleStyle(spriteMode, 160) as React.CSSProperties : undefined}
                                        className={getSpriteImgClasses(spriteMode, `object-contain transition-all duration-300 ${spriteMode === 'artwork' ? 'w-full h-full' : ''} ${!isSeen && !isOwned ? 'brightness-0 opacity-10' : isSeen && !isOwned ? 'grayscale opacity-60' : 'group-hover:scale-110'}`)}
                                        loading="lazy"
                                    />
                                    
                                    <div className={`text-[10px] font-bold uppercase truncate max-w-full px-2 mt-1 ${isOwned ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                        {name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
                Click for details
            </div>
        </div>
    );
};
