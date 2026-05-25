
// Gen 2 Base PP values for all 252 move indices (0-251)
// Indices 0-165 are shared with Gen 1; indices 166-251 are Gen 2 exclusive
export const GEN2_MOVES_PP = [
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
  10, 10, 20, 10, 10,                     // 161-165
  // Gen 2 exclusive moves (166-251)
  1,  10, 25, 10, 5,                      // 166-170: Sketch, Triple Kick, Thief, Spider Web, Mind Reader
  15, 25, 15, 10, 15,                     // 171-175: Nightmare, Flame Wheel, Snore, Curse, Flail
  30, 5,  40, 15, 10,                     // 176-180: Conversion2, Aeroblast, Cotton Spore, Reversal, Spite
  25, 10, 30, 10, 25,                     // 181-185: Powder Snow, Protect, Mach Punch, Scary Face, Faint Attack
  10, 10, 15, 10, 10,                     // 186-190: Sweet Kiss, Belly Drum, Sludge Bomb, Mud-Slap, Octazooka
  20, 5,  40, 5,  5,                      // 191-195: Spikes, Zap Cannon, Foresight, Destiny Bond, Perish Song
  15, 5,  10, 5,  10,                     // 196-200: Icy Wind, Detection, Bone Rush, Lock-On, Outrage
  10, 5,  10, 20, 20,                     // 201-205: Sandstorm, Giga Drain, Endure, Charm, Rollout
  40, 15, 10, 20, 20,                     // 206-210: False Swipe, Swagger, Milk Drink, Spark, Fury Cutter
  25, 5,  15, 10, 5,                      // 211-215: Steel Wing, Mean Look, Attract, Sleep Talk, Heal Bell
  20, 15, 20, 25, 20,                     // 216-220: Return, Present, Frustration, Safeguard, Pain Split
  5,  30, 5,  10, 20,                     // 221-225: Sacred Fire, Magnitude, Dynamic Punch, Megahorn, Dragon Breath
  40, 5,  20, 40, 20,                     // 226-230: Baton Pass, Encore, Pursuit, Rapid Spin, Sweet Scent
  15, 35, 10, 5,  5,                      // 231-235: Iron Tail, Metal Claw, Vital Throw, Morning Sun, Synthesis
  5,  15, 5,  20, 5,                      // 236-240: Moonlight, Hidden Power, Cross Chop, Twister, Rain Dance
  5,  15, 20, 10, 5,                      // 241-245: Sunny Day, Crunch, Mirror Coat, Psych Up, Extreme Speed
  5,  15, 15, 20, 15,                     // 246-250: Ancient Power, Shadow Ball, Future Sight, Rock Smash, Whirlpool
  10                                       // 251: Beat Up
];

