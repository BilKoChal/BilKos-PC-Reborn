import React, { useState } from 'react';
import { ParsedSave, GameOptions, isGen2Extension, isGen2SaveExtension, Gen2Extension } from '../../../lib/parser/types';
import { EventFlagsManager } from '../EventFlagsManager';
import { Settings, Clock, Flag, MapPin, Baby, CreditCard, Gift, Sparkles, Swords, PiggyBank, Eye, Flame, Zap, Snowflake, Phone } from 'lucide-react';
import { getPokemonSpriteUrl } from '../../../lib/sprites';

// ─── Unown Form Sprite Helper ─────────────────────────────────────────────────

/** Small component that renders an Unown form sprite image, falling back to the letter text if the image fails to load. */
const UnownFormSprite: React.FC<{ letter: string; isCaught: boolean }> = ({ letter, isCaught }) => {
    const [imgError, setImgError] = useState(false);
    // Use the shared sprite helper so form 'A' correctly resolves to the default
    // 201.png (PokeAPI has no "201-a"); 'master' mode yields the form sprite URL.
    const spriteUrl = getPokemonSpriteUrl(201, 'master', undefined, false, letter.toLowerCase());

    if (!isCaught || imgError) {
        // Not caught or image failed — show the letter text
        return (
            <span className={`text-xs font-bold ${
                isCaught
                    ? 'text-violet-700 dark:text-violet-200'
                    : 'text-gray-400 dark:text-gray-600'
            }`}>
                {letter}
            </span>
        );
    }

    return (
        <img
            src={spriteUrl}
            alt={`Unown ${letter}`}
            className="w-7 h-7 object-contain pixelated"
            onError={() => setImgError(true)}
            title={`Unown ${letter} — caught`}
        />
    );
};

