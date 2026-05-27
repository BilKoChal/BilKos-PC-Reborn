/**
 * Gen 2 (Gold/Silver/Crystal) Pokédex flavor text entries.
 * Sourced from PokeAPI (https://pokeapi.co) under fair use.
 * Each entry has separate text for Gold, Silver, and Crystal versions.
 */

export interface PokedexEntry {
  gold: string;
  silver: string;
  crystal: string;
}

export const POKEDEX_ENTRIES: Record<number, PokedexEntry> = {
  1: {
    gold: "The seed on its back is filled with nutrients. The seed grows steadily larger as its body grows.",
    silver: "It carries a seed on its back right from birth. As it grows older, the seed also grows larger.",
    crystal: "While it is young, it uses the nutrients that are stored in the seeds on its back in order to grow.",
  },
  2: {
    gold: "Exposure to sun light adds to its strength. Sunlight also makes the bud on its back grow larger.",
    silver: "If the bud on its back starts to smell sweet, it is evidence that the large flower will soon bloom.",
    crystal: "The bulb on its back grows as it absorbs nutrients. The bulb gives off a pleasant aroma when it blooms.",
  },
  3: {
    gold: "By spreading the broad petals of its flower and catching the sun\'s rays, it fills its body with power.",
    silver: "It is able to con vert sunlight into energy. As a result, it is more powerful in the summertime.",
    crystal: "As it warms it self and absorbs the sunlight, its flower petals release a pleasant fragrance.",
  },
  4: {
    gold: "The flame on its tail shows the strength of its life force. If it is weak, the flame also burns weakly.",
    silver: "The flame on its tail indicates CHARMANDER\'s life force. If it is healthy, the flame burns brightly.",
    crystal: "If it\'s healthy, the flame on the tip of its tail will burn vigor ously, even if it gets a bit wet.",
  },
  5: {
    gold: "It is very hot headed by nature, so it constantly seeks opponents. It calms down only when it wins.",
    silver: "It has a barbaric nature. In battle, it whips its fiery tail around and slashes away with sharp claws.",
    crystal: "If it becomes agitated during battle, it spouts intense flames, incinerating its surroundings.",
  },
  6: {
    gold: "If CHARIZARD be comes furious, the flame at the tip of its tail flares up in a whitish- blue color.",
    silver: "Breathing intense, hot flames, it can melt almost any thing. Its breath inflicts terrible pain on enemies.",
    crystal: "It uses its wings to fly high. The temperature of its fire increases as it gains exper ience in battle.",
  },
  7: {
    gold: "The shell is soft when it is born. It soon becomes so resilient, prod ding fingers will bounce off it.",
    silver: "The shell, which hardens soon after it is born, is resilient. If you poke it, it will bounce back out.",
    crystal: "When it feels threatened, it draws its legs inside its shell and sprays water from its mouth.",
  },
  8: {
    gold: "It is recognized as a symbol of longevity. If its shell has algae on it, that WARTORTLE is very old.",
    silver: "It cleverly con trols its furry ears and tail to maintain its balance while swimming.",
    crystal: "Its long, furry tail is a symbol of longevity, making it quite popular among older people.",
  },
  9: {
    gold: "It deliberately makes itself heavy so it can with stand the recoil of the water jets it fires.",
    silver: "The rocket cannons on its shell fire jets of water capable of punch ing holes through thick steel.",
    crystal: "It firmly plants its feet on the ground before shooting water from the jets on its back.",
  },
  10: {
    gold: "For protection, it releases a horri ble stench from the antenna on its head to drive away enemies.",
    silver: "Its feet have suction cups designed to stick to any surface. It tenaciously climbs trees to forage.",
    crystal: "It crawls into foliage where it camouflages itself among leaves that are the same color as its body.",
  },
  11: {
    gold: "Inside the shell, it is soft and weak as it pre pares to evolve. It stays motion less in the shell.",
    silver: "It prepares for evolution by har dening its shell as much as possi ble to protect its soft body.",
    crystal: "This is its pre- evolved form. At this stage, it can only harden, so it remains motionless to avoid attack.",
  },
  12: {
    gold: "It collects honey every day. It rubs honey onto the hairs on its legs to carry it back to its nest.",
    silver: "Water-repellent powder on its wings enables it to collect honey, even in the heav iest of rains.",
    crystal: "It flits from flower to flower, collecting honey. It can even identify distant flowers in bloom.",
  },
  13: {
    gold: "Its poison stinger is very powerful. Its bright-colored body is intended to warn off its enemies.",
    silver: "It attacks using a two-inch poison barb on its head. It can usually be found under the leaves it eats.",
    crystal: "The barb on top of its head secretes a strong poison. It uses this toxic barb to protect itself.",
  },
  14: {
    gold: "Although it is a cocoon, it can move a little. It can extend its poison barb if it is attacked.",
    silver: "From this form, it will grow into an adult. As its body becomes soft er, the external shell hardens.",
    crystal: "Nearly incapable of movement, it leans against stout trees while waiting for its evolution.",
  },
  15: {
    gold: "It can take down any opponent with its powerful poi son stingers. It sometimes attacks in swarms.",
    silver: "It has three poison barbs. The barb on its tail secretes the most powerful poison.",
    crystal: "It uses sharp, poisonous stings to defeat prey, then takes the victim back to its nest for food.",
  },
  16: {
    gold: "It usually hides in tall grass. Be cause it dislikes fighting, it pro tects itself by kicking up sand.",
    silver: "Common in grassy areas and forests, it is very docile and will chase off enemies by flap ping up sand.",
    crystal: "It rapidly flaps its wings in the grass, stirring up a dust cloud that drives insect prey out into the open.",
  },
  17: {
    gold: "It has outstanding vision. However high it flies, it is able to distin guish the move ments of its prey.",
    silver: "It immobilizes its prey using well- developed claws, then carries the prey more than 60 miles to its nest.",
    crystal: "It slowly flies in a circular pat tern, all the while keeping a sharp lookout for prey.",
  },
  18: {
    gold: "Its well-developed chest muscles make it strong enough to whip up a gusty windstorm with just a few flaps.",
    silver: "It spreads its beautiful wings wide to frighten its enemies. It can fly at Mach 2 speed.",
    crystal: "Its outstanding vision allows it to spot splashing MAGIKARP, even while flying at 3300 feet.",
  },
  19: {
    gold: "It eats anything. Wherever food is available, it will settle down and produce offspring continuously.",
    silver: "Living wherever there is food available, it ceaselessly scav enges for edibles the entire day.",
    crystal: "This POKéMON\'s impressive vital ity allows it to live anywhere. It also multiplies very quickly.",
  },
  20: {
    gold: "Gnaws on anything with its tough fangs. It can even topple concrete buildings by gnaw ing on them.",
    silver: "Its whiskers help it to maintain balance. Its fangs never stop grow ing, so it gnaws to pare them down.",
    crystal: "The webs on its hind legs enable it to cross rivers. It search es wide areas for food.",
  },
  21: {
    gold: "It flaps its short wings to flush out insects from tall grass. It then plucks them with its stubby beak.",
    silver: "Very protective of its territory, it flaps its short wings busily to dart around at high speed.",
    crystal: "To protect its territory, it flies around ceaselessly, making high- pitched cries.",
  },
  22: {
    gold: "It shoots itself suddenly high into the sky, then plummets down in one fell swoop to strike its prey.",
    silver: "It cleverly uses its thin, long beak to pluck and eat small insects that hide under the ground.",
    crystal: "It uses its long beak to attack. It has a surprisingly long reach, so it must be treated with caution.",
  },
  23: {
    gold: "It can freely de tach its jaw to swallow large prey whole. It can be come too heavy to move, however.",
    silver: "It always hides in grass. When first born, it has no poison, so its bite is painful, but harmless.",
    crystal: "It flutters the tip of its tongue to seek out the scent of prey, then swallows the prey whole.",
  },
  24: {
    gold: "Transfixing prey with the face-like pattern on its belly, it binds and poisons the frightened victim.",
    silver: "With a very venge ful nature, it won\'t give up the chase, no matter how far, once it targets its prey.",
    crystal: "To intimidate foes, it spreads its chest wide and makes eerie sounds by expelling air from its mouth.",
  },
  25: {
    gold: "This intelligent POKéMON roasts hard BERRIES with electricity to make them tender enough to eat.",
    silver: "It raises its tail to check its sur roundings. The tail is sometimes struck by light ning in this pose.",
    crystal: "When it is anger ed, it immediately discharges the energy stored in the pouches in its cheeks.",
  },
  26: {
    gold: "When its electric ity builds, its muscles are stimu lated, and it be comes more aggres sive than usual.",
    silver: "If the electric pouches in its cheeks become fully charged, both ears will stand straight up.",
    crystal: "If its electric pouches run empty, it raises its tail to gather electri city from the atmosphere.",
  },
  27: {
    gold: "If it fell from a great height, this POKéMON could save itself by rolling into a ball and bouncing.",
    silver: "Disliking water, it lives in deep burrows in arid areas. It can roll itself instantly into a ball.",
    crystal: "It prefers dry, sandy places because it uses the sand to protect itself when threatened.",
  },
  28: {
    gold: "In an attempt to hide itself, it will run around at top speed to kick up a blinding dust storm.",
    silver: "If it digs at an incredible pace, it may snap off its spikes and claws. They grow back in a day.",
    crystal: "Adept at climbing trees, it rolls into a spiny ball, then attacks its enemies from above.",
  },
  29: {
    gold: "The poison hidden in its small horn is extremely po tent. Even a tiny scratch can have fatal results.",
    silver: "Although not very combative, it will torment its foes with poison spikes if it is threat ened in any way.",
    crystal: "Small and very docile, it pro tects itself with its small, poison ous horn when attacked.",
  },
  30: {
    gold: "When feeding its young, it first chews and tender izes the food, then spits it out for the offspring.",
    silver: "It has a calm and caring nature. Because its horn grows slowly, it prefers not to fight.",
    crystal: "It has a docile nature. If it is threatened with attack, it raises the barbs that are all over its body.",
  },
  31: {
    gold: "Its body is cover ed with needle- like scales. It never shows signs of shrinking from any attack.",
    silver: "It uses its scaly, rugged body to seal the entrance of its nest and protect its young from predators.",
    crystal: "The hard scales that cover its strong body serve as excellent protection from any attack.",
  },
  32: {
    gold: "It is small, but its horn is filled with poison. It charges then stabs with the horn to inject poison.",
    silver: "It raises its big ears to check its surroundings. It will strike first if it senses any danger.",
    crystal: "It constantly moves its large ears in many directions in order to detect danger right away.",
  },
  33: {
    gold: "It raises its big ears to check its surroundings. If it senses any thing, it attacks immediately.",
    silver: "Quick to anger, it stabs enemies with its horn to inject a powerful poison when it becomes agitated.",
    crystal: "It is easily agitated and uses its horn for offense as soon as it notices an attacker.",
  },
  34: {
    gold: "It swings its big tail around during battle. If its foe flinches, it will charge with its sturdy body.",
    silver: "Its tail is thick and powerful. If it binds an enemy, it can snap the victim\'s spine quite easily.",
    crystal: "It uses its thick arms, legs and tail to attack forcefully. Melee combat is its specialty.",
  },
  35: {
    gold: "The moonlight that it stores in the wings on its back apparently gives it the ability to float in midair.",
    silver: "Its adorable be havior and cry make it highly popular. However, this cute POKéMON is rarely found.",
    crystal: "Though rarely seen, it becomes easier to spot, for some reason, on the night of a full moon.",
  },
  36: {
    gold: "With its acute hearing, it can pick up sounds from far away. It usually hides in quiet places.",
    silver: "Its very sensitive ears lets it dis tinguish distant sounds. As a re sult, it prefers quiet places.",
    crystal: "Said to live in quiet, remote mountains, this type of fairy has a strong aversion to being seen.",
  },
  37: {
    gold: "As it develops, its single white tail gains color and splits into six. It is quite warm and cuddly.",
    silver: "If it is attacked by an enemy that is stronger than itself, it feigns injury to fool the enemy and escapes.",
    crystal: "As its body grows larger, its six warm tails become more beautiful, with a more luxur ious coat of fur.",
  },
  38: {
    gold: "Some legends claim that each of its nine tails has its own unique type of special mystical power.",
    silver: "Its nine beautiful tails are filled with a wondrous energy that could keep it alive for 1,000 years.",
    crystal: "It is said to live a thousand years, and each of its tails is loaded with supernatural powers.",
  },
  39: {
    gold: "If it inflates to SING a lullaby, it can perform longer and cause sure drowsiness in its audience.",
    silver: "Looking into its cute, round eyes causes it to sing a relaxing melody, inducing its enemies to sleep.",
    crystal: "It rolls its cute eyes as it sings a soothing lullaby. Its gentle song puts anyone who hears it to sleep.",
  },
  40: {
    gold: "Their fur feels so good that if two of them snuggle together, they won\'t want to be separated.",
    silver: "It has a very fine fur. Take care not to make it angry, or it may inflate steadily and hit with a BODY SLAM.",
    crystal: "The rich, fluffy fur that covers its body feels so good that anyone who feels it can\'t stop touching it.",
  },
  41: {
    gold: "While flying, it constantly emits ultrasonic waves from its mouth to check its sur roundings.",
    silver: "Capable of flying safely in dark places, it emits ultrasonic cries to check for any obstacles.",
    crystal: "During the day, it gathers with others and hangs from the ceilings of old buildings and caves.",
  },
  42: {
    gold: "However hard its victim\'s hide may be, it punctures with sharp fangs and gorges itself with blood.",
    silver: "It can drink more than 10 ounces of blood at once. If it has too much, it gets heavy and flies clumsily.",
    crystal: "When it plunges its fangs into its prey, it instantly draws and gulps down more than ten ounces of blood.",
  },
  43: {
    gold: "Awakened by moon light, it roams actively at night. In the day, it stays quietly underground.",
    silver: "If exposed to moonlight, it starts to move. It roams far and wide at night to scatter its seeds.",
    crystal: "During the day, it stays in the cold underground to avoid the sun. It grows by bath ing in moonlight.",
  },
  44: {
    gold: "What appears to be drool is actually sweet honey. It is very sticky and clings stubbornly if touched.",
    silver: "It secretes a sticky, drool-like honey. Although sweet, it smells too repulsive to get very close.",
    crystal: "The smell from its drool-like syrup and the pollen on its petals is so bad, it may make opponents faint.",
  },
  45: {
    gold: "It has the world\'s largest petals. With every step, the petals shake out heavy clouds of toxic pollen.",
    silver: "The bud bursts into bloom with a bang. It then starts scattering allergenic, poi sonous pollen.",
    crystal: "By shaking its big petals, it scat ters toxic pollen into the air, turning the air yellow.",
  },
  46: {
    gold: "It is doused with mushroom spores when it is born. As its body grows, mushrooms sprout from its back.",
    silver: "As its body grows large, oriental mushrooms named tochukaso start sprouting out of its back.",
    crystal: "The tochukaso growing on this POKéMON\'s back orders it to extract juice from tree trunks.",
  },
  47: {
    gold: "It stays mostly in dark, damp places, the preference not of the bug, but of the big mush rooms on its back.",
    silver: "The larger the mushroom on its back grows, the stronger the mush room spores it scatters.",
    crystal: "When nothing\'s left to extract from the bug, the mushrooms on its back leave spores on the bug\'s egg.",
  },
  48: {
    gold: "Its eyes also function as radar units. It catches and eats small bugs that hide in darkness.",
    silver: "Poison oozes from all over its body. It catches and eats small bugs at night that are at tracted by light.",
    crystal: "The small bugs it eats appear only at night, so it sleeps in a hole in a tree until night falls.",
  },
  49: {
    gold: "When it attacks, it flaps its large wings violently to scatter its poi sonous powder all around.",
    silver: "The powder on its wings is poisonous if it is dark in color. If it is light, it causes paralysis.",
    crystal: "The scales it scatters will paralyze anyone who touches them, making that person unable to stand.",
  },
  50: {
    gold: "Its skin is very thin. If it is exposed to light, its blood heats up, causing it to grow weak.",
    silver: "If a DIGLETT DIGS through a field, it leaves the soil perfectly tilled and ideal for planting crops.",
    crystal: "It digs under ground and chews on tree roots, sticking its head out only when the sun isn\'t bright.",
  },
  51: {
    gold: "Its three heads bob separately up and down to loosen the soil nearby, making it easier for it to burrow.",
    silver: "Extremely power ful, they can DIG through even the hardest ground to a depth of over 60 miles.",
    crystal: "These DIGLETT triplets dig over 60 miles below sea level. No one knows what it\'s like underground.",
  },
  52: {
    gold: "It is fascinated by round objects. It can\'t stop playing with them until it tires and falls asleep.",
    silver: "It loves anything that shines. It especially adores coins that it picks up and se cretly hoards.",
    crystal: "It loves things that sparkle. When it sees a shiny object, the gold coin on its head shines too.",
  },
  53: {
    gold: "Many adore it for its sophisticated air. However, it will lash out and scratch for little reason.",
    silver: "Its lithe muscles allow it to walk without making a sound. It attacks in an instant.",
    crystal: "Behind its lithe, elegant appearance lies a barbaric side. It will tear apart its prey on a mere whim.",
  },
  54: {
    gold: "It has mystical powers but doesn\'t recall that it has used them. That is why it always looks puzzled.",
    silver: "If its chronic headache peaks, it may exhibit odd powers. It seems unable to recall such an episode.",
    crystal: "The only time it can use its psy chic power is when its sleeping brain cells happen to wake.",
  },
  55: {
    gold: "When it swims at full speed using its long, webbed limbs, its fore head somehow be gins to glow.",
    silver: "It appears by waterways at dusk. It may use tele kinetic powers if its forehead glows mysteriously.",
    crystal: "It swims grace fully along on the quiet, slow-moving rivers and lakes of which it is so fond.",
  },
  56: {
    gold: "It is extremely ill-tempered. Groups of them will attack any handy target for no reason.",
    silver: "It\'s unsafe to ap proach if it gets violently enraged for no reason and can\'t distinguish friends from foes.",
    crystal: "It lives in groups in the treetops. If it loses sight of its group, it becomes infuriated by its loneliness.",
  },
  57: {
    gold: "If approached while asleep, it may awaken and angrily give chase in a groggy state of semi-sleep.",
    silver: "It becomes wildly furious if it even senses someone looking at it. It chases anyone that meets its glare.",
    crystal: "It will beat up anyone who makes it mad, even if it has to chase them until the end of the world.",
  },
  58: {
    gold: "It has a brave and trustworthy na ture. It fear lessly stands up to bigger and stronger foes.",
    silver: "Extremely loyal, it will fearlessly bark at any oppo nent to protect its own trainer from harm.",
    crystal: "It controls a big territory. If it detects an unknown smell, it roars loudly to force out the intruder.",
  },
  59: {
    gold: "This legendary Chinese POKEMON is considered magnif icent. Many people are enchanted by its grand mane.",
    silver: "Its magnificent bark conveys a sense of majesty. Anyone hearing it can\'t help but grovel before it.",
    crystal: "An ancient picture scroll shows that people were attracted to its movement as it ran through prairies.",
  },
  60: {
    gold: "Because it is in ept at walking on its newly grown legs, it always swims around in water.",
    silver: "The direction of its belly spiral differs by area. The equator is thought to have an effect on this.",
    crystal: "The swirl on its belly is its insides showing through the skin. It looks clearer after it eats.",
  },
  61: {
    gold: "The swirl on its belly subtly un dulates. Staring at it may gradual ly cause drowsi ness.",
    silver: "The skin on most of its body is moist. However, the skin on its belly spiral feels smooth.",
    crystal: "Though it is skilled at walk ing, it prefers to live underwater where there is less danger.",
  },
  62: {
    gold: "This strong and skilled swimmer is even capable of crossing the Pacific Ocean just by kicking.",
    silver: "Although an ener getic, skilled swimmer that uses all of its mus cles, it lives on dry land.",
    crystal: "It can use its well-developed arms and legs to run on the surface of the water for a split second.",
  },
  63: {
    gold: "It senses impend ing attacks and TELEPORTS away to safety before the actual attacks can strike.",
    silver: "If it decides to TELEPORT randomly, it creates the illusion that it has created copies of itself.",
    crystal: "It hypnotizes itself so that it can teleport away when it senses danger, even if it is asleep.",
  },
  64: {
    gold: "It possesses strong spiritual power. The more danger it faces, the stronger its psychic power.",
    silver: "If it uses its abilities, it emits special alpha waves that cause machines to malfunction.",
    crystal: "When it closes its eyes, twice as many alpha parti cles come out of the surface of its body.",
  },
  65: {
    gold: "Closing both its eyes heightens all its other senses. This enables it to use its abilities to their extremes.",
    silver: "Its brain cells multiply continu ally until it dies. As a result, it remembers everything.",
    crystal: "It has an IQ of 5000. It calcu lates many things in order to gain the edge in every battle.",
  },
  66: {
    gold: "Always brimming with power, it passes time by lifting boulders. Doing so makes it even stronger.",
    silver: "It loves to work out and build its muscles. It is never satisfied, even if it trains hard all day long.",
    crystal: "It trains by lifting rocks in the mountains. It can even pick up a GRAVELER with ease.",
  },
  67: {
    gold: "It always goes at its full power, but this very tough and durable POKéMON never gets tired.",
    silver: "The muscles cover ing its body teem with power. Even when still, it exudes an amazing sense of strength.",
    crystal: "This tough POKéMON always stays in the zone. Its muscles become thicker after every battle.",
  },
  68: {
    gold: "It quickly swings its four arms to rock its opponents with ceaseless punches and chops from all angles.",
    silver: "It uses its four powerful arms to pin the limbs of its foe, then throws the victim over the horizon.",
    crystal: "With four arms that react more quickly than it can think, it can execute many punches at once.",
  },
  69: {
    gold: "Even though its body is extremely skinny, it is blindingly fast when catching its prey.",
    silver: "It plants its feet deep underground to replenish wa ter. It can\'t es cape its enemy while it\'s rooted.",
    crystal: "If it notices anything that moves, it immediately flings its vine at the object.",
  },
  70: {
    gold: "Even though it is filled with ACID, it does not melt because it also oozes a neutral izing fluid.",
    silver: "If its prey is bigger than its mouth, it slices up the victim with sharp leaves, then eats every morsel.",
    crystal: "When it\'s hungry, it swings its razor-sharp leaves, slicing up any unlucky object nearby for food.",
  },
  71: {
    gold: "ACID that has dis solved many prey becomes sweeter, making it even more effective at attracting prey.",
    silver: "This horrifying plant POKéMON at tracts prey with aromatic honey, then melts them in its mouth.",
    crystal: "Once ingested into this POKéMON\'s body, even the hardest object will melt into nothing.",
  },
  72: {
    gold: "When the tide goes out, dehydrated TENTACOOL remains can be found washed up on the shore.",
    silver: "It drifts aimless ly in waves. Very difficult to see in water, it may not be noticed until it stings.",
    crystal: "As it floats along on the waves, it uses its toxic feelers to stab anything it touches.",
  },
  73: {
    gold: "Its 80 tentacles absorb water and stretch almost endlessly to CON STRICT its prey and enemies.",
    silver: "In battle, it extends all 80 of its tentacles to entrap its oppo nent inside a poisonous net.",
    crystal: "When its 80 feel ers absorb water, it stretches to become like a net to entangle its prey.",
  },
  74: {
    gold: "Most people may not notice, but a closer look should reveal that there are many GEODUDE around.",
    silver: "It uses its arms to steadily climb steep mountain paths. It swings its fists around if angered.",
    crystal: "Proud of their sturdy bodies, they bash against each other in a contest to prove whose is harder.",
  },
  75: {
    gold: "With a free and uncaring nature, it doesn\'t mind if pieces break off while it rolls down mountains.",
    silver: "A slow walker, it rolls to move. It pays no attention to any object that happens to be in its path.",
    crystal: "It travels by rol ling on mountain paths. If it gains too much speed, it stops by running into huge rocks.",
  },
  76: {
    gold: "It sheds its skin once a year. The discarded shell immediately hard ens and crumbles away.",
    silver: "It is capable of blowing itself up. It uses this explosive force to jump from mountain to mountain.",
    crystal: "Its rock-like body is so durable, even high-powered dynamite blasts fail to scratch its rugged hide.",
  },
  77: {
    gold: "It is a weak run ner immediately after birth. It gradually becomes faster by chasing after its parents.",
    silver: "Its hind legs, which have hard er-than-diamond hooves, kick back at any presence it senses behind it.",
    crystal: "Training by jumping over grass that grows longer every day has made it a world-class jumper.",
  },
  78: {
    gold: "At full gallop, its four hooves barely touch the ground because it moves so incredi bly fast.",
    silver: "With incredible acceleration, it reaches its top speed of 150 mph after running just ten steps.",
    crystal: "It just loves to gallop. The faster it goes, the long er the swaying flames of its mane will become.",
  },
  79: {
    gold: "It lazes vacantly near water. If something bites its tail, it won\'t even notice for a whole day.",
    silver: "A sweet sap leaks from its tail\'s tip. Although not nutritious, the tail is pleasant to chew on.",
    crystal: "It is always so absent-minded that it won\'t react, even if its flavorful tail is bitten.",
  },
  80: {
    gold: "If the tail-biting SHELLDER is thrown off in a harsh battle, it reverts to being an ordi nary SLOWPOKE.",
    silver: "Naturally dull to begin with, it lost its ability to feel pain due to SHELLDER\'s seeping poison.",
    crystal: "An attached SHELLDER won\'t let go because of the tasty flavor that oozes out of its tail.",
  },
  81: {
    gold: "It is attracted by electromagnetic waves. It may approach trainers if they are using their POKéGEAR.",
    silver: "The units at the sides of its body generate anti gravity energy to keep it aloft in the air.",
    crystal: "The electricity emitted by the units on each side of its body cause it to become a strong magnet.",
  },
  82: {
    gold: "Three MAGNEMITE are linked by a strong magnetic force. Earaches will occur if you get too close.",
    silver: "The MAGNEMITE are united by a mag netism so power ful, it dries all moisture in its vicinities.",
    crystal: "When many MAGNETON gather together, the resulting magnetic storm disrupts radio waves.",
  },
  83: {
    gold: "If anyone tries to disturb where the essential plant sticks grow, it uses its own stick to thwart them.",
    silver: "If it eats the plant stick it carries as emer gency rations, it runs off in search of a new stick.",
    crystal: "In order to pre vent their extinction, more people have made an effort to breed these POKéMON.",
  },
  84: {
    gold: "By alternately raising and lower ing its two heads, it balances itself to be more stable while running.",
    silver: "It races through grassy plains with powerful strides, leaving footprints up to four inches deep.",
    crystal: "It lives on a grassy plain where it can see a long way. If it sees an enemy, it runs away at 60 mph.",
  },
  85: {
    gold: "It collects data and plans three times as wisely, but it may think too much and be come immobilized.",
    silver: "If one of the heads gets to eat, the others will be satisfied, too, and they will stop squabbling.",
    crystal: "An enemy that takes its eyes off any of the three heads--even for a second--will get pecked severely.",
  },
  86: {
    gold: "Although it can\'t walk well on land, it is a graceful swimmer. It espe cially loves being in frigid seas.",
    silver: "In daytime, it is often found asleep on the seabed in shallow waters. Its nostrils close while it swims.",
    crystal: "The light blue fur that covers it keeps it protected against the cold. It loves iceberg- filled oceans.",
  },
  87: {
    gold: "Its streamlined body has little drag in water. The colder the temperature, the friskier it gets.",
    silver: "It loves frigid seas with ice floes. It uses its long tail to change swimming direction quickly.",
    crystal: "It sleeps under shallow ocean waters during the day, then looks for food at night when it\'s cold.",
  },
  88: {
    gold: "As it moves, it loses bits of its body from which new GRIMER emerge. This worsens the stench around it.",
    silver: "Wherever GRIMER has passed, so many germs are left behind that no plants will ever grow again.",
    crystal: "When two of these POKéMON\'s bodies are combined together, new poisons are created.",
  },
  89: {
    gold: "They love to gath er in smelly areas where sludge ac cumulates, making the stench around them worse.",
    silver: "Its body is made of a powerful poi son. Touching it accidentally will cause a fever that requires bed rest.",
    crystal: "As it moves, a very strong poison leaks from it, making the ground there barren for three years.",
  },
  90: {
    gold: "It swims facing backward by open ing and closing its two-piece shell. It is surprisingly fast.",
    silver: "Grains of sand trapped in its shells mix with its body fluids to form beautiful pearls.",
    crystal: "Clamping on to an opponent reveals its vulnerable parts, so it uses this move only as a last resort.",
  },
  91: {
    gold: "Once it slams its shell shut, it is impossible to open, even by those with superi or strength.",
    silver: "CLOYSTER that live in seas with harsh tidal currents grow large, sharp spikes on their shells.",
    crystal: "Even a missile can\'t break the spikes it uses to stab opponents. They\'re even hard er than its shell.",
  },
  92: {
    gold: "With its gas-like body, it can sneak into any place it desires. However, it can be blown away by wind.",
    silver: "Its thin body is made of gas. It can envelop an opponent of any size and cause suffocation.",
    crystal: "It wraps its op ponent in its gas- like body, slowly weakening its prey by poisoning it through the skin.",
  },
  93: {
    gold: "In total darkness, where nothing is visible, HAUNTER lurks, silently stalking its next victim.",
    silver: "Its tongue is made of gas. If licked, its victim starts shaking constantly until death even tually comes.",
    crystal: "It hides in the dark, planning to take the life of the next living thing that wanders close by.",
  },
  94: {
    gold: "It steals heat from its surround ings. If you feel a sudden chill, it is certain that a GENGAR appeared.",
    silver: "To steal the life of its target, it slips into the prey\'s shadow and silently waits for an opportunity.",
    crystal: "Hiding in people\'s shadows at night, it absorbs their heat. The chill it causes makes the victims shake.",
  },
  95: {
    gold: "It twists and squirms through the ground. The thunderous roar of its tunneling echoes a long way.",
    silver: "It rapidly bores through the ground at 50 mph by squirming and twisting its mas sive, rugged body.",
    crystal: "As it digs through the ground, it absorbs many hard objects. This is what makes its body so solid.",
  },
  96: {
    gold: "If you think that you had a good dream, but you can\'t remember it, a DROWZEE has probably eaten it.",
    silver: "It remembers every dream it eats. It rarely eats the dreams of adults because children\'s are much tastier.",
    crystal: "When it twitches its nose, it can tell where someone is sleeping and what that person is dreaming about.",
  },
  97: {
    gold: "When it is very hungry, it puts humans it meets to sleep, then it feasts on their dreams.",
    silver: "Always holding a pendulum that it rocks at a steady rhythm, it causes drowsiness in any one nearby.",
    crystal: "The longer it swings its pendulum, the longer the effects of its hypnosis last.",
  },
  98: {
    gold: "If it senses dan ger approaching, it cloaks itself with bubbles from its mouth so it will look bigger.",
    silver: "The pincers break off easily. If it loses a pincer, it somehow becomes incapable of walk ing sideways.",
    crystal: "If it is unable to find food, it will absorb nutrients by swallowing a mouthful of sand.",
  },
  99: {
    gold: "It can hardly lift its massive, overgrown pincer. The pincer\'s size makes it difficult to aim properly.",
    silver: "Its pincers grow peculiarly large. If it lifts the pincers too fast, it loses its bal ance and staggers.",
    crystal: "Its oversized claw is very powerful, but when it\'s not in battle, the claw just gets in the way.",
  },
  100: {
    gold: "It rolls to move. If the ground is uneven, a sudden jolt from hitting a bump can cause it to explode.",
    silver: "It was discovered when POKé BALLS were introduced. It is said that there is some connection.",
    crystal: "During the study of this POKéMON, it was discovered that its compo nents are not found in nature.",
  },
  101: {
    gold: "It is dangerous. If it has too much electricity and has nothing to do, it amuses itself by exploding.",
    silver: "It stores an over flowing amount of electric energy inside its body. Even a small shock makes it explode.",
    crystal: "The more energy it charges up, the faster it gets. But this also makes it more likely to explode.",
  },
  102: {
    gold: "The shell is very durable. Even if it cracks, it can survive without spilling the contents.",
    silver: "Using telepathy only they can receive, they always form a cluster of six EXEGGCUTE.",
    crystal: "If even one is separated from the group, the energy bond between the six will make them rejoin instantly.",
  },
  103: {
    gold: "Its three heads think independent ly. However, they are friendly and never appear to squabble.",
    silver: "If a head drops off, it emits a telepathic call in search of others to form an EXEGGCUTE cluster.",
    crystal: "Living in a good environment makes it grow lots of heads. A head that drops off becomes an EXEGGCUTE.",
  },
  104: {
    gold: "If it is sad or lonely, the skull it wears shakes, and emits a plain tive and mournful sound.",
    silver: "It always wears the skull of its dead mother, so no one has any idea what its hidden face looks like.",
    crystal: "It lost its mother after its birth. It wears its mother\'s skull, never revealing its true face.",
  },
  105: {
    gold: "It has been seen pounding boulders with the bone it carries in order to tap out mes sages to others.",
    silver: "It collects bones from an unknown place. A MAROWAK graveyard exists somewhere in the world, rumors say.",
    crystal: "Somewhere in the world is a ceme tery just for MAROWAK. It gets its bones from those graves.",
  },
  106: {
    gold: "This amazing POKé MON has an awesome sense of balance. It can kick in succession from any position.",
    silver: "If it starts kick ing repeatedly, both legs will stretch even long er to strike a fleeing foe.",
    crystal: "It is also called the Kick Master. It uses its elastic legs to execute every known kick.",
  },
  107: {
    gold: "Its punches slice the air. However, it seems to need a short break after fighting for three minutes.",
    silver: "Its punches slice the air. They are launched at such high speed, even a slight graze could cause a burn.",
    crystal: "To increase the strength of all its punch moves, it spins its arms just before making contact.",
  },
  108: {
    gold: "Its tongue has well-developed nerves that run to the very tip, so it can be deft ly manipulated.",
    silver: "Its long tongue, slathered with a gooey saliva, sticks to any thing, so it is very useful.",
    crystal: "It has a tongue that is over 6’6’’ long. It uses this long tongue to lick its body clean.",
  },
  109: {
    gold: "Its thin, filmy body is filled with gases that cause constant sniffles, coughs and teary eyes.",
    silver: "The poisonous gases it contains are a little bit lighter than air, keeping it slight ly airborne.",
    crystal: "If one gets close enough to it when it expels poison ous gas, the gas swirling inside it can be seen.",
  },
  110: {
    gold: "If one of the twin KOFFING inflates, the other one deflates. It con stantly mixes its poisonous gases.",
    silver: "Top-grade perfume is made using its internal poison gases by diluting them to the high est level.",
    crystal: "When it inhales poisonous gases from garbage, its body expands, and its insides smell much worse.",
  },
  111: {
    gold: "It is inept at turning because of its four short legs. It can only charge and run in one direction.",
    silver: "It doesn\'t care if there is anything in its way. It just charges and destroys all ob stacles.",
    crystal: "It can remember only one thing at a time. Once it starts rushing, it forgets why it started.",
  },
  112: {
    gold: "Its rugged hide protects it from even the heat of lava. However, the hide also makes it insensitive.",
    silver: "Its brain devel oped when it began walking on hind legs. Its thick hide protects it even in magma.",
    crystal: "By lightly spin ning its drill- like horn, it can easily shatter even a diamond in the rough.",
  },
  113: {
    gold: "It walks carefully to prevent its egg from breaking. However, it is extremely fast at running away.",
    silver: "Few in number and difficult to cap ture, it is said to bring happiness to the trainer who catches it.",
    crystal: "People try to catch it for its extremely nutritious eggs, but it rarely can be found.",
  },
  114: {
    gold: "The vines that cloak its entire body are always jiggling. They effectively un nerve its foes.",
    silver: "It tangles any moving thing with its vines. Their subtle shaking is ticklish if you get ensnared.",
    crystal: "During battle, it constantly moves the vines that cover its body in order to annoy its opponent.",
  },
  115: {
    gold: "If it is safe, the young gets out of the belly pouch to play. The adult keeps a close eye on the youngster.",
    silver: "To protect its young, it will never give up during battle, no matter how badly wounded it is.",
    crystal: "To avoid crushing the baby it carries in its pouch, it always sleeps standing up.",
  },
  116: {
    gold: "If attacked by a larger enemy, it quickly swims to safety by adeptly controlling its dorsal fin.",
    silver: "Its big, developed fins move rapidly, allowing it to swim backward while still facing forward.",
    crystal: "When they\'re in a safe location, they can be seen playfully tangling their tails together.",
  },
  117: {
    gold: "An examination of its cells revealed the presence of a gene not found in HORSEA. It became a hot topic.",
    silver: "Its fin-tips leak poison. Its fins and bones are highly valued as ingredients in herbal medicine.",
    crystal: "The male raises the young. If it is approached, it uses its toxic spikes to fend off the intruder.",
  },
  118: {
    gold: "Its dorsal, pecto ral and tail fins wave elegantly in water. That is why it is known as the water dancer.",
    silver: "A strong swimmer, it is capable of swimming nonstop up fast streams at a steady speed of five knots.",
    crystal: "During spawning season, they swim gracefully in the water, searching for their perfect mate.",
  },
  119: {
    gold: "During spawning season, SEAKING gather from all over, coloring the rivers a brilliant red.",
    silver: "Using its horn, it bores holes in riverbed boulders, making nests to prevent its eggs from washing away.",
    crystal: "When autumn comes, the males patrol the area around their nests in order to protect their offspring.",
  },
  120: {
    gold: "At night, the cen ter of its body slowly flickers with the same rhythm as a human heartbeat.",
    silver: "Even if its body is torn, it can regenerate as long as the glowing central core re mains intact.",
    crystal: "When the stars twinkle at night, it floats up from the sea floor, and its body\'s center core flickers.",
  },
  121: {
    gold: "The center section of its body is called the core. It glows in a dif ferent color each time it is seen.",
    silver: "Regardless of the environment it lives in, its body grows to form a symmetrical geo metric shape.",
    crystal: "It is said that it uses the seven- colored core of its body to send electric waves into outer space.",
  },
  122: {
    gold: "A skilled mime from birth, it gains the ability to create invisi ble objects as it matures.",
    silver: "Its fingertips emit a peculiar force field that hardens air to create an actual wall.",
    crystal: "It uses the mysterious power it has in its fingers to solidify air into an invisible wall.",
  },
  123: {
    gold: "It slashes through grass with its sharp scythes, moving too fast for the human eye to track.",
    silver: "When it moves, it leaves only a blur. If it hides in grass, its pro tective colors make it invisible.",
    crystal: "It\'s very proud of its speed. It moves so fast that its opponent does not even know what knocked it down.",
  },
  124: {
    gold: "It rocks its body rhythmically. It appears to alter the rhythm depend ing on how it is feeling.",
    silver: "It speaks a lan guage similar to that of humans. However, it seems to use dancing to communicate.",
    crystal: "It has several different cry pat terns, each of which seems to have its own meaning.",
  },
  125: {
    gold: "Electricity runs across the surface of its body. In darkness, its en tire body glows a whitish-blue.",
    silver: "Its body constant ly discharges electricity. Get ting close to it will make your hair stand on end.",
    crystal: "When two ELECTABUZZ touch, they control the electric currents to communicate their feelings.",
  },
  126: {
    gold: "It dislikes cold places, so it blows scorching flames to make the environment suit able for itself.",
    silver: "The fiery surface of its body gives off a wavering, rippling glare that is similar to the sun.",
    crystal: "It moves more frequently in hot areas. It can heal itself by dipping its wound into lava.",
  },
  127: {
    gold: "With its horns, it digs burrows to sleep in at night. In the morning, damp soil clings to its body.",
    silver: "Swings its long antlers wildly to attack. During cold periods, it hides deep in forests.",
    crystal: "When the tempera ture drops at night, it sleeps on treetops or among roots where it is well hidden.",
  },
  128: {
    gold: "They fight each other by locking horns. The herd\'s protector takes pride in its bat tle-scarred horns.",
    silver: "After heightening its will to fight by whipping itself with its three tails, it charges at full speed.",
    crystal: "These violent POKéMON fight with other mem bers of their herd in order to prove their strength.",
  },
  129: {
    gold: "An underpowered, pathetic POKéMON. It may jump high on rare occasions, but never more than seven feet.",
    silver: "For no reason, it jumps and splashes about, making it easy for predators like PIDGEOTTO to catch it mid-jump.",
    crystal: "This weak and pathetic POKéMON gets easily pushed along rivers when there are strong currents.",
  },
  130: {
    gold: "They say that during past wars, GYARADOS would appear and leave blazing ruins in its wake.",
    silver: "Once it appears, it goes on a ram page. It remains enraged until it demolishes every thing around it.",
    crystal: "It appears when ever there is world conflict, burning down any place it travels through.",
  },
  131: {
    gold: "They have gentle hearts. Because they rarely fight, many have been caught. Their num ber has dwindled.",
    silver: "It ferries people across the sea on its back. It may sing an enchanting cry if it is in a good mood.",
    crystal: "This gentle POKéMON loves to give people rides and provides a ve ry comfortable way to get around.",
  },
  132: {
    gold: "It can transform into anything. When it sleeps, it changes into a stone to avoid being attacked.",
    silver: "Its transformation ability is per fect. However, if made to laugh, it can\'t maintain its disguise.",
    crystal: "When it encount ers another DITTO, it will move faster than normal to duplicate that opponent exactly.",
  },
  133: {
    gold: "It has the ability to alter the com position of its body to suit its surrounding envi ronment.",
    silver: "Its irregularly configured DNA is affected by its surroundings. It evolves if its en vironment changes.",
    crystal: "Its ability to evolve into many forms allows it to adapt smoothly and perfectly to any environment.",
  },
  134: {
    gold: "When VAPOREON\'s fins begin to vi brate, it is a sign that rain will come within a few hours.",
    silver: "It prefers beauti ful shores. With cells similar to water molecules, it could melt in water.",
    crystal: "As it uses the fins on the tip of its tail to swim, it blends with the water perfectly.",
  },
  135: {
    gold: "It concentrates the weak electric charges emitted by its cells and launches wicked lightning bolts.",
    silver: "Every hair on its body starts to stand sharply on end if it becomes charged with electricity.",
    crystal: "The negatively charged ions generated in its fur create a constant sparking noise.",
  },
  136: {
    gold: "It stores some of the air it inhales in its internal flame pouch, which heats it to over 3,000 degrees.",
    silver: "It fluffs out its fur collar to cool down its body temperature, which can reach 1,650 degrees.",
    crystal: "Once it has stored up enough heat, this POKéMON\'s body temperature can reach up to 1700 degrees.",
  },
  137: {
    gold: "It is a manmade POKéMON. Since it doesn\'t breathe, people are eager to try it in any environment.",
    silver: "A manmade POKéMON that came about as a result of re search. It is pro grammed with only basic motions.",
    crystal: "An artificial POKéMON created due to extensive research, it can perform only what is in its program.",
  },
  138: {
    gold: "Revived from an ancient fossil, this POKéMON uses air stored in its shell to sink and rise in water.",
    silver: "This POKéMON from ancient times is said to have navi gated the sea by adeptly twisting its 10 tentacles.",
    crystal: "In prehistoric times, it swam on the sea floor, eating plankton. Its fossils are sometimes found.",
  },
  139: {
    gold: "Apparently, it cracked SHELLDER\'s shell with its sharp fangs and sucked out the insides.",
    silver: "Once wrapped around its prey, it never lets go. It eats the prey by tearing at it with sharp fangs.",
    crystal: "Its heavy shell allowed it to reach only nearby food. This could be the reason it is extinct.",
  },
  140: {
    gold: "On rare occasions, some have been found as fossils which they became while hiding on the ocean floor.",
    silver: "This POKéMON lived in ancient times. On rare occasions, it has been discovered as a living fossil.",
    crystal: "Three hundred million years ago, it hid on the sea floor. It also has eyes on its back that glow.",
  },
  141: {
    gold: "In the water, it tucks in its limbs to become more compact, then it wiggles its shell to swim fast.",
    silver: "With sharp claws, this ferocious, ancient POKéMON rips apart prey and sucks their body fluids.",
    crystal: "It was able to swim quickly thro ugh the water by compactly folding up its razor-sharp sickles.",
  },
  142: {
    gold: "A vicious POKéMON from the distant past, it appears to have flown by spreading its wings and gliding.",
    silver: "This vicious POKé MON is said to have flown in an cient skies while shrieking high- pitched cries.",
    crystal: "In prehistoric times, this POKéMON flew freely and fearlessly through the skies.",
  },
  143: {
    gold: "What sounds like its cry may ac tually be its snores or the rumblings of its hungry belly.",
    silver: "Its stomach\'s di gestive juices can dissolve any kind of poison. It can even eat things off the ground.",
    crystal: "This POKéMON\'s stomach is so strong, even eating moldy or rotten food will not affect it.",
  },
  144: {
    gold: "The magnificent, seemingly translu cent wings of this legendary bird POKéMON are said to be made of ice.",
    silver: "One of the legen dary bird POKéMON, it chills moisture in the atmosphere to create snow while flying.",
    crystal: "Legendary bird POKéMON. As it flies through the sky, it cools the air, causing snow to fall.",
  },
  145: {
    gold: "This legendary bird POKéMON causes savage thunderstorms by flapping its glit tering wings.",
    silver: "This legendary bird POKéMON is said to appear only when a thun dercloud parts into two halves.",
    crystal: "Legendary bird POKéMON. They say lightning caused by the flapping of its wings causes summer storms.",
  },
  146: {
    gold: "This legendary POKéMON scatters embers with every flap of its wings. It is a thrilling sight to behold.",
    silver: "This legendary bird POKéMON is said to bring early spring to the wintry lands it visits.",
    crystal: "Legendary bird POKéMON. It is said to migrate from the south along with the spring.",
  },
  147: {
    gold: "It is born large to start with. It repeatedly sheds its skin as it steadily grows longer.",
    silver: "This POKéMON is full of life ener gy. It continually sheds its skin and grows steadily larger.",
    crystal: "It sheds many lay ers of skin as it grows larger. Dur ing this process, it is protected by a rapid waterfall.",
  },
  148: {
    gold: "They say that if it emits an aura from its whole body, the weather will begin to change instantly.",
    silver: "Its crystalline orbs appear to give this POKéMON the power to freely control the weather.",
    crystal: "It is called the divine POKéMON. When its entire body brightens slightly, the weather changes.",
  },
  149: {
    gold: "It is said that this POKéMON con stantly flies over the immense seas and rescues drown ing people.",
    silver: "This marine POKé MON has an impres sive build that lets it freely fly over raging seas without trouble.",
    crystal: "It is said that somewhere in the ocean lies an island where these gather. Only they live there.",
  },
  150: {
    gold: "Because its battle abilities were raised to the ultimate level, it thinks only of de feating its foes.",
    silver: "It usually remains motionless to con serve energy, so that it may un leash its full power in battle.",
    crystal: "Said to rest qui etly in an undiscovered cave, this POKéMON was created solely for battling.",
  },
  151: {
    gold: "Apparently, it appears only to those people who are pure of heart and have a strong desire to see it.",
    silver: "Its DNA is said to contain the genet ic codes of all POKéMON, so it can use all kinds of techniques.",
    crystal: "Because it can learn any move, some people began research to see if it is the ancestor of all POKéMON.",
  },
  152: {
    gold: "A sweet aroma gently wafts from the leaf on its head. It is docile and loves to soak up the sun\'s rays.",
    silver: "Its pleasantly aromatic leaves have the ability to check the hu midity and tem perature.",
    crystal: "It loves to bask in the sunlight. It uses the leaf on its head to seek out warm places.",
  },
  153: {
    gold: "The scent of spices comes from around its neck. Somehow, sniffing it makes you want to fight.",
    silver: "A spicy aroma ema nates from around its neck. The aroma acts as a stimulant to re store health.",
    crystal: "The scent that wafts from the leaves on its neck causes anyone who smells it to become energetic.",
  },
  154: {
    gold: "The aroma that rises from its petals contains a substance that calms aggressive feelings.",
    silver: "MEGANIUM\'s breath has the power to revive dead grass and plants. It can make them healthy again.",
    crystal: "Anyone who stands beside it becomes refreshed, just as if they were relaxing in a sunny forest.",
  },
  155: {
    gold: "It is timid, and always curls it self up in a ball. If attacked, it flares up its back for protection.",
    silver: "It usually stays hunched over. If it is angry or surprised, it shoots flames out of its back.",
    crystal: "The fire that spouts from its back burns hottest when it is angry. The flaring flames intimidate foes.",
  },
  156: {
    gold: "Be careful if it turns its back during battle. It means that it will attack with the fire on its back.",
    silver: "This POKéMON is fully covered by nonflammable fur. It can withstand any kind of fire attack.",
    crystal: "Before battle, it turns its back on its opponent to demonstrate how ferociously its fire blazes.",
  },
  157: {
    gold: "If its rage peaks, it becomes so hot that anything that touches it will instantly go up in flames.",
    silver: "It has a secret, devastating move. It rubs its blaz ing fur together to cause huge explosions.",
    crystal: "When heat from its body causes the air around it to shimmer, this is a sign that it is ready to battle.",
  },
  158: {
    gold: "Its well-developed jaws are powerful and capable of crushing anything. Even its trainer must be careful.",
    silver: "It is small but rough and tough. It won\'t hesitate to take a bite out of anything that moves.",
    crystal: "This rough critter chomps at any moving object it sees. Turning your back on it is not recommended.",
  },
  159: {
    gold: "If it loses a fang, a new one grows back in its place. There are always 48 fangs lining its mouth.",
    silver: "It opens its huge jaws wide when attacking. If it loses any fangs while biting, they grow back in.",
    crystal: "The tips of its fangs are slanted backward. Once those fangs clamp down, the prey has no hope of escape.",
  },
  160: {
    gold: "When it bites with its massive and powerful jaws, it shakes its head and savagely tears its victim up.",
    silver: "It is hard for it to support its own weight out of water, so it gets down on all fours. But it moves fast.",
    crystal: "Although it has a massive body, its powerful hind legs enable it to move quickly, even on the ground.",
  },
  161: {
    gold: "A very cautious POKéMON, it raises itself up using its tail to get a better view of its surroundings.",
    silver: "It stands on its tail so it can see a long way. If it spots an enemy, it cries loudly to warn its kind.",
    crystal: "When acting as a lookout, it warns others of danger by screeching and hitting the ground with its tail.",
  },
  162: {
    gold: "It makes a nest to suit its long and skinny body. The nest is impossible for other POKéMON to enter.",
    silver: "There is no tell ing where the tail begins. Despite its short legs, it is quick at hunt ing RATTATA.",
    crystal: "It lives in narrow burrows that fit its slim body. The deeper the nests go, the more maze like they become.",
  },
  163: {
    gold: "It always stands on one foot. It changes feet so fast, the movement can rarely be seen.",
    silver: "It has a perfect sense of time. Whatever happens, it keeps rhythm by precisely tilting its head in time.",
    crystal: "It begins to hoot at the same time every day. Some trainers use them in place of clocks.",
  },
  164: {
    gold: "Its eyes are specially adapted. They concentrate even faint light and enable it to see in the dark.",
    silver: "When it needs to think, it rotates its head 180 de grees to sharpen its intellectual power.",
    crystal: "Its extremely soft feathers make no sound in flight. It silently sneaks up on prey without being detected.",
  },
  165: {
    gold: "It is very timid. It will be afraid to move if it is alone. But it will be active if it is in a group.",
    silver: "When the weather turns cold, lots of LEDYBA gather from everywhere to cluster and keep each other warm.",
    crystal: "It is timid and clusters together with others. The fluid secreted by its feet indicates its location.",
  },
  166: {
    gold: "When the stars flicker in the night sky, it flutters about, scattering a glowing powder.",
    silver: "The star patterns on its back grow larger or smaller depending on the number of stars in the night sky.",
    crystal: "In the daytime when it gets warm, it curls up inside a big leaf and drifts off into a deep slumber.",
  },
  167: {
    gold: "It lies still in the same pose for days in its web, waiting for its unsuspecting prey to wander close.",
    silver: "It spins a web using fine--but durable--thread. It then waits pa tiently for prey to be trapped.",
    crystal: "If prey becomes ensnared in its nest of spun string, it waits motionlessly until it becomes dark.",
  },
  168: {
    gold: "It spins string not only from its rear but also from its mouth. It is hard to tell which end is which.",
    silver: "A single strand of a special string is endlessly spun out of its rear. The string leads back to its nest.",
    crystal: "Rather than mak ing a nest in one specific spot, it wanders in search of food after darkness falls.",
  },
  169: {
    gold: "It flies so si lently through the dark on its four wings that it may not be noticed even when nearby.",
    silver: "The development of wings on its legs enables it to fly fast but also makes it tough to stop and rest.",
    crystal: "As a result of its pursuit of faster, yet more silent flight, a new set of wings grew on its hind legs.",
  },
  170: {
    gold: "It shoots positive and negative elec tricity between the tips of its two antennae and zaps its enemies.",
    silver: "On the dark ocean floor, its only means of communi cation is its constantly flash ing lights.",
    crystal: "Its antennae, whi ch evolved from a fin, have both po sitive and neg ative charges flo wing through them.",
  },
  171: {
    gold: "The light it emits is so bright that it can illuminate the sea\'s surface from a depth of over three miles.",
    silver: "It blinds prey with an intense burst of light, then swallows the immobilized prey in a single gulp.",
    crystal: "This POKéMON uses the bright part of its body, which changed from a dorsal fin, to lure prey.",
  },
  172: {
    gold: "It is not yet skilled at storing electricity. It may send out a jolt if amused or startled.",
    silver: "Despite its small size, it can zap even adult humans. However, if it does so, it also surprises itself.",
    crystal: "It is unskilled at storing electric power. Any kind of shock causes it to discharge energy spontaneously.",
  },
  173: {
    gold: "Because of its unusual, star-like silhouette, people believe that it came here on a meteor.",
    silver: "When numerous me teors illuminate the night sky, sightings of CLEFFA strangely increase.",
    crystal: "If the impact site of a meteorite is found, this POKéMON is certain to be within the immediate area.",
  },
  174: {
    gold: "It has a very soft body. If it starts to roll, it will bounce all over and be impossible to stop.",
    silver: "Its extremely flexible and elas tic body makes it bounce continuous ly--anytime, any where.",
    crystal: "Instead of walking with its short legs, it moves around by bouncing on its soft, tender body.",
  },
  175: {
    gold: "The shell seems to be filled with joy. It is said that it will share good luck when treated kindly.",
    silver: "A proverb claims that happiness will come to any one who can make a sleeping TOGEPI stand up.",
    crystal: "It is considered to be a symbol of good luck. Its shell is said to be filled with happiness.",
  },
  176: {
    gold: "They say that it will appear before kindhearted, car ing people and shower them with happiness.",
    silver: "It grows dispirit ed if it is not with kind people. It can float in midair without moving its wings.",
    crystal: "Although it does not flap its wings very much, it can stay up in the air as it tags along after its trainer.",
  },
  177: {
    gold: "Because its wings aren\'t yet fully grown, it has to hop to get around. It is always star ing at something.",
    silver: "It usually forages for food on the ground but may, on rare occasions, hop onto branches to peck at shoots.",
    crystal: "It is extremely good at climbing tree trunks and likes to eat the new sprouts on the trees.",
  },
  178: {
    gold: "They say that it stays still and quiet because it is seeing both the past and future at the same time.",
    silver: "In South America, it is said that its right eye sees the future and its left eye views the past.",
    crystal: "Once it begins to meditate at sun rise, the entire day will pass before it will move again.",
  },
  179: {
    gold: "If static elec tricity builds in its body, its fleece doubles in volume. Touching it will shock you.",
    silver: "Its fleece grows continually. In the summer, the fleece is fully shed, but it grows back in a week.",
    crystal: "It stores lots of air in its soft fur, allowing it to stay cool in summer and warm in winter.",
  },
  180: {
    gold: "As a result of storing too much electricity, it developed patches where even downy wool won\'t grow.",
    silver: "Its fluffy fleece easily stores electricity. Its rubbery hide keeps it from being electrocuted.",
    crystal: "Because of its rubbery, electric ity-resistant skin, it can store lots of electric ity in its fur.",
  },
  181: {
    gold: "The tail\'s tip shines brightly and can be seen from far away. It acts as a beacon for lost people.",
    silver: "The bright light on its tail can be seen far away. It has been treasured since ancient times as a beacon.",
    crystal: "When it gets dark, the light from its bright, shiny tail can be seen from far away on the ocean\'s surface.",
  },
  182: {
    gold: "BELLOSSOM gather at times and appear to dance. They say that the dance is a ritual to summon the sun.",
    silver: "Plentiful in the tropics. When it dances, its petals rub together and make a pleasant ringing sound.",
    crystal: "When these dance together, their petals rub against each other, making pretty, relaxing sounds.",
  },
  183: {
    gold: "The tip of its tail, which con tains oil that is lighter than wa ter, lets it swim without drowning.",
    silver: "The end of its tail serves as a buoy that keeps it from drowning, even in a vicious current.",
    crystal: "The fur on its body naturally repels water. It can stay dry, even when it plays in the water.",
  },
  184: {
    gold: "By keeping still and listening in tently, it can tell what is in even wild, fast- moving rivers.",
    silver: "When it plays in water, it rolls up its elongated ears to prevent their insides from get ting wet.",
    crystal: "The bubble-like pattern on its stomach helps it camouflage itself when it\'s in the water.",
  },
  185: {
    gold: "Although it always pretends to be a tree, its composi tion appears to be closer to a rock than a plant.",
    silver: "It disguises it self as a tree to avoid attack. It hates water, so it will disappear if it starts raining.",
    crystal: "If a tree branch shakes when there is no wind, it\'s a SUDOWOODO, not a tree. It hides from the rain.",
  },
  186: {
    gold: "If POLIWAG and POLIWHIRL hear its echoing cry, they respond by gather ing from far and wide.",
    silver: "Whenever three or more of these get together, they sing in a loud voice that sounds like bellowing.",
    crystal: "When it expands its throat to croak out a tune, nearby POLIWAG and POLIWHIRL gather immediately.",
  },
  187: {
    gold: "To keep from being blown away by the wind, they gather in clusters. They do enjoy gentle breezes, though.",
    silver: "Its body is so light, it must grip the ground firmly with its feet to keep from being blown away.",
    crystal: "It can be carried away on even the gentlest breeze. It may even float all the way to the next town.",
  },
  188: {
    gold: "The bloom on top of its head opens and closes as the temperature fluc tuates up and down.",
    silver: "It spreads its petals to absorb sunlight. It also floats in the air to get closer to the sun.",
    crystal: "As soon as it rains, it closes its flower and hides in the shade of a tree to avoid getting wet.",
  },
  189: {
    gold: "Once it catches the wind, it deft ly controls its cotton-puff spores to float, even around the world.",
    silver: "Drifts on seasonal winds and spreads its cotton-like spores all over the world to make more offspring.",
    crystal: "Even in the fierc est wind, it can control its fluff to make its way to any place in the world it wants.",
  },
  190: {
    gold: "Its tail is so powerful that it can use it to grab a tree branch and hold itself up in the air.",
    silver: "It lives atop tall trees. When leap ing from branch to branch, it deftly uses its tail for balance.",
    crystal: "It uses its tail to hang on to tree branches. It uses its momentum to swing from one branch to another.",
  },
  191: {
    gold: "It may drop out of the sky suddenly. If attacked by a SPEAROW, it will violently shake its leaves.",
    silver: "It lives by drink ing only dewdrops from under the leaves of plants. It is said that it eats nothing else.",
    crystal: "It is very weak. Its only means of defense is to shake its leaves desperately at its attacker.",
  },
  192: {
    gold: "It converts sun light into energy. In the darkness after sunset, it closes its petals and becomes still.",
    silver: "In the daytime, it rushes about in a hectic manner, but it comes to a com plete stop when the sun sets.",
    crystal: "As the hot season approaches, the petals on this POKéMON\'s face become more vivid and lively.",
  },
  193: {
    gold: "If it flaps its wings really fast, it can generate shock waves that will shatter win dows in the area.",
    silver: "Its large eyes can scan 360 degrees. It looks in all directions to seek out insects as its prey.",
    crystal: "It can see in all directions without moving its big eyes, helping it spot attackers and food right away.",
  },
  194: {
    gold: "This POKéMON lives in cold water. It will leave the water to search for food when it gets cold outside.",
    silver: "When it walks a round on the ground, it coats its body with a slimy, poisonous film.",
    crystal: "A mucous membrane covers its body. Touching it barehanded will cause a shooting pain.",
  },
  195: {
    gold: "This carefree POKéMON has an easy-going nature. While swimming, it always bumps into boat hulls.",
    silver: "Due to its relaxed and carefree atti tude, it often bumps its head on boulders and boat hulls as it swims.",
    crystal: "Its body is always slimy. It often bangs its head on the river bottom as it swims but seems not to care.",
  },
  196: {
    gold: "It uses the fine hair that covers its body to sense air currents and predict its ene my\'s actions.",
    silver: "By reading air currents, it can predict things such as the weath er or its foe\'s next move.",
    crystal: "The tip of its forked tail quivers when it is predicting its opponent\'s next move.",
  },
  197: {
    gold: "When agitated, this POKéMON pro tects itself by spraying poisonous sweat from its pores.",
    silver: "When darkness falls, the rings on the body begin to glow, striking fear in the hearts of anyone nearby.",
    crystal: "On the night of a full moon, or when it gets excited, the ring patterns on its body glow yellow.",
  },
  198: {
    gold: "Feared and loathed by many, it is believed to bring misfortune to all those who see it at night.",
    silver: "It is said that when chased, it lures its attacker onto dark mountain trails where the foe will get lost.",
    crystal: "It hides any shiny object it finds in a secret location. MURKROW and MEOWTH loot one another\'s stashes.",
  },
  199: {
    gold: "It has incredible intellect and in tuition. Whatever the situation, it remains calm and collected.",
    silver: "When its head was bitten, toxins entered SLOWPOKE\'s head and unlocked an extraordinary power.",
    crystal: "Every time it ya wns, SHELLDER injects more poi son into it. The poison makes it more intelligent.",
  },
  200: {
    gold: "It likes playing mischievous tricks such as screaming and wailing to startle people at night.",
    silver: "It loves to bite and yank people\'s hair from behind without warning, just to see their shocked reactions.",
    crystal: "It loves to watch people it\'s scar ed. It frightens them by screaming loudly or appear ing suddenly.",
  },
  201: {
    gold: "Their shapes look like hieroglyphs on ancient tab lets. It is said that the two are somehow related.",
    silver: "Its flat, thin body is always stuck on walls. Its shape appears to have some mean ing.",
    crystal: "Because different types of UNOWN exist, it is said that they must have a variety of abilities.",
  },
  202: {
    gold: "It hates light and shock. If attack ed, it inflates its body to pump up its counter strike.",
    silver: "To keep its pitch- black tail hidden, it lives quietly in the darkness. It is never first to attack.",
    crystal: "In order to con ceal its black tail, it lives in a dark cave and only moves about at night.",
  },
  203: {
    gold: "Its tail has a small brain of its own. Beware! If you get close, it may react to your scent and bite.",
    silver: "Its tail, which also contains a small brain, may bite on its own if it notices an alluring smell.",
    crystal: "When it is in danger, its tail uses some sort of mysterious powers to drive away the enemy.",
  },
  204: {
    gold: "It likes to make its shell thicker by adding layers of tree bark. The additional weight doesn\'t bother it.",
    silver: "It hangs and waits for flying insect prey to come near. It does not move about much on its own.",
    crystal: "It spits out a fluid that it uses to glue tree bark to its body. The fluid hardens when it touches air.",
  },
  205: {
    gold: "Its entire body is shielded by a steel-hard shell. What lurks inside the armor is a total mystery.",
    silver: "It remains immova bly rooted to its tree. It scatters pieces of its hard shell to drive its enemies away.",
    crystal: "Usually found hanging on to a fat tree trunk. It shoots out bits of its shell when it sees action.",
  },
  206: {
    gold: "When spotted, this POKéMON escapes backward by furi ously boring into the ground with its tail.",
    silver: "If spotted, it es capes by burrowing with its tail. It can float just slightly using its wings.",
    crystal: "It hides deep inside caves where no light ever reaches it and remains virtually motionless there.",
  },
  207: {
    gold: "It flies straight at its target\'s face then clamps down on the star tled victim to inject poison.",
    silver: "It usually clings to cliffs. When it spots its prey, it spreads its wings and glides down to attack.",
    crystal: "It builds its nest on a steep cliff. When it is done gliding, it hops along the ground back to its nest.",
  },
  208: {
    gold: "Its body has been compressed deep under the ground. As a result, it is even harder than a diamond.",
    silver: "It is said that if an ONIX lives for over 100 years, its composition changes to become diamond-like.",
    crystal: "The many small metal particles that cover this POKéMON\'s body reflect bright light well.",
  },
  209: {
    gold: "Although it looks frightening, it is actually kind and affectionate. It is very popular among women.",
    silver: "It has an active, playful nature. Many women like to frolic with it because of its af fectionate ways.",
    crystal: "In truth, it is a cowardly POKéMON. It growls eagerly in order to hide its fear from its opponent.",
  },
  210: {
    gold: "It is actually timid and easily spooked. If at tacked, it flails about to fend off its attacker.",
    silver: "Because its fangs are too heavy, it always keeps its head tilted down. However, its BITE is powerful.",
    crystal: "It can make most any POKéMON run away simply by opening its mouth wide to reveal its big fangs.",
  },
  211: {
    gold: "To fire its poison spikes, it must inflate its body by drinking over 2.6 gallons of water all at once.",
    silver: "The small spikes covering its body developed from scales. They in ject a toxin that causes fainting.",
    crystal: "When faced with a larger opponent, it swallows as much water as it can to match the opponent\'s size.",
  },
  212: {
    gold: "It swings its eye- patterned pincers up to scare its foes. This makes it look like it has three heads.",
    silver: "Its wings are not used for flying. They are flapped at high speed to adjust its body temperature.",
    crystal: "This POKéMON\'s pincers, which contain steel, can crush any hard object it gets a hold of into bits.",
  },
  213: {
    gold: "The BERRIES it stores in its vase-like shell decompose and become a gooey liquid.",
    silver: "It stores BERRIES inside its shell. To avoid attacks, it hides beneath rocks and remains completely still.",
    crystal: "The fluid secreted by its toes carves holes in rocks for nesting and can be mixed with BERRIES to make a drink.",
  },
  214: {
    gold: "This powerful POKéMON thrusts its prized horn under its enemies’ bellies then lifts and throws them.",
    silver: "Usually docile, but if disturbed while sipping honey, it chases off the intruder with its horn.",
    crystal: "With its Herculean powers, it can easily throw arou nd an object that is 100 times its own weight.",
  },
  215: {
    gold: "Its paws conceal sharp claws. If attacked, it sud denly extends the claws and startles its enemy.",
    silver: "Vicious in nature, it drives PIDGEY from their nests and feasts on the eggs that are left behind.",
    crystal: "This cunning POKéMON hides under the cover of darkness, waiting to attack its prey.",
  },
  216: {
    gold: "If it finds honey, its crescent mark glows. It always licks its paws because they are soaked with honey.",
    silver: "Before food be comes scarce in wintertime, its habit is to hoard food in many hid den locations.",
    crystal: "It always licks honey. Its palm tastes sweet because of all the honey it has absorbed.",
  },
  217: {
    gold: "Although it is a good climber, it prefers to snap trees with its forelegs and eat fallen BERRIES.",
    silver: "With its ability to distinguish any aroma, it unfail ingly finds all food buried deep underground.",
    crystal: "Although it has a large body, it is quite skilled at climbing trees. It eats and sleeps in the treetops.",
  },
  218: {
    gold: "It never sleeps. It has to keep moving because if it stopped, its magma body would cool and harden.",
    silver: "A common sight in volcanic areas, it slowly slithers around in a con stant search for warm places.",
    crystal: "These group to gether in areas that are hotter than normal. If it cools off, its skin hardens.",
  },
  219: {
    gold: "The shell on its back is just skin that has cooled and hardened. It breaks easily with a slight touch.",
    silver: "Its brittle shell occasionally spouts intense flames that cir culate throughout its body.",
    crystal: "Its body is as hot as lava and is always billowing. Flames will occasionally burst from its shell.",
  },
  220: {
    gold: "It rubs its snout on the ground to find and dig up food. It sometimes discovers hot springs.",
    silver: "If it smells some thing enticing, it dashes headlong off to find the source of the aroma.",
    crystal: "It uses the tip of its nose to dig for food. Its nose is so tough that even frozen ground poses no problem.",
  },
  221: {
    gold: "Because the long hair all over its body obscures its sight, it just keeps charging repeatedly.",
    silver: "If it charges at an enemy, the hairs on its back stand up straight. It is very sensi tive to sound.",
    crystal: "Although its legs are short, its rugged hooves prevent it from slipping, even on icy ground.",
  },
  222: {
    gold: "It continuously sheds and grows. The tip of its head is prized as a treasure for its beauty.",
    silver: "In a south sea nation, the people live in communi ties that are built on groups of these POKéMON.",
    crystal: "The points on its head absorb nutrients from clean water. They cannot survive in polluted water.",
  },
  223: {
    gold: "It has superb ac curacy. The water it shoots out can strike even moving prey from more than 300 feet.",
    silver: "Using its dorsal fin as a suction pad, it clings to a MANTINE\'s under side to scavenge for leftovers.",
    crystal: "To escape from an attacker, it may shoot water out of its mouth, then use that force to swim backward.",
  },
  224: {
    gold: "It traps enemies with its suction- cupped tentacles then smashes them with its rock-hard head.",
    silver: "It instinctively sneaks into rocky holes. If it gets sleepy, it steals the nest of a fel low OCTILLERY.",
    crystal: "Its instinct is to bury itself in holes. It often steals the nesting holes of others to sleep in them.",
  },
  225: {
    gold: "It carries food all day long. There are tales about lost people who were saved by the food it had.",
    silver: "It nests at the edge of sharp cliffs. It spends all day carrying food to its await ing chicks.",
    crystal: "It always carries its food with it, wherever it goes. If attacked, it throws its food at the opponent.",
  },
  226: {
    gold: "As it majestically swims, it doesn\'t care if REMORAID attach to it for scavenging its leftovers.",
    silver: "Swimming freely in open seas, it may fly out of the water and over the waves if it builds up enough speed.",
    crystal: "It swims along freely, eating things that swim into its mouth. Its whole body is very coarse.",
  },
  227: {
    gold: "Its sturdy wings look heavy, but they are actually hollow and light, allowing it to fly freely in the sky.",
    silver: "After nesting in bramble bushes, the wings of its chicks grow hard from scratches by thorns.",
    crystal: "The feathers that it sheds are very sharp. It is said that people once used the feathers as swords.",
  },
  228: {
    gold: "It uses different kinds of cries for communicating with others of its kind and for pursuing its prey.",
    silver: "To corner prey, they check each other\'s location using barks that only they can understand.",
    crystal: "Around dawn, its ominous howl echoes through the area to announce that this is its territory.",
  },
  229: {
    gold: "If you are burned by the flames it shoots from its mouth, the pain will never go away.",
    silver: "Upon hearing its eerie howls, other POKéMON get the shivers and head straight back to their nests.",
    crystal: "The pungent- smelling flame that shoots from its mouth results from toxins burn ing in its body.",
  },
  230: {
    gold: "It is said that it usually hides in underwater caves. It can create whirlpools by yawning.",
    silver: "It sleeps deep on the ocean floor to build its energy. It is said to cause tornadoes as it wakes.",
    crystal: "It stores energy by sleeping at underwater depths at which no other life forms can survive.",
  },
  231: {
    gold: "It swings its long snout around play fully, but because it is so strong, that can be dan gerous.",
    silver: "As a sign of af fection, it bumps with its snout. However, it is so strong, it may send you flying.",
    crystal: "During the desert ed morning hours, it comes ashore where it deftly uses its trunk to take a shower.",
  },
  232: {
    gold: "It has sharp, hard tusks and a rugged hide. Its TACKLE is strong enough to knock down a house.",
    silver: "The longer and bigger its tusks, the higher its rank in its herd. The tusks take long to grow.",
    crystal: "Because this POKéMON\'s skin is so tough, a normal attack won\'t even leave a scratch on it.",
  },
  233: {
    gold: "This upgraded version of PORYGON is designed for space exploration. It can\'t fly, though.",
    silver: "Further research enhanced its abil ities. Sometimes, it may exhibit motions that were not programmed.",
    crystal: "This manmade POKéMON evolved from the latest technology. It may have unprog rammed reactions.",
  },
  234: {
    gold: "The curved antlers subtly change the flow of air to create a strange space where real ity is distorted.",
    silver: "Those who stare at its antlers will gradually lose control of their senses and be unable to stand.",
    crystal: "The round balls found on the fallen antlers can be ground into a powder that aids in sleeping.",
  },
  235: {
    gold: "A special fluid oozes from the tip of its tail. It paints the fluid everywhere to mark its territory.",
    silver: "Once it becomes an adult, it has a tendency to let its comrades plant footprints on its back.",
    crystal: "The color of the mysterious fluid secreted from its tail is predeter mined for each SMEARGLE.",
  },
  236: {
    gold: "It is always bursting with en ergy. To make it self stronger, it keeps on fighting even if it loses.",
    silver: "Even though it is small, it can\'t be ignored because it will slug any handy target with out warning.",
    crystal: "To brush up on its fighting skills, it will challenge anyone. It has a very strong com petitive spirit.",
  },
  237: {
    gold: "If you become enchanted by its smooth, elegant, dance-like kicks, you may get drilled hard.",
    silver: "It launches kicks while spinning. If it spins at high speed, it may bore its way into the ground.",
    crystal: "After doing a handstand to throw off the opponent\'s timing, it presents its fancy kick moves.",
  },
  238: {
    gold: "Its lips are the most sensitive parts on its body. It always uses its lips first to examine things.",
    silver: "It always rocks its head slowly backwards and for wards as if it is trying to kiss someone.",
    crystal: "The sensitivity of its lips develops most quickly. It uses them to try to identify unknown objects.",
  },
  239: {
    gold: "It rotates its arms to generate electricity, but it tires easily, so it charges up only a little bit.",
    silver: "Even in the most vicious storm, this POKéMON plays happily if thunder rumbles in the sky.",
    crystal: "It loves violent thunder. The space between its horns flickers bluish- white when it is charging energy.",
  },
  240: {
    gold: "Each and every time it inhales and exhales, hot embers dribble out of its mouth and nostrils.",
    silver: "It is found in volcanic craters. Its body temp. is over 1100 degrees, so don\'t under estimate it.",
    crystal: "It naturally spits an 1100-degree flame. It is said when many appear, it heralds a volcanic eruption.",
  },
  241: {
    gold: "Its milk is packed with nutrition, making it the ultimate beverage for the sick or weary.",
    silver: "If it has just had a baby, the milk it produces con tains much more nutrition than usual.",
    crystal: "In order to milk a MILTANK, one must have a knack for rhythmically pull ing up and down on its udders.",
  },
  242: {
    gold: "Anyone who takes even one bite of BLISSEY\'s egg be comes unfailingly caring and pleas ant to everyone.",
    silver: "It has a very com passionate nature. If it sees a sick POKéMON, it will nurse the sufferer back to health.",
    crystal: "Biting into one of the delicious eggs that BLISSEY provides will make everyone around smile with joy.",
  },
  243: {
    gold: "The rain clouds it carries let it fire thunderbolts at will. They say that it descended with lightning.",
    silver: "A POKéMON that races across the land while barking a cry that sounds like crashing thunder.",
    crystal: "This rough POKéMON stores energy inside its body, then sweeps across the land, shooting off electricity.",
  },
  244: {
    gold: "Volcanoes erupt when it barks. Un able to restrain its extreme power, it races headlong around the land.",
    silver: "A POKéMON that races across the land. It is said that one is born every time a new volcano appears.",
    crystal: "This brawny POKéMON courses around the earth, spouting flames hotter than a volcano\'s magma.",
  },
  245: {
    gold: "Said to be the reincarnation of north winds, it can instantly purify filthy, murky water.",
    silver: "This POKéMON races across the land. It is said that north winds will somehow blow when ever it appears.",
    crystal: "This divine POKéMON blows around the world, always in search of a pure reservoir.",
  },
  246: {
    gold: "It feeds on soil. After it has eaten a large mountain, it will fall asleep so it can grow.",
    silver: "It is born deep underground. It can\'t emerge until it has entirely consumed the soil around it.",
    crystal: "Born deep under ground, this POKéMON becomes a pupa after eating enough dirt to make a mountain.",
  },
  247: {
    gold: "Its shell is as hard as sheet rock, and it is also very strong. Its THRASHING can topple a mountain.",
    silver: "Even sealed in its shell, it can move freely. Hard and fast, it has out standing destruc tive power.",
    crystal: "It will not stay still, even while it\'s a pupa. It already has arms and legs under its solid shell.",
  },
  248: {
    gold: "Its body can\'t be harmed by any sort of attack, so it is very eager to make challenges against enemies.",
    silver: "Extremely strong, it can change the landscape. It has an insolent nature that makes it not care about others.",
    crystal: "In just one of its mighty hands, it has the power to make the ground shake and moun tains crumble.",
  },
  249: {
    gold: "It is said that it quietly spends its time deep at the bottom of the sea because its powers are too strong.",
    silver: "It is said to be the guardian of the seas. It is rumored to have been seen on the night of a storm.",
    crystal: "It has an incred ible ability to calm raging sto rms. It is said that LUGIA appears when storms start.",
  },
  250: {
    gold: "Legends claim this POKéMON flies the world\'s skies con tinuously on its magnificent seven- colored wings.",
    silver: "A legend says that its body glows in seven colors. A rainbow is said to form behind it when it flies.",
    crystal: "It will reveal itself before a pure-hearted trainer by shining its bright rain bow-colored wings.",
  },
  251: {
    gold: "This POKéMON wan ders across time. Grass and trees flourish in the forests in which it has appeared.",
    silver: "When CELEBI disap pears deep in a forest, it is said to leave behind an egg it brought from the future.",
    crystal: "Revered as a guardian of the forest, CELEBI appears wherever beautiful forests exist.",
  },
};
