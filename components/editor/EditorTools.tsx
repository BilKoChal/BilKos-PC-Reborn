
import React from 'react';
import { Search, Move, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface EditorToolsProps {
    onExport: () => void; 
    onImport: () => void;
    isMoveMode?: boolean;
    onToggleMoveMode?: (val: boolean) => void;
}

export const EditorTools: React.FC<EditorToolsProps> = ({ onExport, onImport, isMoveMode, onToggleMoveMode }) => {
    const { getGameTheme } = useTheme();
    
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
