import React from 'react';
import { X } from 'lucide-react';

interface MoveModeFABProps {
    isActive: boolean;
    selectedCount: number;
    onExit: () => void;
}

export const MoveModeFAB: React.FC<MoveModeFABProps> = ({ isActive, selectedCount, onExit }) => {
    if (!isActive) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[900] animate-in zoom-in duration-300">
            <button
                onClick={onExit}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
                title="Exit Move Mode"
                aria-label="Exit Move Mode"
            >
                <X size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            </button>
            <div className="absolute -top-10 right-0 bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {selectedCount > 0 ? `${selectedCount} Selected` : 'Move Mode'}
            </div>
        </div>
    );
};
