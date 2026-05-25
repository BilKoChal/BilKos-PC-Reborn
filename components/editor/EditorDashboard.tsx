
import React, { useState, useEffect } from 'react';
import { ParsedSave, PokemonStats, TrainerInfo, Item, GameOptions } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { SaveProvider, useSaveContextSafe } from '../../context/SaveContext';
import { EditorTools } from './EditorTools';
import { PokemonEditorModal } from './pokemon/PokemonEditorModal'; 
import { LayoutGrid, Book, Trophy, Map, Home, Database, Swords, Mail } from 'lucide-react'; // Added Swords Icon, Mail
import { MoveLocation } from '../../lib/utils/manipulation';
import { SortScope, SortCriteria, SortDirection } from '../../lib/utils/sortManager';
import { SortSettingsModal } from './SortSettingsModal';
import { motion, AnimatePresence } from 'motion/react';
import { isJapaneseSave } from '../../lib/utils/textValidator';
import { registry } from '../../lib/core/AdapterRegistry';

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
    useEffect(() => {
        setData(initialData);
        setSelectedPokemon(null);
    }, [initialData]);

    const updateData = (newData: ParsedSave) => {
        setData(newData);
        onSaveUpdate(newData);
    };

    const [selectedPokemon, setSelectedPokemon] = useState<{ mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex?: number } | null>(null);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    
    const handleImportBox = (newBoxData: PokemonStats[], boxIndex: number) => {
        const newData = { ...data };
        newData.pcBoxes[boxIndex] = newBoxData;
        
        // If we updated the currently active in-game box, update cache
        if (boxIndex === newData.currentBoxId) {
            newData.currentBoxPokemon = newBoxData;
            newData.currentBoxCount = newBoxData.length;
        }
        
        updateData(newData);
    };

    // Handler to Add Pokemon from Encounter DB (Single Mon)
    const handleAddPokemon = (mon: PokemonStats, target: 'party' | 'pc') => {
        const newData = { ...data };
        
        if (target === 'party') {
            if (newData.party.length < 6) {
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
            if (newData.pcBoxes[targetBoxIndex]!.length < 20) {
                newData.pcBoxes[targetBoxIndex]!.push(mon);
                added = true;
            } else {
                // Find any box
                for (let i = 0; i < 12; i++) {
                    if (newData.pcBoxes[i]!.length < 20) {
                        newData.pcBoxes[i]!.push(mon);
                        targetBoxIndex = i;
                        added = true;
                        break;
                    }
                }
            }

            if (added) {
                // Update cache if we modified current box
                if (targetBoxIndex === newData.currentBoxId) {
                    newData.currentBoxPokemon = newData.pcBoxes[targetBoxIndex]!;
                    newData.currentBoxCount = newData.pcBoxes[targetBoxIndex]!.length;
                }
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
            if (selectedPokemon.boxIndex === data.currentBoxId) {
                newData.currentBoxPokemon = newData.pcBoxes[selectedPokemon.boxIndex]!;
            }
        }

        updateData(newData);
    };

    const handleSetActiveBox = (boxIndex: number) => {
        const newData = { ...data };
        newData.currentBoxId = boxIndex;
        // In Gen 1 logic, we assume PC Boxes array is the source of truth
        newData.currentBoxPokemon = newData.pcBoxes[boxIndex]!;
        newData.currentBoxCount = newData.pcBoxes[boxIndex]!.length;
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
        // Adapter-driven: replaces hardcoded `data.generation === 2 ? 251 : 151`
        const adapter = registry.getAdapter(data.generation);
        const generationLimit = adapter?.nationalDexMax ?? (data.generation === 2 ? 251 : 151);
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
        const newData = { ...data };
        // Update the Gen2SaveExtension boxNames
        if (newData.genExtension && (newData.genExtension as any).generation === 2) {
            const gen2Ext = newData.genExtension as import('../../lib/canonicalModel').Gen2SaveExtension;
            const updatedNames = [...(gen2Ext.boxNames || [])];
            // Ensure array is long enough
            while (updatedNames.length <= boxIndex) {
                updatedNames.push('');
            }
            updatedNames[boxIndex] = newName;
            gen2Ext.boxNames = updatedNames;
            // Need to create a new genExtension reference to trigger re-render
            newData.genExtension = { ...gen2Ext, boxNames: updatedNames } as import('../../lib/canonicalModel').Gen2SaveExtension;
        }
        updateData(newData);
    };

    // Box name support (Gen 2+)
    const boxNames = data.generation === 2
        ? (data.genExtension as any)?.boxNames || []
        : undefined;
    const canEditBoxNames = data.generation >= 2;
    // Max box name length: Gen2 INT/JPN = 8, Gen2 KOR = 16
    const boxNameMaxLength = data.generation === 2
        ? ((data.genExtension as any)?.region === 'korean' ? 16 : 8)
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
                    isJapanese={isJapaneseSave(data)}
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
                    {data.generation === 1 && <TabButton id="hof" icon={Trophy} label="Hall of Fame" />}
                    {data.generation === 2 && <TabButton id="mailbox" icon={Mail} label="Mailbox" />}
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
