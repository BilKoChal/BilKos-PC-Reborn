/**
 * Gen 5 (BW/B2W2) species names + base stats.
 * Species 1-493 reuse Gen 4 data. 494-649 are Unova species.
 */
import { GEN4_POKEMON_NAMES, GEN4_BASE_STATS } from "../../gen4/data/speciesData";
import type { BaseStats } from "../../../interfaces";

export const GEN5_POKEMON_NAMES: string[] = [
  ...GEN4_POKEMON_NAMES, // 0-493
  "Victini", // 494
  "Snivy", // 495
  "Servine", // 496
  "Serperior", // 497
  "Tepig", // 498
  "Pignite", // 499
  "Emboar", // 500
  "Oshawott", // 501
  "Dewott", // 502
  "Samurott", // 503
  "Patrat", // 504
  "Watchog", // 505
  "Lillipup", // 506
  "Herdier", // 507
  "Stoutland", // 508
  "Purrloin", // 509
  "Liepard", // 510
  "Pansage", // 511
  "Simisage", // 512
  "Pansear", // 513
  "Simisear", // 514
  "Panpour", // 515
  "Simipour", // 516
  "Munna", // 517
  "Musharna", // 518
  "Pidove", // 519
  "Tranquill", // 520
  "Unfezant", // 521
  "Blitzle", // 522
  "Zebstrika", // 523
  "Roggenrola", // 524
  "Boldore", // 525
  "Gigalith", // 526
  "Woobat", // 527
  "Swoobat", // 528
  "Drilbur", // 529
  "Excadrill", // 530
  "Audino", // 531
  "Timburr", // 532
  "Gurdurr", // 533
  "Conkeldurr", // 534
  "Tympole", // 535
  "Palpitoad", // 536
  "Seismitoad", // 537
  "Throh", // 538
  "Sawk", // 539
  "Sewaddle", // 540
  "Swadloon", // 541
  "Leavanny", // 542
  "Venipede", // 543
  "Whirlipede", // 544
  "Scolipede", // 545
  "Cottonee", // 546
  "Whimsicott", // 547
  "Petilil", // 548
  "Lilligant", // 549
  "Basculin", // 550
  "Sandile", // 551
  "Krokorok", // 552
  "Krookodile", // 553
  "Darumaka", // 554
  "Darmanitan", // 555
  "Maractus", // 556
  "Dwebble", // 557
  "Crustle", // 558
  "Scraggy", // 559
  "Scrafty", // 560
  "Sigilyph", // 561
  "Yamask", // 562
  "Cofagrigus", // 563
  "Tirtouga", // 564
  "Carracosta", // 565
  "Archen", // 566
  "Archeops", // 567
  "Trubbish", // 568
  "Garbodor", // 569
  "Zorua", // 570
  "Zoroark", // 571
  "Minccino", // 572
  "Cinccino", // 573
  "Gothita", // 574
  "Gothorita", // 575
  "Gothitelle", // 576
  "Solosis", // 577
  "Duosion", // 578
  "Reuniclus", // 579
  "Ducklett", // 580
  "Swanna", // 581
  "Vanillite", // 582
  "Vanillish", // 583
  "Vanilluxe", // 584
  "Deerling", // 585
  "Sawsbuck", // 586
  "Emolga", // 587
  "Karrablast", // 588
  "Escavalier", // 589
  "Foongus", // 590
  "Amoonguss", // 591
  "Frillish", // 592
  "Jellicent", // 593
  "Alomomola", // 594
  "Joltik", // 595
  "Galvantula", // 596
  "Ferroseed", // 597
  "Ferrothorn", // 598
  "Klink", // 599
  "Klang", // 600
  "Klinklang", // 601
  "Tynamo", // 602
  "Eelektrik", // 603
  "Eelektross", // 604
  "Elgyem", // 605
  "Beheeyem", // 606
  "Litwick", // 607
  "Lampent", // 608
  "Chandelure", // 609
  "Axew", // 610
  "Fraxure", // 611
  "Haxorus", // 612
  "Cubchoo", // 613
  "Beartic", // 614
  "Cryogonal", // 615
  "Shelmet", // 616
  "Accelgor", // 617
  "Stunfisk", // 618
  "Mienfoo", // 619
  "Mienshao", // 620
  "Druddigon", // 621
  "Golett", // 622
  "Golurk", // 623
  "Pawniard", // 624
  "Bisharp", // 625
  "Bouffalant", // 626
  "Rufflet", // 627
  "Braviary", // 628
  "Vullaby", // 629
  "Mandibuzz", // 630
  "Heatmor", // 631
  "Durant", // 632
  "Deino", // 633
  "Zweilous", // 634
  "Hydreigon", // 635
  "Larvesta", // 636
  "Volcarona", // 637
  "Cobalion", // 638
  "Terrakion", // 639
  "Virizion", // 640
  "Tornadus", // 641
  "Thundurus", // 642
  "Reshiram", // 643
  "Zekrom", // 644
  "Landorus", // 645
  "Kyurem", // 646
  "Keldeo", // 647
  "Meloetta", // 648
  "Genesect", // 649
];

