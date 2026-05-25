import React from 'react';
import { ISectionExtension, IExtensionRenderContext } from '../../interfaces';
import { PokemonStats, isGen2Extension, Gen2SaveExtension, Gen2Extension } from '../../parser/types';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { GEN2_ITEMS } from './data/constants';
import { extensionRegistry } from '../../core/ExtensionRegistry';
import { Sparkles, HelpCircle, MapPin, Baby, Swords, Gift, CreditCard, SunMoon, Zap, Flame, Snowflake, Clock, PiggyBank, Phone, Eye } from 'lucide-react';

// 1. HeldItemSection: Injects held-item Autocomplete selection directly into PokemonInfoPanel
// Now reads/writes through the canonical genExtension slot when available,
// falling back to flat fields for backward compatibility.
export const HeldItemSection: ISectionExtension = {
  id: 'gsc-held-item',
  panelId: 'pokemon-info',
  render(mon: PokemonStats, context: IExtensionRenderContext) {
    const listOptions = ['None', ...Object.values(GEN2_ITEMS)];
    // Read from genExtension (canonical source) with flat-field fallback
    const currentValue = (isGen2Extension(mon.genExtension) ? mon.genExtension.heldItemName : null) 
                         || mon.heldItemName || 'None';

    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30">
        <label className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-2">
          Held Item
        </label>
        <Autocomplete
          options={listOptions}
          value={currentValue}
          onChange={(name) => {
            const trimmedName = name.trim();
            // Find key (ID) corresponding to the item name
            const matchingIdStr = Object.keys(GEN2_ITEMS).find(
              (key) => GEN2_ITEMS[Number(key)]!.toLowerCase() === trimmedName.toLowerCase()
            );
            const heldItemId = matchingIdStr ? Number(matchingIdStr) : 0;
            const heldItemName = heldItemId > 0 ? GEN2_ITEMS[heldItemId]! : 'None';

            // Update flat fields via context
            context.onChange('heldItemId', heldItemId as unknown);
            context.onChange('heldItemName', heldItemName as unknown);
            
            // Update genExtension immutably — create new object instead of mutating
            if (isGen2Extension(mon.genExtension)) {
              const updatedExtension = { ...mon.genExtension, heldItemId, heldItemName };
              // We need to propagate this through onChange as well
              context.onChange('genExtension', updatedExtension as unknown);
            }
          }}
          placeholder="No Held Item"
          className="shadow-sm"
        />
      </div>
    );
  }
};

// 2. ShinyFlagSection: Appends shiny sparks/stars next to the Pokémon's name card and rendering borders
// Uses the universal isShiny flat field for O(1) access, as designed per CDM rationale.
export const ShinyFlagSection: ISectionExtension = {
  id: 'gsc-shiny',
  panelId: 'pokemon-info',
  render(mon: PokemonStats) {
    if (!mon.isShiny) return null;

    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black italic rounded-xl px-3 py-2 text-xs shadow-md animate-pulse">
        <Sparkles size={14} className="text-white animate-spin-slow" />
        <span>GSC SHINY POKÉMON</span>
        <Sparkles size={14} className="text-white" />
      </div>
    );
  }
};

// 3. GenderSection: Displays the male/female indicator using the universal gender field
// (DV-based determination stored in both flat field and genExtension)
export const GenderSection: ISectionExtension = {
  id: 'gsc-gender',
  panelId: 'pokemon-info',
  render(mon: PokemonStats) {
    const isFemale = mon.gender === 'Female';
    const isMale = mon.gender === 'Male';
    
    let genderBg = 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    let label = 'Genderless';
    
    if (isFemale) {
      genderBg = 'bg-pink-50 dark:bg-pink-950/20 text-pink-500 border border-pink-100 dark:border-pink-900/40';
      label = 'Female ♀';
    } else if (isMale) {
      genderBg = 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 border border-blue-100 dark:border-blue-900/40';
      label = 'Male ♂';
    }

    return (
      <div className={`rounded-xl p-3 flex items-center justify-between font-bold ${genderBg}`}>
        <span className="text-xs uppercase tracking-widest opacity-80">Gender</span>
        <span className="text-xs italic font-black">{label}</span>
      </div>
    );
  }
};

