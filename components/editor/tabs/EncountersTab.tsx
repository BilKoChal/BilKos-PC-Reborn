import React from 'react';
import { PokemonStats } from '../../../lib/parser/types';
import { EncounterDatabase } from '../EncounterDatabase';
import { useSaveContextSafe } from '../../../context/SaveContext';

interface EncountersTabProps {
    handleAddPokemon: (mon: PokemonStats, target: 'party' | 'pc') => void;
}

// TODO 1.5: `data` and `onShowToast` come from SaveContext.
export const EncountersTab: React.FC<EncountersTabProps> = ({ handleAddPokemon }) => {
    const ctx = useSaveContextSafe();
    if (!ctx) return null;
    return (
        <div className="w-full">
            <EncounterDatabase
                data={ctx.data}
                onAddPokemon={handleAddPokemon}
                onToast={ctx.onShowToast}
            />
        </div>
    );
};
