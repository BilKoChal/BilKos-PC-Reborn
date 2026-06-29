/**
 * Gen 4 (DPPt/HGSS) species names + base stats.
 * Species 1-386 reuse Gen 3 data. 387-493 are Sinnoh species.
 */
import { GEN3_POKEMON_NAMES, GEN3_BASE_STATS } from "../../gen3/data/speciesData";
import type { BaseStats } from "../../../interfaces";

export const GEN4_POKEMON_NAMES: string[] = [
  ...GEN3_POKEMON_NAMES, // 0-386
  "Turtwig", // 387
  "Grotle", // 388
  "Torterra", // 389
  "Chimchar", // 390
  "Monferno", // 391
  "Infernape", // 392
  "Piplup", // 393
  "Prinplup", // 394
  "Empoleon", // 395
  "Starly", // 396
  "Staravia", // 397
  "Staraptor", // 398
  "Bidoof", // 399
  "Bibarel", // 400
  "Kricketot", // 401
  "Kricketune", // 402
  "Shinx", // 403
  "Luxio", // 404
  "Luxray", // 405
  "Budew", // 406
  "Roserade", // 407
  "Cranidos", // 408
  "Rampardos", // 409
  "Shieldon", // 410
  "Bastiodon", // 411
  "Burmy", // 412
  "Wormadam", // 413
  "Mothim", // 414
  "Combee", // 415
  "Vespiquen", // 416
  "Pachirisu", // 417
  "Buizel", // 418
  "Floatzel", // 419
  "Cherubi", // 420
  "Cherrim", // 421
  "Shellos", // 422
  "Gastrodon", // 423
  "Ambipom", // 424
  "Drifloon", // 425
  "Drifblim", // 426
  "Buneary", // 427
  "Lopunny", // 428
  "Mismagius", // 429
  "Honchkrow", // 430
  "Glameow", // 431
  "Purugly", // 432
  "Chingling", // 433
  "Stunky", // 434
  "Skuntank", // 435
  "Bronzor", // 436
  "Bronzong", // 437
  "Bonsly", // 438
  "Mime Jr.", // 439
  "Happiny", // 440
  "Chatot", // 441
  "Spiritomb", // 442
  "Gible", // 443
  "Gabite", // 444
  "Garchomp", // 445
  "Munchlax", // 446
  "Riolu", // 447
  "Lucario", // 448
  "Hippopotas", // 449
  "Hippowdon", // 450
  "Skorupi", // 451
  "Drapion", // 452
  "Croagunk", // 453
  "Toxicroak", // 454
  "Carnivine", // 455
  "Finneon", // 456
  "Lumineon", // 457
  "Mantyke", // 458
  "Snover", // 459
  "Abomasnow", // 460
  "Weavile", // 461
  "Magnezone", // 462
  "Lickilicky", // 463
  "Rhyperior", // 464
  "Tangrowth", // 465
  "Electivire", // 466
  "Magmortar", // 467
  "Togekiss", // 468
  "Yanmega", // 469
  "Leafeon", // 470
  "Glaceon", // 471
  "Gliscor", // 472
  "Mamoswine", // 473
  "Porygon-Z", // 474
  "Gallade", // 475
  "Probopass", // 476
  "Dusknoir", // 477
  "Froslass", // 478
  "Rotom", // 479
  "Uxie", // 480
  "Mesprit", // 481
  "Azelf", // 482
  "Dialga", // 483
  "Palkia", // 484
  "Heatran", // 485
  "Regigigas", // 486
  "Giratina", // 487
  "Cresselia", // 488
  "Phione", // 489
  "Manaphy", // 490
  "Darkrai", // 491
  "Shaymin", // 492
  "Arceus", // 493
];

