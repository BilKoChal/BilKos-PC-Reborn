import React from 'react';
import { HallOfFame } from '../HallOfFame';
import { useSaveContextSafe } from '../../../context/SaveContext';

// TODO 1.5: reads `data` from SaveContext instead of a drilled prop.
export const HallOfFameTab: React.FC = () => {
    const ctx = useSaveContextSafe();
    if (!ctx) return null;
    return (
        <div className="w-full">
            <HallOfFame data={ctx.data} />
        </div>
    );
};
