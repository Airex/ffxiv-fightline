import Effects from "src/core/Defensives/effects";
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
      ja: "\u30C8\u30E9\u30F3\u30B9",
      en: "Transpose",
      fr: "Transposition",
      cn: "星灵移位"
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
      ja: "\u30DE\u30D0\u30EA\u30A2",
      en: "Manaward",
      fr: "Barri\u00E8re de mana",
      cn: "魔罩"
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
      ja: "\u30DE\u30CA\u30D5\u30A9\u30F3\u30C8",
      en: "Manafont",
      fr: "Vasque de mana",
      cn: "魔泉"
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
      ja: "\u9ED2\u9B54\u7D0B",
      en: "Ley Lines",
      fr: "Manalignements",
      cn: "黑魔纹"
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
      ja: "\u4E09\u9023\u9B54",
      en: "Triplecast",
      fr: "Triple sort",
      cn: "三连咏唱"
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
      ja: "\u6FC0\u6210\u9B54",
      en: "Sharpcast",
      fr: "Dynamisation",
      cn: "激情咏唱"
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
      ja: "\u30A2\u30F3\u30D7\u30EA\u30D5\u30A1\u30A4\u30A2",
      en: "Amplifier",
      fr: "Amplificateur",
      cn: "详述"
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
    ja: "BLM",
    en: "BLM",
    fr: "MNO",
    cn: "BLM"
  },

  fullNameTranslation: {
    de: "Schwarzmagier",
    ja: "\u9ED2\u9B54\u9053\u58EB",
    en: "Black Mage",
    fr: "Mage Noir",
    cn: "黑魔法师"
  },
  role: Role.Caster,
  abilities,
  traits
};
