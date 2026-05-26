/**
 * Gen 2 Event Flags Database — Gold/Silver/Crystal
 *
 * This file provides named event flag entries for Generation 2 save files.
 * Gen 2 stores 2000 event flags (250 bytes) that control every story event,
 * NPC interaction, item pickup, door unlock, and cutscene trigger.
 *
 * The flag offsets are global bit indices into the 2000-bit event flag array.
 * These are derived from the Pret disassembly projects (pokegold, pokecrystal)
 * and cross-referenced with PKHeX's event flag constants.
 *
 * NOTE: Some flag indices differ between Gold/Silver and Crystal.
 * The `version` field indicates which versions the flag applies to.
 * When a flag applies to all versions, it's marked as 'all'.
 */

// Re-export the shared GameEventDefinition type for backward compatibility
export type { GameEventDefinition as GameEvent } from '../../../data/gameEvents';
import { type GameEventDefinition } from '../../../data/gameEvents';

/**
 * Gen 2 event flags database.
 *
 * Flag indices are from the Pret pokecrystal/pokegold disassembly projects
 * (constants/event_flags.asm). These map to meaningful in-game events that
 * players commonly want to toggle in a save editor.
 *
 * Categories:
 * - Legendary: Legendary/Mythical Pokemon encounters and captures
 * - Interaction: Stationary Pokemon, blockers, one-time NPC encounters
 * - Gift: Gift Pokemon, key item pickups, one-time choices
 * - Story: Major story progression flags
 */
