
import React from 'react';
import { Save, Settings, X, FileCode } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (extension: 'sav' | 'srm') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Save className="w-5 h-5 text-green-400" />
                        <h3 className="font-bold text-lg">Export Save File</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                        Choose your preferred file format. Both formats contain the same data.
                    </p>

                    <div className="space-y-4">
                        <button 
                            onClick={() => onExport('sav')}
                            className="w-full group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left"
                        >
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                <Save size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">Standard (.sav)</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Compatible with most emulators and flash carts.</div>
                            </div>
                        </button>

                        <button 
                            onClick={() => onExport('srm')}
                            className="w-full group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                        >
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Settings size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">RetroArch (.srm)</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Commonly used by RetroArch cores (Gambatte/mGBA).</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-950 p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                     <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        Cancel Export
                     </button>
                </div>
            </div>
        </div>
    );
};
