import React from 'react';
import { ParsedSave } from '../../../lib/parser/types';
import { HallOfFame } from '../HallOfFame';

interface HallOfFameTabProps {
    data: ParsedSave;
}

export const HallOfFameTab: React.FC<HallOfFameTabProps> = ({
    data
}) => {
    return (
        <div className="w-full">
            <HallOfFame data={data} />
        </div>
    );
};
