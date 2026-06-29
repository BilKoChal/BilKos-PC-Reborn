/**
 * Gen 3 move data (Phase 2 Sprint 5).
 * Moves 1-251 reuse Gen 2 names/PP/type (imported).
 * Moves 252-354 are Gen 3-native.
 * Source: Bulbapedia Gen III move list
 */
import { GEN2_MOVES_LIST } from "../../gen2/data/constants";
import { GEN2_MOVES_PP, GEN2_MOVES_TYPE } from "../../gen2/data/moveData";

// Gen 3 move names (1-354) — reuses Gen 2 for 1-251
export const GEN3_MOVES_LIST: string[] = [
  ...GEN2_MOVES_LIST, // 0-251
  "Fake Out", // 252
  "Uproar", // 253
  "Stockpile", // 254
  "Spit Up", // 255
  "Swallow", // 256
  "Heat Wave", // 257
  "Hail", // 258
  "Torment", // 259
  "Flatter", // 260
  "Will-O-Wisp", // 261
  "Memento", // 262
  "Facade", // 263
  "Focus Punch", // 264
  "SmellingSalt", // 265
  "Follow Me", // 266
  "Nature Power", // 267
  "Charge", // 268
  "Taunt", // 269
  "Helping Hand", // 270
  "Trick", // 271
  "Role Play", // 272
  "Wish", // 273
  "Assist", // 274
  "Ingrain", // 275
  "Superpower", // 276
  "Magic Coat", // 277
  "Recycle", // 278
  "Revenge", // 279
  "Brick Break", // 280
  "Yawn", // 281
  "Knock Off", // 282
  "Endeavor", // 283
  "Eruption", // 284
  "Skill Swap", // 285
  "Imprison", // 286
  "Refresh", // 287
  "Grudge", // 288
  "Snatch", // 289
  "Secret Power", // 290
  "Dive", // 291
  "Arm Thrust", // 292
  "Camouflage", // 293
  "Tail Glow", // 294
  "Luster Purge", // 295
  "Mist Ball", // 296
  "FeatherDance", // 297
  "Teeter Dance", // 298
  "Blaze Kick", // 299
  "Mud Sport", // 300
  "Ice Ball", // 301
  "Needle Arm", // 302
  "Slack Off", // 303
  "Hypervoice", // 304
  "Poison Fang", // 305
  "Crush Claw", // 306
  "Blast Burn", // 307
  "Hydro Cannon", // 308
  "Meteor Mash", // 309
  "Astonish", // 310
  "Weather Ball", // 311
  "Aromatherapy", // 312
  "Fake Tears", // 313
  "Air Cutter", // 314
  "Overheat", // 315
  "Odor Sleuth", // 316
  "Rock Tomb", // 317
  "Silver Wind", // 318
  "Metal Sound", // 319
  "GrassWhistle", // 320
  "Tickle", // 321
  "Cosmic Power", // 322
  "Water Spout", // 323
  "Signal Beam", // 324
  "Shadow Punch", // 325
  "Extrasensory", // 326
  "Sky Uppercut", // 327
  "Sand Tomb", // 328
  "Sheer Cold", // 329
  "Muddy Water", // 330
  "Bullet Seed", // 331
  "Aerial Ace", // 332
  "Icicle Spear", // 333
  "Iron Defense", // 334
  "Block", // 335
  "Howl", // 336
  "Dragon Claw", // 337
  "Frenzy Plant", // 338
  "Bulk Up", // 339
  "Bounce", // 340
  "Mud Shot", // 341
  "Poison Tail", // 342
  "Covet", // 343
  "Volt Tackle", // 344
  "Magical Leaf", // 345
  "Water Sport", // 346
  "Calm Mind", // 347
  "Leaf Blade", // 348
  "Dragon Dance", // 349
  "Rock Blast", // 350
  "Shock Wave", // 351
  "Water Pulse", // 352
  "Doom Desire", // 353
  "Psycho Boost", // 354
];

// Gen 3 move PP (1-354)
export const GEN3_MOVES_PP: number[] = [
  ...GEN2_MOVES_PP, // 0-251
  10, // 252
  10, // 253
  10, // 254
  10, // 255
  10, // 256
  10, // 257
  10, // 258
  15, // 259
  15, // 260
  15, // 261
  10, // 262
  20, // 263
  20, // 264
  10, // 265
  20, // 266
  20, // 267
  20, // 268
  20, // 269
  20, // 270
  10, // 271
  10, // 272
  10, // 273
  20, // 274
  20, // 275
  5, // 276
  15, // 277
  10, // 278
  10, // 279
  15, // 280
  10, // 281
  20, // 282
  5, // 283
  5, // 284
  10, // 285
  10, // 286
  20, // 287
  5, // 288
  10, // 289
  20, // 290
  10, // 291
  20, // 292
  20, // 293
  20, // 294
  5, // 295
  5, // 296
  15, // 297
  20, // 298
  10, // 299
  15, // 300
  20, // 301
  15, // 302
  10, // 303
  10, // 304
  15, // 305
  10, // 306
  5, // 307
  5, // 308
  10, // 309
  15, // 310
  10, // 311
  5, // 312
  20, // 313
  25, // 314
  5, // 315
  40, // 316
  10, // 317
  5, // 318
  40, // 319
  15, // 320
  20, // 321
  20, // 322
  5, // 323
  15, // 324
  20, // 325
  30, // 326
  15, // 327
  15, // 328
  5, // 329
  10, // 330
  30, // 331
  20, // 332
  30, // 333
  15, // 334
  5, // 335
  40, // 336
  15, // 337
  5, // 338
  20, // 339
  5, // 340
  15, // 341
  25, // 342
  40, // 343
  15, // 344
  20, // 345
  15, // 346
  20, // 347
  15, // 348
  20, // 349
  10, // 350
  20, // 351
  20, // 352
  5, // 353
  5, // 354
];

