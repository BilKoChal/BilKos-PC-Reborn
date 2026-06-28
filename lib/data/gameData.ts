
// Phase 0.2b: Removed `Fairy` (Gen 6+) and `'???'` (curse type, Gen 4 only) —
// neither is reachable from Gen 1/2. Re-add per-generation in Phase 4+.
export const TYPE_COLORS: Record<string, string> = {
    Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C',
    Grass: '#7AC74C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1',
    Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
    Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Dark: '#705746',
    Steel: '#B7B7CE'
};

export interface Badge {
    name: string;
    region: string;
}

// Phase 0.2a: Removed Gen 3/4/5 entries — only Gen 1/2 are reachable from the
// current adapter set. Re-add per-generation in Phase 2+ (Gen 3), Phase 3+
// (Gen 4/5), etc., each living in its own `genN/data/badges.ts`.
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
};
