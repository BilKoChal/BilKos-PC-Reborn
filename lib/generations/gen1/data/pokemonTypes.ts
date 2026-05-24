
// Standardized Type IDs for UI Consistency
export const TYPE_MAP: Record<string, number> = {
  "Normal": 0, 
  "Fighting": 1, 
  "Flying": 2, 
  "Poison": 3, 
  "Ground": 4, 
  "Rock": 5, 
  "Bug": 6, 
  "Ghost": 7, 
  "Steel": 8, // Exists for data integrity if needed, but unused in Gen 1 UI
  "Fire": 9, 
  "Water": 10, 
  "Grass": 11, 
  "Electric": 12, 
  "Psychic": 13, 
  "Ice": 14, 
  "Dragon": 15, 
  "Dark": 16, 
  "Fairy": 17,
  "???": 18
};

// Internal Gen 1 Type IDs (Offset 0x05/0x06 in Save)
export const GEN1_TYPE_ID_MAP: Record<string, number> = {
    'Normal': 0, 'Fighting': 1, 'Flying': 2, 'Poison': 3, 'Ground': 4, 'Rock': 5, 
    'Bug': 7, 'Ghost': 8, 
    'Fire': 20, 'Water': 21, 'Grass': 22, 'Electric': 23, 'Psychic': 24, 'Ice': 25, 'Dragon': 26
};

export function getTypeId(typeName: string): number {
    return TYPE_MAP[typeName] !== undefined ? TYPE_MAP[typeName] : 0;
}

export const getTypeName = (typeId: number): string => {
    // Gen 1 Type Table
    const types: Record<number, string> = {
        0: 'Normal', 1: 'Fighting', 2: 'Flying', 3: 'Poison', 4: 'Ground', 5: 'Rock', 
        7: 'Bug', 8: 'Ghost', 20: 'Fire', 21: 'Water', 22: 'Grass', 23: 'Electric', 
        24: 'Psychic', 25: 'Ice', 26: 'Dragon'
    };
    return types[typeId] || 'Unknown';
};

// Mapping of National Dex ID to Type Names
// STRICTLY GEN 1 TYPINGS
export const NATIONAL_DEX_TYPES: Record<number, string[]> = {
  1: ['Grass', 'Poison'], 2: ['Grass', 'Poison'], 3: ['Grass', 'Poison'],
  4: ['Fire'], 5: ['Fire'], 6: ['Fire', 'Flying'],
  7: ['Water'], 8: ['Water'], 9: ['Water'],
  10: ['Bug'], 11: ['Bug'], 12: ['Bug', 'Flying'],
  13: ['Bug', 'Poison'], 14: ['Bug', 'Poison'], 15: ['Bug', 'Poison'],
  16: ['Normal', 'Flying'], 17: ['Normal', 'Flying'], 18: ['Normal', 'Flying'],
  19: ['Normal'], 20: ['Normal'],
  21: ['Normal', 'Flying'], 22: ['Normal', 'Flying'],
  23: ['Poison'], 24: ['Poison'],
  25: ['Electric'], 26: ['Electric'],
  27: ['Ground'], 28: ['Ground'],
  29: ['Poison'], 30: ['Poison'], 31: ['Poison', 'Ground'],
  32: ['Poison'], 33: ['Poison'], 34: ['Poison', 'Ground'],
  35: ['Normal'], 36: ['Normal'],
  37: ['Fire'], 38: ['Fire'],
  39: ['Normal'], 40: ['Normal'],
  41: ['Poison', 'Flying'], 42: ['Poison', 'Flying'],
  43: ['Grass', 'Poison'], 44: ['Grass', 'Poison'], 45: ['Grass', 'Poison'],
  46: ['Bug', 'Grass'], 47: ['Bug', 'Grass'],
  48: ['Bug', 'Poison'], 49: ['Bug', 'Poison'],
  50: ['Ground'], 51: ['Ground'],
  52: ['Normal'], 53: ['Normal'],
  54: ['Water'], 55: ['Water'],
  56: ['Fighting'], 57: ['Fighting'],
  58: ['Fire'], 59: ['Fire'],
  60: ['Water'], 61: ['Water'], 62: ['Water', 'Fighting'],
  63: ['Psychic'], 64: ['Psychic'], 65: ['Psychic'],
  66: ['Fighting'], 67: ['Fighting'], 68: ['Fighting'],
  69: ['Grass', 'Poison'], 70: ['Grass', 'Poison'], 71: ['Grass', 'Poison'],
  72: ['Water', 'Poison'], 73: ['Water', 'Poison'],
  74: ['Rock', 'Ground'], 75: ['Rock', 'Ground'], 76: ['Rock', 'Ground'],
  77: ['Fire'], 78: ['Fire'],
  79: ['Water', 'Psychic'], 80: ['Water', 'Psychic'],
  81: ['Electric'], 82: ['Electric'], // Magnemite/Magneton Pure Electric in Gen 1
  83: ['Normal', 'Flying'],
  84: ['Normal', 'Flying'], 85: ['Normal', 'Flying'],
  86: ['Water'], 87: ['Water', 'Ice'],
  88: ['Poison'], 89: ['Poison'],
  90: ['Water'], 91: ['Water', 'Ice'],
  92: ['Ghost', 'Poison'], 93: ['Ghost', 'Poison'], 94: ['Ghost', 'Poison'],
  95: ['Rock', 'Ground'],
  96: ['Psychic'], 97: ['Psychic'],
  98: ['Water'], 99: ['Water'],
  100: ['Electric'], 101: ['Electric'],
  102: ['Grass', 'Psychic'], 103: ['Grass', 'Psychic'],
  104: ['Ground'], 105: ['Ground'],
  106: ['Fighting'], 107: ['Fighting'],
  108: ['Normal'],
  109: ['Poison'], 110: ['Poison'],
  111: ['Ground', 'Rock'], 112: ['Ground', 'Rock'],
  113: ['Normal'],
  114: ['Grass'],
  115: ['Normal'],
  116: ['Water'], 117: ['Water'],
  118: ['Water'], 119: ['Water'],
  120: ['Water'], 121: ['Water', 'Psychic'],
  122: ['Psychic'],
  123: ['Bug', 'Flying'],
  124: ['Ice', 'Psychic'],
  125: ['Electric'],
  126: ['Fire'],
  127: ['Bug'],
  128: ['Normal'],
  129: ['Water'], 130: ['Water', 'Flying'],
  131: ['Water', 'Ice'],
  132: ['Normal'],
  133: ['Normal'], 134: ['Water'], 135: ['Electric'], 136: ['Fire'],
  137: ['Normal'],
  138: ['Rock', 'Water'], 139: ['Rock', 'Water'],
  140: ['Rock', 'Water'], 141: ['Rock', 'Water'],
  142: ['Rock', 'Flying'],
  143: ['Normal'],
  144: ['Ice', 'Flying'],
  145: ['Electric', 'Flying'],
  146: ['Fire', 'Flying'],
  147: ['Dragon'], 148: ['Dragon'], 149: ['Dragon', 'Flying'],
  150: ['Psychic'], 151: ['Psychic'],
};