export const GEN4_BASE_STATS: Record<number, BaseStats> = {
  ...GEN3_BASE_STATS, // 1-386
  387: { hp: 55, attack: 68, defense: 64, speed: 31, spAtk: 45, spDef: 55 }, // Turtwig
  388: { hp: 75, attack: 89, defense: 85, speed: 36, spAtk: 55, spDef: 65 }, // Grotle
  389: { hp: 95, attack: 109, defense: 105, speed: 56, spAtk: 75, spDef: 85 }, // Torterra
  390: { hp: 44, attack: 58, defense: 44, speed: 61, spAtk: 58, spDef: 44 }, // Chimchar
  391: { hp: 64, attack: 78, defense: 52, speed: 81, spAtk: 78, spDef: 52 }, // Monferno
  392: { hp: 76, attack: 104, defense: 71, speed: 104, spAtk: 104, spDef: 71 }, // Infernape
  393: { hp: 53, attack: 51, defense: 53, speed: 40, spAtk: 51, spDef: 53 }, // Piplup
  394: { hp: 64, attack: 66, defense: 68, speed: 50, spAtk: 66, spDef: 68 }, // Prinplup
  395: { hp: 84, attack: 86, defense: 88, speed: 60, spAtk: 111, spDef: 101 }, // Empoleon
  396: { hp: 40, attack: 55, defense: 30, speed: 60, spAtk: 30, spDef: 30 }, // Starly
  397: { hp: 55, attack: 75, defense: 50, speed: 80, spAtk: 40, spDef: 40 }, // Staravia
  398: { hp: 85, attack: 120, defense: 70, speed: 100, spAtk: 50, spDef: 60 }, // Staraptor
  399: { hp: 59, attack: 45, defense: 40, speed: 31, spAtk: 35, spDef: 40 }, // Bidoof
  400: { hp: 79, attack: 85, defense: 60, speed: 71, spAtk: 55, spDef: 60 }, // Bibarel
  401: { hp: 37, attack: 25, defense: 41, speed: 25, spAtk: 25, spDef: 41 }, // Kricketot
  402: { hp: 77, attack: 85, defense: 51, speed: 65, spAtk: 55, spDef: 51 }, // Kricketune
  403: { hp: 45, attack: 65, defense: 34, speed: 45, spAtk: 40, spDef: 34 }, // Shinx
  404: { hp: 60, attack: 85, defense: 49, speed: 60, spAtk: 60, spDef: 49 }, // Luxio
  405: { hp: 80, attack: 120, defense: 79, speed: 70, spAtk: 95, spDef: 79 }, // Luxray
  406: { hp: 40, attack: 30, defense: 35, speed: 55, spAtk: 50, spDef: 70 }, // Budew
  407: { hp: 60, attack: 70, defense: 65, speed: 90, spAtk: 125, spDef: 105 }, // Roserade
  408: { hp: 67, attack: 125, defense: 40, speed: 58, spAtk: 30, spDef: 30 }, // Cranidos
  409: { hp: 97, attack: 165, defense: 60, speed: 58, spAtk: 65, spDef: 50 }, // Rampardos
  410: { hp: 30, attack: 42, defense: 118, speed: 30, spAtk: 42, spDef: 88 }, // Shieldon
  411: { hp: 60, attack: 52, defense: 168, speed: 30, spAtk: 47, spDef: 138 }, // Bastiodon
  412: { hp: 40, attack: 29, defense: 45, speed: 36, spAtk: 29, spDef: 45 }, // Burmy
  413: { hp: 60, attack: 59, defense: 85, speed: 36, spAtk: 79, spDef: 105 }, // Wormadam
  414: { hp: 70, attack: 94, defense: 50, speed: 66, spAtk: 94, spDef: 50 }, // Mothim
  415: { hp: 30, attack: 30, defense: 42, speed: 70, spAtk: 30, spDef: 42 }, // Combee
  416: { hp: 70, attack: 80, defense: 102, speed: 40, spAtk: 80, spDef: 102 }, // Vespiquen
  417: { hp: 60, attack: 45, defense: 70, speed: 95, spAtk: 45, spDef: 90 }, // Pachirisu
  418: { hp: 55, attack: 65, defense: 35, speed: 85, spAtk: 60, spDef: 30 }, // Buizel
  419: { hp: 85, attack: 105, defense: 55, speed: 115, spAtk: 85, spDef: 50 }, // Floatzel
  420: { hp: 45, attack: 35, defense: 45, speed: 35, spAtk: 62, spDef: 53 }, // Cherubi
  421: { hp: 70, attack: 60, defense: 70, speed: 85, spAtk: 87, spDef: 78 }, // Cherrim
  422: { hp: 76, attack: 48, defense: 48, speed: 34, spAtk: 57, spDef: 62 }, // Shellos
  423: { hp: 111, attack: 83, defense: 68, speed: 39, spAtk: 92, spDef: 82 }, // Gastrodon
  424: { hp: 75, attack: 100, defense: 66, speed: 115, spAtk: 60, spDef: 66 }, // Ambipom
  425: { hp: 90, attack: 50, defense: 34, speed: 70, spAtk: 60, spDef: 44 }, // Drifloon
  426: { hp: 150, attack: 80, defense: 44, speed: 80, spAtk: 90, spDef: 54 }, // Drifblim
  427: { hp: 55, attack: 66, defense: 44, speed: 85, spAtk: 44, spDef: 56 }, // Buneary
  428: { hp: 65, attack: 76, defense: 84, speed: 105, spAtk: 54, spDef: 96 }, // Lopunny
  429: { hp: 60, attack: 60, defense: 60, speed: 105, spAtk: 105, spDef: 105 }, // Mismagius
  430: { hp: 100, attack: 125, defense: 52, speed: 71, spAtk: 105, spDef: 52 }, // Honchkrow
  431: { hp: 49, attack: 55, defense: 42, speed: 85, spAtk: 42, spDef: 37 }, // Glameow
  432: { hp: 71, attack: 82, defense: 64, speed: 112, spAtk: 64, spDef: 59 }, // Purugly
  433: { hp: 45, attack: 30, defense: 50, speed: 45, spAtk: 65, spDef: 50 }, // Chingling
  434: { hp: 63, attack: 63, defense: 47, speed: 74, spAtk: 41, spDef: 47 }, // Stunky
  435: { hp: 103, attack: 93, defense: 67, speed: 84, spAtk: 71, spDef: 61 }, // Skuntank
  436: { hp: 57, attack: 24, defense: 86, speed: 23, spAtk: 24, spDef: 86 }, // Bronzor
  437: { hp: 67, attack: 89, defense: 116, speed: 33, spAtk: 79, spDef: 116 }, // Bronzong
  438: { hp: 50, attack: 80, defense: 95, speed: 10, spAtk: 10, spDef: 45 }, // Bonsly
  439: { hp: 20, attack: 25, defense: 45, speed: 60, spAtk: 70, spDef: 90 }, // Mime Jr.
  440: { hp: 100, attack: 5, defense: 5, speed: 30, spAtk: 15, spDef: 65 }, // Happiny
  441: { hp: 76, attack: 65, defense: 45, speed: 91, spAtk: 92, spDef: 42 }, // Chatot
  442: { hp: 50, attack: 92, defense: 108, speed: 35, spAtk: 92, spDef: 108 }, // Spiritomb
  443: { hp: 58, attack: 70, defense: 45, speed: 42, spAtk: 40, spDef: 45 }, // Gible
  444: { hp: 68, attack: 90, defense: 65, speed: 82, spAtk: 50, spDef: 55 }, // Gabite
  445: { hp: 108, attack: 130, defense: 95, speed: 102, spAtk: 80, spDef: 85 }, // Garchomp
  446: { hp: 135, attack: 85, defense: 40, speed: 5, spAtk: 40, spDef: 85 }, // Munchlax
  447: { hp: 40, attack: 70, defense: 40, speed: 60, spAtk: 35, spDef: 40 }, // Riolu
  448: { hp: 70, attack: 110, defense: 70, speed: 90, spAtk: 115, spDef: 70 }, // Lucario
  449: { hp: 68, attack: 72, defense: 78, speed: 32, spAtk: 38, spDef: 42 }, // Hippopotas
  450: { hp: 108, attack: 112, defense: 118, speed: 47, spAtk: 68, spDef: 72 }, // Hippowdon
  451: { hp: 40, attack: 50, defense: 90, speed: 65, spAtk: 30, spDef: 75 }, // Skorupi
  452: { hp: 70, attack: 90, defense: 110, speed: 95, spAtk: 60, spDef: 75 }, // Drapion
  453: { hp: 48, attack: 61, defense: 40, speed: 50, spAtk: 61, spDef: 40 }, // Croagunk
  454: { hp: 83, attack: 106, defense: 65, speed: 85, spAtk: 86, spDef: 65 }, // Toxicroak
  455: { hp: 74, attack: 100, defense: 72, speed: 46, spAtk: 90, spDef: 72 }, // Carnivine
  456: { hp: 49, attack: 49, defense: 56, speed: 66, spAtk: 49, spDef: 61 }, // Finneon
  457: { hp: 69, attack: 69, defense: 76, speed: 91, spAtk: 69, spDef: 86 }, // Lumineon
  458: { hp: 45, attack: 20, defense: 50, speed: 50, spAtk: 60, spDef: 120 }, // Mantyke
  459: { hp: 60, attack: 62, defense: 50, speed: 40, spAtk: 62, spDef: 60 }, // Snover
  460: { hp: 90, attack: 92, defense: 75, speed: 60, spAtk: 92, spDef: 85 }, // Abomasnow
  461: { hp: 70, attack: 120, defense: 65, speed: 125, spAtk: 45, spDef: 85 }, // Weavile
  462: { hp: 70, attack: 70, defense: 115, speed: 60, spAtk: 130, spDef: 90 }, // Magnezone
  463: { hp: 110, attack: 85, defense: 95, speed: 50, spAtk: 80, spDef: 95 }, // Lickilicky
  464: { hp: 115, attack: 140, defense: 130, speed: 40, spAtk: 55, spDef: 130 }, // Rhyperior
  465: { hp: 100, attack: 100, defense: 125, speed: 50, spAtk: 110, spDef: 50 }, // Tangrowth
  466: { hp: 75, attack: 123, defense: 67, speed: 95, spAtk: 95, spDef: 85 }, // Electivire
  467: { hp: 75, attack: 95, defense: 67, speed: 83, spAtk: 125, spDef: 95 }, // Magmortar
  468: { hp: 85, attack: 50, defense: 95, speed: 80, spAtk: 120, spDef: 115 }, // Togekiss
  469: { hp: 86, attack: 76, defense: 86, speed: 95, spAtk: 116, spDef: 56 }, // Yanmega
  470: { hp: 65, attack: 110, defense: 130, speed: 95, spAtk: 60, spDef: 65 }, // Leafeon
  471: { hp: 65, attack: 60, defense: 110, speed: 65, spAtk: 130, spDef: 95 }, // Glaceon
  472: { hp: 75, attack: 95, defense: 125, speed: 95, spAtk: 45, spDef: 75 }, // Gliscor
  473: { hp: 110, attack: 130, defense: 80, speed: 80, spAtk: 70, spDef: 60 }, // Mamoswine
  474: { hp: 85, attack: 80, defense: 70, speed: 90, spAtk: 135, spDef: 75 }, // Porygon-Z
  475: { hp: 68, attack: 125, defense: 65, speed: 80, spAtk: 65, spDef: 115 }, // Gallade
  476: { hp: 60, attack: 55, defense: 145, speed: 40, spAtk: 75, spDef: 150 }, // Probopass
  477: { hp: 45, attack: 100, defense: 135, speed: 45, spAtk: 65, spDef: 135 }, // Dusknoir
  478: { hp: 70, attack: 80, defense: 70, speed: 110, spAtk: 80, spDef: 70 }, // Froslass
  479: { hp: 50, attack: 50, defense: 77, speed: 91, spAtk: 95, spDef: 77 }, // Rotom
  480: { hp: 75, attack: 75, defense: 130, speed: 95, spAtk: 75, spDef: 130 }, // Uxie
  481: { hp: 80, attack: 105, defense: 105, speed: 80, spAtk: 105, spDef: 105 }, // Mesprit
  482: { hp: 75, attack: 125, defense: 70, speed: 115, spAtk: 125, spDef: 70 }, // Azelf
  483: { hp: 100, attack: 120, defense: 120, speed: 90, spAtk: 150, spDef: 100 }, // Dialga
  484: { hp: 90, attack: 120, defense: 100, speed: 100, spAtk: 150, spDef: 120 }, // Palkia
  485: { hp: 91, attack: 90, defense: 106, speed: 77, spAtk: 130, spDef: 106 }, // Heatran
  486: { hp: 110, attack: 160, defense: 110, speed: 100, spAtk: 80, spDef: 110 }, // Regigigas
  487: { hp: 150, attack: 100, defense: 120, speed: 90, spAtk: 100, spDef: 120 }, // Giratina
  488: { hp: 120, attack: 70, defense: 120, speed: 85, spAtk: 75, spDef: 130 }, // Cresselia
  489: { hp: 80, attack: 80, defense: 80, speed: 80, spAtk: 80, spDef: 80 }, // Phione
  490: { hp: 100, attack: 100, defense: 100, speed: 100, spAtk: 100, spDef: 100 }, // Manaphy
  491: { hp: 70, attack: 90, defense: 90, speed: 125, spAtk: 135, spDef: 90 }, // Darkrai
  492: { hp: 100, attack: 100, defense: 100, speed: 100, spAtk: 100, spDef: 100 }, // Shaymin
  493: { hp: 120, attack: 120, defense: 120, speed: 120, spAtk: 120, spDef: 120 }, // Arceus
};

export function getGen4BaseStats(dexId: number): BaseStats | undefined {
  return GEN4_BASE_STATS[dexId];
}
