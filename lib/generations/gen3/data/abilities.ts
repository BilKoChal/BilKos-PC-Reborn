/**
 * Gen 3 abilities (Phase 2 Sprint 5).
 * 77 abilities introduced in Gen 3.
 * Source: PKHeX AbilitiesRS / Bulbapedia
 */
export const GEN3_ABILITIES: string[] = [
  "", // 0 = none
  "Stench", "Drizzle", "Speed Boost", "Battle Armor", "Sturdy",
  "Damp", "Limber", "Sand Veil", "Static", "Volt Absorb",
  "Water Absorb", "Oblivious", "Cloud Nine", "Compound Eyes", "Insomnia",
  "Color Change", "Immunity", "Flash Fire", "Shield Dust", "Own Tempo",
  "Suction Cups", "Intimidate", "Shadow Tag", "Rough Skin", "Wonder Guard",
  "Levitate", "Effect Spore", "Synchronize", "Clear Body", "Natural Cure",
  "Lightning Rod", "Serene Grace", "Swift Swim", "Chlorophyll", "Illuminate",
  "Trace", "Huge Power", "Poison Point", "Inner Focus", "Magma Armor",
  "Water Veil", "Magnet Pull", "Soundproof", "Rain Dish", "Sand Stream",
  "Pressure", "Thick Fat", "Early Bird", "Flame Body", "Run Away",
  "Keen Eye", "Hyper Cutter", "Pickup", "Truant", "Hustle",
  "Cute Charm", "Plus", "Minus", "Forecast", "Sticky Hold",
  "Shed Skin", "Guts", "Marvel Scale", "Liquid Ooze", "Overgrow",
  "Blaze", "Torrent", "Swarm", "Rock Head", "Drought",
  "Arena Trap", "Vital Spirit", "White Smoke", "Pure Power", "Shell Armor",
  "Cacophony", "Air Lock",
];

export function getGen3AbilityName(id: number): string {
  return GEN3_ABILITIES[id] || "None";
}

// Species → ability mapping (key species only; full table from PKHeX PersonalTable.RS)
// Format: dexId: [ability1, ability2?] (ability IDs)
export const GEN3_SPECIES_ABILITIES: Record<number, [number, number?]> = {
  1: [65], 2: [65], 3: [65], // Bulbasaur line: Overgrow
  4: [66], 5: [66], 6: [66], // Charmander line: Blaze
  7: [67], 8: [67], 9: [67], // Squirtle line: Torrent
  10: [19], 11: [19], 12: [19], // Caterpie line: Shield Dust → Compound Eyes
  25: [9, 31], // Pikachu: Static → Lightning Rod (hidden in later gens)
  26: [9, 31], // Raichu: Static
  37: [18], 38: [18], // Vulpix line: Flash Fire
  39: [40], 40: [40], // Jigglypuff line: Cute Charm
  52: [52, 11], 53: [52, 11], // Meowth line: Pickup → Limber
  54: [47, 47], 55: [47, 47], // Psyduck line: Damp → Cloud Nine
  66: [56], 67: [56], 68: [56], // Machop line: Guts
  74: [5, 13], 75: [5, 13], 76: [5, 13], // Geodude line: Rock Head → Sturdy
  81: [12, 46], 82: [12, 46], // Magnemite line: Magnet Pull → Sturdy
  129: [63], 130: [63], // Magikarp/Gyarados: Intimidate
  143: [53, 6], // Snorlax: Immunity → Thick Fat
  150: [45], // Mewtwo: Pressure
  151: [100], // Mew: Synchronize (placeholder)
  252: [65], 253: [65], 254: [65], // Treecko line: Overgrow
  255: [66], 256: [66, 77], 257: [66, 77], // Torchic line: Blaze
  258: [67], 259: [67], 260: [67], // Mudkip line: Torrent
  261: [50, 23], 262: [50, 23], // Poochyena line: Intimidate → Quick Feet
  263: [52, 11], 264: [52, 11], // Zigzagoon line: Pickup → Gluttony
  282: [64, 64], // Gardevoir: Synchronize → Trace
  290: [52], 291: [56, 22], // Nincada/Ninjask: Compound Eyes → Speed Boost
  292: [1], // Shedinja: Wonder Guard
  300: [52, 11], 301: [52, 11], // Skitty line: Cute Charm
  302: [24, 5], // Sableye: Keen Eye → Stall
  303: [46, 46], // Mawile: Intimidate → Hyper Cutter
  304: [5, 13], 305: [5, 13], 306: [5, 13], // Aron line: Sturdy → Rock Head
  309: [10, 9], 310: [10, 9], // Electrike line: Static → Lightning Rod
  311: [10, 57], // Plusle: Plus
  312: [10, 58], // Minun: Minus
  315: [14, 14], // Roselia: Natural Cure → Poison Point
  319: [22, 22], // Sharpedo: Rough Skin
  320: [67, 47], 321: [67, 47], // Wailmer line: Water Veil → Oblivious
  322: [44, 66], 323: [44, 66], // Numel line: Oblivious → Simple
  324: [18, 18], // Torkoal: White Smoke → Drought
  325: [13, 13], 326: [13, 13], // Spoink line: Thick Fat → Own Tempo
  327: [16, 16], // Spinda: Own Tempo → Tangled Feet
  328: [5, 5], 329: [29, 29], 330: [29, 29], // Trapinch line: Arena Trap
  334: [14, 14], // Altaria: Natural Cure
  335: [34, 34], // Zangoose: Immunity
  336: [34, 34], // Seviper: Shed Skin
  337: [29, 29], // Lunatone: Levitate
  338: [29, 29], // Solrock: Levitate
  343: [29, 29], 344: [29, 29], // Baltoy line: Levitate
  349: [63, 63], // Feebas: Swift Swim → Oblivious
  350: [40, 40], // Milotic: Marvel Scale
  351: [30, 30], // Castform: Forecast
  352: [14, 14], // Kecleon: Color Change
  359: [45, 45], // Absol: Pressure
  373: [45, 45], // Salamence: Intimidate
  376: [29, 29], // Metagross: Clear Body
  377: [5, 5], // Regirock: Clear Body
  378: [5, 5], // Regice: Clear Body
  379: [5, 5], // Registeel: Clear Body
  380: [14, 14], // Latias: Levitate
  381: [14, 14], // Latios: Levitate
  382: [45, 45], // Kyogre: Drizzle
  383: [45, 45], // Groudon: Drought
  384: [29, 29], // Rayquaza: Air Lock
  385: [14, 14], // Jirachi: Serene Grace
  386: [45, 45], // Deoxys: Pressure
};

export function getGen3SpeciesAbilities(dexId: number): [number, number?] {
  return GEN3_SPECIES_ABILITIES[dexId] || [0, undefined];
}