// 4. SpAtkSpDefSection: Injects helpful guidance about shared DVs for special stats in Gen 2
// This is a static informational extension — no data reading needed.
export const SpAtkSpDefSection: ISectionExtension = {
  id: 'gsc-sp-atk-sp-def',
  panelId: 'pokemon-stats',
  render() {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3 flex items-start gap-2.5">
        <HelpCircle size={16} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-relaxed font-semibold">
          <span className="font-extrabold block mb-0.5 uppercase tracking-wider text-[11px]">Gen 2 Special Stats Rule</span>
          In Generation II, Special Attack (Sp. Atk) and Special Defense (Sp. Def) both share the single Special DV (0-15) block. Modifying either DV field will adjust both stats.
        </div>
      </div>
    );
  }
};

// 5. DaycareSection: Phase 2 — Displays daycare parent information
// Shows the two Pokemon deposited at the Route 34 Day-Care, including
// their species, level, and breeding status. This is injected into
// the trainer info panel as a supplementary section.
export const DaycareSection: ISectionExtension = {
  id: 'gsc-daycare',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    // This extension is for save-level data displayed in trainer context
    // It reads from the save extension rather than individual Pokemon
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is actually save-level data (Gen2SaveExtension)
    // When rendered in Pokemon context, genExtension is Gen2Extension (not Gen2SaveExtension)
    // Gen2SaveExtension has daycareParent1; Gen2Extension does not
    if (!genExt || genExt.generation !== 2 || !('daycareParent1' in genExt)) return null;
    
    const hasParent1 = genExt.daycareParent1 !== null;
    const hasParent2 = genExt.daycareParent2 !== null;
    
    if (!hasParent1 && !hasParent2) {
      return (
        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Baby size={14} className="text-green-500" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Day-Care</span>
          </div>
          <p className="text-[10px] text-green-600/70 dark:text-green-400/70">No Pokémon deposited at the Day-Care.</p>
        </div>
      );
    }

    return (
      <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
        <div className="flex items-center gap-2 mb-2">
          <Baby size={14} className="text-green-500" />
          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Day-Care</span>
        </div>
        {hasParent1 && genExt.daycareParent1 && (
          <div className="text-[11px] font-semibold text-green-700 dark:text-green-300 mb-1">
            Parent 1: {genExt.daycareParent1.speciesName} (Lv.{genExt.daycareParent1.level})
          </div>
        )}
        {hasParent2 && genExt.daycareParent2 && (
          <div className="text-[11px] font-semibold text-green-700 dark:text-green-300 mb-1">
            Parent 2: {genExt.daycareParent2.speciesName} (Lv.{genExt.daycareParent2.level})
          </div>
        )}
        {genExt.daycareBreedingStatus > 0 && (
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
            Egg pending! Steps remaining: {genExt.daycareStepsUntilEgg}
          </div>
        )}
      </div>
    );
  }
};

// 6. MapPositionSection: Phase 2 — Displays current map position
// Shows the player's current map ID and X/Y coordinates. This is useful
// for save editors that want to verify or teleport the player.
export const MapPositionSection: ISectionExtension = {
  id: 'gsc-map-position',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is actually save-level data (Gen2SaveExtension)
    // Gen2SaveExtension has currentMapId; Gen2Extension does not
    if (!genExt || genExt.generation !== 2 || !('currentMapId' in genExt)) return null;
    
    // Additional safety: ensure currentMapId is actually a number before calling toString
    const mapId = typeof genExt.currentMapId === 'number' ? genExt.currentMapId : 0;
    const mapX = typeof genExt.mapX === 'number' ? genExt.mapX : 0;
    const mapY = typeof genExt.mapY === 'number' ? genExt.mapY : 0;
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-blue-500" />
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Position</span>
        </div>
        <div className="text-[10px] text-blue-600 dark:text-blue-400 space-y-0.5">
          <div>Map: {mapId} (0x{mapId.toString(16).toUpperCase()})</div>
          <div>X: {mapX}, Y: {mapY}</div>
        </div>
      </div>
    );
  }
};

// ============================================================================
// Phase 3: Crystal-Specific UI Extensions
// ============================================================================

