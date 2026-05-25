import React from 'react';
import { ParsedSave, GameOptions } from '../../../lib/parser/types';
import { EventFlagsManager } from '../EventFlagsManager';
import { Settings, Clock, Flag } from 'lucide-react';

interface EventsTabProps {
    data: ParsedSave;
    handleEventFlagsUpdate: (newFlags: boolean[]) => void;
    handleOptionsUpdate?: (updates: Partial<GameOptions>) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
    data,
    handleEventFlagsUpdate,
    handleOptionsUpdate
}) => {
    return (
        <div className="w-full space-y-6">
            {/* Game Options Section */}
            {data.options && handleOptionsUpdate && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <Settings size={20} />
                        <div>
                            <h2 className="font-black text-lg uppercase tracking-widest leading-none">Game Options</h2>
                            <p className="text-xs text-white/80 font-medium">Text Speed, Battle Style, Sound</p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Text Speed */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Text Speed</label>
                                <select
                                    value={data.options.textSpeed}
                                    onChange={(e) => handleOptionsUpdate({ textSpeed: e.target.value as GameOptions['textSpeed'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="Instant">Instant</option>
                                    <option value="Fast">Fast</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Slow">Slow</option>
                                </select>
                            </div>

                            {/* Battle Style */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Battle Style</label>
                                <select
                                    value={data.options.battleStyle}
                                    onChange={(e) => handleOptionsUpdate({ battleStyle: e.target.value as GameOptions['battleStyle'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="Shift">Shift</option>
                                    <option value="Set">Set</option>
                                </select>
                            </div>

                            {/* Battle Animation */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Battle Animation</label>
                                <select
                                    value={data.options.battleAnimation}
                                    onChange={(e) => handleOptionsUpdate({ battleAnimation: e.target.value as GameOptions['battleAnimation'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="On">On</option>
                                    <option value="Off">Off</option>
                                </select>
                            </div>

                            {/* Sound */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Sound</label>
                                <select
                                    value={data.options.sound}
                                    onChange={(e) => handleOptionsUpdate({ sound: e.target.value as GameOptions['sound'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="Mono">Mono</option>
                                    <option value="Stereo">Stereo</option>
                                    <option value="Earphone1">Earphone 1</option>
                                    <option value="Earphone2">Earphone 2</option>
                                    <option value="Earphone3">Earphone 3</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gen 2 RTC Clock Section */}
            {data.generation === 2 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                        <Clock size={20} />
                        <div>
                            <h2 className="font-black text-lg uppercase tracking-widest leading-none">Real-Time Clock</h2>
                            <p className="text-xs text-white/80 font-medium">Gen 2 RTC & Time-of-Day System</p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex flex-col items-center py-6 text-gray-500 dark:text-gray-400">
                            <Clock size={36} className="mb-3 opacity-40" />
                            <p className="text-sm text-center max-w-md">
                                Generation 2 introduced the Real-Time Clock (RTC) system, which tracks the time of day 
                                for events like day/night cycles, berry growth, and timed encounters. 
                                RTC data viewing and editing will be available in a future update.
                            </p>
                            <div className="mt-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-xl p-3 border border-cyan-100 dark:border-cyan-800/30 w-full max-w-sm">
                                <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Play Time</div>
                                <div className="text-lg font-black text-cyan-700 dark:text-cyan-300">{data.trainer.playTime || 'Unknown'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Flags Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                    <Flag size={20} />
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-widest leading-none">Event Flags</h2>
                        <p className="text-xs text-white/80 font-medium">Story Progress & Event Triggers</p>
                    </div>
                </div>
                <EventFlagsManager data={data} onUpdate={handleEventFlagsUpdate} />
            </div>
        </div>
    );
};