// Gen 2 Move Types for all 252 move indices (0-251)
// Indices 0-165 are shared with Gen 1; indices 166-251 are Gen 2 exclusive
// Note: Move 174 (Curse) is typeless "???" in Gen 2, stored as "Normal" here
export const GEN2_MOVES_TYPE = [
  "-", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Fire", "Ice", "Electric", "Normal", // 0-10
  "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Flying", "Normal", "Flying", "Normal", // 11-20
  "Normal", "Grass", "Normal", "Fighting", "Normal", "Fighting", "Fighting", "Normal", "Normal", "Normal", // 21-30
  "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Poison", // 31-40
  "Bug", "Bug", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", // 41-50
  "Poison", "Fire", "Fire", "Ice", "Water", "Water", "Water", "Ice", "Ice", "Psychic", // 51-60
  "Water", "Ice", "Normal", "Flying", "Flying", "Fighting", "Fighting", "Fighting", "Fighting", "Normal", // 61-70
  "Grass", "Grass", "Grass", "Normal", "Grass", "Grass", "Poison", "Grass", "Grass", "Grass", // 71-80
  "Bug", "Dragon", "Fire", "Electric", "Electric", "Electric", "Electric", "Rock", "Ground", "Ground", // 81-90
  "Ground", "Poison", "Psychic", "Psychic", "Psychic", "Psychic", "Psychic", "Normal", "Normal", "Psychic", // 91-100
  "Ghost", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Ghost", "Water", // 101-110
  "Normal", "Psychic", "Psychic", "Ice", "Psychic", "Normal", "Normal", "Normal", "Flying", "Normal", // 111-120
  "Normal", "Ghost", "Poison", "Poison", "Ground", "Fire", "Water", "Water", "Normal", "Normal", // 121-130
  "Normal", "Normal", "Psychic", "Psychic", "Normal", "Fighting", "Normal", "Psychic", "Poison", "Normal", // 131-140
  "Bug", "Normal", "Flying", "Normal", "Water", "Normal", "Grass", "Normal", "Psychic", "Normal", // 141-150
  "Poison", "Water", "Normal", "Normal", "Ground", "Psychic", "Rock", "Normal", "Normal", "Normal", // 151-160
  "Normal", "Normal", "Normal", "Normal", "Normal", // 161-165
  // Gen 2 exclusive moves (166-251)
  "Normal", "Fighting", "Dark", "Bug", "Normal",     // 166-170: Sketch, Triple Kick, Thief, Spider Web, Mind Reader
  "Ghost", "Fire", "Normal", "Normal", "Normal",     // 171-175: Nightmare, Flame Wheel, Snore, Curse(???), Flail
  "Normal", "Flying", "Grass", "Fighting", "Ghost",  // 176-180: Conversion2, Aeroblast, Cotton Spore, Reversal, Spite
  "Ice", "Normal", "Fighting", "Normal", "Dark",     // 181-185: Powder Snow, Protect, Mach Punch, Scary Face, Faint Attack
  "Normal", "Normal", "Poison", "Ground", "Water",   // 186-190: Sweet Kiss, Belly Drum, Sludge Bomb, Mud-Slap, Octazooka
  "Ground", "Electric", "Normal", "Ghost", "Normal", // 191-195: Spikes, Zap Cannon, Foresight, Destiny Bond, Perish Song
  "Ice", "Fighting", "Ground", "Normal", "Dragon",   // 196-200: Icy Wind, Detection, Bone Rush, Lock-On, Outrage
  "Rock", "Grass", "Normal", "Normal", "Rock",       // 201-205: Sandstorm, Giga Drain, Endure, Charm, Rollout
  "Normal", "Normal", "Normal", "Electric", "Bug",   // 206-210: False Swipe, Swagger, Milk Drink, Spark, Fury Cutter
  "Steel", "Normal", "Normal", "Normal", "Normal",   // 211-215: Steel Wing, Mean Look, Attract, Sleep Talk, Heal Bell
  "Normal", "Normal", "Normal", "Normal", "Normal",  // 216-220: Return, Present, Frustration, Safeguard, Pain Split
  "Fire", "Ground", "Fighting", "Bug", "Dragon",     // 221-225: Sacred Fire, Magnitude, Dynamic Punch, Megahorn, Dragon Breath
  "Normal", "Normal", "Dark", "Normal", "Normal",    // 226-230: Baton Pass, Encore, Pursuit, Rapid Spin, Sweet Scent
  "Steel", "Steel", "Fighting", "Normal", "Grass",   // 231-235: Iron Tail, Metal Claw, Vital Throw, Morning Sun, Synthesis
  "Normal", "Normal", "Fighting", "Dragon", "Water", // 236-240: Moonlight, Hidden Power, Cross Chop, Twister, Rain Dance
  "Fire", "Dark", "Psychic", "Normal", "Normal",     // 241-245: Sunny Day, Crunch, Mirror Coat, Psych Up, Extreme Speed
  "Rock", "Ghost", "Psychic", "Fighting", "Water",   // 246-250: Ancient Power, Shadow Ball, Future Sight, Rock Smash, Whirlpool
  "Dark"                                               // 251: Beat Up
];
