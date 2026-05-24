import React from 'react';
import { ParsedSave, PokemonStats, Item } from '../../../lib/parser/types';
import { PCStorage } from '../PCStorage';
import { Inventory } from '../Inventory';
import { MoveLocation } from '../../../lib/utils/manipulation';

interface StorageTabProps {
    data: ParsedSave;
    isMoveMode: boolean;
    setIsMoveMode: (val: boolean) => void;
    globalMoveSources: MoveLocation[];
    handlePokemonClick: (mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    handleEmptySlotClick: (location: MoveLocation, e: React.MouseEvent) => void;
    onToggleSelection: (target: MoveLocation) => void;
    onDropPokemon: (target: MoveLocation, e: React.DragEvent) => void;
    setIsSortModalOpen: (val: boolean) => void;
    handleSetActiveBox: (boxIndex: number) => void;
    handleImportBox: (newBoxData: PokemonStats[], boxIndex: number) => void;
    onShowToast: (msg: string) => void;
    handleInventoryUpdate: (newItems: Item[], newPcItems: Item[]) => void;
}

export const StorageTab: React.FC<StorageTabProps> = ({
    data,
    isMoveMode,
    setIsMoveMode,
    globalMoveSources,
    handlePokemonClick,
    handleEmptySlotClick,
    onToggleSelection,
    onDropPokemon,
    setIsSortModalOpen,
    handleSetActiveBox,
    handleImportBox,
    onShowToast,
    handleInventoryUpdate
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* PC Storage (Right on Desktop, Top on Mobile) */}
            <div className="lg:col-span-9 h-auto lg:order-2">
                <PCStorage 
                    boxes={data.pcBoxes}
                    currentBoxIndex={data.currentBoxId}
                    isMoveMode={isMoveMode}
                    onEnableMoveMode={() => setIsMoveMode(true)} // Enable on drag/long press
                    onToggleMoveMode={() => setIsMoveMode(!isMoveMode)}
                    selectedMoveSources={globalMoveSources}
                    onPokemonClick={(mon, idx, boxIdx, e) => handlePokemonClick(mon, 'box', idx, boxIdx, e)}
                    onEmptySlotClick={(idx, boxIdx, e) => handleEmptySlotClick({ type: 'box', boxIndex: boxIdx, index: idx }, e)}
                    onToggleSelection={(idx, boxIdx) => onToggleSelection({ type: 'box', boxIndex: boxIdx, index: idx })}
                    onDropPokemon={(idx, boxIdx, e) => onDropPokemon({ type: 'box', boxIndex: boxIdx, index: idx }, e)}
                    onSortClick={() => setIsSortModalOpen(true)}
                    onSetActiveBox={handleSetActiveBox}
                    onImport={handleImportBox}
                    onToast={onShowToast}
                />
            </div>

            {/* Inventory (Left on Desktop, Bottom on Mobile) */}
            <div className="lg:col-span-3 h-[550px] lg:h-[650px] flex flex-col overflow-hidden lg:order-1">
                <Inventory 
                    items={data.items} 
                    pcItems={data.pcItems}
                    isMoveMode={isMoveMode}
                    onEnableMoveMode={() => setIsMoveMode(true)} // Enable on long press
                    onUpdate={handleInventoryUpdate}
                />
            </div>
        </div>
    );
};