// 7. CaughtDataSection: Phase 3 — Displays Crystal Pokemon met data
// Shows the met location, met level, time of day, and OT gender from the
// CaughtData field. Only displayed for Crystal saves where caughtData > 0.
// For Pokemon originating from Gold/Silver (caughtData = 0), the section
// is hidden since no met data is available.
export const CaughtDataSection: ISectionExtension = {
  id: 'gsc-caught-data',
  panelId: 'pokemon-info',
  render(mon: PokemonStats) {
    const gen2Ext = mon.genExtension as Gen2Extension | null;
    if (!gen2Ext || gen2Ext.generation !== 2 || gen2Ext.caughtData === 0) return null;

    const todIcon = gen2Ext.metTimeOfDay === 'Morning' ? '🌅' 
      : gen2Ext.metTimeOfDay === 'Day' ? '☀️' 
      : gen2Ext.metTimeOfDay === 'Night' ? '🌙' : '❓';
    const todLabel = gen2Ext.metTimeOfDay;

    return (
      <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-3 border border-purple-100 dark:border-purple-800/30">
        <div className="flex items-center gap-2 mb-2">
          <SunMoon size={14} className="text-purple-500" />
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Met Data</span>
          <span className="text-[9px] bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-bold">CRYSTAL</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="text-purple-600 dark:text-purple-400">
            <span className="font-bold">Location:</span> #{gen2Ext.metLocation}
          </div>
          <div className="text-purple-600 dark:text-purple-400">
            <span className="font-bold">Level:</span> {gen2Ext.metLevel}
          </div>
          <div className="text-purple-600 dark:text-purple-400">
            <span className="font-bold">Time:</span> {todIcon} {todLabel}
          </div>
          <div className="text-purple-600 dark:text-purple-400">
            <span className="font-bold">OT:</span> {gen2Ext.caughtOtGender === 'Female' ? '♀' : '♂'} {gen2Ext.caughtOtGender}
          </div>
        </div>
      </div>
    );
  }
};

// 8. BlueCardSection: Phase 3 — Displays Crystal Blue Card points
// The Blue Card is a Crystal-exclusive item that tracks Battle Tower wins.
// Each win adds a point, and points can be exchanged for prizes. This section
// displays the current point count. Only shown for Crystal saves.
export const BlueCardSection: ISectionExtension = {
  id: 'gsc-blue-card',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data (Gen2SaveExtension has blueCardPoints)
    if (!genExt || genExt.generation !== 2 || !('blueCardPoints' in genExt) || genExt.blueCardPoints < 0) return null;
    
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={14} className="text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Blue Card</span>
          <span className="text-[9px] bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">CRYSTAL</span>
        </div>
        <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
          {genExt.blueCardPoints} Point{genExt.blueCardPoints !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }
};

// 9. MysteryGiftSection: Phase 3 — Displays Crystal Mystery Gift status
// Mystery Gift is a Crystal-exclusive infrared communication feature that
// allows players to receive items from other players or events. This section
// shows whether it's unlocked and which item was last received. Only shown
// for Crystal saves where the feature is available.
export const MysteryGiftSection: ISectionExtension = {
  id: 'gsc-mystery-gift',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data (Gen2SaveExtension has mysteryGiftUnlocked)
    if (!genExt || genExt.generation !== 2 || !('mysteryGiftUnlocked' in genExt) || genExt.mysteryGiftUnlocked < 0) return null;
    
    const isUnlocked = genExt.mysteryGiftUnlocked !== 0;
    const statusColor = isUnlocked 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-gray-500 dark:text-gray-400';
    const statusText = isUnlocked ? 'Unlocked' : 'Locked';
    
    return (
      <div className="bg-rose-50 dark:bg-rose-900/10 rounded-xl p-3 border border-rose-100 dark:border-rose-800/30">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={14} className="text-rose-500" />
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Mystery Gift</span>
          <span className="text-[9px] bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-full font-bold">CRYSTAL</span>
        </div>
        <div className="text-[11px] font-semibold {statusColor}">
          Status: {statusText}
        </div>
        {isUnlocked && genExt.mysteryGiftItem > 0 && (
          <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
            Last Item ID: {genExt.mysteryGiftItem}
          </div>
        )}
      </div>
    );
  }
};