// Gen 3 move types (1-354)
export const GEN3_MOVES_TYPE: string[] = [
  ...GEN2_MOVES_TYPE, // 0-251
  "Normal", // 252
  "Normal", // 253
  "Normal", // 254
  "Normal", // 255
  "Normal", // 256
  "Fire", // 257
  "Ice", // 258
  "Dark", // 259
  "Dark", // 260
  "Fire", // 261
  "Dark", // 262
  "Normal", // 263
  "Fighting", // 264
  "Normal", // 265
  "Normal", // 266
  "Normal", // 267
  "Electric", // 268
  "Dark", // 269
  "Normal", // 270
  "Psychic", // 271
  "Psychic", // 272
  "Normal", // 273
  "Normal", // 274
  "Grass", // 275
  "Fighting", // 276
  "Psychic", // 277
  "Normal", // 278
  "Fighting", // 279
  "Fighting", // 280
  "Normal", // 281
  "Dark", // 282
  "Normal", // 283
  "Fire", // 284
  "Psychic", // 285
  "Psychic", // 286
  "Normal", // 287
  "Ghost", // 288
  "Dark", // 289
  "Normal", // 290
  "Water", // 291
  "Fighting", // 292
  "Normal", // 293
  "Bug", // 294
  "Psychic", // 295
  "Psychic", // 296
  "Flying", // 297
  "Normal", // 298
  "Fire", // 299
  "Ground", // 300
  "Ice", // 301
  "Grass", // 302
  "Normal", // 303
  "Normal", // 304
  "Poison", // 305
  "Normal", // 306
  "Fire", // 307
  "Water", // 308
  "Steel", // 309
  "Ghost", // 310
  "Normal", // 311
  "Grass", // 312
  "Dark", // 313
  "Flying", // 314
  "Fire", // 315
  "Normal", // 316
  "Rock", // 317
  "Bug", // 318
  "Steel", // 319
  "Grass", // 320
  "Normal", // 321
  "Psychic", // 322
  "Water", // 323
  "Bug", // 324
  "Ghost", // 325
  "Psychic", // 326
  "Fighting", // 327
  "Ground", // 328
  "Ice", // 329
  "Water", // 330
  "Grass", // 331
  "Flying", // 332
  "Ice", // 333
  "Steel", // 334
  "Normal", // 335
  "Normal", // 336
  "Dragon", // 337
  "Grass", // 338
  "Fighting", // 339
  "Flying", // 340
  "Ground", // 341
  "Poison", // 342
  "Normal", // 343
  "Electric", // 344
  "Grass", // 345
  "Water", // 346
  "Psychic", // 347
  "Grass", // 348
  "Dragon", // 349
  "Rock", // 350
  "Electric", // 351
  "Water", // 352
  "Steel", // 353
  "Psychic", // 354
];

// Gen 3 move power (1-354) — 0 = status move
export const GEN3_MOVES_POWER: number[] = [
  ...Array(252).fill(0), // 0-251 (Gen 2 power not tracked separately)
  0, // 251 placeholder
  40, // 252
  50, // 253
  0, // 254
  100, // 255
  0, // 256
  100, // 257
  0, // 258
  0, // 259
  0, // 260
  0, // 261
  0, // 262
  70, // 263
  150, // 264
  60, // 265
  0, // 266
  0, // 267
  0, // 268
  0, // 269
  0, // 270
  0, // 271
  0, // 272
  0, // 273
  0, // 274
  0, // 275
  120, // 276
  0, // 277
  0, // 278
  60, // 279
  75, // 280
  0, // 281
  20, // 282
  0, // 283
  150, // 284
  0, // 285
  0, // 286
  0, // 287
  0, // 288
  0, // 289
  70, // 290
  60, // 291
  15, // 292
  0, // 293
  0, // 294
  70, // 295
  70, // 296
  0, // 297
  0, // 298
  85, // 299
  0, // 300
  30, // 301
  60, // 302
  0, // 303
  90, // 304
  50, // 305
  75, // 306
  150, // 307
  150, // 308
  100, // 309
  30, // 310
  50, // 311
  0, // 312
  0, // 313
  55, // 314
  140, // 315
  0, // 316
  50, // 317
  60, // 318
  0, // 319
  0, // 320
  0, // 321
  0, // 322
  150, // 323
  75, // 324
  60, // 325
  80, // 326
  85, // 327
  15, // 328
  0, // 329
  95, // 330
  10, // 331
  60, // 332
  10, // 333
  0, // 334
  0, // 335
  0, // 336
  80, // 337
  150, // 338
  0, // 339
  85, // 340
  55, // 341
  50, // 342
  40, // 343
  120, // 344
  60, // 345
  0, // 346
  0, // 347
  70, // 348
  0, // 349
  25, // 350
  60, // 351
  60, // 352
  120, // 353
  140, // 354
];

export function getGen3MoveName(id: number): string {
  return GEN3_MOVES_LIST[id] || `-`;
}
export function getGen3MovePp(id: number): number {
  return GEN3_MOVES_PP[id] ?? 0;
}
export function getGen3MoveType(id: number): string {
  return GEN3_MOVES_TYPE[id] || "Normal";
}
