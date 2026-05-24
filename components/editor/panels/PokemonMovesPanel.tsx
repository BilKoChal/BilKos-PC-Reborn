import React from 'react';
import { PokemonStats } from '../../../types';
import { Sparkles } from 'lucide-react';
import { Autocomplete } from '../../ui/Autocomplete';
import { TypeBadge } from '../../ui/PokemonBadges';
import { MOVES_LIST, MOVES_PP, MOVES_TYPE } from '../../../lib/generations/gen1/data/moves';
import { extensionRegistry } from '../../../lib/core/ExtensionRegistry';

interface PokemonMovesPanelProps {
    mon: PokemonStats;
    generation: number;
    updateMove: (index: number, moveName: string) => void;
    updatePpUp: (index: number, count: number) => void;
    updateField: (field: keyof PokemonStats, value: unknown) => void;
}

export const PokemonMovesPanel: React.FC<PokemonMovesPanelProps> = ({ 
    mon, generation, updateMove, updatePpUp, updateField 
}) => {
    // Helper to clamp values
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    const extensions = extensionRegistry.getExtensions('pokemon-moves', generation);

    return (
        <div className="h-full bg-white dark:bg-gray-900">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Sparkles size={16} /> Moveset
            </h3>
            <div className="space-y-4">
                {mon.moves.map((move, i) => {
                    const moveId = mon.moveIds[i] || 0;
                    const basePP = MOVES_PP[moveId] || 0;
                    const ppUps = mon.movePpUps[i] || 0;
                    // Max PP Formula: Base * (1 + 0.2 * Ups)
                    const maxPP = Math.floor(basePP * (1 + 0.2 * ppUps));
                    const moveType = MOVES_TYPE[moveId] || 'Normal';

                    return (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800 transition-all hover:border-blue-300 dark:hover:border-blue-700 group">
                            
                            {/* Move Selector with Type Badge */}
                            <div className="flex gap-2 items-center mb-3">
                                <div className="flex-grow">
                                    <Autocomplete 
                                        options={MOVES_LIST} 
                                        value={move === '-' ? '' : move} 
                                        onChange={(val) => updateMove(i, val || '-')}
                                        placeholder={`Move ${i + 1}`}
                                        className="w-full"
                                    />
                                </div>
                                {/* Show Type Badge if move is selected */}
                                {move !== '-' && move !== '' && (
                                    <div className="shrink-0">
                                        <TypeBadge type={moveType} size="sm" showLabel={false} />
                                    </div>
                                )}
                            </div>

                            {/* Render Moves Section Extensions (if any, e.g. Gen 4 Category indicator) */}
                            {move !== '-' && move !== '' && extensions.length > 0 && (
                                <div className="flex flex-col gap-2 pt-1 pb-2">
                                    {extensions.map(ext => (
                                        <div key={ext.id}>
                                            {ext.render({ index: i, moveName: move, moveId }, {
                                                generation,
                                                onChange: (field, val) => updateField(field as keyof PokemonStats, val),
                                                theme: undefined
                                            })}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PP and PP Ups */}
                            {move !== '-' && (
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">PP</div>
                                        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1">
                                            <input 
                                                type="number"
                                                value={mon.movePp[i]}
                                                onChange={(e) => {
                                                    const newPps = [...mon.movePp];
                                                    newPps[i] = clamp(Number(e.target.value), 0, maxPP);
                                                    updateField('movePp', newPps);
                                                }}
                                                className="w-8 bg-transparent text-center text-xs font-mono py-0.5 outline-none"
                                            />
                                            <span className="text-[10px] text-gray-400 font-mono select-none">/ {maxPP}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mr-1">PP Up</div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(step => (
                                                    <button
                                                    key={step}
                                                    onClick={() => updatePpUp(i, mon.movePpUps[i] === step ? step - 1 : step)} // Toggle logic
                                                    className={`
                                                        w-3 h-3 rounded-full border transition-all
                                                        ${mon.movePpUps[i] >= step 
                                                            ? 'bg-green-500 border-green-600' 
                                                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-green-200'
                                                        }
                                                    `}
                                                    />
                                                ))}
                                            </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
