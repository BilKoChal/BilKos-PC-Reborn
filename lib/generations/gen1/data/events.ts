// Re-export the shared GameEventDefinition type for backward compatibility
export type { GameEventDefinition as GameEvent } from '../../../data/gameEvents';
import { type GameEventDefinition } from '../../../data/gameEvents';

export const GEN1_EVENTS: GameEventDefinition[] = [
    // Legendaries
    { id: 'articuno', name: 'Articuno', description: 'Seafoam Islands stationary battle', offset: 227, category: 'Legendary' },
    { id: 'zapdos', name: 'Zapdos', description: 'Power Plant stationary battle', offset: 85, category: 'Legendary' },
    { id: 'moltres', name: 'Moltres', description: 'Victory Road stationary battle', offset: 91, category: 'Legendary' },
    { id: 'mewtwo', name: 'Mewtwo', description: 'Cerulean Cave stationary battle', offset: 209, category: 'Legendary' },

    // Snorlaxes
    { id: 'snorlax_12', name: 'Snorlax (Route 12)', description: 'Silence Bridge blocker sprite', offset: 29, category: 'Interaction' },
    { id: 'snorlax_16', name: 'Snorlax (Route 16)', description: 'Cycling Road blocker sprite', offset: 33, category: 'Interaction' },

    // Power Plant Voltorbs & Electrodes
    { id: 'voltorb_1', name: 'Voltorb 1', description: 'Power Plant stationary fake item', offset: 77, category: 'Interaction' },
    { id: 'voltorb_2', name: 'Voltorb 2', description: 'Power Plant stationary fake item', offset: 78, category: 'Interaction' },
    { id: 'voltorb_3', name: 'Voltorb 3', description: 'Power Plant stationary fake item', offset: 79, category: 'Interaction' },
    { id: 'voltorb_4', name: 'Voltorb 4', description: 'Power Plant stationary fake item', offset: 81, category: 'Interaction' },
    { id: 'voltorb_5', name: 'Voltorb 5', description: 'Power Plant stationary fake item', offset: 82, category: 'Interaction' },
    { id: 'voltorb_6', name: 'Voltorb 6', description: 'Power Plant stationary fake item', offset: 84, category: 'Interaction' },
    { id: 'electrode_1', name: 'Electrode 1', description: 'Power Plant stationary fake item', offset: 80, category: 'Interaction' },
    { id: 'electrode_2', name: 'Electrode 2', description: 'Power Plant stationary fake item', offset: 83, category: 'Interaction' },

    // Gifts / Key Interactions
    { id: 'eevee', name: 'Eevee Gift Ball', description: 'Celadon Mansion Roof Room gift', offset: 69, category: 'Gift' },
    { id: 'dome_fossil', name: 'Dome Fossil', description: 'Mt. Moon stationary key item', offset: 109, category: 'Gift' },
    { id: 'helix_fossil', name: 'Helix Fossil', description: 'Mt. Moon stationary key item', offset: 110, category: 'Gift' },
    { id: 'old_amber', name: 'Old Amber Gift Ball', description: 'Pewter Museum of Science gift ball', offset: 52, category: 'Gift' },
    { id: 'hitmonlee', name: 'Hitmonlee Gift Ball', description: 'Fighting Dojo prize ball', offset: 74, category: 'Gift' },
    { id: 'hitmonchan', name: 'Hitmonchan Gift Ball', description: 'Fighting Dojo prize ball', offset: 75, category: 'Gift' },
    { id: 'starter_charmander', name: 'Charmander Poke Ball', description: 'Oak\'s Lab starter ball', offset: 43, category: 'Gift' },
    { id: 'starter_squirtle', name: 'Squirtle Poke Ball', description: 'Oak\'s Lab starter ball', offset: 44, category: 'Gift' },
    { id: 'starter_bulbasaur', name: 'Bulbasaur Poke Ball', description: 'Oak\'s Lab starter ball', offset: 45, category: 'Gift' },
];
