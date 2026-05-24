import React from 'react';
import { ISectionExtension, IExtensionRenderContext } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { GEN2_ITEMS } from './data/constants';
import { extensionRegistry } from '../../core/ExtensionRegistry';
import { Sparkles, HelpCircle } from 'lucide-react';

// 1. HeldItemSection: Injects held-item Autocomplete selection directly into PokemonInfoPanel
export const HeldItemSection: ISectionExtension = {
  id: 'gsc-held-item',
  panelId: 'pokemon-info',
  render(mon: PokemonStats, context: IExtensionRenderContext) {
    const listOptions = ['None', ...Object.values(GEN2_ITEMS)];
    const currentValue = mon.heldItemName || 'None';

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
              (key) => GEN2_ITEMS[Number(key)].toLowerCase() === trimmedName.toLowerCase()
            );
            const heldItemId = matchingIdStr ? Number(matchingIdStr) : 0;
            const heldItemName = heldItemId > 0 ? GEN2_ITEMS[heldItemId] : 'None';

            context.onChange('heldItemId', heldItemId as unknown);
            context.onChange('heldItemName', heldItemName as unknown);
          }}
          placeholder="No Held Item"
          className="shadow-sm"
        />
      </div>
    );
  }
};

// 2. ShinyFlagSection: Appends shiny sparks/stars next to the Pokémon's name card and rendering borders
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

// 3. GenderSection: Leverages DV values inside genExtension to display the male/female indicator in the details view
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

// Auto-register GSC extensions for Generation 2
extensionRegistry.registerExtension('pokemon-info', 2, HeldItemSection);
extensionRegistry.registerExtension('pokemon-info', 2, ShinyFlagSection);
extensionRegistry.registerExtension('pokemon-info', 2, GenderSection);
extensionRegistry.registerExtension('pokemon-stats', 2, SpAtkSpDefSection);