export const JOHTO_DEX_TYPES: Record<number, string[]> = {
  152: ['Grass'], 153: ['Grass'], 154: ['Grass'], 
  155: ['Fire'], 156: ['Fire'], 157: ['Fire'], 
  158: ['Water'], 159: ['Water'], 160: ['Water'], 
  161: ['Normal'], 162: ['Normal'], 
  163: ['Normal', 'Flying'], 164: ['Normal', 'Flying'], 
  165: ['Bug', 'Flying'], 166: ['Bug', 'Flying'], 
  167: ['Bug', 'Poison'], 168: ['Bug', 'Poison'], 
  169: ['Poison', 'Flying'], 
  170: ['Water', 'Electric'], 171: ['Water', 'Electric'], 
  172: ['Electric'], 173: ['Normal'], 174: ['Normal'], 
  175: ['Normal'], 176: ['Normal', 'Flying'], 
  177: ['Psychic', 'Flying'], 178: ['Psychic', 'Flying'], 
  179: ['Electric'], 180: ['Electric'], 181: ['Electric'], 
  182: ['Grass'], 
  183: ['Water'], 184: ['Water'], 
  185: ['Rock'], 
  186: ['Water'], 
  187: ['Grass', 'Flying'], 188: ['Grass', 'Flying'], 189: ['Grass', 'Flying'], 
  190: ['Normal'], 
  191: ['Grass'], 192: ['Grass'], 
  193: ['Bug', 'Flying'], 
  194: ['Water', 'Ground'], 195: ['Water', 'Ground'], 
  196: ['Psychic'], 197: ['Dark'], 
  198: ['Dark', 'Flying'], 
  199: ['Water', 'Psychic'], 
  200: ['Ghost'], 
  201: ['Psychic'], 
  202: ['Psychic'], 
  203: ['Normal', 'Psychic'], 
  204: ['Bug'], 205: ['Bug', 'Steel'], 
  206: ['Normal'], 
  207: ['Ground', 'Flying'], 
  208: ['Steel', 'Ground'], 
  209: ['Normal'], 210: ['Normal'], 
  211: ['Water', 'Poison'], 
  212: ['Bug', 'Steel'], 
  213: ['Bug', 'Rock'], 
  214: ['Bug', 'Fighting'], 
  215: ['Dark', 'Ice'], 
  216: ['Normal'], 217: ['Normal'], 
  218: ['Fire'], 219: ['Fire', 'Rock'], 
  220: ['Ice', 'Ground'], 221: ['Ice', 'Ground'], 
  222: ['Water', 'Rock'], 
  223: ['Water'], 224: ['Water'], 
  225: ['Ice', 'Flying'], 
  226: ['Water', 'Flying'], 
  227: ['Steel', 'Flying'], 
  228: ['Dark', 'Fire'], 229: ['Dark', 'Fire'], 
  230: ['Water', 'Dragon'], 
  231: ['Ground'], 232: ['Ground'], 
  233: ['Normal'], 
  234: ['Normal'], 
  235: ['Normal'], 
  236: ['Fighting'], 237: ['Fighting'], 
  238: ['Ice', 'Psychic'], 
  239: ['Electric'], 
  240: ['Fire'], 
  241: ['Normal'], 
  242: ['Normal'], 
  243: ['Electric'], 244: ['Fire'], 245: ['Water'], 
  246: ['Rock', 'Ground'], 247: ['Rock', 'Ground'], 248: ['Rock', 'Dark'], 
  249: ['Psychic', 'Flying'], 
  250: ['Fire', 'Flying'], 
  251: ['Grass', 'Psychic']
};

export function getPokemonTypes(dexId: number, generation: number = 1): string[] {
    if (generation === 2) {
        if (dexId === 81 || dexId === 82) {
            return ['Electric', 'Steel']; // Magnemite/Magneton got Steel secondary type in Gen 2
        }
        return JOHTO_DEX_TYPES[dexId] || NATIONAL_DEX_TYPES[dexId] || ['Normal'];
    }
    return NATIONAL_DEX_TYPES[dexId] || ['Normal'];
}
