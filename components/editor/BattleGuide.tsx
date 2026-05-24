
import React, { useState } from 'react';
import { TYPE_COLORS } from '../../lib/data/gameData';
import { useTheme } from '../../context/ThemeContext';
import { Swords, Shield } from 'lucide-react';
import { TypeBadge } from '../ui/PokemonBadges';

// Gen 1 Types Only (No Dark, Steel, Fairy)
const TYPES = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 
    'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon'
];

// Gen 1 Type Chart (RBY Mechanics)
// 0: No Effect, 0.5: Not Very Effective, 1: Neutral (Undefined), 2: Super Effective
const CHART: Record<string, Record<string, number>> = {
    Normal:   { Rock: 0.5, Ghost: 0 },
    Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5 },
    Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5 },
    Ice:      { Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2 }, // Note: Ice is Neutral vs Fire in Gen 1
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0 },
    Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Bug: 2, Rock: 0.5, Ghost: 0.5 }, // Note: Poison SE vs Bug in Gen 1
    Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2 },
    Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5 },
    Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5 },
    Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 2, Flying: 0.5, Psychic: 2, Ghost: 0.5 }, // Note: Bug SE vs Poison in Gen 1
    Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2 },
    Ghost:    { Normal: 0, Psychic: 0, Ghost: 2 }, // Note: Ghost vs Psychic is 0x (Glitch/Design) in Gen 1
    Dragon:   { Dragon: 2 }
};

export const BattleGuide: React.FC = () => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    
    const [mode, setMode] = useState<'offense' | 'defense'>('defense');
    const [selectedType1, setSelectedType1] = useState<string>('Normal');
    const [selectedType2, setSelectedType2] = useState<string | null>(null);

    const getEffectiveness = (atk: string, def1: string, def2: string | null) => {
        let multi = 1;
        
        // Def 1
        const mod1 = CHART[atk]?.[def1];
        multi *= (mod1 !== undefined ? mod1 : 1);

        // Def 2
        if (def2 && def2 !== def1) {
            const mod2 = CHART[atk]?.[def2];
            multi *= (mod2 !== undefined ? mod2 : 1);
        }

        return multi;
    };

    const calculateMatchups = () => {
        const results = {
            weak4: [] as string[],
            weak2: [] as string[],
            resist2: [] as string[],
            resist4: [] as string[],
            immune: [] as string[]
        };

        if (mode === 'defense') {
            // We are being hit BY these types
            TYPES.forEach(atk => {
                const eff = getEffectiveness(atk, selectedType1, selectedType2);
                if (eff === 0) results.immune.push(atk);
                else if (eff === 4) results.weak4.push(atk);
                else if (eff === 2) results.weak2.push(atk);
                else if (eff === 0.5) results.resist2.push(atk);
                else if (eff === 0.25) results.resist4.push(atk);
            });
        } else {
            // We are attacking these types (Single type attack)
            // Just show what selectedType1 is effective against
            TYPES.forEach(def => {
                const eff = getEffectiveness(selectedType1, def, null);
                if (eff === 0) results.immune.push(def); // No effect on
                else if (eff === 2) results.weak2.push(def); // Super effective on
                else if (eff === 0.5) results.resist2.push(def); // Not very effective on
            });
        }

        return results;
    };

    const results = calculateMatchups();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div 
                className="p-6 flex flex-col items-center justify-center relative bg-theme-primary text-theme-text-on-primary"
            >
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                <h2 className="text-2xl font-black uppercase tracking-widest relative z-10 mb-4">Gen 1 Type Chart</h2>
                
                <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-sm relative z-10">
                    <button 
                        onClick={() => setMode('defense')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'defense' ? 'bg-white text-gray-900 shadow-md' : 'text-white hover:bg-white/10'}`}
                    >
                        <Shield size={16} /> Defense
                    </button>
                    <button 
                        onClick={() => setMode('offense')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'offense' ? 'bg-white text-gray-900 shadow-md' : 'text-white hover:bg-white/10'}`}
                    >
                        <Swords size={16} /> Offense
                    </button>
                </div>
            </div>

            {/* Type Selector */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                <div className="text-center mb-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                    Select {mode === 'defense' ? 'Your Types' : 'Attack Type'}
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {TYPES.map(t => (
                        <TypeBadge 
                            key={t} 
                            type={t} 
                            active={selectedType1 === t || selectedType2 === t}
                            onClick={() => {
                                if (mode === 'offense') {
                                    setSelectedType1(t);
                                    setSelectedType2(null);
                                } else {
                                    if (selectedType1 === t) return; // Can't unselect primary
                                    if (selectedType2 === t) setSelectedType2(null);
                                    else if (selectedType1 !== t) {
                                        if (!selectedType2) setSelectedType2(t);
                                        else setSelectedType1(t); // Replace primary if 2 selected? simplified logic
                                    }
                                }
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-bold mb-1">TYPE 1</span>
                        <TypeBadge type={selectedType1} active />
                    </div>
                    {selectedType2 && (
                        <>
                            <span className="text-gray-300 font-black">+</span>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 font-bold mb-1">TYPE 2</span>
                                <TypeBadge type={selectedType2} active onClick={() => setSelectedType2(null)} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
                
                {mode === 'defense' ? (
                    <>
                        {results.weak4.length > 0 && (
                            <ResultSection title="Critically Weak (4x)" types={results.weak4} color="text-red-600" />
                        )}
                        {results.weak2.length > 0 && (
                            <ResultSection title="Weak (2x)" types={results.weak2} color="text-orange-500" />
                        )}
                        {results.resist2.length > 0 && (
                            <ResultSection title="Resistant (0.5x)" types={results.resist2} color="text-green-600" />
                        )}
                        {results.resist4.length > 0 && (
                            <ResultSection title="Very Resistant (0.25x)" types={results.resist4} color="text-blue-600" />
                        )}
                        {results.immune.length > 0 && (
                            <ResultSection title="Immune (0x)" types={results.immune} color="text-gray-400" />
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-center text-sm text-gray-500 mb-4">
                            Attacking with <span className="font-bold" style={{ color: TYPE_COLORS[selectedType1] }}>{selectedType1}</span> moves:
                        </div>
                        {results.weak2.length > 0 && (
                            <ResultSection title="Super Effective Against" types={results.weak2} color="text-green-600" />
                        )}
                        {results.resist2.length > 0 && (
                            <ResultSection title="Not Very Effective Against" types={results.resist2} color="text-red-500" />
                        )}
                        {results.immune.length > 0 && (
                            <ResultSection title="No Effect On" types={results.immune} color="text-gray-400" />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const ResultSection: React.FC<{ title: string; types: string[]; color: string }> = ({ title, types, color }) => (
    <div>
        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${color} border-b border-gray-100 dark:border-gray-700 pb-1`}>
            {title}
        </h4>
        <div className="flex flex-wrap gap-2">
            {types.map(t => <TypeBadge key={t} type={t} />)}
        </div>
    </div>
);
