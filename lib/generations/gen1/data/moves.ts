
// Gen 1 Move List (Index 0-165)
export const MOVES_LIST = [
  "-", "Pound", "Karate Chop", "Double Slap", "Comet Punch", "Mega Punch", "Pay Day", "Fire Punch", "Ice Punch", "Thunder Punch", "Scratch",
  "Vice Grip", "Guillotine", "Razor Wind", "Swords Dance", "Cut", "Gust", "Wing Attack", "Whirlwind", "Fly", "Bind",
  "Slam", "Vine Whip", "Stomp", "Double Kick", "Mega Kick", "Jump Kick", "Rolling Kick", "Sand Attack", "Headbutt", "Horn Attack",
  "Fury Attack", "Horn Drill", "Tackle", "Body Slam", "Wrap", "Take Down", "Thrash", "Double-Edge", "Tail Whip", "Poison Sting",
  "Twineedle", "Pin Missile", "Leer", "Bite", "Growl", "Roar", "Sing", "Supersonic", "Sonic Boom", "Disable",
  "Acid", "Ember", "Flamethrower", "Mist", "Water Gun", "Hydro Pump", "Surf", "Ice Beam", "Blizzard", "Psybeam",
  "Bubble Beam", "Aurora Beam", "Hyper Beam", "Peck", "Drill Peck", "Submission", "Low Kick", "Counter", "Seismic Toss", "Strength",
  "Absorb", "Mega Drain", "Leech Seed", "Growth", "Razor Leaf", "Solar Beam", "Poison Powder", "Stun Spore", "Sleep Powder", "Petal Dance",
  "String Shot", "Dragon Rage", "Fire Spin", "Thunder Shock", "Thunderbolt", "Thunder Wave", "Thunder", "Rock Throw", "Earthquake", "Fissure",
  "Dig", "Toxic", "Confusion", "Psychic", "Hypnosis", "Meditate", "Agility", "Quick Attack", "Rage", "Teleport",
  "Night Shade", "Mimic", "Screech", "Double Team", "Recover", "Harden", "Minimize", "Smokescreen", "Confuse Ray", "Withdraw",
  "Defense Curl", "Barrier", "Light Screen", "Haze", "Reflect", "Focus Energy", "Bide", "Metronome", "Mirror Move", "Self-Destruct",
  "Egg Bomb", "Lick", "Smog", "Sludge", "Bone Club", "Fire Blast", "Waterfall", "Clamp", "Swift", "Skull Bash",
  "Spike Cannon", "Constrict", "Amnesia", "Kinesis", "Soft-Boiled", "High Jump Kick", "Glare", "Dream Eater", "Poison Gas", "Barrage",
  "Leech Life", "Lovely Kiss", "Sky Attack", "Transform", "Bubble", "Dizzy Punch", "Spore", "Flash", "Psywave", "Splash",
  "Acid Armor", "Crabhammer", "Explosion", "Fury Swipes", "Bonemerang", "Rest", "Rock Slide", "Hyper Fang", "Sharpen", "Conversion",
  "Tri Attack", "Super Fang", "Slash", "Substitute", "Struggle"
];

// Simplified Move Name getter
export const getMoveName = (id: number): string => {
    return MOVES_LIST[id] || (id === 0 ? '-' : `Move ${id}`);
};

// Base PP values for Gen 1 moves (matching MOVES_LIST index)
export const MOVES_PP = [
    0,  35, 25, 10, 15, 20, 20, 15, 15, 15, 35, // 0-10
    30, 5,  30, 30, 30, 35, 35, 20, 15, 20, // 11-20
    20, 10, 20, 30, 5,  25, 15, 15, 15, 25, // 21-30
    20, 5,  35, 15, 20, 20, 20, 15, 30, 35, // 31-40
    20, 20, 30, 25, 40, 20, 15, 20, 20, 20, // 41-50
    30, 25, 15, 30, 25, 5,  15, 10, 5,  20, // 51-60
    20, 20, 5,  35, 35, 25, 20, 20, 20, 15, // 61-70
    20, 10, 10, 40, 25, 10, 35, 30, 15, 20, // 71-80
    40, 10, 15, 30, 15, 20, 10, 15, 10, 5,  // 81-90
    10, 10, 25, 10, 20, 40, 30, 30, 20, 20, // 91-100
    15, 10, 40, 15, 20, 30, 20, 20, 10, 40, // 101-110
    40, 30, 30, 30, 30, 30, 20, 20, 20, 5,  // 111-120
    10, 30, 20, 20, 20, 5,  15, 20, 20, 15, // 121-130
    15, 30, 20, 15, 10, 20, 30, 15, 40, 20, // 131-140
    15, 10, 5,  10, 30, 10, 15, 20, 15, 40, // 141-150
    40, 15, 5,  15, 10, 10, 10, 15, 30, 30, // 151-160
    10, 10, 20, 10, 10                      // 161-165
];

// Gen 1 Move Types (matching MOVES_LIST index)
export const MOVES_TYPE = [
    "-", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Fire", "Ice", "Electric", "Normal",
    "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Flying", "Normal", "Flying", "Normal",
    "Normal", "Grass", "Normal", "Fighting", "Normal", "Fighting", "Fighting", "Normal", "Normal", "Normal",
    "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Poison",
    "Bug", "Bug", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal",
    "Poison", "Fire", "Fire", "Ice", "Water", "Water", "Water", "Ice", "Ice", "Psychic",
    "Water", "Ice", "Normal", "Flying", "Flying", "Fighting", "Fighting", "Fighting", "Fighting", "Normal",
    "Grass", "Grass", "Grass", "Normal", "Grass", "Grass", "Poison", "Grass", "Grass", "Grass",
    "Bug", "Dragon", "Fire", "Electric", "Electric", "Electric", "Electric", "Rock", "Ground", "Ground",
    "Ground", "Poison", "Psychic", "Psychic", "Psychic", "Psychic", "Psychic", "Normal", "Normal", "Psychic",
    "Ghost", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Ghost", "Water",
    "Normal", "Psychic", "Psychic", "Ice", "Psychic", "Normal", "Normal", "Normal", "Flying", "Normal",
    "Normal", "Ghost", "Poison", "Poison", "Ground", "Fire", "Water", "Water", "Normal", "Normal",
    "Normal", "Normal", "Psychic", "Psychic", "Normal", "Fighting", "Normal", "Psychic", "Poison", "Normal",
    "Bug", "Normal", "Flying", "Normal", "Water", "Normal", "Grass", "Normal", "Psychic", "Normal",
    "Poison", "Water", "Normal", "Normal", "Ground", "Psychic", "Rock", "Normal", "Normal", "Normal",
    "Normal", "Normal", "Normal", "Normal", "Normal"
];
