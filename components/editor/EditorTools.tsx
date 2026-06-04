
import React, { useState } from 'react';
import { Search, Move, Save, CheckCircle2, XCircle, Undo2, Redo2, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SaveValidationResult } from '../../lib/parser/types';

interface EditorToolsProps {
    onExport: () => void; 
    onImport: () => void;
    isMoveMode?: boolean;
    onToggleMoveMode?: (val: boolean) => void;
    /** Whether the current save's initial checksum was valid */
    isSaveValid?: boolean;
    /** Detailed validation result from adapter.validateSaveDetailed() */
    validationResult?: SaveValidationResult | null;
    /** Callback to re-run detailed validation (Verify button) */
    onVerify?: () => SaveValidationResult;
    /** Whether undo is available */
    canUndo?: boolean;
    /** Whether redo is available */
    canRedo?: boolean;
    /** Undo handler */
    onUndo?: () => void;
    /** Redo handler */
    onRedo?: () => void;
}

export const EditorTools: React.FC<EditorToolsProps> = ({ 
    onExport, 
    onImport, 
    isMoveMode, 
    onToggleMoveMode,
    isSaveValid,
    validationResult,
    onVerify,
    canUndo,
    canRedo,
    onUndo,
    onRedo
}) => {
    const { getGameTheme } = useTheme();
    const [showValidationDetail, setShowValidationDetail] = useState(false);
    const [localValidation, setLocalValidation] = useState<SaveValidationResult | null>(null);

    const handleVerify = () => {
        if (onVerify) {
            const result = onVerify();
            setLocalValidation(result);
            setShowValidationDetail(true);
        }
    };

    const displayResult = localValidation ?? validationResult;

    return (
        <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 sticky top-16 z-40 shadow-sm">
            <div className="max-w-[100rem] mx-auto flex flex-row items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Controls Area */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Undo/Redo Buttons */}
                    {onUndo && onRedo && (
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={onUndo}
                                disabled={!canUndo}
                                className={`p-2 rounded-lg transition-all ${
                                    canUndo 
                                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95' 
                                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                }`}
                                title="Undo (Ctrl+Z)"
                                aria-label="Undo"
                            >
                                <Undo2 size={16} />
                            </button>
                            <button
                                onClick={onRedo}
                                disabled={!canRedo}
                                className={`p-2 rounded-lg transition-all ${
                                    canRedo 
                                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95' 
                                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                }`}
                                title="Redo (Ctrl+Shift+Z)"
                                aria-label="Redo"
                            >
                                <Redo2 size={16} />
                            </button>
                        </div>
                    )}

                    {/* Checksum Validation Badge */}
                    {isSaveValid !== undefined && (
                        <div className="relative">
                            <button
                                onClick={handleVerify}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                    isSaveValid 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' 
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                                }`}
                                title={isSaveValid ? 'Checksum valid — click to verify' : 'Checksum invalid — click for details'}
                                aria-label={isSaveValid ? 'Checksum valid, verify save' : 'Checksum invalid, view details'}
                            >
                                {isSaveValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                <span className="hidden sm:inline">{isSaveValid ? 'Valid' : 'Invalid'}</span>
                            </button>

                            {/* Validation Detail Popover */}
                            {showValidationDetail && displayResult && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Checksum Details</span>
                                        <button 
                                            onClick={() => setShowValidationDetail(false)} 
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className={`text-sm font-semibold ${displayResult.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {displayResult.summary}
                                        </div>
                                        {displayResult.details.map((detail, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs">
                                                {detail.valid 
                                                    ? <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" /> 
                                                    : <XCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                                                }
                                                <div>
                                                    <div className={`font-medium ${detail.valid ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}`}>
                                                        {detail.label}
                                                    </div>
                                                    {!detail.valid && detail.expected !== undefined && detail.actual !== undefined && (
                                                        <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Expected: 0x{detail.expected.toString(16).toUpperCase()}, Actual: 0x{detail.actual.toString(16).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {onToggleMoveMode && (
                        <button 
                            onClick={() => onToggleMoveMode(!isMoveMode)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all border whitespace-nowrap
                                ${isMoveMode 
                                    ? 'bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-400 ring-offset-1' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                                }
                            `}
                            title="Toggle Move Mode"
                        >
                            <Move size={16} />
                            <span className="hidden sm:inline">{isMoveMode ? 'Move Mode On' : 'Move Mode'}</span>
                        </button>
                    )}

                    <button 
                        onClick={onExport}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs text-white shadow-md hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                        style={{ backgroundColor: '#10B981' }}
                        title="Export Save"
                    >
                        <Save size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
