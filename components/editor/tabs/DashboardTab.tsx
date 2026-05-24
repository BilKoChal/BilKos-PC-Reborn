import React from 'react';
import { ParsedSave, PokemonStats, TrainerInfo, GameOptions } from '../../../lib/parser/types';
import { TrainerCard } from '../TrainerCard';
import { PartyList } from '../PartyList';
import { MoveLocation } from '../../../lib/utils/manipulation';
import { useSaveContextSafe } from '../../../context/SaveContext';

interface DashboardTabProps {
    data: ParsedSave;
    handleTrainerUpdate: (updates: Partial<TrainerInfo>, optionUpdates?: Partial<GameOptions>) => void;
    handleOptionsUpdate: (updates: Partial<GameOptions>) => void;
    handlePokemonClick: (mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    handleEmptySlotClick: (location: MoveLocation, e: React.MouseEvent) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
    data,
    handleTrainerUpdate,
    handleOptionsUpdate,
    handlePokemonClick,
    handleEmptySlotClick,
}) => {
    const ctx = useSaveContextSafe();
    const isMoveMode = ctx?.isMoveMode ?? false;
    const setIsMoveMode = ctx?.setIsMoveMode;
    const globalMoveSources = ctx?.globalMoveSources ?? [];
    const onToggleSelection = ctx?.onToggleSelection;
    const onDropPokemon = ctx?.onDropPokemon;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Trainer Card (3 Cols) */}
            <div className="lg:col-span-4 xl:col-span-3">
                <TrainerCard 
                    data={data} 
                    onUpdate={handleTrainerUpdate}
                    onOptionsUpdate={handleOptionsUpdate}
                />
            </div>
            
            {/* Right Column: Party (9 Cols) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
                <div>
                    <PartyList 
                        party={data.party} 
                        generation={data.generation}
                        gameVersion={data.gameVersion}
                        isMoveMode={isMoveMode}
                        onEnableMoveMode={() => setIsMoveMode?.(true)} 
                        selectedMoveSources={globalMoveSources}
                        onPokemonClick={(mon, idx, e) => handlePokemonClick(mon, 'party', idx, undefined, e)}
                        onEmptySlotClick={(idx, e) => handleEmptySlotClick({ type: 'party', index: idx }, e)}
                        onToggleSelection={onToggleSelection ? (idx) => onToggleSelection({ type: 'party', index: idx }) : undefined}
                        onDropPokemon={onDropPokemon ? (idx, e) => onDropPokemon({ type: 'party', index: idx }, e) : undefined}
                    />
                </div>
            </div>
        </div>
    );
};
