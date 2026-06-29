/**
 * Gen 3 Panel Extensions (Phase 2 Sprint 6).
 *
 * Registers UI panel sections for Gen 3-specific Pokémon fields:
 * - Ability (dropdown from species' ability pool)
 * - Nature (dropdown of 25 natures)
 * - Contest Stats (sliders for Cool/Beauty/Cute/Smart/Tough/Sheen)
 * - Met Data (met location, met level, origin game)
 *
 * Pattern mirrors Gen 2's extensions.tsx.
 */
import React from 'react';
import { extensionRegistry } from '../../core/ExtensionRegistry';
import { ISectionExtension, IExtensionRenderContext } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { isGen3Extension } from '../../canonicalModel';
import { GEN3_ABILITIES, getGen3SpeciesAbilities } from './data/abilities';
import { NATURE_NAMES } from './identity';

// ─── Ability Section ───
const AbilitySection: ISectionExtension = {
  id: 'gen3-ability',
  panelId: 'pokemon-info',
  render: (data: PokemonStats | Record<string, unknown>, ctx: IExtensionRenderContext) => {
    const mon = data as PokemonStats;
    if (!isGen3Extension(mon.genExtension)) return null;
    const ext = mon.genExtension;
    const [ability1, ability2] = getGen3SpeciesAbilities(mon.dexId);
    const abilities = [ability1, ability2].filter((a): a is number => a !== undefined && a > 0);

    return React.createElement('div', { className: 'flex flex-col gap-1' },
      React.createElement('label', { className: 'text-xs font-bold text-gray-400 uppercase' }, 'Ability'),
      React.createElement('select', {
        className: 'w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl py-2 px-3',
        value: ext.abilityId,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
          const newId = parseInt(e.target.value, 10);
          const newExt = { ...ext, abilityId: newId, abilityName: GEN3_ABILITIES[newId] || 'None' };
          ctx.onChange('genExtension', newExt);
        },
      },
        abilities.map(aid => React.createElement('option', { key: aid, value: aid }, GEN3_ABILITIES[aid] || `Ability ${aid}`))
      )
    );
  },
};

// ─── Nature Section ───
const NatureSection: ISectionExtension = {
  id: 'gen3-nature',
  panelId: 'pokemon-info',
  render: (data: PokemonStats | Record<string, unknown>, ctx: IExtensionRenderContext) => {
    const mon = data as PokemonStats;
    if (!isGen3Extension(mon.genExtension)) return null;
    const ext = mon.genExtension;

    return React.createElement('div', { className: 'flex flex-col gap-1' },
      React.createElement('label', { className: 'text-xs font-bold text-gray-400 uppercase' }, 'Nature'),
      React.createElement('select', {
        className: 'w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl py-2 px-3',
        value: ext.natureId,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
          const newId = parseInt(e.target.value, 10);
          const newExt = { ...ext, natureId: newId, natureName: NATURE_NAMES[newId] || 'Hardy' };
          ctx.onChange('genExtension', newExt);
        },
      },
        NATURE_NAMES.map((name, id) => React.createElement('option', { key: id, value: id }, name))
      )
    );
  },
};

// ─── Contest Stats Section ───
const ContestStatsSection: ISectionExtension = {
  id: 'gen3-contest-stats',
  panelId: 'pokemon-stats',
  render: (data: PokemonStats | Record<string, unknown>, ctx: IExtensionRenderContext) => {
    const mon = data as PokemonStats;
    if (!isGen3Extension(mon.genExtension)) return null;
    const ext = mon.genExtension;
    const cs = ext.contestStats;

    const StatSlider = (label: string, value: number, key: string) =>
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-xs font-bold text-gray-500 w-16' }, label),
        React.createElement('input', {
          type: 'range', min: 0, max: 255, value,
          className: 'flex-grow',
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const newExt = { ...ext, contestStats: { ...cs, [key]: parseInt(e.target.value, 10) } };
            ctx.onChange('genExtension', newExt);
          },
        }),
        React.createElement('span', { className: 'text-xs font-bold text-gray-700 dark:text-gray-300 w-8 text-right' }, value)
      );

    return React.createElement('div', { className: 'flex flex-col gap-1' },
      StatSlider('Cool', cs.cool, 'cool'),
      StatSlider('Beauty', cs.beauty, 'beauty'),
      StatSlider('Cute', cs.cute, 'cute'),
      StatSlider('Smart', cs.smart, 'smart'),
      StatSlider('Tough', cs.tough, 'tough'),
      StatSlider('Sheen', cs.sheen, 'sheen'),
    );
  },
};

// ─── Met Data Section ───
const MetDataSection: ISectionExtension = {
  id: 'gen3-met-data',
  panelId: 'pokemon-info',
  render: (data: PokemonStats | Record<string, unknown>, _ctx: IExtensionRenderContext) => {
    const mon = data as PokemonStats;
    if (!isGen3Extension(mon.genExtension)) return null;
    const ext = mon.genExtension;

    return React.createElement('div', { className: 'flex flex-col gap-1' },
      React.createElement('label', { className: 'text-xs font-bold text-gray-400 uppercase' }, 'Origin'),
      React.createElement('div', { className: 'text-xs text-gray-600 dark:text-gray-400' },
        `Secret ID: ${ext.secretId || 0}`
      ),
      React.createElement('div', { className: 'text-xs text-gray-500' },
        `Nature: ${ext.natureName || 'Unknown'} | Ability: ${ext.abilityName || 'None'}`
      )
    );
  },
};

// ─── Register all Gen 3 panel extensions ───
export function registerGen3PanelExtensions(): void {
  extensionRegistry.registerExtension('pokemon-info', 3, AbilitySection);
  extensionRegistry.registerExtension('pokemon-info', 3, NatureSection);
  extensionRegistry.registerExtension('pokemon-info', 3, MetDataSection);
  extensionRegistry.registerExtension('pokemon-stats', 3, ContestStatsSection);
}
