import React from 'react';
import { ParsedSave } from '../../../lib/parser/types';
import { Pokedex } from '../Pokedex';

interface PokedexTabProps {
    data: ParsedSave;
    handlePokedexUpdate: (owned: boolean[], seen: boolean[]) => void;
}

export const PokedexTab: React.FC<PokedexTabProps> = ({
    data,
    handlePokedexUpdate
}) => {
    return (
        <div className="w-full">
            <Pokedex data={data} onUpdate={handlePokedexUpdate} />
        </div>
    );
};
