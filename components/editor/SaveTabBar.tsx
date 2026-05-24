import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { GameVersion } from '../../lib/parser/types';

export interface SaveTab {
    id: string;
    filename: string;
    version: GameVersion;
    isDirty: boolean;
}

interface SaveTabBarProps {
    tabs: SaveTab[];
    activeTabId: string | null;
    onSwitchTab: (tabId: string) => void;
    onCloseTab: (e: React.MouseEvent, tabId: string) => void;
    onOpenNew: () => void;
    onCloseAll: () => void;
}

export const SaveTabBar: React.FC<SaveTabBarProps> = ({
    tabs,
    activeTabId,
    onSwitchTab,
    onCloseTab,
    onOpenNew,
    onCloseAll
}) => {
    if (tabs.length === 0) return null;

    const getVersionColor = (version: GameVersion) => {
        switch (version) {
            case 'Red': return 'bg-red-500';
            case 'Blue': return 'bg-blue-500';
            case 'Yellow': return 'bg-yellow-400';
            case 'Gold': return 'bg-amber-500';
            case 'Silver': return 'bg-slate-400';
            case 'Crystal': return 'bg-cyan-400';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="bg-gray-200 dark:bg-gray-900 pt-2 px-2 flex items-end gap-1 overflow-x-auto border-b border-gray-300 dark:border-gray-800 z-10 relative scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
            {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                const versionColor = getVersionColor(tab.version);

                return (
                    <div
                        key={tab.id}
                        onClick={() => onSwitchTab(tab.id)}
                        className={`
                            group relative pl-4 pr-8 py-2 min-w-[160px] max-w-[240px] shrink-0 rounded-t-lg cursor-pointer select-none transition-all duration-200
                            ${isActive
                                ? 'bg-gray-50 dark:bg-gray-950 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] translate-y-[1px]'
                                : 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/80 opacity-80 hover:opacity-100'
                            }
                        `}
                    >
                        {isActive && <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${versionColor}`}></div>}
                        <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase tracking-wide truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {tab.filename}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                {tab.version} Version {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 ml-1" title="Unsaved Changes"></span>}
                            </span>
                        </div>
                        <button onClick={(e) => onCloseTab(e, tab.id)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <X size={12} className="text-gray-500" />
                        </button>
                    </div>
                );
            })}

            {/* Tab Actions */}
            <button onClick={onOpenNew} className="p-2 h-10 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30 transition-colors shadow-sm mb-1 ml-1" title="Open New Save"><Plus size={18} /></button>
            <button onClick={onCloseAll} className="p-2 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors shadow-sm mb-1" title="Close All Tabs"><Trash2 size={18} /></button>
        </div>
    );
};
