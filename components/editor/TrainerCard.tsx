
import React, { useMemo, useState } from 'react';
import { ParsedSave, TrainerInfo, GameOptions } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { useSaveContextSafe } from '../../context/SaveContext';
import { useSpriteMode } from '../../context/SpriteContext';
import { getTrainerSpriteUrl, TRAINER_SPRITE_FALLBACK, getBadgeSpriteUrl } from '../../lib/sprites';
import { Clock, Book, User, Heart, Coins, Trophy, Save, X, Swords } from 'lucide-react';
import { REGION_BADGES } from '../../lib/data/gameData';


interface TrainerCardProps {
    data: ParsedSave;
    onUpdate?: (updates: Partial<TrainerInfo>, optionUpdates?: Partial<GameOptions>) => void;
    onOptionsUpdate?: (updates: Partial<GameOptions>) => void;
}

// Gen 1 Constants
const MAX_MONEY = 999999;
const MAX_COINS = 9999;
const MAX_HOURS = 255;
const MAX_MINUTES = 59;
const MAX_FRIENDSHIP = 255;

const parsePlayTime = (timeStr: string) => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 };
    
    if (timeStr.includes(':')) {
        // GSC style: HH:MM:SS or HH:MM
        const parts = timeStr.split(':');
        hours = parseInt(parts[0]!, 10) || 0;
        minutes = parseInt(parts[1]!, 10) || 0;
        seconds = parseInt(parts[2]!, 10) || 0;
    } else {
        // Gen 1 style: "12h 34m"
        const hoursMatch = timeStr.match(/(\d+)\s*h/i);
        const minutesMatch = timeStr.match(/(\d+)\s*m/i);
        const secondsMatch = timeStr.match(/(\d+)\s*s/i);
        
        if (hoursMatch) hours = parseInt(hoursMatch[1]!, 10) || 0;
        if (minutesMatch) minutes = parseInt(minutesMatch[1]!, 10) || 0;
        if (secondsMatch) seconds = parseInt(secondsMatch[1]!, 10) || 0;
    }
    return { hours, minutes, seconds };
};