// 10. GSBallEventSection: Phase 3 — Displays Crystal GS Ball event status
// The GS Ball event is a special event in Crystal that leads to the
// Ilex Forest Celebi encounter. It was originally available via the
// Mobile System GB in Japan and later via Virtual Console. This section
// shows whether the event flag is active. Only shown for Crystal saves.
export const GSBallEventSection: ISectionExtension = {
  id: 'gsc-gs-ball-event',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data (Gen2SaveExtension has gsBallEventEnabled)
    if (!genExt || genExt.generation !== 2 || !('gsBallEventEnabled' in genExt)) return null;
    
    // Only show for Crystal saves (check if blueCardPoints is valid, which means Crystal)
    const isCrystal = genExt.blueCardPoints >= 0;
    if (!isCrystal) return null;
    
    const isEnabled = genExt.gsBallEventEnabled;
    const statusColor = isEnabled 
      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' 
      : 'bg-gray-50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800/30';
    const textColor = isEnabled
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-gray-500 dark:text-gray-400';
    const badgeColor = isEnabled
      ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    
    return (
      <div className={`${statusColor} rounded-xl p-3 border`}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className={textColor} />
          <span className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>GS Ball Event</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor}`}>CRYSTAL</span>
        </div>
        <div className={`text-[11px] font-semibold ${textColor}`}>
          {isEnabled ? 'Active — Celebi event available!' : 'Inactive'}
        </div>
      </div>
    );
  }
};

// 11. MoveTutorSection: Phase 3 — Displays Crystal Move Tutor usage
// Crystal introduced three Move Tutors that teach Flamethrower, Thunderbolt,
// and Ice Beam. Each can only be used once. This section shows which tutors
// have already been used. Only shown for Crystal saves.
export const MoveTutorSection: ISectionExtension = {
  id: 'gsc-move-tutor',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data (Gen2SaveExtension has moveTutorFlags)
    if (!genExt || genExt.generation !== 2 || !('moveTutorFlags' in genExt) || genExt.moveTutorFlags.length === 0) return null;
    
    const tutorNames = ['Flamethrower', 'Thunderbolt', 'Ice Beam'];
    const tutorIcons = [
      <Flame key="flame" size={12} className="text-orange-500" />,
      <Zap key="zap" size={12} className="text-yellow-500" />,
      <Snowflake key="snow" size={12} className="text-cyan-500" />,
    ];
    
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30">
        <div className="flex items-center gap-2 mb-2">
          <Swords size={14} className="text-amber-500" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Move Tutors</span>
          <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">CRYSTAL</span>
        </div>
        <div className="space-y-1">
          {genExt.moveTutorFlags.map((used, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[10px]">
              {tutorIcons[idx]}
              <span className={used ? 'text-red-500 font-bold line-through' : 'text-green-600 dark:text-green-400 font-semibold'}>
                {tutorNames[idx] || `Tutor ${idx + 1}`}
              </span>
              <span className={used ? 'text-red-400 dark:text-red-500' : 'text-green-500 dark:text-green-500'}>
                {used ? '(Used)' : '(Available)'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

// Auto-register GSC extensions for Generation 2
extensionRegistry.registerExtension('pokemon-info', 2, HeldItemSection);
extensionRegistry.registerExtension('pokemon-info', 2, ShinyFlagSection);
extensionRegistry.registerExtension('pokemon-info', 2, GenderSection);
extensionRegistry.registerExtension('pokemon-stats', 2, SpAtkSpDefSection);
extensionRegistry.registerExtension('pokemon-info', 2, DaycareSection);
extensionRegistry.registerExtension('pokemon-info', 2, MapPositionSection);
// Phase 3: Crystal-specific extensions
extensionRegistry.registerExtension('pokemon-info', 2, CaughtDataSection);
extensionRegistry.registerExtension('pokemon-info', 2, BlueCardSection);
extensionRegistry.registerExtension('pokemon-info', 2, MysteryGiftSection);
extensionRegistry.registerExtension('pokemon-info', 2, GSBallEventSection);
extensionRegistry.registerExtension('pokemon-info', 2, MoveTutorSection);

// ============================================================================
// Phase 4: Advanced Features UI Extensions
// ============================================================================

// 12. RTCClockSection: Phase 4 — Displays RTC (Real-Time Clock) status
// Shows the RTC flags byte from the save file. The RTC is used for
// time-based events in Gold/Silver/Crystal. This section displays the
// raw flags value and indicates whether the clock is active.
export const RTCClockSection: ISectionExtension = {
  id: 'gsc-rtc-clock',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data with rtcFlags
    if (!genExt || genExt.generation !== 2 || !('rtcFlags' in genExt)) return null;
    
    return (
      <div className="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-3 border border-teal-100 dark:border-teal-800/30">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={14} className="text-teal-500" />
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">RTC Clock</span>
        </div>
        <div className="text-[10px] text-teal-600 dark:text-teal-400">
          <div>Flags: 0x{genExt.rtcFlags.toString(16).toUpperCase().padStart(2, '0')} ({genExt.rtcFlags})</div>
          <div className="mt-0.5 opacity-70">Real-Time Clock for time-based events</div>
        </div>
      </div>
    );
  }
};

// 13. MomSavingsSection: Phase 4 — Displays Mom savings amount
// Mom can save a percentage of battle earnings. This section shows
// the current savings amount stored in BCD format.
export const MomSavingsSection: ISectionExtension = {
  id: 'gsc-mom-savings',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data with momSavings
    if (!genExt || genExt.generation !== 2 || !('momSavings' in genExt)) return null;
    if (genExt.momSavings === 0) return null; // Don't show when no savings
    
    // Format as money (BCD display)
    const savingsStr = genExt.momSavings.toLocaleString();
    
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3 border border-yellow-100 dark:border-yellow-800/30">
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank size={14} className="text-yellow-500" />
          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Mom Savings</span>
        </div>
        <div className="text-[11px] font-semibold text-yellow-700 dark:text-yellow-300">
          {savingsStr}
        </div>
      </div>
    );
  }
};

// 14. PhoneContactsSection: Phase 4 — Displays phone contacts
// GSC stores up to 39 phone contacts from trainers met throughout the game.
// This section shows how many contacts are registered and lists them.
export const PhoneContactsSection: ISectionExtension = {
  id: 'gsc-phone-contacts',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data with phoneContacts
    if (!genExt || genExt.generation !== 2 || !('phoneContacts' in genExt)) return null;
    if (genExt.phoneContacts.length === 0) return null;
    
    return (
      <div className="bg-cyan-50 dark:bg-cyan-900/10 rounded-xl p-3 border border-cyan-100 dark:border-cyan-800/30">
        <div className="flex items-center gap-2 mb-2">
          <Phone size={14} className="text-cyan-500" />
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Phone Contacts</span>
          <span className="text-[9px] bg-cyan-200 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-full font-bold">{genExt.phoneContacts.length}</span>
        </div>
        <div className="space-y-0.5 max-h-24 overflow-y-auto">
          {genExt.phoneContacts.slice(0, 10).map((contact, idx) => (
            <div key={idx} className="text-[10px] text-cyan-600 dark:text-cyan-400 truncate">
              {contact.name}
            </div>
          ))}
          {genExt.phoneContacts.length > 10 && (
            <div className="text-[9px] text-cyan-500/50 italic">
              +{genExt.phoneContacts.length - 10} more...
            </div>
          )}
        </div>
      </div>
    );
  }
};

// 15. UnownDexSection: Phase 4 — Displays Unown Pokedex forms
// After the main Pokedex data, there are 28 bytes of Unown-specific data
// tracking which Unown letter forms have been caught. This section
// shows the caught forms as a visual letter grid.
export const UnownDexSection: ISectionExtension = {
  id: 'gsc-unown-dex',
  panelId: 'pokemon-info',
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext) {
    const saveData = data as Record<string, unknown>;
    const genExt = saveData.genExtension as Gen2SaveExtension | null;
    
    // Guard: only render if this is save-level data with unownCaughtForms
    if (!genExt || genExt.generation !== 2 || !('unownCaughtForms' in genExt)) return null;
    if (genExt.unownCaughtForms.length === 0) return null;
    
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const caughtCount = genExt.unownCaughtForms.filter(v => v > 0).length;
    
    return (
      <div className="bg-violet-50 dark:bg-violet-900/10 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={14} className="text-violet-500" />
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Unown Dex</span>
          <span className="text-[9px] bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full font-bold">{caughtCount}/26</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {alphabet.split('').map((letter, idx) => {
            const isCaught = genExt.unownCaughtForms[idx] !== undefined && genExt.unownCaughtForms[idx] > 0;
            return (
              <span 
                key={letter}
                className={`text-[9px] w-5 h-5 flex items-center justify-center rounded font-bold ${
                  isCaught 
                    ? 'bg-violet-200 dark:bg-violet-700 text-violet-700 dark:text-violet-200' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                }`}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
};

// Phase 4: Register advanced feature extensions
extensionRegistry.registerExtension('pokemon-info', 2, RTCClockSection);
extensionRegistry.registerExtension('pokemon-info', 2, MomSavingsSection);
extensionRegistry.registerExtension('pokemon-info', 2, PhoneContactsSection);
extensionRegistry.registerExtension('pokemon-info', 2, UnownDexSection);
