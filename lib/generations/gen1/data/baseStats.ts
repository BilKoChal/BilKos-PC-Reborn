
// Gen 1 Base Stats (HP, Atk, Def, Spe, Spc)
// Used to calculate stats for Box Pokemon which don't store them in the save file.

export const GEN1_BASE_STATS: Record<number, { hp: number; attack: number; defense: number; speed: number; spAtk: number; spDef: number }> = {
    1: { hp: 45, attack: 49, defense: 49, speed: 45, spAtk: 65, spDef: 65 }, // Bulbasaur
    2: { hp: 60, attack: 62, defense: 63, speed: 60, spAtk: 80, spDef: 80 }, // Ivysaur
    3: { hp: 80, attack: 82, defense: 83, speed: 80, spAtk: 100, spDef: 100 }, // Venusaur
    4: { hp: 39, attack: 52, defense: 43, speed: 65, spAtk: 50, spDef: 50 }, // Charmander
    5: { hp: 58, attack: 64, defense: 58, speed: 80, spAtk: 65, spDef: 65 }, // Charmeleon
    6: { hp: 78, attack: 84, defense: 78, speed: 100, spAtk: 85, spDef: 85 }, // Charizard
    7: { hp: 44, attack: 48, defense: 65, speed: 43, spAtk: 50, spDef: 50 }, // Squirtle
    8: { hp: 59, attack: 63, defense: 80, speed: 58, spAtk: 65, spDef: 65 }, // Wartortle
    9: { hp: 79, attack: 83, defense: 100, speed: 78, spAtk: 85, spDef: 85 }, // Blastoise
    10: { hp: 45, attack: 30, defense: 35, speed: 45, spAtk: 20, spDef: 20 }, // Caterpie
    11: { hp: 50, attack: 20, defense: 55, speed: 30, spAtk: 25, spDef: 25 }, // Metapod
    12: { hp: 60, attack: 45, defense: 50, speed: 70, spAtk: 80, spDef: 80 }, // Butterfree
    13: { hp: 40, attack: 35, defense: 30, speed: 50, spAtk: 20, spDef: 20 }, // Weedle
    14: { hp: 45, attack: 25, defense: 50, speed: 35, spAtk: 25, spDef: 25 }, // Kakuna
    15: { hp: 65, attack: 80, defense: 40, speed: 75, spAtk: 45, spDef: 45 }, // Beedrill
    16: { hp: 40, attack: 45, defense: 40, speed: 56, spAtk: 35, spDef: 35 }, // Pidgey
    17: { hp: 63, attack: 60, defense: 55, speed: 71, spAtk: 50, spDef: 50 }, // Pidgeotto
    18: { hp: 83, attack: 80, defense: 75, speed: 91, spAtk: 70, spDef: 70 }, // Pidgeot
    19: { hp: 30, attack: 56, defense: 35, speed: 72, spAtk: 25, spDef: 25 }, // Rattata
    20: { hp: 55, attack: 81, defense: 60, speed: 97, spAtk: 50, spDef: 50 }, // Raticate
    21: { hp: 40, attack: 60, defense: 30, speed: 70, spAtk: 31, spDef: 31 }, // Spearow
    22: { hp: 65, attack: 90, defense: 65, speed: 100, spAtk: 61, spDef: 61 }, // Fearow
    23: { hp: 35, attack: 60, defense: 44, speed: 55, spAtk: 40, spDef: 40 }, // Ekans
    24: { hp: 60, attack: 85, defense: 69, speed: 80, spAtk: 65, spDef: 65 }, // Arbok
    25: { hp: 35, attack: 55, defense: 30, speed: 90, spAtk: 50, spDef: 50 }, // Pikachu
    26: { hp: 60, attack: 90, defense: 55, speed: 100, spAtk: 90, spDef: 90 }, // Raichu
    27: { hp: 50, attack: 75, defense: 85, speed: 40, spAtk: 30, spDef: 30 }, // Sandshrew
    28: { hp: 75, attack: 100, defense: 110, speed: 65, spAtk: 55, spDef: 55 }, // Sandslash
    29: { hp: 55, attack: 47, defense: 52, speed: 41, spAtk: 40, spDef: 40 }, // NidoranF
    30: { hp: 70, attack: 62, defense: 67, speed: 56, spAtk: 55, spDef: 55 }, // Nidorina
    31: { hp: 90, attack: 82, defense: 87, speed: 76, spAtk: 75, spDef: 75 }, // Nidoqueen
    32: { hp: 46, attack: 57, defense: 40, speed: 50, spAtk: 40, spDef: 40 }, // NidoranM
    33: { hp: 61, attack: 72, defense: 57, speed: 65, spAtk: 55, spDef: 55 }, // Nidorino
    34: { hp: 81, attack: 92, defense: 77, speed: 85, spAtk: 75, spDef: 75 }, // Nidoking
    35: { hp: 70, attack: 45, defense: 48, speed: 35, spAtk: 60, spDef: 60 }, // Clefairy
    36: { hp: 95, attack: 70, defense: 73, speed: 60, spAtk: 85, spDef: 85 }, // Clefable
    37: { hp: 38, attack: 41, defense: 40, speed: 65, spAtk: 65, spDef: 65 }, // Vulpix
    38: { hp: 73, attack: 76, defense: 75, speed: 100, spAtk: 100, spDef: 100 }, // Ninetales
    39: { hp: 115, attack: 45, defense: 20, speed: 20, spAtk: 25, spDef: 25 }, // Jigglypuff
    40: { hp: 140, attack: 70, defense: 45, speed: 45, spAtk: 50, spDef: 50 }, // Wigglytuff
    41: { hp: 40, attack: 45, defense: 35, speed: 55, spAtk: 40, spDef: 40 }, // Zubat
    42: { hp: 75, attack: 80, defense: 70, speed: 90, spAtk: 75, spDef: 75 }, // Golbat
    43: { hp: 45, attack: 50, defense: 55, speed: 30, spAtk: 75, spDef: 75 }, // Oddish
    44: { hp: 60, attack: 65, defense: 70, speed: 40, spAtk: 85, spDef: 85 }, // Gloom
    45: { hp: 75, attack: 80, defense: 85, speed: 50, spAtk: 100, spDef: 100 }, // Vileplume
    46: { hp: 35, attack: 70, defense: 55, speed: 25, spAtk: 55, spDef: 55 }, // Paras
    47: { hp: 60, attack: 95, defense: 80, speed: 30, spAtk: 80, spDef: 80 }, // Parasect
    48: { hp: 60, attack: 55, defense: 50, speed: 45, spAtk: 40, spDef: 40 }, // Venonat
    49: { hp: 70, attack: 65, defense: 60, speed: 90, spAtk: 90, spDef: 90 }, // Venomoth
    50: { hp: 10, attack: 55, defense: 25, speed: 95, spAtk: 45, spDef: 45 }, // Diglett
    51: { hp: 35, attack: 80, defense: 50, speed: 120, spAtk: 70, spDef: 70 }, // Dugtrio
    52: { hp: 40, attack: 45, defense: 35, speed: 90, spAtk: 40, spDef: 40 }, // Meowth
    53: { hp: 65, attack: 70, defense: 60, speed: 115, spAtk: 65, spDef: 65 }, // Persian
    54: { hp: 50, attack: 52, defense: 48, speed: 55, spAtk: 50, spDef: 50 }, // Psyduck
    55: { hp: 80, attack: 82, defense: 78, speed: 85, spAtk: 80, spDef: 80 }, // Golduck
    56: { hp: 40, attack: 80, defense: 35, speed: 70, spAtk: 35, spDef: 35 }, // Mankey
    57: { hp: 65, attack: 105, defense: 60, speed: 95, spAtk: 60, spDef: 60 }, // Primeape
    58: { hp: 55, attack: 70, defense: 45, speed: 60, spAtk: 50, spDef: 50 }, // Growlithe
    59: { hp: 90, attack: 110, defense: 80, speed: 95, spAtk: 80, spDef: 80 }, // Arcanine
    60: { hp: 40, attack: 50, defense: 40, speed: 90, spAtk: 40, spDef: 40 }, // Poliwag
    61: { hp: 65, attack: 65, defense: 65, speed: 90, spAtk: 50, spDef: 50 }, // Poliwhirl
    62: { hp: 90, attack: 85, defense: 95, speed: 70, spAtk: 70, spDef: 70 }, // Poliwrath
    63: { hp: 25, attack: 20, defense: 15, speed: 90, spAtk: 105, spDef: 105 }, // Abra
    64: { hp: 40, attack: 35, defense: 30, speed: 105, spAtk: 120, spDef: 120 }, // Kadabra
    65: { hp: 55, attack: 50, defense: 45, speed: 120, spAtk: 135, spDef: 135 }, // Alakazam
    66: { hp: 70, attack: 80, defense: 50, speed: 35, spAtk: 35, spDef: 35 }, // Machop
    67: { hp: 80, attack: 100, defense: 70, speed: 45, spAtk: 50, spDef: 50 }, // Machoke
    68: { hp: 90, attack: 130, defense: 80, speed: 55, spAtk: 65, spDef: 65 }, // Machamp
    69: { hp: 50, attack: 75, defense: 35, speed: 40, spAtk: 70, spDef: 70 }, // Bellsprout
    70: { hp: 65, attack: 90, defense: 50, speed: 55, spAtk: 85, spDef: 85 }, // Weepinbell
    71: { hp: 80, attack: 105, defense: 65, speed: 70, spAtk: 100, spDef: 100 }, // Victreebel
    72: { hp: 40, attack: 40, defense: 35, speed: 70, spAtk: 100, spDef: 100 }, // Tentacool
    73: { hp: 80, attack: 70, defense: 65, speed: 100, spAtk: 120, spDef: 120 }, // Tentacruel
    74: { hp: 40, attack: 80, defense: 100, speed: 20, spAtk: 30, spDef: 30 }, // Geodude
    75: { hp: 55, attack: 95, defense: 115, speed: 35, spAtk: 45, spDef: 45 }, // Graveler
    76: { hp: 80, attack: 110, defense: 130, speed: 45, spAtk: 55, spDef: 55 }, // Golem
    77: { hp: 50, attack: 85, defense: 55, speed: 90, spAtk: 65, spDef: 65 }, // Ponyta
    78: { hp: 65, attack: 100, defense: 70, speed: 105, spAtk: 80, spDef: 80 }, // Rapidash
    79: { hp: 90, attack: 65, defense: 65, speed: 15, spAtk: 40, spDef: 40 }, // Slowpoke
    80: { hp: 95, attack: 75, defense: 110, speed: 30, spAtk: 80, spDef: 80 }, // Slowbro
    81: { hp: 25, attack: 35, defense: 70, speed: 45, spAtk: 95, spDef: 95 }, // Magnemite
    82: { hp: 50, attack: 60, defense: 95, speed: 70, spAtk: 120, spDef: 120 }, // Magneton
    83: { hp: 52, attack: 65, defense: 55, speed: 60, spAtk: 58, spDef: 58 }, // Farfetch'd
    84: { hp: 35, attack: 85, defense: 45, speed: 75, spAtk: 35, spDef: 35 }, // Doduo
    85: { hp: 60, attack: 110, defense: 70, speed: 100, spAtk: 60, spDef: 60 }, // Dodrio
    86: { hp: 65, attack: 45, defense: 55, speed: 45, spAtk: 70, spDef: 70 }, // Seel
    87: { hp: 90, attack: 70, defense: 80, speed: 70, spAtk: 95, spDef: 95 }, // Dewgong
    88: { hp: 80, attack: 80, defense: 50, speed: 25, spAtk: 40, spDef: 40 }, // Grimer
    89: { hp: 105, attack: 105, defense: 75, speed: 50, spAtk: 65, spDef: 65 }, // Muk
    90: { hp: 30, attack: 65, defense: 100, speed: 40, spAtk: 45, spDef: 45 }, // Shellder
    91: { hp: 50, attack: 95, defense: 180, speed: 70, spAtk: 85, spDef: 85 }, // Cloyster
    92: { hp: 30, attack: 35, defense: 30, speed: 80, spAtk: 100, spDef: 100 }, // Gastly
    93: { hp: 45, attack: 50, defense: 45, speed: 95, spAtk: 115, spDef: 115 }, // Haunter
    94: { hp: 60, attack: 65, defense: 60, speed: 110, spAtk: 130, spDef: 130 }, // Gengar
    95: { hp: 35, attack: 45, defense: 160, speed: 70, spAtk: 30, spDef: 30 }, // Onix
    96: { hp: 60, attack: 48, defense: 45, speed: 42, spAtk: 90, spDef: 90 }, // Drowzee
    97: { hp: 85, attack: 73, defense: 70, speed: 67, spAtk: 115, spDef: 115 }, // Hypno
    98: { hp: 30, attack: 105, defense: 90, speed: 50, spAtk: 25, spDef: 25 }, // Krabby
    99: { hp: 55, attack: 130, defense: 115, speed: 75, spAtk: 50, spDef: 50 }, // Kingler
    100: { hp: 40, attack: 30, defense: 50, speed: 100, spAtk: 55, spDef: 55 }, // Voltorb
    101: { hp: 60, attack: 50, defense: 70, speed: 140, spAtk: 80, spDef: 80 }, // Electrode
    102: { hp: 60, attack: 40, defense: 80, speed: 40, spAtk: 60, spDef: 60 }, // Exeggcute
    103: { hp: 95, attack: 95, defense: 85, speed: 55, spAtk: 125, spDef: 125 }, // Exeggutor
    104: { hp: 50, attack: 50, defense: 95, speed: 35, spAtk: 40, spDef: 40 }, // Cubone
    105: { hp: 60, attack: 80, defense: 110, speed: 45, spAtk: 50, spDef: 50 }, // Marowak
    106: { hp: 50, attack: 120, defense: 53, speed: 87, spAtk: 35, spDef: 35 }, // Hitmonlee
    107: { hp: 50, attack: 105, defense: 79, speed: 76, spAtk: 35, spDef: 35 }, // Hitmonchan
    108: { hp: 90, attack: 55, defense: 75, speed: 30, spAtk: 60, spDef: 60 }, // Lickitung
    109: { hp: 40, attack: 65, defense: 95, speed: 35, spAtk: 60, spDef: 60 }, // Koffing
    110: { hp: 65, attack: 90, defense: 120, speed: 60, spAtk: 85, spDef: 85 }, // Weezing
    111: { hp: 80, attack: 85, defense: 95, speed: 25, spAtk: 30, spDef: 30 }, // Rhyhorn
    112: { hp: 105, attack: 130, defense: 120, speed: 40, spAtk: 45, spDef: 45 }, // Rhydon
    113: { hp: 250, attack: 5, defense: 5, speed: 50, spAtk: 105, spDef: 105 }, // Chansey
    114: { hp: 65, attack: 55, defense: 115, speed: 60, spAtk: 100, spDef: 100 }, // Tangela
    115: { hp: 105, attack: 95, defense: 80, speed: 90, spAtk: 40, spDef: 40 }, // Kangaskhan
    116: { hp: 30, attack: 40, defense: 70, speed: 60, spAtk: 70, spDef: 70 }, // Horsea
    117: { hp: 55, attack: 65, defense: 95, speed: 85, spAtk: 95, spDef: 95 }, // Seadra
    118: { hp: 45, attack: 67, defense: 60, speed: 63, spAtk: 50, spDef: 50 }, // Goldeen
    119: { hp: 80, attack: 92, defense: 65, speed: 68, spAtk: 80, spDef: 80 }, // Seaking
    120: { hp: 30, attack: 45, defense: 55, speed: 85, spAtk: 70, spDef: 70 }, // Staryu
    121: { hp: 60, attack: 75, defense: 85, speed: 115, spAtk: 100, spDef: 100 }, // Starmie
    122: { hp: 40, attack: 45, defense: 65, speed: 90, spAtk: 100, spDef: 100 }, // Mr. Mime
    123: { hp: 70, attack: 110, defense: 80, speed: 105, spAtk: 55, spDef: 55 }, // Scyther
    124: { hp: 65, attack: 50, defense: 35, speed: 95, spAtk: 95, spDef: 95 }, // Jynx
    125: { hp: 65, attack: 83, defense: 57, speed: 105, spAtk: 85, spDef: 85 }, // Electabuzz
    126: { hp: 65, attack: 95, defense: 57, speed: 93, spAtk: 85, spDef: 85 }, // Magmar
    127: { hp: 65, attack: 125, defense: 100, speed: 85, spAtk: 55, spDef: 55 }, // Pinsir
    128: { hp: 75, attack: 100, defense: 95, speed: 110, spAtk: 70, spDef: 70 }, // Tauros
    129: { hp: 20, attack: 10, defense: 55, speed: 80, spAtk: 20, spDef: 20 }, // Magikarp
    130: { hp: 95, attack: 125, defense: 79, speed: 81, spAtk: 100, spDef: 100 }, // Gyarados
    131: { hp: 130, attack: 85, defense: 80, speed: 60, spAtk: 95, spDef: 95 }, // Lapras
    132: { hp: 48, attack: 48, defense: 48, speed: 48, spAtk: 48, spDef: 48 }, // Ditto
    133: { hp: 55, attack: 55, defense: 50, speed: 55, spAtk: 65, spDef: 65 }, // Eevee
    134: { hp: 130, attack: 65, defense: 60, speed: 65, spAtk: 110, spDef: 110 }, // Vaporeon
    135: { hp: 65, attack: 65, defense: 60, speed: 130, spAtk: 110, spDef: 110 }, // Jolteon
    136: { hp: 65, attack: 130, defense: 60, speed: 65, spAtk: 110, spDef: 110 }, // Flareon
    137: { hp: 65, attack: 60, defense: 70, speed: 40, spAtk: 75, spDef: 75 }, // Porygon
    138: { hp: 35, attack: 40, defense: 100, speed: 35, spAtk: 90, spDef: 90 }, // Omanyte
    139: { hp: 70, attack: 60, defense: 125, speed: 55, spAtk: 115, spDef: 115 }, // Omastar
    140: { hp: 30, attack: 80, defense: 90, speed: 55, spAtk: 45, spDef: 45 }, // Kabuto
    141: { hp: 60, attack: 115, defense: 105, speed: 80, spAtk: 70, spDef: 70 }, // Kabutops
    142: { hp: 80, attack: 105, defense: 65, speed: 130, spAtk: 60, spDef: 60 }, // Aerodactyl
    143: { hp: 160, attack: 110, defense: 65, speed: 30, spAtk: 65, spDef: 65 }, // Snorlax
    144: { hp: 90, attack: 85, defense: 100, speed: 85, spAtk: 125, spDef: 125 }, // Articuno
    145: { hp: 90, attack: 90, defense: 85, speed: 100, spAtk: 125, spDef: 125 }, // Zapdos
    146: { hp: 90, attack: 100, defense: 90, speed: 90, spAtk: 125, spDef: 125 }, // Moltres
    147: { hp: 41, attack: 64, defense: 45, speed: 50, spAtk: 50, spDef: 50 }, // Dratini
    148: { hp: 61, attack: 84, defense: 65, speed: 70, spAtk: 70, spDef: 70 }, // Dragonair
    149: { hp: 91, attack: 134, defense: 95, speed: 80, spAtk: 100, spDef: 100 }, // Dragonite
    150: { hp: 106, attack: 110, defense: 90, speed: 130, spAtk: 154, spDef: 154 }, // Mewtwo
    151: { hp: 100, attack: 100, defense: 100, speed: 100, spAtk: 100, spDef: 100 }, // Mew
};

