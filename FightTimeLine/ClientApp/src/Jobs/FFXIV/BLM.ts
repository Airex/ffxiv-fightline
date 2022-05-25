import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, DamageType, JobStatuses, MapStatuses, IJobTemplate, ITrait } from "../../core/Models";
import { getAbilitiesFrom, casterSharedAbilities, medicine, toAbilities } from "./shared";
import { abilityTrait } from "./traits";


const statuses = MapStatuses({
  manaward: {
    duration: 20,
    effects: [Effects.shield.solo(10)]
  },
  leyLines: {
    duration: 30
  },
  trippleCast: {
    duration: 15
  },
  sharpCast: {
    duration: 15
  }
});

const abilities = [
  {
    name: "Transpose",
    translation: {
      de: "Transposition",
      jp: "\u30C8\u30E9\u30F3\u30B9",
      en: "Transpose",
      fr: "Transposition"
    },
    cooldown: 5,
    xivDbId: "149",
    abilityType: AbilityType.Utility,
    levelAcquired: 4
  },
  {
    name: "Manaward",
    translation: {
      de: "Mana-Schild",
      jp: "\u30DE\u30D0\u30EA\u30A2",
      en: "Manaward",
      fr: "Barri\u00E8re de mana"
    },
    cooldown: 120,
    xivDbId: "157",
    abilityType: AbilityType.SelfShield,
    levelAcquired: 30,
    statuses: [statuses.manaward]
  },

  {
    name: "Manafont",
    translation: {
      de: "Mana-Brunnen",
      jp: "\u30DE\u30CA\u30D5\u30A9\u30F3\u30C8",
      en: "Manafont",
      fr: "Vasque de mana"
    },
    cooldown: 180,
    xivDbId: "158",
    abilityType: AbilityType.Utility,
    levelAcquired: 30
  },
  {
    name: "Ley Lines",
    translation: {
      de: "Ley-Linien",
      jp: "\u9ED2\u9B54\u7D0B",
      en: "Ley Lines",
      fr: "Manalignements"
    },
    cooldown: 120,
    xivDbId: "3573",
    statuses: [statuses.leyLines],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 52
  },
  {
    name: "Triplecast",
    translation: {
      de: "Tripelzauber",
      jp: "\u4E09\u9023\u9B54",
      en: "Triplecast",
      fr: "Triple sort"
    },
    cooldown: 60,
    xivDbId: "7421",
    statuses: [statuses.trippleCast],
    abilityType: AbilityType.Utility,
    levelAcquired: 65,
    charges: {
      count: 2,
      cooldown: 60
    }
  },
  {
    name: "Sharpcast",
    translation: {
      de: "Augmentierung ",
      jp: "\u6FC0\u6210\u9B54",
      en: "Sharpcast",
      fr: "Dynamisation"
    },
    cooldown: 120,
    xivDbId: "3574",
    statuses: [statuses.sharpCast],
    abilityType: AbilityType.Utility,
    levelAcquired: 54
  },
  {
    name: "Amplifier",
    translation: {
      de: "Verst\u00E4rker",
      jp: "\u30A2\u30F3\u30D7\u30EA\u30D5\u30A1\u30A4\u30A2",
      en: "Amplifier",
      fr: "Amplificateur"
    },
    cooldown: 120,
    xivDbId: "25796",
    abilityType: AbilityType.Utility,
    levelAcquired: 54,
  },
  ...getAbilitiesFrom(casterSharedAbilities),
  medicine.Intelligence
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Manafont",
    level: 84,
    apply: abilityTrait("Manafont", {
      cooldown: 120
    })
  },
  {
    name: "Enhanced Sharpcast",
    level: 74,
    apply: abilityTrait("Sharpcast", {
      cooldown: 30
    })
  },
  {
    name: "Enhanced Sharpcast II",
    level: 88,
    apply: abilityTrait("Sharpcast", {
      charges: {
        count: 2,
        cooldown: 30
      }
    })
  }
];


export const BLM: IJobTemplate = {

  translation: {
    de: "SMA",
    jp: "BLM",
    en: "BLM",
    fr: "MNO"
  },

  fullNameTranslation: {
    de: "Schwarzmagier",
    jp: "\u9ED2\u9B54\u9053\u58EB",
    en: "Black Mage",
    fr: "Mage Noir"
  },
  role: Role.Caster,
  abilities,
  traits
};