interface EventsTabProps {
    data: ParsedSave;
    handleEventFlagsUpdate: (newFlags: boolean[]) => void;
    handleOptionsUpdate?: (updates: Partial<GameOptions>) => void;
    /** Update arbitrary save-extension fields (e.g. mom savings) — TODO 3.9. */
    handleSaveExtUpdate?: (updates: Record<string, unknown>) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
    data,
    handleEventFlagsUpdate,
    handleOptionsUpdate,
    handleSaveExtUpdate
}) => {
    // D1/D2: Use isGen2SaveExtension type guard instead of manual `as Gen2SaveExtension` cast
    // + `.generation === 2` check. Follows PKHeX's `sav is SAV2` pattern.
    const gen2Ext = isGen2SaveExtension(data.genExtension) ? data.genExtension : null;
    const isCrystal = gen2Ext?.gameVersion === 'Crystal';

    return (
        <div className="w-full space-y-6">
            {/* Game Options Section */}
            {data.options && handleOptionsUpdate && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <Settings size={20} />
                        <div>
                            <h2 className="font-black text-lg uppercase tracking-widest leading-none">Game Options</h2>
                            <p className="text-xs text-white/80 font-medium">Text Speed, Battle Style, Sound</p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Text Speed */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Text Speed</label>
                                <select
                                    value={data.options.textSpeed}
                                    onChange={(e) => handleOptionsUpdate({ textSpeed: e.target.value as GameOptions['textSpeed'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="Instant">Instant</option>
                                    <option value="Fast">Fast</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Slow">Slow</option>
                                </select>
                            </div>

                            {/* Battle Style */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Battle Style</label>
                                <select
                                    value={data.options.battleStyle}
                                    onChange={(e) => handleOptionsUpdate({ battleStyle: e.target.value as GameOptions['battleStyle'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="Shift">Shift</option>
                                    <option value="Set">Set</option>
                                </select>
                            </div>

                            {/* Battle Animation */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Battle Animation</label>
                                <select
                                    value={data.options.battleAnimation}
                                    onChange={(e) => handleOptionsUpdate({ battleAnimation: e.target.value as GameOptions['battleAnimation'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="On">On</option>
                                    <option value="Off">Off</option>
                                </select>
                            </div>

                            {/* Sound */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Sound</label>
                                <select
                                    value={data.options.sound}
                                    onChange={(e) => handleOptionsUpdate({ sound: e.target.value as GameOptions['sound'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                                >
                                    <option value="Mono">Mono</option>
                                    <option value="Stereo">Stereo</option>
                                    <option value="Earphone1">Earphone 1</option>
                                    <option value="Earphone2">Earphone 2</option>
                                    <option value="Earphone3">Earphone 3</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                Gen 2 Save-Level Features
                These sections display parsed Gen 2 data that was previously
                invisible because the extension system registered them on the
                pokemon-info panel where they could never render (they need
                save-level context, not individual Pokemon context).
            ══════════════════════════════════════════════════════════════════ */}
            {gen2Ext && (
                <>
                    {/* ── Real-Time Clock ── */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                            <Clock size={20} />
                            <div>
                                <h2 className="font-black text-lg uppercase tracking-widest leading-none">Real-Time Clock</h2>
                                <p className="text-xs text-white/80 font-medium">Gen 2 RTC & Time-of-Day System</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Play Time */}
                                <div className="bg-cyan-50 dark:bg-cyan-900/10 rounded-xl p-3 border border-cyan-100 dark:border-cyan-800/30">
                                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Play Time</div>
                                    <div className="text-lg font-black text-cyan-700 dark:text-cyan-300">{data.trainer.playTime || 'Unknown'}</div>
                                </div>
                                {/* RTC Flags */}
                                <div className="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-3 border border-teal-100 dark:border-teal-800/30">
                                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">RTC Flags</div>
                                    <div className="text-sm font-bold text-teal-700 dark:text-teal-300">
                                        0x{gen2Ext.rtcFlags.toString(16).toUpperCase().padStart(2, '0')} ({gen2Ext.rtcFlags})
                                    </div>
                                    <div className="text-[10px] text-teal-500 dark:text-teal-400 mt-0.5">
                                        {gen2Ext.rtcFlags === 0 ? 'Clock running normally' : `Daylight savings: bit ${gen2Ext.rtcFlags & 1 ? 'set' : 'clear'}`}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                Generation 2 introduced the Real-Time Clock (RTC) which tracks time of day for day/night cycles,
                                berry growth, timed encounters, and the Bug-Catching Contest schedule. The RTC hardware latches
                                time values into SRAM when the game is saved.
                            </div>
                        </div>
                    </div>

                    {/* ── Map Position ── */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            <MapPin size={20} />
                            <div>
                                <h2 className="font-black text-lg uppercase tracking-widest leading-none">Map Position</h2>
                                <p className="text-xs text-white/80 font-medium">Player Location on the Overworld</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30 text-center">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Map ID</div>
                                    <div className="text-base font-black text-blue-700 dark:text-blue-300">
                                        {gen2Ext?.currentMapId ?? 0}
                                    </div>
                                    <div className="text-[9px] text-blue-500 font-mono">0x{((gen2Ext?.currentMapId ?? 0)).toString(16).toUpperCase()}</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30 text-center">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">X</div>
                                    <div className="text-base font-black text-blue-700 dark:text-blue-300">{gen2Ext?.mapX ?? 0}</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30 text-center">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Y</div>
                                    <div className="text-base font-black text-blue-700 dark:text-blue-300">{gen2Ext?.mapY ?? 0}</div>
                                </div>
                            </div>
                            <div className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                The player's position on the overworld map. Map ID encodes the map group and map number as a 16-bit value.
                                X/Y are tile coordinates within that map. Use caution when editing these values — invalid positions may trap the player.
                            </div>
                        </div>
                    </div>

                    {/* ── Daycare ── */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <Baby size={20} />
                            <div>
                                <h2 className="font-black text-lg uppercase tracking-widest leading-none">Day-Care</h2>
                                <p className="text-xs text-white/80 font-medium">Route 34 Breeding Center</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                            {!gen2Ext.daycareParent1 && !gen2Ext.daycareParent2 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    <Baby size={28} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No Pokemon deposited at the Day-Care.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {gen2Ext.daycareParent1 && (
                                        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                                            <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Parent 1</div>
                                            <div className="text-sm font-bold text-green-700 dark:text-green-300">
                                                {gen2Ext.daycareParent1.speciesName} <span className="font-normal text-green-500">Lv.{gen2Ext.daycareParent1.level}</span>
                                            </div>
                                            {gen2Ext.daycareParent1.gender && gen2Ext.daycareParent1.gender !== 'Genderless' && (
                                                <div className="text-[10px] text-green-500">{gen2Ext.daycareParent1.gender === 'Female' ? '♀' : '♂'} {gen2Ext.daycareParent1.gender}</div>
                                            )}
                                        </div>
                                    )}
                                    {gen2Ext.daycareParent2 && (
                                        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                                            <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Parent 2</div>
                                            <div className="text-sm font-bold text-green-700 dark:text-green-300">
                                                {gen2Ext.daycareParent2.speciesName} <span className="font-normal text-green-500">Lv.{gen2Ext.daycareParent2.level}</span>
                                            </div>
                                            {gen2Ext.daycareParent2.gender && gen2Ext.daycareParent2.gender !== 'Genderless' && (
                                                <div className="text-[10px] text-green-500">{gen2Ext.daycareParent2.gender === 'Female' ? '♀' : '♂'} {gen2Ext.daycareParent2.gender}</div>
                                            )}
                                        </div>
                                    )}
                                    {gen2Ext.daycareBreedingStatus > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-2 border border-amber-100 dark:border-amber-800/30">
                                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                                                Egg pending! Steps remaining: {gen2Ext.daycareStepsUntilEgg}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Mom Savings ── */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                            <PiggyBank size={20} />
                            <div>
                                <h2 className="font-black text-lg uppercase tracking-widest leading-none">Mom Savings</h2>
                                <p className="text-xs text-white/80 font-medium">Money Saved by Mom</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3 border border-yellow-100 dark:border-yellow-800/30">
                                <label className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1 block">Savings Balance</label>
                                {handleSaveExtUpdate ? (
                                    <input
                                        type="number"
                                        min={0}
                                        max={999999}
                                        value={gen2Ext.momSavings}
                                        onChange={(e) => {
                                            const v = Math.min(Math.max(Math.floor(Number(e.target.value) || 0), 0), 999999);
                                            handleSaveExtUpdate({ momSavings: v });
                                        }}
                                        className="w-full text-lg font-black text-yellow-700 dark:text-yellow-300 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-yellow-200 dark:border-yellow-800/50 outline-none focus:border-yellow-500"
                                    />
                                ) : (
                                    <div className="text-lg font-black text-yellow-700 dark:text-yellow-300">
                                        {gen2Ext.momSavings.toLocaleString()}
                                    </div>
                                )}
                                <div className="text-[10px] text-yellow-500 mt-1">
                                    Mom can save a percentage of battle earnings. Stored in BCD (max 999,999).
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Unown Dex ── */}
                    {gen2Ext.unownCaughtForms.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                                <Eye size={20} />
                                <div>
                                    <h2 className="font-black text-lg uppercase tracking-widest leading-none">Unown Dex</h2>
                                    <p className="text-xs text-white/80 font-medium">Caught Unown Letter Forms</p>
                                </div>
                                <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {gen2Ext.unownCaughtForms.filter(v => v > 0).length}/26
                                </span>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, idx) => {
                                        const isCaught = gen2Ext.unownCaughtForms[idx] !== undefined && gen2Ext.unownCaughtForms[idx] > 0;
                                        return (
                                            <span
                                                key={letter}
                                                className={`text-xs w-9 h-9 flex items-center justify-center rounded font-bold transition-all ${
                                                    isCaught
                                                        ? 'bg-violet-200 dark:bg-violet-700 shadow-sm'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                                                }`}
                                                title={isCaught ? `Unown ${letter} — caught` : `Unown ${letter} — not caught`}
                                            >
                                                <UnownFormSprite
                                                    letter={letter}
                                                    isCaught={isCaught}
                                                />
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Phone Contacts ── */}
                    {/* Phone contacts parsing is temporarily hidden because the current
                        implementation decodes raw bytes as names, which produces incorrect
                        data. In Gen 2, phone contacts are stored as contact IDs that map
                        to internal game tables — proper display requires a name lookup table
                        for all 39 possible trainer contacts per version. */}

                    {/* ═══════════════════════════════════════════════════════════
                        Crystal-Specific Sections
                    ═══════════════════════════════════════════════════════════ */}
                    {isCrystal && (
                        <div className="space-y-6">
                            {/* Section header */}
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300 dark:via-cyan-700 to-transparent"></div>
                                <span className="text-[10px] font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-[0.2em]">Crystal Exclusive</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300 dark:via-cyan-700 to-transparent"></div>
                            </div>

                            {/* Blue Card */}
                            {gen2Ext.blueCardPoints >= 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                                        <CreditCard size={20} />
                                        <div>
                                            <h2 className="font-black text-lg uppercase tracking-widest leading-none">Blue Card</h2>
                                            <p className="text-xs text-white/80 font-medium">Battle Tower Points</p>
                                        </div>
                                        <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">CRYSTAL</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
                                            <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 block">Points</label>
                                            {handleSaveExtUpdate ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={9999}
                                                    value={gen2Ext.blueCardPoints}
                                                    onChange={(e) => handleSaveExtUpdate({ blueCardPoints: Math.min(Math.max(Math.floor(Number(e.target.value) || 0), 0), 9999) })}
                                                    className="w-full text-lg font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-indigo-200 dark:border-indigo-800/50 outline-none focus:border-indigo-500"
                                                />
                                            ) : (
                                                <div className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                                                    {gen2Ext.blueCardPoints} Point{gen2Ext.blueCardPoints !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-indigo-500 mt-1">
                                                The Blue Card tracks Battle Tower wins. Points can be exchanged for prizes.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mystery Gift */}
                            {gen2Ext.mysteryGiftUnlocked >= 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                                        <Gift size={20} />
                                        <div>
                                            <h2 className="font-black text-lg uppercase tracking-widest leading-none">Mystery Gift</h2>
                                            <p className="text-xs text-white/80 font-medium">Infrared Communication Feature</p>
                                        </div>
                                        <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">CRYSTAL</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-xl p-3 border border-rose-100 dark:border-rose-800/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Status</div>
                                                {handleSaveExtUpdate ? (
                                                    <button
                                                        onClick={() => handleSaveExtUpdate({ mysteryGiftUnlocked: gen2Ext.mysteryGiftUnlocked !== 0 ? 0 : 1 })}
                                                        className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                                                            gen2Ext.mysteryGiftUnlocked !== 0
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {gen2Ext.mysteryGiftUnlocked !== 0 ? 'Unlocked' : 'Locked'} ⇄
                                                    </button>
                                                ) : (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        gen2Ext.mysteryGiftUnlocked !== 0
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        {gen2Ext.mysteryGiftUnlocked !== 0 ? 'Unlocked' : 'Locked'}
                                                    </span>
                                                )}
                                            </div>
                                            {gen2Ext.mysteryGiftUnlocked !== 0 && gen2Ext.mysteryGiftItem > 0 && (
                                                <div className="text-[11px] text-rose-600 dark:text-rose-400">
                                                    Last Item ID: {gen2Ext.mysteryGiftItem}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-rose-500 mt-1">
                                                Mystery Gift allows receiving items via infrared communication with other Crystal players.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GS Ball Event */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                                    <Sparkles size={20} />
                                    <div>
                                        <h2 className="font-black text-lg uppercase tracking-widest leading-none">GS Ball Event</h2>
                                        <p className="text-xs text-white/80 font-medium">Ilex Forest Celebi Encounter</p>
                                    </div>
                                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">CRYSTAL</span>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                    <div className={`rounded-xl p-3 border ${
                                        gen2Ext.gsBallEventEnabled
                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                                            : 'bg-gray-50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800/30'
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Event Status</div>
                                            {handleSaveExtUpdate ? (
                                                <button
                                                    onClick={() => handleSaveExtUpdate({ gsBallEventEnabled: !gen2Ext.gsBallEventEnabled })}
                                                    className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                                                        gen2Ext.gsBallEventEnabled
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {gen2Ext.gsBallEventEnabled ? 'Active' : 'Inactive'} ⇄
                                                </button>
                                            ) : (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    gen2Ext.gsBallEventEnabled
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {gen2Ext.gsBallEventEnabled ? 'Active' : 'Inactive'}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-[11px] font-semibold ${
                                            gen2Ext.gsBallEventEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                                        }`}>
                                            {gen2Ext.gsBallEventEnabled
                                                ? 'The GS Ball is available! Celebi encounter in Ilex Forest is possible.'
                                                : 'The GS Ball event is not active. Enable the event flag to access the Celebi encounter.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Move Tutors */}
                            {gen2Ext.moveTutorFlags.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                                        <Swords size={20} />
                                        <div>
                                            <h2 className="font-black text-lg uppercase tracking-widest leading-none">Move Tutors</h2>
                                            <p className="text-xs text-white/80 font-medium">One-Time Move Teaching</p>
                                        </div>
                                        <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">CRYSTAL</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {gen2Ext.moveTutorFlags.map((used, idx) => {
                                                const names = ['Flamethrower', 'Thunderbolt', 'Ice Beam'];
                                                const icons = [
                                                    <Flame key="f" size={16} className="text-orange-500" />,
                                                    <Zap key="z" size={16} className="text-yellow-500" />,
                                                    <Snowflake key="s" size={16} className="text-cyan-500" />,
                                                ];
                                                return (
                                                    <div key={idx} className={`rounded-xl p-3 border ${
                                                        used
                                                            ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30'
                                                            : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30'
                                                    }`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {icons[idx]}
                                                            <span className={`text-xs font-bold ${
                                                                used ? 'text-red-500 line-through' : 'text-green-600 dark:text-green-400'
                                                            }`}>
                                                                {names[idx] || `Tutor ${idx + 1}`}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[10px] font-semibold ${
                                                            used ? 'text-red-400' : 'text-green-500'
                                                        }`}>
                                                            {used ? 'Used' : 'Available'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-3 text-[10px] text-gray-400 dark:text-gray-500">
                                            Each Move Tutor can only teach their move once. Use these carefully — once taught, the tutor cannot be used again.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Event Flags Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                    <Flag size={20} />
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-widest leading-none">Event Flags</h2>
                        <p className="text-xs text-white/80 font-medium">Story Progress & Event Triggers</p>
                    </div>
                </div>
                <EventFlagsManager data={data} onUpdate={handleEventFlagsUpdate} />
            </div>
        </div>
    );
};
