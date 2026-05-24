import React from 'react';
import { ParsedSave, PokemonStats } from './parser/types';
import { GameCartridge } from '../types';

// ============================================================================
// Base Stats Interface — replaces `any` return types from getBaseStats()
// ============================================================================

/**
 * Unified base stats structure used across all generation adapters.
 * Gen 1 mirrors spAtk/spDef from the single Special base stat.
 * Gen 2+ provides independent spAtk/spDef values.
 */
export interface BaseStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAtk: number;
    spDef: number;
}

// ============================================================================
// Interface Segregation: Focused sub-interfaces for IGenerationAdapter
// ============================================================================

/**
 * Generation metadata and configuration properties.
 * Provides static information about a generation's capabilities and structure.
 */
export interface IGenerationMetadata {
  generation: number;
  generationName: string;
  supportedVersions: string[];
  partySize: number;
  boxSlotCount: number;
  boxCount: number;
  typeList: string[];
  typeChart: number[][];
}

/**
 * Binary serialization and deserialization operations.
 * Handles reading/writing save files and standalone Pokemon binary formats.
 */
export interface IGenerationBinaryOps {
  detectSave(buffer: Uint8Array, filename: string): { detected: boolean; gameVersion?: string };
  parseSave(buffer: Uint8Array, filename: string): ParsedSave;
  writeSave(save: ParsedSave): Uint8Array;
  validateSave(buffer: Uint8Array): boolean;
  parseStandalonePokemon(buffer: Uint8Array): PokemonStats;
  createStandalonePokemon(mon: PokemonStats): Uint8Array;
}

/**
 * Stat calculation operations.
 * Provides generation-specific stat formulas and recalculation logic.
 */
export interface IGenerationStatsOps {
  calculateStat(base: number, iv: number, ev: number, level: number, isHp: boolean): number;
  recalculateStats(mon: PokemonStats, baseStats: BaseStats): PokemonStats;
  getBaseStats(dexId: number): BaseStats | undefined;
}

/**
 * Data access operations for species, moves, items, and types.
 * Provides human-readable names and type assignments.
 */
export interface IGenerationDataAccess {
  getPokemonName(dexId: number): string;
  getMoveName(moveId: number): string;
  getItemName(itemId: number): string;
  getTypes(dexId: number): { type1: number; type2: number; type1Name: string; type2Name: string };
}

/**
 * Text encoding and decoding operations.
 * Handles generation-specific character encoding for Pokemon names, trainer names, etc.
 */
export interface IGenerationTextCodec {
  decodeText(buffer: Uint8Array, offset: number, maxLength: number): string;
  encodeText(text: string, length: number, terminator?: number): Uint8Array;
}

// ============================================================================
// Composite Interface — backward compatible with existing adapters
// ============================================================================

/**
 * Complete interface representing a Generation Adapter.
 * Composed from focused sub-interfaces following the Interface Segregation Principle (ISP).
 *
 * Consumers should depend on the specific sub-interface they need when possible:
 * - Use `IGenerationMetadata` when only reading generation config
 * - Use `IGenerationDataAccess` when only looking up names/types
 * - Use `IGenerationBinaryOps` when only parsing/writing saves
 * - Use `IGenerationStatsOps` when only calculating/recalculating stats
 * - Use `IGenerationTextCodec` when only encoding/decoding text
 *
 * The full `IGenerationAdapter` remains available for components that need
 * the complete adapter functionality (e.g., the AdapterRegistry).
 */
export interface IGenerationAdapter extends
  IGenerationMetadata,
  IGenerationBinaryOps,
  IGenerationStatsOps,
  IGenerationDataAccess,
  IGenerationTextCodec {}

// ============================================================================
// Extension System Interfaces
// ============================================================================

/**
 * Metadata/Context passed to visual panels/section extensions during render.
 * All `any` types have been replaced with proper types.
 */
export interface IExtensionRenderContext {
  generation: number;
  onChange: (field: string, value: unknown) => void;
  theme: GameCartridge | undefined;
  appState?: Record<string, unknown>;
}

/**
 * Interface representing an individual section extension that can inject customized UI
 * fields/behavior into an extensible panel on a per-generation basis.
 */
export interface ISectionExtension {
  id: string;
  panelId: string;

  /**
   * Renders the extension's additional UI fields.
   * @param data The active entity data (e.g. PokemonStats or a move context object)
   * @param context Additional metadata and event dispatcher handlers
   */
  render(data: PokemonStats | Record<string, unknown>, context: IExtensionRenderContext): React.ReactNode;

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
  id: string;
  registerExtension(generation: number, extension: ISectionExtension): void;
  getExtensions(generation: number): ISectionExtension[];
}
