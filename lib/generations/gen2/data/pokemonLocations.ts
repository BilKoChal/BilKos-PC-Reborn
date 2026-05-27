/**
 * Gen 2 (Gold/Silver/Crystal) encounter location data.
 * Sourced from PokeAPI (https://pokeapi.co) with manual corrections
 * for starters, legendaries, and event Pokemon.
 */

export interface PokemonLocation {
  gold: string;
  silver: string;
  crystal: string;
}

export const POKEMON_LOCATIONS: Record<number, PokemonLocation> = {
  1: { // Bulbasaur
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  2: { // Ivysaur
    gold: 'Evolve Bulbasaur (Lv 16)',
    silver: 'Evolve Bulbasaur (Lv 16)',
    crystal: 'Evolve Bulbasaur (Lv 16)',
  },
  3: { // Venusaur
    gold: 'Evolve Ivysaur (Lv 32)',
    silver: 'Evolve Ivysaur (Lv 32)',
    crystal: 'Evolve Ivysaur (Lv 32)',
  },
  4: { // Charmander
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  5: { // Charmeleon
    gold: 'Evolve Charmander (Lv 16)',
    silver: 'Evolve Charmander (Lv 16)',
    crystal: 'Evolve Charmander (Lv 16)',
  },
  6: { // Charizard
    gold: 'Evolve Charmeleon (Lv 36)',
    silver: 'Evolve Charmeleon (Lv 36)',
    crystal: 'Evolve Charmeleon (Lv 36)',
  },
  7: { // Squirtle
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  8: { // Wartortle
    gold: 'Evolve Squirtle (Lv 16)',
    silver: 'Evolve Squirtle (Lv 16)',
    crystal: 'Evolve Squirtle (Lv 16)',
  },
  9: { // Blastoise
    gold: 'Evolve Wartortle (Lv 36)',
    silver: 'Evolve Wartortle (Lv 36)',
    crystal: 'Evolve Wartortle (Lv 36)',
  },
  10: { // Caterpie
    gold: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal), National Park Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Ilex Forest Area (Headbutt High, Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), National Park Area (Walking)',
  },
  11: { // Metapod
    gold: 'Azalea Town Area (Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 34 Area (Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 26 Area (Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt Low, Headbutt Normal), National Park Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Ilex Forest Area (Headbutt High, Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
  },
  12: { // Butterfree
    gold: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal)',
    silver: 'Not available in this version',
    crystal: 'Ilex Forest Area (Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
  },
  13: { // Weedle
    gold: 'Not available in this version',
    silver: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal), National Park Area (Walking)',
    crystal: 'Ilex Forest Area (Headbutt High, Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), National Park Area (Walking)',
  },
  14: { // Kakuna
    gold: 'Not available in this version',
    silver: 'Azalea Town Area (Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 34 Area (Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 26 Area (Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt Low, Headbutt Normal), National Park Area (Walking)',
    crystal: 'Ilex Forest Area (Headbutt High, Walking)',
  },
  15: { // Beedrill
    gold: 'Not available in this version',
    silver: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal)',
    crystal: 'Ilex Forest Area (Headbutt Low, Headbutt Normal)',
  },
  16: { // Pidgey
    gold: 'Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 35 Area (Walking), Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), National Park Area (Walking)',
    silver: 'Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 35 Area (Walking), Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), National Park Area (Walking)',
    crystal: 'Ilex Forest Area (Walking), Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), National Park Area (Walking)',
  },
  17: { // Pidgeotto
    gold: 'Johto Route 37 Area (Walking), Johto Route 43 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 8 Area (Walking)',
    silver: 'Johto Route 37 Area (Walking), Johto Route 43 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 8 Area (Walking)',
    crystal: 'Johto Route 37 Area (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Johto Route 43 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  18: { // Pidgeot
    gold: 'Evolve Pidgeotto (Lv 36)',
    silver: 'Evolve Pidgeotto (Lv 36)',
    crystal: 'Evolve Pidgeotto (Lv 36)',
  },
  19: { // Rattata
    gold: 'Bell Tower 2f (Walking), Bell Tower 3f (Walking), Bell Tower 4f (Walking), Bell Tower 5f (Walking), Bell Tower 6f (Walking), Bell Tower 7f (Walking), Bell Tower 8f (Walking), Bell Tower 9f (Walking), Burned Tower 1f (Walking), Burned Tower B1f (Walking), Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Johto Route 34 Area (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Johto Route 46 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking), Kanto Route 9 Area (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Sprout Tower 2f (Walking), Sprout Tower 3f (Walking), Tohjo Falls Area (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking)',
    silver: 'Bell Tower 2f (Walking), Bell Tower 3f (Walking), Bell Tower 4f (Walking), Bell Tower 5f (Walking), Bell Tower 6f (Walking), Bell Tower 7f (Walking), Bell Tower 8f (Walking), Bell Tower 9f (Walking), Burned Tower 1f (Walking), Burned Tower B1f (Walking), Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Johto Route 34 Area (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Johto Route 46 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking), Kanto Route 9 Area (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Sprout Tower 2f (Walking), Sprout Tower 3f (Walking), Tohjo Falls Area (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking)',
    crystal: 'Bell Tower 2f (Walking), Bell Tower 3f (Walking), Bell Tower 4f (Walking), Bell Tower 5f (Walking), Bell Tower 6f (Walking), Bell Tower 7f (Walking), Bell Tower 8f (Walking), Bell Tower 9f (Walking), Burned Tower 1f (Walking), Burned Tower B1f (Walking), Johto Route 29 Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Johto Route 34 Area (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Johto Route 42 Area (Walking), Johto Route 46 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking), Kanto Sea Route 21 Area (Walking), Mt Mortar 1f (Walking), Mt Mortar Lower Cave (Walking), Sprout Tower 2f (Walking), Sprout Tower 3f (Walking), Tohjo Falls Area (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking)',
  },
  20: { // Raticate
    gold: 'Burned Tower 1f (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 10 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking), Mt Mortar B1f (Walking), Mt Mortar Upper Cave (Walking), Tohjo Falls Area (Walking), Union Cave B2f (Walking)',
    silver: 'Burned Tower 1f (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 10 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking), Mt Mortar B1f (Walking), Mt Mortar Upper Cave (Walking), Tohjo Falls Area (Walking), Union Cave B2f (Walking)',
    crystal: 'Burned Tower 1f (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Johto Route 42 Area (Walking), Johto Route 43 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 10 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking), Kanto Sea Route 21 Area (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Tohjo Falls Area (Walking), Union Cave B2f (Walking)',
  },
  21: { // Spearow
    gold: 'Goldenrod City North Gate (Gift), Johto Route 29 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 31 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 32 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 33 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 42 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 43 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 44 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 45 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 46 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Kanto Route 10 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking)',
    silver: 'Goldenrod City North Gate (Gift), Johto Route 29 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 31 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 32 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 33 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 42 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 43 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 44 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 45 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 46 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Kanto Route 10 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking)',
    crystal: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Goldenrod City North Gate (Gift), Johto Route 33 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 42 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 44 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 45 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 46 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Kanto Route 10 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 9 Area (Walking)',
  },
  22: { // Fearow
    gold: 'Kanto Route 10 Area (Walking), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 9 Area (Walking)',
    silver: 'Kanto Route 10 Area (Walking), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 9 Area (Walking)',
    crystal: 'Johto Route 42 Area (Walking), Kanto Route 10 Area (Walking), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking), Kanto Route 22 Area (Walking), Kanto Route 9 Area (Walking)',
  },
  23: { // Ekans
    gold: 'Goldenrod City Game Corner (Gift)',
    silver: 'Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking)',
    crystal: 'Azalea Town Area (Headbutt Low, Headbutt Normal), Johto Route 32 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 33 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 42 Area (Headbutt Low, Headbutt Normal, Walking), Kanto Route 26 Area (Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt Low, Headbutt Normal), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking)',
  },
  24: { // Arbok
    gold: 'Not available in this version',
    silver: 'Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking)',
    crystal: 'Johto Route 42 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Mt Silver Outside (Walking)',
  },
  25: { // Pikachu
    gold: 'Kanto Route 2 South Towards Viridian City (Walking)',
    silver: 'Kanto Route 2 South Towards Viridian City (Walking)',
    crystal: 'Celadon City Prize Corner (Gift), Kanto Route 2 South Towards Viridian City (Walking)',
  },
  26: { // Raichu
    gold: 'Evolve Pikachu (Thunder Stone)',
    silver: 'Evolve Pikachu (Thunder Stone)',
    crystal: 'Evolve Pikachu (Thunder Stone)',
  },
  27: { // Sandshrew
    gold: 'Mt Moon 1f (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking)',
    silver: 'Goldenrod City Game Corner (Gift)',
    crystal: 'Mt Moon 1f (Walking), Union Cave 1f (Walking)',
  },
  28: { // Sandslash
    gold: 'Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Mt Moon 1f (Walking)',
    silver: 'Not available in this version',
    crystal: 'Kanto Route 26 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking)',
  },
  29: { // Nidoran F
    gold: 'Johto Route 35 Area (Walking), Johto Route 36 Area (Walking)',
    silver: 'Johto Route 35 Area (Walking), Johto Route 36 Area (Walking)',
    crystal: 'Johto Route 35 Area (Walking), National Park Area (Walking)',
  },
  30: { // Nidorina
    gold: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    silver: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    crystal: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
  },
  31: { // Nidoqueen
    gold: 'Evolve Nidorina (Moon Stone)',
    silver: 'Evolve Nidorina (Moon Stone)',
    crystal: 'Evolve Nidorina (Moon Stone)',
  },
  32: { // Nidoran M
    gold: 'Johto Route 35 Area (Walking), Johto Route 36 Area (Walking)',
    silver: 'Johto Route 35 Area (Walking), Johto Route 36 Area (Walking)',
    crystal: 'Johto Route 35 Area (Walking), National Park Area (Walking)',
  },
  33: { // Nidorino
    gold: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    silver: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    crystal: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
  },
  34: { // Nidoking
    gold: 'Evolve Nidorino (Moon Stone)',
    silver: 'Evolve Nidorino (Moon Stone)',
    crystal: 'Evolve Nidorino (Moon Stone)',
  },
  35: { // Clefairy
    gold: 'Mt Moon 1f (Walking)',
    silver: 'Mt Moon 1f (Walking)',
    crystal: 'Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Mt Moon 1f (Walking)',
  },
  36: { // Clefable
    gold: 'Evolve Clefairy (Moon Stone)',
    silver: 'Evolve Clefairy (Moon Stone)',
    crystal: 'Evolve Clefairy (Moon Stone)',
  },
  37: { // Vulpix
    gold: 'Not available in this version',
    silver: 'Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
    crystal: 'Not available in this version',
  },
  38: { // Ninetales
    gold: 'Evolve Vulpix (Fire Stone)',
    silver: 'Evolve Vulpix (Fire Stone)',
    crystal: 'Evolve Vulpix (Fire Stone)',
  },
  39: { // Jigglypuff
    gold: 'Johto Route 46 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking)',
    silver: 'Johto Route 46 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking)',
    crystal: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  40: { // Wigglytuff
    gold: 'Evolve Jigglypuff (Moon Stone)',
    silver: 'Evolve Jigglypuff (Moon Stone)',
    crystal: 'Evolve Jigglypuff (Moon Stone)',
  },
  41: { // Zubat
    gold: 'Burned Tower 1f (Walking), Burned Tower B1f (Walking), Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking), Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking), Ilex Forest Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Johto Route 42 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Mt Moon 1f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking), Slowpoke Well 1f (Walking), Slowpoke Well B1f (Walking), Tohjo Falls Area (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking), Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
    silver: 'Burned Tower 1f (Walking), Burned Tower B1f (Walking), Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking), Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking), Ilex Forest Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Johto Route 42 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Mt Moon 1f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking), Slowpoke Well 1f (Walking), Slowpoke Well B1f (Walking), Tohjo Falls Area (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking), Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
    crystal: 'Burned Tower 1f (Walking), Burned Tower B1f (Walking), Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Johto Route 42 Area (Walking), Kanto Route 10 Area (Walking), Kanto Route 3 Area (Walking), Kanto Route 4 Area (Walking), Kanto Route 9 Area (Walking), Mt Moon 1f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking), Slowpoke Well 1f (Walking), Slowpoke Well B1f (Walking), Tohjo Falls Area (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking), Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
  },
  42: { // Golbat
    gold: 'Dark Cave Blackthorn City Entrance (Walking), Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Mortar Upper Cave (Walking), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Top (Walking), Slowpoke Well B1f (Walking), Tohjo Falls Area (Walking), Union Cave B2f (Walking), Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
    silver: 'Dark Cave Blackthorn City Entrance (Walking), Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Mortar Upper Cave (Walking), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Top (Walking), Slowpoke Well B1f (Walking), Tohjo Falls Area (Walking), Union Cave B2f (Walking), Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
    crystal: 'Dark Cave Blackthorn City Entrance (Walking), Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking), Johto Route 42 Area (Walking), Kanto Route 28 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Outside (Walking), Mt Silver Top (Walking), Rock Tunnel B1f (Walking), Slowpoke Well B1f (Walking), Tohjo Falls Area (Walking), Union Cave B2f (Walking), Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
  },
  43: { // Oddish
    gold: 'Ilex Forest Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking)',
    silver: 'Ilex Forest Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking)',
    crystal: 'Ilex Forest Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
  },
  44: { // Gloom
    gold: 'Kanto Route 5 Area (Walking)',
    silver: 'Kanto Route 5 Area (Walking)',
    crystal: 'Kanto Route 24 Area (Walking)',
  },
  45: { // Vileplume
    gold: 'Evolve Gloom (Leaf Stone)',
    silver: 'Evolve Gloom (Leaf Stone)',
    crystal: 'Evolve Gloom (Leaf Stone)',
  },
  46: { // Paras
    gold: 'Ilex Forest Area (Walking), Mt Moon 1f (Walking)',
    silver: 'Ilex Forest Area (Walking), Mt Moon 1f (Walking)',
    crystal: 'Ilex Forest Area (Walking), Mt Moon 1f (Walking)',
  },
  47: { // Parasect
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Mt Silver 2f (Walking)',
  },
  48: { // Venonat
    gold: 'Johto Route 43 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
    silver: 'Johto Route 43 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
    crystal: 'Ilex Forest Area (Walking), Johto Route 43 Area (Headbutt Low, Headbutt Normal, Walking), Kanto Route 10 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 9 Area (Walking), Lake Of Rage Area (Headbutt Low, Headbutt Normal), National Park Area (Walking)',
  },
  49: { // Venomoth
    gold: 'Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
    silver: 'Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
    crystal: 'Johto Route 43 Area (Walking), Kanto Route 10 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 9 Area (Walking)',
  },
  50: { // Diglett
    gold: 'Digletts Cave Area (Walking)',
    silver: 'Digletts Cave Area (Walking)',
    crystal: 'Digletts Cave Area (Walking)',
  },
  51: { // Dugtrio
    gold: 'Digletts Cave Area (Walking)',
    silver: 'Digletts Cave Area (Walking)',
    crystal: 'Digletts Cave Area (Walking)',
  },
  52: { // Meowth
    gold: 'Not available in this version',
    silver: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
    crystal: 'Johto Route 35 Area (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  53: { // Persian
    gold: 'Not available in this version',
    silver: 'Kanto Route 7 Area (Walking)',
    crystal: 'Kanto Route 7 Area (Walking)',
  },
  54: { // Psyduck
    gold: 'Ilex Forest Area (Surfing), Johto Route 35 Area (Surfing), Kanto Route 6 Area (Surfing)',
    silver: 'Ilex Forest Area (Surfing), Johto Route 35 Area (Surfing), Kanto Route 6 Area (Surfing)',
    crystal: 'Ilex Forest Area (Surfing, Walking), Johto Route 35 Area (Surfing), Kanto Route 6 Area (Surfing, Walking), National Park Area (Walking)',
  },
  55: { // Golduck
    gold: 'Ilex Forest Area (Surfing), Johto Route 35 Area (Surfing), Kanto Route 6 Area (Surfing), Mt Silver 2f (Walking), Mt Silver Top (Walking)',
    silver: 'Ilex Forest Area (Surfing), Johto Route 35 Area (Surfing), Kanto Route 6 Area (Surfing), Mt Silver 2f (Walking), Mt Silver Top (Walking)',
    crystal: 'Ilex Forest Area (Surfing), Johto Route 35 Area (Surfing), Kanto Route 6 Area (Surfing), Mt Silver 2f (Surfing, Walking), Mt Silver Top (Walking)',
  },
  56: { // Mankey
    gold: 'Johto Route 42 Area (Walking), Kanto Route 9 Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Not available in this version',
  },
  57: { // Primeape
    gold: 'Kanto Route 9 Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Not available in this version',
  },
  58: { // Growlithe
    gold: 'Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Johto Route 35 Area (Walking), Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  59: { // Arcanine
    gold: 'Evolve Growlithe (Fire Stone)',
    silver: 'Evolve Growlithe (Fire Stone)',
    crystal: 'Evolve Growlithe (Fire Stone)',
  },
  60: { // Poliwag
    gold: 'Blackthorn City Area (Good Rod, Old Rod, Super Rod), Ecruteak City Area (Good Rod, Old Rod, Super Rod, Surfing), Ilex Forest Area (Good Rod, Old Rod, Super Rod), Johto Route 30 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 31 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 35 Area (Good Rod, Old Rod, Super Rod), Johto Route 43 Area (Good Rod, Old Rod, Super Rod), Johto Route 44 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 22 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 28 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 6 Area (Good Rod, Old Rod, Super Rod), Mt Silver Outside (Good Rod, Old Rod, Super Rod, Surfing), Ruins Of Alph Outside (Good Rod, Old Rod, Super Rod), Violet City Area (Good Rod, Old Rod, Super Rod, Surfing), Viridian City Area (Surfing)',
    silver: 'Blackthorn City Area (Good Rod, Old Rod, Super Rod), Ecruteak City Area (Good Rod, Old Rod, Super Rod, Surfing), Ilex Forest Area (Good Rod, Old Rod, Super Rod), Johto Route 30 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 31 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 35 Area (Good Rod, Old Rod, Super Rod), Johto Route 43 Area (Good Rod, Old Rod, Super Rod), Johto Route 44 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 22 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 28 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 6 Area (Good Rod, Old Rod, Super Rod), Mt Silver Outside (Good Rod, Old Rod, Super Rod, Surfing), Ruins Of Alph Outside (Good Rod, Old Rod, Super Rod), Violet City Area (Good Rod, Old Rod, Super Rod, Surfing), Viridian City Area (Surfing)',
    crystal: 'Blackthorn City Area (Good Rod, Old Rod, Super Rod), Ecruteak City Area (Good Rod, Old Rod, Super Rod, Surfing), Ilex Forest Area (Good Rod, Old Rod, Super Rod), Johto Route 30 Area (Good Rod, Old Rod, Super Rod, Surfing, Walking), Johto Route 31 Area (Good Rod, Old Rod, Super Rod, Surfing, Walking), Johto Route 35 Area (Good Rod, Old Rod, Super Rod), Johto Route 43 Area (Good Rod, Old Rod, Super Rod), Johto Route 44 Area (Good Rod, Old Rod, Super Rod, Surfing, Walking), Kanto Route 22 Area (Good Rod, Old Rod, Super Rod, Surfing, Walking), Kanto Route 28 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 6 Area (Good Rod, Old Rod, Super Rod), Mt Silver Outside (Good Rod, Old Rod, Super Rod, Surfing), Ruins Of Alph Outside (Good Rod, Old Rod, Super Rod), Violet City Area (Good Rod, Old Rod, Super Rod, Surfing), Viridian City Area (Surfing)',
  },
  61: { // Poliwhirl
    gold: 'Ecruteak City Area (Surfing), Johto Route 30 Area (Surfing), Johto Route 31 Area (Surfing), Johto Route 44 Area (Surfing), Kanto Route 22 Area (Surfing), Kanto Route 28 Area (Surfing), Mt Silver Outside (Surfing), Violet City Area (Surfing), Viridian City Area (Surfing)',
    silver: 'Ecruteak City Area (Surfing), Johto Route 30 Area (Surfing), Johto Route 31 Area (Surfing), Johto Route 44 Area (Surfing), Kanto Route 22 Area (Surfing), Kanto Route 28 Area (Surfing), Mt Silver Outside (Surfing), Violet City Area (Surfing), Viridian City Area (Surfing)',
    crystal: 'Ecruteak City Area (Surfing), Johto Route 30 Area (Surfing), Johto Route 31 Area (Surfing), Johto Route 44 Area (Surfing, Walking), Kanto Route 22 Area (Surfing), Kanto Route 28 Area (Surfing, Walking), Mt Silver Outside (Surfing, Walking), Violet City Area (Surfing), Viridian City Area (Surfing)',
  },
  62: { // Poliwrath
    gold: 'Evolve Poliwhirl (Water Stone)',
    silver: 'Evolve Poliwhirl (Water Stone)',
    crystal: 'Evolve Poliwhirl (Water Stone)',
  },
  63: { // Abra
    gold: 'Goldenrod City Game Corner (Gift), Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 8 Area (Walking)',
    silver: 'Goldenrod City Game Corner (Gift), Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 8 Area (Walking)',
    crystal: 'Goldenrod City Game Corner (Gift), Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  64: { // Kadabra
    gold: 'Kanto Route 8 Area (Walking)',
    silver: 'Kanto Route 8 Area (Walking)',
    crystal: 'Kanto Route 8 Area (Walking)',
  },
  65: { // Alakazam
    gold: 'Trade Kadabra',
    silver: 'Trade Kadabra',
    crystal: 'Trade Kadabra',
  },
  66: { // Machop
    gold: 'Goldenrod City Department Store 5f (Npc Trade), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking)',
    silver: 'Goldenrod City Department Store 5f (Npc Trade), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking)',
    crystal: 'Goldenrod City Department Store 5f (Npc Trade), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking)',
  },
  67: { // Machoke
    gold: 'Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking)',
    silver: 'Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking)',
    crystal: 'Mt Mortar Upper Cave (Walking), Mt Silver 2f (Walking), Rock Tunnel 1f (Walking)',
  },
  68: { // Machamp
    gold: 'Trade Machoke',
    silver: 'Trade Machoke',
    crystal: 'Trade Machoke',
  },
  69: { // Bellsprout
    gold: 'Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 44 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking)',
    silver: 'Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 44 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking)',
    crystal: 'Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 36 Area (Walking), Johto Route 44 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
  },
  70: { // Weepinbell
    gold: 'Johto Route 44 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
    silver: 'Johto Route 44 Area (Walking), Kanto Route 24 Area (Walking), Kanto Route 25 Area (Walking)',
    crystal: 'Johto Route 44 Area (Walking)',
  },
  71: { // Victreebel
    gold: 'Evolve Weepinbell (Leaf Stone)',
    silver: 'Evolve Weepinbell (Leaf Stone)',
    crystal: 'Evolve Weepinbell (Leaf Stone)',
  },
  72: { // Tentacool
    gold: 'Cherrygrove City Area (Surfing), Cianwood City Area (Surfing), Cinnabar Island Area (Good Rod, Old Rod, Surfing), Johto Route 32 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 34 Area (Surfing), Johto Sea Route 40 Area (Surfing), Johto Sea Route 41 Area (Good Rod, Old Rod, Surfing), Kanto Route 12 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 13 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 26 Area (Good Rod, Old Rod, Surfing), Kanto Route 27 Area (Good Rod, Old Rod, Surfing), Kanto Sea Route 19 Area (Surfing), Kanto Sea Route 20 Area (Good Rod, Old Rod, Surfing), Kanto Sea Route 21 Area (Good Rod, Old Rod, Surfing), New Bark Town Area (Good Rod, Old Rod, Surfing), Olivine City Area (Surfing), Pallet Town Area (Good Rod, Old Rod, Surfing), Union Cave B2f (Surfing), Vermilion City Area (Good Rod, Old Rod, Surfing), Vermilion City Ss Anne Dock (Good Rod, Old Rod, Surfing), Whirl Islands 1f (Surfing)',
    silver: 'Cherrygrove City Area (Surfing), Cianwood City Area (Surfing), Cinnabar Island Area (Good Rod, Old Rod, Surfing), Johto Route 32 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 34 Area (Surfing), Johto Sea Route 40 Area (Surfing), Johto Sea Route 41 Area (Good Rod, Old Rod, Surfing), Kanto Route 12 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 13 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 26 Area (Good Rod, Old Rod, Surfing), Kanto Route 27 Area (Good Rod, Old Rod, Surfing), Kanto Sea Route 19 Area (Surfing), Kanto Sea Route 20 Area (Good Rod, Old Rod, Surfing), Kanto Sea Route 21 Area (Good Rod, Old Rod, Surfing), New Bark Town Area (Good Rod, Old Rod, Surfing), Olivine City Area (Surfing), Pallet Town Area (Good Rod, Old Rod, Surfing), Union Cave B2f (Surfing), Vermilion City Area (Good Rod, Old Rod, Surfing), Vermilion City Ss Anne Dock (Good Rod, Old Rod, Surfing), Whirl Islands 1f (Surfing)',
    crystal: 'Cherrygrove City Area (Surfing), Cianwood City Area (Surfing), Cinnabar Island Area (Good Rod, Old Rod, Surfing), Johto Route 32 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 34 Area (Surfing), Johto Sea Route 40 Area (Surfing), Johto Sea Route 41 Area (Good Rod, Old Rod, Surfing), Kanto Route 12 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 13 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 26 Area (Good Rod, Old Rod, Surfing), Kanto Route 27 Area (Good Rod, Old Rod, Surfing), Kanto Sea Route 19 Area (Surfing), Kanto Sea Route 20 Area (Good Rod, Old Rod, Surfing), Kanto Sea Route 21 Area (Good Rod, Old Rod, Surfing), New Bark Town Area (Good Rod, Old Rod, Surfing), Olivine City Area (Surfing), Pallet Town Area (Good Rod, Old Rod, Surfing), Union Cave B2f (Surfing), Vermilion City Area (Good Rod, Old Rod, Surfing), Vermilion City Ss Anne Dock (Good Rod, Old Rod, Surfing), Whirl Islands 1f (Surfing)',
  },
  73: { // Tentacruel
    gold: 'Cherrygrove City Area (Surfing), Cianwood City Area (Surfing), Cinnabar Island Area (Super Rod, Surfing), Johto Route 32 Area (Surfing), Johto Route 34 Area (Surfing), Johto Sea Route 40 Area (Surfing), Johto Sea Route 41 Area (Super Rod, Surfing), Kanto Route 12 Area (Surfing), Kanto Route 13 Area (Surfing), Kanto Route 26 Area (Super Rod, Surfing), Kanto Route 27 Area (Super Rod, Surfing), Kanto Sea Route 19 Area (Surfing), Kanto Sea Route 20 Area (Super Rod, Surfing), Kanto Sea Route 21 Area (Super Rod, Surfing), New Bark Town Area (Super Rod, Surfing), Olivine City Area (Surfing), Pallet Town Area (Super Rod, Surfing), Union Cave B2f (Surfing), Vermilion City Area (Super Rod, Surfing), Vermilion City Ss Anne Dock (Super Rod, Surfing), Whirl Islands 1f (Surfing), Whirl Islands B2f (Surfing), Whirl Islands B3f (Surfing)',
    silver: 'Cherrygrove City Area (Surfing), Cianwood City Area (Surfing), Cinnabar Island Area (Super Rod, Surfing), Johto Route 32 Area (Surfing), Johto Route 34 Area (Surfing), Johto Sea Route 40 Area (Surfing), Johto Sea Route 41 Area (Super Rod, Surfing), Kanto Route 12 Area (Surfing), Kanto Route 13 Area (Surfing), Kanto Route 26 Area (Super Rod, Surfing), Kanto Route 27 Area (Super Rod, Surfing), Kanto Sea Route 19 Area (Surfing), Kanto Sea Route 20 Area (Super Rod, Surfing), Kanto Sea Route 21 Area (Super Rod, Surfing), New Bark Town Area (Super Rod, Surfing), Olivine City Area (Surfing), Pallet Town Area (Super Rod, Surfing), Union Cave B2f (Surfing), Vermilion City Area (Super Rod, Surfing), Vermilion City Ss Anne Dock (Super Rod, Surfing), Whirl Islands 1f (Surfing), Whirl Islands B2f (Surfing), Whirl Islands B3f (Surfing)',
    crystal: 'Cherrygrove City Area (Surfing), Cianwood City Area (Surfing), Cinnabar Island Area (Super Rod, Surfing), Johto Route 32 Area (Surfing), Johto Route 34 Area (Surfing), Johto Sea Route 40 Area (Surfing), Johto Sea Route 41 Area (Super Rod, Surfing), Kanto Route 12 Area (Surfing), Kanto Route 13 Area (Surfing), Kanto Route 26 Area (Super Rod, Surfing), Kanto Route 27 Area (Super Rod, Surfing), Kanto Sea Route 19 Area (Surfing), Kanto Sea Route 20 Area (Super Rod, Surfing), Kanto Sea Route 21 Area (Super Rod, Surfing), New Bark Town Area (Super Rod, Surfing), Olivine City Area (Surfing), Pallet Town Area (Super Rod, Surfing), Union Cave B2f (Surfing), Vermilion City Area (Super Rod, Surfing), Vermilion City Ss Anne Dock (Super Rod, Surfing), Whirl Islands 1f (Surfing), Whirl Islands B2f (Surfing), Whirl Islands B3f (Surfing)',
  },
  74: { // Geodude
    gold: 'Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking), Johto Route 45 Area (Walking), Johto Route 46 Area (Walking), Mt Moon 1f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking), Team Rocket Hq Area (Only One), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking)',
    silver: 'Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking), Johto Route 45 Area (Walking), Johto Route 46 Area (Walking), Mt Moon 1f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking), Team Rocket Hq Area (Only One), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking)',
    crystal: 'Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking), Johto Route 33 Area (Walking), Johto Route 45 Area (Walking), Johto Route 46 Area (Walking), Mt Moon 1f (Walking), Mt Mortar 1f (Walking), Mt Mortar B1f (Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking), Team Rocket Hq Area (Only One), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking)',
  },
  75: { // Graveler
    gold: 'Dark Cave Blackthorn City Entrance (Walking), Johto Route 45 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Mortar Upper Cave (Walking), Mt Silver 1f (Walking)',
    silver: 'Dark Cave Blackthorn City Entrance (Walking), Johto Route 45 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Mortar Upper Cave (Walking), Mt Silver 1f (Walking)',
    crystal: 'Dark Cave Blackthorn City Entrance (Walking), Johto Route 45 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Mortar Upper Cave (Walking), Mt Silver 1f (Walking), Mt Silver Top (Walking)',
  },
  76: { // Golem
    gold: 'Trade Graveler',
    silver: 'Trade Graveler',
    crystal: 'Trade Graveler',
  },
  77: { // Ponyta
    gold: 'Kanto Route 22 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    silver: 'Kanto Route 22 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    crystal: 'Kanto Route 22 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
  },
  78: { // Rapidash
    gold: 'Kanto Route 28 Area (Walking), Mt Silver Outside (Walking), Pewter City Area (Npc Trade)',
    silver: 'Kanto Route 28 Area (Walking), Mt Silver Outside (Walking), Pewter City Area (Npc Trade)',
    crystal: 'Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
  },
  79: { // Slowpoke
    gold: 'Slowpoke Well 1f (Surfing, Walking), Slowpoke Well B1f (Surfing, Walking), Tohjo Falls Area (Surfing, Walking)',
    silver: 'Slowpoke Well 1f (Surfing, Walking), Slowpoke Well B1f (Surfing, Walking), Tohjo Falls Area (Surfing, Walking)',
    crystal: 'Slowpoke Well 1f (Surfing, Walking), Slowpoke Well B1f (Surfing, Walking), Tohjo Falls Area (Surfing, Walking)',
  },
  80: { // Slowbro
    gold: 'Slowpoke Well B1f (Surfing)',
    silver: 'Slowpoke Well B1f (Surfing)',
    crystal: 'Slowpoke Well B1f (Surfing)',
  },
  81: { // Magnemite
    gold: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 6 Area (Walking)',
    silver: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 6 Area (Walking)',
    crystal: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 6 Area (Walking)',
  },
  82: { // Magneton
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Kanto Power Plant Area (Npc Trade)',
  },
  83: { // Farfetchd
    gold: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
    silver: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
    crystal: 'Johto Route 43 Area (Walking)',
  },
  84: { // Doduo
    gold: 'Kanto Route 22 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    silver: 'Kanto Route 22 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    crystal: 'Kanto Route 22 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
  },
  85: { // Dodrio
    gold: 'Kanto Route 26 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    silver: 'Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    crystal: 'Blackthorn City Area (Npc Trade), Kanto Route 27 Area (Walking), Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
  },
  86: { // Seel
    gold: 'Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
    silver: 'Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
    crystal: 'Whirl Islands 1f (Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Walking), Whirl Islands B3f (Walking)',
  },
  87: { // Dewgong
    gold: 'Evolve Seel (Water Stone)',
    silver: 'Evolve Seel (Water Stone)',
    crystal: 'Evolve Seel (Water Stone)',
  },
  88: { // Grimer
    gold: 'Celadon City Area (Surfing), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
    silver: 'Celadon City Area (Surfing), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
    crystal: 'Celadon City Area (Surfing), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
  },
  89: { // Muk
    gold: 'Celadon City Area (Surfing), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
    silver: 'Celadon City Area (Surfing), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
    crystal: 'Celadon City Area (Surfing), Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
  },
  90: { // Shellder
    gold: 'Cinnabar Island Area (Good Rod, Super Rod), Johto Sea Route 41 Area (Good Rod, Super Rod), Kanto Route 26 Area (Good Rod, Super Rod), Kanto Route 27 Area (Good Rod, Super Rod), Kanto Sea Route 20 Area (Good Rod, Super Rod), Kanto Sea Route 21 Area (Good Rod, Super Rod), New Bark Town Area (Good Rod, Super Rod), Pallet Town Area (Good Rod, Super Rod), Vermilion City Area (Good Rod, Super Rod), Vermilion City Ss Anne Dock (Good Rod, Super Rod)',
    silver: 'Cinnabar Island Area (Good Rod, Super Rod), Johto Sea Route 41 Area (Good Rod, Super Rod), Kanto Route 26 Area (Good Rod, Super Rod), Kanto Route 27 Area (Good Rod, Super Rod), Kanto Sea Route 20 Area (Good Rod, Super Rod), Kanto Sea Route 21 Area (Good Rod, Super Rod), New Bark Town Area (Good Rod, Super Rod), Pallet Town Area (Good Rod, Super Rod), Vermilion City Area (Good Rod, Super Rod), Vermilion City Ss Anne Dock (Good Rod, Super Rod)',
    crystal: 'Cinnabar Island Area (Good Rod, Super Rod), Johto Sea Route 41 Area (Good Rod, Super Rod), Kanto Route 26 Area (Good Rod, Super Rod), Kanto Route 27 Area (Good Rod, Super Rod), Kanto Sea Route 20 Area (Good Rod, Super Rod), Kanto Sea Route 21 Area (Good Rod, Super Rod), New Bark Town Area (Good Rod, Super Rod), Pallet Town Area (Good Rod, Super Rod), Vermilion City Area (Good Rod, Super Rod), Vermilion City Ss Anne Dock (Good Rod, Super Rod)',
  },
  91: { // Cloyster
    gold: 'Evolve Shellder (Water Stone)',
    silver: 'Evolve Shellder (Water Stone)',
    crystal: 'Evolve Shellder (Water Stone)',
  },
  92: { // Gastly
    gold: 'Bell Tower 2f (Walking), Bell Tower 3f (Walking), Bell Tower 4f (Walking), Bell Tower 5f (Walking), Bell Tower 6f (Walking), Bell Tower 7f (Walking), Bell Tower 8f (Walking), Bell Tower 9f (Walking), Sprout Tower 2f (Walking), Sprout Tower 3f (Walking)',
    silver: 'Bell Tower 2f (Walking), Bell Tower 3f (Walking), Bell Tower 4f (Walking), Bell Tower 5f (Walking), Bell Tower 6f (Walking), Bell Tower 7f (Walking), Bell Tower 8f (Walking), Bell Tower 9f (Walking), Sprout Tower 2f (Walking), Sprout Tower 3f (Walking)',
    crystal: 'Bell Tower 2f (Walking), Bell Tower 3f (Walking), Bell Tower 4f (Walking), Bell Tower 5f (Walking), Bell Tower 6f (Walking), Bell Tower 7f (Walking), Bell Tower 8f (Walking), Bell Tower 9f (Walking), Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 36 Area (Walking), Sprout Tower 2f (Walking), Sprout Tower 3f (Walking)',
  },
  93: { // Haunter
    gold: 'Kanto Route 8 Area (Walking)',
    silver: 'Kanto Route 8 Area (Walking)',
    crystal: 'Kanto Route 8 Area (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking)',
  },
  94: { // Gengar
    gold: 'Trade Haunter',
    silver: 'Trade Haunter',
    crystal: 'Trade Haunter',
  },
  95: { // Onix
    gold: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Silver 1f (Walking), Mt Silver Top (Walking), Rock Tunnel B1f (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking), Violet City Southwest House (Npc Trade)',
    silver: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Silver 1f (Walking), Mt Silver Top (Walking), Rock Tunnel B1f (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking), Violet City Southwest House (Npc Trade)',
    crystal: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Silver 1f (Walking), Mt Silver Top (Walking), Rock Tunnel B1f (Walking), Union Cave 1f (Walking), Union Cave B1f (Walking), Union Cave B2f (Walking), Violet City Southwest House (Npc Trade)',
  },
  96: { // Drowzee
    gold: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 11 Area (Walking)',
    silver: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 11 Area (Walking)',
    crystal: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 6 Area (Walking)',
  },
  97: { // Hypno
    gold: 'Kanto Route 11 Area (Walking)',
    silver: 'Kanto Route 11 Area (Walking)',
    crystal: 'Kanto Route 11 Area (Walking)',
  },
  98: { // Krabby
    gold: 'Cherrygrove City Area (Good Rod, Old Rod, Super Rod), Cianwood City Area (Good Rod, Old Rod, Rock Smash, Super Rod), Dark Cave Violet City Entrance (Rock Smash), Johto Route 34 Area (Good Rod, Old Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Old Rod, Rock Smash, Super Rod), Kanto Sea Route 19 Area (Good Rod, Old Rod, Super Rod), Olivine City Area (Good Rod, Old Rod, Super Rod), Union Cave B2f (Good Rod, Old Rod, Super Rod), Whirl Islands 1f (Good Rod, Old Rod, Super Rod, Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Good Rod, Old Rod, Super Rod, Walking), Whirl Islands B3f (Good Rod, Old Rod, Super Rod, Walking)',
    silver: 'Cherrygrove City Area (Good Rod, Old Rod, Super Rod), Cianwood City Area (Good Rod, Old Rod, Rock Smash, Super Rod), Dark Cave Violet City Entrance (Rock Smash), Johto Route 34 Area (Good Rod, Old Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Old Rod, Rock Smash, Super Rod), Kanto Sea Route 19 Area (Good Rod, Old Rod, Super Rod), Olivine City Area (Good Rod, Old Rod, Super Rod), Union Cave B2f (Good Rod, Old Rod, Super Rod), Whirl Islands 1f (Good Rod, Old Rod, Super Rod, Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Good Rod, Old Rod, Super Rod, Walking), Whirl Islands B3f (Good Rod, Old Rod, Super Rod, Walking)',
    crystal: 'Cherrygrove City Area (Good Rod, Old Rod, Super Rod), Cianwood City Area (Good Rod, Old Rod, Rock Smash, Super Rod), Dark Cave Violet City Entrance (Rock Smash), Johto Route 34 Area (Good Rod, Old Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Old Rod, Rock Smash, Super Rod), Kanto Sea Route 19 Area (Good Rod, Old Rod, Super Rod), Olivine City Area (Good Rod, Old Rod, Super Rod), Union Cave B2f (Good Rod, Old Rod, Super Rod), Whirl Islands 1f (Good Rod, Old Rod, Super Rod, Walking), Whirl Islands B1f (Walking), Whirl Islands B2f (Good Rod, Old Rod, Super Rod, Walking), Whirl Islands B3f (Good Rod, Old Rod, Super Rod, Walking)',
  },
  99: { // Kingler
    gold: 'Cherrygrove City Area (Super Rod), Cianwood City Area (Super Rod), Johto Route 34 Area (Super Rod), Johto Sea Route 40 Area (Super Rod), Kanto Sea Route 19 Area (Super Rod), Olivine City Area (Super Rod), Union Cave B2f (Super Rod), Whirl Islands 1f (Super Rod), Whirl Islands B2f (Super Rod), Whirl Islands B3f (Super Rod)',
    silver: 'Cherrygrove City Area (Super Rod), Cianwood City Area (Super Rod), Johto Route 34 Area (Super Rod), Johto Sea Route 40 Area (Super Rod), Kanto Sea Route 19 Area (Super Rod), Olivine City Area (Super Rod), Union Cave B2f (Super Rod), Whirl Islands 1f (Super Rod), Whirl Islands B2f (Super Rod), Whirl Islands B3f (Super Rod)',
    crystal: 'Cherrygrove City Area (Super Rod), Cianwood City Area (Super Rod), Johto Route 34 Area (Super Rod), Johto Sea Route 40 Area (Super Rod), Kanto Sea Route 19 Area (Super Rod), Olivine City Area (Super Rod), Union Cave B2f (Super Rod), Whirl Islands 1f (Super Rod), Whirl Islands B2f (Super Rod), Whirl Islands B3f (Super Rod)',
  },
  100: { // Voltorb
    gold: 'Kanto Route 10 Area (Walking), Olivine City Area (Npc Trade), Team Rocket Hq Area (Only One)',
    silver: 'Kanto Route 10 Area (Walking), Olivine City Area (Npc Trade), Team Rocket Hq Area (Only One)',
    crystal: 'Kanto Route 10 Area (Walking), Olivine City Area (Npc Trade), Team Rocket Hq Area (Only One)',
  },
  101: { // Electrode
    gold: 'Team Rocket Hq Area (Only One)',
    silver: 'Team Rocket Hq Area (Only One)',
    crystal: 'Team Rocket Hq Area (Only One)',
  },
  102: { // Exeggcute
    gold: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal)',
    silver: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal)',
    crystal: 'Johto Route 29 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 31 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 32 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 43 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal)',
  },
  103: { // Exeggutor
    gold: 'Evolve Exeggcute (Leaf Stone)',
    silver: 'Evolve Exeggcute (Leaf Stone)',
    crystal: 'Evolve Exeggcute (Leaf Stone)',
  },
  104: { // Cubone
    gold: 'Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking)',
    silver: 'Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking)',
    crystal: 'Goldenrod City Game Corner (Gift), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking)',
  },
  105: { // Marowak
    gold: 'Rock Tunnel B1f (Walking)',
    silver: 'Rock Tunnel B1f (Walking)',
    crystal: 'Kanto Route 10 Area (Walking), Kanto Route 9 Area (Walking), Rock Tunnel 1f (Walking), Rock Tunnel B1f (Walking)',
  },
  106: { // Hitmonlee
    gold: 'Saffron City Fighting Dojo (Choice: Pick one)',
    silver: 'Saffron City Fighting Dojo (Choice: Pick one)',
    crystal: 'Saffron City Fighting Dojo (Choice: Pick one)',
  },
  107: { // Hitmonchan
    gold: 'Saffron City Fighting Dojo (Choice: Pick one)',
    silver: 'Saffron City Fighting Dojo (Choice: Pick one)',
    crystal: 'Saffron City Fighting Dojo (Choice: Pick one)',
  },
  108: { // Lickitung
    gold: 'Johto Route 44 Area (Walking)',
    silver: 'Johto Route 44 Area (Walking)',
    crystal: 'Johto Route 44 Area (Walking)',
  },
  109: { // Koffing
    gold: 'Burned Tower 1f (Walking), Burned Tower B1f (Walking), Team Rocket Hq Area (Only One)',
    silver: 'Burned Tower 1f (Walking), Burned Tower B1f (Walking), Team Rocket Hq Area (Only One)',
    crystal: 'Burned Tower 1f (Walking), Burned Tower B1f (Walking), Team Rocket Hq Area (Only One)',
  },
  110: { // Weezing
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Burned Tower B1f (Walking)',
  },
  111: { // Rhyhorn
    gold: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking)',
    silver: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking)',
    crystal: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking)',
  },
  112: { // Rhydon
    gold: 'Blackthorn City Area (Npc Trade)',
    silver: 'Blackthorn City Area (Npc Trade)',
    crystal: 'Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking)',
  },
  113: { // Chansey
    gold: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    silver: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    crystal: 'Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
  },
  114: { // Tangela
    gold: 'Johto Route 44 Area (Walking), Kanto Route 28 Area (Walking), Kanto Sea Route 21 Area (Walking), Mt Silver Outside (Walking)',
    silver: 'Johto Route 44 Area (Walking), Kanto Route 28 Area (Walking), Kanto Sea Route 21 Area (Walking), Mt Silver Outside (Walking)',
    crystal: 'Johto Route 44 Area (Walking), Kanto Route 28 Area (Walking), Kanto Sea Route 21 Area (Walking), Mt Silver Outside (Walking)',
  },
  115: { // Kangaskhan
    gold: 'Rock Tunnel B1f (Walking)',
    silver: 'Rock Tunnel B1f (Walking)',
    crystal: 'Rock Tunnel B1f (Walking)',
  },
  116: { // Horsea
    gold: 'Whirl Islands 1f (Good Rod, Super Rod, Surfing), Whirl Islands B2f (Good Rod, Super Rod, Surfing), Whirl Islands B3f (Good Rod, Super Rod, Surfing)',
    silver: 'Whirl Islands 1f (Good Rod, Super Rod, Surfing), Whirl Islands B2f (Good Rod, Super Rod, Surfing), Whirl Islands B3f (Good Rod, Super Rod, Surfing)',
    crystal: 'Whirl Islands 1f (Good Rod, Super Rod, Surfing), Whirl Islands B2f (Good Rod, Super Rod, Surfing), Whirl Islands B3f (Good Rod, Super Rod, Surfing)',
  },
  117: { // Seadra
    gold: 'Whirl Islands 1f (Super Rod), Whirl Islands B2f (Super Rod), Whirl Islands B3f (Super Rod)',
    silver: 'Whirl Islands 1f (Super Rod), Whirl Islands B2f (Super Rod), Whirl Islands B3f (Super Rod)',
    crystal: 'Whirl Islands 1f (Super Rod), Whirl Islands B2f (Super Rod), Whirl Islands B3f (Super Rod, Surfing)',
  },
  118: { // Goldeen
    gold: 'Cerulean City Area (Good Rod, Old Rod, Super Rod, Surfing), Dark Cave Blackthorn City Entrance (Good Rod, Old Rod, Super Rod), Dark Cave Violet City Entrance (Good Rod, Old Rod, Super Rod), Johto Route 42 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 10 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 24 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 25 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 4 Area (Surfing), Kanto Route 9 Area (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar 1f (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar B1f (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar Upper Cave (Good Rod, Old Rod, Super Rod, Surfing), Mt Silver 2f (Good Rod, Old Rod, Super Rod, Surfing), Slowpoke Well 1f (Good Rod, Old Rod, Super Rod), Slowpoke Well B1f (Good Rod, Old Rod, Super Rod), Tohjo Falls Area (Good Rod, Old Rod, Super Rod, Surfing), Union Cave 1f (Good Rod, Old Rod, Super Rod), Union Cave B1f (Good Rod, Old Rod, Super Rod)',
    silver: 'Cerulean City Area (Good Rod, Old Rod, Super Rod, Surfing), Dark Cave Blackthorn City Entrance (Good Rod, Old Rod, Super Rod), Dark Cave Violet City Entrance (Good Rod, Old Rod, Super Rod), Johto Route 42 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 10 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 24 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 25 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 4 Area (Surfing), Kanto Route 9 Area (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar 1f (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar B1f (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar Upper Cave (Good Rod, Old Rod, Super Rod, Surfing), Mt Silver 2f (Good Rod, Old Rod, Super Rod, Surfing), Slowpoke Well 1f (Good Rod, Old Rod, Super Rod), Slowpoke Well B1f (Good Rod, Old Rod, Super Rod), Tohjo Falls Area (Good Rod, Old Rod, Super Rod, Surfing), Union Cave 1f (Good Rod, Old Rod, Super Rod), Union Cave B1f (Good Rod, Old Rod, Super Rod)',
    crystal: 'Cerulean City Area (Good Rod, Old Rod, Super Rod, Surfing), Dark Cave Blackthorn City Entrance (Good Rod, Old Rod, Super Rod), Dark Cave Violet City Entrance (Good Rod, Old Rod, Super Rod), Johto Route 42 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 10 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 24 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 25 Area (Good Rod, Old Rod, Super Rod, Surfing), Kanto Route 4 Area (Surfing), Kanto Route 9 Area (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar 1f (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar B1f (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar Upper Cave (Good Rod, Old Rod, Super Rod, Surfing), Mt Silver 2f (Good Rod, Old Rod, Super Rod, Surfing), Slowpoke Well 1f (Good Rod, Old Rod, Super Rod), Slowpoke Well B1f (Good Rod, Old Rod, Super Rod), Tohjo Falls Area (Good Rod, Old Rod, Super Rod, Surfing), Union Cave 1f (Good Rod, Old Rod, Super Rod), Union Cave B1f (Good Rod, Old Rod, Super Rod)',
  },
  119: { // Seaking
    gold: 'Cerulean City Area (Super Rod, Surfing), Dark Cave Blackthorn City Entrance (Super Rod), Dark Cave Violet City Entrance (Super Rod), Johto Route 42 Area (Super Rod, Surfing), Kanto Route 10 Area (Super Rod, Surfing), Kanto Route 24 Area (Super Rod, Surfing), Kanto Route 25 Area (Super Rod, Surfing), Kanto Route 4 Area (Surfing), Kanto Route 9 Area (Super Rod, Surfing), Mt Mortar 1f (Super Rod, Surfing), Mt Mortar B1f (Super Rod, Surfing), Mt Mortar Upper Cave (Super Rod, Surfing), Mt Silver 2f (Super Rod, Surfing), Slowpoke Well 1f (Super Rod), Slowpoke Well B1f (Super Rod), Tohjo Falls Area (Super Rod, Surfing), Union Cave 1f (Super Rod), Union Cave B1f (Super Rod)',
    silver: 'Cerulean City Area (Super Rod, Surfing), Dark Cave Blackthorn City Entrance (Super Rod), Dark Cave Violet City Entrance (Super Rod), Johto Route 42 Area (Super Rod, Surfing), Kanto Route 10 Area (Super Rod, Surfing), Kanto Route 24 Area (Super Rod, Surfing), Kanto Route 25 Area (Super Rod, Surfing), Kanto Route 4 Area (Surfing), Kanto Route 9 Area (Super Rod, Surfing), Mt Mortar 1f (Super Rod, Surfing), Mt Mortar B1f (Super Rod, Surfing), Mt Mortar Upper Cave (Super Rod, Surfing), Mt Silver 2f (Super Rod, Surfing), Slowpoke Well 1f (Super Rod), Slowpoke Well B1f (Super Rod), Tohjo Falls Area (Super Rod, Surfing), Union Cave 1f (Super Rod), Union Cave B1f (Super Rod)',
    crystal: 'Cerulean City Area (Super Rod, Surfing), Dark Cave Blackthorn City Entrance (Super Rod), Dark Cave Violet City Entrance (Super Rod), Johto Route 42 Area (Super Rod, Surfing), Kanto Route 10 Area (Super Rod, Surfing), Kanto Route 24 Area (Super Rod, Surfing), Kanto Route 25 Area (Super Rod, Surfing), Kanto Route 4 Area (Surfing), Kanto Route 9 Area (Super Rod, Surfing), Mt Mortar 1f (Super Rod, Surfing), Mt Mortar B1f (Super Rod, Surfing), Mt Mortar Upper Cave (Super Rod, Surfing), Mt Silver 2f (Super Rod, Surfing), Slowpoke Well 1f (Super Rod), Slowpoke Well B1f (Super Rod), Tohjo Falls Area (Super Rod, Surfing), Union Cave 1f (Super Rod), Union Cave B1f (Super Rod)',
  },
  120: { // Staryu
    gold: 'Cherrygrove City Area (Good Rod, Super Rod), Cianwood City Area (Good Rod, Super Rod), Johto Route 34 Area (Good Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Super Rod), Olivine City Area (Good Rod, Super Rod), Union Cave B2f (Good Rod, Super Rod)',
    silver: 'Cherrygrove City Area (Good Rod, Super Rod), Cianwood City Area (Good Rod, Super Rod), Johto Route 34 Area (Good Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Super Rod), Olivine City Area (Good Rod, Super Rod), Union Cave B2f (Good Rod, Super Rod)',
    crystal: 'Cherrygrove City Area (Good Rod, Super Rod), Cianwood City Area (Good Rod, Super Rod), Johto Route 34 Area (Good Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Super Rod), Olivine City Area (Good Rod, Super Rod), Union Cave B2f (Good Rod, Super Rod)',
  },
  121: { // Starmie
    gold: 'Evolve Staryu (Water Stone)',
    silver: 'Evolve Staryu (Water Stone)',
    crystal: 'Evolve Staryu (Water Stone)',
  },
  122: { // Mr. Mime
    gold: 'Celadon City Prize Corner (Gift), Kanto Sea Route 21 Area (Walking)',
    silver: 'Celadon City Prize Corner (Gift), Kanto Sea Route 21 Area (Walking)',
    crystal: 'Kanto Sea Route 21 Area (Walking)',
  },
  123: { // Scyther
    gold: 'Bug-Catching Contest (National Park)',
    silver: 'Bug-Catching Contest (National Park)',
    crystal: 'Bug-Catching Contest (National Park)',
  },
  124: { // Jynx
    gold: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
    silver: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
    crystal: 'Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
  },
  125: { // Electabuzz
    gold: 'Kanto Route 10 Area (Walking)',
    silver: 'Kanto Route 10 Area (Walking)',
    crystal: 'Kanto Route 10 Area (Walking)',
  },
  126: { // Magmar
    gold: 'Burned Tower B1f (Walking)',
    silver: 'Burned Tower B1f (Walking)',
    crystal: 'Mt Silver 1f (Walking)',
  },
  127: { // Pinsir
    gold: 'Bug-Catching Contest (National Park)',
    silver: 'Bug-Catching Contest (National Park)',
    crystal: 'Bug-Catching Contest (National Park)',
  },
  128: { // Tauros
    gold: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
    silver: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
    crystal: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
  },
  129: { // Magikarp
    gold: 'Blackthorn City Area (Good Rod, Old Rod, Super Rod, Surfing), Cerulean City Area (Good Rod, Old Rod, Super Rod), Cherrygrove City Area (Good Rod, Old Rod), Cianwood City Area (Good Rod, Old Rod), Cinnabar Island Area (Good Rod, Old Rod), Dark Cave Blackthorn City Entrance (Good Rod, Old Rod, Super Rod, Surfing), Dark Cave Violet City Entrance (Good Rod, Old Rod, Super Rod, Surfing), Dragons Den Area (Good Rod, Old Rod, Super Rod, Surfing), Ecruteak City Area (Good Rod, Old Rod, Super Rod), Fuchsia City Area (Good Rod, Old Rod, Super Rod, Surfing), Ilex Forest Area (Good Rod, Old Rod, Super Rod), Johto Route 30 Area (Good Rod, Old Rod, Super Rod), Johto Route 31 Area (Good Rod, Old Rod, Super Rod), Johto Route 32 Area (Good Rod, Old Rod, Super Rod), Johto Route 34 Area (Good Rod, Old Rod), Johto Route 35 Area (Good Rod, Old Rod, Super Rod), Johto Route 42 Area (Good Rod, Old Rod, Super Rod), Johto Route 43 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 44 Area (Good Rod, Old Rod, Super Rod), Johto Route 45 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Sea Route 40 Area (Good Rod, Old Rod), Johto Sea Route 41 Area (Good Rod, Old Rod), Kanto Route 10 Area (Good Rod, Old Rod, Super Rod), Kanto Route 12 Area (Good Rod, Old Rod, Super Rod), Kanto Route 13 Area (Good Rod, Old Rod, Super Rod), Kanto Route 22 Area (Good Rod, Old Rod, Super Rod), Kanto Route 24 Area (Good Rod, Old Rod, Super Rod), Kanto Route 25 Area (Good Rod, Old Rod, Super Rod), Kanto Route 26 Area (Good Rod, Old Rod), Kanto Route 27 Area (Good Rod, Old Rod), Kanto Route 28 Area (Good Rod, Old Rod, Super Rod), Kanto Route 6 Area (Good Rod, Old Rod, Super Rod), Kanto Route 9 Area (Good Rod, Old Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Old Rod), Kanto Sea Route 20 Area (Good Rod, Old Rod), Kanto Sea Route 21 Area (Good Rod, Old Rod), Lake Of Rage Area (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar 1f (Good Rod, Old Rod, Super Rod), Mt Mortar B1f (Good Rod, Old Rod, Super Rod), Mt Mortar Upper Cave (Good Rod, Old Rod, Super Rod), Mt Silver 2f (Good Rod, Old Rod, Super Rod), Mt Silver Outside (Good Rod, Old Rod, Super Rod), New Bark Town Area (Good Rod, Old Rod), Olivine City Area (Good Rod, Old Rod), Pallet Town Area (Good Rod, Old Rod), Ruins Of Alph Outside (Good Rod, Old Rod, Super Rod), Slowpoke Well 1f (Good Rod, Old Rod, Super Rod), Slowpoke Well B1f (Good Rod, Old Rod, Super Rod), Tohjo Falls Area (Good Rod, Old Rod, Super Rod), Union Cave 1f (Good Rod, Old Rod, Super Rod), Union Cave B1f (Good Rod, Old Rod, Super Rod), Union Cave B2f (Good Rod, Old Rod), Vermilion City Area (Good Rod, Old Rod), Vermilion City Ss Anne Dock (Good Rod, Old Rod), Violet City Area (Good Rod, Old Rod, Super Rod), Whirl Islands 1f (Good Rod, Old Rod), Whirl Islands B2f (Good Rod, Old Rod), Whirl Islands B3f (Good Rod, Old Rod)',
    silver: 'Blackthorn City Area (Good Rod, Old Rod, Super Rod, Surfing), Cerulean City Area (Good Rod, Old Rod, Super Rod), Cherrygrove City Area (Good Rod, Old Rod), Cianwood City Area (Good Rod, Old Rod), Cinnabar Island Area (Good Rod, Old Rod), Dark Cave Blackthorn City Entrance (Good Rod, Old Rod, Super Rod, Surfing), Dark Cave Violet City Entrance (Good Rod, Old Rod, Super Rod, Surfing), Dragons Den Area (Good Rod, Old Rod, Super Rod, Surfing), Ecruteak City Area (Good Rod, Old Rod, Super Rod), Fuchsia City Area (Good Rod, Old Rod, Super Rod, Surfing), Ilex Forest Area (Good Rod, Old Rod, Super Rod), Johto Route 30 Area (Good Rod, Old Rod, Super Rod), Johto Route 31 Area (Good Rod, Old Rod, Super Rod), Johto Route 32 Area (Good Rod, Old Rod, Super Rod), Johto Route 34 Area (Good Rod, Old Rod), Johto Route 35 Area (Good Rod, Old Rod, Super Rod), Johto Route 42 Area (Good Rod, Old Rod, Super Rod), Johto Route 43 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 44 Area (Good Rod, Old Rod, Super Rod), Johto Route 45 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Sea Route 40 Area (Good Rod, Old Rod), Johto Sea Route 41 Area (Good Rod, Old Rod), Kanto Route 10 Area (Good Rod, Old Rod, Super Rod), Kanto Route 12 Area (Good Rod, Old Rod, Super Rod), Kanto Route 13 Area (Good Rod, Old Rod, Super Rod), Kanto Route 22 Area (Good Rod, Old Rod, Super Rod), Kanto Route 24 Area (Good Rod, Old Rod, Super Rod), Kanto Route 25 Area (Good Rod, Old Rod, Super Rod), Kanto Route 26 Area (Good Rod, Old Rod), Kanto Route 27 Area (Good Rod, Old Rod), Kanto Route 28 Area (Good Rod, Old Rod, Super Rod), Kanto Route 6 Area (Good Rod, Old Rod, Super Rod), Kanto Route 9 Area (Good Rod, Old Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Old Rod), Kanto Sea Route 20 Area (Good Rod, Old Rod), Kanto Sea Route 21 Area (Good Rod, Old Rod), Lake Of Rage Area (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar 1f (Good Rod, Old Rod, Super Rod), Mt Mortar B1f (Good Rod, Old Rod, Super Rod), Mt Mortar Upper Cave (Good Rod, Old Rod, Super Rod), Mt Silver 2f (Good Rod, Old Rod, Super Rod), Mt Silver Outside (Good Rod, Old Rod, Super Rod), New Bark Town Area (Good Rod, Old Rod), Olivine City Area (Good Rod, Old Rod), Pallet Town Area (Good Rod, Old Rod), Ruins Of Alph Outside (Good Rod, Old Rod, Super Rod), Slowpoke Well 1f (Good Rod, Old Rod, Super Rod), Slowpoke Well B1f (Good Rod, Old Rod, Super Rod), Tohjo Falls Area (Good Rod, Old Rod, Super Rod), Union Cave 1f (Good Rod, Old Rod, Super Rod), Union Cave B1f (Good Rod, Old Rod, Super Rod), Union Cave B2f (Good Rod, Old Rod), Vermilion City Area (Good Rod, Old Rod), Vermilion City Ss Anne Dock (Good Rod, Old Rod), Violet City Area (Good Rod, Old Rod, Super Rod), Whirl Islands 1f (Good Rod, Old Rod), Whirl Islands B2f (Good Rod, Old Rod), Whirl Islands B3f (Good Rod, Old Rod)',
    crystal: 'Blackthorn City Area (Good Rod, Old Rod, Super Rod, Surfing), Cerulean City Area (Good Rod, Old Rod, Super Rod), Cherrygrove City Area (Good Rod, Old Rod), Cianwood City Area (Good Rod, Old Rod), Cinnabar Island Area (Good Rod, Old Rod), Dark Cave Blackthorn City Entrance (Good Rod, Old Rod, Super Rod, Surfing), Dark Cave Violet City Entrance (Good Rod, Old Rod, Super Rod, Surfing), Dragons Den Area (Good Rod, Old Rod, Super Rod, Surfing), Ecruteak City Area (Good Rod, Old Rod, Super Rod), Fuchsia City Area (Good Rod, Old Rod, Super Rod, Surfing), Ilex Forest Area (Good Rod, Old Rod, Super Rod), Johto Route 30 Area (Good Rod, Old Rod, Super Rod), Johto Route 31 Area (Good Rod, Old Rod, Super Rod), Johto Route 32 Area (Good Rod, Old Rod, Super Rod), Johto Route 34 Area (Good Rod, Old Rod), Johto Route 35 Area (Good Rod, Old Rod, Super Rod), Johto Route 42 Area (Good Rod, Old Rod, Super Rod), Johto Route 43 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Route 44 Area (Good Rod, Old Rod, Super Rod), Johto Route 45 Area (Good Rod, Old Rod, Super Rod, Surfing), Johto Sea Route 40 Area (Good Rod, Old Rod), Johto Sea Route 41 Area (Good Rod, Old Rod), Kanto Route 10 Area (Good Rod, Old Rod, Super Rod), Kanto Route 12 Area (Good Rod, Old Rod, Super Rod), Kanto Route 13 Area (Good Rod, Old Rod, Super Rod), Kanto Route 22 Area (Good Rod, Old Rod, Super Rod), Kanto Route 24 Area (Good Rod, Old Rod, Super Rod), Kanto Route 25 Area (Good Rod, Old Rod, Super Rod), Kanto Route 26 Area (Good Rod, Old Rod), Kanto Route 27 Area (Good Rod, Old Rod), Kanto Route 28 Area (Good Rod, Old Rod, Super Rod), Kanto Route 6 Area (Good Rod, Old Rod, Super Rod), Kanto Route 9 Area (Good Rod, Old Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Old Rod), Kanto Sea Route 20 Area (Good Rod, Old Rod), Kanto Sea Route 21 Area (Good Rod, Old Rod), Lake Of Rage Area (Good Rod, Old Rod, Super Rod, Surfing), Mt Mortar 1f (Good Rod, Old Rod, Super Rod), Mt Mortar B1f (Good Rod, Old Rod, Super Rod), Mt Mortar Upper Cave (Good Rod, Old Rod, Super Rod), Mt Silver 2f (Good Rod, Old Rod, Super Rod), Mt Silver Outside (Good Rod, Old Rod, Super Rod), New Bark Town Area (Good Rod, Old Rod), Olivine City Area (Good Rod, Old Rod), Pallet Town Area (Good Rod, Old Rod), Ruins Of Alph Outside (Good Rod, Old Rod, Super Rod), Slowpoke Well 1f (Good Rod, Old Rod, Super Rod), Slowpoke Well B1f (Good Rod, Old Rod, Super Rod), Tohjo Falls Area (Good Rod, Old Rod, Super Rod), Union Cave 1f (Good Rod, Old Rod, Super Rod), Union Cave B1f (Good Rod, Old Rod, Super Rod), Union Cave B2f (Good Rod, Old Rod), Vermilion City Area (Good Rod, Old Rod), Vermilion City Ss Anne Dock (Good Rod, Old Rod), Violet City Area (Good Rod, Old Rod, Super Rod), Whirl Islands 1f (Good Rod, Old Rod), Whirl Islands B2f (Good Rod, Old Rod), Whirl Islands B3f (Good Rod, Old Rod)',
  },
  130: { // Gyarados
    gold: 'Fuchsia City Area (Good Rod, Super Rod), Lake Of Rage Area (Good Rod, Only One, Super Rod, Surfing)',
    silver: 'Fuchsia City Area (Good Rod, Super Rod), Lake Of Rage Area (Good Rod, Only One, Super Rod, Surfing)',
    crystal: 'Fuchsia City Area (Good Rod, Super Rod), Lake Of Rage Area (Good Rod, Only One, Super Rod, Surfing)',
  },
  131: { // Lapras
    gold: 'Union Cave B2f (Only One)',
    silver: 'Union Cave B2f (Only One)',
    crystal: 'Union Cave B2f (Only One)',
  },
  132: { // Ditto
    gold: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking)',
    silver: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking)',
    crystal: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking)',
  },
  133: { // Eevee
    gold: 'Celadon City Prize Corner (Gift), Goldenrod City Bills House (Gift)',
    silver: 'Celadon City Prize Corner (Gift), Goldenrod City Bills House (Gift)',
    crystal: 'Goldenrod City Bills House (Gift)',
  },
  134: { // Vaporeon
    gold: 'Evolve Eevee (Water Stone)',
    silver: 'Evolve Eevee (Water Stone)',
    crystal: 'Evolve Eevee (Water Stone)',
  },
  135: { // Jolteon
    gold: 'Evolve Eevee (Thunder Stone)',
    silver: 'Evolve Eevee (Thunder Stone)',
    crystal: 'Evolve Eevee (Thunder Stone)',
  },
  136: { // Flareon
    gold: 'Evolve Eevee (Fire Stone)',
    silver: 'Evolve Eevee (Fire Stone)',
    crystal: 'Evolve Eevee (Fire Stone)',
  },
  137: { // Porygon
    gold: 'Celadon City Prize Corner (Gift)',
    silver: 'Celadon City Prize Corner (Gift)',
    crystal: 'Celadon City Prize Corner (Gift)',
  },
  138: { // Omanyte
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  139: { // Omastar
    gold: 'Evolve Omanyte (Lv 40)',
    silver: 'Evolve Omanyte (Lv 40)',
    crystal: 'Evolve Omanyte (Lv 40)',
  },
  140: { // Kabuto
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  141: { // Kabutops
    gold: 'Evolve Kabuto (Lv 40)',
    silver: 'Evolve Kabuto (Lv 40)',
    crystal: 'Evolve Kabuto (Lv 40)',
  },
  142: { // Aerodactyl
    gold: 'Kanto Route 14 Area (Npc Trade)',
    silver: 'Kanto Route 14 Area (Npc Trade)',
    crystal: 'Kanto Route 14 Area (Npc Trade)',
  },
  143: { // Snorlax
    gold: 'Vermilion City Area (Pokeflute)',
    silver: 'Vermilion City Area (Pokeflute)',
    crystal: 'Vermilion City Area (Pokeflute)',
  },
  144: { // Articuno
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  145: { // Zapdos
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  146: { // Moltres
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  147: { // Dratini
    gold: 'Dragons Den Area (Good Rod, Super Rod, Surfing), Goldenrod City Game Corner (Gift), Johto Route 45 Area (Good Rod, Super Rod)',
    silver: 'Dragons Den Area (Good Rod, Super Rod, Surfing), Goldenrod City Game Corner (Gift), Johto Route 45 Area (Good Rod, Super Rod)',
    crystal: 'Dragons Den Area (Gift, Good Rod, Super Rod, Surfing), Johto Route 45 Area (Good Rod, Super Rod)',
  },
  148: { // Dragonair
    gold: 'Dragons Den Area (Super Rod), Johto Route 45 Area (Super Rod)',
    silver: 'Dragons Den Area (Super Rod), Johto Route 45 Area (Super Rod)',
    crystal: 'Dragons Den Area (Super Rod), Johto Route 45 Area (Super Rod)',
  },
  149: { // Dragonite
    gold: 'Evolve Dragonair (Lv 55)',
    silver: 'Evolve Dragonair (Lv 55)',
    crystal: 'Evolve Dragonair (Lv 55)',
  },
  150: { // Mewtwo
    gold: 'Trade from Red/Blue/Yellow',
    silver: 'Trade from Red/Blue/Yellow',
    crystal: 'Trade from Red/Blue/Yellow',
  },
  151: { // Mew
    gold: 'Event only',
    silver: 'Event only',
    crystal: 'Event only',
  },
  152: { // Chikorita
    gold: 'New Bark Town Area (Gift)',
    silver: 'New Bark Town Area (Gift)',
    crystal: 'New Bark Town Area (Gift)',
  },
  153: { // Bayleef
    gold: 'Evolve Chikorita (Lv 16)',
    silver: 'Evolve Chikorita (Lv 16)',
    crystal: 'Evolve Chikorita (Lv 16)',
  },
  154: { // Meganium
    gold: 'Evolve Bayleef (Lv 32)',
    silver: 'Evolve Bayleef (Lv 32)',
    crystal: 'Evolve Bayleef (Lv 32)',
  },
  155: { // Cyndaquil
    gold: 'New Bark Town Area (Gift)',
    silver: 'New Bark Town Area (Gift)',
    crystal: 'New Bark Town Area (Gift)',
  },
  156: { // Quilava
    gold: 'Evolve Cyndaquil (Lv 14)',
    silver: 'Evolve Cyndaquil (Lv 14)',
    crystal: 'Evolve Cyndaquil (Lv 14)',
  },
  157: { // Typhlosion
    gold: 'Evolve Quilava (Lv 36)',
    silver: 'Evolve Quilava (Lv 36)',
    crystal: 'Evolve Quilava (Lv 36)',
  },
  158: { // Totodile
    gold: 'New Bark Town Area (Gift)',
    silver: 'New Bark Town Area (Gift)',
    crystal: 'New Bark Town Area (Gift)',
  },
  159: { // Croconaw
    gold: 'Evolve Totodile (Lv 18)',
    silver: 'Evolve Totodile (Lv 18)',
    crystal: 'Evolve Totodile (Lv 18)',
  },
  160: { // Feraligatr
    gold: 'Evolve Croconaw (Lv 30)',
    silver: 'Evolve Croconaw (Lv 30)',
    crystal: 'Evolve Croconaw (Lv 30)',
  },
  161: { // Sentret
    gold: 'Johto Route 29 Area (Walking), Kanto Route 1 Area (Walking)',
    silver: 'Johto Route 29 Area (Walking), Kanto Route 1 Area (Walking)',
    crystal: 'Johto Route 29 Area (Walking), Johto Route 43 Area (Walking), Kanto Route 1 Area (Walking)',
  },
  162: { // Furret
    gold: 'Kanto Route 1 Area (Walking)',
    silver: 'Kanto Route 1 Area (Walking)',
    crystal: 'Johto Route 43 Area (Walking), Kanto Route 1 Area (Walking)',
  },
  163: { // Hoothoot
    gold: 'Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 35 Area (Walking), Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), National Park Area (Walking)',
    silver: 'Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 35 Area (Walking), Johto Route 36 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 1 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), National Park Area (Walking)',
    crystal: 'Ilex Forest Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 29 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 30 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 31 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 32 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 34 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 35 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 36 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 37 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Johto Route 38 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 43 Area (Headbutt High, Headbutt Low, Headbutt Normal, Walking), Kanto Route 1 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 26 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 27 Area (Headbutt High, Headbutt Low, Headbutt Normal), Kanto Route 5 Area (Walking), Lake Of Rage Area (Headbutt High, Headbutt Low, Headbutt Normal), National Park Area (Walking)',
  },
  164: { // Noctowl
    gold: 'Johto Route 43 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 8 Area (Walking)',
    silver: 'Johto Route 43 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 8 Area (Walking)',
    crystal: 'Ilex Forest Area (Headbutt Low, Headbutt Normal), Johto Route 37 Area (Walking), Johto Route 38 Area (Walking), Johto Route 39 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking), Kanto Route 25 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  165: { // Ledyba
    gold: 'Not available in this version',
    silver: 'Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking)',
    crystal: 'Johto Route 29 Area (Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 31 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 34 Area (Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 37 Area (Headbutt Low, Headbutt Normal), Johto Route 38 Area (Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), National Park Area (Walking)',
  },
  166: { // Ledian
    gold: 'Not available in this version',
    silver: 'Kanto Route 2 South Towards Viridian City (Walking)',
    crystal: 'Kanto Route 2 South Towards Viridian City (Walking)',
  },
  167: { // Spinarak
    gold: 'Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 37 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking)',
    silver: 'Not available in this version',
    crystal: 'Johto Route 29 Area (Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 31 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 34 Area (Headbutt Low, Headbutt Normal), Johto Route 35 Area (Headbutt Low, Headbutt Normal), Johto Route 36 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 37 Area (Headbutt Low, Headbutt Normal, Walking), Johto Route 38 Area (Headbutt Low, Headbutt Normal), Johto Route 39 Area (Headbutt Low, Headbutt Normal), Kanto Route 2 South Towards Viridian City (Walking), National Park Area (Walking)',
  },
  168: { // Ariados
    gold: 'Kanto Route 2 South Towards Viridian City (Walking)',
    silver: 'Not available in this version',
    crystal: 'Johto Route 37 Area (Walking), Kanto Route 2 South Towards Viridian City (Walking)',
  },
  169: { // Crobat
    gold: 'Evolve Golbat (happiness)',
    silver: 'Evolve Golbat (happiness)',
    crystal: 'Evolve Golbat (happiness)',
  },
  170: { // Chinchou
    gold: 'Cinnabar Island Area (Good Rod, Super Rod), Johto Sea Route 41 Area (Good Rod, Super Rod), Kanto Route 26 Area (Good Rod, Super Rod), Kanto Route 27 Area (Good Rod, Super Rod), Kanto Sea Route 20 Area (Good Rod, Super Rod), Kanto Sea Route 21 Area (Good Rod, Super Rod), New Bark Town Area (Good Rod, Super Rod), Pallet Town Area (Good Rod, Super Rod), Vermilion City Area (Good Rod, Super Rod), Vermilion City Ss Anne Dock (Good Rod, Super Rod)',
    silver: 'Cinnabar Island Area (Good Rod, Super Rod), Johto Sea Route 41 Area (Good Rod, Super Rod), Kanto Route 26 Area (Good Rod, Super Rod), Kanto Route 27 Area (Good Rod, Super Rod), Kanto Sea Route 20 Area (Good Rod, Super Rod), Kanto Sea Route 21 Area (Good Rod, Super Rod), New Bark Town Area (Good Rod, Super Rod), Pallet Town Area (Good Rod, Super Rod), Vermilion City Area (Good Rod, Super Rod), Vermilion City Ss Anne Dock (Good Rod, Super Rod)',
    crystal: 'Cinnabar Island Area (Good Rod, Super Rod), Johto Sea Route 41 Area (Good Rod, Super Rod), Kanto Route 26 Area (Good Rod, Super Rod), Kanto Route 27 Area (Good Rod, Super Rod), Kanto Sea Route 20 Area (Good Rod, Super Rod), Kanto Sea Route 21 Area (Good Rod, Super Rod), New Bark Town Area (Good Rod, Super Rod), Pallet Town Area (Good Rod, Super Rod), Vermilion City Area (Good Rod, Super Rod), Vermilion City Ss Anne Dock (Good Rod, Super Rod)',
  },
  171: { // Lanturn
    gold: 'Cinnabar Island Area (Super Rod), Johto Sea Route 41 Area (Super Rod), Kanto Route 26 Area (Super Rod), Kanto Route 27 Area (Super Rod), Kanto Sea Route 20 Area (Super Rod), Kanto Sea Route 21 Area (Super Rod), New Bark Town Area (Super Rod), Pallet Town Area (Super Rod), Vermilion City Area (Super Rod), Vermilion City Ss Anne Dock (Super Rod)',
    silver: 'Cinnabar Island Area (Super Rod), Johto Sea Route 41 Area (Super Rod), Kanto Route 26 Area (Super Rod), Kanto Route 27 Area (Super Rod), Kanto Sea Route 20 Area (Super Rod), Kanto Sea Route 21 Area (Super Rod), New Bark Town Area (Super Rod), Pallet Town Area (Super Rod), Vermilion City Area (Super Rod), Vermilion City Ss Anne Dock (Super Rod)',
    crystal: 'Cinnabar Island Area (Super Rod), Johto Sea Route 41 Area (Super Rod), Kanto Route 26 Area (Super Rod), Kanto Route 27 Area (Super Rod), Kanto Sea Route 20 Area (Super Rod), Kanto Sea Route 21 Area (Super Rod), New Bark Town Area (Super Rod), Pallet Town Area (Super Rod), Vermilion City Area (Super Rod), Vermilion City Ss Anne Dock (Super Rod)',
  },
  172: { // Pichu
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Johto Route 34 Area (Gift Egg)',
  },
  173: { // Cleffa
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Johto Route 34 Area (Gift Egg)',
  },
  174: { // Igglybuff
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Johto Route 34 Area (Gift Egg)',
  },
  175: { // Togepi
    gold: 'Violet City Area (Gift Egg)',
    silver: 'Violet City Area (Gift Egg)',
    crystal: 'Violet City Area (Gift Egg)',
  },
  176: { // Togetic
    gold: 'Evolve Togepi (happiness)',
    silver: 'Evolve Togepi (happiness)',
    crystal: 'Evolve Togepi (happiness)',
  },
  177: { // Natu
    gold: 'Ruins Of Alph Outside (Walking)',
    silver: 'Ruins Of Alph Outside (Walking)',
    crystal: 'Ruins Of Alph Outside (Walking)',
  },
  178: { // Xatu
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Pewter City Area (Npc Trade)',
  },
  179: { // Mareep
    gold: 'Johto Route 32 Area (Walking), Johto Route 42 Area (Walking), Johto Route 43 Area (Walking)',
    silver: 'Johto Route 32 Area (Walking), Johto Route 42 Area (Walking), Johto Route 43 Area (Walking)',
    crystal: 'Not available in this version',
  },
  180: { // Flaaffy
    gold: 'Johto Route 42 Area (Walking), Johto Route 43 Area (Walking)',
    silver: 'Johto Route 42 Area (Walking), Johto Route 43 Area (Walking)',
    crystal: 'Not available in this version',
  },
  181: { // Ampharos
    gold: 'Evolve Flaaffy (Lv 30)',
    silver: 'Evolve Flaaffy (Lv 30)',
    crystal: 'Evolve Flaaffy (Lv 30)',
  },
  182: { // Bellossom
    gold: 'Evolve Gloom (Sun Stone)',
    silver: 'Evolve Gloom (Sun Stone)',
    crystal: 'Evolve Gloom (Sun Stone)',
  },
  183: { // Marill
    gold: 'Mt Mortar 1f (Surfing, Walking)',
    silver: 'Mt Mortar 1f (Surfing, Walking)',
    crystal: 'Johto Route 42 Area (Walking), Mt Mortar 1f (Surfing, Walking), Mt Mortar B1f (Surfing, Walking), Mt Mortar Lower Cave (Walking), Mt Mortar Upper Cave (Surfing, Walking)',
  },
  184: { // Azumarill
    gold: 'Evolve Marill (happiness)',
    silver: 'Evolve Marill (happiness)',
    crystal: 'Evolve Marill (happiness)',
  },
  185: { // Sudowoodo
    gold: 'Johto Route 36 Area (Squirt Bottle)',
    silver: 'Johto Route 36 Area (Squirt Bottle)',
    crystal: 'Johto Route 36 Area (Squirt Bottle)',
  },
  186: { // Politoed
    gold: 'Trade Poliwhirl holding King\'s Rock',
    silver: 'Trade Poliwhirl holding King\'s Rock',
    crystal: 'Trade Poliwhirl holding King\'s Rock',
  },
  187: { // Hoppip
    gold: 'Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    silver: 'Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
    crystal: 'Johto Route 29 Area (Walking), Johto Route 30 Area (Walking), Johto Route 31 Area (Walking), Johto Route 32 Area (Walking), Johto Route 33 Area (Walking), Kanto Route 11 Area (Walking), Kanto Route 13 Area (Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking)',
  },
  188: { // Skiploom
    gold: 'Kanto Route 14 Area (Walking)',
    silver: 'Kanto Route 14 Area (Walking)',
    crystal: 'Kanto Route 14 Area (Walking)',
  },
  189: { // Jumpluff
    gold: 'Evolve Skiploom (Lv 27)',
    silver: 'Evolve Skiploom (Lv 27)',
    crystal: 'Evolve Skiploom (Lv 27)',
  },
  190: { // Aipom
    gold: 'Johto Route 29 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 31 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 32 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 33 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 42 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 43 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 44 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 45 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 46 Area (Headbutt High, Headbutt Low, Headbutt Normal)',
    silver: 'Johto Route 29 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 30 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 31 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 32 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 33 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 42 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 43 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 44 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 45 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 46 Area (Headbutt High, Headbutt Low, Headbutt Normal)',
    crystal: 'Azalea Town Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 33 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 42 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 44 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 45 Area (Headbutt High, Headbutt Low, Headbutt Normal), Johto Route 46 Area (Headbutt High, Headbutt Low, Headbutt Normal)',
  },
  191: { // Sunkern
    gold: 'Kanto Route 24 Area (Walking), National Park Area (Walking)',
    silver: 'Kanto Route 24 Area (Walking), National Park Area (Walking)',
    crystal: 'Kanto Route 24 Area (Walking), National Park Area (Walking)',
  },
  192: { // Sunflora
    gold: 'Evolve Sunkern (Sun Stone)',
    silver: 'Evolve Sunkern (Sun Stone)',
    crystal: 'Evolve Sunkern (Sun Stone)',
  },
  193: { // Yanma
    gold: 'Johto Route 35 Area (Walking)',
    silver: 'Johto Route 35 Area (Walking)',
    crystal: 'Johto Route 35 Area (Walking)',
  },
  194: { // Wooper
    gold: 'Johto Route 32 Area (Walking), Ruins Of Alph Outside (Surfing), Union Cave 1f (Surfing), Union Cave B1f (Surfing)',
    silver: 'Johto Route 32 Area (Walking), Ruins Of Alph Outside (Surfing), Union Cave 1f (Surfing), Union Cave B1f (Surfing)',
    crystal: 'Johto Route 32 Area (Walking), Ruins Of Alph Outside (Surfing, Walking), Union Cave 1f (Surfing, Walking), Union Cave B1f (Surfing, Walking)',
  },
  195: { // Quagsire
    gold: 'Johto Route 32 Area (Surfing), Kanto Route 10 Area (Walking), Kanto Route 12 Area (Surfing), Kanto Route 13 Area (Surfing, Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Mt Silver 2f (Walking), Ruins Of Alph Outside (Surfing), Union Cave 1f (Surfing), Union Cave B1f (Surfing), Union Cave B2f (Surfing)',
    silver: 'Johto Route 32 Area (Surfing), Kanto Route 10 Area (Walking), Kanto Route 12 Area (Surfing), Kanto Route 13 Area (Surfing, Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Mt Silver 2f (Walking), Ruins Of Alph Outside (Surfing), Union Cave 1f (Surfing), Union Cave B1f (Surfing), Union Cave B2f (Surfing)',
    crystal: 'Johto Route 32 Area (Surfing), Kanto Route 12 Area (Surfing), Kanto Route 13 Area (Surfing, Walking), Kanto Route 14 Area (Walking), Kanto Route 15 Area (Walking), Kanto Route 26 Area (Walking), Kanto Route 27 Area (Walking), Mt Silver 2f (Walking), Ruins Of Alph Outside (Surfing, Walking), Union Cave 1f (Surfing), Union Cave B1f (Surfing), Union Cave B2f (Surfing, Walking)',
  },
  196: { // Espeon
    gold: 'Evolve Eevee (happiness, daytime)',
    silver: 'Evolve Eevee (happiness, daytime)',
    crystal: 'Evolve Eevee (happiness, daytime)',
  },
  197: { // Umbreon
    gold: 'Evolve Eevee (happiness, nighttime)',
    silver: 'Evolve Eevee (happiness, nighttime)',
    crystal: 'Evolve Eevee (happiness, nighttime)',
  },
  198: { // Murkrow
    gold: 'Kanto Route 16 Area (Walking), Kanto Route 18 Area (Walking), Kanto Route 7 Area (Walking)',
    silver: 'Kanto Route 16 Area (Walking), Kanto Route 18 Area (Walking), Kanto Route 7 Area (Walking)',
    crystal: 'Kanto Route 16 Area (Walking), Kanto Route 7 Area (Walking)',
  },
  199: { // Slowking
    gold: 'Trade Slowpoke holding King\'s Rock',
    silver: 'Trade Slowpoke holding King\'s Rock',
    crystal: 'Trade Slowpoke holding King\'s Rock',
  },
  200: { // Misdreavus
    gold: 'Mt Silver 2f (Walking)',
    silver: 'Mt Silver 2f (Walking)',
    crystal: 'Mt Silver 2f (Walking)',
  },
  201: { // Unown
    gold: 'Ruins Of Alph Interior A (Walking), Ruins Of Alph Interior B (Walking), Ruins Of Alph Interior C (Walking), Ruins Of Alph Interior D (Walking)',
    silver: 'Ruins Of Alph Interior A (Walking), Ruins Of Alph Interior B (Walking), Ruins Of Alph Interior C (Walking), Ruins Of Alph Interior D (Walking)',
    crystal: 'Ruins Of Alph Interior A (Walking), Ruins Of Alph Interior B (Walking), Ruins Of Alph Interior C (Walking), Ruins Of Alph Interior D (Walking)',
  },
  202: { // Wobbuffet
    gold: 'Dark Cave Blackthorn City Entrance (Walking)',
    silver: 'Dark Cave Blackthorn City Entrance (Walking)',
    crystal: 'Dark Cave Blackthorn City Entrance (Walking), Goldenrod City Game Corner (Gift)',
  },
  203: { // Girafarig
    gold: 'Johto Route 43 Area (Walking)',
    silver: 'Johto Route 43 Area (Walking)',
    crystal: 'Not available in this version',
  },
  204: { // Pineco
    gold: 'Azalea Town Area (Headbutt High), Ilex Forest Area (Headbutt High), Johto Route 34 Area (Headbutt High), Johto Route 35 Area (Headbutt High), Johto Route 36 Area (Headbutt High), Johto Route 37 Area (Headbutt High), Johto Route 38 Area (Headbutt High), Johto Route 39 Area (Headbutt High), Kanto Route 26 Area (Headbutt High), Kanto Route 27 Area (Headbutt High), Lake Of Rage Area (Headbutt High)',
    silver: 'Azalea Town Area (Headbutt High), Ilex Forest Area (Headbutt High), Johto Route 34 Area (Headbutt High), Johto Route 35 Area (Headbutt High), Johto Route 36 Area (Headbutt High), Johto Route 37 Area (Headbutt High), Johto Route 38 Area (Headbutt High), Johto Route 39 Area (Headbutt High), Kanto Route 26 Area (Headbutt High), Kanto Route 27 Area (Headbutt High), Lake Of Rage Area (Headbutt High)',
    crystal: 'Ilex Forest Area (Headbutt Low, Headbutt Normal), Johto Route 29 Area (Headbutt High), Johto Route 30 Area (Headbutt High), Johto Route 31 Area (Headbutt High), Johto Route 32 Area (Headbutt High), Johto Route 34 Area (Headbutt High), Johto Route 35 Area (Headbutt High), Johto Route 36 Area (Headbutt High), Johto Route 37 Area (Headbutt High), Johto Route 38 Area (Headbutt High), Johto Route 39 Area (Headbutt High), Johto Route 43 Area (Headbutt High), Kanto Route 26 Area (Headbutt High), Kanto Route 27 Area (Headbutt High), Lake Of Rage Area (Headbutt High)',
  },
  205: { // Forretress
    gold: 'Evolve Pineco (Lv 31)',
    silver: 'Evolve Pineco (Lv 31)',
    crystal: 'Evolve Pineco (Lv 31)',
  },
  206: { // Dunsparce
    gold: 'Dark Cave Violet City Entrance (Walking)',
    silver: 'Dark Cave Violet City Entrance (Walking)',
    crystal: 'Dark Cave Violet City Entrance (Walking)',
  },
  207: { // Gligar
    gold: 'Johto Route 45 Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Johto Route 45 Area (Walking)',
  },
  208: { // Steelix
    gold: 'Trade Onix holding Metal Coat',
    silver: 'Trade Onix holding Metal Coat',
    crystal: 'Victory Road, Rock Smash',
  },
  209: { // Snubbull
    gold: 'Johto Route 38 Area (Walking)',
    silver: 'Johto Route 38 Area (Walking)',
    crystal: 'Johto Route 34 Area (Walking), Johto Route 35 Area (Walking), Kanto Route 5 Area (Walking), Kanto Route 6 Area (Walking), Kanto Route 7 Area (Walking), Kanto Route 8 Area (Walking)',
  },
  210: { // Granbull
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Kanto Route 6 Area (Walking)',
  },
  211: { // Qwilfish
    gold: 'Johto Route 32 Area (Good Rod, Old Rod, Super Rod), Kanto Route 12 Area (Super Rod), Kanto Route 13 Area (Super Rod)',
    silver: 'Johto Route 32 Area (Good Rod, Old Rod, Super Rod), Kanto Route 12 Area (Super Rod), Kanto Route 13 Area (Super Rod)',
    crystal: 'Johto Route 32 Area (Good Rod, Old Rod, Super Rod), Kanto Route 12 Area (Super Rod), Kanto Route 13 Area (Super Rod)',
  },
  212: { // Scizor
    gold: 'Trade Scyther holding Metal Coat',
    silver: 'Trade Scyther holding Metal Coat',
    crystal: 'Trade Scyther holding Metal Coat',
  },
  213: { // Shuckle
    gold: 'Cianwood City Area (Rock Smash), Cianwood City Manias House (Gift), Dark Cave Violet City Entrance (Rock Smash), Johto Sea Route 40 Area (Rock Smash)',
    silver: 'Cianwood City Area (Rock Smash), Cianwood City Manias House (Gift), Dark Cave Violet City Entrance (Rock Smash), Johto Sea Route 40 Area (Rock Smash)',
    crystal: 'Cianwood City Area (Rock Smash), Cianwood City Manias House (Gift), Dark Cave Violet City Entrance (Rock Smash), Johto Sea Route 40 Area (Rock Smash)',
  },
  214: { // Heracross
    gold: 'Johto Route 29 Area (Headbutt High), Johto Route 30 Area (Headbutt High), Johto Route 31 Area (Headbutt High), Johto Route 32 Area (Headbutt High), Johto Route 33 Area (Headbutt High), Johto Route 42 Area (Headbutt High), Johto Route 43 Area (Headbutt High), Johto Route 44 Area (Headbutt High), Johto Route 45 Area (Headbutt High), Johto Route 46 Area (Headbutt High)',
    silver: 'Johto Route 29 Area (Headbutt High), Johto Route 30 Area (Headbutt High), Johto Route 31 Area (Headbutt High), Johto Route 32 Area (Headbutt High), Johto Route 33 Area (Headbutt High), Johto Route 42 Area (Headbutt High), Johto Route 43 Area (Headbutt High), Johto Route 44 Area (Headbutt High), Johto Route 45 Area (Headbutt High), Johto Route 46 Area (Headbutt High)',
    crystal: 'Azalea Town Area (Headbutt High), Johto Route 33 Area (Headbutt High), Johto Route 42 Area (Headbutt High), Johto Route 44 Area (Headbutt High), Johto Route 45 Area (Headbutt High), Johto Route 46 Area (Headbutt High)',
  },
  215: { // Sneasel
    gold: 'Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    silver: 'Kanto Route 28 Area (Walking), Mt Silver Outside (Walking)',
    crystal: 'Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
  },
  216: { // Teddiursa
    gold: 'Johto Route 45 Area (Walking)',
    silver: 'Not available in this version',
    crystal: 'Dark Cave Blackthorn City Entrance (Walking), Dark Cave Violet City Entrance (Walking)',
  },
  217: { // Ursaring
    gold: 'Kanto Route 28 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Outside (Walking), Mt Silver Top (Walking)',
    silver: 'Not available in this version',
    crystal: 'Dark Cave Blackthorn City Entrance (Walking), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Top (Walking)',
  },
  218: { // Slugma
    gold: 'Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
    silver: 'Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
    crystal: 'Kanto Route 16 Area (Walking), Kanto Route 17 Area (Walking), Kanto Route 18 Area (Walking)',
  },
  219: { // Magcargo
    gold: 'Evolve Slugma (Lv 38)',
    silver: 'Evolve Slugma (Lv 38)',
    crystal: 'Evolve Slugma (Lv 38)',
  },
  220: { // Swinub
    gold: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
    silver: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
    crystal: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
  },
  221: { // Piloswine
    gold: 'Evolve Swinub (Lv 33)',
    silver: 'Evolve Swinub (Lv 33)',
    crystal: 'Evolve Swinub (Lv 33)',
  },
  222: { // Corsola
    gold: 'Cherrygrove City Area (Good Rod, Super Rod), Cianwood City Area (Good Rod, Super Rod), Johto Route 34 Area (Good Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Super Rod), Olivine City Area (Good Rod, Super Rod), Union Cave B2f (Good Rod, Super Rod)',
    silver: 'Cherrygrove City Area (Good Rod, Super Rod), Cianwood City Area (Good Rod, Super Rod), Johto Route 34 Area (Good Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Super Rod), Olivine City Area (Good Rod, Super Rod), Union Cave B2f (Good Rod, Super Rod)',
    crystal: 'Cherrygrove City Area (Good Rod, Super Rod), Cianwood City Area (Good Rod, Super Rod), Johto Route 34 Area (Good Rod, Super Rod), Johto Sea Route 40 Area (Good Rod, Super Rod), Kanto Sea Route 19 Area (Good Rod, Super Rod), Olivine City Area (Good Rod, Super Rod), Union Cave B2f (Good Rod, Super Rod)',
  },
  223: { // Remoraid
    gold: 'Johto Route 44 Area (Good Rod, Old Rod, Super Rod)',
    silver: 'Johto Route 44 Area (Good Rod, Old Rod, Super Rod)',
    crystal: 'Not available in this version',
  },
  224: { // Octillery
    gold: 'Evolve Remoraid (Lv 25)',
    silver: 'Evolve Remoraid (Lv 25)',
    crystal: 'Evolve Remoraid (Lv 25)',
  },
  225: { // Delibird
    gold: 'Not available in this version',
    silver: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
    crystal: 'Ice Path 1f (Walking), Ice Path B1f (Walking), Ice Path B2f (Walking), Ice Path B3f (Walking)',
  },
  226: { // Mantine
    gold: 'Johto Sea Route 41 Area (Surfing)',
    silver: 'Not available in this version',
    crystal: 'Johto Sea Route 41 Area (Surfing)',
  },
  227: { // Skarmory
    gold: 'Not available in this version',
    silver: 'Johto Route 45 Area (Walking)',
    crystal: 'Johto Route 45 Area (Walking)',
  },
  228: { // Houndour
    gold: 'Kanto Route 7 Area (Walking)',
    silver: 'Kanto Route 7 Area (Walking)',
    crystal: 'Kanto Route 7 Area (Walking)',
  },
  229: { // Houndoom
    gold: 'Evolve Houndour (Lv 24)',
    silver: 'Evolve Houndour (Lv 24)',
    crystal: 'Evolve Houndour (Lv 24)',
  },
  230: { // Kingdra
    gold: 'Trade Seadra holding Dragon Scale',
    silver: 'Trade Seadra holding Dragon Scale',
    crystal: 'Trade Seadra holding Dragon Scale',
  },
  231: { // Phanpy
    gold: 'Not available in this version',
    silver: 'Johto Route 45 Area (Walking)',
    crystal: 'Johto Route 45 Area (Walking), Johto Route 46 Area (Walking)',
  },
  232: { // Donphan
    gold: 'Not available in this version',
    silver: 'Kanto Route 28 Area (Walking), Kanto Victory Road 1 1f (Walking), Kanto Victory Road 1 2f (Walking), Kanto Victory Road 1 3f (Walking), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Outside (Walking), Mt Silver Top (Walking)',
    crystal: 'Johto Route 45 Area (Walking)',
  },
  233: { // Porygon2
    gold: 'Trade Porygon holding Up-Grade',
    silver: 'Trade Porygon holding Up-Grade',
    crystal: 'Trade Porygon holding Up-Grade',
  },
  234: { // Stantler
    gold: 'Johto Route 36 Area (Walking), Johto Route 37 Area (Walking)',
    silver: 'Johto Route 36 Area (Walking), Johto Route 37 Area (Walking)',
    crystal: 'Johto Route 37 Area (Walking)',
  },
  235: { // Smeargle
    gold: 'Ruins Of Alph Outside (Walking)',
    silver: 'Ruins Of Alph Outside (Walking)',
    crystal: 'Ruins Of Alph Outside (Walking)',
  },
  236: { // Tyrogue
    gold: 'Mt Mortar B1f (Gift)',
    silver: 'Mt Mortar B1f (Gift)',
    crystal: 'Johto Route 34 Area (Gift Egg), Mt Mortar B1f (Gift)',
  },
  237: { // Hitmontop
    gold: 'Evolve Tyrogue (Attack = Defense, Lv 20)',
    silver: 'Evolve Tyrogue (Attack = Defense, Lv 20)',
    crystal: 'Evolve Tyrogue (Attack = Defense, Lv 20)',
  },
  238: { // Smoochum
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Johto Route 34 Area (Gift Egg)',
  },
  239: { // Elekid
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Johto Route 34 Area (Gift Egg)',
  },
  240: { // Magby
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Johto Route 34 Area (Gift Egg)',
  },
  241: { // Miltank
    gold: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
    silver: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
    crystal: 'Johto Route 38 Area (Walking), Johto Route 39 Area (Walking)',
  },
  242: { // Blissey
    gold: 'Evolve Chansey (happiness)',
    silver: 'Evolve Chansey (happiness)',
    crystal: 'Evolve Chansey (happiness)',
  },
  243: { // Raikou
    gold: 'Roaming Johto (after awakening at Burned Tower)',
    silver: 'Roaming Johto (after awakening at Burned Tower)',
    crystal: 'Roaming Johto (after awakening at Burned Tower)',
  },
  244: { // Entei
    gold: 'Roaming Johto (after awakening at Burned Tower)',
    silver: 'Roaming Johto (after awakening at Burned Tower)',
    crystal: 'Roaming Johto (after awakening at Burned Tower)',
  },
  245: { // Suicune
    gold: 'Roaming Johto (after awakening at Burned Tower)',
    silver: 'Roaming Johto (after awakening at Burned Tower)',
    crystal: 'Tin Tower (fixed encounter, after clearing story events)',
  },
  246: { // Larvitar
    gold: 'Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Top (Walking)',
    silver: 'Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Top (Walking)',
    crystal: 'Celadon City Prize Corner (Gift), Mt Silver 1f (Walking), Mt Silver 2f (Walking), Mt Silver Top (Walking)',
  },
  247: { // Pupitar
    gold: 'Not available in this version',
    silver: 'Not available in this version',
    crystal: 'Mt Silver Top (Walking)',
  },
  248: { // Tyranitar
    gold: 'Evolve Pupitar (Lv 55)',
    silver: 'Evolve Pupitar (Lv 55)',
    crystal: 'Evolve Pupitar (Lv 55)',
  },
  249: { // Lugia
    gold: 'Whirl Islands B2f (Only One)',
    silver: 'Whirl Islands B2f (Only One)',
    crystal: 'Whirl Islands B2f (Only One)',
  },
  250: { // Ho-Oh
    gold: 'Bell Tower Roof (Only One)',
    silver: 'Bell Tower Roof (Only One)',
    crystal: 'Bell Tower Roof (Only One)',
  },
  251: { // Celebi
    gold: 'Event only',
    silver: 'Event only',
    crystal: 'Ilex Forest (GS Ball event, Japanese version only)',
  }
};
