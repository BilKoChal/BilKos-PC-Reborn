
import React, { useState } from 'react';
import { GEN1_EVENTS, GameEvent } from '../../lib/generations/gen1/data/events';
import { ParsedSave } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Gift, Zap, Flag } from 'lucide-react';

interface EventFlagsManagerProps {
    data: ParsedSave;
    onUpdate: (newFlags: boolean[]) => void;
}

export const EventFlagsManager: React.FC<EventFlagsManagerProps> = ({ data, onUpdate }) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    const [flags, setFlags] = useState<boolean[]>([...data.eventFlags]);

    // Select the correct event database based on generation
    const eventsData: GameEvent[] = data.generation === 1 ? GEN1_EVENTS : [];

    // Group events by category
    const groupedEvents = eventsData.reduce((acc, event) => {
        if (!acc[event.category]) acc[event.category] = [];
        acc[event.category]!.push(event);
        return acc;
    }, {} as Record<string, GameEvent[]>);

    const handleToggle = (offset: number) => {
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
            default: return <MapPin size={18} className="text-blue-500" />;
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
            {/* Content */}
            <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 flex-grow custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedEvents).map(([category, events]) => (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm h-fit">
                            <h4 className="text-sm font-black uppercase text-gray-400 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                                {getIcon(category)}
                                {category} Events
                            </h4>
                            
                            <div className="space-y-3">
                                {events.map(event => {
                                    const isDefeated = flags[event.offset]; 
                                    const isAvailable = !isDefeated;

                                    return (
                                        <div key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                            <div>
                                                <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{event.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{event.description}</div>
                                            </div>

                                            <button 
                                                onClick={() => handleToggle(event.offset)}
                                                className={`
                                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                                    ${isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                                                `}
                                            >
                                                <span className="sr-only">Toggle availability</span>
                                                <span
                                                    className={`
                                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                        ${isAvailable ? 'translate-x-6' : 'translate-x-1'}
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
                    <strong>Note:</strong> "Available" (Green) means the Pokemon or Item will appear in the game world. 
                    "Defeated/Taken" (Grey) means it has already been interacted with. 
                    If you killed a legendary by mistake, toggle it back to Green to make it reappear!
                </div>
            </div>
        </div>
    );
};
