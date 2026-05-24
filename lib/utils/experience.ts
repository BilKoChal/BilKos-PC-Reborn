

// Experience Groups
export type GrowthRate = 'Erratic' | 'Fast' | 'MediumFast' | 'MediumSlow' | 'Slow' | 'Fluctuating';

// Mapping of Species ID to Growth Rate
// This covers Gen 1-3 families.
const SPECIES_GROWTH_RATE: Record<number, GrowthRate> = {
    // Gen 1
    1: 'MediumSlow', 2: 'MediumSlow', 3: 'MediumSlow', // Bulbasaur
    4: 'MediumSlow', 5: 'MediumSlow', 6: 'MediumSlow', // Charmander
    7: 'MediumSlow', 8: 'MediumSlow', 9: 'MediumSlow', // Squirtle
    10: 'MediumFast', 11: 'MediumFast', 12: 'MediumFast', // Caterpie
    13: 'MediumFast', 14: 'MediumFast', 15: 'MediumFast', // Weedle
    16: 'MediumSlow', 17: 'MediumSlow', 18: 'MediumSlow', // Pidgey
    19: 'MediumFast', 20: 'MediumFast', // Rattata
    21: 'MediumFast', 22: 'MediumFast', // Spearow
    23: 'MediumFast', 24: 'MediumFast', // Ekans
    25: 'MediumFast', 26: 'MediumFast', // Pikachu
    27: 'MediumFast', 28: 'MediumFast', // Sandshrew
    29: 'MediumSlow', 30: 'MediumSlow', 31: 'MediumSlow', // Nidoran F
    32: 'MediumSlow', 33: 'MediumSlow', 34: 'MediumSlow', // Nidoran M
    35: 'Fast', 36: 'Fast', // Clefairy
    37: 'MediumFast', 38: 'MediumFast', // Vulpix
    39: 'Fast', 40: 'Fast', // Jigglypuff
    41: 'MediumFast', 42: 'MediumFast', // Zubat
    43: 'MediumSlow', 44: 'MediumSlow', 45: 'MediumSlow', // Oddish
    46: 'MediumFast', 47: 'MediumFast', // Paras
    48: 'MediumFast', 49: 'MediumFast', // Venonat
    50: 'MediumFast', 51: 'MediumFast', // Diglett
    52: 'MediumFast', 53: 'MediumFast', // Meowth
    54: 'MediumFast', 55: 'MediumFast', // Psyduck
    56: 'MediumFast', 57: 'MediumFast', // Mankey
    58: 'Slow', 59: 'Slow', // Growlithe
    60: 'MediumSlow', 61: 'MediumSlow', 62: 'MediumSlow', // Poliwag
    63: 'MediumSlow', 64: 'MediumSlow', 65: 'MediumSlow', // Abra
    66: 'MediumSlow', 67: 'MediumSlow', 68: 'MediumSlow', // Machop
    69: 'MediumSlow', 70: 'MediumSlow', 71: 'MediumSlow', // Bellsprout
    72: 'Slow', 73: 'Slow', // Tentacool
    74: 'MediumSlow', 75: 'MediumSlow', 76: 'MediumSlow', // Geodude
    77: 'MediumFast', 78: 'MediumFast', // Ponyta
    79: 'MediumFast', 80: 'MediumFast', // Slowpoke
    81: 'MediumFast', 82: 'MediumFast', // Magnemite
    83: 'MediumFast', // Farfetch'd
    84: 'MediumFast', 85: 'MediumFast', // Doduo
    86: 'MediumFast', 87: 'MediumFast', // Seel
    88: 'MediumFast', 89: 'MediumFast', // Grimer
    90: 'Slow', 91: 'Slow', // Shellder
    92: 'MediumSlow', 93: 'MediumSlow', 94: 'MediumSlow', // Gastly
    95: 'MediumFast', // Onix
    96: 'MediumFast', 97: 'MediumFast', // Drowzee
    98: 'MediumFast', 99: 'MediumFast', // Krabby
    100: 'MediumFast', 101: 'MediumFast', // Voltorb
    102: 'Slow', 103: 'Slow', // Exeggcute
    104: 'MediumFast', 105: 'MediumFast', // Cubone
    106: 'MediumFast', 107: 'MediumFast', // Hitmons
    108: 'MediumFast', // Lickitung
    109: 'MediumFast', 110: 'MediumFast', // Koffing
    111: 'Slow', 112: 'Slow', // Rhyhorn
    113: 'Fast', // Chansey
    114: 'MediumFast', // Tangela
    115: 'MediumFast', // Kangaskhan
    116: 'MediumFast', 117: 'MediumFast', // Horsea
    118: 'MediumFast', 119: 'MediumFast', // Goldeen
    120: 'Slow', 121: 'Slow', // Staryu
    122: 'MediumFast', // Mr. Mime
    123: 'MediumFast', // Scyther
    124: 'MediumFast', // Jynx
    125: 'MediumFast', // Electabuzz
    126: 'MediumFast', // Magmar
    127: 'Slow', // Pinsir
    128: 'Slow', // Tauros
    129: 'Slow', 130: 'Slow', // Magikarp
    131: 'Slow', // Lapras
    132: 'MediumFast', // Ditto
    133: 'MediumFast', 134: 'MediumFast', 135: 'MediumFast', 136: 'MediumFast', // Eevee
    137: 'MediumFast', // Porygon
    138: 'MediumFast', 139: 'MediumFast', // Omanyte
    140: 'MediumFast', 141: 'MediumFast', // Kabuto
    142: 'Slow', // Aerodactyl
    143: 'Slow', // Snorlax
    144: 'Slow', 145: 'Slow', 146: 'Slow', // Birds
    147: 'Slow', 148: 'Slow', 149: 'Slow', // Dratini
    150: 'Slow', 151: 'MediumSlow', // Mewtwo, Mew

    // Gen 2
    152: 'MediumSlow', 153: 'MediumSlow', 154: 'MediumSlow', // Chikorita
    155: 'MediumSlow', 156: 'MediumSlow', 157: 'MediumSlow', // Cyndaquil
    158: 'MediumSlow', 159: 'MediumSlow', 160: 'MediumSlow', // Totodile
    161: 'MediumFast', 162: 'MediumFast', // Sentret
    163: 'MediumFast', 164: 'MediumFast', // Hoothoot
    165: 'Fast', 166: 'Fast', // Ledyba
    167: 'Fast', 168: 'Fast', // Spinarak
    169: 'MediumFast', // Crobat
    170: 'Slow', 171: 'Slow', // Chinchou
    172: 'MediumFast', // Pichu
    173: 'Fast', // Cleffa
    174: 'Fast', // Igglybuff
    175: 'Fast', 176: 'Fast', // Togepi
    177: 'MediumFast', 178: 'MediumFast', // Natu
    179: 'MediumSlow', 180: 'MediumSlow', 181: 'MediumSlow', // Mareep
    182: 'MediumSlow', // Bellossom
    183: 'Fast', 184: 'Fast', // Marill
    185: 'MediumFast', // Sudowoodo
    186: 'MediumSlow', // Politoed
    187: 'MediumSlow', 188: 'MediumSlow', 189: 'MediumSlow', // Hoppip
    190: 'Fast', // Aipom
    191: 'MediumSlow', 192: 'MediumSlow', // Sunkern
    193: 'MediumFast', // Yanma
    194: 'MediumFast', 195: 'MediumFast', // Wooper
    196: 'MediumFast', 197: 'MediumFast', // Espeon, Umbreon
    198: 'MediumSlow', // Murkrow
    199: 'MediumFast', // Slowking
    200: 'Fast', // Misdreavus
    201: 'MediumFast', // Unown
    202: 'MediumFast', // Wobbuffet
    203: 'MediumFast', // Girafarig
    204: 'MediumFast', 205: 'MediumFast', // Pineco
    206: 'MediumFast', // Dunsparce
    207: 'MediumSlow', 208: 'MediumSlow', // Gligar, Steelix
    209: 'Fast', 210: 'Fast', // Snubbull
    211: 'MediumFast', // Qwilfish
    212: 'MediumFast', // Scizor
    213: 'MediumSlow', // Shuckle
    214: 'Slow', // Heracross
    215: 'MediumSlow', // Sneasel
    216: 'MediumFast', 217: 'MediumFast', // Teddiursa
    218: 'MediumFast', 219: 'MediumFast', // Slugma
    220: 'Slow', 221: 'Slow', // Swinub
    222: 'Fast', // Corsola
    223: 'MediumFast', 224: 'MediumFast', // Remoraid
    225: 'Fast', // Delibird
    226: 'Slow', // Mantine
    227: 'Slow', // Skarmory
    228: 'Slow', 229: 'Slow', // Houndour
    230: 'MediumFast', // Kingdra
    231: 'MediumFast', 232: 'MediumFast', // Phanpy
    233: 'MediumFast', // Porygon2
    234: 'Slow', // Stantler
    235: 'Fast', // Smeargle
    236: 'MediumFast', 237: 'MediumFast', // Tyrogue
    238: 'MediumFast', // Smoochum
    239: 'MediumFast', // Elekid
    240: 'MediumFast', // Magby
    241: 'Slow', // Miltank
    242: 'Fast', // Blissey
    243: 'Slow', 244: 'Slow', 245: 'Slow', // Beasts
    246: 'Slow', 247: 'Slow', 248: 'Slow', // Larvitar
    249: 'Slow', 250: 'Slow', 251: 'MediumSlow', // Lugia, Ho-oh, Celebi

    // Gen 3
    252: 'MediumSlow', 253: 'MediumSlow', 254: 'MediumSlow', // Treecko
    255: 'MediumSlow', 256: 'MediumSlow', 257: 'MediumSlow', // Torchic
    258: 'MediumSlow', 259: 'MediumSlow', 260: 'MediumSlow', // Mudkip
    261: 'MediumFast', 262: 'MediumFast', // Poochyena
    263: 'MediumFast', 264: 'MediumFast', // Zigzagoon
    265: 'MediumFast', 266: 'MediumFast', 267: 'MediumFast', 268: 'MediumFast', 269: 'MediumFast', // Wurmple
    270: 'MediumSlow', 271: 'MediumSlow', 272: 'MediumSlow', // Lotad
    273: 'MediumSlow', 274: 'MediumSlow', 275: 'MediumSlow', // Seedot
    276: 'MediumSlow', 277: 'MediumSlow', // Taillow
    278: 'MediumFast', 279: 'MediumFast', // Wingull
    280: 'Slow', 281: 'Slow', 282: 'Slow', // Ralts
    283: 'MediumFast', 284: 'MediumFast', // Surskit
    285: 'Fluctuating', 286: 'Fluctuating', // Shroomish
    287: 'Slow', 288: 'Slow', 289: 'Slow', // Slakoth
    290: 'Erratic', 291: 'Erratic', 292: 'Erratic', // Nincada
    293: 'MediumSlow', 294: 'MediumSlow', 295: 'MediumSlow', // Whismur
    296: 'Fluctuating', 297: 'Fluctuating', // Makuhita
    298: 'Fast', // Azurill
    299: 'MediumFast', // Nosepass
    300: 'Fast', 301: 'Fast', // Skitty
    302: 'MediumSlow', // Sableye
    303: 'Fast', // Mawile
    304: 'Slow', 305: 'Slow', 306: 'Slow', // Aron
    307: 'MediumFast', 308: 'MediumFast', // Meditite
    309: 'Slow', 310: 'Slow', // Electrike
    311: 'MediumFast', 312: 'MediumFast', // Plusle, Minun
    313: 'Erratic', 314: 'Fluctuating', // Volbeat, Illumise
    315: 'MediumSlow', // Roselia
    316: 'Fluctuating', 317: 'Fluctuating', // Gulpin
    318: 'Slow', 319: 'Slow', // Carvanha
    320: 'Fluctuating', 321: 'Fluctuating', // Wailmer
    322: 'MediumFast', 323: 'MediumFast', // Numel
    324: 'MediumFast', // Torkoal
    325: 'Fast', 326: 'Fast', // Spoink
    327: 'Fast', // Spinda
    328: 'MediumSlow', 329: 'MediumSlow', 330: 'MediumSlow', // Trapinch
    331: 'MediumSlow', 332: 'MediumSlow', // Cacnea
    333: 'Erratic', 334: 'Erratic', // Swablu
    335: 'Erratic', 336: 'Fluctuating', // Zangoose, Seviper
    337: 'Fast', 338: 'Fast', // Lunatone, Solrock
    339: 'MediumFast', 340: 'MediumFast', // Barboach
    341: 'Fluctuating', 342: 'Fluctuating', // Corphish
    343: 'MediumFast', 344: 'MediumFast', // Baltoy
    345: 'Erratic', 346: 'Erratic', // Lileep
    347: 'Erratic', 348: 'Erratic', // Anorith
    349: 'Erratic', 350: 'Erratic', // Feebas
    351: 'MediumFast', // Castform
    352: 'MediumSlow', // Kecleon
    353: 'Fast', 354: 'Fast', // Shuppet
    355: 'Fast', 356: 'Fast', // Duskull
    357: 'Slow', // Tropius
    358: 'Fast', // Chimecho
    359: 'MediumSlow', // Absol
    360: 'MediumFast', // Wynaut
    361: 'MediumFast', 362: 'MediumFast', // Snorunt
    363: 'MediumSlow', 364: 'MediumSlow', 365: 'MediumSlow', // Spheal
    366: 'Erratic', 367: 'Erratic', 368: 'Erratic', // Clamperl
    369: 'Slow', // Relicanth
    370: 'Fast', // Luvdisc
    371: 'Slow', 372: 'Slow', 373: 'Slow', // Bagon
    374: 'Slow', 375: 'Slow', 376: 'Slow', // Beldum
    377: 'Slow', 378: 'Slow', 379: 'Slow', // Regi
    380: 'Slow', 381: 'Slow', // Lati
    382: 'Slow', 383: 'Slow', 384: 'Slow', // Weather Trio
    385: 'Slow', 386: 'Slow', // Jirachi, Deoxys
};

