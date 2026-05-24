import React, { useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ, X, Layers, Box, Globe, Check, BookOpen, SaveAll } from 'lucide-react';
import { SortCriteria, SortDirection, SortScope } from '../../lib/utils/sortManager';

interface SortSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (scope: SortScope, criteria: SortCriteria, direction: SortDirection, includeAllSaves: boolean) => void;
}

export const SortSettingsModal: React.FC<SortSettingsModalProps> = ({ isOpen, onClose, onApply }) => {
  const [scope, setScope] = useState<SortScope>('single');
  const [criteria, setCriteria] = useState<SortCriteria>('id');
  const [direction, setDirection] = useState<SortDirection>('asc');
  const [includeAllSaves, setIncludeAllSaves] = useState(false);

  if (!isOpen) return null;

  const isLivingDex = scope === 'living-dex';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-800 dark:bg-gray-950 text-white p-4 flex justify-between items-center border-b border-gray-700">
           <div className="flex items-center gap-2">
             <ArrowDownAZ className="w-5 h-5 text-indigo-400" />
             <h3 className="font-bold text-lg">Sort PC Storage</h3>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Scope Selection */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">
                    SORTING METHOD
                </label>
                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={() => setScope('single')}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${scope === 'single' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                    >
                        <Box className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <div className="font-bold text-sm">Current Box Only</div>
                            <div className="text-[10px] opacity-70">Sorts only the box you are viewing.</div>
                        </div>
                        {scope === 'single' && <Check className="ml-auto w-4 h-4" />}
                    </button>

                    <button 
                        onClick={() => setScope('all-indiv')}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${scope === 'all-indiv' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                    >
                        <Layers className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <div className="font-bold text-sm">All Boxes (Sort Individually)</div>
                            <div className="text-[10px] opacity-70">Sorts each of the 12 boxes separately.</div>
                        </div>
                        {scope === 'all-indiv' && <Check className="ml-auto w-4 h-4" />}
                    </button>

                    <button 
                        onClick={() => setScope('all-global')}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${scope === 'all-global' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                    >
                        <Globe className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <div className="font-bold text-sm">Global Sort (Merge & Refill)</div>
                            <div className="text-[10px] opacity-70">Combines ALL Pokemon, sorts them, and refills boxes.</div>
                        </div>
                        {scope === 'all-global' && <Check className="ml-auto w-4 h-4" />}
                    </button>

                    <button 
                        onClick={() => setScope('living-dex')}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${scope === 'living-dex' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                    >
                        <BookOpen className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <div className="font-bold text-sm">Living Dex Organization</div>
                            <div className="text-[10px] opacity-70">Organizes by Dex Number (1-151) into specific boxes.</div>
                        </div>
                        {scope === 'living-dex' && <Check className="ml-auto w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Living Dex Options */}
            {isLivingDex && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${includeAllSaves ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'}`}>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={includeAllSaves} 
                            onChange={(e) => setIncludeAllSaves(e.target.checked)} 
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${includeAllSaves ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 bg-white dark:bg-gray-800'}`}>
                            {includeAllSaves && <Check size={14} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <SaveAll size={16} />
                                Search in all open saves
                            </div>
                            <div className="text-[10px] opacity-80 leading-tight mt-0.5">
                                If checked, this will gather Pokemon from ALL open save tabs (Boxes + Party) to build the Living Dex in this save.
                            </div>
                        </div>
                    </label>
                </div>
            )}

            {/* Criteria & Direction (Disabled for Living Dex) */}
            <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${isLivingDex ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                {/* Criteria */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">
                        SORT CRITERIA
                    </label>
                    <div className="flex flex-col gap-1">
                        {[
                            { id: 'id', label: 'Dex ID' },
                            { id: 'species', label: 'Species Name' },
                            { id: 'nickname', label: 'Nickname' },
                            { id: 'level', label: 'Level' },
                            { id: 'type', label: 'Type' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setCriteria(opt.id as SortCriteria)}
                                className={`px-3 py-2 rounded-lg text-sm font-bold text-left transition-colors ${criteria === opt.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Direction */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">
                        ORDER
                    </label>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => setDirection('asc')}
                            className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 transition-all ${direction === 'asc' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                        >
                            <ArrowDownAZ className="w-4 h-4" />
                            <span className="text-xs font-bold">Ascending (A-Z / 1-9)</span>
                        </button>
                        <button 
                            onClick={() => setDirection('desc')}
                            className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 transition-all ${direction === 'desc' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                        >
                            <ArrowUpAZ className="w-4 h-4" />
                            <span className="text-xs font-bold">Descending (Z-A / 9-1)</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLivingDex && (
               <div className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 italic">
                  Note: Living Dex mode always checks the Party for candidates. It prioritizes the highest level Pokemon for the main slot and moves duplicates to the end.
               </div>
            )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-950 p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
           <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
             Cancel
           </button>
           <button 
             onClick={() => { onApply(scope, criteria, direction, includeAllSaves); onClose(); }}
             className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
           >
             Apply Sort
           </button>
        </div>
      </div>
    </div>
  );
};