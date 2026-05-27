import React, { useState } from 'react';
import { GameVersion } from '../../lib/parser/types';
import { Disc, CheckCircle2, AlertCircle, ArrowRight, FileQuestion } from 'lucide-react';
import { useModalA11y } from '../../lib/hooks/useModalA11y';

interface GameVersionSelectorProps {
    filename: string;
    detectedVersion: GameVersion;
    onConfirm: (version: GameVersion) => void;
    onCancel: () => void;
}

export const GameVersionSelector: React.FC<GameVersionSelectorProps> = ({ filename, detectedVersion, onConfirm, onCancel }) => {
    const isGen2 = ['Gold', 'Silver', 'Crystal'].includes(detectedVersion);
    const [selected, setSelected] = useState<GameVersion>(detectedVersion);

    const { modalRef, handleKeyDown, handleBackdropClick, modalProps, headingId } = useModalA11y({
        isOpen: true, // always rendered when visible
        onClose: onCancel,
    });

    React.useEffect(() => {
        setSelected(detectedVersion);
    }, [detectedVersion]);

    const cartridges = isGen2 ? [
        { id: 'Gold', label: 'Gold Version', color: 'bg-amber-500', hover: 'hover:bg-amber-400', ring: 'ring-amber-400', shadow: 'shadow-amber-500/40' },
        { id: 'Silver', label: 'Silver Version', color: 'bg-slate-400', hover: 'hover:bg-slate-300', ring: 'ring-slate-300', shadow: 'shadow-slate-400/40' }
    ] : [
        { id: 'Red', label: 'Red Version', color: 'bg-red-600', hover: 'hover:bg-red-500', ring: 'ring-red-400', shadow: 'shadow-red-500/40' },
        { id: 'Blue', label: 'Blue Version', color: 'bg-blue-600', hover: 'hover:bg-blue-500', ring: 'ring-blue-400', shadow: 'shadow-blue-500/40' }
    ];

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={handleBackdropClick}>
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                {...modalProps}
                aria-labelledby={headingId}
                className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 relative"
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="bg-gray-100 dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-blue-500"></div>

                    {/* Filename Badge */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-mono font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm truncate max-w-[200px]">
                            <FileQuestion size={14} />
                            <span className="truncate">{filename}</span>
                        </span>
                    </div>

                    <h2 id={headingId} className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-1">
                        Ambiguous Game Data
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-200 dark:bg-gray-800/50 py-1 px-3 rounded-full w-fit mx-auto">
                        <AlertCircle size={12} className="text-orange-500" />
                        <span>Analysis: {detectedVersion.toUpperCase()} Detected</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-8 text-center">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto leading-relaxed animate-in fade-in">
                        {isGen2 ? (
                            <span>The system has detected a Generation II save file. Please select whether it represents <strong className="text-amber-500">Gold</strong> or <strong className="text-slate-500">Silver</strong>.</span>
                        ) : (
                            <span>The system cannot distinguish between <strong className="text-red-500">Red</strong> and <strong className="text-blue-500">Blue</strong>. Select the correct version.</span>
                        )}
                    </p>

                    <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-lg mx-auto mb-6">
                        {cartridges.map((cart) => (
                            <button
                                key={cart.id}
                                onClick={() => setSelected(cart.id as GameVersion)}
                                className={`
                                    relative h-32 md:h-40 rounded-2xl border-4 transition-all duration-300 group
                                    flex flex-col items-center justify-center gap-2 overflow-hidden
                                    ${selected === cart.id
                                        ? `border-transparent ${cart.ring} ring-2 md:ring-4 scale-105 shadow-xl ${cart.shadow} z-10`
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 opacity-60 hover:opacity-100'
                                    }
                                `}
                            >
                                {/* Cartridge Body */}
                                <div className={`absolute inset-0 ${cart.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                                <div className={`
                                    w-12 h-12 md:w-16 md:h-16 rounded-lg ${cart.color} text-white flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500
                                `}>
                                    <Disc size={24} className="md:w-8 md:h-8" />
                                </div>

                                <span className={`font-black uppercase tracking-wider text-sm md:text-lg ${selected === cart.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {cart.label}
                                </span>

                                {selected === cart.id && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-0.5 rounded-full shadow-sm animate-in zoom-in">
                                        <CheckCircle2 size={14} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-bold text-xs md:text-sm px-4 py-2 transition-colors order-2 sm:order-1"
                        >
                            Skip File
                        </button>
                        <button
                            onClick={() => onConfirm(selected)}
                            className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            <span>Confirm & Load</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