export const TrainerCard: React.FC<TrainerCardProps> = ({ data, onUpdate, onOptionsUpdate }) => {
    const { getGameTheme } = useTheme();
    const gameTheme = getGameTheme();
    const t = data.trainer;
    const version = data.gameVersion || 'Yellow';
    const [isEditing, setIsEditing] = useState(false);
    const [badgeTab, setBadgeTab] = useState<'johto' | 'kanto'>('johto');

    const ctx = useSaveContextSafe();
    const adapter = ctx?.adapter;
    const { mode: spriteMode } = useSpriteMode();

    const isJP = useMemo(() => (adapter?.detectRegion(data) === 'japanese'), [adapter, data]);
    // Phase 1.9: removed `const currentGen = data.generation || 1` — replaced by
    // adapter-driven values with Gen 1 fallbacks (see line 111).
    const parsedTime = useMemo(() => parsePlayTime(t.playTime), [t.playTime]);

    const defaultOptions: GameOptions = {
        textSpeed: 'Normal',
        battleAnimation: 'On',
        battleStyle: 'Shift',
        sound: 'Mono'
    };
    const options = data.options || defaultOptions;
    
    // Local state for editing
    const [editForm, setEditForm] = useState({
        name: t.name,
        rivalName: t.rivalName || 'BLUE',
        id: t.id,
        money: t.money,
        coins: t.coins,
        pikachuFriendship: t.pikachuFriendship || 0,
        pikachuSurfScore: t.pikachuSurfScore || 0,
        badges: t.badges,
        hours: parsedTime.hours,
        minutes: parsedTime.minutes,
        seconds: parsedTime.seconds,
        gender: t.gender || 'Male'
    });

    const [editOptions, setEditOptions] = useState<GameOptions>({ ...options });

    React.useEffect(() => {
        setEditForm({
            name: t.name,
            rivalName: t.rivalName || 'BLUE',
            id: t.id,
            money: t.money,
            coins: t.coins,
            pikachuFriendship: t.pikachuFriendship || 0,
            pikachuSurfScore: t.pikachuSurfScore || 0,
            badges: t.badges,
            hours: parsedTime.hours,
            minutes: parsedTime.minutes,
            seconds: parsedTime.seconds,
            gender: t.gender || 'Male'
        });
        setEditOptions({ ...(data.options || defaultOptions) });
    }, [t, parsedTime, data.options]);

    // Phase 1.9: adapter-driven values with Gen 1 fallbacks (no `currentGen >= 2`).
    const maxDex = adapter?.nationalDexMax ?? 151;
    const displayBadges = REGION_BADGES[data.generation] ?? REGION_BADGES[1]!;
    const showGender = adapter?.hasGender ?? false;
    const showMultiRegionBadges = adapter?.hasMultiRegionBadges ?? false;
    const timeFormat = adapter?.playTimeFormat ?? 'text';

    const trainerSpriteUrl = useMemo(() => {
        const gender = isEditing ? editForm.gender : (t.gender || 'Male');
        return getTrainerSpriteUrl(gender, spriteMode, data.gameVersion);
    }, [spriteMode, isEditing, editForm.gender, t.gender, data.gameVersion]);

    // Phase 1.9: pass hasMultiRegionBadges (from adapter metadata) instead of
    // raw generation number. Gen 2 has Johto+Kanto badges; Gen 1 has Kanto only.
    const hasMultiRegionBadges = ctx?.adapter?.hasMultiRegionBadges ?? false;
    const getBadgeSpriteUrlLocal = (index: number): string => {
        return getBadgeSpriteUrl(hasMultiRegionBadges, index);
    };

    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val || 0, min), max);

    const handleBadgeToggle = (index: number) => {
        if (!isEditing) return;
        
        const currentBadges = editForm.badges;
        const bitMask = 1 << index;
        
        // Toggle bit
        const newBadges = (currentBadges & bitMask) 
            ? currentBadges & ~bitMask // Turn off
            : currentBadges | bitMask; // Turn on
            
        setEditForm({ ...editForm, badges: newBadges });
    };

    const handleSave = () => {
        let formattedTime = "";
        if (timeFormat === 'clock') {
            formattedTime = `${editForm.hours.toString().padStart(2, '0')}:${editForm.minutes.toString().padStart(2, '0')}:${editForm.seconds.toString().padStart(2, '0')}`;
        } else {
            formattedTime = `${editForm.hours}h ${editForm.minutes.toString().padStart(2, '0')}m ${editForm.seconds.toString().padStart(2, '0')}s`;
        }

        const updates: Partial<TrainerInfo> = {
            name: editForm.name,
            rivalName: editForm.rivalName,
            id: editForm.id,
            money: editForm.money,
            coins: editForm.coins,
            pikachuFriendship: editForm.pikachuFriendship,
            pikachuSurfScore: editForm.pikachuSurfScore,
            badges: editForm.badges,
            playTime: formattedTime,
            gender: editForm.gender as 'Male' | 'Female'
        };

        if (onUpdate) {
            onUpdate(updates, editOptions);
        } else if (onOptionsUpdate) {
            onOptionsUpdate(editOptions);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        const timeObj = parsePlayTime(t.playTime);
        setEditForm({
            name: t.name,
            rivalName: t.rivalName || 'BLUE',
            id: t.id,
            money: t.money,
            coins: t.coins,
            pikachuFriendship: t.pikachuFriendship || 0,
            pikachuSurfScore: t.pikachuSurfScore || 0,
            badges: t.badges,
            hours: timeObj.hours,
            minutes: timeObj.minutes,
            seconds: timeObj.seconds,
            gender: t.gender || 'Male'
        });
        setEditOptions({ ...(data.options || defaultOptions) });
        setIsEditing(false);
    };

    return (
        <div className="bg-[#FEFCE8] dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border-4 border-gray-100 dark:border-gray-800 overflow-hidden relative flex flex-col transition-all duration-300">
            
            {/* Header Area */}
            <div 
                className="h-32 relative p-5 flex flex-col items-start justify-start overflow-hidden transition-colors duration-300 bg-theme-primary text-theme-text-on-primary"
            >
                {/* Pokeball Dot Pattern */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" 
                     style={{ 
                        backgroundImage: `radial-gradient(circle at 10px 10px, currentColor 2px, transparent 0)`,
                        backgroundSize: '20px 20px'
                     }}>
                </div>
                
                {/* Header Top Row: Name and ID */}
                <div className="w-full flex justify-between items-start relative z-10">
                    {isEditing ? (
                        <input 
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: (adapter?.codec.sanitize(e.target.value) ?? e.target.value).substring(0, adapter?.codec.otNameMaxLength() ?? (isJP ? 5 : 7))})}
                            maxLength={isJP ? 5 : 7}
                            className="bg-black/15 text-theme-text-on-primary text-4xl font-black italic tracking-tighter rounded-lg border-2 border-theme-text-on-primary/35 focus:border-theme-text-on-primary px-3 py-0.5 w-48 outline-none focus:ring-2 focus:ring-theme-text-on-primary/20 placeholder-theme-text-on-primary/40 block"
                            placeholder="NAME"
                        />
                    ) : (
                        <h2 className="text-4xl font-black italic tracking-tighter drop-shadow-sm">
                            {t.name}
                        </h2>
                    )}
                    
                    <div className="text-right">
                        <span className="text-[10px] font-black opacity-75 uppercase tracking-widest block">Trainer ID</span>
                        {isEditing ? (
                            <input 
                                type="text"
                                value={editForm.id}
                                onChange={(e) => setEditForm({...editForm, id: e.target.value.substring(0, 5)})}
                                maxLength={5}
                                className="bg-black/15 text-theme-text-on-primary text-xl font-black tracking-widest leading-none rounded-lg border-2 border-theme-text-on-primary/35 focus:border-theme-text-on-primary px-2 py-0.5 w-24 text-right outline-none focus:ring-2 focus:ring-theme-text-on-primary/20 block"
                            />
                        ) : (
                            <div className="text-xl font-black tracking-widest leading-none">{t.id}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar Frame */}
            <div className="absolute top-16 left-8 z-20">
                <div className="w-28 h-28 rounded-2xl bg-white dark:bg-gray-800 border-[6px] border-white dark:border-gray-700 shadow-[0_8px_20px_rgba(0,0,0,0.2)] overflow-hidden flex items-center justify-center relative transform -rotate-3">
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 opacity-50"></div>
                    <img 
                        src={trainerSpriteUrl} 
                        alt="Trainer" 
                        className="w-full h-full object-contain p-2 pixelated scale-125 relative z-10" 
                        draggable={false}
                        onError={(e) => { (e.target as HTMLImageElement).src = TRAINER_SPRITE_FALLBACK }}
                    />
                </div>
            </div>

            {/* Main Content Body */}
            <div className="px-5 pt-14 pb-6 space-y-3 flex-grow">
                
                {/* Mini Stats Grid (Time & Edit Buttons) */}
                <div className="flex justify-end gap-2 mb-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 uppercase border border-gray-100 dark:border-gray-700">
                        <Clock size={12} /> 
                        {isEditing ? (
                             <div className="flex items-center gap-1">
                                 <input 
                                    type="number" 
                                    value={editForm.hours}
                                    onChange={(e) => setEditForm({...editForm, hours: clamp(parseInt(e.target.value), 0, MAX_HOURS)})}
                                    className="w-12 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded text-center outline-none text-gray-900 dark:text-gray-100 font-bold px-1"
                                 />
                                 <span>h</span>
                                 <input 
                                    type="number" 
                                    value={editForm.minutes}
                                    onChange={(e) => setEditForm({...editForm, minutes: clamp(parseInt(e.target.value), 0, MAX_MINUTES)})}
                                    className="w-10 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded text-center outline-none text-gray-900 dark:text-gray-100 font-bold px-1"
                                 />
                                 <span>m</span>
                                 <input 
                                    type="number" 
                                    value={editForm.seconds}
                                    onChange={(e) => setEditForm({...editForm, seconds: clamp(parseInt(e.target.value), 0, 59)})}
                                    className="w-10 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded text-center outline-none text-gray-900 dark:text-gray-100 font-bold px-1 ml-1"
                                 />
                                 <span>s</span>
                             </div>
                        ) : (
                            t.playTime
                        )}
                    </div>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1 bg-green-500 rounded-lg text-xs font-black text-white uppercase hover:bg-green-600 transition-colors shadow-md">
                                <Save size={12} /> SAVE
                            </button>
                            <button onClick={handleCancel} className="flex items-center gap-1.5 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-black text-gray-500 uppercase hover:bg-gray-300 transition-colors">
                                <X size={12} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-black text-blue-600 uppercase hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-900/30">
                            <User size={12} /> EDIT CARD
                        </button>
                    )}
                </div>

                {/* Primary Stats Blocks */}
                <div className="space-y-2">
                    {/* Rival Name */}
                    <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors hover:border-red-300 dark:hover:border-red-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white shadow-inner">
                                <Swords size={16} />
                            </div>
                            <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Rival</span>
                        </div>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={editForm.rivalName}
                                onChange={(e) => setEditForm({...editForm, rivalName: (adapter?.codec.sanitize(e.target.value) ?? e.target.value).substring(0, adapter?.codec.otNameMaxLength() ?? (isJP ? 5 : 7))})}
                                maxLength={isJP ? 5 : 7}
                                className="text-xl font-black text-gray-900 dark:text-white tracking-tight text-right w-32 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded-lg outline-none px-2.5 py-0.5 focus:ring-2 focus:ring-theme-primary/30"
                            />
                        ) : (
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                {t.rivalName || 'BLUE'}
                            </span>
                        )}
                    </div>

                    {/* Money Block */}
                    <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors hover:border-blue-300 dark:hover:border-blue-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-inner">
                                <span className="font-black text-sm italic">₽</span>
                            </div>
                            <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Money</span>
                        </div>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={editForm.money}
                                onChange={(e) => setEditForm({...editForm, money: clamp(parseInt(e.target.value), 0, MAX_MONEY)})}
                                className="text-xl font-black text-gray-900 dark:text-white tracking-tight text-right w-32 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded-lg outline-none px-2.5 py-0.5 focus:ring-2 focus:ring-theme-primary/30"
                            />
                        ) : (
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                {t.money.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Casino Coins */}
                    <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-inner">
                                <Coins size={16} />
                            </div>
                            <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Casino Coins</span>
                        </div>
                        {isEditing ? (
                             <input 
                                type="number" 
                                value={editForm.coins}
                                onChange={(e) => setEditForm({...editForm, coins: clamp(parseInt(e.target.value), 0, MAX_COINS)})}
                                className="text-xl font-black text-gray-900 dark:text-white tracking-tight text-right w-24 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded-lg outline-none px-2.5 py-0.5 focus:ring-2 focus:ring-theme-primary/30"
                            />
                        ) : (
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t.coins}</span>
                        )}
                    </div>

                    {/* Player Gender (Adapter-driven) */}
                    {showGender && (
                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors hover:border-pink-300 dark:hover:border-pink-700">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-inner ${
                                    (isEditing ? editForm.gender === 'Female' : t.gender === 'Female') ? 'bg-pink-500' : 'bg-blue-500'
                                }`}>
                                    <User size={16} />
                                </div>
                                <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Gender</span>
                            </div>
                            {isEditing ? (
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg border border-gray-200 dark:border-gray-800">
                                    <button 
                                        type="button"
                                        onClick={() => setEditForm({...editForm, gender: 'Male'})}
                                        className={`px-3 py-1 text-xs font-black uppercase rounded ${
                                            editForm.gender === 'Male' 
                                                ? 'bg-blue-500 text-white shadow' 
                                                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        Male
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setEditForm({...editForm, gender: 'Female'})}
                                        className={`px-3 py-1 text-xs font-black uppercase rounded ${
                                            editForm.gender === 'Female' 
                                                ? 'bg-pink-500 text-white shadow' 
                                                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        Female
                                    </button>
                                </div>
                            ) : (
                                <span className={`text-xl font-black tracking-tight uppercase ${
                                    t.gender === 'Female' ? 'text-pink-500' : 'text-blue-500'
                                }`}>
                                    {t.gender || 'Male'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Pikachu Love (Yellow Specific) */}
                    {version.includes('Yellow') && (
                        <div className="bg-[#FFFBEB] dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-inner">
                                    <Heart size={16} fill="currentColor" />
                                </div>
                                <span className="font-black text-yellow-600 uppercase tracking-widest text-xs">Pikachu Love</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={editForm.pikachuFriendship}
                                        onChange={(e) => setEditForm({...editForm, pikachuFriendship: clamp(parseInt(e.target.value), 0, MAX_FRIENDSHIP)})}
                                        className="text-xl font-black text-yellow-700 dark:text-yellow-500 text-right w-16 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded outline-none px-1"
                                    />
                                ) : (
                                    <span className="text-xl font-black text-yellow-700 dark:text-yellow-500">{t.pikachuFriendship || 0}</span>
                                )}
                                <span className="text-[10px] font-bold text-yellow-600/40">/255</span>
                            </div>
                        </div>
                    )}

                    {/* Pikachu Surf Record (Yellow Specific) */}
                    {version.includes('Yellow') && (
                        <div className="bg-[#EFF6FF] dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-inner">
                                    <Swords size={16} />
                                </div>
                                <span className="font-black text-blue-600 uppercase tracking-widest text-xs">Surfing Record</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={editForm.pikachuSurfScore}
                                        onChange={(e) => setEditForm({...editForm, pikachuSurfScore: clamp(parseInt(e.target.value), 0, 9999)})}
                                        className="text-xl font-black text-blue-700 dark:text-blue-500 text-right w-20 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded outline-none px-1"
                                    />
                                ) : (
                                    <span className="text-xl font-black text-blue-700 dark:text-blue-500">{t.pikachuSurfScore || 0}</span>
                                )}
                                <span className="text-[10px] font-bold text-blue-600/40">pts</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pokédex Progress */}
                <div className="bg-white/40 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Book size={14} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pokédex Progress</span>
                    </div>
                    
                    {/* Owned Progress */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                            <span className="text-gray-400">Owned</span>
                            <span className="text-gray-900 dark:text-white">{data.pokedexOwned} / {maxDex}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div 
                                className="h-full bg-red-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                                style={{ width: `${Math.min(100, (data.pokedexOwned / maxDex) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Seen Progress */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                            <span className="text-gray-400">Seen</span>
                            <span className="text-gray-900 dark:text-white">{data.pokedexSeen} / {maxDex}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                                style={{ width: `${Math.min(100, (data.pokedexSeen / maxDex) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Game Options have been moved to the "Events & Extras" tab in Phase 2.5 */}

                {/* Badges Section — adapter-driven multi-region */}
                {showMultiRegionBadges ? (
                    <div className="space-y-4 pt-2">
                        {/* Tab Switcher */}
                        <div className="flex bg-gray-150 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setBadgeTab('johto')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    badgeTab === 'johto'
                                        ? 'bg-theme-primary text-theme-text-on-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300'
                                }`}
                            >
                                <Trophy size={11} /> Johto
                            </button>
                            <button
                                type="button"
                                onClick={() => setBadgeTab('kanto')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    badgeTab === 'kanto'
                                        ? 'bg-theme-primary text-theme-text-on-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300'
                                }`}
                            >
                                <Trophy size={11} /> Kanto
                            </button>
                        </div>

                        {badgeTab === 'johto' ? (
                            <div>
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <div className="flex items-center gap-1.5">
                                        <Trophy size={12} className="text-[#EF4444]" />
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Johto Badges</h4>
                                    </div>
                                    {isEditing && <span className="text-[10px] text-gray-400 font-bold animate-pulse">Tap to toggle</span>}
                                </div>
                                <div className={`
                                    bg-white/50 dark:bg-gray-800/80 p-3 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-3 shadow-inner
                                    ${isEditing ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                `}>
                                    {displayBadges.slice(0, 8).map((badge, i) => {
                                        const badgesSource = isEditing ? editForm.badges : t.badges;
                                        const hasBadge = (badgesSource & (1 << i)) !== 0;
                                        return (
                                            <div key={i} className="flex justify-center">
                                                <div 
                                                    onClick={() => handleBadgeToggle(i)}
                                                    className={`
                                                        w-10 h-10 flex items-center justify-center transition-all duration-300
                                                        ${hasBadge ? 'grayscale-0 opacity-100 scale-110 drop-shadow-lg' : 'grayscale opacity-20 brightness-75 scale-90'}
                                                        ${isEditing ? 'cursor-pointer hover:scale-125 hover:opacity-80 active:scale-90' : ''}
                                                    `} 
                                                    title={badge.name}
                                                >
                                                    <img 
                                                        src={getBadgeSpriteUrlLocal(i)}
                                                        alt={badge.name}
                                                        className="w-full h-full object-contain pixelated"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <div className="flex items-center gap-1.5">
                                        <Trophy size={12} className="text-[#3B82F6]" />
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kanto Badges</h4>
                                    </div>
                                    {isEditing && <span className="text-[10px] text-gray-400 font-bold animate-pulse">Tap to toggle</span>}
                                </div>
                                <div className={`
                                    bg-white/50 dark:bg-gray-800/80 p-3 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-3 shadow-inner
                                    ${isEditing ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                `}>
                                    {displayBadges.slice(8, 16).map((badge, i) => {
                                        const actualIndex = i + 8;
                                        const badgesSource = isEditing ? editForm.badges : t.badges;
                                        const hasBadge = (badgesSource & (1 << actualIndex)) !== 0;
                                        return (
                                            <div key={actualIndex} className="flex justify-center">
                                                <div 
                                                    onClick={() => handleBadgeToggle(actualIndex)}
                                                    className={`
                                                        w-10 h-10 flex items-center justify-center transition-all duration-300
                                                        ${hasBadge ? 'grayscale-0 opacity-100 scale-110 drop-shadow-lg' : 'grayscale opacity-20 brightness-75 scale-90'}
                                                        ${isEditing ? 'cursor-pointer hover:scale-125 hover:opacity-80 active:scale-90' : ''}
                                                    `} 
                                                    title={badge.name}
                                                >
                                                    <img 
                                                        src={getBadgeSpriteUrlLocal(actualIndex)}
                                                        alt={badge.name}
                                                        className="w-full h-full object-contain pixelated"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                                 <Trophy size={14} className="text-orange-400" />
                                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Kanto Badges</h4>
                            </div>
                            {isEditing && <span className="text-[10px] text-gray-400 font-bold animate-pulse">Tap badge to toggle</span>}
                        </div>

                        <div className={`
                            bg-white/50 dark:bg-gray-800/80 p-4 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-4 shadow-inner
                            ${isEditing ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : ''}
                        `}>
                            {displayBadges.map((badge, i) => {
                                // Check bit at index i in badges byte
                                const badgesSource = isEditing ? editForm.badges : t.badges;
                                const hasBadge = (badgesSource & (1 << i)) !== 0;
                                
                                return (
                                    <div key={i} className="flex justify-center">
                                        <div 
                                            onClick={() => handleBadgeToggle(i)}
                                            className={`
                                                w-10 h-10 flex items-center justify-center transition-all duration-300
                                                ${hasBadge ? 'grayscale-0 opacity-100 scale-110 drop-shadow-lg' : 'grayscale opacity-20 brightness-75 scale-90'}
                                                ${isEditing ? 'cursor-pointer hover:scale-125 hover:opacity-80 active:scale-90' : ''}
                                            `} 
                                            title={badge.name}
                                        >
                                            <img 
                                                src={getBadgeSpriteUrlLocal(i)}
                                                alt={badge.name}
                                                className="w-full h-full object-contain pixelated"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Footer Accent */}
            <div className="h-2 bg-theme-primary"></div>
        </div>
    );
};