// Gen 1 Catch Rates (0x07 in data structure)
// Used by PKHeX to validate legality.
export const GEN1_CATCH_RATES: Record<number, number> = {
    1: 45, 2: 45, 3: 45, 4: 45, 5: 45, 6: 45, 7: 45, 8: 45, 9: 45,
    10: 255, 11: 120, 12: 45, 13: 255, 14: 120, 15: 45, 16: 255, 17: 120, 18: 45,
    19: 255, 20: 90, 21: 255, 22: 90, 23: 255, 24: 90, 25: 190, 26: 75,
    27: 255, 28: 90, 29: 235, 30: 120, 31: 45, 32: 235, 33: 120, 34: 45,
    35: 150, 36: 25, 37: 190, 38: 75, 39: 170, 40: 50, 41: 255, 42: 90,
    43: 255, 44: 120, 45: 45, 46: 190, 47: 75, 48: 190, 49: 75, 50: 255,
    51: 50, 52: 255, 53: 60, 54: 190, 55: 75, 56: 190, 57: 75, 58: 190,
    59: 75, 60: 255, 61: 120, 62: 45, 63: 200, 64: 100, 65: 50, 66: 180,
    67: 90, 68: 45, 69: 255, 70: 120, 71: 45, 72: 190, 73: 60, 74: 255,
    75: 120, 76: 45, 77: 190, 78: 60, 79: 190, 80: 75, 81: 190, 82: 60,
    83: 45, 84: 190, 85: 45, 86: 190, 87: 75, 88: 190, 89: 75, 90: 190,
    91: 60, 92: 190, 93: 90, 94: 45, 95: 45, 96: 190, 97: 75, 98: 225,
    99: 60, 100: 190, 101: 60, 102: 90, 103: 45, 104: 190, 105: 75, 106: 45,
    107: 45, 108: 45, 109: 190, 110: 60, 111: 120, 112: 60, 113: 30, 114: 45,
    115: 45, 116: 190, 117: 75, 118: 225, 119: 60, 120: 225, 121: 60, 122: 45,
    123: 45, 124: 45, 125: 45, 126: 45, 127: 45, 128: 45, 129: 255, 130: 45,
    131: 45, 132: 35, 133: 45, 134: 45, 135: 45, 136: 45, 137: 45, 138: 45,
    139: 45, 140: 45, 141: 45, 142: 45, 143: 25, 144: 3, 145: 3, 146: 3,
    147: 45, 148: 45, 149: 45, 150: 3, 151: 45
};
