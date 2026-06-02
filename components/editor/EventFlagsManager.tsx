
import React, { useState, useMemo } from 'react';
import { ParsedSave, isGen2SaveExtension } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Gift, Zap, Flag, Swords } from 'lucide-react';
// A7: Game events now accessed through adapter — no direct imports from gen1/gen2 data files.
import { useSaveContextSafe } from '../../context/SaveContext';
import { type GameEventDefinition } from '../../lib/data/gameEvents';

interface EventFlagsManagerProps {
    data: ParsedSave;
    onUpdate: (newFlags: boolean[]) => void;
}

export const EventFlagsManager: React.FC<EventFlagsManagerProps> = ({ data, onUpdate }) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    const saveCtx = useSaveContextSafe();
    const adapter = saveCtx?.adapter;
    const [flags, setFlags] = useState<boolean[]>([...data.eventFlags]);

    // Power-user controls (TODO 3.1): free-text filter over named events, plus a
    // raw flag-index inspector to read/toggle any flag by its array index.
    const [search, setSearch] = useState('');
    const [rawIndex, setRawIndex] = useState('');

    // A7/D1/D2: Get the correct event database from the adapter, with version filtering.
    // Uses isGen2SaveExtension type guard instead of `data.generation >= 2` + `as Gen2SaveExtension` cast.
    // Future Gen3+ adapters will provide their own version via isGen3SaveExtension / adapter methods.
    const eventsData: GameEventDefinition[] = useMemo(() => {
        if (!adapter) return [];
        // Determine version for filtering via save-level type guard
        let version: string | undefined;
        if (isGen2SaveExtension(data.genExtension)) {
            version = data.genExtension.gameVersion;
        }
        return adapter.getGameEvents(version);
    }, [adapter, data.genExtension]);

    // Group events by category (applying the free-text filter first).
    const term = search.trim().toLowerCase();
    const filteredEvents = term
        ? eventsData.filter(e =>
            e.name.toLowerCase().includes(term) ||
            e.description.toLowerCase().includes(term) ||
            e.category.toLowerCase().includes(term) ||
            String(e.offset) === term)
        : eventsData;
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        if (!acc[event.category]) acc[event.category] = [];
        acc[event.category]!.push(event);
        return acc;
    }, {} as Record<string, GameEventDefinition[]>);

    const handleToggle = (offset: number) => {
        if (offset >= flags.length) return;
        const newFlags = [...flags];
        // Toggle bit
        newFlags[offset] = !newFlags[offset];
        setFlags(newFlags);
        onUpdate(newFlags);
    };

    const getIcon = (category: string) => {
        switch(category) {
            case 'Legendary': return <Zap size={18} className="text-yellow-500" />;
            case 'Gift': return <Gift size={18} className="text-pink-500" />;
            case 'Story': return <Swords size={18} className="text-blue-500" />;
            default: return <MapPin size={18} className="text-green-500" />;
        }
    };

    // If no events data is available for this generation, show placeholder
    if (eventsData.length === 0) {
        return (
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-col items-center py-8 text-gray-500 dark:text-gray-400">
                    <Flag size={36} className="mb-3 opacity-40" />
                    <p className="text-sm text-center max-w-md">
                        Event flag editing for Generation {data.generation} saves is not yet available. 
                        This feature will be added in a future update.
                    </p>
                    <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30 w-full max-w-sm">
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Total Flags</div>
                        <div className="text-lg font-black text-amber-700 dark:text-amber-300">{data.eventFlags.length}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-h-[500px] overflow-hidden">
            {/* Header Info */}
            <div className="px-6 pt-4 pb-2 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {eventsData.length} named events &middot; {data.eventFlags.length} total flags
                    </div>
                    {adapter?.hasGender && (
                        <div className="text-[10px] bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                            {isGen2SaveExtension(data.genExtension) ? data.genExtension.gameVersion : 'GSC'}
                        </div>
                    )}
                </div>
            </div>

            {/* Power-user controls: search + raw flag inspector (TODO 3.1) */}
            <div className="px-6 pb-2 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events by name, description, category, or offset…"
                    className="flex-grow text-sm bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Raw flag #</span>
                    <input
                        type="number"
                        value={rawIndex}
                        onChange={(e) => setRawIndex(e.target.value)}
                        placeholder="0"
                        min={0}
                        max={flags.length - 1}
                        className="w-20 text-sm font-mono text-center bg-gray-100 dark:bg-gray-900 rounded py-1 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {(() => {
                        const idx = Number(rawIndex);
                        const valid = rawIndex !== '' && Number.isInteger(idx) && idx >= 0 && idx < flags.length;
                        return (
                            <button
                                disabled={!valid}
                                onClick={() => valid && handleToggle(idx)}
                                className={`px-2 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap ${
                                    !valid ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : flags[idx] ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                {valid ? (flags[idx] ? 'SET — tap to clear' : 'CLEAR — tap to set') : 'enter index'}
                            </button>
                        );
                    })()}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 flex-grow custom-scrollbar">
                {filteredEvents.length === 0 && (
                    <div className="text-center text-sm text-gray-400 py-8">
                        No named events match &ldquo;{search}&rdquo;. Use the raw flag inspector above to toggle any flag by index.
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedEvents).map(([category, events]) => (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm h-fit">
                            <h4 className="text-sm font-black uppercase text-gray-400 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                                {getIcon(category)}
                                {category} Events
                            </h4>
                            
                            <div className="space-y-3">
                                {events.map(event => {
                                    const offset = event.offset;
                                    const isSet = offset < flags.length ? flags[offset] : false;

                                    return (
                                        <div key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                            <div>
                                                <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{event.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{event.description}</div>
                                            </div>

                                            <button 
                                                onClick={() => handleToggle(offset)}
                                                className={`
                                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                                    ${isSet ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                                                `}
                                            >
                                                <span className="sr-only">Toggle availability</span>
                                                <span
                                                    className={`
                                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                        ${isSet ? 'translate-x-6' : 'translate-x-1'}
                                                    `}
                                                />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>Note:</strong> {!adapter?.hasSplitSpecial ? (
                        <>"Available" (Green) means the Pokemon or Item will appear in the game world. 
                        "Defeated/Taken" (Grey) means it has already been interacted with. 
                        If you killed a legendary by mistake, toggle it back to Green to make it reappear!</>
                    ) : (
                        <>Event flags control story progress and encounters. "Set" (Green) means the event has occurred 
                        (e.g., a legendary has been defeated, an item has been taken). "Unset" (Grey) means the event 
                        is still available. Toggle flags carefully — incorrect combinations may break game progression.</>
                    )}
                </div>
            </div>
        </div>
    );
};
