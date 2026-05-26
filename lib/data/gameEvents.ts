/**
 * Shared type definition for game event flags.
 *
 * This file is the single source of truth for the GameEventDefinition interface,
 * which was previously duplicated across gen1/data/events.ts and gen2/data/events.ts
 * with inconsistent shapes (gen1 had `version?` optional, gen2 had `version` required).
 *
 * The unified type makes `version` optional so it works for both generations:
 * - Gen 1: version is not set (all events apply to all versions)
 * - Gen 2+: version is set to 'all', 'gs', 'crystal', etc.
 *
 * Following PKHeX's IEventFlagArray pattern, each adapter owns its event flag data
 * and exposes it via the `getGameEvents(version?)` method. UI components never
 * import generation-specific event data directly.
 */

export interface GameEventDefinition {
    /** Unique identifier for this event (e.g., 'articuno', 'hooh') */
    id: string;
    /** Human-readable name (e.g., 'Articuno', 'Ho-Oh') */
    name: string;
    /** Description of the in-game event */
    description: string;
    /** Global bit index in the save file's event flags array */
    offset: number;
    /** Category for grouping in the UI */
    category: 'Legendary' | 'Interaction' | 'Gift' | 'Story';
    /** Which game versions this flag applies to.
     *  Omitted or 'all' = applies to all versions in this generation.
     *  'gs' = Gold/Silver only, 'crystal' = Crystal only, etc.
     */
    version?: 'all' | 'gs' | 'crystal' | string;
}