export const GEN2_EVENTS: GameEventDefinition[] = [
    // ── Legendary Pokemon ──
    { id: 'hooh', name: 'Ho-Oh', description: 'Tin Tower summit encounter', offset: 1247, category: 'Legendary', version: 'all' },
    { id: 'lugia', name: 'Lugia', description: 'Whirl Islands encounter', offset: 1246, category: 'Legendary', version: 'all' },
    { id: 'suicune', name: 'Suicune', description: 'Tin Tower encounter (Crystal) / roaming', offset: 1254, category: 'Legendary', version: 'all' },
    { id: 'raikou', name: 'Raikou', description: 'Roaming Johto encounter', offset: 1252, category: 'Legendary', version: 'all' },
    { id: 'entei', name: 'Entei', description: 'Roaming Johto encounter', offset: 1253, category: 'Legendary', version: 'all' },
    { id: 'articuno_gsc', name: 'Articuno', description: 'Seafoam Islands encounter (Kanto)', offset: 1229, category: 'Legendary', version: 'all' },
    { id: 'zapdos_gsc', name: 'Zapdos', description: 'Power Plant encounter (Kanto)', offset: 1230, category: 'Legendary', version: 'all' },
    { id: 'moltres_gsc', name: 'Moltres', description: 'Mt. Silver encounter', offset: 1231, category: 'Legendary', version: 'all' },
    { id: 'mewtwo_gsc', name: 'Mewtwo', description: 'Cerulean Cave encounter (Kanto)', offset: 1228, category: 'Legendary', version: 'all' },
    { id: 'celebi', name: 'Celebi', description: 'Ilex Forest Shrine encounter (GS Ball event)', offset: 1248, category: 'Legendary', version: 'crystal' },

    // ── Gift Pokemon ──
    { id: 'starter_chikorita', name: 'Chikorita Ball', description: 'Professor Elm starter Pokemon ball', offset: 204, category: 'Gift', version: 'all' },
    { id: 'starter_cyndaquil', name: 'Cyndaquil Ball', description: 'Professor Elm starter Pokemon ball', offset: 205, category: 'Gift', version: 'all' },
    { id: 'starter_totodile', name: 'Totodile Ball', description: 'Professor Elm starter Pokemon ball', offset: 206, category: 'Gift', version: 'all' },
    { id: 'togepi_egg', name: 'Togepi Egg', description: "Mr. Pokemon's Togepi egg gift", offset: 634, category: 'Gift', version: 'all' },
    { id: 'eevee_gsc', name: 'Eevee Gift', description: 'Goldenrod City Bill gift', offset: 216, category: 'Gift', version: 'all' },
    { id: 'dratini_gsc', name: 'Dratini Gift', description: 'Dragon Den Elder gift (2000 coins)', offset: 1263, category: 'Gift', version: 'all' },
    { id: 'tyrogue_gsc', name: 'Tyrogue Gift', description: 'Mt. Mortar Karate King gift', offset: 1265, category: 'Gift', version: 'all' },
    { id: 'shuckle_gsc', name: 'Shuckle Gift', description: 'Cianwood City man temporary gift', offset: 356, category: 'Gift', version: 'all' },
    { id: 'bulbasaur_gsc', name: 'Bulbasaur Gift', description: 'Pallet Town gift from nurse', offset: 1264, category: 'Gift', version: 'all' },
    { id: 'squirtle_gsc', name: 'Squirtle Gift', description: 'Saffron City gift from officer', offset: 1266, category: 'Gift', version: 'all' },
    { id: 'charmander_gsc', name: 'Charmander Gift', description: 'Route 25 gift from trainer', offset: 1267, category: 'Gift', version: 'all' },

    // ── Interactions (Blockers, Stationary Battles) ──
    { id: 'snorlax_gsc_1', name: 'Snorlax (Route 12)', description: 'Kanto Route 12 blocker', offset: 365, category: 'Interaction', version: 'all' },
    { id: 'snorlax_gsc_2', name: 'Snorlax (Route 11)', description: 'Kanto Route 11 blocker', offset: 366, category: 'Interaction', version: 'all' },
    { id: 'red_gyarados', name: 'Red Gyarados', description: 'Lake of Rage shiny encounter', offset: 342, category: 'Interaction', version: 'all' },
    { id: 'sudowoodo', name: 'Sudowoodo', description: 'Route 36 tree encounter', offset: 341, category: 'Interaction', version: 'all' },

    // ── Story Progression ──
    { id: 'got_pokedex', name: 'Got Pokedex', description: 'Received Pokedex from Professor Oak', offset: 74, category: 'Story', version: 'all' },
    { id: 'beat_falkner', name: 'Beat Falkner', description: 'Defeated Violet City Gym Leader', offset: 384, category: 'Story', version: 'all' },
    { id: 'beat_bugsy', name: 'Beat Bugsy', description: 'Defeated Azalea Town Gym Leader', offset: 385, category: 'Story', version: 'all' },
    { id: 'beat_whitney', name: 'Beat Whitney', description: 'Defeated Goldenrod City Gym Leader', offset: 386, category: 'Story', version: 'all' },
    { id: 'beat_morty', name: 'Beat Morty', description: 'Defeated Ecruteak City Gym Leader', offset: 387, category: 'Story', version: 'all' },
    { id: 'beat_chuck', name: 'Beat Chuck', description: 'Defeated Cianwood City Gym Leader', offset: 388, category: 'Story', version: 'all' },
    { id: 'beat_jasmine', name: 'Beat Jasmine', description: 'Defeated Olivine City Gym Leader', offset: 389, category: 'Story', version: 'all' },
    { id: 'beat_pryce', name: 'Beat Pryce', description: 'Defeated Mahogany Town Gym Leader', offset: 390, category: 'Story', version: 'all' },
    { id: 'beat_clair', name: 'Beat Clair', description: 'Defeated Blackthorn City Gym Leader', offset: 391, category: 'Story', version: 'all' },
    { id: 'beat_brock_gsc', name: 'Beat Brock (Kanto)', description: 'Defeated Pewter City Gym Leader', offset: 392, category: 'Story', version: 'all' },
    { id: 'beat_misty_gsc', name: 'Beat Misty (Kanto)', description: 'Defeated Cerulean City Gym Leader', offset: 393, category: 'Story', version: 'all' },
    { id: 'beat_lt_surge_gsc', name: 'Beat Lt. Surge (Kanto)', description: 'Defeated Vermilion City Gym Leader', offset: 394, category: 'Story', version: 'all' },
    { id: 'beat_erika_gsc', name: 'Beat Erika (Kanto)', description: 'Defeated Celadon City Gym Leader', offset: 395, category: 'Story', version: 'all' },
    { id: 'beat_sabrina_gsc', name: 'Beat Sabrina (Kanto)', description: 'Defeated Saffron City Gym Leader', offset: 396, category: 'Story', version: 'all' },
    { id: 'beat_janine_gsc', name: 'Beat Janine (Kanto)', description: 'Defeated Fuchsia City Gym Leader', offset: 397, category: 'Story', version: 'all' },
    { id: 'beat_blaine_gsc', name: 'Beat Blaine (Kanto)', description: 'Defeated Seafoam Islands Gym Leader', offset: 398, category: 'Story', version: 'all' },
    { id: 'beat_blue_gsc', name: 'Beat Blue (Kanto)', description: 'Defeated Viridian City Gym Leader', offset: 399, category: 'Story', version: 'all' },
    { id: 'beat_elite_four', name: 'Beat Elite Four', description: 'Defeated the Elite Four + Champion', offset: 432, category: 'Story', version: 'all' },
    { id: 'beat_red', name: 'Beat Red', description: 'Defeated Red at Mt. Silver', offset: 1054, category: 'Story', version: 'all' },
    { id: 'got_hm01_cut', name: 'Got HM01 Cut', description: 'Received Cut from S.S. Aqua captain', offset: 192, category: 'Story', version: 'all' },
    { id: 'got_hm02_fly', name: 'Got HM02 Fly', description: 'Received Fly from Cianwood woman', offset: 193, category: 'Story', version: 'all' },
    { id: 'got_hm03_surf', name: 'Got HM03 Surf', description: 'Received Surf from Ecruteak Dance Theater', offset: 194, category: 'Story', version: 'all' },
    { id: 'got_hm04_strength', name: 'Got HM04 Strength', description: 'Received Strength from Hiker on Route 42', offset: 195, category: 'Story', version: 'all' },
    { id: 'got_hm05_flash', name: 'Got HM05 Flash', description: 'Received Flash from Sprout Tower Elder', offset: 196, category: 'Story', version: 'all' },
    { id: 'got_hm06_whirlpool', name: 'Got HM06 Whirlpool', description: 'Received Whirlpool from Lance', offset: 197, category: 'Story', version: 'all' },
    { id: 'got_hm07_waterfall', name: 'Got HM07 Waterfall', description: 'Received Waterfall in Ice Path', offset: 198, category: 'Story', version: 'all' },

    // ── Crystal-Specific Events ──
    { id: 'gs_ball_available', name: 'GS Ball Available', description: 'GS Ball can be picked up at Goldenrod PC', offset: 1258, category: 'Gift', version: 'crystal' },
    { id: 'moved_machoke', name: 'Moved Machoke', description: 'Helped the Machoke moving crew in Vermilion', offset: 664, category: 'Interaction', version: 'crystal' },
];
