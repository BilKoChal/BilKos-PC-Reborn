import React from 'react';
import { Pokedex } from '../Pokedex';
import { useSaveContextSafe } from '../../../context/SaveContext';

interface PokedexTabProps {
    handlePokedexUpdate: (owned: boolean[], seen: boolean[]) => void;
}

// TODO 1.5: `data` comes from SaveContext; only the update handler is a prop.
export const PokedexTab: React.FC<PokedexTabProps> = ({ handlePokedexUpdate }) => {
    const ctx = useSaveContextSafe();
    if (!ctx) return null;
    return (
        <div className="w-full">
            <Pokedex data={ctx.data} onUpdate={handlePokedexUpdate} />
        </div>
    );
};