export const GEN5_BASE_STATS: Record<number, BaseStats> = {
  ...GEN4_BASE_STATS, // 1-493
  494: { hp: 100, attack: 100, defense: 100, speed: 100, spAtk: 100, spDef: 100 }, // Victini
  495: { hp: 45, attack: 45, defense: 55, speed: 63, spAtk: 45, spDef: 55 }, // Snivy
  496: { hp: 60, attack: 60, defense: 75, speed: 83, spAtk: 60, spDef: 75 }, // Servine
  497: { hp: 75, attack: 75, defense: 95, speed: 113, spAtk: 75, spDef: 95 }, // Serperior
  498: { hp: 65, attack: 63, defense: 45, speed: 45, spAtk: 45, spDef: 45 }, // Tepig
  499: { hp: 90, attack: 93, defense: 55, speed: 55, spAtk: 70, spDef: 55 }, // Pignite
  500: { hp: 110, attack: 123, defense: 65, speed: 65, spAtk: 100, spDef: 65 }, // Emboar
  501: { hp: 55, attack: 55, defense: 45, speed: 45, spAtk: 63, spDef: 45 }, // Oshawott
  502: { hp: 75, attack: 75, defense: 60, speed: 60, spAtk: 83, spDef: 60 }, // Dewott
  503: { hp: 95, attack: 100, defense: 85, speed: 70, spAtk: 108, spDef: 65 }, // Samurott
  504: { hp: 45, attack: 55, defense: 39, speed: 42, spAtk: 35, spDef: 39 }, // Patrat
  505: { hp: 60, attack: 85, defense: 69, speed: 77, spAtk: 50, spDef: 69 }, // Watchog
  506: { hp: 45, attack: 60, defense: 45, speed: 55, spAtk: 25, spDef: 30 }, // Lillipup
  507: { hp: 65, attack: 80, defense: 65, speed: 60, spAtk: 35, spDef: 65 }, // Herdier
  508: { hp: 85, attack: 110, defense: 90, speed: 80, spAtk: 45, spDef: 90 }, // Stoutland
  509: { hp: 41, attack: 50, defense: 37, speed: 66, spAtk: 50, spDef: 37 }, // Purrloin
  510: { hp: 64, attack: 88, defense: 50, speed: 106, spAtk: 88, spDef: 50 }, // Liepard
  511: { hp: 50, attack: 53, defense: 48, speed: 64, spAtk: 53, spDef: 48 }, // Pansage
  512: { hp: 75, attack: 98, defense: 63, speed: 101, spAtk: 98, spDef: 63 }, // Simisage
  513: { hp: 50, attack: 53, defense: 48, speed: 64, spAtk: 53, spDef: 48 }, // Pansear
  514: { hp: 75, attack: 98, defense: 63, speed: 101, spAtk: 98, spDef: 63 }, // Simisear
  515: { hp: 50, attack: 53, defense: 48, speed: 64, spAtk: 53, spDef: 48 }, // Panpour
  516: { hp: 75, attack: 98, defense: 63, speed: 101, spAtk: 98, spDef: 63 }, // Simipour
  517: { hp: 76, attack: 25, defense: 45, speed: 24, spAtk: 67, spDef: 55 }, // Munna
  518: { hp: 116, attack: 55, defense: 85, speed: 29, spAtk: 107, spDef: 95 }, // Musharna
  519: { hp: 50, attack: 55, defense: 50, speed: 43, spAtk: 36, spDef: 30 }, // Pidove
  520: { hp: 62, attack: 77, defense: 62, speed: 65, spAtk: 50, spDef: 42 }, // Tranquill
  521: { hp: 80, attack: 115, defense: 80, speed: 93, spAtk: 65, spDef: 55 }, // Unfezant
  522: { hp: 45, attack: 60, defense: 32, speed: 76, spAtk: 50, spDef: 32 }, // Blitzle
  523: { hp: 75, attack: 100, defense: 63, speed: 116, spAtk: 80, spDef: 63 }, // Zebstrika
  524: { hp: 55, attack: 75, defense: 85, speed: 15, spAtk: 25, spDef: 25 }, // Roggenrola
  525: { hp: 70, attack: 105, defense: 105, speed: 25, spAtk: 50, spDef: 40 }, // Boldore
  526: { hp: 85, attack: 135, defense: 130, speed: 25, spAtk: 60, spDef: 80 }, // Gigalith
  527: { hp: 55, attack: 45, defense: 43, speed: 72, spAtk: 55, spDef: 43 }, // Woobat
  528: { hp: 67, attack: 57, defense: 55, speed: 114, spAtk: 77, spDef: 55 }, // Swoobat
  529: { hp: 60, attack: 85, defense: 40, speed: 68, spAtk: 30, spDef: 45 }, // Drilbur
  530: { hp: 110, attack: 135, defense: 60, speed: 88, spAtk: 50, spDef: 65 }, // Excadrill
  531: { hp: 103, attack: 48, defense: 48, speed: 66, spAtk: 48, spDef: 86 }, // Audino
  532: { hp: 75, attack: 80, defense: 55, speed: 35, spAtk: 25, spDef: 35 }, // Timburr
  533: { hp: 85, attack: 105, defense: 85, speed: 40, spAtk: 40, spDef: 50 }, // Gurdurr
  534: { hp: 105, attack: 140, defense: 95, speed: 45, spAtk: 55, spDef: 65 }, // Conkeldurr
  535: { hp: 50, attack: 50, defense: 40, speed: 64, spAtk: 50, spDef: 40 }, // Tympole
  536: { hp: 75, attack: 65, defense: 55, speed: 69, spAtk: 65, spDef: 55 }, // Palpitoad
  537: { hp: 105, attack: 95, defense: 75, speed: 74, spAtk: 85, spDef: 75 }, // Seismitoad
  538: { hp: 120, attack: 100, defense: 85, speed: 45, spAtk: 30, spDef: 85 }, // Throh
  539: { hp: 75, attack: 125, defense: 75, speed: 85, spAtk: 30, spDef: 75 }, // Sawk
  540: { hp: 45, attack: 53, defense: 70, speed: 42, spAtk: 40, spDef: 60 }, // Sewaddle
  541: { hp: 55, attack: 63, defense: 90, speed: 42, spAtk: 50, spDef: 80 }, // Swadloon
  542: { hp: 75, attack: 103, defense: 80, speed: 92, spAtk: 70, spDef: 80 }, // Leavanny
  543: { hp: 30, attack: 45, defense: 59, speed: 57, spAtk: 30, spDef: 39 }, // Venipede
  544: { hp: 40, attack: 55, defense: 99, speed: 47, spAtk: 40, spDef: 79 }, // Whirlipede
  545: { hp: 60, attack: 100, defense: 89, speed: 112, spAtk: 55, spDef: 69 }, // Scolipede
  546: { hp: 40, attack: 27, defense: 60, speed: 66, spAtk: 37, spDef: 50 }, // Cottonee
  547: { hp: 60, attack: 67, defense: 85, speed: 116, spAtk: 77, spDef: 75 }, // Whimsicott
  548: { hp: 45, attack: 35, defense: 50, speed: 30, spAtk: 70, spDef: 50 }, // Petilil
  549: { hp: 70, attack: 60, defense: 75, speed: 90, spAtk: 110, spDef: 75 }, // Lilligant
  550: { hp: 70, attack: 92, defense: 65, speed: 98, spAtk: 80, spDef: 55 }, // Basculin
  551: { hp: 50, attack: 72, defense: 35, speed: 65, spAtk: 35, spDef: 35 }, // Sandile
  552: { hp: 60, attack: 82, defense: 45, speed: 74, spAtk: 45, spDef: 45 }, // Krokorok
  553: { hp: 95, attack: 117, defense: 80, speed: 92, spAtk: 65, spDef: 80 }, // Krookodile
  554: { hp: 70, attack: 90, defense: 45, speed: 50, spAtk: 15, spDef: 45 }, // Darumaka
  555: { hp: 105, attack: 140, defense: 55, speed: 95, spAtk: 30, spDef: 55 }, // Darmanitan
  556: { hp: 75, attack: 86, defense: 67, speed: 60, spAtk: 87, spDef: 67 }, // Maractus
  557: { hp: 50, attack: 65, defense: 85, speed: 55, spAtk: 35, spDef: 35 }, // Dwebble
  558: { hp: 70, attack: 105, defense: 125, speed: 45, spAtk: 65, spDef: 75 }, // Crustle
  559: { hp: 50, attack: 75, defense: 70, speed: 48, spAtk: 35, spDef: 70 }, // Scraggy
  560: { hp: 65, attack: 90, defense: 115, speed: 58, spAtk: 45, spDef: 115 }, // Scrafty
  561: { hp: 72, attack: 58, defense: 80, speed: 97, spAtk: 103, spDef: 80 }, // Sigilyph
  562: { hp: 38, attack: 30, defense: 85, speed: 30, spAtk: 55, spDef: 65 }, // Yamask
  563: { hp: 58, attack: 50, defense: 145, speed: 30, spAtk: 95, spDef: 105 }, // Cofagrigus
  564: { hp: 54, attack: 78, defense: 103, speed: 22, spAtk: 53, spDef: 45 }, // Tirtouga
  565: { hp: 74, attack: 108, defense: 133, speed: 32, spAtk: 83, spDef: 65 }, // Carracosta
  566: { hp: 55, attack: 112, defense: 45, speed: 70, spAtk: 74, spDef: 45 }, // Archen
  567: { hp: 75, attack: 140, defense: 65, speed: 112, spAtk: 112, spDef: 65 }, // Archeops
  568: { hp: 50, attack: 50, defense: 62, speed: 65, spAtk: 40, spDef: 62 }, // Trubbish
  569: { hp: 80, attack: 95, defense: 82, speed: 75, spAtk: 60, spDef: 82 }, // Garbodor
  570: { hp: 40, attack: 65, defense: 40, speed: 65, spAtk: 80, spDef: 40 }, // Zorua
  571: { hp: 60, attack: 105, defense: 60, speed: 105, spAtk: 120, spDef: 60 }, // Zoroark
  572: { hp: 55, attack: 50, defense: 40, speed: 75, spAtk: 40, spDef: 40 }, // Minccino
  573: { hp: 75, attack: 95, defense: 60, speed: 115, spAtk: 65, spDef: 60 }, // Cinccino
  574: { hp: 45, attack: 30, defense: 50, speed: 45, spAtk: 55, spDef: 65 }, // Gothita
  575: { hp: 60, attack: 45, defense: 70, speed: 55, spAtk: 75, spDef: 85 }, // Gothorita
  576: { hp: 70, attack: 55, defense: 95, speed: 65, spAtk: 110, spDef: 110 }, // Gothitelle
  577: { hp: 45, attack: 30, defense: 40, speed: 20, spAtk: 105, spDef: 50 }, // Solosis
  578: { hp: 65, attack: 40, defense: 50, speed: 30, spAtk: 125, spDef: 60 }, // Duosion
  579: { hp: 110, attack: 65, defense: 75, speed: 30, spAtk: 125, spDef: 85 }, // Reuniclus
  580: { hp: 62, attack: 44, defense: 50, speed: 55, spAtk: 44, spDef: 50 }, // Ducklett
  581: { hp: 75, attack: 87, defense: 63, speed: 98, spAtk: 87, spDef: 63 }, // Swanna
  582: { hp: 36, attack: 50, defense: 50, speed: 44, spAtk: 65, spDef: 60 }, // Vanillite
  583: { hp: 51, attack: 65, defense: 65, speed: 59, spAtk: 80, spDef: 75 }, // Vanillish
  584: { hp: 71, attack: 95, defense: 85, speed: 79, spAtk: 110, spDef: 95 }, // Vanilluxe
  585: { hp: 60, attack: 60, defense: 50, speed: 75, spAtk: 40, spDef: 50 }, // Deerling
  586: { hp: 80, attack: 100, defense: 70, speed: 95, spAtk: 60, spDef: 70 }, // Sawsbuck
  587: { hp: 55, attack: 75, defense: 60, speed: 103, spAtk: 75, spDef: 60 }, // Emolga
  588: { hp: 50, attack: 75, defense: 45, speed: 60, spAtk: 40, spDef: 45 }, // Karrablast
  589: { hp: 70, attack: 135, defense: 105, speed: 20, spAtk: 60, spDef: 105 }, // Escavalier
  590: { hp: 69, attack: 55, defense: 45, speed: 15, spAtk: 55, spDef: 55 }, // Foongus
  591: { hp: 114, attack: 85, defense: 70, speed: 30, spAtk: 85, spDef: 80 }, // Amoonguss
  592: { hp: 55, attack: 40, defense: 50, speed: 40, spAtk: 65, spDef: 85 }, // Frillish
  593: { hp: 100, attack: 60, defense: 70, speed: 60, spAtk: 85, spDef: 105 }, // Jellicent
  594: { hp: 165, attack: 75, defense: 80, speed: 65, spAtk: 40, spDef: 45 }, // Alomomola
  595: { hp: 50, attack: 47, defense: 50, speed: 65, spAtk: 57, spDef: 50 }, // Joltik
  596: { hp: 70, attack: 77, defense: 60, speed: 108, spAtk: 97, spDef: 60 }, // Galvantula
  597: { hp: 44, attack: 50, defense: 91, speed: 10, spAtk: 24, spDef: 86 }, // Ferroseed
  598: { hp: 74, attack: 94, defense: 131, speed: 20, spAtk: 54, spDef: 116 }, // Ferrothorn
  599: { hp: 40, attack: 55, defense: 70, speed: 30, spAtk: 45, spDef: 60 }, // Klink
  600: { hp: 60, attack: 80, defense: 95, speed: 50, spAtk: 70, spDef: 85 }, // Klang
  601: { hp: 60, attack: 100, defense: 115, speed: 90, spAtk: 70, spDef: 85 }, // Klinklang
  602: { hp: 35, attack: 55, defense: 40, speed: 60, spAtk: 75, spDef: 40 }, // Tynamo
  603: { hp: 65, attack: 85, defense: 70, speed: 40, spAtk: 75, spDef: 70 }, // Eelektrik
  604: { hp: 85, attack: 115, defense: 80, speed: 50, spAtk: 105, spDef: 80 }, // Eelektross
  605: { hp: 55, attack: 55, defense: 55, speed: 30, spAtk: 85, spDef: 55 }, // Elgyem
  606: { hp: 75, attack: 75, defense: 75, speed: 40, spAtk: 125, spDef: 95 }, // Beheeyem
  607: { hp: 50, attack: 30, defense: 55, speed: 20, spAtk: 65, spDef: 55 }, // Litwick
  608: { hp: 60, attack: 40, defense: 60, speed: 55, spAtk: 95, spDef: 60 }, // Lampent
  609: { hp: 60, attack: 55, defense: 90, speed: 80, spAtk: 145, spDef: 90 }, // Chandelure
  610: { hp: 46, attack: 87, defense: 60, speed: 57, spAtk: 30, spDef: 40 }, // Axew
  611: { hp: 66, attack: 117, defense: 70, speed: 67, spAtk: 40, spDef: 50 }, // Fraxure
  612: { hp: 76, attack: 147, defense: 90, speed: 97, spAtk: 60, spDef: 70 }, // Haxorus
  613: { hp: 55, attack: 70, defense: 40, speed: 40, spAtk: 60, spDef: 40 }, // Cubchoo
  614: { hp: 95, attack: 130, defense: 80, speed: 50, spAtk: 70, spDef: 80 }, // Beartic
  615: { hp: 80, attack: 50, defense: 50, speed: 105, spAtk: 95, spDef: 135 }, // Cryogonal
  616: { hp: 50, attack: 40, defense: 85, speed: 25, spAtk: 40, spDef: 65 }, // Shelmet
  617: { hp: 80, attack: 70, defense: 40, speed: 145, spAtk: 100, spDef: 60 }, // Accelgor
  618: { hp: 109, attack: 66, defense: 84, speed: 32, spAtk: 81, spDef: 99 }, // Stunfisk
  619: { hp: 45, attack: 85, defense: 50, speed: 65, spAtk: 35, spDef: 50 }, // Mienfoo
  620: { hp: 65, attack: 125, defense: 60, speed: 105, spAtk: 95, spDef: 60 }, // Mienshao
  621: { hp: 77, attack: 120, defense: 90, speed: 48, spAtk: 60, spDef: 90 }, // Druddigon
  622: { hp: 59, attack: 74, defense: 50, speed: 35, spAtk: 35, spDef: 50 }, // Golett
  623: { hp: 89, attack: 124, defense: 80, speed: 55, spAtk: 55, spDef: 80 }, // Golurk
  624: { hp: 45, attack: 85, defense: 70, speed: 60, spAtk: 40, spDef: 40 }, // Pawniard
  625: { hp: 65, attack: 125, defense: 100, speed: 70, spAtk: 60, spDef: 100 }, // Bisharp
  626: { hp: 95, attack: 110, defense: 95, speed: 55, spAtk: 40, spDef: 95 }, // Bouffalant
  627: { hp: 70, attack: 83, defense: 50, speed: 60, spAtk: 37, spDef: 50 }, // Rufflet
  628: { hp: 100, attack: 123, defense: 75, speed: 80, spAtk: 57, spDef: 75 }, // Braviary
  629: { hp: 70, attack: 55, defense: 75, speed: 60, spAtk: 45, spDef: 65 }, // Vullaby
  630: { hp: 110, attack: 65, defense: 105, speed: 80, spAtk: 55, spDef: 95 }, // Mandibuzz
  631: { hp: 85, attack: 97, defense: 66, speed: 65, spAtk: 105, spDef: 66 }, // Heatmor
  632: { hp: 58, attack: 109, defense: 112, speed: 48, spAtk: 48, spDef: 48 }, // Durant
  633: { hp: 52, attack: 65, defense: 50, speed: 38, spAtk: 45, spDef: 50 }, // Deino
  634: { hp: 72, attack: 85, defense: 70, speed: 58, spAtk: 65, spDef: 70 }, // Zweilous
  635: { hp: 92, attack: 105, defense: 90, speed: 98, spAtk: 125, spDef: 90 }, // Hydreigon
  636: { hp: 55, attack: 85, defense: 55, speed: 60, spAtk: 50, spDef: 55 }, // Larvesta
  637: { hp: 85, attack: 60, defense: 65, speed: 100, spAtk: 135, spDef: 105 }, // Volcarona
  638: { hp: 91, attack: 90, defense: 129, speed: 108, spAtk: 90, spDef: 72 }, // Cobalion
  639: { hp: 91, attack: 129, defense: 90, speed: 108, spAtk: 72, spDef: 90 }, // Terrakion
  640: { hp: 91, attack: 90, defense: 72, speed: 108, spAtk: 90, spDef: 129 }, // Virizion
  641: { hp: 79, attack: 115, defense: 70, speed: 111, spAtk: 125, spDef: 80 }, // Tornadus
  642: { hp: 79, attack: 115, defense: 70, speed: 111, spAtk: 125, spDef: 80 }, // Thundurus
  643: { hp: 100, attack: 120, defense: 100, speed: 90, spAtk: 150, spDef: 120 }, // Reshiram
  644: { hp: 100, attack: 150, defense: 120, speed: 90, spAtk: 120, spDef: 100 }, // Zekrom
  645: { hp: 89, attack: 125, defense: 90, speed: 101, spAtk: 115, spDef: 80 }, // Landorus
  646: { hp: 125, attack: 130, defense: 95, speed: 95, spAtk: 130, spDef: 90 }, // Kyurem
  647: { hp: 91, attack: 72, defense: 90, speed: 108, spAtk: 129, spDef: 90 }, // Keldeo
  648: { hp: 100, attack: 77, defense: 77, speed: 90, spAtk: 128, spDef: 128 }, // Meloetta
  649: { hp: 71, attack: 120, defense: 95, speed: 99, spAtk: 120, spDef: 95 }, // Genesect
};

export function getGen5BaseStats(dexId: number): BaseStats | undefined {
  return GEN5_BASE_STATS[dexId];
}
