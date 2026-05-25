import React from 'react';
import { ISectionExtension, IExtensionRenderContext } from '../../interfaces';
import { PokemonStats, isGen2Extension, Gen2SaveExtension } from '../../parser/types';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { GEN2_ITEMS } from './data/constants';
import { extensionRegistry } from '../../core/ExtensionRegistry';
import { Sparkles, HelpCircle, MapPin, Baby, Swords } from 'lucide-react';

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
    
    if (!genExt || genExt.generation !== 2) return null;
    
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
    
    if (!genExt || genExt.generation !== 2) return null;
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-blue-500" />
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Position</span>
        </div>
        <div className="text-[10px] text-blue-600 dark:text-blue-400 space-y-0.5">
          <div>Map: {genExt.currentMapId} (0x{genExt.currentMapId.toString(16).toUpperCase()})</div>
          <div>X: {genExt.mapX}, Y: {genExt.mapY}</div>
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
