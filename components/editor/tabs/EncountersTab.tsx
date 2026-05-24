import React from 'react';
import { ParsedSave, PokemonStats } from '../../../lib/parser/types';
import { EncounterDatabase } from '../EncounterDatabase';

interface EncountersTabProps {
    data: ParsedSave;
    handleAddPokemon: (mon: PokemonStats, target: 'party' | 'pc') => void;
    onShowToast: (msg: string) => void;
}

export const EncountersTab: React.FC<EncountersTabProps> = ({
    data,
    handleAddPokemon,
    onShowToast
}) => {
    return (
        <div className="w-full">
            <EncounterDatabase 
                data={data} 
                onAddPokemon={handleAddPokemon}
                onToast={onShowToast}
            />
        </div>
    );
};
