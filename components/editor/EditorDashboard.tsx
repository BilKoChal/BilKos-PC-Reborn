
import React, { useState, useEffect, useCallback } from 'react';
import { ParsedSave, PokemonStats, TrainerInfo, Item, GameOptions, SaveValidationResult, syncCurrentBox } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { SaveProvider, useSaveContextSafe } from '../../context/SaveContext';
import { EditorTools } from './EditorTools';
import { PokemonEditorModal } from './pokemon/PokemonEditorModal'; 
import { LayoutGrid, Book, Trophy, Map, Home, Database, Swords, Mail } from 'lucide-react'; // Added Swords Icon, Mail
import { MoveLocation } from '../../lib/utils/manipulation';
import { SortScope, SortCriteria, SortDirection } from '../../lib/utils/sortManager';
import { SortSettingsModal } from './SortSettingsModal';
import { motion, AnimatePresence } from 'motion/react';
import { registry } from '../../lib/core/AdapterRegistry';
import { useUndoHistory } from '../../lib/hooks/useUndoHistory';

import { DashboardTab as DashboardTabComponent } from './tabs/DashboardTab';
import { StorageTab } from './tabs/StorageTab';
import { EncountersTab } from './tabs/EncountersTab';
import { PokedexTab } from './tabs/PokedexTab';
import { BattleTab } from './tabs/BattleTab';
import { EventsTab } from './tabs/EventsTab';
import { HallOfFameTab } from './tabs/HallOfFameTab';
import { MailboxTab } from './tabs/MailboxTab';

export type DashboardTab = 'home' | 'storage' | 'pokedex' | 'battle' | 'events' | 'hof' | 'encounters' | 'mailbox';

interface EditorDashboardProps {
    data: ParsedSave;
    onSaveUpdate: (newData: ParsedSave) => void;
    onOpenLoadModal: () => void;
    onExport: () => void;
    
    // Sort Handler
    onSort: (scope: SortScope, criteria: SortCriteria, direction: SortDirection, includeAllSaves: boolean) => void;

    // Global Move Props
    isMoveMode: boolean;
    setIsMoveMode: (val: boolean) => void;
    globalMoveSources: MoveLocation[]; 
    onMovePokemon: (target: MoveLocation, e?: React.MouseEvent) => void;
    onToggleSelection: (target: MoveLocation) => void;
    onDropPokemon: (target: MoveLocation, e?: React.DragEvent) => void;
    onTouchDrop: (target: MoveLocation) => void;
    
    onShowToast: (msg: string) => void;

    // Tab Control
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;

    // Tab identity for cross-save drag
    activeTabId?: string;

    // Drag session lifecycle callbacks
    onBeginDragSession?: (tabId: string, location: { type: 'box'; boxIndex: number; index: number } | { type: 'party'; index: number }) => void;
    onEndDragSession?: () => void;
}

