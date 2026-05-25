import React, { useState } from 'react';
import { PokemonStats, Generation, PokemonIVs, PokemonEVs } from '../../../lib/parser/types';
import { LineChart, BarChart3, Hexagon } from 'lucide-react';
import { extensionRegistry } from '../../../lib/core/ExtensionRegistry';
import { useSaveContextSafe } from '../../../context/SaveContext';
import { IGenerationAdapter } from '../../../lib/interfaces';

interface PokemonStatsPanelProps {
    mon: PokemonStats;
    generation?: number;
    adapter?: IGenerationAdapter;
    updateIV: (stat: keyof PokemonStats['iv'], value: number) => void;
    updateEV: (stat: keyof PokemonStats['ev'], value: number) => void;
}

const StatsChart: React.FC<{ 
    stats: { label: string; val: number; color: string }[];
    mode: 'bar' | 'radar';
}> = ({ stats, mode }) => {
    const maxStatValue = Math.max(...stats.map(s => s.val));
    const scaleMax = maxStatValue > 0 ? Math.ceil(maxStatValue * 1.1) : 20;
    
    if (mode === 'bar') {
        return (
            <div className="h-48 w-full flex items-end justify-between gap-2 px-2 pb-6 relative">
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 pb-6">
                    <div className="border-t border-gray-900 w-full h-0"></div>
                    <div className="border-t border-gray-900 w-full h-0"></div>
                    <div className="border-t border-gray-900 w-full h-0"></div>
                    <div className="border-t border-gray-900 w-full h-0"></div>
                 </div>

                 {stats.map((d, i) => {
                     const pct = Math.min(100, (d.val / scaleMax) * 100);
                     return (
                          <div key={i} className="flex flex-col items-center w-full group relative h-full justify-end">
                              <div className="mb-1 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{d.val}</div>
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                  <div 
                                     className={`w-full ${d.color} transition-all duration-700 ease-out opacity-90 group-hover:opacity-100`}
                                     style={{ height: `${pct}%` }}
                                  ></div>
                              </div>
                              <div className="mt-2 text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{d.label}</div>
                          </div>
                     )
                 })}
            </div>
        );
    } else {
        const size = 180;
        const center = size / 2;
        const radius = 70;
        
        // Dynamic angle calculation based on stats length
        const points = stats.map((s, idx) => {
            const angle = -90 + (idx * (360 / stats.length));
            return { val: s.val, angle, label: dShort(s.label) };
        });

        const polyPoints = points.map(p => {
            const r = (Math.min(p.val, scaleMax) / scaleMax) * radius;
            const x = center + r * Math.cos(p.angle * Math.PI / 180);
            const y = center + r * Math.sin(p.angle * Math.PI / 180);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="h-48 w-full flex items-center justify-center relative">
                <svg width={size} height={size} className="overflow-visible">
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                        <polygon 
                            key={i}
                            points={points.map(p => {
                                const r = radius * scale;
                                const x = center + r * Math.cos(p.angle * Math.PI / 180);
                                const y = center + r * Math.sin(p.angle * Math.PI / 180);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="currentColor"
                            className="text-gray-200 dark:text-gray-700"
                            strokeWidth="1"
                        />
                    ))}
                    <polygon 
                        points={polyPoints}
                        className="fill-blue-500/20 stroke-blue-500 dark:stroke-blue-400"
                        strokeWidth="2"
                    />
                    {points.map((p, i) => {
                        const r = radius + 15;
                        const x = center + r * Math.cos(p.angle * Math.PI / 180);
                        const y = center + r * Math.sin(p.angle * Math.PI / 180);
                        return (
                            <text 
                                key={i} x={x} y={y} 
                                textAnchor="middle" dominantBaseline="middle"
                                className="text-[10px] font-bold fill-gray-400 uppercase"
                            >
                                {p.label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        );
    }
};

function dShort(label: string): string {
    if (label.toLowerCase() === 'special') return 'SPC';
    if (label.toLowerCase() === 'special attack' || label.toLowerCase() === 'sp. atk') return 'SPA';
    if (label.toLowerCase() === 'special defense' || label.toLowerCase() === 'sp. def') return 'SPD';
    return label.substring(0, 3).toUpperCase();
}

export const PokemonStatsPanel: React.FC<PokemonStatsPanelProps> = ({ mon, generation: generationProp, adapter: adapterProp, updateIV, updateEV }) => {
    const ctx = useSaveContextSafe();
    const generation = (generationProp ?? ctx?.generation ?? 1) as Generation;
    const adapter = adapterProp ?? ctx?.adapter;
    const [chartMode, setChartMode] = useState<'bar' | 'radar'>('bar');

    // Adapter-driven: replaces `generation === 1` branching for stat display
    const hasSplitSpecial = adapter?.hasSplitSpecial ?? (generation !== 1);

    // Dynamically choose stats array based on whether this generation has split Special
    // Type ivKey/evKey as keyof PokemonIVs / keyof PokemonEVs so updateIV/updateEV
    // accept them without `as any` casts.
    type IvKey = keyof PokemonIVs;
    type EvKey = keyof PokemonEVs;

    const statData: { label: string; val: number; iv: number; ev: number; ivKey: IvKey; evKey: EvKey; color: string; barColor: string }[] = [
        { label: 'HP', val: mon.hp, iv: mon.iv.hp, ev: mon.ev.hp, ivKey: 'hp', evKey: 'hp', color: 'text-red-500', barColor: 'bg-red-500' },
        { label: 'Attack', val: mon.attack, iv: mon.iv.attack, ev: mon.ev.attack, ivKey: 'attack', evKey: 'attack', color: 'text-orange-500', barColor: 'bg-orange-500' },
        { label: 'Defense', val: mon.defense, iv: mon.iv.defense, ev: mon.ev.defense, ivKey: 'defense', evKey: 'defense', color: 'text-yellow-500', barColor: 'bg-yellow-500' },
        { label: 'Speed', val: mon.speed, iv: mon.iv.speed, ev: mon.ev.speed, ivKey: 'speed', evKey: 'speed', color: 'text-pink-500', barColor: 'bg-pink-500' },
    ];

    if (!hasSplitSpecial) {
        statData.push({
            label: 'Special', val: mon.special, iv: mon.iv.special, ev: mon.ev.special, ivKey: 'special', evKey: 'special', color: 'text-blue-500', barColor: 'bg-blue-500'
        });
    } else {
        statData.push(
            { label: 'Sp. Atk', val: mon.spAtk || 0, iv: mon.iv.special, ev: mon.ev.special, ivKey: 'special', evKey: 'special', color: 'text-blue-500', barColor: 'bg-blue-500' },
            { label: 'Sp. Def', val: mon.spDef || 0, iv: mon.iv.special, ev: mon.ev.special, ivKey: 'special', evKey: 'special', color: 'text-indigo-500', barColor: 'bg-indigo-500' }
        );
    }

    const extensions = extensionRegistry.getExtensions('pokemon-stats', generation);

    return (
        <div className="bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-400 tracking-widest uppercase flex items-center gap-2">
                    <LineChart size={16} /> Stats & DVs/EVs
                </h3>
                <div className="flex bg-gray-200 dark:bg-gray-800 p-0.5 rounded-lg">
                    <button 
                        onClick={() => setChartMode('bar')}
                        className={`p-1.5 rounded-md transition-all ${chartMode === 'bar' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <BarChart3 size={14} />
                    </button>
                    <button 
                        onClick={() => setChartMode('radar')}
                        className={`p-1.5 rounded-md transition-all ${chartMode === 'radar' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Hexagon size={14} />
                    </button>
                </div>
            </div>

            {/* Visualization */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <StatsChart 
                    mode={chartMode}
                    stats={statData.map(s => ({ label: s.label, val: s.val, color: s.barColor }))}
                />
            </div>

            {/* Inputs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                <div className="grid grid-cols-[1fr_60px_80px] gap-0 text-xs font-bold text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 py-2 px-4">
                    <span>Stat</span>
                    <span className="text-center">DV (0-15)</span>
                    <span className="text-center">EV (Max)</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {statData.map((row, i) => (
                        <div key={i} className="grid grid-cols-[1fr_60px_80px] items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${row.color}`}>{row.label}</span>
                                <span className="text-xs text-gray-400 font-mono">{row.val}</span>
                            </div>
                            <div className="flex justify-center">
                                <input 
                                    type="number" 
                                    value={row.iv}
                                    onChange={(e) => updateIV(row.ivKey, Number(e.target.value))}
                                    className="w-10 text-center text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded py-1 border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="flex justify-center">
                                <input 
                                    type="number" 
                                    value={row.ev}
                                    onChange={(e) => updateEV(row.evKey, Number(e.target.value))}
                                    className="w-14 text-center text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded py-1 border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Render Extensions */}
            {extensions.length > 0 && (
                <div className="flex flex-col gap-4">
                    {extensions.map(ext => (
                        <div key={ext.id} className="extension-container">
                            {ext.render(mon, {
                                generation,
                                onChange: (field, val) => {
                                    if (field.startsWith('iv.')) {
                                        const key = field.substring(3) as IvKey;
                                        updateIV(key, val as number);
                                    } else if (field.startsWith('ev.')) {
                                        const key = field.substring(3) as EvKey;
                                        updateEV(key, val as number);
                                    }
                                },
                                theme: undefined
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