export function getGrowthRate(dexId: number): GrowthRate {
    return SPECIES_GROWTH_RATE[dexId] || 'MediumFast';
}

export function getLevelFromExp(exp: number, rate: GrowthRate): number {
    // Optimization: Check boundaries to avoid loop if possible or reduce range
    // But iterative 100->1 is fast enough for <500 box mons
    for (let level = 100; level >= 2; level--) {
        if (exp >= getExpAtLevel(level, rate)) {
            return level;
        }
    }
    return 1;
}

export function getExpAtLevel(n: number, rate: GrowthRate): number {
    switch (rate) {
        case 'Fast':
            return Math.floor(0.8 * (n ** 3));
        case 'MediumFast':
            return n ** 3;
        case 'MediumSlow':
            return Math.floor(1.2 * (n ** 3) - 15 * (n ** 2) + 100 * n - 140);
        case 'Slow':
            return Math.floor(1.25 * (n ** 3));
        case 'Erratic':
            if (n < 50) return Math.floor((n ** 3) * (100 - n) / 50);
            if (n < 68) return Math.floor((n ** 3) * (150 - n) / 100);
            if (n < 98) return Math.floor((n ** 3) * Math.floor((1911 - 10 * n) / 3) / 500);
            return Math.floor((n ** 3) * (160 - n) / 100);
        case 'Fluctuating':
            if (n < 15) return Math.floor(n ** 3 * (Math.floor((n + 1) / 3) + 24) / 50);
            if (n < 36) return Math.floor(n ** 3 * (n + 14) / 50);
            return Math.floor(n ** 3 * (Math.floor(n / 2) + 32) / 50);
        default:
            return n ** 3;
    }
}
