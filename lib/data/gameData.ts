
export const TYPE_COLORS: Record<string, string> = {
    Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C',
    Grass: '#7AC74C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1',
    Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
    Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Dark: '#705746',
    Steel: '#B7B7CE', Fairy: '#D685AD', '???': '#68A090'
};

export interface Badge {
    name: string;
    region: string;
}

export const REGION_BADGES: Record<number, Badge[]> = {
    1: [
        { name: 'Boulder', region: 'Kanto' }, { name: 'Cascade', region: 'Kanto' },
        { name: 'Thunder', region: 'Kanto' }, { name: 'Rainbow', region: 'Kanto' },
        { name: 'Soul', region: 'Kanto' }, { name: 'Marsh', region: 'Kanto' },
        { name: 'Volcano', region: 'Kanto' }, { name: 'Earth', region: 'Kanto' }
    ],
    2: [
        // Johto
        { name: 'Zephyr', region: 'Johto' }, { name: 'Hive', region: 'Johto' },
        { name: 'Plain', region: 'Johto' }, { name: 'Fog', region: 'Johto' },
        { name: 'Storm', region: 'Johto' }, { name: 'Mineral', region: 'Johto' },
        { name: 'Glacier', region: 'Johto' }, { name: 'Rising', region: 'Johto' },
        // Kanto
        { name: 'Boulder', region: 'Kanto' }, { name: 'Cascade', region: 'Kanto' },
        { name: 'Thunder', region: 'Kanto' }, { name: 'Rainbow', region: 'Kanto' },
        { name: 'Soul', region: 'Kanto' }, { name: 'Marsh', region: 'Kanto' },
        { name: 'Volcano', region: 'Kanto' }, { name: 'Earth', region: 'Kanto' }
    ],
    3: [
        { name: 'Stone', region: 'Hoenn' }, { name: 'Knuckle', region: 'Hoenn' },
        { name: 'Dynamo', region: 'Hoenn' }, { name: 'Heat', region: 'Hoenn' },
        { name: 'Balance', region: 'Hoenn' }, { name: 'Feather', region: 'Hoenn' },
        { name: 'Mind', region: 'Hoenn' }, { name: 'Rain', region: 'Hoenn' }
    ],
    4: [
        // Sinnoh (for DP/Pt)
        { name: 'Coal', region: 'Sinnoh' }, { name: 'Forest', region: 'Sinnoh' },
        { name: 'Cobble', region: 'Sinnoh' }, { name: 'Fen', region: 'Sinnoh' },
        { name: 'Relic', region: 'Sinnoh' }, { name: 'Mine', region: 'Sinnoh' },
        { name: 'Icicle', region: 'Sinnoh' }, { name: 'Beacon', region: 'Sinnoh' }
    ],
    5: [
        { name: 'Trio', region: 'Unova' }, { name: 'Basic', region: 'Unova' },
        { name: 'Insect', region: 'Unova' }, { name: 'Bolt', region: 'Unova' },
        { name: 'Quake', region: 'Unova' }, { name: 'Jet', region: 'Unova' },
        { name: 'Freeze', region: 'Unova' }, { name: 'Legend', region: 'Unova' }
    ]
};

export const GEN1_EXCLUSIVES = {
  RED: [23, 24, 43, 44, 45, 56, 57, 58, 59, 123, 125, 126], // Ekans, Oddish, Mankey, Growlithe, Scyther, Electabuzz lines
  BLUE: [27, 28, 37, 38, 52, 53, 69, 70, 71, 127, 124, 136] // Sandshrew, Vulpix, Meowth, Bellsprout, Pinsir, Magmar lines
};
