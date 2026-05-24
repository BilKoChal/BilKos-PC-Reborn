
import React from 'react';
import { ParsedSave, HallOfFameTeam } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { Trophy, Crown, Star, Calendar } from 'lucide-react';
import { TYPE_COLORS } from '../../lib/data/gameData';

interface HallOfFameProps {
    data: ParsedSave;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ data }) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    const teams = data.hallOfFame || [];

    if (teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
                    <Trophy size={48} className="text-yellow-500 opacity-50" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Records Found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Either you haven't beaten the Elite Four yet, or Hall of Fame parsing isn't fully supported for this generation.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {teams.map((team, index) => (
                <div 
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative"
                >
                    {/* Golden Header */}
                    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-4 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        
                        <div className="flex items-center gap-3 relative z-10">
                            <Crown size={24} className="text-yellow-100" />
                            <div>
                                <h3 className="font-black text-lg uppercase tracking-widest leading-none">Induction #{team.id || index + 1}</h3>
                                <span className="text-xs font-bold text-yellow-100 opacity-80">CHAMPION</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-yellow-100 font-mono text-sm font-bold relative z-10 bg-black/10 px-3 py-1 rounded-full">
                            <Calendar size={14} />
                            <span>Entry #{teams.length - index}</span>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {team.pokemon.map((mon, mIdx) => (
                                <div key={mIdx} className="flex flex-col items-center group">
                                    <div className="relative w-full aspect-square bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center mb-3 transition-transform group-hover:-translate-y-1">
                                        <div className="absolute top-2 right-2">
                                            <Star size={12} className="text-yellow-400 fill-current" />
                                        </div>
                                        
                                        <img 
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.dexId}.png`} 
                                            alt={mon.speciesName}
                                            className="w-3/4 h-3/4 object-contain pixelated"
                                            loading="lazy"
                                        />
                                        
                                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-white text-[10px] font-bold text-center py-0.5 rounded-b-xl">
                                            Lv. {mon.level}
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <div className="font-black text-gray-800 dark:text-gray-200 text-sm truncate mb-1">
                                            {mon.nickname}
                                        </div>
                                        <div className="flex justify-center gap-1">
                                            {mon.types.map(t => (
                                                <span 
                                                    key={t} 
                                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                                    style={{ backgroundColor: TYPE_COLORS[t] || '#ccc' }}
                                                    title={t}
                                                ></span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
