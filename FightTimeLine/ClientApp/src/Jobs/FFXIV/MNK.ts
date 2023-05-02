import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapStatuses, IJobTemplate, IAbility, ITrait } from "../../core/Models";
import { getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared";
import { abilityRemovedTrait, abilityTrait } from "./traits";


const statuses = MapStatuses({
  mantra: {
    duration: 15,
    effects: [Effects.healingIncrease.party(20)]
  },
  perfectBalance: {
    duration: 20
  },
  riddleOofEarth: {
    duration: 10,
    effects: [Effects.shield.solo(20)]
  },
  riddleOfFire: {
    duration: 20
  },
  riddleOfWind: {
    duration: 15
  },
  brotherhood: {
    duration: 15
  }
});

const abilities = [
  {
    name: "Steel Peak",
    translation: {
      de: "Stahlzinnen",
      en: "Steel Peak",
      fr: "Charge d'acier",
      cn: "铁山靠",
      ja: "鉄山靠"
    },
    cooldown: 1,
    xivDbId: "64",
    abilityType: AbilityType.Damage,
    levelAcquired: 15
  },
  {
    name: "Thunderclap",
    translation: {
      de: "Donnersprung",
      ja: "\u629C\u91CD\u6B69\u6CD5",
      en: "Thunderclap",
      fr: "\u00C9lan fulgurant",
      cn: "轻身步法",
    },
    cooldown: 30,
    xivDbId: "25762",
    abilityType: AbilityType.Utility,
    levelAcquired: 35,
    charges: {
      count: 2,
      cooldown: 30
    },
  },
  {
    name: "Howling Fist",
    translation: {
      de: "Heulende Faust",
      en: "Howling Fist",
      fr: "Poing hurlant",
      cn: "空鸣拳",
      ja: "空鳴拳"
    },
    cooldown: 1,
    xivDbId: "67",
    abilityType: AbilityType.Damage,
    levelAcquired: 40
  },
  {
    name: "Enlightenment",
    translation: {
      de: "Weg zur Erleuchtung",
      en: "Enlightenment",
      fr: "Illumination",
      cn: "万象斗气圈",
      ja: "万象闘気圏"
    },
    cooldown: 1,
    xivDbId: "16474",
    abilityType: AbilityType.Damage,
    levelAcquired: 74
  },
  {
    name: "The Forbidden Chakra",
    translation: {
      de: "Verbotenes Chakra",
      en: "the Forbidden Chakra",
      fr: "Chakra interdit",
      cn: "阴阳斗气斩",
      ja: "陰陽闘気斬"
    },
    cooldown: 1,
    xivDbId: "3547",
    abilityType: AbilityType.Damage,
    levelAcquired: 54
  },
  {
    name: "Mantra",
    translation: {
      de: "Mantra",
      ja: "\u30DE\u30F3\u30C8\u30E9",
      en: "Mantra",
      fr: "Mantra",
      cn: "真言",
    },
    cooldown: 90,
    xivDbId: "65",
    statuses: [statuses.mantra],
    abilityType: AbilityType.HealingBuff,
    levelAcquired: 42
  },
  {
    name: "Perfect Balance",
    translation: {
      de: "Improvisation",
      ja: "\u8E0F\u9CF4",
      en: "Perfect Balance",
      fr: "\u00C9quilibre parfait",
      cn: "震脚",
    },
    cooldown: 40,
    xivDbId: "69",
    statuses: [statuses.perfectBalance],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 50,
    charges: {
      count: 2,
      cooldown: 40
    }
  },

  {
    name: "Riddle of Earth",
    translation: {
      de: "Steinernes Enigma",
      ja: "\u91D1\u525B\u306E\u6975\u610F",
      en: "Riddle of Earth",
      fr: "\u00C9nigme de la terre",
      cn: "金刚极意",
    },
    duration: 10,
    cooldown: 120,
    xivDbId: "7394",
    statuses: [statuses.riddleOofEarth],
    abilityType: AbilityType.Utility | AbilityType.SelfShield,
    charges: {
      count: 3,
      cooldown: 30
    },
    levelAcquired: 64
  },
  {
    name: "Riddle of Fire",
    translation: {
      de: "Flammendes Enigma",
      ja: "\u7D05\u84EE\u306E\u6975\u610F",
      en: "Riddle of Fire",
      fr: "\u00C9nigme du feu",
      cn: "红莲极意",
    },
    cooldown: 60,
    xivDbId: "7395",
    statuses: [statuses.riddleOfFire],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 68
  },
  {
    name: "Riddle of Wind",
    translation: {
      de: "St\u00FCrmendes Enigma",
      ja: "\u75BE\u98A8\u306E\u6975\u610F",
      en: "Riddle of Wind",
      fr: "\u00C9nigme du vent",
      cn: "疾风极意",
    },
    cooldown: 90,
    xivDbId: 25766,
    statuses: [statuses.riddleOfWind],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 72
  },
  {
    name: "Brotherhood",
    translation: {
      de: "Bruderschaft",
      ja: "\u6843\u5712\u7D50\u7FA9",
      en: "Brotherhood",
      fr: "Fraternit\u00E9",
      cn: "义结金兰",
    },
    cooldown: 120,
    xivDbId: "7396",
    statuses: [statuses.brotherhood],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 70
  },
  {
    name: "Anatman",
    translation: {
      de: "Anatman",
      ja: "\u7121\u6211",
      en: "Anatman",
      fr: "Anatman",
      cn: "无我",
    },
    cooldown: 60,
    xivDbId: "16475",
    abilityType: AbilityType.Utility,
    levelAcquired: 70
  },
  ...getAbilitiesFrom(meleeSharedAbilities),
  medicine.Strength
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Steel Peak Mastery",
    level: 54,
    apply: abilityRemovedTrait("Steel Peak", 54)
  },
  {
    name: "Enhanced Thunderclap",
    level: 84,
    apply: abilityTrait("Thunderclap", {
      charges: {
        count: 3,
        cooldown: 30
      },
    })
  },
  {
    name: "Howling Fist Mastery",
    level: 74,
    apply: abilityRemovedTrait("Howling Fist", 74)
  }
];

export const MNK: IJobTemplate = {

  translation: {
    de: "M\u00D6N",
    ja: "MNK",
    en: "MNK",
    fr: "MOI",
    cn: "MNK",
  },

  fullNameTranslation: {
    de: "M\u00F6nch",
    ja: "\u30E2\u30F3\u30AF",
    en: "Monk",
    fr: "Moine",
    cn: "武僧",
  },
  role: Role.Melee,
  abilities,
  traits
};


