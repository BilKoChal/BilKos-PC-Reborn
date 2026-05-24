import React from 'react';
import { ParsedSave, PokemonStats, Item } from '../../../lib/parser/types';
import { PCStorage } from '../PCStorage';
import { Inventory } from '../Inventory';
import { MoveLocation } from '../../../lib/utils/manipulation';
import { useSaveContextSafe } from '../../../context/SaveContext';

interface StorageTabProps {
    data: ParsedSave;
    handlePokemonClick: (mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    handleEmptySlotClick: (location: MoveLocation, e: React.MouseEvent) => void;
    setIsSortModalOpen: (val: boolean) => void;
    handleSetActiveBox: (boxIndex: number) => void;
    handleImportBox: (newBoxData: PokemonStats[], boxIndex: number) => void;
    handleInventoryUpdate: (newItems: Item[], newPcItems: Item[]) => void;
}

export const StorageTab: React.FC<StorageTabProps> = ({
    data, handlePokemonClick, handleEmptySlotClick, setIsSortModalOpen,
    handleSetActiveBox, handleImportBox, handleInventoryUpdate
}) => {
    const ctx = useSaveContextSafe();
    const isMoveMode = ctx?.isMoveMode ?? false;
    const setIsMoveMode = ctx?.setIsMoveMode;
    const globalMoveSources = ctx?.globalMoveSources ?? [];
    const onToggleSelection = ctx?.onToggleSelection;
    const onDropPokemon = ctx?.onDropPokemon;
    const onTouchDrop = ctx?.onTouchDrop;
    const onShowToast = ctx?.onShowToast;
    const tabId = ctx?.activeTabId;
    const gameVersion = ctx?.gameVersion;
    const onBeginDragSession = ctx?.onBeginDragSession;
    const onEndDragSession = ctx?.onEndDragSession;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-9 h-auto lg:order-2">
                <PCStorage 
                    boxes={data.pcBoxes}
                    currentBoxIndex={data.currentBoxId}
                    isMoveMode={isMoveMode}
                    onEnableMoveMode={() => setIsMoveMode?.(true)}
                    onToggleMoveMode={() => setIsMoveMode?.(!isMoveMode)}
                    selectedMoveSources={globalMoveSources}
                    onPokemonClick={(mon, idx, boxIdx, e) => handlePokemonClick(mon, 'box', idx, boxIdx, e)}
                    onEmptySlotClick={(idx, boxIdx, e) => handleEmptySlotClick({ type: 'box', boxIndex: boxIdx, index: idx }, e)}
                    onToggleSelection={onToggleSelection ? (idx, boxIdx) => onToggleSelection({ type: 'box', boxIndex: boxIdx, index: idx }) : undefined}
                    onDropPokemon={onDropPokemon ? (idx, boxIdx, e) => onDropPokemon({ type: 'box', boxIndex: boxIdx, index: idx }, e) : undefined}
                    onTouchDrop={onTouchDrop ? (idx, boxIdx) => onTouchDrop({ type: 'box', boxIndex: boxIdx, index: idx }) : undefined}
                    onSortClick={() => setIsSortModalOpen(true)}
                    onSetActiveBox={handleSetActiveBox}
                    onImport={handleImportBox}
                    onToast={onShowToast ?? (() => {})}
                    tabId={tabId}
                    gameVersion={gameVersion}
                    onBeginDragSession={onBeginDragSession}
                    onEndDragSession={onEndDragSession}
                />
            </div>
            <div className="lg:col-span-3 h-[550px] lg:h-[650px] flex flex-col overflow-hidden lg:order-1">
                <Inventory 
                    items={data.items} 
                    pcItems={data.pcItems}
                    isMoveMode={isMoveMode}
                    onEnableMoveMode={() => setIsMoveMode?.(true)}
                    onUpdate={handleInventoryUpdate}
                />
            </div>
        </div>
    );
};