export const EditorDashboard: React.FC<EditorDashboardProps> = ({ 
    data: initialData, 
    onSaveUpdate, 
    onOpenLoadModal, 
    onExport,
    onSort,
    isMoveMode,
    setIsMoveMode,
    globalMoveSources,
    onMovePokemon,
    onToggleSelection,
    onDropPokemon,
    onTouchDrop,
    onShowToast,
    activeTab,
    onTabChange,
    activeTabId,
    onBeginDragSession,
    onEndDragSession
}) => {
    const { getGameTheme, mode } = useTheme();
    const theme = getGameTheme();

    // Sync state when switching tabs
    const [data, setData] = useState<ParsedSave>(initialData);

    // ── Undo/Redo History (C2) ──
    const { canUndo, canRedo, pushState, undo, redo, reset } = useUndoHistory(initialData);

    // Reset history when initialData changes (tab switch / new save load)
    useEffect(() => {
        setData(initialData);
        reset(initialData);
        setSelectedPokemon(null);
    }, [initialData, reset]);

    // History-aware updateData: pushes current state to undo stack before applying
    const updateData = useCallback((newData: ParsedSave) => {
        pushState(newData);
        setData(newData);
        onSaveUpdate(newData);
    }, [pushState, onSaveUpdate]);

    // Undo/Redo handlers
    const handleUndo = useCallback(() => {
        const previous = undo();
        if (previous) {
            setData(previous);
            onSaveUpdate(previous);
        }
    }, [undo, onSaveUpdate]);

    const handleRedo = useCallback(() => {
        const next = redo();
        if (next) {
            setData(next);
            onSaveUpdate(next);
        }
    }, [redo, onSaveUpdate]);

    // ── Keyboard shortcuts for undo/redo (C2) ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if user is typing in an input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            // Ctrl+Z / Cmd+Z → undo
            if (isCtrlOrCmd && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                if (canUndo()) handleUndo();
            }
            // Ctrl+Shift+Z / Cmd+Shift+Z → redo
            if (isCtrlOrCmd && e.shiftKey && e.key === 'Z') {
                e.preventDefault();
                if (canRedo()) handleRedo();
            }
            // Ctrl+Y / Cmd+Y → redo
            if (isCtrlOrCmd && e.key === 'y') {
                e.preventDefault();
                if (canRedo()) handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, handleUndo, handleRedo]);

    // ── Checksum Validation (C1) ──
    const adapter = registry.getAdapter(data.generation);
    const [validationResult, setValidationResult] = useState<SaveValidationResult | null>(null);

    const handleVerify = useCallback((): SaveValidationResult => {
        if (adapter && data.rawData) {
            const result = adapter.validateSaveDetailed(data.rawData);
            setValidationResult(result);
            return result;
        }
        const fallback: SaveValidationResult = { valid: false, summary: 'No adapter or raw data', details: [] };
        setValidationResult(fallback);
        return fallback;
    }, [adapter, data.rawData]);

    const [selectedPokemon, setSelectedPokemon] = useState<{ mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex?: number } | null>(null);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    
    const handleImportBox = (newBoxData: PokemonStats[], boxIndex: number) => {
        const newData = { ...data };
        newData.pcBoxes[boxIndex] = newBoxData;

        // Keep the active-box cache in sync with pcBoxes (TODO 2.9).
        syncCurrentBox(newData);

        updateData(newData);
    };

    // Handler to Add Pokemon from Encounter DB (Single Mon)
    const partySize = adapter?.partySize ?? 6;
    const boxSlotCount = adapter?.boxSlotCount ?? 20;
    const boxCount = adapter?.boxCount ?? 12;

    const handleAddPokemon = (mon: PokemonStats, target: 'party' | 'pc') => {
        const newData = { ...data };
        
        if (target === 'party') {
            if (newData.party.length < partySize) {
                mon.isParty = true;
                newData.party.push(mon);
                newData.partyCount = newData.party.length;
                updateData(newData);
            } else {
                onShowToast("Party is full! Try adding to PC.");
            }
        } else {
            // Find space in Current Box first, then iterate
            let targetBoxIndex = newData.currentBoxId;
            let added = false;

            // Check current box
            if (newData.pcBoxes[targetBoxIndex]!.length < boxSlotCount) {
                newData.pcBoxes[targetBoxIndex]!.push(mon);
                added = true;
            } else {
                // Find any box
                for (let i = 0; i < boxCount; i++) {
                    if (newData.pcBoxes[i]!.length < boxSlotCount) {
                        newData.pcBoxes[i]!.push(mon);
                        targetBoxIndex = i;
                        added = true;
                        break;
                    }
                }
            }

            if (added) {
                // Keep the active-box cache in sync with pcBoxes (TODO 2.9).
                syncCurrentBox(newData);
                updateData(newData);
            } else {
                onShowToast("PC Storage is completely full!");
            }
        }
    };

    const handlePokemonClick = (mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex: number | undefined, e: React.MouseEvent) => {
        if (isMoveMode) {
            const location: MoveLocation = source === 'party' 
                ? { type: 'party', index } 
                : { type: 'box', boxIndex: boxIndex!, index };
            
            // Delegate to parent App.tsx handler with event for Shift/Ctrl logic
            onMovePokemon(location, e);
        } else {
            // Edit Mode
            setSelectedPokemon({ mon, source, index, boxIndex });
        }
    };

    const handleEmptySlotClick = (location: MoveLocation, e: React.MouseEvent) => {
        if (isMoveMode) {
            onMovePokemon(location, e);
        }
    };

    const handleCloseEditor = () => {
        setSelectedPokemon(null);
    };

    const handleSavePokemon = (updatedMon: PokemonStats) => {
        if (!selectedPokemon) return;

        const newData = { ...data };

        if (selectedPokemon.source === 'party') {
            newData.party[selectedPokemon.index] = updatedMon;
        } else if (selectedPokemon.source === 'box' && selectedPokemon.boxIndex !== undefined) {
            newData.pcBoxes[selectedPokemon.boxIndex]![selectedPokemon.index] = updatedMon;
            syncCurrentBox(newData); // keep active-box cache in sync (TODO 2.9)
        }

        updateData(newData);
    };

    const handleSetActiveBox = (boxIndex: number) => {
        const newData = { ...data };
        newData.currentBoxId = boxIndex;
        // PC Boxes array is the source of truth; sync the active-box cache (TODO 2.9).
        syncCurrentBox(newData);
        updateData(newData);
    };

    const handleTrainerUpdate = (updates: Partial<TrainerInfo>, optionUpdates?: Partial<GameOptions>) => {
        const newData = {
            ...data,
            trainer: { ...data.trainer, ...updates }
        };
        if (optionUpdates) {
            newData.options = {
                ...(newData.options || {
                    textSpeed: 'Normal',
                    battleAnimation: 'On',
                    battleStyle: 'Shift',
                    sound: 'Mono'
                }),
                ...optionUpdates
            } as GameOptions;
        }
        updateData(newData);
    };

    const handleOptionsUpdate = (updates: Partial<GameOptions>) => {
        const newData = {
            ...data,
            options: { ...(data.options || {
                textSpeed: 'Normal',
                battleAnimation: 'On',
                battleStyle: 'Shift',
                sound: 'Mono'
            }), ...updates } as GameOptions
        };
        updateData(newData);
    };

    const handlePokedexUpdate = (owned: boolean[], seen: boolean[]) => {
        // D1: Adapter-driven — removes `data.generation === 2 ? 251 : 151` fallback.
        // The adapter always provides nationalDexMax; 151 is a dead-code safety net.
        const generationLimit = adapter?.nationalDexMax ?? 151;
        const ownedCount = owned.filter((f, i) => i > 0 && i <= generationLimit && f).length;
        const seenCount = seen.filter((f, i) => i > 0 && i <= generationLimit && f).length;
        
        const newData = {
            ...data,
            pokedexOwnedFlags: owned,
            pokedexSeenFlags: seen,
            pokedexOwned: ownedCount,
            pokedexSeen: seenCount
        };
        updateData(newData);
    };

    const handleEventFlagsUpdate = (newFlags: boolean[]) => {
        const newData = { ...data, eventFlags: newFlags };
        updateData(newData);
    };

    const handleInventoryUpdate = (newItems: Item[], newPcItems: Item[]) => {
        const newData = { ...data, items: newItems, pcItems: newPcItems };
        updateData(newData);
    };

    const handleBoxNameChange = (boxIndex: number, newName: string) => {
        if (!adapter?.supportsBoxNames) return;
        const newData = { ...data };
        // D3: Use adapter.setBoxName() instead of directly mutating genExtension.
        // Follows PKHeX's IBoxDetailName.SetBoxName() pattern.
        adapter.setBoxName(newData, boxIndex, newName);
        updateData(newData);
    };

    // D3: Box name support — fully adapter-driven (replaces all genExtension-specific logic)
    const boxNames = adapter?.supportsBoxNames
        ? adapter.getBoxNames(data) ?? []
        : undefined;
    const canEditBoxNames = adapter?.supportsBoxNames ?? false;
    const boxNameMaxLength = adapter?.supportsBoxNames
        ? adapter.getBoxNameMaxLength(data)
        : undefined;

    const TabButton = ({ id, icon: Icon, label }: { id: DashboardTab, icon: React.ElementType, label: string }) => {
        const isActive = activeTab === id;
        
        return (
            <button
                onClick={() => onTabChange(id)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ease-in-out shrink-0 h-10 select-none
                    ${isActive 
                        ? 'bg-theme-primary text-theme-text-on-primary shadow-md pr-4' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-14 justify-center'
                    }
                `}
                title={label}
            >
                <Icon size={22} className="transition-colors duration-300" />
                <span className={`font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
                    {label}
                </span>
            </button>
        );
    };

    return (
        <SaveProvider
            data={data}
            onSaveUpdate={updateData}
            onShowToast={onShowToast}
            isMoveMode={isMoveMode}
            setIsMoveMode={setIsMoveMode}
            globalMoveSources={globalMoveSources}
            onMovePokemon={onMovePokemon}
            onToggleSelection={onToggleSelection}
            onDropPokemon={onDropPokemon}
            onTouchDrop={onTouchDrop}
            activeTabId={activeTabId}
            onBeginDragSession={onBeginDragSession}
            onEndDragSession={onEndDragSession}
        >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans transition-colors duration-300">
            {/* Modals */}
            {selectedPokemon && (
                <PokemonEditorModal 
                    pokemon={selectedPokemon.mon} 
                    generation={data.generation} 
                    isJapanese={registry.getAdapter(data.generation)?.detectRegion(data) === 'japanese'}
                    onClose={handleCloseEditor} 
                    onSave={handleSavePokemon}
                />
            )}

            <SortSettingsModal 
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                onApply={onSort}
            />

            {/* Top Toolbar (Controls + Search) */}
            <EditorTools 
                onExport={onExport} 
                onImport={onOpenLoadModal} 
                isMoveMode={isMoveMode}
                onToggleMoveMode={setIsMoveMode}
                isSaveValid={data.isValid}
                validationResult={validationResult}
                onVerify={handleVerify}
                canUndo={canUndo()}
                canRedo={canRedo()}
                onUndo={handleUndo}
                onRedo={handleRedo}
            />

            {/* Tab Navigation Bar (Scrollable, Expanding) */}
            <div className="sticky top-[4.5rem] z-30 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-2">
                <div className="max-w-[100rem] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <TabButton id="home" icon={Home} label="Dashboard" />
                    <TabButton id="storage" icon={LayoutGrid} label="PC & Bag" />
                    <TabButton id="encounters" icon={Database} label="Encounters" />
                    <TabButton id="pokedex" icon={Book} label="Pokédex" />
                    <TabButton id="battle" icon={Swords} label="Battle Guide" /> {/* Updated Icon */}
                    <TabButton id="events" icon={Map} label="Events & Extras" />
                    {adapter?.hasHallOfFame && <TabButton id="hof" icon={Trophy} label="Hall of Fame" />}
                    {adapter?.hasMailbox && <TabButton id="mailbox" icon={Mail} label="Mailbox" />}
                </div>
            </div>

            <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                    >
                        {activeTab === 'home' && (
                            <DashboardTabComponent
                                data={data}
                                handleTrainerUpdate={handleTrainerUpdate}
                                handleOptionsUpdate={handleOptionsUpdate}
                                handlePokemonClick={handlePokemonClick}
                                handleEmptySlotClick={handleEmptySlotClick}
                            />
                        )}

                        {activeTab === 'storage' && (
                            <StorageTab
                                data={data}
                                handlePokemonClick={handlePokemonClick}
                                handleEmptySlotClick={handleEmptySlotClick}
                                setIsSortModalOpen={setIsSortModalOpen}
                                handleSetActiveBox={handleSetActiveBox}
                                handleImportBox={handleImportBox}
                                handleInventoryUpdate={handleInventoryUpdate}
                                boxNames={boxNames}
                                boxNameMaxLength={boxNameMaxLength}
                                canEditBoxNames={canEditBoxNames}
                                onBoxNameChange={handleBoxNameChange}
                            />
                        )}

                        {activeTab === 'encounters' && (
                            <EncountersTab
                                data={data}
                                handleAddPokemon={handleAddPokemon}
                                onShowToast={onShowToast}
                            />
                        )}
                        
                        {activeTab === 'pokedex' && (
                            <PokedexTab
                                data={data}
                                handlePokedexUpdate={handlePokedexUpdate}
                            />
                        )}

                        {activeTab === 'battle' && (
                            <BattleTab />
                        )}

                        {activeTab === 'events' && (
                            <EventsTab
                                data={data}
                                handleEventFlagsUpdate={handleEventFlagsUpdate}
                                handleOptionsUpdate={handleOptionsUpdate}
                            />
                        )}

                        {activeTab === 'hof' && (
                            <HallOfFameTab
                                data={data}
                            />
                        )}

                        {activeTab === 'mailbox' && (
                            <MailboxTab
                                data={data}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
        </SaveProvider>
    );
};
