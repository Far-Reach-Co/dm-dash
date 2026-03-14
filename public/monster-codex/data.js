// Generated from public/lib/data/2014/5e-srd-monsters.json
// This file is intentionally bundled as plain JS so the app works from a static index.html.

export const MONSTER_DATA = [
  {
    "id": "aboleth",
    "name": "Aboleth",
    "size": "Large",
    "type": "Aberration",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 135,
    "hit_dice": "18d10",
    "challenge_rating": "10",
    "challenge_rating_value": 10,
    "speed": "Walk 10 ft. | Swim 40 ft.",
    "stats": {
      "str": 21,
      "dex": 9,
      "con": 15,
      "int": 18,
      "wis": 15,
      "cha": 18
    },
    "summary": "A brutal large reality-warping hunter. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The aboleth makes three tentacle attacks."
      },
      {
        "name": "Tentacle",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature's skin becomes translucent and slimy, the creature can't regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 15 (3d6 + 5) bludgeoning damage."
      },
      {
        "name": "Enslave",
        "description": "The aboleth targets one creature it can see within 30 ft. of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The charmed target is under the aboleth's control and can't take reactions, and the aboleth and the target can communicate telepathically with each other over any distance. Whenever the charmed target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The aboleth can breathe air and water."
      },
      {
        "name": "Mucous Cloud",
        "description": "While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 ft. of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater."
      },
      {
        "name": "Probing Telepathy",
        "description": "If a creature communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires if the aboleth can see the creature."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The aboleth makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Swipe",
        "description": "The aboleth makes one tail attack."
      },
      {
        "name": "Psychic Drain (Costs 2 Actions)",
        "description": "One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Underdark"
    ],
    "languages": "Deep Speech, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 20",
    "source_desc": "",
    "image": "/api/images/monsters/aboleth.png"
  },
  {
    "id": "acolyte",
    "name": "Acolyte",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 9,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 10,
      "con": 10,
      "int": 10,
      "wis": 14,
      "cha": 11
    },
    "summary": "A watchful medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and urban.",
    "actions": [
      {
        "name": "Club",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Spellcasting",
        "description": "The acolyte is a 1st-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 12, +4 to hit with spell attacks). The acolyte has following cleric spells prepared: - Cantrips (at will): light, sacred flame, thaumaturgy - 1st level (3 slots): bless, cure wounds, sanctuary"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 12",
    "source_desc": "Acolytes are junior members of a clergy, usually answerable to a priest. They perform a variety of functions in a temple and are granted minor spellcasting power by their deities.",
    "image": "/api/images/monsters/acolyte.png"
  },
  {
    "id": "adult-black-dragon",
    "name": "Adult Black Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 195,
    "hit_dice": "17d12",
    "challenge_rating": "14",
    "challenge_rating_value": 14,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 23,
      "dex": 14,
      "con": 21,
      "int": 14,
      "wis": 13,
      "cha": 17
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 4 (1d8) acid damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Acid Breath",
        "description": "The dragon exhales acid in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) acid damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 21",
    "source_desc": "",
    "image": "/api/images/monsters/adult-black-dragon.png"
  },
  {
    "id": "adult-blue-dragon",
    "name": "Adult Blue Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 225,
    "hit_dice": "18d12",
    "challenge_rating": "16",
    "challenge_rating_value": 16,
    "speed": "Walk 40 ft. | Burrow 30 ft. | Fly 80 ft.",
    "stats": {
      "str": 25,
      "dex": 10,
      "con": 23,
      "int": 16,
      "wis": 15,
      "cha": 19
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +12 to hit, reach 10 ft., one target. Hit: 18 (2d10 + 7) piercing damage plus 5 (1d10) lightning damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +12 to hit, reach 5 ft., one target. Hit: 14 (2d6 + 7) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +12 to hit, reach 15 ft., one target. Hit: 16 (2d8 + 7) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 ft. of the dragon and aware of it must succeed on a DC 17 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Lightning Breath",
        "description": "The dragon exhales lightning in a 90-foot line that is 5 ft. wide. Each creature in that line must make a DC 19 Dexterity saving throw, taking 66 (12d10) lightning damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 20 Dexterity saving throw or take 14 (2d6 + 7) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 22",
    "source_desc": "",
    "image": "/api/images/monsters/adult-blue-dragon.png"
  },
  {
    "id": "adult-brass-dragon",
    "name": "Adult Brass Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 172,
    "hit_dice": "15d12",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 40 ft. | Burrow 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 23,
      "dex": 10,
      "con": 21,
      "int": 14,
      "wis": 13,
      "cha": 17
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours ."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in an 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 45 (13d6) fire damage on a failed save, or half as much damage on a successful one. Sleep Breath. The dragon exhales sleep gas in a 60-foot cone. Each creature in that area must succeed on a DC 18 Constitution saving throw or fall unconscious for 10 minutes. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 21",
    "source_desc": "",
    "image": "/api/images/monsters/adult-brass-dragon.png"
  },
  {
    "id": "adult-bronze-dragon",
    "name": "Adult Bronze Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 212,
    "hit_dice": "17d12",
    "challenge_rating": "15",
    "challenge_rating_value": 15,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 25,
      "dex": 10,
      "con": 23,
      "int": 16,
      "wis": 15,
      "cha": 19
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +12 to hit, reach 10 ft., one target. Hit: 18 (2d10 + 7) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +12 to hit, reach 5 ft., one target. Hit: 14 (2d6 + 7) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +12 to hit, reach 15 ft., one target. Hit: 16 (2d8 + 7) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 17 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Lightning Breath. The dragon exhales lightning in a 90-foot line that is 5 feet wide. Each creature in that line must make a DC 19 Dexterity saving throw, taking 66 (12d10) lightning damage on a failed save, or half as much damage on a successful one. Repulsion Breath. The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 19 Strength saving throw. On a failed save, the creature is pushed 60 feet away from the dragon."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 20 Dexterity saving throw or take 14 (2d6 + 7) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 22",
    "source_desc": "",
    "image": "/api/images/monsters/adult-bronze-dragon.png"
  },
  {
    "id": "adult-copper-dragon",
    "name": "Adult Copper Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 184,
    "hit_dice": "16d12",
    "challenge_rating": "14",
    "challenge_rating_value": 14,
    "speed": "Walk 40 ft. | Climb 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 23,
      "dex": 12,
      "con": 21,
      "int": 18,
      "wis": 15,
      "cha": 17
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Acid Breath. The dragon exhales acid in an 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) acid damage on a failed save, or half as much damage on a successful one. Slowing Breath. The dragon exhales gas in a 60-foot cone. Each creature in that area must succeed on a DC 18 Constitution saving throw. On a failed save, the creature can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the creature can use either an action or a bonus action on its turn, but not both. These effects last for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself with a successful save."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 22",
    "source_desc": "",
    "image": "/api/images/monsters/adult-copper-dragon.png"
  },
  {
    "id": "adult-gold-dragon",
    "name": "Adult Gold Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 256,
    "hit_dice": "19d12",
    "challenge_rating": "17",
    "challenge_rating_value": 17,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 27,
      "dex": 14,
      "con": 25,
      "int": 16,
      "wis": 15,
      "cha": 24
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 21 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 66 (12d10) fire damage on a failed save, or half as much damage on a successful one. Weakening Breath. The dragon exhales gas in a 60-foot cone. Each creature in that area must succeed on a DC 21 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 24",
    "source_desc": "",
    "image": "/api/images/monsters/adult-gold-dragon.png"
  },
  {
    "id": "adult-green-dragon",
    "name": "Adult Green Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 207,
    "hit_dice": "18d12",
    "challenge_rating": "15",
    "challenge_rating_value": 15,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 23,
      "dex": 12,
      "con": 21,
      "int": 18,
      "wis": 15,
      "cha": 17
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 7 (2d6) poison damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours ."
      },
      {
        "name": "Poison Breath",
        "description": "The dragon exhales poisonous gas in a 60-foot cone. Each creature in that area must make a DC 18 Constitution saving throw, taking 56 (16d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 22",
    "source_desc": "",
    "image": "/api/images/monsters/adult-green-dragon.png"
  },
  {
    "id": "adult-red-dragon",
    "name": "Adult Red Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 256,
    "hit_dice": "19d12",
    "challenge_rating": "17",
    "challenge_rating_value": 17,
    "speed": "Walk 40 ft. | Climb 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 27,
      "dex": 10,
      "con": 25,
      "int": 16,
      "wis": 13,
      "cha": 21
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a cataclysmic threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 ft. of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Fire Breath",
        "description": "The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 23",
    "source_desc": "",
    "image": "/api/images/monsters/adult-red-dragon.png"
  },
  {
    "id": "adult-silver-dragon",
    "name": "Adult Silver Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 243,
    "hit_dice": "18d12",
    "challenge_rating": "16",
    "challenge_rating_value": 16,
    "speed": "Walk 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 27,
      "dex": 10,
      "con": 25,
      "int": 16,
      "wis": 13,
      "cha": 21
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +13 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 18 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Cold Breath. The dragon exhales an icy blast in a 60-foot cone. Each creature in that area must make a DC 20 Constitution saving throw, taking 58 (13d8) cold damage on a failed save, or half as much damage on a successful one. Paralyzing Breath. The dragon exhales paralyzing gas in a 60-foot cone. Each creature in that area must succeed on a DC 20 Constitution saving throw or be paralyzed for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Mountain",
      "Wilderness",
      "Arctic"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 21",
    "source_desc": "",
    "image": "/api/images/monsters/adult-silver-dragon.png"
  },
  {
    "id": "adult-white-dragon",
    "name": "Adult White Dragon",
    "size": "Huge",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 200,
    "hit_dice": "16d12",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 40 ft. | Burrow 30 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 22,
      "dex": 10,
      "con": 22,
      "int": 8,
      "wis": 12,
      "cha": 12
    },
    "summary": "A brutal huge scaled tyrant. Codex scouts flag it as a deadly threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 4 (1d8) cold damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 ft. of the dragon and aware of it must succeed on a DC 14 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Cold Breath",
        "description": "The dragon exhales an icy blast in a 60-foot cone. Each creature in that area must make a DC 19 Constitution saving throw, taking 54 (12d8) cold damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Ice Walk",
        "description": "The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, difficult terrain composed of ice or snow doesn't cost it extra moment."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Badlands"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 21",
    "source_desc": "",
    "image": "/api/images/monsters/adult-white-dragon.png"
  },
  {
    "id": "air-elemental",
    "name": "Air Elemental",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 15,
    "armor_class_text": "15",
    "hit_points": 90,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Fly 90 ft. | Hover true",
    "stats": {
      "str": 14,
      "dex": 20,
      "con": 14,
      "int": 6,
      "wis": 10,
      "cha": 6
    },
    "summary": "A nimble large living force of nature. Codex scouts flag it as a dangerous threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The elemental makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage."
      },
      {
        "name": "Whirlwind",
        "description": "Each creature in the elemental's space must make a DC 13 Strength saving throw. On a failure, a target takes 15 (3d8 + 2) bludgeoning damage and is flung up 20 feet away from the elemental in a random direction and knocked prone. If a thrown target strikes an object, such as a wall or floor, the target takes 3 (1d6) bludgeoning damage for every 10 feet it was thrown. If the target is thrown at another creature, that creature must succeed on a DC 13 Dexterity saving throw or take the same damage and be knocked prone. If the saving throw is successful, the target takes half the bludgeoning damage and isn't flung away or knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Air Form",
        "description": "The elemental can enter a hostile creature's space and stop there. It can move through a space as narrow as 1 inch wide without squeezing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift"
    ],
    "languages": "Auran",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/air-elemental.png"
  },
  {
    "id": "ancient-black-dragon",
    "name": "Ancient Black Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 22,
    "armor_class_text": "22 (Natural)",
    "hit_points": 367,
    "hit_dice": "21d20",
    "challenge_rating": "21",
    "challenge_rating_value": 21,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 27,
      "dex": 14,
      "con": 25,
      "int": 16,
      "wis": 15,
      "cha": 19
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack:+ 15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 9 (2d8) acid damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +15 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Acid Breath",
        "description": "The dragon exhales acid in a 90-foot line that is 10 feet wide. Each creature in that line must make a DC 22 Dexterity saving throw, taking 67 (15d8) acid damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 26",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-black-dragon.png"
  },
  {
    "id": "ancient-blue-dragon",
    "name": "Ancient Blue Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 22,
    "armor_class_text": "22 (Natural)",
    "hit_points": 481,
    "hit_dice": "26d20",
    "challenge_rating": "23",
    "challenge_rating_value": 23,
    "speed": "Walk 40 ft. | Burrow 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 29,
      "dex": 10,
      "con": 27,
      "int": 18,
      "wis": 17,
      "cha": 21
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +16 to hit, reach 15 ft., one target. Hit: 20 (2d10 + 9) piercing damage plus 11 (2d10) lightning damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +16 to hit, reach 10 ft., one target. Hit: 16 (2d6 + 9) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +16 to hit, reach 20 ft., one target. Hit: 18 (2d8 + 9) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 20 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Lightning Breath",
        "description": "The dragon exhales lightning in a 120-foot line that is 10 feet wide. Each creature in that line must make a DC 23 Dexterity saving throw, taking 88 (16d10) lightning damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 24 Dexterity saving throw or take 16 (2d6 + 9) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 27",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-blue-dragon.png"
  },
  {
    "id": "ancient-brass-dragon",
    "name": "Ancient Brass Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 20,
    "armor_class_text": "20 (Natural)",
    "hit_points": 297,
    "hit_dice": "17d20",
    "challenge_rating": "20",
    "challenge_rating_value": 20,
    "speed": "Walk 40 ft. | Burrow 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 27,
      "dex": 10,
      "con": 25,
      "int": 16,
      "wis": 15,
      "cha": 19
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +14 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 18 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons: Fire Breath. The dragon exhales fire in an 90-foot line that is 10 feet wide. Each creature in that line must make a DC 21 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one. Sleep Breath. The dragon exhales sleep gas in a 90-foot cone. Each creature in that area must succeed on a DC 21 Constitution saving throw or fall unconscious for 10 minutes. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."
      },
      {
        "name": "Change Shape",
        "description": "The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the dragon's choice). In a new form, the dragon retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 24",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-brass-dragon.png"
  },
  {
    "id": "ancient-bronze-dragon",
    "name": "Ancient Bronze Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 22,
    "armor_class_text": "22 (Natural)",
    "hit_points": 444,
    "hit_dice": "24d20",
    "challenge_rating": "22",
    "challenge_rating_value": 22,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 29,
      "dex": 10,
      "con": 27,
      "int": 18,
      "wis": 17,
      "cha": 21
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +16 to hit, reach 15 ft., one target. Hit: 20 (2d10 + 9) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +16 to hit, reach 10 ft., one target. Hit: 16 (2d6 + 9) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +16 to hit, reach 20 ft., one target. Hit: 18 (2d8 + 9) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 20 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Lightning Breath. The dragon exhales lightning in a 120-foot line that is 10 feet wide. Each creature in that line must make a DC 23 Dexterity saving throw, taking 88 (16d10) lightning damage on a failed save, or half as much damage on a successful one. Repulsion Breath. The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 23 Strength saving throw. On a failed save, the creature is pushed 60 feet away from the dragon."
      },
      {
        "name": "Change Shape",
        "description": "The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the dragon's choice). In a new form, the dragon retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 24 Dexterity saving throw or take 16 (2d6 + 9) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 27",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-bronze-dragon.png"
  },
  {
    "id": "ancient-copper-dragon",
    "name": "Ancient Copper Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 21,
    "armor_class_text": "21 (Natural)",
    "hit_points": 350,
    "hit_dice": "20d20",
    "challenge_rating": "21",
    "challenge_rating_value": 21,
    "speed": "Walk 40 ft. | Climb 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 27,
      "dex": 12,
      "con": 25,
      "int": 20,
      "wis": 17,
      "cha": 19
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +15 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Acid Breath. The dragon exhales acid in an 90-foot line that is 10 feet wide. Each creature in that line must make a DC 22 Dexterity saving throw, taking 63 (14d8) acid damage on a failed save, or half as much damage on a successful one. Slowing Breath. The dragon exhales gas in a 90-foot cone. Each creature in that area must succeed on a DC 22 Constitution saving throw. On a failed save, the creature can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the creature can use either an action or a bonus action on its turn, but not both. These effects last for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself with a successful save."
      },
      {
        "name": "Change Shape",
        "description": "The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the dragon's choice). In a new form, the dragon retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 27",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-copper-dragon.png"
  },
  {
    "id": "ancient-gold-dragon",
    "name": "Ancient Gold Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 22,
    "armor_class_text": "22 (Natural)",
    "hit_points": 546,
    "hit_dice": "28d20",
    "challenge_rating": "24",
    "challenge_rating_value": 24,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 30,
      "dex": 14,
      "con": 29,
      "int": 18,
      "wis": 17,
      "cha": 28
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 24 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 71 (13d10) fire damage on a failed save, or half as much damage on a successful one. Weakening Breath. The dragon exhales gas in a 90-foot cone. Each creature in that area must succeed on a DC 24 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Change Shape",
        "description": "The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the dragon's choice). In a new form, the dragon retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 27",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-gold-dragon.png"
  },
  {
    "id": "ancient-green-dragon",
    "name": "Ancient Green Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 21,
    "armor_class_text": "21 (Natural)",
    "hit_points": 385,
    "hit_dice": "22d20",
    "challenge_rating": "22",
    "challenge_rating_value": 22,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 27,
      "dex": 12,
      "con": 25,
      "int": 20,
      "wis": 17,
      "cha": 19
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 10 (3d6) poison damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 22 (4d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +15 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Poison Breath",
        "description": "The dragon exhales poisonous gas in a 90-foot cone. Each creature in that area must make a DC 22 Constitution saving throw, taking 77 (22d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 27",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-green-dragon.png"
  },
  {
    "id": "ancient-red-dragon",
    "name": "Ancient Red Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 22,
    "armor_class_text": "22 (Natural)",
    "hit_points": 546,
    "hit_dice": "28d20",
    "challenge_rating": "24",
    "challenge_rating_value": 24,
    "speed": "Walk 40 ft. | Climb 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 30,
      "dex": 10,
      "con": 29,
      "int": 18,
      "wis": 15,
      "cha": 23
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 21 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Fire Breath",
        "description": "The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 91 (26d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 26",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-red-dragon.png"
  },
  {
    "id": "ancient-silver-dragon",
    "name": "Ancient Silver Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 22,
    "armor_class_text": "22 (Natural)",
    "hit_points": 487,
    "hit_dice": "25d20",
    "challenge_rating": "23",
    "challenge_rating_value": 23,
    "speed": "Walk 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 30,
      "dex": 10,
      "con": 29,
      "int": 18,
      "wis": 15,
      "cha": 23
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 21 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Cold Breath. The dragon exhales an icy blast in a 90-foot cone. Each creature in that area must make a DC 24 Constitution saving throw, taking 67 (15d8) cold damage on a failed save, or half as much damage on a successful one. Paralyzing Breath. The dragon exhales paralyzing gas in a 90- foot cone. Each creature in that area must succeed on a DC 24 Constitution saving throw or be paralyzed for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Change Shape",
        "description": "The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the dragon's choice). In a new form, the dragon retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Cliffs",
      "Mountain",
      "Wilderness",
      "Forest"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 26",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-silver-dragon.png"
  },
  {
    "id": "ancient-white-dragon",
    "name": "Ancient White Dragon",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 20,
    "armor_class_text": "20 (Natural)",
    "hit_points": 333,
    "hit_dice": "18d20",
    "challenge_rating": "20",
    "challenge_rating_value": 20,
    "speed": "Walk 40 ft. | Burrow 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 26,
      "dex": 10,
      "con": 26,
      "int": 10,
      "wis": 13,
      "cha": 14
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 9 (2d8) cold damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +14 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours ."
      },
      {
        "name": "Cold Breath",
        "description": "The dragon exhales an icy blast in a 90-foot cone. Each creature in that area must make a DC 22 Constitution saving throw, taking 72 (l6d8) cold damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Ice Walk",
        "description": "The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, difficult terrain composed of ice or snow doesn't cost it extra moment."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Detect",
        "description": "The dragon makes a Wisdom (Perception) check."
      },
      {
        "name": "Tail Attack",
        "description": "The dragon makes a tail attack."
      },
      {
        "name": "Wing Attack (Costs 2 Actions)",
        "description": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Badlands"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 23",
    "source_desc": "",
    "image": "/api/images/monsters/ancient-white-dragon.png"
  },
  {
    "id": "androsphinx",
    "name": "Androsphinx",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Lawful Neutral",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 199,
    "hit_dice": "19d10",
    "challenge_rating": "17",
    "challenge_rating_value": 17,
    "speed": "Walk 40 ft. | Fly 60 ft.",
    "stats": {
      "str": 22,
      "dex": 10,
      "con": 20,
      "int": 16,
      "wis": 18,
      "cha": 23
    },
    "summary": "A commanding large unnatural apex hunter. Codex scouts flag it as a cataclysmic threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The sphinx makes two claw attacks."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +12 to hit, reach 5 ft., one target. Hit: 17 (2d10 + 6) slashing damage."
      },
      {
        "name": "Roar",
        "description": "The sphinx emits a magical roar. Each time it roars before finishing a long rest, the roar is louder and the effect is different, as detailed below. Each creature within 500 feet of the sphinx and able to hear the roar must make a saving throw. First Roar. Each creature that fails a DC 18 Wisdom saving throw is frightened for 1 minute. A frightened creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. Second Roar. Each creature that fails a DC 18 Wisdom saving throw is deafened and frightened for 1 minute. A frightened creature is paralyzed and can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. Third Roar. Each creature makes a DC 18 Constitution saving throw. On a failed save, a creature takes 44 (8d10) thunder damage and is knocked prone. On a successful save, the creature takes half as much damage and isn't knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Inscrutable",
        "description": "The sphinx is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the sphinx's intentions or sincerity have disadvantage."
      },
      {
        "name": "Magic Weapons",
        "description": "The sphinx's weapon attacks are magical."
      },
      {
        "name": "Spellcasting",
        "description": "The sphinx is a 12th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 18, +10 to hit with spell attacks). It requires no material components to cast its spells. The sphinx has the following cleric spells prepared: - Cantrips (at will): sacred flame, spare the dying, thaumaturgy - 1st level (4 slots): command, detect evil and good, detect magic - 2nd level (3 slots): lesser restoration, zone of truth - 3rd level (3 slots): dispel magic, tongues - 4th level (3 slots): banishment, freedom of movement - 5th level (2 slots): flame strike, greater restoration - 6th level (1 slot): heroes' feast"
      }
    ],
    "legendary_actions": [
      {
        "name": "Claw Attack",
        "description": "The sphinx makes one claw attack."
      },
      {
        "name": "Teleport (Costs 2 Actions)",
        "description": "The sphinx magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see."
      },
      {
        "name": "Cast a Spell (Costs 3 Actions)",
        "description": "The sphinx casts a spell from its list of prepared spells, using a spell slot as normal."
      }
    ],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "Common, Sphinx",
    "senses": "Truesight 120 ft. | Passive Perception 20",
    "source_desc": "",
    "image": "/api/images/monsters/androsphinx.png"
  },
  {
    "id": "animated-armor",
    "name": "Animated Armor",
    "size": "Medium",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 33,
    "hit_dice": "6d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 25 ft.",
    "stats": {
      "str": 14,
      "dex": 11,
      "con": 13,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "summary": "A brutal medium forged sentinel. Codex scouts flag it as a field threat around ruins and vault.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The armor makes two melee attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Antimagic Susceptibility",
        "description": "The armor is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the armor must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute."
      },
      {
        "name": "False Appearance",
        "description": "While the armor remains motionless, it is indistinguishable from a normal suit of armor."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 6",
    "source_desc": "",
    "image": "/api/images/monsters/animated-armor.png"
  },
  {
    "id": "ankheg",
    "name": "Ankheg",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural) / 11 ([object Object])",
    "hit_points": 39,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Burrow 10 ft.",
    "stats": {
      "str": 17,
      "dex": 11,
      "con": 13,
      "int": 1,
      "wis": 13,
      "cha": 6
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around badlands and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage plus 3 (1d6) acid damage. If the target is a Large or smaller creature, it is grappled (escape DC 13). Until this grapple ends, the ankheg can bite only the grappled creature and has advantage on attack rolls to do so."
      },
      {
        "name": "Acid Spray",
        "description": "The ankheg spits acid in a line that is 30 ft. long and 5 ft. wide, provided that it has no creature grappled. Each creature in that line must make a DC 13 Dexterity saving throw, taking 10 (3d6) acid damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Tremorsense 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/ankheg.png"
  },
  {
    "id": "ape",
    "name": "Ape",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 19,
    "hit_dice": "3d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 16,
      "dex": 14,
      "con": 14,
      "int": 6,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The ape makes two fist attacks."
      },
      {
        "name": "Fist",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +5 to hit, range 25/50 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Grassland",
      "Cliffs"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/ape.png"
  },
  {
    "id": "archmage",
    "name": "Archmage",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 12,
    "armor_class_text": "12 / 15 (Spell)",
    "hit_points": 99,
    "hit_dice": "18d8",
    "challenge_rating": "12",
    "challenge_rating_value": 12,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 14,
      "con": 12,
      "int": 20,
      "wis": 15,
      "cha": 16
    },
    "summary": "A scheming medium armed opportunist with any race traits. Codex scouts flag it as a deadly threat around frontier and cavern.",
    "actions": [
      {
        "name": "Dagger",
        "description": "Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The archmage has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Spellcasting",
        "description": "The archmage is an 18th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 17, +9 to hit with spell attacks). The archmage can cast disguise self and invisibility at will and has the following wizard spells prepared: - Cantrips (at will): fire bolt, light, mage hand, prestidigitation, shocking grasp - 1st level (4 slots): detect magic, identify, mage armor*, magic missile - 2nd level (3 slots): detect thoughts, mirror image, misty step - 3rd level (3 slots): counterspell, fly, lightning bolt - 4th level (3 slots): banishment, fire shield, stoneskin* - 5th level (3 slots): cone of cold, scrying, wall of force - 6th level (1 slot): globe of invulnerability - 7th level (1 slot): teleport - 8th level (1 slot): mind blank* - 9th level (1 slot): time stop * The archmage casts these spells on itself before combat."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern",
      "Urban",
      "Stronghold"
    ],
    "languages": "any six languages",
    "senses": "Passive Perception 12",
    "source_desc": "Archmages are powerful (and usually quite old) spellcasters dedicated to the study of the arcane arts. Benevolent ones counsel kings and queens, while evil ones rule as tyrants and pursue lichdom. Those who are neither good nor evil sequester themselves in remote towers to practice their magic without interruption. An archmage typically has one or more apprentice mages, and an archmage’s abode has numerous magical wards and guardians to discourage interlopers.",
    "image": "/api/images/monsters/archmage.png"
  },
  {
    "id": "assassin",
    "name": "Assassin",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Non-Good Alignment",
    "armor_class": 15,
    "armor_class_text": "15 (Studded Leather Armor)",
    "hit_points": 78,
    "hit_dice": "12d8",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 16,
      "con": 14,
      "int": 13,
      "wis": 11,
      "cha": 10
    },
    "summary": "A nimble medium armed opportunist with any race traits. Codex scouts flag it as a dangerous threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The assassin makes two shortsword attacks."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage, and the target must make a DC 15 Constitution saving throw, taking 24 (7d6) poison damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "Light Crossbow",
        "description": "Ranged Weapon Attack: +6 to hit, range 80/320 ft., one target. Hit: 7 (1d8 + 3) piercing damage, and the target must make a DC 15 Constitution saving throw, taking 24 (7d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Assassinate",
        "description": "During its first turn, the assassin has advantage on attack rolls against any creature that hasn't taken a turn. Any hit the assassin scores against a surprised creature is a critical hit."
      },
      {
        "name": "Evasion",
        "description": "If the assassin is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, the assassin instead takes no damage if it succeeds on the saving throw, and only half damage if it fails."
      },
      {
        "name": "Sneak Attack (1/Turn)",
        "description": "The assassin deals an extra 13 (4d6) damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 ft. of an ally of the assassin that isn't incapacitated and the assassin doesn't have disadvantage on the attack roll."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold"
    ],
    "languages": "Thieves' cant plus any two languages",
    "senses": "Passive Perception 13",
    "source_desc": "Trained in the use of poison, assassins are remorseless killers who work for nobles, guildmasters, sovereigns, and anyone else who can afford them.",
    "image": "/api/images/monsters/assassin.png"
  },
  {
    "id": "awakened-shrub",
    "name": "Awakened Shrub",
    "size": "Small",
    "type": "Plant",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 9,
    "armor_class_text": "9",
    "hit_points": 10,
    "hit_dice": "3d6",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 3,
      "dex": 8,
      "con": 11,
      "int": 10,
      "wis": 10,
      "cha": 6
    },
    "summary": "A stubborn small rooted ambusher. Codex scouts flag it as a minor threat around forest and swamp.",
    "actions": [
      {
        "name": "Rake",
        "description": "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 1 (1d4 - 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the shrub remains motionless, it is indistinguishable from a normal shrub."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Swamp"
    ],
    "languages": "one language known by its creator",
    "senses": "Passive Perception 10",
    "source_desc": "An awakened shrub is an ordinary shrub given sentience and mobility by the awaken spell or similar magic.",
    "image": "/api/images/monsters/awakened-shrub.png"
  },
  {
    "id": "awakened-tree",
    "name": "Awakened Tree",
    "size": "Huge",
    "type": "Plant",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 59,
    "hit_dice": "7d12",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 19,
      "dex": 6,
      "con": 15,
      "int": 10,
      "wis": 10,
      "cha": 7
    },
    "summary": "A brutal huge rooted ambusher. Codex scouts flag it as a seasoned threat around forest and swamp.",
    "actions": [
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 14 (3d6 + 4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the tree remains motionless, it is indistinguishable from a normal tree."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Swamp"
    ],
    "languages": "one language known by its creator",
    "senses": "Passive Perception 10",
    "source_desc": "An awakened tree is an ordinary tree given sentience and mobility by the awaken spell or similar magic.",
    "image": "/api/images/monsters/awakened-tree.png"
  },
  {
    "id": "axe-beak",
    "name": "Axe Beak",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 14,
      "dex": 12,
      "con": 12,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) slashing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "An axe beak is a tall flightless bird with strong legs and a heavy, wedge-shaped beak. It has a nasty disposition and tends to attack any unfamiliar creature that wanders too close.",
    "image": "/api/images/monsters/axe-beak.png"
  },
  {
    "id": "azer",
    "name": "Azer",
    "size": "Medium",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Lawful Neutral",
    "armor_class": 15,
    "armor_class_text": "15 (Natural) / 17 (Shield)",
    "hit_points": 39,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 17,
      "dex": 12,
      "con": 15,
      "int": 12,
      "wis": 13,
      "cha": 10
    },
    "summary": "A brutal medium living force of nature. Codex scouts flag it as a seasoned threat around elemental rift and volcanic.",
    "actions": [
      {
        "name": "Warhammer",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage, or 8 (1d10 + 3) bludgeoning damage if used with two hands to make a melee attack, plus 3 (1d6) fire damage."
      }
    ],
    "traits": [
      {
        "name": "Heated Body",
        "description": "A creature that touches the azer or hits it with a melee attack while within 5 ft. of it takes 5 (1d10) fire damage."
      },
      {
        "name": "Heated Weapons",
        "description": "When the azer hits with a metal melee weapon, it deals an extra 3 (1d6) fire damage (included in the attack)."
      },
      {
        "name": "Illumination",
        "description": "The azer sheds bright light in a 10-foot radius and dim light for an additional 10 ft.."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Elemental Rift",
      "Volcanic"
    ],
    "languages": "Ignan",
    "senses": "Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/azer.png"
  },
  {
    "id": "baboon",
    "name": "Baboon",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 3,
    "hit_dice": "1d6",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 8,
      "dex": 14,
      "con": 11,
      "int": 4,
      "wis": 12,
      "cha": 6
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 1 (1d4 - 1) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The baboon has advantage on an attack roll against a creature if at least one of the baboon's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/baboon.png"
  },
  {
    "id": "badger",
    "name": "Badger",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 3,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft. | Burrow 5 ft.",
    "stats": {
      "str": 4,
      "dex": 11,
      "con": 12,
      "int": 2,
      "wis": 12,
      "cha": 5
    },
    "summary": "A stubborn tiny instinct-driven predator. Codex scouts flag it as a minor threat around badlands and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 1 piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The badger has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/badger.png"
  },
  {
    "id": "balor",
    "name": "Balor",
    "size": "Huge",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 262,
    "hit_dice": "21d12",
    "challenge_rating": "19",
    "challenge_rating_value": 19,
    "speed": "Walk 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 26,
      "dex": 15,
      "con": 22,
      "int": 20,
      "wis": 16,
      "cha": 22
    },
    "summary": "A brutal huge malicious planar raider with demon traits. Codex scouts flag it as a cataclysmic threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The balor makes two attacks: one with its longsword and one with its whip."
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 21 (3d8 + 8) slashing damage plus 13 (3d8) lightning damage. If the balor scores a critical hit, it rolls damage dice three times, instead of twice."
      },
      {
        "name": "Whip",
        "description": "Melee Weapon Attack: +14 to hit, reach 30 ft., one target. Hit: 15 (2d6 + 8) slashing damage plus 10 (3d6) fire damage, and the target must succeed on a DC 20 Strength saving throw or be pulled up to 25 feet toward the balor."
      },
      {
        "name": "Teleport",
        "description": "The balor magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see."
      }
    ],
    "traits": [
      {
        "name": "Death Throes",
        "description": "When the balor dies, it explodes, and each creature within 30 feet of it must make a DC 20 Dexterity saving throw, taking 70 (20d6) fire damage on a failed save, or half as much damage on a successful one. The explosion ignites flammable objects in that area that aren't being worn or carried, and it destroys the balor's weapons."
      },
      {
        "name": "Fire Aura",
        "description": "At the start of each of the balor's turns, each creature within 5 feet of it takes 10 (3d6) fire damage, and flammable objects in the aura that aren't being worn or carried ignite. A creature that touches the balor or hits it with a melee attack while within 5 feet of it takes 10 (3d6) fire damage."
      },
      {
        "name": "Magic Resistance",
        "description": "The balor has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The balor's weapon attacks are magical."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Arctic"
    ],
    "languages": "Abyssal, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/balor.png"
  },
  {
    "id": "bandit",
    "name": "Bandit",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Non-Lawful Alignment",
    "armor_class": 12,
    "armor_class_text": "12 (Leather Armor)",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 12,
      "con": 12,
      "int": 10,
      "wis": 10,
      "cha": 10
    },
    "summary": "A nimble medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and urban.",
    "actions": [
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) slashing damage."
      },
      {
        "name": "Light Crossbow",
        "description": "Ranged Weapon Attack: +3 to hit, range 80 ft./320 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Forest"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 10",
    "source_desc": "**Bandits** rove in gangs and are sometimes led by thugs, veterans, or spellcasters. Not all bandits are evil. Oppression, drought, disease, or famine can often drive otherwise honest folk to a life of banditry. **Pirates** are bandits of the high seas. They might be freebooters interested only in treasure and murder, or they might be privateers sanctioned by the crown to attack and plunder an enemy nation’s vessels.",
    "image": "/api/images/monsters/bandit.png"
  },
  {
    "id": "bandit-captain",
    "name": "Bandit Captain",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Non-Lawful Alignment",
    "armor_class": 15,
    "armor_class_text": "15 (Studded Leather Armor)",
    "hit_points": 65,
    "hit_dice": "10d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 15,
      "dex": 16,
      "con": 14,
      "int": 14,
      "wis": 11,
      "cha": 14
    },
    "summary": "A nimble medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The captain makes three melee attacks: two with its scimitar and one with its dagger. Or the captain makes two ranged attacks with its daggers."
      },
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      },
      {
        "name": "Dagger",
        "description": "Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 5 (1d4 + 3) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Forest"
    ],
    "languages": "any two languages",
    "senses": "Passive Perception 10",
    "source_desc": "It takes a strong personality, ruthless cunning, and a silver tongue to keep a gang of bandits in line. The **bandit captain** has these qualities in spades. In addition to managing a crew of selfish malcontents, the **pirate captain** is a variation of the bandit captain, with a ship to protect and command. To keep the crew in line, the captain must mete out rewards and punishment on a regular basis. More than treasure, a bandit captain or pirate captain craves infamy. A prisoner who appeals to the captain’s vanity or ego is more likely to be treated fairly than a prisoner who does not or claims not to know anything of the captain’s colorful reputation.",
    "image": "/api/images/monsters/bandit-captain.png"
  },
  {
    "id": "barbed-devil",
    "name": "Barbed Devil",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 110,
    "hit_dice": "13d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 17,
      "con": 18,
      "int": 12,
      "wis": 14,
      "cha": 14
    },
    "summary": "A stubborn medium malicious planar raider with devil traits. Codex scouts flag it as a dangerous threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes three melee attacks: one with its tail and two with its claws. Alternatively, it can use Hurl Flame twice."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage."
      },
      {
        "name": "Hurl Flame",
        "description": "Ranged Spell Attack: +5 to hit, range 150 ft., one target. Hit: 10 (3d6) fire damage. If the target is a flammable object that isn't being worn or carried, it also catches fire."
      }
    ],
    "traits": [
      {
        "name": "Barbed Hide",
        "description": "At the start of each of its turns, the barbed devil deals 5 (1d10) piercing damage to any creature grappling it."
      },
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Arctic",
      "Volcanic"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 18",
    "source_desc": "",
    "image": "/api/images/monsters/barbed-devil.png"
  },
  {
    "id": "basilisk",
    "name": "Basilisk",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 52,
    "hit_dice": "8d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 16,
      "dex": 8,
      "con": 15,
      "int": 2,
      "wis": 8,
      "cha": 7
    },
    "summary": "A brutal medium unnatural apex hunter. Codex scouts flag it as a seasoned threat around wilderness and cavern.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage plus 7 (2d6) poison damage."
      }
    ],
    "traits": [
      {
        "name": "Petrifying Gaze",
        "description": "If a creature starts its turn within 30 ft. of the basilisk and the two of them can see each other, the basilisk can force the creature to make a DC 12 Constitution saving throw if the basilisk isn't incapacitated. On a failed save, the creature magically begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater restoration spell or other magic. A creature that isn't surprised can avert its eyes to avoid the saving throw at the start of its turn. If it does so, it can't see the basilisk until the start of its next turn, when it can avert its eyes again. If it looks at the basilisk in the meantime, it must immediately make the save. If the basilisk sees its reflection within 30 ft. of it in bright light, it mistakes itself for a rival and targets itself with its gaze."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Cavern",
      "Frontier",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/basilisk.png"
  },
  {
    "id": "bat",
    "name": "Bat",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 5 ft. | Fly 30 ft.",
    "stats": {
      "str": 2,
      "dex": 15,
      "con": 8,
      "int": 2,
      "wis": 12,
      "cha": 4
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +0 to hit, reach 5 ft., one creature. Hit: 1 piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Echolocation",
        "description": "The bat can't use its blindsight while deafened."
      },
      {
        "name": "Keen Hearing",
        "description": "The bat has advantage on Wisdom (Perception) checks that rely on hearing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/bat.png"
  },
  {
    "id": "bearded-devil",
    "name": "Bearded Devil",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 52,
    "hit_dice": "8d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 15,
      "con": 15,
      "int": 9,
      "wis": 11,
      "cha": 11
    },
    "summary": "A brutal medium malicious planar raider with devil traits. Codex scouts flag it as a seasoned threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes two attacks: one with its beard and one with its glaive."
      },
      {
        "name": "Beard",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 6 (1d8 + 2) piercing damage, and the target must succeed on a DC 12 Constitution saving throw or be poisoned for 1 minute. While poisoned in this way, the target can't regain hit points. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Glaive",
        "description": "Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 8 (1d10 + 3) slashing damage. If the target is a creature other than an undead or a construct, it must succeed on a DC 12 Constitution saving throw or lose 5 (1d10) hit points at the start of each of its turns due to an infernal wound. Each time the devil hits the wounded target with this attack, the damage dealt by the wound increases by 5 (1d10). Any creature can take an action to stanch the wound with a successful DC 12 Wisdom (Medicine) check. The wound also closes if the target receives magical healing."
      }
    ],
    "traits": [
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The devil has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Steadfast",
        "description": "The devil can't be frightened while it can see an allied creature within 30 feet of it."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/bearded-devil.png"
  },
  {
    "id": "behir",
    "name": "Behir",
    "size": "Huge",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 168,
    "hit_dice": "16d12",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 50 ft. | Climb 40 ft.",
    "stats": {
      "str": 23,
      "dex": 16,
      "con": 18,
      "int": 7,
      "wis": 14,
      "cha": 12
    },
    "summary": "A brutal huge unnatural apex hunter. Codex scouts flag it as a deadly threat around ruins and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The behir makes two attacks: one with its bite and one to constrict."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 22 (3d10 + 6) piercing damage."
      },
      {
        "name": "Constrict",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one Large or smaller creature. Hit: 17 (2d10 + 6) bludgeoning damage plus 17 (2d10 + 6) slashing damage. The target is grappled (escape DC 16) if the behir isn't already constricting a creature, and the target is restrained until this grapple ends."
      },
      {
        "name": "Lightning Breath",
        "description": "The behir exhales a line of lightning that is 20 ft. long and 5 ft. wide. Each creature in that line must make a DC 16 Dexterity saving throw, taking 66 (12d10) lightning damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "Swallow",
        "description": "The behir makes one bite attack against a Medium or smaller target it is grappling. If the attack hits, the target is also swallowed, and the grapple ends. While swallowed, the target is blinded and restrained, it has total cover against attacks and other effects outside the behir, and it takes 21 (6d6) acid damage at the start of each of the behir's turns. A behir can have only one creature swallowed at a time. If the behir takes 30 damage or more on a single turn from the swallowed creature, the behir must succeed on a DC 14 Constitution saving throw at the end of that turn or regurgitate the creature, which falls prone in a space within 10 ft. of the behir. If the behir dies, a swallowed creature is no longer restrained by it and can escape from the corpse by using 15 ft. of movement, exiting prone."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "Draconic",
    "senses": "Darkvision 90 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/behir.png"
  },
  {
    "id": "berserker",
    "name": "Berserker",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Chaotic Alignment",
    "armor_class": 13,
    "armor_class_text": "13 (Hide Armor)",
    "hit_points": 67,
    "hit_dice": "9d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 12,
      "con": 17,
      "int": 9,
      "wis": 11,
      "cha": 9
    },
    "summary": "A stubborn medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and wilderness.",
    "actions": [
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Reckless",
        "description": "At the start of its turn, the berserker can gain advantage on all melee weapon attack rolls during that turn, but attack rolls against it have advantage until the start of its next turn."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Wilderness"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/berserker.png"
  },
  {
    "id": "black-bear",
    "name": "Black Bear",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 19,
    "hit_dice": "3d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 40 ft. | Climb 30 ft.",
    "stats": {
      "str": 15,
      "dex": 10,
      "con": 14,
      "int": 2,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The bear makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The bear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/black-bear.png"
  },
  {
    "id": "black-dragon-wyrmling",
    "name": "Black Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 33,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Fly 60 ft. | Swim 30 ft.",
    "stats": {
      "str": 15,
      "dex": 14,
      "con": 13,
      "int": 10,
      "wis": 11,
      "cha": 13
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage plus 2 (1d4) acid damage."
      },
      {
        "name": "Acid Breath",
        "description": "The dragon exhales acid in a 15-foot line that is 5 feet wide. Each creature in that line must make a DC 11 Dexterity saving throw, taking 22 (5d8) acid damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/black-dragon-wyrmling.png"
  },
  {
    "id": "black-pudding",
    "name": "Black Pudding",
    "size": "Large",
    "type": "Ooze",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 7,
    "armor_class_text": "7",
    "hit_points": 85,
    "hit_dice": "10d10",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 20 ft. | Climb 20 ft.",
    "stats": {
      "str": 16,
      "dex": 5,
      "con": 16,
      "int": 1,
      "wis": 6,
      "cha": 1
    },
    "summary": "A brutal large dissolving lurker. Codex scouts flag it as a seasoned threat around ruins and sewer.",
    "actions": [
      {
        "name": "Pseudopod",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage plus 18 (4d8) acid damage. In addition, nonmagical armor worn by the target is partly dissolved and takes a permanent and cumulative -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10."
      }
    ],
    "traits": [
      {
        "name": "Amorphous",
        "description": "The pudding can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        "name": "Corrosive Form",
        "description": "A creature that touches the pudding or hits it with a melee attack while within 5 feet of it takes 4 (1d8) acid damage. Any nonmagical weapon made of metal or wood that hits the pudding corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical ammunition made of metal or wood that hits the pudding is destroyed after dealing damage. The pudding can eat through 2-inch-thick, nonmagical wood or metal in 1 round."
      },
      {
        "name": "Spider Climb",
        "description": "The pudding can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Sewer",
      "Dungeon",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/black-pudding.png"
  },
  {
    "id": "blink-dog",
    "name": "Blink Dog",
    "size": "Medium",
    "type": "Fey",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 22,
    "hit_dice": "4d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 12,
      "dex": 17,
      "con": 12,
      "int": 10,
      "wis": 13,
      "cha": 11
    },
    "summary": "A nimble medium wild trickster spirit. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage."
      },
      {
        "name": "Teleport",
        "description": "The dog magically teleports, along with any equipment it is wearing or carrying, up to 40 ft. to an unoccupied space it can see. Before or after teleporting, the dog can make one bite attack."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The dog has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "Blink Dog, understands Sylvan but can't speak it",
    "senses": "Passive Perception 10",
    "source_desc": "A blink dog takes its name from its ability to blink in and out of existence, a talent it uses to aid its attacks and to avoid harm.",
    "image": "/api/images/monsters/blink-dog.png"
  },
  {
    "id": "blood-hawk",
    "name": "Blood Hawk",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 7,
    "hit_dice": "2d6",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 10 ft. | Fly 60 ft.",
    "stats": {
      "str": 6,
      "dex": 14,
      "con": 10,
      "int": 3,
      "wis": 14,
      "cha": 5
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The hawk has advantage on Wisdom (Perception) checks that rely on sight."
      },
      {
        "name": "Pack Tactics",
        "description": "The hawk has advantage on an attack roll against a creature if at least one of the hawk's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "Taking its name from its crimson feathers and aggressive nature, the blood hawk fearlessly attacks almost any animal, stabbing it with its daggerlike beak. Blood hawks flock together in large numbers, attacking as a pack to take down prey.",
    "image": "/api/images/monsters/blood-hawk.png"
  },
  {
    "id": "blue-dragon-wyrmling",
    "name": "Blue Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 52,
    "hit_dice": "8d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft. | Burrow 15 ft. | Fly 60 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 15,
      "int": 12,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage plus 3 (1d6) lightning damage."
      },
      {
        "name": "Lightning Breath",
        "description": "The dragon exhales lightning in a 30-foot line that is 5 feet wide. Each creature in that line must make a DC 12 Dexterity saving throw, taking 22 (4d10) lightning damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/blue-dragon-wyrmling.png"
  },
  {
    "id": "boar",
    "name": "Boar",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 13,
      "dex": 11,
      "con": 12,
      "int": 2,
      "wis": 9,
      "cha": 5
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Tusk",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the boar moves at least 20 ft. straight toward a target and then hits it with a tusk attack on the same turn, the target takes an extra 3 (1d6) slashing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone."
      },
      {
        "name": "Relentless",
        "description": "If the boar takes 7 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/boar.png"
  },
  {
    "id": "bone-devil",
    "name": "Bone Devil",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 142,
    "hit_dice": "15d10",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 40 ft. | Fly 40 ft.",
    "stats": {
      "str": 18,
      "dex": 16,
      "con": 18,
      "int": 13,
      "wis": 14,
      "cha": 16
    },
    "summary": "A brutal large malicious planar raider with devil traits. Codex scouts flag it as a dangerous threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes three attacks: two with its claws and one with its sting."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 8 (1d8 + 4) slashing damage."
      },
      {
        "name": "Sting",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 13 (2d8 + 4) piercing damage plus 17 (5d6) poison damage, and the target must succeed on a DC 14 Constitution saving throw or become poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/bone-devil.png"
  },
  {
    "id": "brass-dragon-wyrmling",
    "name": "Brass Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 16,
    "hit_dice": "3d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft. | Burrow 15 ft. | Fly 60 ft.",
    "stats": {
      "str": 15,
      "dex": 10,
      "con": 13,
      "int": 10,
      "wis": 11,
      "cha": 13
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a field threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in an 20-foot line that is 5 feet wide. Each creature in that line must make a DC 11 Dexterity saving throw, taking 14 (4d6) fire damage on a failed save, or half as much damage on a successful one. Sleep Breath. The dragon exhales sleep gas in a 15-foot cone. Each creature in that area must succeed on a DC 11 Constitution saving throw or fall unconscious for 1 minute. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/brass-dragon-wyrmling.png"
  },
  {
    "id": "bronze-dragon-wyrmling",
    "name": "Bronze Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 32,
    "hit_dice": "5d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Fly 60 ft. | Swim 30 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 15,
      "int": 12,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Lightning Breath. The dragon exhales lightning in a 40-foot line that is 5 feet wide. Each creature in that line must make a DC 12 Dexterity saving throw, taking 16 (3d10) lightning damage on a failed save, or half as much damage on a successful one. Repulsion Breath. The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 12 Strength saving throw. On a failed save, the creature is pushed 30 feet away from the dragon."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/bronze-dragon-wyrmling.png"
  },
  {
    "id": "brown-bear",
    "name": "Brown Bear",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 34,
    "hit_dice": "4d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 40 ft. | Climb 30 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 16,
      "int": 2,
      "wis": 13,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The bear makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The bear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/brown-bear.png"
  },
  {
    "id": "bugbear",
    "name": "Bugbear",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Goblinoid",
    "alignment": "Chaotic Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Shield, Hide Armor)",
    "hit_points": 27,
    "hit_dice": "5d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 15,
      "dex": 14,
      "con": 13,
      "int": 8,
      "wis": 11,
      "cha": 9
    },
    "summary": "A brutal medium armed opportunist with goblinoid traits. Codex scouts flag it as a field threat around frontier and cavern.",
    "actions": [
      {
        "name": "Morningstar",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 11 (2d8 + 2) piercing damage."
      },
      {
        "name": "Javelin",
        "description": "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 9 (2d6 + 2) piercing damage in melee or 5 (1d6 + 2) piercing damage at range."
      }
    ],
    "traits": [
      {
        "name": "Brute",
        "description": "A melee weapon deals one extra die of its damage when the bugbear hits with it (included in the attack)."
      },
      {
        "name": "Surprise Attack",
        "description": "If the bugbear surprises a creature and hits it with an attack during the first round of combat, the target takes an extra 7 (2d6) damage from the attack."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern",
      "Forest",
      "Grassland"
    ],
    "languages": "Common, Goblin",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/bugbear.png"
  },
  {
    "id": "bulette",
    "name": "Bulette",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 94,
    "hit_dice": "9d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 40 ft. | Burrow 40 ft.",
    "stats": {
      "str": 19,
      "dex": 11,
      "con": 21,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A stubborn large unnatural apex hunter. Codex scouts flag it as a dangerous threat around badlands and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 30 (4d12 + 4) piercing damage."
      },
      {
        "name": "Deadly Leap",
        "description": "If the bulette jumps at least 15 ft. as part of its movement, it can then use this action to land on its feet in a space that contains one or more other creatures. Each of those creatures must succeed on a DC 16 Strength or Dexterity saving throw (target's choice) or be knocked prone and take 14 (3d6 + 4) bludgeoning damage plus 14 (3d6 + 4) slashing damage. On a successful save, the creature takes only half the damage, isn't knocked prone, and is pushed 5 ft. out of the bulette's space into an unoccupied space of the creature's choice. If no unoccupied space is within range, the creature instead falls prone in the bulette's space."
      }
    ],
    "traits": [
      {
        "name": "Standing Leap",
        "description": "The bulette's long jump is up to 30 ft. and its high jump is up to 15 ft., with or without a running start."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Wilderness",
      "Arctic",
      "Mountain"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Tremorsense 60 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/bulette.png"
  },
  {
    "id": "camel",
    "name": "Camel",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 9,
    "armor_class_text": "9",
    "hit_points": 15,
    "hit_dice": "2d10",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 16,
      "dex": 8,
      "con": 14,
      "int": 2,
      "wis": 8,
      "cha": 5
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around forest and desert.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Desert"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/camel.png"
  },
  {
    "id": "cat",
    "name": "Cat",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 2,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 40 ft. | Climb 30 ft.",
    "stats": {
      "str": 3,
      "dex": 15,
      "con": 10,
      "int": 3,
      "wis": 12,
      "cha": 7
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The cat has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/cat.png"
  },
  {
    "id": "centaur",
    "name": "Centaur",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Good",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 45,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 18,
      "dex": 14,
      "con": 14,
      "int": 9,
      "wis": 13,
      "cha": 11
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The centaur makes two attacks: one with its pike and one with its hooves or two with its longbow."
      },
      {
        "name": "Pike",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 9 (1d10 + 4) piercing damage."
      },
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 150/600 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the centaur moves at least 30 ft. straight toward a target and then hits it with a pike attack on the same turn, the target takes an extra 10 (3d6) piercing damage."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness"
    ],
    "languages": "Elvish, Sylvan",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/centaur.png"
  },
  {
    "id": "chain-devil",
    "name": "Chain Devil",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 85,
    "hit_dice": "10d8",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 18,
      "int": 11,
      "wis": 12,
      "cha": 14
    },
    "summary": "A brutal medium malicious planar raider with devil traits. Codex scouts flag it as a dangerous threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes two attacks with its chains."
      },
      {
        "name": "Chain",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) slashing damage. The target is grappled (escape DC 14) if the devil isn't already grappling a creature. Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns."
      },
      {
        "name": "Animate Chains",
        "description": "Up to four chains the devil can see within 60 feet of it magically sprout razor-edged barbs and animate under the devil's control, provided that the chains aren't being worn or carried. Each animated chain is an object with AC 20, 20 hit points, resistance to piercing damage, and immunity to psychic and thunder damage. When the devil uses Multiattack on its turn, it can use each animated chain to make one additional chain attack. An animated chain can grapple one creature of its own but can't make attacks while grappling. An animated chain reverts to its inanimate state if reduced to 0 hit points or if the devil is incapacitated or dies."
      }
    ],
    "traits": [
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/chain-devil.png"
  },
  {
    "id": "chimera",
    "name": "Chimera",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 114,
    "hit_dice": "12d10",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 19,
      "dex": 11,
      "con": 19,
      "int": 3,
      "wis": 14,
      "cha": 10
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a dangerous threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The chimera makes three attacks: one with its bite, one with its horns, and one with its claws. When its fire breath is available, it can use the breath in place of its bite or horns."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) piercing damage."
      },
      {
        "name": "Horns",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d12 + 4) bludgeoning damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        "name": "Fire Breath",
        "description": "The dragon head exhales fire in a 15-foot cone. Each creature in that area must make a DC 15 Dexterity saving throw, taking 31 (7d8) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Volcanic"
    ],
    "languages": "understands Draconic but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 18",
    "source_desc": "",
    "image": "/api/images/monsters/chimera.png"
  },
  {
    "id": "chuul",
    "name": "Chuul",
    "size": "Large",
    "type": "Aberration",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 93,
    "hit_dice": "11d10",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 16,
      "int": 5,
      "wis": 11,
      "cha": 5
    },
    "summary": "A brutal large reality-warping hunter. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The chuul makes two pincer attacks. If the chuul is grappling a creature, the chuul can also use its tentacles once."
      },
      {
        "name": "Pincer",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage. The target is grappled (escape DC 14) if it is a Large or smaller creature and the chuul doesn't have two other creatures grappled."
      },
      {
        "name": "Tentacles",
        "description": "One creature grappled by the chuul must succeed on a DC 13 Constitution saving throw or be poisoned for 1 minute. Until this poison ends, the target is paralyzed. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The chuul can breathe air and water."
      },
      {
        "name": "Sense Magic",
        "description": "The chuul senses magic within 120 feet of it at will. This trait otherwise works like the detect magic spell but isn't itself magical."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Underdark",
      "Forest"
    ],
    "languages": "understands Deep Speech but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/chuul.png"
  },
  {
    "id": "clay-golem",
    "name": "Clay Golem",
    "size": "Large",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 133,
    "hit_dice": "14d10",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 20,
      "dex": 9,
      "con": 18,
      "int": 3,
      "wis": 8,
      "cha": 1
    },
    "summary": "A brutal large forged sentinel. Codex scouts flag it as a dangerous threat around ruins and vault.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The golem makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 16 (2d10 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 15 Constitution saving throw or have its hit point maximum reduced by an amount equal to the damage taken. The target dies if this attack reduces its hit point maximum to 0. The reduction lasts until removed by the greater restoration spell or other magic."
      },
      {
        "name": "Haste",
        "description": "Until the end of its next turn, the golem magically gains a +2 bonus to its AC, has advantage on Dexterity saving throws, and can use its slam attack as a bonus action."
      }
    ],
    "traits": [
      {
        "name": "Acid Absorption",
        "description": "Whenever the golem is subjected to acid damage, it takes no damage and instead regains a number of hit points equal to the acid damage dealt."
      },
      {
        "name": "Berserk",
        "description": "Whenever the golem starts its turn with 60 hit points or fewer, roll a d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object, with preference for an object smaller than itself. Once the golem goes berserk, it continues to do so until it is destroyed or regains all its hit points."
      },
      {
        "name": "Immutable Form",
        "description": "The golem is immune to any spell or effect that would alter its form."
      },
      {
        "name": "Magic Resistance",
        "description": "The golem has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The golem's weapon attacks are magical."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault",
      "Forest",
      "Grassland"
    ],
    "languages": "understands the languages of its creator but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/clay-golem.png"
  },
  {
    "id": "cloaker",
    "name": "Cloaker",
    "size": "Large",
    "type": "Aberration",
    "subtype": "",
    "alignment": "Chaotic Neutral",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 78,
    "hit_dice": "12d10",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 10 ft. | Fly 40 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 12,
      "int": 13,
      "wis": 12,
      "cha": 14
    },
    "summary": "A brutal large reality-warping hunter. Codex scouts flag it as a dangerous threat around cliffs and underdark.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The cloaker makes two attacks: one with its bite and one with its tail."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 10 (2d6 + 3) piercing damage, and if the target is Large or smaller, the cloaker attaches to it. If the cloaker has advantage against the target, the cloaker attaches to the target's head, and the target is blinded and unable to breathe while the cloaker is attached. While attached, the cloaker can make this attack only against the target and has advantage on the attack roll. The cloaker can detach itself by spending 5 feet of its movement. A creature, including the target, can take its action to detach the cloaker by succeeding on a DC 16 Strength check."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one creature. Hit: 7 (1d8 + 3) slashing damage."
      },
      {
        "name": "Moan",
        "description": "Each creature within 60 feet of the cloaker that can hear its moan and that isn't an aberration must succeed on a DC 13 Wisdom saving throw or become frightened until the end of the cloaker's next turn. If a creature's saving throw is successful, the creature is immune to the cloaker's moan for the next 24 hours."
      },
      {
        "name": "Phantasms",
        "description": "The cloaker magically creates three illusory duplicates of itself if it isn't in bright light. The duplicates move with it and mimic its actions, shifting position so as to make it impossible to track which cloaker is the real one. If the cloaker is ever in an area of bright light, the duplicates disappear. Whenever any creature targets the cloaker with an attack or a harmful spell while a duplicate remains, that creature rolls randomly to determine whether it targets the cloaker or one of the duplicates. A creature is unaffected by this magical effect if it can't see or if it relies on senses other than sight. A duplicate has the cloaker's AC and uses its saving throws. If an attack hits a duplicate, or if a duplicate fails a saving throw against an effect that deals damage, the duplicate disappears."
      }
    ],
    "traits": [
      {
        "name": "Damage Transfer",
        "description": "While attached to a creature, the cloaker takes only half the damage dealt to it (rounded down). and that creature takes the other half."
      },
      {
        "name": "False Appearance",
        "description": "While the cloaker remains motionless without its underside exposed, it is indistinguishable from a dark leather cloak."
      },
      {
        "name": "Light Sensitivity",
        "description": "While in bright light, the cloaker has disadvantage on attack rolls and Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Underdark",
      "Forest",
      "Grassland"
    ],
    "languages": "Deep Speech, Undercommon",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/cloaker.png"
  },
  {
    "id": "cloud-giant",
    "name": "Cloud Giant",
    "size": "Huge",
    "type": "Giant",
    "subtype": "",
    "alignment": "Neutral Good (50%) Or Neutral Evil (50%)",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 200,
    "hit_dice": "16d12",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 27,
      "dex": 10,
      "con": 22,
      "int": 12,
      "wis": 16,
      "cha": 16
    },
    "summary": "A brutal huge towering marauder. Codex scouts flag it as a dangerous threat around mountain and cliffs.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The giant makes two morningstar attacks."
      },
      {
        "name": "Morningstar",
        "description": "Melee Weapon Attack: +12 to hit, reach 10 ft., one target. Hit: 21 (3d8 + 8) piercing damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +12 to hit, range 60/240 ft., one target. Hit: 30 (4d10 + 8) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The giant has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The giant's innate spellcasting ability is Charisma. It can innately cast the following spells, requiring no material components: At will: detect magic, fog cloud, light 3/day each: feather fall, fly, misty step, telekinesis 1/day each: control weather, gaseous form"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Cliffs",
      "Highlands"
    ],
    "languages": "Common, Giant",
    "senses": "Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/cloud-giant.png"
  },
  {
    "id": "cockatrice",
    "name": "Cockatrice",
    "size": "Small",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 27,
    "hit_dice": "6d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft. | Fly 40 ft.",
    "stats": {
      "str": 6,
      "dex": 12,
      "con": 12,
      "int": 2,
      "wis": 13,
      "cha": 5
    },
    "summary": "A watchful small unnatural apex hunter. Codex scouts flag it as a field threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 3 (1d4 + 1) piercing damage, and the target must succeed on a DC 11 Constitution saving throw against being magically petrified. On a failed save, the creature begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified for 24 hours."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Arctic",
      "Mountain"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/cockatrice.png"
  },
  {
    "id": "commoner",
    "name": "Commoner",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 4,
    "hit_dice": "1d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 10,
      "con": 10,
      "int": 10,
      "wis": 10,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and wilderness.",
    "actions": [
      {
        "name": "Club",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Wilderness"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 10",
    "source_desc": "Commoners include peasants, serfs, slaves, servants, pilgrims, merchants, artisans, and hermits.",
    "image": "/api/images/monsters/commoner.png"
  },
  {
    "id": "constrictor-snake",
    "name": "Constrictor Snake",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 13,
    "hit_dice": "2d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 15,
      "dex": 14,
      "con": 12,
      "int": 1,
      "wis": 10,
      "cha": 3
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Constrict",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 6 (1d8 + 2) bludgeoning damage, and the target is grappled (escape DC 14). Until this grapple ends, the creature is restrained, and the snake can't constrict another target."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/constrictor-snake.png"
  },
  {
    "id": "copper-dragon-wyrmling",
    "name": "Copper Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 22,
    "hit_dice": "4d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft. | Climb 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 15,
      "dex": 12,
      "con": 13,
      "int": 14,
      "wis": 11,
      "cha": 13
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a field threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Acid Breath. The dragon exhales acid in an 20-foot line that is 5 feet wide. Each creature in that line must make a DC 11 Dexterity saving throw, taking 18 (4d8) acid damage on a failed save, or half as much damage on a successful one. Slowing Breath. The dragon exhales gas in a 15-foot cone. Each creature in that area must succeed on a DC 11 Constitution saving throw. On a failed save, the creature can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the creature can use either an action or a bonus action on its turn, but not both. These effects last for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself with a successful save."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/copper-dragon-wyrmling.png"
  },
  {
    "id": "couatl",
    "name": "Couatl",
    "size": "Medium",
    "type": "Celestial",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 97,
    "hit_dice": "13d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft. | Fly 90 ft.",
    "stats": {
      "str": 16,
      "dex": 20,
      "con": 17,
      "int": 18,
      "wis": 20,
      "cha": 18
    },
    "summary": "A nimble medium radiant guardian. Codex scouts flag it as a seasoned threat around cliffs and sanctum.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one creature. Hit: 8 (1d6 + 5) piercing damage, and the target must succeed on a DC 13 Constitution saving throw or be poisoned for 24 hours. Until this poison ends, the target is unconscious. Another creature can use an action to shake the target awake."
      },
      {
        "name": "Constrict",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one Medium or smaller creature. Hit: 10 (2d6 + 3) bludgeoning damage, and the target is grappled (escape DC 15). Until this grapple ends, the target is restrained, and the couatl can't constrict another target."
      },
      {
        "name": "Change Shape",
        "description": "The couatl magically polymorphs into a humanoid or beast that has a challenge rating equal to or less than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the couatl's choice). In a new form, the couatl retains its game statistics and ability to speak, but its AC, movement modes, Strength, Dexterity, and other actions are replaced by those of the new form, and it gains any statistics and capabilities (except class features, legendary actions, and lair actions) that the new form has but that it lacks. If the new form has a bite attack, the couatl can use its bite in that form."
      }
    ],
    "traits": [
      {
        "name": "Innate Spellcasting",
        "description": "The couatl's spellcasting ability is Charisma (spell save DC 14). It can innately cast the following spells, requiring only verbal components: At will: detect evil and good, detect magic, detect thoughts 3/day each: bless, create food and water, cure wounds, lesser restoration, protection from poison, sanctuary, shield 1/day each: dream, greater restoration, scrying"
      },
      {
        "name": "Magic Weapons",
        "description": "The couatl's weapon attacks are magical."
      },
      {
        "name": "Shielded Mind",
        "description": "The couatl is immune to scrying and to any effect that would sense its emotions, read its thoughts, or detect its location."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Sanctum",
      "Forest",
      "Grassland"
    ],
    "languages": "all, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/couatl.png"
  },
  {
    "id": "crab",
    "name": "Crab",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 2,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft. | Swim 20 ft.",
    "stats": {
      "str": 2,
      "dex": 11,
      "con": 10,
      "int": 1,
      "wis": 8,
      "cha": 2
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The crab can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/crab.png"
  },
  {
    "id": "crocodile",
    "name": "Crocodile",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft. | Swim 20 ft.",
    "stats": {
      "str": 15,
      "dex": 10,
      "con": 13,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 7 (1d10 + 2) piercing damage, and the target is grappled (escape DC 12). Until this grapple ends, the target is restrained, and the crocodile can't bite another target"
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "The crocodile can hold its breath for 15 minutes."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/crocodile.png"
  },
  {
    "id": "cult-fanatic",
    "name": "Cult Fanatic",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Non-Good Alignment",
    "armor_class": 13,
    "armor_class_text": "13 (Leather Armor)",
    "hit_points": 22,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 14,
      "con": 12,
      "int": 10,
      "wis": 13,
      "cha": 14
    },
    "summary": "A nimble medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The fanatic makes two melee attacks."
      },
      {
        "name": "Dagger",
        "description": "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 20/60 ft., one creature. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Dark Devotion",
        "description": "The fanatic has advantage on saving throws against being charmed or frightened."
      },
      {
        "name": "Spellcasting",
        "description": "The fanatic is a 4th-level spellcaster. Its spell casting ability is Wisdom (spell save DC 11, +3 to hit with spell attacks). The fanatic has the following cleric spells prepared: Cantrips (at will): light, sacred flame, thaumaturgy - 1st level (4 slots): command, inflict wounds, shield of faith - 2nd level (3 slots): hold person, spiritual weapon"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Wilderness"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 11",
    "source_desc": "Fanatics are often part of a cult’s leadership, using their charisma and dogma to influence and prey on those of weak will. Most are interested in personal power above all else.",
    "image": "/api/images/monsters/cult-fanatic.png"
  },
  {
    "id": "cultist",
    "name": "Cultist",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Non-Good Alignment",
    "armor_class": 12,
    "armor_class_text": "12 (Leather Armor)",
    "hit_points": 9,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 12,
      "con": 10,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A nimble medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and urban.",
    "actions": [
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 4 (1d6 + 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Dark Devotion",
        "description": "The cultist has advantage on saving throws against being charmed or frightened."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Arctic"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 10",
    "source_desc": "Cultists swear allegiance to dark powers such as elemental princes, demon lords, or archdevils. Most conceal their loyalties to avoid being ostracized, imprisoned, or executed for their beliefs. Unlike evil acolytes, cultists often show signs of insanity in their beliefs and practices.",
    "image": "/api/images/monsters/cultist.png"
  },
  {
    "id": "darkmantle",
    "name": "Darkmantle",
    "size": "Small",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 22,
    "hit_dice": "5d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 10 ft. | Fly 30 ft.",
    "stats": {
      "str": 16,
      "dex": 12,
      "con": 13,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal small unnatural apex hunter. Codex scouts flag it as a field threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Crush",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 6 (1d6 + 3) bludgeoning damage, and the darkmantle attaches to the target. If the target is Medium or smaller and the darkmantle has advantage on the attack roll, it attaches by engulfing the target's head, and the target is also blinded and unable to breathe while the darkmantle is attached in this way. While attached to the target, the darkmantle can attack no other creature except the target but has advantage on its attack rolls. The darkmantle's speed also becomes 0, it can't benefit from any bonus to its speed, and it moves with the target. A creature can detach the darkmantle by making a successful DC 13 Strength check as an action. On its turn, the darkmantle can detach itself from the target by using 5 feet of movement."
      },
      {
        "name": "Darkness Aura",
        "description": "A 15-foot radius of magical darkness extends out from the darkmantle, moves with it, and spreads around corners. The darkness lasts as long as the darkmantle maintains concentration, up to 10 minutes (as if concentrating on a spell). Darkvision can't penetrate this darkness, and no natural light can illuminate it. If any of the darkness overlaps with an area of light created by a spell of 2nd level or lower, the spell creating the light is dispelled."
      }
    ],
    "traits": [
      {
        "name": "Echolocation",
        "description": "The darkmantle can't use its blindsight while deafened."
      },
      {
        "name": "False Appearance",
        "description": "While the darkmantle remains motionless, it is indistinguishable from a cave formation such as a stalactite or stalagmite."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/darkmantle.png"
  },
  {
    "id": "death-dog",
    "name": "Death Dog",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 39,
    "hit_dice": "6d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 15,
      "dex": 14,
      "con": 14,
      "int": 3,
      "wis": 13,
      "cha": 6
    },
    "summary": "A brutal medium unnatural apex hunter. Codex scouts flag it as a field threat around wilderness and desert.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dog makes two bite attacks."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage. If the target is a creature, it must succeed on a DC 12 Constitution saving throw against disease or become poisoned until the disease is cured. Every 24 hours that elapse, the creature must repeat the saving throw, reducing its hit point maximum by 5 (1d10) on a failure. This reduction lasts until the disease is cured. The creature dies if the disease reduces its hit point maximum to 0."
      }
    ],
    "traits": [
      {
        "name": "Two-Headed",
        "description": "The dog has advantage on Wisdom (Perception) checks and on saving throws against being blinded, charmed, deafened, frightened, stunned, or knocked unconscious."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Desert"
    ],
    "languages": "None listed",
    "senses": "Darkvision 120 ft. | Passive Perception 15",
    "source_desc": "A death dog is an ugly two-headed hound that roams plains, and deserts. Hate burns in a death dog’s heart, and a taste for humanoid flesh drives it to attack travelers and explorers. Death dog saliva carries a foul disease that causes a victim’s flesh to slowly rot off the bone.",
    "image": "/api/images/monsters/death-dog.png"
  },
  {
    "id": "deep-gnome-svirfneblin",
    "name": "Deep Gnome (Svirfneblin)",
    "size": "Small",
    "type": "Humanoid",
    "subtype": "Gnome",
    "alignment": "Neutral Good",
    "armor_class": 15,
    "armor_class_text": "15 (Chain Shirt)",
    "hit_points": 16,
    "hit_dice": "3d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 15,
      "dex": 14,
      "con": 14,
      "int": 12,
      "wis": 10,
      "cha": 9
    },
    "summary": "A brutal small armed opportunist with gnome traits. Codex scouts flag it as a field threat around frontier and mountain.",
    "actions": [
      {
        "name": "War Pick",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      },
      {
        "name": "Poisoned Dart",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one creature. Hit: 4 (1d4 + 2) piercing damage, and the target must succeed on a DC 12 Constitution saving throw or be poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success"
      }
    ],
    "traits": [
      {
        "name": "Stone Camouflage",
        "description": "The gnome has advantage on Dexterity (Stealth) checks made to hide in rocky terrain."
      },
      {
        "name": "Gnome Cunning",
        "description": "The gnome has advantage on Intelligence, Wisdom, and Charisma saving throws against magic."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The gnome's innate spellcasting ability is Intelligence (spell save DC 11). It can innately cast the following spells, requiring no material components: At will: nondetection (self only) 1/day each: blindness/deafness, blur, disguise self"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Mountain",
      "Cavern",
      "Cliffs"
    ],
    "languages": "Gnomish, Terran, Undercommon",
    "senses": "Darkvision 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/deep-gnome-svirfneblin.png"
  },
  {
    "id": "deer",
    "name": "Deer",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 4,
    "hit_dice": "1d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 11,
      "dex": 16,
      "con": 11,
      "int": 2,
      "wis": 14,
      "cha": 5
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/deer.png"
  },
  {
    "id": "deva",
    "name": "Deva",
    "size": "Medium",
    "type": "Celestial",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 136,
    "hit_dice": "16d8",
    "challenge_rating": "10",
    "challenge_rating_value": 10,
    "speed": "Walk 30 ft. | Fly 90 ft.",
    "stats": {
      "str": 18,
      "dex": 18,
      "con": 18,
      "int": 17,
      "wis": 20,
      "cha": 20
    },
    "summary": "A watchful medium radiant guardian. Codex scouts flag it as a dangerous threat around cliffs and sanctum.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The deva makes two melee attacks."
      },
      {
        "name": "Mace",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) bludgeoning damage plus 18 (4d8) radiant damage."
      },
      {
        "name": "Healing Touch",
        "description": "The deva touches another creature. The target magically regains 20 (4d8 + 2) hit points and is freed from any curse, disease, poison, blindness, or deafness."
      },
      {
        "name": "Change Shape",
        "description": "The deva magically polymorphs into a humanoid or beast that has a challenge rating equal to or less than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the deva's choice). In a new form, the deva retains its game statistics and ability to speak, but its AC, movement modes, Strength, Dexterity, and special senses are replaced by those of the new form, and it gains any statistics and capabilities (except class features, legendary actions, and lair actions) that the new form has but that it lacks."
      }
    ],
    "traits": [
      {
        "name": "Angelic Weapons",
        "description": "The deva's weapon attacks are magical. When the deva hits with any weapon, the weapon deals an extra 4d8 radiant damage (included in the attack)."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The deva's spellcasting ability is Charisma (spell save DC 17). The deva can innately cast the following spells, requiring only verbal components: At will: detect evil and good 1/day each: commune, raise dead"
      },
      {
        "name": "Magic Resistance",
        "description": "The deva has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Sanctum",
      "Forest",
      "Grassland"
    ],
    "languages": "all, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 19",
    "source_desc": "",
    "image": "/api/images/monsters/deva.png"
  },
  {
    "id": "dire-wolf",
    "name": "Dire Wolf",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 37,
    "hit_dice": "5d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 15,
      "int": 3,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/dire-wolf.png"
  },
  {
    "id": "djinni",
    "name": "Djinni",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 161,
    "hit_dice": "14d10",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 30 ft. | Fly 90 ft.",
    "stats": {
      "str": 21,
      "dex": 15,
      "con": 22,
      "int": 15,
      "wis": 16,
      "cha": 20
    },
    "summary": "A stubborn large living force of nature. Codex scouts flag it as a deadly threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The djinni makes three scimitar attacks."
      },
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage plus 3 (1d6) lightning or thunder damage (djinni's choice)."
      },
      {
        "name": "Create Whirlwind",
        "description": "A 5-foot-radius, 30-foot-tall cylinder of swirling air magically forms on a point the djinni can see within 120 feet of it. The whirlwind lasts as long as the djinni maintains concentration (as if concentrating on a spell). Any creature but the djinni that enters the whirlwind must succeed on a DC 18 Strength saving throw or be restrained by it. The djinni can move the whirlwind up to 60 feet as an action, and creatures restrained by the whirlwind move with it. The whirlwind ends if the djinni loses sight of it. A creature can use its action to free a creature restrained by the whirlwind, including itself, by succeeding on a DC 18 Strength check. If the check succeeds, the creature is no longer restrained and moves to the nearest space outside the whirlwind."
      }
    ],
    "traits": [
      {
        "name": "Elemental Demise",
        "description": "If the djinni dies, its body disintegrates into a warm breeze, leaving behind only equipment the djinni was wearing or carrying."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The djinni's innate spellcasting ability is Charisma (spell save DC 17, +9 to hit with spell attacks). It can innately cast the following spells, requiring no material components: At will: detect evil and good, detect magic, thunderwave 3/day each: create food and water (can create wine instead of water), tongues, wind walk 1/day each: conjure elemental (air elemental only), creation, gaseous form, invisibility, major image, plane shift"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Auran",
    "senses": "Darkvision 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/djinni.png"
  },
  {
    "id": "doppelganger",
    "name": "Doppelganger",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "Shapechanger",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14",
    "hit_points": 52,
    "hit_dice": "8d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 18,
      "con": 14,
      "int": 11,
      "wis": 12,
      "cha": 14
    },
    "summary": "A nimble medium unnatural apex hunter with shapechanger traits. Codex scouts flag it as a seasoned threat around wilderness and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The doppelganger makes two melee attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) bludgeoning damage."
      },
      {
        "name": "Read Thoughts",
        "description": "The doppelganger magically reads the surface thoughts of one creature within 60 ft. of it. The effect can penetrate barriers, but 3 ft. of wood or dirt, 2 ft. of stone, 2 inches of metal, or a thin sheet of lead blocks it. While the target is in range, the doppelganger can continue reading its thoughts, as long as the doppelganger's concentration isn't broken (as if concentrating on a spell). While reading the target's mind, the doppelganger has advantage on Wisdom (Insight) and Charisma (Deception, Intimidation, and Persuasion) checks against the target."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The doppelganger can use its action to polymorph into a Small or Medium humanoid it has seen, or back into its true form. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Ambusher",
        "description": "In the first round of combat, the doppelganger has advantage on attack rolls against any creature it has surprised."
      },
      {
        "name": "Surprise Attack",
        "description": "If the doppelganger surprises a creature and hits it with an attack during the first round of combat, the target takes an extra 10 (3d6) damage from the attack."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Forest",
      "Grassland",
      "Mountain"
    ],
    "languages": "Common",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/doppelganger.png"
  },
  {
    "id": "draft-horse",
    "name": "Draft Horse",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 18,
      "dex": 10,
      "con": 12,
      "int": 2,
      "wis": 11,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (2d4 + 4) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/draft-horse.png"
  },
  {
    "id": "dragon-turtle",
    "name": "Dragon Turtle",
    "size": "Gargantuan",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 20,
    "armor_class_text": "20 (Natural)",
    "hit_points": 341,
    "hit_dice": "22d20",
    "challenge_rating": "17",
    "challenge_rating_value": 17,
    "speed": "Walk 20 ft. | Swim 40 ft.",
    "stats": {
      "str": 25,
      "dex": 10,
      "con": 20,
      "int": 10,
      "wis": 12,
      "cha": 12
    },
    "summary": "A brutal gargantuan scaled tyrant. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon turtle makes three attacks: one with its bite and two with its claws. It can make one tail attack in place of its two claw attacks."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 26 (3d12 + 7) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 16 (2d8 + 7) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 26 (3d12 + 7) bludgeoning damage. If the target is a creature, it must succeed on a DC 20 Strength saving throw or be pushed up to 10 feet away from the dragon turtle and knocked prone."
      },
      {
        "name": "Steam Breath",
        "description": "The dragon turtle exhales scalding steam in a 60-foot cone. Each creature in that area must make a DC 18 Constitution saving throw, taking 52 (15d6) fire damage on a failed save, or half as much damage on a successful one. Being underwater doesn't grant resistance against this damage."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon turtle can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Aquan, Draconic",
    "senses": "Darkvision 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/dragon-turtle.png"
  },
  {
    "id": "dretch",
    "name": "Dretch",
    "size": "Small",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 18,
    "hit_dice": "4d6",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 11,
      "dex": 11,
      "con": 12,
      "int": 5,
      "wis": 8,
      "cha": 3
    },
    "summary": "A stubborn small malicious planar raider with demon traits. Codex scouts flag it as a minor threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dretch makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 3 (1d6) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 5 (2d4) slashing damage."
      },
      {
        "name": "Fetid Cloud",
        "description": "A 10-foot radius of disgusting green gas extends out from the dretch. The gas spreads around corners, and its area is lightly obscured. It lasts for 1 minute or until a strong wind disperses it. Any creature that starts its turn in that area must succeed on a DC 11 Constitution saving throw or be poisoned until the start of its next turn. While poisoned in this way, the target can take either an action or a bonus action on its turn, not both, and can't take reactions."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift"
    ],
    "languages": "Abyssal, telepathy 60 ft. (works only with creatures that understand Abyssal)",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/dretch.png"
  },
  {
    "id": "drider",
    "name": "Drider",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 123,
    "hit_dice": "13d10",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 16,
      "dex": 16,
      "con": 18,
      "int": 13,
      "wis": 14,
      "cha": 12
    },
    "summary": "A stubborn large unnatural apex hunter. Codex scouts flag it as a dangerous threat around ruins and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The drider makes three attacks, either with its longsword or its longbow. It can replace one of those attacks with a bite attack."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 2 (1d4) piercing damage plus 9 (2d8) poison damage."
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +6 to hit, range 150/600 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) poison damage."
      }
    ],
    "traits": [
      {
        "name": "Fey Ancestry",
        "description": "The drider has advantage on saving throws against being charmed, and magic can't put the drider to sleep."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The drider's innate spellcasting ability is Wisdom (spell save DC 13). The drider can innately cast the following spells, requiring no material components: At will: dancing lights 1/day each: darkness, faerie fire"
      },
      {
        "name": "Spider Climb",
        "description": "The drider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the drider has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      },
      {
        "name": "Web Walker",
        "description": "The drider ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Wilderness",
      "Forest",
      "Cavern"
    ],
    "languages": "Elvish, Undercommon",
    "senses": "Darkvision 120 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/drider.png"
  },
  {
    "id": "drow",
    "name": "Drow",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Elf",
    "alignment": "Neutral Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Chain Shirt)",
    "hit_points": 13,
    "hit_dice": "3d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 14,
      "con": 10,
      "int": 11,
      "wis": 11,
      "cha": 12
    },
    "summary": "A nimble medium armed opportunist with elf traits. Codex scouts flag it as a minor threat around frontier and volcanic.",
    "actions": [
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Hand Crossbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage, and the target must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If the saving throw fails by 5 or more, the target is also unconscious while poisoned in this way. The target wakes up if it takes damage or if another creature takes an action to shake it awake."
      }
    ],
    "traits": [
      {
        "name": "Fey Ancestry",
        "description": "The drow has advantage on saving throws against being charmed, and magic can't put the drow to sleep."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The drow's spellcasting ability is Charisma (spell save DC 11). It can innately cast the following spells, requiring no material components: At will: dancing lights 1/day each: darkness, faerie fire"
      },
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the drow has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Volcanic",
      "Underdark"
    ],
    "languages": "Elvish, Undercommon",
    "senses": "Darkvision 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/drow.png"
  },
  {
    "id": "druid",
    "name": "Druid",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 11,
    "armor_class_text": "11 / 16 (Spell)",
    "hit_points": 27,
    "hit_dice": "5d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 12,
      "con": 13,
      "int": 12,
      "wis": 15,
      "cha": 11
    },
    "summary": "A watchful medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and grove.",
    "actions": [
      {
        "name": "Quarterstaff",
        "description": "Melee Weapon Attack: +2 to hit (+4 to hit with shillelagh), reach 5 ft., one target. Hit: 3 (1d6) bludgeoning damage, 4 (1d8) bludgeoning damage if wielded with two hands, or 6 (1d8 + 2) bludgeoning damage with shillelagh."
      }
    ],
    "traits": [
      {
        "name": "Spellcasting",
        "description": "The druid is a 4th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 12, +4 to hit with spell attacks). It has the following druid spells prepared: - Cantrips (at will): druidcraft, produce flame, shillelagh - 1st level (4 slots): entangle, longstrider, speak with animals, thunderwave - 2nd level (3 slots): animal messenger, barkskin"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Grove"
    ],
    "languages": "Druidic plus any two languages",
    "senses": "Passive Perception 14",
    "source_desc": "**Druids** dwell in forests and other secluded wilderness locations, where they protect the natural world from monsters and the encroachment of civilization. Some are **tribal shamans** who heal the sick, pray to animal spirits, and provide spiritual guidance.",
    "image": "/api/images/monsters/druid.png"
  },
  {
    "id": "dryad",
    "name": "Dryad",
    "size": "Medium",
    "type": "Fey",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 11,
    "armor_class_text": "11 / 16 (Spell)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 12,
      "con": 11,
      "int": 14,
      "wis": 15,
      "cha": 18
    },
    "summary": "A commanding medium wild trickster spirit. Codex scouts flag it as a field threat around forest and grove.",
    "actions": [
      {
        "name": "Club",
        "description": "Melee Weapon Attack: +2 to hit (+6 to hit with shillelagh), reach 5 ft., one target. Hit: 2 (1 d4) bludgeoning damage, or 8 (1d8 + 4) bludgeoning damage with shillelagh."
      },
      {
        "name": "Fey Charm",
        "description": "The dryad targets one humanoid or beast that she can see within 30 feet of her. If the target can see the dryad, it must succeed on a DC 14 Wisdom saving throw or be magically charmed. The charmed creature regards the dryad as a trusted friend to be heeded and protected. Although the target isn't under the dryad's control, it takes the dryad's requests or actions in the most favorable way it can. Each time the dryad or its allies do anything harmful to the target, it can repeat the saving throw, ending the effect on itself on a success. Otherwise, the effect lasts 24 hours or until the dryad dies, is on a different plane of existence from the target, or ends the effect as a bonus action. If a target's saving throw is successful, the target is immune to the dryad's Fey Charm for the next 24 hours. The dryad can have no more than one humanoid and up to three beasts charmed at a time."
      }
    ],
    "traits": [
      {
        "name": "Innate Spellcasting",
        "description": "The dryad's innate spellcasting ability is Charisma (spell save DC 14). The dryad can innately cast the following spells, requiring no material components: At will: druidcraft 3/day each: entangle, goodberry 1/day each: barkskin, pass without trace, shillelagh"
      },
      {
        "name": "Magic Resistance",
        "description": "The dryad has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Speak with Beasts and Plants",
        "description": "The dryad can communicate with beasts and plants as if they shared a language."
      },
      {
        "name": "Tree Stride",
        "description": "Once on her turn, the dryad can use 10 ft. of her movement to step magically into one living tree within her reach and emerge from a second living tree within 60 ft. of the first tree, appearing in an unoccupied space within 5 ft. of the second tree. Both trees must be large or bigger."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grove"
    ],
    "languages": "Elvish, Sylvan",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/dryad.png"
  },
  {
    "id": "duergar",
    "name": "Duergar",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Dwarf",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Scale Mail, Shield)",
    "hit_points": 26,
    "hit_dice": "4d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 25 ft.",
    "stats": {
      "str": 14,
      "dex": 11,
      "con": 14,
      "int": 11,
      "wis": 10,
      "cha": 9
    },
    "summary": "A brutal medium armed opportunist with dwarf traits. Codex scouts flag it as a field threat around frontier and cavern.",
    "actions": [
      {
        "name": "Enlarge",
        "description": "For 1 minute, the duergar magically increases in size, along with anything it is wearing or carrying. While enlarged, the duergar is Large, doubles its damage dice on Strength-based weapon attacks (included in the attacks), and makes Strength checks and Strength saving throws with advantage. If the duergar lacks the room to become Large, it attains the maximum size possible in the space available."
      },
      {
        "name": "War Pick",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage, or 11 (2d8 + 2) piercing damage while enlarged."
      },
      {
        "name": "Javelin",
        "description": "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage, or 9 (2d6 + 2) piercing damage while enlarged."
      },
      {
        "name": "Invisibility",
        "description": "The duergar magically turns invisible until it attacks, casts a spell, or uses its Enlarge, or until its concentration is broken, up to 1 hour (as if concentrating on a spell). Any equipment the duergar wears or carries is invisible with it."
      }
    ],
    "traits": [
      {
        "name": "Duergar Resilience",
        "description": "The duergar has advantage on saving throws against poison, spells, and illusions, as well as to resist being charmed or paralyzed."
      },
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the duergar has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern",
      "Forest",
      "Grassland"
    ],
    "languages": "Dwarvish, Undercommon",
    "senses": "Darkvision 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/duergar.png"
  },
  {
    "id": "dust-mephit",
    "name": "Dust Mephit",
    "size": "Small",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 17,
    "hit_dice": "5d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft. | Fly 30 ft.",
    "stats": {
      "str": 5,
      "dex": 14,
      "con": 10,
      "int": 9,
      "wis": 11,
      "cha": 10
    },
    "summary": "A nimble small living force of nature. Codex scouts flag it as a field threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 4 (1d4 + 2) slashing damage."
      },
      {
        "name": "Blinding Breath",
        "description": "The mephit exhales a 15-foot cone of blinding dust. Each creature in that area must succeed on a DC 10 Dexterity saving throw or be blinded for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Death Burst",
        "description": "When the mephit dies, it explodes in a burst of dust. Each creature within 5 ft. of it must then succeed on a DC 10 Constitution saving throw or be blinded for 1 minute. A blinded creature can repeat the saving throw on each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The mephit can innately cast sleep, requiring no material components. Its innate spellcasting ability is Charisma."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift"
    ],
    "languages": "Auran, Terran",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/dust-mephit.png"
  },
  {
    "id": "eagle",
    "name": "Eagle",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 3,
    "hit_dice": "1d6",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 10 ft. | Fly 60 ft.",
    "stats": {
      "str": 6,
      "dex": 15,
      "con": 10,
      "int": 2,
      "wis": 14,
      "cha": 7
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The eagle has advantage on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/eagle.png"
  },
  {
    "id": "earth-elemental",
    "name": "Earth Elemental",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 126,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft. | Burrow 30 ft.",
    "stats": {
      "str": 20,
      "dex": 8,
      "con": 20,
      "int": 5,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal large living force of nature. Codex scouts flag it as a dangerous threat around badlands and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The elemental makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Earth Glide",
        "description": "The elemental can burrow through nonmagical, unworked earth and stone. While doing so, the elemental doesn't disturb the material it moves through."
      },
      {
        "name": "Siege Monster",
        "description": "The elemental deals double damage to objects and structures."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Elemental Rift",
      "Mountain",
      "Cavern"
    ],
    "languages": "Terran",
    "senses": "Darkvision 60 ft. | Tremorsense 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/earth-elemental.png"
  },
  {
    "id": "efreeti",
    "name": "Efreeti",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 200,
    "hit_dice": "16d10",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 40 ft. | Fly 60 ft.",
    "stats": {
      "str": 22,
      "dex": 12,
      "con": 24,
      "int": 16,
      "wis": 15,
      "cha": 16
    },
    "summary": "A stubborn large living force of nature. Codex scouts flag it as a deadly threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The efreeti makes two scimitar attacks or uses its Hurl Flame twice."
      },
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage plus 7 (2d6) fire damage."
      },
      {
        "name": "Hurl Flame",
        "description": "Ranged Spell Attack: +7 to hit, range 120 ft., one target. Hit: 17 (5d6) fire damage."
      }
    ],
    "traits": [
      {
        "name": "Elemental Demise",
        "description": "If the efreeti dies, its body disintegrates in a flash of fire and puff of smoke, leaving behind only equipment the djinni was wearing or carrying."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The efreeti's innate spell casting ability is Charisma (spell save DC 15, +7 to hit with spell attacks). It can innately cast the following spells, requiring no material components: At will: detect magic 3/day: enlarge/reduce, tongues 1/day each: conjure elemental (fire elemental only), gaseous form, invisibility, major image, plane shift, wall of fire"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Ignan",
    "senses": "Darkvision 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/efreeti.png"
  },
  {
    "id": "elephant",
    "name": "Elephant",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 76,
    "hit_dice": "8d12",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 22,
      "dex": 9,
      "con": 17,
      "int": 3,
      "wis": 11,
      "cha": 6
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a seasoned threat around forest and wilderness.",
    "actions": [
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 19 (3d8 + 6) piercing damage."
      },
      {
        "name": "Stomp",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one prone creature. Hit: 22 (3d10 + 6) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Trampling Charge",
        "description": "If the elephant moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 12 Strength saving throw or be knocked prone. If the target is prone, the elephant can make one stomp attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/elephant.png"
  },
  {
    "id": "elk",
    "name": "Elk",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 13,
    "hit_dice": "2d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 16,
      "dex": 10,
      "con": 12,
      "int": 2,
      "wis": 10,
      "cha": 6
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Ram",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage."
      },
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one prone creature. Hit: 8 (2d4 + 3) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the elk moves at least 20 ft. straight toward a target and then hits it with a ram attack on the same turn, the target takes an extra 7 (2d6) damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/elk.png"
  },
  {
    "id": "erinyes",
    "name": "Erinyes",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Plate Armor)",
    "hit_points": 153,
    "hit_dice": "18d8",
    "challenge_rating": "12",
    "challenge_rating_value": 12,
    "speed": "Walk 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 18,
      "dex": 16,
      "con": 18,
      "int": 14,
      "wis": 14,
      "cha": 18
    },
    "summary": "A brutal medium malicious planar raider with devil traits. Codex scouts flag it as a deadly threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The erinyes makes three attacks"
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) slashing damage, or 9 (1d10 + 4) slashing damage if used with two hands, plus 13 (3d8) poison damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +7 to hit, range 150/600 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 13 (3d8) poison damage, and the target must succeed on a DC 14 Constitution saving throw or be poisoned. The poison lasts until it is removed by the lesser restoration spell or similar magic."
      }
    ],
    "traits": [
      {
        "name": "Hellish Weapons",
        "description": "The erinyes's weapon attacks are magical and deal an extra 13 (3d8) poison damage on a hit (included in the attacks)."
      },
      {
        "name": "Magic Resistance",
        "description": "The erinyes has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Forest"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/erinyes.png"
  },
  {
    "id": "ettercap",
    "name": "Ettercap",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 44,
    "hit_dice": "8d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 14,
      "dex": 15,
      "con": 13,
      "int": 7,
      "wis": 12,
      "cha": 8
    },
    "summary": "A nimble medium unnatural apex hunter. Codex scouts flag it as a seasoned threat around ruins and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The ettercap makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 6 (1d8 + 2) piercing damage plus 4 (1d8) poison damage. The target must succeed on a DC 11 Constitution saving throw or be poisoned for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage."
      },
      {
        "name": "Web",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/60 ft., one Large or smaller creature. Hit: The creature is restrained by webbing. As an action, the restrained creature can make a DC 11 Strength check, escaping from the webbing on a success. The effect ends if the webbing is destroyed. The webbing has AC 10, 5 hit points, is vulnerable to fire damage and immune to bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Spider Climb",
        "description": "The ettercap can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Web Sense",
        "description": "While in contact with a web, the ettercap knows the exact location of any other creature in contact with the same web."
      },
      {
        "name": "Web Walker",
        "description": "The ettercap ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Wilderness",
      "Forest",
      "Cavern"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/ettercap.png"
  },
  {
    "id": "ettin",
    "name": "Ettin",
    "size": "Large",
    "type": "Giant",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 85,
    "hit_dice": "10d10",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 21,
      "dex": 8,
      "con": 17,
      "int": 6,
      "wis": 10,
      "cha": 8
    },
    "summary": "A brutal large towering marauder. Codex scouts flag it as a seasoned threat around mountain and cavern.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The ettin makes two attacks: one with its battleaxe and one with its morningstar."
      },
      {
        "name": "Battleaxe",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage."
      },
      {
        "name": "Morningstar",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Two Heads",
        "description": "The ettin has advantage on Wisdom (Perception) checks and on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious."
      },
      {
        "name": "Wakeful",
        "description": "When one of the ettin's heads is asleep, its other head is awake."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Cavern",
      "Frontier"
    ],
    "languages": "Giant, Orc",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/ettin.png"
  },
  {
    "id": "fire-elemental",
    "name": "Fire Elemental",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 102,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 10,
      "dex": 17,
      "con": 16,
      "int": 6,
      "wis": 10,
      "cha": 7
    },
    "summary": "A nimble large living force of nature. Codex scouts flag it as a dangerous threat around elemental rift and volcanic.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The elemental makes two touch attacks."
      },
      {
        "name": "Touch",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) fire damage. If the target is a creature or a flammable object, it ignites. Until a creature takes an action to douse the fire, the target takes 5 (1d10) fire damage at the start of each of its turns."
      }
    ],
    "traits": [
      {
        "name": "Fire Form",
        "description": "The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the elemental or hits it with a melee attack while within 5 ft. of it takes 5 (1d10) fire damage. In addition, the elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn, that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the creature takes 5 (1d10) fire damage at the start of each of its turns."
      },
      {
        "name": "Illumination",
        "description": "The elemental sheds bright light in a 30-foot radius and dim light in an additional 30 ft.."
      },
      {
        "name": "Water Susceptibility",
        "description": "For every 5 ft. the elemental moves in water, or for every gallon of water splashed on it, it takes 1 cold damage."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Elemental Rift",
      "Volcanic"
    ],
    "languages": "Ignan",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/fire-elemental.png"
  },
  {
    "id": "fire-giant",
    "name": "Fire Giant",
    "size": "Huge",
    "type": "Giant",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Plate Armor)",
    "hit_points": 162,
    "hit_dice": "13d12",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 25,
      "dex": 9,
      "con": 23,
      "int": 10,
      "wis": 14,
      "cha": 13
    },
    "summary": "A brutal huge towering marauder. Codex scouts flag it as a dangerous threat around mountain and volcanic.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The giant makes two greatsword attacks."
      },
      {
        "name": "Greatsword",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 28 (6d6 + 7) slashing damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +11 to hit, range 60/240 ft., one target. Hit: 29 (4d10 + 7) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Volcanic",
      "Cliffs",
      "Highlands"
    ],
    "languages": "Giant",
    "senses": "Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/fire-giant.png"
  },
  {
    "id": "flesh-golem",
    "name": "Flesh Golem",
    "size": "Medium",
    "type": "Construct",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 9,
    "armor_class_text": "9",
    "hit_points": 93,
    "hit_dice": "11d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 19,
      "dex": 9,
      "con": 18,
      "int": 6,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal medium forged sentinel. Codex scouts flag it as a dangerous threat around ruins and vault.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The golem makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Berserk",
        "description": "Whenever the golem starts its turn with 40 hit points or fewer, roll a d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object, with preference for an object smaller than itself. Once the golem goes berserk, it continues to do so until it is destroyed or regains all its hit points. The golem's creator, if within 60 feet of the berserk golem, can try to calm it by speaking firmly and persuasively. The golem must be able to hear its creator, who must take an action to make a DC 15 Charisma (Persuasion) check. If the check succeeds, the golem ceases being berserk. If it takes damage while still at 40 hit points or fewer, the golem might go berserk again."
      },
      {
        "name": "Aversion of Fire",
        "description": "If the golem takes fire damage, it has disadvantage on attack rolls and ability checks until the end of its next turn."
      },
      {
        "name": "Immutable Form",
        "description": "The golem is immune to any spell or effect that would alter its form."
      },
      {
        "name": "Lightning Absorption",
        "description": "Whenever the golem is subjected to lightning damage, it takes no damage and instead regains a number of hit points equal to the lightning damage dealt."
      },
      {
        "name": "Magic Resistance",
        "description": "The golem has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The golem's weapon attacks are magical."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault",
      "Volcanic"
    ],
    "languages": "understands the languages of its creator but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/flesh-golem.png"
  },
  {
    "id": "flying-snake",
    "name": "Flying Snake",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14",
    "hit_points": 5,
    "hit_dice": "2d4",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft. | Fly 60 ft. | Swim 30 ft.",
    "stats": {
      "str": 4,
      "dex": 18,
      "con": 11,
      "int": 2,
      "wis": 12,
      "cha": 5
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 1 piercing damage plus 7 (3d4) poison damage."
      }
    ],
    "traits": [
      {
        "name": "Flyby",
        "description": "The snake doesn't provoke opportunity attacks when it flies out of an enemy's reach."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 11",
    "source_desc": "A flying snake is a brightly colored, winged serpent found in remote jungles. Tribespeople and cultists sometimes domesticate flying snakes to serve as messengers that deliver scrolls wrapped in their coils.",
    "image": "/api/images/monsters/flying-snake.png"
  },
  {
    "id": "flying-sword",
    "name": "Flying Sword",
    "size": "Small",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 17,
    "hit_dice": "5d6",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 0 ft. | Fly 50 ft. | Hover true",
    "stats": {
      "str": 12,
      "dex": 15,
      "con": 11,
      "int": 1,
      "wis": 5,
      "cha": 1
    },
    "summary": "A nimble small forged sentinel. Codex scouts flag it as a minor threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Antimagic Susceptibility",
        "description": "The sword is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the sword must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute."
      },
      {
        "name": "False Appearance",
        "description": "While the sword remains motionless and isn't flying, it is indistinguishable from a normal sword."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Ruins",
      "Vault"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 7",
    "source_desc": "",
    "image": "/api/images/monsters/flying-sword.png"
  },
  {
    "id": "frog",
    "name": "Frog",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft. | Swim 20 ft.",
    "stats": {
      "str": 1,
      "dex": 13,
      "con": 8,
      "int": 1,
      "wis": 8,
      "cha": 3
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The frog can breathe air and water"
      },
      {
        "name": "Standing Leap",
        "description": "The frog's long jump is up to 10 ft. and its high jump is up to 5 ft., with or without a running start."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Swamp"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 11",
    "source_desc": "A frog has no effective attacks. It feeds on small insects and typically dwells near water, in trees, or underground. The frog’s statistics can also be used to represent a toad.",
    "image": "/api/images/monsters/frog.png"
  },
  {
    "id": "frost-giant",
    "name": "Frost Giant",
    "size": "Huge",
    "type": "Giant",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Armor)",
    "hit_points": 138,
    "hit_dice": "12d12",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 23,
      "dex": 9,
      "con": 21,
      "int": 9,
      "wis": 10,
      "cha": 12
    },
    "summary": "A brutal huge towering marauder. Codex scouts flag it as a dangerous threat around mountain and arctic.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The giant makes two greataxe attacks."
      },
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 25 (3d12 + 6) slashing damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +9 to hit, range 60/240 ft., one target. Hit: 28 (4d10 + 6) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Arctic",
      "Cliffs",
      "Highlands"
    ],
    "languages": "Giant",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/frost-giant.png"
  },
  {
    "id": "gargoyle",
    "name": "Gargoyle",
    "size": "Medium",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 52,
    "hit_dice": "7d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 15,
      "dex": 11,
      "con": 16,
      "int": 6,
      "wis": 11,
      "cha": 7
    },
    "summary": "A stubborn medium living force of nature. Codex scouts flag it as a seasoned threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The gargoyle makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the gargoyle remains motion less, it is indistinguishable from an inanimate statue."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift"
    ],
    "languages": "Terran",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/gargoyle.png"
  },
  {
    "id": "gelatinous-cube",
    "name": "Gelatinous Cube",
    "size": "Large",
    "type": "Ooze",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 6,
    "armor_class_text": "6",
    "hit_points": 84,
    "hit_dice": "8d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 15 ft.",
    "stats": {
      "str": 14,
      "dex": 3,
      "con": 20,
      "int": 1,
      "wis": 6,
      "cha": 1
    },
    "summary": "A stubborn large dissolving lurker. Codex scouts flag it as a seasoned threat around sewer and dungeon.",
    "actions": [
      {
        "name": "Pseudopod",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 10 (3d6) acid damage."
      },
      {
        "name": "Engulf",
        "description": "The cube moves up to its speed. While doing so, it can enter Large or smaller creatures' spaces. Whenever the cube enters a creature's space, the creature must make a DC 12 Dexterity saving throw. On a successful save, the creature can choose to be pushed 5 feet back or to the side of the cube. A creature that chooses not to be pushed suffers the consequences of a failed saving throw. On a failed save, the cube enters the creature's space, and the creature takes 10 (3d6) acid damage and is engulfed. The engulfed creature can't breathe, is restrained, and takes 21 (6d6) acid damage at the start of each of the cube's turns. When the cube moves, the engulfed creature moves with it. An engulfed creature can try to escape by taking an action to make a DC 12 Strength check. On a success, the creature escapes and enters a space of its choice within 5 feet of the cube."
      }
    ],
    "traits": [
      {
        "name": "Ooze Cube",
        "description": "The cube takes up its entire space. Other creatures can enter the space, but a creature that does so is subjected to the cube's Engulf and has disadvantage on the saving throw. Creatures inside the cube can be seen but have total cover. A creature within 5 feet of the cube can take an action to pull a creature or object out of the cube. Doing so requires a successful DC 12 Strength check, and the creature making the attempt takes 10 (3d6) acid damage. The cube can hold only one Large creature or up to four Medium or smaller creatures inside it at a time."
      },
      {
        "name": "Transparent",
        "description": "Even when the cube is in plain sight, it takes a successful DC 15 Wisdom (Perception) check to spot a cube that has neither moved nor attacked. A creature that tries to enter the cube's space while unaware of the cube is surprised by the cube."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Sewer",
      "Dungeon",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/gelatinous-cube.png"
  },
  {
    "id": "ghast",
    "name": "Ghast",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 36,
    "hit_dice": "8d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 17,
      "con": 10,
      "int": 11,
      "wis": 10,
      "cha": 8
    },
    "summary": "A nimble medium deathless stalker. Codex scouts flag it as a seasoned threat around crypt and ruins.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 12 (2d8 + 3) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage. If the target is a creature other than an undead, it must succeed on a DC 10 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Stench",
        "description": "Any creature that starts its turn within 5 ft. of the ghast must succeed on a DC 10 Constitution saving throw or be poisoned until the start of its next turn. On a successful saving throw, the creature is immune to the ghast's Stench for 24 hours."
      },
      {
        "name": "Turn Defiance",
        "description": "The ghast and any ghouls within 30 ft. of it have advantage on saving throws against effects that turn undead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "Common",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/ghast.png"
  },
  {
    "id": "ghost",
    "name": "Ghost",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Any Alignment",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 45,
    "hit_dice": "10d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 0 ft. | Fly 40 ft. | Hover true",
    "stats": {
      "str": 7,
      "dex": 13,
      "con": 10,
      "int": 10,
      "wis": 12,
      "cha": 17
    },
    "summary": "A commanding medium deathless stalker. Codex scouts flag it as a seasoned threat around cliffs and crypt.",
    "actions": [
      {
        "name": "Withering Touch",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 17 (4d6 + 3) necrotic damage."
      },
      {
        "name": "Etherealness",
        "description": "The ghost enters the Ethereal Plane from the Material Plane, or vice versa. It is visible on the Material Plane while it is in the Border Ethereal, and vice versa, yet it can't affect or be affected by anything on the other plane."
      },
      {
        "name": "Horrifying Visage",
        "description": "Each non-undead creature within 60 ft. of the ghost that can see it must succeed on a DC 13 Wisdom saving throw or be frightened for 1 minute. If the save fails by 5 or more, the target also ages 1d4 × 10 years. A frightened target can repeat the saving throw at the end of each of its turns, ending the frightened condition on itself on a success. If a target's saving throw is successful or the effect ends for it, the target is immune to this ghost's Horrifying Visage for the next 24 hours. The aging effect can be reversed with a greater restoration spell, but only within 24 hours of it occurring."
      },
      {
        "name": "Possession",
        "description": "One humanoid that the ghost can see within 5 ft. of it must succeed on a DC 13 Charisma saving throw or be possessed by the ghost; the ghost then disappears, and the target is incapacitated and loses control of its body. The ghost now controls the body but doesn't deprive the target of awareness. The ghost can't be targeted by any attack, spell, or other effect, except ones that turn undead, and it retains its alignment, Intelligence, Wisdom, Charisma, and immunity to being charmed and frightened. It otherwise uses the possessed target's statistics, but doesn't gain access to the target's knowledge, class features, or proficiencies. The possession lasts until the body drops to 0 hit points, the ghost ends it as a bonus action, or the ghost is turned or forced out by an effect like the dispel evil and good spell. When the possession ends, the ghost reappears in an unoccupied space within 5 ft. of the body. The target is immune to this ghost's Possession for 24 hours after succeeding on the saving throw or after the possession ends."
      }
    ],
    "traits": [
      {
        "name": "Ethereal Sight",
        "description": "The ghost can see 60 ft. into the Ethereal Plane when it is on the Material Plane, and vice versa."
      },
      {
        "name": "Incorporeal Movement",
        "description": "The ghost can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Crypt",
      "Ruins",
      "Cavern"
    ],
    "languages": "any languages it knew in life",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/ghost.png"
  },
  {
    "id": "ghoul",
    "name": "Ghoul",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 13,
      "dex": 15,
      "con": 10,
      "int": 7,
      "wis": 10,
      "cha": 6
    },
    "summary": "A nimble medium deathless stalker. Codex scouts flag it as a field threat around crypt and ruins.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage. If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "Common",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/ghoul.png"
  },
  {
    "id": "giant-ape",
    "name": "Giant Ape",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 157,
    "hit_dice": "15d12",
    "challenge_rating": "7",
    "challenge_rating_value": 7,
    "speed": "Walk 40 ft. | Climb 40 ft.",
    "stats": {
      "str": 23,
      "dex": 14,
      "con": 18,
      "int": 7,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a dangerous threat around ruins and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The ape makes two fist attacks."
      },
      {
        "name": "Fist",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 22 (3d10 + 6) bludgeoning damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +9 to hit, range 50/100 ft., one target. Hit: 30 (7d6 + 6) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Grassland",
      "Cliffs"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/giant-ape.png"
  },
  {
    "id": "giant-badger",
    "name": "Giant Badger",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 13,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Burrow 10 ft.",
    "stats": {
      "str": 13,
      "dex": 10,
      "con": 15,
      "int": 2,
      "wis": 12,
      "cha": 5
    },
    "summary": "A stubborn medium instinct-driven predator. Codex scouts flag it as a minor threat around badlands and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The badger makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 6 (2d4 + 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The badger has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/giant-badger.png"
  },
  {
    "id": "giant-bat",
    "name": "Giant Bat",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 22,
    "hit_dice": "4d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 10 ft. | Fly 60 ft.",
    "stats": {
      "str": 15,
      "dex": 16,
      "con": 11,
      "int": 2,
      "wis": 12,
      "cha": 6
    },
    "summary": "A nimble large instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Echolocation",
        "description": "The bat can't use its blindsight while deafened."
      },
      {
        "name": "Keen Hearing",
        "description": "The bat has advantage on Wisdom (Perception) checks that rely on hearing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/giant-bat.png"
  },
  {
    "id": "giant-boar",
    "name": "Giant Boar",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 42,
    "hit_dice": "5d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 16,
      "int": 2,
      "wis": 7,
      "cha": 5
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around forest and grassland.",
    "actions": [
      {
        "name": "Tusk",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the boar moves at least 20 ft. straight toward a target and then hits it with a tusk attack on the same turn, the target takes an extra 7 (2d6) slashing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      },
      {
        "name": "Relentless",
        "description": "If the boar takes 10 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/giant-boar.png"
  },
  {
    "id": "giant-centipede",
    "name": "Giant Centipede",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 4,
    "hit_dice": "1d6",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 5,
      "dex": 14,
      "con": 12,
      "int": 1,
      "wis": 7,
      "cha": 3
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 4 (1d4 + 2) piercing damage, and the target must succeed on a DC 11 Constitution saving throw or take 10 (3d6) poison damage. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/giant-centipede.png"
  },
  {
    "id": "giant-constrictor-snake",
    "name": "Giant Constrictor Snake",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 60,
    "hit_dice": "8d12",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 19,
      "dex": 14,
      "con": 12,
      "int": 1,
      "wis": 10,
      "cha": 3
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one creature. Hit: 11 (2d6 + 4) piercing damage."
      },
      {
        "name": "Constrict",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 13 (2d8 + 4) bludgeoning damage, and the target is grappled (escape DC 16). Until this grapple ends, the creature is restrained, and the snake can't constrict another target."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/giant-constrictor-snake.png"
  },
  {
    "id": "giant-crab",
    "name": "Giant Crab",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 13,
    "hit_dice": "3d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 13,
      "dex": 15,
      "con": 11,
      "int": 1,
      "wis": 9,
      "cha": 3
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage, and the target is grappled (escape DC 11). The crab has two claws, each of which can grapple only one target."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The crab can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/giant-crab.png"
  },
  {
    "id": "giant-crocodile",
    "name": "Giant Crocodile",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 85,
    "hit_dice": "9d12",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft. | Swim 50 ft.",
    "stats": {
      "str": 21,
      "dex": 9,
      "con": 17,
      "int": 2,
      "wis": 10,
      "cha": 7
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The crocodile makes two attacks: one with its bite and one with its tail."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 21 (3d10 + 5) piercing damage, and the target is grappled (escape DC 16). Until this grapple ends, the target is restrained, and the crocodile can't bite another target."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target not grappled by the crocodile. Hit: 14 (2d8 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 16 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "The crocodile can hold its breath for 30 minutes."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/giant-crocodile.png"
  },
  {
    "id": "giant-eagle",
    "name": "Giant Eagle",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Neutral Good",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 26,
    "hit_dice": "4d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 10 ft. | Fly 80 ft.",
    "stats": {
      "str": 16,
      "dex": 17,
      "con": 13,
      "int": 8,
      "wis": 14,
      "cha": 10
    },
    "summary": "A nimble large instinct-driven predator. Codex scouts flag it as a field threat around cliffs and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The eagle makes two attacks: one with its beak and one with its talons."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      },
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The eagle has advantage on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Urban",
      "Stronghold"
    ],
    "languages": "Giant Eagle, understands Common and Auran but can't speak",
    "senses": "Passive Perception 14",
    "source_desc": "A giant eagle is a noble creature that speaks its own language and understands speech in the Common tongue. A mated pair of giant eagles typically has up to four eggs or young in their nest (treat the young as normal eagles).",
    "image": "/api/images/monsters/giant-eagle.png"
  },
  {
    "id": "giant-elk",
    "name": "Giant Elk",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 42,
    "hit_dice": "5d12",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 60 ft.",
    "stats": {
      "str": 19,
      "dex": 16,
      "con": 14,
      "int": 7,
      "wis": 14,
      "cha": 10
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a seasoned threat around forest and crypt.",
    "actions": [
      {
        "name": "Ram",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      },
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one prone creature. Hit: 22 (4d8 + 4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the elk moves at least 20 ft. straight toward a target and then hits it with a ram attack on the same turn, the target takes an extra 7 (2d6) damage. If the target is a creature, it must succeed on a DC 14 Strength saving throw or be knocked prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Crypt",
      "Ruins",
      "Grassland"
    ],
    "languages": "Giant Elk, understands Common, Elvish, and Sylvan but can't speak",
    "senses": "Passive Perception 14",
    "source_desc": "The majestic giant elk is rare to the point that its appearance is often taken as a foreshadowing of an important event, such as the birth of a king. Legends tell of gods that take the form of giant elk when visiting the Material Plane. Many cultures therefore believe that to hunt these creatures is to invite divine wrath.",
    "image": "/api/images/monsters/giant-elk.png"
  },
  {
    "id": "giant-fire-beetle",
    "name": "Giant Fire Beetle",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 4,
    "hit_dice": "1d6",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 8,
      "dex": 10,
      "con": 12,
      "int": 1,
      "wis": 7,
      "cha": 3
    },
    "summary": "A stubborn small instinct-driven predator. Codex scouts flag it as a minor threat around forest and volcanic.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 2 (1d6 - 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Illumination",
        "description": "The beetle sheds bright light in a 10-foot radius and dim light for an additional 10 ft.."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Volcanic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. | Passive Perception 8",
    "source_desc": "A giant fire beetle is a nocturnal creature that takes its name from a pair of glowing glands that give off light. Miners and adventurers prize these creatures, for a giant fire beetle’s glands continue to shed light for 1d6 days after the beetle dies. Giant fire beetles are most commonly found underground and in dark forests.",
    "image": "/api/images/monsters/giant-fire-beetle.png"
  },
  {
    "id": "giant-frog",
    "name": "Giant Frog",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 18,
    "hit_dice": "4d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 12,
      "dex": 13,
      "con": 11,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage, and the target is grappled (escape DC 11). Until this grapple ends, the target is restrained, and the frog can't bite another target."
      },
      {
        "name": "Swallow",
        "description": "The frog makes one bite attack against a Small or smaller target it is grappling. If the attack hits, the target is swallowed, and the grapple ends. The swallowed target is blinded and restrained, it has total cover against attacks and other effects outside the frog, and it takes 5 (2d4) acid damage at the start of each of the frog's turns. The frog can have only one target swallowed at a time. If the frog dies, a swallowed creature is no longer restrained by it and can escape from the corpse using 5 ft. of movement, exiting prone."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The frog can breathe air and water"
      },
      {
        "name": "Standing Leap",
        "description": "The frog's long jump is up to 20 ft. and its high jump is up to 10 ft., with or without a running start."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/giant-frog.png"
  },
  {
    "id": "giant-goat",
    "name": "Giant Goat",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 17,
      "dex": 11,
      "con": 12,
      "int": 3,
      "wis": 12,
      "cha": 6
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around forest and grassland.",
    "actions": [
      {
        "name": "Ram",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (2d4 + 3) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the goat moves at least 20 ft. straight toward a target and then hits it with a ram attack on the same turn, the target takes an extra 5 (2d4) bludgeoning damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      },
      {
        "name": "Sure-Footed",
        "description": "The goat has advantage on Strength and Dexterity saving throws made against effects that would knock it prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/giant-goat.png"
  },
  {
    "id": "giant-hyena",
    "name": "Giant Hyena",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 45,
    "hit_dice": "6d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 16,
      "dex": 14,
      "con": 14,
      "int": 2,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Rampage",
        "description": "When the hyena reduces a creature to 0 hit points with a melee attack on its turn, the hyena can take a bonus action to move up to half its speed and make a bite attack."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/giant-hyena.png"
  },
  {
    "id": "giant-lizard",
    "name": "Giant Lizard",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 15,
      "dex": 12,
      "con": 13,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Cavern",
      "Frontier"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 10",
    "source_desc": "A giant lizard can be ridden or used as a draft animal. Lizardfolk also keep them as pets, and subterranean giant lizards are used as mounts and pack animals by drow, duergar, and others.",
    "image": "/api/images/monsters/giant-lizard.png"
  },
  {
    "id": "giant-octopus",
    "name": "Giant Octopus",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 52,
    "hit_dice": "8d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 10 ft. | Swim 60 ft.",
    "stats": {
      "str": 17,
      "dex": 13,
      "con": 13,
      "int": 4,
      "wis": 10,
      "cha": 4
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Tentacles",
        "description": "Melee Weapon Attack: +5 to hit, reach 15 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage. If the target is a creature, it is grappled (escape DC 16). Until this grapple ends, the target is restrained, and the octopus can't use its tentacles on another target."
      },
      {
        "name": "Ink Cloud",
        "description": "A 20-foot-radius cloud of ink extends all around the octopus if it is underwater. The area is heavily obscured for 1 minute, although a significant current can disperse the ink. After releasing the ink, the octopus can use the Dash action as a bonus action."
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "While out of water, the octopus can hold its breath for 1 hour."
      },
      {
        "name": "Underwater Camouflage",
        "description": "The octopus has advantage on Dexterity (Stealth) checks made while underwater."
      },
      {
        "name": "Water Breathing",
        "description": "The octopus can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/giant-octopus.png"
  },
  {
    "id": "giant-owl",
    "name": "Giant Owl",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 5 ft. | Fly 60 ft.",
    "stats": {
      "str": 13,
      "dex": 15,
      "con": 12,
      "int": 8,
      "wis": 13,
      "cha": 10
    },
    "summary": "A nimble large instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 8 (2d6 + 1) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Flyby",
        "description": "The owl doesn't provoke opportunity attacks when it flies out of an enemy's reach."
      },
      {
        "name": "Keen Hearing and Sight",
        "description": "The owl has advantage on Wisdom (Perception) checks that rely on hearing or sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "Giant Owl, understands Common, Elvish, and Sylvan but can't speak",
    "senses": "Darkvision 120 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/giant-owl.png"
  },
  {
    "id": "giant-poisonous-snake",
    "name": "Giant Poisonous Snake",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 10,
      "dex": 18,
      "con": 13,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 6 (1d4 + 4) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/giant-poisonous-snake.png"
  },
  {
    "id": "giant-rat",
    "name": "Giant Rat",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 7,
    "hit_dice": "2d6",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 7,
      "dex": 15,
      "con": 11,
      "int": 2,
      "wis": 10,
      "cha": 4
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The rat has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The rat has advantage on an attack roll against a creature if at least one of the rat's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/giant-rat.png"
  },
  {
    "id": "giant-rat-diseased",
    "name": "Giant Rat (Diseased)",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 7,
    "hit_dice": "2d6",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 7,
      "dex": 15,
      "con": 11,
      "int": 2,
      "wis": 10,
      "cha": 4
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 10 Constitution saving throw or contract a disease. Until the disease is cured, the target can't regain hit points except by magical means, and the target's hit point maximum decreases by 3 (1d6) every 24 hours. If the target's hit point maximum drops to 0 as a result of this disease, the target dies."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The rat has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The rat has advantage on an attack roll against a creature if at least one of the rat's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/giant-rat-diseased.png"
  },
  {
    "id": "giant-scorpion",
    "name": "Giant Scorpion",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 52,
    "hit_dice": "7d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 15,
      "dex": 13,
      "con": 15,
      "int": 1,
      "wis": 9,
      "cha": 3
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around forest and grassland.",
    "actions": [
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) bludgeoning damage, and the target is grappled (escape DC 12). The scorpion has two claws, each of which can grapple only one target."
      },
      {
        "name": "Multiattack",
        "description": "The scorpion makes three attacks: two with its claws and one with its sting."
      },
      {
        "name": "Sting",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 7 (1d10 + 2) piercing damage, and the target must make a DC 12 Constitution saving throw, taking 22 (4d10) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland",
      "Desert"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/giant-scorpion.png"
  },
  {
    "id": "giant-sea-horse",
    "name": "Giant Sea Horse",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 16,
    "hit_dice": "3d10",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 0 ft. | Swim 40 ft.",
    "stats": {
      "str": 12,
      "dex": 15,
      "con": 11,
      "int": 2,
      "wis": 12,
      "cha": 5
    },
    "summary": "A nimble large instinct-driven predator. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Ram",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the sea horse moves at least 20 ft. straight toward a target and then hits it with a ram attack on the same turn, the target takes an extra 7 (2d6) bludgeoning damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone."
      },
      {
        "name": "Water Breathing",
        "description": "The sea horse can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 11",
    "source_desc": "Like their smaller kin, giant sea horses are shy, colorful fish with elongated bodies and curled tails. Aquatic elves train them as mounts.",
    "image": "/api/images/monsters/giant-sea-horse.png"
  },
  {
    "id": "giant-shark",
    "name": "Giant Shark",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 126,
    "hit_dice": "11d12",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Swim 50 ft.",
    "stats": {
      "str": 23,
      "dex": 11,
      "con": 21,
      "int": 1,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 22 (3d10 + 6) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Blood Frenzy",
        "description": "The shark has advantage on melee attack rolls against any creature that doesn't have all its hit points."
      },
      {
        "name": "Water Breathing",
        "description": "The shark can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. | Passive Perception 13",
    "source_desc": "A giant shark is 30 feet long and normally found in deep oceans. Utterly fearless, it preys on anything that crosses its path, including whales and ships.",
    "image": "/api/images/monsters/giant-shark.png"
  },
  {
    "id": "giant-spider",
    "name": "Giant Spider",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 26,
    "hit_dice": "4d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 14,
      "dex": 16,
      "con": 12,
      "int": 2,
      "wis": 11,
      "cha": 4
    },
    "summary": "A nimble large instinct-driven predator. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 7 (1d8 + 3) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 9 (2d8) poison damage on a failed save, or half as much damage on a successful one. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
      },
      {
        "name": "Web",
        "description": "Ranged Weapon Attack: +5 to hit, range 30/60 ft., one creature. Hit: The target is restrained by webbing. As an action, the restrained target can make a DC 12 Strength check, bursting the webbing on a success. The webbing can also be attacked and destroyed (AC 10; hp 5; vulnerability to fire damage; immunity to bludgeoning, poison, and psychic damage)."
      }
    ],
    "traits": [
      {
        "name": "Spider Climb",
        "description": "The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Web Sense",
        "description": "While in contact with a web, the spider knows the exact location of any other creature in contact with the same web."
      },
      {
        "name": "Web Walker",
        "description": "The spider ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Cavern",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "To snare its prey, a giant spider spins elaborate webs or shoots sticky strands of webbing from its abdomen. Giant spiders are most commonly found underground, making their lairs on ceilings or in dark, web-filled crevices. Such lairs are often festooned with web cocoons holding past victims.",
    "image": "/api/images/monsters/giant-spider.png"
  },
  {
    "id": "giant-toad",
    "name": "Giant Toad",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 39,
    "hit_dice": "6d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 20 ft. | Swim 40 ft.",
    "stats": {
      "str": 15,
      "dex": 13,
      "con": 13,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage plus 5 (1d10) poison damage, and the target is grappled (escape DC 13). Until this grapple ends, the target is restrained, and the toad can't bite another target."
      },
      {
        "name": "Swallow",
        "description": "The toad makes one bite attack against a Medium or smaller target it is grappling. If the attack hits, the target is swallowed, and the grapple ends. The swallowed target is blinded and restrained, it has total cover against attacks and other effects outside the toad, and it takes 10 (3d6) acid damage at the start of each of the toad's turns. The toad can have only one target swallowed at a time. If the toad dies, a swallowed creature is no longer restrained by it and can escape from the corpse using 5 feet of movement, exiting prone."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The toad can breathe air and water"
      },
      {
        "name": "Standing Leap",
        "description": "The toad's long jump is up to 20 ft. and its high jump is up to 10 ft., with or without a running start."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/giant-toad.png"
  },
  {
    "id": "giant-vulture",
    "name": "Giant Vulture",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 22,
    "hit_dice": "3d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 10 ft. | Fly 60 ft.",
    "stats": {
      "str": 15,
      "dex": 10,
      "con": 15,
      "int": 6,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around cliffs and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The vulture makes two attacks: one with its beak and one with its talons."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage."
      },
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight and Smell",
        "description": "The vulture has advantage on Wisdom (Perception) checks that rely on sight or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The vulture has advantage on an attack roll against a creature if at least one of the vulture's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "understands Common but can't speak",
    "senses": "Passive Perception 13",
    "source_desc": "A giant vulture has advanced intelligence and a malevolent bent. Unlike its smaller kin, it will attack a wounded creature to hasten its end. Giant vultures have been known to haunt a thirsty, starving creature for days to enjoy its suffering.",
    "image": "/api/images/monsters/giant-vulture.png"
  },
  {
    "id": "giant-wasp",
    "name": "Giant Wasp",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 13,
    "hit_dice": "3d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 10 ft. | Fly 50 ft. | Swim 50 ft.",
    "stats": {
      "str": 10,
      "dex": 14,
      "con": 10,
      "int": 1,
      "wis": 10,
      "cha": 3
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Sting",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/giant-wasp.png"
  },
  {
    "id": "giant-weasel",
    "name": "Giant Weasel",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 9,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 11,
      "dex": 16,
      "con": 10,
      "int": 4,
      "wis": 12,
      "cha": 5
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The weasel has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/giant-weasel.png"
  },
  {
    "id": "giant-wolf-spider",
    "name": "Giant Wolf Spider",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 40 ft. | Climb 40 ft.",
    "stats": {
      "str": 12,
      "dex": 16,
      "con": 13,
      "int": 3,
      "wis": 12,
      "cha": 4
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 4 (1d6 + 1) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 7 (2d6) poison damage on a failed save, or half as much damage on a successful one. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
      }
    ],
    "traits": [
      {
        "name": "Spider Climb",
        "description": "The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Web Sense",
        "description": "While in contact with a web, the spider knows the exact location of any other creature in contact with the same web."
      },
      {
        "name": "Web Walker",
        "description": "The spider ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Cavern",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "Smaller than a giant spider, a giant wolf spider hunts prey across open ground or hides in a burrow or crevice, or in a hidden cavity beneath debris.",
    "image": "/api/images/monsters/giant-wolf-spider.png"
  },
  {
    "id": "gibbering-mouther",
    "name": "Gibbering Mouther",
    "size": "Medium",
    "type": "Aberration",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 9,
    "armor_class_text": "9",
    "hit_points": 67,
    "hit_dice": "9d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 10 ft. | Swim 10 ft.",
    "stats": {
      "str": 10,
      "dex": 8,
      "con": 16,
      "int": 3,
      "wis": 10,
      "cha": 6
    },
    "summary": "A stubborn medium reality-warping hunter. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The gibbering mouther makes one bite attack and, if it can, uses its Blinding Spittle."
      },
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 17 (5d6) piercing damage. If the target is Medium or smaller, it must succeed on a DC 10 Strength saving throw or be knocked prone. If the target is killed by this damage, it is absorbed into the mouther."
      },
      {
        "name": "Blinding Spittle",
        "description": "The mouther spits a chemical glob at a point it can see within 15 feet of it. The glob explodes in a blinding flash of light on impact. Each creature within 5 feet of the flash must succeed on a DC 13 Dexterity saving throw or be blinded until the end of the mouther's next turn."
      }
    ],
    "traits": [
      {
        "name": "Aberrant Ground",
        "description": "The ground in a 10-foot radius around the mouther is doughlike difficult terrain. Each creature that starts its turn in that area must succeed on a DC 10 Strength saving throw or have its speed reduced to 0 until the start of its next turn."
      },
      {
        "name": "Gibbering",
        "description": "The mouther babbles incoherently while it can see any creature and isn't incapacitated. Each creature that starts its turn within 20 feet of the mouther and can hear the gibbering must succeed on a DC 10 Wisdom saving throw. On a failure, the creature can't take reactions until the start of its next turn and rolls a d8 to determine what it does during its turn. On a 1 to 4, the creature does nothing. On a 5 or 6, the creature takes no action or bonus action and uses all its movement to move in a randomly determined direction. On a 7 or 8, the creature makes a melee attack against a randomly determined creature within its reach or does nothing if it can't make such an attack."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Underdark"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/gibbering-mouther.png"
  },
  {
    "id": "glabrezu",
    "name": "Glabrezu",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 157,
    "hit_dice": "15d10",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 20,
      "dex": 15,
      "con": 21,
      "int": 19,
      "wis": 17,
      "cha": 16
    },
    "summary": "A stubborn large malicious planar raider with demon traits. Codex scouts flag it as a dangerous threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The glabrezu makes four attacks: two with its pincers and two with its fists. Alternatively, it makes two attacks with its pincers and casts one spell."
      },
      {
        "name": "Pincer",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) bludgeoning damage. If the target is a Medium or smaller creature, it is grappled (escape DC 15). The glabrezu has two pincers, each of which can grapple only one target."
      },
      {
        "name": "Fist",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Innate Spellcasting",
        "description": "The glabrezu's spellcasting ability is Intelligence (spell save DC 16). The glabrezu can innately cast the following spells, requiring no material components: At will: darkness, detect magic, dispel magic 1/day each: confusion, fly, power word stun"
      },
      {
        "name": "Magic Resistance",
        "description": "The glabrezu has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Abyssal, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/glabrezu.png"
  },
  {
    "id": "gladiator",
    "name": "Gladiator",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 16,
    "armor_class_text": "16 (Studded Leather Armor, Shield)",
    "hit_points": 112,
    "hit_dice": "15d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 10,
      "wis": 12,
      "cha": 15
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a dangerous threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The gladiator makes three melee attacks or two ranged attacks."
      },
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +7 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 11 (2d6 + 4) piercing damage, or 13 (2d8 + 4) piercing damage if used with two hands to make a melee attack."
      },
      {
        "name": "Shield Bash",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 9 (2d4 + 4) bludgeoning damage. If the target is a Medium or smaller creature, it must succeed on a DC 15 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Brave",
        "description": "The gladiator has advantage on saving throws against being frightened."
      },
      {
        "name": "Brute",
        "description": "A melee weapon deals one extra die of its damage when the gladiator hits with it (included in the attack)."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 11",
    "source_desc": "Gladiators battle for the entertainment of raucous crowds. Some gladiators are brutal pit fighters who treat each match as a life-or-death struggle, while others are professional duelists who command huge fees but rarely fight to the death.",
    "image": "/api/images/monsters/gladiator.png"
  },
  {
    "id": "gnoll",
    "name": "Gnoll",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Gnoll",
    "alignment": "Chaotic Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Hide Armor, Shield)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 14,
      "dex": 12,
      "con": 11,
      "int": 6,
      "wis": 10,
      "cha": 7
    },
    "summary": "A brutal medium armed opportunist with gnoll traits. Codex scouts flag it as a field threat around frontier and cavern.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 4 (1d4 + 2) piercing damage."
      },
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 5 (1d6 + 2) piercing damage, or 6 (1d8 + 2) piercing damage if used with two hands to make a melee attack."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +3 to hit, range 150/600 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Rampage",
        "description": "When the gnoll reduces a creature to 0 hit points with a melee attack on its turn, the gnoll can take a bonus action to move up to half its speed and make a bite attack."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern"
    ],
    "languages": "Gnoll",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/gnoll.png"
  },
  {
    "id": "goat",
    "name": "Goat",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 4,
    "hit_dice": "1d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 12,
      "dex": 10,
      "con": 11,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Ram",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 1) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the goat moves at least 20 ft. straight toward a target and then hits it with a ram attack on the same turn, the target takes an extra 2 (1d4) bludgeoning damage. If the target is a creature, it must succeed on a DC 10 Strength saving throw or be knocked prone."
      },
      {
        "name": "Sure-Footed",
        "description": "The goat has advantage on Strength and Dexterity saving throws made against effects that would knock it prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/goat.png"
  },
  {
    "id": "goblin",
    "name": "Goblin",
    "size": "Small",
    "type": "Humanoid",
    "subtype": "Goblinoid",
    "alignment": "Neutral Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Leather Armor, Shield)",
    "hit_points": 7,
    "hit_dice": "2d6",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 8,
      "dex": 14,
      "con": 10,
      "int": 10,
      "wis": 8,
      "cha": 8
    },
    "summary": "A nimble small armed opportunist with goblinoid traits. Codex scouts flag it as a minor threat around frontier and cavern.",
    "actions": [
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
      },
      {
        "name": "Shortbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Nimble Escape",
        "description": "The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern",
      "Forest",
      "Grassland"
    ],
    "languages": "Common, Goblin",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/goblin.png"
  },
  {
    "id": "gold-dragon-wyrmling",
    "name": "Gold Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 60,
    "hit_dice": "8d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft. | Fly 60 ft. | Swim 30 ft.",
    "stats": {
      "str": 19,
      "dex": 14,
      "con": 17,
      "int": 14,
      "wis": 11,
      "cha": 16
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (1d10 + 4) piercing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in a 15-foot cone. Each creature in that area must make a DC 13 Dexterity saving throw, taking 22 (4d10) fire damage on a failed save, or half as much damage on a successful one. Weakening Breath. The dragon exhales gas in a 15-foot cone. Each creature in that area must succeed on a DC 13 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/gold-dragon-wyrmling.png"
  },
  {
    "id": "gorgon",
    "name": "Gorgon",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 114,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 20,
      "dex": 11,
      "con": 18,
      "int": 2,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a dangerous threat around wilderness and forest.",
    "actions": [
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 18 (2d12 + 5) piercing damage."
      },
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 16 (2d10 + 5) bludgeoning damage."
      },
      {
        "name": "Petrifying Breath",
        "description": "The gorgon exhales petrifying gas in a 30-foot cone. Each creature in that area must succeed on a DC 13 Constitution saving throw. On a failed save, a target begins to turn to stone and is restrained. The restrained target must repeat the saving throw at the end of its next turn. On a success, the effect ends on the target. On a failure, the target is petrified until freed by the greater restoration spell or other magic."
      }
    ],
    "traits": [
      {
        "name": "Trampling Charge",
        "description": "If the gorgon moves at least 20 feet straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 16 Strength saving throw or be knocked prone. If the target is prone, the gorgon can make one attack with its hooves against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Forest",
      "Grassland",
      "Mountain"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/gorgon.png"
  },
  {
    "id": "gray-ooze",
    "name": "Gray Ooze",
    "size": "Medium",
    "type": "Ooze",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 8,
    "armor_class_text": "8",
    "hit_points": 22,
    "hit_dice": "3d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 10 ft. | Climb 10 ft.",
    "stats": {
      "str": 12,
      "dex": 6,
      "con": 16,
      "int": 1,
      "wis": 6,
      "cha": 2
    },
    "summary": "A stubborn medium dissolving lurker. Codex scouts flag it as a field threat around ruins and sewer.",
    "actions": [
      {
        "name": "Pseudopod",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage plus 7 (2d6) acid damage, and if the target is wearing nonmagical metal armor, its armor is partly corroded and takes a permanent and cumulative -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10."
      }
    ],
    "traits": [
      {
        "name": "Amorphous",
        "description": "The ooze can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        "name": "Corrode Metal",
        "description": "Any nonmagical weapon made of metal that hits the ooze corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical ammunition made of metal that hits the ooze is destroyed after dealing damage. The ooze can eat through 2-inch-thick, nonmagical metal in 1 round."
      },
      {
        "name": "False Appearance",
        "description": "While the ooze remains motionless, it is indistinguishable from an oily pool or wet rock."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Sewer",
      "Dungeon",
      "Cliffs"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/gray-ooze.png"
  },
  {
    "id": "green-dragon-wyrmling",
    "name": "Green Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 38,
    "hit_dice": "7d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Fly 60 ft. | Swim 30 ft.",
    "stats": {
      "str": 15,
      "dex": 12,
      "con": 13,
      "int": 14,
      "wis": 11,
      "cha": 13
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage plus 3 (1d6) poison damage."
      },
      {
        "name": "Poison Breath",
        "description": "The dragon exhales poisonous gas in a 15-foot cone. Each creature in that area must make a DC 11 Constitution saving throw, taking 21 (6d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/green-dragon-wyrmling.png"
  },
  {
    "id": "green-hag",
    "name": "Green Hag",
    "size": "Medium",
    "type": "Fey",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 82,
    "hit_dice": "11d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 12,
      "con": 16,
      "int": 13,
      "wis": 14,
      "cha": 14
    },
    "summary": "A brutal medium wild trickster spirit. Codex scouts flag it as a seasoned threat around forest and grassland.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      },
      {
        "name": "Illusory Appearance",
        "description": "The hag covers herself and anything she is wearing or carrying with a magical illusion that makes her look like another creature of her general size and humanoid shape. The illusion ends if the hag takes a bonus action to end it or if she dies. The changes wrought by this effect fail to hold up to physical inspection. For example, the hag could appear to have smooth skin, but someone touching her would feel her rough flesh. Otherwise, a creature must take an action to visually inspect the illusion and succeed on a DC 20 Intelligence (Investigation) check to discern that the hag is disguised."
      },
      {
        "name": "Invisible Passage",
        "description": "The hag magically turns invisible until she attacks or casts a spell, or until her concentration ends (as if concentrating on a spell). While invisible, she leaves no physical evidence of her passage, so she can be tracked only by magic. Any equipment she wears or carries is invisible with her."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The hag can breathe air and water."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The hag's innate spellcasting ability is Charisma (spell save DC 12). She can innately cast the following spells, requiring no material components: At will: dancing lights, minor illusion, vicious mockery"
      },
      {
        "name": "Mimicry",
        "description": "The hag can mimic animal sounds and humanoid voices. A creature that hears the sounds can tell they are imitations with a successful DC 14 Wisdom (Insight) check."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland",
      "Arctic"
    ],
    "languages": "Common, Draconic, Sylvan",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/green-hag.png"
  },
  {
    "id": "grick",
    "name": "Grick",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 27,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 14,
      "dex": 14,
      "con": 11,
      "int": 3,
      "wis": 14,
      "cha": 5
    },
    "summary": "A brutal medium unnatural apex hunter. Codex scouts flag it as a seasoned threat around ruins and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The grick makes one attack with its tentacles. If that attack hits, the grick can make one beak attack against the same target."
      },
      {
        "name": "Tentacles",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) slashing damage."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Stone Camouflage",
        "description": "The grick has advantage on Dexterity (Stealth) checks made to hide in rocky terrain."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Wilderness",
      "Mountain",
      "Cavern"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/grick.png"
  },
  {
    "id": "griffon",
    "name": "Griffon",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 59,
    "hit_dice": "7d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Fly 80 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 2,
      "wis": 13,
      "cha": 8
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The griffon makes two attacks: one with its beak and one with its claws."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The griffon has advantage on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Highlands"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/griffon.png"
  },
  {
    "id": "grimlock",
    "name": "Grimlock",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Grimlock",
    "alignment": "Neutral Evil",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 12,
      "con": 12,
      "int": 9,
      "wis": 8,
      "cha": 6
    },
    "summary": "A brutal medium armed opportunist with grimlock traits. Codex scouts flag it as a minor threat around frontier and cavern.",
    "actions": [
      {
        "name": "Spiked Bone Club",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) bludgeoning damage plus 2 (1d4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Blind Senses",
        "description": "The grimlock can't use its blindsight while deafened and unable to smell."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The grimlock has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Stone Camouflage",
        "description": "The grimlock has advantage on Dexterity (Stealth) checks made to hide in rocky terrain."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern",
      "Mountain",
      "Cliffs"
    ],
    "languages": "Undercommon",
    "senses": "Blindsight 30 ft. or 10 ft. while deafened (blind beyond this radius) | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/grimlock.png"
  },
  {
    "id": "guard",
    "name": "Guard",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 16,
    "armor_class_text": "16 (Chain Shirt, Shield)",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 13,
      "dex": 12,
      "con": 12,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and urban.",
    "actions": [
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 12",
    "source_desc": "Guards include members of a city watch, sentries in a citadel or fortified town, and the bodyguards of merchants and nobles.",
    "image": "/api/images/monsters/guard.png"
  },
  {
    "id": "guardian-naga",
    "name": "Guardian Naga",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 127,
    "hit_dice": "15d10",
    "challenge_rating": "10",
    "challenge_rating_value": 10,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 19,
      "dex": 18,
      "con": 16,
      "int": 16,
      "wis": 19,
      "cha": 18
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a dangerous threat around wilderness and urban.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one creature. Hit: 8 (1d8 + 4) piercing damage, and the target must make a DC 15 Constitution saving throw, taking 45 (10d8) poison damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "Spit Poison",
        "description": "Ranged Weapon Attack: +8 to hit, range 15/30 ft., one creature. Hit: The target must make a DC 15 Constitution saving throw, taking 45 (10d8) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Rejuvenation",
        "description": "If it dies, the naga returns to life in 1d6 days and regains all its hit points. Only a wish spell can prevent this trait from functioning."
      },
      {
        "name": "Spellcasting",
        "description": "The naga is an 11th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 16, +8 to hit with spell attacks), and it needs only verbal components to cast its spells. It has the following cleric spells prepared: - Cantrips (at will): mending, sacred flame, thaumaturgy - 1st level (4 slots): command, cure wounds, shield of faith - 2nd level (3 slots): calm emotions, hold person - 3rd level (3 slots): bestow curse, clairvoyance - 4th level (3 slots): banishment, freedom of movement - 5th level (2 slots): flame strike, geas - 6th level (1 slot): true seeing"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Urban",
      "Stronghold"
    ],
    "languages": "Celestial, Common",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/guardian-naga.png"
  },
  {
    "id": "gynosphinx",
    "name": "Gynosphinx",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Lawful Neutral",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 136,
    "hit_dice": "16d10",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 40 ft. | Fly 60 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 18,
      "wis": 18,
      "cha": 18
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a deadly threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The sphinx makes two claw attacks."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Inscrutable",
        "description": "The sphinx is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the sphinx's intentions or sincerity have disadvantage."
      },
      {
        "name": "Magic Weapons",
        "description": "The sphinx's weapon attacks are magical."
      },
      {
        "name": "Spellcasting",
        "description": "The sphinx is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 16, +8 to hit with spell attacks). It requires no material components to cast its spells. The sphinx has the following wizard spells prepared: - Cantrips (at will): mage hand, minor illusion, prestidigitation - 1st level (4 slots): detect magic, identify, shield - 2nd level (3 slots): darkness, locate object, suggestion - 3rd level (3 slots): dispel magic, remove curse, tongues - 4th level (3 slots): banishment, greater invisibility - 5th level (1 slot): legend lore"
      }
    ],
    "legendary_actions": [
      {
        "name": "Claw Attack",
        "description": "The sphinx makes one claw attack."
      },
      {
        "name": "Teleport (Costs 2 Actions)",
        "description": "The sphinx magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see."
      },
      {
        "name": "Cast a Spell (Costs 3 Actions)",
        "description": "The sphinx casts a spell from its list of prepared spells, using a spell slot as normal."
      }
    ],
    "environment": [
      "Cliffs",
      "Wilderness"
    ],
    "languages": "Common, Sphinx",
    "senses": "Truesight 120 ft. | Passive Perception 18",
    "source_desc": "",
    "image": "/api/images/monsters/gynosphinx.png"
  },
  {
    "id": "half-red-dragon-veteran",
    "name": "Half-Red Dragon Veteran",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Any Alignment",
    "armor_class": 18,
    "armor_class_text": "18 (Plate Armor)",
    "hit_points": 65,
    "hit_dice": "10d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 13,
      "con": 14,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a dangerous threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The veteran makes two longsword attacks. If it has a shortsword drawn, it can also make a shortsword attack."
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      },
      {
        "name": "Heavy Crossbow",
        "description": "Ranged Weapon Attack: +3 to hit, range 100/400 ft., one target. Hit: 6 (1d10 + 1) piercing damage."
      },
      {
        "name": "Fire Breath",
        "description": "The veteran exhales fire in a 15-foot cone. Each creature in that area must make a DC 15 Dexterity saving throw, taking 24 (7d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Volcanic"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/half-red-dragon-veteran.png"
  },
  {
    "id": "harpy",
    "name": "Harpy",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 38,
    "hit_dice": "7d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 20 ft. | Fly 40 ft.",
    "stats": {
      "str": 12,
      "dex": 13,
      "con": 12,
      "int": 7,
      "wis": 10,
      "cha": 13
    },
    "summary": "A nimble medium unnatural apex hunter. Codex scouts flag it as a field threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The harpy makes two attacks: one with its claws and one with its club."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 6 (2d4 + 1) slashing damage."
      },
      {
        "name": "Club",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 1) bludgeoning damage."
      },
      {
        "name": "Luring Song",
        "description": "The harpy sings a magical melody. Every humanoid and giant within 300 ft. of the harpy that can hear the song must succeed on a DC 11 Wisdom saving throw or be charmed until the song ends. The harpy must take a bonus action on its subsequent turns to continue singing. It can stop singing at any time. The song ends if the harpy is incapacitated. While charmed by the harpy, a target is incapacitated and ignores the songs of other harpies. If the charmed target is more than 5 ft. away from the harpy, the must move on its turn toward the harpy by the most direct route. It doesn't avoid opportunity attacks, but before moving into damaging terrain, such as lava or a pit, and whenever it takes damage from a source other than the harpy, a target can repeat the saving throw. A creature can also repeat the saving throw at the end of each of its turns. If a creature's saving throw is successful, the effect ends on it. A target that successfully saves is immune to this harpy's song for the next 24 hours."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Highlands"
    ],
    "languages": "Common",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/harpy.png"
  },
  {
    "id": "hawk",
    "name": "Hawk",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 10 ft. | Fly 60 ft.",
    "stats": {
      "str": 5,
      "dex": 16,
      "con": 8,
      "int": 2,
      "wis": 14,
      "cha": 6
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 1 slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The hawk has advantage on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/hawk.png"
  },
  {
    "id": "hell-hound",
    "name": "Hell Hound",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 45,
    "hit_dice": "7d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 17,
      "dex": 12,
      "con": 14,
      "int": 6,
      "wis": 13,
      "cha": 6
    },
    "summary": "A brutal medium malicious planar raider. Codex scouts flag it as a seasoned threat around wastes and rift.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 7 (2d6) fire damage."
      },
      {
        "name": "Fire Breath",
        "description": "The hound exhales fire in a 15-foot cone. Each creature in that area must make a DC 12 Dexterity saving throw, taking 21 (6d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The hound has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The hound has advantage on an attack roll against a creature if at least one of the hound's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Volcanic"
    ],
    "languages": "understands Infernal but can't speak it",
    "senses": "Darkvision 60 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/hell-hound.png"
  },
  {
    "id": "hezrou",
    "name": "Hezrou",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 136,
    "hit_dice": "13d10",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 19,
      "dex": 17,
      "con": 20,
      "int": 5,
      "wis": 12,
      "cha": 13
    },
    "summary": "A stubborn large malicious planar raider with demon traits. Codex scouts flag it as a dangerous threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The hezrou makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 15 (2d10 + 4) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The hezrou has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Stench",
        "description": "Any creature that starts its turn within 10 feet of the hezrou must succeed on a DC 14 Constitution saving throw or be poisoned until the start of its next turn. On a successful saving throw, the creature is immune to the hezrou's stench for 24 hours."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift"
    ],
    "languages": "Abyssal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/hezrou.png"
  },
  {
    "id": "hill-giant",
    "name": "Hill Giant",
    "size": "Huge",
    "type": "Giant",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 105,
    "hit_dice": "10d12",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 21,
      "dex": 8,
      "con": 19,
      "int": 5,
      "wis": 9,
      "cha": 6
    },
    "summary": "A brutal huge towering marauder. Codex scouts flag it as a dangerous threat around mountain and cliffs.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The giant makes two greatclub attacks."
      },
      {
        "name": "Greatclub",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 18 (3d8 + 5) bludgeoning damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +8 to hit, range 60/240 ft., one target. Hit: 21 (3d10 + 5) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Cliffs",
      "Highlands"
    ],
    "languages": "Giant",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/hill-giant.png"
  },
  {
    "id": "hippogriff",
    "name": "Hippogriff",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 40 ft. | Fly 60 ft.",
    "stats": {
      "str": 17,
      "dex": 13,
      "con": 13,
      "int": 2,
      "wis": 12,
      "cha": 8
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a field threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The hippogriff makes two attacks: one with its beak and one with its claws."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The hippogriff has advantage on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Highlands"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/hippogriff.png"
  },
  {
    "id": "hobgoblin",
    "name": "Hobgoblin",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Goblinoid",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Chain Mail, Shield)",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 13,
      "dex": 12,
      "con": 12,
      "int": 10,
      "wis": 10,
      "cha": 9
    },
    "summary": "A brutal medium armed opportunist with goblinoid traits. Codex scouts flag it as a field threat around frontier and cavern.",
    "actions": [
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) slashing damage, or 6 (1d10 + 1) slashing damage if used with two hands."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +3 to hit, range 150/600 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Martial Advantage",
        "description": "Once per turn, the hobgoblin can deal an extra 7 (2d6) damage to a creature it hits with a weapon attack if that creature is within 5 ft. of an ally of the hobgoblin that isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern"
    ],
    "languages": "Common, Goblin",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/hobgoblin.png"
  },
  {
    "id": "homunculus",
    "name": "Homunculus",
    "size": "Tiny",
    "type": "Construct",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 5,
    "hit_dice": "2d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft. | Fly 40 ft.",
    "stats": {
      "str": 4,
      "dex": 15,
      "con": 11,
      "int": 10,
      "wis": 10,
      "cha": 7
    },
    "summary": "A nimble tiny forged sentinel. Codex scouts flag it as a minor threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 1 piercing damage, and the target must succeed on a DC 10 Constitution saving throw or be poisoned for 1 minute. If the saving throw fails by 5 or more, the target is instead poisoned for 5 (1d10) minutes and unconscious while poisoned in this way."
      }
    ],
    "traits": [
      {
        "name": "Telepathic Bond",
        "description": "While the homunculus is on the same plane of existence as its master, it can magically convey what it senses to its master, and the two can communicate telepathically."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Ruins",
      "Vault"
    ],
    "languages": "understands the languages of its creator but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/homunculus.png"
  },
  {
    "id": "horned-devil",
    "name": "Horned Devil",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 178,
    "hit_dice": "17d10",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 20 ft. | Fly 60 ft.",
    "stats": {
      "str": 22,
      "dex": 17,
      "con": 21,
      "int": 12,
      "wis": 16,
      "cha": 17
    },
    "summary": "A brutal large malicious planar raider with devil traits. Codex scouts flag it as a deadly threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes three melee attacks: two with its fork and one with its tail. It can use Hurl Flame in place of any melee attack."
      },
      {
        "name": "Fork",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 15 (2d8 + 6) piercing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 10 (1d8 + 6) piercing damage. If the target is a creature other than an undead or a construct, it must succeed on a DC 17 Constitution saving throw or lose 10 (3d6) hit points at the start of each of its turns due to an infernal wound. Each time the devil hits the wounded target with this attack, the damage dealt by the wound increases by 10 (3d6). Any creature can take an action to stanch the wound with a successful DC 12 Wisdom (Medicine) check. The wound also closes if the target receives magical healing."
      },
      {
        "name": "Hurl Flame",
        "description": "Ranged Spell Attack: +7 to hit, range 150 ft., one target. Hit: 14 (4d6) fire damage. If the target is a flammable object that isn't being worn or carried, it also catches fire."
      }
    ],
    "traits": [
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Volcanic"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/horned-devil.png"
  },
  {
    "id": "hunter-shark",
    "name": "Hunter Shark",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 45,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Swim 40 ft.",
    "stats": {
      "str": 18,
      "dex": 13,
      "con": 15,
      "int": 1,
      "wis": 10,
      "cha": 4
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Blood Frenzy",
        "description": "The shark has advantage on melee attack rolls against any creature that doesn't have all its hit points."
      },
      {
        "name": "Water Breathing",
        "description": "The shark can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 12",
    "source_desc": "Smaller than a giant shark but larger and fiercer than a reef shark, a hunter shark haunts deep waters. It usually hunts alone, but multiple hunter sharks might feed in the same area. A fully grown hunter shark is 15 to 20 feet long.",
    "image": "/api/images/monsters/hunter-shark.png"
  },
  {
    "id": "hydra",
    "name": "Hydra",
    "size": "Huge",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 172,
    "hit_dice": "15d12",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 20,
      "dex": 12,
      "con": 20,
      "int": 2,
      "wis": 10,
      "cha": 7
    },
    "summary": "A brutal huge unnatural apex hunter. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The hydra makes as many bite attacks as it has heads."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 10 (1d10 + 5) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "The hydra can hold its breath for 1 hour."
      },
      {
        "name": "Multiple Heads",
        "description": "The hydra has five heads. While it has more than one head, the hydra has advantage on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious. Whenever the hydra takes 25 or more damage in a single turn, one of its heads dies. If all its heads die, the hydra dies. At the end of its turn, it grows two heads for each of its heads that died since its last turn, unless it has taken fire damage since its last turn. The hydra regains 10 hit points for each head regrown in this way."
      },
      {
        "name": "Reactive Heads",
        "description": "For each head the hydra has beyond one, it gets an extra reaction that can be used only for opportunity attacks."
      },
      {
        "name": "Wakeful",
        "description": "While the hydra sleeps, at least one of its heads is awake."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Wilderness",
      "Swamp"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/hydra.png"
  },
  {
    "id": "hyena",
    "name": "Hyena",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 5,
    "hit_dice": "1d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 11,
      "dex": 13,
      "con": 12,
      "int": 2,
      "wis": 12,
      "cha": 5
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 3 (1d6) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The hyena has advantage on an attack roll against a creature if at least one of the hyena's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/hyena.png"
  },
  {
    "id": "ice-devil",
    "name": "Ice Devil",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 180,
    "hit_dice": "19d10",
    "challenge_rating": "14",
    "challenge_rating_value": 14,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 21,
      "dex": 14,
      "con": 18,
      "int": 18,
      "wis": 15,
      "cha": 18
    },
    "summary": "A brutal large malicious planar raider with devil traits. Codex scouts flag it as a deadly threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes three attacks: one with its bite, one with its claws, and one with its tail."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) piercing damage plus 10 (3d6) cold damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 10 (2d4 + 5) slashing damage plus 10 (3d6) cold damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage plus 10 (3d6) cold damage."
      },
      {
        "name": "Wall of Ice",
        "description": "The devil magically forms an opaque wall of ice on a solid surface it can see within 60 feet of it. The wall is 1 foot thick and up to 30 feet long and 10 feet high, or it's a hemispherical dome up to 20 feet in diameter. When the wall appears, each creature in its space is pushed out of it by the shortest route. The creature chooses which side of the wall to end up on, unless the creature is incapacitated. The creature then makes a DC 17 Dexterity saving throw, taking 35 (10d6) cold damage on a failed save, or half as much damage on a successful one. The wall lasts for 1 minute or until the devil is incapacitated or dies. The wall can be damaged and breached; each 10-foot section has AC 5, 30 hit points, vulnerability to fire damage, and immunity to acid, cold, necrotic, poison, and psychic damage. If a section is destroyed, it leaves behind a sheet of frigid air in the space the wall occupied. Whenever a creature finishes moving through the frigid air on a turn, willingly or otherwise, the creature must make a DC 17 Constitution saving throw, taking 17 (5d6) cold damage on a failed save, or half as much damage on a successful one. The frigid air dissipates when the rest of the wall vanishes."
      }
    ],
    "traits": [
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Arctic",
      "Volcanic"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Blindsight 60 ft. | Darkvision 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/ice-devil.png"
  },
  {
    "id": "ice-mephit",
    "name": "Ice Mephit",
    "size": "Small",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 21,
    "hit_dice": "6d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft. | Fly 30 ft.",
    "stats": {
      "str": 7,
      "dex": 13,
      "con": 10,
      "int": 9,
      "wis": 11,
      "cha": 12
    },
    "summary": "A nimble small living force of nature. Codex scouts flag it as a field threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 3 (1d4 + 1) slashing damage plus 2 (1d4) cold damage."
      },
      {
        "name": "Frost Breath",
        "description": "The mephit exhales a 15-foot cone of cold air. Each creature in that area must succeed on a DC 10 Dexterity saving throw, taking 5 (2d4) cold damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Death Burst",
        "description": "When the mephit dies, it explodes in a burst of jagged ice. Each creature within 5 ft. of it must make a DC 10 Dexterity saving throw, taking 4 (1d8) slashing damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "False Appearance",
        "description": "While the mephit remains motionless, it is indistinguishable from an ordinary shard of ice."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The mephit can innately cast fog cloud, requiring no material components. Its innate spellcasting ability is Charisma."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift",
      "Arctic"
    ],
    "languages": "Aquan, Auran",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/ice-mephit.png"
  },
  {
    "id": "imp",
    "name": "Imp",
    "size": "Tiny",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 10,
    "hit_dice": "3d4",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 20 ft. | Fly 40 ft.",
    "stats": {
      "str": 6,
      "dex": 17,
      "con": 13,
      "int": 11,
      "wis": 12,
      "cha": 14
    },
    "summary": "A nimble tiny malicious planar raider with devil traits. Codex scouts flag it as a field threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Sting (Bite in Beast Form)",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage, and the target must make on a DC 11 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "Invisibility",
        "description": "The imp magically turns invisible until it attacks, or until its concentration ends (as if concentrating on a spell). Any equipment the imp wears or carries is invisible with it."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The imp can use its action to polymorph into a beast form that resembles a rat (speed 20 ft.), a raven (20 ft., fly 60 ft.), or a spider (20 ft., climb 20 ft.), or back into its true form. Its statistics are the same in each form, except for the speed changes noted. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the imp's darkvision."
      },
      {
        "name": "Magic Resistance",
        "description": "The imp has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Forest"
    ],
    "languages": "Infernal, Common",
    "senses": "Darkvision 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/imp.png"
  },
  {
    "id": "invisible-stalker",
    "name": "Invisible Stalker",
    "size": "Medium",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 14,
    "armor_class_text": "14",
    "hit_points": 104,
    "hit_dice": "16d8",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 50 ft. | Fly 50 ft. | Hover true",
    "stats": {
      "str": 16,
      "dex": 19,
      "con": 14,
      "int": 10,
      "wis": 15,
      "cha": 11
    },
    "summary": "A nimble medium living force of nature. Codex scouts flag it as a dangerous threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The stalker makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Invisibility",
        "description": "The stalker is invisible."
      },
      {
        "name": "Faultless Tracker",
        "description": "The stalker is given a quarry by its summoner. The stalker knows the direction and distance to its quarry as long as the two of them are on the same plane of existence. The stalker also knows the location of its summoner."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift"
    ],
    "languages": "Auran, understands Common but doesn't speak it",
    "senses": "Darkvision 60 ft. | Passive Perception 18",
    "source_desc": "",
    "image": "/api/images/monsters/invisible-stalker.png"
  },
  {
    "id": "iron-golem",
    "name": "Iron Golem",
    "size": "Large",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 20,
    "armor_class_text": "20 (Natural)",
    "hit_points": 210,
    "hit_dice": "20d10",
    "challenge_rating": "16",
    "challenge_rating_value": 16,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 24,
      "dex": 9,
      "con": 20,
      "int": 3,
      "wis": 11,
      "cha": 1
    },
    "summary": "A brutal large forged sentinel. Codex scouts flag it as a deadly threat around ruins and vault.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The golem makes two melee attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +13 to hit, reach 5 ft., one target. Hit: 20 (3d8 + 7) bludgeoning damage."
      },
      {
        "name": "Sword",
        "description": "Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 23 (3d10 + 7) slashing damage."
      },
      {
        "name": "Poison Breath",
        "description": "The golem exhales poisonous gas in a 15-foot cone. Each creature in that area must make a DC 19 Constitution saving throw, taking 45 (10d8) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Fire Absorption",
        "description": "Whenever the golem is subjected to fire damage, it takes no damage and instead regains a number of hit points equal to the fire damage dealt."
      },
      {
        "name": "Immutable Form",
        "description": "The golem is immune to any spell or effect that would alter its form."
      },
      {
        "name": "Magic Resistance",
        "description": "The golem has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The golem's weapon attacks are magical."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault",
      "Volcanic"
    ],
    "languages": "understands the languages of its creator but can't speak",
    "senses": "Darkvision 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/iron-golem.png"
  },
  {
    "id": "jackal",
    "name": "Jackal",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 3,
    "hit_dice": "1d6",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 8,
      "dex": 15,
      "con": 11,
      "int": 3,
      "wis": 12,
      "cha": 6
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 1 (1d4 - 1) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The jackal has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The jackal has advantage on an attack roll against a creature if at least one of the jackal's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/jackal.png"
  },
  {
    "id": "killer-whale",
    "name": "Killer Whale",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 90,
    "hit_dice": "12d12",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Swim 60 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 13,
      "int": 3,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 21 (5d6 + 4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Echolocation",
        "description": "The whale can't use its blindsight while deafened."
      },
      {
        "name": "Hold Breath",
        "description": "The whale can hold its breath for 30 minutes"
      },
      {
        "name": "Keen Hearing",
        "description": "The whale has advantage on Wisdom (Perception) checks that rely on hearing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/killer-whale.png"
  },
  {
    "id": "knight",
    "name": "Knight",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 18,
    "armor_class_text": "18 (Plate Armor)",
    "hit_points": 52,
    "hit_dice": "8d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 11,
      "con": 14,
      "int": 11,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The knight makes two melee attacks."
      },
      {
        "name": "Greatsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage."
      },
      {
        "name": "Heavy Crossbow",
        "description": "Ranged Weapon Attack: +2 to hit, range 100/400 ft., one target. Hit: 5 (1d10) piercing damage."
      },
      {
        "name": "Leadership",
        "description": "For 1 minute, the knight can utter a special command or warning whenever a nonhostile creature that it can see within 30 ft. of it makes an attack roll or a saving throw. The creature can add a d4 to its roll provided it can hear and understand the knight. A creature can benefit from only one Leadership die at a time. This effect ends if the knight is incapacitated."
      }
    ],
    "traits": [
      {
        "name": "Brave",
        "description": "The knight has advantage on saving throws against being frightened."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Arctic"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 10",
    "source_desc": "Knights are warriors who pledge service to rulers, religious orders, and noble causes. A knight’s alignment determines the extent to which a pledge is honored. Whether undertaking a quest or patrolling a realm, a knight often travels with an entourage that includes squires and hirelings who are commoners.",
    "image": "/api/images/monsters/knight.png"
  },
  {
    "id": "kobold",
    "name": "Kobold",
    "size": "Small",
    "type": "Humanoid",
    "subtype": "Kobold",
    "alignment": "Lawful Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 5,
    "hit_dice": "2d6",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 7,
      "dex": 15,
      "con": 9,
      "int": 8,
      "wis": 7,
      "cha": 8
    },
    "summary": "A nimble small armed opportunist with kobold traits. Codex scouts flag it as a minor threat around frontier and cavern.",
    "actions": [
      {
        "name": "Dagger",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      },
      {
        "name": "Sling",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 4 (1d4 + 2) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the kobold has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      },
      {
        "name": "Pack Tactics",
        "description": "The kobold has advantage on an attack roll against a creature if at least one of the kobold's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern"
    ],
    "languages": "Common, Draconic",
    "senses": "Darkvision 60 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/kobold.png"
  },
  {
    "id": "kraken",
    "name": "Kraken",
    "size": "Gargantuan",
    "type": "Monstrosity",
    "subtype": "Titan",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 472,
    "hit_dice": "27d20",
    "challenge_rating": "23",
    "challenge_rating_value": 23,
    "speed": "Walk 20 ft. | Swim 60 ft.",
    "stats": {
      "str": 30,
      "dex": 11,
      "con": 25,
      "int": 22,
      "wis": 18,
      "cha": 20
    },
    "summary": "A brutal gargantuan unnatural apex hunter with titan traits. Codex scouts flag it as a cataclysmic threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The kraken makes three tentacle attacks, each of which it can replace with one use of Fling."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 23 (3d8 + 10) piercing damage. If the target is a Large or smaller creature grappled by the kraken, that creature is swallowed, and the grapple ends. While swallowed, the creature is blinded and restrained, it has total cover against attacks and other effects outside the kraken, and it takes 42 (12d6) acid damage at the start of each of the kraken's turns. If the kraken takes 50 damage or more on a single turn from a creature inside it, the kraken must succeed on a DC 25 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a space within 10 feet of the kraken. If the kraken dies, a swallowed creature is no longer restrained by it and can escape from the corpse using 15 feet of movement, exiting prone."
      },
      {
        "name": "Tentacle",
        "description": "Melee Weapon Attack: +7 to hit, reach 30 ft., one target. Hit: 20 (3d6 + 10) bludgeoning damage, and the target is grappled (escape DC 18). Until this grapple ends, the target is restrained. The kraken has ten tentacles, each of which can grapple one target."
      },
      {
        "name": "Fling",
        "description": "One Large or smaller object held or creature grappled by the kraken is thrown up to 60 feet in a random direction and knocked prone. If a thrown target strikes a solid surface, the target takes 3 (1d6) bludgeoning damage for every 10 feet it was thrown. If the target is thrown at another creature, that creature must succeed on a DC 18 Dexterity saving throw or take the same damage and be knocked prone."
      },
      {
        "name": "Lightning Storm",
        "description": "The kraken magically creates three bolts of lightning, each of which can strike a target the kraken can see within 120 feet of it. A target must make a DC 23 Dexterity saving throw, taking 22 (4d10) lightning damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The kraken can breathe air and water."
      },
      {
        "name": "Freedom of Movement",
        "description": "The kraken ignores difficult terrain, and magical effects can't reduce its speed or cause it to be restrained. It can spend 5 feet of movement to escape from nonmagical restraints or being grappled."
      },
      {
        "name": "Siege Monster",
        "description": "The kraken deals double damage to objects and structures."
      }
    ],
    "legendary_actions": [
      {
        "name": "Tentacle Attack or Fling",
        "description": "The kraken makes one tentacle attack or uses its Fling."
      },
      {
        "name": "Lightning Storm (Costs 2 Actions)",
        "description": "The kraken uses Lightning Storm."
      },
      {
        "name": "Ink Cloud (Costs 3 Actions)",
        "description": "While underwater, the kraken expels an ink cloud in a 60-foot radius. The cloud spreads around corners, and that area is heavily obscured to creatures other than the kraken. Each creature other than the kraken that ends its turn there must succeed on a DC 23 Constitution saving throw, taking 16 (3d10) poison damage on a failed save, or half as much damage on a successful one. A strong current disperses the cloud, which otherwise disappears at the end of the kraken's next turn."
      }
    ],
    "environment": [
      "Coast",
      "Depths",
      "Wilderness",
      "Forest"
    ],
    "languages": "understands Abyssal, Celestial, Infernal, and Primordial but can't speak, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/kraken.png"
  },
  {
    "id": "lamia",
    "name": "Lamia",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 97,
    "hit_dice": "13d10",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 13,
      "con": 15,
      "int": 14,
      "wis": 15,
      "cha": 16
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around wilderness and desert.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The lamia makes two attacks: one with its claws and one with its dagger or Intoxicating Touch."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 14 (2d10 + 3) slashing damage."
      },
      {
        "name": "Dagger",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage."
      },
      {
        "name": "Intoxicating Touch",
        "description": "Melee Spell Attack: +5 to hit, reach 5 ft., one creature. Hit: The target is magically cursed for 1 hour. Until the curse ends, the target has disadvantage on Wisdom saving throws and all ability checks."
      }
    ],
    "traits": [
      {
        "name": "Innate Spellcasting",
        "description": "The lamia's innate spellcasting ability is Charisma (spell save DC 13). It can innately cast the following spells, requiring no material components. At will: disguise self (any humanoid form), major image 3/day each: charm person, mirror image, scrying, suggestion 1/day: geas"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Desert"
    ],
    "languages": "Abyssal, Common",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/lamia.png"
  },
  {
    "id": "lemure",
    "name": "Lemure",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 7,
    "armor_class_text": "7",
    "hit_points": 13,
    "hit_dice": "3d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 15 ft.",
    "stats": {
      "str": 10,
      "dex": 5,
      "con": 11,
      "int": 1,
      "wis": 11,
      "cha": 3
    },
    "summary": "A stubborn medium malicious planar raider with devil traits. Codex scouts flag it as a minor threat around wastes and rift.",
    "actions": [
      {
        "name": "Fist",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Devil's Sight",
        "description": "Magical darkness doesn't impede the lemure's darkvision."
      },
      {
        "name": "Hellish Rejuvenation",
        "description": "A lemure that dies in the Nine Hells comes back to life with all its hit points in 1d10 days unless it is killed by a good-aligned creature with a bless spell cast on that creature or its remains are sprinkled with holy water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift"
    ],
    "languages": "understands infernal but can't speak",
    "senses": "Darkvision 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/lemure.png"
  },
  {
    "id": "lich",
    "name": "Lich",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Any Evil Alignment",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 135,
    "hit_dice": "18d8",
    "challenge_rating": "21",
    "challenge_rating_value": 21,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 16,
      "con": 16,
      "int": 20,
      "wis": 14,
      "cha": 16
    },
    "summary": "A scheming medium deathless stalker. Codex scouts flag it as a cataclysmic threat around crypt and ruins.",
    "actions": [
      {
        "name": "Paralyzing Touch",
        "description": "Melee Spell Attack: +12 to hit, reach 5 ft., one creature. Hit: 10 (3d6) cold damage. The target must succeed on a DC 18 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the lich fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Rejuvenation",
        "description": "If it has a phylactery, a destroyed lich gains a new body in 1d10 days, regaining all its hit points and becoming active again. The new body appears within 5 feet of the phylactery."
      },
      {
        "name": "Spellcasting",
        "description": "The lich is an 18th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 20, +12 to hit with spell attacks). The lich has the following wizard spells prepared: - Cantrips (at will): mage hand, prestidigitation, ray of frost - 1st level (4 slots): detect magic, magic missile, shield, thunderwave - 2nd level (3 slots): acid arrow, detect thoughts, invisibility, mirror image - 3rd level (3 slots): animate dead, counterspell, dispel magic, fireball - 4th level (3 slots): blight, dimension door - 5th level (3 slots): cloudkill, scrying - 6th level (1 slot): disintegrate, globe of invulnerability - 7th level (1 slot): finger of death, plane shift - 8th level (1 slot): dominate monster, power word stun - 9th level (1 slot): power word kill"
      },
      {
        "name": "Turn Resistance",
        "description": "The lich has advantage on saving throws against any effect that turns undead."
      }
    ],
    "legendary_actions": [
      {
        "name": "Cantrip",
        "description": "The lich casts a cantrip."
      },
      {
        "name": "Paralyzing Touch (Costs 2 Actions)",
        "description": "The lich uses its Paralyzing Touch."
      },
      {
        "name": "Frightening Gaze (Costs 2 Actions)",
        "description": "The lich fixes its gaze on one creature it can see within 10 feet of it. The target must succeed on a DC 18 Wisdom saving throw against this magic or become frightened for 1 minute. The frightened target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a target's saving throw is successful or the effect ends for it, the target is immune to the lich's gaze for the next 24 hours."
      },
      {
        "name": "Disrupt Life (Costs 3 Actions)",
        "description": "Each living creature within 20 feet of the lich must make a DC 18 Constitution saving throw against this magic, taking 21 (6d6) necrotic damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "environment": [
      "Crypt",
      "Ruins",
      "Forest",
      "Grassland"
    ],
    "languages": "Common plus up to five other languages",
    "senses": "Truesight 120 ft. | Passive Perception 19",
    "source_desc": "",
    "image": "/api/images/monsters/lich.png"
  },
  {
    "id": "lion",
    "name": "Lion",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 26,
    "hit_dice": "4d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 13,
      "int": 3,
      "wis": 12,
      "cha": 8
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The lion has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The lion has advantage on an attack roll against a creature if at least one of the lion's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      },
      {
        "name": "Pounce",
        "description": "If the lion moves at least 20 ft. straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 13 Strength saving throw or be knocked prone. If the target is prone, the lion can make one bite attack against it as a bonus action."
      },
      {
        "name": "Running Leap",
        "description": "With a 10-foot running start, the lion can long jump up to 25 ft.."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/lion.png"
  },
  {
    "id": "lizard",
    "name": "Lizard",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 2,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft. | Climb 20 ft.",
    "stats": {
      "str": 2,
      "dex": 11,
      "con": 10,
      "int": 1,
      "wis": 8,
      "cha": 3
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/lizard.png"
  },
  {
    "id": "lizardfolk",
    "name": "Lizardfolk",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Lizardfolk",
    "alignment": "Neutral",
    "armor_class": 13,
    "armor_class_text": "13 (Natural) / 15 (Shield)",
    "hit_points": 22,
    "hit_dice": "4d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 15,
      "dex": 10,
      "con": 13,
      "int": 7,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal medium armed opportunist with lizardfolk traits. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The lizardfolk makes two melee attacks, each one with a different weapon."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Heavy Club",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) bludgeoning damage."
      },
      {
        "name": "Javelin",
        "description": "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Spiked Shield",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "The lizardfolk can hold its breath for 15 minutes."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Frontier",
      "Swamp"
    ],
    "languages": "Draconic",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/lizardfolk.png"
  },
  {
    "id": "mage",
    "name": "Mage",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 12,
    "armor_class_text": "12 / 15 (Spell)",
    "hit_points": 40,
    "hit_dice": "9d8",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 9,
      "dex": 14,
      "con": 11,
      "int": 17,
      "wis": 12,
      "cha": 11
    },
    "summary": "A scheming medium armed opportunist with any race traits. Codex scouts flag it as a dangerous threat around frontier and urban.",
    "actions": [
      {
        "name": "Dagger",
        "description": "Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Spellcasting",
        "description": "The mage is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 14, +6 to hit with spell attacks). The mage has the following wizard spells prepared: - Cantrips (at will): fire bolt, light, mage hand, prestidigitation - 1st level (4 slots): detect magic, mage armor, magic missile, shield - 2nd level (3 slots): misty step, suggestion - 3rd level (3 slots): counterspell, fireball, fly - 4th level (3 slots): greater invisibility, ice storm - 5th level (1 slot): cone of cold"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Arctic"
    ],
    "languages": "any four languages",
    "senses": "Passive Perception 11",
    "source_desc": "Mages spend their lives in the study and practice of magic. Good-aligned mages offer counsel to nobles and others in power, while evil mages dwell in isolated sites to perform unspeakable experiments without interference.",
    "image": "/api/images/monsters/mage.png"
  },
  {
    "id": "magma-mephit",
    "name": "Magma Mephit",
    "size": "Small",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 22,
    "hit_dice": "5d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft. | Fly 30 ft.",
    "stats": {
      "str": 8,
      "dex": 12,
      "con": 12,
      "int": 7,
      "wis": 10,
      "cha": 10
    },
    "summary": "A nimble small living force of nature. Codex scouts flag it as a field threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 3 (1d4 + 1) slashing damage plus 2 (1d4) fire damage."
      },
      {
        "name": "Fire Breath",
        "description": "The mephit exhales a 15-foot cone of fire. Each creature in that area must make a DC 11 Dexterity saving throw, taking 7 (2d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Death Burst",
        "description": "When the mephit dies, it explodes in a burst of lava. Each creature within 5 ft. of it must make a DC 11 Dexterity saving throw, taking 7 (2d6) fire damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "False Appearance",
        "description": "While the mephit remains motionless, it is indistinguishable from an ordinary mound of magma."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The mephit can innately cast heat metal (spell save DC 10), requiring no material components. Its innate spellcasting ability is Charisma."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift",
      "Volcanic"
    ],
    "languages": "Ignan, Terran",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/magma-mephit.png"
  },
  {
    "id": "magmin",
    "name": "Magmin",
    "size": "Small",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Chaotic Neutral",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 9,
    "hit_dice": "2d6",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 7,
      "dex": 15,
      "con": 12,
      "int": 8,
      "wis": 11,
      "cha": 10
    },
    "summary": "A nimble small living force of nature. Codex scouts flag it as a field threat around elemental rift and volcanic.",
    "actions": [
      {
        "name": "Touch",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d6) fire damage. If the target is a creature or a flammable object, it ignites. Until a target takes an action to douse the fire, the target takes 3 (1d6) fire damage at the end of each of its turns."
      }
    ],
    "traits": [
      {
        "name": "Death Burst",
        "description": "When the magmin dies, it explodes in a burst of fire and magma. Each creature within 10 ft. of it must make a DC 11 Dexterity saving throw, taking 7 (2d6) fire damage on a failed save, or half as much damage on a successful one. Flammable objects that aren't being worn or carried in that area are ignited."
      },
      {
        "name": "Ignited Illumination",
        "description": "As a bonus action, the magmin can set itself ablaze or extinguish its flames. While ablaze, the magmin sheds bright light in a 10-foot radius and dim light for an additional 10 ft."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Elemental Rift",
      "Volcanic"
    ],
    "languages": "Ignan",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/magmin.png"
  },
  {
    "id": "mammoth",
    "name": "Mammoth",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 126,
    "hit_dice": "11d12",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 24,
      "dex": 9,
      "con": 21,
      "int": 3,
      "wis": 11,
      "cha": 6
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a dangerous threat around forest and arctic.",
    "actions": [
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 25 (4d8 + 7) piercing damage."
      },
      {
        "name": "Stomp",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one prone creature. Hit: 29 (4d10 + 7) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Trampling Charge",
        "description": "If the mammoth moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 18 Strength saving throw or be knocked prone. If the target is prone, the mammoth can make one stomp attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "A mammoth is an elephantine creature with thick fur and long tusks. Stockier and fiercer than normal elephants, mammoths inhabit a wide range of climes, from subarctic to subtropical.",
    "image": "/api/images/monsters/mammoth.png"
  },
  {
    "id": "manticore",
    "name": "Manticore",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 68,
    "hit_dice": "8d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft. | Fly 50 ft.",
    "stats": {
      "str": 17,
      "dex": 16,
      "con": 17,
      "int": 7,
      "wis": 12,
      "cha": 8
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The manticore makes three attacks: one with its bite and two with its claws or three with its tail spikes."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      },
      {
        "name": "Tail Spike",
        "description": "Ranged Weapon Attack: +5 to hit, range 100/200 ft., one target. Hit: 7 (1d8 + 3) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Tail Spike Regrowth",
        "description": "The manticore has twenty-four tail spikes. Used spikes regrow when the manticore finishes a long rest."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Highlands"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/manticore.png"
  },
  {
    "id": "marilith",
    "name": "Marilith",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 189,
    "hit_dice": "18d10",
    "challenge_rating": "16",
    "challenge_rating_value": 16,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 18,
      "dex": 20,
      "con": 20,
      "int": 18,
      "wis": 16,
      "cha": 20
    },
    "summary": "A nimble large malicious planar raider with demon traits. Codex scouts flag it as a deadly threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The marilith can make seven attacks: six with its longswords and one with its tail."
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one creature. Hit: 15 (2d10 + 4) bludgeoning damage. If the target is Medium or smaller, it is grappled (escape DC 19). Until this grapple ends, the target is restrained, the marilith can automatically hit the target with its tail, and the marilith can't make tail attacks against other targets."
      },
      {
        "name": "Teleport",
        "description": "The marilith magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The marilith has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The marilith's weapon attacks are magical."
      },
      {
        "name": "Reactive",
        "description": "The marilith can take one reaction on every turn in combat."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Abyssal, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/marilith.png"
  },
  {
    "id": "mastiff",
    "name": "Mastiff",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 5,
    "hit_dice": "1d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 13,
      "dex": 14,
      "con": 12,
      "int": 3,
      "wis": 12,
      "cha": 7
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and urban.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The mastiff has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Urban",
      "Stronghold",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "Mastiffs are impressive hounds prized by humanoids for their loyalty and keen senses. Mastiffs can be trained as guard dogs, hunting dogs, and war dogs. Halflings and other Small humanoids ride them as mounts.",
    "image": "/api/images/monsters/mastiff.png"
  },
  {
    "id": "medusa",
    "name": "Medusa",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 127,
    "hit_dice": "17d8",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 15,
      "con": 16,
      "int": 12,
      "wis": 13,
      "cha": 15
    },
    "summary": "A stubborn medium unnatural apex hunter. Codex scouts flag it as a dangerous threat around wilderness and cavern.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The medusa makes either three melee attacks--one with its snake hair and two with its shortsword--or two ranged attacks with its longbow."
      },
      {
        "name": "Snake Hair",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 4 (1d4 + 2) piercing damage plus 14 (4d6) poison damage."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +5 to hit, range 150/600 ft., one target. Hit: 6 (1d8 + 2) piercing damage plus 7 (2d6) poison damage."
      }
    ],
    "traits": [
      {
        "name": "Petrifying Gaze",
        "description": "When a creature that can see the medusa's eyes starts its turn within 30 ft. of the medusa, the medusa can force it to make a DC 14 Constitution saving throw if the medusa isn't incapacitated and can see the creature. If the saving throw fails by 5 or more, the creature is instantly petrified. Otherwise, a creature that fails the save begins to turn to stone and is restrained. The restrained creature must repeat the saving throw at the end of its next turn, becoming petrified on a failure or ending the effect on a success. The petrification lasts until the creature is freed by the greater restoration spell or other magic. Unless surprised, a creature can avert its eyes to avoid the saving throw at the start of its turn. If the creature does so, it can't see the medusa until the start of its next turn, when it can avert its eyes again. If the creature looks at the medusa in the meantime, it must immediately make the save. If the medusa sees itself reflected on a polished surface within 30 ft. of it and in an area of bright light, the medusa is, due to its curse, affected by its own gaze."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Cavern",
      "Frontier",
      "Forest"
    ],
    "languages": "Common",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/medusa.png"
  },
  {
    "id": "merfolk",
    "name": "Merfolk",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Merfolk",
    "alignment": "Neutral",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 10 ft. | Swim 40 ft.",
    "stats": {
      "str": 10,
      "dex": 13,
      "con": 12,
      "int": 11,
      "wis": 11,
      "cha": 12
    },
    "summary": "A nimble medium armed opportunist with merfolk traits. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +2 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 3 (1d6) piercing damage, or 4 (1d8) piercing damage if used with two hands to make a melee attack."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The merfolk can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Frontier"
    ],
    "languages": "Aquan, Common",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/merfolk.png"
  },
  {
    "id": "merrow",
    "name": "Merrow",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 45,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 10 ft. | Swim 40 ft.",
    "stats": {
      "str": 18,
      "dex": 10,
      "con": 15,
      "int": 8,
      "wis": 10,
      "cha": 9
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The merrow makes two attacks: one with its bite and one with its claws or harpoon."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (2d4 + 4) slashing damage."
      },
      {
        "name": "Harpoon",
        "description": "Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 11 (2d6 + 4) piercing damage. If the target is a Huge or smaller creature, it must succeed on a Strength contest against the merrow or be pulled up to 20 feet toward the merrow."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The merrow can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Wilderness"
    ],
    "languages": "Abyssal, Aquan",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/merrow.png"
  },
  {
    "id": "mimic",
    "name": "Mimic",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "Shapechanger",
    "alignment": "Neutral",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 58,
    "hit_dice": "9d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 15 ft.",
    "stats": {
      "str": 17,
      "dex": 12,
      "con": 15,
      "int": 5,
      "wis": 13,
      "cha": 8
    },
    "summary": "A brutal medium unnatural apex hunter with shapechanger traits. Codex scouts flag it as a seasoned threat around wilderness and forest.",
    "actions": [
      {
        "name": "Pseudopod",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage. If the mimic is in object form, the target is subjected to its Adhesive trait."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) acid damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The mimic can use its action to polymorph into an object or back into its true, amorphous form. Its statistics are the same in each form. Any equipment it is wearing or carrying isn 't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Adhesive (Object Form Only)",
        "description": "The mimic adheres to anything that touches it. A Huge or smaller creature adhered to the mimic is also grappled by it (escape DC 13). Ability checks made to escape this grapple have disadvantage."
      },
      {
        "name": "False Appearance (Object Form Only)",
        "description": "While the mimic remains motionless, it is indistinguishable from an ordinary object."
      },
      {
        "name": "Grappler",
        "description": "The mimic has advantage on attack rolls against any creature grappled by it."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/mimic.png"
  },
  {
    "id": "minotaur",
    "name": "Minotaur",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 76,
    "hit_dice": "9d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 18,
      "dex": 11,
      "con": 16,
      "int": 6,
      "wis": 16,
      "cha": 9
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around wilderness.",
    "actions": [
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 17 (2d12 + 4) slashing damage."
      },
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the minotaur moves at least 10 ft. straight toward a target and then hits it with a gore attack on the same turn, the target takes an extra 9 (2d8) piercing damage. If the target is a creature, it must succeed on a DC 14 Strength saving throw or be pushed up to 10 ft. away and knocked prone."
      },
      {
        "name": "Labyrinthine Recall",
        "description": "The minotaur can perfectly recall any path it has traveled."
      },
      {
        "name": "Reckless",
        "description": "At the start of its turn, the minotaur can gain advantage on all melee weapon attack rolls it makes during that turn, but attack rolls against it have advantage until the start of its next turn."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness"
    ],
    "languages": "Abyssal",
    "senses": "Darkvision 60 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/minotaur.png"
  },
  {
    "id": "minotaur-skeleton",
    "name": "Minotaur Skeleton",
    "size": "Large",
    "type": "Undead",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 67,
    "hit_dice": "9d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 18,
      "dex": 11,
      "con": 15,
      "int": 6,
      "wis": 8,
      "cha": 5
    },
    "summary": "A brutal large deathless stalker. Codex scouts flag it as a seasoned threat around crypt and ruins.",
    "actions": [
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 17 (2d12 + 4) slashing damage."
      },
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the skeleton moves at least 10 feet straight toward a target and then hits it with a gore attack on the same turn, the target takes an extra 9 (2d8) piercing damage. If the target is a creature, it must succeed on a DC 14 Strength saving throw or be pushed up to 10 feet away and knocked prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "understands Abyssal but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/minotaur-skeleton.png"
  },
  {
    "id": "mule",
    "name": "Mule",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 14,
      "dex": 10,
      "con": 13,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Beast of Burden",
        "description": "The mule is considered to be a Large animal for the purpose of determining its carrying capacity."
      },
      {
        "name": "Sure-Footed",
        "description": "The mule has advantage on Strength and Dexterity saving throws made against effects that would knock it prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/mule.png"
  },
  {
    "id": "mummy",
    "name": "Mummy",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 58,
    "hit_dice": "9d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 16,
      "dex": 8,
      "con": 15,
      "int": 6,
      "wis": 10,
      "cha": 12
    },
    "summary": "A brutal medium deathless stalker. Codex scouts flag it as a seasoned threat around crypt and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The mummy can use its Dreadful Glare and makes one attack with its rotting fist."
      },
      {
        "name": "Rotting Fist",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage plus 10 (3d6) necrotic damage. If the target is a creature, it must succeed on a DC 12 Constitution saving throw or be cursed with mummy rot. The cursed target can't regain hit points, and its hit point maximum decreases by 10 (3d6) for every 24 hours that elapse. If the curse reduces the target's hit point maximum to 0, the target dies, and its body turns to dust. The curse lasts until removed by the remove curse spell or other magic."
      },
      {
        "name": "Dreadful Glare",
        "description": "The mummy targets one creature it can see within 60 ft. of it. If the target can see the mummy, it must succeed on a DC 11 Wisdom saving throw against this magic or become frightened until the end of the mummy's next turn. If the target fails the saving throw by 5 or more, it is also paralyzed for the same duration. A target that succeeds on the saving throw is immune to the Dreadful Glare of all mummies (but not mummy lords) for the next 24 hours."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins",
      "Forest",
      "Grassland"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/mummy.png"
  },
  {
    "id": "mummy-lord",
    "name": "Mummy Lord",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 97,
    "hit_dice": "13d8",
    "challenge_rating": "15",
    "challenge_rating_value": 15,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 18,
      "dex": 10,
      "con": 17,
      "int": 11,
      "wis": 18,
      "cha": 16
    },
    "summary": "A brutal medium deathless stalker. Codex scouts flag it as a deadly threat around crypt and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The mummy can use its Dreadful Glare and makes one attack with its rotting fist."
      },
      {
        "name": "Rotting Fist",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 14 (3d6 + 4) bludgeoning damage plus 21 (6d6) necrotic damage. If the target is a creature, it must succeed on a DC 16 Constitution saving throw or be cursed with mummy rot. The cursed target can't regain hit points, and its hit point maximum decreases by 10 (3d6) for every 24 hours that elapse. If the curse reduces the target's hit point maximum to 0, the target dies, and its body turns to dust. The curse lasts until removed by the remove curse spell or other magic."
      },
      {
        "name": "Dreadful Glare",
        "description": "The mummy lord targets one creature it can see within 60 feet of it. If the target can see the mummy lord, it must succeed on a DC 16 Wisdom saving throw against this magic or become frightened until the end of the mummy's next turn. If the target fails the saving throw by 5 or more, it is also paralyzed for the same duration. A target that succeeds on the saving throw is immune to the Dreadful Glare of all mummies and mummy lords for the next 24 hours."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The mummy lord has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Rejuvenation",
        "description": "A destroyed mummy lord gains a new body in 24 hours if its heart is intact, regaining all its hit points and becoming active again. The new body appears within 5 feet of the mummy lord's heart."
      },
      {
        "name": "Spellcasting",
        "description": "The mummy lord is a 10th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 17, +9 to hit with spell attacks). The mummy lord has the following cleric spells prepared: - Cantrips (at will): sacred flame, thaumaturgy - 1st level (4 slots): command, guiding bolt, shield of faith - 2nd level (3 slots): hold person, silence, spiritual weapon - 3rd level (3 slots): animate dead, dispel magic - 4th level (3 slots): divination, guardian of faith - 5th level (2 slots): contagion, insect plague - 6th level (1 slot): harm"
      }
    ],
    "legendary_actions": [
      {
        "name": "Attack",
        "description": "The mummy lord makes one attack with its rotting fist or uses its Dreadful Glare."
      },
      {
        "name": "Blinding Dust",
        "description": "Blinding dust and sand swirls magically around the mummy lord. Each creature within 5 feet of the mummy lord must succeed on a DC 16 Constitution saving throw or be blinded until the end of the creature's next turn."
      },
      {
        "name": "Blasphemous Word (Costs 2 Actions)",
        "description": "The mummy lord utters a blasphemous word. Each non-undead creature within 10 feet of the mummy lord that can hear the magical utterance must succeed on a DC 16 Constitution saving throw or be stunned until the end of the mummy lord's next turn."
      },
      {
        "name": "Channel Negative Energy (Costs 2 Actions)",
        "description": "The mummy lord magically unleashes negative energy. Creatures within 60 feet of the mummy lord, including ones behind barriers and around corners, can't regain hit points until the end of the mummy lord's next turn."
      },
      {
        "name": "Whirlwind of Sand (Costs 2 Actions)",
        "description": "The mummy lord magically transforms into a whirlwind of sand, moves up to 60 feet, and reverts to its normal form. While in whirlwind form, the mummy lord is immune to all damage, and it can't be grappled, petrified, knocked prone, restrained, or stunned. Equipment worn or carried by the mummy lord remain in its possession."
      }
    ],
    "environment": [
      "Crypt",
      "Ruins",
      "Urban",
      "Stronghold"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/mummy-lord.png"
  },
  {
    "id": "nalfeshnee",
    "name": "Nalfeshnee",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 184,
    "hit_dice": "16d10",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 20 ft. | Fly 30 ft.",
    "stats": {
      "str": 21,
      "dex": 10,
      "con": 22,
      "int": 19,
      "wis": 12,
      "cha": 15
    },
    "summary": "A stubborn large malicious planar raider with demon traits. Codex scouts flag it as a deadly threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The nalfeshnee uses Horror Nimbus if it can. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 32 (5d10 + 5) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 15 (3d6 + 5) slashing damage."
      },
      {
        "name": "Horror Nimbus",
        "description": "The nalfeshnee magically emits scintillating, multicolored light. Each creature within 15 feet of the nalfeshnee that can see the light must succeed on a DC 15 Wisdom saving throw or be frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the nalfeshnee's Horror Nimbus for the next 24 hours."
      },
      {
        "name": "Teleport",
        "description": "The nalfeshnee magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The nalfeshnee has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift"
    ],
    "languages": "Abyssal, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/nalfeshnee.png"
  },
  {
    "id": "night-hag",
    "name": "Night Hag",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 112,
    "hit_dice": "15d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 16,
      "wis": 14,
      "cha": 16
    },
    "summary": "A brutal medium malicious planar raider. Codex scouts flag it as a dangerous threat around wastes and rift.",
    "actions": [
      {
        "name": "Claws (Hag Form Only)",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      },
      {
        "name": "Change Shape",
        "description": "The hag magically polymorphs into a Small or Medium female humanoid, or back into her true form. Her statistics are the same in each form. Any equipment she is wearing or carrying isn't transformed. She reverts to her true form if she dies."
      },
      {
        "name": "Etherealness",
        "description": "The hag magically enters the Ethereal Plane from the Material Plane, or vice versa. To do so, the hag must have a heartstone in her possession."
      },
      {
        "name": "Nightmare Haunting",
        "description": "While on the Ethereal Plane, the hag magically touches a sleeping humanoid on the Material Plane. A protection from evil and good spell cast on the target prevents this contact, as does a magic circle. As long as the contact persists, the target has dreadful visions. If these visions last for at least 1 hour, the target gains no benefit from its rest, and its hit point maximum is reduced by 5 (1d10). If this effect reduces the target's hit point maximum to 0, the target dies, and if the target was evil, its soul is trapped in the hag's soul bag. The reduction to the target's hit point maximum lasts until removed by the greater restoration spell or similar magic."
      }
    ],
    "traits": [
      {
        "name": "Innate Spellcasting",
        "description": "The hag's innate spellcasting ability is Charisma (spell save DC 14, +6 to hit with spell attacks). She can innately cast the following spells, requiring no material components: At will: detect magic, magic missile 2/day each: plane shift (self only), ray of enfeeblement, sleep"
      },
      {
        "name": "Magic Resistance",
        "description": "The hag has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Night Hag Items",
        "description": "A night hag carries two very rare magic items that she must craft for herself If either object is lost, the night hag will go to great lengths to retrieve it, as creating a new tool takes time and effort. Heartstone: This lustrous black gem allows a night hag to become ethereal while it is in her possession. The touch of a heartstone also cures any disease. Crafting a heartstone takes 30 days. Soul Bag: When an evil humanoid dies as a result of a night hag's Nightmare Haunting, the hag catches the soul in this black sack made of stitched flesh. A soul bag can hold only one evil soul at a time, and only the night hag who crafted the bag can catch a soul with it. Crafting a soul bag takes 7 days and a humanoid sacrifice (whose flesh is used to make the bag)."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Abyssal, Common, Infernal, Primordial",
    "senses": "Darkvision 120 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/night-hag.png"
  },
  {
    "id": "nightmare",
    "name": "Nightmare",
    "size": "Large",
    "type": "Fiend",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 68,
    "hit_dice": "8d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 60 ft. | Fly 90 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 10,
      "wis": 13,
      "cha": 15
    },
    "summary": "A brutal large malicious planar raider. Codex scouts flag it as a seasoned threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage plus 7 (2d6) fire damage."
      },
      {
        "name": "Ethereal Stride",
        "description": "The nightmare and up to three willing creatures within 5 feet of it magically enter the Ethereal Plane from the Material Plane, or vice versa."
      }
    ],
    "traits": [
      {
        "name": "Confer Fire Resistance",
        "description": "The nightmare can grant resistance to fire damage to anyone riding it."
      },
      {
        "name": "Illumination",
        "description": "The nightmare sheds bright light in a 10-foot radius and dim light for an additional 10 feet."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Arctic"
    ],
    "languages": "understands Abyssal, Common, and Infernal but can't speak",
    "senses": "Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/nightmare.png"
  },
  {
    "id": "noble",
    "name": "Noble",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 15,
    "armor_class_text": "15 (Breastplate)",
    "hit_points": 9,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 12,
      "con": 11,
      "int": 12,
      "wis": 14,
      "cha": 16
    },
    "summary": "A commanding medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and urban.",
    "actions": [
      {
        "name": "Rapier",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold"
    ],
    "languages": "any two languages",
    "senses": "Passive Perception 12",
    "source_desc": "**Nobles** wield great authority and influence as members of the upper class, possessing wealth and connections that can make them as powerful as monarchs and generals. A noble often travels in the company of guards, as well as servants who are commoners. The noble’s statistics can also be used to represent **courtiers** who aren’t of noble birth.",
    "image": "/api/images/monsters/noble.png"
  },
  {
    "id": "ochre-jelly",
    "name": "Ochre Jelly",
    "size": "Large",
    "type": "Ooze",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 8,
    "armor_class_text": "8",
    "hit_points": 45,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 10 ft. | Climb 10 ft.",
    "stats": {
      "str": 15,
      "dex": 6,
      "con": 14,
      "int": 2,
      "wis": 6,
      "cha": 1
    },
    "summary": "A brutal large dissolving lurker. Codex scouts flag it as a seasoned threat around ruins and sewer.",
    "actions": [
      {
        "name": "Pseudopod",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) bludgeoning damage plus 3 (1d6) acid damage."
      }
    ],
    "traits": [
      {
        "name": "Amorphous",
        "description": "The jelly can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        "name": "Spider Climb",
        "description": "The jelly can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Sewer",
      "Dungeon",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/ochre-jelly.png"
  },
  {
    "id": "octopus",
    "name": "Octopus",
    "size": "Small",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 3,
    "hit_dice": "1d6",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 5 ft. | Swim 30 ft.",
    "stats": {
      "str": 4,
      "dex": 15,
      "con": 11,
      "int": 3,
      "wis": 10,
      "cha": 4
    },
    "summary": "A nimble small instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Tentacles",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 1 bludgeoning damage, and the target is grappled (escape DC 10). Until this grapple ends, the octopus can't use its tentacles on another target."
      },
      {
        "name": "Ink Cloud",
        "description": "A 5-foot-radius cloud of ink extends all around the octopus if it is underwater. The area is heavily obscured for 1 minute, although a significant current can disperse the ink. After releasing the ink, the octopus can use the Dash action as a bonus action."
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "While out of water, the octopus can hold its breath for 30 minutes."
      },
      {
        "name": "Underwater Camouflage",
        "description": "The octopus has advantage on Dexterity (Stealth) checks made while underwater."
      },
      {
        "name": "Water Breathing",
        "description": "The octopus can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/octopus.png"
  },
  {
    "id": "ogre",
    "name": "Ogre",
    "size": "Large",
    "type": "Giant",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 11,
    "armor_class_text": "11 (Hide Armor)",
    "hit_points": 59,
    "hit_dice": "7d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 19,
      "dex": 8,
      "con": 16,
      "int": 5,
      "wis": 7,
      "cha": 7
    },
    "summary": "A brutal large towering marauder. Codex scouts flag it as a seasoned threat around mountain and cavern.",
    "actions": [
      {
        "name": "Greatclub",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage."
      },
      {
        "name": "Javelin",
        "description": "Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 11 (2d6 + 4) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Cavern",
      "Frontier"
    ],
    "languages": "Common, Giant",
    "senses": "Darkvision 60 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/ogre.png"
  },
  {
    "id": "ogre-zombie",
    "name": "Ogre Zombie",
    "size": "Large",
    "type": "Undead",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 8,
    "armor_class_text": "8",
    "hit_points": 85,
    "hit_dice": "9d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 19,
      "dex": 6,
      "con": 18,
      "int": 3,
      "wis": 6,
      "cha": 5
    },
    "summary": "A brutal large deathless stalker. Codex scouts flag it as a seasoned threat around crypt and ruins.",
    "actions": [
      {
        "name": "Morningstar",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Undead Fortitude",
        "description": "If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5+the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins",
      "Cavern",
      "Frontier"
    ],
    "languages": "understands Common and Giant but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/ogre-zombie.png"
  },
  {
    "id": "oni",
    "name": "Oni",
    "size": "Large",
    "type": "Giant",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Chain Mail)",
    "hit_points": 110,
    "hit_dice": "13d10",
    "challenge_rating": "7",
    "challenge_rating_value": 7,
    "speed": "Walk 30 ft. | Fly 30 ft.",
    "stats": {
      "str": 19,
      "dex": 11,
      "con": 16,
      "int": 14,
      "wis": 12,
      "cha": 15
    },
    "summary": "A brutal large towering marauder. Codex scouts flag it as a dangerous threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The oni makes two attacks, either with its claws or its glaive."
      },
      {
        "name": "Claw (Oni Form Only)",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) slashing damage."
      },
      {
        "name": "Glaive",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) slashing damage, or 9 (1d10 + 4) slashing damage in Small or Medium form."
      },
      {
        "name": "Change Shape",
        "description": "The oni magically polymorphs into a Small or Medium humanoid, into a Large giant, or back into its true form. Other than its size, its statistics are the same in each form. The only equipment that is transformed is its glaive, which shrinks so that it can be wielded in humanoid form. If the oni dies, it reverts to its true form, and its glaive reverts to its normal size."
      }
    ],
    "traits": [
      {
        "name": "Innate Spellcasting",
        "description": "The oni's innate spellcasting ability is Charisma (spell save DC 13). The oni can innately cast the following spells, requiring no material components: At will: darkness, invisibility 1/day each: charm person, cone of cold, gaseous form, sleep"
      },
      {
        "name": "Magic Weapons",
        "description": "The oni's weapon attacks are magical."
      },
      {
        "name": "Regeneration",
        "description": "The oni regains 10 hit points at the start of its turn if it has at least 1 hit point."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Mountain",
      "Forest",
      "Grassland"
    ],
    "languages": "Common, Giant",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/oni.png"
  },
  {
    "id": "orc",
    "name": "Orc",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Orc",
    "alignment": "Chaotic Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Hide Armor)",
    "hit_points": 15,
    "hit_dice": "2d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 12,
      "con": 16,
      "int": 7,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with orc traits. Codex scouts flag it as a field threat around frontier and cavern.",
    "actions": [
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage."
      },
      {
        "name": "Javelin",
        "description": "Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Aggressive",
        "description": "As a bonus action, the orc can move up to its speed toward a hostile creature that it can see."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern"
    ],
    "languages": "Common, Orc",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/orc.png"
  },
  {
    "id": "otyugh",
    "name": "Otyugh",
    "size": "Large",
    "type": "Aberration",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 114,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 11,
      "con": 19,
      "int": 6,
      "wis": 13,
      "cha": 6
    },
    "summary": "A stubborn large reality-warping hunter. Codex scouts flag it as a dangerous threat around underdark and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The otyugh makes three attacks: one with its bite and two with its tentacles."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 12 (2d8 + 3) piercing damage. If the target is a creature, it must succeed on a DC 15 Constitution saving throw against disease or become poisoned until the disease is cured. Every 24 hours that elapse, the target must repeat the saving throw, reducing its hit point maximum by 5 (1d10) on a failure. The disease is cured on a success. The target dies if the disease reduces its hit point maximum to 0. This reduction to the target's hit point maximum lasts until the disease is cured."
      },
      {
        "name": "Tentacle",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage plus 4 (1d8) piercing damage. If the target is Medium or smaller, it is grappled (escape DC 13) and restrained until the grapple ends. The otyugh has two tentacles, each of which can grapple one target."
      },
      {
        "name": "Tentacle Slam",
        "description": "The otyugh slams creatures grappled by it into each other or a solid surface. Each creature must succeed on a DC 14 Constitution saving throw or take 10 (2d6 + 3) bludgeoning damage and be stunned until the end of the otyugh's next turn. On a successful save, the target takes half the bludgeoning damage and isn't stunned."
      }
    ],
    "traits": [
      {
        "name": "Limited Telepathy",
        "description": "The otyugh can magically transmit simple messages and images to any creature within 120 ft. of it that can understand a language. This form of telepathy doesn't allow the receiving creature to telepathically respond."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Underdark",
      "Forest",
      "Grassland"
    ],
    "languages": "Otyugh",
    "senses": "Darkvision 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/otyugh.png"
  },
  {
    "id": "owl",
    "name": "Owl",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 5 ft. | Fly 60 ft.",
    "stats": {
      "str": 3,
      "dex": 13,
      "con": 8,
      "int": 2,
      "wis": 12,
      "cha": 7
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 1 slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Flyby",
        "description": "The owl doesn't provoke opportunity attacks when it flies out of an enemy's reach."
      },
      {
        "name": "Keen Hearing and Sight",
        "description": "The owl has advantage on Wisdom (Perception) checks that rely on hearing or sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 120 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/owl.png"
  },
  {
    "id": "owlbear",
    "name": "Owlbear",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 59,
    "hit_dice": "7d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 20,
      "dex": 12,
      "con": 17,
      "int": 3,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around wilderness and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The owlbear makes two attacks: one with its beak and one with its claws."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 10 (1d10 + 5) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight and Smell",
        "description": "The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/owlbear.png"
  },
  {
    "id": "panther",
    "name": "Panther",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 13,
    "hit_dice": "3d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 50 ft. | Climb 40 ft.",
    "stats": {
      "str": 14,
      "dex": 15,
      "con": 10,
      "int": 3,
      "wis": 14,
      "cha": 7
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The panther has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Pounce",
        "description": "If the panther moves at least 20 ft. straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 12 Strength saving throw or be knocked prone. If the target is prone, the panther can make one bite attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/panther.png"
  },
  {
    "id": "pegasus",
    "name": "Pegasus",
    "size": "Large",
    "type": "Celestial",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 59,
    "hit_dice": "7d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 60 ft. | Fly 90 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 10,
      "wis": 15,
      "cha": 13
    },
    "summary": "A brutal large radiant guardian. Codex scouts flag it as a seasoned threat around cliffs and sanctum.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Sanctum"
    ],
    "languages": "understands Celestial, Common, Elvish, and Sylvan but can't speak",
    "senses": "Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/pegasus.png"
  },
  {
    "id": "phase-spider",
    "name": "Phase Spider",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 32,
    "hit_dice": "5d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft. | Climb 30 ft.",
    "stats": {
      "str": 15,
      "dex": 15,
      "con": 12,
      "int": 6,
      "wis": 10,
      "cha": 6
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around ruins and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 7 (1d10 + 2) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 18 (4d8) poison damage on a failed save, or half as much damage on a successful one. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
      }
    ],
    "traits": [
      {
        "name": "Ethereal Jaunt",
        "description": "As a bonus action, the spider can magically shift from the Material Plane to the Ethereal Plane, or vice versa."
      },
      {
        "name": "Spider Climb",
        "description": "The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Web Walker",
        "description": "The spider ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Wilderness",
      "Forest",
      "Cavern"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "A phase spider possesses the magical ability to phase in and out of the Ethereal Plane. It seems to appear out of nowhere and quickly vanishes after attacking. Its movement on the Ethereal Plane before coming back to the Material Plane makes it seem like it can teleport.",
    "image": "/api/images/monsters/phase-spider.png"
  },
  {
    "id": "pit-fiend",
    "name": "Pit Fiend",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Devil",
    "alignment": "Lawful Evil",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 300,
    "hit_dice": "24d10",
    "challenge_rating": "20",
    "challenge_rating_value": 20,
    "speed": "Walk 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 26,
      "dex": 14,
      "con": 24,
      "int": 22,
      "wis": 18,
      "cha": 24
    },
    "summary": "A brutal large malicious planar raider with devil traits. Codex scouts flag it as a cataclysmic threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The pit fiend makes four attacks: one with its bite, one with its claw, one with its mace, and one with its tail."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 22 (4d6 + 8) piercing damage. The target must succeed on a DC 21 Constitution saving throw or become poisoned. While poisoned in this way, the target can't regain hit points, and it takes 21 (6d6) poison damage at the start of each of its turns. The poisoned target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 17 (2d8 + 8) slashing damage."
      },
      {
        "name": "Mace",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) bludgeoning damage plus 21 (6d6) fire damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 24 (3d10 + 8) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Fear Aura",
        "description": "Any creature hostile to the pit fiend that starts its turn within 20 feet of the pit fiend must make a DC 21 Wisdom saving throw, unless the pit fiend is incapacitated. On a failed save, the creature is frightened until the start of its next turn. If a creature's saving throw is successful, the creature is immune to the pit fiend's Fear Aura for the next 24 hours."
      },
      {
        "name": "Magic Resistance",
        "description": "The pit fiend has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The pit fiend's weapon attacks are magical."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The pit fiend's spellcasting ability is Charisma (spell save DC 21). The pit fiend can innately cast the following spells, requiring no material components: At will: detect magic, fireball 3/day each: hold monster, wall of fire"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Volcanic"
    ],
    "languages": "Infernal, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/pit-fiend.png"
  },
  {
    "id": "planetar",
    "name": "Planetar",
    "size": "Large",
    "type": "Celestial",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 200,
    "hit_dice": "16d10",
    "challenge_rating": "16",
    "challenge_rating_value": 16,
    "speed": "Walk 40 ft. | Fly 120 ft.",
    "stats": {
      "str": 24,
      "dex": 20,
      "con": 24,
      "int": 19,
      "wis": 22,
      "cha": 25
    },
    "summary": "A commanding large radiant guardian. Codex scouts flag it as a deadly threat around cliffs and sanctum.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The planetar makes two melee attacks."
      },
      {
        "name": "Greatsword",
        "description": "Melee Weapon Attack: +12 to hit, reach 5 ft., one target. Hit: 21 (4d6 + 7) slashing damage plus 22 (5d8) radiant damage."
      },
      {
        "name": "Healing Touch",
        "description": "The planetar touches another creature. The target magically regains 30 (6d8 + 3) hit points and is freed from any curse, disease, poison, blindness, or deafness."
      }
    ],
    "traits": [
      {
        "name": "Angelic Weapons",
        "description": "The planetar's weapon attacks are magical. When the planetar hits with any weapon, the weapon deals an extra 5d8 radiant damage (included in the attack)."
      },
      {
        "name": "Divine Awareness",
        "description": "The planetar knows if it hears a lie."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The planetar's spellcasting ability is Charisma (spell save DC 20). The planetar can innately cast the following spells, requiring no material components: At will: detect evil and good, invisibility (self only) 3/day each: blade barrier, dispel evil and good, flame strike, raise dead 1/day each: commune, control weather, insect plague"
      },
      {
        "name": "Magic Resistance",
        "description": "The planetar has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Sanctum"
    ],
    "languages": "all, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 21",
    "source_desc": "",
    "image": "/api/images/monsters/planetar.png"
  },
  {
    "id": "plesiosaurus",
    "name": "Plesiosaurus",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 68,
    "hit_dice": "8d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 20 ft. | Swim 40 ft.",
    "stats": {
      "str": 18,
      "dex": 15,
      "con": 16,
      "int": 2,
      "wis": 12,
      "cha": 5
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 14 (3d6 + 4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Hold Breath",
        "description": "The plesiosaurus can hold its breath for 1 hour."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/plesiosaurus.png"
  },
  {
    "id": "poisonous-snake",
    "name": "Poisonous Snake",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 2,
    "hit_dice": "1d4",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 2,
      "dex": 16,
      "con": 11,
      "int": 1,
      "wis": 10,
      "cha": 3
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 1 piercing damage, and the target must make a DC 10 Constitution saving throw, taking 5 (2d4) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/poisonous-snake.png"
  },
  {
    "id": "polar-bear",
    "name": "Polar Bear",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 42,
    "hit_dice": "5d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 40 ft. | Swim 30 ft.",
    "stats": {
      "str": 20,
      "dex": 10,
      "con": 16,
      "int": 2,
      "wis": 13,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The bear makes two attacks: one with its bite and one with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 9 (1d8 + 5) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The bear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/polar-bear.png"
  },
  {
    "id": "pony",
    "name": "Pony",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 15,
      "dex": 10,
      "con": 13,
      "int": 2,
      "wis": 11,
      "cha": 7
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/pony.png"
  },
  {
    "id": "priest",
    "name": "Priest",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 13,
    "armor_class_text": "13 (Chain Shirt)",
    "hit_points": 27,
    "hit_dice": "5d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 25 ft.",
    "stats": {
      "str": 10,
      "dex": 10,
      "con": 12,
      "int": 13,
      "wis": 16,
      "cha": 13
    },
    "summary": "A watchful medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and urban.",
    "actions": [
      {
        "name": "Mace",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 3 (1d6) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Divine Eminence",
        "description": "As a bonus action, the priest can expend a spell slot to cause its melee weapon attacks to magically deal an extra 10 (3d6) radiant damage to a target on a hit. This benefit lasts until the end of the turn. If the priest expends a spell slot of 2nd level or higher, the extra damage increases by 1d6 for each level above 1st."
      },
      {
        "name": "Spellcasting",
        "description": "The priest is a 5th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 13, +5 to hit with spell attacks). The priest has the following cleric spells prepared: - Cantrips (at will): light, sacred flame, thaumaturgy - 1st level (4 slots): cure wounds, guiding bolt, sanctuary - 2nd level (3 slots): lesser restoration, spiritual weapon - 3rd level (2 slots): dispel magic, spirit guardians"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Crypt"
    ],
    "languages": "any two languages",
    "senses": "Passive Perception 13",
    "source_desc": "Priests bring the teachings of their gods to the common folk. They are the spiritual leaders of temples and shrines and often hold positions of influence in their communities. Evil priests might work openly under a tyrant, or they might be the leaders of religious sects hidden in the shadows of good society, overseeing depraved rites. A priest typically has one or more acolytes to help with religious ceremonies and other sacred duties.",
    "image": "/api/images/monsters/priest.png"
  },
  {
    "id": "pseudodragon",
    "name": "Pseudodragon",
    "size": "Tiny",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Neutral Good",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 7,
    "hit_dice": "2d4",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 15 ft. | Fly 60 ft.",
    "stats": {
      "str": 6,
      "dex": 15,
      "con": 13,
      "int": 10,
      "wis": 12,
      "cha": 10
    },
    "summary": "A nimble tiny scaled tyrant. Codex scouts flag it as a minor threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      },
      {
        "name": "Sting",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 4 (1d4 + 2) piercing damage, and the target must succeed on a DC 11 Constitution saving throw or become poisoned for 1 hour. If the saving throw fails by 5 or more, the target falls unconscious for the same duration, or until it takes damage or another creature uses an action to shake it awake."
      }
    ],
    "traits": [
      {
        "name": "Keen Senses",
        "description": "The pseudodragon has advantage on Wisdom (Perception) checks that rely on sight, hearing, or smell."
      },
      {
        "name": "Magic Resistance",
        "description": "The pseudodragon has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Limited Telepathy",
        "description": "The pseudodragon can magically communicate simple ideas, emotions, and images telepathically with any creature within 100 ft. of it that can understand a language."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Mountain",
      "Wilderness",
      "Forest"
    ],
    "languages": "understands Common and Draconic but can't speak",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/pseudodragon.png"
  },
  {
    "id": "purple-worm",
    "name": "Purple Worm",
    "size": "Gargantuan",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 247,
    "hit_dice": "15d20",
    "challenge_rating": "15",
    "challenge_rating_value": 15,
    "speed": "Walk 50 ft. | Burrow 30 ft.",
    "stats": {
      "str": 28,
      "dex": 7,
      "con": 22,
      "int": 1,
      "wis": 8,
      "cha": 4
    },
    "summary": "A brutal gargantuan unnatural apex hunter. Codex scouts flag it as a deadly threat around badlands and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The worm makes two attacks: one with its bite and one with its stinger."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 22 (3d8 + 9) piercing damage. If the target is a Large or smaller creature, it must succeed on a DC 19 Dexterity saving throw or be swallowed by the worm. A swallowed creature is blinded and restrained, it has total cover against attacks and other effects outside the worm, and it takes 21 (6d6) acid damage at the start of each of the worm's turns. If the worm takes 30 damage or more on a single turn from a creature inside it, the worm must succeed on a DC 21 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a space within 10 feet of the worm. If the worm dies, a swallowed creature is no longer restrained by it and can escape from the corpse by using 20 feet of movement, exiting prone."
      },
      {
        "name": "Tail Stinger",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one creature. Hit: 19 (3d6 + 9) piercing damage, and the target must make a DC 19 Constitution saving throw, taking 42 (12d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Tunneler",
        "description": "The worm can burrow through solid rock at half its burrow speed and leaves a 10-foot-diameter tunnel in its wake."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. | Tremorsense 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/purple-worm.png"
  },
  {
    "id": "quasit",
    "name": "Quasit",
    "size": "Tiny",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 7,
    "hit_dice": "3d4",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 5,
      "dex": 17,
      "con": 10,
      "int": 7,
      "wis": 10,
      "cha": 10
    },
    "summary": "A nimble tiny malicious planar raider with demon traits. Codex scouts flag it as a field threat around wastes and rift.",
    "actions": [
      {
        "name": "Claw (Bite in Beast Form)",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage, and the target must succeed on a DC 10 Constitution saving throw or take 5 (2d4) poison damage and become poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        "name": "Scare",
        "description": "One creature of the quasit's choice within 20 ft. of it must succeed on a DC 10 Wisdom saving throw or be frightened for 1 minute. The target can repeat the saving throw at the end of each of its turns, with disadvantage if the quasit is within line of sight, ending the effect on itself on a success."
      },
      {
        "name": "Invisibility",
        "description": "The quasit magically turns invisible until it attacks or uses Scare, or until its concentration ends (as if concentrating on a spell). Any equipment the quasit wears or carries is invisible with it."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The quasit can use its action to polymorph into a beast form that resembles a bat (speed 10 ft. fly 40 ft.), a centipede (40 ft., climb 40 ft.), or a toad (40 ft., swim 40 ft.), or back into its true form . Its statistics are the same in each form, except for the speed changes noted. Any equipment it is wearing or carrying isn't transformed . It reverts to its true form if it dies."
      },
      {
        "name": "Magic Resistance",
        "description": "The quasit has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift",
      "Forest",
      "Grassland"
    ],
    "languages": "Abyssal, Common",
    "senses": "Darkvision 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/quasit.png"
  },
  {
    "id": "quipper",
    "name": "Quipper",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Swim 40 ft.",
    "stats": {
      "str": 2,
      "dex": 16,
      "con": 9,
      "int": 1,
      "wis": 7,
      "cha": 2
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 1 piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Blood Frenzy",
        "description": "The quipper has advantage on melee attack rolls against any creature that doesn't have all its hit points."
      },
      {
        "name": "Water Breathing",
        "description": "The quipper can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 8",
    "source_desc": "A quipper is a carnivorous fish with sharp teeth. Quippers can adapt to any aquatic environment, including cold subterranean lakes. They frequently gather in swarms; the statistics for a swarm of quippers appear later in this appendix.",
    "image": "/api/images/monsters/quipper.png"
  },
  {
    "id": "rakshasa",
    "name": "Rakshasa",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 110,
    "hit_dice": "13d8",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 14,
      "dex": 17,
      "con": 18,
      "int": 13,
      "wis": 16,
      "cha": 20
    },
    "summary": "A commanding medium malicious planar raider. Codex scouts flag it as a deadly threat around wastes and rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The rakshasa makes two claw attacks"
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) slashing damage, and the target is cursed if it is a creature. The magical curse takes effect whenever the target takes a short or long rest, filling the target's thoughts with horrible images and dreams. The cursed target gains no benefit from finishing a short or long rest. The curse lasts until it is lifted by a remove curse spell or similar magic."
      }
    ],
    "traits": [
      {
        "name": "Limited Magic Immunity",
        "description": "The rakshasa can't be affected or detected by spells of 6th level or lower unless it wishes to be. It has advantage on saving throws against all other spells and magical effects."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The rakshasa's innate spellcasting ability is Charisma (spell save DC 18, +10 to hit with spell attacks). The rakshasa can innately cast the following spells, requiring no material components: At will: detect thoughts, disguise self, mage hand, minor illusion 3/day each: charm person, detect magic, invisibility, major image, suggestion 1/day each: dominate person, fly, plane shift, true seeing"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wastes",
      "Rift"
    ],
    "languages": "Common, Infernal",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/rakshasa.png"
  },
  {
    "id": "rat",
    "name": "Rat",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 2,
      "dex": 11,
      "con": 9,
      "int": 2,
      "wis": 10,
      "cha": 4
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The rat has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/rat.png"
  },
  {
    "id": "raven",
    "name": "Raven",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 10 ft. | Fly 50 ft.",
    "stats": {
      "str": 2,
      "dex": 14,
      "con": 8,
      "int": 2,
      "wis": 12,
      "cha": 6
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 1 piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Mimicry",
        "description": "The raven can mimic simple sounds it has heard, such as a person whispering, a baby crying, or an animal chittering. A creature that hears the sounds can tell they are imitations with a successful DC 10 Wisdom (Insight) check."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/raven.png"
  },
  {
    "id": "red-dragon-wyrmling",
    "name": "Red Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 75,
    "hit_dice": "10d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft. | Climb 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 17,
      "int": 12,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (1d10 + 4) piercing damage plus 3 (1d6) fire damage."
      },
      {
        "name": "Fire Breath",
        "description": "The dragon exhales fire in a 15-foot cone. Each creature in that area must make a DC 13 Dexterity saving throw, taking 24 (7d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/red-dragon-wyrmling.png"
  },
  {
    "id": "reef-shark",
    "name": "Reef Shark",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "4d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Swim 40 ft.",
    "stats": {
      "str": 14,
      "dex": 13,
      "con": 13,
      "int": 1,
      "wis": 10,
      "cha": 4
    },
    "summary": "A brutal medium instinct-driven predator. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The shark has advantage on an attack roll against a creature if at least one of the shark's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      },
      {
        "name": "Water Breathing",
        "description": "The shark can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. | Passive Perception 12",
    "source_desc": "Smaller than giant sharks and hunter sharks, reef sharks inhabit shallow waters and coral reefs, gathering in small packs to hunt. A full-grown specimen measures 6 to 10 feet long.",
    "image": "/api/images/monsters/reef-shark.png"
  },
  {
    "id": "remorhaz",
    "name": "Remorhaz",
    "size": "Huge",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 195,
    "hit_dice": "17d12",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 30 ft. | Burrow 20 ft.",
    "stats": {
      "str": 24,
      "dex": 13,
      "con": 21,
      "int": 4,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal huge unnatural apex hunter. Codex scouts flag it as a deadly threat around badlands and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 40 (6d10 + 7) piercing damage plus 10 (3d6) fire damage. If the target is a creature, it is grappled (escape DC 17). Until this grapple ends, the target is restrained, and the remorhaz can't bite another target."
      },
      {
        "name": "Swallow",
        "description": "The remorhaz makes one bite attack against a Medium or smaller creature it is grappling. If the attack hits, that creature takes the bite's damage and is swallowed, and the grapple ends. While swallowed, the creature is blinded and restrained, it has total cover against attacks and other effects outside the remorhaz, and it takes 21 (6d6) acid damage at the start of each of the remorhaz's turns. If the remorhaz takes 30 damage or more on a single turn from a creature inside it, the remorhaz must succeed on a DC 15 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a space within 10 feet of the remorhaz. If the remorhaz dies, a swallowed creature is no longer restrained by it and can escape from the corpse using 15 feet of movement, exiting prone."
      }
    ],
    "traits": [
      {
        "name": "Heated Body",
        "description": "A creature that touches the remorhaz or hits it with a melee attack while within 5 feet of it takes 10 (3d6) fire damage."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Tremorsense 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/remorhaz.png"
  },
  {
    "id": "rhinoceros",
    "name": "Rhinoceros",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 45,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 21,
      "dex": 8,
      "con": 15,
      "int": 2,
      "wis": 12,
      "cha": 6
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around forest and wilderness.",
    "actions": [
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the rhinoceros moves at least 20 ft. straight toward a target and then hits it with a gore attack on the same turn, the target takes an extra 9 (2d8) bludgeoning damage. If the target is a creature, it must succeed on a DC 15 Strength saving throw or be knocked prone."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/rhinoceros.png"
  },
  {
    "id": "riding-horse",
    "name": "Riding Horse",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 13,
    "hit_dice": "2d10",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 60 ft.",
    "stats": {
      "str": 16,
      "dex": 10,
      "con": 12,
      "int": 2,
      "wis": 11,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (2d4 + 3) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/riding-horse.png"
  },
  {
    "id": "roc",
    "name": "Roc",
    "size": "Gargantuan",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 248,
    "hit_dice": "16d20",
    "challenge_rating": "11",
    "challenge_rating_value": 11,
    "speed": "Walk 20 ft. | Fly 120 ft.",
    "stats": {
      "str": 28,
      "dex": 10,
      "con": 20,
      "int": 3,
      "wis": 10,
      "cha": 9
    },
    "summary": "A brutal gargantuan unnatural apex hunter. Codex scouts flag it as a deadly threat around cliffs and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The roc makes two attacks: one with its beak and one with its talons."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 27 (4d8 + 9) piercing damage."
      },
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +13 to hit, reach 5 ft., one target. Hit: 23 (4d6 + 9) slashing damage, and the target is grappled (escape DC 19). Until this grapple ends, the target is restrained, and the roc can't use its talons on another target."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight",
        "description": "The roc has advantage on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wilderness",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/roc.png"
  },
  {
    "id": "roper",
    "name": "Roper",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 20,
    "armor_class_text": "20 (Natural)",
    "hit_points": 93,
    "hit_dice": "11d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 10 ft. | Climb 10 ft.",
    "stats": {
      "str": 18,
      "dex": 8,
      "con": 17,
      "int": 7,
      "wis": 16,
      "cha": 6
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a dangerous threat around ruins and wilderness.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The roper makes four attacks with its tendrils, uses Reel, and makes one attack with its bite."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 22 (4d8 + 4) piercing damage."
      },
      {
        "name": "Tendril",
        "description": "Melee Weapon Attack: +7 to hit, reach 50 ft., one creature. Hit: The target is grappled (escape DC 15). Until the grapple ends, the target is restrained and has disadvantage on Strength checks and Strength saving throws, and the roper can't use the same tendril on another target."
      },
      {
        "name": "Reel",
        "description": "The roper pulls each creature grappled by it up to 25 ft. straight toward it."
      }
    ],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the roper remains motionless, it is indistinguishable from a normal cave formation, such as a stalagmite."
      },
      {
        "name": "Grasping Tendrils",
        "description": "The roper can have up to six tendrils at a time. Each tendril can be attacked (AC 20; 10 hit points; immunity to poison and psychic damage). Destroying a tendril deals no damage to the roper, which can extrude a replacement tendril on its next turn. A tendril can also be broken if a creature takes an action and succeeds on a DC 15 Strength check against it."
      },
      {
        "name": "Spider Climb",
        "description": "The roper can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Wilderness",
      "Forest",
      "Cavern"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/roper.png"
  },
  {
    "id": "rug-of-smothering",
    "name": "Rug of Smothering",
    "size": "Large",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 33,
    "hit_dice": "6d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 10 ft.",
    "stats": {
      "str": 17,
      "dex": 14,
      "con": 10,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "summary": "A brutal large forged sentinel. Codex scouts flag it as a seasoned threat around ruins and vault.",
    "actions": [
      {
        "name": "Smother",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one Medium or smaller creature. Hit: The creature is grappled (escape DC 13). Until this grapple ends, the target is restrained, blinded, and at risk of suffocating, and the rug can't smother another target. In addition, at the start of each of the target's turns, the target takes 10 (2d6 + 3) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Antimagic Susceptibility",
        "description": "The rug is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the rug must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute."
      },
      {
        "name": "Damage Transfer",
        "description": "While it is grappling a creature, the rug takes only half the damage dealt to it, and the creature grappled by the rug takes the other half."
      },
      {
        "name": "False Appearance",
        "description": "While the rug remains motionless, it is indistinguishable from a normal rug."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 6",
    "source_desc": "",
    "image": "/api/images/monsters/rug-of-smothering.png"
  },
  {
    "id": "rust-monster",
    "name": "Rust Monster",
    "size": "Medium",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 27,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 13,
      "dex": 12,
      "con": 13,
      "int": 2,
      "wis": 13,
      "cha": 6
    },
    "summary": "A brutal medium unnatural apex hunter. Codex scouts flag it as a field threat around wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      },
      {
        "name": "Antennae",
        "description": "The rust monster corrodes a nonmagical ferrous metal object it can see within 5 feet of it. If the object isn't being worn or carried, the touch destroys a 1-foot cube of it. If the object is being worn or carried by a creature, the creature can make a DC 11 Dexterity saving throw to avoid the rust monster's touch. If the object touched is either metal armor or a metal shield being worn or carried, its takes a permanent and cumulative -1 penalty to the AC it offers. Armor reduced to an AC of 10 or a shield that drops to a +0 bonus is destroyed. If the object touched is a held metal weapon, it rusts as described in the Rust Metal trait."
      }
    ],
    "traits": [
      {
        "name": "Iron Scent",
        "description": "The rust monster can pinpoint, by scent, the location of ferrous metal within 30 feet of it."
      },
      {
        "name": "Rust Metal",
        "description": "Any nonmagical weapon made of metal that hits the rust monster corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical ammunition made of metal that hits the rust monster is destroyed after dealing damage."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/rust-monster.png"
  },
  {
    "id": "saber-toothed-tiger",
    "name": "Saber-Toothed Tiger",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 52,
    "hit_dice": "7d10",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 18,
      "dex": 14,
      "con": 15,
      "int": 3,
      "wis": 12,
      "cha": 8
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a seasoned threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (1d10 + 5) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The tiger has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Pounce",
        "description": "If the tiger moves at least 20 ft. straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 14 Strength saving throw or be knocked prone. If the target is prone, the tiger can make one bite attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/saber-toothed-tiger.png"
  },
  {
    "id": "sahuagin",
    "name": "Sahuagin",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Sahuagin",
    "alignment": "Lawful Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "4d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft. | Swim 40 ft.",
    "stats": {
      "str": 13,
      "dex": 11,
      "con": 12,
      "int": 12,
      "wis": 13,
      "cha": 9
    },
    "summary": "A brutal medium armed opportunist with sahuagin traits. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The sahuagin makes two melee attacks: one with its bite and one with its claws or spear."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 1) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 1) slashing damage."
      },
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage, or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack."
      }
    ],
    "traits": [
      {
        "name": "Blood Frenzy",
        "description": "The sahuagin has advantage on melee attack rolls against any creature that doesn't have all its hit points."
      },
      {
        "name": "Limited Amphibiousness",
        "description": "The sahuagin can breathe air and water, but it needs to be submerged at least once every 4 hours to avoid suffocating."
      },
      {
        "name": "Shark Telepathy",
        "description": "The sahuagin can magically command any shark within 120 feet of it, using a limited telepathy."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Frontier"
    ],
    "languages": "Sahuagin",
    "senses": "Darkvision 120 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/sahuagin.png"
  },
  {
    "id": "salamander",
    "name": "Salamander",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 90,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 14,
      "con": 15,
      "int": 11,
      "wis": 10,
      "cha": 12
    },
    "summary": "A brutal large living force of nature. Codex scouts flag it as a dangerous threat around elemental rift and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The salamander makes two attacks: one with its spear and one with its tail."
      },
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +7 to hit, reach 5 ft. or range 20 ft./60 ft., one target. Hit: 11 (2d6 + 4) piercing damage, or 13 (2d8 + 4) piercing damage if used with two hands to make a melee attack, plus 3 (1d6) fire damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage plus 7 (2d6) fire damage, and the target is grappled (escape DC 14). Until this grapple ends, the target is restrained, the salamander can automatically hit the target with its tail, and the salamander can't make tail attacks against other targets."
      }
    ],
    "traits": [
      {
        "name": "Heated Body",
        "description": "A creature that touches the salamander or hits it with a melee attack while within 5 ft. of it takes 7 (2d6) fire damage."
      },
      {
        "name": "Heated Weapons",
        "description": "Any metal melee weapon the salamander wields deals an extra 3 (1d6) fire damage on a hit (included in the attack)."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Elemental Rift",
      "Forest",
      "Grassland",
      "Volcanic"
    ],
    "languages": "Ignan",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/salamander.png"
  },
  {
    "id": "satyr",
    "name": "Satyr",
    "size": "Medium",
    "type": "Fey",
    "subtype": "",
    "alignment": "Chaotic Neutral",
    "armor_class": 14,
    "armor_class_text": "14 (Leather Armor)",
    "hit_points": 31,
    "hit_dice": "7d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 12,
      "dex": 16,
      "con": 11,
      "int": 12,
      "wis": 10,
      "cha": 14
    },
    "summary": "A nimble medium wild trickster spirit. Codex scouts flag it as a field threat around forest and grove.",
    "actions": [
      {
        "name": "Ram",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 6 (2d4 + 1) bludgeoning damage."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1 d6 + 3) piercing damage."
      },
      {
        "name": "Shortbow",
        "description": "Ranged Weapon Attack: +5 to hit, range 80/320 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The satyr has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grove"
    ],
    "languages": "Common, Elvish, Sylvan",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/satyr.png"
  },
  {
    "id": "scorpion",
    "name": "Scorpion",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 10 ft.",
    "stats": {
      "str": 2,
      "dex": 11,
      "con": 8,
      "int": 1,
      "wis": 8,
      "cha": 2
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around forest and desert.",
    "actions": [
      {
        "name": "Sting",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 1 piercing damage, and the target must make a DC 9 Constitution saving throw, taking 4 (1d8) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Desert"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/scorpion.png"
  },
  {
    "id": "scout",
    "name": "Scout",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 13,
    "armor_class_text": "13 (Leather Armor)",
    "hit_points": 16,
    "hit_dice": "3d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 11,
      "dex": 14,
      "con": 12,
      "int": 11,
      "wis": 13,
      "cha": 11
    },
    "summary": "A nimble medium armed opportunist with any race traits. Codex scouts flag it as a field threat around frontier and arctic.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The scout makes two melee attacks or two ranged attacks."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 150/600 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Sight",
        "description": "The scout has advantage on Wisdom (Perception) checks that rely on hearing or sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Arctic"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 15",
    "source_desc": "Scouts are skilled hunters and trackers who offer their services for a fee. Most hunt wild game, but a few work as bounty hunters, serve as guides, or provide military reconnaissance.",
    "image": "/api/images/monsters/scout.png"
  },
  {
    "id": "sea-hag",
    "name": "Sea Hag",
    "size": "Medium",
    "type": "Fey",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 52,
    "hit_dice": "7d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Swim 40 ft.",
    "stats": {
      "str": 16,
      "dex": 13,
      "con": 16,
      "int": 12,
      "wis": 12,
      "cha": 13
    },
    "summary": "A brutal medium wild trickster spirit. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage."
      },
      {
        "name": "Death Glare",
        "description": "The hag targets one frightened creature she can see within 30 ft. of her. If the target can see the hag, it must succeed on a DC 11 Wisdom saving throw against this magic or drop to 0 hit points."
      },
      {
        "name": "Illusory Appearance",
        "description": "The hag covers herself and anything she is wearing or carrying with a magical illusion that makes her look like an ugly creature of her general size and humanoid shape. The effect ends if the hag takes a bonus action to end it or if she dies. The changes wrought by this effect fail to hold up to physical inspection. For example, the hag could appear to have no claws, but someone touching her hand might feel the claws. Otherwise, a creature must take an action to visually inspect the illusion and succeed on a DC 16 Intelligence (Investigation) check to discern that the hag is disguised."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The hag can breathe air and water."
      },
      {
        "name": "Horrific Appearance",
        "description": "Any humanoid that starts its turn within 30 feet of the hag and can see the hag's true form must make a DC 11 Wisdom saving throw. On a failed save, the creature is frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, with disadvantage if the hag is within line of sight, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the hag's Horrific Appearance for the next 24 hours. Unless the target is surprised or the revelation of the hag's true form is sudden, the target can avert its eyes and avoid making the initial saving throw. Until the start of its next turn, a creature that averts its eyes has disadvantage on attack rolls against the hag."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Grassland"
    ],
    "languages": "Aquan, Common, Giant",
    "senses": "Darkvision 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/sea-hag.png"
  },
  {
    "id": "sea-horse",
    "name": "Sea Horse",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Swim 20 ft.",
    "stats": {
      "str": 1,
      "dex": 12,
      "con": 8,
      "int": 1,
      "wis": 10,
      "cha": 2
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around coast and depths.",
    "actions": [],
    "traits": [
      {
        "name": "Water Breathing",
        "description": "The sea horse can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/sea-horse.png"
  },
  {
    "id": "shadow",
    "name": "Shadow",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 16,
    "hit_dice": "3d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 6,
      "dex": 14,
      "con": 13,
      "int": 6,
      "wis": 10,
      "cha": 8
    },
    "summary": "A nimble medium deathless stalker. Codex scouts flag it as a field threat around crypt and ruins.",
    "actions": [
      {
        "name": "Strength Drain",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) necrotic damage, and the target's Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts until the target finishes a short or long rest. If a non-evil humanoid dies from this attack, a new shadow rises from the corpse 1d4 hours later."
      }
    ],
    "traits": [
      {
        "name": "Amorphous",
        "description": "The shadow can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        "name": "Shadow Stealth",
        "description": "While in dim light or darkness, the shadow can take the Hide action as a bonus action. Its stealth bonus is also improved to +6."
      },
      {
        "name": "Sunlight Weakness",
        "description": "While in sunlight, the shadow has disadvantage on attack rolls, ability checks, and saving throws."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/shadow.png"
  },
  {
    "id": "shambling-mound",
    "name": "Shambling Mound",
    "size": "Large",
    "type": "Plant",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 136,
    "hit_dice": "16d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 20 ft. | Swim 20 ft.",
    "stats": {
      "str": 18,
      "dex": 8,
      "con": 16,
      "int": 5,
      "wis": 10,
      "cha": 5
    },
    "summary": "A brutal large rooted ambusher. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The shambling mound makes two slam attacks. If both attacks hit a Medium or smaller target, the target is grappled (escape DC 14), and the shambling mound uses its Engulf on it."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage."
      },
      {
        "name": "Engulf",
        "description": "The shambling mound engulfs a Medium or smaller creature grappled by it. The engulfed target is blinded, restrained, and unable to breathe, and it must succeed on a DC 14 Constitution saving throw at the start of each of the mound's turns or take 13 (2d8 + 4) bludgeoning damage. If the mound moves, the engulfed target moves with it. The mound can have only one creature engulfed at a time."
      }
    ],
    "traits": [
      {
        "name": "Lightning Absorption",
        "description": "Whenever the shambling mound is subjected to lightning damage, it takes no damage and regains a number of hit points equal to the lightning damage dealt."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Swamp"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. (blind beyond this radius) | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/shambling-mound.png"
  },
  {
    "id": "shield-guardian",
    "name": "Shield Guardian",
    "size": "Large",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 142,
    "hit_dice": "15d10",
    "challenge_rating": "7",
    "challenge_rating_value": 7,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 8,
      "con": 18,
      "int": 7,
      "wis": 10,
      "cha": 3
    },
    "summary": "A brutal large forged sentinel. Codex scouts flag it as a dangerous threat around ruins and vault.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The guardian makes two fist attacks."
      },
      {
        "name": "Fist",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Bound",
        "description": "The shield guardian is magically bound to an amulet. As long as the guardian and its amulet are on the same plane of existence, the amulet's wearer can telepathically call the guardian to travel to it, and the guardian knows the distance and direction to the amulet. If the guardian is within 60 feet of the amulet's wearer, half of any damage the wearer takes (rounded up) is transferred to the guardian."
      },
      {
        "name": "Regeneration",
        "description": "The shield guardian regains 10 hit points at the start of its turn if it has at least 1 hit. point."
      },
      {
        "name": "Spell Storing",
        "description": "A spellcaster who wears the shield guardian's amulet can cause the guardian to store one spell of 4th level or lower. To do so, the wearer must cast the spell on the guardian. The spell has no effect but is stored within the guardian. When commanded to do so by the wearer or when a situation arises that was predefined by the spellcaster, the guardian casts the stored spell with any parameters set by the original caster, requiring no components. When the spell is cast or a new spell is stored, any previously stored spell is lost."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault",
      "Urban",
      "Stronghold"
    ],
    "languages": "understands commands given in any language but can't speak",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/shield-guardian.png"
  },
  {
    "id": "shrieker",
    "name": "Shrieker",
    "size": "Medium",
    "type": "Plant",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 5,
    "armor_class_text": "5",
    "hit_points": 13,
    "hit_dice": "3d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 0 ft.",
    "stats": {
      "str": 1,
      "dex": 1,
      "con": 10,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "summary": "A stubborn medium rooted ambusher. Codex scouts flag it as a minor threat around forest and swamp.",
    "actions": [],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the shrieker remains motionless, it is indistinguishable from an ordinary fungus."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Swamp"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. (blind beyond this radius) | Passive Perception 6",
    "source_desc": "",
    "image": "/api/images/monsters/shrieker.png"
  },
  {
    "id": "silver-dragon-wyrmling",
    "name": "Silver Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 45,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 17,
      "int": 12,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (1d10 + 4) piercing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Cold Breath. The dragon exhales an icy blast in a 15-foot cone. Each creature in that area must make a DC 13 Constitution saving throw, taking 18 (4d8) cold damage on a failed save, or half as much damage on a successful one. Paralyzing Breath. The dragon exhales paralyzing gas in a 15-foot cone. Each creature in that area must succeed on a DC 13 Constitution saving throw or be paralyzed for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/silver-dragon-wyrmling.png"
  },
  {
    "id": "skeleton",
    "name": "Skeleton",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Armor)",
    "hit_points": 13,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 14,
      "con": 15,
      "int": 6,
      "wis": 8,
      "cha": 5
    },
    "summary": "A stubborn medium deathless stalker. Codex scouts flag it as a minor threat around crypt and ruins.",
    "actions": [
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Shortbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "understands all languages it spoke in life but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/skeleton.png"
  },
  {
    "id": "solar",
    "name": "Solar",
    "size": "Large",
    "type": "Celestial",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 21,
    "armor_class_text": "21 (Natural)",
    "hit_points": 243,
    "hit_dice": "18d10",
    "challenge_rating": "21",
    "challenge_rating_value": 21,
    "speed": "Walk 50 ft. | Fly 150 ft.",
    "stats": {
      "str": 26,
      "dex": 22,
      "con": 26,
      "int": 25,
      "wis": 25,
      "cha": 30
    },
    "summary": "A commanding large radiant guardian. Codex scouts flag it as a cataclysmic threat around cliffs and sanctum.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The solar makes two greatsword attacks."
      },
      {
        "name": "Greatsword",
        "description": "Melee Weapon Attack: +15 to hit, reach 5 ft., one target. Hit: 22 (4d6 + 8) slashing damage plus 27 (6d8) radiant damage."
      },
      {
        "name": "Slaying Longbow",
        "description": "Ranged Weapon Attack: +13 to hit, range 150/600 ft., one target. Hit: 15 (2d8 + 6) piercing damage plus 27 (6d8) radiant damage. If the target is a creature that has 190 hit points or fewer, it must succeed on a DC 15 Constitution saving throw or die."
      },
      {
        "name": "Flying Sword",
        "description": "The solar releases its greatsword to hover magically in an unoccupied space within 5 ft. of it. If the solar can see the sword, the solar can mentally command it as a bonus action to fly up to 50 ft. and either make one attack against a target or return to the solar's hands. If the hovering sword is targeted by any effect, the solar is considered to be holding it. The hovering sword falls if the solar dies."
      },
      {
        "name": "Healing Touch",
        "description": "The solar touches another creature. The target magically regains 40 (8d8 + 4) hit points and is freed from any curse, disease, poison, blindness, or deafness."
      }
    ],
    "traits": [
      {
        "name": "Angelic Weapons",
        "description": "The solar's weapon attacks are magical. When the solar hits with any weapon, the weapon deals an extra 6d8 radiant damage (included in the attack)."
      },
      {
        "name": "Divine Awareness",
        "description": "The solar knows if it hears a lie."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The solar's spell casting ability is Charisma (spell save DC 25). It can innately cast the following spells, requiring no material components: At will: detect evil and good, invisibility (self only) 3/day each: blade barrier, dispel evil and good, resurrection 1/day each: commune, control weather"
      },
      {
        "name": "Magic Resistance",
        "description": "The solar has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [
      {
        "name": "Teleport",
        "description": "The solar magically teleports, along with any equipment it is wearing or carrying, up to 120 ft. to an unoccupied space it can see."
      },
      {
        "name": "Searing Burst (Costs 2 Actions)",
        "description": "The solar emits magical, divine energy. Each creature of its choice in a 10 -foot radius must make a DC 23 Dexterity saving throw, taking 14 (4d6) fire damage plus 14 (4d6) radiant damage on a failed save, or half as much damage on a successful one."
      },
      {
        "name": "Blinding Gaze (Costs 3 Actions)",
        "description": "The solar targets one creature it can see within 30 ft. of it. If the target can see it, the target must succeed on a DC 15 Constitution saving throw or be blinded until magic such as the lesser restoration spell removes the blindness."
      }
    ],
    "environment": [
      "Cliffs",
      "Sanctum"
    ],
    "languages": "all, telepathy 120 ft.",
    "senses": "Truesight 120 ft. | Passive Perception 24",
    "source_desc": "",
    "image": "/api/images/monsters/solar.png"
  },
  {
    "id": "specter",
    "name": "Specter",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 0 ft. | Fly 50 ft. | Hover true",
    "stats": {
      "str": 1,
      "dex": 14,
      "con": 11,
      "int": 10,
      "wis": 10,
      "cha": 11
    },
    "summary": "A nimble medium deathless stalker. Codex scouts flag it as a field threat around cliffs and crypt.",
    "actions": [
      {
        "name": "Life Drain",
        "description": "Melee Spell Attack: +4 to hit, reach 5 ft., one creature. Hit: 10 (3d6) necrotic damage. The target must succeed on a DC 10 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the creature finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
      }
    ],
    "traits": [
      {
        "name": "Incorporeal Movement",
        "description": "The specter can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the specter has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Crypt",
      "Ruins",
      "Cavern"
    ],
    "languages": "understands all languages it knew in life but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/specter.png"
  },
  {
    "id": "spider",
    "name": "Spider",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 20 ft. | Climb 20 ft.",
    "stats": {
      "str": 2,
      "dex": 14,
      "con": 8,
      "int": 1,
      "wis": 10,
      "cha": 2
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around ruins and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 1 piercing damage, and the target must succeed on a DC 9 Constitution saving throw or take 2 (1d4) poison damage."
      }
    ],
    "traits": [
      {
        "name": "Spider Climb",
        "description": "The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Web Sense",
        "description": "While in contact with a web, the spider knows the exact location of any other creature in contact with the same web."
      },
      {
        "name": "Web Walker",
        "description": "The spider ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Cavern"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/spider.png"
  },
  {
    "id": "spirit-naga",
    "name": "Spirit Naga",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 75,
    "hit_dice": "10d10",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 18,
      "dex": 17,
      "con": 14,
      "int": 16,
      "wis": 15,
      "cha": 16
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a dangerous threat around wilderness and arctic.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one creature. Hit: 7 (1d6 + 4) piercing damage, and the target must make a DC 13 Constitution saving throw, taking 31 (7d8) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Rejuvenation",
        "description": "If it dies, the naga returns to life in 1d6 days and regains all its hit points. Only a wish spell can prevent this trait from functioning."
      },
      {
        "name": "Spellcasting",
        "description": "The naga is a 10th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 14, +6 to hit with spell attacks), and it needs only verbal components to cast its spells. It has the following wizard spells prepared: - Cantrips (at will): mage hand, minor illusion, ray of frost - 1st level (4 slots): charm person, detect magic, sleep - 2nd level (3 slots): detect thoughts, hold person - 3rd level (3 slots): lightning bolt, water breathing - 4th level (3 slots): blight, dimension door - 5th level (2 slots): dominate person"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Arctic"
    ],
    "languages": "Abyssal, Common",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/spirit-naga.png"
  },
  {
    "id": "sprite",
    "name": "Sprite",
    "size": "Tiny",
    "type": "Fey",
    "subtype": "",
    "alignment": "Neutral Good",
    "armor_class": 15,
    "armor_class_text": "15 (Leather Armor)",
    "hit_points": 2,
    "hit_dice": "1d4",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 10 ft. | Fly 40 ft.",
    "stats": {
      "str": 3,
      "dex": 18,
      "con": 10,
      "int": 14,
      "wis": 13,
      "cha": 11
    },
    "summary": "A nimble tiny wild trickster spirit. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 1 slashing damage."
      },
      {
        "name": "Shortbow",
        "description": "Ranged Weapon Attack: +6 to hit, range 40/160 ft., one target. Hit: 1 piercing damage, and the target must succeed on a DC 10 Constitution saving throw or become poisoned for 1 minute. If its saving throw result is 5 or lower, the poisoned target falls unconscious for the same duration, or until it takes damage or another creature takes an action to shake it awake."
      },
      {
        "name": "Heart Sight",
        "description": "The sprite touches a creature and magically knows the creature's current emotional state. If the target fails a DC 10 Charisma saving throw, the sprite also knows the creature's alignment. Celestials, fiends, and undead automatically fail the saving throw."
      },
      {
        "name": "Invisibility",
        "description": "The sprite magically turns invisible until it attacks or casts a spell, or until its concentration ends (as if concentrating on a spell). Any equipment the sprite wears or carries is invisible with it."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Grassland",
      "Grove"
    ],
    "languages": "Common, Elvish, Sylvan",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/sprite.png"
  },
  {
    "id": "spy",
    "name": "Spy",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 27,
    "hit_dice": "6d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 15,
      "con": 10,
      "int": 12,
      "wis": 14,
      "cha": 16
    },
    "summary": "A commanding medium armed opportunist with any race traits. Codex scouts flag it as a field threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The spy makes two melee attacks."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Hand Crossbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Cunning Action",
        "description": "On each of its turns, the spy can use a bonus action to take the Dash, Disengage, or Hide action."
      },
      {
        "name": "Sneak Attack (1/Turn)",
        "description": "The spy deals an extra 7 (2d6) damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 ft. of an ally of the spy that isn't incapacitated and the spy doesn't have disadvantage on the attack roll."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Forest"
    ],
    "languages": "any two languages",
    "senses": "Passive Perception 16",
    "source_desc": "Rulers, nobles, merchants, guildmasters, and other wealthy individuals use spies to gain the upper hand in a world of cutthroat politics. A spy is trained to secretly gather information. Loyal spies would rather die than divulge information that could compromise them or their employers.",
    "image": "/api/images/monsters/spy.png"
  },
  {
    "id": "steam-mephit",
    "name": "Steam Mephit",
    "size": "Small",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 21,
    "hit_dice": "6d6",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft. | Fly 30 ft.",
    "stats": {
      "str": 5,
      "dex": 11,
      "con": 10,
      "int": 11,
      "wis": 10,
      "cha": 12
    },
    "summary": "A commanding small living force of nature. Codex scouts flag it as a minor threat around cliffs and elemental rift.",
    "actions": [
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 2 (1d4) slashing damage plus 2 (1d4) fire damage."
      },
      {
        "name": "Steam Breath",
        "description": "The mephit exhales a 15-foot cone of scalding steam. Each creature in that area must succeed on a DC 10 Dexterity saving throw, taking 4 (1d8) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Death Burst",
        "description": "When the mephit dies, it explodes in a cloud of steam. Each creature within 5 ft. of the mephit must succeed on a DC 10 Dexterity saving throw or take 4 (1d8) fire damage."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The mephit can innately cast blur, requiring no material components. Its innate spellcasting ability is Charisma."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Elemental Rift",
      "Volcanic"
    ],
    "languages": "Aquan, Ignan",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/steam-mephit.png"
  },
  {
    "id": "stirge",
    "name": "Stirge",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 2,
    "hit_dice": "1d4",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 10 ft. | Fly 40 ft.",
    "stats": {
      "str": 4,
      "dex": 16,
      "con": 11,
      "int": 2,
      "wis": 8,
      "cha": 6
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Blood Drain",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 5 (1d4 + 3) piercing damage, and the stirge attaches to the target. While attached, the stirge doesn't attack. Instead, at the start of each of the stirge's turns, the target loses 5 (1d4 + 3) hit points due to blood loss. The stirge can detach itself by spending 5 feet of its movement. It does so after it drains 10 hit points of blood from the target or the target dies. A creature, including the target, can use its action to detach the stirge."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/stirge.png"
  },
  {
    "id": "stone-giant",
    "name": "Stone Giant",
    "size": "Huge",
    "type": "Giant",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 126,
    "hit_dice": "11d12",
    "challenge_rating": "7",
    "challenge_rating_value": 7,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 23,
      "dex": 15,
      "con": 20,
      "int": 10,
      "wis": 12,
      "cha": 9
    },
    "summary": "A brutal huge towering marauder. Codex scouts flag it as a dangerous threat around mountain and cavern.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The giant makes two greatclub attacks."
      },
      {
        "name": "Greatclub",
        "description": "Melee Weapon Attack: +9 to hit, reach 15 ft., one target. Hit: 19 (3d8 + 6) bludgeoning damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +9 to hit, range 60/240 ft., one target. Hit: 28 (4d10 + 6) bludgeoning damage. If the target is a creature, it must succeed on a DC 17 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Stone Camouflage",
        "description": "The giant has advantage on Dexterity (Stealth) checks made to hide in rocky terrain."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Cavern",
      "Cliffs",
      "Highlands"
    ],
    "languages": "Giant",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/stone-giant.png"
  },
  {
    "id": "stone-golem",
    "name": "Stone Golem",
    "size": "Large",
    "type": "Construct",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 178,
    "hit_dice": "17d10",
    "challenge_rating": "10",
    "challenge_rating_value": 10,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 22,
      "dex": 9,
      "con": 20,
      "int": 3,
      "wis": 11,
      "cha": 1
    },
    "summary": "A brutal large forged sentinel. Codex scouts flag it as a dangerous threat around ruins and vault.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The golem makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 19 (3d8 + 6) bludgeoning damage."
      },
      {
        "name": "Slow",
        "description": "The golem targets one or more creatures it can see within 10 ft. of it. Each target must make a DC 17 Wisdom saving throw against this magic. On a failed save, a target can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the target can take either an action or a bonus action on its turn, not both. These effects last for 1 minute. A target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Immutable Form",
        "description": "The golem is immune to any spell or effect that would alter its form."
      },
      {
        "name": "Magic Resistance",
        "description": "The golem has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The golem's weapon attacks are magical."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Vault",
      "Mountain",
      "Cavern"
    ],
    "languages": "understands the languages of its creator but can't speak",
    "senses": "Darkvision 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/stone-golem.png"
  },
  {
    "id": "storm-giant",
    "name": "Storm Giant",
    "size": "Huge",
    "type": "Giant",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 16,
    "armor_class_text": "16 (Scale Mail)",
    "hit_points": 230,
    "hit_dice": "20d12",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 50 ft. | Swim 50 ft.",
    "stats": {
      "str": 29,
      "dex": 14,
      "con": 20,
      "int": 16,
      "wis": 18,
      "cha": 18
    },
    "summary": "A brutal huge towering marauder. Codex scouts flag it as a deadly threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The giant makes two greatsword attacks."
      },
      {
        "name": "Greatsword",
        "description": "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 30 (6d6 + 9) slashing damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +14 to hit, range 60/240 ft., one target. Hit: 35 (4d12 + 9) bludgeoning damage."
      },
      {
        "name": "Lightning Strike",
        "description": "The giant hurls a magical lightning bolt at a point it can see within 500 feet of it. Each creature within 10 feet of that point must make a DC 17 Dexterity saving throw, taking 54 (12d8) lightning damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The giant can breathe air and water."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The giant's innate spellcasting ability is Charisma (spell save DC 17). It can innately cast the following spells, requiring no material components: At will: detect magic, feather fall, levitate, light 3/day each: control weather, water breathing"
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Mountain",
      "Cliffs"
    ],
    "languages": "Common, Giant",
    "senses": "Passive Perception 19",
    "source_desc": "",
    "image": "/api/images/monsters/storm-giant.png"
  },
  {
    "id": "succubus-incubus",
    "name": "Succubus/Incubus",
    "size": "Medium",
    "type": "Fiend",
    "subtype": "Shapechanger",
    "alignment": "Neutral Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 66,
    "hit_dice": "12d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft. | Fly 60 ft.",
    "stats": {
      "str": 8,
      "dex": 17,
      "con": 13,
      "int": 15,
      "wis": 12,
      "cha": 20
    },
    "summary": "A commanding medium malicious planar raider with shapechanger traits. Codex scouts flag it as a seasoned threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Claw (Fiend Form Only)",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      },
      {
        "name": "Charm",
        "description": "One humanoid the fiend can see within 30 feet of it must succeed on a DC 15 Wisdom saving throw or be magically charmed for 1 day. The charmed target obeys the fiend's verbal or telepathic commands. If the target suffers any harm or receives a suicidal command, it can repeat the saving throw, ending the effect on a success. If the target successfully saves against the effect, or if the effect on it ends, the target is immune to this fiend's Charm for the next 24 hours. The fiend can have only one target charmed at a time. If it charms another, the effect on the previous target ends."
      },
      {
        "name": "Draining Kiss",
        "description": "The fiend kisses a creature charmed by it or a willing creature. The target must make a DC 15 Constitution saving throw against this magic, taking 32 (5d10 + 5) psychic damage on a failed save, or half as much damage on a successful one. The target's hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
      },
      {
        "name": "Etherealness",
        "description": "The fiend magically enters the Ethereal Plane from the Material Plane, or vice versa."
      }
    ],
    "traits": [
      {
        "name": "Telepathic Bond",
        "description": "The fiend ignores the range restriction on its telepathy when communicating with a creature it has charmed. The two don't even need to be on the same plane of existence."
      },
      {
        "name": "Shapechanger",
        "description": "The fiend can use its action to polymorph into a Small or Medium humanoid, or back into its true form. Without wings, the fiend loses its flying speed. Other than its size and speed, its statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Forest"
    ],
    "languages": "Abyssal, Common, Infernal, telepathy 60 ft.",
    "senses": "Darkvision 60 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/succubus-incubus.png"
  },
  {
    "id": "swarm-of-bats",
    "name": "Swarm of Bats",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 0 ft. | Fly 30 ft.",
    "stats": {
      "str": 5,
      "dex": 15,
      "con": 10,
      "int": 2,
      "wis": 12,
      "cha": 4
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +4 to hit, reach 0 ft., one creature in the swarm's space. Hit: 5 (2d4) piercing damage, or 2 (1d4) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Echolocation",
        "description": "The swarm can't use its blindsight while deafened."
      },
      {
        "name": "Keen Hearing",
        "description": "The swarm has advantage on Wisdom (Perception) checks that rely on hearing."
      },
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny bat. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 60 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-bats.png"
  },
  {
    "id": "swarm-of-beetles",
    "name": "Swarm of Beetles",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft. | Burrow 5 ft. | Climb 20 ft.",
    "stats": {
      "str": 3,
      "dex": 13,
      "con": 10,
      "int": 1,
      "wis": 7,
      "cha": 1
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a field threat around badlands and ruins.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +3 to hit, reach 0 ft., one target in the swarm's space. Hit: 10 (4d4) piercing damage, or 5 (2d4) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny insect. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Ruins",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-beetles.png"
  },
  {
    "id": "swarm-of-centipedes",
    "name": "Swarm of Centipedes",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft. | Climb 20 ft.",
    "stats": {
      "str": 3,
      "dex": 13,
      "con": 10,
      "int": 1,
      "wis": 7,
      "cha": 1
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +3 to hit, reach 0 ft., one target in the swarm's space. Hit: 10 (4d4) piercing damage, or 5 (2d4) piercing damage if the swarm has half of its hit points or fewer. A creature reduced to 0 hit points by a swarm of centipedes is stable but poisoned for 1 hour, even after regaining hit points, and paralyzed while poisoned in this way."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny insect. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-centipedes.png"
  },
  {
    "id": "swarm-of-insects",
    "name": "Swarm of Insects",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft. | Climb 20 ft.",
    "stats": {
      "str": 3,
      "dex": 13,
      "con": 10,
      "int": 1,
      "wis": 7,
      "cha": 1
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +3 to hit, reach 0 ft., one target in the swarm's space. Hit: 10 (4d4) piercing damage, or 5 (2d4) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny insect. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-insects.png"
  },
  {
    "id": "swarm-of-poisonous-snakes",
    "name": "Swarm of Poisonous Snakes",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 14,
    "armor_class_text": "14",
    "hit_points": 36,
    "hit_dice": "8d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Swim 30 ft.",
    "stats": {
      "str": 8,
      "dex": 18,
      "con": 11,
      "int": 1,
      "wis": 10,
      "cha": 3
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +6 to hit, reach 0 ft., one creature in the swarm's space. Hit: 7 (2d6) piercing damage, or 3 (1d6) piercing damage if the swarm has half of its hit points or fewer. The target must make a DC 10 Constitution saving throw, taking 14 (4d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny snake. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-poisonous-snakes.png"
  },
  {
    "id": "swarm-of-quippers",
    "name": "Swarm of Quippers",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 28,
    "hit_dice": "8d8",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 0 ft. | Swim 40 ft.",
    "stats": {
      "str": 13,
      "dex": 16,
      "con": 9,
      "int": 1,
      "wis": 7,
      "cha": 2
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a field threat around coast and depths.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +5 to hit, reach 0 ft., one creature in the swarm's space. Hit: 14 (4d6) piercing damage, or 7 (2d6) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Blood Frenzy",
        "description": "The swarm has advantage on melee attack rolls against any creature that doesn't have all its hit points."
      },
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny quipper. The swarm can't regain hit points or gain temporary hit points."
      },
      {
        "name": "Water Breathing",
        "description": "The swarm can breathe only underwater."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-quippers.png"
  },
  {
    "id": "swarm-of-rats",
    "name": "Swarm of Rats",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 24,
    "hit_dice": "7d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 9,
      "dex": 11,
      "con": 9,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +2 to hit, reach 0 ft., one target in the swarm's space. Hit: 7 (2d6) piercing damage, or 3 (1d6) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The swarm has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny rat. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Darkvision 30 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-rats.png"
  },
  {
    "id": "swarm-of-ravens",
    "name": "Swarm of Ravens",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 24,
    "hit_dice": "7d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 10 ft. | Fly 50 ft.",
    "stats": {
      "str": 6,
      "dex": 14,
      "con": 8,
      "int": 3,
      "wis": 12,
      "cha": 6
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Beaks",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target in the swarm's space. Hit: 7 (2d6) piercing damage, or 3 (1d6) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny raven. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-ravens.png"
  },
  {
    "id": "swarm-of-spiders",
    "name": "Swarm of Spiders",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 20 ft. | Climb 20 ft.",
    "stats": {
      "str": 3,
      "dex": 13,
      "con": 10,
      "int": 1,
      "wis": 7,
      "cha": 1
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a field threat around ruins and forest.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +3 to hit, reach 0 ft., one target in the swarm's space. Hit: 10 (4d4) piercing damage, or 5 (2d4) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny insect. The swarm can't regain hit points or gain temporary hit points."
      },
      {
        "name": "Spider Climb",
        "description": "The swarm can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Web Sense",
        "description": "While in contact with a web, the swarm knows the exact location of any other creature in contact with the same web."
      },
      {
        "name": "Web Walker",
        "description": "The swarm ignores movement restrictions caused by webbing."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Forest",
      "Cavern",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-spiders.png"
  },
  {
    "id": "swarm-of-wasps",
    "name": "Swarm of Wasps",
    "size": "Medium",
    "type": "Swarm of Tiny Beasts",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 22,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 5 ft. | Fly 30 ft.",
    "stats": {
      "str": 3,
      "dex": 13,
      "con": 10,
      "int": 1,
      "wis": 7,
      "cha": 1
    },
    "summary": "A nimble medium swarming nuisance cloud. Codex scouts flag it as a field threat around cliffs and forest.",
    "actions": [
      {
        "name": "Bites",
        "description": "Melee Weapon Attack: +3 to hit, reach 0 ft., one target in the swarm's space. Hit: 10 (4d4) piercing damage, or 5 (2d4) piercing damage if the swarm has half of its hit points or fewer."
      }
    ],
    "traits": [
      {
        "name": "Swarm",
        "description": "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny insect. The swarm can't regain hit points or gain temporary hit points."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 10 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/swarm-of-wasps.png"
  },
  {
    "id": "tarrasque",
    "name": "Tarrasque",
    "size": "Gargantuan",
    "type": "Monstrosity",
    "subtype": "Titan",
    "alignment": "Unaligned",
    "armor_class": 25,
    "armor_class_text": "25 (Natural)",
    "hit_points": 676,
    "hit_dice": "33d20",
    "challenge_rating": "30",
    "challenge_rating_value": 30,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 30,
      "dex": 11,
      "con": 30,
      "int": 3,
      "wis": 11,
      "cha": 11
    },
    "summary": "A brutal gargantuan unnatural apex hunter with titan traits. Codex scouts flag it as a cataclysmic threat around wilderness and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The tarrasque can use its Frightful Presence. It then makes five attacks: one with its bite, two with its claws, one with its horns, and one with its tail. It can use its Swallow instead of its bite."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +19 to hit, reach 10 ft., one target. Hit: 36 (4d12 + 10) piercing damage. If the target is a creature, it is grappled (escape DC 20). Until this grapple ends, the target is restrained, and the tarrasque can't bite another target."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +19 to hit, reach 15 ft., one target. Hit: 28 (4d8 + 10) slashing damage."
      },
      {
        "name": "Horns",
        "description": "Melee Weapon Attack: +19 to hit, reach 10 ft., one target. Hit: 32 (4d10 + 10) piercing damage."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +19 to hit, reach 20 ft., one target. Hit: 24 (4d6 + 10) bludgeoning damage. If the target is a creature, it must succeed on a DC 20 Strength saving throw or be knocked prone."
      },
      {
        "name": "Frightful Presence",
        "description": "Each creature of the tarrasque's choice within 120 feet of it and aware of it must succeed on a DC 17 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, with disadvantage if the tarrasque is within line of sight, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the tarrasque's Frightful Presence for the next 24 hours."
      },
      {
        "name": "Swallow",
        "description": "The tarrasque makes one bite attack against a Large or smaller creature it is grappling. If the attack hits, the target takes the bite's damage, the target is swallowed, and the grapple ends. While swallowed, the creature is blinded and restrained, it has total cover against attacks and other effects outside the tarrasque, and it takes 56 (16d6) acid damage at the start of each of the tarrasque's turns. If the tarrasque takes 60 damage or more on a single turn from a creature inside it, the tarrasque must succeed on a DC 20 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a space within 10 feet of the tarrasque. If the tarrasque dies, a swallowed creature is no longer restrained by it and can escape from the corpse by using 30 feet of movement, exiting prone."
      }
    ],
    "traits": [
      {
        "name": "Legendary Resistance",
        "description": "If the tarrasque fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Magic Resistance",
        "description": "The tarrasque has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Reflective Carapace",
        "description": "Any time the tarrasque is targeted by a magic missile spell, a line spell, or a spell that requires a ranged attack roll, roll a d6. On a 1 to 5, the tarrasque is unaffected. On a 6, the tarrasque is unaffected, and the effect is reflected back at the caster as though it originated from the tarrasque, turning the caster into the target."
      },
      {
        "name": "Siege Monster",
        "description": "The tarrasque deals double damage to objects and structures."
      }
    ],
    "legendary_actions": [
      {
        "name": "Attack",
        "description": "The tarrasque makes one claw attack or tail attack."
      },
      {
        "name": "Move",
        "description": "The tarrasque moves up to half its speed."
      },
      {
        "name": "Chomp (Costs 2 Actions)",
        "description": "The tarrasque makes one bite attack or uses its Swallow."
      }
    ],
    "environment": [
      "Wilderness",
      "Forest",
      "Grassland",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Blindsight 120 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/tarrasque.png"
  },
  {
    "id": "thug",
    "name": "Thug",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Non-Good Alignment",
    "armor_class": 11,
    "armor_class_text": "11 (Leather Armor)",
    "hit_points": 32,
    "hit_dice": "5d8",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 15,
      "dex": 11,
      "con": 14,
      "int": 10,
      "wis": 10,
      "cha": 11
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a field threat around frontier and cavern.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The thug makes two melee attacks."
      },
      {
        "name": "Mace",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) bludgeoning damage."
      },
      {
        "name": "Heavy Crossbow",
        "description": "Ranged Weapon Attack: +2 to hit, range 100/400 ft., one target. Hit: 5 (1d10) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The thug has advantage on an attack roll against a creature if at least one of the thug's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Cavern",
      "Urban",
      "Stronghold"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 10",
    "source_desc": "Thugs are ruthless enforcers skilled at intimidation and violence. They work for money and have few scruples.",
    "image": "/api/images/monsters/thug.png"
  },
  {
    "id": "tiger",
    "name": "Tiger",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 37,
    "hit_dice": "5d10",
    "challenge_rating": "1",
    "challenge_rating_value": 1,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 14,
      "int": 3,
      "wis": 12,
      "cha": 8
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The tiger has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Pounce",
        "description": "If the tiger moves at least 20 ft. straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 13 Strength saving throw or be knocked prone. If the target is prone, the tiger can make one bite attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/tiger.png"
  },
  {
    "id": "treant",
    "name": "Treant",
    "size": "Huge",
    "type": "Plant",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 138,
    "hit_dice": "12d12",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 23,
      "dex": 8,
      "con": 21,
      "int": 12,
      "wis": 16,
      "cha": 12
    },
    "summary": "A brutal huge rooted ambusher. Codex scouts flag it as a dangerous threat around forest and swamp.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The treant makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 16 (3d6 + 6) bludgeoning damage."
      },
      {
        "name": "Rock",
        "description": "Ranged Weapon Attack: +10 to hit, range 60/180 ft., one target. Hit: 28 (4d10 + 6) bludgeoning damage."
      },
      {
        "name": "Animate Trees",
        "description": "The treant magically animates one or two trees it can see within 60 feet of it. These trees have the same statistics as a treant, except they have Intelligence and Charisma scores of 1, they can't speak, and they have only the Slam action option. An animated tree acts as an ally of the treant. The tree remains animate for 1 day or until it dies; until the treant dies or is more than 120 feet from the tree; or until the treant takes a bonus action to turn it back into an inanimate tree. The tree then takes root if possible."
      }
    ],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the treant remains motionless, it is indistinguishable from a normal tree."
      },
      {
        "name": "Siege Monster",
        "description": "The treant deals double damage to objects and structures."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Swamp",
      "Cliffs",
      "Highlands"
    ],
    "languages": "Common, Druidic, Elvish, Sylvan",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/treant.png"
  },
  {
    "id": "tribal-warrior",
    "name": "Tribal Warrior",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 12,
    "armor_class_text": "12 (Hide Armor)",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/8",
    "challenge_rating_value": 0.125,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 13,
      "dex": 11,
      "con": 12,
      "int": 8,
      "wis": 11,
      "cha": 8
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a minor threat around frontier and wilderness.",
    "actions": [
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage, or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack."
      }
    ],
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The warrior has advantage on an attack roll against a creature if at least one of the warrior's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Wilderness"
    ],
    "languages": "any one language",
    "senses": "Passive Perception 10",
    "source_desc": "Tribal warriors live beyond civilization, most often subsisting on fishing and hunting. Each tribe acts in accordance with the wishes of its chief, who is the greatest or oldest warrior of the tribe or a tribe member blessed by the gods.",
    "image": "/api/images/monsters/tribal-warrior.png"
  },
  {
    "id": "triceratops",
    "name": "Triceratops",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 95,
    "hit_dice": "10d12",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 22,
      "dex": 9,
      "con": 17,
      "int": 2,
      "wis": 11,
      "cha": 5
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a dangerous threat around forest and grassland.",
    "actions": [
      {
        "name": "Gore",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 24 (4d8 + 6) piercing damage."
      },
      {
        "name": "Stomp",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one prone creature. Hit: 22 (3d10 + 6) bludgeoning damage"
      }
    ],
    "traits": [
      {
        "name": "Trampling Charge",
        "description": "If the triceratops moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 13 Strength saving throw or be knocked prone. If the target is prone, the triceratops can make one stomp attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland",
      "Arctic"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/triceratops.png"
  },
  {
    "id": "troll",
    "name": "Troll",
    "size": "Large",
    "type": "Giant",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 84,
    "hit_dice": "8d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 13,
      "con": 20,
      "int": 7,
      "wis": 9,
      "cha": 7
    },
    "summary": "A stubborn large towering marauder. Codex scouts flag it as a dangerous threat around mountain and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The troll makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Smell",
        "description": "The troll has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        "name": "Regeneration",
        "description": "The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Mountain",
      "Forest",
      "Grassland",
      "Volcanic"
    ],
    "languages": "Giant",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/troll.png"
  },
  {
    "id": "tyrannosaurus-rex",
    "name": "Tyrannosaurus Rex",
    "size": "Huge",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 136,
    "hit_dice": "13d12",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 25,
      "dex": 10,
      "con": 19,
      "int": 2,
      "wis": 12,
      "cha": 9
    },
    "summary": "A brutal huge instinct-driven predator. Codex scouts flag it as a dangerous threat around forest and grassland.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The tyrannosaurus makes two attacks: one with its bite and one with its tail. It can't make both attacks against the same target."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 33 (4d12 + 7) piercing damage. If the target is a Medium or smaller creature, it is grappled (escape DC 17). Until this grapple ends, the target is restrained, and the tyrannosaurus can't bite another target."
      },
      {
        "name": "Tail",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 20 (3d8 + 7) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/tyrannosaurus-rex.png"
  },
  {
    "id": "unicorn",
    "name": "Unicorn",
    "size": "Large",
    "type": "Celestial",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 67,
    "hit_dice": "9d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 18,
      "dex": 14,
      "con": 15,
      "int": 11,
      "wis": 17,
      "cha": 16
    },
    "summary": "A brutal large radiant guardian. Codex scouts flag it as a dangerous threat around sanctum and grove.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The unicorn makes two attacks: one with its hooves and one with its horn."
      },
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      },
      {
        "name": "Horn",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage."
      },
      {
        "name": "Healing Touch",
        "description": "The unicorn touches another creature with its horn. The target magically regains 11 (2d8 + 2) hit points. In addition, the touch removes all diseases and neutralizes all poisons afflicting the target."
      },
      {
        "name": "Teleport",
        "description": "The unicorn magically teleports itself and up to three willing creatures it can see within 5 ft. of it, along with any equipment they are wearing or carrying, to a location the unicorn is familiar with, up to 1 mile away."
      }
    ],
    "traits": [
      {
        "name": "Charge",
        "description": "If the unicorn moves at least 20 ft. straight toward a target and then hits it with a horn attack on the same turn, the target takes an extra 9 (2d8) piercing damage. If the target is a creature, it must succeed on a DC 15 Strength saving throw or be knocked prone."
      },
      {
        "name": "Innate Spellcasting",
        "description": "The unicorn's innate spellcasting ability is Charisma (spell save DC 14). The unicorn can innately cast the following spells, requiring no components: At will: detect evil and good, druidcraft, pass without trace 1/day each: calm emotions, dispel evil and good, entangle"
      },
      {
        "name": "Magic Resistance",
        "description": "The unicorn has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Magic Weapons",
        "description": "The unicorn's weapon attacks are magical."
      }
    ],
    "legendary_actions": [
      {
        "name": "Hooves",
        "description": "The unicorn makes one attack with its hooves."
      },
      {
        "name": "Shimmering Shield (Costs 2 Actions)",
        "description": "The unicorn creates a shimmering, magical field around itself or another creature it can see within 60 ft. of it. The target gains a +2 bonus to AC until the end of the unicorn's next turn."
      },
      {
        "name": "Heal Self (Costs 3 Actions)",
        "description": "The unicorn magically regains 11 (2d8 + 2) hit points."
      }
    ],
    "environment": [
      "Sanctum",
      "Grove"
    ],
    "languages": "Celestial, Elvish, Sylvan, telepathy 60 ft.",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/unicorn.png"
  },
  {
    "id": "vampire-spawn",
    "name": "Vampire Spawn",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 82,
    "hit_dice": "11d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 16,
      "con": 16,
      "int": 11,
      "wis": 10,
      "cha": 12
    },
    "summary": "A brutal medium deathless stalker. Codex scouts flag it as a dangerous threat around crypt and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The vampire makes two attacks, only one of which can be a bite attack."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one willing creature, or a creature that is grappled by the vampire, incapacitated, or restrained. Hit: 6 (1d6 + 3) piercing damage plus 7 (2d6) necrotic damage. The target's hit point maximum is reduced by an amount equal to the necrotic damage taken, and the vampire regains hit points equal to that amount. The reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 8 (2d4 + 3) slashing damage. Instead of dealing damage, the vampire can grapple the target (escape DC 13)."
      }
    ],
    "traits": [
      {
        "name": "Regeneration",
        "description": "The vampire regains 10 hit points at the start of its turn if it has at least 1 hit point and isn't in sunlight or running water. If the vampire takes radiant damage or damage from holy water, this trait doesn't function at the start of the vampire's next turn."
      },
      {
        "name": "Spider Climb",
        "description": "The vampire can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Vampire Weaknesses",
        "description": "The vampire has the following flaws: Forbiddance. The vampire can't enter a residence without an invitation from one of the occupants. Harmed by Running Water. The vampire takes 20 acid damage when it ends its turn in running water. Stake to the Heart. The vampire is destroyed if a piercing weapon made of wood is driven into its heart while it is incapacitated in its resting place. Sunlight Hypersensitivity. The vampire takes 20 radiant damage when it starts its turn in sunlight. While in sunlight, it has disadvantage on attack rolls and ability checks."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins",
      "Forest",
      "Cavern"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/vampire-spawn.png"
  },
  {
    "id": "vampire-bat",
    "name": "Vampire, Bat Form",
    "size": "Medium",
    "type": "Undead",
    "subtype": "Shapechanger",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 144,
    "hit_dice": "17d8",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 5 ft. | Fly 30 ft.",
    "stats": {
      "str": 18,
      "dex": 18,
      "con": 18,
      "int": 17,
      "wis": 15,
      "cha": 18
    },
    "summary": "A brutal medium deathless stalker with shapechanger traits. Codex scouts flag it as a deadly threat around cliffs and crypt.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one willing creature, or a creature that is grappled by the vampire, incapacitated, or restrained. Hit: 7 (1d6 + 4) piercing damage plus 10 (3d6) necrotic damage. The target's hit point maximum is reduced by an amount equal to the necrotic damage taken, and the vampire regains hit points equal to that amount. The reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0. A humanoid slain in this way and then buried in the ground rises the following night as a vampire spawn under the vampire's control."
      },
      {
        "name": "Charm",
        "description": "The vampire targets one humanoid it can see within 30 ft. of it. If the target can see the vampire, the target must succeed on a DC 17 Wisdom saving throw against this magic or be charmed by the vampire. The charmed target regards the vampire as a trusted friend to be heeded and protected. Although the target isn't under the vampire's control, it takes the vampire's requests or actions in the most favorable way it can, and it is a willing target for the vampire's bit attack. Each time the vampire or the vampire's companions do anything harmful to the target, it can repeat the saving throw, ending the effect on itself on a success. Otherwise, the effect lasts 24 hours or until the vampire is destroyed, is on a different plane of existence than the target, or takes a bonus action to end the effect."
      },
      {
        "name": "Children of the Night",
        "description": "The vampire magically calls 2d4 swarms of bats or rats, provided that the sun isn't up. While outdoors, the vampire can call 3d6 wolves instead. The called creatures arrive in 1d4 rounds, acting as allies of the vampire and obeying its spoken commands. The beasts remain for 1 hour, until the vampire dies, or until the vampire dismisses them as a bonus action."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "If the vampire isn't in sun light or running water, it can use its action to polymorph into a Tiny bat or a Medium cloud of mist, or back into its true form. While in bat form, the vampire can't speak, its walking speed is 5 feet, and it has a flying speed of 30 feet. Its statistics, other than its size and speed, are unchanged. Anything it is wearing transforms with it, but nothing it is carrying does. It reverts to its true form if it dies. While in mist form, the vampire can't take any actions, speak, or manipulate objects. It is weightless, has a flying speed of 20 feet, can hover, and can enter a hostile creature's space and stop there. In addition, if air can pass through a space, the mist can do so without squeezing, and it can't pass through water. It has advantage on Strength, Dexterity, and Constitution saving throws, and it is immune to all nonmagical damage, except the damage it takes from sunlight."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the vampire fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Misty Escape",
        "description": "When it drops to 0 hit points outside its resting place, the vampire transforms into a cloud of mist (as in the Shapechanger trait) instead of falling unconscious, provided that it isn't in sunlight or running water. If it can't transform, it is destroyed. While it has 0 hit points in mist form, it can't revert to its vampire form, and it must reach its resting place within 2 hours or be destroyed. Once in its resting place, it reverts to its vampire form. It is then paralyzed until it regains at least 1 hit point. After spending 1 hour in its resting place with 0 hit points, it regains 1 hit point."
      },
      {
        "name": "Regeneration",
        "description": "The vampire regains 20 hit points at the start of its turn if it has at least 1 hit point and isn't in sunlight or running water. If the vampire takes radiant damage or damage from holy water, this trait doesn't function at the start of the vampire's next turn."
      },
      {
        "name": "Spider Climb",
        "description": "The vampire can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Vampire Weaknesses",
        "description": "The vampire has the following flaws: Forbiddance. The vampire can't enter a residence without an invitation from one of the occupants. Harmed by Running Water. The vampire takes 20 acid damage if it ends its turn in running water. Stake to the Heart. If a piercing weapon made of wood is driven into the vampire's heart while the vampire is incapacitated in its resting place, the vampire is paralyzed until the stake is removed. Sunlight Hypersensitivity. The vampire takes 20 radiant damage when it starts its turn in sunlight. While in sunlight, it has disadvantage on attack rolls and ability checks."
      }
    ],
    "legendary_actions": [
      {
        "name": "Move",
        "description": "The vampire moves up to its speed without provoking opportunity attacks."
      },
      {
        "name": "Unarmed Strike",
        "description": "The vampire makes one unarmed strike."
      },
      {
        "name": "Bite (Costs 2 Actions)",
        "description": "The vampire makes one bite attack."
      }
    ],
    "environment": [
      "Cliffs",
      "Crypt",
      "Ruins",
      "Forest"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 120 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/vampire-bat.png"
  },
  {
    "id": "vampire-mist",
    "name": "Vampire, Mist Form",
    "size": "Medium",
    "type": "Undead",
    "subtype": "Shapechanger",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 144,
    "hit_dice": "17d8",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Fly 20 ft.",
    "stats": {
      "str": 18,
      "dex": 18,
      "con": 18,
      "int": 17,
      "wis": 15,
      "cha": 18
    },
    "summary": "A brutal medium deathless stalker with shapechanger traits. Codex scouts flag it as a deadly threat around cliffs and crypt.",
    "actions": [],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "If the vampire isn't in sun light or running water, it can use its action to polymorph into a Tiny bat or a Medium cloud of mist, or back into its true form. While in bat form, the vampire can't speak, its walking speed is 5 feet, and it has a flying speed of 30 feet. Its statistics, other than its size and speed, are unchanged. Anything it is wearing transforms with it, but nothing it is carrying does. It reverts to its true form if it dies. While in mist form, the vampire can't take any actions, speak, or manipulate objects. It is weightless, has a flying speed of 20 feet, can hover, and can enter a hostile creature's space and stop there. In addition, if air can pass through a space, the mist can do so without squeezing, and it can't pass through water. It has advantage on Strength, Dexterity, and Constitution saving throws, and it is immune to all nonmagical damage, except the damage it takes from sunlight."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the vampire fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Misty Escape",
        "description": "When it drops to 0 hit points outside its resting place, the vampire transforms into a cloud of mist (as in the Shapechanger trait) instead of falling unconscious, provided that it isn't in sunlight or running water. If it can't transform, it is destroyed. While it has 0 hit points in mist form, it can't revert to its vampire form, and it must reach its resting place within 2 hours or be destroyed. Once in its resting place, it reverts to its vampire form. It is then paralyzed until it regains at least 1 hit point. After spending 1 hour in its resting place with 0 hit points, it regains 1 hit point."
      },
      {
        "name": "Regeneration",
        "description": "The vampire regains 20 hit points at the start of its turn if it has at least 1 hit point and isn't in sunlight or running water. If the vampire takes radiant damage or damage from holy water, this trait doesn't function at the start of the vampire's next turn."
      },
      {
        "name": "Spider Climb",
        "description": "The vampire can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Vampire Weaknesses",
        "description": "The vampire has the following flaws: Forbiddance. The vampire can't enter a residence without an invitation from one of the occupants. Harmed by Running Water. The vampire takes 20 acid damage if it ends its turn in running water. Stake to the Heart. If a piercing weapon made of wood is driven into the vampire's heart while the vampire is incapacitated in its resting place, the vampire is paralyzed until the stake is removed. Sunlight Hypersensitivity. The vampire takes 20 radiant damage when it starts its turn in sunlight. While in sunlight, it has disadvantage on attack rolls and ability checks."
      }
    ],
    "legendary_actions": [
      {
        "name": "Move",
        "description": "The vampire moves up to its speed without provoking opportunity attacks."
      },
      {
        "name": "Unarmed Strike",
        "description": "The vampire makes one unarmed strike."
      },
      {
        "name": "Bite (Costs 2 Actions)",
        "description": "The vampire makes one bite attack."
      }
    ],
    "environment": [
      "Cliffs",
      "Crypt",
      "Ruins",
      "Forest"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 120 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/vampire-mist.png"
  },
  {
    "id": "vampire-vampire",
    "name": "Vampire, Vampire Form",
    "size": "Medium",
    "type": "Undead",
    "subtype": "Shapechanger",
    "alignment": "Lawful Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 144,
    "hit_dice": "17d8",
    "challenge_rating": "13",
    "challenge_rating_value": 13,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 18,
      "dex": 18,
      "con": 18,
      "int": 17,
      "wis": 15,
      "cha": 18
    },
    "summary": "A brutal medium deathless stalker with shapechanger traits. Codex scouts flag it as a deadly threat around crypt and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The vampire makes two attacks, only one of which can be a bite attack."
      },
      {
        "name": "Unarmed Strike",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one creature. Hit: 8 (1d8 + 4) bludgeoning damage. Instead of dealing damage, the vampire can grapple the target (escape DC 18)."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one willing creature, or a creature that is grappled by the vampire, incapacitated, or restrained. Hit: 7 (1d6 + 4) piercing damage plus 10 (3d6) necrotic damage. The target's hit point maximum is reduced by an amount equal to the necrotic damage taken, and the vampire regains hit points equal to that amount. The reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0. A humanoid slain in this way and then buried in the ground rises the following night as a vampire spawn under the vampire's control."
      },
      {
        "name": "Charm",
        "description": "The vampire targets one humanoid it can see within 30 ft. of it. If the target can see the vampire, the target must succeed on a DC 17 Wisdom saving throw against this magic or be charmed by the vampire. The charmed target regards the vampire as a trusted friend to be heeded and protected. Although the target isn't under the vampire's control, it takes the vampire's requests or actions in the most favorable way it can, and it is a willing target for the vampire's bit attack. Each time the vampire or the vampire's companions do anything harmful to the target, it can repeat the saving throw, ending the effect on itself on a success. Otherwise, the effect lasts 24 hours or until the vampire is destroyed, is on a different plane of existence than the target, or takes a bonus action to end the effect."
      },
      {
        "name": "Children of the Night",
        "description": "The vampire magically calls 2d4 swarms of bats or rats, provided that the sun isn't up. While outdoors, the vampire can call 3d6 wolves instead. The called creatures arrive in 1d4 rounds, acting as allies of the vampire and obeying its spoken commands. The beasts remain for 1 hour, until the vampire dies, or until the vampire dismisses them as a bonus action."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "If the vampire isn't in sun light or running water, it can use its action to polymorph into a Tiny bat or a Medium cloud of mist, or back into its true form. While in bat form, the vampire can't speak, its walking speed is 5 feet, and it has a flying speed of 30 feet. Its statistics, other than its size and speed, are unchanged. Anything it is wearing transforms with it, but nothing it is carrying does. It reverts to its true form if it dies. While in mist form, the vampire can't take any actions, speak, or manipulate objects. It is weightless, has a flying speed of 20 feet, can hover, and can enter a hostile creature's space and stop there. In addition, if air can pass through a space, the mist can do so without squeezing, and it can't pass through water. It has advantage on Strength, Dexterity, and Constitution saving throws, and it is immune to all nonmagical damage, except the damage it takes from sunlight."
      },
      {
        "name": "Legendary Resistance",
        "description": "If the vampire fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Misty Escape",
        "description": "When it drops to 0 hit points outside its resting place, the vampire transforms into a cloud of mist (as in the Shapechanger trait) instead of falling unconscious, provided that it isn't in sunlight or running water. If it can't transform, it is destroyed. While it has 0 hit points in mist form, it can't revert to its vampire form, and it must reach its resting place within 2 hours or be destroyed. Once in its resting place, it reverts to its vampire form. It is then paralyzed until it regains at least 1 hit point. After spending 1 hour in its resting place with 0 hit points, it regains 1 hit point."
      },
      {
        "name": "Regeneration",
        "description": "The vampire regains 20 hit points at the start of its turn if it has at least 1 hit point and isn't in sunlight or running water. If the vampire takes radiant damage or damage from holy water, this trait doesn't function at the start of the vampire's next turn."
      },
      {
        "name": "Spider Climb",
        "description": "The vampire can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        "name": "Vampire Weaknesses",
        "description": "The vampire has the following flaws: Forbiddance. The vampire can't enter a residence without an invitation from one of the occupants. Harmed by Running Water. The vampire takes 20 acid damage if it ends its turn in running water. Stake to the Heart. If a piercing weapon made of wood is driven into the vampire's heart while the vampire is incapacitated in its resting place, the vampire is paralyzed until the stake is removed. Sunlight Hypersensitivity. The vampire takes 20 radiant damage when it starts its turn in sunlight. While in sunlight, it has disadvantage on attack rolls and ability checks."
      }
    ],
    "legendary_actions": [
      {
        "name": "Move",
        "description": "The vampire moves up to its speed without provoking opportunity attacks."
      },
      {
        "name": "Unarmed Strike",
        "description": "The vampire makes one unarmed strike."
      },
      {
        "name": "Bite (Costs 2 Actions)",
        "description": "The vampire makes one bite attack."
      }
    ],
    "environment": [
      "Crypt",
      "Ruins",
      "Forest",
      "Cavern"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 120 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/vampire-vampire.png"
  },
  {
    "id": "veteran",
    "name": "Veteran",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Any Race",
    "alignment": "Any Alignment",
    "armor_class": 17,
    "armor_class_text": "17 (Splint Armor)",
    "hit_points": 58,
    "hit_dice": "9d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 16,
      "dex": 13,
      "con": 14,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with any race traits. Codex scouts flag it as a seasoned threat around frontier and urban.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The veteran makes two longsword attacks. If it has a shortsword drawn, it can also make a shortsword attack."
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      },
      {
        "name": "Heavy Crossbow",
        "description": "Ranged Weapon Attack: +3 to hit, range 100/400 ft., one target. Hit: 6 (1d10 + 1) piercing damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Urban",
      "Stronghold",
      "Arctic"
    ],
    "languages": "any one language (usually Common)",
    "senses": "Passive Perception 12",
    "source_desc": "Veterans are professional fighters that take up arms for pay or to protect something they believe in or value. Their ranks include soldiers retired from long service and warriors who never served anyone but themselves.",
    "image": "/api/images/monsters/veteran.png"
  },
  {
    "id": "violet-fungus",
    "name": "Violet Fungus",
    "size": "Medium",
    "type": "Plant",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 5,
    "armor_class_text": "5",
    "hit_points": 18,
    "hit_dice": "4d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 5 ft.",
    "stats": {
      "str": 3,
      "dex": 1,
      "con": 10,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "summary": "A stubborn medium rooted ambusher. Codex scouts flag it as a minor threat around forest and swamp.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The fungus makes 1d4 Rotting Touch attacks."
      },
      {
        "name": "Rotting Touch",
        "description": "Melee Weapon Attack: +2 to hit, reach 10 ft., one creature. Hit: 4 (1d8) necrotic damage."
      }
    ],
    "traits": [
      {
        "name": "False Appearance",
        "description": "While the violet fungus remains motionless, it is indistinguishable from an ordinary fungus."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Swamp"
    ],
    "languages": "None listed",
    "senses": "Blindsight 30 ft. (blind beyond this radius) | Passive Perception 6",
    "source_desc": "",
    "image": "/api/images/monsters/violet-fungus.png"
  },
  {
    "id": "vrock",
    "name": "Vrock",
    "size": "Large",
    "type": "Fiend",
    "subtype": "Demon",
    "alignment": "Chaotic Evil",
    "armor_class": 15,
    "armor_class_text": "15 (Natural)",
    "hit_points": 104,
    "hit_dice": "11d10",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 40 ft. | Fly 60 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 18,
      "int": 8,
      "wis": 13,
      "cha": 8
    },
    "summary": "A stubborn large malicious planar raider with demon traits. Codex scouts flag it as a dangerous threat around cliffs and wastes.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The vrock makes two attacks: one with its beak and one with its talons."
      },
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage."
      },
      {
        "name": "Talons",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 14 (2d10 + 3) slashing damage."
      },
      {
        "name": "Spores",
        "description": "A 15-foot-radius cloud of toxic spores extends out from the vrock. The spores spread around corners. Each creature in that area must succeed on a DC 14 Constitution saving throw or become poisoned. While poisoned in this way, a target takes 5 (1d10) poison damage at the start of each of its turns. A target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. Emptying a vial of holy water on the target also ends the effect on it."
      },
      {
        "name": "Stunning Screech",
        "description": "The vrock emits a horrific screech. Each creature within 20 feet of it that can hear it and that isn't a demon must succeed on a DC 14 Constitution saving throw or be stunned until the end of the vrock's next turn ."
      }
    ],
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The vrock has advantage on saving throws against spells and other magical effects."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Wastes",
      "Rift",
      "Highlands"
    ],
    "languages": "Abyssal, telepathy 120 ft.",
    "senses": "Darkvision 120 ft. | Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/vrock.png"
  },
  {
    "id": "vulture",
    "name": "Vulture",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 5,
    "hit_dice": "1d8",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 10 ft. | Fly 50 ft.",
    "stats": {
      "str": 7,
      "dex": 10,
      "con": 13,
      "int": 2,
      "wis": 12,
      "cha": 4
    },
    "summary": "A stubborn medium instinct-driven predator. Codex scouts flag it as a minor threat around cliffs and forest.",
    "actions": [
      {
        "name": "Beak",
        "description": "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Sight and Smell",
        "description": "The vulture has advantage on Wisdom (Perception) checks that rely on sight or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The vulture has advantage on an attack roll against a creature if at least one of the vulture's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Forest"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/vulture.png"
  },
  {
    "id": "warhorse",
    "name": "Warhorse",
    "size": "Large",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 19,
    "hit_dice": "3d10",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 60 ft.",
    "stats": {
      "str": 18,
      "dex": 12,
      "con": 13,
      "int": 2,
      "wis": 12,
      "cha": 7
    },
    "summary": "A brutal large instinct-driven predator. Codex scouts flag it as a field threat around forest and wilderness.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Trampling Charge",
        "description": "If the horse moves at least 20 ft. straight toward a creature and then hits it with a hooves attack on the same turn, that target must succeed on a DC 14 Strength saving throw or be knocked prone. If the target is prone, the horse can make another attack with its hooves against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 11",
    "source_desc": "",
    "image": "/api/images/monsters/warhorse.png"
  },
  {
    "id": "warhorse-skeleton",
    "name": "Warhorse Skeleton",
    "size": "Large",
    "type": "Undead",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Armor)",
    "hit_points": 22,
    "hit_dice": "3d10",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 60 ft.",
    "stats": {
      "str": 18,
      "dex": 12,
      "con": 15,
      "int": 2,
      "wis": 8,
      "cha": 5
    },
    "summary": "A brutal large deathless stalker. Codex scouts flag it as a field threat around crypt and ruins.",
    "actions": [
      {
        "name": "Hooves",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 9",
    "source_desc": "",
    "image": "/api/images/monsters/warhorse-skeleton.png"
  },
  {
    "id": "water-elemental",
    "name": "Water Elemental",
    "size": "Large",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 14,
    "armor_class_text": "14 (Natural)",
    "hit_points": 114,
    "hit_dice": "12d10",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft. | Swim 90 ft.",
    "stats": {
      "str": 18,
      "dex": 14,
      "con": 18,
      "int": 5,
      "wis": 10,
      "cha": 8
    },
    "summary": "A brutal large living force of nature. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The elemental makes two slam attacks."
      },
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage."
      },
      {
        "name": "Whelm",
        "description": "Each creature in the elemental's space must make a DC 15 Strength saving throw. On a failure, a target takes 13 (2d8 + 4) bludgeoning damage. If it is Large or smaller, it is also grappled (escape DC 14). Until this grapple ends, the target is restrained and unable to breathe unless it can breathe water. If the saving throw is successful, the target is pushed out of the elemental's space. The elemental can grapple one Large creature or up to two Medium or smaller creatures at one time. At the start of each of the elemental's turns, each target grappled by it takes 13 (2d8 + 4) bludgeoning damage. A creature within 5 feet of the elemental can pull a creature or object out of it by taking an action to make a DC 14 Strength and succeeding."
      }
    ],
    "traits": [
      {
        "name": "Water Form",
        "description": "The elemental can enter a hostile creature's space and stop there. It can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        "name": "Freeze",
        "description": "If the elemental takes cold damage, it partially freezes; its speed is reduced by 20 ft. until the end of its next turn."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Elemental Rift",
      "Forest"
    ],
    "languages": "Aquan",
    "senses": "Darkvision 60 ft. | Passive Perception 10",
    "source_desc": "",
    "image": "/api/images/monsters/water-elemental.png"
  },
  {
    "id": "weasel",
    "name": "Weasel",
    "size": "Tiny",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 1,
    "hit_dice": "1d4",
    "challenge_rating": "0",
    "challenge_rating_value": 0,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 3,
      "dex": 16,
      "con": 8,
      "int": 2,
      "wis": 12,
      "cha": 3
    },
    "summary": "A nimble tiny instinct-driven predator. Codex scouts flag it as a minor threat around forest and wilderness.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 1 piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The weasel has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Wilderness"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/weasel.png"
  },
  {
    "id": "werebear-bear",
    "name": "Werebear, Bear Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral Good",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 135,
    "hit_dice": "18d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 40 ft. | Climb 30 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 17,
      "int": 11,
      "wis": 12,
      "cha": 12
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a dangerous threat around ruins and frontier.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "In bear form, the werebear makes two claw attacks. In humanoid form, it makes two greataxe attacks. In hybrid form, it can attack like a bear or a humanoid."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 15 (2d10 + 4) piercing damage. If the target is a humanoid, it must succeed on a DC 14 Constitution saving throw or be cursed with werebear lycanthropy."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The werebear can use its action to polymorph into a Large bear-humanoid hybrid or into a Large bear, or back into its true form, which is humanoid. Its statistics, other than its size and AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Smell",
        "description": "The werebear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/werebear-bear.png"
  },
  {
    "id": "werebear-human",
    "name": "Werebear, Human Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral Good",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 135,
    "hit_dice": "18d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 17,
      "int": 11,
      "wis": 12,
      "cha": 12
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a dangerous threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "In bear form, the werebear makes two claw attacks. In humanoid form, it makes two greataxe attacks. In hybrid form, it can attack like a bear or a humanoid."
      },
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d12 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The werebear can use its action to polymorph into a Large bear-humanoid hybrid or into a Large bear, or back into its true form, which is humanoid. Its statistics, other than its size and AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Smell",
        "description": "The werebear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/werebear-human.png"
  },
  {
    "id": "werebear-hybrid",
    "name": "Werebear, Hybrid Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral Good",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 135,
    "hit_dice": "18d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 40 ft. | Climb 30 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 17,
      "int": 11,
      "wis": 12,
      "cha": 12
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a dangerous threat around ruins and frontier.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "In bear form, the werebear makes two claw attacks. In humanoid form, it makes two greataxe attacks. In hybrid form, it can attack like a bear or a humanoid."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 15 (2d10 + 4) piercing damage. If the target is a humanoid, it must succeed on a DC 14 Constitution saving throw or be cursed with werebear lycanthropy."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      },
      {
        "name": "Greataxe",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d12 + 4) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The werebear can use its action to polymorph into a Large bear-humanoid hybrid or into a Large bear, or back into its true form, which is humanoid. Its statistics, other than its size and AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Smell",
        "description": "The werebear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Ruins",
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/werebear-hybrid.png"
  },
  {
    "id": "wereboar-boar",
    "name": "Wereboar, Boar Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral Evil",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 78,
    "hit_dice": "12d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 15,
      "int": 10,
      "wis": 11,
      "cha": 8
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Tusks",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with wereboar lycanthropy."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The wereboar can use its action to polymorph into a boar-humanoid hybrid or into a boar, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Charge (Boar or Hybrid Form Only)",
        "description": "If the wereboar moves at least 15 feet straight toward a target and then hits it with its tusks on the same turn, the target takes an extra 7 (2d6) slashing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      },
      {
        "name": "Relentless",
        "description": "If the wereboar takes 14 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wereboar-boar.png"
  },
  {
    "id": "wereboar-human",
    "name": "Wereboar, Human Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral Evil",
    "armor_class": 10,
    "armor_class_text": "10",
    "hit_points": 78,
    "hit_dice": "12d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 15,
      "int": 10,
      "wis": 11,
      "cha": 8
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wereboar makes two attacks, only one of which can be with its tusks."
      },
      {
        "name": "Maul",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The wereboar can use its action to polymorph into a boar-humanoid hybrid or into a boar, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Relentless",
        "description": "If the wereboar takes 14 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common (can't speak in boar form)",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wereboar-human.png"
  },
  {
    "id": "wereboar-hybrid",
    "name": "Wereboar, Hybrid Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral Evil",
    "armor_class": 11,
    "armor_class_text": "11 (Natural)",
    "hit_points": 78,
    "hit_dice": "12d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 15,
      "int": 10,
      "wis": 11,
      "cha": 8
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wereboar makes two attacks, only one of which can be with its tusks."
      },
      {
        "name": "Maul",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage."
      },
      {
        "name": "Tusks",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with wereboar lycanthropy."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The wereboar can use its action to polymorph into a boar-humanoid hybrid or into a boar, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Charge (Boar or Hybrid Form Only)",
        "description": "If the wereboar moves at least 15 feet straight toward a target and then hits it with its tusks on the same turn, the target takes an extra 7 (2d6) slashing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      },
      {
        "name": "Relentless",
        "description": "If the wereboar takes 14 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wereboar-hybrid.png"
  },
  {
    "id": "wererat-human",
    "name": "Wererat, Human Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Lawful Evil",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 33,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 15,
      "con": 12,
      "int": 11,
      "wis": 10,
      "cha": 8
    },
    "summary": "A nimble medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wererat makes two attacks, only one of which can be a bite."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Hand Crossbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The wererat can use its action to polymorph into a rat-humanoid hybrid or into a giant rat, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Smell",
        "description": "The wererat has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wererat-human.png"
  },
  {
    "id": "wererat-hybrid",
    "name": "Wererat, Hybrid Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Lawful Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 33,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 15,
      "con": 12,
      "int": 11,
      "wis": 10,
      "cha": 8
    },
    "summary": "A nimble medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wererat makes two attacks, only one of which can be a bite."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage. If the target is a humanoid, it must succeed on a DC 11 Constitution saving throw or be cursed with wererat lycanthropy."
      },
      {
        "name": "Shortsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        "name": "Hand Crossbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The wererat can use its action to polymorph into a rat-humanoid hybrid or into a giant rat, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Smell",
        "description": "The wererat has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wererat-hybrid.png"
  },
  {
    "id": "wererat-rat",
    "name": "Wererat, Rat Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Lawful Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 33,
    "hit_dice": "6d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 10,
      "dex": 15,
      "con": 12,
      "int": 11,
      "wis": 10,
      "cha": 8
    },
    "summary": "A nimble medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage. If the target is a humanoid, it must succeed on a DC 11 Constitution saving throw or be cursed with wererat lycanthropy."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The wererat can use its action to polymorph into a rat-humanoid hybrid or into a giant rat, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Smell",
        "description": "The wererat has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wererat-rat.png"
  },
  {
    "id": "weretiger-human",
    "name": "Weretiger, Human Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 120,
    "hit_dice": "16d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 16,
      "int": 10,
      "wis": 13,
      "cha": 11
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "In humanoid form, the weretiger makes two scimitar attacks or two longbow attacks. In hybrid form, it can attack like a humanoid or make two claw attacks."
      },
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 150/600 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The weretiger can use its action to polymorph into a tiger-humanoid hybrid or into a tiger, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The weretiger has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Darkvision 60 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/weretiger-human.png"
  },
  {
    "id": "weretiger-hybrid",
    "name": "Weretiger, Hybrid Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral",
    "armor_class": 12,
    "armor_class_text": "12",
    "hit_points": 120,
    "hit_dice": "16d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 16,
      "int": 10,
      "wis": 13,
      "cha": 11
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "In humanoid form, the weretiger makes two scimitar attacks or two longbow attacks. In hybrid form, it can attack like a humanoid or make two claw attacks."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage. If the target is a humanoid, it must succeed on a DC 13 Constitution saving throw or be cursed with weretiger lycanthropy."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage."
      },
      {
        "name": "Scimitar",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 150/600 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The weretiger can use its action to polymorph into a tiger-humanoid hybrid or into a tiger, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The weretiger has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pounce",
        "description": "If the weretiger moves at least 15 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 14 Strength saving throw or be knocked prone. If the target is prone, the weretiger can make one bite attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Darkvision 60 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/weretiger-hybrid.png"
  },
  {
    "id": "weretiger-tiger",
    "name": "Weretiger, Tiger Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Neutral",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 120,
    "hit_dice": "16d8",
    "challenge_rating": "4",
    "challenge_rating_value": 4,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 17,
      "dex": 15,
      "con": 16,
      "int": 10,
      "wis": 13,
      "cha": 11
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage. If the target is a humanoid, it must succeed on a DC 13 Constitution saving throw or be cursed with weretiger lycanthropy."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The weretiger can use its action to polymorph into a tiger-humanoid hybrid or into a tiger, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The weretiger has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pounce",
        "description": "If the weretiger moves at least 15 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 14 Strength saving throw or be knocked prone. If the target is prone, the weretiger can make one bite attack against it as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 15",
    "source_desc": "",
    "image": "/api/images/monsters/weretiger-tiger.png"
  },
  {
    "id": "werewolf-human",
    "name": "Werewolf, Human Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Chaotic Evil",
    "armor_class": 11,
    "armor_class_text": "11",
    "hit_points": 58,
    "hit_dice": "9d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 15,
      "dex": 13,
      "con": 14,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The werewolf makes two attacks: two with its spear (humanoid form) or one with its bite and one with its claws (hybrid form)."
      },
      {
        "name": "Spear",
        "description": "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 20/60 ft., one creature. Hit: 5 (1d6 + 2) piercing damage, or 6 (1d8 + 2) piercing damage if used with two hands to make a melee attack."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The werewolf can use its action to polymorph into a wolf-humanoid hybrid or into a wolf, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The werewolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/werewolf-human.png"
  },
  {
    "id": "werewolf-hybrid",
    "name": "Werewolf, Hybrid Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Chaotic Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 58,
    "hit_dice": "9d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 15,
      "dex": 13,
      "con": 14,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The werewolf makes two attacks: two with its spear (humanoid form) or one with its bite and one with its claws (hybrid form)."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with werewolf lycanthropy."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 7 (2d4 + 2) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The werewolf can use its action to polymorph into a wolf-humanoid hybrid or into a wolf, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The werewolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "Common",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/werewolf-hybrid.png"
  },
  {
    "id": "werewolf-wolf",
    "name": "Werewolf, Wolf Form",
    "size": "Medium",
    "type": "Humanoid",
    "subtype": "Human",
    "alignment": "Chaotic Evil",
    "armor_class": 12,
    "armor_class_text": "12 (Natural)",
    "hit_points": 58,
    "hit_dice": "9d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 15,
      "dex": 13,
      "con": 14,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "summary": "A brutal medium armed opportunist with human traits. Codex scouts flag it as a seasoned threat around frontier and forest.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with werewolf lycanthropy."
      }
    ],
    "traits": [
      {
        "name": "Shapechanger",
        "description": "The werewolf can use its action to polymorph into a wolf-humanoid hybrid or into a wolf, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        "name": "Keen Hearing and Smell",
        "description": "The werewolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Frontier",
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/werewolf-wolf.png"
  },
  {
    "id": "white-dragon-wyrmling",
    "name": "White Dragon Wyrmling",
    "size": "Medium",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 16,
    "armor_class_text": "16 (Natural)",
    "hit_points": 32,
    "hit_dice": "5d8",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 30 ft. | Burrow 15 ft. | Fly 60 ft. | Swim 30 ft.",
    "stats": {
      "str": 14,
      "dex": 10,
      "con": 14,
      "int": 5,
      "wis": 10,
      "cha": 11
    },
    "summary": "A brutal medium scaled tyrant. Codex scouts flag it as a seasoned threat around coast and depths.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage plus 2 (1d4) cold damage."
      },
      {
        "name": "Cold Breath",
        "description": "The dragon exhales an icy blast of hail in a 15-foot cone. Each creature in that area must make a DC 12 Constitution saving throw, taking 22 (5d8) cold damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Badlands"
    ],
    "languages": "Draconic",
    "senses": "Blindsight 10 ft. | Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/white-dragon-wyrmling.png"
  },
  {
    "id": "wight",
    "name": "Wight",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 14,
    "armor_class_text": "14 (Studded Leather Armor)",
    "hit_points": 45,
    "hit_dice": "6d8",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 30 ft.",
    "stats": {
      "str": 15,
      "dex": 14,
      "con": 16,
      "int": 10,
      "wis": 13,
      "cha": 15
    },
    "summary": "A stubborn medium deathless stalker. Codex scouts flag it as a seasoned threat around crypt and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wight makes two longsword attacks or two longbow attacks. It can use its Life Drain in place of one longsword attack."
      },
      {
        "name": "Life Drain",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) necrotic damage. The target must succeed on a DC 13 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0. A humanoid slain by this attack rises 24 hours later as a zombie under the wight's control, unless the humanoid is restored to life or its body is destroyed. The wight can have no more than twelve zombies under its control at one time."
      },
      {
        "name": "Longsword",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) slashing damage, or 7 (1d10 + 2) slashing damage if used with two hands."
      },
      {
        "name": "Longbow",
        "description": "Ranged Weapon Attack: +4 to hit, range 150/600 ft., one target. Hit: 6 (1d8 + 2) piercing damage."
      }
    ],
    "traits": [
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the wight has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 60 ft. | Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/wight.png"
  },
  {
    "id": "will-o-wisp",
    "name": "Will-o'-Wisp",
    "size": "Tiny",
    "type": "Undead",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 19,
    "armor_class_text": "19",
    "hit_points": 22,
    "hit_dice": "9d4",
    "challenge_rating": "2",
    "challenge_rating_value": 2,
    "speed": "Walk 0 ft. | Fly 50 ft. | Hover true",
    "stats": {
      "str": 1,
      "dex": 28,
      "con": 10,
      "int": 13,
      "wis": 14,
      "cha": 11
    },
    "summary": "A nimble tiny deathless stalker. Codex scouts flag it as a seasoned threat around cliffs and crypt.",
    "actions": [
      {
        "name": "Shock",
        "description": "Melee Spell Attack: +4 to hit, reach 5 ft., one creature. Hit: 9 (2d8) lightning damage."
      },
      {
        "name": "Invisibility",
        "description": "The will-o'-wisp and its light magically become invisible until it attacks or uses its Consume Life, or until its concentration ends (as if concentrating on a spell)."
      }
    ],
    "traits": [
      {
        "name": "Consume Life",
        "description": "As a bonus action, the will-o'-wisp can target one creature it can see within 5 ft. of it that has 0 hit points and is still alive. The target must succeed on a DC 10 Constitution saving throw against this magic or die. If the target dies, the will-o'-wisp regains 10 (3d6) hit points."
      },
      {
        "name": "Ephemeral",
        "description": "The will-o'-wisp can't wear or carry anything."
      },
      {
        "name": "Incorporeal Movement",
        "description": "The will-o'-wisp can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        "name": "Variable Illumination",
        "description": "The will-o'-wisp sheds bright light in a 5- to 20-foot radius and dim light for an additional number of ft. equal to the chosen radius. The will-o'-wisp can alter the radius as a bonus action."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Crypt",
      "Ruins",
      "Cavern"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 120 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/will-o-wisp.png"
  },
  {
    "id": "winter-wolf",
    "name": "Winter Wolf",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 75,
    "hit_dice": "10d10",
    "challenge_rating": "3",
    "challenge_rating_value": 3,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 18,
      "dex": 13,
      "con": 14,
      "int": 7,
      "wis": 12,
      "cha": 8
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a seasoned threat around wilderness and urban.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) piercing damage. If the target is a creature, it must succeed on a DC 14 Strength saving throw or be knocked prone."
      },
      {
        "name": "Cold Breath",
        "description": "The wolf exhales a blast of freezing wind in a 15-foot cone. Each creature in that area must make a DC 12 Dexterity saving throw, taking 18 (4d8) cold damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      },
      {
        "name": "Snow Camouflage",
        "description": "The wolf has advantage on Dexterity (Stealth) checks made to hide in snowy terrain."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Urban",
      "Stronghold",
      "Forest"
    ],
    "languages": "Common, Giant, Winter Wolf",
    "senses": "Passive Perception 15",
    "source_desc": "The arctic-dwelling winter wolf is as large as a dire wolf but has snow-white fur and pale blue eyes. Frost giants use these evil creatures as guards and hunting companions, putting the wolves’ deadly breath weapon to use against their foes. Winter wolves communicate with one another using growls and barks, but they speak Common and Giant well enough to follow simple conversations.",
    "image": "/api/images/monsters/winter-wolf.png"
  },
  {
    "id": "wolf",
    "name": "Wolf",
    "size": "Medium",
    "type": "Beast",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 11,
    "hit_dice": "2d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 40 ft.",
    "stats": {
      "str": 12,
      "dex": 15,
      "con": 12,
      "int": 3,
      "wis": 12,
      "cha": 6
    },
    "summary": "A nimble medium instinct-driven predator. Codex scouts flag it as a minor threat around forest and grassland.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        "name": "Pack Tactics",
        "description": "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Forest",
      "Grassland"
    ],
    "languages": "None listed",
    "senses": "Passive Perception 13",
    "source_desc": "",
    "image": "/api/images/monsters/wolf.png"
  },
  {
    "id": "worg",
    "name": "Worg",
    "size": "Large",
    "type": "Monstrosity",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 26,
    "hit_dice": "4d10",
    "challenge_rating": "1/2",
    "challenge_rating_value": 0.5,
    "speed": "Walk 50 ft.",
    "stats": {
      "str": 16,
      "dex": 13,
      "con": 13,
      "int": 7,
      "wis": 11,
      "cha": 8
    },
    "summary": "A brutal large unnatural apex hunter. Codex scouts flag it as a field threat around wilderness and cavern.",
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      }
    ],
    "traits": [
      {
        "name": "Keen Hearing and Smell",
        "description": "The worg has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Wilderness",
      "Cavern",
      "Frontier"
    ],
    "languages": "Goblin, Worg",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "A worg is an evil predator that delights in hunting and devouring creatures weaker than itself. Cunning and malevolent, worgs roam across the remote wilderness or are raised by goblins and hobgoblins. Those creatures use worgs as mounts, but a worg will turn on its rider if it feels mistreated or malnourished. Worgs speak in their own language and Goblin, and a few learn to speak Common as well.",
    "image": "/api/images/monsters/worg.png"
  },
  {
    "id": "wraith",
    "name": "Wraith",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 13,
    "armor_class_text": "13",
    "hit_points": 67,
    "hit_dice": "9d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 0 ft. | Fly 60 ft. | Hover true",
    "stats": {
      "str": 6,
      "dex": 16,
      "con": 16,
      "int": 12,
      "wis": 14,
      "cha": 15
    },
    "summary": "A nimble medium deathless stalker. Codex scouts flag it as a dangerous threat around cliffs and crypt.",
    "actions": [
      {
        "name": "Life Drain",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 21 (4d8 + 3) necrotic damage. The target must succeed on a DC 14 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
      },
      {
        "name": "Create Specter",
        "description": "The wraith targets a humanoid within 10 feet of it that has been dead for no longer than 1 minute and died violently. The target's spirit rises as a specter in the space of its corpse or in the nearest unoccupied space. The specter is under the wraith's control. The wraith can have no more than seven specters under its control at one time."
      }
    ],
    "traits": [
      {
        "name": "Incorporeal Movement",
        "description": "The wraith can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the wraith has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Crypt",
      "Ruins",
      "Cavern"
    ],
    "languages": "the languages it knew in life",
    "senses": "Darkvision 60 ft. | Passive Perception 12",
    "source_desc": "",
    "image": "/api/images/monsters/wraith.png"
  },
  {
    "id": "wyvern",
    "name": "Wyvern",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Unaligned",
    "armor_class": 13,
    "armor_class_text": "13 (Natural)",
    "hit_points": 110,
    "hit_dice": "13d10",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 20 ft. | Fly 80 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 16,
      "int": 5,
      "wis": 12,
      "cha": 6
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wyvern makes two attacks: one with its bite and one with its stinger. While flying, it can use its claws in place of one other attack."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one creature. Hit: 11 (2d6 + 4) piercing damage."
      },
      {
        "name": "Claws",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      },
      {
        "name": "Stinger",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one creature. Hit: 11 (2d6 + 4) piercing damage. The target must make a DC 15 Constitution saving throw, taking 24 (7d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Mountain",
      "Wilderness",
      "Highlands"
    ],
    "languages": "None listed",
    "senses": "Darkvision 60 ft. | Passive Perception 14",
    "source_desc": "",
    "image": "/api/images/monsters/wyvern.png"
  },
  {
    "id": "xorn",
    "name": "Xorn",
    "size": "Medium",
    "type": "Elemental",
    "subtype": "",
    "alignment": "Neutral",
    "armor_class": 19,
    "armor_class_text": "19 (Natural)",
    "hit_points": 73,
    "hit_dice": "7d8",
    "challenge_rating": "5",
    "challenge_rating_value": 5,
    "speed": "Walk 20 ft. | Burrow 20 ft.",
    "stats": {
      "str": 17,
      "dex": 10,
      "con": 22,
      "int": 11,
      "wis": 10,
      "cha": 11
    },
    "summary": "A stubborn medium living force of nature. Codex scouts flag it as a dangerous threat around badlands and elemental rift.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The xorn makes three claw attacks and one bite attack."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (3d6 + 3) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      }
    ],
    "traits": [
      {
        "name": "Earth Glide",
        "description": "The xorn can burrow through nonmagical, unworked earth and stone. While doing so, the xorn doesn't disturb the material it moves through."
      },
      {
        "name": "Stone Camouflage",
        "description": "The xorn has advantage on Dexterity (Stealth) checks made to hide in rocky terrain."
      },
      {
        "name": "Treasure Sense",
        "description": "The xorn can pinpoint, by scent, the location of precious metals and stones, such as coins and gems, within 60 ft. of it."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Badlands",
      "Elemental Rift",
      "Mountain",
      "Cavern"
    ],
    "languages": "Terran",
    "senses": "Darkvision 60 ft. | Tremorsense 60 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/xorn.png"
  },
  {
    "id": "young-black-dragon",
    "name": "Young Black Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 127,
    "hit_dice": "15d10",
    "challenge_rating": "7",
    "challenge_rating_value": 7,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 19,
      "dex": 14,
      "con": 17,
      "int": 12,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage plus 4 (1d8) acid damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        "name": "Acid Breath",
        "description": "The dragon exhales acid in a 30-foot line that is 5 feet wide. Each creature in that line must make a DC 14 Dexterity saving throw, taking 49 (11d8) acid damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/young-black-dragon.png"
  },
  {
    "id": "young-blue-dragon",
    "name": "Young Blue Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 152,
    "hit_dice": "16d10",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 40 ft. | Burrow 20 ft. | Fly 80 ft.",
    "stats": {
      "str": 21,
      "dex": 10,
      "con": 19,
      "int": 14,
      "wis": 13,
      "cha": 17
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) piercing damage plus 5 (1d10) lightning damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage."
      },
      {
        "name": "Lightning Breath",
        "description": "The dragon exhales lightning in an 60-foot line that is 5 feet wide. Each creature in that line must make a DC 16 Dexterity saving throw, taking 55 (10d10) lightning damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 19",
    "source_desc": "",
    "image": "/api/images/monsters/young-blue-dragon.png"
  },
  {
    "id": "young-brass-dragon",
    "name": "Young Brass Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 110,
    "hit_dice": "13d10",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 40 ft. | Burrow 20 ft. | Fly 80 ft.",
    "stats": {
      "str": 19,
      "dex": 10,
      "con": 17,
      "int": 12,
      "wis": 11,
      "cha": 15
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around cliffs and badlands.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in a 40-foot line that is 5 feet wide. Each creature in that line must make a DC 14 Dexterity saving throw, taking 42 (12d6) fire damage on a failed save, or half as much damage on a successful one. Sleep Breath. The dragon exhales sleep gas in a 30-foot cone. Each creature in that area must succeed on a DC 14 Constitution saving throw or fall unconscious for 5 minutes. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Badlands",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/young-brass-dragon.png"
  },
  {
    "id": "young-bronze-dragon",
    "name": "Young Bronze Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 142,
    "hit_dice": "15d10",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 21,
      "dex": 10,
      "con": 19,
      "int": 14,
      "wis": 13,
      "cha": 17
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Lightning Breath. The dragon exhales lightning in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 15 Dexterity saving throw, taking 55 (10d10) lightning damage on a failed save, or half as much damage on a successful one. Repulsion Breath. The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 15 Strength saving throw. On a failed save, the creature is pushed 40 feet away from the dragon."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/young-bronze-dragon.png"
  },
  {
    "id": "young-copper-dragon",
    "name": "Young Copper Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Good",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 119,
    "hit_dice": "14d10",
    "challenge_rating": "7",
    "challenge_rating_value": 7,
    "speed": "Walk 40 ft. | Climb 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 19,
      "dex": 12,
      "con": 17,
      "int": 16,
      "wis": 13,
      "cha": 15
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Acid Breath. The dragon exhales acid in an 40-foot line that is 5 feet wide. Each creature in that line must make a DC 14 Dexterity saving throw, taking 40 (9d8) acid damage on a failed save, or half as much damage on a successful one. Slowing Breath. The dragon exhales gas in a 30-foot cone. Each creature in that area must succeed on a DC 14 Constitution saving throw. On a failed save, the creature can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the creature can use either an action or a bonus action on its turn, but not both. These effects last for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself with a successful save."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/young-copper-dragon.png"
  },
  {
    "id": "young-gold-dragon",
    "name": "Young Gold Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 178,
    "hit_dice": "17d10",
    "challenge_rating": "10",
    "challenge_rating_value": 10,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 23,
      "dex": 14,
      "con": 21,
      "int": 16,
      "wis": 13,
      "cha": 20
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Fire Breath. The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 55 (10d10) fire damage on a failed save, or half as much damage on a successful one. Weakening Breath. The dragon exhales gas in a 30-foot cone. Each creature in that area must succeed on a DC 17 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 19",
    "source_desc": "",
    "image": "/api/images/monsters/young-gold-dragon.png"
  },
  {
    "id": "young-green-dragon",
    "name": "Young Green Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 136,
    "hit_dice": "16d10",
    "challenge_rating": "8",
    "challenge_rating_value": 8,
    "speed": "Walk 40 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 19,
      "dex": 12,
      "con": 17,
      "int": 16,
      "wis": 13,
      "cha": 15
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage plus 7 (2d6) poison damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        "name": "Poison Breath",
        "description": "The dragon exhales poisonous gas in a 30-foot cone. Each creature in that area must make a DC 14 Constitution saving throw, taking 42 (12d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Amphibious",
        "description": "The dragon can breathe air and water."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Mountain"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 17",
    "source_desc": "",
    "image": "/api/images/monsters/young-green-dragon.png"
  },
  {
    "id": "young-red-dragon",
    "name": "Young Red Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 178,
    "hit_dice": "17d10",
    "challenge_rating": "10",
    "challenge_rating_value": 10,
    "speed": "Walk 40 ft. | Climb 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 23,
      "dex": 10,
      "con": 21,
      "int": 14,
      "wis": 11,
      "cha": 19
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around cliffs and ruins.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 3 (1d6) fire damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Fire Breath",
        "description": "The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Ruins",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 18",
    "source_desc": "",
    "image": "/api/images/monsters/young-red-dragon.png"
  },
  {
    "id": "young-silver-dragon",
    "name": "Young Silver Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Lawful Good",
    "armor_class": 18,
    "armor_class_text": "18 (Natural)",
    "hit_points": 168,
    "hit_dice": "16d10",
    "challenge_rating": "9",
    "challenge_rating_value": 9,
    "speed": "Walk 40 ft. | Fly 80 ft.",
    "stats": {
      "str": 23,
      "dex": 10,
      "con": 21,
      "int": 14,
      "wis": 11,
      "cha": 19
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around cliffs and mountain.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        "name": "Breath Weapons",
        "description": "The dragon uses one of the following breath weapons. Cold Breath. The dragon exhales an icy blast in a 30-foot cone. Each creature in that area must make a DC 17 Constitution saving throw, taking 54 (12d8) cold damage on a failed save, or half as much damage on a successful one. Paralyzing Breath. The dragon exhales paralyzing gas in a 30-foot cone. Each creature in that area must succeed on a DC 17 Constitution saving throw or be paralyzed for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    "traits": [],
    "legendary_actions": [],
    "environment": [
      "Cliffs",
      "Mountain",
      "Wilderness"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 18",
    "source_desc": "",
    "image": "/api/images/monsters/young-silver-dragon.png"
  },
  {
    "id": "young-white-dragon",
    "name": "Young White Dragon",
    "size": "Large",
    "type": "Dragon",
    "subtype": "",
    "alignment": "Chaotic Evil",
    "armor_class": 17,
    "armor_class_text": "17 (Natural)",
    "hit_points": 133,
    "hit_dice": "14d10",
    "challenge_rating": "6",
    "challenge_rating_value": 6,
    "speed": "Walk 40 ft. | Burrow 20 ft. | Fly 80 ft. | Swim 40 ft.",
    "stats": {
      "str": 18,
      "dex": 10,
      "con": 18,
      "int": 6,
      "wis": 11,
      "cha": 12
    },
    "summary": "A brutal large scaled tyrant. Codex scouts flag it as a dangerous threat around coast and depths.",
    "actions": [
      {
        "name": "Multiattack",
        "description": "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        "name": "Bite",
        "description": "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage plus 4 (1d8) cold damage."
      },
      {
        "name": "Claw",
        "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        "name": "Cold Breath",
        "description": "The dragon exhales an icy blast in a 30-foot cone. Each creature in that area must make a DC 15 Constitution saving throw, taking 45 (10d8) cold damage on a failed save, or half as much damage on a successful one."
      }
    ],
    "traits": [
      {
        "name": "Ice Walk",
        "description": "The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, difficult terrain composed of ice or snow doesn't cost it extra moment."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Coast",
      "Depths",
      "Cliffs",
      "Badlands"
    ],
    "languages": "Common, Draconic",
    "senses": "Blindsight 30 ft. | Darkvision 120 ft. | Passive Perception 16",
    "source_desc": "",
    "image": "/api/images/monsters/young-white-dragon.png"
  },
  {
    "id": "zombie",
    "name": "Zombie",
    "size": "Medium",
    "type": "Undead",
    "subtype": "",
    "alignment": "Neutral Evil",
    "armor_class": 8,
    "armor_class_text": "8",
    "hit_points": 22,
    "hit_dice": "3d8",
    "challenge_rating": "1/4",
    "challenge_rating_value": 0.25,
    "speed": "Walk 20 ft.",
    "stats": {
      "str": 13,
      "dex": 6,
      "con": 16,
      "int": 3,
      "wis": 6,
      "cha": 5
    },
    "summary": "A stubborn medium deathless stalker. Codex scouts flag it as a minor threat around crypt and ruins.",
    "actions": [
      {
        "name": "Slam",
        "description": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage."
      }
    ],
    "traits": [
      {
        "name": "Undead Fortitude",
        "description": "If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5+the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead."
      }
    ],
    "legendary_actions": [],
    "environment": [
      "Crypt",
      "Ruins"
    ],
    "languages": "understands all languages it spoke in life but can't speak",
    "senses": "Darkvision 60 ft. | Passive Perception 8",
    "source_desc": "",
    "image": "/api/images/monsters/zombie.png"
  }
];

export const MONSTER_TYPES = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Swarm of Tiny Beasts",
  "Undead"
];

export const MONSTER_ENVIRONMENTS = [
  "Arctic",
  "Badlands",
  "Cavern",
  "Cliffs",
  "Coast",
  "Crypt",
  "Depths",
  "Desert",
  "Dungeon",
  "Elemental Rift",
  "Forest",
  "Frontier",
  "Grassland",
  "Grove",
  "Highlands",
  "Mountain",
  "Rift",
  "Ruins",
  "Sanctum",
  "Sewer",
  "Stronghold",
  "Swamp",
  "Underdark",
  "Urban",
  "Vault",
  "Volcanic",
  "Wastes",
  "Wilderness"
];

export const MONSTER_CODEX_META = {
  "total": 334,
  "source": "2014 5e SRD monsters"
};

export const MONSTER_DEFENSES = {
  "adult-black-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "adult-blue-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "adult-brass-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "adult-bronze-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "adult-copper-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "adult-gold-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "adult-green-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "adult-red-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "adult-silver-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "adult-white-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "air-elemental": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "lightning",
      "thunder",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Unconscious"
    ]
  },
  "ancient-black-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "ancient-blue-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "ancient-brass-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "ancient-bronze-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "ancient-copper-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "ancient-gold-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "ancient-green-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "ancient-red-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "ancient-silver-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "ancient-white-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "androsphinx": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "psychic",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": [
      "Charmed",
      "Frightened"
    ]
  },
  "animated-armor": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison",
      "psychic"
    ],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "archmage": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "damage from spells",
      "bludgeoning, piercing, and slashing from nonmagical attacks (from stoneskin)"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "assassin": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "poison"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "awakened-shrub": {
    "damage_vulnerabilities": [
      "fire"
    ],
    "damage_resistances": [
      "piercing"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "awakened-tree": {
    "damage_vulnerabilities": [
      "fire"
    ],
    "damage_resistances": [
      "bludgeoning",
      "piercing"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "azer": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "balor": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "barbed-devil": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "bearded-devil": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "behir": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "black-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "black-pudding": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid",
      "cold",
      "lightning",
      "slashing"
    ],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Prone"
    ]
  },
  "blue-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "bone-devil": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "brass-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "bronze-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "chain-devil": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "chuul": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "clay-golem": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid",
      "poison",
      "psychic",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "copper-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "couatl": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "radiant"
    ],
    "damage_immunities": [
      "psychic",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": []
  },
  "deva": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "radiant",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened"
    ]
  },
  "djinni": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning",
      "thunder"
    ],
    "condition_immunities": []
  },
  "doppelganger": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed"
    ]
  },
  "dragon-turtle": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "fire"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "dretch": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "duergar": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "poison"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "dust-mephit": {
    "damage_vulnerabilities": [
      "fire"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "earth-elemental": {
    "damage_vulnerabilities": [
      "thunder"
    ],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Unconscious"
    ]
  },
  "efreeti": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "erinyes": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "fire-elemental": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Unconscious"
    ]
  },
  "fire-giant": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "flesh-golem": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning",
      "poison",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "flying-sword": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison",
      "psychic"
    ],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Blinded",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "frost-giant": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "gargoyle": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Petrified",
      "Poisoned"
    ]
  },
  "gelatinous-cube": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Prone"
    ]
  },
  "ghast": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "necrotic"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned",
      "Charmed",
      "Exhaustion"
    ]
  },
  "ghost": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid",
      "fire",
      "lightning",
      "thunder",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "cold",
      "necrotic",
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained"
    ]
  },
  "ghoul": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned",
      "Charmed",
      "Exhaustion"
    ]
  },
  "gibbering-mouther": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Prone"
    ]
  },
  "glabrezu": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "gold-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "gorgon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Petrified"
    ]
  },
  "gray-ooze": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid",
      "cold",
      "fire"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Prone"
    ]
  },
  "green-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "grick": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "grimlock": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Blinded"
    ]
  },
  "guardian-naga": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Poisoned"
    ]
  },
  "gynosphinx": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "psychic"
    ],
    "condition_immunities": [
      "Charmed",
      "Frightened"
    ]
  },
  "half-red-dragon-veteran": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "fire"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "hell-hound": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "hezrou": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "homunculus": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Poisoned"
    ]
  },
  "horned-devil": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "ice-devil": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "ice-mephit": {
    "damage_vulnerabilities": [
      "bludgeoning",
      "fire"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "cold",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "imp": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "invisible-stalker": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Unconscious"
    ]
  },
  "iron-golem": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire",
      "poison",
      "psychic",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "kraken": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": [
      "Frightened",
      "Paralyzed"
    ]
  },
  "lemure": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Poisoned"
    ]
  },
  "lich": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "lightning",
      "necrotic"
    ],
    "damage_immunities": [
      "poison",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Poisoned"
    ]
  },
  "magma-mephit": {
    "damage_vulnerabilities": [
      "cold"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "magmin": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "marilith": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "mimic": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": [
      "Prone"
    ]
  },
  "minotaur-skeleton": {
    "damage_vulnerabilities": [
      "bludgeoning"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Poisoned"
    ]
  },
  "mummy": {
    "damage_vulnerabilities": [
      "fire"
    ],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "necrotic",
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Poisoned"
    ]
  },
  "mummy-lord": {
    "damage_vulnerabilities": [
      "fire"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "necrotic",
      "poison",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Poisoned"
    ]
  },
  "nalfeshnee": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "night-hag": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed"
    ]
  },
  "nightmare": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "ochre-jelly": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid"
    ],
    "damage_immunities": [
      "lightning",
      "slashing"
    ],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Blinded",
      "Exhaustion",
      "Frightened",
      "Prone"
    ]
  },
  "ogre-zombie": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "pit-fiend": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "planetar": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "radiant",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened"
    ]
  },
  "quasit": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "rakshasa": {
    "damage_vulnerabilities": [
      "piercing from magic weapons wielded by good creatures"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": []
  },
  "red-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "remorhaz": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold",
      "fire"
    ],
    "condition_immunities": []
  },
  "rug-of-smothering": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison",
      "psychic"
    ],
    "condition_immunities": [
      "Blinded",
      "Charmed",
      "Blinded",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "salamander": {
    "damage_vulnerabilities": [
      "cold"
    ],
    "damage_resistances": [
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "shadow": {
    "damage_vulnerabilities": [
      "radiant"
    ],
    "damage_resistances": [
      "acid",
      "cold",
      "fire",
      "lightning",
      "thunder",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "necrotic",
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained"
    ]
  },
  "shambling-mound": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire"
    ],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": [
      "Blinded",
      "Blinded",
      "Exhaustion"
    ]
  },
  "shield-guardian": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Poisoned"
    ]
  },
  "shrieker": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Blinded",
      "Blinded",
      "Frightened"
    ]
  },
  "silver-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "skeleton": {
    "damage_vulnerabilities": [
      "bludgeoning"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned",
      "Exhaustion"
    ]
  },
  "solar": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "radiant",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "necrotic",
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned"
    ]
  },
  "specter": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid",
      "cold",
      "fire",
      "lightning",
      "thunder",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "necrotic",
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Unconscious"
    ]
  },
  "spirit-naga": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Poisoned"
    ]
  },
  "steam-mephit": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire",
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "stone-golem": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison",
      "psychic",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned"
    ]
  },
  "storm-giant": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold"
    ],
    "damage_immunities": [
      "lightning",
      "thunder"
    ],
    "condition_immunities": []
  },
  "succubus-incubus": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "poison",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "swarm-of-bats": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-beetles": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-centipedes": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-insects": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-poisonous-snakes": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-quippers": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-rats": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-ravens": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-spiders": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "swarm-of-wasps": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "bludgeoning",
      "piercing",
      "slashing"
    ],
    "damage_immunities": [],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ]
  },
  "tarrasque": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire",
      "poison",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "condition_immunities": [
      "Charmed",
      "Frightened",
      "Paralyzed",
      "Poisoned"
    ]
  },
  "treant": {
    "damage_vulnerabilities": [
      "fire"
    ],
    "damage_resistances": [
      "bludgeoning",
      "piercing"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "unicorn": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Paralyzed",
      "Poisoned"
    ]
  },
  "vampire-vampire": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "necrotic",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "vampire-bat": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "necrotic",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "vampire-mist": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "necrotic",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "vampire-spawn": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "necrotic",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "violet-fungus": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [],
    "condition_immunities": [
      "Blinded",
      "Blinded",
      "Frightened"
    ]
  },
  "vrock": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "cold",
      "fire",
      "lightning",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "warhorse-skeleton": {
    "damage_vulnerabilities": [
      "bludgeoning"
    ],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Poisoned"
    ]
  },
  "water-elemental": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Unconscious"
    ]
  },
  "werebear-bear": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "werebear-human": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "werebear-hybrid": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "wereboar-boar": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "wereboar-human": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "wereboar-hybrid": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "wererat-human": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "wererat-hybrid": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "wererat-rat": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "weretiger-human": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "weretiger-hybrid": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "weretiger-tiger": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "werewolf-human": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "werewolf-hybrid": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "werewolf-wolf": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "condition_immunities": []
  },
  "white-dragon-wyrmling": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "wight": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "necrotic",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Poisoned"
    ]
  },
  "will-o-wisp": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid",
      "cold",
      "fire",
      "necrotic",
      "thunder",
      "bludgeoning, piercing, and slashing from nonmagical weapons"
    ],
    "damage_immunities": [
      "lightning",
      "poison"
    ],
    "condition_immunities": [
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Poisoned",
      "Prone",
      "Restrained",
      "Unconscious"
    ]
  },
  "winter-wolf": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "wraith": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "acid",
      "cold",
      "fire",
      "lightning",
      "thunder",
      "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"
    ],
    "damage_immunities": [
      "necrotic",
      "poison"
    ],
    "condition_immunities": [
      "Charmed",
      "Exhaustion",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained"
    ]
  },
  "xorn": {
    "damage_vulnerabilities": [],
    "damage_resistances": [
      "piercing and slashing from nonmagical weapons that aren't adamantine"
    ],
    "damage_immunities": [],
    "condition_immunities": []
  },
  "young-black-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "young-blue-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "young-brass-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "young-bronze-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "lightning"
    ],
    "condition_immunities": []
  },
  "young-copper-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "acid"
    ],
    "condition_immunities": []
  },
  "young-gold-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "young-green-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  },
  "young-red-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "fire"
    ],
    "condition_immunities": []
  },
  "young-silver-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "young-white-dragon": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "cold"
    ],
    "condition_immunities": []
  },
  "zombie": {
    "damage_vulnerabilities": [],
    "damage_resistances": [],
    "damage_immunities": [
      "poison"
    ],
    "condition_immunities": [
      "Poisoned"
    ]
  }
};
