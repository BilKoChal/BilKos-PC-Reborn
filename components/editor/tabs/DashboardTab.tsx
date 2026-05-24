import React from 'react';
import { ParsedSave, PokemonStats, TrainerInfo, GameOptions } from '../../../lib/parser/types';
import { TrainerCard } from '../TrainerCard';
import { PartyList } from '../PartyList';
import { MoveLocation } from '../../../lib/utils/manipulation';

interface DashboardTabProps {
    data: ParsedSave;
    isMoveMode: boolean;
    setIsMoveMode: (val: boolean) => void;
    globalMoveSources: MoveLocation[];
    handleTrainerUpdate: (updates: Partial<TrainerInfo>, optionUpdates?: Partial<GameOptions>) => void;
    handleOptionsUpdate: (updates: Partial<GameOptions>) => void;
    handlePokemonClick: (mon: PokemonStats, source: 'party' | 'box', index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    handleEmptySlotClick: (location: MoveLocation, e: React.MouseEvent) => void;
    onToggleSelection: (target: MoveLocation) => void;
    onDropPokemon: (target: MoveLocation, e: React.DragEvent) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
    data,
    isMoveMode,
    setIsMoveMode,
    globalMoveSources,
    handleTrainerUpdate,
    handleOptionsUpdate,
    handlePokemonClick,
    handleEmptySlotClick,
    onToggleSelection,
    onDropPokemon
}) => {
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
                        onEnableMoveMode={() => setIsMoveMode(true)} 
                        selectedMoveSources={globalMoveSources}
                        onPokemonClick={(mon, idx, e) => handlePokemonClick(mon, 'party', idx, undefined, e)}
                        onEmptySlotClick={(idx, e) => handleEmptySlotClick({ type: 'party', index: idx }, e)}
                        onToggleSelection={(idx) => onToggleSelection({ type: 'party', index: idx })}
                        onDropPokemon={(idx, e) => onDropPokemon({ type: 'party', index: idx }, e)}
                    />
                </div>
            </div>
        </div>
    );
};
