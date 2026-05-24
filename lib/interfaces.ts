import React from 'react';
import { ParsedSave, PokemonStats } from './parser/types';

/**
 * Interface representing a Generation Adapter.
 * Encapsulates generation-specific logic for parsing/writing saves, calculating stats,
 * and mapping names, moves, and items.
 */
export interface IGenerationAdapter {
  generation: number; // e.g. 1, 2, ...
  generationName: string; // e.g. "Generation I", "Generation II"
  supportedVersions: string[]; // e.g. ['Red', 'Blue', 'Yellow']
  partySize: number; // e.g. 6
  boxSlotCount: number; // e.g. 20
  boxCount: number; // e.g. 12
  typeList: string[]; // e.g. ['Normal', 'Fighting', ...]
  typeChart: number[][]; // Effectiveness matrix [typeA][typeB]

  // Binary operations
  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string };
  parseSave(buffer: Uint8Array, filename: string): ParsedSave; 
  writeSave(save: ParsedSave): Uint8Array;
  validateSave(buffer: Uint8Array): boolean;
  parseStandalonePokemon(buffer: Uint8Array): PokemonStats;
  createStandalonePokemon(mon: PokemonStats): Uint8Array;

  // Stat operations
  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number;
  recalculateStats(mon: PokemonStats, baseStats: any): PokemonStats;
  getBaseStats(dexId: number): any;

  // Data access
  getPokemonName(dexId: number): string;
  getMoveName(moveId: number): string;
  getItemName(itemId: number): string;
  getTypes(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string };

  // Text codec
  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string;
  encodeText(text: string, length: number, terminator?: number): Uint8Array;
}

/**
 * Metadata/Context passed to visual panels/section extensions during render
 */
export interface IExtensionRenderContext {
  generation: number;
  onChange: (field: string, value: any) => void;
  theme: any;
  appState?: any;
}

/**
 * Interface representing an individual section extension that can inject customized UI
 * fields/behavior into an extensible panel on a per-generation basis.
 */
export interface ISectionExtension {
  id: string; // Unique section extension ID
  panelId: string; // The core panel to attach to, e.g. 'pokemon-info', 'pokemon-stats'
  
  /**
   * Renders the extension's additional UI fields.
   * @param data The active entity data (e.g. PokemonStats or TrainerInfo)
   * @param context Additional metadata and event dispatcher handlers
   */
  render(data: any, context: IExtensionRenderContext): React.ReactNode;
  
  /**
   * Optional event-binding hook called once UI component mounts
   */
  bindEvents?(container: HTMLElement, context: IExtensionRenderContext): void;
}

/**
 * Interface representing a modular, reusable UI panel capable of registering and
 * presenting external generation custom extensions.
 */
export interface IPanelExtension {
  id: string; // Unique panel ID
  registerExtension(generation: number, extension: ISectionExtension): void;
  getExtensions(generation: number): ISectionExtension[];
}
