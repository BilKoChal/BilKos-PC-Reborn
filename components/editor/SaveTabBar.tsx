import React, { useRef, useCallback, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { GameVersion } from '../../lib/parser/types';
import { DND_DATA_TYPE } from '../../lib/hooks/dndTypes';

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

const HOVER_ACTIVATE_DELAY = 400; // ms before auto-switching tab during drag

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

    const getVersionRingColor = (version: GameVersion) => {
        switch (version) {
            case 'Red': return 'ring-red-400';
            case 'Blue': return 'ring-blue-400';
            case 'Yellow': return 'ring-yellow-400';
            case 'Gold': return 'ring-amber-400';
            case 'Silver': return 'ring-slate-400';
            case 'Crystal': return 'ring-cyan-400';
            default: return 'ring-gray-400';
        }
    };

    return (
        <div className="bg-gray-200 dark:bg-gray-900 pt-2 px-2 flex items-end gap-1 overflow-x-auto border-b border-gray-300 dark:border-gray-800 z-10 relative scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
            {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                const versionColor = getVersionColor(tab.version);
                const versionRing = getVersionRingColor(tab.version);

                return (
                    <DragAwareTab
                        key={tab.id}
                        tab={tab}
                        isActive={isActive}
                        versionColor={versionColor}
                        versionRing={versionRing}
                        onSwitchTab={onSwitchTab}
                        onCloseTab={onCloseTab}
                    />
                );
            })}

            {/* Tab Actions */}
            <button onClick={onOpenNew} className="p-2 h-10 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30 transition-colors shadow-sm mb-1 ml-1" title="Open New Save" aria-label="Open New Save"><Plus size={18} /></button>
            <button onClick={onCloseAll} className="p-2 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors shadow-sm mb-1" title="Close All Tabs" aria-label="Close All Tabs"><Trash2 size={18} /></button>
        </div>
    );
};

// --- Individual Tab with Drag Hover Activation ---

interface DragAwareTabProps {
    tab: SaveTab;
    isActive: boolean;
    versionColor: string;
    versionRing: string;
    onSwitchTab: (tabId: string) => void;
    onCloseTab: (e: React.MouseEvent, tabId: string) => void;
}

const DragAwareTab: React.FC<DragAwareTabProps> = ({
    tab, isActive, versionColor, versionRing, onSwitchTab, onCloseTab
}) => {
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDragHovering, setIsDragHovering] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        // Only respond to our custom drag type
        if (!e.dataTransfer.types.includes(DND_DATA_TYPE)) return;
        e.preventDefault();
        
        setIsDragHovering(true);
        
        // Start timer to auto-switch tab after HOVER_ACTIVATE_DELAY
        if (!isActive) {
            hoverTimerRef.current = setTimeout(() => {
                onSwitchTab(tab.id);
            }, HOVER_ACTIVATE_DELAY);
        }
    }, [isActive, onSwitchTab, tab.id]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (!e.dataTransfer.types.includes(DND_DATA_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragHovering(false);
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragHovering(false);
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        // Switch to this tab on drop
        if (!isActive) {
            onSwitchTab(tab.id);
        }
    }, [isActive, onSwitchTab, tab.id]);

    return (
        <div
            onClick={() => onSwitchTab(tab.id)}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                group relative pl-4 pr-8 py-2 min-w-[160px] max-w-[240px] shrink-0 rounded-t-lg cursor-pointer select-none transition-all duration-200
                ${isActive
                    ? 'bg-gray-50 dark:bg-gray-950 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] translate-y-[1px]'
                    : 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/80 opacity-80 hover:opacity-100'
                }
                ${isDragHovering && !isActive 
                    ? `ring-2 ${versionRing} ring-offset-1 scale-105 shadow-lg bg-white dark:bg-gray-700 opacity-100` 
                    : ''
                }
            `}
        >
            {isActive && <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${versionColor}`}></div>}
            <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wide truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {tab.filename}
                </span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                    {tab.version} Version {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 ml-1" title="Unsaved Changes" aria-label="Unsaved changes" role="img"></span>}
                </span>
            </div>
            <button onClick={(e) => onCloseTab(e, tab.id)} aria-label={`Close ${tab.filename}`} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <X size={12} className="text-gray-500" />
            </button>
        </div>
    );
};
