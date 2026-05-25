import React from 'react';
import { ISectionExtension, IExtensionRenderContext } from '../../interfaces';
import { PokemonStats, isGen2Extension, Gen2SaveExtension, Gen2Extension } from '../../parser/types';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { GEN2_ITEMS } from './data/constants';
import { extensionRegistry } from '../../core/ExtensionRegistry';
import { Sparkles, HelpCircle, SunMoon, Heart, Egg } from 'lucide-react';

// ============================================================================
// POKEMON-LEVEL EXTENSIONS
// ============================================================================
// These extensions render in PokemonInfoPanel/PokemonStatsPanel because they
// operate on individual Pokemon data (PokemonStats). They correctly receive
// Pokemon context and their guards check for Gen2Extension (pokemon-level).
// ============================================================================

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

// ============================================================================
// Phase 3: Crystal-Specific Pokemon-Level Extension
// ============================================================================

// 7. CaughtDataSection: Displays Crystal Pokemon met data
// This is a POKEMON-LEVEL extension — it reads from Gen2Extension.caughtData
// which is per-Pokemon data. It correctly works in the pokemon-info panel.
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

// ============================================================================
// ARCHITECTURAL NOTE: Save-Level Extensions
// ============================================================================
// The following save-level extensions were previously registered on the
// 'pokemon-info' panel but could NEVER render because:
//
//   1. PokemonInfoPanel passes individual Pokemon data (PokemonStats) to
//      extension.render(), where mon.genExtension is a Gen2Extension
//      (per-Pokemon data), NOT a Gen2SaveExtension (per-Save data).
//   2. The guards in those extensions checked for save-level properties like
//      'blueCardPoints', 'currentMapId', 'rtcFlags', etc., which only exist
//      on Gen2SaveExtension — never on Gen2Extension.
//   3. Therefore, every save-level extension always returned null.
//
// SOLUTION: All save-level Gen 2 features (RTC, Map Position, Daycare,
// Mom Savings, Phone Contacts, Unown Dex, Blue Card, Mystery Gift,
// GS Ball Event, Move Tutors) are now rendered DIRECTLY in the
// EventsTab component (components/editor/tabs/EventsTab.tsx), which
// has access to the full ParsedSave including Gen2SaveExtension.
//
// The extension registry is the right tool for POKEMON-LEVEL injection
// (Held Item, Shiny, Gender, SpAtk/SpDef info, CaughtData). For SAVE-LEVEL
// data, a dedicated tab with direct component rendering is cleaner and more
// reliable than trying to pipe save context through the pokemon panel.
// ============================================================================

// 5. FriendshipEggSection: Displays friendship for hatched Pokemon or
// egg cycles (hatch counter) for egg Pokemon. In Gen 2, byte 0x1B serves
// dual purpose — friendship for hatched Pokemon, hatch counter for eggs.
export const FriendshipEggSection: ISectionExtension = {
  id: 'gsc-friendship-egg',
  panelId: 'pokemon-info',
  render(mon: PokemonStats, context: IExtensionRenderContext) {
    const gen2Ext = mon.genExtension as Gen2Extension | null;
    if (!gen2Ext || gen2Ext.generation !== 2) return null;

    if (mon.isEgg) {
      // Egg: show hatch counter (egg cycles)
      const eggCycles = gen2Ext.eggCycles || 0;
      return (
        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Egg size={14} className="text-green-500" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Egg</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-1.5 border border-green-200 dark:border-green-800/50 shadow-inner flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase shrink-0">Hatch Counter</span>
            <input
              type="number"
              value={eggCycles}
              min={0}
              max={255}
              onChange={(e) => {
                const val = Math.min(255, Math.max(0, Number(e.target.value)));
                if (gen2Ext) {
                  const updated = { ...gen2Ext, eggCycles: val };
                  context.onChange('genExtension', updated as unknown);
                }
              }}
              className="w-full text-center text-xs font-mono font-bold bg-transparent outline-none text-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="text-[10px] text-green-500 dark:text-green-400 mt-1">
            Steps until hatching: ~{eggCycles * 256}. Counter decreases as you walk.
          </div>
        </div>
      );
    }

    // Hatched Pokemon: show friendship
    const friendship = gen2Ext.friendship || mon.friendship || 0;
    // Friendship level descriptions
    let friendshipLabel = 'Neutral';
    let friendshipColor = 'text-gray-500';
    if (friendship >= 255) { friendshipLabel = 'Best Friends'; friendshipColor = 'text-pink-500'; }
    else if (friendship >= 200) { friendshipLabel = 'Very Happy'; friendshipColor = 'text-green-500'; }
    else if (friendship >= 150) { friendshipLabel = 'Happy'; friendshipColor = 'text-blue-500'; }
    else if (friendship >= 100) { friendshipLabel = 'Friendly'; friendshipColor = 'text-yellow-500'; }
    else if (friendship >= 50) { friendshipLabel = 'Neutral'; friendshipColor = 'text-gray-500'; }
    else { friendshipLabel = 'Unhappy'; friendshipColor = 'text-red-500'; }

    return (
      <div className="bg-pink-50 dark:bg-pink-900/10 rounded-xl p-3 border border-pink-100 dark:border-pink-800/30">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={14} className="text-pink-500" />
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest">Friendship</span>
          <span className={`text-[10px] font-bold ${friendshipColor} ml-auto`}>{friendshipLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={255}
            value={friendship}
            onChange={(e) => {
              const val = Number(e.target.value);
              context.onChange('friendship', val as unknown);
              if (gen2Ext) {
                const updated = { ...gen2Ext, friendship: val };
                context.onChange('genExtension', updated as unknown);
              }
            }}
            className="flex-grow accent-pink-500 h-2"
          />
          <input
            type="number"
            value={friendship}
            min={0}
            max={255}
            onChange={(e) => {
              const val = Math.min(255, Math.max(0, Number(e.target.value)));
              context.onChange('friendship', val as unknown);
              if (gen2Ext) {
                const updated = { ...gen2Ext, friendship: val };
                context.onChange('genExtension', updated as unknown);
              }
            }}
            className="w-14 text-center text-xs font-mono font-bold bg-white dark:bg-gray-900 rounded border border-pink-200 dark:border-pink-800/50 py-1 outline-none text-gray-700 dark:text-gray-200"
          />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-pink-500 transition-all duration-300"
            style={{ width: `${(friendship / 255) * 100}%` }}
          />
        </div>
      </div>
    );
  }
};

// Auto-register POKEMON-LEVEL extensions for Generation 2
// These are the only extensions that work correctly in the pokemon panel
extensionRegistry.registerExtension('pokemon-info', 2, HeldItemSection);
extensionRegistry.registerExtension('pokemon-info', 2, ShinyFlagSection);
extensionRegistry.registerExtension('pokemon-info', 2, GenderSection);
extensionRegistry.registerExtension('pokemon-info', 2, FriendshipEggSection);
extensionRegistry.registerExtension('pokemon-stats', 2, SpAtkSpDefSection);
// Phase 3: Crystal-specific pokemon-level extension
extensionRegistry.registerExtension('pokemon-info', 2, CaughtDataSection);

// NOTE: Save-level extensions (Daycare, MapPosition, BlueCard, MysteryGift,
// GSBallEvent, MoveTutor, RTCClock, MomSavings, PhoneContacts, UnownDex)
// were previously registered here but removed because they could never render.
// They now live in EventsTab.tsx as direct components.
