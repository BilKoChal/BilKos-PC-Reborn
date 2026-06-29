/**
 * Gen 3 item names (Phase 2 Sprint 5).
 * Gen 3 has ~374 items. IDs 1-95 reuse Gen 2 names.
 * Source: PKHeX ItemsRS / Bulbapedia
 */

// Gen 3 item name table (partial — key items, balls, TMs, HMs, berries)
export const GEN3_ITEMS: Record<number, string> = {
  1: "Master Ball", 2: "Ultra Ball", 3: "Great Ball", 4: "Poké Ball",
  5: "Safari Ball", 6: "Net Ball", 7: "Dive Ball", 8: "Nest Ball",
  9: "Repeat Ball", 10: "Timer Ball", 11: "Luxury Ball", 12: "Premier Ball",
  13: "Potion", 14: "Antidote", 15: "Burn Heal", 16: "Ice Heal",
  17: "Awakening", 18: "Paralyze Heal", 19: "Full Restore", 20: "Max Potion",
  21: "Hyper Potion", 22: "Super Potion", 23: "Full Heal", 24: "Revive",
  25: "Max Revive", 26: "Fresh Water", 27: "Soda Pop", 28: "Lemonade",
  29: "Moomoo Milk", 30: "Energy Powder", 31: "Energy Root", 32: "Heal Powder",
  33: "Revival Herb", 34: "Ether", 35: "Max Ether", 36: "Elixir",
  37: "Max Elixir", 38: "Lava Cookie", 39: "Blue Flute", 40: "Yellow Flute",
  41: "Red Flute", 42: "Black Flute", 43: "White Flute", 44: "Berry Juice",
  45: "Sacred Ash", 46: "Shoal Salt", 47: "Shoal Shell", 48: "Red Shard",
  49: "Blue Shard", 50: "Yellow Shard", 51: "Green Shard",
  52: "Super Repel", 53: "Max Repel", 54: "Escape Rope", 55: "Repel",
  56: "Sun Stone", 57: "Moon Stone", 58: "Fire Stone", 59: "Thunder Stone",
  60: "Water Stone", 61: "Leaf Stone", 62: "Tiny Mushroom", 63: "Big Mushroom",
  64: "Pearl", 65: "Big Pearl", 66: "Stardust", 67: "Star Piece",
  68: "Nugget", 69: "Heart Scale", 70: "Exp. Share", 71: "Cleanse Tag",
  72: "Soul Dew", 73: "Fire Stone", 74: "Thunder Stone", 75: "Water Stone",
  76: "Leaf Stone", 77: "Sun Stone", 78: "Moon Stone",
  79: "Old Rod", 80: "Good Rod", 81: "Super Rod", 82: "Bicycle",
  83: "Town Map", 84: "Vs. Seeker", 85: "Fame Checker", 86: "TM Case",
  87: "Berry Pouch", 88: "Teachy TV", 89: "Tri-Pass", 90: "Rainbow Pass",
  91: "Tea", 92: "Mystic Ticket", 93: "Aurora Ticket", 94: "Powder Jar",
  95: "Ruby", 96: "Sapphire", 97: "Magma Emblem", 98: "Old Sea Map",
  // Key items
  100: "Pokédex", 101: "Pokémon Box Link", 102: "Acro Bike", 103: "Mach Bike",
  104: "Wailmer Pail", 105: "Devon Parts", 106: "Basement Key", 107: "Pokénav",
  108: "Go-Goggles", 109: "Meteorite", 110: "Rm. 1 Key", 111: "Rm. 2 Key",
  112: "Rm. 4 Key", 113: "Rm. 6 Key", 114: "Storage Key", 115: "Root Fossil",
  116: "Claw Fossil", 117: "Scanner", 118: "Devon Scope", 119: "S.S. Ticket",
  120: "HM01 Cut", 121: "HM02 Fly", 122: "HM03 Surf", 123: "HM04 Strength",
  124: "HM05 Flash", 125: "HM06 Rock Smash", 126: "HM07 Waterfall", 127: "HM08 Dive",
  // TMs (IDs 289-338 = TM01-TM50)
  289: "TM01 Focus Punch", 290: "TM02 Dragon Claw", 291: "TM03 Water Pulse",
  292: "TM04 Calm Mind", 293: "TM05 Roar", 294: "TM06 Toxic",
  295: "TM07 Hail", 296: "TM08 Bulk Up", 297: "TM09 Bullet Seed",
  298: "TM10 Hidden Power", 299: "TM11 Sunny Day", 300: "TM12 Taunt",
  301: "TM13 Ice Beam", 302: "TM14 Blizzard", 303: "TM15 Hyper Beam",
  304: "TM16 Light Screen", 305: "TM17 Protect", 306: "TM18 Rain Dance",
  307: "TM19 Giga Drain", 308: "TM20 Safeguard", 309: "TM21 Frustration",
  310: "TM22 SolarBeam", 311: "TM23 Iron Tail", 312: "TM24 Thunderbolt",
  313: "TM25 Thunder", 314: "TM26 Earthquake", 315: "TM27 Return",
  316: "TM28 Dig", 317: "TM29 Psychic", 318: "TM30 Shadow Ball",
  319: "TM31 Brick Break", 320: "TM32 Double Team", 321: "TM33 Reflect",
  322: "TM34 Shock Wave", 323: "TM35 Flamethrower", 324: "TM36 Sludge Bomb",
  325: "TM37 Sandstorm", 326: "TM38 Fire Blast", 327: "TM39 Rock Tomb",
  328: "TM40 Aerial Ace", 329: "TM41 Torment", 330: "TM42 Facade",
  331: "TM43 Secret Power", 332: "TM44 Rest", 333: "TM45 Attract",
  334: "TM46 Thief", 335: "TM47 Steel Wing", 336: "TM48 Skill Swap",
  337: "TM49 Snatch", 338: "TM50 Overheat",
  // Berries (IDs 133-184)
  133: "Cheri Berry", 134: "Chesto Berry", 135: "Pecha Berry", 136: "Rawst Berry",
  137: "Aspear Berry", 138: "Leppa Berry", 139: "Oran Berry", 140: "Persim Berry",
  141: "Lum Berry", 142: "Sitrus Berry", 143: "Figy Berry", 144: "Wiki Berry",
  145: "Mago Berry", 146: "Aguav Berry", 147: "Iapapa Berry", 148: "Razz Berry",
  149: "Bluk Berry", 150: "Nanab Berry", 151: "Wepear Berry", 152: "Pinap Berry",
  153: "Pomeg Berry", 154: "Kelpsy Berry", 155: "Qualot Berry", 156: "Hondew Berry",
  157: "Grepa Berry", 158: "Tamato Berry", 159: "Cornn Berry", 160: "Magost Berry",
  161: "Rabuta Berry", 162: "Nomel Berry", 163: "Spelon Berry", 164: "Pamtre Berry",
  165: "Watmel Berry", 166: "Durin Berry", 167: "Belue Berry",
  // Held items (battle effect)
  189: "Bright Powder", 190: "White Herb", 191: "Macho Brace", 192: "Exp. Share",
  193: "Quick Claw", 194: "Soothe Bell", 195: "Mental Herb", 196: "Choice Band",
  197: "King's Rock", 198: "Silver Powder", 199: "Amulet Coin", 200: "Cleanse Tag",
  201: "Soul Dew", 202: "Deep Sea Tooth", 203: "Deep Sea Scale", 204: "Smoke Ball",
  205: "Everstone", 206: "Focus Band", 207: "Lucky Egg", 208: "Scope Lens",
  209: "Metal Coat", 210: "Leftovers", 211: "Light Ball", 212: "Soft Sand",
  213: "Hard Stone", 214: "Miracle Seed", 215: "Black Glasses", 216: "Black Belt",
  217: "Magnet", 218: "Mystic Water", 219: "Sharp Beak", 220: "Poison Barb",
  221: "NeverMeltIce", 222: "Spell Tag", 223: "Twisted Spoon", 224: "Charcoal",
  225: "Dragon Fang", 226: "Silk Scarf", 227: "Up-Grade", 228: "Shell Bell",
  229: "Sea Incense", 230: "Lax Incense", 231: "Lucky Punch", 232: "Metal Powder",
  233: "Thick Club", 234: "Stick", 235: "Red Scarf", 236: "Blue Scarf",
  237: "Pink Scarf", 238: "Green Scarf", 239: "Yellow Scarf", 240: "Macho Brace",
};

export function getGen3ItemName(id: number): string {
  return GEN3_ITEMS[id] || (id === 0 ? 'None' : `Item ${id}`);
}
