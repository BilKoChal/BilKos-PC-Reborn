
export interface PokemonLocation {
  red: string;
  blue: string;
  yellow: string;
}

// Acquisition data for Gen 1 (Red, Blue, Yellow)
export const POKEMON_LOCATIONS: Record<number, PokemonLocation> = {
  1: { // Bulbasaur
    red: "Pallet Town (Starter)",
    blue: "Pallet Town (Starter)",
    yellow: "Cerulean City (Gift in house next to Center)"
  },
  2: { // Ivysaur
    red: "Evolve Bulbasaur (Lv 16)",
    blue: "Evolve Bulbasaur (Lv 16)",
    yellow: "Evolve Bulbasaur (Lv 16)"
  },
  3: { // Venusaur
    red: "Evolve Ivysaur (Lv 32)",
    blue: "Evolve Ivysaur (Lv 32)",
    yellow: "Evolve Ivysaur (Lv 32)"
  },
  4: { // Charmander
    red: "Pallet Town (Starter)",
    blue: "Pallet Town (Starter)",
    yellow: "Route 24 (Gift from trainer)"
  },
  5: { // Charmeleon
    red: "Evolve Charmander (Lv 16)",
    blue: "Evolve Charmander (Lv 16)",
    yellow: "Evolve Charmander (Lv 16)"
  },
  6: { // Charizard
    red: "Evolve Charmeleon (Lv 36)",
    blue: "Evolve Charmeleon (Lv 36)",
    yellow: "Evolve Charmeleon (Lv 36)"
  },
  7: { // Squirtle
    red: "Pallet Town (Starter)",
    blue: "Pallet Town (Starter)",
    yellow: "Vermilion City (Gift from Officer Jenny)"
  },
  8: { // Wartortle
    red: "Evolve Squirtle (Lv 16)",
    blue: "Evolve Squirtle (Lv 16)",
    yellow: "Evolve Squirtle (Lv 16)"
  },
  9: { // Blastoise
    red: "Evolve Wartortle (Lv 36)",
    blue: "Evolve Wartortle (Lv 36)",
    yellow: "Evolve Wartortle (Lv 36)"
  },
  10: { // Caterpie
    red: "Route 2, Viridian Forest",
    blue: "Route 2, Viridian Forest",
    yellow: "Viridian Forest"
  },
  11: { // Metapod
    red: "Viridian Forest (or Evolve Caterpie)",
    blue: "Viridian Forest (or Evolve Caterpie)",
    yellow: "Viridian Forest (or Evolve Caterpie)"
  },
  12: { // Butterfree
    red: "Evolve Metapod (Lv 10)",
    blue: "Evolve Metapod (Lv 10)",
    yellow: "Evolve Metapod (Lv 10)"
  },
  13: { // Weedle
    red: "Route 2, Viridian Forest",
    blue: "Route 2, Viridian Forest",
    yellow: "Trade (Missing)"
  },
  14: { // Kakuna
    red: "Viridian Forest (or Evolve Weedle)",
    blue: "Viridian Forest (or Evolve Weedle)",
    yellow: "Trade (Missing)"
  },
  15: { // Beedrill
    red: "Evolve Kakuna (Lv 10)",
    blue: "Evolve Kakuna (Lv 10)",
    yellow: "Trade (Missing)"
  },
  16: { // Pidgey
    red: "Route 1, 2, 5, etc.",
    blue: "Route 1, 2, 5, etc.",
    yellow: "Route 1, 2, 5, etc."
  },
  17: { // Pidgeotto
    red: "Route 14, 15 (Rare) or Evolve Pidgey",
    blue: "Route 14, 15 (Rare) or Evolve Pidgey",
    yellow: "Viridian Forest (Rare), Route 5"
  },
  18: { // Pidgeot
    red: "Evolve Pidgeotto (Lv 36)",
    blue: "Evolve Pidgeotto (Lv 36)",
    yellow: "Evolve Pidgeotto (Lv 36)"
  },
  19: { // Rattata
    red: "Route 1, 2, 4, 9, 16, 21, 22",
    blue: "Route 1, 2, 4, 9, 16, 21, 22",
    yellow: "Route 1, 2, 4, 9, 16, 21, 22"
  },
  20: { // Raticate
    red: "Route 16, 17, 18, 21",
    blue: "Route 16, 17, 18, 21",
    yellow: "Route 9, 10, 11, 16"
  },
  21: { // Spearow
    red: "Route 3, 4, 9, 10, 11",
    blue: "Route 3, 4, 9, 10, 11",
    yellow: "Route 3, 4, 9, 10, 11"
  },
  22: { // Fearow
    red: "Route 17, 18, 23",
    blue: "Route 17, 18, 23",
    yellow: "Route 9, 16, 17, 18, 23"
  },
  23: { // Ekans
    red: "Route 4, 8, 9, 10, 11, 23",
    blue: "Trade (Missing)",
    yellow: "Trade (Missing)"
  },
  24: { // Arbok
    red: "Route 23, Unknown Dungeon or Evolve Ekans",
    blue: "Trade (Missing)",
    yellow: "Trade (Missing)"
  },
  25: { // Pikachu
    red: "Viridian Forest, Power Plant",
    blue: "Viridian Forest, Power Plant",
    yellow: "Pallet Town (Starter)"
  },
  26: { // Raichu
    red: "Evolve Pikachu (Thunder Stone)",
    blue: "Evolve Pikachu (Thunder Stone)",
    yellow: "Trade (Starter won't evolve, wild missing)"
  },
  27: { // Sandshrew
    red: "Trade (Missing)",
    blue: "Route 4, 8, 9, 10, 11, 23",
    yellow: "Mt. Moon, Route 3, 4"
  },
  28: { // Sandslash
    red: "Trade (Missing)",
    blue: "Route 23, Unknown Dungeon or Evolve Sandshrew",
    yellow: "Route 23, Unknown Dungeon or Evolve Sandshrew"
  },
  29: { // Nidoran♀
    red: "Route 22, Safari Zone",
    blue: "Route 22, Safari Zone",
    yellow: "Route 2, 9, 10, 22, Safari Zone"
  },
  30: { // Nidorina
    red: "Safari Zone, Route 9 (Trade NPC)",
    blue: "Safari Zone, Route 9 (Trade NPC)",
    yellow: "Route 9, 23, Safari Zone"
  },
  31: { // Nidoqueen
    red: "Evolve Nidorina (Moon Stone)",
    blue: "Evolve Nidorina (Moon Stone)",
    yellow: "Evolve Nidorina (Moon Stone)"
  },
  32: { // Nidoran♂
    red: "Route 22, Safari Zone",
    blue: "Route 22, Safari Zone",
    yellow: "Route 2, 9, 10, 22, Safari Zone"
  },
  33: { // Nidorino
    red: "Safari Zone",
    blue: "Safari Zone",
    yellow: "Route 9, 23, Safari Zone"
  },
  34: { // Nidoking
    red: "Evolve Nidorino (Moon Stone)",
    blue: "Evolve Nidorino (Moon Stone)",
    yellow: "Evolve Nidorino (Moon Stone)"
  },
  35: { // Clefairy
    red: "Mt. Moon, Celadon Game Corner",
    blue: "Mt. Moon, Celadon Game Corner",
    yellow: "Mt. Moon"
  },
  36: { // Clefable
    red: "Evolve Clefairy (Moon Stone)",
    blue: "Evolve Clefairy (Moon Stone)",
    yellow: "Evolve Clefairy (Moon Stone)"
  },
  37: { // Vulpix
    red: "Trade (Missing)",
    blue: "Route 7, 8, Pokemon Mansion",
    yellow: "Celadon Game Corner"
  },
  38: { // Ninetales
    red: "Trade (Missing)",
    blue: "Evolve Vulpix (Fire Stone)",
    yellow: "Evolve Vulpix (Fire Stone)"
  },
  39: { // Jigglypuff
    red: "Route 3",
    blue: "Route 3",
    yellow: "Route 5, 6, 7, 8"
  },
  40: { // Wigglytuff
    red: "Unknown Dungeon or Evolve Jigglypuff (Moon Stone)",
    blue: "Unknown Dungeon or Evolve Jigglypuff (Moon Stone)",
    yellow: "Evolve Jigglypuff (Moon Stone)"
  },
  41: { // Zubat
    red: "Mt. Moon, Rock Tunnel, Seafoam Islands",
    blue: "Mt. Moon, Rock Tunnel, Seafoam Islands",
    yellow: "Mt. Moon, Rock Tunnel, Seafoam Islands"
  },
  42: { // Golbat
    red: "Seafoam Islands, Victory Road",
    blue: "Seafoam Islands, Victory Road",
    yellow: "Seafoam Islands, Victory Road"
  },
  43: { // Oddish
    red: "Route 5, 6, 7, 12, 13, 14, 15, 24, 25",
    blue: "Trade (Missing)",
    yellow: "Route 12, 13, 14, 15, 24, 25"
  },
  44: { // Gloom
    red: "Route 12, 13, 14, 15",
    blue: "Trade (Missing)",
    yellow: "Route 12, 13, 14, 15"
  },
  45: { // Vileplume
    red: "Evolve Gloom (Leaf Stone)",
    blue: "Trade (Missing)",
    yellow: "Evolve Gloom (Leaf Stone)"
  },
  46: { // Paras
    red: "Mt. Moon, Safari Zone",
    blue: "Mt. Moon, Safari Zone",
    yellow: "Mt. Moon, Safari Zone"
  },
  47: { // Parasect
    red: "Safari Zone, Unknown Dungeon",
    blue: "Safari Zone, Unknown Dungeon",
    yellow: "Safari Zone, Unknown Dungeon"
  },
  48: { // Venonat
    red: "Route 12, 13, 14, 15, Safari Zone",
    blue: "Route 12, 13, 14, 15, Safari Zone",
    yellow: "Route 14, 15, 24, 25"
  },
  49: { // Venomoth
    red: "Safari Zone, Victory Road, Unknown Dungeon",
    blue: "Safari Zone, Victory Road, Unknown Dungeon",
    yellow: "Route 14, 15, Victory Road"
  },
  50: { // Diglett
    red: "Diglett's Cave",
    blue: "Diglett's Cave",
    yellow: "Diglett's Cave"
  },
  51: { // Dugtrio
    red: "Diglett's Cave",
    blue: "Diglett's Cave",
    yellow: "Diglett's Cave"
  },
  52: { // Meowth
    red: "Trade (Missing)",
    blue: "Route 5, 6, 7, 8",
    yellow: "Trade (Missing)"
  },
  53: { // Persian
    red: "Trade (Missing)",
    blue: "Evolve Meowth (Lv 28)",
    yellow: "Trade (Missing)"
  },
  54: { // Psyduck
    red: "Safari Zone, Seafoam Islands (Fishing/Surf)",
    blue: "Safari Zone, Seafoam Islands (Fishing/Surf)",
    yellow: "Route 6, Surf in Routes 24, 25"
  },
  55: { // Golduck
    red: "Seafoam Islands",
    blue: "Seafoam Islands",
    yellow: "Route 6, Seafoam Islands"
  },
  56: { // Mankey
    red: "Route 5, 6, 7, 8",
    blue: "Trade (Missing)",
    yellow: "Route 3, 4, 22, 23"
  },
  57: { // Primeape
    red: "Route 23, Unknown Dungeon or Evolve Mankey",
    blue: "Trade (Missing)",
    yellow: "Route 23, Unknown Dungeon or Evolve Mankey"
  },
  58: { // Growlithe
    red: "Route 7, 8, Pokemon Mansion",
    blue: "Trade (Missing)",
    yellow: "Pokemon Mansion"
  },
  59: { // Arcanine
    red: "Evolve Growlithe (Fire Stone)",
    blue: "Trade (Missing)",
    yellow: "Evolve Growlithe (Fire Stone)"
  },
  60: { // Poliwag
    red: "Pallet/Viridian/Route 22 (Fishing - Good Rod)",
    blue: "Pallet/Viridian/Route 22 (Fishing - Good Rod)",
    yellow: "Pallet/Viridian/Route 22 (Fishing - Good Rod)"
  },
  61: { // Poliwhirl
    red: "Route 10, Celadon City (Fishing - Super Rod)",
    blue: "Route 10, Celadon City (Fishing - Super Rod)",
    yellow: "Route 10, Celadon City (Fishing - Super Rod)"
  },
  62: { // Poliwrath
    red: "Evolve Poliwhirl (Water Stone)",
    blue: "Evolve Poliwhirl (Water Stone)",
    yellow: "Evolve Poliwhirl (Water Stone)"
  },
  63: { // Abra
    red: "Route 24, 25, Game Corner",
    blue: "Route 24, 25, Game Corner",
    yellow: "Route 5, 6, 7, 8"
  },
  64: { // Kadabra
    red: "Unknown Dungeon or Evolve Abra (Lv 16)",
    blue: "Unknown Dungeon or Evolve Abra (Lv 16)",
    yellow: "Route 8 or Evolve Abra"
  },
  65: { // Alakazam
    red: "Trade Kadabra",
    blue: "Trade Kadabra",
    yellow: "Trade Kadabra"
  },
  66: { // Machop
    red: "Rock Tunnel, Victory Road",
    blue: "Rock Tunnel, Victory Road",
    yellow: "Rock Tunnel, Victory Road"
  },
  67: { // Machoke
    red: "Victory Road or Evolve Machop",
    blue: "Victory Road or Evolve Machop",
    yellow: "Victory Road or Evolve Machop"
  },
  68: { // Machamp
    red: "Trade Machoke",
    blue: "Trade Machoke",
    yellow: "Trade Machoke"
  },
  69: { // Bellsprout
    red: "Trade (Missing)",
    blue: "Route 12, 13, 14, 15, 24, 25",
    yellow: "Route 12, 13, 14, 15, 24, 25"
  },
  70: { // Weepinbell
    red: "Trade (Missing)",
    blue: "Route 12, 13, 14, 15",
    yellow: "Route 12, 13, 14, 15"
  },
  71: { // Victreebel
    red: "Trade (Missing)",
    blue: "Evolve Weepinbell (Leaf Stone)",
    yellow: "Evolve Weepinbell (Leaf Stone)"
  },
  72: { // Tentacool
    red: "Surf anywhere (Route 12, 19, 20, 21)",
    blue: "Surf anywhere (Route 12, 19, 20, 21)",
    yellow: "Surf anywhere (Route 12, 19, 20, 21)"
  },
  73: { // Tentacruel
    red: "Route 19, 20, 21",
    blue: "Route 19, 20, 21",
    yellow: "Route 19, 20, 21"
  },
  74: { // Geodude
    red: "Mt. Moon, Rock Tunnel, Victory Road",
    blue: "Mt. Moon, Rock Tunnel, Victory Road",
    yellow: "Mt. Moon, Rock Tunnel, Victory Road"
  },
  75: { // Graveler
    red: "Victory Road, Unknown Dungeon",
    blue: "Victory Road, Unknown Dungeon",
    yellow: "Victory Road, Unknown Dungeon"
  },
  76: { // Golem
    red: "Trade Graveler",
    blue: "Trade Graveler",
    yellow: "Trade Graveler"
  },
  77: { // Ponyta
    red: "Pokemon Mansion",
    blue: "Pokemon Mansion",
    yellow: "Route 17"
  },
  78: { // Rapidash
    red: "Unknown Dungeon or Evolve Ponyta",
    blue: "Unknown Dungeon or Evolve Ponyta",
    yellow: "Route 18 or Evolve Ponyta"
  },
  79: { // Slowpoke
    red: "Route 10, Seafoam Islands (Surf/Fish)",
    blue: "Route 10, Seafoam Islands (Surf/Fish)",
    yellow: "Route 12, 13, Seafoam Islands"
  },
  80: { // Slowbro
    red: "Route 23, Seafoam Islands, Unknown Dungeon",
    blue: "Route 23, Seafoam Islands, Unknown Dungeon",
    yellow: "Route 12, 13, Seafoam Islands"
  },
  81: { // Magnemite
    red: "Power Plant",
    blue: "Power Plant",
    yellow: "Power Plant, Route 10"
  },
  82: { // Magneton
    red: "Power Plant, Unknown Dungeon",
    blue: "Power Plant, Unknown Dungeon",
    yellow: "Power Plant, Unknown Dungeon"
  },
  83: { // Farfetch'd
    red: "Vermilion City (Trade for Spearow)",
    blue: "Vermilion City (Trade for Spearow)",
    yellow: "Route 12, 13"
  },
  84: { // Doduo
    red: "Route 16, 17, 18, Safari Zone",
    blue: "Route 16, 17, 18, Safari Zone",
    yellow: "Route 16, 17, 18"
  },
  85: { // Dodrio
    red: "Unknown Dungeon or Evolve Doduo",
    blue: "Unknown Dungeon or Evolve Doduo",
    yellow: "Route 17 or Evolve Doduo"
  },
  86: { // Seel
    red: "Seafoam Islands",
    blue: "Seafoam Islands",
    yellow: "Seafoam Islands"
  },
  87: { // Dewgong
    red: "Seafoam Islands",
    blue: "Seafoam Islands",
    yellow: "Seafoam Islands"
  },
  88: { // Grimer
    red: "Pokemon Mansion",
    blue: "Pokemon Mansion",
    yellow: "Power Plant"
  },
  89: { // Muk
    red: "Pokemon Mansion, Unknown Dungeon",
    blue: "Pokemon Mansion, Unknown Dungeon",
    yellow: "Power Plant, Pokemon Mansion"
  },
  90: { // Shellder
    red: "Seafoam Islands, Vermilion (Fishing - Super Rod)",
    blue: "Seafoam Islands, Vermilion (Fishing - Super Rod)",
    yellow: "Route 17, 18 (Super Rod)"
  },
  91: { // Cloyster
    red: "Evolve Shellder (Water Stone)",
    blue: "Evolve Shellder (Water Stone)",
    yellow: "Evolve Shellder (Water Stone)"
  },
  92: { // Gastly
    red: "Pokemon Tower (Lavender Town)",
    blue: "Pokemon Tower (Lavender Town)",
    yellow: "Pokemon Tower (Lavender Town)"
  },
  93: { // Haunter
    red: "Pokemon Tower",
    blue: "Pokemon Tower",
    yellow: "Pokemon Tower"
  },
  94: { // Gengar
    red: "Trade Haunter",
    blue: "Trade Haunter",
    yellow: "Trade Haunter"
  },
  95: { // Onix
    red: "Rock Tunnel, Victory Road",
    blue: "Rock Tunnel, Victory Road",
    yellow: "Mt. Moon, Rock Tunnel, Victory Road"
  },
  96: { // Drowzee
    red: "Route 11",
    blue: "Route 11",
    yellow: "Route 11"
  },
  97: { // Hypno
    red: "Unknown Dungeon or Evolve Drowzee",
    blue: "Unknown Dungeon or Evolve Drowzee",
    yellow: "Unknown Dungeon or Evolve Drowzee"
  },
  98: { // Krabby
    red: "Route 6, 11, 12, 13 (Super Rod)",
    blue: "Route 6, 11, 12, 13 (Super Rod)",
    yellow: "Route 10, 25, Seafoam Islands"
  },
  99: { // Kingler
    red: "Seafoam Islands, Unknown Dungeon or Evolve Krabby",
    blue: "Seafoam Islands, Unknown Dungeon or Evolve Krabby",
    yellow: "Route 25, Seafoam Islands, Unknown Dungeon"
  },
  100: { // Voltorb
    red: "Power Plant, Route 10",
    blue: "Power Plant, Route 10",
    yellow: "Power Plant"
  },
  101: { // Electrode
    red: "Power Plant, Unknown Dungeon, Raichu Room (Cerulean Cave)",
    blue: "Power Plant, Unknown Dungeon, Raichu Room (Cerulean Cave)",
    yellow: "Power Plant, Unknown Dungeon"
  },
  102: { // Exeggcute
    red: "Safari Zone",
    blue: "Safari Zone",
    yellow: "Safari Zone"
  },
  103: { // Exeggutor
    red: "Evolve Exeggcute (Leaf Stone)",
    blue: "Evolve Exeggcute (Leaf Stone)",
    yellow: "Evolve Exeggcute (Leaf Stone)"
  },
  104: { // Cubone
    red: "Pokemon Tower",
    blue: "Pokemon Tower",
    yellow: "Safari Zone"
  },
  105: { // Marowak
    red: "Victory Road, Unknown Dungeon",
    blue: "Victory Road, Unknown Dungeon",
    yellow: "Safari Zone, Unknown Dungeon"
  },
  106: { // Hitmonlee
    red: "Saffron Fighting Dojo (Choice: Pick one)",
    blue: "Saffron Fighting Dojo (Choice: Pick one)",
    yellow: "Saffron Fighting Dojo (Choice: Pick one)"
  },
  107: { // Hitmonchan
    red: "Saffron Fighting Dojo (Choice: Pick one)",
    blue: "Saffron Fighting Dojo (Choice: Pick one)",
    yellow: "Saffron Fighting Dojo (Choice: Pick one)"
  },
  108: { // Lickitung
    red: "Route 18 (Trade for Slowbro)",
    blue: "Route 18 (Trade for Slowbro)",
    yellow: "Unknown Dungeon"
  },
  109: { // Koffing
    red: "Pokemon Mansion",
    blue: "Pokemon Mansion",
    yellow: "Trade (Missing)"
  },
  110: { // Weezing
    red: "Pokemon Mansion, Unknown Dungeon",
    blue: "Pokemon Mansion, Unknown Dungeon",
    yellow: "Trade (Missing)"
  },
  111: { // Rhyhorn
    red: "Safari Zone",
    blue: "Safari Zone",
    yellow: "Safari Zone"
  },
  112: { // Rhydon
    red: "Unknown Dungeon or Evolve Rhyhorn",
    blue: "Unknown Dungeon or Evolve Rhyhorn",
    yellow: "Unknown Dungeon or Evolve Rhyhorn"
  },
  113: { // Chansey
    red: "Safari Zone, Unknown Dungeon",
    blue: "Safari Zone, Unknown Dungeon",
    yellow: "Safari Zone, Unknown Dungeon"
  },
  114: { // Tangela
    red: "Route 21, Cinnabar Island (Trade for Venonat)",
    blue: "Route 21, Cinnabar Island (Trade for Venonat)",
    yellow: "Safari Zone"
  },
  115: { // Kangaskhan
    red: "Safari Zone",
    blue: "Safari Zone",
    yellow: "Safari Zone"
  },
  116: { // Horsea
    red: "Route 19, 20, 21 (Super Rod)",
    blue: "Route 19, 20, 21 (Super Rod)",
    yellow: "Route 10, 11, 12, 13 (Super Rod)"
  },
  117: { // Seadra
    red: "Route 23, Unknown Dungeon, Seafoam Islands",
    blue: "Route 23, Unknown Dungeon, Seafoam Islands",
    yellow: "Route 10, 11, 12, 13"
  },
  118: { // Goldeen
    red: "Route 6, 11, 12, 24 (Fishing)",
    blue: "Route 6, 11, 12, 24 (Fishing)",
    yellow: "Route 6, 11, 12, 24 (Fishing)"
  },
  119: { // Seaking
    red: "Unknown Dungeon, Route 23 or Evolve Goldeen",
    blue: "Unknown Dungeon, Route 23 or Evolve Goldeen",
    yellow: "Route 23 or Evolve Goldeen"
  },
  120: { // Staryu
    red: "Seafoam Islands, Route 19, 20, 21 (Super Rod)",
    blue: "Seafoam Islands, Route 19, 20, 21 (Super Rod)",
    yellow: "Route 19, 20, 21 (Super Rod)"
  },
  121: { // Starmie
    red: "Evolve Staryu (Water Stone)",
    blue: "Evolve Staryu (Water Stone)",
    yellow: "Evolve Staryu (Water Stone)"
  },
  122: { // Mr. Mime
    red: "Route 2 (Trade for Abra)",
    blue: "Route 2 (Trade for Abra)",
    yellow: "Route 2 (Trade for Clefairy)"
  },
  123: { // Scyther
    red: "Safari Zone, Game Corner",
    blue: "Trade (Missing)",
    yellow: "Safari Zone"
  },
  124: { // Jynx
    red: "Cerulean City (Trade for Poliwhirl)",
    blue: "Cerulean City (Trade for Poliwhirl)",
    yellow: "Trade (Missing)"
  },
  125: { // Electabuzz
    red: "Power Plant",
    blue: "Trade (Missing)",
    yellow: "Trade (Missing)"
  },
  126: { // Magmar
    red: "Trade (Missing)",
    blue: "Pokemon Mansion",
    yellow: "Trade (Missing)"
  },
  127: { // Pinsir
    red: "Trade (Missing)",
    blue: "Safari Zone, Game Corner",
    yellow: "Safari Zone"
  },
  128: { // Tauros
    red: "Safari Zone",
    blue: "Safari Zone",
    yellow: "Safari Zone"
  },
  129: { // Magikarp
    red: "Fish anywhere (Old Rod), Route 4 (Buy from Salesman)",
    blue: "Fish anywhere (Old Rod), Route 4 (Buy from Salesman)",
    yellow: "Fish anywhere (Old Rod), Route 4 (Buy from Salesman)"
  },
  130: { // Gyarados
    red: "Evolve Magikarp (Lv 20)",
    blue: "Evolve Magikarp (Lv 20)",
    yellow: "Evolve Magikarp (Lv 20)"
  },
  131: { // Lapras
    red: "Silph Co. (Gift from NPC)",
    blue: "Silph Co. (Gift from NPC)",
    yellow: "Silph Co. (Gift from NPC)"
  },
  132: { // Ditto
    red: "Route 13, 14, 15, 23, Unknown Dungeon",
    blue: "Route 13, 14, 15, 23, Unknown Dungeon",
    yellow: "Pokemon Mansion, Unknown Dungeon"
  },
  133: { // Eevee
    red: "Celadon Mansion (Gift)",
    blue: "Celadon Mansion (Gift)",
    yellow: "Celadon Mansion (Gift)"
  },
  134: { // Vaporeon
    red: "Evolve Eevee (Water Stone)",
    blue: "Evolve Eevee (Water Stone)",
    yellow: "Evolve Eevee (Water Stone)"
  },
  135: { // Jolteon
    red: "Evolve Eevee (Thunder Stone)",
    blue: "Evolve Eevee (Thunder Stone)",
    yellow: "Evolve Eevee (Thunder Stone)"
  },
  136: { // Flareon
    red: "Evolve Eevee (Fire Stone)",
    blue: "Evolve Eevee (Fire Stone)",
    yellow: "Evolve Eevee (Fire Stone)"
  },
  137: { // Porygon
    red: "Celadon Game Corner (Buy with Coins)",
    blue: "Celadon Game Corner (Buy with Coins)",
    yellow: "Celadon Game Corner (Buy with Coins)"
  },
  138: { // Omanyte
    red: "Revive Helix Fossil (Mt. Moon Choice)",
    blue: "Revive Helix Fossil (Mt. Moon Choice)",
    yellow: "Revive Helix Fossil (Mt. Moon Choice)"
  },
  139: { // Omastar
    red: "Evolve Omanyte (Lv 40)",
    blue: "Evolve Omanyte (Lv 40)",
    yellow: "Evolve Omanyte (Lv 40)"
  },
  140: { // Kabuto
    red: "Revive Dome Fossil (Mt. Moon Choice)",
    blue: "Revive Dome Fossil (Mt. Moon Choice)",
    yellow: "Revive Dome Fossil (Mt. Moon Choice)"
  },
  141: { // Kabutops
    red: "Evolve Kabuto (Lv 40)",
    blue: "Evolve Kabuto (Lv 40)",
    yellow: "Evolve Kabuto (Lv 40)"
  },
  142: { // Aerodactyl
    red: "Revive Old Amber (Pewter Museum - Back Entrance)",
    blue: "Revive Old Amber (Pewter Museum - Back Entrance)",
    yellow: "Revive Old Amber (Pewter Museum - Back Entrance)"
  },
  143: { // Snorlax
    red: "Route 12, Route 16 (Wake with Poke Flute - Only 2 exist)",
    blue: "Route 12, Route 16 (Wake with Poke Flute - Only 2 exist)",
    yellow: "Route 12, Route 16 (Wake with Poke Flute - Only 2 exist)"
  },
  144: { // Articuno
    red: "Seafoam Islands (Legendary - One only)",
    blue: "Seafoam Islands (Legendary - One only)",
    yellow: "Seafoam Islands (Legendary - One only)"
  },
  145: { // Zapdos
    red: "Power Plant (Legendary - One only)",
    blue: "Power Plant (Legendary - One only)",
    yellow: "Power Plant (Legendary - One only)"
  },
  146: { // Moltres
    red: "Victory Road (Legendary - One only)",
    blue: "Victory Road (Legendary - One only)",
    yellow: "Victory Road (Legendary - One only)"
  },
  147: { // Dratini
    red: "Safari Zone (Super Rod), Game Corner",
    blue: "Safari Zone (Super Rod), Game Corner",
    yellow: "Safari Zone (Super Rod)"
  },
  148: { // Dragonair
    red: "Safari Zone (Super Rod - Rare) or Evolve Dratini",
    blue: "Safari Zone (Super Rod - Rare) or Evolve Dratini",
    yellow: "Safari Zone (Super Rod - Rare) or Evolve Dratini"
  },
  149: { // Dragonite
    red: "Evolve Dragonair (Lv 55)",
    blue: "Evolve Dragonair (Lv 55)",
    yellow: "Evolve Dragonair (Lv 55)"
  },
  150: { // Mewtwo
    red: "Unknown Dungeon (Cerulean Cave) - Requires beating Elite 4",
    blue: "Unknown Dungeon (Cerulean Cave) - Requires beating Elite 4",
    yellow: "Unknown Dungeon (Cerulean Cave) - Requires beating Elite 4"
  },
  151: { // Mew
    red: "Glitch (Trainer Fly Glitch) or Event only",
    blue: "Glitch (Trainer Fly Glitch) or Event only",
    yellow: "Glitch (Trainer Fly Glitch) or Event only"
  }
};
