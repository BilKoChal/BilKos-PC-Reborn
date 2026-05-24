import React from 'react';
import { ParsedSave } from '../../../lib/parser/types';
import { EventFlagsManager } from '../EventFlagsManager';

interface EventsTabProps {
    data: ParsedSave;
    handleEventFlagsUpdate: (newFlags: boolean[]) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
    data,
    handleEventFlagsUpdate
}) => {
    return (
        <div className="w-full">
            <EventFlagsManager data={data} onUpdate={handleEventFlagsUpdate} />
        </div>
    );
};
