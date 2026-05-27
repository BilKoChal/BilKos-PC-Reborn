
import React from 'react';
import { GameVersion } from '../../lib/parser/types';
import { Check, Eye, Ban, X, MapPin, AlignLeft } from 'lucide-react';
import { TypeBadge } from './PokemonBadges';
import { useSpriteMode } from '../../context/SpriteContext';
import { useSaveContextSafe } from '../../context/SaveContext';
import { getPokemonSpriteUrl, getSpriteImgClasses, getIntegerScaleStyle } from '../../lib/sprites';
import { useModalA11y } from '../../lib/hooks/useModalA11y';

interface PokemonDetailViewProps {
    id: number;
    owned: boolean;
    seen: boolean;
    version: GameVersion;
    onClose: () => void;
    onToggleStatus?: () => void;
}

export const PokemonDetailView: React.FC<PokemonDetailViewProps> = ({ id, owned, seen, version, onClose, onToggleStatus }) => {
    const { mode: spriteMode } = useSpriteMode();
    const ctx = useSaveContextSafe();
    const adapter = ctx?.adapter;

    const { modalRef, handleKeyDown, handleBackdropClick, modalProps, headingId } = useModalA11y({
        isOpen: true, // always rendered when visible
        onClose,
        inertBackground: false, // this can be nested inside PokemonEditorModal; don't inert parent
        lockScroll: false,      // parent modal already locks scroll
    });

    // Adapter-driven data access — replaces all direct Gen-1/Gen-2 data imports.
    const name = adapter?.getPokemonName(id) ?? `Species ${id}`;
    const typesInfo = adapter?.getTypes(id);
    const types = typesInfo ? [typesInfo.type1Name, typesInfo.type2Name].filter((t, i, arr) => i === 0 || t !== arr[0]) : [];
    const flavorText = adapter?.getPokedexEntry(id, version) ?? "Data not found.";
    const locationText = adapter?.getEncounterLocations(id, version) ?? "Unknown location.";

    const spriteUrl = getPokemonSpriteUrl(id, spriteMode, version);
    const integerScaleStyle = getIntegerScaleStyle(spriteMode, 320) as React.CSSProperties;

    return (
        <div className="fixed inset-0 z-[300] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                {...modalProps}
                aria-labelledby={headingId}
                className="w-full max-w-4xl h-[600px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row overflow-hidden relative"
                onKeyDown={handleKeyDown}
            >

                {/* Left Column: Visuals */}
                <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 relative">
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors md:hidden z-10">
                        <X size={20} />
                    </button>

                    <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                        <img
                            src={spriteUrl}
                            alt={name}
                            style={integerScaleStyle}
                            className={getSpriteImgClasses(spriteMode, `drop-shadow-2xl transition-all duration-500 ${!seen && !owned ? 'brightness-0 opacity-20' : ''}`)}
                        />
                    </div>

                    <div className="text-center relative z-10">
                        <h2 id={headingId} className="text-4xl font-black uppercase text-gray-900 dark:text-white mb-2 tracking-tighter">
                            {name}
                        </h2>
                        <div className="flex gap-2 justify-center mb-6">
                            {types.map(t => <TypeBadge key={t} type={t} size="md" />)}
                        </div>

                        <div className={`
                                flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold uppercase tracking-wide transition-all shadow-lg mx-auto w-fit cursor-default
                                ${owned
                                    ? 'bg-green-500 text-white ring-4 ring-green-500/20'
                                    : seen
                                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }
                            `}
                        >
                            {owned ? <><Check size={18} /> CAUGHT</> : seen ? <><Eye size={18} /> SEEN</> : <><Ban size={18} /> UNKNOWN</>}
                        </div>

                        {onToggleStatus && (
                            <button onClick={onToggleStatus} className="mt-4 text-xs font-bold text-blue-500 hover:text-blue-600 underline">
                                Toggle Status
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Data */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col relative overflow-y-auto">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden md:block">
                        <X size={24} />
                    </button>

                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-6xl font-black text-gray-200 dark:text-gray-800 font-mono select-none">
                            #{id.toString().padStart(3, '0')}
                        </span>
                    </div>

                    <div className="space-y-8">
                        {/* Flavor Text */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                            <div className="absolute -top-3 -left-3 bg-blue-500 text-white p-2 rounded-xl shadow-lg">
                                <AlignLeft size={20} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg italic leading-relaxed pt-2">
                                &ldquo;{flavorText}&rdquo;
                            </p>
                        </div>

                        {/* Location */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                            <div className="absolute -top-3 -left-3 bg-red-500 text-white p-2 rounded-xl shadow-lg">
                                <MapPin size={20} />
                            </div>
                            <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2 pt-2 ml-1">
                                Acquisition Method ({version})
                            </h4>
                            <p className="text-gray-800 dark:text-white font-medium text-lg">
                                {locationText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
